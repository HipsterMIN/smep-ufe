import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api as apiClient } from '../../lib/apiClient.js';
import { useAuthStore } from '../../store/useAuthStore.jsx';

const KEYCLOAK_STATE_KEY = 'keycloak_state';
const LOG_PREFIX = '[OnePassSsoCallback]';

const OnePassSsoCallback = () => {
  const navigate = useNavigate();
  const hasHandledRef = useRef(false);

  useEffect(() => {
    // 첫 진입 로그다. 실제 /sso 콜백 진입 여부와 search 존재 여부, 그리고 StrictMode 재실행 여부를 가장 먼저 확인할 때 본다.
    console.log(`${LOG_PREFIX} effect start`, {
      pathname: window.location.pathname,
      hasSearch: Boolean(window.location.search),
      hasHandled: hasHandledRef.current,
    });

    // dev StrictMode 에서는 mount 직후 effect 가 한 번 더 돌 수 있어 callback POST가 중복될 수 있다.
    // state/code 분기 단순화와 별개로, 같은 진입에서 교환 요청을 한 번만 보내기 위한 가드만 유지한다.
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
      mismatchedState: Boolean(state && savedState && state !== savedState),
    };

    // 이 스냅샷 로그는 raw code/state/token 값을 남기지 않고도 분기 원인을 볼 수 있게 만든 메타 로그다.
    // queryKeys, 존재 여부, 길이, state 일치 여부를 보면 "무슨 값이 빠졌는지/어디서 틀어졌는지"를 추적할 수 있다.
    console.log(`${LOG_PREFIX} parsed callback params`, callbackState);


    // warn 레벨을 쓰는 이유는 "실패"라기보다 검증 탈락(branch reject)임을 구분하기 위해서다.
    // 여기선 missingState 와 mismatchedState 를 먼저 보면 된다.
    if (!state || state !== savedState) {
      console.warn(`${LOG_PREFIX} invalid state branch`, {
        ...callbackState,
        action: 'clear-session-state-and-redirect-login',
      });
      window.sessionStorage.removeItem(KEYCLOAK_STATE_KEY);
      console.log(`${LOG_PREFIX} session state removed`, {
        key: KEYCLOAK_STATE_KEY,
      });
      console.log(`${LOG_PREFIX} navigate login`, {
        to: '/service/login',
        reason: 'invalid-state',
      });
      navigate('/service/login', { replace: true });
      return;
    }

    window.sessionStorage.removeItem(KEYCLOAK_STATE_KEY);
    console.log(`${LOG_PREFIX} session state removed`, {
      key: KEYCLOAK_STATE_KEY,
    });
    console.log(`${LOG_PREFIX} callback validation passed`, callbackState);

    // state 검증은 통과했지만 code 자체가 없으면 백엔드가 authorization_code 교환을 할 수 없다.
    // 이 분기는 원본처럼 alert 후 return만 수행한다.
    if (!code) {
      // 이 warn 는 state 는 맞았지만 code 가 비어 있는 비정상 콜백을 분리해서 보기 위한 로그다.
      // codeLength=0 인지와 queryKeys 에 code 자체가 없는지 함께 보면 외부 redirect 형식 문제를 빠르게 볼 수 있다.
      console.warn(`${LOG_PREFIX} missing code branch`, {
        ...callbackState,
        action: 'alert-and-stop',
      });
      alert('코드가 없습니다.');
      return;
    }

    // callback 1단계는 여전히 raw Keycloak token exchange 와 세션 저장이다.
    // 단, 케이스1(로컬 비로그인)에서는 이어서 local-login 브리지와 /account/me 저장 흐름까지 바로 수행한다.
    const exchangeCode = async () => {
      // backend 호출 시작 로그다. 현재 어떤 endpoint 로 code 교환을 시도했는지, code 존재 여부가 맞는지 보는 용도다.
      console.log(`${LOG_PREFIX} exchange start`, {
        endpoint: '/api/v1/auth/keycloak/callback',
        hasCode: callbackState.hasCode,
      });

      try {
        // /api/v1/auth/keycloak/callback 은 현재 smep-be 에서 code 를 Keycloak token endpoint 로 교환하고,
        // raw Keycloak token 응답을 그대로 돌려주면서 HttpSession 에도 keycloak_access_token/keycloak_refresh_token 을 저장한다.
        const response = await apiClient.post('/api/v1/auth/keycloak/callback', { code });
        const callbackData = response?.data || response;
        // 성공 로그는 token 원문을 남기지 않고도 응답 shape 를 확인하기 위한 로그다.
        // responseKeys, hasAccessToken/hasRefreshToken, 길이, expiresIn, tokenType 으로 "교환은 됐는지"만 판단한다.
        console.log(`${LOG_PREFIX} exchange success`, {
          hasResponse: Boolean(response),
          responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
          dataKeys:
            callbackData && typeof callbackData === 'object' ? Object.keys(callbackData) : [],
          hasAccessToken: Boolean(callbackData?.accessToken),
          accessTokenLength: callbackData?.accessToken?.length ?? 0,
          hasRefreshToken: Boolean(callbackData?.refreshToken),
          refreshTokenLength: callbackData?.refreshToken?.length ?? 0,
          expiresIn: callbackData?.expiresIn ?? null,
          tokenType: callbackData?.tokenType ?? null,
        });
        const authState = useAuthStore.getState();
        const hasLocalLogin = Boolean(authState?.isLogin && authState?.token);
        console.log(`${LOG_PREFIX} local login decision`, {
          hasLocalLogin,
          hasStoredToken: Boolean(authState?.token),
        });

        // 케이스2(이미 로컬 로그인된 상태의 연결 플로우)는 아직 별도 구현 범위가 아니다.
        // 따라서 현재 로컬 로그인이 이미 있으면 raw callback 성공만 확인하고 홈으로 복귀한다.
        if (hasLocalLogin) {
          console.log(`${LOG_PREFIX} navigate home`, {
            to: '/',
            reason: 'callback-success-existing-local-login',
          });
          navigate('/', { replace: true });
          return;
        }

        const callbackAccessToken = callbackData?.accessToken;
        console.log(`${LOG_PREFIX} local login bridge start`, {
          endpoint: '/api/v1/auth/keycloak/local-login',
          hasCallbackAccessToken: Boolean(callbackAccessToken),
          callbackAccessTokenLength: callbackAccessToken?.length ?? 0,
        });
        // 케이스1 첫 복귀에서는 callback 직후 세션 handoff가 흔들릴 수 있어, callback 응답의 access token을 body로 직접 넘긴다.
        // 백엔드는 request body token을 우선 사용하고, 없으면 기존 session fallback을 유지한다.
        const localLoginRequestBody = callbackAccessToken
          ? { accessToken: callbackAccessToken }
          : null;
        // local-login 응답도 일반 로그인과 동일하게 GlobalApiResponseAdvice 를 거쳐 data 안에 TokenResponse 가 들어올 수 있다.
        const localLoginResponse = await apiClient.post(
          '/api/v1/auth/keycloak/local-login',
          localLoginRequestBody,
        );
        const localLoginData = localLoginResponse?.data || localLoginResponse;
        console.log(`${LOG_PREFIX} local login bridge success`, {
          responseKeys:
            localLoginResponse && typeof localLoginResponse === 'object'
              ? Object.keys(localLoginResponse)
              : [],
          dataKeys:
            localLoginData && typeof localLoginData === 'object'
              ? Object.keys(localLoginData)
              : [],
          hasAccessToken: Boolean(localLoginData?.accessToken),
          accessTokenLength: localLoginData?.accessToken?.length ?? 0,
          hasRefreshToken: Boolean(localLoginData?.refreshToken),
          refreshTokenLength: localLoginData?.refreshToken?.length ?? 0,
        });

        const accessToken = localLoginData?.accessToken;
        const refreshToken = localLoginData?.refreshToken;
        if (!accessToken || !refreshToken) {
          throw new Error('Local login token response is incomplete');
        }

        console.log(`${LOG_PREFIX} account me start`, {
          endpoint: '/api/v1/account/me',
          hasAccessToken: Boolean(accessToken),
        });
        const profileResponse = await apiClient.get('/api/v1/account/me', { token: accessToken });
        const profile = profileResponse?.data || profileResponse;
        console.log(`${LOG_PREFIX} account me success`, {
          hasProfile: Boolean(profile),
          profileKeys: profile && typeof profile === 'object' ? Object.keys(profile) : [],
        });

        useAuthStore.getState().login({ token: accessToken, refreshToken, profile });
        console.log(`${LOG_PREFIX} auth store login saved`, {
          hasToken: Boolean(useAuthStore.getState().token),
          isLogin: Boolean(useAuthStore.getState().isLogin),
        });
        console.log(`${LOG_PREFIX} navigate home`, {
          to: '/',
          reason: 'case1-local-login-success',
        });
        navigate('/', { replace: true });
      } catch (error) {
        // 이 단계는 raw callback 교환, local-login 브리지, /account/me 저장까지 한 덩어리다.
        // 여기서는 어느 단계에서든 실패하면 현재 케이스1 로컬 로그인 생성은 중단하고 로그인 화면으로 복귀시킨다.
        console.error(`${LOG_PREFIX} exchange failed`, {
          message: error?.message ?? 'unknown-error',
          status: error?.status ?? null,
          hasData: Boolean(error?.data),
        });
        alert('중기원패스 로그인 처리에 실패했습니다. 다시 시도해 주세요.');
        console.log(`${LOG_PREFIX} navigate login`, {
          to: '/service/login',
          reason: 'keycloak-case1-flow-failed',
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
