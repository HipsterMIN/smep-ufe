import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

import Header from '@components/ui/Header.jsx';
import Footer from '@components/ui/Footer.jsx';
import mainIcon01 from '@assets/main/mainIcon_01.svg';
import mainIcon03 from '@assets/main/mainIcon_03.svg';
import mainIcon04 from '@assets/main/mainIcon_04.svg';
import mainIcon06 from '@assets/main/mainIcon_06.svg';
import mainIcon07 from '@assets/main/mainIcon_07.svg';
import mainBanner from '@assets/temp/main_banner_1.png';
import { api as apiClient } from '@lib/apiClient.js';
import { fetchAndConvertCommonCodes } from '@utils/commonCodeUtils.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const MAIN_MENU_IDS = {
  notice: 'M_PIIO_00101',
  faq: 'M_PIIO_00102',
  adminInfo: 'M_PIIO_00087',
};
const BIZ_PBANC_CLSF_GROUP_ID = 'BIZ_PBANC_CLSF_CD';
const APP_BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const EMPTY_MAIN_DATA = {
  pbancs: [],
  sprtBizs: [],
  certificates: [],
  financePolicies: [],
  notices: [],
  faqs: [],
  adminInfos: [],
  banners: [],
  popups: [],
};
const normalizeResponse = (response) => response?.data || response || {};
const isNewWindow = (value) => value === 'Y';

const formatDate = (value, separator = '.') => {
  if (!value) return '';
  const raw = String(value).trim();
  if (/^\d{8}$/.test(raw))
    return `${raw.slice(0, 4)}${separator}${raw.slice(4, 6)}${separator}${raw.slice(6, 8)}`;
  const datePart = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart))
    return datePart.replace(/-/g, separator);
  return raw;
};

const formatDateRange = (start, end, separator = ' ~ ') => {
  const startText = formatDate(start);
  const endText = formatDate(end);
  if (startText && endText) return `${startText}${separator}${endText}`;
  return startText || endText || '';
};

const getDaysRemaining = (deadline) => {
  if (!deadline || !/^\d{8}$/.test(String(deadline))) return null;
  const raw = String(deadline);
  const target = new Date(
    Number(raw.slice(0, 4)),
    Number(raw.slice(4, 6)) - 1,
    Number(raw.slice(6, 8)),
  );
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - today.getTime()) / 86400000);
};

const getDdayLabel = (deadline) => {
  //if (!deadline) return '상시';
  const daysRemaining = getDaysRemaining(deadline);
  if (daysRemaining === null) return '상시';
  if (daysRemaining < 0) return '마감';
  if (daysRemaining === 0) return 'D-Day';
  return `D-${daysRemaining}`;
};

const getDdayBadgeClass = (label) => {
  if (label === 'D-Day') return 'bg-point';
  if (!label?.startsWith('D-')) return 'bg-primary';
  const days = Number(label.replace('D-', ''));
  return Number.isFinite(days) && days <= 10 ? 'bg-point' : 'bg-primary';
};

const buildMainImageUrl = (type, atchFileId, atchFileSn) => {
  if (!atchFileId || atchFileSn === null || atchFileSn === undefined)
    return null;
  return `${APP_BASE_URL}/api/v1/main/${type}/${atchFileId}/${atchFileSn}/image`.replace(
    /([^:]\/)\/+/g,
    '$1',
  );
};

const isAbsoluteHttpUrl = (value) => /^https?:\/\//i.test(String(value || '').trim());

const resolveBoardTarget = (listPath, item, hasDetail = true) => {
  const fallbackTo =
    hasDetail && listPath && item?.pstNo ? `${listPath}/${item.pstNo}` : listPath || '#';

  if (!item) {
    return { kind: 'internal', to: listPath || '#' };
  }

  const rawUrl = String(item.pstUrlAddr ?? '').trim();
  if (isAbsoluteHttpUrl(rawUrl)) {
    return { kind: 'external', href: rawUrl };
  }

  return { kind: 'internal', to: fallbackTo };
};

const stripHtmlTags = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/<[^>]*>/g, '')
    .trim();
};

