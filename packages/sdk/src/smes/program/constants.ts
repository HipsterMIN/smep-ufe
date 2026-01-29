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
 * 기업규모 필터 옵션 (4개)
 * Milvus 필터: $contains_any
 * @see 03_unified_schema.xlsx - SIZE
 */
export const COMPANY_SIZE_OPTIONS: readonly CompanySize[] = [
  "소상공인",
  "중소기업",
  "중견기업",
  "대기업",
] as const;

/**
 * 기업규모별 설명 (상시근로자 기준)
 */
export const COMPANY_SIZE_DESCRIPTIONS: Record<CompanySize, string> = {
  소상공인: "상시근로자 5인 미만",
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


/**
 * 검색 키워드 제안 목록
 *
 * 홈페이지 등에서 빠른 검색을 위한 키워드입니다.
 */
export const SEARCH_KEYWORDS = [
  "수출 지원",
  "R&D 자금",
  "스마트공장",
  "창업 지원",
  "고용 지원",
] as const;


/**
 * 여러 공고 컨텍스트에서의 추천 질문
 *
 * 검색 결과나 세션에 여러 공고가 있을 때 사용합니다.
 */
export const SUGGESTED_QUESTIONS_MULTI_PROGRAM = [
  "우리 회사에 맞는 공고를 추천해주세요",
  // "신청 마감이 임박한 공고는?",
  // "각 공고의 지원 자격을 비교해주세요",
  "가장 지원금액 큰 공고는?", 
] as const;

/**
 * 단일 공고 컨텍스트에서의 추천 질문
 *
 * 특정 공고 하나에 대해 질문할 때 사용합니다.
 */
export const SUGGESTED_QUESTIONS_SINGLE_PROGRAM = [
  "지원 내용과 혜택은?",
  "신청 방법을 알려주세요",
  "신청자격 알려줘",                                                                                                                                                                                                                     
  "지원금액이랑 지원내용 정리해줘",                                                                                                                                                                                                      
  "신청 마감일이 언제야?",                                                                                                                                                                                                               
  "제출서류 뭐 필요해?",      
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
  const month = parseInt(str.slice(4, 6)) - 1; // 0-indexed
  const day = parseInt(str.slice(6, 8));

  // 날짜 유효성 검증
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;

  const end = new Date(year, month, day);

  // Date 객체가 유효한지 확인 (예: 2월 30일 같은 잘못된 날짜 체크)
  if (isNaN(end.getTime())) return null;

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

/** 불릿 포인트 문자 (마크다운 리스트로 변환) */
export const MARKDOWN_BULLET_CHARS = "•◦▪▸▶◆◇●";

/** 원문자 숫자 (숫자 리스트로 변환) */
export const MARKDOWN_CIRCLED_NUMBERS = "①②③④⑤⑥⑦⑧⑨⑩";

/** 특수 마커 문자 (굵은 제목으로 변환) */
export const MARKDOWN_SPECIAL_MARKERS = "❍■□▣";

/** 원문자 숫자 → 숫자 매핑 */
export const CIRCLED_NUMBER_MAP: Record<string, string> = {
  "①": "1.", "②": "2.", "③": "3.", "④": "4.", "⑤": "5.",
  "⑥": "6.", "⑦": "7.", "⑧": "8.", "⑨": "9.", "⑩": "10.",
};

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

  // 정규식 패턴 (상수에서 생성)
  const bulletPattern = new RegExp(`\\s+([${MARKDOWN_BULLET_CHARS}])\\s*`, "g");
  const circledPattern = new RegExp(`\\s+([${MARKDOWN_CIRCLED_NUMBERS}])\\s*`, "g");
  const bulletLinePattern = new RegExp(`^[${MARKDOWN_BULLET_CHARS}]\\s*`);
  const specialMarkerPattern = new RegExp(`^[${MARKDOWN_SPECIAL_MARKERS}]\\s*(.+)$`);

  // 전처리: 불릿/번호가 한 줄에 여러 개 있는 경우 분리
  let processedText = text;

  // 불릿 포인트 분리: "• 항목1 • 항목2" → "• 항목1\n• 항목2"
  processedText = processedText.replace(bulletPattern, "\n$1 ");

  // 원문자 숫자 분리: "① 항목1 ② 항목2" → "① 항목1\n② 항목2"
  processedText = processedText.replace(circledPattern, "\n$1 ");

  const lines = processedText.split("\n");
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // 불릿 포인트 변환
    line = line.replace(bulletLinePattern, "- ");

    // 원문자 숫자 변환
    for (const [circle, num] of Object.entries(CIRCLED_NUMBER_MAP)) {
      if (line.startsWith(circle)) {
        line = line.replace(circle, num);
        break;
      }
    }

    // 특수 마커 → 굵은 제목으로
    line = line.replace(specialMarkerPattern, "\n**$1**\n");

    result.push(line);
  }

  return result.join("\n");
}

