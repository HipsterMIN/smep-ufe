import { useState, useCallback, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { CubeIAxClient } from '../../api/client';
import { useCubeIAxContextOptional } from '../provider';
import type {
  CubeIAxConfig,
  SearchRequest,
  SearchResponse,
  SearchResult,
  StreamEvent,
  UserProfile,
} from '../../core/types';

export interface UseCubeIAxSearchOptions {
  /** Default topK value */
  topK?: number;
  /** User profile for personalized search results */
  profile?: UserProfile;
  /** Default metadata to send with every search */
  defaultMetadata?: Record<string, unknown>;
  /** Whether to use streaming (default: false) */
  stream?: boolean;
  /** Agent identifier (overrides provider-level agent) */
  agent?: string;
  /**
   * Field to group results by at Milvus level (e.g., "file_id").
   * When specified, returns only one result per group value.
   * Useful for file-level deduplication in search mode.
   */
  groupByField?: string | null;
  /**
   * Field to group results by at application level (e.g., "group_id").
   * Results are grouped by this field after Milvus search.
   */
  groupResultsBy?: string | null;
  /** Callback when session is established (streaming only) */
  onSession?: (sessionId: string) => void;
  /** Callback when sources are received early (streaming only) - enables sources-first UI pattern */
  onSources?: (results: SearchResult[]) => void;
  /** Callback when search completes with final response including LLM analysis */
  onComplete?: (response: SearchResponse) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Callback when content chunk is received (streaming only) */
  onContent?: (content: string) => void;
  /** Callback for each SSE event (streaming only) */
  onEvent?: (event: StreamEvent) => void;
}

export interface UseCubeIAxSearchReturn {
  /** Search results */
  results: SearchResult[];
  /** Whether search is in progress */
  isLoading: boolean;
  /** Current error if any */
  error: Error | null;
  /** Total number of results */
  total: number;
  /** AI-generated content/summary */
  content: string | undefined;
  /** Streaming content (updates during streaming) */
  streamingContent: string;
  /** The last search query executed */
  lastQuery: string | null;
  /** Execute a search */
  search: (query: string, options?: Partial<SearchRequest>) => Promise<SearchResponse | null>;
  /** Clear search results */
  clearResults: () => void;
  /** Abort the current search request */
  abort: () => void;
}

/**
 * React hook for Cube-I-AX search functionality with optional streaming
 *
 * Supports two usage patterns:
 *
 * 1. With explicit config:
 * ```tsx
 * const { results, search } = useCubeIAxSearch(
 *   { apiKey: 'your-api-key', baseUrl: 'https://api.example.com' },
 *   { topK: 10 }
 * );
 * ```
 *
 * 2. With CubeIAxProvider (recommended):
 * ```tsx
 * // Wrap app with provider
 * <CubeIAxProvider apiKey="your-api-key" baseUrl="https://api.example.com">
 *   <App />
 * </CubeIAxProvider>
 *
 * // Then in components:
 * const { results, search } = useCubeIAxSearch({ topK: 10 });
 * ```
 */
export function useCubeIAxSearch(
  configOrOptions?: CubeIAxConfig | UseCubeIAxSearchOptions,
  optionsParam?: UseCubeIAxSearchOptions
): UseCubeIAxSearchReturn {
  // Support both signatures:
  // 1. useCubeIAxSearch(config, options) - explicit config
  // 2. useCubeIAxSearch(options) - use Provider context
  const contextValue = useCubeIAxContextOptional();

  let config: CubeIAxConfig;
  let options: UseCubeIAxSearchOptions;

  if (configOrOptions && 'apiKey' in configOrOptions) {
    // Explicit config passed
    config = configOrOptions;
    options = optionsParam || {};
  } else {
    // Use Provider context
    if (!contextValue) {
      throw new Error(
        'useCubeIAxSearch: Either pass config as first argument or wrap your app with CubeIAxProvider'
      );
    }
    config = contextValue.config;
    options = (configOrOptions as UseCubeIAxSearchOptions) || {};
  }

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [content, setContent] = useState<string | undefined>(undefined);
  const [streamingContent, setStreamingContent] = useState('');
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const clientRef = useRef<CubeIAxClient | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup: abort any in-flight request when component unmounts
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Get or create client instance (use Provider's client if available)
  const getClient = useCallback(() => {
    if (contextValue?.client) {
      return contextValue.client;
    }
    if (!clientRef.current) {
      clientRef.current = new CubeIAxClient(config);
    }
    return clientRef.current;
  }, [config, contextValue]);

  // Execute search
  const search = useCallback(
    async (query: string, searchOptions?: Partial<SearchRequest>): Promise<SearchResponse | null> => {
      // Allow empty query if filters are provided (filter-only search)
      const hasFilters = searchOptions?.filters && Object.keys(searchOptions.filters).length > 0;
      if (!query.trim() && !hasFilters) return null;

      const client = getClient();

      // Abort any in-flight request before starting a new one
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setError(null);
      setIsLoading(true);
      setStreamingContent('');
      setLastQuery(query);

      // Create abort controller for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // Merge default metadata with search-specific metadata
        const mergedMetadata = {
          ...options.defaultMetadata,
          ...searchOptions?.metadata,
        };

        const shouldStream = searchOptions?.stream ?? options.stream ?? false;

        const request: SearchRequest = {
          query,
          topK: searchOptions?.topK ?? options.topK ?? 10,
          profile: searchOptions?.profile ?? options.profile,
          metadata: Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined,
          filters: searchOptions?.filters,
          stream: shouldStream,
          agent: searchOptions?.agent ?? options.agent,
          groupByField: searchOptions?.groupByField ?? options.groupByField,
          groupResultsBy: searchOptions?.groupResultsBy ?? options.groupResultsBy,
          signal: controller.signal,
        };

        let fullContent = '';

        const response = await client.search(request, shouldStream ? {
          onSession: (sessionId) => {
            options.onSession?.(sessionId);
          },
          onSources: (sourceResults) => {
            // Sources arrive early - update UI immediately
            // Use flushSync to force synchronous render (bypass React 18 automatic batching)
            flushSync(() => {
              setResults(sourceResults);
              setTotal(sourceResults.length);
            });
            options.onSources?.(sourceResults);
          },
          onContent: (chunk) => {
            fullContent += chunk;
            setStreamingContent(fullContent);
            options.onContent?.(chunk);
          },
          onComplete: (res) => {
            // Final response with LLM analysis
            setResults(res.results);
            setTotal(res.total);
            setContent(res.content);
            options.onComplete?.(res);
          },
          onError: (err) => {
            // Only set error if this is still the active request
            if (!controller.signal.aborted) {
              setError(err);
              options.onError?.(err);
            }
          },
          onEvent: (event) => {
            options.onEvent?.(event);
          },
        } : undefined);

        // For non-streaming, set results here
        if (!shouldStream && !controller.signal.aborted) {
          setResults(response.results);
          setTotal(response.total);
          setContent(response.content);
          options.onComplete?.(response);
        }

        return response;
      } catch (err) {
        // Only handle error if this request wasn't aborted
        if (!controller.signal.aborted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          options.onError?.(error);
        }
        return null;
      } finally {
        // Only clear loading state if this is still the current request
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
          setStreamingContent('');
          abortControllerRef.current = null;
        }
      }
    },
    [getClient, options]
  );

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setTotal(0);
    setContent(undefined);
    setStreamingContent('');
  }, []);

  // Abort current search request
  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setStreamingContent('');
  }, []);

  return {
    results,
    isLoading,
    error,
    total,
    content,
    streamingContent,
    lastQuery,
    search,
    clearResults,
    abort,
  };
}

export default useCubeIAxSearch;
