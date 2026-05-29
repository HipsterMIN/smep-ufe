import { useEffect, useState } from 'react';

import { api as apiClient } from '@lib/apiClient.js';
import {
  fetchCorporateMemberDetail,
  formatBusinessRegNo,
} from '@/pages/my-business/member/memberUtils.js';

const summaryItems = [
  { key: 'supportApplications', icon: 'doc-list', title: '지원사업 신청이력' },
  { key: 'certificateIssuances', icon: 'cert-list', title: '증명서 발급이력' },
  { key: 'scraps', icon: 'heart', title: '나의 관심공고' },
  { key: 'inquiries', icon: 'chat', title: '나의 질의내역' },
  { key: 'apiKeys', icon: 'key', title: 'API 인증키' },
  { key: 'notifications', icon: 'alarm', title: '알림 내역' },
];

const EMPTY_COMPANY_SUMMARY = {
  companyName: '-',
  businessRegNo: '-',
  representativeName: '-',
  industryName: '-',
};

// null은 미조회 또는 조회 실패 상태이며, 실제 0건과 구분해 화면에는 '-'로 표시한다.
const EMPTY_SUMMARY_COUNTS = {
  supportApplications: null,
  certificateIssuances: null,
  scraps: null,
  inquiries: null,
  apiKeys: null,
  notifications: null,
};

const EMPTY_BUSINESS_SUMMARY = {
  companySummary: EMPTY_COMPANY_SUMMARY,
  summaryCounts: EMPTY_SUMMARY_COUNTS,
};

const SCRAP_CATEGORIES = ['BIZP', 'PLCF'];
const INQUIRY_BOARD_NO = '4';

const hasText = (value) => String(value ?? '').trim().length > 0;

const normalizeDisplayValue = (value) => {
  const normalized = String(value ?? '').trim();
  return normalized || '-';
};

const buildCompanySummary = (detail) => ({
  companyName: normalizeDisplayValue(detail?.mbrNm),
  businessRegNo: formatBusinessRegNo(detail?.brno),
  representativeName: normalizeDisplayValue(detail?.rprsvNm),
  industryName: normalizeDisplayValue(detail?.mainBizFldNm || detail?.ksicNm || detail?.ksicCd),
});

const normalizeCount = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : null;
};

const buildSummaryCards = (summaryCounts) =>
  summaryItems.map((item) => ({
    ...item,
    count: normalizeCount(summaryCounts?.[item.key]),
  }));

const unwrapApiData = (response) => {
  const payload = response?.data ?? response;
  return payload?.data ?? payload;
};

const fetchPagedTotalElements = async (path, params) => {
  const query = new URLSearchParams(params);
  const response = await apiClient.get(`${path}?${query.toString()}`);
  // 목록형 API 응답은 data로 한 번 감싸진 경우와 바로 내려오는 경우가 섞여 있어 totalElements만 공통 추출한다.
  const data = unwrapApiData(response);
  return normalizeCount(data?.totalElements);
};

const fetchCertificateIssuanceCount = () =>
  fetchPagedTotalElements('/api/v1/certificate/issuances', {
    page: '1',
    size: '1',
  });

const fetchScrapCountByCategory = (category) =>
  fetchPagedTotalElements('/api/v1/scraps/scrapsList', {
    category,
    page: '1',
    size: '1',
  });

const fetchTotalScrapCount = async () => {
  const categoryCounts = await Promise.all(SCRAP_CATEGORIES.map(fetchScrapCountByCategory));

  if (categoryCounts.some((count) => !Number.isFinite(count))) {
    return null;
  }

  // 관심공고 화면은 사업공고와 정책금융을 나누어 보여주지만, 대시보드 카드는 두 업무의 총합을 보여준다.
  return categoryCounts.reduce((totalCount, count) => totalCount + count, 0);
};

const fetchInquiryCount = () => {
  // 질의내역은 고객지원 Q&A 게시판의 내 글 필터를 쓰며, 작성자 판정은 백엔드 토큰 계약에 맡긴다.
  return fetchPagedTotalElements(`/api/v1/board/${INQUIRY_BOARD_NO}/posts/list`, {
    mineOnly: 'true',
    page: '1',
    size: '1',
  });
};

const isIssuedApiKey = (history) => history?.useYn === 'Y' && hasText(history?.apiCertTkn);

const fetchIssuedApiKeyCount = async () => {
  const response = await apiClient.get('/api/v1/apikey/history/list');
  const data = unwrapApiData(response);

  if (!Array.isArray(data)) {
    return null;
  }

  // API 인증키 목록은 별도 상태명 없이 useYn과 토큰값을 내려주므로, 실제 발행된 토큰 행만 집계한다.
  return data.filter(isIssuedApiKey).length;
};

