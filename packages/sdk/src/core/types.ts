/**
 * Available domains for routing
 */
export const Domain = {
  /** 중소기업 지원사업 공고 */
  SupportProgram: 'support_program',
  /** 법령 */
  Law: 'law',
} as const;

export type DomainType = typeof Domain[keyof typeof Domain];

/**
 * Configuration options for CubeIAxClient
 */
export interface CubeIAxConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for the API (required) */
  baseUrl: string;
  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number;
  /** Agent identifier (default: router agent) */
  agent?: string;
  /**
   * Enable debug mode for logging SSE events and API requests.
   * Logs to console: requests, responses, SSE events, errors.
   * @default false
   */
  debug?: boolean;
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
  /** Search filters (e.g., apply_end_date, region, deadline_type) */
  filters?: Record<string, unknown>;
  /**
   * Document IDs (group_id) for context.
   * When user asks about specific documents from previous results,
   * pass their group_ids here for fast filtering (uses index instead of LIKE scan).
   * @example ["BIZ-2024-001", "BIZ-2024-002"]
   */
  documentContext?: string[];
  /** Whether to stream the response (default: true) */
  stream?: boolean;
  /** Maximum number of search results (default: 20, sent to backend) */
  topK?: number;
  /** Maximum number of results after reranking (default: same as topK) */
  rerankerTopK?: number;
  /** Maximum response length in characters (e.g., 150 for chat widget) */
  maxResponseLength?: number;
  /** Whether to include citation markers [1], [2] in response (default: true) */
  includeCitations?: boolean;
  /**
   * Field to group results by at Milvus level for deduplication.
   * When specified, returns only one result per group value.
   * Default: "group_id" (one result per document/announcement)
   */
  groupByField?: string;
  /**
   * Domain to use for this request.
   * If specified, skips router domain detection and uses this domain directly.
   * @example Domain.SupportProgram, Domain.Law
   */
  domain?: DomainType;
  /**
   * Maximum tokens for LLM response generation.
   * @default 1024
   * @min 100
   * @max 2048 (server-side limit)
   */
  maxTokens?: number;
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
  /** Context info: document IDs for next request */
  contextDocuments?: string[];
  /** Context info: focus program */
  contextFocus?: { group_id: string; title: string };
}

/**
 * Chat message structure
 *
 * Core fields are always available. Additional fields can be added
 * for app-specific metadata via the index signature.
 *
 * @example
 * ```typescript
 * const message: Message = {
 *   id: 'msg_1',
 *   role: 'user',
 *   content: 'Hello',
 *   timestamp: new Date(),
 *   // Custom fields
 *   customField: 'value',
 * };
 * ```
 */
