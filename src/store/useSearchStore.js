import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * AI 스마트 검색 결과를 관리하는 Zustand Store
 * 페이지 새로고침 시에도 결과를 유지하기 위해 persist 미들웨어를 사용합니다.
 */
const useSearchStore = create(
  persist(
    (set) => ({
      // 상태
      programs: [],
      total: 0,
      summary: null,
      lastQuery: null,
      
      // 액션
      setSearchResults: (data) => set({
        programs: data.programs || [],
        total: data.total || 0,
        summary: data.summary || null,
        lastQuery: data.lastQuery || null,
      }),
      
      clearSearch: () => set({
        programs: [],
        total: 0,
        summary: null,
        lastQuery: null,
      }),
    }),
    {
      name: 'ai-search-storage', // localStorage 키 이름
    }
  )
);

export default useSearchStore;