// 알림 API 내부의 회원/채널 판정은 해당 업무 API가 책임진다. 대시보드는 UI_USR_L_540 목록의 총건수를 재사용한다.
const fetchNotificationCount = () => {
  return fetchPagedTotalElements('/api/v1/scrap/notifications', {
    page: '1',
    size: '1',
  });
};

const summaryCountLoaders = {
  certificateIssuances: fetchCertificateIssuanceCount,
  scraps: fetchTotalScrapCount,
  inquiries: fetchInquiryCount,
  apiKeys: fetchIssuedApiKeyCount,
  notifications: fetchNotificationCount,
};

const loadCompanySummary = async () => {
  try {
    const companyDetail = await fetchCorporateMemberDetail(apiClient);
    return buildCompanySummary(companyDetail);
  } catch (error) {
    console.error('대시보드 기업 정보 조회 실패:', error);
    return EMPTY_COMPANY_SUMMARY;
  }
};

const loadSummaryCounts = async () => {
  const countEntries = await Promise.all(
    Object.entries(summaryCountLoaders).map(async ([key, loadCount]) => {
      try {
        return [key, await loadCount()];
      } catch (error) {
        console.error(`대시보드 요약 건수 조회 실패(${key}):`, error);
        // 일부 카드의 API 실패가 다른 카드 표시를 막지 않도록 실패 카드는 '-' 상태로만 격리한다.
        return [key, null];
      }
    }),
  );

  return {
    ...EMPTY_SUMMARY_COUNTS,
    ...Object.fromEntries(countEntries),
  };
};

const loadBusinessSummary = async () => {
  const [companySummary, summaryCounts] = await Promise.all([
    loadCompanySummary(),
    loadSummaryCounts(),
  ]);

  return {
    companySummary,
    summaryCounts,
  };
};

const renderSummaryCount = (count) => (Number.isFinite(count) ? count : '-');

const BusinessSummarySection = ({ isLogin, mbrNo, mbrTypeCd } = {}) => {
  const [businessSummary, setBusinessSummary] = useState(EMPTY_BUSINESS_SUMMARY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 부모는 로그인 여부와 회원 유형만 넘긴다. 세부 데이터 조회는 섹션 loader가 맡아 부모 의존성을 늘리지 않는다.
    const canFetchBusinessSummary = Boolean(isLogin && mbrNo && mbrTypeCd === 'ENT');

    if (!canFetchBusinessSummary) {
      setBusinessSummary(EMPTY_BUSINESS_SUMMARY);
      setLoading(false);
      return undefined;
    }

    let active = true;

    const fetchBusinessSummary = async () => {
      setLoading(true);

      try {
        const nextBusinessSummary = await loadBusinessSummary();

        if (active) {
          setBusinessSummary(nextBusinessSummary);
        }
      } catch (error) {
        console.error('대시보드 기업 요약 조회 실패:', error);
        if (active) {
          setBusinessSummary(EMPTY_BUSINESS_SUMMARY);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchBusinessSummary();

    return () => {
      // 라우트 전환이나 세션 변경 중 늦게 도착한 응답이 새 화면 상태를 덮어쓰지 않게 막는다.
      active = false;
    };
  }, [isLogin, mbrNo, mbrTypeCd]);

  const summaryCards = buildSummaryCards(businessSummary.summaryCounts);
  const renderCompanyValue = (key) => (loading ? '로딩 중...' : businessSummary.companySummary[key]);

  return (
    <section className="my-summary compact">
      <article className="company-card compact">
        <h3>{renderCompanyValue('companyName')}</h3>
        <dl>
          <dt>사업자 등록번호</dt>
          <dd>{renderCompanyValue('businessRegNo')}</dd>
        </dl>
        <dl>
          <dt>대표자</dt>
          <dd>{renderCompanyValue('representativeName')}</dd>
        </dl>
        <dl>
          <dt>업종</dt>
          <dd>{renderCompanyValue('industryName')}</dd>
        </dl>

        <ul className="btn-group">
          <li><button type="button" className="krds-btn btn-primary"><i className="svg-icon alarm pure"></i> 알림 수신 설정</button></li>
          <li><button type="button" className="krds-btn btn-primary">기업정보 수정</button></li>
        </ul>
      </article>

      <div className="summary-grid compact">
        {summaryCards.map((item) => {
          const hasCount = Number.isFinite(item.count);

          return (
            <button type="button" className="summary-card compact" key={item.key}>
              <span>
                <i className={`summary-icon svg-icon ${item.icon}`} aria-hidden="true"></i>
                <strong>{item.title}</strong>
              </span>
              <em><strong>{renderSummaryCount(item.count)}</strong>{hasCount ? '건' : ''}</em>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default BusinessSummarySection;
