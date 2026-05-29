import '@styles/custom.scss';
import '@styles/mypage.scss';
import { useEffect, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { shallow } from 'zustand/shallow';
import { api as apiClient } from '@lib/apiClient.js';
import {
  fetchCorporateMemberDetail,
  formatBusinessRegNo,
} from '@/pages/my-business/member/memberUtils.js';
import BusinessSummarySection from './component/BusinessSummarySection.jsx';
import InsightSection from './component/InsightSection.jsx';
import DeadlineCalendarSection from './component/DeadlineCalendarSection.jsx';
import ServiceStatusSection from './component/ServiceStatusSection.jsx';

// currentMode는 화면 모드이고, 하위 업무 API는 회원유형 코드(IND/ENT)를 받는다.
const MBR_TYPE_CD_BY_CURRENT_MODE = {
  CORPORATE: 'ENT',
  INDIVIDUAL: 'IND',
};

// 대시보드는 클릭 시 추가 조회하지 않고 목록 스냅샷을 공유하므로, 백엔드 허용 상한인 100건을 사용한다.
const DASHBOARD_LIST_PAGE_SIZE = 100;
// 고객지원 Q&A 중 마이비즈니스에서 집계할 게시판 번호다.
const INQUIRY_BOARD_NO = '4';
// 관심공고 화면은 사업공고와 정책금융을 탭으로 나누므로, 대시보드는 두 카테고리를 함께 조회해 합산한다.
const SCRAP_CATEGORIES = ['BIZP', 'PLCF'];

// 기업 요약 조회 전/실패 시에도 레이아웃을 유지하기 위한 표시 기본값이다.
const EMPTY_COMPANY_SUMMARY = {
  companyName: '-',
  businessRegNo: '-',
  representativeName: '-',
  industryName: '-',
};

// 지원사업 API는 목록과 별도로 진행단계 summary를 내려주므로, 인사이트 섹션이 이 구조를 사용한다.
const EMPTY_SUPPORT_APPLICATION_SUMMARY = {
  total: null,
  inProgress: null,
  completed: null,
};

// 값 정규화 helper는 API별 null, 빈 문자열, 숫자 문자열 차이를 화면 표시 계약으로 맞춘다.
const hasText = (value) => String(value ?? '').trim().length > 0;

const normalizeDisplayValue = (value) => {
  const normalized = String(value ?? '').trim();
  return normalized || '-';
};

const normalizeCount = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : null;
};

const coerceTotalElements = (value, fallback = null) => {
  const totalElements = normalizeCount(value);
  return totalElements === null ? fallback : totalElements;
};

// 기업 상세 응답 필드를 대시보드 회사 카드가 쓰는 단일 shape로 접는다.
const buildCompanySummary = (detail) => ({
  companyName: normalizeDisplayValue(detail?.mbrNm),
  businessRegNo: formatBusinessRegNo(detail?.brno),
  representativeName: normalizeDisplayValue(detail?.rprsvNm),
  industryName: normalizeDisplayValue(detail?.mainBizFldNm || detail?.ksicNm || detail?.ksicCd),
});

// apiClient 응답은 {data:{...}}와 {...} 형태가 섞여 있어 loader 시작점에서 한 번만 풀어낸다.
const unwrapApiData = (response) => {
  const payload = response?.data ?? response;
  return payload?.data ?? payload;
};

// 모든 목록성 대시보드 조회는 같은 page/size 기준을 쓰고, 업무별 검색 파라미터만 덧붙인다.
const buildDashboardQuery = (params = {}) => {
  const query = new URLSearchParams({
    page: '1',
    size: String(DASHBOARD_LIST_PAGE_SIZE),
    ...params,
  });
  return query.toString();
};

const toErrorMessage = (error) => error?.message || '대시보드 데이터를 불러오지 못했습니다.';

// 하위 섹션이 resource별 loading/error/total/items를 같은 방식으로 읽게 만드는 공통 wrapper다.
const createResource = ({
  items = [],
  totalElements = null,
  loading = false,
  error = null,
  ...extra
} = {}) => ({
  items,
  totalElements,
  loading,
  error,
  ...extra,
});

