import ReactECharts from 'echarts-for-react';

const CHART_COLORS = ['#00a1ff', '#60d937', '#929292', '#f8ba00', '#ff2500'];
const CATEGORY_CLASS_NAMES = ['c1', 'c2', 'c3', 'c4', 'c5'];
const CATEGORY_SLOT_COUNT = 5;
const CATEGORY_DIRECT_SLOT_COUNT = CATEGORY_SLOT_COUNT - 1;
const EMPTY_VALUE = '-';
// 퍼블 CSS가 button[hidden]의 기본 display:none을 덮는 경우가 있어 보존용 숨김 UI는 display를 고정한다.
const PRESERVED_HIDDEN_STYLE = { display: 'none' };

const PROGRESS_BUCKETS = [
  { title: '전체', icon: 'apply', summaryKey: 'total' },
  { title: '신청중', icon: 'ing', summaryKey: 'inProgress' },
  { title: '신청완료', icon: 'doc-check', summaryKey: 'completed' },
];

const isResolvedResource = (resource) => (
  resource?.totalElements !== null
  && resource?.totalElements !== undefined
  && !resource?.loading
  && !resource?.error
);

const normalizeLabel = (value, fallback = '미분류') => {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
};

const normalizeCount = (value) => {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : null;
};

const formatCount = (count) => (
  typeof count === 'number' ? count.toLocaleString('ko-KR') : EMPTY_VALUE
);

const formatCountWithUnit = (count) => (
  typeof count === 'number' ? `${formatCount(count)}건` : EMPTY_VALUE
);

const formatPercent = (count, total) => {
  if (typeof count !== 'number') {
    return EMPTY_VALUE;
  }

  if (!total) {
    return '0%';
  }

  const percent = (count / total) * 100;
  return `${Number.isInteger(percent) ? percent : percent.toFixed(1)}%`;
};

const buildProgressItems = (supportApplications) => {
  if (!isResolvedResource(supportApplications)) {
    return PROGRESS_BUCKETS.map(({ icon, title }) => ({
      icon,
      title,
      count: null,
    }));
  }

  /*
   * 진행단계 수치는 최신 50건 카드 목록을 다시 세지 않고 백엔드 전체 집계값을 사용한다.
   * 그래야 신청이력이 50건을 넘어도 전체/신청중/신청완료 건수가 신청현황 화면과 동일하게 유지된다.
   */
  return PROGRESS_BUCKETS.map(({ icon, title, summaryKey }) => ({
    icon,
    title,
    count: normalizeCount(supportApplications?.summary?.[summaryKey]),
  }));
};

const createEmptyCategoryItems = () => Array.from({ length: CATEGORY_SLOT_COUNT }, () => ({
  name: EMPTY_VALUE,
  count: null,
  percent: null,
}));

