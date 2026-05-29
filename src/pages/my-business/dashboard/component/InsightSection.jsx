import ReactECharts from 'echarts-for-react';

const CHART_COLORS = ['#00a1ff', '#60d937', '#929292', '#f8ba00', '#ff2500'];
const CATEGORY_CLASS_NAMES = ['c1', 'c2', 'c3', 'c4', 'c5'];
const CATEGORY_SLOT_COUNT = 5;
const CATEGORY_DIRECT_SLOT_COUNT = CATEGORY_SLOT_COUNT - 1;
const EMPTY_VALUE = '-';

const PROGRESS_BUCKETS = [
  { title: '신청중', icon: 'apply', sourceStatuses: ['신청중'] },
  { title: '처리중', icon: 'ing', sourceStatuses: ['신청완료'] },
  { title: '처리완료', icon: 'doc-check', sourceStatuses: ['선정완료'] },
];
const DEFAULT_CATEGORY_LABELS = ['기술', '경영', '수출', '중견', '기타'];

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

const countByLabel = (items, getLabel) => items.reduce((accumulator, item) => {
  const label = getLabel(item);
  accumulator[label] = (accumulator[label] || 0) + 1;
  return accumulator;
}, {});

const toSortedGroups = (counts) => Object.entries(counts)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ko'));

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
  const items = Array.isArray(supportApplications?.items) ? supportApplications.items : [];

  if (!isResolvedResource(supportApplications)) {
    return PROGRESS_BUCKETS.map(({ icon, title }) => ({
      icon,
      title,
      count: null,
    }));
  }

  const counts = countByLabel(items, (item) => normalizeLabel(item?.bizAplyPrgrsSttsNm));
  // 화면 표현은 기존 3단계 문구를 유지하고, DB 진행상태명만 bucket 입력값으로 매핑한다.
  return PROGRESS_BUCKETS.map(({ icon, title, sourceStatuses }) => ({
    icon,
    title,
    count: sourceStatuses.reduce((sum, status) => sum + (counts[status] || 0), 0),
  }));
};

const createEmptyCategoryItems = () => DEFAULT_CATEGORY_LABELS.map((name) => ({
  name,
  count: null,
  percent: null,
}));

const buildCategoryItems = (supportApplications) => {
  const items = Array.isArray(supportApplications?.items) ? supportApplications.items : [];

  if (!isResolvedResource(supportApplications)) {
    return createEmptyCategoryItems();
  }

  const counts = countByLabel(
    items,
    (item) => normalizeLabel(item?.bizPbancClsfNm || item?.bizPbancClsfCd),
  );
  const sortedGroups = toSortedGroups(counts);
  const directGroups = sortedGroups.slice(0, CATEGORY_DIRECT_SLOT_COUNT);
  const restGroups = sortedGroups.slice(CATEGORY_DIRECT_SLOT_COUNT);
  // 현재 범례 테이블은 5칸 고정이므로, 초과 분야는 기타로 합산해 레이아웃을 유지한다.
  const groups = restGroups.length > 0
    ? [
      ...directGroups,
      { name: '기타', count: restGroups.reduce((sum, group) => sum + group.count, 0) },
    ]
    : sortedGroups;
  const total = groups.reduce((sum, group) => sum + group.count, 0);
  const categoryItems = groups.map((group) => ({
    ...group,
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
        <select title="기간 선택" hidden>
          <option>최근 6개월</option>
        </select>
      </div>

      <div className="insight-grid compact">
        <article className="progress-panel compact">
          <div className="panel-head">
            <h3>지원사업 신청 진행단계</h3>
            {/* 후속 이동 대상이 확정될 때까지 전체일정보기 CTA는 삭제하지 않고 숨김 상태로 보존한다. */}
            <button type="button" hidden>전체일정보기 <i className="svg-icon ico-plus"></i></button>
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
