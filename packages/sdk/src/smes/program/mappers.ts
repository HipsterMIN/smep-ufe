/**
 * 지원사업 도메인 매핑 함수
 *
 * 2차 데이터레이크 스키마 기반 매핑
 * @see labs/analysis/smes/02_implementation.xlsx
 */

import { getSourceField, type Source, type ItemDetail, type Message } from "../../core";
import type {
  SupportProgram,
  SupportProgramSource,
  SMESConversation,
  DeadlineType,
  SupportField,
  Region,
  CompanySize,
  SupportType,
  AnnouncementStatus,
} from "./types";
import {
  DEADLINE_WARNING_THRESHOLD,
  DEADLINE_CAUTION_THRESHOLD,
  DEFAULT_VALUES,
  calculateDaysRemaining,
  getApplicationStatus,
  REGION_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  SUPPORT_TYPE_OPTIONS,
  DEADLINE_TYPE_OPTIONS,
  SUPPORT_FIELD_OPTIONS,
  type BadgeVariant,
} from "./constants";

// ============================================
// 텍스트 정리 유틸
// ============================================

/**
 * 깨진 유니코드 문자 정리
 * - U+FFFD (�) 제거
 * - 연속된 특수문자 정리
 */
function sanitizeText(text: string): string {
  if (!text) return text;
  return text
    // U+FFFD (replacement character) 제거
    .replace(/\uFFFD+/g, '')
    // 결과적으로 빈 괄호가 생기면 정리: [] () 「」 『』 등
    .replace(/[\[\]()「」『』]{2,}/g, '')
    // 앞뒤 공백 정리
    .trim();
}

// ============================================
// 마감 관련 유틸
// ============================================

/**
 * 남은 일수로 마감 긴급도 variant 결정
 */
export function getDeadlineVariant(daysRemaining: number | null): BadgeVariant {
  if (daysRemaining === null) return "outline"; // 상시/미정
  if (daysRemaining < 0) return "secondary"; // 마감
  if (daysRemaining <= DEADLINE_WARNING_THRESHOLD) return "destructive";
  if (daysRemaining <= DEADLINE_CAUTION_THRESHOLD) return "warning";
  return "default";
}

/**
 * 마감유형으로 배지 variant 결정
 */
export function getDeadlineTypeBadgeVariant(deadlineType: DeadlineType): BadgeVariant {
  switch (deadlineType) {
    case "상시":
      return "outline";
    case "예산소진시":
    case "선착순":
      return "warning";
    case "미정":
      return "secondary";
    default:
      return "default";
  }
}

/**
 * 실제 마감일이 있는지 확인
 */
export function hasRealDeadline(deadlineType: DeadlineType): boolean {
  return deadlineType === "기간지정";
}

// ============================================
// Source → SupportProgram 매핑
// ============================================

/**
 * SDK Source를 SupportProgram으로 변환
 *
 * 2차 데이터레이크 스키마 기반으로 snake_case → camelCase 변환
 */
