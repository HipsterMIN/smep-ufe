import { createContext, useContext, type ReactNode } from 'react';
import { useCubeIAxSearch, type UseCubeIAxSearchOptions, type UseCubeIAxSearchReturn } from '../../hooks';

/**
 * Search context value - exposes all search state and actions
 */
export type SearchContextValue = UseCubeIAxSearchReturn;

const SearchContext = createContext<SearchContextValue | null>(null);

/**
 * Hook to access search context
 * Must be used within SearchRoot
 */
export function useSearchContext(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within SearchRoot');
  }
  return context;
}

/**
 * Props for SearchRoot component
 */
export interface SearchRootProps extends UseCubeIAxSearchOptions {
  children: ReactNode;
}

/**
 * SearchRoot - Headless search container that provides context
 *
 * @example
 * ```tsx
 * <SearchRoot topK={10} stream onSources={handleSources}>
 *   <SearchInput>
 *     {({ search }) => <input onChange={(e) => search(e.target.value)} />}
 *   </SearchInput>
 *   <SearchResults>
 *     {(result) => <MyResult {...result} />}
 *   </SearchResults>
 * </SearchRoot>
 * ```
 */
export function SearchRoot({ children, ...options }: SearchRootProps) {
  const search = useCubeIAxSearch(options);

  return (
    <SearchContext.Provider value={search}>
      {children}
    </SearchContext.Provider>
  );
}
