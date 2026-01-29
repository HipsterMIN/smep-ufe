/**
 * SMES 지원사업 도메인 모듈
 *
 * SMES 특화 타입, 상수, 매퍼 제공
 * 범용 Chat/Search는 @cube-i-ax/sdk/react에서 import
 *
 * @example
 * ```tsx
 * // SMES 특화 타입/매퍼
 * import { SupportProgram, mapSourceToProgram } from '@cube-i-ax/sdk/smes';
 *
 * // 범용 Chat (react 레이어)
 * import { ChatProvider, useChat } from '@cube-i-ax/sdk/react';
 *
 * function App() {
 *   return (
 *     <CubeIAxProvider apiKey="...">
 *       <ChatProvider>
 *         <MyChat />
 *       </ChatProvider>
 *     </CubeIAxProvider>
 *   );
 * }
 *
 * function MyChat() {
 *   const { messages, send } = useChat();
 *   // sources를 SupportProgram으로 변환
 *   const programs = messages[0]?.sources?.map(mapSourceToProgram);
 * }
 * ```
 */

// ─────────────────────────────────────────
// 타입 (SMES 도메인 특화)
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
  // 채팅 메시지 (SMES 특화)
  ProgramChatMessage,
  // 인용 (법령, FAQ 등)
  Citation,
  // 대화 아이템 (UI용)
  SMESConversation,
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
  // 검색 키워드
  SEARCH_KEYWORDS,
  // 컨텍스트별 추천 질문
  SUGGESTED_QUESTIONS_MULTI_PROGRAM,
  SUGGESTED_QUESTIONS_SINGLE_PROGRAM,
  // 유틸리티 함수
  formatDate,
  calculateDaysRemaining,
  isApplicationOpen,
  getApplicationStatus,
  convertKoreanToMarkdown,
  // 마크다운 변환 상수
  MARKDOWN_BULLET_CHARS,
  MARKDOWN_CIRCLED_NUMBERS,
  MARKDOWN_SPECIAL_MARKERS,
  CIRCLED_NUMBER_MAP,
  // AI 응답 처리
  stripAIResponseTags,
  formatAIResponse,
  // 마감 긴급도
  getDeadlineUrgency,
  URGENCY_STYLE_HINTS,
  URGENCY_COLOR_CLASSES,
  getUrgencyColorClasses,
  isAlwaysOpenProgram,
  formatDaysLeftDisplay,
  type UrgencyLevel,
  type UrgencyColorClasses,
  // 타입
  type BadgeVariant,
  // 필터 빌더
  FILTER_FIELD_MAP,
  createDefaultFilterOptions,
  buildSMEsFilters,
  buildCategoryFilter,
  type FilterCategory,
  type BuildFiltersOptions,
  type FilterOption,
  type FilterOptionsMap,
  // 상태 메시지 변환 (친근한 대화체)
  FRIENDLY_STATUS_MESSAGES,
  toFriendlyStatusMessage,
} from "./constants";

// ─────────────────────────────────────────
// 필터 유틸리티 (UI → SDK 쿼리 변환)
// ─────────────────────────────────────────
export {
  convertFiltersToQuery,
  isFiltersEmpty,
  countSelectedFilters,
  DEFAULT_SEARCH_FILTERS,
  type SearchFilters,
  type FilterConversionOptions,
} from "./filters";

// ─────────────────────────────────────────
// 매퍼 함수 (Source → SupportProgram)
// ─────────────────────────────────────────
export {
  getDeadlineVariant,
  getDeadlineTypeBadgeVariant,
  hasRealDeadline,
  mapSourceToProgram,
  mapSourcesToPrograms,
  // 테이블 표시용 포맷터
  formatAmount,
  formatProgramForTable,
  type ProgramTableRow,
  // 대화 변환
  transformMessagesToConversations,
  buildConversationBreadcrumb,
  type TransformMessagesOptions,
} from "./mappers";

// ─────────────────────────────────────────
// SMES Service Hooks (Search/Chat Providers)
// ─────────────────────────────────────────
export {
  ProgramSearchProvider,
  useProgramSearch,
  ProgramChatProvider,
  useProgramChat,
  type ProgramSearchContextValue,
  type ProgramSearchProviderProps,
  type ProgramChatContextValue,
} from "./hooks";

// ─────────────────────────────────────────
// Re-export from core layer (도메인 라우팅)
// ─────────────────────────────────────────
export { Domain, type DomainType } from "../../core";
