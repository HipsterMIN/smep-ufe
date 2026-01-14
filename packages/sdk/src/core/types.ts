/**
 * Configuration options for CubeIAxClient
 */
export interface CubeIAxConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for the API (default: https://chat.cube-i-ax.io/v1) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number;
  /** Agent identifier (default: router agent) */
  agent?: string;
}

/**
 * User profile for personalized search and recommendations.
 *
 * Profile fields are dynamically configured per tenant via ProfileFieldDefinition.
 * Pass the fields that match your tenant's profile configuration.
 *
 * @example
 * ```typescript
 * // Example profile (actual fields depend on tenant configuration)
 * const profile: UserProfile = {
 *   region: '서울',
 *   industry: '제조업',
 *   employee_count: 50,
 *   is_venture: true,
 *   interests: ['AI', '데이터분석']
 * };
 * ```
 */
export type UserProfile = Record<string, unknown>;

/**
 * Chat request parameters
 */
export interface ChatRequest {
  /** User message to send */
  message: string;
  /** Session ID for conversation context (auto-generated if not provided) */
  sessionId?: string;
  /** User profile for personalized recommendations */
  profile?: UserProfile;
  /** Additional metadata (company info, user info, etc.) */
  metadata?: Record<string, unknown>;
  /** Whether to stream the response (default: true) */
  stream?: boolean;
  /** Maximum response length in characters (e.g., 150 for chat widget) */
  maxResponseLength?: number;
  /** Whether to include citation markers [1], [2] in response (default: true) */
  includeCitations?: boolean;
  /** AbortSignal for canceling the request */
  signal?: AbortSignal;
  /** Agent identifier (overrides provider-level agent) */
  agent?: string;
}

/**
 * Chat response from the API
 */
export interface ChatResponse {
  /** Response message content */
  content: string;
  /** Session ID for conversation continuity */
  sessionId?: string;
  /** Whether the response is complete */
  done: boolean;
  /** Source documents (for RAG responses) */
  sources?: Source[];
}

/**
 * Source document information
 *
 * Core fields (documentId, title, content, score) are always available.
 * Additional fields depend on your document schema and are accessible via index signature.
 *
 * @example
 * ```typescript
 * // Access custom fields
 * const agency = source.agency as string;
 * const region = source['region'] as string;
 * ```
 */
export interface Source {
  /** Document ID */
  documentId?: string;
  /** Document title */
  title?: string;
  /** Document content or snippet */
  content?: string;
  /** Relevance score (0.0-1.0) */
  score?: number;
  /** Domain/collection identifier (e.g., 'bizinfo', 'law', 'faq') */
  domain?: string;
  /** Nested metadata (for backwards compatibility) */
  metadata?: Record<string, unknown>;
  /** Additional fields from document metadata */
  [key: string]: unknown;
}

/**
 * Helper to safely get field from source (supports both top-level and nested metadata)
 *
 * @example
 * ```typescript
 * const agency = getSourceField<string>(source, 'agency');
 * const tags = getSourceField<string[]>(source, 'hashtags');
 * ```
 */
export function getSourceField<T = string>(
  source: Source,
  key: string
): T | undefined {
  const value = (source as Record<string, unknown>)[key];
  if (value !== undefined) return value as T;

  // Fallback to nested metadata for backwards compatibility
  const metadata = source.metadata;
  return metadata?.[key] as T | undefined;
}

/**
 * Search request parameters
 */
export interface SearchRequest {
  /** Search query */
  query: string;
  /** Maximum number of results (default: 10) */
  topK?: number;
  /** User profile for personalized search results */
  profile?: UserProfile;
  /** Additional metadata for filtering */
  metadata?: Record<string, unknown>;
  /** Filter conditions */
  filters?: Record<string, unknown>;
  /** Whether to stream the response (default: false) */
  stream?: boolean;
  /**
   * Field to group results by at Milvus level (e.g., "file_id").
   * When specified, Milvus returns only one result per group value,
   * enabling file-level deduplication for search mode.
   * Default: "file_id" for search API (set by backend)
   */
  groupByField?: string | null;
  /**
   * Field to group results by at application level (e.g., "group_id").
   * Results are grouped by this field after Milvus search.
   * Default: "group_id" for search API (set by backend)
   */
  groupResultsBy?: string | null;
  /** AbortSignal for canceling the request */
  signal?: AbortSignal;
  /** Agent identifier (overrides provider-level agent) */
  agent?: string;
}

/**
 * Search response from the API
 */
export interface SearchResponse {
  /** Search results */
  results: SearchResult[];
  /** Total number of results */
  total: number;
  /** Query that was executed */
  query: string;
  /** AI-generated summary content (if applicable) */
  content?: string;
}

/**
 * Individual search result
 *
 * Core fields are always available. Additional fields depend on your document schema.
 * LLM analysis fields (matchReason, relevanceScore) are populated when streaming search is used.
 *
 * @example
 * ```typescript
 * // Access custom fields
 * const agency = result.agency as string;
 * const applyUrl = result['apply_url'] as string;
 * ```
 */
export interface SearchResult {
  /** Document ID */
  documentId?: string;
  /** Document title */
  title?: string;
  /** Document content or snippet */
  content?: string;
  /** Relevance score from vector search (0.0-1.0) */
  score?: number;
  /** LLM-generated match reason explaining why this result is relevant */
  matchReason?: string;
  /** LLM-assigned relevance score (0.0-1.0) */
  relevanceScore?: number;
  /** Additional fields from document metadata */
  [key: string]: unknown;
}

/**
 * SSE stream event types
 */
export type StreamEventType = 'session' | 'token' | 'sources' | 'end' | 'error' | 'search_result';

/**
 * SSE stream event
 */
export interface StreamEvent {
  /** Event type */
  type: StreamEventType;
  /** Session ID (for 'session' type) */
  session_id?: string;
  /** Content chunk (for 'token' type) */
  content?: string;
  /** Full answer (for 'end' type - standard) */
  full_answer?: string;
  /** Answer (for 'end'/'search_result' type - RAG agent) */
  answer?: string;
  /** Source documents (for 'end' type) */
  sources?: Source[] | string;
  /** Error message (for 'error' type) */
  error?: string;
}

/**
 * Stream callback handlers for chat
 */
export interface StreamCallbacks {
  /** Called when session ID is received */
  onSession?: (sessionId: string) => void;
  /** Called when sources are received (before answer completes) - enables sources-first UI pattern */
  onSources?: (sources: Source[]) => void;
  /** Called when a content chunk is received */
  onContent?: (content: string) => void;
  /** Called when the stream is complete */
  onComplete?: (response: ChatResponse) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
  /** Called for each raw SSE event */
  onEvent?: (event: StreamEvent) => void;
}

/**
 * Stream callback handlers for search
 */
export interface SearchStreamCallbacks {
  /** Called when session ID is received */
  onSession?: (sessionId: string) => void;
  /** Called when sources are received (before LLM analysis completes) - enables sources-first UI pattern */
  onSources?: (results: SearchResult[]) => void;
  /** Called when a content chunk is received */
  onContent?: (content: string) => void;
  /** Called when the stream is complete with final response including LLM analysis */
  onComplete?: (response: SearchResponse) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
  /** Called for each raw SSE event */
  onEvent?: (event: StreamEvent) => void;
}
