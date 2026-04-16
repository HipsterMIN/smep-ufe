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

export const formatPhoneNumber = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return '-';
  }
  if (raw.includes('-')) {
    return raw;
  }

  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length === 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  if (digits.length === 10) {
    if (digits.startsWith('02')) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return raw;
};

export const formatYmd = (value, separator = '-') => {
  const digits = normalizeDigits(value);
  if (digits.length !== 8) {
    return value || '-';
  }
  return `${digits.slice(0, 4)}${separator}${digits.slice(4, 6)}${separator}${digits.slice(6, 8)}`;
};

export const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }
  return String(value).replace('T', ' ').split('.')[0];
};

export const parseDateFromYmd = (value) => {
  const digits = normalizeDigits(value);
  if (digits.length !== 8) {
    return null;
  }

  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6)) - 1;
  const day = Number(digits.slice(6, 8));
  const parsed = new Date(year, month, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const toYmd = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
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

export const fetchCorporateMemberCodeOptions = async () =>
  fetchAndConvertCommonCodes(CORPORATE_MEMBER_COMMON_CODE_GROUPS);

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

export const fetchCorporateMemberDetail = async (apiClient, mbrNo) =>
  normalizeApiPayload(
    await apiClient.get(`/api/v1/member/corporate/${encodeURIComponent(mbrNo)}`),
  );

export const updateCorporateMemberDetail = async (apiClient, mbrNo, payload) =>
  normalizeApiPayload(
    await apiClient.put(`/api/v1/member/corporate/${encodeURIComponent(mbrNo)}`, payload),
  );
