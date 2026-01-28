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
  ItemDetail,
  QueryAnalysis,
  DomainType,
  Message,
} from '../../core/types';

// Re-export Message from core for backward compatibility
export type { Message } from '../../core/types';

/** Status event data */
export interface StatusEvent {
  /** Status message (e.g., "검색 중...", "분석 중...") */
  message: string;
  /** Status stage (e.g., "searching", "analyzing") */
  stage?: string;
}

/**
 * Persistence options for saving chat state to storage
 */
export interface ChatPersistenceOptions {
  /**
   * Storage key (used as-is, no prefix added)
   * @example 'my-app-chat' → localStorage key: 'my-app-chat'
   */
  key: string;
  /**
   * Storage type
   * @default 'localStorage'
   */
  storage?: 'localStorage' | 'sessionStorage';
  /**
   * Whether to persist session ID
   * @default true
   */
  persistSession?: boolean;
  /**
   * Whether to persist messages
   * @default true
   */
  persistMessages?: boolean;
}

/** Persisted chat state structure */
interface PersistedChatState {
  sessionId?: string;
  messages?: Message[];
  timestamp: number;
}

export interface UseCubeIAxChatOptions {
  /** Initial session ID */
  sessionId?: string;
  /** Initial messages to restore conversation history */
  initialMessages?: Message[];
  /** User profile for personalized recommendations */
  profile?: UserProfile;
  /** Default metadata to send with every message */
  defaultMetadata?: Record<string, unknown>;
  /** Default filters to apply to every search (e.g., apply_end_date, region) */
  defaultFilters?: Record<string, unknown>;
  /** Domain for routing (e.g., 'support_program', 'law') */
  domain?: DomainType;
  /** Maximum number of search results (default: 20) */
  topK?: number;
  /** Maximum number of results after reranking (default: same as topK) */
  rerankerTopK?: number;
  /** Maximum response length in characters (e.g., 150 for compact chat widget) */
  maxResponseLength?: number;
  /** Maximum tokens for LLM response (default: 1024, range: 100-2048) */
  maxTokens?: number;
  /** Whether to include citation markers [1], [2] in response (default: true) */
  includeCitations?: boolean;
  /** Field to group results by at Milvus level (default: "group_id") */
  groupByField?: string;
  /** Whether to use streaming (default: true) */
  stream?: boolean;
  /** Callback when session is established */
  onSession?: (sessionId: string) => void;
  /** Callback when status message is received (e.g., "검색 중...", "분석 중...") */
  onStatus?: (message: string, stage?: string) => void;
  /** Callback when sources are received (before answer completes) */
  onSources?: (sources: Source[]) => void;
  /** Callback when streaming content is received */
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
  /** Callback when stream is complete */
  onComplete?: (response: ChatResponse) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Callback for raw SSE events */
  onEvent?: (event: StreamEvent) => void;
  /** Callback when SSE event JSON parsing fails (for debugging) */
  onParseError?: (rawData: string, error: Error) => void;
  /**
   * Enable persistence to localStorage/sessionStorage.
   * When enabled, sessionId and messages are automatically saved and restored.
   *
   * @example
   * ```tsx
   * // Basic usage - persist to localStorage with custom key
   * useCubeIAxChat({ persist: { key: 'my-chat-session' } });
   *
   * // With all options
   * useCubeIAxChat({
   *   persist: {
   *     key: 'consultant-chat',
   *     storage: 'sessionStorage',
   *     persistSession: true,
   *     persistMessages: true,
   *   }
   * });
   * ```
   */
  persist?: ChatPersistenceOptions;
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
  /** Current status (e.g., "검색 중...", "분석 중...") */
  status: StatusEvent | null;
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
  /**
   * Set document context manually.
   * - When user clicks a specific document: pass that document's group_id
   * - When returning to search results: pass all result group_ids
   * - When starting new topic: pass null to clear context
   * @example
   * // User clicks a specific document
   * setDocumentContext(['BIZ-2024-001']);
   *
   * // Clear context for new topic
   * setDocumentContext(null);
   */
  setDocumentContext: (documents: string[] | null) => void;
  /** Send a message */
  sendMessage: (message: string, options?: {
    metadata?: Record<string, unknown>;
    filters?: Record<string, unknown>;
    /**
     * Document IDs (group_id) for context-based responses.
     * When user asks about specific documents, pass their IDs here.
     * @example ["BIZ-2024-001", "BIZ-2024-002"]
     */
    documentContext?: string[];
  }) => Promise<void>;
  /**
   * Clear all messages
   * @param options.keepSession - If true, keeps the session (default: false = resets session too)
   */
  clearMessages: (options?: { keepSession?: boolean }) => void;
  /** Start a new chat (alias for clearMessages(), resets both messages and session) */
  startNewChat: () => void;
  /** Abort the current request */
  abort: () => void;
  /**
   * Clear persisted storage (only available when persist option is enabled)
   * Removes both sessionId and messages from storage
   */
  clearStorage: () => void;
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

