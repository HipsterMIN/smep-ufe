import { useState } from 'react';

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

const ServiceStatusSection = () => {
  const [likedCards, setLikedCards] = useState({});
  const handleToggleLike = (index) => {
    setLikedCards((prev) => ({
      ...prev,
      [index]: !(prev[index] ?? serviceCards[index]?.liked ?? false),
    }));
  };

  return (
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
  );
};

export default ServiceStatusSection;
