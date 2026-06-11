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
 * 숨겨진 iframe으로 silent SSO를 백그라운드 실행한다.
 * 메인 윈도우 이동 없이 SSO 인증을 완료하여 화면 깜빡임을 방지한다.
 *
 * 흐름:
 *   1. 숨겨진 iframe에 SSO 프로바이더 URL 로드
 *   2. SSO 프로바이더가 /sso?code=... 로 iframe 리다이렉트
 *   3. iframe의 OnePassSsoCallback이 코드 교환 후 postMessage('SILENT_SSO_RESULT')
 *   4. 부모(메인 윈도우)가 메시지 수신 후 ssoLogin() 호출
 */
const runSilentSsoViaIframe = (loginUrl) =>
  new Promise((resolve) => {
    const TIMEOUT_MS = 30_000;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;border:none;visibility:hidden;';
    document.body.appendChild(iframe);

    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      window.removeEventListener('message', onMessage);
      try { iframe.remove(); } catch { /* ignore */ }
    };

    const timer = setTimeout(() => {
      console.info(`${LOG_PREFIX} silent SSO iframe timeout`);
      cleanup();
      finishSilentSso();
      resolve();
    }, TIMEOUT_MS);

    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'SILENT_SSO_RESULT') return;

      clearTimeout(timer);
      cleanup();

      if (event.data.success) {
        const { accessToken, refreshToken, kcIdToken, profile } = event.data;
        useAuthStore.getState().ssoLogin({ token: accessToken, refreshToken, kcIdToken, profile });
        console.log(`${LOG_PREFIX} silent SSO success via iframe`);
      } else {
        console.info(`${LOG_PREFIX} silent SSO skipped via iframe`, {
          reason: event.data.reason ?? 'unknown',
        });
      }
      finishSilentSso();
      resolve();
    };

    window.addEventListener('message', onMessage);
    iframe.src = loginUrl;
  });

/**
 * 페이지 리로드 후 access token 세션 복구를 담당하는 컴포넌트.
 *
 * 배경:
 *   access token(token)은 XSS 탈취 위험 때문에 sessionStorage에 저장하지 않고
 *   메모리(Zustand 상태)에만 보관한다 (useAuthStore partialize 참고).
 *   따라서 페이지 리로드 시 token=null 이지만 refreshToken은 sessionStorage에 남아 있다.
 *
 * 복구 흐름:
 *   조건: isLogin=true AND token=null AND refreshToken=있음
 *   → POST /api/v1/account/refresh { refreshToken }
 *   → 성공: setToken(newAccessToken) — 메모리에만 저장, sessionStorage 비저장 유지
 *   → 실패: logout() — 세션 만료로 간주, 저장소 정리
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
        // /sso 콜백 라우트에서는 silent 시작을 재시도하지 않는다.
        if (window.location.pathname.endsWith('/sso')) {
          return;
        }

        // 이미 시도한 탭 세션에서는 반복 리다이렉트를 막는다.
        if (isSilentSsoInProgress() || hasSilentSsoAttempted()) {
          return;
        }

        try {
          markSilentSsoStart();
          const response = await apiClient.get('/api/v1/auth/keycloak/login-url?silent=true');
          const loginUrl = response?.data?.loginUrl || response?.loginUrl;

          if (!loginUrl) {
            throw new Error('Silent login URL is missing');
          }

          // 숨겨진 iframe으로 백그라운드 처리 — 메인 윈도우 이동 없음
          await runSilentSsoViaIframe(loginUrl);
        } catch (err) {
          // silent 복구 실패는 비치명 처리한다.
          finishSilentSso();
          console.info(`${LOG_PREFIX} silent SSO skipped`, {
            message: err?.message ?? 'unknown',
            status: err?.status ?? null,
          });
        }
      };

      // access token이 이미 있으면 아무 작업도 하지 않는다.
      if (token) {
        return;
      }

      // 리로드 후 복구가 필요한 경우: 로그인 상태인데 access token이 메모리에 없음
      if (isLogin && refreshToken) {
        console.log(`${LOG_PREFIX} access token missing after reload — restoring session via refresh`);

        try {
          const response = await apiClient.post('/api/v1/account/refresh', { refreshToken });
          const newToken = response.accessToken || response.data?.accessToken;
          const newRefreshToken = response.refreshToken || response.data?.refreshToken;

          if (!newToken) {
            throw new Error('No access token in refresh response');
          }

          setToken(newToken); // 메모리에만 저장 (sessionStorage 비저장)
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }

          console.log(`${LOG_PREFIX} session restored successfully`);
          return;
        } catch (err) {
          console.error(`${LOG_PREFIX} session restore failed — logging out`, {
            message: err?.message ?? 'unknown',
            status: err?.status ?? null,
          });
          // refresh 실패 = 세션 만료 → 로컬 상태·저장소 정리
          logout();
        }
      }

      await startSilentSso();
    };

    void restoreOrSilentLogin();
  }, []);

  return null;
}
