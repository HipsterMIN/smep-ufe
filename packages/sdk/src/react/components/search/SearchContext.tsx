import { createContext, useContext, type ReactNode } from 'react';
import { useSearch, type UseSearchOptions, type UseSearchReturn } from '../../hooks';

/**
 * Search context value - exposes all search state and actions
 */
export type SearchContextValue = UseSearchReturn;

const SearchContext = createContext<SearchContextValue | null>(null);

/**
 * Hook to access search context
 * Must be used within SearchProvider
 */
export function useSearchContext(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within SearchProvider');
  }
  return context;
}

/**
 * Props for SearchProvider component
 */
export interface SearchRootProps extends UseSearchOptions {
  children: ReactNode;
}

/**
 * SearchProvider - Headless search container that provides context
 *
 * @example
 * ```tsx
 * <SearchProvider topK={10} stream onSources={handleSources}>
 *   <SearchInput>
 *     {({ search }) => <input onChange={(e) => search(e.target.value)} />}
 *   </SearchInput>
 *   <SearchResults>
 *     {(result) => <MyResult {...result} />}
 *   </SearchResults>
 * </SearchProvider>
 * ```
 */
export function SearchRoot({ children, ...options }: SearchRootProps) {
  const search = useSearch(options);

  return (
    <SearchContext.Provider value={search}>
      {children}
    </SearchContext.Provider>
  );
}
