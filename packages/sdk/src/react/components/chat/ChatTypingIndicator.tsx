import type { ReactNode } from 'react';
import { useChatContext } from './ChatContext';

/**
 * Props passed to typing indicator render function
 */
export interface ChatTypingIndicatorRenderProps {
  /** Whether the AI is currently responding */
  isTyping: boolean;
  /** Partial streaming content */
  streamingContent: string;
}

/**
 * Props for ChatTypingIndicator component
 */
export interface ChatTypingIndicatorProps {
  /** Render function for the typing indicator */
  children: (props: ChatTypingIndicatorRenderProps) => ReactNode;
}

/**
 * ChatTypingIndicator - Shows streaming content while AI is responding
 *
 * @example
 * ```tsx
 * <ChatTypingIndicator>
 *   {({ isTyping, streamingContent }) => (
 *     isTyping && (
 *       <div className="typing">
 *         <span className="dots">...</span>
 *         {streamingContent && <p>{streamingContent}</p>}
 *       </div>
 *     )
 *   )}
 * </ChatTypingIndicator>
 * ```
 */
export function ChatTypingIndicator({ children }: ChatTypingIndicatorProps) {
  const { isLoading, streamingContent } = useChatContext();

  return (
    <>
      {children({
        isTyping: isLoading,
        streamingContent,
      })}
    </>
  );
}
