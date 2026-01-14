import type { ReactNode } from 'react';
import { useSearchContext } from './SearchContext';

/**
 * Props passed to summary render function
 */
export interface SearchSummaryRenderProps {
  /** AI-generated summary content */
  content: string | undefined;
  /** Streaming content (updates during streaming) */
  streamingContent: string;
  /** Whether search is in progress */
  isLoading: boolean;
}

/**
 * Props for SearchSummary component
 */
export interface SearchSummaryProps {
  /** Render function for the summary */
  children: (props: SearchSummaryRenderProps) => ReactNode;
}

/**
 * SearchSummary - Renders the AI-generated search summary
 *
 * @example
 * ```tsx
 * <SearchSummary>
 *   {({ content, streamingContent, isLoading }) => (
 *     <div className="summary">
 *       {isLoading && streamingContent ? (
 *         <p className="streaming">{streamingContent}</p>
 *       ) : content ? (
 *         <p>{content}</p>
 *       ) : null}
 *     </div>
 *   )}
 * </SearchSummary>
 * ```
 */
export function SearchSummary({ children }: SearchSummaryProps) {
  const { content, streamingContent, isLoading } = useSearchContext();

  return (
    <>
      {children({
        content,
        streamingContent,
        isLoading,
      })}
    </>
  );
}
