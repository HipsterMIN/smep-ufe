/**
 * 지원사업 도메인 모듈
 *
 * 2차 데이터레이크 정규화 스키마 기반
 * @see labs/analysis/smes/02_implementation.xlsx
 */

// ─────────────────────────────────────────
// 타입 (2차 데이터레이크 스키마)
// ─────────────────────────────────────────
export type {
  // 메인 DTO
  SupportProgram,
  SupportProgramSource,
  // 분류 타입
  AnnouncementStatus,
  ApplicationStatus,
  DeadlineType,
  SupportField,
  CompanySize,
  SupportType,
  Region,
  // 기업 프로필
  CompanyProfile,
  // 채팅 메시지
  ProgramChatMessage,
  // 인용 (법령, FAQ 등)
  Citation,
} from "./types";

// ─────────────────────────────────────────
// 상수 및 필터 옵션
// ─────────────────────────────────────────
export {
  // 마감 임계값
  DEADLINE_WARNING_THRESHOLD,
  DEADLINE_CAUTION_THRESHOLD,
  // 필터 옵션 배열
  REGION_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  COMPANY_SIZE_DESCRIPTIONS,
  SUPPORT_FIELD_OPTIONS,
  SUPPORT_TYPE_OPTIONS,
  DEADLINE_TYPE_OPTIONS,
  // 배지 매핑
  DEADLINE_TYPE_BADGE_VARIANT,
  SUPPORT_FIELD_BADGE_VARIANT,
  // 기본값
  DEFAULT_VALUES,
  // 추천 질문
  SUGGESTED_QUESTIONS,
  // 유틸리티 함수
  formatDate,
  calculateDaysRemaining,
  isApplicationOpen,
  getApplicationStatus,
  convertKoreanToMarkdown,
  // 타입
  type BadgeVariant,
} from "./constants";

// ─────────────────────────────────────────
// 유틸리티 함수 (매퍼)
// ─────────────────────────────────────────
export {
  getDeadlineVariant,
  getDeadlineTypeBadgeVariant,
  hasRealDeadline,
  mapSourceToProgram,
  mapSourcesToPrograms,
} from "./mappers";

// ─────────────────────────────────────────
// Service Hooks (SDK 추상화)
// ─────────────────────────────────────────
export {
  ProgramSearchProvider,
  useProgramSearch,
  type SearchFilters,
  type FilterState,
  DEFAULT_FILTER_STATE,
  type ProgramSearchProviderProps,
  ProgramChatProvider,
  useProgramChat,
} from "./hooks";

// ─────────────────────────────────────────
// Headless Components
// ─────────────────────────────────────────
export {
  ProgramChat,
  ProgramChatRoot,
  ProgramChatMessages,
  ProgramChatInput,
  type ProgramChatRootProps,
  type ProgramChatMessagesProps,
  type ProgramChatInputProps,
  type InputRenderProps,
  type SendButtonRenderProps,
} from "./components/ProgramChat";

// ─────────────────────────────────────────
// SDK Provider (re-export from react layer)
// ─────────────────────────────────────────
export { CubeIAxProvider } from "../../react";
export type { CubeIAxProviderProps } from "../../react";

