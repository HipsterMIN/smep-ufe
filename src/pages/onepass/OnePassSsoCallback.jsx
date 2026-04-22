import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api as apiClient } from '../../lib/apiClient.js';

const KEYCLOAK_STATE_KEY = 'keycloak_state';

const OnePassSsoCallback = () => {
  const navigate = useNavigate();
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) {
      return;
    }

    hasHandledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const savedState = window.sessionStorage.getItem(KEYCLOAK_STATE_KEY);

    if (!state || !savedState || state !== savedState) {
      window.sessionStorage.removeItem(KEYCLOAK_STATE_KEY);
      alert('원패스 인증 요청이 올바르지 않습니다. 다시 시도해 주세요.');
      navigate('/service/login', { replace: true });
      return;
    }

    if (!code) {
      window.sessionStorage.removeItem(KEYCLOAK_STATE_KEY);
      alert('원패스 인증 코드가 없습니다. 다시 시도해 주세요.');
      navigate('/service/login', { replace: true });
      return;
    }

    window.sessionStorage.removeItem(KEYCLOAK_STATE_KEY);

    // StrictMode 에서 effect 가 두 번 실행되더라도 callback 교환이 한 번만 일어나도록 막는다.
    // 이번 1차는 원본 의도대로 code 교환 성공만 확인하고 홈으로 이동한다.
    const exchangeCode = async () => {
      try {
        await apiClient.post('/api/v1/auth/keycloak/callback', { code });
        navigate('/', { replace: true });
      } catch (error) {
        console.error('OnePass SSO callback failed:', error);
        alert('원패스 SSO 로그인에 실패했습니다. 다시 시도해 주세요.');
        navigate('/service/login', { replace: true });
      }
    };

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