export function mapSourceToProgram(
  source: Source | SupportProgramSource,
  index: number
): SupportProgram {
  // 타입 안전한 필드 접근 헬퍼
  const get = <T = string>(key: string) => getSourceField<T>(source, key);
  const getArray = (key: string): string[] => {
    const val = get<string[] | string>(key);
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val) return val.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  };
  const getBool = (key: string): boolean => {
    const val = get<boolean | string | null | undefined>(key);
    if (val === null || val === undefined) return false;
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
      const lower = val.toLowerCase();
      return ["true", "1", "yes", "on"].includes(lower);
    }
    return Boolean(val);
  };
  const getNum = (key: string): number | null => {
    const val = get<number | string | null>(key);
    if (val === null || val === undefined || val === "") return null;
    const num = typeof val === "number" ? val : parseFloat(val);
    return isNaN(num) ? null : num;
  };
  
  // Unix timestamp → YYYYMMDD 변환
  const tsToYYYYMMDD = (ts: number): number => {
    const date = new Date(ts * 1000);
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  };
  
  // 날짜 필드: YYYYMMDD 우선, 없으면 _ts에서 변환
  const getDate = (key: string): number | null => {
    const val = getNum(key);
    if (val !== null) return val;
    const tsVal = getNum(`${key}_ts`);
    if (tsVal !== null && tsVal > 19000000) {
      // Unix timestamp로 판단 (1970년 이후의 값)
      return tsToYYYYMMDD(tsVal);
    }
    return null;
  };

  // 문서 ID (group_id 최우선 - 공고 단위 식별자)
  const groupId = get("group_id");
  const sourceId = get("id");
  const docId =
    groupId ||
    sourceId ||
    source.documentId ||
    get("file_id") ||
    get("program_id");

  // 마감유형 결정 (상수 배열로 유효성 검증)
  const deadlineTypeRaw = get("deadline_type") || DEFAULT_VALUES.deadlineType;
  const deadlineType = (
    (DEADLINE_TYPE_OPTIONS as readonly string[]).includes(deadlineTypeRaw)
      ? deadlineTypeRaw
      : DEFAULT_VALUES.deadlineType
  ) as DeadlineType;

  // 지원분야 결정 (상수 배열로 유효성 검증)
  const supportFieldRaw = get("support_field") || DEFAULT_VALUES.supportField;
  const supportField = (
    (SUPPORT_FIELD_OPTIONS as readonly string[]).includes(supportFieldRaw)
      ? supportFieldRaw
      : DEFAULT_VALUES.supportField
  ) as SupportField;

  // 상태 결정
  const statusRaw = get("status") || "N";
  const status = (["N", "D", "U"].includes(statusRaw) ? statusRaw : "N") as AnnouncementStatus;

  return {
    // 식별자 및 날짜 (엑셀 스키마 기준)
    id: docId || `result-${index}`,
    vsId: get("vs_id") || undefined,
    startDate: getDate("apply_start_date"),
    endDate: getDate("apply_end_date"),
    registerDate: getDate("register_date"),
    deadlineType,

    // 정규화 배열 필드 (유효한 값만 필터링)
    regions: getArray("regions").filter((r) =>
      (REGION_OPTIONS as readonly string[]).includes(r)
    ) as Region[],
    companySizes: getArray("company_sizes").filter((s) =>
      (COMPANY_SIZE_OPTIONS as readonly string[]).includes(s)
    ) as CompanySize[],
    industries: getArray("industries"),
    supportTypes: getArray("support_types").filter((t) =>
      (SUPPORT_TYPE_OPTIONS as readonly string[]).includes(t)
    ) as SupportType[],
    certifications: getArray("certifications"),
    excludedConditions: getArray("excluded_conditions"),

    // Boolean 필드 - CERT
    isVentureTarget: getBool("is_venture_target"),
    isInnobizTarget: getBool("is_innobiz_target"),
    isMainbizTarget: getBool("is_mainbiz_target"),
    hasResearchDept: getBool("has_research_dept"),
    hasPatent: getBool("has_patent"),
    hasIso: getBool("has_iso"),

    // Boolean 필드 - BIZ_TYPE
    isStartupTarget: getBool("is_startup_target"),
    isSmeTarget: getBool("is_sme_target"),
    isSocialEnterpriseTarget: getBool("is_social_enterprise_target"),

    // Boolean 필드 - OWNER
    isWomenTarget: getBool("is_women_target"),
    isYouthTarget: getBool("is_youth_target"),
    isDisabledTarget: getBool("is_disabled_target"),
    isExporterTarget: getBool("is_exporter_target"),
    isVeteranTarget: getBool("is_veteran_target"),
    isSeniorTarget: getBool("is_senior_target"),

    // Boolean 필드 - PURPOSE (10개)
    isRndTarget: getBool("is_rnd_target"),
    isEmploymentTarget: getBool("is_employment_target"),
    isFundingTarget: getBool("is_funding_target"),
    isExportSupport: getBool("is_export_support"),
    isExportCertification: getBool("is_export_certification"),
    isMarketingTarget: getBool("is_marketing_target"),
    isEducationTarget: getBool("is_education_target"),
    isFacilityTarget: getBool("is_facility_target"),
    isMentoringTarget: getBool("is_mentoring_target"),
    isNetworkingTarget: getBool("is_networking_target"),

    // 제외조건 Boolean 필드 (20개)
    excludesClosed: getBool("excludes_closed"),
    excludesBankrupt: getBool("excludes_bankrupt"),
    excludesCapitalImpairment: getBool("excludes_capital_impairment"),
    excludesFinancialIssue: getBool("excludes_financial_issue"),
    excludesTaxArrears: getBool("excludes_tax_arrears"),
    excludesCreditIssue: getBool("excludes_credit_issue"),
    excludesParticipationBan: getBool("excludes_participation_ban"),
    excludesLegalSanction: getBool("excludes_legal_sanction"),
    excludesFraud: getBool("excludes_fraud"),
    excludesProjectFailure: getBool("excludes_project_failure"),
    excludesWageArrears: getBool("excludes_wage_arrears"),
    excludesPublic: getBool("excludes_public"),
    excludesNonprofit: getBool("excludes_nonprofit"),
    excludesFranchise: getBool("excludes_franchise"),
    excludesControversy: getBool("excludes_controversy"),
    excludesDuplicate: getBool("excludes_duplicate"),
    excludesLargeCompany: getBool("excludes_large_company"),
    excludesRelatedParty: getBool("excludes_related_party"),
    excludesFinance: getBool("excludes_finance"),
    excludesIndustry: getBool("excludes_industry"),

    // Numeric 필드
    minEmployees: getNum("min_employees"),
    maxEmployees: getNum("max_employees"),
    minSales: getNum("min_sales"),
    maxSales: getNum("max_sales"),
    minYears: getNum("min_years"),
    maxYears: getNum("max_years"),

    // 지원금액 정보
    maxSupportAmount: getNum("max_support_amount"),
    supportAmountScope: get("support_amount_scope") || null,
    supportMethod: get("support_method") || null,
    supportRate: getNum("support_rate"),

    // 기본 정보 (깨진 문자 정리)
    title: sanitizeText(source.title || get("title") || DEFAULT_VALUES.title),
    ministry: get("ministry") || "",
    agency: get("agency") || DEFAULT_VALUES.agency,
    executor: get("executor") || "",
    supportField,
    supportFieldDetail: get("support_field_detail") || "",
    regionText: get("region_text") || "",
    applyPeriod: get("apply_period") || DEFAULT_VALUES.applyPeriod,

    // 본문 내용 (정규화 필드 || 원본 필드 순서로 fallback)
    bizOutline: get("biz_outline") || get("overview") || source.content || DEFAULT_VALUES.bizOutline,
    supportContent: get("support_content") || DEFAULT_VALUES.supportContent,
    targetText: get("target_text") || get("target") || "",
    qualificationText: get("qualification_text") || get("qualification") || "",
    exclusionText: get("exclusion_text") || get("exclusion_target") || "",
    caution: get("caution") || "",
    evalMethod: get("eval_method") || get("evaluation_method") || "",
    documents: get("required_documents") || get("documents") || get("submit_documents") || "",
    process: get("process") || get("procedure") || "",
    contact: get("contact") || get("contact_info") || "",

    // 신청/URL 정보
    applyMethod: get("apply_method") || "",
    applyUrl: get("apply_url") || "",
    detailUrl: get("detail_url") || "",
    keywords: get("keywords") || "",

    // 파일 경로
    contentFileName: get("content_file_name") || "",
    contentFilePath: get("content_file_path") || "",
    attachmentFileName: get("attachment_file_name") || "",
    attachmentFilePath: get("attachment_file_path") || "",
    contentPath: get("content_path") || "",
    attachmentTransferPath: get("attachment_transfer_path") || "",

    // 상태
    status,

    // LLM 분석 필드
    matchReason: get("matchReason") || get("match_reason"),
    // score: vector search score, match_score: profile match score, relevance_score: LLM analysis score
    relevanceScore: getNum("relevanceScore") ?? getNum("relevance_score") ?? getNum("match_score") ?? getNum("score") ?? undefined,
    // aiRecommended: 명시적 값 또는 matchReason/score가 있으면 true
    aiRecommended:
      getBool("ai_recommended") ||
      getBool("aiRecommended") ||
      !!(get("matchReason") || get("match_reason")) ||
      (getNum("relevanceScore") ?? getNum("relevance_score") ?? getNum("match_score") ?? getNum("score")) !== null,
  };
}

