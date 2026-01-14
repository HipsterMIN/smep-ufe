import type { ReactNode } from 'react';
import { useChatContext } from './ChatContext';
import type { Message } from '../../hooks';

/**
 * Props passed to message render function
 */
export interface ChatMessageRenderProps extends Message {
  /** Whether this is the last message */
  isLast: boolean;
  /** Index of the message */
  index: number;
}

/**
 * Props for ChatMessages component
 */
export interface ChatMessagesProps {
  /** Render function for each message */
  children: (props: ChatMessageRenderProps) => ReactNode;
}

/**
 * ChatMessages - Renders the list of chat messages
 *
 * @example
 * ```tsx
 * <ChatMessages>
 *   {({ role, content, sources, isLast }) => (
 *     <div className={role === 'user' ? 'user' : 'assistant'}>
 *       {content}
 *       {sources?.map(s => <Source key={s.documentId} {...s} />)}
 *     </div>
 *   )}
 * </ChatMessages>
 * ```
 */
export function ChatMessages({ children }: ChatMessagesProps) {
  const { messages } = useChatContext();

  return (
    <>
      {messages.map((message, index) =>
        children({
          ...message,
          index,
          isLast: index === messages.length - 1,
        })
      )}
    </>
  );
}

/**
 * Props for ChatMessage component (alternative API)
 */
export interface ChatMessageProps {
  /** The message to render */
  message: Message;
  /** Render function */
  children: (props: Message) => ReactNode;
}

/**
 * ChatMessage - Renders a single message with render props
 *
 * @example
 * ```tsx
 * {messages.map(msg => (
 *   <ChatMessage key={msg.id} message={msg}>
 *     {({ role, content }) => <div>{content}</div>}
 *   </ChatMessage>
 * ))}
 * ```
 */
export function ChatMessage({ message, children }: ChatMessageProps) {
  return <>{children(message)}</>;
}
