/**
 * 지원사업 도메인 타입 정의
 *
 * 2차 데이터레이크 정규화 스키마 기반
 * @see labs/analysis/smes/02_implementation.xlsx
 */

import type { Source, ItemDetail } from "../../core";

// ============================================
// 상태/분류 타입
// ============================================

/**
 * 공고 상태 (status 필드)
 */
export type AnnouncementStatus = "N" | "D" | "U"; // New/Deleted/Updated

/**
 * 신청 상태 (UI 표시용)
 *
 * 마감일과 마감유형에 따라 계산됩니다.
 */
export type ApplicationStatus = "접수중" | "마감임박" | "마감" | "상시" | "접수예정";

/**
 * 마감 유형 (deadline_type 필드)
 * @see 03_unified_schema.xlsx - DEADLINE_TYPE
 */
export type DeadlineType =
    | "상시"
    | "예산소진시"
    | "기간지정"
    | "선착순"
    | "미정";

/**
 * 지원분야 (support_field 필드) - 8개 카테고리
 */
export type SupportField =
    | "기술개발"
    | "자금지원"
    | "판로개척"
    | "창업지원"
    | "시설·설비"
    | "인력양성"
    | "경영지원"
    | "해외진출"
    | "기타";

/**
 * 기업규모 (company_sizes 필드) - 4개
 * @see 03_unified_schema.xlsx - SIZE
 */
export type CompanySize =
    | "소상공인"
    | "중소기업"
    | "중견기업"
    | "대기업";

/**
 * 지원유형 (support_types 필드) - 9개
 * @see 03_unified_schema.xlsx - SUPPORT_TYPE
 */
export type SupportType =
    | "자금"
    | "R&D"
    | "교육"
    | "컨설팅"
    | "마케팅"
    | "수출"
    | "시설"
    | "인증"
    | "고용";

/**
 * 지역 (regions 필드) - 17개 시도 + 전국
 */
export type Region =
    | "서울"
    | "경기"
    | "인천"
    | "부산"
    | "대구"
    | "광주"
    | "대전"
    | "울산"
    | "세종"
    | "강원"
    | "충북"
    | "충남"
    | "전북"
    | "전남"
    | "경북"
    | "경남"
    | "제주"
    | "전국";

// ============================================
// 지원사업 인터페이스 (2차 데이터레이크)
// ============================================

/**
 * 지원사업 정보 (2차 데이터레이크 스키마)
 *
 * 정규화된 공고 데이터를 표현합니다.
 * @see labs/analysis/smes/02_implementation.xlsx - 8_2차데이터레이크
 */
export interface SupportProgram {
  // ─────────────────────────────────────────
  // 식별자 및 날짜
  // ─────────────────────────────────────────

  /** 고유 ID (PK) */
  id: string;

  /** VectorStore ID (문서 상세 조회용) */
  vsId?: string;

  /** 신청 시작일 (YYYYMMDD) */
  startDate: number | null;

  /** 신청 마감일 (YYYYMMDD) */
  endDate: number | null;

  /** 등록일 (YYYYMMDD) */
  registerDate: number | null;

  /** 마감 유형 */
  deadlineType: DeadlineType;

  // ─────────────────────────────────────────
  // 정규화 배열 필드 (Milvus 필터링용)
  // ─────────────────────────────────────────

  /** 지역 (17개 시도 + 전국) */
  regions: Region[];

  /** 기업규모 */
  companySizes: CompanySize[];

  /** 업종 */
  industries: string[];

  /** 지원유형 */
  supportTypes: SupportType[];

  /** 인증 요건 */
  certifications: string[];

  /** 제외 조건 */
  excludedConditions: string[];

  // ─────────────────────────────────────────
  // Boolean 필드 (대상 제한)
  // ─────────────────────────────────────────

  /** 벤처기업 대상 */
  isVentureTarget: boolean;

  /** 이노비즈 대상 */
  isInnobizTarget: boolean;

  /** 메인비즈 대상 */
  isMainbizTarget: boolean;

  /** 연구소 보유 */
  hasResearchDept: boolean;

  /** 특허 보유 */
  hasPatent: boolean;

  /** ISO 인증 보유 */
  hasIso: boolean;

  /** 창업기업 대상 */
  isStartupTarget: boolean;

  /** 중소기업 대상 */
  isSmeTarget: boolean;

  /** 사회적기업 대상 */
  isSocialEnterpriseTarget: boolean;

  /** 여성기업 대상 */
  isWomenTarget: boolean;

  /** 청년기업 대상 */
  isYouthTarget: boolean;

