// 지원사업 신청현황과 대시보드가 같은 연계기관 공통코드 계약을 사용하도록 한곳에서 관리한다.
// BI01과 BI13은 동일한 신청접수 DB 조회 경로를 사용하지만 백엔드 sourceCode는 서로 다르므로 합치지 않아야 한다.
export const BIZ_PBANC_LINK_INST_GROUP_ID = 'BIZ_PBANC_LINK_INST_CD';

export const LINK_INST_CODE_TO_SOURCE_CODE = {
  BI01: 'SMTC',
  BI02: 'KSU',
  BI03: 'SMF',
  BI04: 'SBI',
  BI05: 'KME',
  BI07: 'FANFAN',
  BI08: 'ULTARI',
  BI09: 'SHK',
  BI10: 'SME',
  BI13: 'IRIS',
};

export const INTEGRATED_LINK_INST_CODE_SET = new Set(Object.keys(LINK_INST_CODE_TO_SOURCE_CODE));

export const SOURCE_NAME_FALLBACK_BY_SOURCE_CODE = {
  SMF: '스마트공장사업관리시스템',
  KME: '중진공홈페이지',
  KSU: 'K-STARTUP',
  FANFAN: '판판대로',
  SHK: '인력지원사업종합관리',
  SBI: '소상공인24',
  SME: '중소기업해외전시포털',
  ULTARI: '기술보호울타리',
  SMTC: 'SMTECH',
  IRIS: 'IRIS',
};

const STATUS_LABEL_BY_GROUP = {
  IN_PROGRESS: '신청중',
  COMPLETED: '신청완료',
};

export const resolveSourceCodeForApi = (category, selectedCode) => {
  if (!selectedCode || category !== BIZ_PBANC_LINK_INST_GROUP_ID) {
    return '';
  }

  return LINK_INST_CODE_TO_SOURCE_CODE[selectedCode] || '';
};

// 공통코드명을 sourceCode 기준 Map으로 바꿔 목록과 차트의 기관명이 달라지지 않게 한다.
// 공통코드 API가 비어 있거나 일부 코드가 누락되어도 운영 화면이 깨지지 않도록 정적 대체명을 먼저 채운다.
export const buildSourceLabelBySourceCode = (linkInstOptions = []) => {
  const labels = { ...SOURCE_NAME_FALLBACK_BY_SOURCE_CODE };

  if (!Array.isArray(linkInstOptions)) {
    return labels;
  }

  linkInstOptions.forEach((option) => {
    const mappedSourceCode = LINK_INST_CODE_TO_SOURCE_CODE[option?.value];
    const label = String(option?.label ?? '').trim();

    if (mappedSourceCode && label) {
      labels[mappedSourceCode] = label;
    }
  });

  return labels;
};

export const getSupportApplicationSourceLabel = (
  sourceLabelBySourceCode,
  sourceCode,
  sourceName,
) => {
  const normalizedSourceCode = String(sourceCode ?? '').trim().toUpperCase();
  const commonCodeLabel = sourceLabelBySourceCode?.[normalizedSourceCode];
  const normalizedSourceName = String(sourceName ?? '').trim();

  return commonCodeLabel || normalizedSourceName || normalizedSourceCode || '미분류';
};

// 대시보드는 원천 상태명을 그대로 노출하지 않고 신청현황 화면의 두 상태그룹만 표시한다.
// 백엔드가 알 수 없는 그룹을 반환하는 경우 임의로 신청중 처리하지 않고 '-'로 표시해 오표시를 방지한다.
export const getSupportApplicationStatusLabel = (statusGroup) => (
  STATUS_LABEL_BY_GROUP[String(statusGroup ?? '').trim().toUpperCase()] || '-'
);

// 상세주소는 신청현황 목록과 대시보드에서 동일하게 정규화한다.
// http(s) 또는 내부 절대경로만 그대로 사용하고, 프로토콜이 생략된 기관 주소에는 https를 보완한다.
export const buildSupportApplicationDetailUrl = (item) => {
  if (!item?.detailAvailable || !item?.detailUrl) {
    return null;
  }

  const trimmed = String(item.detailUrl).trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }

  return `https://${trimmed}`;
};
