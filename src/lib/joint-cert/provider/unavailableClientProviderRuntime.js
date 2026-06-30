import {
  CLIENT_PROVIDER_ERROR_CODE,
  JOINT_CERT_PROVIDER,
  PROVIDER_CEREMONY_STATUS,
  PROVIDER_ERROR_ORIGIN,
} from './contract';

const buildError = (code, message, retryable = false) => ({
  code,
  message,
  retryable,
  origin: PROVIDER_ERROR_ORIGIN.CLIENT_RUNTIME,
});

/**
 * 운영 runtime 설정 전 기본 Client Provider Runtime adapter를 만든다.
 *
 * @param {object} options adapter option
 * @param {string} options.provider Provider type
 * @returns {object} Client Provider Runtime adapter
 */
export const createUnavailableClientProviderRuntime = ({
  provider = JOINT_CERT_PROVIDER.MAGICLINE,
} = {}) => ({
  getCapability(request = {}) {
    return {
      provider: request.provider || provider,
      available: false,
      runtimeReady: false,
      supportedPurposes: [],
      supportedClaims: [],
      requires: {
        browserRuntime: true,
        clientResource: true,
        serverVerification: true,
        licenseConfiguration: true,
      },
      error: buildError(
        CLIENT_PROVIDER_ERROR_CODE.CLIENT_RUNTIME_NOT_CONFIGURED,
        '공동인증서 Client Provider Runtime이 설정되지 않았습니다.',
      ),
    };
  },

  startAuthentication(request = {}) {
    return {
      success: false,
      provider: request.provider || provider,
      status: PROVIDER_CEREMONY_STATUS.FAILED,
      correlation: request.correlation || null,
      serverVerificationRequest: null,
      error: buildError(
        CLIENT_PROVIDER_ERROR_CODE.CLIENT_RUNTIME_NOT_CONFIGURED,
        '공동인증서 Client Provider Runtime이 설정되지 않았습니다.',
      ),
    };
  },
});
