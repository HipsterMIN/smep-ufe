/**
 * 중복 로그인 강퇴(SESSION_SUPERSEDED) 가드.
 *
 * 후입자 우선 정책으로 다른 브라우저·기기의 신규 로그인이 이 브라우저의 세션을
 * 무효화하면, 서버는 refresh 재발급에 401 + ACCOUNT_LOGIN_003 을 돌려준다.
 * 이 상태에서 부트스트랩의 silent SSO 가 통합회원(IdP) 세션을 보고 자동 재로그인하면
 * 두 브라우저가 새로고침마다 세션을 서로 뺏는 핑퐁이 되므로, 강퇴 플래그를 세워
 * 사용자가 로그인 버튼을 직접 누를 때까지 자동 로그인을 중단한다.
 *
 * localStorage 를 쓰는 이유: 강퇴는 브라우저 단위 사건이라 모든 탭·새 탭이 함께
 * 자동 로그인을 멈춰야 한다(sessionStorage 는 탭 단위라 부적합).
 */

/** 서버 AccountLoginErrorCode.SESSION_SUPERSEDED 의 code 값 */
export const SESSION_SUPERSEDED_CODE = 'ACCOUNT_LOGIN_003';

export const SESSION_SUPERSEDED_MESSAGE =
  '다른 브라우저 또는 기기에서 로그인되어 로그아웃되었습니다.';

const KEY = '__auth_session_superseded__';

export const isSessionSuperseded = () => {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const markSessionSuperseded = () => {
  try {
    window.localStorage.setItem(KEY, '1');
  } catch {
    // 저장 실패 시 가드 없이 동작한다(자동 재로그인 허용) — 기능 자체는 유지
  }
};

export const clearSessionSuperseded = () => {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};

/** refresh 실패 응답이 강퇴(SESSION_SUPERSEDED)인지 판별한다. */
export const isSupersededError = (err) =>
  err?.status === 401 && err?.data?.code === SESSION_SUPERSEDED_CODE;
