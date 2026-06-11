import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api as apiClient } from '../../lib/apiClient.js';
import { useAuthStore } from '../../store/useAuthStore.jsx';
import { buildOnePassConversionUrl } from '../../utils/keycloakGetAuthCode.js';
import {
  finishSilentSso,
  getSilentSsoReturnUrl,
  isSilentSsoInProgress,
} from '../../utils/onepassSilentSso.js';

// 임시 연동 계약: 외부 출발 콜백 대응을 위해 프론트 state 검증을 비활성화한다.
const LOG_PREFIX = '[OnePassSsoCallback]';

// iframe 내에서 실행 중이면 true (silent SSO 백그라운드 흐름)
const isInIframe = (() => { try { return window.self !== window.top; } catch { return false; } })();

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

/**
 * iframe silent SSO 결과를 부모 윈도우로 전달한다.
 * 부모(TokenRefreshInitializer)의 onMessage 핸들러가 수신 후 ssoLogin()을 호출한다.
 */
const notifyParent = (data) => {
  window.parent.postMessage({ type: 'SILENT_SSO_RESULT', ...data }, window.location.origin);
};

// [라우터 remount 중복 실행 방지 — 모듈 레벨 플래그]
//
// useRef는 컴포넌트 인스턴스 단위로 초기화되므로 라우터 교체(setRouterInstance)로
// 컴포넌트가 리마운트될 때 false로 리셋된다.
// 모듈 레벨 변수는 페이지 세션 동안 유지되므로 remount에도 중복 실행을 막을 수 있다.
let _handledSsoUrl = null;

const OnePassSsoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentPathname = window.location.pathname;
    if (!currentPathname.endsWith('/sso')) {
      console.log(`${LOG_PREFIX} not on /sso path, skipping`, { pathname: currentPathname });
      return;
    }

    const currentUrl = currentPathname + window.location.search;
    if (_handledSsoUrl === currentUrl) {
      console.log(`${LOG_PREFIX} duplicate blocked (remount or strict-mode)`, { url: currentUrl });
      return;
    }
    _handledSsoUrl = currentUrl;

    console.log(`${LOG_PREFIX} effect start`, {
      pathname: window.location.pathname,
      hasSearch: Boolean(window.location.search),
      isInIframe,
      handledUrl: _handledSsoUrl,
    });

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const callbackError = params.get('error');
    const callbackErrorDescription = params.get('error_description');

    // iframe 내 실행이면 항상 silent flow (부모가 iframe으로 시작한 것이므로)
    const isSilentFlow = isInIframe || isSilentSsoInProgress();

    console.log('IN /sso    code='+ code);

    const callbackState = {
      queryKeys: Array.from(params.keys()),
      hasCode: Boolean(code),
      codeLength: code?.length ?? 0,
      stateValidationBypassed: true,
      hasState: Boolean(state),
      stateLength: state?.length ?? 0,
      callbackError: callbackError || null,
      callbackErrorDescription: callbackErrorDescription || null,
      isSilentFlow,
      isInIframe,
    };

    console.log(`${LOG_PREFIX} parsed callback params`, callbackState);
    console.log(`${LOG_PREFIX} callback code check start`, callbackState);

    // SSO 프로바이더가 login_required(미인증) 반환 — 로그인 없이 원래 페이지로 복귀
    if (isSilentFlow && callbackError === 'login_required') {
      console.log(`${LOG_PREFIX} silent login skipped (login_required)`);
      if (isInIframe) {
        notifyParent({ success: false, reason: 'login_required' });
        return;
      }
      const returnUrl = getSilentSsoReturnUrl() || '/';
      finishSilentSso();
      navigate(returnUrl, { replace: true });
      return;
    }

    if (!code) {
      const isSsoLogin = useAuthStore.getState().isSsoLogin;
      console.log(`${LOG_PREFIX} missing code branch`, {
        ...callbackState,
        isSsoLogin,
        action: isSsoLogin ? 'navigate-home' : 'navigate-login',
      });

      if (isSsoLogin) {
        if (isInIframe) {
          // 이미 로그인 상태 — 부모에 알릴 필요 없이 조용히 종료
          notifyParent({ success: false, reason: 'already_logged_in' });
          return;
        }
        navigate('/', { replace: true });
      } else {
        if (isSilentFlow) {
          console.log(`${LOG_PREFIX} silent login skipped (missing code)`);
          if (isInIframe) {
            notifyParent({ success: false, reason: 'missing_code' });
            return;
          }
          const returnUrl = getSilentSsoReturnUrl() || '/';
          finishSilentSso();
          navigate(returnUrl, { replace: true });
          return;
        }
        navigate('/service/login', { replace: true });
      }
      return;
    }

    const exchangeCode = async () => {
      const authState = useAuthStore.getState();
      const hasLocalLogin = Boolean(authState?.isLogin && authState?.token);
      const callbackEndpoint = hasLocalLogin
        ? '/api/v1/auth/keycloak/callback'
        : '/api/v1/auth/keycloak/callback/local-login';

      console.log(`${LOG_PREFIX} exchange start`, {
        endpoint: callbackEndpoint,
        hasCode: callbackState.hasCode,
      });

      try {
        console.log('IN /sso  2  code='+ code);

        const requestBody =
          callbackEndpoint === '/api/v1/auth/keycloak/callback/local-login'
            ? { code, ...(state !== null ? { state } : {}) }
            : { code };
        const response = await apiClient.post(callbackEndpoint, requestBody);
        const responseData = response?.data || response;

        console.log(`${LOG_PREFIX} exchange success`, {
          hasResponse: Boolean(response),
          endpoint: callbackEndpoint,
          responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
          dataKeys:
            responseData && typeof responseData === 'object' ? Object.keys(responseData) : [],
          hasAccessToken: Boolean(responseData?.accessToken || responseData?.access_token),
          accessTokenLength: (responseData?.accessToken || responseData?.access_token)?.length ?? 0,
          hasRefreshToken: Boolean(responseData?.refreshToken || responseData?.refresh_token),
          refreshTokenLength: (responseData?.refreshToken || responseData?.refresh_token)?.length ?? 0,
          expiresIn: responseData?.expiresIn ?? responseData?.expires_in ?? null,
          tokenType: responseData?.tokenType ?? responseData?.token_type ?? null,
        });
        console.log(`${LOG_PREFIX} local login decision`, {
          hasLocalLogin,
          hasStoredToken: Boolean(authState?.token),
        });

        if (hasLocalLogin) {
          console.log(`${LOG_PREFIX} navigate home`, {
            to: '/',
            reason: 'callback-success-existing-local-login',
          });
          if (isInIframe) {
            notifyParent({ success: false, reason: 'already_logged_in' });
            return;
          }
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

        console.log(`${LOG_PREFIX} account me start`, {
          endpoint: '/api/v1/account/me',
          hasAccessToken: Boolean(accessToken),
          hasKcIdToken: Boolean(kcIdToken),
        });
        const profileResponse = await apiClient.get('/api/v1/account/me', { token: accessToken });
        const profile = profileResponse?.data || profileResponse;
        console.log(`${LOG_PREFIX} account me success`, {
          hasProfile: Boolean(profile),
          profileKeys: profile && typeof profile === 'object' ? Object.keys(profile) : [],
        });

        // iframe 흐름: 토큰과 프로필을 부모로 전달, 부모가 ssoLogin() 호출
        if (isInIframe) {
          console.log(`${LOG_PREFIX} silent SSO complete — notifying parent`);
          notifyParent({ success: true, accessToken, refreshToken, kcIdToken, profile });
          return;
        }

        // 일반 흐름: 직접 ssoLogin() 호출 후 페이지 이동
        useAuthStore.getState().ssoLogin({ token: accessToken, refreshToken, kcIdToken, profile });

        console.log(`${LOG_PREFIX} auth store login saved`, {
          hasToken: Boolean(useAuthStore.getState().token),
          isLogin: Boolean(useAuthStore.getState().isLogin),
        });

        const returnUrl = isSilentFlow ? (getSilentSsoReturnUrl() || '/') : '/';
        if (isSilentFlow) finishSilentSso();
        console.log(`${LOG_PREFIX} navigate home`, {
          to: returnUrl,
          reason: 'case1-local-login-success',
        });
        navigate(returnUrl, { replace: true });
      } catch (error) {
        console.error(`${LOG_PREFIX} exchange failed`, {
          message: error?.message ?? 'unknown-error',
          status: error?.status ?? null,
          hasData: Boolean(error?.data),
        });

        if (isSilentFlow && isLoginRequiredError(error)) {
          console.log(`${LOG_PREFIX} silent login skipped (backend login_required)`);
          if (isInIframe) {
            notifyParent({ success: false, reason: 'login_required' });
            return;
          }
          const returnUrl = getSilentSsoReturnUrl() || '/';
          finishSilentSso();
          navigate(returnUrl, { replace: true });
          return;
        }

        if (isSilentFlow) {
          console.log(`${LOG_PREFIX} silent login skipped (non-fatal failure)`, {
            status: error?.status ?? null,
          });
          if (isInIframe) {
            notifyParent({ success: false, reason: 'error' });
            return;
          }
          const returnUrl = getSilentSsoReturnUrl() || '/';
          finishSilentSso();
          navigate(returnUrl, { replace: true });
          return;
        }

        // 404: Q-Sign UUID와 연결된 로컬 회원이 없음 → OnePass 전환(연동) 페이지로 이동
        if (error?.status === 404) {
          console.log(`${LOG_PREFIX} navigate conversion`, {
            to: 'onepass-conversion',
            reason: 'local-member-not-linked-to-keycloak-uuid',
          });
          window.location.href = buildOnePassConversionUrl();
          return;
        }

        alert('중기 통합회원 로그인 처리에 실패했습니다. 다시 시도해 주세요.');
        console.log(`${LOG_PREFIX} navigate login`, {
          to: '/service/login',
          reason: 'keycloak-case1-flow-failed',
        });
        _handledSsoUrl = null;
        navigate('/service/login', { replace: true });
      }
    };

    console.log(`${LOG_PREFIX} invoke exchangeCode`);
    exchangeCode();
  }, [navigate]);

  // iframe 내에서는 UI 없이 동작 (부모 화면에 영향 없음)
  if (isInIframe) return null;

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