// ============================================
// AI 응답 처리
// ============================================

/**
 * AI 응답에서 커스텀 태그 제거
 *
 * 백엔드에서 보내는 커스텀 태그 (<followup>, <clarification> 등)를 제거합니다.
 * 스트리밍 중 불완전한 태그도 처리합니다.
 *
 * @param text - AI 응답 텍스트
 * @param customTags - 제거할 태그 이름 배열 (기본: ["followup"])
 * @returns 태그가 제거된 텍스트
 *
 * @example
 * ```typescript
 * // 완전한 태그 제거
 * stripAIResponseTags("<followup>질문 추천</followup>안녕하세요")
 * // => "안녕하세요"
 *
 * // 불완전한 태그 제거 (스트리밍 중)
 * stripAIResponseTags("응답 중...<followup>아직 닫히지")
 * // => "응답 중..."
 * ```
 */
export function stripAIResponseTags(
  text: string,
  customTags: string[] = ["followup"]
): string {
  let cleaned = text;

  for (const tag of customTags) {
    // 1. 완전한 <tag>...</tag> 블록 제거
    cleaned = cleaned.replace(
      new RegExp(`<${tag}>[\\s\\S]*?</${tag}>`, "gi"),
      ""
    );
    // 2. 불완전한 <tag>... 제거 (닫는 태그 없는 경우 - 스트리밍 중)
    cleaned = cleaned.replace(
      new RegExp(`<${tag}>[\\s\\S]*$`, "gi"),
      ""
    );
    // 3. 고아 닫는 태그 제거
    cleaned = cleaned.replace(
      new RegExp(`</${tag}>`, "gi"),
      ""
    );
  }

  return cleaned.trim();
}

/**
 * AI 응답 텍스트를 마크다운 형식으로 변환
 *
 * SMES AI 응답에서 사용하는 한글 마커를 마크다운 문법으로 변환합니다.
 * react-markdown 등에서 렌더링 시 적절한 구조가 표시됩니다.
 *
 * 변환 규칙:
 * - ■ (섹션) → ### 헤딩
 * - ○ (메인 항목) → - **항목:** 리스트 + 굵게
 * - ※ (참고) → > 인용 블록
 * - ▶ (강조) → **굵게**
 * - ☞ (안내) → *이탤릭*
 *
 * @param text - AI 응답 텍스트
 * @param options - 변환 옵션
 * @returns 마크다운 형식의 텍스트
 *
 * @example
 * ```typescript
 * const markdown = formatAIResponse("■ 사업 개요 ○ 지원 대상: 중소기업");
 * // => "### 사업 개요\n\n- **지원 대상:** 중소기업"
 * ```
 */
