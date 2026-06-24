import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore.jsx';
import { api as apiClient } from '../lib/apiClient.js';

/**
 * AuthContext
 * 
 * 사용자 인증 상태 및 토큰 관리용 context입니다.
 * 실제 구현에서는 로그인/세션 기반으로 토큰을 발급받아 저장합니다.
 * 
 * 프로덕션 권장 사항:
 * - 토큰은 HTTP-only 쿠키에 저장 (localStorage 대신)
 * - 토큰 갱신(refresh token) 로직 추가
 * - 로그아웃 시 토큰 안전하게 제거
 */

const AuthContext = createContext();

/**
 * AuthProvider
 * 
 * 앱 최상단에서 감싸 사용하세요:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }) {
  const {
    token,
    user,
    isLogin,
    login: storeLogin,
    logout: storeLogout,
  } = useAuthStore();
  const [localUser, setLocalUser] = useState(null);
  const [localToken, setLocalToken] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * 로그인 시뮬레이션
   * 실제 구현: API 요청 후 토큰 받기
   */
  const login = useCallback(async (username, password, type = 'INDIVIDUAL') => {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        id: username,
        password,
        type,
      });
      const accessToken = response.accessToken || response.data?.accessToken;
      if (!accessToken) {
        throw new Error('Access token is missing');
      }
      const profileResponse = await apiClient.get('/api/v1/account/me', { token: accessToken });
      const profile = profileResponse.data || profileResponse;
      storeLogin({ token: accessToken, profile });
      setLocalToken(accessToken);
      setLocalUser(profile);
      return { success: true, user: profile };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [storeLogin]);

  /**
   * 로그아웃
   */
  const logout = useCallback(() => {
    storeLogout();
    setLocalToken(null);
    setLocalUser(null);
  }, [storeLogout]);

  /**
   * 현재 토큰 반환
   * FileUpload 및 axios interceptor에서 사용
   */
  const getToken = useCallback(() => {
    return token || localToken;
  }, [token, localToken]);

  /**
   * Authorization 헤더 생성 유틸
   */
  const getAuthHeaders = useCallback(() => {
    const resolvedToken = token || localToken;
    if (!resolvedToken) return {};
    return { Authorization: `Bearer ${resolvedToken}` };
  }, [token, localToken]);

  const value = {
    user: user || localUser,
    token: token || localToken,
    loading,
    login,
    logout,
    getToken,
    getAuthHeaders,
    isAuthenticated: !!(token || localToken || isLogin),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * 
 * 컴포넌트에서 인증 상태와 함수에 접근하세요:
 * const { user, token, getAuthHeaders, login, logout, isAuthenticated } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
