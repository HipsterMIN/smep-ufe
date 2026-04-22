import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api as apiClient } from '../../lib/apiClient.js';

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
    console.warn(`${LOG_PREFIX} invalid state branch`, {
    ...callbackState,
    action: 'clear-session-state-and-redirect-login',
    });
    console.log(`${LOG_PREFIX} session state removed`, {
    key: KEYCLOAK_STATE_KEY,
    });
    console.log(`${LOG_PREFIX} navigate login`, {
    to: '/service/login',
    reason: 'invalid-state',
    });
    navigate('/service/login', { replace: true });

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

    // 이번 1차는 원본 의도대로 code 를 백엔드에 넘겨 raw Keycloak token 교환 성공만 확인하고 홈으로 이동한다.
    // 내부 SMEP 로그인/authStore 저장은 아직 후속 정책 미정이라 여기서 수행하지 않는다.
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
        // 성공 로그는 token 원문을 남기지 않고도 응답 shape 를 확인하기 위한 로그다.
        // responseKeys, hasAccessToken/hasRefreshToken, 길이, expiresIn, tokenType 으로 "교환은 됐는지"만 판단한다.
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
        // 여기서는 message/status/hasData 를 보면 네트워크 실패인지, 백엔드 4xx/5xx 인지, 본문이 실려왔는지 구분할 수 있다.
        console.error(`${LOG_PREFIX} exchange failed`, {
          message: error?.message ?? 'unknown-error',
          status: error?.status ?? null,
          hasData: Boolean(error?.data),
        });
        alert('api/v1/auth/keycloak/callback 호출에 실패했습니다. 다시 시도해 주세요.');
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