export function formatAIResponse(
  text: string,
  options: { stripTags?: boolean } = {}
): string {
  if (!text) return "";

  // 옵션에 따라 태그 제거
  let result = options.stripTags ? stripAIResponseTags(text) : text;

  // 0. GFM 마크다운 취소선 방지: ~ → ～ (fullwidth tilde U+FF5E)
  // "0~1,000" → "0～1,000" (~~text~~가 취소선으로 해석되는 것 방지)
  // result = result.replace(/~/g, '～');
  result = result.replace(/[~\u223C\u02DC\uFF5E]/g, '–')

  // 1. 마커 앞에 줄바꿈 추가 (Markdown은 \n\n이 필요)
  result = result
    .replace(/■/g, '\n\n■')   // 모든 ■ 앞에 줄바꿈
    .replace(/○/g, '\n\n○')   // 모든 ○ 앞에 줄바꿈 (단일→이중)
    .replace(/※/g, '\n\n※')   // 모든 ※ 앞에 줄바꿈
    .replace(/^\n+/, '');      // 문자열 시작의 줄바꿈 제거

  // 2. ■ 헤더: 뒤에 내용이 같은 줄에 있으면 다음 줄로 이동
  // "■ 사업 개요: 내용" → "■ 사업 개요:\n\n내용"
  result = result.replace(
    /(■[^:\n]+:)\s*([^\n])/g,
    '$1\n\n$2'
  );

  // 3. URL을 클릭 가능한 링크로 변환
  // "설명: https://example.com" → "설명: [바로가기](https://example.com)"
  // LLM이 "**url**입니다" 형태로 출력하는 경우: **도 함께 제거
  // 단, 이미 마크다운 링크 형식 ](url) 이면 건너뜀
  result = result.replace(
    /(?<!\]\()\*{0,2}(https?:\/\/[^\s\)\*]+)\*{0,2}/g,
    '[바로가기]($1)'
  );

  // 4. 불완전한 마크다운 정리 (열린 ** 또는 * 닫기)
  // "**바로가기 내용" → "바로가기 내용" (짝이 안 맞으면 제거)
  result = fixIncompleteMarkdown(result);

  // 5. 연속 줄바꿈 정리 (4개 이상 → 2개)
  result = result
    .replace(/\n{4,}/g, '\n\n')
    .trim();

  return result;
}

/**
 * 불완전한 마크다운 마커 정리
 * - 짝이 맞지 않는 ** 또는 * 제거
 */
function fixIncompleteMarkdown(text: string): string {
  // ** (bold) 처리: 짝수개가 아니면 홀수번째 ** 제거
  const boldMatches = text.match(/\*\*/g);
  if (boldMatches && boldMatches.length % 2 !== 0) {
    // 첫 번째 짝 없는 ** 제거
    text = text.replace(/\*\*/, '');
  }

  // * (italic) 처리: **가 아닌 단독 * 중 짝이 안 맞으면 제거
  // 먼저 **를 임시 치환
  const placeholder = '\x00BOLD\x00';
  let temp = text.replace(/\*\*/g, placeholder);
  const italicMatches = temp.match(/\*/g);
  if (italicMatches && italicMatches.length % 2 !== 0) {
    temp = temp.replace(/\*/, '');
  }
  text = temp.replace(new RegExp(placeholder, 'g'), '**');

  return text;
}

// ============================================
// 마감 긴급도
// ============================================

/**
 * 마감 긴급도 레벨
 */
export type UrgencyLevel =
  | "always_open" // 상시/미정
  | "critical"    // D-7 이내
  | "urgent"      // D-14 이내
  | "caution"     // D-30 이내
  | "normal";     // 그 외

/**
 * 남은 일수로 마감 긴급도 레벨 결정
 *
 * UI에서 마감 임박 표시, 색상 결정 등에 사용합니다.
 * 임계값: critical(7일), urgent(14일), caution(30일)
 *
 * @param daysLeft - 마감까지 남은 일수 (null/999+ = 상시)
 * @returns 긴급도 레벨
 *
 * @example
 * ```typescript
 * getDeadlineUrgency(3);   // => "critical"
 * getDeadlineUrgency(10);  // => "urgent"
 * getDeadlineUrgency(20);  // => "caution"
 * getDeadlineUrgency(60);  // => "normal"
 * getDeadlineUrgency(999); // => "always_open"
 * getDeadlineUrgency(null); // => "always_open"
 * ```
 */
