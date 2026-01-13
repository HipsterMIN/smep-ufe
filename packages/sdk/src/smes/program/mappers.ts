/**
 * 지원사업 도메인 매핑 함수
 *
 * 2차 데이터레이크 스키마 기반 매핑
 * @see labs/analysis/smes/02_implementation.xlsx
 */

import { getSourceField, type Source } from "../../core";
import type {
  SupportProgram,
  SupportProgramSource,
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
  type BadgeVariant,
} from "./constants";

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
    const val = get<boolean | string>(key);
    return val === true || val === "true";
  };
  const getNum = (key: string): number | null => {
    const val = get<number | string | null>(key);
    if (val === null || val === undefined || val === "") return null;
    const num = typeof val === "number" ? val : parseFloat(val);
    return isNaN(num) ? null : num;
  };

  // 문서 ID (group_id 최우선 - 공고 단위 식별자)
  const docId =
    get("group_id") ||
    get("id") ||
    source.documentId ||
    get("file_id") ||
    get("program_id");

  // 마감유형 결정 (types.ts DeadlineType과 일치)
  const deadlineTypeRaw = get("deadline_type") || DEFAULT_VALUES.deadlineType;
  const deadlineType = (
    ["상시", "예산소진시", "기간지정", "선착순", "미정"].includes(deadlineTypeRaw)
      ? deadlineTypeRaw
      : DEFAULT_VALUES.deadlineType
  ) as DeadlineType;

  // 지원분야 결정
  const supportFieldRaw = get("support_field") || DEFAULT_VALUES.supportField;
  const supportField = (
    ["기술개발", "자금지원", "판로개척", "창업지원", "시설·설비", "인력양성", "경영지원", "해외진출", "기타"].includes(supportFieldRaw)
      ? supportFieldRaw
      : DEFAULT_VALUES.supportField
  ) as SupportField;

  // 상태 결정
  const statusRaw = get("status") || "N";
  const status = (["N", "D", "U"].includes(statusRaw) ? statusRaw : "N") as AnnouncementStatus;

  return {
    // 식별자 및 날짜 (엑셀 스키마 기준)
    id: docId || `result-${index}`,
    startDate: getNum("apply_start_date"),
    endDate: getNum("apply_end_date"),
    registerDate: getNum("register_date"),
    deadlineType,

    // 정규화 배열 필드
    regions: getArray("regions") as Region[],
    companySizes: getArray("company_sizes") as CompanySize[],
    industries: getArray("industries"),
    supportTypes: getArray("support_types") as SupportType[],
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
    isSocialEnterprise: getBool("is_social_enterprise"),

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

    // 기본 정보
    title: source.title || get("title") || DEFAULT_VALUES.title,
    agency: get("agency") || DEFAULT_VALUES.agency,
    executor: get("executor") || "",
    supportField,
    supportFieldDetail: get("support_field_detail") || "",
    regionText: get("region_text") || "",
    applyPeriod: get("apply_period") || DEFAULT_VALUES.applyPeriod,

    // 본문 내용
    bizOutline: get("biz_outline") || source.content || DEFAULT_VALUES.bizOutline,
    supportContent: get("support_content") || DEFAULT_VALUES.supportContent,
    targetText: get("target_text") || "",
    qualificationText: get("qualification_text") || "",
    exclusionText: get("exclusion_text") || "",
    caution: get("caution") || "",
    evalMethod: get("eval_method") || "",
    documents: get("documents") || "",
    process: get("process") || "",
    contact: get("contact") || "",

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
    relevanceScore: getNum("relevanceScore") ?? getNum("relevance_score") ?? undefined,
    // aiRecommended: 명시적 값 또는 matchReason/relevanceScore가 있으면 true
    aiRecommended:
      getBool("ai_recommended") ||
      getBool("aiRecommended") ||
      !!(get("matchReason") || get("match_reason")) ||
      (getNum("relevanceScore") ?? getNum("relevance_score")) !== null,
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