  /** 장애인기업 대상 */
  isDisabledTarget: boolean;

  /** 수출기업 대상 */
  isExporterTarget: boolean;

  /** 보훈대상 */
  isVeteranTarget: boolean;

  /** 시니어대상 */
  isSeniorTarget: boolean;

  // ─────────────────────────────────────────
  // PURPOSE Boolean 필드 (10개)
  // @see 03_unified_schema.xlsx - PURPOSE
  // ─────────────────────────────────────────

  /** R&D 대상 */
  isRndTarget: boolean;

  /** 고용지원 대상 */
  isEmploymentTarget: boolean;

  /** 자금지원 대상 */
  isFundingTarget: boolean;

  /** 수출지원 */
  isExportSupport: boolean;

  /** 인증지원 */
  isExportCertification: boolean;

  /** 마케팅 대상 */
  isMarketingTarget: boolean;

  /** 교육 대상 */
  isEducationTarget: boolean;

  /** 시설 대상 */
  isFacilityTarget: boolean;

  /** 멘토링 대상 */
  isMentoringTarget: boolean;

  /** 네트워킹 대상 */
  isNetworkingTarget: boolean;

  // ─────────────────────────────────────────
  // 제외조건 Boolean 필드 (20개)
  // ─────────────────────────────────────────

  /** 휴폐업 기업 제외 */
  excludesClosed: boolean;

  /** 부도/파산 기업 제외 */
  excludesBankrupt: boolean;

  /** 자본잠식 기업 제외 */
  excludesCapitalImpairment: boolean;

  /** 재무비율 미달 기업 제외 */
  excludesFinancialIssue: boolean;

  /** 세금/보험료 체납 기업 제외 */
  excludesTaxArrears: boolean;

  /** 신용불량 기업 제외 */
  excludesCreditIssue: boolean;

  /** 정부사업 참여제한 기업 제외 */
  excludesParticipationBan: boolean;

  /** 법적 제재 기업 제외 */
  excludesLegalSanction: boolean;

  /** 부정행위 이력 기업 제외 */
  excludesFraud: boolean;

  /** 환수/과제실패 기업 제외 */
  excludesProjectFailure: boolean;

  /** 임금체불 기업 제외 */
  excludesWageArrears: boolean;

  /** 공공기관 제외 */
  excludesPublic: boolean;

  /** 비영리 제외 */
  excludesNonprofit: boolean;

  /** 프랜차이즈 제외 */
  excludesFranchise: boolean;

  /** 사회적 물의 기업 제외 */
  excludesControversy: boolean;

  /** 중복지원 제외 */
  excludesDuplicate: boolean;

  /** 대기업 제외 */
  excludesLargeCompany: boolean;

  /** 관계자/친인척 제외 */
  excludesRelatedParty: boolean;

  /** 금융/보험업 제외 */
  excludesFinance: boolean;

  /** 제외업종 제외 */
  excludesIndustry: boolean;

  // ─────────────────────────────────────────
  // Numeric 필드 (수치 제한)
  // ─────────────────────────────────────────

  /** 최소 종업원수 */
  minEmployees: number | null;

  /** 최대 종업원수 */
  maxEmployees: number | null;

  /** 최소 매출 (억원) */
  minSales: number | null;

  /** 최대 매출 (억원) */
  maxSales: number | null;

  /** 최소 업력 (년) */
  minYears: number | null;

  /** 최대 업력 (년) */
  maxYears: number | null;

  // ─────────────────────────────────────────
  // 지원금액 정보 (UI 카드 표시)
  // ─────────────────────────────────────────

  /** 최대 지원금액 (원 단위) */
  maxSupportAmount: number | null;

  /** 지원금액 범위 (총액/연간/건별/과제당/업체당) */
  supportAmountScope: string | null;

  /** 지원방식 (보조금/융자/세제/현물) */
  supportMethod: string | null;

  /** 지원비율 (%, 0-100) */
  supportRate: number | null;

  // ─────────────────────────────────────────
  // 기본 정보 (UI 표시)
  // ─────────────────────────────────────────

  /** 공고명 */
  title: string;

  /** 소관부처 */
  ministry: string;

  /** 관리부서/수행기관 */
  agency: string;

  /** 수행기관 */
  executor: string;

  /** 지원분야 (8개 카테고리) */
  supportField: SupportField;

  /** 상세 지원분야 */
  supportFieldDetail: string;

  /** 지역 원문 */
  regionText: string;

  /** 신청기간 텍스트 */
  applyPeriod: string;

  // ─────────────────────────────────────────
  // 본문 내용 (UI 상세)
  // ─────────────────────────────────────────

