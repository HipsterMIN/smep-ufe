// src/utils/keycloakGetAuthCode.js

const KEYCLOAK_URL = 'https://www.smes.go.kr/onepass-dev/conversion/step1';
const REALM = 'ucube-qsign';
const CLIENT_ID = 'smes-tipa-01';
const REDIRECT_URI = 'https://www.smes-tipa.go.kr/home-dev/sso'; // 우리 사이트 콜백 주소

/**
 * 로그인 성공 후 호출
 * → Keycloak Authorization 페이지로 Redirect
 */
export function keycloakGetAuthCode() {
  // CSRF 방지용 state 값 생성 및 저장
  const state = crypto.randomUUID();
  sessionStorage.setItem('keycloak_state', state);

//  const params = new URLSearchParams({
//    client_id: CLIENT_ID,
//    redirect_uri: REDIRECT_URI,
//    response_type: 'code',
//    scope: 'openid',
//    state: state,
//  });
const params = new URLSearchParams({
    redirect_uri: REDIRECT_URI
  });

  //const authUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?${params}`;
  const authUrl = `${KEYCLOAK_URL}?${params}`;

  console.log('authUrl : ', authUrl);

  window.location.href = authUrl;
}
