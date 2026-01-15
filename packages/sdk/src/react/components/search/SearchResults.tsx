import type { ReactNode } from 'react';
import { useSearchContext } from './SearchContext';
import type { SearchResult } from '../../../core/types';

/**
 * Props passed to result render function
 */
export interface SearchResultRenderProps extends SearchResult {
  /** Index of the result */
  index: number;
  /** Whether this is the last result */
  isLast: boolean;
}

/**
 * Props for SearchResults component
 */
export interface SearchResultsProps {
  /** Render function for each result */
  children: (props: SearchResultRenderProps) => ReactNode;
  /** Optional empty state render */
  empty?: ReactNode;
}

/**
 * SearchResults - Renders the list of search results
 *
 * @example
 * ```tsx
 * <SearchResults empty={<p>No results found</p>}>
 *   {({ title, content, score, documentId, index }) => (
 *     <div key={documentId} className="result">
 *       <h3>{title}</h3>
 *       <p>{content}</p>
 *       <span>Score: {score}</span>
 *     </div>
 *   )}
 * </SearchResults>
 * ```
 */
export function SearchResults({ children, empty }: SearchResultsProps) {
  const { results, isLoading } = useSearchContext();

  if (results.length === 0 && !isLoading && empty) {
    return <>{empty}</>;
  }

  return (
    <>
      {results.map((result, index) =>
        children({
          ...result,
          index,
          isLast: index === results.length - 1,
        })
      )}
    </>
  );
}

/**
 * Props for SearchResultItem component (alternative API)
 */
export interface SearchResultItemProps {
  /** The result to render */
  result: SearchResult;
  /** Render function */
  children: (props: SearchResult) => ReactNode;
}

/**
 * SearchResultItem - Renders a single result with render props
 *
 * @example
 * ```tsx
 * {results.map(result => (
 *   <SearchResultItem key={result.documentId} result={result}>
 *     {({ title, content }) => <div>{title}: {content}</div>}
 *   </SearchResultItem>
 * ))}
 * ```
 */
export function SearchResultItem({ result, children }: SearchResultItemProps) {
  return <>{children(result)}</>;
}
