import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appendReturnUrlToPath } from '@utils/listNavigation.js';
import { api as apiClient } from '@lib/apiClient.js';

const SCRAP_TYPE_LABELS = {
  BIZP: '사업공고',
  PLCF: '정책금융',
};

const API_GUIDE_PATH_BY_CODE = {
  AD05: 'supportBusinessInfoApi',
  AD02: 'eventInfoApi',
  Y105: 'innoBizCertificateApi',
  Y106: 'ventureCertificateApi',
  Y104: 'mainBizCertificateApi',
};

const HIDDEN_LIKE_BUTTON_STYLE = {
  visibility: 'hidden',
  pointerEvents: 'none',
};

const hasText = (value) => String(value ?? '').trim().length > 0;

const normalizeText = (value, fallback = '-') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

const normalizeCount = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : null;
};

const getResourceItems = (resource) => (Array.isArray(resource?.items) ? resource.items : []);

const getResourceTotal = (resource, fallbackItems = getResourceItems(resource)) => {
  const totalElements = normalizeCount(resource?.totalElements);
  return totalElements === null ? fallbackItems.length : totalElements;
};

const getDateParts = (value) => {
  const text = String(value ?? '').trim();

  if (!text) {
    return null;
  }

  const compactMatch = text.match(/^(\d{4})(\d{2})(\d{2})$/);
  const separatedMatch = text.match(/^(\d{4})[-.](\d{2})[-.](\d{2})/);
  const match = compactMatch || separatedMatch;

  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

const toLocalDate = (value) => {
  const parts = getDateParts(value);

  if (!parts) {
    return null;
  }

  return new Date(parts.year, parts.month - 1, parts.day);
};

const formatDateValue = (value) => {
  const parts = getDateParts(value);

  if (!parts) {
    return '-';
  }

  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${parts.year}.${month}.${day}`;
};

const formatDateRange = (startValue, endValue) => {
  const start = formatDateValue(startValue);
  const end = formatDateValue(endValue);

  if (start !== '-' && end !== '-') {
    return `${start}~${end}`;
  }

  return start !== '-' ? start : end;
};

const formatLabeledDate = (label, value) => {
  const date = formatDateValue(value);
  return date === '-' ? '-' : `${label} ${date}`;
};

const isNearDeadline = (value) => {
  const deadline = toLocalDate(value);

  if (!deadline) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
};

const buildFallbackCard = ({ tabKey, resource, emptyTitle }) => {
  if (resource?.loading) {
    return [{
      key: `${tabKey}-loading`,
      label: '조회중',
      type: '로딩',
      title: '데이터를 불러오는 중입니다.',
      date: '-',
      liked: false,
    }];
  }

  if (resource?.error) {
    return [{
      key: `${tabKey}-error`,
      label: '오류',
      type: '조회실패',
      title: normalizeText(resource.error, '데이터 조회에 실패했습니다.'),
      date: '-',
      liked: false,
    }];
  }

  return [{
    key: `${tabKey}-empty`,
    label: '안내',
    type: '0건',
    title: emptyTitle,
    date: '-',
    liked: false,
  }];
};

const buildSupportApplicationCards = (resource) =>
  getResourceItems(resource).map((item, index) => ({
    key: `support-${item?.bizPbancNo ?? index}`,
    label: normalizeText(item?.bizSprvsnInstNm, '지원사업'),
    type: normalizeText(item?.bizAplyPrgrsSttsNm || item?.bizPbancClsfNm || item?.bizPbancClsfCd, '신청'),
    deadline: isNearDeadline(item?.bizPbancDdlnYmd),
    title: normalizeText(item?.bizPbancNm, '지원사업 신청 내역'),
    date: formatDateRange(item?.bizPbancBgngYmd, item?.bizPbancDdlnYmd),
    to: item?.bizPbancNo ? `/req/pbanc/${item.bizPbancNo}` : null,
    liked: false,
    showLike: false,
  }));

const getScrapType = (item) => item?.dashboardScrapCategory || item?.pbanc_type_se_cd || item?.pbancTypeSeCd;

const getScrapDetailPath = (item) => {
  const type = getScrapType(item);

  if (type === 'BIZP' && item?.id) {
    return `/req/pbanc/${item.id}`;
  }

  if (type === 'PLCF' && item?.id) {
    return `/req/UI_USR_L_030/${item.id}`;
  }

  return null;
};

const buildScrapCards = (resource) =>
  getResourceItems(resource).map((item, index) => {
    const type = getScrapType(item);
    const deadline = item?.deadlineYmd || item?.deadline_ymd;
    const registeredAt = item?.scrap_reg_dt || item?.scrapRegDt;

    return {
      key: `scrap-${item?.pbanc_scrp_sn || item?.pbancScrpSn || item?.id || index}`,
      label: SCRAP_TYPE_LABELS[type] || '관심공고',
      type: '관심',
      deadline: isNearDeadline(deadline),
      title: normalizeText(item?.title, '관심공고 내역'),
      date: deadline ? formatLabeledDate('마감', deadline) : formatLabeledDate('등록', registeredAt),
      to: getScrapDetailPath(item),
      liked: item?.use_yn !== 'N' && item?.useYn !== 'N',
      showLike: true,
      scrapTypeCd: type,
      targetId: item?.id,
    };
  });

const buildCertificateCards = (resource) =>
  getResourceItems(resource).map((item, index) => ({
    key: `certificate-${item?.prdocIssuAplyNo ?? index}`,
    label: '증명서',
    type: normalizeText(item?.prdocIssuPrgrsStNm || item?.prdocIssuTypeCd, '발급'),
    title: normalizeText(item?.prdocTtl, '증명서 발급이력'),
    date: item?.aplyDt ? formatLabeledDate('신청', item.aplyDt) : formatLabeledDate('유효', item?.vldEndYmd),
    liked: false,
    showLike: false,
  }));

const buildInquiryCards = (resource) =>
  getResourceItems(resource).map((item, index) => ({
    key: `inquiry-${item?.pstNo ?? index}`,
    label: 'Q&A',
    type: hasText(item?.pstAnsCn) ? '답변완료' : '답변대기',
    title: normalizeText(item?.pstTtl, '나의 질의내역'),
    date: formatLabeledDate('등록', item?.pstRegDt || item?.regDt),
    liked: false,
    showLike: false,
  }));

const isIssuedApiKey = (item) => item?.useYn === 'Y' && hasText(item?.apiCertTkn);

const getIssuedApiKeyItems = (resource) =>
  Array.isArray(resource?.issuedItems) ? resource.issuedItems : getResourceItems(resource).filter(isIssuedApiKey);

const getIssuedApiKeyTotal = (resource) => {
  const issuedItems = getIssuedApiKeyItems(resource);
  const issuedTotalElements = normalizeCount(resource?.issuedTotalElements);
  return issuedTotalElements === null ? issuedItems.length : issuedTotalElements;
};

const getApiGuidePath = (item) => {
  const path = API_GUIDE_PATH_BY_CODE[item?.apiSeCd];
  return path ? `/cs/opndata/UI_USR_L_210/${path}` : null;
};

const buildApiKeyTitle = (item) => {
  const siteName = normalizeText(item?.siteNm, '');
  const apiName = normalizeText(item?.apiNm, '');

  if (siteName && apiName) {
    return `${siteName} / ${apiName}`;
  }

  return siteName || apiName || normalizeText(item?.apiRegAplyCn, 'API 인증키 신청이력');
};

const buildApiKeyCards = (resource) =>
  getIssuedApiKeyItems(resource).map((item, index) => ({
    key: `api-key-${item?.apiCertTkn || item?.apiSeCd || index}`,
    label: 'API',
    type: '발행완료',
    title: buildApiKeyTitle(item),
    date: formatLabeledDate('신청', item?.apiAplyYmd),
    to: getApiGuidePath(item),
    liked: false,
    showLike: false,
  }));

// 탭 정의는 부모 dashboardData resource를 화면 카드 계약으로 변환하는 유일한 매핑 지점이다.
const SERVICE_TAB_DEFINITIONS = [
  {
    key: 'supportApplications',
    title: '지원사업 신청현황',
    getResource: (dashboardData) => dashboardData?.supportApplications,
    getTotal: (resource) => getResourceTotal(resource),
    buildCards: buildSupportApplicationCards,
    emptyTitle: '조회된 지원사업 신청현황이 없습니다.',
  },
  {
    key: 'scraps',
    title: '나의 관심공고',
    getResource: (dashboardData) => dashboardData?.scraps,
    getTotal: (resource) => getResourceTotal(resource),
    buildCards: buildScrapCards,
    emptyTitle: '조회된 관심공고가 없습니다.',
  },
  {
    key: 'certificateIssuances',
    title: '증명서 발급이력',
    getResource: (dashboardData) => dashboardData?.certificateIssuances,
    getTotal: (resource) => getResourceTotal(resource),
    buildCards: buildCertificateCards,
    emptyTitle: '조회된 증명서 발급이력이 없습니다.',
  },
  {
    key: 'inquiries',
    title: '나의 질의내역',
    getResource: (dashboardData) => dashboardData?.inquiries,
    getTotal: (resource) => getResourceTotal(resource),
    buildCards: buildInquiryCards,
    emptyTitle: '조회된 질의내역이 없습니다.',
  },
  {
    key: 'apiKeys',
    title: 'API 인증키 신청이력',
    getResource: (dashboardData) => dashboardData?.apiKeys,
    getTotal: getIssuedApiKeyTotal,
    buildCards: buildApiKeyCards,
    emptyTitle: '발행완료된 API 인증키가 없습니다.',
  },
];

const buildTabViewModels = (dashboardData) =>
  SERVICE_TAB_DEFINITIONS.map((tab) => {
    const resource = tab.getResource(dashboardData) || {};
    const cards = tab.buildCards(resource);

    return {
      ...tab,
      resource,
      total: tab.getTotal(resource),
      cards: cards.length > 0
        ? cards
        : buildFallbackCard({ tabKey: tab.key, resource, emptyTitle: tab.emptyTitle }),
    };
  });

const ServiceStatusSection = ({ dashboardData, onScrapStatusChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [likedCards, setLikedCards] = useState({});
  const [pendingLikeCards, setPendingLikeCards] = useState({});
  const tabViewModels = useMemo(() => buildTabViewModels(dashboardData), [dashboardData]);
  const activeTab = tabViewModels[activeTabIndex] || tabViewModels[0];

  // 하트는 관심공고 탭에서만 실제 스크랩 상태와 연결되고, 다른 탭은 레이아웃 자리만 보존한다.
  const handleToggleLike = async (card) => {
    const canToggleScrap = card.showLike && card.scrapTypeCd && card.targetId;

    if (!canToggleScrap || pendingLikeCards[card.key]) {
      return;
    }

    setPendingLikeCards((prev) => ({
      ...prev,
      [card.key]: true,
    }));

    try {
      const response = await apiClient.post('/api/v1/scraps/toggle', {
        scrapTypeCd: card.scrapTypeCd,
        targetId: card.targetId,
      });
      const payload = response?.data ?? response;
      const result = payload?.data ?? payload;
      const nextLiked = Boolean(result?.scrapped);

      setLikedCards((prev) => ({
        ...prev,
        [card.key]: nextLiked,
      }));

      if (typeof onScrapStatusChange === 'function') {
        onScrapStatusChange({
          scrapTypeCd: card.scrapTypeCd,
          targetId: card.targetId,
          scrapped: nextLiked,
        });
      }
    } catch {
      alert('관심공고 처리에 실패했습니다.');
    } finally {
      setPendingLikeCards((prev) => {
        const next = { ...prev };
        delete next[card.key];
        return next;
      });
    }
  };

  const handleNavigateCard = (event, card) => {
    event.preventDefault();

    if (!card.to) {
      return;
    }

    navigate(appendReturnUrlToPath(card.to, location));
  };

  return (
    <section className="service-status">
      <div className="section-head service-head">
        <h2>서비스 현황</h2>
        <p>각 서비스의 상세 내역을 확인하고 관리할 수 있습니다.</p>
      </div>

      <div className="service-tabs pill">
        {tabViewModels.map((tab, index) => (
          <button
            type="button"
            className={index === activeTabIndex ? 'is-active' : ''}
            key={tab.key}
            onClick={() => setActiveTabIndex(index)}
          >
            {tab.title}({tab.total})
          </button>
        ))}
      </div>

      <div className="service-card-grid">
        {activeTab.cards.map((card) => {
          const isLiked = likedCards[card.key] ?? card.liked ?? false;
          const canToggleScrap = card.showLike && card.scrapTypeCd && card.targetId;

          return (
            <article className="my-service-card" key={card.key}>
              <div className="card-meta">
                <span className="badge">{card.label}</span>
                <span>{card.type}</span>
                {card.deadline && <em>마감임박</em>}

                <button
                  type="button"
                  className={`svg-icon heart like-btn on-bgcolorgray ${isLiked ? 'is-on' : ''}`}
                  aria-label={canToggleScrap ? `${card.title} 관심공고 해제` : undefined}
                  aria-hidden={!canToggleScrap}
                  aria-pressed={canToggleScrap ? isLiked : undefined}
                  disabled={canToggleScrap ? Boolean(pendingLikeCards[card.key]) : false}
                  tabIndex={canToggleScrap ? undefined : -1}
                  style={canToggleScrap ? undefined : HIDDEN_LIKE_BUTTON_STYLE}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLike(card);
                  }}
                />
              </div>
              <a href={card.to || '#'} className="card-title" onClick={(event) => handleNavigateCard(event, card)}>
                {card.title}
              </a>

              <div className="card-bottom">
                <span><i className="svg-icon ico-calendar2"></i> {card.date}</span>
                <button type="button" onClick={(event) => handleNavigateCard(event, card)}>상세조회</button>
              </div>
            </article>
          );
        })}
      </div>

      {/* 대시보드는 부모가 가져온 탭별 목록을 한 번에 노출하므로 더보기 마크업은 보존만 한다. */}
      <button type="button" className="service-more" hidden style={{ display: 'none' }}>
        더보기
        <i className="svg-icon ico-angle"></i>
      </button>
    </section>
  );
};

export default ServiceStatusSection;
