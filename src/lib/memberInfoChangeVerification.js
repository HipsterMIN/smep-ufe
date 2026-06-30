export const MEMBER_INFO_CHANGE_VERIFICATION_HEADER = 'X-Member-Info-Verification';
export const MEMBER_INFO_CHANGE_VERIFICATION_STORAGE_KEY = 'member-info-change:verification';

const parseStoredValue = (rawValue) => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return typeof parsed?.entryKey === 'string' ? parsed : null;
  } catch {
    return null;
  }
};

export const readStoredMemberInfoVerification = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = parseStoredValue(
      window.sessionStorage.getItem(MEMBER_INFO_CHANGE_VERIFICATION_STORAGE_KEY),
    );
    if (!stored?.entryKey) {
      return null;
    }
    if (stored.expiresAt && Date.parse(stored.expiresAt) <= Date.now()) {
      window.sessionStorage.removeItem(MEMBER_INFO_CHANGE_VERIFICATION_STORAGE_KEY);
      return null;
    }
    return stored;
  } catch {
    return null;
  }
};

export const writeStoredMemberInfoVerification = (verification) => {
  if (typeof window === 'undefined' || !verification?.entryKey) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      MEMBER_INFO_CHANGE_VERIFICATION_STORAGE_KEY,
      JSON.stringify(verification),
    );
  } catch {
    // 의도: 브라우저 저장소가 차단된 환경에서도 화면이 멈추지 않도록 예외를 삼킨다.
    // 동작: 저장 실패 시 인증 완료 후 /modify 접근 검증에서 다시 실패 처리된다.
    // 주의: 이 값은 화면 진입용 임시 키이며, 저장 API 권한 판단에는 사용하지 않는다.
  }
};

export const clearStoredMemberInfoVerification = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(MEMBER_INFO_CHANGE_VERIFICATION_STORAGE_KEY);
  } catch {
    // 의도: 저장소 정리 실패가 사용자 흐름을 막지 않도록 한다.
    // 동작: 삭제 실패 시에도 서버 Redis TTL이 만료되어 오래된 entryKey는 무효화된다.
    // 주의: 프론트 저장소 값은 신뢰하지 않고 status API가 최종 진입 여부를 판단한다.
  }
};