export interface Message {
  /** Unique message ID */
  id: string;
  /** Message role */
  role: 'user' | 'assistant' | 'system';
  /** Message content */
  content: string;
  /** Source documents (for assistant messages) */
  sources?: Source[];
  /** Message timestamp */
  timestamp: Date;
  /** Additional custom fields */
  [key: string]: unknown;
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
  /** Document ID (group_id from search result) */
  documentId?: string;
  /** VectorStore ID (for document detail lookup) */
  vs_id?: string;
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
  /** Maximum number of results (default: 20) */
  topK?: number;
  /** Maximum number of results after reranking (default: same as topK) */
  rerankerTopK?: number;
  /** User profile for personalized search results */
  profile?: UserProfile;
  /** Additional metadata for filtering */
  metadata?: Record<string, unknown>;
  /** Filter conditions */
  filters?: Record<string, unknown>;
  /**
   * Document IDs (group_id) for context.
   * When user asks about specific documents from previous results,
   * pass their group_ids here for fast filtering.
   * @example ["BIZ-2024-001"]
   */
  documentContext?: string[];
  /** Whether to stream the response (default: true) */
  stream?: boolean;
  /** Domain for routing (e.g., 'support_program', 'law') */
  domain?: DomainType;
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
  /** Context info: document IDs for next request */
  contextDocuments?: string[];
  /** Context info: focus program */
  contextFocus?: { group_id: string; title: string };
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
export type StreamEventType =
  | 'session'        // 세션 ID
  | 'status'         // 상태 메시지 (검색 중, 분석 중 등)
  | 'sources'        // 검색 결과 (sources-first 패턴)
  | 'token'          // 스트리밍 텍스트
  | 'citations'      // 인용 정보
  | 'clarification'  // 명확화 요청
  | 'followup'       // 후속 질문 제안
  | 'analysis'       // 분석 결과
  | 'item_details'   // 항목 상세 (펼치기/접기 UI용)
  | 'context'        // 문맥 정보 (documents, focus)
  | 'search_result'  // 검색 모드 최종 결과
  | 'rewrite'        // 쿼리 재작성
  | 'end'            // 완료
  | 'error';         // 에러         // 에러         // 에러

/**
 * Item detail for collapsible UI rendering
 */
export interface ItemDetail {
  /** Item ID */
  id: string;
  /** Item title */
  title: string;
  /** Brief description (original text snippet) */
  description: string;
  /** Original URL */
  url: string;
}

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
  /** Source documents (for 'sources'/'end' type) */
  sources?: Source[] | string;
  /** Error message (for 'error' type) */
  error?: string;
  /** Status message (for 'status' type) */
  message?: string;
  /** Status stage (for 'status' type) - alternative field name */
  stage?: string;
  /** Status stage (for 'status' type) - backend field name */
  status?: string;
  /** Clarification main question (for 'clarification' type) */
  question?: string;
  /** Clarification questions array (for 'clarification' type - legacy) */
  questions?: string[] | string;
  /** Follow-up suggestions (for 'followup' type) */
  suggestions?: string[] | string;
  /** Citation references (for 'citations' type) */
  citations?: Array<{ index: number; source_id: string; text: string }>;
  /** Rewritten query (for 'rewrite' type) - legacy field name */
  rewritten_query?: string;
  /** Rewritten query (for 'rewrite' type) - current backend field */
  rewritten?: string;
  /** Original query before rewrite (for 'rewrite' type) */
  original?: string;
  /** Rewrite strategy (for 'rewrite' type) */
  strategy?: string;
  /** Query intent (for 'analysis' type) */
  intent?: string;
  /** Confidence score (for 'analysis' type) */
  confidence?: number | string;
  /** Query type (for 'analysis' type) */
  query_type?: string;
  /** Item details for collapsible UI (for 'item_details' type) */
  item_details?: ItemDetail[] | string;
  /** Data wrapper (for 'context' type) */
  data?: {
    documents?: string[] | string;
    focus?: { group_id: string; title: string } | string;
  };
  /** Document IDs for context (for 'context' type, may be in data or top-level) */
  documents?: string[] | string;
  /** Focus program info (for 'context' type, may be in data or top-level) */
  focus?: { group_id: string; title: string } | string;
}

/**
 * Query analysis result from backend
 */
export interface QueryAnalysis {
  /** Detected query intent */
  intent: string;
  /** Confidence score (0.0-1.0) */
  confidence: number;
  /** Query type (e.g., 'factual', 'exploratory') */
  queryType: string;
}

/**
 * Stream callback handlers for chat
 */
