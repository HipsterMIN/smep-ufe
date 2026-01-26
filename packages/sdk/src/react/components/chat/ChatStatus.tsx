import type { ReactNode } from 'react';
import { useChatContext } from './ChatContext';
import type { StatusEvent } from '../../hooks';

/**
 * Props passed to status render function
 */
export interface ChatStatusRenderProps {
  /** Whether the AI is currently processing */
  isLoading: boolean;
  /** Current status event (e.g., "검색 중...", "분석 중...") */
  status: StatusEvent | null;
  /** Status message (shortcut for status?.message) */
  message: string | null;
  /** Status stage (shortcut for status?.stage) */
  stage: string | null;
  /** Whether status should be displayed (loading + status present + no streaming yet) */
  showStatus: boolean;
  /** Current streaming content */
  streamingContent: string;
}

/**
 * Props for ChatStatus component
 */
export interface ChatStatusProps {
  /** Render function for the status indicator */
  children: (props: ChatStatusRenderProps) => ReactNode;
  /** Only render when status is visible (default: false) */
  onlyWhenVisible?: boolean;
}

/**
 * ChatStatus - Shows processing status while AI is working
 *
 * This component exposes the status state for custom rendering.
 * Status is typically shown between the user's message and the AI response,
 * and disappears once streaming content starts arriving.
 *
 * @example
 * ```tsx
 * <ChatStatus>
 *   {({ showStatus, message, stage }) => (
 *     showStatus && (
 *       <div className="status-indicator">
 *         <Spinner />
 *         <span>{message}</span>
 *         {stage && <span className="stage">{stage}</span>}
 *       </div>
 *     )
 *   )}
 * </ChatStatus>
 * ```
 *
 * @example With onlyWhenVisible for cleaner logic
 * ```tsx
 * <ChatStatus onlyWhenVisible>
 *   {({ message, stage }) => (
 *     <div className="status-indicator">
 *       <Spinner />
 *       <span>{message}</span>
 *     </div>
 *   )}
 * </ChatStatus>
 * ```
 */
export function ChatStatus({ children, onlyWhenVisible = false }: ChatStatusProps) {
  const { isLoading, status, streamingContent } = useChatContext();

  const showStatus = isLoading && status !== null && !streamingContent;

  // If onlyWhenVisible is true and status shouldn't be shown, render nothing
  if (onlyWhenVisible && !showStatus) {
    return null;
  }

  return (
    <>
      {children({
        isLoading,
        status,
        message: status?.message ?? null,
        stage: status?.stage ?? null,
        showStatus,
        streamingContent,
      })}
    </>
  );
}