  /** 사업개요 */
  bizOutline: string;

  /** 지원내용 */
  supportContent: string;

  /** 지원대상 원문 */
  targetText: string;

  /** 지원자격 원문 */
  qualificationText: string;

  /** 제외대상 원문 */
  exclusionText: string;

  /** 주의사항 */
  caution: string;

  /** 평가방법 */
  evalMethod: string;

  /** 제출서류 */
  documents: string;

  /** 진행절차 */
  process: string;

  /** 문의처 */
  contact: string;

  // ─────────────────────────────────────────
  // 신청/URL 정보
  // ─────────────────────────────────────────

  /** 신청방법 */
  applyMethod: string;

  /** 신청 URL */
  applyUrl: string;

  /** 공고 URL */
  detailUrl: string;

  /** 키워드 원문 */
  keywords: string;

  // ─────────────────────────────────────────
  // 파일 경로 (내부용)
  // ─────────────────────────────────────────

  /** 본문 파일명 */
  contentFileName: string;

  /** 본문 파일경로 */
  contentFilePath: string;

  /** 첨부파일명 */
  attachmentFileName: string;

  /** 첨부파일경로 */
  attachmentFilePath: string;

  /** 본문경로 */
  contentPath: string;

  /** 첨부전송경로 */
  attachmentTransferPath: string;

  /** 공고상태 (N/D/U) */
  status: AnnouncementStatus;

  // ─────────────────────────────────────────
  // LLM 분석 필드 (검색 결과 보강)
  // ─────────────────────────────────────────

  /** AI 추천 여부 */
  aiRecommended?: boolean;

  /** AI가 분석한 매칭 이유 */
  matchReason?: string;

  /** AI가 산출한 관련성 점수 (0~1) */
  relevanceScore?: number;
}

// ============================================
// SDK Source 확장 타입 (API 응답)
// ============================================

/**
 * 지원사업 Source 문서 (백엔드 API 응답)
 *
 * 2차 데이터레이크 스키마의 snake_case 버전
 */
export interface SupportProgramSource extends Source {
  // 식별자 및 날짜 (엑셀 스키마 기준)
  apply_start_date?: number | null;
  apply_end_date?: number | null;
  register_date?: number | null;
  deadline_type?: string;

  // 정규화 배열 필드
  regions?: string[];
  company_sizes?: string[];
  industries?: string[];
  support_types?: string[];
  certifications?: string[];
  excluded_conditions?: string[];

  // Boolean 필드 - CERT
  is_venture_target?: boolean;
  is_innobiz_target?: boolean;
  is_mainbiz_target?: boolean;
  has_research_dept?: boolean;
  has_patent?: boolean;
  has_iso?: boolean;

  // Boolean 필드 - BIZ_TYPE
  is_startup_target?: boolean;
  is_sme_target?: boolean;
  is_social_enterprise_target?: boolean;

  // Boolean 필드 - OWNER
  is_women_target?: boolean;
  is_youth_target?: boolean;
  is_disabled_target?: boolean;
  is_exporter_target?: boolean;
  is_veteran_target?: boolean;
  is_senior_target?: boolean;

  // Boolean 필드 - PURPOSE (10개)
  is_rnd_target?: boolean;
  is_employment_target?: boolean;
  is_funding_target?: boolean;
  is_export_support?: boolean;
  is_export_certification?: boolean;
  is_marketing_target?: boolean;
  is_education_target?: boolean;
  is_facility_target?: boolean;
  is_mentoring_target?: boolean;
  is_networking_target?: boolean;

  // 제외조건 Boolean 필드 (20개)
  excludes_closed?: boolean;
  excludes_bankrupt?: boolean;
  excludes_capital_impairment?: boolean;
  excludes_financial_issue?: boolean;
  excludes_tax_arrears?: boolean;
  excludes_credit_issue?: boolean;
  excludes_participation_ban?: boolean;
  excludes_legal_sanction?: boolean;
  excludes_fraud?: boolean;
  excludes_project_failure?: boolean;
  excludes_wage_arrears?: boolean;
  excludes_public?: boolean;
  excludes_nonprofit?: boolean;
  excludes_franchise?: boolean;
  excludes_controversy?: boolean;
  excludes_duplicate?: boolean;
  excludes_large_company?: boolean;
  excludes_related_party?: boolean;
  excludes_finance?: boolean;
  excludes_industry?: boolean;

  // Numeric 필드
  min_employees?: number | null;
  max_employees?: number | null;
  min_sales?: number | null;
  max_sales?: number | null;
  min_years?: number | null;
  max_years?: number | null;

