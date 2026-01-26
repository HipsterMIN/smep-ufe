import { createContext, useContext, type ReactNode } from 'react';
import { useChat, type UseChatOptions, type UseChatReturn } from '../../hooks';

/**
 * Chat context value - exposes all chat state and actions
 */
export type ChatContextValue = UseChatReturn;

const ChatContext = createContext<ChatContextValue | null>(null);

/**
 * Hook to access chat context
 * Must be used within ChatRoot
 */
export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatRoot');
  }
  return context;
}

/**
 * Props for ChatProvider component
 */
export interface ChatRootProps extends UseChatOptions {
  children: ReactNode;
}

/**
 * ChatProvider - Headless chat container that provides context
 *
 * @example
 * ```tsx
 * <ChatProvider profile={{ region: 'Seoul' }} onComplete={handleComplete}>
 *   <ChatMessages>
 *     {(message) => <MyMessage {...message} />}
 *   </ChatMessages>
 *   <ChatInput>
 *     {({ send }) => <input onSubmit={send} />}
 *   </ChatInput>
 * </ChatProvider>
 * ```
 */
export function ChatRoot({ children, ...options }: ChatRootProps) {
  const chat = useChat(options);

  return (
    <ChatContext.Provider value={chat}>
      {children}
    </ChatContext.Provider>
  );
}
