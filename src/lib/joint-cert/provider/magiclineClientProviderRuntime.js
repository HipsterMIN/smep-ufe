import {
  CLIENT_PROVIDER_ERROR_CODE,
  JOINT_CERT_CLAIM,
  JOINT_CERT_PROVIDER,
  JOINT_CERT_PURPOSE,
  PROVIDER_CEREMONY_STATUS,
  PROVIDER_ERROR_ORIGIN,
} from './contract';

const MAGICLINE_RESOURCE_PATH = '/MagicLine4Web/ML4Web';

const normalizePath = (value) => {
  const path = typeof value === 'string' ? value.trim() : '';
  if (!path || path === '/') {
    return '';
  }

  const withoutTrailingSlash = path.endsWith('/') ? path.slice(0, -1) : path;
  return withoutTrailingSlash.startsWith('/')
    ? withoutTrailingSlash
    : `/${withoutTrailingSlash}`;
};

export const resolveMagicLineBasePath = (
  viteBaseUrl = import.meta.env?.BASE_URL,
) => {
  return `${normalizePath(viteBaseUrl)}${MAGICLINE_RESOURCE_PATH}`;
};

export const resolveMagicLineContextPath = (basePath) => {
  const normalizedBasePath = normalizePath(basePath);
  const resourcePathIndex = normalizedBasePath.indexOf(MAGICLINE_RESOURCE_PATH);

  if (resourcePathIndex <= 0) {
    return '';
  }

  return normalizedBasePath.slice(0, resourcePathIndex);
};

/**
 * MagicLine Client Provider Runtime adapter를 만든다.
 *
 * <p>벤더 runtime과 설정값은 `public/MagicLine4Web` 정적 자산 내부에 두고,
 * Consumer에는 Provider 표준 요청/결과만 노출한다.
 *
 * @param {object} options adapter option
 * @returns {object} Client Provider Runtime adapter
 */
