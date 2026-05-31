import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import Header from '@components/ui/Header.jsx';
import Footer from '@components/ui/Footer.jsx';
const Work24VirtualKeyboard = lazy(() => import('@components/ui/work24-keyboard/Work24VirtualKeyboard.jsx'));
import mainBanner01 from '@assets/main/new/main_banner_01.png';
import mainBanner02 from '@assets/main/new/main_banner_02.png';
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
import { buildOnePassConversionUrl, buildOnePassRegisterUrl, onePassJoin } from '@utils/keycloakGetAuthCode.js';
import {
  normalizeResponse, resolveApiErrorMessage, removeCssCharset,
  formatDate, formatLocalDateKey, getLocalYmd,
  parseYmd, formatCalendarDate, formatWeekItemDate, formatWeekPeriod,
  getDdayLabel, getDdayBadgeClass, isUrgentDday, getPbancStatusLabel,
  buildMainImageUrl, buildBoardThumbnailUrl,
  isNewWindow, isAbsoluteHttpUrl, appendQueryParam, resolveBoardTarget, stripHtmlTags,
  extractPopularKeywords, extractAutoCompleteKeywords,
} from './main/mainUtils.js';


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
const SEARCH_POPULAR_LIMIT = 5;
const SEARCH_AUTOCOMPLETE_LIMIT = 8;
const SEARCH_AUTOCOMPLETE_DEBOUNCE_MS = 250;
const ONEPASS_CONVERSION_MODAL_DISMISSED_KEY = '__onepass_conversion_modal_dismissed__';

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
  const { getFullPath } = useUserMenu();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [noticeActiveIndex, setNoticeActiveIndex] = useState(0);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [activeGovTab, setActiveGovTab] = useState('central');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [likedAnnounce, setLikedAnnounce] = useState({});
  const [likedPolicy, setLikedPolicy] = useState({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [hiddenPopupIds, setHiddenPopupIds] = useState([]);
  const [autoCompleteKeywords, setAutoCompleteKeywords] = useState([]);
  const [isAutoCompleteEnabled, setIsAutoCompleteEnabled] = useState(true);
  const [isAutoLoading, setIsAutoLoading] = useState(false);

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
  const popularKeywords = popularKeywordsRaw?.slice(0, SEARCH_POPULAR_LIMIT) || [];
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [hasOpenedKeyboard, setHasOpenedKeyboard] = useState(false);
  const [isOnepassModalOpen, setIsOnepassModalOpen] = useState(false);
  const [isSearchFixed, setIsSearchFixed] = useState(false);
  const srchInputRef = useRef(null);
  const keyboardButtonRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchBarRef = useRef(null);
  const originTopRef = useRef(0);
  const swiperRef = useRef(null);
  const latestAutoQueryRef = useRef('');
  const authToken = useAuthStore((state) => state.token);
  const isLogin = useAuthStore((state) => state.isLogin);
  const intgMbrSwtcYn = useAuthStore((state) => state.intgMbrSwtcYn);
  const isLoggedIn = Boolean(authToken);

  useEffect(() => {
    let cancelled = false;

    const removeMainPageStyle = () => {
      document.getElementById(MAIN_PAGE_STYLE_ELEMENT_ID)?.remove();
    };

    const injectMainPageStyle = async () => {
      try {
        const [customStyleModule, mainStyleModule] = await Promise.all([
          import('@styles/custom.scss?inline'),
          import('@styles/main.scss?inline'),
        ]);

        if (cancelled) return;

        removeMainPageStyle();

        const styleElement = document.createElement('style');
        styleElement.id = MAIN_PAGE_STYLE_ELEMENT_ID;
        styleElement.setAttribute('data-main-page-style', 'true');
        styleElement.textContent = [
          removeCssCharset(customStyleModule.default),
          removeCssCharset(mainStyleModule.default),
        ].join('\n');

        document.head.appendChild(styleElement);
      } catch (error) {
        if (!cancelled) {
          removeMainPageStyle();
          console.error('Failed to load main page styles.', error);
        }
      }
    };

    injectMainPageStyle();

    return () => {
      cancelled = true;
      removeMainPageStyle();
    };
  }, []);

  const showPopular = isFocused && searchQuery.trim() === '';
  const showAutoComplete =
    isFocused && isAutoCompleteEnabled && searchQuery.trim() !== '';
  const noticeTabMenu = ['자주찾는 질문', '행사정보', '공지사항', '새로운 뉴스'];
  const platformMenus = [
    {
      img: mainIcon01,
      title: '사업공고 찾기',
      path: '/req/pbanc',
    },
    {
      img: mainIcon02,
      title: '증명서 발급',
      path: '/crtf/UI_USR_L_040',
    },
    {
      img: mainIcon03,
      title: '정책뉴스',
      path: '/plcy/reprt/plcyNews',
    },
    {
      img: mainIcon04,
      title: '정책금융상품',
      path: '/req/UI_USR_L_030',
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

  useEffect(() => {
    const todayKey = formatLocalDateKey();
    setHiddenPopupIds(
      (mainData.popups || [])
        .filter(
          (popup) =>
            window.localStorage.getItem(`main-popup-hide-${popup.popupId}`) ===
            todayKey,
        )
        .map((popup) => popup.popupId),
    );
  }, [mainData.popups]);

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
  const pbancItems = mainData.pbancs || [];
  const sprtBizItems = mainData.sprtBizs || [];
  const certificateItems = mainData.certificates || [];
  const financePolicyItems = mainData.financePolicies || [];
  const noticeItems = mainData.notices || [];
  const faqItems = mainData.faqs || [];
  const adminInfoItems = mainData.adminInfos || [];
  const todayPbancItems = mainData.todayPbancs || [];
  const weeklyPbancGroups = mainData.weeklyPbancGroups || [];
  const supportPbancGroups = mainData.supportPbancGroups || {};
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
  const toPbancNoticeCard = (item) => {
    const dday = getDdayLabel(item?.bizAplyDdlnYmd);
    const category = bizFieldMap[item?.bizPbancClsfCd] || item?.bizPbancClsfCd || '';
    const detailPath = item?.bizPbancNo ? `/req/pbanc/${item.bizPbancNo}` : '#';

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
      desc: item?.bizCn || item?.bizExplnCn,
      target: item?.sprtTrgtCn,
      detailHref: detailPath,
      detailPath,
      liked: Boolean(likedAnnounce[String(item?.bizPbancNo)]),
    };
  };
  const todayNoticeCards = useMemo(
    () => todayPbancItems.map(toPbancNoticeCard),
    [todayPbancItems, bizFieldMap, likedAnnounce],
  );
  const weekNoticeCards = useMemo(
    () =>
      weeklyPbancGroups.map((group) => {
        const displayDate = formatWeekItemDate(group.date || group.title);
        return {
          date: displayDate.date || group.title || '-',
          day: displayDate.day || '',
          list: (group.items || []).map(toPbancNoticeCard),
        };
      }),
    [weeklyPbancGroups, bizFieldMap, likedAnnounce],
  );
  useEffect(() => {
    setActiveWeekIndex((prev) => Math.min(prev, Math.max(weekNoticeCards.length - 1, 0)));
  }, [weekNoticeCards.length]);
  const currentSupportGroups = useMemo(
    () =>
      (supportPbancGroups[activeGovTab] || []).map((group) => ({
        title: group.title,
        cards: (group.items || []).map(toPbancNoticeCard),
      })),
    [supportPbancGroups, activeGovTab, bizFieldMap, likedAnnounce],
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
    () => [
      ...todayPbancItems,
      ...weeklyPbancGroups.flatMap((group) => group.items || []),
    ],
    [todayPbancItems, weeklyPbancGroups],
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
    (popup) => !hiddenPopupIds.includes(popup.popupId),
  );
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
    if (!isLogin) {
      window.sessionStorage.removeItem(ONEPASS_CONVERSION_MODAL_DISMISSED_KEY);
      setIsOnepassModalOpen(false);
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

    setIsOnepassModalOpen(true);
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
      console.log('onOnePassJoin : ', onePassJoinUrl);
      window.location.href = onePassJoinUrl;
    } else {
      const onePassJoinUrl = buildOnePassConversionUrl();
      console.log('onOnePassJoin : ', onePassJoinUrl);
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
      const maxIndex = Math.max(weekNoticeCards.length - 1, 0);
      if (maxIndex === 0) return 0;
      return Math.min(Math.max(prev + direction, 0), maxIndex);
    });
  };
  const handlePopupClose = (popupId) =>
    setHiddenPopupIds((prev) => [...new Set([...prev, popupId])]);
  const handlePopupHideToday = (popupId) => {
    window.localStorage.setItem(
      `main-popup-hide-${popupId}`,
      formatLocalDateKey(),
    );
    handlePopupClose(popupId);
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
                    placeholder='지원사업·정책금융·확인서·사업공고를 검색하세요'
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
                    <i className="svg-icon ico-sch"></i>
                  </button>
                </div>
                {isFocused && (
                  <div className="sch-layer">

                    {showPopular && (
                      <div className="sch-layer-popular">
                        <div className="sch-layer-inner">
                          <strong className="sch-layer-title">인기검색어</strong>
                          <ul className="sch-layer-popular-list">
                            {isPopularLoading && (
                              <li className="sch-popular-item">
                                <span className="item-link">Loading...</span>
                              </li>
                            )}
                            {!isPopularLoading &&
                              popularKeywords.map((keyword, index) => (
                                <li
                                  className="sch-popular-item"
                                  key={`popular-${keyword}-${index}`}
                                >
                                  <button
                                    type="button"
                                    className="item-link"
                                    onClick={() => handleKeywordSelect(keyword)}
                                  >
                                    <em className="rank">
                                      <span className="sr-only">인기검색어</span>
                                      {index + 1}
                                    </em>
                                    {keyword}
                                  </button>
                                </li>
                              ))}
                            {!isPopularLoading && popularKeywords.length === 0 && (
                              <li className="sch-popular-item">
                                <span className="item-link">No popular keywords.</span>
                              </li>
                            )}
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
                {isPopularLoading && (
                  <li>
                    <button type="button" className="word" disabled>
                      Loading...
                    </button>
                  </li>
                )}
                {!isPopularLoading &&
                  popularKeywords.map((keyword, index) => (
                    <li key={`top-popular-${keyword}-${index}`}>
                      <button
                        type="button"
                        className="word"
                        onClick={() => handleKeywordSelect(keyword)}
                      >
                        {keyword}
                      </button>
                    </li>
                  ))}
                {!isPopularLoading && popularKeywords.length === 0 && (
                  <li>
                    <button type="button" className="word" disabled>
                      No popular keywords.
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="container">
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
                        <strong className={`krds-label state ${card.status === '마감임박' ? 'danger' : ''}`}>
                          {card.status}
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
                      <button type="button" className="krds-btn" aria-label="이전 주" onClick={() => handleWeekMove(-1)}>
                        <i className="svg-icon ico-angle up"></i>
                      </button>
                      <button type="button" className="krds-btn" aria-label="다음 주" onClick={() => handleWeekMove(1)}>
                        <i className="svg-icon ico-angle"></i>
                      </button>
                    </div>
                    <span className="period">{formatWeekPeriod()}</span>
                  </div>
                  {weekNoticeCards.map((day, dayIndex) => {
                    const isActive = dayIndex === activeWeekIndex;
                    const visibleList = day.list.slice(0, isActive ? 3 : 1);

                    return (
                      <div className={`week-item ${isActive ? 'is-active' : ''}`} key={day.date || dayIndex}>
                        <div className="week-date">
                          <strong>{day.date}</strong>
                          <span>{day.day}</span>
                        </div>
                        <ul className="week-list">
                          {visibleList.map((card, index) => (
                            <li key={card.id || index}>
                              <span className={`krds-label state ${card.status === '마감임박' ? 'danger' : ''}`}>
                                {card.status}
                              </span>
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
                  className="card-news-thumb"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(cardNewsDetailPath);
                  }}
                >
                  <img
                    src={cardNewsThumbnailUrl || undefined}
                    onError={(event) => {
                      event.currentTarget.removeAttribute('src');
                    }}
                    alt={cardNewsItem?.pstTtl || '카드뉴스'}
                    loading="lazy"
                  />
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
                      slidesPerView: 5,
                      spaceBetween: 20,
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

            <div className="support-board">
              <div className="support-side-tab">
                <button
                  type="button"
                  role="tab"
                  className={activeGovTab === 'central' ? 'is-active' : ''}
                  aria-selected={activeGovTab === 'central'}
                  onClick={() => setActiveGovTab('central')}
                >
                  중앙<br />정부
                </button>
                <button
                  type="button"
                  role="tab"
                  className={activeGovTab === 'local' ? 'is-active' : ''}
                  aria-selected={activeGovTab === 'local'}
                  onClick={() => setActiveGovTab('local')}
                >
                  지방<br />정부
                </button>
              </div>

              <div className="support-content">
                <div className="support-group-scroll">
                  {currentSupportGroups.map((group, groupIndex) => (
                    <section
                      className="support-group"
                      key={group.title}
                    >
                      <h3 className="support-group-title">{group.title}</h3>

                      <div className="support-group-cards">
                        {group.cards.map((card, cardIndex) => {
                          const keyIndex = groupIndex * 2 + cardIndex;

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
                    onClick={() => navigate('/req/pbanc')}
                  >
                    사업공고 더보기
                    <i className="svg-icon ico-angle right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* E - 주요 지원 사업 공고 */}
        <section className="main-section">
          <div className="container">
            <a
              href="/req/sprt"
              onClick={(event) => {
                event.preventDefault();
                navigate('/req/sprt');
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
                                  {item.evntPrdCn || item.rcptPrdCn || formatDate(item.regDt)}
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
                            const target = resolveBoardTarget(policyNewsListPath, item, true);
                            const newsDate = formatDate(item.pstgBgngYmd || item.pstRegDt);
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
                                      {newsDate}
                                    </span>
                                  </>,
                                )}
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
                    {selectedNotice.desc ||
                      '2026년도 중소벤처기업부 경상북도 및 울진군이 지원하는 신규 국고산업육성형 협업 프로젝트의 수행자로 선정된 수행기관별 지원 프로그램을 안내하오니, 해당 프로그램 참여를 희망하는 기업의 많은 신청 바랍니다.'}
                  </p>
                  <p>
                    {selectedNotice.target || '해당 지원을 필요로 하는 기업'}
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
      <OnepassLoginConversionModal
        isOpen={isOnepassModalOpen}
        onConvert={handleOnepassModalConvert}
        onLater={handleOnepassModalDismiss}
        onClose={handleOnepassModalDismiss}
      />
      <Footer />
      {visiblePopups.map((popup) => {
        const imageSrc = buildMainImageUrl(
          'popups',
          popup.imgAtchFileId,
          popup.imgAtchFileSn,
        );
        const href = popup.imgLnkgUrlAddr || '#';
        const external = isNewWindow(popup.imgLnkgNpagYn);

        return (
          <div
            key={popup.popupId}
            className="main-popup-item"
            style={{
              position: 'fixed',
              top: `${popup.upendPstnNvl || 120}px`,
              left: `${popup.lfsdPstnNvl || 40}px`,
              width: `${popup.wdthLen || 360}px`,
              height: `${popup.vrtcLen || 420}px`,
              zIndex: 1000,
              backgroundColor: '#fff',
              border: '1px solid #d8d8d8',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.18)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #eee',
              }}
            >
              <strong style={{ fontSize: '16px', lineHeight: 1.4 }}>
                {popup.popupTtl}
              </strong>
              <button
                type="button"
                className="krds-btn text small"
                onClick={() => handlePopupClose(popup.popupId)}
              >
                닫기
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                style={{ display: 'block', width: '100%', height: '100%' }}
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={popup.imgSbstTxtCn || popup.popupTtl}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px',
                    }}
                  >
                    {popup.imgSbstTxtCn || popup.popupTtl}
                  </div>
                )}
              </a>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderTop: '1px solid #eee',
              }}
            >
              {popup.vwngStopUseYn === 'Y' ? (
                <button
                  type="button"
                  className="krds-btn tertiary small"
                  onClick={() => handlePopupHideToday(popup.popupId)}
                >
                  오늘 하루 보지 않기
                </button>
              ) : (
                <span></span>
              )}
              <button
                type="button"
                className="krds-btn secondary small"
                onClick={() => handlePopupClose(popup.popupId)}
              >
                닫기
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MainPage;
