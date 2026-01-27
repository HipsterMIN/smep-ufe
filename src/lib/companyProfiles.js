export const COMPANY_PROFILES = {
  '2288105280': {
    region: '서울',
    companySize: '중소기업',
    industry: '정보통신업',
    employeeCount: 389,
    sales: 450,
    yearsInBusiness: 6,
    isSme: true,
    isSmallBusiness: false,
    isVenture: true,
    hasInnobiz: true,
    hasMainbiz: false,
    hasClosedStatus: false,
    isNonprofit: false,
    isFinanceIndustry: false,
  },
  '6058189115': {
    region: '부산',
    companySize: '중견기업',
    industry: '건설업',
    employeeCount: 106,
    sales: 662,
    yearsInBusiness: 18,
    isSme: false,
    isSmallBusiness: false,
    isVenture: false,
    hasInnobiz: false,
    hasMainbiz: false,
    hasClosedStatus: false,
    isNonprofit: false,
    isFinanceIndustry: false,
  },
  '3078130710': {
    region: '제주',
    companySize: '중소기업',
    industry: '제조업',
    employeeCount: 134,
    sales: 1339,
    yearsInBusiness: 17,
    isSme: true,
    isSmallBusiness: false,
    isVenture: false,
    hasInnobiz: true,
    hasMainbiz: true,
    hasClosedStatus: false,
    isNonprofit: false,
    isFinanceIndustry: false,
  },
};

export const getCompanyProfileByBizNo = (bizno) => {
  if (!bizno) return null;
  const profile = COMPANY_PROFILES[String(bizno)];
  return profile ? { ...profile } : null;
};