  // 지원금액 정보
  max_support_amount?: number | null;
  support_amount_scope?: string | null;
  support_method?: string | null;
  support_rate?: number | null;

  // 기본 정보
  ministry?: string;
  agency?: string;
  executor?: string;
  support_field?: string;
  support_field_detail?: string;
  region_text?: string;
  apply_period?: string;

  // 본문 내용
  biz_outline?: string;
  support_content?: string;
  target_text?: string;
  qualification_text?: string;
  exclusion_text?: string;
  caution?: string;
  eval_method?: string;
  documents?: string;
  process?: string;
  contact?: string;

  // 신청/URL 정보
  apply_method?: string;
  apply_url?: string;
  detail_url?: string;
  keywords?: string;

  // 파일 경로
  content_file_name?: string;
  content_file_path?: string;
  attachment_file_name?: string;
  attachment_file_path?: string;
  content_path?: string;
  attachment_transfer_path?: string;

  // 상태
  status?: string;
}

// ============================================
// 기업 프로필 타입 (4_프로필매핑)
// ============================================

/**
 * 기업 프로필 정보
 *
 * 프로필 기반 맞춤 검색 및 추천에 사용됩니다.
 * 백엔드에서 공고 필드와 매칭하여 적합한 지원사업을 필터링합니다.
 *
 * @see labs/analysis/smes/02_implementation.xlsx - 4_프로필매핑
 *
 * @example
 * ```typescript
 * const profile: CompanyProfile = {
 *   region: '서울',
 *   companySize: '중소기업',
 *   isVenture: true,
 *   employeeCount: 50,
 *   sales: 10, // 억원
 * };
 * ```
 */
export interface CompanyProfile {
  // ─────────────────────────────────────────
  // 기본 정보
  // ─────────────────────────────────────────

  /** 지역 (17개 시도) → regions 필드와 매칭 */
  region?: Region;

  /** 기업규모 → company_sizes 필드와 매칭 */
  companySize?: CompanySize;

  /** 업종 → industries 필드와 매칭 */
  industry?: string;

  // ─────────────────────────────────────────
  // 기업 유형 (Boolean)
  // ─────────────────────────────────────────

  /** 중소기업 여부 → is_sme_target */
  isSme?: boolean;

  /** 소기업 여부 → 중소기업에 포함됨 (소기업/중기업은 중소기업으로 통합) */
  isSmallBusiness?: boolean;

  /** 벤처기업 여부 → is_venture_target */
  isVenture?: boolean;

  /** 창업기업 여부 (7년 이내) → is_startup_target */
  isStartup?: boolean;

  /** 여성기업 여부 → is_women_target */
  isWomenOwned?: boolean;

  /** 사회적기업 여부 → is_social_enterprise_target */
  isSocialEnterpriseTarget?: boolean;

  /** 수출기업 여부 → is_exporter_target */
  isExporter?: boolean;

  /** 청년기업 여부 (대표자 39세 이하) → is_youth_target */
  isYouth?: boolean;

  /** 장애인기업 여부 → is_disabled_target */
  isDisabledOwned?: boolean;

  /** 보훈대상 여부 → is_veteran_target */
  isVeteran?: boolean;

  /** 시니어창업 여부 → is_senior_target */
  isSenior?: boolean;

  // ─────────────────────────────────────────
  // 인증 보유 (Boolean)
  // ─────────────────────────────────────────

  /** 이노비즈 인증 보유 → is_innobiz_target */
  hasInnobiz?: boolean;

  /** 메인비즈 인증 보유 → is_mainbiz_target */
  hasMainbiz?: boolean;

  /** 기업부설연구소 보유 → has_research_dept */
  hasResearchDept?: boolean;

  /** ISO 인증 보유 → has_iso */
  hasIso?: boolean;

  // ─────────────────────────────────────────
  // 수치 정보 (Numeric)
  // ─────────────────────────────────────────

  /** 등록 특허 수 → has_patent (>0이면 true) */
  registeredPatents?: number;

  /** 종업원 수 → max_employees 필드와 비교 */
  employeeCount?: number;

  /** 매출액 (억원) → max_sales 필드와 비교 */
  sales?: number;

  /** 업력 (년) → max_years 필드와 비교 */
  yearsInBusiness?: number;

  // ─────────────────────────────────────────
  // 제외조건 관련 (20개) - bool_exclude 연산
  // ─────────────────────────────────────────

  /** 휴폐업 여부 → excludes_closed */
  hasClosedStatus?: boolean;

  /** 부도/파산 여부 → excludes_bankrupt */
  hasBankruptcy?: boolean;

