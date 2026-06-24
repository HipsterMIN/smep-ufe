import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore.jsx';

const LOG_PREFIX = '[OnePassSsoLogout]';

const OnePassSsoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 외부 OnePass logout 복귀 시점에도 로컬 상태를 한 번 더 비워 stale 세션을 남기지 않는다.

    useAuthStore.getState().logout();

    // Keycloak 로그아웃 후 특정 페이지로 복귀해야 하는 경우 처리.
    // 예: 증명서 발급 화면에서 비기업회원이 로그아웃 요청 → /service/login(기업회원)으로 복귀.
    // post_logout_redirect_uri는 BE 설정 고정값(/sso-logout)이므로 FE에서 직접 지정 불가.
    // 로그아웃 출발지에서 sessionStorage에 의도를 저장하고 여기서 읽어 분기한다.
    const redirectRaw = sessionStorage.getItem('post_logout_redirect');
    sessionStorage.removeItem('post_logout_redirect');

    let redirectPath = '/';
    let redirectState = undefined;
    if (redirectRaw) {
      try {
        const { path, state } = JSON.parse(redirectRaw);
        redirectPath = path || '/';
        redirectState = state;
      } catch {
        return null;
      }
    }

    navigate(redirectPath, { state: redirectState, replace: true });
    
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
      <h2>중기 통합회원 로그아웃 처리 중입니다.</h2>
      <p>잠시만 기다려 주세요.</p>
    </div>
  );
};

export default OnePassSsoLogout;
