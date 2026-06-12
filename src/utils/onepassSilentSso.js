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
  }
};

const removeSession = (key) => {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
};

// 복귀 시 navigate() 대신 window.location.replace()를 사용하므로
// basename을 제거할 필요 없이 브라우저 전체 경로를 그대로 저장한다.
// navigate()는 내부적으로 prependBasename을 적용하여 /home-dev/ → /home-dev/home-dev/ 이중화를 유발하지만
// window.location.replace('/home-dev/')는 URL을 그대로 적용하므로 이중화가 발생하지 않는다.
const getCurrentBrowserPath = () =>
  (window.location.pathname + window.location.search + window.location.hash) || '/';

export const hasSilentSsoAttempted = () => readSession(SILENT_SSO_ATTEMPTED_KEY) === '1';

export const isSilentSsoInProgress = () => readSession(SILENT_SSO_IN_PROGRESS_KEY) === '1';

export const getSilentSsoReturnUrl = () => readSession(SILENT_SSO_RETURN_URL_KEY);

export const markSilentSsoStart = () => {
  writeSession(SILENT_SSO_ATTEMPTED_KEY, '1');
  writeSession(SILENT_SSO_IN_PROGRESS_KEY, '1');
  writeSession(SILENT_SSO_RETURN_URL_KEY, getCurrentBrowserPath());
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
