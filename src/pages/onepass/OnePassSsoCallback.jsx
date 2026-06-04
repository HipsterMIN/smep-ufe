import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api as apiClient } from '../../lib/apiClient.js';
import { useAuthStore } from '../../store/useAuthStore.jsx';
import { buildOnePassConversionUrl } from '../../utils/keycloakGetAuthCode.js';

// 임시 연동 계약: 외부 출발 콜백 대응을 위해 프론트 state 검증을 비활성화한다.
// const KEYCLOAK_STATE_KEY = 'keycloak_state';
const LOG_PREFIX = '[OnePassSsoCallback]';

// [라우터 remount 중복 실행 방지 — 모듈 레벨 플래그]
//
// useRef는 컴포넌트 인스턴스 단위로 초기화되므로 라우터 교체(setRouterInstance)로
// 컴포넌트가 리마운트될 때 false로 리셋된다.
// 모듈 레벨 변수는 페이지 세션 동안 유지되므로 remount에도 중복 실행을 막을 수 있다.
//
// 현재 처리 중인 SSO URL(pathname + search)을 저장한다.
// OAuth2 Authorization Code는 1회용이므로 동일 URL 재처리는 반드시 차단해야 한다.
// 새 SSO 시도는 항상 새로운 code 파라미터를 포함하므로 URL이 달라져 정상 진입된다.
let _handledSsoUrl = null;

const OnePassSsoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 라우터 인스턴스 교체(메뉴 로드 후 setRouterInstance) 시 /sso가 아닌 경로에서 잘못 마운트되는 것을 방어한다.
    // 실제 /sso 경로가 아니면 SSO 처리를 하지 않는다.
    const currentPathname = window.location.pathname;
    if (!currentPathname.endsWith('/sso')) {
      console.log(`${LOG_PREFIX} not on /sso path, skipping`, { pathname: currentPathname });
      return;
    }

    // [모듈 레벨 중복 실행 방지]
    // 라우터 교체로 인한 remount 또는 StrictMode 재실행 시 동일 URL을 재처리하지 않는다.
    const currentUrl = currentPathname + window.location.search;
    if (_handledSsoUrl === currentUrl) {
      console.log(`${LOG_PREFIX} duplicate blocked (remount or strict-mode)`, {
        url: currentUrl,
      });
      return;
    }
    _handledSsoUrl = currentUrl;

    // 첫 진입 로그다. 실제 /sso 콜백 진입 여부와 search 존재 여부를 가장 먼저 확인할 때 본다.
    console.log(`${LOG_PREFIX} effect start`, {
      pathname: window.location.pathname,
      hasSearch: Boolean(window.location.search),
      handledUrl: _handledSsoUrl,
    });

    // 임시 연동 계약: 현재 프론트는 state/sessionStorage 검증 없이 code 존재 여부만 확인한다.
    // code/state 는 원패스/Keycloak 이 환경별 redirect_uri의 /sso 콜백으로 돌려보낼 때 query string 으로 붙여 준다.
    // savedState 는 onePassJoin()/onePassGetAuthCode()가 외부 인증으로 보내기 직전에 sessionStorage 에 저장한 비교 기준이다.
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    console.log('IN /sso    code='+ code);

    // state 파라미터를 수신하는지 로그로 관찰한다 (검증 재활성화 여부 판단 근거).
    // OnePass SDK가 콜백에 state를 포함하는지 확인 후 검증 재활성화 여부를 결정한다.
    // hasState=true 가 확인되면 검증 재활성화 PR을 별도로 진행한다.
    const state = params.get('state');
    const callbackState = {
      queryKeys: Array.from(params.keys()),
      hasCode: Boolean(code),
      codeLength: code?.length ?? 0,
      stateValidationBypassed: true,
      // OnePass 콜백에 state 파라미터가 포함되는지 관찰용
      hasState: Boolean(state),
      stateLength: state?.length ?? 0,
    };

    // 이 스냅샷 로그는 raw code/token 값을 남기지 않고도 분기 원인을 볼 수 있게 만든 메타 로그다.
    // queryKeys, code 존재 여부, 길이를 보면 외부 redirect 형식 문제를 추적할 수 있다.
    console.log(`${LOG_PREFIX} parsed callback params`, callbackState);


    /*
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
    */

    // window.sessionStorage.removeItem(KEYCLOAK_STATE_KEY);
    // console.log(`${LOG_PREFIX} session state removed`, {
    //   key: KEYCLOAK_STATE_KEY,
    // });
    console.log(`${LOG_PREFIX} callback code check start`, callbackState);

    // state 검증은 임시 비활성화되어 있으며, code 자체가 없으면 백엔드가 authorization_code 교환을 할 수 없다.
    // code 가 없는 비정상 콜백은 즉시 로그인 페이지로 이동해 불필요한 서버 요청을 방지한다.
    if (!code) {
      // useEffect 내부에서는 훅(useAuthStore)을 직접 호출할 수 없다 (Rules of Hooks 위반).
      // getState()를 사용해 현재 스토어 상태를 동기적으로 읽는다.
      const isSsoLogin = useAuthStore.getState().isSsoLogin;
      console.log(`${LOG_PREFIX} missing code branch`, {
        ...callbackState,
        isSsoLogin,
        action: isSsoLogin ? 'navigate-home' : 'navigate-login',
      });

      if (isSsoLogin) {
        // SSO 로그인이 이미 완료된 상태에서 code 없이 /sso에 재진입 → 메인으로
        navigate('/', { replace: true });
      } else {
        navigate('/service/login', { replace: true });
      }
      return;
    }

    // callback 처리의 핵심은 "현재 로컬 로그인 상태가 있느냐"에 따라 백엔드 경로를 나누는 것이다.
    // 케이스1(로컬 비로그인)은 callback/local-login one-shot endpoint가 code 교환과 local token 발급을 한 번에 끝내고,
    // 케이스2(이미 로컬 로그인됨)는 기존 raw callback endpoint만 확인한 뒤 홈으로 복귀한다.
    const exchangeCode = async () => {
      const authState = useAuthStore.getState();
      const hasLocalLogin = Boolean(authState?.isLogin && authState?.token);
      const callbackEndpoint = hasLocalLogin
        ? '/api/v1/auth/keycloak/callback'
        : '/api/v1/auth/keycloak/callback/local-login';
      // backend 호출 시작 로그다. 현재 어떤 endpoint 로 code 교환을 시도했는지, code 존재 여부가 맞는지 보는 용도다.
      console.log(`${LOG_PREFIX} exchange start`, {
        endpoint: callbackEndpoint,
        hasCode: callbackState.hasCode,
      });

      try {
        console.log('IN /sso  2  code='+ code);

        const response = await apiClient.post(callbackEndpoint, { code });
        const responseData = response?.data || response;
        // 성공 로그는 token 원문을 남기지 않고도 응답 shape 를 확인하기 위한 로그다.
        // 케이스1은 local token 응답, 케이스2는 raw Keycloak token 응답이므로 endpoint와 키 목록을 함께 본다.
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

        const accessToken = responseData?.accessToken;
        const refreshToken = responseData?.refreshToken;
        // kcIdToken: SSO callback 응답에서 수신한 Keycloak id_token.
        // sessionStorage(Zustand persist)에 보관하고 로그아웃 시 서버에 전달한다.
        // 서버는 HttpSession에 id_token을 저장하지 않으므로(STATELESS) FE가 보관 책임을 갖는다.
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

        useAuthStore.getState().ssoLogin({ token: accessToken, refreshToken, kcIdToken, profile });
        //useAuthStore.getState().login({ token: accessToken, refreshToken, profile });

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

        // 404: Q-Sign UUID와 연결된 로컬 회원이 없음 → OnePass 전환(연동) 페이지로 이동
        // 이 케이스는 기술적 오류가 아니라 아직 통합 전환을 완료하지 않은 사용자이다.
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
        // 실패 시 플래그 해제: 사용자가 재시도하면 동일 URL로 돌아올 수 있으므로
        _handledSsoUrl = null;
        navigate('/service/login', { replace: true });
      }
    };

    console.log(`${LOG_PREFIX} invoke exchangeCode`);
    exchangeCode();
  }, [navigate]);









  
  // 라우터 교체(setRouterInstance) 타이밍에 따라 /sso가 아닌 경로에서 잠깐 마운트될 수 있다.
  // useEffect 가드는 SSO 로직 중복 실행을 막지만, JSX는 항상 반환하므로 로딩 화면이 남아버린다.
  // 경로가 /sso가 아니면 null을 반환하여 로딩 화면이 표시되지 않도록 한다.
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
