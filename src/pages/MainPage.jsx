import React, { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import Header from '@components/ui/Header.jsx';
import Footer from '@components/ui/Footer.jsx';
const Work24VirtualKeyboard = lazy(() => import('@components/ui/work24-keyboard/Work24VirtualKeyboard.jsx'));
import mainBanner01 from '@assets/main/new/main-banner-01.png';
import mainBanner02 from '@assets/main/new/main-banner-02.png';
import mainIcon01 from '@assets/main/new/mainIcon_01.svg';
import mainIcon02 from '@assets/main/new/mainIcon_02.svg';
import mainIcon03 from '@assets/main/new/mainIcon_03.svg';
import mainIcon04 from '@assets/main/new/mainIcon_04.svg';
import mainIcon05 from '@assets/main/new/mainIcon_05.svg';
import mainIcon06 from '@assets/main/mainIcon_06.svg';
import bannerLine from '@assets/main/new/banner-support-biz.png';
import bannerLineM from '@assets/main/new/banner-support-biz-m.png';
import { api as apiClient } from '@lib/apiClient.js';
import { fetchAndConvertCommonCodes } from '@utils/commonCodeUtils.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useAuthStore } from '@store/useAuthStore.jsx';
import OnepassLoginConversionModal from '@pages/onepass/OnepassLoginConversionModal.jsx';
import InitialPasswordNoticeModal from '@components/account/InitialPasswordNoticeModal.jsx';
import { buildOnePassConversionUrl, buildOnePassRegisterUrl, onePassJoin } from '@utils/keycloakGetAuthCode.js';
import MainPopupItem from './main/MainPopupItem.jsx';
import {
  normalizeResponse, resolveApiErrorMessage, removeCssCharset,
  formatDate, formatLocalDateKey, getLocalYmd,
  formatMainEventPeriod, parseYmd, formatCalendarDate, formatWeekItemDate, formatWeekPeriod,
  getDdayLabel, getDdayBadgeClass, isUrgentDday, getPbancStatusLabel,
  buildMainImageUrl, buildBoardThumbnailUrl,
  isNewWindow, isAbsoluteHttpUrl, appendQueryParam, resolveBoardTarget, stripHtmlTags,
  extractPopularKeywords, extractAutoCompleteKeywords,
} from './main/mainUtils.js';
// ?inline → 모듈 로드 시점에 CSS 텍스트를 번들에 포함
// (useEffect 대신 모듈 초기화 시점에 주입 → FOUC 제거)
// custom.scss App.jsx 로 이동으로 주석
// import _customScss from '@styles/custom.scss?inline';
import _mainScss from '@styles/main.scss?inline';

const EMPTY_HTML_PATTERNS = new Set([
  '<p style="text-align: left;"></p>',
  '<p><br></p>',
  '<p>&nbsp;</p>',
]);
const MAIN_MENU_IDS = {
  notice: 'M_PIIO_00101',
  faq: 'M_PIIO_00102',
  adminInfo: 'M_PIIO_00087',
  policyNews: 'M_PIIO_00084',
  eventInfo: 'M_PIIO_00085',
  monthlyNuri: 'M_PIIO_00086',
};
const BIZ_PBANC_CLSF_GROUP_ID = 'BIZ_PBANC_CLSF_CD';
const CARD_NEWS_CATEGORY_NO = '2';
const MAIN_PAGE_STYLE_ELEMENT_ID = 'smep-main-page-style';
const EMPTY_MAIN_DATA = {
  pbancs: [],
  sprtBizs: [],
  certificates: [],
  financePolicies: [],
  notices: [],
  faqs: [],
  adminInfos: [],
  todayPbancTotalCount: null,
  todayPbancs: [],
  weeklyPbancGroups: [],
  weeklyPbancWeekGroups: [],
  supportPbancGroups: {
    central: [],
    local: [],
  },
  cardNews: null,
  eventInfos: [],
  archiveItems: [],
  newNews: [],
  banners: [],
  popups: [],
};
// 이미지 없음 placeholder (외부 파일 의존 없이 인라인 SVG)
const NO_IMAGE_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#f0f2f5"/>
    <g transform="translate(200,135)">
      <rect x="-36" y="-32" width="72" height="56" rx="6" fill="none" stroke="#c8cdd4" stroke-width="2.5"/>
      <circle cx="0" cy="-10" r="11" fill="none" stroke="#c8cdd4" stroke-width="2.5"/>
      <polyline points="-36,24 -18,2 0,16 18,-2 36,24" fill="none" stroke="#c8cdd4" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    </g>
    <text x="200" y="192" text-anchor="middle" font-family="Apple SD Gothic Neo,Malgun Gothic,sans-serif" font-size="13" fill="#a0a8b4">이미지 없음</text>
  </svg>`,
)}`;

const SEARCH_POPULAR_LIMIT = 5;
const SEARCH_AUTOCOMPLETE_LIMIT = 8;
const SEARCH_AUTOCOMPLETE_DEBOUNCE_MS = 250;
const ONEPASS_CONVERSION_MODAL_DISMISSED_KEY = '__onepass_conversion_modal_dismissed__';
const MOBILE_POPUP_MEDIA_QUERY = '(max-width: 767px)';
const EMPTY_LIST = Object.freeze([]);
const EMPTY_SUPPORT_PBANC_GROUPS = Object.freeze({
  central: EMPTY_LIST,
  local: EMPTY_LIST,
});
const WEEK_PBANC_SHORT_AGENCY_NAMES = {
  중소벤처기업부: '중기부',
};

/*
 * 의도: 이번 주 공고 행은 날짜·D-day·기관·제목이 한 줄에 배치되어 긴 기관명이 제목 영역을 과하게 줄일 수 있다.
 * 동작: 화면 표시용 기관명만 축약 목록에 따라 변환하고, 축약 대상이 아니면 API 원문 기관명을 그대로 반환한다.
 * 주의: 상세 팝업과 다른 공고 영역의 원본 데이터는 바꾸지 않으며, 현재 요청 범위인 이번 주 공고 배지 출력에만 사용한다.
 */
const formatWeekPbancAgencyBadge = (agencyName) => {
  const normalizedName = String(agencyName || '').trim();
  if (!normalizedName) return '공고';
  return WEEK_PBANC_SHORT_AGENCY_NAMES[normalizedName] || normalizedName;
};

// ─── React Query 쿼리 함수 (컴포넌트 외부 정의로 참조 안정성 보장) ─────────
const fetchMainData = () => apiClient.get('/api/v1/main').then(normalizeResponse);
const fetchPbancSummary = () => apiClient.get('/api/v1/main/pbanc-summary').then(normalizeResponse);
const fetchBizCodes = () =>
  fetchAndConvertCommonCodes([BIZ_PBANC_CLSF_GROUP_ID])
    .then((res) => normalizeResponse(res)?.[BIZ_PBANC_CLSF_GROUP_ID] || []);
const fetchPopularKeywords = () =>
  apiClient.get('/api/v1/search/popword').then(extractPopularKeywords);

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getFullPath } = useUserMenu();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [noticeActiveIndex, setNoticeActiveIndex] = useState(0);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [likedAnnounce, setLikedAnnounce] = useState({});
  const [likedPolicy, setLikedPolicy] = useState({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [hiddenPopupIds, setHiddenPopupIds] = useState(() => {
    try {
      const todayKey = formatLocalDateKey();
      return Object.keys(localStorage)
        .filter((key) => key.startsWith('main-popup-hide-'))
        .filter((key) => localStorage.getItem(key) === todayKey)
        .map((key) => key.replace('main-popup-hide-', ''));
    } catch {
      return [];
    }
  });
  const [closedPopupIds, setClosedPopupIds] = useState([]);
  const [activePopupId, setActivePopupId] = useState(null);
  const [autoCompleteKeywords, setAutoCompleteKeywords] = useState([]);
  const [isAutoCompleteEnabled, setIsAutoCompleteEnabled] = useState(true);
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [isMobilePopupViewport, setIsMobilePopupViewport] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(MOBILE_POPUP_MEDIA_QUERY).matches;
  });
  const [isMobilePopupExpanded, setIsMobilePopupExpanded] = useState(false);

  // ─── React Query: 메인 데이터 (stale-while-revalidate 60초) ───────────────
  const { data: mainDataRaw, isLoading: mainLoading } = useQuery({
    queryKey: ['main-data'],
    queryFn: fetchMainData,
    staleTime: 60_000,
  });
  // pbanc-summary는 별도로 먼저 조회 → mainData 도착 전 공고 섹션을 채움
  const { data: summaryData } = useQuery({
    queryKey: ['pbanc-summary'],
    queryFn: fetchPbancSummary,
    staleTime: 60_000,
  });
  // summary 먼저, mainData 도착 후 완전 덮어씀
  const mainData = { ...EMPTY_MAIN_DATA, ...(summaryData || {}), ...(mainDataRaw || {}) };

  // 공통 코드 (5분 캐시)
  const { data: bizFieldOptions = [] } = useQuery({
    queryKey: ['common-codes', BIZ_PBANC_CLSF_GROUP_ID],
    queryFn: fetchBizCodes,
    staleTime: 5 * 60_000,
  });

  // 인기 검색어 (30초 캐시)
  const { data: popularKeywordsRaw, isLoading: isPopularLoading } = useQuery({
    queryKey: ['popular-keywords'],
    queryFn: fetchPopularKeywords,
    staleTime: 30_000,
  });
  //자주 찾는 증명서(Top 5)
  const fetchTop5Certificates = () =>
    apiClient.get('/api/v1/certificate/top5').then((res) => {
      const data = normalizeResponse(res);
      return Array.isArray(data) ? data : [];
    });

  const { data: top5Certificates = [], isLoading: isTop5Loading } = useQuery({
    queryKey: ['top5-certificates'],
    queryFn: fetchTop5Certificates,
    staleTime: 5 * 60_000, //5분 캐시
  });

  const handleCertificateClick = (prdocCd) => {
    if (!prdocCd) return;
    navigate(`/crtf/UI_USR_L_040/${prdocCd}`);
  };

  const isMeaningfulHtml = (html) => {
    if (!html || typeof html !== 'string') return false;

    const normalized = html.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!normalized || EMPTY_HTML_PATTERNS.has(normalized)) return false;

    const textOnly = normalized.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
    return textOnly.length > 0;
  };

  const getPlainText = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  };
  const toggleExpandedRow = (key) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderExpandableHtmlRow = (label, html) => {
    if (!isMeaningfulHtml(html)) return null;

    const canExpand = getPlainText(html).length > 200;
    const isExpanded = Boolean(expandedRows[label]);

    return (
      <React.Fragment key={label}>
        <dt>{label}</dt>
        <dd>
          <div
            className={canExpand ? `onshadow-text${isExpanded ? ' on' : ''}` : undefined}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {canExpand && (
            <button
              type="button"
              className="krds-btn tertiary xsmall ontoggle-textshadow"
              onClick={() => toggleExpandedRow(label)}
            >
              {isExpanded ? '접기' : '전체보기'}
              <i className="svg-icon ico-angle"></i>
            </button>
          )}
        </dd>
      </React.Fragment>
    );
  };

  const popularKeywords = popularKeywordsRaw?.slice(0, SEARCH_POPULAR_LIMIT) || [];
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [hasOpenedKeyboard, setHasOpenedKeyboard] = useState(false);
  const [isOnepassModalOpen, setIsOnepassModalOpen] = useState(false);
  const [hasCi, setHasCi] = useState(null);
  const [isSearchFixed, setIsSearchFixed] = useState(false);
  const srchInputRef = useRef(null);
  const keyboardButtonRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchBarRef = useRef(null);
  const originTopRef = useRef(0);
  const swiperRef = useRef(null);
  const latestAutoQueryRef = useRef('');
  const weekGroupInitializedRef = useRef(false);
  const mobilePopupTouchStartYRef = useRef(null);
  const authToken = useAuthStore((state) => state.token);
  const isLogin = useAuthStore((state) => state.isLogin);
  const intgMbrSwtcYn = useAuthStore((state) => state.intgMbrSwtcYn);
  const isLoggedIn = Boolean(authToken);

  // useLayoutEffect: React 커밋 직후, 브라우저 페인트 전에 동기 실행 → FOUC 없음
  // _customScss / _mainScss는 정적 import로 이미 메모리에 있으므로 동기 주입 가능
  useLayoutEffect(() => {
    const existing = document.getElementById(MAIN_PAGE_STYLE_ELEMENT_ID);
    if (!existing) {
      const el = document.createElement('style');
      el.id = MAIN_PAGE_STYLE_ELEMENT_ID;
      el.setAttribute('data-main-page-style', 'true');
      /*el.textContent = [removeCssCharset(_customScss), removeCssCharset(_mainScss)].join('\n');*/
      el.textContent = [removeCssCharset(_mainScss)].join('\n');
      document.head.appendChild(el);
    }
    return () => {
      document.getElementById(MAIN_PAGE_STYLE_ELEMENT_ID)?.remove();
    };
  }, []);

  const showPopular = isFocused && searchQuery.trim() === '';
  const showAutoComplete =
    isFocused && isAutoCompleteEnabled && searchQuery.trim() !== '';
  const noticeTabMenu = ['자주찾는 질문', '행사정보', '공지사항', '새로운 뉴스'];
  const platformMenus = [
    {
      img: mainIcon01,
      title: '사업공고',
      path: '/req/pbanc',
    },
    {
      img: mainIcon02,
      title: '증명서 발급',
      path: '/crtf/UI_USR_L_040',
    },
    {
      img: mainIcon04,
      title: '정책금융',
      path: '/req/UI_USR_L_030',
    },
    {
      img: mainIcon03,
      title: '정책뉴스',
      path: '/plcy/reprt/plcyNews',
    },
    {
      img: mainIcon05,
      title: '행사정보',
      path: '/plcy/reprt/UI_USR_L_190',
    },
    {
      img: mainIcon06,
      title: '입법·행정예고/고시',
      path: '/plcy/icr/UI_USR_L_110',
    },
  ];

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_POPUP_MEDIA_QUERY);
    const handleViewportChange = (event) => {
      setIsMobilePopupViewport(event.matches);
    };

    setIsMobilePopupViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleViewportChange);
      return () => mediaQuery.removeEventListener('change', handleViewportChange);
    }

    mediaQuery.addListener(handleViewportChange);
    return () => mediaQuery.removeListener(handleViewportChange);
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      setClosedPopupIds([]);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const keyboardZone = document.getElementById('HM_keyboardzone');
      if (keyboardZone?.contains(e.target)) return;
      if (srchInputRef.current && !srchInputRef.current.contains(e.target))
        setIsFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isFocused) return;
    setIsKeyboardOpen(false);
  }, [isFocused]);

  useEffect(() => {
    const saveOriginTop = () => {
      if (!searchBarRef.current) return;
      searchBarRef.current.classList.remove('is-fixed');
      document.documentElement.classList.remove('searchbar-fixed');
      const headerHeight =
        document.querySelector('#krds-header')?.offsetHeight || 0;
      originTopRef.current =
        searchBarRef.current.getBoundingClientRect().top +
        window.scrollY -
        headerHeight;
      const isFixed = window.scrollY >= originTopRef.current + headerHeight;
      searchBarRef.current.classList.toggle('is-fixed', isFixed);
      document.documentElement.classList.toggle('searchbar-fixed', isFixed);
      setIsSearchFixed(isFixed);
    };
    saveOriginTop();
    window.addEventListener('resize', saveOriginTop);
    return () => window.removeEventListener('resize', saveOriginTop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!searchBarRef.current) return;
      const headerHeight =
        document.querySelector('#krds-header')?.offsetHeight || 0;
      const isFixed = window.scrollY >= originTopRef.current + headerHeight;
      searchBarRef.current.classList.toggle('is-fixed', isFixed);
      document.documentElement.classList.toggle('searchbar-fixed', isFixed);
      setIsSearchFixed(isFixed);
      setIsFocused(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isFocused || !isAutoCompleteEnabled) {
      latestAutoQueryRef.current = '';
      setAutoCompleteKeywords([]);
      setIsAutoLoading(false);
      return;
    }

    const keyword = searchQuery.trim();
    if (!keyword) {
      latestAutoQueryRef.current = '';
      setAutoCompleteKeywords([]);
      setIsAutoLoading(false);
      return;
    }

    latestAutoQueryRef.current = keyword;

    const timerId = window.setTimeout(async () => {
      try {
        setIsAutoLoading(true);
        const params = new URLSearchParams({ query: keyword });
        const response = await apiClient.get(`/api/v1/search/ark?${params.toString()}`);
        if (latestAutoQueryRef.current !== keyword) return;
        setAutoCompleteKeywords(
          extractAutoCompleteKeywords(response).slice(
            0,
            SEARCH_AUTOCOMPLETE_LIMIT,
          ),
        );
      } catch (error) {
        if (latestAutoQueryRef.current !== keyword) return;
        setAutoCompleteKeywords([]);
      } finally {
        if (latestAutoQueryRef.current === keyword) {
          setIsAutoLoading(false);
        }
      }
    }, SEARCH_AUTOCOMPLETE_DEBOUNCE_MS);

    return () => window.clearTimeout(timerId);
  }, [searchQuery, isFocused, isAutoCompleteEnabled]);

  const bizFieldMap = useMemo(
    () =>
      Object.fromEntries(
        bizFieldOptions.map((item) => [item.value, item.label]),
      ),
    [bizFieldOptions],
  );
  const noticeListPath =
    getFullPath(MAIN_MENU_IDS.notice) || '/csc/UI_USR_L_310';
  const faqListPath = getFullPath(MAIN_MENU_IDS.faq) || '/csc/UI_USR_L_320';
  const adminInfoListPath =
    getFullPath(MAIN_MENU_IDS.adminInfo) || '/plcy/icr/UI_USR_L_110';
  const policyNewsListPath =
    getFullPath(MAIN_MENU_IDS.policyNews) || '/plcy/reprt/plcyNews';
  const eventInfoListPath =
    getFullPath(MAIN_MENU_IDS.eventInfo) || '/plcy/reprt/UI_USR_L_190';
  const monthlyNuriListPath =
    getFullPath(MAIN_MENU_IDS.monthlyNuri) || '/plcy/reprt/UI_USR_L_100';
  const pbancItems = mainData.pbancs || EMPTY_LIST;
  const sprtBizItems = mainData.sprtBizs || EMPTY_LIST;
  const certificateItems = mainData.certificates || EMPTY_LIST;
  const financePolicyItems = mainData.financePolicies || EMPTY_LIST;
  const noticeItems = mainData.notices || EMPTY_LIST;
  const faqItems = mainData.faqs || EMPTY_LIST;
  const adminInfoItems = mainData.adminInfos || EMPTY_LIST;
  const todayPbancItems = mainData.todayPbancs || EMPTY_LIST;
  const weeklyPbancGroups = mainData.weeklyPbancGroups || EMPTY_LIST;
  const weeklyPbancWeekGroups = mainData.weeklyPbancWeekGroups || EMPTY_LIST;
  const supportPbancGroups = mainData.supportPbancGroups || EMPTY_SUPPORT_PBANC_GROUPS;
  const cardNewsItem = mainData.cardNews;
  const parsedTodayPbancTotalCount = Number(mainData.todayPbancTotalCount);
  const todayPbancTotalCount =
    mainData.todayPbancTotalCount === null || mainData.todayPbancTotalCount === undefined
      ? todayPbancItems.length
      : Number.isFinite(parsedTodayPbancTotalCount)
        ? parsedTodayPbancTotalCount
        : todayPbancItems.length;
  const cardNewsListPath = appendQueryParam(policyNewsListPath, 'ctgryNo', CARD_NEWS_CATEGORY_NO);
  const cardNewsDetailPath = cardNewsItem?.pstNo
    ? appendQueryParam(`${policyNewsListPath}/${cardNewsItem.pstNo}`, 'ctgryNo', CARD_NEWS_CATEGORY_NO)
    : cardNewsListPath;
  const cardNewsThumbnailUrl = buildBoardThumbnailUrl(
    cardNewsItem?.rprsImgAtchFileId,
    cardNewsItem?.atchFileSn,
  );
  const eventInfoItems = mainData.eventInfos || [];
  const archiveItems = mainData.archiveItems || [];
  const newNewsItems = mainData.newNews || [];
  const toPbancNoticeCard = useCallback((item, options = {}) => {
    const dday = getDdayLabel(item?.bizAplyDdlnYmd);
    const category = bizFieldMap[item?.bizPbancClsfCd] || item?.bizPbancClsfCd || '';
    const detailPathPrefix = options.detailPathPrefix || '/req/pbanc';
    const detailPath = item?.bizPbancNo ? `${detailPathPrefix}/${item.bizPbancNo}` : '#';

    return {
      id: item?.bizPbancNo,
      badge: item?.bizSprvsnInstNm || item?.bizTelgmInstNm || '공고',
      category,
      deadline: isUrgentDday(dday),
      status: getPbancStatusLabel(item),
      title: item?.bizPbancNm || '-',
      date: item?.applyPeriodText || item?.bizAplyPrdCn || '상시',
      dday,
      agency: item?.bizSprvsnInstNm,
      region: item?.bizTelgmInstNm,
      desc: item?.bizPbancOtln || item?.bizPbancOtln,
      target: item?.sprtTrgtCn,
      detailHref: detailPath,
      detailPath,
      liked: Boolean(likedAnnounce[String(item?.bizPbancNo)]),
    };
  }, [bizFieldMap, likedAnnounce]);
  const todayNoticeCards = useMemo(
    () => todayPbancItems.map(toPbancNoticeCard),
    [todayPbancItems, toPbancNoticeCard],
  );
  const weekNoticeGroups = useMemo(
    () => {
      if (weeklyPbancWeekGroups.length > 0) {
        return weeklyPbancWeekGroups.map((week, weekIndex) => ({
          offset: week.offset ?? weekIndex,
          label: week.label || '',
          period: week.period || formatWeekPeriod(week.startYmd, week.endYmd),
          startYmd: week.startYmd,
          endYmd: week.endYmd,
          days: (week.days || []).map((group) => {
            const displayDate = formatWeekItemDate(group.date || group.title);
            return {
              date: displayDate.date || group.title || '-',
              dateKey: group.date || group.title || '',
              day: displayDate.day || '',
              list: (group.items || []).slice(0, 1).map(toPbancNoticeCard),
            };
          }),
        }));
      }

      return [
        {
          offset: 0,
          label: '이번주',
          period: formatWeekPeriod(),
          days: weeklyPbancGroups.map((group) => {
            const displayDate = formatWeekItemDate(group.date || group.title);
            return {
              date: displayDate.date || group.title || '-',
              dateKey: group.date || group.title || '',
              day: displayDate.day || '',
              list: (group.items || []).slice(0, 1).map(toPbancNoticeCard),
            };
          }),
        },
      ];
    },
    [weeklyPbancWeekGroups, weeklyPbancGroups, toPbancNoticeCard],
  );
  const activeWeekGroup = weekNoticeGroups[activeWeekIndex] || weekNoticeGroups[0] || null;
  const defaultWeekIndex = Math.max(
    weekNoticeGroups.findIndex((week) => Number(week.offset) === 0),
    0,
  );
  const weekNoticeCards = activeWeekGroup?.days || [];
  const activeWeekItemIndex = useMemo(() => {
    if (weekNoticeCards.length === 0) return -1;

    const today = new Date();
    const activeDate = new Date(today);
    const dayOfWeek = today.getDay();

    if (dayOfWeek === 0) activeDate.setDate(today.getDate() + 1);
    if (dayOfWeek === 6) activeDate.setDate(today.getDate() - 1);

    const activeDateKey = getLocalYmd(activeDate);
    const matchedIndex = weekNoticeCards.findIndex((day) => day.dateKey === activeDateKey);
    if (matchedIndex >= 0) return matchedIndex;

    const businessDayIndex = dayOfWeek === 0 ? 0 : dayOfWeek === 6 ? 4 : dayOfWeek - 1;
    return Math.min(businessDayIndex, weekNoticeCards.length - 1);
  }, [weekNoticeCards]);
  const activeWeekPeriod = activeWeekGroup?.period || formatWeekPeriod();
  const isPrevWeekDisabled = activeWeekIndex <= 0;
  const isNextWeekDisabled = activeWeekIndex >= Math.max(weekNoticeGroups.length - 1, 0);
  useEffect(() => {
    const maxIndex = Math.max(weekNoticeGroups.length - 1, 0);
    if (weeklyPbancWeekGroups.length > 0) {
      if (!weekGroupInitializedRef.current) {
        weekGroupInitializedRef.current = true;
        setActiveWeekIndex(Math.min(defaultWeekIndex, maxIndex));
        return;
      }

      setActiveWeekIndex((prev) => Math.min(prev, maxIndex));
      return;
    }

    weekGroupInitializedRef.current = false;
    setActiveWeekIndex((prev) => {
      return Math.min(prev, maxIndex);
    });
  }, [defaultWeekIndex, weekNoticeGroups.length, weeklyPbancWeekGroups.length]);
  const centralSupportGroups = useMemo(
    () =>
      (supportPbancGroups.central || []).map((group) => ({
        title: group.title,
        cards: (group.items || []).map((item) =>
          toPbancNoticeCard(item, { detailPathPrefix: '/req/pbanc' }),
        ),
      })),
    [supportPbancGroups, toPbancNoticeCard],
  );
  const localSupportGroups = useMemo(
    () =>
      (supportPbancGroups.local || []).map((group) => ({
        title: group.title,
        cards: (group.items || []).map((item) =>
          toPbancNoticeCard(item, { detailPathPrefix: '/req/pbancProvincial' }),
        ),
      })),
    [supportPbancGroups, toPbancNoticeCard],
  );
  const supportPbancItems = useMemo(
    () =>
      [
        ...(supportPbancGroups.central || []),
        ...(supportPbancGroups.local || []),
      ].flatMap((group) => group.items || []),
    [supportPbancGroups],
  );
  const calendarPbancItems = useMemo(
    () => {
      const weeklyItems = weeklyPbancWeekGroups.length > 0
        ? weeklyPbancWeekGroups.flatMap((week) =>
          (week.days || []).flatMap((group) => group.items || []),
        )
        : weeklyPbancGroups.flatMap((group) => group.items || []);
      return [...todayPbancItems, ...weeklyItems];
    },
    [todayPbancItems, weeklyPbancWeekGroups, weeklyPbancGroups],
  );
  const bannerItems =
    (mainData.banners || []).length > 0
      ? mainData.banners
      : [
        {
          bnrId: 'fallback-1',
          bnrTtl: '메인 배너',
          imgLnkgUrlAddr: '#',
          imgLnkgNpagYn: 'N',
          fallbackImageSrc: mainBanner01,
          fallbackAlt: '2026년 중소벤처기업부 지원사업안내',
        },
        {
          bnrId: 'fallback-2',
          bnrTtl: '메인 배너',
          imgLnkgUrlAddr: '#',
          imgLnkgNpagYn: 'N',
          fallbackImageSrc: mainBanner02,
          fallbackAlt: '중동전쟁관련 수출 현지진출 기업 애로 긴급 접수',
        },
      ];
  const visiblePopups = (mainData.popups || []).filter(
    (popup) =>
      !hiddenPopupIds.includes(String(popup.popupId))
      && !closedPopupIds.includes(String(popup.popupId)),
  );
  const mobilePopup = isMobilePopupViewport ? visiblePopups[0] : null;
  const mobilePopupImageSrc = mobilePopup
    ? buildMainImageUrl('popups', mobilePopup.imgAtchFileId, mobilePopup.imgAtchFileSn)
    : '';
  const mobilePopupHref = mobilePopup?.imgLnkgUrlAddr || '';
  const mobilePopupExternal = mobilePopup ? isNewWindow(mobilePopup.imgLnkgNpagYn) : false;
  const mobilePopupBodyText = [
    mobilePopup?.popupCn,
    mobilePopup?.popupDtlCn,
    mobilePopup?.popupExplnCn,
    mobilePopup?.popupCntnCn,
  ].find((value) => String(value || '').trim());

  useEffect(() => {
    setIsMobilePopupExpanded(false);
  }, [mobilePopup?.popupId]);
  const pbancScrapTargetIds = useMemo(
    () =>
      [...pbancItems, ...calendarPbancItems, ...supportPbancItems]
        .map((item) => Number(item.bizPbancNo))
        .filter((value, index, array) => Number.isFinite(value) && value > 0 && array.indexOf(value) === index),
    [pbancItems, calendarPbancItems, supportPbancItems],
  );
  const policyScrapTargetIds = useMemo(
    () =>
      financePolicyItems
        .map((item) => Number(item.plcyFnncGdsSn))
        .filter((value) => Number.isFinite(value) && value > 0),
    [financePolicyItems],
  );

  useEffect(() => {
    if (!isLoggedIn) {
      setLikedAnnounce({});
      setLikedPolicy({});
      return;
    }

    if (pbancScrapTargetIds.length === 0 && policyScrapTargetIds.length === 0) {
      setLikedAnnounce({});
      setLikedPolicy({});
      return;
    }

    let isMounted = true;

    const loadScrapStatuses = async () => {
      try {
        const response = await apiClient.post('/api/v1/scraps/status/batch', {
          pbancIds: pbancScrapTargetIds,
          policyFinanceIds: policyScrapTargetIds,
        });
        if (!isMounted) return;

        const payload = normalizeResponse(response);
        const pbancStatusMap = Object.fromEntries(
          (payload.pbanc || []).map((id) => [String(id), true]),
        );
        const policyStatusMap = Object.fromEntries(
          (payload.policyFinance || []).map((id) => [String(id), true]),
        );

        setLikedAnnounce(pbancStatusMap);
        setLikedPolicy(policyStatusMap);
      } catch (error) {
        if (!isMounted) return;
        setLikedAnnounce({});
        setLikedPolicy({});
      }
    };

    loadScrapStatuses();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, pbancScrapTargetIds, policyScrapTargetIds]);

  useEffect(() => {
    let isMounted = true;

    const syncOnepassModalState = async () => {
      if (!isLogin) {
        window.sessionStorage.removeItem(ONEPASS_CONVERSION_MODAL_DISMISSED_KEY);
        setIsOnepassModalOpen(false);
        setHasCi(null);
        return;
      }

      if (intgMbrSwtcYn !== 'N') {
        setIsOnepassModalOpen(false);
        return;
      }

      const isDismissed =
      window.sessionStorage.getItem(ONEPASS_CONVERSION_MODAL_DISMISSED_KEY) ===
      '1';

      if (isDismissed) {
        setIsOnepassModalOpen(false);
        return;
      }

      // CI 조회 이전에는 모달을 열지 않는다. (기본 true 분기 노출 방지)
      setIsOnepassModalOpen(false);

      try {
        const data = await apiClient.get('/api/v1/account/me/ci-status');
        if (!isMounted) return;
        const payload = normalizeResponse(data);
        const hasCiRaw = payload?.hasCi;

        // hasCi는 boolean/string("true"/"false")/Y/N 형식이 섞여 들어올 수 있어 명시적으로 정규화한다.
        const normalizedHasCi =
          typeof hasCiRaw === 'boolean'
            ? hasCiRaw
            : typeof hasCiRaw === 'string'
              ? ['true', 'y', 'yes', '1'].includes(hasCiRaw.trim().toLowerCase())
              : Boolean(hasCiRaw);

        setHasCi(normalizedHasCi);
      } catch {
        if (!isMounted) return;
        // 오류 시 기본 전환 팝업 표시 (CI 있는 것으로 간주)
        setHasCi(true);
      }

      if (!isMounted) return;
      setIsOnepassModalOpen(true);
    };

    void syncOnepassModalState();

    return () => { isMounted = false; };
  }, [isLogin, intgMbrSwtcYn]);

  // 키보드가 처음 열릴 때 lazy 컴포넌트를 마운트 (이후 isOpen prop으로 제어)
  useEffect(() => {
    if (isKeyboardOpen) setHasOpenedKeyboard(true);
  }, [isKeyboardOpen]);

  const handleSearch = () => {
    const keyword = searchQuery.trim();

    if (!keyword) {
      window.alert('검색어를 입력해주세요.');
      return;
    }

    setIsKeyboardOpen(false);
    navigate('/totalSearch', {
      state: { q: keyword },
    });
  };
  const handleKeyDown = (e) => e.key === 'Enter' && handleSearch();
  const handleClear = () => {
    setSearchQuery('');
    setAutoCompleteKeywords([]);
    setIsAutoLoading(false);
    searchInputRef.current?.focus();
  };
  const handleKeywordSelect = (keyword) => {
    const nextKeyword = String(keyword || '').trim();
    if (!nextKeyword) return;
    setSearchQuery(nextKeyword);
    setIsFocused(false);
    setIsKeyboardOpen(false);
    navigate('/totalSearch', {
      state: { q: nextKeyword },
    });
  };
  const handleCertificateKeywordSelect = (keyword) => {
    const nextKeyword = String(keyword || '').trim();
    if (!nextKeyword) return;

    setSearchQuery(nextKeyword);
    setIsFocused(false);
    setIsKeyboardOpen(false);

    const params = new URLSearchParams({
      q: nextKeyword,
      collection: 'smep_cert',
    });

    navigate(`/totalSearch?${params.toString()}`, {
      state: { q: nextKeyword, collectionKey: 'smep_cert' },
    });
  };
  const handleAutoCompleteToggle = (e) => {
    const enabled = e.target.checked;
    setIsAutoCompleteEnabled(enabled);
    if (!enabled) {
      latestAutoQueryRef.current = '';
      setAutoCompleteKeywords([]);
      setIsAutoLoading(false);
    }
  };
  const handleOnepassModalDismiss = () => {
    window.sessionStorage.setItem(ONEPASS_CONVERSION_MODAL_DISMISSED_KEY, '1');
    setIsOnepassModalOpen(false);
  };
  const handleOnepassModalConvert = () => {
    handleOnepassModalDismiss();
  };
  const handleOnepassJoinClick = () => {
    if (!isLoggedIn) {
      const onePassJoinUrl = buildOnePassRegisterUrl('member');
      window.location.href = onePassJoinUrl;
    } else {
      const onePassJoinUrl = buildOnePassConversionUrl();
      window.location.href = onePassJoinUrl;
    }
  };
  const requestLoginForScrap = () => {
    const moveToLogin = window.confirm('로그인 후 스크랩 가능합니다. 로그인 하시겠습니까?');
    if (moveToLogin) {
      navigate('/service/login');
    }
  };
  const handleToggleLike1 = async (targetId) => {
    const numericTargetId = Number(targetId);
    if (!Number.isFinite(numericTargetId) || numericTargetId < 1) return;

    if (!isLoggedIn) {
      requestLoginForScrap();
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/scraps/toggle', {
        scrapTypeCd: 'BIZP',
        targetId: numericTargetId,
      });
      const payload = normalizeResponse(response);
      setLikedAnnounce((prev) => ({
        ...prev,
        [String(numericTargetId)]: Boolean(payload.scrapped),
      }));
    } catch (error) {
      window.alert(
        resolveApiErrorMessage(error, '사업공고 스크랩 처리 중 오류가 발생했습니다.'),
      );
    }
  };
  const handleToggleLike3 = async (targetId) => {
    const numericTargetId = Number(targetId);
    if (!Number.isFinite(numericTargetId) || numericTargetId < 1) return;

    if (!isLoggedIn) {
      requestLoginForScrap();
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/scraps/toggle', {
        scrapTypeCd: 'PLCF',
        targetId: numericTargetId,
      });
      const payload = normalizeResponse(response);
      setLikedPolicy((prev) => ({
        ...prev,
        [String(numericTargetId)]: Boolean(payload.scrapped),
      }));
    } catch (error) {
      window.alert(
        resolveApiErrorMessage(error, '정책금융 스크랩 처리 중 오류가 발생했습니다.'),
      );
    }
  };
  const toggleAutoplay = () => {
    if (!swiperRef.current) return;
    if (isPlaying) swiperRef.current.autoplay.stop();
    else swiperRef.current.autoplay.start();
    setIsPlaying(!isPlaying);
  };
  const handleWeekMove = (direction) => {
    setActiveWeekIndex((prev) => {
      const maxIndex = Math.max(weekNoticeGroups.length - 1, 0);
      if (maxIndex === 0) return 0;
      return Math.min(Math.max(prev + direction, 0), maxIndex);
    });
  };
  const handleMobilePopupTouchStart = (event) => {
    mobilePopupTouchStartYRef.current = event.touches?.[0]?.clientY ?? null;
  };
  const handleMobilePopupTouchEnd = (event) => {
    const startY = mobilePopupTouchStartYRef.current;
    const endY = event.changedTouches?.[0]?.clientY ?? null;
    mobilePopupTouchStartYRef.current = null;
    if (startY == null || endY == null) return;

    const deltaY = endY - startY;
    if (deltaY <= -40) {
      setIsMobilePopupExpanded(true);
      return;
    }
    if (deltaY >= 40) {
      setIsMobilePopupExpanded(false);
    }
  };
  const handlePopupClose = (popupId) =>
    setClosedPopupIds((prev) => [...new Set([...prev, String(popupId)])]);
  const handlePopupHideToday = (popupId) => {
    window.localStorage.setItem(
      `main-popup-hide-${popupId}`,
      formatLocalDateKey(),
    );
    setHiddenPopupIds((prev) => [...new Set([...prev, String(popupId)])]);
  };
  const openNoticeLayer = (card) => {
    setSelectedNotice(card);
  };
  const closeNoticeLayer = () => {
    setSelectedNotice(null);
  };
  const handleNoticeDetailClick = (event) => {
    if (!selectedNotice?.detailPath || selectedNotice.detailPath === '#') return;
    event.preventDefault();
    closeNoticeLayer();
    navigate(selectedNotice.detailPath);
  };

  const noticeMoreTargets = [
    { label: '자주찾는 질문', path: faqListPath },
    { label: '행사정보', path: eventInfoListPath },
    { label: '공지사항', path: noticeListPath },
    { label: '새로운 뉴스', path: policyNewsListPath },
  ];
  const activeNoticeMore = noticeMoreTargets[noticeActiveIndex] || noticeMoreTargets[0];
  const renderBoardLink = (target, children) =>
    target.kind === 'external' ? (
      <a
        href={target.href}
        className="board-list-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ) : (
      <Link to={target.to} className="board-list-link">
        {children}
      </Link>
    );

  return (
    <div id="wrap">
      <Header />{ /* 임시 해더 */}
      <div id="container" className="main-container">
        { /*컨텐츠 영역 */}

        {/* S - main-totallayout */}
        <div className="main-toplayout">
          <div className="main-top-inner">
            <div
              className={`main-top-srch ${isSearchFixed ? 'is-fixed' : ''}`}
              ref={searchBarRef}
            >
              <div
                ref={srchInputRef}
                className={`top-srch sch-input ${isFocused ? 'is-focused' : ''}`}
              >
                <div className="sch-input-box">
                  <input
                    ref={searchInputRef}
                    type="text"
                    title="통합검색"
                    placeholder='지원사업 공고, 정책자금, 확인서 등을 검색해 보세요'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    className="krds-input medium"
                  />
                  {isFocused && (
                    <button
                      type="button"
                      className="krds-btn icon ico-keyboard"
                      ref={keyboardButtonRef}
                      onClick={() => setIsKeyboardOpen((prev) => !prev)}
                    >
                      <span className="sr-only">키보드 입력</span>
                      <i className="svg-icon ico-key"></i>
                    </button>
                  )}
                  {isFocused && (
                    <button
                      type="button"
                      className="krds-btn icon ico-clear"
                      onClick={handleClear}
                    >
                      <span className="sr-only">검색어 삭제</span>
                      <i className="svg-icon ico-del"></i>
                    </button>
                  )}
                  <button
                    type="button"
                    className="krds-btn large icon ico-search"
                    onClick={handleSearch}
                  >
                    <span className="sr-only">통합검색</span>
                    <i className="svg-icon ico-sch-bold"></i>
                  </button>
                </div>
                {isFocused && (
                  <div className="sch-layer">

                    {showPopular && (
                      <div className="sch-layer-popular">
                        <div className="sch-layer-inner">
                          <strong className="sch-layer-title">인기검색어</strong>
                          <ul className="sch-layer-popular-list">
                            <li
                              className="sch-popular-item"
                              key={'popular-1'}
                            >
                              <button
                                type="button"
                                className="item-link"
                                onClick={() => handleKeywordSelect('지원사업')}
                              >
                                <em className="rank">
                                  <span className="sr-only">인기검색어</span>
                                  1
                                </em>
                                지원사업
                              </button>
                            </li>
                            <li
                              className="sch-popular-item"
                              key={'popular-2'}
                            >
                              <button
                                type="button"
                                className="item-link"
                                onClick={() => handleKeywordSelect('정책자금')}
                              >
                                <em className="rank">
                                  <span className="sr-only">인기검색어</span>
                                  2
                                </em>
                                정책자금
                              </button>
                            </li>
                            <li
                              className="sch-popular-item"
                              key={'popular-3'}
                            >
                              <button
                                type="button"
                                className="item-link"
                                onClick={() => handleKeywordSelect('증명서')}
                              >
                                <em className="rank">
                                  <span className="sr-only">인기검색어</span>
                                  3
                                </em>
                                증명서
                              </button>
                            </li>
                            <li
                              className="sch-popular-item"
                              key={'popular-4'}
                            >
                              <button
                                type="button"
                                className="item-link"
                                onClick={() => handleKeywordSelect('사업공고')}
                              >
                                <em className="rank">
                                  <span className="sr-only">인기검색어</span>
                                  4
                                </em>
                                사업공고
                              </button>
                            </li>
                            {/*{isPopularLoading && (*/}
                            {/*  <li className="sch-popular-item">*/}
                            {/*    <span className="item-link">Loading...</span>*/}
                            {/*  </li>*/}
                            {/*)}*/}
                            {/*{!isPopularLoading &&*/}
                            {/*  popularKeywords.map((keyword, index) => (*/}
                            {/*    <li*/}
                            {/*      className="sch-popular-item"*/}
                            {/*      key={`popular-${keyword}-${index}`}*/}
                            {/*    >*/}
                            {/*      <button*/}
                            {/*        type="button"*/}
                            {/*        className="item-link"*/}
                            {/*        onClick={() => handleKeywordSelect(keyword)}*/}
                            {/*      >*/}
                            {/*        <em className="rank">*/}
                            {/*          <span className="sr-only">인기검색어</span>*/}
                            {/*          {index + 1}*/}
                            {/*        </em>*/}
                            {/*        {keyword}*/}
                            {/*      </button>*/}
                            {/*    </li>*/}
                            {/*  ))}*/}
                            {/*{!isPopularLoading && popularKeywords.length === 0 && (*/}
                            {/*  <li className="sch-popular-item">*/}
                            {/*    <span className="item-link">No popular keywords.</span>*/}
                            {/*  </li>*/}
                            {/*)}*/}
                          </ul>
                        </div>
                      </div>
                    )}

                    {showAutoComplete && (
                      <div className="sch-layer-inner">
                        <ul className="sch-layer-auto-list">
                          {isAutoLoading && (
                            <li>
                              <span className="item-link">Loading...</span>
                            </li>
                          )}
                          {!isAutoLoading &&
                            autoCompleteKeywords.map((keyword, index) => (
                              <li key={`auto-${keyword}-${index}`}>
                                <button
                                  type="button"
                                  onClick={() => handleKeywordSelect(keyword)}
                                >
                                  <i className="ico-keyword"></i>
                                  <em className="keyword">{keyword}</em>
                                </button>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    <div className="sch-layer-footer">
                      <div className="krds-form-toggle-switch">
                        <input
                          type="checkbox"
                          id="main-search-autocomplete-switch"
                          checked={isAutoCompleteEnabled}
                          onChange={handleAutoCompleteToggle}
                        />
                        <label htmlFor="main-search-autocomplete-switch"><span className="switch-toggle"><i></i></span>자동완성기능</label>
                      </div>
                    </div>

                  </div>
                )}
              </div>
              {hasOpenedKeyboard && (
                <Suspense fallback={null}>
                  <Work24VirtualKeyboard
                    isOpen={isKeyboardOpen}
                    sizeOption="SMALL"
                    triggerRef={keyboardButtonRef}
                    inputRef={searchInputRef}
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    onEnter={handleSearch}
                    onClose={() => setIsKeyboardOpen(false)}
                  />
                </Suspense>
              )}

              {/* 인기 검색어 */}
            </div>
            <div className="main-top-keyword">
              <h3>인기 검색어</h3>
              <ul className="keyword-list">
                <li key={'top-popular-1'}>
                  <button
                    type="button"
                    className="word"
                    onClick={() => handleKeywordSelect('지원사업')}
                  >
                    지원사업
                  </button>
                </li>
                <li key={'top-popular-2'}>
                  <button
                    type="button"
                    className="word"
                    onClick={() => handleKeywordSelect('정책자금')}
                  >
                    정책자금
                  </button>
                </li>
                <li key={'top-popular-3'}>
                  <button
                    type="button"
                    className="word"
                    onClick={() => handleKeywordSelect('증명서')}
                  >
                    증명서
                  </button>
                </li>
                <li key={'top-popular-4'}>
                  <button
                    type="button"
                    className="word"
                    onClick={() => handleKeywordSelect('사업공고')}
                  >
                    사업공고
                  </button>
                </li>
                {/*{isPopularLoading && (*/}
                {/*  <li>*/}
                {/*    <button type="button" className="word" disabled>*/}
                {/*      Loading...*/}
                {/*    </button>*/}
                {/*  </li>*/}
                {/*)}*/}
                {/*{!isPopularLoading &&*/}
                {/*  popularKeywords.map((keyword, index) => (*/}
                {/*    <li key={`top-popular-${keyword}-${index}`}>*/}
                {/*      <button*/}
                {/*        type="button"*/}
                {/*        className="word"*/}
                {/*        onClick={() => handleKeywordSelect(keyword)}*/}
                {/*      >*/}
                {/*        {keyword}*/}
                {/*      </button>*/}
                {/*    </li>*/}
                {/*  ))}*/}
                {/*{!isPopularLoading && popularKeywords.length === 0 && (*/}
                {/*  <li>*/}
                {/*    <button type="button" className="word" disabled>*/}
                {/*      No popular keywords.*/}
                {/*    </button>*/}
                {/*  </li>*/}
                {/*)}*/}
              </ul>
            </div>
            <div className="main-top-keyword fav">
              <h3>자주 찾는 증명서</h3>
              <ul className="keyword-list">
                {isTop5Loading && (
                  <li>
                    <button type="button" className="word" disabled>
                        로딩 중...
                    </button>
                  </li>
                )}

                {!isTop5Loading && (!top5Certificates || top5Certificates.length === 0) && (
                  <li>
                    <button type="button" className="word" disabled>
                        추천 증명서가 없습니다.
                    </button>
                  </li>
                )}

                {!isTop5Loading &&
                    Array.isArray(top5Certificates) && top5Certificates.map((cert, index) => {
                  const certTitle = cert.prdocTtl || '증명서';

                  return (
                    <li key={`top-cert-${cert.prdocCd || index}`}>
                      <button
                        type="button"
                        className="word"
                        onClick={() => handleCertificateClick(cert.prdocCd)}
                      >
                        {certTitle}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="container responsive-section">
          <section className="main-section main-calendar">
            <div className="calendar-layout">
              <article className="calendar-box today-box">
                <div className="calendar-title-wrap">
                  <h2 className="calendar-title">사업캘린더</h2>
                </div>
                <div className="calendar-card">
                  <div className="calendar-card-head">
                    <h3>오늘의 공고</h3>
                    <span className="count">총 <strong>{todayPbancTotalCount}</strong>건</span>
                    <strong className="date">{formatCalendarDate(getLocalYmd())}</strong>
                  </div>
                  {todayNoticeCards.map((card, index) => (
                    <button
                      type="button"
                      className="today-item"
                      key={card.id || index}
                      onClick={() => openNoticeLayer(card)}
                    >
                      <div className="item-top">
                        <span className="krds-badge">{card.badge}</span>
                        <span className="category">{card.category}</span>
                        <strong className={`krds-label state ${isUrgentDday(card.dday) ? 'danger' : ''}`}>
                          {card.dday}
                        </strong>
                      </div>
                      <span className="item-title onellipsis-2">
                        {card.title}
                      </span>
                    </button>
                  ))}
                  <div className="calendar-more">
                    <button type="button" className="krds-btn small" onClick={() => navigate('/req/pbanc')}>
                          + 더보기
                    </button>
                  </div>
                </div>
              </article>

              <article className="calendar-box week-box">
                <div className="calendar-title-wrap">
                  <h2 className="calendar-title">사업캘린더</h2>
                </div>
                <div className="calendar-card">
                  <div className="calendar-card-head">
                    <h3>이번 주 공고</h3>
                    <div className="week-controls">
                      <button
                        type="button"
                        className="krds-btn week-move-btn prev"
                        aria-label="이전주 보기"
                        onClick={() => handleWeekMove(-1)}
                        disabled={isPrevWeekDisabled}
                      >
                        <i className="svg-icon ico-angle left"></i>
                      </button>
                      <button
                        type="button"
                        className="krds-btn week-move-btn next"
                        aria-label="다음주 보기"
                        onClick={() => handleWeekMove(1)}
                        disabled={isNextWeekDisabled}
                      >
                        <i className="svg-icon ico-angle right"></i>
                      </button>
                    </div>
                    <span className="period">{activeWeekPeriod}</span>
                  </div>
                  <div className="week-notice-list">
                    {weekNoticeCards.map((day, dayIndex) => {
                      const isActive = dayIndex === activeWeekItemIndex;
                      const visibleList = day.list.slice(0, 1);

                      return (
                        <div className={`week-item ${isActive ? 'is-active' : ''}`} key={day.date || dayIndex}>
                          <div className="week-date">
                            <strong>{day.date}</strong>
                            <span>{day.day}</span>
                          </div>
                          <ul className="week-list">
                            {visibleList.map((card, index) => (
                              <li key={card.id || index}>
                                <span className={`krds-label state ${isUrgentDday(card.dday) ? 'danger' : ''}`}>
                                  {card.dday}
                                </span>
                                <span className="krds-badge">{formatWeekPbancAgencyBadge(card.badge)}</span>
                                <button
                                  type="button"
                                  className="week-notice-link onellipsis-1"
                                  onClick={() => openNoticeLayer(card)}
                                >
                                  {card.title}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>

              <article className="calendar-box card-news-box">
                <div className="card-news-head">
                  <h3>카드뉴스</h3>
                  <button type="button" className="krds-btn small text" onClick={() => navigate(cardNewsListPath)}>
                        더보기 <i className="svg-icon ico-plus"></i>
                  </button>
                </div>
                <a
                  href={cardNewsDetailPath}
                  className={`card-news-thumb${mainLoading && !cardNewsThumbnailUrl ? ' card-news-thumb--skeleton' : ''}`}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(cardNewsDetailPath);
                  }}
                >
                  {cardNewsThumbnailUrl ? (
                    <img
                      src={cardNewsThumbnailUrl}
                      onError={(event) => {
                        event.currentTarget.src = NO_IMAGE_SVG;
                        event.currentTarget.classList.add('card-news-img--noimg');
                      }}
                      alt={cardNewsItem?.pstTtl || '카드뉴스'}
                      loading="eager"
                      fetchpriority="high"
                      className="card-news-img"
                    />
                  ) : !mainLoading ? (
                    // 로딩 완료 후 데이터/이미지 없음 → 정적 placeholder
                    <img
                      src={NO_IMAGE_SVG}
                      alt="카드뉴스 이미지 없음"
                      className="card-news-img card-news-img--noimg"
                    />
                  ) : null}
                </a>
              </article>
            </div>
          </section>

          {/* S - 자주 찾는 서비스  */}
          <section className="main-quick-menu">
            <div className="flex-box">
              <h2 className="section-tit white sr-only">자주 찾는 <br />서비스 </h2>
              <div className="quick-menu-swiper">
                <Swiper
                  breakpoints={{
                    320: {
                      enabled: true,
                      slidesPerView: 2,
                      spaceBetween: 8,
                    },
                    546: {
                      enabled: true,
                      slidesPerView: 3,
                      spaceBetween: 10,
                    },
                    768: {
                      enabled: true,
                      slidesPerView: 4,
                      spaceBetween: 10,
                    },
                    1200: {
                      enabled: true,
                      slidesPerView: 6,
                      spaceBetween: 5,
                    },
                  }}
                  modules={[Navigation]}
                  navigation={{
                    prevEl: '.quick-menu-swiper .swiper-button-prev',
                    nextEl: '.quick-menu-swiper .swiper-button-next',
                  }}
                  onSwiper={(swiper) => {
                    setIsBeginning(swiper.isBeginning);
                    setIsEnd(swiper.isEnd);
                  }}
                  onSlideChange={(swiper) => {
                    setIsBeginning(swiper.isBeginning);
                    setIsEnd(swiper.isEnd);
                  }}
                >
                  {platformMenus.map((item, index) => (
                    <SwiperSlide key={index}>
                      <div className="quick-menu-item">
                        <button
                          type="button"
                          onClick={() => navigate(item.path)}
                        >
                          <span className="quick-menu-img">
                            <img src={item.img} alt="" loading="lazy" />
                          </span>
                          <span className="quick-menu-tit">{item.title}</span>
                        </button>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                {/* navigation */}
                <div className="swiper-nav-wrap">
                  <button
                    type="button"
                    className={`swiper-button-prev ${isBeginning && 'hide'}`}
                  >
                    <span className="sr-only">이전</span>
                  </button>
                  <button
                    type="button"
                    className={`swiper-button-next ${isEnd && 'hide'}`}
                  >
                    <span className="sr-only">다음</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
          {/*  E - 자주 찾는 서비스 */}
        </div>

        {/* S - 주요 지원 사업 공고 */}
        <section className="main-section main-support">
          <div className="container">
            <h2 className="section-tit">주요 지원 사업 공고</h2>
          </div>
          <div className="support-board support-board-all">
            <section className="support-gov-section support-gov-central">
              <div className="container">
                <h3 className="support-gov-title">중앙정부</h3>
                <div className="support-content">
                  <div className="support-group-scroll">
                    {centralSupportGroups.map((group, groupIndex) => (
                      <section
                        className="support-group"
                        key={`central-${group.title}`}
                      >
                        <h4 className="support-group-title">{group.title}</h4>

                        <div className="support-group-cards">
                          {group.cards.map((card, cardIndex) => {
                            const keyIndex = groupIndex * 10 + cardIndex;

                            return (
                              <article className="support-card" key={`${group.title}-${cardIndex}`}>
                                <div className="card-top">
                                  <span className="krds-badge bg-primary">{card.badge}</span>
                                  <span className="category">{card.category}</span>

                                  {card.deadline && (
                                    <span className="krds-badge text danger">마감임박</span>
                                  )}

                                  <button
                                    type="button"
                                    className={`svg-icon heart like-btn on-bgcolorgray ${
                                      likedAnnounce[String(card.id)] || card.liked ? 'is-on' : ''
                                    }`}
                                    aria-label={`${card.title} 찜하기`}
                                    onClick={() => handleToggleLike1(card.id || keyIndex)}
                                  >
                                  </button>
                                </div>

                                <a
                                  href={card.detailHref || '#'}
                                  className="card-title onellipsis-2"
                                  onClick={(event) => {
                                    if (!card.detailPath || card.detailPath === '#') return;
                                    event.preventDefault();
                                    navigate(card.detailPath);
                                  }}
                                >
                                  {card.title}
                                </a>

                                <div className="card-info-new">
                                  <span>
                                    <i className="svg-icon ico-calendar"></i>
                                    {card.date}
                                  </span>
                                  <strong className={`dday ${isUrgentDday(card.dday) ? 'danger' : ''}`}>
                                    {card.dday}
                                  </strong>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>

                <div className="more-btn support-more">
                  <button
                    type="button"
                    className="krds-btn text medium"
                    onClick={() => navigate('/req/pbanc')}
                  >
                    사업공고 더보기
                    <i className="svg-icon ico-angle right"></i>
                  </button>
                </div>
              </div>
            </section>
            <section className="support-gov-section support-gov-local">
              <div className="container">
                <h3 className="support-gov-title">지방정부</h3>
                <div className="support-group-scroll">
                  {localSupportGroups.map((group, groupIndex) => (
                    <section className="support-group" key={`local-${group.title}`}>
                      <h4 className="support-group-title">{group.title}</h4>

                      <div className="support-group-cards">
                        {group.cards.map((card, cardIndex) => {
                          const keyIndex = 100 + groupIndex * 10 + cardIndex;

                          return (
                            <article className="support-card" key={`${group.title}-${cardIndex}`}>
                              <div className="card-top">
                                <span className="krds-badge bg-primary">{card.badge}</span>
                                <span className="category">{card.category}</span>

                                {card.deadline && (
                                  <span className="krds-badge text danger">마감임박</span>
                                )}

                                <button
                                  type="button"
                                  className={`svg-icon heart like-btn on-bgcolorgray ${
                                    likedAnnounce[String(card.id)] || card.liked ? 'is-on' : ''
                                  }`}
                                  aria-label={`${card.title} 찜하기`}
                                  onClick={() => handleToggleLike1(card.id || keyIndex)}
                                >
                                </button>
                              </div>

                              <a
                                href={card.detailHref || '#'}
                                className="card-title onellipsis-2"
                                onClick={(event) => {
                                  if (!card.detailPath || card.detailPath === '#') return;
                                  event.preventDefault();
                                  navigate(card.detailPath);
                                }}
                              >
                                {card.title}
                              </a>

                              <div className="card-info-new">
                                <span>
                                  <i className="svg-icon ico-calendar"></i>
                                  {card.date}
                                </span>
                                <strong className={`dday ${isUrgentDday(card.dday) ? 'danger' : ''}`}>
                                  {card.dday}
                                </strong>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>

                <div className="more-btn support-more">
                  <button
                    type="button"
                    className="krds-btn text medium"
                    onClick={() => navigate('/req/pbancProvincial')}
                  >
                    사업공고 더보기
                    <i className="svg-icon ico-angle right"></i>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </section>
        {/* E - 주요 지원 사업 공고 */}
        <section className="main-section">
          <div className="container">
            <a
              href="/plcy/reprt/sprt"
              onClick={(event) => {
                event.preventDefault();
                navigate('/plcy/reprt/sprt');
              }}
            >
              <img
                src={bannerLine}
                className="pc-only"
                alt="2026년 중소벤처기업부 지원사업안내"
                loading="lazy"
              />
              <img
                src={bannerLineM}
                className="mobile-only"
                alt="2026년 중소벤처기업부 지원사업안내"
                loading="lazy"
              />
            </a>
          </div>
        </section>

        {/* S - 주요 소식 및 안내*/}
        <section className="main-section section-notice">
          <div className="container">
            <h2 className="section-tit">주요 소식 및 안내</h2>
            <div className="notice-wrap">
              <div className="notice-left main-notice">
                <div className="notice-tab">
                  <div className="notice-tab-top">
                    <ul className="tablist notice-tablist">
                      {noticeTabMenu.map((menu, index) => (
                        <li
                          key={index}
                          className={`round-tab-menu ${noticeActiveIndex === index ? 'is-active' : ''}`}
                        >
                          <button
                            type="button"
                            className="krds-btn medium text"
                            onClick={() => setNoticeActiveIndex(index)}
                          >
                            {menu}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="krds-btn medium text more"
                      aria-label={activeNoticeMore.label}
                      onClick={() => navigate(activeNoticeMore.path)}
                    >
                      더보기<i className="svg-icon ico-plus"></i>
                    </button>
                  </div>
                  <div className="notice-tab-conts">
                    {noticeActiveIndex === 0 && (
                      <div className="notice-tab-cont">
                        <ul className="board-list faq">
                          {faqItems.map((item) => {
                            const target = resolveBoardTarget(faqListPath, item, false);
                            const faqTitle = stripHtmlTags(item.pstTtl) || '-';
                            return (
                              <li className="board-list-item" key={String(item.pstNo)}>
                                {renderBoardLink(
                                  target,
                                  <>
                                    {item.ctgryNm && (
                                      <span className="krds-badge bg-light-primary">
                                        {item.ctgryNm}
                                      </span>
                                    )}
                                    <span className="board-list-title onellipsis-1">
                                      {faqTitle}
                                    </span>
                                  </>,
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {noticeActiveIndex === 1 && (
                      <div className="notice-tab-cont">
                        <ul className="board-list">
                          {eventInfoItems.map((item) => (
                            <li
                              className="board-list-item"
                              key={String(item.evntInfoId)}
                            >
                              <Link
                                to={`${eventInfoListPath}/${item.evntInfoId}`}
                                className="board-list-link"
                              >
                                {item.evntInfoRgnNm && (
                                  <span className="krds-badge bg-light-primary">
                                    {item.evntInfoRgnNm}
                                  </span>
                                )}
                                <span className="board-list-title onellipsis-1">
                                  {item.evntInfoTtlNm || '-'}
                                </span>
                                <span className="board-list-date">
                                  {formatMainEventPeriod(item.evntPrdCn || item.rcptPrdCn) || formatDate(item.regDt)}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {noticeActiveIndex === 2 && (
                      <div className="notice-tab-cont">
                        <ul className="board-list">
                          {noticeItems.map((item) => {
                            const target = resolveBoardTarget(noticeListPath, item, true);
                            const noticeDate = formatDate(item?.pstRegDt ?? item?.regDt);
                            return (
                              <li className="board-list-item" key={String(item.pstNo)}>
                                {renderBoardLink(
                                  target,
                                  <>
                                    {item.ctgryNm && (
                                      <span className="krds-badge bg-light-primary">
                                        {item.ctgryNm}
                                      </span>
                                    )}
                                    <span className="board-list-title onellipsis-1">
                                      {item.pstTtl}
                                    </span>
                                    <span className="board-list-date">
                                      {noticeDate}
                                    </span>
                                  </>,
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {noticeActiveIndex === 3 && (
                      <div className="notice-tab-cont">
                        <ul className="board-list">
                          {newNewsItems.map((item) => {
                            const newsDate = formatDate(item.pstgBgngYmd || item.pstRegDt);

                            const internalPath = `${policyNewsListPath}/${item.pstNo}`;

                            return (
                              <li className="board-list-item" key={String(item.pstNo)}>
                                <Link to={internalPath} className="board-list-link">
                                  {item.ctgryNm && (
                                    <span className="krds-badge bg-light-primary">
                                      {item.ctgryNm}
                                    </span>
                                  )}
                                  <span className="board-list-title onellipsis-1">
                                    {item.pstTtl}
                                  </span>
                                  <span className="board-list-date">
                                    {newsDate}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="notice-right">
                <div className="main-banner">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation={{
                      prevEl: '.main-banner .swiper-button-prev',
                      nextEl: '.main-banner .swiper-button-next',
                    }}
                    pagination={{
                      el: '.main-banner .swiper-pagination',
                      type: 'fraction',
                    }}
                    ref={swiperRef}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    loop={true}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                  >
                    {bannerItems.map((item, idx) => {
                      const imageSrc =
                        item.fallbackImageSrc ||
                        buildMainImageUrl(
                          'banners',
                          item.moblImgAtchFileId || item.imgAtchFileId,
                          item.moblImgAtchFileSn ?? item.imgAtchFileSn,
                        );
                      const href = item.imgLnkgUrlAddr || '#';
                      const external = isNewWindow(item.imgLnkgNpagYn);
                      return (
                        <SwiperSlide key={String(item.bnrId)}>
                          <div className="main-banner-item">
                            <a
                              href={href}
                              className="main-banner-link"
                              target={external ? '_blank' : undefined}
                              rel={external ? 'noopener noreferrer' : undefined}
                            >
                              <img
                                src={imageSrc || mainBanner01}
                                onError={(event) => {
                                  // fallbackImageSrc가 있으면 그것으로, 없으면 no-image placeholder
                                  if (item.fallbackImageSrc && event.currentTarget.src !== item.fallbackImageSrc) {
                                    event.currentTarget.src = item.fallbackImageSrc;
                                  } else if (event.currentTarget.src !== NO_IMAGE_SVG) {
                                    event.currentTarget.src = NO_IMAGE_SVG;
                                    event.currentTarget.classList.add('banner-img--noimg');
                                  }
                                }}
                                alt={
                                  item.moblImgSbstPhrsCn ||
                                  item.imgFileSbstPhrsCn ||
                                  item.fallbackAlt ||
                                  item.bnrTtl ||
                                  '메인 배너'
                                }
                                loading={idx === 0 ? 'eager' : 'lazy'}
                                fetchpriority={idx === 0 ? 'high' : undefined}
                              />
                            </a>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                  <div className="swiper-nav-wrap">
                    <div className="swiper-pagination" aria-live="polite"></div>
                    <button
                      type="button"
                      className={`swiper-autoplay-toggle ${isPlaying ? 'play' : 'stop'}`}
                      onClick={toggleAutoplay}
                      aria-label={isPlaying ? '슬라이드 정지' : '슬라이드 시작'}
                      aria-pressed={!isPlaying}
                    >
                      <span className="sr-only">
                        {isPlaying ? '정지' : '시작'}
                      </span>
                    </button>
                    <button type="button" className="swiper-button-prev">
                      <span className="sr-only">이전</span>
                    </button>
                    <button type="button" className="swiper-button-next">
                      <span className="sr-only">다음</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="main-btm-bar">
          <div className="contents-inner">
            <p className="title">68개 중소기업 유관 시스템을 하나의 통합 ID로 이용할 수 있습니다</p>
            <button type="button" className="krds-btn primary" onClick={handleOnepassJoinClick}>통합회원 가입하기</button>
          </div>
        </div>
      </div>
      { /* 공고 팝업 */ }
      {selectedNotice && (
        <div className="notice-layer" role="dialog" aria-modal="true" aria-labelledby="noticeLayerTitle">
          <div className="notice-layer__dim" onClick={closeNoticeLayer}></div>

          <div className="notice-layer__box">
            <button
              type="button"
              className="notice-layer__close"
              onClick={closeNoticeLayer}
              aria-label="팝업 닫기"
            >
              <i className="svg-icon ico-popup-close"></i>
            </button>

            <div className="notice-layer__head">
              <div className="notice-layer__badges">
                <span className="krds-label state">{selectedNotice.status || '접수중'}</span>
                <span className="krds-badge bg-primary">{selectedNotice.badge || '중소벤처기업부'}</span>
              </div>

              <h3 id="noticeLayerTitle">
                <span className="notice-layer__category">{selectedNotice.category}</span>
                {selectedNotice.title}
              </h3>
            </div>

            <div className="notice-layer__body">
              <dl>
                <dt>소관부처 · 지자체</dt>
                <dd>{selectedNotice.agency || '중소벤처기업부'}</dd>
              </dl>

              <dl>
                <dt>사업수행기관</dt>
                <dd>{selectedNotice.region || '경북테크노파크'}</dd>
              </dl>

              <dl>
                <dt>신청기간</dt>
                <dd>{selectedNotice.date}</dd>
              </dl>

              <dl>
                <dt>사업개요</dt>
                <dd>
                  <p>
                    {renderExpandableHtmlRow('', selectedNotice.desc) ||
                      '2026년도 중소벤처기업부 경상북도 및 울진군이 지원하는 신규 국고산업육성형 협업 프로젝트의 수행자로 선정된 수행기관별 지원 프로그램을 안내하오니, 해당 프로그램 참여를 희망하는 기업의 많은 신청 바랍니다.'}
                  </p>
                </dd>
              </dl>
            </div>

            <div className="notice-layer__foot">
              <a
                href={selectedNotice.detailHref || '#'}
                className="krds-btn primary medium"
                onClick={handleNoticeDetailClick}
              >
                상세공고 바로가기
              </a>
            </div>
          </div>
        </div>
      )}
      <InitialPasswordNoticeModal />
      <OnepassLoginConversionModal
        isOpen={isOnepassModalOpen}
        onConvert={handleOnepassModalConvert}
        onLater={handleOnepassModalDismiss}
        onClose={handleOnepassModalDismiss}
        hasCi={hasCi}
      />
      <Footer />
      {!isMobilePopupViewport && visiblePopups.map((popup) => (
        <MainPopupItem
          key={popup.popupId}
          popup={popup}
          isActive={String(activePopupId) === String(popup.popupId)}
          onActivate={() => setActivePopupId(String(popup.popupId))}
          onClose={handlePopupClose}
          onHideToday={handlePopupHideToday}
        />
      ))}
    </div>
  );
};

export default MainPage;