  // ============================================
  // Persistence helpers
  // ============================================
  const persistConfig = options.persist;
  const storageType = persistConfig?.storage ?? 'localStorage';
  const persistSession = persistConfig?.persistSession ?? true;
  const persistMessages = persistConfig?.persistMessages ?? true;

  const getStorage = useCallback((): Storage | null => {
    if (typeof window === 'undefined') return null;
    if (!persistConfig?.key) return null;
    try {
      return storageType === 'sessionStorage' ? window.sessionStorage : window.localStorage;
    } catch {
      return null;
    }
  }, [persistConfig?.key, storageType]);

  const loadPersistedState = useCallback((): PersistedChatState | null => {
    const storage = getStorage();
    if (!storage || !persistConfig?.key) return null;
    try {
      const data = storage.getItem(persistConfig.key);
      if (!data) return null;
      const parsed = JSON.parse(data) as PersistedChatState;
      // Restore Date objects for message timestamps
      if (parsed.messages) {
        parsed.messages = parsed.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));
      }
      return parsed;
    } catch {
      return null;
    }
  }, [getStorage, persistConfig?.key]);

  const savePersistedState = useCallback((state: Partial<PersistedChatState>) => {
    const storage = getStorage();
    if (!storage || !persistConfig?.key) return;
    try {
      const existing = loadPersistedState() || { timestamp: Date.now() };
      const updated: PersistedChatState = {
        ...existing,
        ...state,
        timestamp: Date.now(),
      };
      storage.setItem(persistConfig.key, JSON.stringify(updated));
    } catch {
      // Ignore storage errors (quota exceeded, etc.)
    }
  }, [getStorage, persistConfig?.key, loadPersistedState]);

  const clearPersistedState = useCallback(() => {
    const storage = getStorage();
    if (!storage || !persistConfig?.key) return;
    try {
      storage.removeItem(persistConfig.key);
    } catch {
      // Ignore errors
    }
  }, [getStorage, persistConfig?.key]);

  // Load initial state from persistence (only on mount)
  const persistedState = useRef<PersistedChatState | null>(null);
  if (persistConfig?.key && persistedState.current === null) {
    persistedState.current = loadPersistedState() || { timestamp: 0 };
  }

  // Determine initial values (props > persisted > defaults)
  const initialSessionId = options.sessionId ??
    ((persistSession && persistedState.current?.sessionId) || undefined);
  const initialMessages = options.initialMessages ??
    ((persistMessages && persistedState.current?.messages) || []);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [pendingSources, setPendingSources] = useState<Source[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [status, setStatus] = useState<StatusEvent | null>(null);
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
  // sessionId를 ref로 관리하여 sendMessage 의존성에서 제외 (불필요한 함수 재생성 방지)
  const sessionIdRef = useRef<string | undefined>(initialSessionId);
  // earlySources를 ref로 관리하여 onComplete에서 stale 값 참조 방지
  const earlySourcesRef = useRef<Source[]>([]);
  // contextDocuments를 ref로 관리하여 sendMessage에서 최신 값 참조
  const contextDocumentsRef = useRef<string[] | null>(null);
  // config를 ref로 관리하여 getClient 의존성 안정화
  const configRef = useRef<CubeIAxConfig>(config);
  // 초기 마운트 완료 플래그 (persistence 저장 시 초기 로드와 구분)
  const isMountedRef = useRef(false);

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

  // sessionIdRef 동기화 + persistence 저장
  useEffect(() => {
    sessionIdRef.current = sessionId;
    // 초기 마운트 후에만 저장 (초기 로드 값 재저장 방지)
    if (isMountedRef.current && persistSession && persistConfig?.key) {
      savePersistedState({ sessionId });
    }
  }, [sessionId, persistSession, persistConfig?.key, savePersistedState]);

  // messages persistence 저장
  useEffect(() => {
    // 초기 마운트 후에만 저장 (초기 로드 값 재저장 방지)
    if (isMountedRef.current && persistMessages && persistConfig?.key) {
      savePersistedState({ messages });
    }
  }, [messages, persistMessages, persistConfig?.key, savePersistedState]);

  // 마운트 완료 표시
  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  // contextDocumentsRef 동기화 (sendMessage에서 최신 값 참조용)
  useEffect(() => {
    contextDocumentsRef.current = contextDocuments;
  }, [contextDocuments]);

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

  // Generate unique message ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Reset streaming-related state (extracted to avoid duplication)
  const resetStreamingState = useCallback(() => {
    setStreamingContent('');
    setPendingSources([]);
    setStatus(null);
    setClarificationMessage('');
    setClarificationQuestions([]);
    setFollowupSuggestions([]);
    setRewrittenQuery(null);
    setQueryAnalysis(null);
    setItemDetails([]);
    setError(null);
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (message: string, sendOptions?: { metadata?: Record<string, unknown>; filters?: Record<string, unknown>; documentContext?: string[] }) => {
      if (!message.trim()) return;

      // 로딩 상태를 먼저 설정 (UI 응답성 향상)
      setIsLoading(true);

      let client: CubeIAxClient;
      try {
        client = getClient();
      } catch (err) {
        setIsLoading(false);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        return;
      }

      // 이전 요청이 있으면 abort (race condition 방지)
      // 순서 중요: 먼저 플래그 설정 → abort → 새 요청용 플래그 리셋
      abortedRef.current = true; // 이전 콜백 차단
      abortControllerRef.current?.abort();
      abortedRef.current = false; // 새 요청 시작 시 플래그 리셋
      resetStreamingState();

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
          ...sendOptions?.metadata,
        };

        // Merge default filters with message-specific filters
        const mergedFilters = {
          ...options.defaultFilters,
          ...sendOptions?.filters,
        };

        const request: ChatRequest = {
          message,
          sessionId: sessionIdRef.current,
          stream: true,
          profile: options.profile,
          metadata: Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined,
          filters: Object.keys(mergedFilters).length > 0 ? mergedFilters : undefined,
          // ★ Document context 우선순위: 명시적 전달 > 자동 추적된 컨텍스트
          // SDK가 검색 결과를 자동으로 컨텍스트로 유지하여 후속 질문에서 활용
          documentContext: sendOptions?.documentContext ?? contextDocumentsRef.current ?? undefined,
          domain: options.domain,
          topK: options.topK,
          rerankerTopK: options.rerankerTopK,
          maxResponseLength: options.maxResponseLength,
          maxTokens: options.maxTokens,
          includeCitations: options.includeCitations,
          groupByField: options.groupByField,
          signal: abortControllerRef.current.signal,
        };

        let fullContent = '';

        // ref 초기화 (새 요청 시작)
        earlySourcesRef.current = [];

        await client.chat(request, {
          onSession: (newSessionId) => {
            if (abortedRef.current) return;
            setSessionId(newSessionId);
            options.onSession?.(newSessionId);
          },
          onStatus: (statusMessage, stage) => {
            if (abortedRef.current) return;
            flushSync(() => {
              setStatus({ message: statusMessage, stage });
            });
            options.onStatus?.(statusMessage, stage);
          },
          onSources: (sources) => {
            if (abortedRef.current) return;
            // Sources arrive before answer - update pending sources for UI
            earlySourcesRef.current = sources;
            flushSync(() => {
              setPendingSources(sources);
            });
            // ★ 검색 결과를 컨텍스트로 자동 설정
            // sources의 group_id를 추출하여 다음 요청의 documentContext로 사용
            const groupIds = sources
              .map(s => s.group_id || s.documentId)
              .filter((id): id is string => !!id);
            if (groupIds.length > 0) {
              setContextDocuments(groupIds);
            }
            options.onSources?.(sources);
          },
          onContent: (content) => {
            if (abortedRef.current) return;
            fullContent += content;
            // Force synchronous render for real-time streaming UI
            flushSync(() => {
              setStreamingContent(fullContent);
            });
            options.onContent?.(content);
          },
          onClarification: (message, suggestions) => {
            if (abortedRef.current) return;
            setClarificationMessage(message || '');
            // Ensure suggestions is always an array
            const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
            setClarificationQuestions(safeSuggestions);
            options.onClarification?.(message, safeSuggestions);
          },
          onFollowup: (suggestions, message) => {
            if (abortedRef.current) return;
            // Ensure suggestions is always an array
            const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
            setFollowupSuggestions(safeSuggestions);
            // followup에 message가 있으면 채팅 응답으로 표시
            if (message) {
              fullContent = message;
              flushSync(() => {
                setStreamingContent(message);
              });
            }
            options.onFollowup?.(safeSuggestions, message);
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
            // Ensure items is always an array (defensive against malformed backend response)
            const safeItems = Array.isArray(items) ? items : [];
            setItemDetails(safeItems);
            options.onItemDetails?.(safeItems);
          },
          onContext: (documents, focus) => {
            if (abortedRef.current) return;
            setContextDocuments(documents);
            if (focus) setContextFocus(focus);
            options.onContext?.(documents, focus);
          },
          onComplete: (res) => {
            if (abortedRef.current) return;
            // Update session ID if provided
            if (res.sessionId) {
              setSessionId(res.sessionId);
            }

            // Add final assistant message (use early sources if available)
            // 중요: res.sources가 빈 배열[]이면 truthy라서 fallback이 안됨
            // 따라서 length 체크 필요
            const assistantMessage: Message = {
              id: assistantMessageId,
              role: 'assistant',
              content: res.content || fullContent,
              sources: res.sources?.length ? res.sources : earlySourcesRef.current,
              timestamp: new Date(),
            };

            // 모든 상태를 flushSync로 동기 업데이트 (깜빡임 방지)
            flushSync(() => {
              setMessages((prev) => [...prev, assistantMessage]);
              setStreamingContent('');
              setPendingSources([]);
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
              setPendingSources([]);
              setStatus(null);
              setIsLoading(false);
            });
            options.onError?.(err);
          },
          onCitations: options.onCitations,
          onEvent: options.onEvent,
          onParseError: options.onParseError,
        });
      } catch (err) {
        // abort된 요청의 에러는 무시
        if (abortedRef.current) return;
        const error = err instanceof Error ? err : new Error(String(err));
        flushSync(() => {
          setError(error);
          setStreamingContent('');
          setPendingSources([]);
          setStatus(null);
          setIsLoading(false);
        });
        options.onError?.(error);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [getClient, options, resetStreamingState]
  );

  // Clear all messages
  const clearMessages = useCallback((clearOptions?: { keepSession?: boolean }) => {
    setMessages([]);
    resetStreamingState();
    if (!clearOptions?.keepSession) {
      setSessionId(undefined);
      // 세션 초기화 시 storage도 함께 정리
      clearPersistedState();
    } else if (persistMessages && persistConfig?.key) {
      // keepSession이지만 메시지는 지우므로 메시지만 storage에서 제거
      savePersistedState({ messages: [] });
    }
  }, [resetStreamingState, clearPersistedState, persistMessages, persistConfig?.key, savePersistedState]);

  // Start a new chat (alias for clearMessages)
  const startNewChat = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  // Abort current request
  const abort = useCallback(() => {
    abortedRef.current = true;
    abortControllerRef.current?.abort();
    // 모든 스트리밍 관련 상태 초기화 (flushSync로 동기 업데이트)
    flushSync(() => {
      setIsLoading(false);
      setStreamingContent('');
      setPendingSources([]);
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

  return {
    messages,
    isLoading,
    error,
    streamingContent,
    pendingSources,
    sessionId,
    status,
    clarificationMessage,
    clarificationQuestions,
    followupSuggestions,
    rewrittenQuery,
    queryAnalysis,
    itemDetails,
    contextDocuments,
    contextFocus,
    setDocumentContext: setContextDocuments,
    sendMessage,
    clearMessages,
    startNewChat,
    abort,
    clearStorage: clearPersistedState,
  };
}

export default useCubeIAxChat;