/**
 * 여러 Source를 SupportProgram 배열로 변환 (중복 제거)
 */
export function mapSourcesToPrograms(
  sources: (Source | SupportProgramSource)[] | undefined,
  maxResults?: number
): SupportProgram[] {
  if (!sources || sources.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const programs: SupportProgram[] = [];

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const program = mapSourceToProgram(source, i);

    // ID 기반 중복 제거
    if (program.id && !program.id.startsWith("result-")) {
      if (seen.has(program.id)) continue;
      seen.add(program.id);
    } else {
      // 폴백: 제목 기반 중복 제거
      if (seen.has(program.title)) continue;
      seen.add(program.title);
    }

    programs.push(program);

    // 최대 결과 수 제한
    if (maxResults && programs.length >= maxResults) break;
  }

  return programs;
}

// ============================================
// 테이블 표시용 포맷터
// ============================================

/**
 * 테이블 표시용 행 데이터 타입
 */
export interface ProgramTableRow {
  id: string;
  name: string;
  amount?: string;
  deadline: string;
  daysLeft: number;
  eligibility: string;
  organization: string;
  url?: string;
  /** VectorStore ID (문서 상세 조회용) */
  vsId?: string;
  // 카드 표시용 필드
  /** 사업개요 (요약) */
  bizOutline?: string;
  /** 접수기간 텍스트 (예: "2024.01.01 ~ 2024.12.31") */
  applyPeriod?: string;
  /** 접수상태 (접수중, 마감임박, 마감, 상시, 접수예정) */
  applicationStatus?: string;
  /** AI 매칭 점수 (0-100) */
  relevanceScore?: number;
  /** AI 추천 이유 */
  matchReason?: string;
  // 필터링용 필드
  /** 마감유형 (상시, 예산소진시, 기간지정, 선착순, 미정) */
  deadlineType?: string;
  /** 지원분야 */
  supportField?: string;
  /** 지원유형 배열 (자금, R&D, 교육 등) */
  supportTypes?: string[];
  /** 지역 배열 */
  regions?: string[];
  /** 기업규모 배열 */
  companySizes?: string[];
}

