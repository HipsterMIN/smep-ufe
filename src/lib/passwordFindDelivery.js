export const PASSWORD_FIND_SEND_OPTIONS = [
  {
    type: 'EMAIL',
    channelKey: 'email',
    label: '이메일',
    unavailableLabel: '등록된 이메일 없음',
  },
  {
    type: 'SMS',
    channelKey: 'sms',
    label: '문자',
    unavailableLabel: '등록된 휴대전화 없음',
  },
];

export const SEND_TYPE_LABELS = PASSWORD_FIND_SEND_OPTIONS.reduce(
  (labels, option) => ({ ...labels, [option.type]: option.label }),
  {},
);

export const resolvePasswordFindErrorMessage = (error) =>
  error?.data?.message ||
  error?.data?.error?.message ||
  error?.message ||
  '임시비밀번호 발송 처리 중 오류가 발생했습니다.';

export const isObjectPayload = (value) => value !== null && typeof value === 'object';

export const getPayloadKeys = (value) => (isObjectPayload(value) ? Object.keys(value) : []);

export const createResponseShapeMarker = (response, payload) => ({
  wrapped: isObjectPayload(response?.data),
  topLevelKeys: getPayloadKeys(response),
  payloadKeys: getPayloadKeys(payload),
});
