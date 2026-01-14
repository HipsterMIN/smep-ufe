import type { ReactNode } from 'react';
import { useChatContext } from './ChatContext';

/**
 * Props passed to actions render function
 */
export interface ChatActionsRenderProps {
  /** Clear all messages and reset session */
  clear: () => void;
  /** Abort the current request */
  abort: () => void;
  /** Whether a request is in progress */
  isLoading: boolean;
  /** Current session ID */
  sessionId: string | undefined;
  /** Number of messages */
  messageCount: number;
}

/**
 * Props for ChatActions component
 */
export interface ChatActionsProps {
  /** Render function for actions */
  children: (props: ChatActionsRenderProps) => ReactNode;
}

/**
 * ChatActions - Provides access to chat actions (clear, abort)
 *
 * @example
 * ```tsx
 * <ChatActions>
 *   {({ clear, abort, isLoading, messageCount }) => (
 *     <div className="actions">
 *       {messageCount > 0 && (
 *         <button onClick={clear}>Clear Chat</button>
 *       )}
 *       {isLoading && (
 *         <button onClick={abort}>Stop</button>
 *       )}
 *     </div>
 *   )}
 * </ChatActions>
 * ```
 */
export function ChatActions({ children }: ChatActionsProps) {
  const { clearMessages, abort, isLoading, sessionId, messages } = useChatContext();

  return (
    <>
      {children({
        clear: clearMessages,
        abort,
        isLoading,
        sessionId,
        messageCount: messages.length,
      })}
    </>
  );
}
