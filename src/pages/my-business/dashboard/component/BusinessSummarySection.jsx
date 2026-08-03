import { useNavigate } from 'react-router-dom';

import { useUserMenu } from '@context/UserMenuContext.jsx';

const DASHBOARD_ACTION_MENU_IDS = {
  notificationSettings: 'M_PIIO_00115',
  companyInfo: 'M_PIIO_00119',
};

// 요약 카드는 부모 dashboardData의 resource key와 1:1로 맞춘다.
const summaryItems = [
  { key: 'supportApplications', icon: 'doc-list', title: '지원사업 신청이력' },
  { key: 'certificateIssuances', icon: 'cert-list', title: '증명서 발급이력' },
  { key: 'scraps', icon: 'heart', title: '나의 관심공고' },
  { key: 'inquiries', icon: 'chat', title: '나의 질의내역' },
  { key: 'apiKeys', icon: 'key', title: 'API 인증키' },
  { key: 'notifications', icon: 'alarm', title: '알림 내역' },
];

// 회사 정보가 아직 없을 때도 퍼블 레이아웃의 텍스트 자리를 유지한다.
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

// summary count는 null이면 '-'를 보여주고, 0이면 실제 0건으로 보여준다.
const normalizeCount = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : null;
};

// BusinessSummarySection은 API를 모르고, 부모가 만든 resource의 총건수만 읽는다.
const buildSummaryCounts = (dashboardData) => ({
  ...EMPTY_SUMMARY_COUNTS,
  supportApplications: normalizeCount(dashboardData?.supportApplications?.totalElements),
  certificateIssuances: normalizeCount(dashboardData?.certificateIssuances?.totalElements),
  scraps: normalizeCount(dashboardData?.scraps?.totalElements),
  inquiries: normalizeCount(dashboardData?.inquiries?.totalElements),
  apiKeys: normalizeCount(dashboardData?.apiKeys?.issuedTotalElements),
  notifications: normalizeCount(dashboardData?.notifications?.totalElements),
});

// 화면 반복 렌더링에 필요한 icon/title/count를 하나의 카드 모델로 맞춘다.
const buildSummaryCards = (dashboardData) => {
  const summaryCounts = buildSummaryCounts(dashboardData);

  return summaryItems.map((item) => ({
    ...item,
    count: summaryCounts[item.key],
  }));
};

const renderSummaryCount = (count) => (Number.isFinite(count) ? count : '-');

const resolveMenuPath = (getFullPath, menuId) => {
  const path = getFullPath(menuId);
  return typeof path === 'string' && path.trim() ? path : null;
};

const BusinessSummarySection = ({ dashboardData } = {}) => {
  const navigate = useNavigate();
  const { getFullPath } = useUserMenu();
  // 회사 resource만 loading 문구를 쓰고, 업무 건수 resource는 조회 중·실패 시 '-'와 정상 0건 규칙으로 표시한다.
  const companyResource = dashboardData?.companySummary || {};
  const companySummary = {
    ...EMPTY_COMPANY_SUMMARY,
    ...(companyResource.item || {}),
  };
  const loading = Boolean(companyResource.loading);
  const summaryCards = buildSummaryCards(dashboardData);
  // 기업 요약은 데이터 도착 전 명시적으로 로딩 상태를 보여준다.
  const renderCompanyValue = (key) => (loading ? '로딩 중...' : companySummary[key]);
  // 실행 환경 base path는 Router basename이 처리하므로, 버튼 이동은 menuId로 계산한 내부 경로만 사용한다.
  const navigateToMenu = (menuId, label) => {
    // label은 버튼별 이동 의미를 보존하는 기존 호출 계약이므로 삭제하지 않는다.
    // 현재 라우팅은 menuId만 사용하므로 무동작으로 소비하며, 화면 표시나 이동 경로에는 영향을 주지 않는다.
    void label;
    const path = resolveMenuPath(getFullPath, menuId);

    if (!path) {
      return;
    }

    navigate(path);
  };

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
          <li>
            <button
              type="button"
              className="krds-btn btn-primary"
              onClick={() => navigateToMenu(DASHBOARD_ACTION_MENU_IDS.notificationSettings, '알림 수신 설정')}
            >
              <i className="svg-icon alarm pure"></i> 알림 수신 설정
            </button>
          </li>
          <li>
            <button
              type="button"
              className="krds-btn btn-primary"
              onClick={() => navigateToMenu(DASHBOARD_ACTION_MENU_IDS.companyInfo, '기업정보 수정')}
            >
              기업정보 수정
            </button>
          </li>
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
