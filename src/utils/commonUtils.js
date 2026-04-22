// 사용예시: onChange={(event) => setValue(keepDigitsOnly(event.target.value))}
// 입출력예시: keepDigitsOnly('12ab가34') => '1234'
// 기능: 입력값에서 숫자 외 문자를 제거하고 숫자만 반환한다.
import {normalizeDigits} from '@pages/my-business/member/memberUtils.js';

export const keepDigitsOnly = (value) => String(value ?? '').replace(/[^0-9]/g, '');

// 사용예시: onChange={(event) => setValue(removeDigits(event.target.value))}
// 입출력예시: removeDigits('홍1길2동') => '홍길동'
// 기능: 입력값에서 숫자를 제거한 값을 반환한다.
export const removeDigits = (value) => String(value ?? '').replace(/[0-9]/g, '');

// 사용예시: onChange={(event) => setValue(removeKoreanCharacters(event.target.value))}
// 입출력예시: removeKoreanCharacters('abc한글@test.co.kr') => 'abc@test.co.kr'
// 기능: 입력값에서 한글 완성형과 자모를 제거한 값을 반환한다.
export const removeKoreanCharacters = (value) =>
  String(value ?? '').replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');


export const renderManagerPhoneNumber = (value) => {
  const formatted = formatPhoneNumber(value);
  return formatted === '-' ? '--' : formatted;
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

export const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }
  return String(value).replace('T', ' ').split('.')[0];
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

// JWT payload를 디코딩해 회원번호와 로그인 아이디 claim을 읽는다.
export const decodeJwtPayload = (token) => {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - normalizedPayload.length % 4) % 4),
        '=',
    );

    return JSON.parse(atob(paddedPayload));
  } catch (error) {
    console.warn('Failed to decode access token payload.', error);
    return null;
  }
};