import { useMemo, useState } from 'react';

// 탭 순서와 dashboardData resource key를 한곳에서 맞춘다.
const serviceTabConfigs = [
  { key: 'supportApplications', label: '지원사업 신청현황' },
  { key: 'scraps', label: '나의 관심공고' },
  { key: 'certificateIssuances', label: '증명서 발급이력' },
  { key: 'inquiries', label: '나의 질의내역' },
  { key: 'apiKeys', label: 'API 인증키 신청이력' },
];

// 탭 카운트도 요약 카드와 같은 null/0 표시 규칙을 따른다.
const normalizeCount = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : null;
};

const formatTabCount = (value) => {
  const count = normalizeCount(value);
  return Number.isFinite(count) ? count : '-';
};

// API별 제목, 상태, 일자 필드명이 달라 카드 표시 전에 빈 값 처리를 통일한다.
const normalizeText = (value, fallback = '-') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

// 응답마다 yyyyMMdd, ISO datetime, 빈 값이 섞여 카드용 yyyy.MM.dd 문자열로 맞춘다.
const formatDateText = (value) => {
  if (!value) {
    return '-';
  }

  const digits = String(value).replace(/[^0-9]/g, '');

  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
  }

  return String(value);
};

// 지원사업 상태는 원문 상태가 있으면 우선 쓰고, 없으면 대시보드 summary 그룹을 사람이 읽는 문구로 바꾼다.
const getSupportApplicationStatus = (item) => {
  if (item?.statusRaw) {
    return item.statusRaw;
  }

  if (item?.statusGroup === 'COMPLETED') {
    return '신청완료';
  }

  if (item?.statusGroup === 'IN_PROGRESS') {
    return '신청중';
  }

  return '미정';
};

// 관심공고 API는 snake_case와 camelCase가 섞여 내려오므로 두 형태를 모두 허용한다.
const getScrapTypeLabel = (item) => {
  const type = item?.pbanc_type_se_cd || item?.pbancTypeSeCd || item?.dashboardScrapCategory;

  if (type === 'BIZP') {
    return '사업공고';
  }

  if (type === 'PLCF') {
    return '정책금융';
  }

  return normalizeText(type, '관심공고');
};

// 신청 이력 탭에서는 전체를 보여주지만, 카드 상태명은 실제 토큰 발행 여부로 구분한다.
const getApiKeyStatus = (item) => (item?.useYn === 'Y' && item?.apiCertTkn ? '발행완료' : '신청');

// 각 업무 응답을 서비스 카드 공통 모델({id,label,type,title,date})로 투영한다.
const buildCardsByType = {
  supportApplications: (items) => items.map((item) => ({
    id: `${item.requestId || ''}-${item.pbancId || ''}-${item.detailBizId || ''}-${item.title || ''}`,
    label: normalizeText(item.sourceName || item.sourceCode, '지원사업'),
    type: getSupportApplicationStatus(item),
    title: normalizeText(item.title),
    date: `신청일 ${formatDateText(item.requestDate || item.requestDateTime)}`,
    active: item.statusGroup === 'IN_PROGRESS',
  })),
  scraps: (items) => items.map((item) => ({
    id: `${item.dashboardScrapCategory || ''}-${item.pbanc_scrp_sn || item.pbancScrpSn || item.id || item.title || ''}`,
    label: getScrapTypeLabel(item),
    type: '관심공고',
    title: normalizeText(item.title),
    date: `등록일 ${formatDateText(item.scrap_reg_dt || item.scrapRegDt || item.createdAt)}`,
    liked: true,
  })),
  certificateIssuances: (items) => items.map((item) => ({
    id: item.prdocIssuAplyNo || item.prdocTtl,
    label: '증명서',
    type: normalizeText(item.prdocIssuPrgrsStNm, '발급이력'),
    title: normalizeText(item.prdocTtl),
    date: `신청일 ${formatDateText(item.aplyDt)}`,
  })),
  inquiries: (items) => items.map((item) => ({
    id: `${item.bbsNo || ''}-${item.pstNo || ''}`,
    label: 'Q&A',
    type: normalizeText(item.ctgryNm, '문의'),
    title: normalizeText(item.pstTtl),
    date: `등록일 ${formatDateText(item.pstRegDt || item.regDt)}`,
  })),
  apiKeys: (items) => items.map((item) => ({
    id: `${item.apiSeCd || ''}-${item.apiAplyYmd || ''}-${item.apiNm || ''}`,
    label: normalizeText(item.ogdpInstNm || item.siteNm, 'API'),
    type: getApiKeyStatus(item),
    title: normalizeText(item.apiNm),
    date: `신청일 ${formatDateText(item.apiAplyYmd)}`,
  })),
  notifications: (items) => items.map((item) => ({
    id: `${item.pbancScrpSn || ''}-${item.pbancScrpNtcSn || ''}`,
    label: normalizeText(item.pbancTypeSeNm, '알림'),
    type: '알림',
    title: normalizeText(item.gdPhrsCn || item.ttl),
    date: `알림일 ${formatDateText(item.ntcDt)}`,
  })),
};

