export const REDACTED_VALUE = '<redacted>';

const SENSITIVE_REQUEST_FIELDS = new Set([
  'signedPayload',
  'verificationNonce',
  'businessNumber',
  'subjectDn',
  'issuerDn',
  'sourceText',
  'ci',
]);

export const redactJointCertValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return value;
  }
  return REDACTED_VALUE;
};

/**
 * 공동인증서 Provider payload를 로그나 fixture에 남기기 전 민감 필드를 제거한다.
 *
 * @param {unknown} value Provider request/result 후보
 * @returns {unknown} redacted copy
 */
export const redactJointCertPayload = (value) => {
  if (Array.isArray(value)) {
    return value.map(redactJointCertPayload);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value).reduce((acc, [key, entryValue]) => {
    acc[key] = SENSITIVE_REQUEST_FIELDS.has(key)
      ? redactJointCertValue(entryValue)
      : redactJointCertPayload(entryValue);
    return acc;
  }, {});
};
