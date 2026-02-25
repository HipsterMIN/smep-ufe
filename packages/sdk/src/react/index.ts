/**
 * React module - Provider, Hooks, and Components
 *
 * This module contains React-specific functionality for the SDK.
 */

// ============================================
// Hooks (범용)
// ============================================
export { useCubeIAxChat, useCubeIAxSearch, useChat, useSearch, useStreamingMessage } from './hooks';
export type {
  UseCubeIAxChatOptions,
  UseCubeIAxChatReturn,
  UseCubeIAxSearchOptions,
  UseCubeIAxSearchReturn,
  UseChatOptions,
  UseChatReturn,
  UseSearchOptions,
  UseSearchReturn,
  UseStreamingMessageOptions,
  UseStreamingMessageReturn,
  StreamingMessageState,
  StatusEvent,
  SearchCacheState,
} from './hooks';

// ============================================
// Providers (범용)
// ============================================
export {
  CubeIAxProvider,
  useCubeIAxContext,
  useCubeIAxContextOptional,
} from './provider';
export type {
  CubeIAxProviderProps,
  CubeIAxContextValue,
} from './provider';

// ============================================
// Headless Components
// ============================================
export {
  // Chat
  ChatProvider,
  useChatContext,
  ChatMessages,
  ChatMessage,
  ChatInput,
  ChatTypingIndicator,
  ChatStatus,
  ChatActions,
  // Search
  SearchProvider,
  useSearchContext,
  SearchInput,
  SearchResults,
  SearchResultItem,
  SearchSummary,
} from './components';

export type {
  // Chat
  ChatProviderProps,
  ChatContextValue,
  ChatMessagesProps,
  ChatMessageProps,
  ChatMessageRenderProps,
  ChatInputProps,
  ChatInputRenderProps,
  ChatTypingIndicatorProps,
  ChatTypingIndicatorRenderProps,
  ChatStatusProps,
  ChatStatusRenderProps,
  ChatActionsProps,
  ChatActionsRenderProps,
  // Search
  SearchProviderProps,
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
export {
  DEFAULT_TOP_K,
  DEFAULT_GROUP_BY_FIELD,
  MIN_TOKENS,
  MAX_TOKENS,
  DEFAULT_TOKENS,
} from '../api/client';
// 에러 타입 (에러 분류용)
export {
  TimeoutError,
  AbortedError,
  ApiError,
  StreamParseError,
} from '../api/client';
export { Domain, getSourceField } from '../core/types';
export type {
  DomainType,
  CubeIAxConfig,
  UserProfile,
  ChatRequest,
  ChatResponse,
  Message,
  SearchRequest,
  SearchResponse,
  SearchResult,
  Source,
  StreamEvent,
  StreamEventType,
  StreamCallbacks,
  SearchStreamCallbacks,
  QueryAnalysis,
  ItemDetail,
  GetDocumentRequest,
  DocumentSection,
  DocumentResponse,
} from '../core/types';
