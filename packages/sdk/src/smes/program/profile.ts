import type { CompanyProfile } from "./types";

/**
 * CompanyProfile을 백엔드 프로필 형식으로 변환 (snake_case)
 * 
 * @see labs/analysis/smes/02_implementation.xlsx - 4_프로필매핑
 */
export function buildBackendProfile(profile?: CompanyProfile): Record<string, unknown> | undefined {
  if (!profile) return undefined;

  const backendProfile: Record<string, unknown> = {};

  // ─────────────────────────────────────────
  // 1. 기본 정보 매핑
  // ─────────────────────────────────────────
  if (profile.region !== undefined) backendProfile.region = profile.region;
  if (profile.companySize !== undefined) backendProfile.company_size = profile.companySize;
  if (profile.industry !== undefined) backendProfile.industry = profile.industry;
  
  // 기업명 (cmpNm -> company_name)
  if (profile.cmpNm !== undefined) backendProfile.company_name = profile.cmpNm;
  
  // 사업자번호 (bizno/brno)
  if (profile.bizno !== undefined) backendProfile.bizno = profile.bizno;
  const anyProfile = profile as any;
  if (anyProfile.brno !== undefined) backendProfile.brno = anyProfile.brno;

  // ─────────────────────────────────────────
  // 2. 기업 유형 (Target Boolean)
  // ─────────────────────────────────────────
  // 중소기업
  if (profile.isSme !== undefined) backendProfile.is_sme_target = profile.isSme;
  // 소상공인/소기업
  if (profile.isSmallBusiness !== undefined) backendProfile.is_small_business_target = profile.isSmallBusiness;
  // 벤처
  if (profile.isVenture !== undefined) backendProfile.is_venture_target = profile.isVenture;
  // 창업
  if (profile.isStartup !== undefined) backendProfile.is_startup_target = profile.isStartup;
  // 여성
  if (profile.isWomenOwned !== undefined) backendProfile.is_women_target = profile.isWomenOwned;
  // 사회적기업
  if (profile.isSocialEnterpriseTarget !== undefined) backendProfile.is_social_enterprise_target = profile.isSocialEnterpriseTarget;
  // 수출
  if (profile.isExporter !== undefined) backendProfile.is_exporter_target = profile.isExporter;
  // 청년
  if (profile.isYouth !== undefined) backendProfile.is_youth_target = profile.isYouth;
  // 장애인
  if (profile.isDisabledOwned !== undefined) backendProfile.is_disabled_target = profile.isDisabledOwned;
  // 보훈
  if (profile.isVeteran !== undefined) backendProfile.is_veteran_target = profile.isVeteran;
  // 시니어
  if (profile.isSenior !== undefined) backendProfile.is_senior_target = profile.isSenior;

  // ─────────────────────────────────────────
  // 3. 인증 보유
  // ─────────────────────────────────────────
  if (profile.hasInnobiz !== undefined) backendProfile.is_innobiz_target = profile.hasInnobiz;
  if (profile.hasMainbiz !== undefined) backendProfile.is_mainbiz_target = profile.hasMainbiz;
  if (profile.hasResearchDept !== undefined) backendProfile.is_research_dept_target = profile.hasResearchDept;
  if (profile.hasIso !== undefined) backendProfile.is_iso_target = profile.hasIso;

  // ─────────────────────────────────────────
  // 4. 수치 정보
  // ─────────────────────────────────────────
  if (profile.registeredPatents !== undefined) {
    backendProfile.registered_patents = profile.registeredPatents;
    if (typeof profile.registeredPatents === 'number') {
      backendProfile.has_patent_target = profile.registeredPatents > 0;
    }
  }
  if (profile.employeeCount !== undefined) backendProfile.employee_count = profile.employeeCount;
  if (profile.sales !== undefined) backendProfile.sales = profile.sales;
  if (profile.yearsInBusiness !== undefined) {
    backendProfile.years_in_business = profile.yearsInBusiness;
    if (typeof profile.yearsInBusiness === 'number') {
      backendProfile.established_year = new Date().getFullYear() - profile.yearsInBusiness;
    }
  }

  // ─────────────────────────────────────────
  // 5. 제외 조건
  // ─────────────────────────────────────────
  if (profile.hasClosedStatus !== undefined) backendProfile.has_closed_status = profile.hasClosedStatus;
  if (profile.hasBankruptcy !== undefined) backendProfile.has_bankruptcy = profile.hasBankruptcy;
  if (profile.hasCapitalImpairment !== undefined) backendProfile.has_capital_impairment = profile.hasCapitalImpairment;
  if (profile.hasFinancialIssue !== undefined) backendProfile.has_financial_issue = profile.hasFinancialIssue;
  if (profile.hasTaxArrears !== undefined) backendProfile.has_tax_arrears = profile.hasTaxArrears;
  if (profile.hasCreditIssue !== undefined) backendProfile.has_credit_issue = profile.hasCreditIssue;
  if (profile.hasParticipationBan !== undefined) backendProfile.has_participation_ban = profile.hasParticipationBan;
  if (profile.hasLegalSanction !== undefined) backendProfile.has_legal_sanction = profile.hasLegalSanction;
  if (profile.hasFraudRecord !== undefined) backendProfile.has_fraud_record = profile.hasFraudRecord;
  if (profile.hasProjectFailure !== undefined) backendProfile.has_project_failure = profile.hasProjectFailure;
  if (profile.hasWageArrears !== undefined) backendProfile.has_wage_arrears = profile.hasWageArrears;
  if (profile.isNonprofit !== undefined) backendProfile.is_nonprofit = profile.isNonprofit;
  if (profile.isFranchise !== undefined) backendProfile.is_franchise = profile.isFranchise;
  if (profile.hasDuplicateSupport !== undefined) backendProfile.has_duplicate_support = profile.hasDuplicateSupport;
  if (profile.isLargeCompany !== undefined) backendProfile.is_large_company = profile.isLargeCompany;
  if (profile.hasRelatedParty !== undefined) backendProfile.has_related_party = profile.hasRelatedParty;
  if (profile.isFinanceIndustry !== undefined) backendProfile.is_finance_industry = profile.isFinanceIndustry;
  if (profile.isExcludedIndustry !== undefined) backendProfile.is_excluded_industry = profile.isExcludedIndustry;

  // ─────────────────────────────────────────
  // 6. 기타 필드 처리 및 자동 변환
  // ─────────────────────────────────────────
  const skipFields = new Set(['_converted']);
  
  for (const [key, value] of Object.entries(anyProfile)) {
    if (value === undefined || skipFields.has(key)) continue;

    // 이미 처리된 필드들 (snake_case로 변환되어 backendProfile에 있는 경우)은 건너뜀
    // 단, 명시적으로 snake_case인 필드가 들어왔다면 보존
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    
    if (backendProfile[snakeKey] === undefined) {
      backendProfile[snakeKey] = value;
    }
  }

  return Object.keys(backendProfile).length > 0 ? backendProfile : undefined;
}
