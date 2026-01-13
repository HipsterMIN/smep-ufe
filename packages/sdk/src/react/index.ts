/**
 * React module - Provider, Hooks, and Components
 *
 * This module contains React-specific functionality for the SDK.
 */

// Provider
export {
  CubeIAxProvider,
  useCubeIAxContext,
  useCubeIAxContextOptional,
} from './provider';
export type {
  CubeIAxProviderProps,
  CubeIAxContextValue,
} from './provider';

// React hooks
export { useCubeIAxChat, useCubeIAxSearch } from './hooks';
export type {
  UseCubeIAxChatOptions,
  UseCubeIAxChatReturn,
  UseCubeIAxSearchOptions,
  UseCubeIAxSearchReturn,
  Message,
} from './hooks';

// Headless Components
export {
  // Chat
  ChatRoot,
  useChatContext,
  ChatMessages,
  ChatMessage,
  ChatInput,
  ChatTypingIndicator,
  ChatActions,
  // Search
  SearchRoot,
  useSearchContext,
  SearchInput,
  SearchResults,
  SearchResultItem,
  SearchSummary,
} from './components';

export type {
  // Chat
  ChatRootProps,
  ChatContextValue,
  ChatMessagesProps,
  ChatMessageProps,
  ChatMessageRenderProps,
  ChatInputProps,
  ChatInputRenderProps,
  ChatTypingIndicatorProps,
  ChatTypingIndicatorRenderProps,
  ChatActionsProps,
  ChatActionsRenderProps,
  // Search
  SearchRootProps,
  SearchContextValue,
  SearchInputProps,
  SearchInputRenderProps,
  SearchResultsProps,
  SearchResultRenderProps,
  SearchResultItemProps,
  SearchSummaryProps,
  SearchSummaryRenderProps,
} from './components';

// Re-export core types and api for convenience
export { CubeIAxClient } from '../api/client';
export { getSourceField } from '../core/types';
export type {
  CubeIAxConfig,
  UserProfile,
  ChatRequest,
  ChatResponse,
  SearchRequest,
  SearchResponse,
  SearchResult,
  Source,
  StreamEvent,
  StreamEventType,
  StreamCallbacks,
  SearchStreamCallbacks,
} from '../core/types';
