import { useMemo, useCallback, useRef, useEffect } from 'react';
import type { Source } from '../../core/types';

/**
 * Streaming message state that can be used in UI
 */
export interface StreamingMessageState {
  /** Whether a query is pending (waiting for response) */
  isPending: boolean;
  /** The pending query text (derived from last unanswered user message) */
  pendingQuery: string | null;
  /** Whether status is being displayed (before tokens start) */
  showStatus: boolean;
  /** Whether streaming content is being displayed */
  showStreaming: boolean;
  /** Whether loading spinner should be shown (no status, no streaming) */
  showLoadingSpinner: boolean;
  /** Content to display (streaming content) */
  displayContent: string | null;
  /** Sources to display (pending sources during streaming) */
  displaySources: Source[];
}

export interface UseStreamingMessageOptions {
  /** Streaming content from chat hook */
  streamingContent: string;
  /** Pending sources from chat hook */
  pendingSources: Source[];
  /** Whether chat is loading */
  isLoading: boolean;
  /** Current status event */
  status: { message: string; stage?: string } | null;
  /** Messages from chat hook */
  messages: Array<{ id: string; role: string; content: string; sources?: Source[] }>;
  /** Conversation IDs to check if message is already displayed (optional, for deduplication) */
  conversationIds?: string[];
}

export interface UseStreamingMessageReturn extends StreamingMessageState {
  /** @deprecated No longer needed - pendingQuery is derived automatically from messages */
  setPendingQuery: (query: string | null) => void;
  /** @deprecated No longer needed - state is derived automatically */
  clearPending: () => void;
}

/**
 * Hook for managing streaming message display state
 *
 * This hook derives all state from actual data (messages, isLoading, streamingContent)
 * instead of requiring manual state management. This eliminates timing/sync issues.
 *
 * State derivation:
 * - pendingQuery: Last user message that doesn't have a corresponding assistant response yet
 * - isPending: true when isLoading OR there's unanswered user message not yet in conversations
 * - showStatus/showStreaming/showLoadingSpinner: derived from isLoading, status, streamingContent
 *
 * @example
 * ```tsx
 * const { messages, isLoading, streamingContent, pendingSources, status } = useChatContext();
 *
 * const {
 *   isPending,
 *   pendingQuery,
 *   showStatus,
 *   showStreaming,
 *   displayContent,
 *   displaySources,
 * } = useStreamingMessage({
 *   streamingContent,
 *   pendingSources,
 *   isLoading,
 *   status,
 *   messages,
 *   conversationIds: conversations.map(c => c.id),
 * });
 *
 * // No need to call setPendingQuery - it's derived automatically!
 * const handleSend = (query: string) => {
 *   sendMessage(query);  // User message is added to messages immediately
 * };
 *
 * // In render
 * {isPending && (
 *   <div>
 *     <UserMessage>{pendingQuery}</UserMessage>
 *     {showStatus && <StatusIndicator status={status} />}
 *     {showStreaming && <AIResponse content={displayContent} />}
 *     {showLoadingSpinner && <Spinner />}
 *     {displaySources.length > 0 && <Results sources={displaySources} />}
 *   </div>
 * )}
 * ```
 */
export function useStreamingMessage(options: UseStreamingMessageOptions): UseStreamingMessageReturn {
  const {
    streamingContent,
    pendingSources,
    isLoading,
    status,
    messages,
    conversationIds = [],
  } = options;

  // Cache for last streaming content/sources to prevent flicker
  // When streamingContent is cleared but response not yet in conversations,
  // we show the cached content instead of empty screen
  const cachedContentRef = useRef<string | null>(null);
  const cachedSourcesRef = useRef<Source[]>([]);

  // Update cache when we have streaming content
  useEffect(() => {
    if (streamingContent) {
      cachedContentRef.current = streamingContent;
    }
    if (pendingSources.length > 0) {
      cachedSourcesRef.current = pendingSources;
    }
  }, [streamingContent, pendingSources]);

  // Derive all state from actual data
  const state = useMemo((): StreamingMessageState => {
    // Find the last user message
    let lastUserMessage: { id: string; content: string } | null = null;
    let lastAssistantMessage: { id: string; content: string; sources?: Source[] } | null = null;

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (!lastAssistantMessage && msg.role === 'assistant') {
        lastAssistantMessage = msg;
      }
      if (!lastUserMessage && msg.role === 'user') {
        lastUserMessage = msg;
        break; // Found the last user message, stop searching
      }
    }

    // Determine if the last user message has been answered
    // Check: is there an assistant message AFTER the last user message?
    let hasAssistantResponse = false;
    if (lastUserMessage) {
      const lastUserIndex = messages.findIndex(m => m.id === lastUserMessage!.id);
      // Look for any assistant message after the user message
      for (let i = lastUserIndex + 1; i < messages.length; i++) {
        if (messages[i].role === 'assistant') {
          hasAssistantResponse = true;
          break;
        }
      }
    }

    // Check if the response is already displayed in conversations
    const isResponseInConversations = lastAssistantMessage
      ? conversationIds.includes(lastAssistantMessage.id)
      : false;

    // Clear cache when response is displayed in conversations
    if (isResponseInConversations) {
      cachedContentRef.current = null;
      cachedSourcesRef.current = [];
    }

    // pendingQuery: last user message that hasn't been answered OR answer not in conversations yet
    // Keep showing pending query until the response appears in conversations
    const pendingQuery = lastUserMessage && (!hasAssistantResponse || !isResponseInConversations)
      ? lastUserMessage.content
      : null;

    // isPending: we're loading OR there's an unanswered question OR response not yet displayed in conversations
    // This prevents flicker when isLoading becomes false but conversations haven't updated yet
    const isPending = isLoading ||
      (lastUserMessage !== null && !hasAssistantResponse) ||
      (hasAssistantResponse && !isResponseInConversations);

    // Use current streaming content, or cached content if streaming is done but not yet in conversations
    const effectiveContent = streamingContent || (isPending ? cachedContentRef.current : null);
    const effectiveSources = pendingSources.length > 0 ? pendingSources : (isPending ? cachedSourcesRef.current : []);

    const showStatus = isLoading && status !== null && !effectiveContent;
    const showStreaming = !!effectiveContent;
    const showLoadingSpinner = isLoading && !status && !effectiveContent;

    return {
      isPending,
      pendingQuery,
      showStatus,
      showStreaming,
      showLoadingSpinner,
      displayContent: effectiveContent,
      displaySources: effectiveSources,
    };
  }, [
    messages,
    conversationIds,
    isLoading,
    status,
    streamingContent,
    pendingSources,
  ]);

  // Deprecated no-op functions for backward compatibility
  const setPendingQuery = useCallback((_query: string | null) => {
    // No-op: pendingQuery is now derived from messages automatically
  }, []);

  const clearPending = useCallback(() => {
    // No-op: state is now derived automatically
  }, []);

  return {
    ...state,
    setPendingQuery,
    clearPending,
  };
}

export default useStreamingMessage;