// 회사 요약은 목록이 아니라 단건 item이므로 일반 resource와 별도 factory를 둔다.
const createCompanySummaryResource = ({ item = EMPTY_COMPANY_SUMMARY, loading = false, error = null } = {}) => ({
  item: { ...EMPTY_COMPANY_SUMMARY, ...item },
  loading,
  error,
});

// 지원사업은 목록, 총건수, 진행단계 summary, 외부 연계 일부 실패 정보를 함께 담는다.
const createSupportApplicationsResource = ({
  items = [],
  totalElements = null,
  summary = EMPTY_SUPPORT_APPLICATION_SUMMARY,
  loading = false,
  error = null,
  partial = false,
  failedSources = [],
} = {}) => createResource({
  items,
  totalElements,
  loading,
  error,
  summary: { ...EMPTY_SUPPORT_APPLICATION_SUMMARY, ...summary },
  partial,
  failedSources,
});

// 관심공고는 BIZP/PLCF 목록을 합친 items와 카테고리별 원본 resource를 같이 보관한다.
const createScrapResource = ({
  items = [],
  totalElements = null,
  loading = false,
  error = null,
  byCategory = {},
} = {}) => createResource({
  items,
  totalElements,
  loading,
  error,
  byCategory: {
    BIZP: createResource(byCategory.BIZP),
    PLCF: createResource(byCategory.PLCF),
  },
});

// API 인증키는 전체 신청 이력과 발행완료 이력을 둘 다 쓰므로 두 목록을 같이 들고 간다.
const createApiKeyResource = ({
  items = [],
  totalElements = null,
  issuedItems = [],
  issuedTotalElements = null,
  loading = false,
  error = null,
} = {}) => createResource({
  items,
  totalElements,
  loading,
  error,
  issuedItems,
  issuedTotalElements,
});

// 부모 state의 전체 초기 shape다. 자식 컴포넌트는 이 shape가 항상 있다고 가정하고 안전하게 읽는다.
const createEmptyDashboardData = ({ loading = false } = {}) => ({
  companySummary: createCompanySummaryResource({ loading }),
  supportApplications: createSupportApplicationsResource({ loading }),
  certificateIssuances: createResource({ loading }),
  scraps: createScrapResource({ loading }),
  inquiries: createResource({ loading }),
  apiKeys: createApiKeyResource({ loading }),
  notifications: createResource({ loading }),
});

// 개별 API 실패는 해당 resource만 error 상태로 바꾸고, 다른 섹션 데이터는 계속 렌더링하게 둔다.
const createFailedResource = (key, error) => {
  const errorMessage = toErrorMessage(error);

  if (key === 'companySummary') {
    return createCompanySummaryResource({ error: errorMessage });
  }

  if (key === 'supportApplications') {
    return createSupportApplicationsResource({ error: errorMessage });
  }

  if (key === 'scraps') {
    return createScrapResource({ error: errorMessage });
  }

  if (key === 'apiKeys') {
    return createApiKeyResource({ error: errorMessage });
  }

  return createResource({ error: errorMessage });
};

// 제품 전제는 30건 미만이지만, 운영 데이터가 상한을 넘으면 화면은 유지하고 개발자 경고만 남긴다.
const warnIfDashboardPageTruncated = (label, totalElements, items) => {
  if (Number.isFinite(totalElements) && totalElements > items.length) {
    console.warn(`대시보드 ${label} 목록이 ${items.length}/${totalElements}건만 로드되었습니다.`);
  }
};

const resolvePageData = (pageLike) => {
  const nestedPage = pageLike?.page;

  // support-applications는 Page를 page 객체로 감싸고, 공통 Page 응답은 page 숫자 필드를 가진다.
  if (nestedPage && typeof nestedPage === 'object') {
    return nestedPage;
  }

  return pageLike;
};

