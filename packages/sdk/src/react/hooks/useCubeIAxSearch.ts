import { useState, useCallback, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { CubeIAxClient, DEFAULT_TOP_K } from '../../api/client';
import { useCubeIAxContextOptional } from '../provider';
import type {
  CubeIAxConfig,
  SearchRequest,
  SearchResponse,
  SearchResult,
  StreamEvent,
  UserProfile,
  QueryAnalysis,
  ItemDetail,
  DomainType,
} from '../../core/types';
import type { StatusEvent } from './useCubeIAxChat';

export interface UseCubeIAxSearchOptions {
  /** Default topK value (default: 20) */
  topK?: number;
  /** User profile for personalized search results */
  profile?: UserProfile;
  /** Default metadata to send with every search */
  defaultMetadata?: Record<string, unknown>;
  /** Default filters to apply to every search (e.g., region, deadline_type) */
  defaultFilters?: Record<string, unknown>;
  /** Whether to use streaming (default: true) */
  stream?: boolean;
  /** Domain for routing (e.g., 'support_program', 'law') */
  domain?: DomainType;
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
  /** Callback when status message is received (e.g., "검색 중...", "분석 중...") */
  onStatus?: (message: string, stage?: string) => void;
  /** Callback when content chunk is received (streaming only) */
  onContent?: (content: string) => void;
  /** Callback when citations are received */
  onCitations?: (citations: Array<{ index: number; source_id: string; text: string }>) => void;
  /** Callback when clarification questions are received */
  onClarification?: (message: string, suggestions: string[]) => void;
  /** Callback when follow-up suggestions are received */
  onFollowup?: (suggestions: string[], message?: string) => void;
  /** Callback when query is rewritten */
  onRewrite?: (rewrittenQuery: string) => void;
  /** Callback when query analysis is received */
  onAnalysis?: (analysis: QueryAnalysis) => void;
  /** Callback when item details are received (for collapsible UI) */
  onItemDetails?: (items: ItemDetail[]) => void;
  /** Callback when context is updated (documents for next request, focus program) */
  onContext?: (documents: string[], focus?: { group_id: string; title: string }) => void;
  /** Callback for each SSE event (streaming only) */
  onEvent?: (event: StreamEvent) => void;
  /** Callback when SSE event JSON parsing fails (for debugging) */
  onParseError?: (rawData: string, error: Error) => void;
}

/**
 * Cached search state for navigation restoration
 */
export interface SearchCacheState {
  results: SearchResult[];
  total: number;
  content: string | undefined;
  sessionId: string | null;
  query: string;
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
  /** Current status (e.g., "검색 중...", "분석 중...") */
  status: StatusEvent | null;
  /** Session ID for continuing conversation in chat */
  sessionId: string | null;
  /** Clarification message if any */
  clarificationMessage: string;
  /** Clarification suggestions if any */
  clarificationQuestions: string[];
  /** Follow-up suggestions if any */
  followupSuggestions: string[];
  /** Rewritten query if any */
  rewrittenQuery: string | null;
  /** Query analysis if any */
  queryAnalysis: QueryAnalysis | null;
  /** Item details for collapsible UI */
  itemDetails: ItemDetail[];
  /** Context: document IDs for next request */
  contextDocuments: string[] | null;
  /** Context: focus program info */
  contextFocus: { group_id: string; title: string } | null;
  /** Execute a search */
  search: (query: string, options?: Partial<SearchRequest>) => Promise<SearchResponse | null>;
  /** Clear search results */
  clearResults: () => void;
  /** Abort the current search request */
  abort: () => void;
  /** Restore state from cached data (for navigation back) */
  restore: (state: SearchCacheState) => void;
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
  const [status, setStatus] = useState<StatusEvent | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clarificationMessage, setClarificationMessage] = useState<string>('');
  const [clarificationQuestions, setClarificationQuestions] = useState<string[]>([]);
  const [followupSuggestions, setFollowupSuggestions] = useState<string[]>([]);
  const [rewrittenQuery, setRewrittenQuery] = useState<string | null>(null);
  const [queryAnalysis, setQueryAnalysis] = useState<QueryAnalysis | null>(null);
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);
  const [contextDocuments, setContextDocuments] = useState<string[] | null>(null);
  const [contextFocus, setContextFocus] = useState<{ group_id: string; title: string } | null>(null);

  const clientRef = useRef<CubeIAxClient | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // abort 후 콜백 방지용 플래그 (AbortController.signal 외에 추가 보호)
  const abortedRef = useRef(false);
  // config를 ref로 관리하여 getClient 의존성 안정화
  const configRef = useRef<CubeIAxConfig>(config);

  // configRef 동기화 (config 값 변경 시 client 재생성)
  useEffect(() => {
    const prevConfig = configRef.current;
    if (
        prevConfig.apiKey !== config.apiKey ||
        prevConfig.baseUrl !== config.baseUrl ||
        prevConfig.timeout !== config.timeout ||
        prevConfig.agent !== config.agent ||
        prevConfig.debug !== config.debug
    ) {
      configRef.current = config;
      clientRef.current = null; // config 변경 시 client 재생성 트리거
    }
  }, [config.apiKey, config.baseUrl, config.timeout, config.agent, config.debug]);

  // Cleanup: abort any in-flight request when component unmounts
  useEffect(() => {
    return () => {
      abortedRef.current = true;
      abortControllerRef.current?.abort();
    };
  }, []);

  // Get or create client instance (use Provider's client if available)
  const getClient = useCallback(() => {
    // Provider 사용 시 Provider의 client 반환
    if (contextValue?.client) {
      return contextValue.client;
    }
    // 직접 config 사용 시 clientRef 사용
    if (!clientRef.current) {
      clientRef.current = new CubeIAxClient(configRef.current);
    }
    return clientRef.current;
  }, [contextValue?.client]); // contextValue.client만 의존 (config는 ref로 관리)

  // Reset streaming-related state (extracted to avoid duplication)
  const resetStreamingState = useCallback(() => {
    setStreamingContent('');
    setStatus(null);
    setClarificationMessage('');
    setClarificationQuestions([]);
    setFollowupSuggestions([]);
    setRewrittenQuery(null);
    setQueryAnalysis(null);
    setItemDetails([]);
    setError(null);
  }, []);

  // Execute search
  const search = useCallback(
      async (query: string, searchOptions?: Partial<SearchRequest>): Promise<SearchResponse | null> => {
        // Allow empty query if filters are provided (filter-only search)
        const hasFilters = searchOptions?.filters && Object.keys(searchOptions.filters).length > 0;
        if (!query.trim() && !hasFilters) return null;

        const client = getClient();
        // 이전 요청이 있으면 abort (race condition 방지)
        // 순서 중요: 먼저 플래그 설정 → abort → 새 요청용 플래그 리셋
        abortedRef.current = true; // 이전 콜백 차단
        abortControllerRef.current?.abort();
        abortedRef.current = false; // 새 요청 시작 시 플래그 리셋
        resetStreamingState();
        setIsLoading(true);

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        try {
          // Merge default metadata with search-specific metadata
          const mergedMetadata = {
            ...options.defaultMetadata,
            ...searchOptions?.metadata,
          };

          // Merge default filters with search-specific filters
          const mergedFilters = {
            ...options.defaultFilters,
            ...searchOptions?.filters,
          };

          const shouldStream = searchOptions?.stream ?? options.stream ?? true;

          const request: SearchRequest = {
            query,
            topK: searchOptions?.topK ?? options.topK ?? DEFAULT_TOP_K,
            profile: searchOptions?.profile ?? options.profile,
            metadata: Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined,
            filters: Object.keys(mergedFilters).length > 0 ? mergedFilters : undefined,
            stream: shouldStream,
            domain: options.domain,
            agent: searchOptions?.agent ?? options.agent,
            groupByField: searchOptions?.groupByField ?? options.groupByField,
            groupResultsBy: searchOptions?.groupResultsBy ?? options.groupResultsBy,
            signal: abortControllerRef.current?.signal,
          };

          let fullContent = '';

          const response = await client.search(request, shouldStream ? {
            onSession: (sid) => {
              if (abortedRef.current) return;
              setSessionId(sid);
              options.onSession?.(sid);
            },
            onStatus: (statusMessage, stage) => {
              if (abortedRef.current) return;
              flushSync(() => {
                setStatus({ message: statusMessage, stage });
              });
              options.onStatus?.(statusMessage, stage);
            },
            onSources: (sourceResults) => {
              if (abortedRef.current) return;
              // Sources arrive early - update UI immediately
              // Use flushSync to force synchronous render (bypass React 18 automatic batching)
              flushSync(() => {
                setResults(sourceResults);
                setTotal(sourceResults.length);
              });
              options.onSources?.(sourceResults);
            },
            onContent: (chunk) => {
              if (abortedRef.current) return;
              fullContent += chunk;
              // Force synchronous render for real-time streaming UI
              flushSync(() => {
                setStreamingContent(fullContent);
              });
              options.onContent?.(chunk);
            },
            onCitations: (citations) => {
              if (abortedRef.current) return;
              options.onCitations?.(citations);
            },
            onClarification: (message, suggestions) => {
              if (abortedRef.current) return;
              setClarificationMessage(message);
              setClarificationQuestions(suggestions);
              options.onClarification?.(message, suggestions);
            },
            onFollowup: (suggestions, message) => {
              if (abortedRef.current) return;
              setFollowupSuggestions(suggestions);
              options.onFollowup?.(suggestions, message);
            },
            onRewrite: (query) => {
              if (abortedRef.current) return;
              setRewrittenQuery(query);
              options.onRewrite?.(query);
            },
            onAnalysis: (analysis) => {
              if (abortedRef.current) return;
              setQueryAnalysis(analysis);
              options.onAnalysis?.(analysis);
            },
            onItemDetails: (items) => {
              if (abortedRef.current) return;
              setItemDetails(items);
              options.onItemDetails?.(items);
            },
            onContext: (documents, focus) => {
              if (abortedRef.current) return;
              setContextDocuments(documents);
              if (focus) setContextFocus(focus);
              options.onContext?.(documents, focus);
            },
            onComplete: (res) => {
              if (abortedRef.current) return;
              // Final response with LLM analysis
              flushSync(() => {
                setResults(res.results);
                setTotal(res.total);
                setContent(res.content);
                setStreamingContent('');
                setStatus(null);
                setIsLoading(false);
              });
              options.onComplete?.(res);
            },
            onError: (err) => {
              if (abortedRef.current) return;
              // 에러 발생 시 모든 스트리밍 상태 정리
              flushSync(() => {
                setError(err);
                setStreamingContent('');
                setStatus(null);
                setIsLoading(false);
              });
              options.onError?.(err);
            },
            onEvent: (event) => {
              options.onEvent?.(event);
            },
            onParseError: options.onParseError,
          } : undefined);

          // For non-streaming, set results here
          if (!shouldStream) {
            setResults(response.results);
            setTotal(response.total);
            setContent(response.content);
            options.onComplete?.(response);
          }

          return response;
        } catch (err) {
          // abort된 요청의 에러는 무시
          if (abortedRef.current) return null;
          const error = err instanceof Error ? err : new Error(String(err));
          flushSync(() => {
            setError(error);
            setStreamingContent('');
            setStatus(null);
            setIsLoading(false);
          });
          options.onError?.(error);
          return null;
        } finally {
          abortControllerRef.current = null;
        }
      },
      [getClient, options, resetStreamingState]
  );

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setTotal(0);
    setContent(undefined);
    resetStreamingState();
  }, [resetStreamingState]);

  // Abort current search request
  const abort = useCallback(() => {
    abortedRef.current = true;
    abortControllerRef.current?.abort();
    // 모든 스트리밍 관련 상태 초기화 (flushSync로 동기 업데이트)
    flushSync(() => {
      setIsLoading(false);
      setStreamingContent('');
      setStatus(null);
      setClarificationMessage('');
      setClarificationQuestions([]);
      setFollowupSuggestions([]);
      setRewrittenQuery(null);
      setQueryAnalysis(null);
      setItemDetails([]);
      setError(null);
    });
  }, []);

  // Restore state from cache (for navigation back)
  const restore = useCallback((state: SearchCacheState) => {
    setResults(state.results);
    setTotal(state.total);
    setContent(state.content);
    setSessionId(state.sessionId);
    // Reset streaming state
    setStreamingContent('');
    setStatus(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    total,
    content,
    streamingContent,
    status,
    sessionId,
    clarificationMessage,
    clarificationQuestions,
    followupSuggestions,
    rewrittenQuery,
    queryAnalysis,
    itemDetails,
    contextDocuments,
    contextFocus,
    search,
    clearResults,
    abort,
    restore,
  };
}

export default useCubeIAxSearch;
