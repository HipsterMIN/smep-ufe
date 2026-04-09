/**
 * 문자열 처리 유틸리티 함수 모음
 */

/**
 * 기관명 축약 (첫 단어 + 마지막 단어)
 * @example "중소벤처기업부 중소기업정책실 지역기업정책관 지역혁신정책과" → "중소벤처기업부 지역혁신정책과"
 */
export const shortenInstName = (fullName) => {
  if (!fullName || !fullName.includes(' ')) {
    return fullName;
  }
  const parts = fullName.split(' ');
  return `${parts[0]} ${parts[parts.length - 1]}`;
};

const splitEventRegions = (value) => {
  if (value == null) return [];

  return String(value)
    .split('@')
    .map((token) => token.trim())
    .filter(Boolean);
};

/**
 * 행사정보 목록용 지역 포맷
 * @example "경기@충청" -> "경기"
 */
export const formatEventRegionForList = (value) => {
  const regions = splitEventRegions(value);
  return regions[0] || '-';
};

/**
 * 행사정보 상세용 지역 포맷
 * @example "경기@충청" -> "경기, 충청"
 */
export const formatEventRegionForDetail = (value) => {
  const regions = splitEventRegions(value);
  if (regions.length === 0) return '-';
  return regions.join(', ');
};
