import { useCallback, useEffect, useRef, useState } from 'react';

import { NICE_ID_AUTH_ERROR_CODES, openNiceIdAuth } from '../lib/niceIdAuth';

/**
 * React 화면에서 NICE ID 공통 facade를 loading/error/result 상태와 함께 사용하게 해준다.
 *
 * @returns {{authenticate: Function, reset: Function, loading: boolean, error: Object | null, result: Object | null}}
 */
export const useNiceIdAuth = () => {
  const mountedRef = useRef(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // 이유: React StrictMode 개발 렌더링은 effect cleanup 후 재실행되므로 remount 시 mounted flag를 복구해야 한다.
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  const authenticate = useCallback(async (options) => {
    setLoading(true);
    setError(null);
    setResult(null);

    let authResult;
    try {
      authResult = await openNiceIdAuth(options);
    } catch {
      authResult = {
        success: false,
        errorCode: NICE_ID_AUTH_ERROR_CODES.requestFailed,
        message: 'NICE ID 인증 처리 중 오류가 발생했습니다.',
      };
    }

    if (!mountedRef.current) {
      return authResult;
    }

    setLoading(false);
    if (authResult.success) {
      setResult(authResult);
    } else {
      setError(authResult);
    }

    return authResult;
  }, []);

  return {
    authenticate,
    reset,
    loading,
    error,
    result,
  };
};
