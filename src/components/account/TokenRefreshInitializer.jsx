import { useEffect, useRef } from 'react';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import {
  finishSilentSso,
  hasSilentSsoAttempted,
  isSilentSsoInProgress,
  markSilentSsoStart,
} from '@utils/onepassSilentSso.js';

const LOG_PREFIX = '[TokenRefreshInitializer]';

/**
 * 페이지 로드 시 인증 상태를 복구하고, 미인증 사용자에게 silent SSO를 시도한다.
 *
 * 세션 복구 흐름 (isLogin=true, refreshToken 있음):
 *   → POST /api/v1/account/refresh
 *   → 성공: setToken(newAccessToken) — 메모리에만 저장
 *   → 실패: logout() — 세션 만료 처리
 *
 * Silent SSO 흐름 (isLogin=false, refreshToken 없음):
 *   → GET /api/v1/auth/keycloak/login-url?silent=true
 *   → Keycloak으로 리다이렉트 (prompt=none)
 *   → 세션 있음: /sso?code=... 로 리다이렉트 → OnePassSsoCallback 처리 후 원래 페이지 복귀
 *   → 세션 없음: /sso?error=login_required → OnePassSsoCallback이 원래 페이지로 복귀
 *
 * 주의:
 *   - useEffect는 컴포넌트 마운트 시 1회만 실행한다 (hasRun ref 가드).
 *   - React StrictMode의 2회 마운트에도 hasRun으로 중복 실행을 방지한다.
 *   - 이 컴포넌트는 App.jsx에서 AppRouter보다 먼저 마운트되어야 한다.
 */
export function TokenRefreshInitializer() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const restoreOrSilentLogin = async () => {
      const {
        isLogin,
        token,
        refreshToken,
        setToken,
        setRefreshToken,
        logout,
      } = useAuthStore.getState();

      const startSilentSso = async () => {
        // /sso 콜백 라우트에서는 재진입을 막는다.
        if (window.location.pathname.endsWith('/sso')) return;

        // 이번 탭 세션에서 이미 시도했으면 다시 하지 않는다.
        // window.location.replace()로 복귀 후 리로드되어도 무한 루프를 방지한다.
        if (hasSilentSsoAttempted()) {
          console.info(`${LOG_PREFIX} silent SSO already attempted this session — skipped`);
          return;
        }

        // 동일 탭 내 중복 실행(in_progress) 방지 — 이전 리다이렉트가 아직 진행 중
        if (isSilentSsoInProgress()) {
          console.info(`${LOG_PREFIX} silent SSO already in progress — skipped`);
          return;
        }

        try {
          markSilentSsoStart();
          const response = await apiClient.get('/api/v1/auth/keycloak/login-url?silent=true');
          const loginUrl = response?.data?.loginUrl || response?.loginUrl;

          if (!loginUrl) throw new Error('Silent login URL is missing');

          // Keycloak으로 리다이렉트 (prompt=none)
          // 세션 있음 → /sso?code=... → OnePassSsoCallback → 원래 페이지 복귀 + 로그인
          // 세션 없음 → /sso?error=login_required → OnePassSsoCallback → 원래 페이지 복귀
          console.info(`${LOG_PREFIX} redirecting to Keycloak for silent SSO (prompt=none)`);
          window.location.replace(loginUrl);
        } catch (err) {
          finishSilentSso({ clearAttempted: true });
          console.info(`${LOG_PREFIX} silent SSO skipped`, {
            message: err?.message ?? 'unknown',
            status: err?.status ?? null,
          });
        }
      };

      // access token이 이미 있으면 아무 작업도 하지 않는다.
      if (token) return;

      // 리로드 후 복구: 로그인 상태인데 access token이 메모리에 없음
      if (isLogin && refreshToken) {
        console.log(`${LOG_PREFIX} access token missing after reload — restoring session via refresh`);

        try {
          const response = await apiClient.post('/api/v1/account/refresh', { refreshToken });
          const newToken = response.accessToken || response.data?.accessToken;
          const newRefreshToken = response.refreshToken || response.data?.refreshToken;

          if (!newToken) throw new Error('No access token in refresh response');

          setToken(newToken);
          if (newRefreshToken) setRefreshToken(newRefreshToken);

          console.log(`${LOG_PREFIX} session restored successfully`);
          return;
        } catch (err) {
          console.error(`${LOG_PREFIX} session restore failed — logging out`, {
            message: err?.message ?? 'unknown',
            status: err?.status ?? null,
          });
          logout();
        }
      }

      await startSilentSso();
    };

    void restoreOrSilentLogin();
  }, []);

  return null;
}
