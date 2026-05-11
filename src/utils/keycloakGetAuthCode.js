// src/utils/keycloakGetAuthCode.js
import { useAuthStore } from '../store/useAuthStore.jsx';

const KEYCLOAK_URL = 'https://isso-dev.smes.go.kr/qsign';
const KEYCLOAK_JOIN = 'https://onepass-dev.smes.go.kr/conversion/step1';
const ONEPASS_JOIN = 'https://onepass-dev.smes.go.kr/register/step1?type=member&return_client=smes-tipa-01';
const REALM = 'ucube-qsign';
const CLIENT_ID = 'smes-tipa-01';
const REDIRECT_SSO_URI = 'https://www.smes.go.kr/home-dev/sso'; // 우리 사이트 SSO 콜백 주소 (로그인)
const REDIRECT_HOME_URI = 'https://www.smes.go.kr/home-dev/'; // 우리 사이트 메인 주소 (가입유도팝업)

const resolveOnePassJoinMemberId = () => {
  const { user } = useAuthStore.getState();
  return String(user?.loginId || user?.id || '').trim();
};


const { currentMode } = useAuthStore();

// 로그인후 원패스 가입 유도시
export function onePassJoin() {
  // 가입 유도 플로우는 현재 우리 사이트에 로그인된 회원만 타므로,
  // 상대가 요구하는 mbrId 는 로그인 ID를 우선 전달하고, 없을 때만 기존 mbr_no로 폴백한다.
  const memberId = resolveOnePassJoinMemberId();
  if (!memberId) {
    window.alert('회원 식별값을 확인할 수 없습니다.');
    return;
  }

  // 임시 연동 계약: /sso 콜백에서 state를 검증하지 않으므로 keycloak_state를 저장하지 않는다.
  // CSRF 방지용 state 값 생성 및 저장
  // const state = crypto.randomUUID();
  // sessionStorage.setItem('keycloak_state', state);

  // 기존 계약에서는 가입 유도 플로우도 /sso callback에서 같은 state를 다시 받아 비교했다.
  // 현재는 상대가 요구하는 SP 회원 식별값만 mbrId로 전달하고 state 검증은 사용하지 않는다.
  let params = new URLSearchParams({
    redirect_uri: REDIRECT_HOME_URI,
    mbrId: memberId,
    return_client: CLIENT_ID
  });

  let authUrl = `${KEYCLOAK_JOIN}?${params}`;

  console.log('joinUrl : ', authUrl);
  window.location.href = authUrl;
}

// 비로그인/로그인 상시표기
export function onePassGetAuthCode() {
  // 임시 연동 계약: 외부 출발 콜백과 맞추기 위해 state 저장과 auth URL state 전달을 중단한다.
  // CSRF 방지용 state 값 생성 및 저장
  // const state = crypto.randomUUID();
  // sessionStorage.setItem('keycloak_state', state);

  let params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_SSO_URI,
    response_type: 'code',
    scope: 'openid',
    // state: state,
  });

  let authUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?${params}`;
  console.log('authUrl : ', authUrl);
  window.location.href = authUrl;
}
