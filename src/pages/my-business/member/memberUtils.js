import { fetchAndConvertCommonCodes } from '@utils/commonCodeUtils.js';

export const CORPORATE_MEMBER_COMMON_CODE_GROUPS = [
  'ENT_SCL_CD',
  'WRKR_CNT_CLSF_CD',
  'SLS_AMT_CLSF_CD',
];

export const HELD_FIELD_PENDING_TEXT = '확인 대기';

export const normalizeApiPayload = (response) => response?.data || response || null;

export const normalizeDigits = (value) => String(value ?? '').replace(/[^0-9]/g, '');

export const formatBusinessRegNo = (value) => {
  const digits = normalizeDigits(value);
  if (digits.length !== 10) {
    return value || '-';
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 10)}`;
};

export const formatCorporationRegNo = (value) => {
  const digits = normalizeDigits(value);
  if (digits.length !== 13) {
    return value || '-';
  }
  return `${digits.slice(0, 6)}-${digits.slice(6, 13)}`;
};

export const buildCompanyAddress = (baseAddress, detailAddress) => {
  const values = [baseAddress, detailAddress]
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);
  return values.length > 0 ? values.join(' ') : '-';
};

export const getCodeLabel = (options, value) => {
  if (!value) {
    return '-';
  }
  const matched = Array.isArray(options)
    ? options.find((option) => option.value === value)
    : null;
  return matched?.label || value;
};

// 기업회원 ksic_cd는 기존 데이터에 5~6자리 세분류가 많아, 화면에서는 1자리 대분류를 파생해 레거시 select 계약과 맞춘다.
export const extractTopLevelKsicCd = (value) => {
  const normalized = String(value ?? '').trim().toUpperCase();
  return normalized ? normalized.charAt(0) : '';
};

export const getKsicTopLevelLabel = (options, value) => {
  const topLevelKsicCd = extractTopLevelKsicCd(value);
  if (!topLevelKsicCd) {
    return '-';
  }
  const matched = Array.isArray(options)
    ? options.find((option) => option.value === topLevelKsicCd)
    : null;
  return matched?.label || topLevelKsicCd;
};

export const fetchCorporateMemberCodeOptions = async () =>
  fetchAndConvertCommonCodes(CORPORATE_MEMBER_COMMON_CODE_GROUPS);

export const fetchKsicTopLevelOptions = async (apiClient) => {
  const response = normalizeApiPayload(await apiClient.get('/api/v1/ksic/top-level'));
  return Array.isArray(response)
    ? response.map((item) => ({
      value: item.ksicCd,
      label: item.ksicNm,
    }))
    : [];
};

export const resolveCorporateMemberNo = async (apiClient, businessRegNo) => {
  const normalizedBusinessRegNo = normalizeDigits(businessRegNo);
  if (!normalizedBusinessRegNo) {
    throw new Error('사업자등록번호를 확인할 수 없습니다.');
  }
  const response = normalizeApiPayload(
    await apiClient.get(`/api/v1/member/corporate/resolve/${encodeURIComponent(normalizedBusinessRegNo)}`),
  );
  if (!response?.mbrNo) {
    throw new Error('회원번호를 확인할 수 없습니다.');
  }
  return response.mbrNo;
};

export const fetchCorporateMemberDetail = async (apiClient) =>
  normalizeApiPayload(
    await apiClient.get('/api/v1/member/corporate/me'),
  );

// 개인회원 상세정보를 조회한다.
export const fetchIndividualMemberDetail = async (apiClient) =>
  normalizeApiPayload(
    await apiClient.get('/api/v1/member/individual/me'),
  );

// 회원 정보수신 동의 목록을 조회한다.
export const fetchMemberInfoReceptionAgreements = async (apiClient) =>
  normalizeApiPayload(
    await apiClient.get('/api/v1/member/common/me/info-reception-agreements'),
  );

export const fetchCorporateManagerContact = async (apiClient) =>
  normalizeApiPayload(
    await apiClient.get('/api/v1/member/corporate/me/contacts/manager'),
  );

export const updateCorporateMemberDetail = async (apiClient, payload) =>
  normalizeApiPayload(
    await apiClient.put('/api/v1/member/corporate/me', payload),
  );

// 기업회원 정보와 정보수신 동의를 저장한다.
export const updateCorporateMemberInfo = async (apiClient, payload) =>
  normalizeApiPayload(
    await apiClient.put(
      '/api/v1/member/corporate/me/member-info',
      payload,
    ),
  );

// 개인회원 정보와 정보수신 동의를 저장한다.
export const updateIndividualMemberInfo = async (apiClient, payload) =>
  normalizeApiPayload(
    await apiClient.put(
      '/api/v1/member/individual/me/member-info',
      payload,
    ),
  );
