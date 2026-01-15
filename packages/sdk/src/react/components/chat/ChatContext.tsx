import { createContext, useContext, type ReactNode } from 'react';
import { useCubeIAxChat, type UseCubeIAxChatOptions, type UseCubeIAxChatReturn } from '../../hooks';

/**
 * Chat context value - exposes all chat state and actions
 */
export type ChatContextValue = UseCubeIAxChatReturn;

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
 * Props for ChatRoot component
 */
export interface ChatRootProps extends UseCubeIAxChatOptions {
  children: ReactNode;
}

/**
 * ChatRoot - Headless chat container that provides context
 *
 * @example
 * ```tsx
 * <ChatRoot profile={{ region: 'Seoul' }} onComplete={handleComplete}>
 *   <ChatMessages>
 *     {(message) => <MyMessage {...message} />}
 *   </ChatMessages>
 *   <ChatInput>
 *     {({ send }) => <input onSubmit={send} />}
 *   </ChatInput>
 * </ChatRoot>
 * ```
 */
export function ChatRoot({ children, ...options }: ChatRootProps) {
  const chat = useCubeIAxChat(options);

  return (
    <ChatContext.Provider value={chat}>
      {children}
    </ChatContext.Provider>
  );
}
