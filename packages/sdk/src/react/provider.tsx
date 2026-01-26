import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { CubeIAxClient } from '../api/client';
import type { CubeIAxConfig } from '../core/types';

/**
 * Context value for CubeIAxProvider
 */
export interface CubeIAxContextValue {
  /** SDK client instance */
  client: CubeIAxClient;
  /** SDK configuration */
  config: CubeIAxConfig;
}

const CubeIAxContext = createContext<CubeIAxContextValue | null>(null);

/**
 * Provider props
 */
export interface CubeIAxProviderProps extends CubeIAxConfig {
  /** Child components */
  children: ReactNode;
}

/**
 * CubeIAxProvider - React Context Provider for Cube-I-AX SDK
 *
 * Wrap your app with this provider to use SDK hooks without passing config every time.
 *
 * @example
 * ```tsx
 * import { CubeIAxProvider } from '@cube-i-ax/sdk/react';
 *
 * function App() {
 *   return (
 *     <CubeIAxProvider
 *       apiKey={process.env.REACT_APP_CUBE_IAX_API_KEY}
 *       baseUrl={process.env.REACT_APP_CUBE_IAX_API_URL}
 *     >
 *       <ChatPage />
 *       <SearchPage />
 *     </CubeIAxProvider>
 *   );
 * }
 * ```
 */
export function CubeIAxProvider({
                                  children,
                                  apiKey,
                                  baseUrl,
                                  timeout,
                                  agent,
                                  debug,
                                }: CubeIAxProviderProps) {
  // 단일 useMemo로 통합하여 메모이제이션 체인 단순화
  // props가 변경될 때만 client와 value가 함께 재생성됨
  const value = useMemo(() => {
    const config: CubeIAxConfig = { apiKey, baseUrl, timeout, agent, debug };
    const client = new CubeIAxClient(config);
    return { client, config };
  }, [apiKey, baseUrl, timeout, agent, debug]);

  return (
      <CubeIAxContext.Provider value={value}>
        {children}
      </CubeIAxContext.Provider>
  );
}

/**
 * Hook to access CubeIAx context
 *
 * @returns Context value with client and config
 * @throws Error if used outside of CubeIAxProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { client, config } = useCubeIAxContext();
 *   // Use client directly or access config
 * }
 * ```
 */
export function useCubeIAxContext(): CubeIAxContextValue {
  const context = useContext(CubeIAxContext);
  if (!context) {
    throw new Error('useCubeIAxContext must be used within a CubeIAxProvider');
  }
  return context;
}

/**
 * Hook to access CubeIAx context (optional - returns null if not in Provider)
 *
 * Useful when you want hooks to work both with and without Provider.
 *
 * @returns Context value or null
 */
export function useCubeIAxContextOptional(): CubeIAxContextValue | null {
  return useContext(CubeIAxContext);
}

export default CubeIAxProvider;