const buildCategoryItems = (supportApplications) => {
  if (!isResolvedResource(supportApplications)) {
    return createEmptyCategoryItems();
  }

  const sourceDistribution = Array.isArray(supportApplications?.sourceDistribution)
    ? supportApplications.sourceDistribution
    : [];
  /*
   * 기관별 분포는 서버가 페이지 슬라이싱 전에 계산한 sourceDistribution을 사용한다.
   * displayName은 공통코드명이며, 공통코드 조회 실패 시 loader가 sourceName/sourceCode 대체값을 이미 채운다.
   */
  const sortedGroups = sourceDistribution
    .map((item) => ({
      name: normalizeLabel(item?.displayName || item?.sourceName || item?.sourceCode),
      sourceCode: normalizeLabel(item?.sourceCode, 'UNKNOWN'),
      count: normalizeCount(item?.count) || 0,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.sourceCode.localeCompare(b.sourceCode));

  if (sortedGroups.length === 0) {
    return createEmptyCategoryItems().map((item) => ({
      ...item,
      count: 0,
      percent: '0%',
    }));
  }

  const directGroups = sortedGroups.slice(0, CATEGORY_DIRECT_SLOT_COUNT);
  const restGroups = sortedGroups.slice(CATEGORY_DIRECT_SLOT_COUNT);
  // 현재 범례 테이블은 5칸 고정이므로, 다섯 번째 이후 기관은 기타로 합산해 전체 비율과 레이아웃을 함께 유지한다.
  const groups = restGroups.length > 0
    ? [
      ...directGroups,
      { name: '기타', count: restGroups.reduce((sum, group) => sum + group.count, 0) },
    ]
    : sortedGroups;
  const total = groups.reduce((sum, group) => sum + group.count, 0);
  const categoryItems = groups.map((group) => ({
    name: group.name,
    count: group.count,
    percent: formatPercent(group.count, total),
  }));

  while (categoryItems.length < CATEGORY_SLOT_COUNT) {
    categoryItems.push({
      name: EMPTY_VALUE,
      count: 0,
      percent: formatPercent(0, total),
    });
  }

  return categoryItems.slice(0, CATEGORY_SLOT_COUNT);
};

const buildCategoryChartOption = (categoryItems) => ({
  color: CHART_COLORS,
  tooltip: {
    trigger: 'item',
    formatter: '{b}<br />{c}건 ({d}%)',
  },
  legend: {
    show: false,
  },
  series: [
    {
      name: '분야별 신청 분포',
      type: 'pie',
      radius: ['45%', '78%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      label: {
        show: false,
      },
      labelLine: {
        show: false,
      },
      data: categoryItems.map((item) => ({
        value: item.count || 0,
        name: item.name,
      })),
    },
  ],
});

const InsightSection = ({ dashboardData = {} }) => {
  const supportApplications = dashboardData.supportApplications;
  const progressItems = buildProgressItems(supportApplications);
  const categoryItems = buildCategoryItems(supportApplications);
  const categoryChartOption = buildCategoryChartOption(categoryItems);

  return (
    <section className="insight-section">
      <div className="section-head">
        <h2>데이터 인사이트</h2>
        <p>우리 기업의 활동 현황을 한눈에 확인하세요.</p>
        {/* 후속 필터 계약 전까지 기간 선택 UI는 삭제하지 않고 숨김 상태로 보존한다. */}
        <select title="기간 선택" hidden style={PRESERVED_HIDDEN_STYLE}>
          <option>최근 6개월</option>
        </select>
      </div>

      <div className="insight-grid compact">
        <article className="progress-panel compact">
          <div className="panel-head">
            <h3>지원사업 신청 진행단계</h3>
            {/* 후속 이동 대상이 확정될 때까지 전체일정보기 CTA는 삭제하지 않고 숨김 상태로 보존한다. */}
            <button type="button" hidden style={PRESERVED_HIDDEN_STYLE}>전체일정보기 <i className="svg-icon ico-plus"></i></button>
          </div>

          <div className="progress-list">
            {progressItems.map((item) => (
              <div className="progress-card compact" key={item.title}>
                <span>
                  <i className={`summary-icon svg-icon pure ${item.icon}`} aria-hidden="true"></i>
                  <strong>{item.title}</strong>
                </span>
                <em>
                  <strong>{formatCount(item.count)}</strong>
                  {typeof item.count === 'number' ? ' 건' : ''}
                </em>
              </div>
            ))}
          </div>
        </article>

        <article className="chart-panel compact">
          <h3>분야별 신청 분포</h3>

          <div className="chart-content compact">
            <div className="echart-donut-v2" aria-label="분야별 신청 분포 차트">
              <ReactECharts option={categoryChartOption} style={{ width: '140px', height: '140px' }} />
            </div>

            <div className="chart-legend-table">
              <table>
                <thead>
                  <tr>
                    {categoryItems.map((item, index) => (
                      <th key={`${item.name}-${index}`}>
                        <span className={CATEGORY_CLASS_NAMES[index]} /> {item.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="chart-values">
                    {categoryItems.map((item, index) => (
                      <td key={`${item.name}-${index}`}>
                        {formatCountWithUnit(item.count)}<br />{item.percent ?? EMPTY_VALUE}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default InsightSection;
