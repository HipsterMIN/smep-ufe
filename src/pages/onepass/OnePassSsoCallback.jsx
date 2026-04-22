import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api as apiClient } from '../../lib/apiClient.js';

const KEYCLOAK_STATE_KEY = 'keycloak_state';
const LOG_PREFIX = '[OnePassSsoCallback]';

const OnePassSsoCallback = () => {
  const navigate = useNavigate();
  const hasHandledRef = useRef(false);

  useEffect(() => {
    console.log(`${LOG_PREFIX} effect start`, {
      pathname: window.location.pathname,
      hasSearch: Boolean(window.location.search),
      hasHandled: hasHandledRef.current,
    });

    if (hasHandledRef.current) {
      console.log(`${LOG_PREFIX} duplicate effect blocked`, {
        reason: 'strict-mode-or-remount',
      });
      return;
    }

    hasHandledRef.current = true;
    console.log(`${LOG_PREFIX} mark handled`, {
      hasHandled: hasHandledRef.current,
    });

    // code/state 는 원패스/Keycloak 이 redirect_uri(/home-dev/sso)로 돌려보낼 때 query string 으로 붙여 준다.
    // savedState 는 onePassJoin()/onePassGetAuthCode()가 외부 인증으로 보내기 직전에 sessionStorage 에 저장한 비교 기준이다.
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const savedState = window.sessionStorage.getItem(KEYCLOAK_STATE_KEY);
    const callbackState = {
      queryKeys: Array.from(params.keys()),
      hasCode: Boolean(code),
      codeLength: code?.length ?? 0,
      hasState: Boolean(state),
      stateLength: state?.length ?? 0,
      hasSavedState: Boolean(savedState),
      savedStateLength: savedState?.length ?? 0,
      stateMatches: Boolean(state && savedState && state === savedState),
      missingState: !state,
      missingSavedState: !savedState,
      mismatchedState: Boolean(state && savedState && state !== savedState),
    };

    console.log(`${LOG_PREFIX} parsed callback params`, callbackState);

    // state 가 없거나, 저장해 둔 keycloak_state 와 다르면 우리 프런트가 시작한 인증 왕복이 아니다.
    // 이 분기는 잘못된 진입/오래된 콜백/외부에서 직접 붙인 URL 을 막기 위한 최소 검증이라 즉시 로그인 화면으로 되돌린다.
    if (!state || !savedState || state !== savedState) {
      console.warn(`${LOG_PREFIX} invalid state branch`, {
        ...callbackState,
        action: 'clear-session-state-and-redirect-login',
      });
      window.sessionStorage.removeItem(KEYCLOAK_STATE_KEY);
      console.log(`${LOG_PREFIX} session state removed`, {
        key: KEYCLOAK_STATE_KEY,
      });
      alert('원패스 인증 요청이 올바르지 않습니다. 다시 시도해 주세요.');
      console.log(`${LOG_PREFIX} navigate login`, {
        to: '/service/login',
        reason: 'invalid-state',
      });
      navigate('/service/login', { replace: true });
      return;
    }

    // state 검증은 통과했지만 code 자체가 없으면 백엔드가 authorization_code 교환을 할 수 없다.
    // 이 경우도 재시도 외에는 복구 방법이 없으므로 비교용 state 를 정리하고 로그인 화면으로 돌려보낸다.
    if (!code) {
      console.warn(`${LOG_PREFIX} missing code branch`, {
        ...callbackState,
        action: 'clear-session-state-and-redirect-login',
      });
      window.sessionStorage.removeItem(KEYCLOAK_STATE_KEY);
      console.log(`${LOG_PREFIX} session state removed`, {
        key: KEYCLOAK_STATE_KEY,
      });
      alert('원패스 인증 코드가 없습니다. 다시 시도해 주세요.');
      console.log(`${LOG_PREFIX} navigate login`, {
        to: '/service/login',
        reason: 'missing-code',
      });
      navigate('/service/login', { replace: true });
      return;
    }

    // state 비교가 끝난 뒤에는 재사용 여지를 없애기 위해 sessionStorage 의 keycloak_state 를 즉시 지운다.
    // 이후 성공/실패 여부와 무관하게 같은 state 로 콜백을 다시 처리하지 않게 만드는 단계다.
    window.sessionStorage.removeItem(KEYCLOAK_STATE_KEY);
    console.log(`${LOG_PREFIX} callback validation passed`, callbackState);
    console.log(`${LOG_PREFIX} session state removed`, {
      key: KEYCLOAK_STATE_KEY,
    });

    // StrictMode 에서 effect 가 두 번 실행되더라도 callback 교환이 한 번만 일어나도록 막는다.
    // 이번 1차는 원본 의도대로 code 를 백엔드에 넘겨 raw Keycloak token 교환 성공만 확인하고 홈으로 이동한다.
    // 내부 SMEP 로그인/authStore 저장은 아직 후속 정책 미정이라 여기서 수행하지 않는다.
    const exchangeCode = async () => {
      console.log(`${LOG_PREFIX} exchange start`, {
        endpoint: '/api/v1/auth/keycloak/callback',
        hasCode: callbackState.hasCode,
      });

      try {
        // /api/v1/auth/keycloak/callback 은 현재 smep-be 에서 code 를 Keycloak token endpoint 로 교환하고,
        // raw Keycloak token 응답을 그대로 돌려주면서 HttpSession 에도 keycloak_access_token/keycloak_refresh_token 을 저장한다.
        const response = await apiClient.post('/api/v1/auth/keycloak/callback', { code });
        console.log(`${LOG_PREFIX} exchange success`, {
          hasResponse: Boolean(response),
          responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
          hasAccessToken: Boolean(response?.accessToken),
          accessTokenLength: response?.accessToken?.length ?? 0,
          hasRefreshToken: Boolean(response?.refreshToken),
          refreshTokenLength: response?.refreshToken?.length ?? 0,
          expiresIn: response?.expiresIn ?? null,
          tokenType: response?.tokenType ?? null,
        });
        console.log(`${LOG_PREFIX} navigate home`, {
          to: '/',
          reason: 'callback-success',
        });
        navigate('/', { replace: true });
      } catch (error) {
        // 이 단계의 실패는 code 교환 자체가 실패했다는 뜻이므로, 현재 프런트는 사용자 세션을 만들지 않고 로그인 화면으로 복귀시킨다.
        console.error(`${LOG_PREFIX} exchange failed`, {
          message: error?.message ?? 'unknown-error',
          status: error?.status ?? null,
          hasData: Boolean(error?.data),
        });
        alert('원패스 SSO 로그인에 실패했습니다. 다시 시도해 주세요.');
        console.log(`${LOG_PREFIX} navigate login`, {
          to: '/service/login',
          reason: 'callback-api-failed',
        });
        navigate('/service/login', { replace: true });
      }
    };

    console.log(`${LOG_PREFIX} invoke exchangeCode`);
    exchangeCode();
  }, [navigate]);

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
      <h2>중기원패스 인증 처리 중입니다.</h2>
      <p>잠시만 기다려 주세요.</p>
    </div>
  );
};

export default OnePassSsoCallback;
