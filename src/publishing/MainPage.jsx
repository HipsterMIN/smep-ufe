import React, { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import Header from "../components/ui/Header.jsx";
import Footer from "../components/ui/Footer.jsx";
import mainIcon01 from "../assets/main/mainIcon_01.svg";
import mainIcon02 from "../assets/main/mainIcon_02.svg";
import mainIcon03 from "../assets/main/mainIcon_03.svg";
import mainIcon04 from "../assets/main/mainIcon_04.svg";
import mainIcon05 from "../assets/main/mainIcon_05.svg";
import mainIcon06 from "../assets/main/mainIcon_06.svg";
import mainIcon07 from "../assets/main/mainIcon_07.svg";
import mainBanner from "../assets/temp/main_banner_1.png"

const MainPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [isFocused, setIsFocused] = useState(false); //검색바 focus
  const srchInputRef = useRef(null);

  // 인기 검색어, 자동 완성 layer
  const showPopular = isFocused && searchQuery === "";
  const showAutoComplete = isFocused && searchQuery !== "";
  
  // 검색바 상단 fixed
  const searchBarRef = useRef(null); // 검색바 ref
  const originTopRef = useRef(0); // 원래 위치 고정 저장

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // 검색어를 state로 전달하며 이동
      navigate(`/publishing/ai-smart-search`, { state: { q: searchQuery.trim() } });
    } else {
      navigate(`/publishing/ai-smart-search`);
    }
  };

  // 상단 검색 바 레이어 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (srchInputRef.current && !srchInputRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    const handleScroll = () => setIsFocused(false);

    document.addEventListener("mousedown", handleClickOutside);
    // window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchQuery("");
  };

  useEffect(() => {
    const saveOriginTop = () => {
      if (!searchBarRef.current) return;
      
      // 측정 전 is-fixed 잠깐 제거
      searchBarRef.current.classList.remove('is-fixed');

      const headerHeight = document.querySelector('#krds-header')?.offsetHeight || 0;

      originTopRef.current = searchBarRef.current.getBoundingClientRect().top + window.scrollY - headerHeight;
      

      // 제거했으니 현재 스크롤 상태에 맞게 다시 적용
      const isFixed = window.scrollY >= originTopRef.current + headerHeight;
      searchBarRef.current.classList.toggle('is-fixed', isFixed);
    };

    saveOriginTop();

    window.addEventListener('resize', saveOriginTop);
    return () => window.removeEventListener('resize', saveOriginTop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!searchBarRef.current) return;

      const headerHeight = document.querySelector('#krds-header')?.offsetHeight || 0;
      const isFixed = window.scrollY >= originTopRef.current + headerHeight;

      searchBarRef.current.classList.toggle('is-fixed', isFixed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 자주 찾는 서비스 메뉴 - 슬라이드 처음, 끝 파악
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const platformMenus = [
    {
      img: mainIcon01,
      title: (
        <>
          신청 가능한 <br/>
          사업공고 찾기
        </>
      ),
    },
    {
      img: mainIcon07,
      title: (
        <>
          중소벤처기업부<br/> 
          지원사업 보기
        </>
      )
    },
    {
      img: mainIcon04,
      title: (
        <>
          융자 보증 보험 <br/>
          정책 금융상품 찾기
        </>
      )
    },
    {
      img: mainIcon03,
      title: (
        <>
          중소기업 <span className="mo-hide">(소상공인)</span>
          확인서 발급하기
        </>
      )
    },
    {
      img: mainIcon03,
      title: (
        <>
          직접생산확인 <br /> 증명서 발급하기
        </>
      ),
    },
    {
      img: mainIcon06,
      title: "입법·행정예고/고시",
    },
  ]
  

  //지금 이용 가능한 서비스 Tab
  const [serviceActiveIndex, setServiceActiveIndex] = useState(0); //기본값 0 (사업공고)
  const serviceTabMenu = ["사업공고", "지원사업 소개", "증명서 발급", "정책금융"];

  // notice (공지사항, 자주하는 질문, 정책 뉴스)
  const [noticeActiveIndex, setNoticeActiveIndex] = useState(0); //기본값 0(공지사항)
  const noticeTabMenu = ["공지사항", "자주찾는 질문", "행정정보"];

  // 지금 이용 가능한 서비스 - 사업공고 좋아요 버튼
  const [likedAnnounce, setLikedAnnounce] = useState({});
  // 지금 이용 가능한 서비스 - 지원사업 소개 좋아요 버튼
  const [likedBusiness, setLikedBusiness] = useState({});
  // 지금 이용 가능한 서비스 - 정책금융 좋아요 버튼
  const [likedPolicy, setLikedPolicy] = useState({});
  
  // 지금 이용 가능한 서비스 - 사업공고 좋아요 toggle
  const handleToggleLike1 = (index) => {
    setLikedAnnounce(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  // 지금 이용 가능한 서비스 - 사업공고 좋아요 toggle
  const handleToggleLike2 = (index) => {
    setLikedBusiness(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  // 지금 이용 가능한 서비스 - 사업공고 좋아요 toggle
  const handleToggleLike3 = (index) => {
    setLikedPolicy(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // 주요 소식 및 안내
  const [isPlaying, setIsPlaying] = useState(true);
  const swiperRef = useRef(null);

  const toggleAutoplay = () => {
    if (!swiperRef.current) return;
    if (isPlaying) {
      swiperRef.current.autoplay.stop();
    } else {
      swiperRef.current.autoplay.start();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div id="wrap">
        <Header />{ /* 임시 해더 */}
        <div id="container"  class="main-container">
          { /*컨텐츠 영역 */}

          {/* S - main-totallayout */}
          <div className="main-toplayout">
            <div className="main-top-inner">
              <div className="main-top-srch" ref={searchBarRef}>
                <div
                  ref={srchInputRef}
                  className={`top-srch sch-input ${isFocused ? "is-focused" : ""}`}
                  >
                  <div className="sch-input-box">
                    {/* 웹접근성 반영  title*/}
                    <input 
                      type="text" 
                      title="통합검색" 
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
                          spaceBetween: 8
                        },
                        768: {
                          enabled: true,
                          slidesPerView: 5,
                          spaceBetween: 50
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
                            <button type="button">
                              <span className="quick-menu-img"><img src={item.img} alt="" /></span>
                              <span className="quick-menu-tit">{item.title}</span>
                            </button>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    {/* navigation */}
                    <div className="swiper-nav-wrap">
                        <button type="button" className={`swiper-button-prev ${isBeginning && "hide"}`}><span className="sr-only">이전</span></button>
                        <button type="button" className={`swiper-button-next ${isEnd && "hide"}`}><span className="sr-only">다음</span></button>
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
                          <button type="button" className="krds-btn medium text" onClick={() => setServiceActiveIndex(index)}>
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
                          {Array.from({ length: 8 }).map((_, index) => (
                            <li className="structured-item" key={index}>
                              <div className="card-top">
                                <span className="krds-badge bg-point number">D-10</span> {/* D-10 이하일때 class명 bg-point */}
                                <span className="krds-badge bg-primary number">D-402</span> {/* D-10 초과일때 class명 bg-primary */}
                                <span className="krds-badge bg-light-primary">인기</span>
                                <span className="krds-badge">경영</span>
                              </div>
                              <div className="card-body">
                                <a href="#" className="c-text">
                                  <p className="c-tit no-icon"><span className="span onellipsis-2">2026년 소공인 복합지원센터 구축ㆍ운영사업 본공모</span></p>
                                  <div className="c-etc">
                                    <p className="c-ico-txt">
                                      {/* 웹접근성 반영 */}
                                      <i className="svg-icon ico-build"></i> <span className="sr-only">기관</span> 한국산업기술기획평가원
                                    </p>
                                    <p className="c-ico-txt">
                                      <i className="svg-icon ico-calendar"></i> 2026.01.19 ~ 2026.02.12  
                                    </p>
                                  </div>
                                </a>
                              </div> 
                              <div className="card-btn">
                                <button type="button" className="krds-btn text" aria-label="2026년 중소벤처기업부 소상공인 지원사업 통합 공고 찜하기" onClick={() => handleToggleLike1(index)}> <i className={`svg-icon ico-like on-bgcolorgray ${likedAnnounce[index] ? 'on' : ''}`}></i></button>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="more-btn">
                          <button type="button" className="krds-btn tertiary medium">사업공고 더보기 <i className="svg-icon ico-angle right"></i></button>
                        </div>
                      </div>
                    )}
                    {/* 지원사업 소개 */}
                    {serviceActiveIndex === 1 &&  (
                      <div className="service-tabcont">
                        <ul className="krds-structured-list row-4">
                          {Array.from({ length: 8 }).map((_, index) => (
                            <li className="structured-item" key={index}>
                              <div className="card-top">
                                <span className="krds-badge bg-light-primary">경영</span>
                              </div>
                              <div className="card-body">
                                <a href="#" className="c-text">
                                  <p className="c-tit no-icon"><span className="span onellipsis-2">2026년 소공인 복합지원센터 구축ㆍ운영사업 본공모</span></p>
                                  <p className="c-txt onellipsis-2">
                                    소공인 집적지 활성화와 혁신성장 기반 조성을 위한「2026년 소공인 복합지원센터 구축ㆍ운영사업 본공모」를 다음과 같이 공고하오니 참여하고자 하는 지방자치단체는 공고문에 따라 신청하시기 바랍니다.
                                  </p>
                                </a>
                              </div>
                              <div className="card-btn">
                                <button type="button" className="krds-btn text" aria-label="2026년 소공인 복합지원센터 구축ㆍ운영사업 본공모  찜하기" onClick={() => handleToggleLike2(index)}> <i className={`svg-icon ico-like on-bgcolorgray ${likedBusiness[index] ? 'on' : ''}`}></i></button>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="more-btn">
                          <button type="button" className="krds-btn tertiary medium">지원사업 소개 더보기 <i className="svg-icon ico-angle right"></i></button>
                        </div>
                      </div>
                    )}
                    {/* 증명서 발급 */}
                    {serviceActiveIndex === 2 &&  (
                      <div className="service-tabcont">
                          <ul className="krds-structured-list row-4">
                          {Array.from({ length: 8 }).map((_, index) => (
                            <li className="structured-item" key={index}>
                              <div className="card-top">
                                <span className="krds-badge bg-light-primary">전자증명</span>
                              </div>
                              <div className="card-body">
                                <div className="c-text">
                                  <p className="c-tit no-icon no-link"><span className="span onellipsis-2">벤처기업확인서</span></p>
                                  <p className="c-ico-txt">
                                    {/* 웹접근성 반영 */}
                                    <i className="svg-icon ico-build"></i><span className="sr-only">기관</span> 중소벤처기업진흥공단
                                  </p>
                                </div>
                                <div>
                                  <button type="button" className="krds-btn secondary small full">발급받기</button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="more-btn">
                          <button type="button" className="krds-btn tertiary medium">증명서발급 더보기 <i className="svg-icon ico-angle right"></i></button>
                        </div>
                      </div> 
                    )}
                    {/* 정책금융 */}
                    {serviceActiveIndex === 3 &&  (
                      <div className="service-tabcont">
                        <div className="service-tabcont">
                          <ul className="krds-structured-list row-4">
                            {Array.from({ length: 8 }).map((_, index) => (
                              <li className="structured-item" key={index}>
                                <div className="card-top">
                                  <span className="krds-badge bg-light-point">인기</span>
                                  {/* 신규 badge case : class명 다름 (bg-light-success) */}
                                  {/* <span className="krds-badge bg-light-success">신규</span> */}
                                  <span className="krds-badge">융자</span>
                                </div>
                                <div className="card-body">
                                  <a href="#" className="c-text">
                                    <p className="c-tit no-icon"><span className="span onellipsis-2">해외사업자금</span></p>
                                    <div className="c-etc">
                                      <p className="c-ico-txt">
                                        {/* 웹접근성 반영 */}
                                        <i className="svg-icon ico-build"></i><span className="sr-only">기관</span> 한국산업기술기획평가원
                                      </p>
                                      <p className="c-ico-txt">
                                        <i className="svg-icon ico-circlecheck"></i> 업력 7년이상 중소기업
                                    </p>
                                    </div>
                                  </a>
                                </div>
                                <div className="card-btm no-border">
                                  <span className="tag">무역보험공사</span>
                                  <span className="tag">정책자금</span>
                                </div>
                                <div className="card-btn">
                                  <button type="button" className="krds-btn text" aria-label="해외사업자금 찜하기" onClick={() => handleToggleLike3(index)}> <i className={`svg-icon ico-like on-bgcolorgray ${likedPolicy[index] ? 'on' : ''}`}></i></button>
                                </div>
                              </li>
                            ))}
                          </ul>
                          <div className="more-btn">
                            <button type="button" className="krds-btn tertiary medium">정책금융 더보기 <i className="svg-icon ico-angle right"></i></button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </section>
              {/*  E - 지금 이용 가능한 서비스 */}

            </div>
          </div>
          {/* E - main-totallayout */}

          {/* S - 주요 소식 및 안내*/}
          <section className="main-section main-notice">
            <div className="contents-inner">
              <h2 className="section-tit">주요 소식 및 안내</h2>
              <div className="notice-wrap">
                {/* 공지사항 tab */}
                <div className="notice-left">
                  <div className="notice-tab">
                    <ul className="tablist notice-tablist">
                      {noticeTabMenu.map((menu, index) => (
                        <li 
                          key={index} 
                          className={`round-tab-menu ${noticeActiveIndex === index ? 'is-active' : ''}`}
                        >
                          <button type="button" className="krds-btn medium text" onClick={() => setNoticeActiveIndex(index)}>
                            {menu}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="notice-tab-conts">
                      {/* 공지사항 */}
                      {noticeActiveIndex === 0 &&  (
                        <div className="notice-tab-cont">
                          <ul className="board-list">
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">시스템 점검에 따른 안내</span>
                                <span className="board-list-date">2026.01.19</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">지능형 분석 서비스 모델 발굴 공모전 심사결과 안내</span>
                                <span className="board-list-date">2026.01.19</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">시스템 점검에 따른 안내</span>
                                <span className="board-list-date">2026.01.19</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">UI/UX개선을 위한 시스템 점검 안내</span>
                                <span className="board-list-date">2026.01.19</span>
                              </Link>
                            </li>
                          </ul>
                          <button type="button" className="krds-btn medium text more" aria-label="공지사항">더보기<i className="svg-icon ico-plus"></i></button>
                        </div>
                      )}
                      {/* 자주찾는 질문 */}
                      {noticeActiveIndex === 1 &&  (
                        <div className="notice-tab-cont">
                          <ul className="board-list faq">
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="krds-badge bg-light-primary">거래 공정화</span>
                                <span className="board-list-title onellipsis-1">대기업이 중소기업에 물품의 판매를 위탁하는 경우에도 수위탁거래에 해당하나요?</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="krds-badge bg-light-primary">경영혁신 마일리지 제도</span>
                                <span className="board-list-title onellipsis-1">마일리지를 활용하여 사업신청을 했지만 지원대상이 되지 못하면(탈락하면) 사용한 마일리지는 어떻게 되나요?</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="krds-badge bg-light-primary">거래 공정화</span>
                                <span className="board-list-title onellipsis-1">대기업이 중소기업에 물품의 판매를 위탁하는 경우에도 수위탁거래에 해당하나요?</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="krds-badge bg-light-primary">거래 공정화</span>
                                <span className="board-list-title onellipsis-1">대기업이 중소기업에 물품의 판매를 위탁하는 경우에도 수위탁거래에 해당하나요?</span>
                              </Link>
                            </li>
                          </ul>
                          <button type="button" className="krds-btn medium text more" aria-label="자주찾는 질문">더보기<i className="svg-icon ico-plus"></i></button>
                        </div>
                      )}
                      {/* 행사정보 */}
                      {noticeActiveIndex === 2 &&  (
                        <div className="notice-tab-cont">
                          <ul className="board-list">
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="krds-badge bg-light-primary">부산</span>
                                <span className="board-list-title onellipsis-1">행정뉴스 시스템 점검에 따른 안내</span>
                                <span className="board-list-date">2026-03-04 ~ 2026-03-04</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="krds-badge bg-light-primary">광주</span>
                                <span className="board-list-title onellipsis-1">지능형 분석 서비스 모델 발굴 공모전 심사결과 안내</span>
                                <span className="board-list-date">2026-03-04 ~ 2026-03-04</span>
                              </Link>
                            </li>
                          </ul>
                          <button type="button" className="krds-btn medium text more" aria-label="행사정보">더보기<i className="svg-icon ico-plus"></i></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 지원사업 공고, 행사정보  */}
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
                      onSwiper={(swiper) => (swiperRef.current = swiper)}
                    >
                      <SwiperSlide>
                        <div className="main-banner-item">
                          <Link to="#" className="main-banner-link">
                            <img src={mainBanner} alt="중소벤처 24. 2026년 중소벤처기업부 지원사업 안내. 이제 중소벤처24에서 한 번에 조회하세요." />
                          </Link>
                        </div>
                      </SwiperSlide>
                      <SwiperSlide>
                        <div className="main-banner-item">
                          <Link to="#" className="main-banner-link">
                            <img src={mainBanner} alt="중소벤처 24. 2026년 중소벤처기업부 지원사업 안내. 이제 중소벤처24에서 한 번에 조회하세요." />
                          </Link>
                        </div>
                      </SwiperSlide>
                    </Swiper>
                    {/* navigation */}
                    <div className="swiper-nav-wrap">
                      {/* 페이지네이션 */}
                      <div className="swiper-pagination" aria-live="polite"></div>

                      {/* 시작/정지 */}
                      <button
                        type="button"
                        className={`swiper-autoplay-toggle ${isPlaying ? "play" : "stop"}`}
                        onClick={toggleAutoplay}
                        aria-label={isPlaying ? "슬라이드 정지" : "슬라이드 시작"}
                        aria-pressed={!isPlaying}
                      >
                        <span className="sr-only">{isPlaying ? "정지" : "시작"}</span>
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
          {/* E - main-notice */}

          <div className="main-btm-bar">
            <div className="contents-inner">
              <p className="title">68개 중소기업 유관 시스템을 하나의 통합 ID로 이용할 수 있습니다</p>
              <button type="button" className="krds-btn primary">통합회원 가입하기</button>
            </div>
          </div>

          { /*컨텐츠 영역 */}
        </div>
        <Footer />{ /* 임시 푸터 */}
      </div>
  );
};

export default MainPage;
