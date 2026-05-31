import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 staleTime: 0 (각 쿼리에서 개별 지정)
      staleTime: 0,
      // 실패 시 1회만 재시도
      retry: 1,
      // 탭 포커스 복귀 시 자동 재조회 비활성 (명시적 staleTime으로 제어)
      refetchOnWindowFocus: false,
    },
  },
});
