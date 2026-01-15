/**
 * 지원사업 도메인 상수 정의
 *
 * 2차 데이터레이크 정규화 스키마 기반 필터 옵션
 * @see labs/analysis/smes/02_implementation.xlsx
 */

import type {
  DeadlineType,
  SupportField,
  CompanySize,
  SupportType,
  Region,
  ApplicationStatus,
} from "./types";

// ============================================
// 마감 관련 상수
// ============================================

/** 마감임박으로 간주하는 임계값 (일) */
export const DEADLINE_WARNING_THRESHOLD = 7;

/** 마감 주의로 간주하는 임계값 (일) */
export const DEADLINE_CAUTION_THRESHOLD = 14;

// ============================================
// UI 필터 옵션 (3_UI_필터 시트)
// ============================================

/**
 * 지역 필터 옵션 (17개 시도 + 전국)
 * Milvus 필터: $contains_any, 전국 자동포함
 */
export const REGION_OPTIONS: readonly Region[] = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
  "전국",
] as const;

/**
 * 기업규모 필터 옵션 (6개)
 * Milvus 필터: $contains_any, 중소기업 확장
 * @see 03_unified_schema.xlsx - SIZE
 */
export const COMPANY_SIZE_OPTIONS: readonly CompanySize[] = [
  "소상공인",
  "소기업",
  "중기업",
  "중소기업",
  "중견기업",
  "대기업",
] as const;

/**
 * 기업규모별 설명 (상시근로자 기준)
 */
export const COMPANY_SIZE_DESCRIPTIONS: Record<CompanySize, string> = {
  소상공인: "상시근로자 5인 미만",
  소기업: "상시근로자 50인 미만",
  중기업: "상시근로자 100인 미만",
  중소기업: "상시근로자 300인 미만",
  중견기업: "중소기업 초과",
  대기업: "중견기업 초과",
};

/**
 * 지원분야 필터 옵션 (8개 + 기타)
 */
export const SUPPORT_FIELD_OPTIONS: readonly SupportField[] = [
  "기술개발",
  "자금지원",
  "판로개척",
  "창업지원",
  "시설·설비",
  "인력양성",
  "경영지원",
  "해외진출",
  "기타",
] as const;

/**
 * 지원유형 필터 옵션 (9개)
 * @see 03_unified_schema.xlsx - SUPPORT_TYPE
 */
export const SUPPORT_TYPE_OPTIONS: readonly SupportType[] = [
  "자금",
  "R&D",
  "교육",
  "컨설팅",
  "마케팅",
  "수출",
  "시설",
  "인증",
  "고용",
] as const;

/**
 * 마감유형 필터 옵션 (5개)
 * @see 03_unified_schema.xlsx - DEADLINE_TYPE
 */
export const DEADLINE_TYPE_OPTIONS: readonly DeadlineType[] = [
  "상시",
  "예산소진시",
  "기간지정",
  "선착순",
  "미정",
] as const;

// ============================================
// 배지 스타일 매핑
// ============================================

/**
 * 배지 variant 타입 (UI Badge 컴포넌트와 호환)
 */
export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning";

/**
 * 마감유형별 배지 variant 매핑
 * @see 03_unified_schema.xlsx - DEADLINE_TYPE
 */
export const DEADLINE_TYPE_BADGE_VARIANT: Record<DeadlineType, BadgeVariant> = {
  상시: "outline",
  예산소진시: "warning",
  기간지정: "default",
  선착순: "warning",
  미정: "secondary",
};

/**
 * 지원분야별 배지 색상 매핑
 */
export const SUPPORT_FIELD_BADGE_VARIANT: Record<SupportField, BadgeVariant> = {
  기술개발: "default",
  자금지원: "success",
  판로개척: "default",
  창업지원: "default",
  "시설·설비": "secondary",
  인력양성: "secondary",
  경영지원: "outline",
  해외진출: "default",
  기타: "outline",
};

// ============================================
// 추천 질문 (AI 채팅용)
// ============================================

/**
 * AI 채팅 추천 질문 목록
 *
 * 사용자가 빠르게 선택할 수 있는 예시 질문들입니다.
 */
export const SUGGESTED_QUESTIONS = [
  "창업 지원사업 추천해줘",
  "제조업 관련 지원 있어?",
  "마감 임박한 사업은?",
  "소상공인 대상 지원 보여줘",
  "기술개발 R&D 지원사업",
  "수출 지원 프로그램 알려줘",
  "인력채용 지원사업 찾아줘",
  "청년창업 지원 뭐가 있어?",
] as const;

// ============================================
// 기본값
// ============================================

/**
 * 필드 기본값 (데이터 없을 때 표시)
 */
export const DEFAULT_VALUES = {
  title: "제목 없음",
  agency: "기관 미상",
  supportField: "기타" as SupportField,
  applyPeriod: "기간 미정",
  bizOutline: "사업 개요 없음",
  supportContent: "지원내용 확인 필요",
  deadlineType: "기간지정" as DeadlineType,
} as const;

// ============================================
// 날짜 포맷팅
// ============================================

/**
 * YYYYMMDD 형식의 숫자를 날짜 문자열로 변환
 */
export function formatDate(date: number | null): string {
  if (!date) return "-";
  const str = String(date);
  if (str.length !== 8) return "-";
  return `${str.slice(0, 4)}.${str.slice(4, 6)}.${str.slice(6, 8)}`;
}