const normalizePageResource = (pageLike, label) => {
  const pageData = resolvePageData(pageLike);
  const items = Array.isArray(pageData?.content) ? pageData.content : [];
  const totalElements = coerceTotalElements(pageData?.totalElements, items.length);

  // 대시보드는 통계상 30건 미만 전제라 size=100 단건 조회만 한다. 초과 시 추가 조회 대신 경고만 남긴다.
  warnIfDashboardPageTruncated(label, totalElements, items);

  return createResource({
    items,
    totalElements,
  });
};

// 공통 목록 API 호출부다. loader별로 path/label/params만 넘기면 resource shape로 정규화된다.
async function fetchPagedResource(path, label, params = {}) {
  const response = await apiClient.get(`${path}?${buildDashboardQuery(params)}`);
  return normalizePageResource(unwrapApiData(response), label);
}

// 기업 요약은 회원 상세 API 응답을 회사 카드 표시값으로 변환한다.
async function loadCompanySummary() {
  const companyDetail = await fetchCorporateMemberDetail(apiClient);
  return createCompanySummaryResource({
    item: buildCompanySummary(companyDetail),
  });
}

// 지원사업은 백엔드가 page와 summary를 함께 내려주므로 목록과 진행단계 값을 분리해 보관한다.
async function loadSupportApplications() {
  const response = await apiClient.get(`/api/v1/pbanc/support-applications?${buildDashboardQuery({
    statusGroup: 'ALL',
    searchType: 'TITLE',
  })}`);
  const payload = unwrapApiData(response);
  const pageResource = normalizePageResource(payload?.page, '지원사업 신청이력');
  const summary = payload?.summary || {};

  return createSupportApplicationsResource({
    ...pageResource,
    summary: {
      total: coerceTotalElements(summary.total, pageResource.totalElements),
      inProgress: coerceTotalElements(summary.inProgress),
      completed: coerceTotalElements(summary.completed),
    },
    partial: Boolean(payload?.partial),
    failedSources: Array.isArray(payload?.failedSources) ? payload.failedSources : [],
  });
}

// 관심공고는 두 카테고리를 독립 조회하고, 한쪽 실패 시 총합을 '-'로 두어 오집계를 피한다.
async function loadScraps() {
  const categoryResults = await Promise.allSettled(
    SCRAP_CATEGORIES.map(async (category) => [
      category,
      await fetchPagedResource('/api/v1/scraps/scrapsList', `나의 관심공고 ${category}`, {
        category,
      }),
    ]),
  );

  const byCategory = {};
  let hasFailedCategory = false;

  categoryResults.forEach((result, index) => {
    const fallbackCategory = SCRAP_CATEGORIES[index];

    if (result.status === 'fulfilled') {
      const [category, resource] = result.value;
      byCategory[category] = resource;
      return;
    }

    hasFailedCategory = true;
    console.error(`대시보드 관심공고 조회 실패(${fallbackCategory}):`, result.reason);
    byCategory[fallbackCategory] = createResource({ error: toErrorMessage(result.reason) });
  });

  const items = SCRAP_CATEGORIES.flatMap((category) =>
    (byCategory[category]?.items || []).map((item) => ({
      ...item,
      dashboardScrapCategory: category,
    })),
  );
  const totalElements = hasFailedCategory
    ? null
    : SCRAP_CATEGORIES.reduce((sum, category) => sum + (byCategory[category]?.totalElements || 0), 0);

  return createScrapResource({
    items,
    totalElements,
    byCategory,
  });
}

// 발행완료 API 인증키는 useYn과 실제 토큰값이 모두 있어야 요약 카드에 포함한다.
const isIssuedApiKey = (history) => history?.useYn === 'Y' && hasText(history?.apiCertTkn);

// API 인증키 화면 탭은 전체 신청 이력을 쓰고, 요약 카드는 issuedItems만 센다.
async function loadApiKeys() {
  const response = await apiClient.get('/api/v1/apikey/history/list');
  const data = unwrapApiData(response);
  const items = Array.isArray(data) ? data : [];
  const issuedItems = items.filter(isIssuedApiKey);

  return createApiKeyResource({
    items,
    totalElements: items.length,
    issuedItems,
    issuedTotalElements: issuedItems.length,
  });
}