export function getDeadlineUrgency(daysLeft: number | null): UrgencyLevel {
  if (daysLeft === null || daysLeft >= 999) return "always_open";
  if (daysLeft <= DEADLINE_WARNING_THRESHOLD) return "critical";
  if (daysLeft <= DEADLINE_CAUTION_THRESHOLD) return "urgent";
  if (daysLeft <= 30) return "caution";
  return "normal";
}

/**
 * 긴급도 레벨별 스타일 힌트 (프레임워크 무관)
 *
 * UI 프레임워크에서 색상, 배경색 등을 결정할 때 참고합니다.
 */
export const URGENCY_STYLE_HINTS: Record<
  UrgencyLevel,
  { color: string; severity: "critical" | "high" | "medium" | "low" }
> = {
  always_open: { color: "green", severity: "low" },
  critical: { color: "red", severity: "critical" },
  urgent: { color: "orange", severity: "high" },
  caution: { color: "yellow", severity: "medium" },
  normal: { color: "blue", severity: "low" },
};

/**
 * 긴급도 레벨별 Tailwind CSS 클래스
 */
export interface UrgencyColorClasses {
  /** 배경색 클래스 (예: "bg-red-50") */
  bg: string;
  /** 테두리색 클래스 (예: "border-red-200") */
  border: string;
  /** 텍스트색 클래스 (예: "text-red-600") */
  text: string;
}

/**
 * 긴급도 레벨별 Tailwind CSS 클래스 매핑
 */
