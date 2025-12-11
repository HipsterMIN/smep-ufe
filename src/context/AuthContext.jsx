import React, { createContext, useContext, useState, useCallback } from 'react';

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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * 로그인 시뮬레이션
   * 실제 구현: API 요청 후 토큰 받기
   */
  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      // 실제 구현: const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({...}) })
      // const { token, user } = await res.json();
      
      // 데모용 시뮬레이션
      const mockToken = `mock-token-${Date.now()}`;
      const mockUser = { id: 1, name: username, email: `${username}@example.com` };
      
      setToken(mockToken);
      setUser(mockUser);
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 로그아웃
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  /**
   * 현재 토큰 반환
   * FileUpload 및 axios interceptor에서 사용
   */
  const getToken = useCallback(() => {
    return token;
  }, [token]);

  /**
   * Authorization 헤더 생성 유틸
   */
  const getAuthHeaders = useCallback(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    getToken,
    getAuthHeaders,
    isAuthenticated: !!token,
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
