// src/utils/keycloakGetAuthCode.js
import { useAuthStore } from '../store/useAuthStore.jsx';
import { decodeJwtPayload } from './commonUtils.js';

const KEYCLOAK_URL = 'https://www.smes.go.kr/isso-dev/qsign';
const KEYCLOAK_JOIN = 'https://www.smes.go.kr/onepass-dev/conversion/step1';
const REALM = 'ucube-qsign';
const CLIENT_ID = 'smes-tipa-01';
const REDIRECT_SSO_URI = 'https://www.smes.go.kr/home-dev/sso'; // 우리 사이트 SSO 콜백 주소 (로그인)
const REDIRECT_HOME_URI = 'https://www.smes.go.kr/home-dev/'; // 우리 사이트 메인 주소 (가입유도팝업)

const resolveCurrentLoginId = () => {
  const authToken = useAuthStore.getState().token;
  const tokenPayload = decodeJwtPayload(authToken);
  return String(tokenPayload?.login_id ?? '').trim();
};

// 로그인후 원패스 가입 유도시
export function onePassJoin() {
  // 가입 유도 플로우는 현재 우리 사이트에 로그인된 회원만 타므로,
  // 상대가 요구하는 mbrId 는 현재 로컬 access token 의 login_id claim 에서 꺼낸다.
  const loginId = resolveCurrentLoginId();
  if (!loginId) {
    window.alert('로그인 아이디를 확인할 수 없습니다.');
    return;
  }

  // CSRF 방지용 state 값 생성 및 저장
  const state = crypto.randomUUID();
  sessionStorage.setItem('keycloak_state', state);

  // 가입 유도 플로우도 /sso callback에서 같은 state를 다시 받아 비교해야 한다.
  // 상대가 요구하는 회원 로그인ID는 mbrId로 같이 전달하되, callback 검증을 위해 state는 계속 유지한다.
  let params = new URLSearchParams({
    redirect_uri: REDIRECT_HOME_URI,
    mbrId: loginId,
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
    redirect_uri: REDIRECT_SSO_URI,
    response_type: 'code',
    scope: 'openid',
    state: state,
  });

  let authUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?${params}`;
  console.log('authUrl : ', authUrl);
  window.location.href = authUrl;
}

