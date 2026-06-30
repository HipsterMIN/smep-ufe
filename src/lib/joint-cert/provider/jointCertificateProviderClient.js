import {
  CLIENT_PROVIDER_ERROR_CODE,
  JOINT_CERT_PROVIDER,
  PROVIDER_CEREMONY_STATUS,
  PROVIDER_ERROR_ORIGIN,
} from './contract';
import { createMagicLineClientProviderRuntime } from './magiclineClientProviderRuntime';
import { assertNoForbiddenConsumerFields } from './providerHarness';

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const invalidRequestResult = (request = {}) => ({
  success: false,
  provider: request.provider || JOINT_CERT_PROVIDER.MAGICLINE,
  status: PROVIDER_CEREMONY_STATUS.FAILED,
  correlation: request.correlation || null,
  serverVerificationRequest: null,
  error: {
    code: CLIENT_PROVIDER_ERROR_CODE.CLIENT_REQUEST_INVALID,
    message: '공동인증서 Provider 요청 필수값이 누락되었습니다.',
    retryable: false,
    origin: PROVIDER_ERROR_ORIGIN.CLIENT_RUNTIME,
  },
});

const isAuthenticationRequestValid = (request) => {
  return Boolean(
    request &&
      hasText(request.provider) &&
      hasText(request.purpose) &&
      hasText(request.challenge?.signOrigin),
  );
};

/**
 * Consumer가 provider runtime detail 없이 호출할 Client Provider facade를 만든다.
 *
 * @param {object} options facade option
 * @param {object} options.runtime 테스트 또는 운영 runtime adapter
 * @returns {object} Client Provider facade
 */
export const createJointCertificateProviderClient = ({ runtime } = {}) => {
  const selectedRuntime = runtime || createMagicLineClientProviderRuntime();

  return {
    getClientCapability(request = {}) {
      const capability = selectedRuntime.getCapability(request);
      assertNoForbiddenConsumerFields(capability);
      return capability;
    },

    startAuthentication(request) {
      if (!isAuthenticationRequestValid(request)) {
        return invalidRequestResult(request);
      }

      const result = selectedRuntime.startAuthentication(request);
      if (typeof result?.then === 'function') {
        return result.then((resolvedResult) => {
          assertNoForbiddenConsumerFields(resolvedResult);
          return resolvedResult;
        });
      }

      assertNoForbiddenConsumerFields(result);
      return result;
    },
  };
};