/**
 * 금액을 읽기 쉬운 한국어 형식으로 변환
 */
export function formatAmount(won: number): string {
  if (won >= 100_000_000) {
    return `${(won / 100_000_000).toLocaleString()}억원`;
  } else if (won >= 10_000_000) {
    return `${(won / 10_000_000).toLocaleString()}천만원`;
  } else if (won >= 10_000) {
    return `${(won / 10_000).toLocaleString()}만원`;
  }
  return `${won.toLocaleString()}원`;
}

/**
 * SupportProgram을 테이블 표시용 데이터로 변환
 *
 * @example
 * ```typescript
 * const programs = mapSourcesToPrograms(sources);
 * const tableRows = programs.map(formatProgramForTable);
 * ```
 */
export function formatProgramForTable(program: SupportProgram): ProgramTableRow {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 남은 일수 계산
  const daysLeft = program.endDate
    ? calculateDaysRemaining(program.endDate)
    : 999;

  // 마감일 표시: 날짜가 있으면 날짜, 없으면 마감유형
  let deadline: string = program.deadlineType || "상시";
  if (program.endDate) {
    const endDateStr = String(program.endDate);
    deadline = `${endDateStr.slice(0, 4)}.${endDateStr.slice(4, 6)}.${endDateStr.slice(6, 8)}`;
  }

  // 지원금액 표시 (구조화 데이터만 사용)
  let amount: string | undefined;
  if (program.maxSupportAmount) {
    const formatted = formatAmount(program.maxSupportAmount);
    const scope = program.supportAmountScope ? ` (${program.supportAmountScope})` : "";
    const method = program.supportMethod ? `[${program.supportMethod}] ` : "";
    amount = `${method}최대 ${formatted}${scope}`;
  } else if (program.supportRate) {
    amount = `최대 ${program.supportRate}% 지원`;
  }

  // 접수상태 계산
  const applicationStatus = getApplicationStatus(
    program.startDate,
    program.endDate,
    program.deadlineType
  );

  // 접수기간 표시: 원본 데이터가 있으면 사용, 없으면 날짜에서 계산
  let applyPeriod: string | undefined = program.applyPeriod;
  if (!applyPeriod || applyPeriod === DEFAULT_VALUES.applyPeriod) {
    // startDate, endDate에서 계산
    if (program.startDate && program.endDate) {
      const startStr = String(program.startDate);
      const endStr = String(program.endDate);
      const startFormatted = `${startStr.slice(0, 4)}.${startStr.slice(4, 6)}.${startStr.slice(6, 8)}`;
      const endFormatted = `${endStr.slice(0, 4)}.${endStr.slice(4, 6)}.${endStr.slice(6, 8)}`;
      applyPeriod = `${startFormatted} ~ ${endFormatted}`;
    } else if (program.endDate) {
      const endStr = String(program.endDate);
      applyPeriod = `~ ${endStr.slice(0, 4)}.${endStr.slice(4, 6)}.${endStr.slice(6, 8)}`;
    } else if (program.deadlineType) {
      applyPeriod = program.deadlineType; // 상시, 예산소진시 등
    } else {
      applyPeriod = undefined;
    }
  }

  return {
    id: program.id,
    name: program.title,
    amount,
    deadline,
    daysLeft: Math.max(0, daysLeft ?? 999),
    eligibility: program.targetText || program.qualificationText || "",
    organization: program.agency || program.executor || "",
    url: program.detailUrl || program.applyUrl,
    vsId: program.vsId,
    // 카드 표시용 필드
    bizOutline: program.bizOutline,
    applyPeriod,
    applicationStatus,
    relevanceScore: program.relevanceScore,
    matchReason: program.matchReason,
    // 필터링용 필드
    deadlineType: program.deadlineType,
    supportField: program.supportField,
    supportTypes: program.supportTypes,
    regions: program.regions,
    companySizes: program.companySizes,
  };
}