const MainPage = () => {
  const navigate = useNavigate();
  const { getFullPath } = useUserMenu();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [serviceActiveIndex, setServiceActiveIndex] = useState(0);
  const [noticeActiveIndex, setNoticeActiveIndex] = useState(0);
  const [likedAnnounce, setLikedAnnounce] = useState({});
  const [likedBusiness, setLikedBusiness] = useState({});
  const [likedPolicy, setLikedPolicy] = useState({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [mainData, setMainData] = useState(EMPTY_MAIN_DATA);
  const [mainLoading, setMainLoading] = useState(true);
  const [bizFieldOptions, setBizFieldOptions] = useState([]);
  const [hiddenPopupIds, setHiddenPopupIds] = useState([]);
  const srchInputRef = useRef(null);
  const searchBarRef = useRef(null);
  const originTopRef = useRef(0);
  const swiperRef = useRef(null);

  const showPopular = isFocused && searchQuery === '';
  const showAutoComplete = isFocused && searchQuery !== '';
  const serviceTabMenu = [
    '사업공고',
    '지원사업 소개',
    '증명서 발급',
    '정책금융',
  ];
  const noticeTabMenu = ['공지사항', '자주찾는 질문', '행정정보'];
  const platformMenus = [
    {
      img: mainIcon01,
      title: (
        <>
          <span className="mo-hide">신청 가능한</span>{' '}
          <br className="pc-only" />
          사업공고 찾기
        </>
      ),
      path: '/req/pbanc/pbanc',
    },
    {
      img: mainIcon07,
      title: (
        <>
          <span className="mo-hide">중소벤처기업부</span>{' '}
          <br className="pc-only" />
          지원사업 보기
        </>
      ),
      path: '/req/sprt',
    },
    {
      img: mainIcon04,
      title: (
        <>
          <span className="mo-hide">융자 보증 보험</span>정책 금융상품 찾기
        </>
      ),
      path: '/req/plcy/UI_USR_L_030',
    },
    {
      img: mainIcon03,
      title: (
        <>
          중소기업 <span className="mo-hide">(소상공인)</span>확인서 발급하기
        </>
      ),
      path: '/crtf/UI_USR_L_040/Y107',
    },
    {
      img: mainIcon03,
      title: (
        <>
          직접생산확인 <br /> 증명서 발급하기
        </>
      ),
      path: '/crtf/UI_USR_L_040/Y101',
    },
    {
      img: mainIcon06,
      title: '입법행정예고/고시',
      path: '/plcy/icr/UI_USR_L_110',
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (srchInputRef.current && !srchInputRef.current.contains(e.target))
        setIsFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setIsFocused(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadMainData = async () => {
      try {
        setMainLoading(true);
        const [mainResponse, codeResponse] = await Promise.all([
          apiClient.get('/api/v1/main'),
          fetchAndConvertCommonCodes([BIZ_PBANC_CLSF_GROUP_ID]),
        ]);
        if (!isMounted) return;
        setMainData({ ...EMPTY_MAIN_DATA, ...normalizeResponse(mainResponse) });
        setBizFieldOptions(
          normalizeResponse(codeResponse)?.[BIZ_PBANC_CLSF_GROUP_ID] || [],
        );
      } catch (error) {
        if (!isMounted) return;
        setMainData(EMPTY_MAIN_DATA);
        setBizFieldOptions([]);
      } finally {
        if (isMounted) setMainLoading(false);
      }
    };
    loadMainData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
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
  const pbancItems = mainData.pbancs || [];
  const sprtBizItems = mainData.sprtBizs || [];
  const certificateItems = mainData.certificates || [];
  const financePolicyItems = mainData.financePolicies || [];
  const noticeItems = mainData.notices || [];
  const faqItems = mainData.faqs || [];
  const adminInfoItems = mainData.adminInfos || [];
  const bannerItems =
    (mainData.banners || []).length > 0
      ? mainData.banners
      : [
        {
          bnrId: 'fallback-1',
          bnrTtl: '메인 배너',
          imgLnkgUrlAddr: '#',
          imgLnkgNpagYn: 'N',
          fallbackImageSrc: mainBanner,
          fallbackAlt: '메인 배너',
        },
        {
          bnrId: 'fallback-2',
          bnrTtl: '메인 배너',
          imgLnkgUrlAddr: '#',
          imgLnkgNpagYn: 'N',
          fallbackImageSrc: mainBanner,
          fallbackAlt: '메인 배너',
        },
      ];
  const visiblePopups = (mainData.popups || []).filter(
    (popup) => !hiddenPopupIds.includes(popup.popupId),
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('/publishing/ai-smart-search', {
        state: { q: searchQuery.trim() },
      });
      return;
    }
    navigate('/publishing/ai-smart-search');
  };
  const handleKeyDown = (e) => e.key === 'Enter' && handleSearch();
  const handleClear = () => setSearchQuery('');
  const handleToggleLike1 = (index) =>
    setLikedAnnounce((prev) => ({ ...prev, [index]: !prev[index] }));
  const handleToggleLike2 = (index) =>
    setLikedBusiness((prev) => ({ ...prev, [index]: !prev[index] }));
  const handleToggleLike3 = (index) =>
    setLikedPolicy((prev) => ({ ...prev, [index]: !prev[index] }));
  const toggleAutoplay = () => {
    if (!swiperRef.current) return;
    if (isPlaying) swiperRef.current.autoplay.stop();
    else swiperRef.current.autoplay.start();
    setIsPlaying(!isPlaying);
  };
  const handlePopupClose = (popupId) =>
    setHiddenPopupIds((prev) => [...new Set([...prev, popupId])]);
  const handlePopupHideToday = (popupId) => {
    window.localStorage.setItem(
      `main-popup-hide-${popupId}`,
      new Date().toISOString().slice(0, 10),
    );
    handlePopupClose(popupId);
  };

  return (
    <div id="wrap">
      <Header />{ /* 임시 해더 */}
      <div id="container" class="main-container">
        { /*컨텐츠 영역 */}

        {/* S - main-totallayout */}
        <div className="main-toplayout">
          <div className="main-top-inner">
            <div className="main-top-srch" ref={searchBarRef}>
              <div
                ref={srchInputRef}
                className={`top-srch sch-input ${isFocused ? 'is-focused' : ''}`}
              >
                <div className="sch-input-box">
                  <input
                    type="text"
                    placeholder='지원사업·정책금융·확인서·사업공고를 검색하세요'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    className="krds-input"
                  />
                  {isFocused && (
                    <button
                      type="button"
                      className="krds-btn icon ico-keyboard"
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
                            <li className="sch-popular-item">
                              <Link to="#" className="item-link">
                                <em className="rank">
                                  <span className="sr-only">인기검색어</span>1
                                </em>
                                      안전보건교육
                              </Link>
                            </li>
                            <li className="sch-popular-item">
                              <Link to="#" className="item-link">
                                <em className="rank">
                                  <span className="sr-only">인기검색어</span>2
                                </em>
                                      안전보건교육
                              </Link>
                            </li>
                            <li className="sch-popular-item">
                              <Link to="#" className="item-link">
                                <em className="rank">
                                  <span className="sr-only">인기검색어</span>3
                                </em>
                                      안전보건교육
                              </Link>
                            </li>
                            <li className="sch-popular-item">
                              <Link to="#" className="item-link">
                                <em className="rank">
                                  <span className="sr-only">인기검색어</span>4
                                </em>
                                      안전보건교육
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {showAutoComplete && (
                      <div className="sch-layer-inner">
                        <ul className="sch-layer-auto-list">
                          <li>
                            <button type="button">
                              <i className="ico-keyword"></i>
                              <em className="keyword">수출입</em> 지원사업
                            </button>
                          </li>
                          <li>
                            <button type="button">
                              <i className="ico-keyword"></i>
                              <em className="keyword">수출입</em> 지원사업
                            </button>
                          </li>

                        </ul>
                      </div>
                    )}

                    <div className="sch-layer-footer">
                      <div className="krds-form-toggle-switch">
                        <input type="checkbox" id="switch" />
                        <label for="switch"><span className="switch-toggle"><i></i></span>자동완성기능</label>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* 인기 검색어 */}
            </div>
            <div className="main-top-keyword">
              <h3>인기 검색어</h3>
              <ul className="keyword-list">
                <li><button type="button" className="word">소상공인지원</button></li>
                <li><button type="button" className="word">초기창업</button></li>
                <li><button type="button" className="word">창업지원포털</button></li>
                <li><button type="button" className="word">지원사업공고</button></li>
                <li><button type="button" className="word">AP소재정보</button></li>
              </ul>
            </div>

            {/* S - 자주 찾는 서비스  */}
            <section className="main-quick-menu">
              <div className="flex-box">
                <h2 className="section-tit white">자주 찾는 <br />서비스 </h2>
                <div className="quick-menu-swiper">
                  <Swiper
                    breakpoints={{
                      320: {
                        enabled: true,
                        slidesPerView: 3.4,
                        spaceBetween: 8,
                      },
                      768: {
                        enabled: true,
                        slidesPerView: 5,
                        spaceBetween: 50,
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
                              <img src={item.img} alt="" />
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

            {/*  S - 지금 이용 가능한 서비스 */}
            <section className="main-section main-service">
              <div className="contents-inner">
                <div className="flex-box">
                  <h2 className="section-tit">지금 이용 가능한 서비스</h2>
                  {/* tab 메뉴 */}
                  <ul className="tablist">
                    {serviceTabMenu.map((menu, index) => (
                      <li
                        key={index}
                        className={`${serviceActiveIndex === index ? 'is-active' : ''}`}
                      >
                        <button
                          type="button"
                          className="krds-btn medium text"
                          onClick={() => setServiceActiveIndex(index)}
                        >
                          {menu}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* tab conts */}
                <div className="service-tabconts">
                  {/* 사업공고 */}
                  {serviceActiveIndex === 0 &&  (
                    <div className="service-tabcont">
                      <ul className="krds-structured-list row-4">
                        {pbancItems.map((item, index) => {
                          const ddayLabel = getDdayLabel(
                            item.bizAplyDdlnYmd,
                          );
                          const bizFieldLabel =
                            bizFieldMap[item.bizPbancClsfCd] ||
                            item.bizPbancClsfCd;
                          return (
                            <li className="structured-item" key={index}>
                              <div className="card-top">
                                <span
                                  className={`krds-badge ${getDdayBadgeClass(ddayLabel)} number`}
                                >
                                  {ddayLabel}
                                </span>
                                {bizFieldLabel && (
                                  <span className="krds-badge">
                                    {bizFieldLabel}
                                  </span>
                                )}
                              </div>
                              <div className="card-body">
                                <Link
                                  to={`/req/pbanc/pbanc/${item.bizPbancNo}`}
                                  className="c-text"
                                >
                                  <p className="c-tit no-icon">
                                    <span className="span onellipsis-2">
                                      {item.bizPbancNm}
                                    </span>
                                  </p>
                                  <div className="c-etc">
                                    <p className="c-ico-txt">
                                      <i className="svg-icon ico-build"></i>{' '}
                                      {item.bizSprvsnInstNm}
                                    </p>
                                    <p className="c-ico-txt">
                                      <i className="svg-icon ico-calendar"></i>{' '}
                                      {item.applyPeriodText}
                                    </p>
                                  </div>
                                </Link>
                              </div>
                              <div className="card-btn">
                                <button
                                  type="button"
                                  className="krds-btn text"
                                  aria-label={`${item.bizPbancNm} 찜하기`}
                                  onClick={() => handleToggleLike1(index)}
                                >
                                  <i
                                    className={`svg-icon ico-like on-bgcolorgray ${likedAnnounce[index] ? 'on' : ''}`}
                                  ></i>
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="more-btn">
                        <button
                          type="button"
                          className="krds-btn tertiary medium"
                          onClick={() => navigate('/req/pbanc/pbanc')}
                        >
                          사업공고 더보기
                          <i className="svg-icon ico-angle right"></i>
                        </button>
                      </div>
                    </div>
                  )}
                  {serviceActiveIndex === 1 && (
                    <div className="service-tabcont">
                      <ul className="krds-structured-list row-4">
                        {sprtBizItems.map((item, index) => {
                          const sprtBizOtln = stripHtmlTags(item.sprtBizOtln);
                          return (
                            <li className="structured-item" key={index}>
                              <div className="card-top">
                                {item.bizPbancClsfCd && (
                                  <span className="krds-badge bg-light-primary">
                                    {bizFieldMap[item.bizPbancClsfCd] ||
                                      item.bizPbancClsfCd}
                                  </span>
                                )}
                              </div>
                              <div className="card-body">
                                <Link
                                  to={`/req/sprt/${item.sprtBizId}`}
                                  className="c-text"
                                >
                                  <p className="c-tit no-icon">
                                    <span className="span onellipsis-2">
                                      {item.sprtBizNm}
                                    </span>
                                  </p>
                                  <p className="c-txt onellipsis-2">
                                    {sprtBizOtln}
                                  </p>
                                </Link>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="more-btn">
                        <button
                          type="button"
                          className="krds-btn tertiary medium"
                          onClick={() => navigate('/req/sprt')}
                        >
                          지원사업 소개 더보기
                          <i className="svg-icon ico-angle right"></i>
                        </button>
                      </div>
                    </div>
                  )}
                  {serviceActiveIndex === 2 && (
                    <div className="service-tabcont">
                      <ul className="krds-structured-list row-4">
                        {certificateItems.map((item, index) => (
                          <li className="structured-item" key={index}>
                            <div className="card-top">
                              {item.elpblYn === 'Y' && (
                                <span className="krds-badge bg-light-primary">전자증명</span>
                              )}
                            </div>
                            <div className="card-body">
                              <div className="c-text">
                                <p className="c-tit no-icon no-link">
                                  <span className="span onellipsis-2">
                                    {item.prdocTtl}
                                  </span>
                                </p>
                                <p className="c-ico-txt">
                                  <i className="svg-icon ico-build"></i>{' '}
                                  {item.issuInstNm || item.jrsdInstNm}
                                </p>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  className="krds-btn secondary small full"
                                  onClick={() =>
                                    navigate(
                                      `/crtf/UI_USR_L_040/${item.prdocCd}`,
                                    )
                                  }
                                >
                                  발급받기
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="more-btn">
                        <button
                          type="button"
                          className="krds-btn tertiary medium"
                          onClick={() => navigate('/crtf/UI_USR_L_040')}
                        >
                          증명서 더보기
                          <i className="svg-icon ico-angle right"></i>
                        </button>
                      </div>
                    </div>
                  )}
                  {serviceActiveIndex === 3 && (
                    <div className="service-tabcont">
                      <div className="service-tabcont">
                        <ul className="krds-structured-list row-4">
                          {financePolicyItems.map((item, index) => (
                            <li className="structured-item" key={index}>
                              <div className="card-top">
                                {item.isHotGod == 'Y' && (
                                  <span className="krds-badge bg-light-point">
                                    인기
                                  </span>
                                )}
                                {item.isNewGod == 'Y' && (
                                  <span className="krds-badge bg-light-success">
                                    신규
                                  </span>
                                )}
                                {item.plcyFnncGdsTypeNm && (
                                  <span className="krds-badge">
                                    {item.plcyFnncGdsTypeNm}
                                  </span>
                                )}
                              </div>
                              <div className="card-body">
                                <Link
                                  to={`/req/plcy/UI_USR_L_030/${item.plcyFnncGdsSn}`}
                                  className="c-text"
                                >
                                  <p className="c-tit no-icon">
                                    <span className="span onellipsis-2">
                                      {item.plcyFnncGdsNm}
                                    </span>
                                  </p>
                                  <div className="c-etc">
                                    <p className="c-ico-txt">
                                      <i className="svg-icon ico-build"></i>{' '}
                                      {item.plcyFnncBizFlfmtInstNm}
                                    </p>
                                    <p className="c-ico-txt">
                                      <i className="svg-icon ico-circlecheck"></i>{' '}
                                      {item.plcyFnncSprtTrgtCn ||
                                        item.plcyFnncSprtLimSmryCn}
                                    </p>
                                  </div>
                                </Link>
                              </div>
                              <div className="card-btm no-border">
                                {(item.hashtags || '')
                                  .split(',')
                                  .map((tag) => tag.trim())
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((tag) => (
                                    <span className="tag" key={tag}>
                                      {tag}
                                    </span>
                                  ))}
                              </div>
                              <div className="card-btn">
                                <button
                                  type="button"
                                  className="krds-btn text"
                                  aria-label={`${item.plcyFnncGdsNm} 찜하기`}
                                  onClick={() => handleToggleLike3(index)}
                                >
                                  <i
                                    className={`svg-icon ico-like on-bgcolorgray ${likedPolicy[index] ? 'on' : ''}`}
                                  ></i>
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="more-btn">
                          <button
                            type="button"
                            className="krds-btn tertiary medium"
                            onClick={() => navigate('/req/plcy/UI_USR_L_030')}
                          >
                            정책금융 더보기
                            <i className="svg-icon ico-angle right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* S - 주요 소식 및 안내*/}
        <section className="main-section main-notice">
          <div className="contents-inner">
            <h2 className="section-tit">주요 소식 및 안내</h2>
            <div className="notice-wrap">
              <div className="notice-left">
                <div className="notice-tab">
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
                  <div className="notice-tab-conts">
                    {noticeActiveIndex === 0 && (
                      <div className="notice-tab-cont">
                        <ul className="board-list">
                          {noticeItems.map((item) => {
                            const target = resolveBoardTarget(
                              noticeListPath,
                              item,
                              true,
                            );
                            return (
                              <li
                                className="board-list-item"
                                key={String(item.pstNo)}
                              >
                                {target.kind === 'external' ? (
                                  <a
                                    href={target.href}
                                    className="board-list-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <span className="board-list-title onellipsis-1">
                                      {item.pstTtl}
                                    </span>
                                    <span className="board-list-date">
                                      {formatDate(
                                        item.pstgBgngYmd || item.pstRegDt,
                                      )}
                                    </span>
                                  </a>
                                ) : (
                                  <Link to={target.to} className="board-list-link">
                                    <span className="board-list-title onellipsis-1">
                                      {item.pstTtl}
                                    </span>
                                    <span className="board-list-date">
                                      {formatDate(
                                        item.pstgBgngYmd || item.pstRegDt,
                                      )}
                                    </span>
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        <button
                          type="button"
                          className="krds-btn medium text more"
                          aria-label="공지사항"
                          onClick={() => navigate(noticeListPath)}
                        >
                          더보기<i className="svg-icon ico-plus"></i>
                        </button>
                      </div>
                    )}
                    {noticeActiveIndex === 1 && (
                      <div className="notice-tab-cont">
                        <ul className="board-list faq">
                          {faqItems.map((item) => {
                            const target = resolveBoardTarget(
                              faqListPath,
                              item,
                              false,
                            );
                            return (
                              <li
                                className="board-list-item"
                                key={String(item.pstNo)}
                              >
                                {target.kind === 'external' ? (
                                  <a
                                    href={target.href}
                                    className="board-list-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {item.ctgryNm && (
                                      <span className="krds-badge bg-light-primary">
                                        {item.ctgryNm}
                                      </span>
                                    )}
                                    <span className="board-list-title onellipsis-1">
                                      {item.pstTtl}
                                    </span>
                                  </a>
                                ) : (
                                  <Link to={target.to} className="board-list-link">
                                    {item.ctgryNm && (
                                      <span className="krds-badge bg-light-primary">
                                        {item.ctgryNm}
                                      </span>
                                    )}
                                    <span className="board-list-title onellipsis-1">
                                      {item.pstTtl}
                                    </span>
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        <button
                          type="button"
                          className="krds-btn medium text more"
                          aria-label="자주찾는 질문"
                          onClick={() => navigate(faqListPath)}
                        >
                          더보기<i className="svg-icon ico-plus"></i>
                        </button>
                      </div>
                    )}
                    {noticeActiveIndex === 2 && (
                      <div className="notice-tab-cont">
                        <ul className="board-list">
                          {adminInfoItems.map((item) => {
                            const target = resolveBoardTarget(
                              adminInfoListPath,
                              item,
                              true,
                            );
                            return (
                              <li
                                className="board-list-item"
                                key={String(item.pstNo)}
                              >
                                {target.kind === 'external' ? (
                                  <a
                                    href={target.href}
                                    className="board-list-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {item.ctgryNm && (
                                      <span className="krds-badge bg-light-primary">
                                        {item.ctgryNm}
                                      </span>
                                    )}
                                    <span className="board-list-title onellipsis-1">
                                      {item.pstTtl}
                                    </span>
                                    <span className="board-list-date">
                                      {formatDateRange(
                                        item.pstgBgngYmd,
                                        item.pstgEndYmd,
                                      )}
                                    </span>
                                  </a>
                                ) : (
                                  <Link to={target.to} className="board-list-link">
                                    {item.ctgryNm && (
                                      <span className="krds-badge bg-light-primary">
                                        {item.ctgryNm}
                                      </span>
                                    )}
                                    <span className="board-list-title onellipsis-1">
                                      {item.pstTtl}
                                    </span>
                                    <span className="board-list-date">
                                      {formatDateRange(
                                        item.pstgBgngYmd,
                                        item.pstgEndYmd,
                                      )}
                                    </span>
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        <button
                          type="button"
                          className="krds-btn medium text more"
                          aria-label="행정정보"
                          onClick={() => navigate(adminInfoListPath)}
                        >
                          더보기<i className="svg-icon ico-plus"></i>
                        </button>
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
                    {bannerItems.map((item) => {
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
                                src={imageSrc || mainBanner}
                                alt={
                                  item.moblImgSbstPhrsCn ||
                                  item.imgFileSbstPhrsCn ||
                                  item.fallbackAlt ||
                                  item.bnrTtl ||
                                  '메인 배너'
                                }
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
            <button type="button" className="krds-btn primary">통합회원 가입하기</button>
          </div>
        </div>
      </div>
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
