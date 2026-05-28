import React, { useState } from 'react';
//import { useNavigate, Link } from "react-router-dom";
// Import Swiper React components
//import { Swiper, SwiperSlide } from 'swiper/react';
import ReactECharts from 'echarts-for-react';
import '@styles/custom.scss';
import '@styles/mypage.scss';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';


const summaryItems = [
  { icon: 'doc-list', title: '지원사업 신청이력', count: 12 },
  { icon: 'cert-list', title: '증명서 발급이력', count: 8 },
  { icon: 'heart', title: '나의 관심공고', count: 24 },
  { icon: 'chat', title: '나의 질의내역', count: 5 },
  { icon: 'key', title: 'API 인증키', count: 2 },
  { icon: 'alarm', title: '알림 내역', count: 7 },
];

const progressItems = [
  { icon: 'apply', title: '신청중', count: 1 },
  { icon: 'ing', title: '처리중', count: 3 },
  { icon: 'doc-check', title: '처리완료', count: 2 },
];

const serviceTabs = [
  '지원사업 신청현황(12)',
  '나의 관심공고(18)',
  '증명서 발급이력(8)',
  '나의 질의내역(5)',
  'API 인증키 신청이력(2)',
];

const serviceCards = [
  {
    label: '중기부',
    type: '창업',
    title: '[경북] 울진군 2026년 2차 블루(blue)푸드 산업 활성화 지원사...',
    date: '2026.05.12.~2026.05.25',
    active: true,
    liked: true,
  },
  {
    label: '중기부',
    type: '금융',
    deadline: true,
    title: '2026년 소상공인 투자연계 지원사업 립스(LIPS) 프로그램 소상공...',
    date: '2026.05.06.~2026.05.17',
  },
  {
    label: '중기부',
    type: '기술',
    title: '[경북] 경주시 2026년 2차 e-모빌리티산업 생태계 고도화를 위한 ...',
    date: '2026.05.13.~2026.05.26',
  },
  {
    label: '산업부',
    type: '창업',
    title: '로봇분야 예비창업자 및 재창업자를 위한 창업 성장 프로그램 참가자...',
    date: '2026.05.30.~2026.06.25',
  },
  {
    label: '기후부',
    type: '금융',
    deadline: true,
    title: '2026년 환경신기술 개발 및 보급촉진 업무유공 포상 공고',
    date: '2026.05.06.~2026.06.15',
  },
  {
    label: '과기부',
    type: '기술',
    title: '2026년 디지털인프라(SW) 진단 및 개선 사업 수요기업(기관)...',
    date: '2026.02.13.~2026.05.27',
  },
  {
    label: '중기부',
    type: '기술',
    title: '2026년 예비수소전문기업 지원사업 수혜기업 모집공고',
    date: '2026.05.08.~2026.06.07',
  },
  {
    label: '중기부',
    type: '경영',
    title: '2026년 디지털전환 지원모델 확산사업 지역특화산업지원 참여기업...',
    date: '2026.05.08.~2026.06.07',
  },
  {
    label: '중기부',
    type: '경영',
    title: '여수시 2026년 국가산업단지 AX 수혜기업 모집 공고',
    date: '2026.05.08.~2026.06.07',
  },
];

const MyPage = () => {
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
  const [likedCards, setLikedCards] = useState({});
  const handleToggleLike = (index) => {
    setLikedCards((prev) => ({
      ...prev,
      [index]: !(prev[index] ?? serviceCards[index]?.liked ?? false),
    }));
  };
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기
  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <main className="mypage-content contents">
        <Breadcrumb items={breadcrumbItems} />
                

        <section className="my-summary compact">
          <article className="company-card compact">
            <h3>(주)대한OOOO</h3>
            <dl>
              <dt>사업자 등록번호</dt>
              <dd>123-45-67890</dd>
            </dl>
            <dl>
              <dt>대표자</dt>
              <dd>홍길동</dd>
            </dl>
            <dl>
              <dt>업종</dt>
              <dd>시스템구축/유지보수/솔루션...</dd>
            </dl>

            <ul className="btn-group">
              <li><button type="button" className="krds-btn btn-primary"><i className="svg-icon alarm pure"></i> 알림 수신 설정</button></li>
              <li><button type="button" className="krds-btn btn-primary">기업정보 수정</button></li>
            </ul>
          </article>

          <div className="summary-grid compact">
            {summaryItems.map((item) => (
              <button type="button" className="summary-card compact" key={item.title}>
                <span>
                  <i className={`summary-icon svg-icon ${item.icon}`} aria-hidden="true"></i>
                  <strong>{item.title}</strong>
                </span>
                <em><strong>{item.count}</strong>건</em>
              </button>
            ))}
          </div>
        </section>

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
                {progressItems.map((item) => (
                  <div className="progress-card compact" key={item.title}>
                    <span>
                      <i className={`summary-icon svg-icon pure ${item.icon}`} aria-hidden="true"></i>
                      <strong>{item.title}</strong>
                    </span>
                    <em><strong>{item.count}</strong> 건</em>
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

        <section className="deadline-calendar compact">
          <h2>관심공고 마감 캘린더</h2>

          <div className="calendar-table compact">
            <div className="calendar-row calendar-head">
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="calendar-body">
              <div className="calendar-row">
                <div>17</div>
                <div className="today">
                  <strong>18</strong>
                  <span className="today-bubble">today</span>
                  <em>마감 <strong>02</strong>건</em>
                </div>
                <div>19</div>
                <div>
                                    20 <em>마감 <strong>02</strong>건</em>
                </div>
                <div>21</div>
                <div>22</div>
                <div>23</div>
              </div>

              <div className="calendar-row">
                <div>10</div>
                <div>11</div>
                <div>12</div>
                <div>
                                    13 <em>마감 <strong>02</strong>건</em>
                </div>
                <div>14</div>
                <div>15</div>
                <div>
                                    16 <em>마감 <strong>02</strong>건</em>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="service-status">
          <div className="section-head service-head">
            <h2>서비스 현황</h2>
            <p>각 서비스의 상세 내역을 확인하고 관리할 수 있습니다.</p>
          </div>

          <div className="service-tabs pill">
            {serviceTabs.map((tab, index) => (
              <button type="button" className={index === 0 ? 'is-active' : ''} key={tab}>
                {tab}
              </button>
            ))}
          </div>

          <div className="service-card-grid">
            {serviceCards.map((card, index) => {
              const isLiked = likedCards[index] ?? card.liked ?? false;

              return (
                <article className={`my-service-card ${card.active ? 'is-active' : ''}`} key={index}>
                  <div className="card-meta">
                    <span className="badge">{card.label}</span>
                    <span>{card.type}</span>
                    {card.deadline && <em>마감임박</em>}

                    <button
                      type="button"
                      className={`svg-icon heart like-btn on-bgcolorgray ${isLiked ? 'is-on' : ''}`}
                      aria-label={`${card.title} 찜하기`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(index);
                      }}
                    />
                  </div>
                  <a href="#" className="card-title">
                    {card.title}
                  </a>

                  <div className="card-bottom">
                    <span><i className="svg-icon ico-calendar2"></i> {card.date}</span>
                    <button type="button">상세조회</button>
                  </div>
                </article>
              );
            })}
          </div>

          <button type="button" className="service-more">
                        더보기
            <i className="svg-icon ico-angle"></i>
          </button>
        </section>
      </main>
    </>
  );
};

export default MyPage;