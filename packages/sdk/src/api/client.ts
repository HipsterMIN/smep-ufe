import type {
  CubeIAxConfig,
  ChatRequest,
  ChatResponse,
  SearchRequest,
  SearchResponse,
  StreamCallbacks,
  SearchStreamCallbacks,
  StreamEvent,
  Source,
  SearchResult,
  GetDocumentRequest,
  DocumentResponse,
} from '../core/types';

const DEFAULT_TIMEOUT = 60000;

// API defaults (exported for consistency across layers)
export const DEFAULT_TOP_K = 20;
export const DEFAULT_RERANKER_TOP_K = 10;
export const DEFAULT_GROUP_BY_FIELD = 'group_id';

// Token limits for LLM response
export const MIN_TOKENS = 100;
export const MAX_TOKENS = 2048;
export const DEFAULT_TOKENS = 1024;

// HTTP 헤더 상수
const HEADER_API_KEY = 'X-API-Key';
const HEADER_CONTENT_TYPE = 'Content-Type';
const HEADER_ACCEPT = 'Accept';
const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_SSE = 'text/event-stream';

// ============================================
// 커스텀 에러 타입 (에러 분류용)
// ============================================

/** 요청 타임아웃 에러 */
export class TimeoutError extends Error {
  readonly name = 'TimeoutError';
  constructor(message = 'Request timeout') {
    super(message);
  }
}

/** 요청 취소(abort) 에러 */
export class AbortedError extends Error {
  readonly name = 'AbortedError';
  constructor(message = 'Request aborted') {
    super(message);
  }
}

/** API 응답 에러 (4xx, 5xx) */
export class ApiError extends Error {
  readonly name = 'ApiError';
  readonly status: number;
  constructor(status: number, message: string) {
    super(`API error: ${status} - ${message}`);
    this.status = status;
  }
}

/** SSE 스트림 파싱 에러 */
export class StreamParseError extends Error {
  readonly name = 'StreamParseError';
  readonly rawData: string;
  readonly originalError?: Error;
  constructor(rawData: string, cause?: Error) {
    super(`Failed to parse SSE event: ${rawData.substring(0, 100)}...`);
    this.rawData = rawData;
    this.originalError = cause;
  }
}

/**
 * CubeIAx Client for AI Search and Chatbot API
 *
 * @example
 * ```typescript
 * const client = new CubeIAxClient({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://sdk-api.your-domain.com'
 * });
 *
 * // Chat with streaming
 * await client.chat(
 *   { message: '안녕하세요', metadata: { company: 'ABC Corp' } },
 *   {
 *     onSession: (sessionId) => console.log('Session:', sessionId),
 *     onContent: (content) => console.log('Token:', content),
 *     onComplete: (response) => console.log('Done:', response)
 *   }
 * );
 *
 * // Search documents
 * const results = await client.search({ query: '지원 프로그램', topK: 10 });
 * ```
 */
