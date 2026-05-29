import ReactECharts from 'echarts-for-react';

// 인사이트 count는 summary resource가 아직 없으면 '-'를 보여주기 위해 null을 유지한다.
const normalizeCount = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : null;
};

// 지원사업 API의 summary 값을 진행단계 카드 3개로 바꾼다.
const buildProgressItems = (dashboardData) => {
  const summary = dashboardData?.supportApplications?.summary || {};

  return [
    { icon: 'apply', title: '전체', count: normalizeCount(summary.total) },
    { icon: 'ing', title: '신청중', count: normalizeCount(summary.inProgress) },
    { icon: 'doc-check', title: '신청완료', count: normalizeCount(summary.completed) },
  ];
};

// 지원사업 신청 API가 분야 코드를 아직 제공하지 않아 차트 분포는 퍼블 기준 정적값을 유지한다.
const categoryChartOption = {
  color: ['#00a1ff', '#60d937', '#929292', '#f8ba00', '#ff2500'],
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
      data: [
        { value: 3, name: '창업' },
        { value: 2, name: '소상공인' },
        { value: 2, name: '기술' },
        { value: 2, name: '경영' },
        { value: 1, name: '내수' },
      ],
    },
  ],
};

// 숫자 미확정 상태는 단위 없이 '-'만 보여 요약 카드와 같은 의미로 맞춘다.
const renderCount = (count) => (Number.isFinite(count) ? count : '-');

const InsightSection = ({ dashboardData } = {}) => {
  // 진행단계만 실제 API summary와 연결하고, 분야 차트는 위 정적 옵션을 유지한다.
  const progressItems = buildProgressItems(dashboardData);

  return (
    <section className="insight-section">
      <div className="section-head">
        <h2>데이터 인사이트</h2>
        <p>우리 기업의 활동 현황을 한눈에 확인하세요.</p>
        <select title="기간 선택">
          <option>최근 6개월</option>
        </select>
      </div>

      <div className="insight-grid compact">
        <article className="progress-panel compact">
          <div className="panel-head">
            <h3>지원사업 신청 진행단계</h3>
            <button type="button">전체일정보기 <i className="svg-icon ico-plus"></i></button>
          </div>

          <div className="progress-list">
            {progressItems.map((item) => {
              const hasCount = Number.isFinite(item.count);

              return (
                <div className="progress-card compact" key={item.title}>
                  <span>
                    <i className={`summary-icon svg-icon pure ${item.icon}`} aria-hidden="true"></i>
                    <strong>{item.title}</strong>
                  </span>
                  <em><strong>{renderCount(item.count)}</strong>{hasCount ? ' 건' : ''}</em>
                </div>
              );
            })}
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
                    <th><span className="c1" /> 창업</th>
                    <th><span className="c2" /> 소상공인</th>
                    <th><span className="c3" /> 기술</th>
                    <th><span className="c4" /> 경영</th>
                    <th><span className="c5" /> 내수</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="chart-values">
                    <td>3건<br />30%</td>
                    <td>2건<br />20%</td>
                    <td>2건<br />20%</td>
                    <td>2건<br />20%</td>
                    <td>1건<br />10%</td>
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