export interface StreamCallbacks {
  /** Called when session ID is received */
  onSession?: (sessionId: string) => void;
  /** Called when status message is received (e.g., "검색 중...", "분석 중...") */
  onStatus?: (message: string, stage?: string) => void;
  /** Called when sources are received (before answer completes) - enables sources-first UI pattern */
  onSources?: (sources: Source[]) => void;
  /** Called when a content chunk is received */
  onContent?: (content: string) => void;
  /** Called when citations are received */
  onCitations?: (citations: Array<{ index: number; source_id: string; text: string }>) => void;
  /** Called when clarification is needed */
  onClarification?: (message: string, suggestions: string[]) => void;
  /** Called when follow-up suggestions are received */
  onFollowup?: (suggestions: string[], message?: string) => void;
  /** Called when query is rewritten */
  onRewrite?: (rewrittenQuery: string) => void;
  /** Called when query analysis is received */
  onAnalysis?: (analysis: QueryAnalysis) => void;
  /** Called when item details are received (for collapsible UI) */
  onItemDetails?: (items: ItemDetail[]) => void;
  /** Called when context is updated (documents for next request, focus program) */
  onContext?: (documents: string[], focus?: { group_id: string; title: string }) => void;
  /** Called when the stream is complete */
  onComplete?: (response: ChatResponse) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
  /** Called for each raw SSE event */
  onEvent?: (event: StreamEvent) => void;
  /** Called when SSE event JSON parsing fails (for debugging) */
  onParseError?: (rawData: string, error: Error) => void;
}

/**
 * Stream callback handlers for search
 */
export interface SearchStreamCallbacks {
  /** Called when session ID is received */
  onSession?: (sessionId: string) => void;
  /** Called when status message is received (e.g., "검색 중...", "분석 중...") */
  onStatus?: (message: string, stage?: string) => void;
  /** Called when sources are received (before LLM analysis completes) - enables sources-first UI pattern */
  onSources?: (results: SearchResult[]) => void;
  /** Called when a content chunk is received */
  onContent?: (content: string) => void;
  /** Called when citations are received */
  onCitations?: (citations: Array<{ index: number; source_id: string; text: string }>) => void;
  /** Called when clarification is needed */
  onClarification?: (message: string, suggestions: string[]) => void;
  /** Called when follow-up suggestions are received */
  onFollowup?: (suggestions: string[], message?: string) => void;
  /** Called when query is rewritten */
  onRewrite?: (rewrittenQuery: string) => void;
  /** Called when query analysis is received */
  onAnalysis?: (analysis: QueryAnalysis) => void;
  /** Called when item details are received (for collapsible UI) */
  onItemDetails?: (items: ItemDetail[]) => void;
  /** Called when context is updated (documents for next request, focus program) */
  onContext?: (documents: string[], focus?: { group_id: string; title: string }) => void;
  /** Called when the stream is complete with final response including LLM analysis */
  onComplete?: (response: SearchResponse) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
  /** Called for each raw SSE event */
  onEvent?: (event: StreamEvent) => void;
  /** Called when SSE event JSON parsing fails (for debugging) */
  onParseError?: (rawData: string, error: Error) => void;
}

/**
 * Request parameters for getDocument
 */
export interface GetDocumentRequest {
  /** Document ID (e.g., group_id for bizinfo) */
  documentId: string;
  /** Document domain (e.g., 'bizinfo', 'law', 'faq') */
  domain: string;
  /** VectorStore ID (from search result, for accurate collection lookup) */
  vsId?: string;
  /** AbortSignal for canceling the request */
  signal?: AbortSignal;
}

/**
 * Collapsible section in document detail
 *
 * @example
 * ```typescript
 * // Render as collapsible section
 * section.key    // 'support_content'
 * section.label  // '지원내용'
 * section.value  // '중소기업 디지털 전환 지원...'
 * ```
 */
export interface DocumentSection {
  /** Field key */
  key: string;
  /** Display label (한글) */
  label: string;
  /** Field value (rendered as collapsible content) */
  value: string;
}

/**
 * Raw document detail response from API
 *
 * Contains raw meta fields from Milvus. SDK provides domain-specific
 * helpers to format this data for display.
 *
 * @example
 * ```typescript
 * const doc = await client.getDocument({ documentId: '123', domain: 'bizinfo' });
 * console.log(doc.data.title);
 * console.log(doc.data.overview);
 * ```
 */
export interface DocumentResponse {
  /** Document ID */
  id: string;
  /** Document domain */
  domain: string;
  /** Raw document data from Milvus $meta */
  data: Record<string, unknown>;
}
