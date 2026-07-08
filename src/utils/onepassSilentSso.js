const SILENT_SSO_ATTEMPTED_KEY = '__onepass_silent_sso_attempted__';
const SILENT_SSO_IN_PROGRESS_KEY = '__onepass_silent_sso_in_progress__';
const SILENT_SSO_RETURN_URL_KEY = '__onepass_silent_sso_return_url__';

const readSession = (key) => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeSession = (key, value) => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // ignore
    alert('세션 저장에 실패했습니다.');
  }
};

const removeSession = (key) => {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore
    alert('세션 삭제에 실패했습니다.');
  }
};

/**
 * 경로에서 배포 basename(import.meta.env.BASE_URL)을 제거한다.
 *
 * 복귀를 window.location.replace(리로드) 대신 React Router navigate()로 하기 위함이다.
 * navigate()는 basename을 자동으로 붙이므로, 저장 값에 basename이 남아 있으면
 * /home-dev/ → /home-dev/home-dev/ 이중화가 생긴다. 저장·소비 양쪽에서 이 함수로 정규화한다.
 */
export const stripBasename = (path) => {
  const raw = path || '/';
  const base = import.meta.env.BASE_URL || '/';
  if (base === '/') return raw;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  if (raw === normalizedBase || raw === `${normalizedBase}/`) return '/';
  if (raw.startsWith(`${normalizedBase}/`)) return raw.slice(normalizedBase.length) || '/';
  return raw;
};

// navigate() 복귀용으로 basename을 제거한 라우터 내부 경로를 저장한다.
const getCurrentRouterPath = () =>
  stripBasename(window.location.pathname) + window.location.search + window.location.hash;

export const hasSilentSsoAttempted = () => readSession(SILENT_SSO_ATTEMPTED_KEY) === '1';

export const isSilentSsoInProgress = () => readSession(SILENT_SSO_IN_PROGRESS_KEY) === '1';

export const getSilentSsoReturnUrl = () => readSession(SILENT_SSO_RETURN_URL_KEY);

export const markSilentSsoStart = () => {
  writeSession(SILENT_SSO_ATTEMPTED_KEY, '1');
  writeSession(SILENT_SSO_IN_PROGRESS_KEY, '1');
  writeSession(SILENT_SSO_RETURN_URL_KEY, getCurrentRouterPath());
};

export const finishSilentSso = ({ clearAttempted = false } = {}) => {
  removeSession(SILENT_SSO_IN_PROGRESS_KEY);
  removeSession(SILENT_SSO_RETURN_URL_KEY);
  if (clearAttempted) {
    removeSession(SILENT_SSO_ATTEMPTED_KEY);
  }
};

export const resetSilentSsoFlags = () => {
  finishSilentSso({ clearAttempted: true });
};
