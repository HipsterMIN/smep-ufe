import { api } from './apiClient';

export const NICE_ID_AUTH_SUCCESS_MESSAGE_TYPE = 'NICE_ID_AUTH_SUCCESS';
export const NICE_ID_AUTH_ERROR_MESSAGE_TYPE = 'NICE_ID_AUTH_ERROR';

export const NICE_ID_AUTH_ERROR_CODES = Object.freeze({
  invalidSvcTypes: 'NICE_INVALID_SVC_TYPES',
  requestFailed: 'NICE_AUTH_URL_REQUEST_FAILED',
  invalidResponse: 'NICE_AUTH_URL_RESPONSE_INVALID',
  popupBlocked: 'NICE_POPUP_BLOCKED',
  timeout: 'NICE_AUTH_TIMEOUT',
  callbackError: 'NICE_AUTH_ERROR',
});

const NICE_ID_AUTH_URL_ENDPOINT = '/api/v1/nice-id/auth-url';
const SUPPORTED_SVC_TYPES = new Set(['M', 'F', 'I', 'U']);
const DEFAULT_POPUP_NAME = 'nice-id-auth-popup';
const DEFAULT_POPUP_FEATURES = 'width=500,height=720,scrollbars=yes,resizable=yes';
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

const createFailure = (errorCode, message) => ({
  success: false,
  errorCode,
  message,
});

const normalizeSvcTypes = (svcTypes) => {
  if (!Array.isArray(svcTypes) || svcTypes.length === 0) {
    return {
      valid: false,
      failure: createFailure(
        NICE_ID_AUTH_ERROR_CODES.invalidSvcTypes,
        'NICE ID 인증수단을 1개 이상 선택해야 합니다.',
      ),
    };
  }

  const normalized = [];
  for (const svcType of svcTypes) {
    const value = String(svcType || '').trim().toUpperCase();
    if (!SUPPORTED_SVC_TYPES.has(value)) {
      return {
        valid: false,
        failure: createFailure(
          NICE_ID_AUTH_ERROR_CODES.invalidSvcTypes,
          '지원하지 않는 NICE ID 인증수단입니다.',
        ),
      };
    }

    if (!normalized.includes(value)) {
      normalized.push(value);
    }
  }

  return { valid: true, value: normalized };
};

const resolveAuthUrlPayload = (response) => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if (response.data && typeof response.data === 'object') {
    return response.data;
  }

  return response;
};

const extractAuthUrl = (response) => {
  const payload = resolveAuthUrlPayload(response);
  const authUrl = payload?.authUrl;

  if (typeof authUrl !== 'string' || authUrl.trim() === '') {
    return null;
  }

  return authUrl;
};

const toRequestFailure = (error) => {
  const data = error?.data;
  const errorCode =
    data && typeof data === 'object' && typeof data.errorCode === 'string'
      ? data.errorCode
      : NICE_ID_AUTH_ERROR_CODES.requestFailed;
  const message =
    data && typeof data === 'object' && typeof data.message === 'string'
      ? data.message
      : 'NICE ID 인증 URL을 발급하지 못했습니다.';

  return createFailure(errorCode, message);
};

const isObjectMessage = (data) => data && typeof data === 'object';

/**
 * NICE ID 표준창 인증을 시작하고 업무 화면에는 resultKey 또는 controlled error만 반환한다.
 *
 * @param {Object} options 인증 시작 옵션
 * @param {string[]} options.svcTypes NICE 인증수단 코드 목록(M/F/I/U)
 * @param {string} [options.popupName] popup window 이름
 * @param {string} [options.popupFeatures] popup window features
 * @param {number} [options.timeoutMs] callback message 대기 시간
 * @returns {Promise<{success: true, resultKey: string} | {success: false, errorCode: string, message: string}>}
 */
export async function openNiceIdAuth({
  svcTypes,
  popupName = DEFAULT_POPUP_NAME,
  popupFeatures = DEFAULT_POPUP_FEATURES,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const normalizedSvcTypes = normalizeSvcTypes(svcTypes);
  if (!normalizedSvcTypes.valid) {
    return normalizedSvcTypes.failure;
  }

  let authUrl;
  try {
    const response = await api.post(NICE_ID_AUTH_URL_ENDPOINT, {
      svcTypes: normalizedSvcTypes.value,
    });
    authUrl = extractAuthUrl(response);
  } catch (error) {
    return toRequestFailure(error);
  }

  if (!authUrl) {
    return createFailure(
      NICE_ID_AUTH_ERROR_CODES.invalidResponse,
      'NICE ID 인증 URL 응답 형식이 올바르지 않습니다.',
    );
  }

  if (typeof window === 'undefined') {
    return createFailure(
      NICE_ID_AUTH_ERROR_CODES.popupBlocked,
      '브라우저 환경에서만 NICE ID 인증창을 열 수 있습니다.',
    );
  }

  return new Promise((resolve) => {
    let settled = false;
    let popupWindow = null;
    let timeoutId = null;

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };

    const settle = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(result);
    };

    const handleSuccess = (data) => {
      const resultKey = typeof data.resultKey === 'string' ? data.resultKey.trim() : '';
      if (!resultKey) {
        settle(
          createFailure(
            NICE_ID_AUTH_ERROR_CODES.invalidResponse,
            'NICE ID 인증 결과 형식이 올바르지 않습니다.',
          ),
        );
        return;
      }

      settle({ success: true, resultKey });
    };

    const handleError = (data) => {
      const errorCode =
        typeof data.errorCode === 'string' && data.errorCode.trim() !== ''
          ? data.errorCode
          : NICE_ID_AUTH_ERROR_CODES.callbackError;
      const message =
        typeof data.message === 'string' && data.message.trim() !== ''
          ? data.message
          : 'NICE ID 인증 처리 중 오류가 발생했습니다.';

      settle(createFailure(errorCode, message));
    };

    function handleMessage(event) {
      // 이유: 같은 origin이어도 다른 popup/frame의 메시지가 섞일 수 있어 현재 열어둔 popup source만 수용한다.
      // 제약: backend callback bridge는 opener에 same-origin postMessage를 보내야 하며, source가 다르면 메시지를 무시한다.
      if (event.origin !== window.location.origin || event.source !== popupWindow) {
        return;
      }

      if (!isObjectMessage(event.data)) {
        return;
      }

      if (event.data.type === NICE_ID_AUTH_SUCCESS_MESSAGE_TYPE) {
        handleSuccess(event.data);
        return;
      }

      if (event.data.type === NICE_ID_AUTH_ERROR_MESSAGE_TYPE) {
        handleError(event.data);
      }
    }

    window.addEventListener('message', handleMessage);
    timeoutId = window.setTimeout(() => {
      settle(
        createFailure(
          NICE_ID_AUTH_ERROR_CODES.timeout,
          'NICE ID 인증 결과 수신 시간이 초과되었습니다.',
        ),
      );
    }, timeoutMs);

    try {
      popupWindow = window.open(authUrl, popupName, popupFeatures);
    } catch {
      settle(
        createFailure(
          NICE_ID_AUTH_ERROR_CODES.popupBlocked,
          '브라우저에서 NICE ID 인증창을 열지 못했습니다.',
        ),
      );
      return;
    }

    if (!popupWindow) {
      settle(
        createFailure(
          NICE_ID_AUTH_ERROR_CODES.popupBlocked,
          '브라우저에서 팝업이 차단되어 NICE ID 인증창을 열지 못했습니다.',
        ),
      );
      return;
    }

    popupWindow.focus?.();
  });
}