export const URGENCY_COLOR_CLASSES: Record<UrgencyLevel, UrgencyColorClasses> = {
  always_open: { bg: "bg-green-50", border: "border-green-200", text: "text-green-600" },
  critical: { bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
  urgent: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600" },
  caution: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-600" },
  normal: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
};

/**
 * 남은 일수로 긴급도 색상 클래스 반환
 *
 * @param daysLeft - 마감까지 남은 일수 (999 이상 = 상시)
 * @returns Tailwind CSS 클래스 객체
 *
 * @example
 * ```typescript
 * const { bg, text } = getUrgencyColorClasses(5);
 * // => { bg: "bg-red-50", border: "border-red-200", text: "text-red-600" }
 *
 * <div className={`${bg} ${text}`}>D-5</div>
 * ```
 */
export function getUrgencyColorClasses(daysLeft: number | null): UrgencyColorClasses {
  const level = getDeadlineUrgency(daysLeft);
  return URGENCY_COLOR_CLASSES[level];
}

/**
 * 상시 접수 프로그램 여부 확인
 *
 * @param daysLeft - 남은 일수 (999 이상이면 상시)
 */
export function isAlwaysOpenProgram(daysLeft: number | null): boolean {
  return daysLeft === null || daysLeft >= 999;
}

/**
 * 남은 일수를 표시용 문자열로 변환
 *
 * @param daysLeft - 남은 일수
 * @returns "상시" 또는 "D-N" 형식 문자열
 *
 * @example
 * ```typescript
 * formatDaysLeftDisplay(999); // => "상시"
 * formatDaysLeftDisplay(5);   // => "D-5"
 * formatDaysLeftDisplay(0);   // => "D-Day"
 * ```
 */
export function formatDaysLeftDisplay(daysLeft: number | null): string {
  if (isAlwaysOpenProgram(daysLeft)) return "상시";
  if (daysLeft === 0) return "D-Day";
  return `D-${daysLeft}`;
}

// ============================================
// 필터 빌더 (Milvus 필터 생성)
// ============================================

/**
 * 필터 카테고리별 백엔드 필드 매핑
 *
 * UI 필터 카테고리 → Milvus 스키마 필드 변환
 */
export const FILTER_FIELD_MAP: Record<string, string> = {
  지역: "regions",
  기업규모: "company_sizes",
  지원분야: "support_field",
  지원유형: "support_types",
  마감유형: "deadline_type",
} as const;

/**
 * 필터 카테고리 타입
 */
export type FilterCategory = keyof typeof FILTER_FIELD_MAP;

/**
 * 필터 빌더 옵션
 */
export interface BuildFiltersOptions {
  /** 마감된 공고 포함 여부 (기본: false) */
  includeClosedPrograms?: boolean;
  /** 기준 날짜 (기본: 오늘) */
  baseDate?: Date;
}

/**
 * 필터 옵션 정의
 */
export interface FilterOption {
  name: string;
  count?: number;
}

/**
 * 카테고리별 필터 옵션 정의
 */
export type FilterOptionsMap = Record<FilterCategory | string, FilterOption[]>;

/**
 * SDK 상수 기반 기본 필터 옵션 맵 생성
 *
 * @example
 * ```typescript
 * const filterOptions = createDefaultFilterOptions();
 * // => { 지역: [{name: "서울"}, {name: "경기"}, ...], ... }
 * ```
 */
export function createDefaultFilterOptions(): FilterOptionsMap {
  return {
    지역: REGION_OPTIONS.map((name) => ({ name })),
    기업규모: COMPANY_SIZE_OPTIONS.map((name) => ({ name })),
    지원분야: SUPPORT_FIELD_OPTIONS.map((name) => ({ name })),
    지원유형: SUPPORT_TYPE_OPTIONS.map((name) => ({ name })),
    마감유형: DEADLINE_TYPE_OPTIONS.map((name) => ({ name })),
  };
}

/**
 * 선택된 필터값을 Milvus 필터 객체로 변환
 *
 * UI에서 선택된 필터값(예: ["서울", "중소기업"])을
 * 백엔드 API가 이해하는 Milvus 필터 형식으로 변환합니다.
 *
 * @param activeFilters - 선택된 필터값 배열
 * @param options - 추가 옵션 (마감 공고 포함 등)
 * @returns Milvus 필터 객체 또는 undefined
 *
 * @example
 * ```typescript
 * const filters = buildSMEsFilters(["서울", "중소기업"], { includeClosedPrograms: false });
 * // => {
 * //   apply_end_date: { $or: [{ $gte: "20240118" }, { $eq: 0 }] },
 * //   regions: { $contains_any: ["서울"] },
 * //   company_sizes: { $contains_any: ["중소기업"] }
 * // }
 * ```
 */
export function buildSMEsFilters(
  activeFilters: string[],
  options: BuildFiltersOptions = {}
): Record<string, unknown> | undefined {
  const { includeClosedPrograms = false, baseDate = new Date() } = options;
  const filters: Record<string, unknown> = {};

  // 1. 마감공고 제외 (기본): 오늘 이후 마감인 공고만 검색
  // 날짜가 없는 공고(상시모집 등)도 포함해야 하므로 $or 사용
  if (!includeClosedPrograms) {
    const dateStr = `${baseDate.getFullYear()}${String(baseDate.getMonth() + 1).padStart(2, "0")}${String(baseDate.getDate()).padStart(2, "0")}`;
    filters.apply_end_date = { $or: [{ $gte: dateStr }, { $eq: 0 }] };
  }

  // 2. 필터 옵션 정의 (역매핑용)
  const filterOptions = createDefaultFilterOptions();

  // 3. activeFilters를 백엔드 필드로 변환
  const filtersByCategory: Record<string, string[]> = {};

  for (const filterValue of activeFilters) {
    // 어떤 카테고리에 속하는지 찾기
    for (const [category, categoryOptions] of Object.entries(filterOptions)) {
      if (categoryOptions.some((opt) => opt.name === filterValue)) {
        const fieldName = FILTER_FIELD_MAP[category];
        if (fieldName) {
          if (!filtersByCategory[fieldName]) {
            filtersByCategory[fieldName] = [];
          }
          filtersByCategory[fieldName].push(filterValue);
        }
        break;
      }
    }
  }

  // 4. 백엔드 필터 형식으로 변환
  for (const [field, values] of Object.entries(filtersByCategory)) {
    if (values.length === 1) {
      // 단일 값
      if (field === "support_field" || field === "deadline_type") {
        // string 필드: 직접 매칭
        filters[field] = values[0];
      } else {
        // array 필드: $contains_any
        filters[field] = { $contains_any: values };
      }
    } else if (values.length > 1) {
      // 복수 값
      if (field === "support_field" || field === "deadline_type") {
        filters[field] = { $in: values };
      } else {
        filters[field] = { $contains_any: values };
      }
    }
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
}

/**
 * 단일 카테고리 필터값을 Milvus 필터 조건으로 변환
 *
 * @param category - 필터 카테고리 (지역, 기업규모 등)
 * @param values - 선택된 값 배열
 * @returns Milvus 필터 조건 객체
 *
 * @example
 * ```typescript
 * const condition = buildCategoryFilter("지역", ["서울", "경기"]);
 * // => { regions: { $contains_any: ["서울", "경기"] } }
 * ```
 */
export function buildCategoryFilter(
  category: FilterCategory,
  values: string[]
): Record<string, unknown> | undefined {
  if (values.length === 0) return undefined;

  const fieldName = FILTER_FIELD_MAP[category];
  if (!fieldName) return undefined;

  if (values.length === 1) {
    if (fieldName === "support_field" || fieldName === "deadline_type") {
      return { [fieldName]: values[0] };
    }
    return { [fieldName]: { $contains_any: values } };
  }

  if (fieldName === "support_field" || fieldName === "deadline_type") {
    return { [fieldName]: { $in: values } };
  }
  return { [fieldName]: { $contains_any: values } };
}

// ============================================
// 상태 메시지 변환 (친근한 대화체)
// ============================================

/**
 * 기술적 상태 메시지 → 친근한 대화체 매핑
 *
 * 백엔드에서 전송하는 기술적 상태 메시지를 사용자 친화적인 메시지로 변환합니다.
 * 키는 부분 매칭으로 검색됩니다 (예: "검색 중..." → "검색 중" 매칭).
 */
export const FRIENDLY_STATUS_MESSAGES: Record<string, string> = {
  // 검색/분석 단계
  "검색 중": "관련 지원사업을 찾아보고 있어요",
  "분석 중": "찾은 정보를 꼼꼼히 분석하고 있어요",
  "요약 중": "핵심 내용을 정리하고 있어요",
  "결과 처리 중": "거의 다 됐어요, 결과를 정리하고 있어요",
  // 벡터 검색
  "벡터 검색 중": "비슷한 지원사업을 찾아보고 있어요",
  "유사 문서 검색 중": "연관된 공고들을 모으고 있어요",
  // AI 처리
  "AI 응답 생성 중": "AI가 맞춤 정보를 준비하고 있어요",
  "응답 생성 중": "답변을 작성하고 있어요",
  // 연결
  "연결 중": "서버와 연결하고 있어요",
  "스트리밍 시작": "실시간으로 정보를 가져오고 있어요",
} as const;

/**
 * 기술적 상태 메시지를 친근한 대화체로 변환
 *
 * 백엔드에서 보내는 상태 메시지(예: "검색 중...")를
 * 사용자 친화적인 메시지로 변환합니다.
 *
 * @param message - 원본 상태 메시지 (undefined 가능)
 * @param fallback - 매칭되지 않을 때 반환할 기본 메시지
 * @returns 친근한 상태 메시지
 *
 * @example
 * ```typescript
 * toFriendlyStatusMessage("검색 중...", "처리 중이에요...");
 * // => "관련 지원사업을 찾아보고 있어요"
 *
 * toFriendlyStatusMessage(undefined, "잠시만 기다려주세요...");
 * // => "잠시만 기다려주세요..."
 *
 * toFriendlyStatusMessage("알 수 없는 상태", "처리 중이에요...");
 * // => "알 수 없는 상태하고 있어요..."
 * ```
 */
export function toFriendlyStatusMessage(
  message: string | undefined,
  fallback: string
): string {
  if (!message) return fallback;

  // 부분 매칭으로 친근한 메시지 찾기
  for (const [key, friendly] of Object.entries(FRIENDLY_STATUS_MESSAGES)) {
    if (message.includes(key)) return friendly;
  }

  // 매칭되지 않으면 원본 메시지에 친근한 어미 추가
  const cleaned = message.replace(/\.\.\.$/, "").replace(/\.$/, "");
  return `${cleaned}하고 있어요...`;
}
