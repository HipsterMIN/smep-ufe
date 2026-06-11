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

const getCurrentRelativeUrl = () => {
  const fullPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  // import.meta.env.BASE_URL e.g. '/home/' → base = '/home'
  // navigate()는 React Router 내부 경로(basename 제외)로 동작하므로
  // 브라우저 경로에서 basename을 제거해야 navigate(returnUrl)이 /home/home이 되지 않는다.
  const rawBase = (typeof import.meta !== 'undefined' && import.meta?.env?.BASE_URL) || '/';
  const base = rawBase.endsWith('/') && rawBase !== '/' ? rawBase.slice(0, -1) : rawBase;
  if (base && base !== '/') {
    if (fullPath === base || fullPath.startsWith(base + '/')) {
      return fullPath.slice(base.length) || '/';
    }
  }
  return fullPath || '/';
};

export const hasSilentSsoAttempted = () => readSession(SILENT_SSO_ATTEMPTED_KEY) === '1';

export const isSilentSsoInProgress = () => readSession(SILENT_SSO_IN_PROGRESS_KEY) === '1';

export const getSilentSsoReturnUrl = () => readSession(SILENT_SSO_RETURN_URL_KEY);

export const markSilentSsoStart = () => {
  writeSession(SILENT_SSO_ATTEMPTED_KEY, '1');
  writeSession(SILENT_SSO_IN_PROGRESS_KEY, '1');
  writeSession(SILENT_SSO_RETURN_URL_KEY, getCurrentRelativeUrl());
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