// 대시보드에서 한 번에 공유할 업무 API 목록이다. key는 dashboardData의 resource 이름과 일치해야 한다.
const DASHBOARD_RESOURCE_LOADERS = {
  companySummary: loadCompanySummary,
  supportApplications: loadSupportApplications,
  certificateIssuances: () => fetchPagedResource('/api/v1/certificate/issuances', '증명서 발급이력'),
  scraps: loadScraps,
  inquiries: () => fetchPagedResource(`/api/v1/board/${INQUIRY_BOARD_NO}/posts/list`, '나의 질의내역', {
    mineOnly: 'true',
  }),
  apiKeys: loadApiKeys,
  notifications: () => fetchPagedResource('/api/v1/scrap/notifications', '알림 내역'),
};

// 모든 업무 resource를 병렬 조회하고, 실패한 업무만 빈 resource로 격리해 부분 렌더링을 유지한다.
async function loadDashboardData() {
  const loaderEntries = Object.entries(DASHBOARD_RESOURCE_LOADERS);
  const entries = await Promise.allSettled(
    loaderEntries.map(async ([key, loader]) => [key, await loader()]),
  );
  const nextData = createEmptyDashboardData();

  entries.forEach((result, index) => {
    const [key] = loaderEntries[index];

    if (result.status === 'fulfilled') {
      const [resolvedKey, resource] = result.value;
      nextData[resolvedKey] = resource;
      return;
    }

    console.error(`대시보드 데이터 조회 실패(${key}):`, result.reason);
    nextData[key] = createFailedResource(key, result.reason);
  });

  return nextData;
}

const MyBusinessDashBoard = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  // dashboardData는 네 하위 섹션이 공유하는 단일 데이터 소스다.
  const [dashboardData, setDashboardData] = useState(() => createEmptyDashboardData());
  // 대시보드 부모만 authStore를 읽고, 하위 섹션은 동일한 dashboardData에서 필요한 값만 꺼낸다.
  const myBusinessQueryProps = useAuthStore(
    (state) => ({
      mbrNo: String(state.user?.id ?? '').trim(),
      isLogin: state.isLogin,
      mbrTypeCd: MBR_TYPE_CD_BY_CURRENT_MODE[state.currentMode] || '',
    }),
    shallow,
  );
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const { isLogin, mbrNo, mbrTypeCd } = myBusinessQueryProps;

  useEffect(() => {
    // 마이비즈니스 대시보드는 로그인 기업회원 화면이므로, 개인/비로그인 상태에서는 조회하지 않는다.
    const canLoadDashboardData = Boolean(isLogin && mbrNo && mbrTypeCd === 'ENT');

    if (!canLoadDashboardData) {
      setDashboardData(createEmptyDashboardData());
      return undefined;
    }

    let active = true;
    setDashboardData(createEmptyDashboardData({ loading: true }));

    const fetchDashboardData = async () => {
      const nextDashboardData = await loadDashboardData();

      if (active) {
        setDashboardData(nextDashboardData);
      }
    };

    fetchDashboardData();

    return () => {
      // React effect cleanup 패턴으로 세션 전환 중 늦은 응답이 새 상태를 덮어쓰지 않게 막는다.
      active = false;
    };
  }, [isLogin, mbrNo, mbrTypeCd]);

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <main className="mypage-content contents">
        <Breadcrumb items={breadcrumbItems} />

        {/* 기업 요약 */}
        <BusinessSummarySection dashboardData={dashboardData} />
        {/* 데이터 인사이트 */}
        <InsightSection dashboardData={dashboardData} />
        {/* 관심공고 마감 캘린더 */}
        <DeadlineCalendarSection dashboardData={dashboardData} />
        {/* 서비스 현황 */}
        <ServiceStatusSection dashboardData={dashboardData} />
      </main>
    </>
  );
};

export default MyBusinessDashBoard;
