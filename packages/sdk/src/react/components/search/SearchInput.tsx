import type { ReactNode } from 'react';
import { useSearchContext } from './SearchContext';
import type { SearchRequest, SearchResponse } from '../../../core/types';

/**
 * Props passed to search input render function
 */
export interface SearchInputRenderProps {
  /** Execute a search */
  search: (query: string, options?: Partial<SearchRequest>) => Promise<SearchResponse | null>;
  /** Whether search is in progress */
  isLoading: boolean;
  /** Abort the current search */
  abort: () => void;
  /** Current error if any */
  error: Error | null;
}

/**
 * Props for SearchInput component
 */
export interface SearchInputProps {
  /** Render function for the search input */
  children: (props: SearchInputRenderProps) => ReactNode;
}

/**
 * SearchInput - Headless input component for executing searches
 *
 * @example
 * ```tsx
 * <SearchInput>
 *   {({ search, isLoading, abort }) => (
 *     <div>
 *       <input
 *         placeholder="Search..."
 *         onKeyDown={(e) => e.key === 'Enter' && search(e.target.value)}
 *       />
 *       {isLoading && <button onClick={abort}>Cancel</button>}
 *     </div>
 *   )}
 * </SearchInput>
 * ```
 */
export function SearchInput({ children }: SearchInputProps) {
  const { search, isLoading, abort, error } = useSearchContext();

  return (
    <>
      {children({
        search,
        isLoading,
        abort,
        error,
      })}
    </>
  );
}