export const createMagicLineClientProviderRuntime = ({
  provider = JOINT_CERT_PROVIDER.MAGICLINE,
  basePath = resolveMagicLineBasePath(),
  initPollIntervalMs = 500,
  initTimeoutMs = 15000,
} = {}) => {
  let initializationPromise = null;
  const normalizedBasePath = normalizePath(basePath);
  const contextPath = resolveMagicLineContextPath(normalizedBasePath);

  const isBrowserAvailable = () => {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  };

  const createErrorResult = (request, code, message, retryable = false) => ({
    success: false,
    provider: request?.provider || provider,
    status: PROVIDER_CEREMONY_STATUS.FAILED,
    correlation: request?.correlation || null,
    serverVerificationRequest: null,
    error: {
      code,
      message,
      retryable,
      origin: PROVIDER_ERROR_ORIGIN.CLIENT_RUNTIME,
    },
  });

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load MagicLine runtime: ${src}`));
      document.head.appendChild(script);
    });

  const waitForMagicLineReady = () =>
    new Promise((resolve, reject) => {
      const startedAt = Date.now();

      const check = () => {
        if (window.magicline?.is_ML_Sign_Init && window.magicline?.uiapi?.MakeSignData) {
          resolve();
          return;
        }

        if (Date.now() - startedAt >= initTimeoutMs) {
          reject(new Error('MagicLine runtime initialization timed out'));
          return;
        }

        window.setTimeout(check, initPollIntervalMs);
      };

      check();
    });

  const installContextPathResolver = () => {
    // 의도: Vite base가 /home-admin-dev/ 또는 /home-admin/인 경우에도 MagicLine 벤더 설정이
    // 동일한 context path를 사용하게 맞춘다.
    // 동작: ML_Config.js, ML4Web_Config.js가 로드되기 전에 전역 getContextPath를 주입해
    // Child.html, loader, install URL이 현재 정적 자산 base 아래로 생성되도록 한다.
    // 주의: vendor 파일은 직접 수정하지 않으며, runtime adapter가 선택한 basePath 기준으로만 보정한다.
    window.getContextPath = () => contextPath;
  };

  const initialize = async () => {
    if (!isBrowserAvailable()) {
      throw new Error('MagicLine browser runtime is unavailable');
    }

    if (!initializationPromise) {
      initializationPromise = (async () => {
        installContextPathResolver();
        await loadScript(`${normalizedBasePath}/js/crypto/magicjs_1.2.7.2.min.js`);
        await loadScript(`${normalizedBasePath}/js/ext/jquery-1.10.2.js`);
        await loadScript(`${normalizedBasePath}/js/ext/jquery-ui.min.js`);
        await loadScript(`${normalizedBasePath}/js/ext/jquery.blockUI.js`);
        await loadScript(`${normalizedBasePath}/js/ext/ML_Config.js`);
        await loadScript(`${normalizedBasePath}/js/ML4Web_Config.js`);
        await waitForMagicLineReady();
      })();
    }

    return initializationPromise;
  };

  const createSignForm = (signOrigin, identityValue) => {
    const form = document.createElement('form');
    form.style.display = 'none';

    const addField = (name, value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.id = name;
      input.value = value;
      form.appendChild(input);
    };

    addField('signData', 'magicLine');
    addField('signOrigin', signOrigin);

    if (identityValue) {
      addField('idn', identityValue);
      addField('cdn', identityValue);
      addField('vidType', 'client');
    }

    document.body.appendChild(form);
    return form;
  };

  const requestMagicLineSignature = (form) =>
    new Promise((resolve, reject) => {
      let handled = false;

      const createSigningError = (code) => {
        const error = new Error('MagicLine signing failed');
        error.code = code;
        return error;
      };

      const settleOnce = (settle, value) => {
        if (handled) {
          return;
        }

        handled = true;
        window.removeEventListener('message', handleCloseMessage, false);
        settle(value);
      };

      const handleCloseMessage = (event) => {
        let payload;

        try {
          payload =
            typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        } catch {
          return;
        }

        // MagicLine 창 X 닫기는 callback 없이 closeDialog 메시지만 올 수 있어 사용자 취소로 종료한다.
        if (payload?.key === 'closeDialog') {
          settleOnce(
            reject,
            createSigningError(CLIENT_PROVIDER_ERROR_CODE.CLIENT_USER_CANCELLED),
          );
        }
      };

      window.addEventListener('message', handleCloseMessage, false);

      try {
        window.magicline.uiapi.MakeSignData(form, null, (code, message = {}) => {
          // MagicLine runtime이 일부 환경에서 callback을 중복 호출할 수 있어 첫 결과만 사용한다.
          if (code === 0 && message.encMsg) {
            settleOnce(resolve, message);
            return;
          }

          settleOnce(
            reject,
            createSigningError(
              code === -1
                ? CLIENT_PROVIDER_ERROR_CODE.CLIENT_USER_CANCELLED
                : CLIENT_PROVIDER_ERROR_CODE.CLIENT_SIGN_FAILED,
            ),
          );
        });
      } catch (error) {
        settleOnce(reject, error);
      }
    });

  return {
    getCapability(request = {}) {
      const browserAvailable = isBrowserAvailable();
      const runtimeReady = browserAvailable && Boolean(window.magicline?.is_ML_Sign_Init);

      return {
        provider: request.provider || provider,
        available: browserAvailable,
        runtimeReady,
        supportedPurposes: [
          JOINT_CERT_PURPOSE.LOGIN,
          JOINT_CERT_PURPOSE.CERT_REGISTRATION,
          JOINT_CERT_PURPOSE.CERT_CHANGE,
        ],
        supportedClaims: [
          JOINT_CERT_CLAIM.SUBJECT_DN,
          JOINT_CERT_CLAIM.ISSUER_DN,
          JOINT_CERT_CLAIM.SERIAL_NUMBER,
          JOINT_CERT_CLAIM.POLICY_OID,
          JOINT_CERT_CLAIM.SOURCE_TEXT,
          JOINT_CERT_CLAIM.DISPLAY_NAME,
          JOINT_CERT_CLAIM.ORGANIZATION_NAME,
          JOINT_CERT_CLAIM.BUSINESS_NUMBER,
          JOINT_CERT_CLAIM.VID_CHECK,
        ],
        requires: {
          browserRuntime: true,
          clientResource: true,
          serverVerification: true,
          licenseConfiguration: true,
        },
        error: browserAvailable
          ? null
          : {
            code: CLIENT_PROVIDER_ERROR_CODE.CLIENT_RUNTIME_UNAVAILABLE,
            message: '공동인증서 브라우저 runtime을 사용할 수 없습니다.',
            retryable: false,
            origin: PROVIDER_ERROR_ORIGIN.CLIENT_RUNTIME,
          },
      };
    },

    async startAuthentication(request) {
      try {
        await initialize();
      } catch {
        return createErrorResult(
          request,
          CLIENT_PROVIDER_ERROR_CODE.CLIENT_RUNTIME_INIT_FAILED,
          '공동인증서 runtime 초기화에 실패했습니다.',
          true,
        );
      }

      const signOrigin = request.challenge.signOrigin;
      const identityValue =
        request.identityHint?.userIdentifier || request.identityHint?.businessNumber;
      const form = createSignForm(signOrigin, identityValue);

      try {
        const signature = await requestMagicLineSignature(form);
        const startedAt = request.correlation?.startedAt || new Date().toISOString();

        return {
          success: true,
          provider: request.provider || provider,
          status: PROVIDER_CEREMONY_STATUS.CLIENT_COMPLETED,
          correlation: request.correlation || null,
          serverVerificationRequest: {
            provider: request.provider || provider,
            purpose: request.purpose,
            signedPayload: signature.encMsg,
            signOrigin,
            verificationNonce: signature.vidRandom || null,
            identityHint: request.identityHint || null,
            requestedClaims: request.requestedClaims || [],
            trace: request.correlation
              ? {
                requestId: request.correlation.requestId || null,
                ceremonyId: request.correlation.ceremonyId || null,
                startedAt,
              }
              : null,
          },
          error: null,
        };
      } catch (error) {
        return createErrorResult(
          request,
          error.code || CLIENT_PROVIDER_ERROR_CODE.CLIENT_INTERNAL_ERROR,
          error.code === CLIENT_PROVIDER_ERROR_CODE.CLIENT_USER_CANCELLED
            ? '공동인증서 인증이 취소되었습니다.'
            : '공동인증서 서명에 실패했습니다.',
          error.code !== CLIENT_PROVIDER_ERROR_CODE.CLIENT_USER_CANCELLED,
        );
      } finally {
        form.remove();
      }
    },
  };
};
