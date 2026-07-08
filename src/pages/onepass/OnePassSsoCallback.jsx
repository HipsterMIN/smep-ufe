import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api as apiClient } from '../../lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { buildOnePassConversionUrl } from '@utils/keycloakGetAuthCode.js';
import {
  finishSilentSso,
  getSilentSsoReturnUrl,
  isSilentSsoInProgress,
  stripBasename,
} from '@utils/onepassSilentSso.js';

// 임시 연동 계약: 외부 출발 콜백 대응을 위해 프론트 state 검증을 비활성화한다.
const LOG_PREFIX = '[OnePassSsoCallback]';

const resolveErrorCode = (error) =>
  String(
    error?.data?.code ||
      error?.data?.error ||
      error?.data?.errorCode ||
      error?.error ||
      '',
  ).toLowerCase();

const isLoginRequiredError = (error) =>
  resolveErrorCode(error) === 'login_required' ||
  String(error?.message || '').toLowerCase().includes('login_required');

// [라우터 remount 중복 실행 방지 — 모듈 레벨 플래그]
//
// useRef는 컴포넌트 인스턴스 단위로 초기화되므로 라우터 교체(setRouterInstance)로
// 컴포넌트가 리마운트될 때 false로 리셋된다.
// 모듈 레벨 변수는 페이지 세션 동안 유지되므로 remount에도 중복 실행을 막을 수 있다.
let _handledSsoUrl = null;

/**
 * OnePass/Keycloak SSO 콜백(/sso) 처리.
 *
 * silent SSO 복귀는 React Router navigate()로 한다(리로드 없음).
 * ssoLogin()이 access token을 메모리에 넣은 상태 그대로 SPA 내비게이션으로 복귀하므로
 * 이전 방식(window.location.replace → 전체 리로드 → refresh 재발급)의 화면 전환 1회가 줄어든다.
 * 저장된 returnUrl은 basename이 제거된 라우터 경로이며, 과거 형식(전체 경로) 값도
 * stripBasename으로 한 번 더 정규화해 이중화(/home-dev/home-dev/)를 방지한다.
 *
 * iframe silent SSO 분기는 제거했다 — QSign이 별도 도메인이면 3자 쿠키 차단으로
 * 동작할 수 없는 방식이라, 도메인이 바뀌어도 이상 없도록 리다이렉트 방식만 유지한다.
 */
const OnePassSsoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentPathname = window.location.pathname;
    if (!currentPathname.endsWith('/sso')) {
      return;
    }

    const currentUrl = currentPathname + window.location.search;
    if (_handledSsoUrl === currentUrl) {
      return;
    }
    _handledSsoUrl = currentUrl;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const callbackError = params.get('error');

    const isSilentFlow = isSilentSsoInProgress();

    // silent 복귀: 저장된 원래 페이지로 리로드 없이 돌아간다.
    const silentSsoReturn = () => {
      const returnUrl = stripBasename(getSilentSsoReturnUrl() || '/');
      finishSilentSso();
      navigate(returnUrl, { replace: true });
    };

    // SSO 프로바이더가 login_required(미인증) 반환 — 로그인 없이 원래 페이지로 복귀
    if (isSilentFlow && callbackError === 'login_required') {
      silentSsoReturn();
      return;
    }

    if (!code) {
      if (isSilentFlow) {
        silentSsoReturn();
        return;
      }
      navigate('/', { replace: true });
      return;
    }

    const exchangeCode = async () => {
      const authState = useAuthStore.getState();
      const hasLocalLogin = Boolean(authState?.isLogin && authState?.token);
      const callbackEndpoint = hasLocalLogin
        ? '/api/v1/auth/keycloak/callback'
        : '/api/v1/auth/keycloak/callback/local-login';

      try {
        const requestBody =
          callbackEndpoint === '/api/v1/auth/keycloak/callback/local-login'
            ? { code, ...(state !== null ? { state } : {}) }
            : { code };
        const response = await apiClient.post(callbackEndpoint, requestBody);
        const responseData = response?.data || response;

        if (hasLocalLogin) {
          if (isSilentFlow) finishSilentSso();
          navigate('/', { replace: true });
          return;
        }

        const accessToken = responseData?.accessToken;
        const refreshToken = responseData?.refreshToken;
        const kcIdToken = responseData?.kcIdToken || null;

        if (!accessToken || !refreshToken) {
          throw new Error('Case1 callback/local-login token response is incomplete');
        }

        const profileResponse = await apiClient.get('/api/v1/account/me', { token: accessToken });
        const profile = profileResponse?.data || profileResponse;

        useAuthStore.getState().ssoLogin({ token: accessToken, refreshToken, kcIdToken, profile });

        if (isSilentFlow) {
          silentSsoReturn();
        } else {
          navigate('/', { replace: true });
        }
      } catch (error) {
        if (isSilentFlow) {
          if (!isLoginRequiredError(error)) {
            console.info(`${LOG_PREFIX} silent SSO exchange failed — returning without login`, {
              message: error?.message ?? 'unknown',
              status: error?.status ?? null,
            });
          }
          silentSsoReturn();
          return;
        }

        // 404: Q-Sign UUID와 연결된 로컬 회원이 없음 → OnePass 전환(연동) 페이지로 이동
        if (error?.status === 404) {
          window.location.href = buildOnePassConversionUrl();
          return;
        }

        alert('중기 통합회원 로그인 처리에 실패했습니다. 다시 시도해 주세요.');
        _handledSsoUrl = null;
        navigate('/', { replace: true });
      }
    };

    exchangeCode();
  }, [navigate]);

  // 라우터 교체 타이밍에 /sso가 아닌 경로에서 잠깐 마운트되는 경우 방어
  if (!window.location.pathname.endsWith('/sso')) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '8px',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <h2>중기 통합회원 인증 처리 중입니다.</h2>
      <p>잠시만 기다려 주세요.</p>
    </div>
  );
};

export default OnePassSsoCallback;