export class CubeIAxClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly agent?: string;
  private readonly debug: boolean;

  constructor(config: CubeIAxConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    if (!config.baseUrl) {
      throw new Error('Base URL is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.agent = config.agent;
    this.debug = config.debug || false;
  }

  /**
   * Debug logging helper - only logs when debug mode is enabled
   */
  private log(category: string, ...args: unknown[]): void {
    if (this.debug) {
      const timestamp = new Date().toISOString().slice(11, 23);
      console.log(`[CubeIAx ${timestamp}] [${category}]`, ...args);
    }
  }

  /**
   * Get default headers for API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      [HEADER_API_KEY]: this.apiKey,
      [HEADER_CONTENT_TYPE]: CONTENT_TYPE_JSON,
    };
  }

  /**
   * Get headers for SSE streaming requests
   */
  private getStreamingHeaders(): Record<string, string> {
    return {
      ...this.getHeaders(),
      [HEADER_ACCEPT]: CONTENT_TYPE_SSE,
    };
  }

  /**
   * Parse a field that may be a JSON string or already parsed object
   */
  private parseJsonField<T>(value: unknown): T | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as T;
      } catch {
        // JSON 파싱 실패 시 조용히 undefined 반환
        // (잘못된 포맷의 문자열 필드는 무시됨)
        return undefined;
      }
    }
    return value as T;
  }

  /**
   * Ensures a value is an array. If it's a JSON-stringified array, parses it.
   * This prevents 422 errors when document_context is accidentally stored as a string.
   */
  private ensureArray(value: unknown): string[] | undefined {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Not valid JSON
      }
    }
    return undefined;
  }

  /**
   * Parse a value that may be in Python repr format or double-encoded JSON.
   * Handles: "\"['a', 'b']\"" or "['a', 'b']" or ["a", "b"] or "{...}"
   */
  private parsePythonRepr<T>(value: unknown): T | undefined {
    // 이미 객체/배열이면 그대로 반환
    if (value !== null && typeof value === 'object') return value as T;

    if (typeof value !== 'string') return undefined;

    // 1단계: 표준 JSON 파싱 시도 (결과가 객체/배열인 경우만 반환)
    try {
      const parsed = JSON.parse(value);
      // 파싱 결과가 객체/배열이면 바로 반환 (문자열이면 계속 진행)
      if (parsed !== null && typeof parsed === 'object') {
        return parsed as T;
      }
    } catch {
      // JSON 파싱 실패 - 계속 진행
    }

    // 2단계: Python repr 형식 처리: "\"['a', 'b']\""
    let cleaned = value;
    // 이중 인코딩된 따옴표 제거: "\"[...]\"" -> "[...]"
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }
    // Python 스타일 싱글쿼트를 JSON 더블쿼트로 변환: ['a'] -> ["a"]
    if (cleaned.includes("'")) {
      cleaned = cleaned.replace(/'/g, '"');
    }
    try {
      const result = JSON.parse(cleaned);
      if (result !== null && typeof result === 'object') {
        return result as T;
      }
    } catch {
      // 파싱 실패 시 무시
    }
    return undefined;
  }

  /**
   * Parse suggestions that may be in Python repr format or double-encoded JSON.
   */
  private parseSuggestions(value: unknown): string[] | undefined {
    const result = this.parsePythonRepr<string[]>(value);
    if (!Array.isArray(result)) return undefined;
    // 깨진 유니코드 문자 제거 (U+FFFD)
    return result.map(s => typeof s === 'string' ? s.replace(/\uFFFD+/g, '').trim() : s);
  }

  /**
   * Send a chat message with streaming response
   *
   * @param request - Chat request parameters
   * @param callbacks - Optional callbacks for streaming events
   * @returns Promise with the complete chat response
   */
  async chat(request: ChatRequest, callbacks?: StreamCallbacks): Promise<ChatResponse> {
    const shouldStream = request.stream !== false;

    if (shouldStream && callbacks) {
      return this.chatStream(request, callbacks);
    }

    return this.chatSync(request);
  }

  /**
   * Create a combined abort signal from timeout and external signal
   */
  private createAbortSignal(externalSignal?: AbortSignal): { signal: AbortSignal; cleanup: () => void; isTimeout: () => boolean } {
    const controller = new AbortController();
    let timedOut = false;

    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.timeout);

    // Listen to external signal if provided
    const onExternalAbort = () => controller.abort();
    if (externalSignal) {
      externalSignal.addEventListener('abort', onExternalAbort);
    }

    return {
      signal: controller.signal,
      isTimeout: () => timedOut,
      cleanup: () => {
        clearTimeout(timeoutId);
        if (externalSignal) {
          externalSignal.removeEventListener('abort', onExternalAbort);
        }
      },
    };
  }

  /**
   * Send a synchronous chat message (non-streaming)
   */
  private async chatSync(request: ChatRequest): Promise<ChatResponse> {
    const { signal, cleanup, isTimeout } = this.createAbortSignal(request.signal);
    const agent = request.agent ?? this.agent;

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          message: request.message,
          session_id: request.sessionId,
          profile: request.profile,
          metadata: request.metadata,
          filters: request.filters,
          document_context: this.ensureArray(request.documentContext),  // group_ids for fast filtering
          stream: false,
          top_k: request.topK ?? DEFAULT_TOP_K,
          reranker_top_k: request.rerankerTopK ?? DEFAULT_RERANKER_TOP_K,
          max_response_length: request.maxResponseLength,
          include_citations: request.includeCitations,
          group_by_field: request.groupByField === undefined ? DEFAULT_GROUP_BY_FIELD : request.groupByField,
          ...(request.domain && { domain: request.domain }),
          max_tokens: request.maxTokens ? Math.min(Math.max(request.maxTokens, MIN_TOKENS), MAX_TOKENS) : DEFAULT_TOKENS,  // Clamp to 100-2048, default 1024
          ...(agent && { agent }),
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, errorText);
      }

      const data = await response.json();
      return {
        content: data.content,
        sessionId: data.session_id,
        sources: data.sources,
        done: true,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw isTimeout() ? new TimeoutError() : new AbortedError();
      }
      throw error;
    } finally {
      cleanup();
    }
  }

  /**
   * Send a chat message with SSE streaming
   */
  private async chatStream(
    request: ChatRequest,
    callbacks: StreamCallbacks
  ): Promise<ChatResponse> {
    const { signal, cleanup, isTimeout } = this.createAbortSignal(request.signal);
    const agent = request.agent ?? this.agent;

    this.log('REQUEST', 'POST /chat (stream)', {
      message: request.message.slice(0, 100) + (request.message.length > 100 ? '...' : ''),
      sessionId: request.sessionId,
      topK: request.topK,
      domain: request.domain,
      documentContext: request.documentContext,
      profile: request.profile,
    });

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: this.getStreamingHeaders(),
        body: JSON.stringify({
          message: request.message,
          session_id: request.sessionId,
          profile: request.profile,
          metadata: request.metadata,
          filters: request.filters,
          document_context: this.ensureArray(request.documentContext),  // group_ids for fast filtering
          stream: true,
          top_k: request.topK ?? DEFAULT_TOP_K,
          reranker_top_k: request.rerankerTopK ?? DEFAULT_RERANKER_TOP_K,
          max_response_length: request.maxResponseLength,
          include_citations: request.includeCitations,
          group_by_field: request.groupByField === undefined ? DEFAULT_GROUP_BY_FIELD : request.groupByField,
          ...(request.domain && { domain: request.domain }),
          max_tokens: request.maxTokens ? Math.min(Math.max(request.maxTokens, MIN_TOKENS), MAX_TOKENS) : DEFAULT_TOKENS,  // Clamp to 100-2048, default 1024
          ...(agent && { agent }),
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, errorText);
      }

      if (!response.body) {
        throw new Error('Streaming response not supported by server');
      }

      // Content-Type 검증 (SSE 응답인지 확인)
      const contentType = response.headers.get(HEADER_CONTENT_TYPE);
      if (contentType && !contentType.includes(CONTENT_TYPE_SSE) && !contentType.includes('text/plain')) {
        throw new Error(`Expected SSE stream but got: ${contentType}`);
      }

      return await this.processSSEStream(response.body, callbacks);
    } catch (error) {
      let err: Error;
      if (error instanceof Error && error.name === 'AbortError') {
        err = isTimeout() ? new TimeoutError() : new AbortedError();
      } else {
        err = error instanceof Error ? error : new Error(String(error));
      }
      this.log('ERROR', 'chat', err.message);
      callbacks.onError?.(err);
      throw err;
    } finally {
      cleanup();
    }
  }

  /**
   * Process SSE stream and invoke callbacks
   */
  private async processSSEStream(
    body: ReadableStream<Uint8Array>,
    callbacks: StreamCallbacks
  ): Promise<ChatResponse> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let sessionId: string | undefined;
    let sources: Source[] = [];
    let contextDocuments: string[] | undefined;
    let contextFocus: { group_id: string; title: string } | undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          // Skip heartbeat comments
          if (line.startsWith(':')) {
            continue;
          }

          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              continue;
            }

            // JSON 파싱 (실패 시 빈 라인/주석으로 간주하고 스킵)
            let event: StreamEvent;
            try {
              event = JSON.parse(data);
            } catch (parseError) {
              // 빈 라인이나 주석은 무시, 실제 데이터 파싱 실패 시 onParseError 콜백 호출
              if (data.length > 0 && !data.startsWith(':')) {
                callbacks.onParseError?.(data, parseError instanceof Error ? parseError : new Error(String(parseError)));
              }
              continue;
            }

            callbacks.onEvent?.(event);
            // Debug: log SSE events (truncate token content)
            this.log('SSE', event.type, event.type === 'token' ? `"${(event.content || '').slice(0, 30)}..."` : event);

            switch (event.type) {
              case 'session':
                // Support both snake_case (session_id) and camelCase (sessionId)
                sessionId = event.session_id || (event as unknown as { sessionId?: string }).sessionId;
                if (sessionId) callbacks.onSession?.(sessionId);
                break;

              case 'status':
                // Backend sends: { status: "searching", content: "검색 중..." }
                callbacks.onStatus?.(event.content || event.message || '', event.status || event.stage);
                break;

              case 'token':
                if (event.content) {
                  fullContent += event.content;
                  callbacks.onContent?.(event.content);
                }
                break;

              case 'sources':
                // Sources arrive before answer - enable sources-first UI pattern
                if (event.sources) {
                  const parsedSources = this.parseJsonField<Record<string, unknown>[]>(event.sources) || [];
                  // normalizeDocumentId로 group_id 추출하여 documentId에 저장
                  sources = parsedSources.map((s) => ({
                    ...s,
                    documentId: this.normalizeDocumentId(s),
                  })) as Source[];
                  // Only notify if sources exist (prevents UI flicker on empty results)
                  if (sources.length > 0) {
                    callbacks.onSources?.(sources);
                  }
                }
                break;

              case 'citations':
                if (event.citations) {
                  callbacks.onCitations?.(event.citations);
                }
                break;

              case 'clarification': {
                // Backend sends: { question: "main question", suggestions: ["opt1", "opt2"] }
                const clarificationMessage = event.question || '';
                const clarificationSuggestions: string[] = [];
                // console.log('[CubeIAxClient] clarification raw:', { question: event.question, suggestions: event.suggestions });
                const suggestions = this.parseSuggestions(event.suggestions);
                // console.log('[CubeIAxClient] clarification parsed suggestions:', suggestions);
                if (suggestions) clarificationSuggestions.push(...suggestions);
                // Fallback: legacy format with questions array
                const questions = this.parseSuggestions(event.questions);
                if (questions) clarificationSuggestions.push(...questions);
                // console.log('[CubeIAxClient] clarification final:', { message: clarificationMessage, suggestions: clarificationSuggestions });
                if (clarificationMessage || clarificationSuggestions.length > 0) {
                  callbacks.onClarification?.(clarificationMessage, clarificationSuggestions);
                }
                break;
              }

              case 'followup': {
                const followupSuggestions = this.parseSuggestions(event.suggestions);
                const followupMessage = event.message as string | undefined;
                if (followupSuggestions && followupSuggestions.length > 0) {
                  callbacks.onFollowup?.(followupSuggestions, followupMessage);
                }
                break;
              }

              case 'rewrite':
                // Backend sends 'rewritten' field (not 'rewritten_query')
                if (event.rewritten) {
                  callbacks.onRewrite?.(event.rewritten);
                }
                break;

              case 'analysis':
                // Query analysis event with intent, confidence, query_type
                if (event.intent) {
                  callbacks.onAnalysis?.({
                    intent: event.intent,
                    confidence: typeof event.confidence === 'string'
                      ? parseFloat(event.confidence)
                      : (event.confidence ?? 0),
                    queryType: event.query_type || 'unknown',
                  });
                }
                break;

              case 'item_details': {
                const itemDetails = this.parsePythonRepr<Array<{ id: string; title: string; description: string; url: string }>>(event.item_details);
                if (itemDetails && Array.isArray(itemDetails)) {
                  callbacks.onItemDetails?.(itemDetails);
                }
                break;
              }

              case 'context': {
                // Context event with documents and focus
                // May be in event.data or directly on event
                const ctxData = event.data || event;
                const docs = this.parseJsonField<string[]>(ctxData.documents);
                const focus = this.parseJsonField<{ group_id: string; title: string }>(ctxData.focus);
                if (docs && docs.length > 0) {
                  contextDocuments = docs;
                }
                if (focus) {
                  contextFocus = focus;
                }
                if (contextDocuments && contextDocuments.length > 0) {
                  callbacks.onContext?.(contextDocuments, contextFocus);
                }
                break;
              }

              case 'end':
                {
                  const endContent =
                    event.full_answer || event.answer || event.content || event.message;
                  if (endContent) {
                    fullContent = endContent;
                  }
                }
                if (event.sources) {
                  sources = this.parseJsonField<Source[]>(event.sources) || sources;
                }
                break;

              case 'error':
                throw new Error(event.error || 'Unknown error');

              case 'search_result':
                // Search results received - end of stream
                break;
            }
          }
        }
      }

      const finalResponse: ChatResponse = {
        content: fullContent,
        sessionId,
        sources,
        done: true,
        contextDocuments,
        contextFocus,
      };

      this.log('COMPLETE', 'chat', { contentLength: fullContent.length, sourcesCount: sources.length, hasContext: !!contextDocuments });
      callbacks.onComplete?.(finalResponse);
      return finalResponse;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Search documents with optional streaming
   *
   * @param request - Search request parameters
   * @param callbacks - Optional callbacks for streaming events (only used when stream=true)
   * @returns Promise with search results
   */
  async search(request: SearchRequest, callbacks?: SearchStreamCallbacks): Promise<SearchResponse> {
    const shouldStream = request.stream === true;

    if (shouldStream && callbacks) {
      return this.searchStream(request, callbacks);
    }

    return this.searchSync(request);
  }

  /**
   * 문서 ID 정규화 (우선순위에 따라 추출)
   *
   * 우선순위:
   * 1. group_id - 공고 단위 식별자 (SMES 도메인)
   * 2. program_id - 프로그램 ID (SMES 도메인)
   * 3. file_id - 파일 ID (일반 도메인)
   * 4. document_id - 스네이크케이스 (레거시)
   * 5. documentId - 카멜케이스 (레거시)
   */
  private normalizeDocumentId(source: Record<string, unknown>): string | undefined {
    const candidates = [
      source.group_id,
      source.program_id,
      source.file_id,
      source.document_id,
      source.documentId,
    ];

    for (const id of candidates) {
      if (id && typeof id === 'string') return id;
    }
    return undefined;
  }

  /**
   * Search documents synchronously (non-streaming)
   */
  private async searchSync(request: SearchRequest): Promise<SearchResponse> {
    const { signal, cleanup, isTimeout } = this.createAbortSignal(request.signal);
    const agent = request.agent ?? this.agent;

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query: request.query,
          top_k: request.topK ?? DEFAULT_TOP_K,
          reranker_top_k: request.rerankerTopK ?? DEFAULT_RERANKER_TOP_K,
          profile: request.profile,
          metadata: request.metadata,
          filters: request.filters,
          document_context: this.ensureArray(request.documentContext),  // group_ids for fast filtering
          stream: false,
          group_by_field: request.groupByField ?? DEFAULT_GROUP_BY_FIELD,
          group_results_by: request.groupResultsBy,
          ...(request.domain && { domain: request.domain }),
          ...(agent && { agent }),
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, errorText);
      }

      const data = await response.json();

      // Normalize results - fields are at top-level (slim format)
      if (data.results && Array.isArray(data.results)) {
        data.results = data.results.map((s: Record<string, unknown>) => ({
          ...s,
          documentId: this.normalizeDocumentId(s),
        }));
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw isTimeout() ? new TimeoutError() : new AbortedError();
      }
      throw error;
    } finally {
      cleanup();
    }
  }

  /**
   * Search documents with SSE streaming
   */
  private async searchStream(
    request: SearchRequest,
    callbacks: SearchStreamCallbacks
  ): Promise<SearchResponse> {
    const { signal, cleanup, isTimeout } = this.createAbortSignal(request.signal);
    const agent = request.agent ?? this.agent;

    this.log('REQUEST', 'POST /search (stream)', {
      query: request.query.slice(0, 100) + (request.query.length > 100 ? '...' : ''),
      topK: request.topK,
      domain: request.domain,
    });

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: this.getStreamingHeaders(),
        body: JSON.stringify({
          query: request.query,
          top_k: request.topK ?? DEFAULT_TOP_K,
          reranker_top_k: request.rerankerTopK ?? DEFAULT_RERANKER_TOP_K,
          profile: request.profile,
          metadata: request.metadata,
          filters: request.filters,
          document_context: this.ensureArray(request.documentContext),  // group_ids for fast filtering
          stream: true,
          group_by_field: request.groupByField ?? DEFAULT_GROUP_BY_FIELD,
          group_results_by: request.groupResultsBy,
          ...(request.domain && { domain: request.domain }),
          ...(agent && { agent }),
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, errorText);
      }

      if (!response.body) {
        throw new Error('Streaming response not supported by server');
      }

      // Content-Type 검증 (SSE 응답인지 확인)
      const contentType = response.headers.get(HEADER_CONTENT_TYPE);
      if (contentType && !contentType.includes(CONTENT_TYPE_SSE) && !contentType.includes('text/plain')) {
        throw new Error(`Expected SSE stream but got: ${contentType}`);
      }

      return await this.processSearchSSEStream(response.body, request.query, callbacks);
    } catch (error) {
      let err: Error;
      if (error instanceof Error && error.name === 'AbortError') {
        err = isTimeout() ? new TimeoutError() : new AbortedError();
      } else {
        err = error instanceof Error ? error : new Error(String(error));
      }
      this.log('ERROR', 'search', err.message);
      callbacks.onError?.(err);
      throw err;
    } finally {
      cleanup();
    }
  }

  /**
   * Process SSE stream for search and invoke callbacks
   */
  private async processSearchSSEStream(
    body: ReadableStream<Uint8Array>,
    query: string,
    callbacks: SearchStreamCallbacks
  ): Promise<SearchResponse> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let sessionId: string | undefined;
    let results: SearchResult[] = [];
    let contextDocuments: string[] | undefined;
    let contextFocus: { group_id: string; title: string } | undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          // Skip heartbeat comments
          if (line.startsWith(':')) {
            continue;
          }

          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              continue;
            }

            // JSON 파싱 (실패 시 빈 라인/주석으로 간주하고 스킵)
            let event: StreamEvent;
            try {
              event = JSON.parse(data);
            } catch (parseError) {
              // 빈 라인이나 주석은 무시, 실제 데이터 파싱 실패 시 onParseError 콜백 호출
              if (data.length > 0 && !data.startsWith(':')) {
                callbacks.onParseError?.(data, parseError instanceof Error ? parseError : new Error(String(parseError)));
              }
              continue;
            }

            callbacks.onEvent?.(event);
            // Debug: log SSE events (truncate token content)
            this.log('SSE', event.type, event.type === 'token' ? `"${(event.content || '').slice(0, 30)}..."` : event);

            switch (event.type) {
              case 'session':
                // Support both snake_case (session_id) and camelCase (sessionId)
                sessionId = event.session_id || (event as unknown as { sessionId?: string }).sessionId;
                if (sessionId) callbacks.onSession?.(sessionId);
                break;

              case 'context': {
                // Context event with documents and focus
                // May be in event.data or directly on event
                const ctxData = event.data || event;
                const docs = this.parseJsonField<string[]>(ctxData.documents);
                const focus = this.parseJsonField<{ group_id: string; title: string }>(ctxData.focus);
                if (docs && docs.length > 0) {
                  contextDocuments = docs;
                }
                if (focus) {
                  contextFocus = focus;
                }
                if (contextDocuments && contextDocuments.length > 0) {
                  callbacks.onContext?.(contextDocuments, contextFocus);
                }
                break;
              }

              case 'token':
                if (event.content) {
                  fullContent += event.content;
                  callbacks.onContent?.(event.content);
                }
                break;

              case 'sources': {
                // Sources event comes before tokens - process early for faster UI
                const parsedSources = this.parseJsonField<Record<string, unknown>[]>(event.sources);
                if (parsedSources) {
                  results = parsedSources.map((s) => ({
                    ...s,
                    documentId: this.normalizeDocumentId(s),
                  }));
                  // Only notify if results exist (prevents UI flicker on empty results)
                  if (results.length > 0) {
                    callbacks.onSources?.(results);
                  }
                }
                // Also check for session_id in sources event (some backends include it here)
                const sourcesSessionId = event.session_id || (event as unknown as { sessionId?: string }).sessionId;
                if (sourcesSessionId && !sessionId) {
                  sessionId = sourcesSessionId;
                  callbacks.onSession?.(sessionId);
                }
                break;
              }

              // === Chat과 동일한 이벤트 핸들러 (Search에서도 지원) ===
              case 'status':
                callbacks.onStatus?.(event.content || event.message || '', event.status || event.stage);
                break;

              case 'clarification': {
                const clarifyMsg = event.question || '';
                const clarifySuggestions: string[] = [];
                const clarifyS = this.parseSuggestions(event.suggestions);
                if (clarifyS) clarifySuggestions.push(...clarifyS);
                const clarifyQ = this.parseSuggestions(event.questions);
                if (clarifyQ) clarifySuggestions.push(...clarifyQ);
                if (clarifyMsg || clarifySuggestions.length > 0) {
                  callbacks.onClarification?.(clarifyMsg, clarifySuggestions);
                }
                break;
              }

              case 'followup': {
                const followupS = this.parseSuggestions(event.suggestions);
                const followupMsg = event.message as string | undefined;
                if (followupS && followupS.length > 0) {
                  callbacks.onFollowup?.(followupS, followupMsg);
                }
                break;
              }

              case 'rewrite':
                if (event.rewritten) {
                  callbacks.onRewrite?.(event.rewritten);
                }
                break;

              case 'analysis':
                if (event.intent) {
                  callbacks.onAnalysis?.({
                    intent: event.intent,
                    confidence: typeof event.confidence === 'string'
                      ? parseFloat(event.confidence)
                      : (event.confidence ?? 0),
                    queryType: event.query_type || 'unknown',
                  });
                }
                break;

              case 'item_details': {
                const searchItemDetails = this.parsePythonRepr<Array<{ id: string; title: string; description: string; url: string }>>(event.item_details);
                if (searchItemDetails && Array.isArray(searchItemDetails)) {
                  callbacks.onItemDetails?.(searchItemDetails);
                }
                break;
              }

              case 'citations':
                if (event.citations) {
                  callbacks.onCitations?.(event.citations);
                }
                break;

              case 'end':
              case 'search_result': {
                // Different backend paths use different field names for LLM output
                const llmOutput = event.full_answer || event.answer || event.content;
                if (llmOutput) {
                  fullContent = llmOutput;
                }
                const endSources = this.parseJsonField<Record<string, unknown>[]>(event.sources);
                if (endSources) {
                  results = endSources.map((s) => ({
                    ...s,
                    documentId: this.normalizeDocumentId(s),
                  }));
                }
                // Also extract session_id from end event (some backends send it here)
                // Support both snake_case and camelCase
                const endSessionId = event.session_id || (event as unknown as { sessionId?: string }).sessionId;
                if (endSessionId && !sessionId) {
                  sessionId = endSessionId;
                  callbacks.onSession?.(sessionId);
                }
                break;
              }

              case 'error':
                throw new Error(event.error || 'Unknown error');
            }
          }
        }
      }

      // Parse LLM analysis JSON to extract meaningful summary
      let summary: string | undefined;
      let analysisResults: Array<{ doc_index: number; match_reason: string; relevance_score: number }> = [];

      if (fullContent) {
        let trimmedContent = fullContent.trim();

        // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
        const codeFenceMatch = trimmedContent.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
        if (codeFenceMatch) {
          trimmedContent = codeFenceMatch[1].trim();
        }

        // Check if content looks like JSON
        if (trimmedContent.startsWith('{')) {
          try {
            const analysis = JSON.parse(trimmedContent);

            // Extract summary from query_analysis
            if (analysis.query_analysis?.intent) {
              summary = analysis.query_analysis.intent;
              if (analysis.query_analysis.suggestions) {
                summary += ` ${analysis.query_analysis.suggestions}`;
              }
            }

            // Extract match reasons from results
            if (analysis.results && Array.isArray(analysis.results)) {
              analysisResults = analysis.results;
              // Enhance results with match reasons from LLM analysis
              results = results.map((result, idx) => {
                const analysisItem = analysisResults.find(a => a.doc_index === idx + 1);
                if (analysisItem) {
                  return {
                    ...result,
                    matchReason: analysisItem.match_reason,
                    relevanceScore: analysisItem.relevance_score,
                  };
                }
                return result;
              });
            }

            // If no summary extracted from JSON, don't return raw JSON
            // summary remains undefined, and content will be undefined
          } catch {
            // JSON parsing failed - don't return raw JSON to clients
          }
        } else {
          // Not JSON - use as natural language summary
          summary = trimmedContent;
        }
      }

      const finalResponse: SearchResponse = {
        results,
        total: results.length,
        query,
        content: summary,
        contextDocuments,
        contextFocus,
      };

      this.log('COMPLETE', 'search', { resultsCount: results.length, hasSummary: !!summary, hasContext: !!contextDocuments });
      callbacks.onComplete?.(finalResponse);
      return finalResponse;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get full document details by ID and domain
   *
   * Returns structured document data including collapsible sections
   * configured via MetaFieldSchema.display_in settings.
   *
   * @param request - Document request parameters
   * @returns Promise with document details including sections and metadata
   *
   * @example
   * ```typescript
   * const doc = await client.getDocument({
   *   documentId: 'BIZ-2024-001',
   *   domain: 'bizinfo'
   * });
   *
   * console.log(doc.title);
   * doc.sections.forEach(section => {
   *   console.log(`${section.label}: ${section.value}`);
   * });
   * ```
   */
  async getDocument(request: GetDocumentRequest): Promise<DocumentResponse> {
    const { signal, cleanup, isTimeout } = this.createAbortSignal(request.signal);

    try {
      const url = new URL(`${this.baseUrl}/documents/${encodeURIComponent(request.documentId)}`);
      url.searchParams.set('domain', request.domain);
      if (request.vsId) {
        url.searchParams.set('vs_id', request.vsId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, errorText);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw isTimeout() ? new TimeoutError() : new AbortedError();
      }
      throw error;
    } finally {
      cleanup();
    }
  }

  /**
   * Create an AbortController for canceling requests
   *
   * @example
   * ```typescript
   * const controller = client.createAbortController();
   * client.chat({ message: 'Hello', signal: controller.signal }, callbacks);
   * // Later, to cancel:
   * controller.abort();
   * ```
   */
  createAbortController(): AbortController {
    return new AbortController();
  }
}

export default CubeIAxClient;
