// src/utils/keycloakGetAuthCode.js

const KEYCLOAK_URL = 'https://www.smes.go.kr/isso-dev/qsign';
const KEYCLOAK_JOIN = 'https://www.smes.go.kr/onepass-dev/conversion/step1';
const REALM = 'ucube-qsign';
const CLIENT_ID = 'smes-tipa-01';
const REDIRECT_URI = 'https://www.smes-tipa.go.kr/home-dev/sso'; // 우리 사이트 콜백 주소

// 로그인후 원패스 가입 유도시
export function onePassJoin() {
  // CSRF 방지용 state 값 생성 및 저장
  const state = crypto.randomUUID();
  sessionStorage.setItem('keycloak_state', state);

  let params = new URLSearchParams({
    redirect_uri: REDIRECT_URI
  });

  let authUrl = `${KEYCLOAK_JOIN}?${params}`;

  console.log('joinUrl : ', authUrl);

  window.location.href = authUrl;
}

// 비로그인/로그인 상시표기
export function onePassGetAuthCode() {
  // CSRF 방지용 state 값 생성 및 저장
  const state = crypto.randomUUID();
  sessionStorage.setItem('keycloak_state', state);

  let params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid',
    state: state,
  });

  let authUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?${params}`;

  window.location.href = authUrl;
}



