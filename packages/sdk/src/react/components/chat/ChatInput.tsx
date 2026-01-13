import type { ReactNode } from 'react';
import { useChatContext } from './ChatContext';

/**
 * Props passed to input render function
 */
export interface ChatInputRenderProps {
  /** Send a message */
  send: (message: string, metadata?: Record<string, unknown>) => Promise<void>;
  /** Whether a message is being sent/received */
  isLoading: boolean;
  /** Abort the current request */
  abort: () => void;
  /** Current error if any */
  error: Error | null;
}

/**
 * Props for ChatInput component
 */
export interface ChatInputProps {
  /** Render function for the input area */
  children: (props: ChatInputRenderProps) => ReactNode;
}

/**
 * ChatInput - Headless input component for sending messages
 *
 * @example
 * ```tsx
 * <ChatInput>
 *   {({ send, isLoading, abort }) => (
 *     <form onSubmit={(e) => {
 *       e.preventDefault();
 *       send(inputValue);
 *     }}>
 *       <input disabled={isLoading} />
 *       {isLoading ? (
 *         <button type="button" onClick={abort}>Cancel</button>
 *       ) : (
 *         <button type="submit">Send</button>
 *       )}
 *     </form>
 *   )}
 * </ChatInput>
 * ```
 */
export function ChatInput({ children }: ChatInputProps) {
  const { sendMessage, isLoading, abort, error } = useChatContext();

  return (
    <>
      {children({
        send: sendMessage,
        isLoading,
        abort,
        error,
      })}
    </>
  );
}
