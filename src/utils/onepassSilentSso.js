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

const getCurrentRelativeUrl = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

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