// ============================================
// Message → Conversation 변환
// ============================================

/**
 * 대화 변환 옵션
 */
export interface TransformMessagesOptions {
  /** 항목 상세 (마지막 assistant 메시지에만 연결) */
  itemDetails?: ItemDetail[];
  /** 후속 질문 추천 (마지막 assistant 메시지에만 연결) */
  followupSuggestions?: string[];
  /** 명확화 메시지 (마지막 assistant 메시지에만 연결) */
  clarificationMessage?: string;
  /** 명확화 제안 질문 (마지막 assistant 메시지에만 연결) */
  clarificationQuestions?: string[];
  /** 질문 요약 최대 길이 (기본: 20) */
  summaryMaxLength?: number;
  /** AI 응답 없을 때 기본 메시지 생성 함수 */
  formatMissingContent?: (query: string, resultCount: number) => string;
}

/**
 * SDK Message 배열을 SMESConversation 배열로 변환
 *
 * 채팅 메시지를 대화 단위로 묶어 UI에서 표시하기 쉬운 형태로 변환합니다.
 * - assistant 메시지마다 직전 user 메시지를 찾아 query로 연결
 * - sources를 SupportProgram으로 변환
 * - 대화 트리 구조 (level, parentId) 생성
 *
 * @param messages - SDK Message 배열
 * @param options - 변환 옵션
 * @returns SMESConversation 배열
 *
 * @example
 * ```typescript
 * const { messages, itemDetails, followupSuggestions } = useChatContext();
 *
 * const conversations = transformMessagesToConversations(messages, {
 *   itemDetails,
 *   followupSuggestions,
 * });
 * ```
 */
