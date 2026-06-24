import { useState, useRef, useCallback, useEffect } from 'react';
import { api as apiClient } from '../lib/apiClient.js';

/**
 * 통합 검색 API 호출 및 상태 관리를 담당하는 Hook
 */
export const useTotalSearch = (endpoint = '/api/v1/search/total') => {
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const search = useCallback(async (query) => {
    const trimmedQuery = query?.trim();
    if (!trimmedQuery) return;

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q: trimmedQuery });
      const response = await apiClient.get(`${endpoint}?${params.toString()}`, {
        signal: controller.signal,
      });

      const list = response?.data || response?.items || response?.results || [];
      const total = response?.total ?? response?.totalCount ?? list.length;

      setResults(list);
      setTotalCount(total);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setResults([]);
      setTotalCount(0);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  // 컴포넌트 언마운트 시 요청 취소
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    totalCount,
    isLoading,
    error,
    search,
  };
};
