import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore.jsx';

const LOG_PREFIX = '[OnePassSsoLogout]';

const OnePassSsoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 외부 OnePass logout 복귀 시점에도 로컬 상태를 한 번 더 비워 stale 세션을 남기지 않는다.
    console.log(`${LOG_PREFIX} effect start`, {
      pathname: window.location.pathname,
      hasSearch: Boolean(window.location.search),
    });

    window.sessionStorage.removeItem('keycloak_state');

    useAuthStore.getState().logout();
    
    console.log(`${LOG_PREFIX} local logout completed`, {
      isLogin: Boolean(useAuthStore.getState().isLogin),
    });
    console.log(`${LOG_PREFIX} navigate home`, {
      to: '/',
      reason: 'onepass-logout-callback-complete',
    });

    navigate('/', { replace: true });
    
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
