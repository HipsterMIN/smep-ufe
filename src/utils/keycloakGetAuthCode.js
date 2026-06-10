// src/utils/keycloakGetAuthCode.js
import { useAuthStore } from '../store/useAuthStore.jsx';
import { resetSilentSsoFlags } from './onepassSilentSso.js';

const readEnv = (key) => String(import.meta.env[key] || '').trim();
const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const KEYCLOAK_URL = trimTrailingSlash(readEnv('VITE_QSIGN_URL'));
const KEYCLOAK_JOIN = readEnv('VITE_ONEPASS_CONVERSION_URL');
const ONEPASS_JOIN = readEnv('VITE_ONEPASS_REGISTER_URL');
const REALM = readEnv('VITE_QSIGN_REALM');
const CLIENT_ID = readEnv('VITE_ONEPASS_CLIENT_ID');
const REDIRECT_SSO_URI = readEnv('VITE_ONEPASS_REDIRECT_SSO_URI'); // 우리 사이트 SSO 콜백 주소 (로그인)
const REDIRECT_HOME_URI = readEnv('VITE_ONEPASS_REDIRECT_HOME_URI'); // 우리 사이트 메인 주소 (가입유도팝업)
const AGENCY_QSIGN_URL = trimTrailingSlash(readEnv('VITE_AGENCY_QSIGN_URL'));
const MNA_CLIENT_ID = readEnv('VITE_MNA_CLIENT_ID');
const MNA_REDIRECT_URI = readEnv('VITE_MNA_REDIRECT_URI');
const COBIZ_CLIENT_ID = readEnv('VITE_COBIZ_CLIENT_ID');
const COBIZ_REDIRECT_URI = readEnv('VITE_COBIZ_REDIRECT_URI');
const BIZLINK_CLIENT_ID = readEnv('VITE_BIZLINK_CLIENT_ID');
const BIZLINK_REDIRECT_URI = readEnv('VITE_BIZLINK_REDIRECT_URI');

export function buildOnePassRegisterUrl(type = 'member') {
  const params = new URLSearchParams({
    type,
    return_client: CLIENT_ID,
    return_uri: REDIRECT_HOME_URI,
  });

  return `${ONEPASS_JOIN}?${params}`;
}

export function buildOnePassConversionUrl() {
  const params = new URLSearchParams({
    return_client: CLIENT_ID,
    return_uri: REDIRECT_HOME_URI,
  });

  return `${KEYCLOAK_JOIN}?${params}`;
}

const buildAgencyAuthUrl = ({ clientId, redirectUri }) => {
  // 외부 기관 연계는 공통 QSign base를 쓰고, 기관별 client_id와 redirect_uri만 분기한다.
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid',
  });

  return `${AGENCY_QSIGN_URL}/realms/${REALM}/protocol/openid-connect/auth?${params}`;
};

export function buildMnaAuthUrl() {
  return buildAgencyAuthUrl({
    clientId: MNA_CLIENT_ID,
    redirectUri: MNA_REDIRECT_URI,
  });
}

export function buildCobizAuthUrl() {
  return buildAgencyAuthUrl({
    clientId: COBIZ_CLIENT_ID,
    redirectUri: COBIZ_REDIRECT_URI,
  });
}

export function buildBizlinkAuthUrl() {
  return buildAgencyAuthUrl({
    clientId: BIZLINK_CLIENT_ID,
    redirectUri: BIZLINK_REDIRECT_URI,
  });
}

const resolveOnePassJoinMemberId = () => {
  const { user } = useAuthStore.getState();
  return String(user?.loginId || user?.id || '').trim();
};

const resolveOnePassJoinUserType = () => {
  const { currentMode } = useAuthStore.getState();

  // 상대 전환 URL 계약은 우리 화면 모드가 아니라 QIM 회원 구분값(ENT/IND)을 요구한다.
  if (currentMode === 'CORPORATE') return 'ENT';
  if (currentMode === 'INDIVIDUAL') return 'IND';

  return '';
};


// 로그인후 원패스 가입 유도시
export function onePassJoin() {
  // 명시 로그인/전환 진입 시 silent 복구 루프 방지 플래그를 초기화한다.
  resetSilentSsoFlags();

  // 가입 유도 플로우는 현재 우리 사이트에 로그인된 회원만 타므로,
  // 상대가 요구하는 mbrId 는 로그인 ID를 우선 전달하고, 없을 때만 기존 mbr_no로 폴백한다.
  const memberId = resolveOnePassJoinMemberId();
  if (!memberId) {
    window.alert('회원 식별값을 확인할 수 없습니다.');
    return;
  }

  const userType = resolveOnePassJoinUserType();
  if (!userType) {
    window.alert('회원 유형을 확인할 수 없습니다.');
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
    userType: userType,
    return_client: CLIENT_ID,
  });

  let authUrl = `${KEYCLOAK_JOIN}?${params}`;

  console.log('joinUrl : ', authUrl);
  window.location.href = authUrl;
}

// 비로그인/로그인 상시표기
export function onePassGetAuthCode() {
  // 명시 로그인 진입은 silent 복구 상태와 분리한다.
  resetSilentSsoFlags();

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