  /** 자본잠식 여부 → excludes_capital_impairment */
  hasCapitalImpairment?: boolean;

  /** 재무비율 미달 여부 → excludes_financial_issue */
  hasFinancialIssue?: boolean;

  /** 세금/보험료 체납 여부 → excludes_tax_arrears */
  hasTaxArrears?: boolean;

  /** 신용불량 여부 → excludes_credit_issue */
  hasCreditIssue?: boolean;

  /** 정부사업 참여제한 여부 → excludes_participation_ban */
  hasParticipationBan?: boolean;

  /** 법적 제재 여부 → excludes_legal_sanction */
  hasLegalSanction?: boolean;

  /** 부정행위 이력 여부 → excludes_fraud */
  hasFraudRecord?: boolean;

  /** 환수/과제실패 여부 → excludes_project_failure */
  hasProjectFailure?: boolean;

  /** 임금체불 여부 → excludes_wage_arrears */
  hasWageArrears?: boolean;

  /** 비영리 여부 → excludes_nonprofit */
  isNonprofit?: boolean;

  /** 프랜차이즈 여부 → excludes_franchise */
  isFranchise?: boolean;

  /** 중복지원 여부 → excludes_duplicate */
  hasDuplicateSupport?: boolean;

  /** 대기업 여부 → excludes_large_company */
  isLargeCompany?: boolean;

  /** 관계자/친인척 여부 → excludes_related_party */
  hasRelatedParty?: boolean;

  /** 금융/보험업 여부 → excludes_finance */
  isFinanceIndustry?: boolean;

  /** 제외업종 여부 → excludes_industry */
  isExcludedIndustry?: boolean;
}

// ============================================
// 채팅 메시지 타입
// ============================================

/**
 * 인용 소스 (법령, FAQ 등 비지원사업 도메인)
 */
export interface Citation {
  /** 문서 ID */
  id: string;
  /** 제목 */
  title: string;
  /** 내용 */
  content: string;
  /** 도메인 (law, faq 등) */
  domain: string;
  /** 점수 */
  score?: number;
}

/**
 * 채팅 메시지 (DTO)
 *
 * AI 어시스턴트와의 대화에서 사용되는 메시지 타입입니다.
 * sources는 domain 필드에 따라 programs와 citations로 분류됩니다.
 * - domain === 'bizinfo' → programs (SupportProgram[])
 * - domain !== 'bizinfo' → citations (Citation[])
 */
export interface ProgramChatMessage {
  /** 메시지 ID */
  id: string;
  /** 역할 (user: 사용자, assistant: AI) */
  role: "user" | "assistant";
  /** 메시지 내용 */
  content: string;
  /** 추천 지원사업 목록 (domain === 'bizinfo') */
  programs?: SupportProgram[];
  /** 인용 목록 - 법령, FAQ 등 (domain !== 'bizinfo') */
  citations?: Citation[];
  /** 생성 시간 */
  timestamp: Date;
}

// ============================================
// 대화 아이템 타입 (UI 표시용)
// ============================================

/**
 * SMES 대화 아이템
 *
 * 사용자 질문과 AI 응답을 하나의 대화 단위로 묶은 타입입니다.
 * 대화 히스토리 UI, 브레드크럼 네비게이션 등에 사용됩니다.
 *
 * @example
 * ```typescript
 * const conversations = transformMessagesToConversations(messages);
 * conversations.map(conv => (
 *   <ConversationBlock key={conv.id} conversation={conv} />
 * ));
 * ```
 */
export interface SMESConversation {
  /** 대화 ID (assistant 메시지 ID 사용) */
  id: string;

  /** 대화 깊이 (1부터 시작) */
  level: number;

  /** 사용자 질문 원문 */
  query: string;

  /** 질문 요약 (브레드크럼 표시용, 20자 이내) */
  summary: string;

  /** 검색 결과 수 */
  resultCount?: number;

  /** 부모 대화 ID (대화 트리 구조) */
  parentId?: string;

  /** 생성 시간 */
  timestamp: Date;

  /** 검색된 지원사업 목록 */
  programs: SupportProgram[];

  /** AI 응답 텍스트 */
  aiResponse?: string;

  /** 항목 상세 (펼치기/접기 UI용) */
  itemDetails?: ItemDetail[];

  /** 후속 질문 추천 */
  followupSuggestions?: string[];

  /** 명확화 메시지 (메인 질문) */
  clarificationMessage?: string;

  /** 명확화 제안 질문 (클릭 가능) */
  clarificationQuestions?: string[];
}