// API 인증키 탭은 "신청이력"이므로 발행완료 건수가 아니라 전체 이력 건수를 사용한다.
const getTabTotalElements = (key, dashboardData) => {
  if (key === 'apiKeys') {
    return dashboardData?.apiKeys?.totalElements;
  }

  return dashboardData?.[key]?.totalElements;
};

// API 인증키 탭은 전체 신청 목록을 보여주고, 다른 탭은 해당 resource items를 그대로 쓴다.
const getTabItems = (key, dashboardData) => {
  if (key === 'apiKeys') {
    return dashboardData?.apiKeys?.items || [];
  }

  return dashboardData?.[key]?.items || [];
};

// 선택된 탭 key에 맞는 mapper가 없으면 빈 목록으로 두어 화면 오류를 막는다.
const buildServiceCards = (key, dashboardData) => {
  const buildCards = buildCardsByType[key];
  return buildCards ? buildCards(getTabItems(key, dashboardData)) : [];
};

const ServiceStatusSection = ({ dashboardData } = {}) => {
  // activeTabIndex는 서비스 현황 내부 UI 상태이고, 업무 데이터 자체는 부모 dashboardData를 따른다.
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  // 관심공고 하트는 대시보드 임시 표시 상태라 API 원본 use_yn을 변경하지 않는다.
  const [likedCards, setLikedCards] = useState({});
  const activeTab = serviceTabConfigs[activeTabIndex] || serviceTabConfigs[0];
  const serviceTabs = useMemo(
    () => serviceTabConfigs.map((tab) => `${tab.label}(${formatTabCount(getTabTotalElements(tab.key, dashboardData))})`),
    [dashboardData],
  );
  // 서로 다른 업무 응답을 같은 카드 UI로 보여주기 위해 화면 표시 모델만 얇게 만든다.
  const serviceCards = useMemo(
    () => buildServiceCards(activeTab.key, dashboardData),
    [activeTab.key, dashboardData],
  );

  const handleToggleLike = (cardId, fallbackLiked) => {
    setLikedCards((prev) => ({
      ...prev,
      [cardId]: !(prev[cardId] ?? fallbackLiked ?? false),
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
          <button
            type="button"
            className={index === activeTabIndex ? 'is-active' : ''}
            key={serviceTabConfigs[index].key}
            onClick={() => setActiveTabIndex(index)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="service-card-grid">
        {serviceCards.map((card, index) => {
          const cardId = card.id || `${activeTab.key}-${index}`;
          const isLiked = likedCards[cardId] ?? card.liked ?? false;

          return (
            <article className={`my-service-card ${card.active ? 'is-active' : ''}`} key={cardId}>
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
                    handleToggleLike(cardId, card.liked);
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