/**
 * 마감일까지 남은 일수 계산
 */
export function calculateDaysRemaining(endDate: number | null): number | null {
  if (!endDate) return null;

  const str = String(endDate);
  if (str.length !== 8) return null;

  const year = parseInt(str.slice(0, 4));
  const month = parseInt(str.slice(4, 6)) - 1;
  const day = parseInt(str.slice(6, 8));

  const end = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = end.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * 신청 가능 여부 확인
 */
export function isApplicationOpen(
  startDate: number | null,
  endDate: number | null,
  deadlineType: DeadlineType
): boolean {
  // 상시 접수는 항상 가능
  if (deadlineType === "상시") return true;

  // 미정은 기간 정보가 없으므로 마감 여부 판단 불가, 일단 가능으로 처리
  if (deadlineType === "미정") return true;

  const today = new Date();
  const todayNum = parseInt(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`
  );

  // 시작일 체크
  if (startDate && todayNum < startDate) return false;

  // 마감일 체크
  if (endDate && todayNum > endDate) return false;

  return true;
}

/**
 * 신청 상태 계산 (UI 표시용)
 *
 * 마감일과 마감유형에 따라 신청 상태를 반환합니다.
 *
 * @param startDate - 신청 시작일 (YYYYMMDD)
 * @param endDate - 신청 마감일 (YYYYMMDD)
 * @param deadlineType - 마감 유형
 * @returns 신청 상태 ("접수중" | "마감임박" | "마감" | "상시" | "접수예정")
 *
 * @example
 * ```typescript
 * const status = getApplicationStatus(program.startDate, program.endDate, program.deadlineType);
 * // => "접수중", "마감임박", "마감", "상시", "접수예정"
 * ```
 */
export function getApplicationStatus(
  startDate: number | null,
  endDate: number | null,
  deadlineType: DeadlineType
): ApplicationStatus {
  // 상시 접수
  if (deadlineType === "상시") return "상시";

  // 미정은 기간 정보가 없으므로 상시와 유사하게 처리
  if (deadlineType === "미정") return "접수중";

  const today = new Date();
  const todayNum = parseInt(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`
  );

  // 접수예정 (시작일 전)
  if (startDate && todayNum < startDate) return "접수예정";

  // 마감 (마감일 후)
  const daysRemaining = calculateDaysRemaining(endDate);
  if (daysRemaining !== null && daysRemaining < 0) return "마감";

  // 마감임박 (D-7 이내)
  if (daysRemaining !== null && daysRemaining <= DEADLINE_WARNING_THRESHOLD) {
    return "마감임박";
  }

  return "접수중";
}

// ============================================
// 텍스트 변환
// ============================================

/**
 * 한국어 형식의 텍스트를 마크다운으로 변환
 *
 * 지원사업 상세 정보에서 자주 사용되는 한국어 서식을 마크다운으로 변환합니다.
 * - • 불릿 포인트 → - 리스트
 * - ①②③ 원문자 숫자 → 1. 2. 3. 숫자 리스트
 * - ❍, ■, □, ▣ 특수 마커 → **굵은 제목**
 *
 * @param text - 변환할 텍스트
 * @returns 마크다운 형식의 텍스트
 *
 * @example
 * ```typescript
 * const markdown = convertKoreanToMarkdown("• 항목1 • 항목2");
 * // => "- 항목1\n- 항목2"
 *
 * const markdown = convertKoreanToMarkdown("① 첫번째 ② 두번째");
 * // => "1. 첫번째\n2. 두번째"
 * ```
 */
export function convertKoreanToMarkdown(text: string): string {
  if (!text) return "";

  // 전처리: 불릿/번호가 한 줄에 여러 개 있는 경우 분리
  let processedText = text;

  // 불릿 포인트 분리: "• 항목1 • 항목2" → "• 항목1\n• 항목2"
  processedText = processedText.replace(/\s+([•◦▪▸▶◆◇●])\s*/g, "\n$1 ");

  // 원문자 숫자 분리: "① 항목1 ② 항목2" → "① 항목1\n② 항목2"
  processedText = processedText.replace(/\s+([①②③④⑤⑥⑦⑧⑨⑩])\s*/g, "\n$1 ");

  const lines = processedText.split("\n");
  const result: string[] = [];

  // 원문자 숫자 매핑
  const circledNumbers: Record<string, string> = {
    "①": "1.", "②": "2.", "③": "3.", "④": "4.", "⑤": "5.",
    "⑥": "6.", "⑦": "7.", "⑧": "8.", "⑨": "9.", "⑩": "10.",
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // 불릿 포인트 변환 (•, ◦, ▪, ▸, ▶, ◆, ◇, ●)
    line = line.replace(/^[•◦▪▸▶◆◇●]\s*/, "- ");

    // 원문자 숫자 변환 (①②③④⑤⑥⑦⑧⑨⑩)
    for (const [circle, num] of Object.entries(circledNumbers)) {
      if (line.startsWith(circle)) {
        line = line.replace(circle, num);
        break;
      }
    }

    // 특수 마커 (❍, ■, □, ▣) → 굵은 제목으로
    line = line.replace(/^[❍■□▣]\s*(.+)$/, "\n**$1**\n");

    result.push(line);
  }

  return result.join("\n");
}
