import { useState, useCallback, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { CubeIAxClient } from '../../api/client';
import { useCubeIAxContextOptional } from '../provider';
import type {
  CubeIAxConfig,
  ChatRequest,
  ChatResponse,
  StreamEvent,
  Source,
  UserProfile,
} from '../../core/types';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

export interface UseCubeIAxChatOptions {
  /** Initial session ID */
  sessionId?: string;
  /** User profile for personalized recommendations */
  profile?: UserProfile;
  /** Default metadata to send with every message */
  defaultMetadata?: Record<string, unknown>;
  /** Maximum response length in characters (e.g., 150 for compact chat widget) */
  maxResponseLength?: number;
  /** Whether to include citation markers [1], [2] in response (default: true) */
  includeCitations?: boolean;
  /** Callback when session is established */
  onSession?: (sessionId: string) => void;
  /** Callback when sources are received (before answer completes) */
  onSources?: (sources: Source[]) => void;
  /** Callback when streaming content is received */
  onContent?: (content: string) => void;
  /** Callback when stream is complete */
  onComplete?: (response: ChatResponse) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Callback for raw SSE events */
  onEvent?: (event: StreamEvent) => void;
}

export interface UseCubeIAxChatReturn {
  /** All messages in the conversation */
  messages: Message[];
  /** Whether a message is being sent/received */
  isLoading: boolean;
  /** Current error if any */
  error: Error | null;
  /** Current streaming content (partial response) */
  streamingContent: string;
  /** Sources received before answer completes (for sources-first UI) */
  pendingSources: Source[];
  /** Current session ID */
  sessionId: string | undefined;
  /** Send a message */
  sendMessage: (message: string, metadata?: Record<string, unknown>) => Promise<void>;
  /** Clear all messages */
  clearMessages: () => void;
  /** Abort the current request */
  abort: () => void;
}

/**
 * React hook for Cube-I-AX chat functionality with SSE streaming
 *
 * Supports two usage patterns:
 *
 * 1. With explicit config:
 * ```tsx
 * const { messages, sendMessage } = useCubeIAxChat(
 *   { apiKey: 'your-api-key', baseUrl: 'https://api.example.com' },
 *   { defaultMetadata: { company: 'ABC Corp' } }
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
 * const { messages, sendMessage } = useCubeIAxChat({
 *   defaultMetadata: { company: 'ABC Corp' }
 * });
 * ```
 */
export function useCubeIAxChat(
  configOrOptions?: CubeIAxConfig | UseCubeIAxChatOptions,
  optionsParam?: UseCubeIAxChatOptions
): UseCubeIAxChatReturn {
  // Support both signatures:
  // 1. useCubeIAxChat(config, options) - explicit config
  // 2. useCubeIAxChat(options) - use Provider context
  const contextValue = useCubeIAxContextOptional();

  let config: CubeIAxConfig;
  let options: UseCubeIAxChatOptions;

  if (configOrOptions && 'apiKey' in configOrOptions) {
    // Explicit config passed
    config = configOrOptions;
    options = optionsParam || {};
  } else {
    // Use Provider context
    if (!contextValue) {
      throw new Error(
        'useCubeIAxChat: Either pass config as first argument or wrap your app with CubeIAxProvider'
      );
    }
    config = contextValue.config;
    options = (configOrOptions as UseCubeIAxChatOptions) || {};
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [pendingSources, setPendingSources] = useState<Source[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(options.sessionId);

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

  // Generate unique message ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Send a message
  const sendMessage = useCallback(
    async (message: string, metadata?: Record<string, unknown>) => {
      if (!message.trim()) return;

      const client = getClient();
      setError(null);
      setStreamingContent('');
      setPendingSources([]);
      setIsLoading(true);

      // Add user message
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Create assistant message placeholder
      const assistantMessageId = generateId();

      try {
        abortControllerRef.current = new AbortController();

        // Merge default metadata with message-specific metadata
        const mergedMetadata = {
          ...options.defaultMetadata,
          ...metadata,
        };

        const request: ChatRequest = {
          message,
          sessionId,
          stream: true,
          profile: options.profile,
          metadata: Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined,
          maxResponseLength: options.maxResponseLength,
          includeCitations: options.includeCitations,
          signal: abortControllerRef.current.signal,
        };

        let fullContent = '';

        let earlySources: Source[] = [];

        await client.chat(request, {
          onSession: (newSessionId) => {
            setSessionId(newSessionId);
            options.onSession?.(newSessionId);
          },
          onSources: (sources) => {
            // Sources arrive before answer - update pending sources for UI
            earlySources = sources;
            flushSync(() => {
              setPendingSources(sources);
            });
            options.onSources?.(sources);
          },
          onContent: (content) => {
            fullContent += content;
            // Force synchronous render for real-time streaming UI
            flushSync(() => {
              setStreamingContent(fullContent);
            });
            options.onContent?.(content);
          },
          onComplete: (res) => {
            // Update session ID if provided
            if (res.sessionId) {
              setSessionId(res.sessionId);
            }

            // Add final assistant message (use early sources if available)
            const assistantMessage: Message = {
              id: assistantMessageId,
              role: 'assistant',
              content: res.content || fullContent,
              sources: res.sources || earlySources,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingContent('');
            setPendingSources([]);
            options.onComplete?.(res);
          },
          onError: (err) => {
            setError(err);
            options.onError?.(err);
          },
          onEvent: options.onEvent,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [getClient, sessionId, options]
  );

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    setPendingSources([]);
    setError(null);
    setSessionId(undefined);
  }, []);

  // Abort current request
  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setStreamingContent('');
    setPendingSources([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    streamingContent,
    pendingSources,
    sessionId,
    sendMessage,
    clearMessages,
    abort,
  };
}

export default useCubeIAxChat;
