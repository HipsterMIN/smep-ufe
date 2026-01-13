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
} from '../core/types';

// Default to chat_app URL - SDK endpoints are at /v1/*
const DEFAULT_BASE_URL = 'https://chat.cube-i-ax.io/v1';
const DEFAULT_TIMEOUT = 60000;

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

  constructor(config: CubeIAxConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.agent = config.agent;
  }

  /**
   * Get default headers for API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
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
          stream: false,
          max_response_length: request.maxResponseLength,
          include_citations: request.includeCitations,
          ...(agent && { agent }),
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
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
        throw new Error(isTimeout() ? 'Request timeout' : 'Request aborted');
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

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message: request.message,
          session_id: request.sessionId,
          profile: request.profile,
          metadata: request.metadata,
          stream: true,
          max_response_length: request.maxResponseLength,
          include_citations: request.includeCitations,
          ...(agent && { agent }),
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Streaming response not supported by server');
      }

      return await this.processSSEStream(response.body, callbacks);
    } catch (error) {
      let err: Error;
      if (error instanceof Error && error.name === 'AbortError') {
        err = new Error(isTimeout() ? 'Request timeout' : 'Request aborted');
      } else {
        err = error instanceof Error ? error : new Error(String(error));
      }
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

            try {
              const event: StreamEvent = JSON.parse(data);
              callbacks.onEvent?.(event);

              switch (event.type) {
                case 'session':
                  sessionId = event.session_id;
                  if (sessionId) callbacks.onSession?.(sessionId);
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
                    sources = typeof event.sources === 'string'
                      ? JSON.parse(event.sources)
                      : event.sources;
                    callbacks.onSources?.(sources);
                  }
                  break;

                case 'end':
                  if (event.full_answer) {
                    fullContent = event.full_answer;
                  }
                  if (event.sources) {
                    sources = typeof event.sources === 'string'
                      ? JSON.parse(event.sources)
                      : event.sources;
                  }
                  break;

                case 'error':
                  throw new Error(event.error || 'Unknown error');

                case 'search_result':
                  // Search results received - end of stream
                  break;
              }
            } catch {
              // Skip non-JSON lines (expected for SSE comments and empty lines)
            }
          }
        }
      }

      const finalResponse: ChatResponse = {
        content: fullContent,
        sessionId,
        sources,
        done: true,
      };

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
   * Normalize documentId field from various backend formats
   */
  private normalizeDocumentId(source: Record<string, unknown>): string | undefined {
    return (source.file_id || source.document_id || source.documentId || source.program_id) as string | undefined;
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
          top_k: request.topK || 10,
          profile: request.profile,
          metadata: request.metadata,
          filters: request.filters,
          stream: false,
          group_by_field: request.groupByField,
          group_results_by: request.groupResultsBy,
          ...(agent && { agent }),
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
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
        throw new Error(isTimeout() ? 'Request timeout' : 'Request aborted');
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

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          query: request.query,
          top_k: request.topK || 10,
          profile: request.profile,
          metadata: request.metadata,
          filters: request.filters,
          stream: true,
          group_by_field: request.groupByField,
          group_results_by: request.groupResultsBy,
          ...(agent && { agent }),
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Streaming response not supported by server');
      }

      return await this.processSearchSSEStream(response.body, request.query, callbacks);
    } catch (error) {
      let err: Error;
      if (error instanceof Error && error.name === 'AbortError') {
        err = new Error(isTimeout() ? 'Request timeout' : 'Request aborted');
      } else {
        err = error instanceof Error ? error : new Error(String(error));
      }
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

            try {
              const event: StreamEvent = JSON.parse(data);
              callbacks.onEvent?.(event);

              switch (event.type) {
                case 'session':
                  sessionId = event.session_id;
                  if (sessionId) callbacks.onSession?.(sessionId);
                  break;

                case 'token':
                  if (event.content) {
                    fullContent += event.content;
                    callbacks.onContent?.(event.content);
                  }
                  break;

                case 'sources': {
                  // Sources event comes before tokens - process early for faster UI
                  if (event.sources) {
                    const sources = typeof event.sources === 'string'
                      ? JSON.parse(event.sources)
                      : event.sources;
                    results = sources.map((s: Record<string, unknown>) => ({
                      ...s,
                      documentId: this.normalizeDocumentId(s),
                    }));
                    callbacks.onSources?.(results);
                  }
                  break;
                }

                case 'end':
                case 'search_result': {
                  // Different backend paths use different field names for LLM output
                  const llmOutput = event.full_answer || event.answer || event.content;
                  if (llmOutput) {
                    fullContent = llmOutput;
                  }
                  if (event.sources) {
                    const sources = typeof event.sources === 'string'
                      ? JSON.parse(event.sources)
                      : event.sources;
                    results = sources.map((s: Record<string, unknown>) => ({
                      ...s,
                      documentId: this.normalizeDocumentId(s),
                    }));
                  }
                  break;
                }

                case 'error':
                  throw new Error(event.error || 'Unknown error');
              }
            } catch {
              // Skip non-JSON lines (expected for SSE comments and empty lines)
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
      };

      callbacks.onComplete?.(finalResponse);
      return finalResponse;
    } finally {
      reader.releaseLock();
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