export function transformMessagesToConversations(
  messages: Message[],
  options: TransformMessagesOptions = {}
): SMESConversation[] {
  const {
    itemDetails = [],
    followupSuggestions = [],
    clarificationMessage = '',
    clarificationQuestions = [],
    summaryMaxLength = 20,
    formatMissingContent,
  } = options;

  const result: SMESConversation[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role !== "assistant") continue;

    // 이전 user 메시지 찾기
    let userMessage: Message | null = null;
    for (let j = i - 1; j >= 0; j--) {
      if (messages[j].role === "user") {
        userMessage = messages[j];
        break;
      }
    }
    const query = userMessage?.content || "검색";

    // sources → programs 변환
    const programs = mapSourcesToPrograms(msg.sources || []);

    // AI 응답 결정
    let aiResponse = msg.content;
    if (!aiResponse && programs.length > 0) {
      aiResponse = formatMissingContent
        ? formatMissingContent(query, programs.length)
        : `"${query}"에 대한 검색 결과, 총 ${programs.length}개의 지원사업을 찾았습니다.`;
    } else if (!aiResponse) {
      aiResponse = formatMissingContent
        ? formatMissingContent(query, 0)
        : `"${query}"에 대한 검색 결과가 없습니다.`;
    }

    // 마지막 assistant 메시지인지 확인
    const isLastAssistant = !messages.slice(i + 1).some((m) => m.role === "assistant");

    // 질문 요약 생성
    const summary =
      query.length > summaryMaxLength
        ? query.substring(0, summaryMaxLength) + "..."
        : query;

    result.push({
      id: msg.id,
      level: result.length + 1,
      query,
      summary,
      resultCount: programs.length,
      parentId: result.length > 0 ? result[result.length - 1].id : undefined,
      timestamp: msg.timestamp,
      programs,
      aiResponse,
      // 마지막 메시지에만 현재 SDK 상태 연결
      itemDetails: isLastAssistant && itemDetails.length > 0 ? itemDetails : undefined,
      followupSuggestions:
        isLastAssistant && followupSuggestions.length > 0 ? followupSuggestions : undefined,
      clarificationMessage:
        isLastAssistant && clarificationMessage ? clarificationMessage : undefined,
      clarificationQuestions:
        isLastAssistant && clarificationQuestions.length > 0 ? clarificationQuestions : undefined,
    });
  }

  return result;
}

/**
 * 대화 트리에서 브레드크럼 경로 추출
 *
 * 현재 대화에서 root까지 부모를 따라가며 경로를 생성합니다.
 * 제네릭 타입으로 SMESConversation 또는 호환 타입 모두 지원합니다.
 *
 * @param currentId - 현재 대화 ID
 * @param conversations - 전체 대화 목록
 * @returns root부터 현재까지의 대화 경로
 *
 * @example
 * ```typescript
 * // SDK의 SMESConversation 사용
 * const path = buildConversationBreadcrumb(visibleId, conversations);
 *
 * // 앱 자체 타입도 지원
 * const path = buildConversationBreadcrumb(visibleId, myConversations);
 * ```
 */
export function buildConversationBreadcrumb<T extends { id: string; parentId?: string }>(
  currentId: string | undefined,
  conversations: T[]
): T[] {
  const path: T[] = [];
  let id: string | undefined = currentId;

  while (id) {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      path.unshift(conv);
      id = conv.parentId;
    } else {
      break;
    }
  }

  return path;
}
