import React, { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import Header from "../components/ui/Header.jsx";
import Footer from "../components/ui/Footer.jsx";
import mainIcon01 from "../assets/main/mainIcon_01.svg";
import mainIcon02 from "../assets/main/mainIcon_02.svg";
import mainIcon03 from "../assets/main/mainIcon_03.svg";
import mainIcon04 from "../assets/main/mainIcon_04.svg";
import mainIcon05 from "../assets/main/mainIcon_05.svg";
import mainIcon06 from "../assets/main/mainIcon_06.svg";

import certificateIcon01 from "../assets/main/certificate_icon_01.svg"
import certificateIcon02 from "../assets/main/certificate_icon_02.svg"
import certificateIcon03 from "../assets/main/certificate_icon_03.svg"
import certificateIcon04 from "../assets/main/certificate_icon_04.svg"
import certificateIcon05 from "../assets/main/certificate_icon_05.svg"
import certificateIcon06 from "../assets/main/certificate_icon_06.svg"

import newsBanner from "../assets/main/news_banner.jpg"
import newsCard1 from "../assets/main/news_cardnews.jpg"
import newsCard2 from "../assets/main/news_cardnews02.jpg"
import newsVideo from "../assets/main/news_video.jpg"

const MainPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // 검색어를 state로 전달하며 이동
      navigate(`/publishing/ai-smart-search`, { state: { q: searchQuery.trim() } });
    } else {
      navigate(`/publishing/ai-smart-search`);
    }
  };


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    const handleScroll = () => setIsFocused(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
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

  const showPopular = isFocused && searchQuery === "";
  const showAutoComplete = isFocused && searchQuery !== "";

  // 통합플랫폼 주요 메뉴
  const platformMenus = [
    {
      img: mainIcon03,
      title: "증명서 발급",
      sub: "각종 증명서 <br/>발급 및 출력",
    },
    {
      img: mainIcon04,
      title: "정책금융",
      sub: "금융정책상품 <br/>안내",
    },
    {
      img: mainIcon01,
      title: "사업공고",
      sub: "지원사업<br/>조회,신청"
    },
    {
      img: mainIcon05,
      title: "정책뉴스",
      sub: "각종<br/>행사정보 안내"
    },
    {
      img: mainIcon02,
      title: "행사정보",
      sub: "각종<br/>행사정보 안내"
    },
    {
      img: mainIcon06,
      title: "입법·행정예고/고시",
      sub: "법령,정책, 제도 등<br/>안내"
    },
  ]

  // news (배너존, 카드뉴스, 중기누리, 영상)
  // tab index
  const [newsActiveIndex, setNewsActiveIndex] = useState(0); //기본값 0 (배너존)
  
  const newsTabMenu = ["배너존", "카드뉴스", "중기누리", "영상"];
  
  // 탭별 데이터
  const newsData = {
    banner: [
      { id: 1, image: newsBanner, alt: '배너 1 이미지에 대한 내용이 들어갑니다.' },
      { id: 2, image: newsBanner, alt: '배너 2 이미지에 대한 내용이 들어갑니다.' },
      { id: 3, image: newsBanner, alt: '배너 3 이미지에 대한 내용이 들어갑니다.' },
    ],
    card: [
      { id: 1, image: newsCard1, alt: '카드뉴스 1 이미지에 대한 내용이 들어갑니다.' },
      { id: 2, image: newsCard1, alt: '카드뉴스 2 이미지에 대한 내용이 들어갑니다.' },
      { id: 3, image: newsCard1, alt: '카드뉴스 3 이미지에 대한 내용이 들어갑니다.' },
    ],
    noori: [
      { id: 1, image: newsCard2, alt: '중기누리 1 이미지에 대한 내용이 들어갑니다.' },
      { id: 2, image: newsCard2, alt: '중기누리 2 이미지에 대한 내용이 들어갑니다.' },
      { id: 3, image: newsCard2, alt: '중기누리 3 이미지에 대한 내용이 들어갑니다.' },
    ],
    video: [
      { id: 1, image: newsVideo, alt: '영상 1' },
      { id: 2, image: newsVideo, alt: '영상 2' },
      { id: 3, image: newsVideo, alt: '영상 3' },
    ],
  };

  // 증명서 발급 메뉴
  const certificateMenu = [
    {
      img: certificateIcon01,
      title: "벤처기업<br/>확인서 발급",
    },
    {
      img: certificateIcon02,
      title: "메인비즈<br/>확인서 발급",
    },
    {
      img: certificateIcon03,
      title: "중소기업(소상공인)<br/>확인서 발급",
    },
    {
      img: certificateIcon04,
      title: "이노비즈<br/>확인서 발급",
    },
    {
      img: certificateIcon05,
      title: "여성기업<br/>확인서 발급",
    },
    {
      img: certificateIcon06,
      title: "스마트공장수준<br/>확인서 발급",
    },
  ]

  // notice (공지사항, 자주하는 질문, 정책 뉴스)
  const [noticeActiveIndex, setNoticeActiveIndex] = useState(0); //기본값 0(공지사항)
  const noticeTabMenu = ["공지사항", "자주하는 질문", "정책뉴스", "행정뉴스"];

  return (
    <div id="wrap">
        <Header />{ /* 임시 해더 */}
        <div id="container" class="main-container">
          { /*컨텐츠 영역 */}

          {/* S - main-totallayout */}
          <div className="main-toplayout">
            <div className="main-top-inner">
              <div className="main-top-srch">
                <div
                  ref={containerRef}
                  className={`top-srch sch-input ${isFocused ? "is-focused" : ""}`}
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
                        <label className="sch-layer__toggle">
                          <input type="checkbox" defaultChecked />
                          <span className="sch-layer__toggle-ui"></span>
                          자동완성기능
                        </label>
                      </div>

                    </div>
                  )}
                </div>

                {/* 인기 검색어 */}
                <div className="main-top-keyword">
                  <h3>인기 검색어</h3>
                  <ul className="keyword-list">
                    <li><button type="button" className="word">소상공인지원</button></li>
                    <li><button type="button" className="word">초기창업</button></li>
                    <li><button type="button" className="word">창업지원포털</button></li>
                    <li><button type="button" className="word">지원사업공고</button></li>
                    <li><button type="button" className="word">AP소재정보</button></li>
                    <li><button type="button" className="word">맞춤서비스</button></li>
                  </ul>
                </div>
              </div>

              {/* S - 자주 찾는 서비스  */}
              <section className="main-totallistbox main-section">
                <div className="">
                  <h3 className="section-tit">자주 찾는 <br />서비스 </h3>
                  <div className="totallist-swiper">
                    <Swiper
                      breakpoints={{
                        320: {
                          enabled: true,
                          slidesPerView: 3.4,
                          spaceBetween: 20
                        },
                        768: {
                          enabled: true,
                          slidesPerView: 5,
                          spaceBetween: 0
                        },
                      }}
                      modules={[Navigation]}
                      navigation={{
                        prevEl: '.totallist-swiper .swiper-button-prev',
                        nextEl: '.totallist-swiper .swiper-button-next',
                      }}
                    >
                      {platformMenus.map((item, index) => (
                        <SwiperSlide key={index}>
                          <div className="mtlist">
                            <button type="button" className="mtlist-bu">
                              <span className="main-totalbox-img"><img src={item.img} alt="" /></span>
                              <span className="main-totalbox-tit">{item.title}</span>
                              <span className="main-totalbox-txt">
                                {item.sub.split('<br/>').map((line, i) => (
                                  <React.Fragment key={i}>
                                    {line}
                                    {i !== item.sub.split('<br/>').length - 1 && <br />}
                                  </React.Fragment>
                                ))}
                              </span>
                            </button>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    {/* navigation */}
                    <div className="swiper-nav-wrap mo-show">
                      <button type="button" className="swiper-button-prev"><span className="sr-only">이전</span></button>
                      <button type="button" className="swiper-button-next"><span className="sr-only">다음</span></button>
                    </div>
                  </div>
                </div>
              </section>
              {/*  E - 자주 찾는 서비스 */}
            </div>
          </div>
          {/* E - main-totallayout */}

          {/* S - main-newsbox */}
          <section className="main-newsbox">
						<div className="inner">
                        
							 <div className="newsbox-tab">
                  {/* tab 메뉴 -모바일용*/}
                  <ul className="round-tablist newsbox-tablist">
                    {newsTabMenu.map((menu, index) => (
                      <li 
                        key={index} 
                        className={`round-tab-menu ${newsActiveIndex === index ? 'is-active' : ''}`}
                      >
                        <button type="button" onClick={() => setNewsActiveIndex(index)}>
                          {menu}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="newsbox-tabconts">
                    {/* 배너존 */}
                    <div className={`newsbox-tabcont newsbox-banner ${newsActiveIndex !== 0 ? 'mobile-hidden' : ''}`}>
                      <div className="newsbox-swiper-header">
                        <h4 className="section-sub-tit">배너존</h4>
                        <div className="swiper-nav-wrap">
                          <button type="button" className="swiper-button-prev">
                            <span className="sr-only">이전</span>
                          </button>
                          <div className="swiper-pagination"></div>
                          <button type="button" className="swiper-button-next">
                            <span className="sr-only">다음</span>
                          </button>
                        </div>
                      </div>

                      <div className="newsbox-swiper">
                        <Swiper
                          breakpoints={{
                            360: {
                              enabled: true,
                              slidesPerView: 2,
                              spaceBetween: 20,
                            },
                            1025: {
                              slidesPerView: 1,
                              spaceBetween: 0,
                            }
                          }}
                          modules={[Navigation, Pagination]}
                          navigation={{
                            prevEl: '.newsbox-banner .swiper-button-prev',
                            nextEl: '.newsbox-banner .swiper-button-next',
                          }}
                          pagination={{
                            el: '.newsbox-banner .swiper-pagination', 
                            type: 'fraction',     
                            renderFraction: function (currentClass, totalClass) {
                              return `<span class="${currentClass}"></span> / <span class="${totalClass}"></span>`;
                            },
                          }}
                        >
                          {newsData.banner.map((item) => (
                            <SwiperSlide key={item.id}>
                              <Link to="#" className="newsbox-item-link">
                                <div className="news-img">
                                  <img src={item.image} alt={item.alt} />
                                </div>
                              </Link>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>

                    {/* 카드뉴스 */}
                    <div className={`newsbox-tabcont newsbox-card ${newsActiveIndex !== 1 ? 'mobile-hidden' : ''}`}>
                      <div className="newsbox-swiper-header">
                        <h4 className="section-sub-tit">카드뉴스</h4>
                        <div className="swiper-nav-wrap">
                          <button type="button" className="swiper-button-prev">
                            <span className="sr-only">이전</span>
                          </button>
                          <div className="swiper-pagination"></div>
                          <button type="button" className="swiper-button-next">
                            <span className="sr-only">다음</span>
                          </button>
                        </div>
                      </div>

                      <div className="newsbox-swiper">
                        <Swiper
                          breakpoints={{
                             360: {
                              enabled: true,
                              slidesPerView: 2,
                              spaceBetween: 20,
                            },
                            1025: {
                              slidesPerView: 1,
                              spaceBetween: 0,
                            }
                          }}
                          modules={[Navigation, Pagination]}
                          navigation={{
                            prevEl: '.newsbox-card .swiper-button-prev',
                            nextEl: '.newsbox-card .swiper-button-next',
                          }}
                          pagination={{
                            el: '.newsbox-card .swiper-pagination', 
                            type: 'fraction',     
                            renderFraction: function (currentClass, totalClass) {
                              return `<span class="${currentClass}"></span> / <span class="${totalClass}"></span>`;
                            },
                          }}
                        >
                          {newsData.card.map((item) => (
                            <SwiperSlide key={item.id}>
                              <Link to="#" className="newsbox-item-link">
                                <div className="news-img">
                                  <img src={item.image} alt={item.alt} />
                                </div>
                              </Link>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>

                    {/* 중기누리 */}
                    <div className={`newsbox-tabcont newsbox-noori ${newsActiveIndex !== 2 ? 'mobile-hidden' : ''}`}>
                      <div className="newsbox-swiper-header">
                        <h4 className="section-sub-tit">중기누리</h4>
                        <div className="swiper-nav-wrap">
                          <button type="button" className="swiper-button-prev">
                            <span className="sr-only">이전</span>
                          </button>
                          <div className="swiper-pagination"></div>
                          <button type="button" className="swiper-button-next">
                            <span className="sr-only">다음</span>
                          </button>
                        </div>
                      </div>

                      <div className="newsbox-swiper">
                        <Swiper
                          breakpoints={{
                             360: {
                              enabled: true,
                              slidesPerView: 2,
                              spaceBetween: 20,
                            },
                            1025: {
                              slidesPerView: 1,
                              spaceBetween: 0,
                            }
                          }}
                          modules={[Navigation, Pagination]}
                          navigation={{
                            prevEl: '.newsbox-noori .swiper-button-prev',
                            nextEl: '.newsbox-noori .swiper-button-next',
                          }}
                          pagination={{
                            el: '.newsbox-noori .swiper-pagination', 
                            type: 'fraction',     
                            renderFraction: function (currentClass, totalClass) {
                              return `<span class="${currentClass}"></span> / <span class="${totalClass}"></span>`;
                            },
                          }}
                        >
                          {newsData.noori.map((item) => (
                            <SwiperSlide key={item.id}>
                              <Link to="#" className="newsbox-item-link">
                                <div className="news-img">
                                  <img src={item.image} alt={item.alt} />
                                </div>
                              </Link>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>

                    {/* 영상 */}
                    <div className={`newsbox-tabcont newsbox-video ${newsActiveIndex !== 3 ? 'mobile-hidden' : ''}`}>
                      <div className="newsbox-swiper-header">
                        <h4 className="section-sub-tit">영상</h4>
                        <div className="swiper-nav-wrap">
                          <button type="button" className="swiper-button-prev">
                            <span className="sr-only">이전</span>
                          </button>
                          <div className="swiper-pagination"></div>
                          <button type="button" className="swiper-button-next">
                            <span className="sr-only">다음</span>
                          </button>
                        </div>
                      </div>

                      <div className="newsbox-swiper">
                        <Swiper
                          breakpoints={{
                            360: {
                              enabled: true,
                              slidesPerView: 2,
                              spaceBetween: 20,
                            },
                            768: {
                              slidesPerView: 1,
                              spaceBetween: 0,
                            }
                          }}
                          modules={[Navigation, Pagination]}
                          navigation={{
                            prevEl: '.newsbox-video .swiper-button-prev',
                            nextEl: '.newsbox-video .swiper-button-next',
                          }}
                          pagination={{
                            el: '.newsbox-video .swiper-pagination', 
                            type: 'fraction',     
                            renderFraction: function (currentClass, totalClass) {
                              return `<span class="${currentClass}"></span> / <span class="${totalClass}"></span>`;
                            },
                          }}
                        >
                          {newsData.video.map((item) => (
                            <SwiperSlide key={item.id}>
                              <Link to="#" className="newsbox-item-link">
                                <div className="news-img video-img">
                                  <img src={item.image} alt={item.alt} />
                                </div>
                              </Link>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>
                  </div>
                  {/* newsbox-tabconts */}
                </div>
                {/* newsbox-tab */}
						</div>
          </section>
          {/* E - main-newsebox */}

          {/* S - main-quickbox */}
          <section className="main-quickbox main-section">
            <div className="inner">
              <h3 className="section-tit">증명서 발급<span className="sub-text">자주 발급하는 증명서</span></h3>
              <div className="quickbox-swiper">
                <Swiper
                  breakpoints={{
                    360: {
                      enabled: true,
                      slidesPerView: 2,
                    },
                    768: {
                      enabled: true,
                      slidesPerView: 4,
                    },
                    1200: {
                      enabled: false,
                      slidesPerView: 6,
                    }
                  }}
                  modules={[Navigation, Pagination]}
                  navigation={{
                    prevEl: '.main-quickbox .swiper-button-prev',
                    nextEl: '.main-quickbox .swiper-button-next',
                  }}
                  pagination={{
                    el: '.main-quickbox .swiper-pagination', 
                    type: 'fraction',     
                    renderFraction: function (currentClass, totalClass) {
                      return `<span class="${currentClass}"></span> / <span class="${totalClass}"></span>`;
                    },
                  }}
                >
                  {certificateMenu.map((item, index) => (
                    <SwiperSlide key={index}>
                        <div className="icon-rowmenu">
                          <button type="button" className="icon-rowmenu-link">
                            <span className="icon-rowmenu-img">
                              <img src={item.img} alt="" />
                            </span>
                            <span className="icon-rowmenu-tit">
                              {item.title.split('<br/>').map((line, i) => (
                                <React.Fragment key={i}>
                                  {line}
                                  {i !== item.title.split('<br/>').length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </span>
                          </button>
                        </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                {/* navigation */}
                <div className="swiper-nav-wrap mo-show">
                  <button type="button" className="swiper-button-prev"><span className="sr-only">이전</span></button>
                  <div className="swiper-pagination"></div>
                  <button type="button" className="swiper-button-next"><span className="sr-only">다음</span></button>
                </div>
              </div>
            </div>
          </section>
          {/* E - main-quickbox */}

          {/* S - main-notice */}
          <section className="main-notice">
            <div className="inner">
              <div className="notice-wrap">
                {/* 공지사항 tab */}
                <div className="notice-left">
                  <div className="notice-tab">
                    <div className="notice-tablist-wrap">
                      <ul className="round-tablist notice-tablist">
                        {noticeTabMenu.map((menu, index) => (
                          <li 
                            key={index} 
                            className={`round-tab-menu ${noticeActiveIndex === index ? 'is-active' : ''}`}
                          >
                            <button type="button" onClick={() => setNoticeActiveIndex(index)}>
                              {menu}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="notice-tab-conts">
                      {/* 공지사항 */}
                      {noticeActiveIndex === 0 &&  (
                        <div className="notice-tab-cont">
                          <ul className="board-list">
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link ">
                                <span className="board-list-title onellipsis-1">시스템 점검에 따른 안내</span>
                                <span className="board-list-date">2025-04-16</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">지능형 분석 서비스 모델 발굴 공모전 심사결과 안내</span>
                                <span className="board-list-date">2025-04-16</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">시스템 점검에 따른 안내</span>
                                <span className="board-list-date">2025-04-16</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">UI/UX개선을 위한 시스템 점검 안내</span>
                                <span className="board-list-date">2025-04-16</span>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      )}
                      {/* 자주하는 질문 */}
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
                        </div>
                      )}
                      {/* 정책뉴스 */}
                      {noticeActiveIndex === 2 &&  (
                        <div className="notice-tab-cont">
                          <ul className="board-list">
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">정책뉴스 시스템 점검에 따른 안내</span>
                                <span className="board-list-date">2025-04-16</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">지능형 분석 서비스 모델 발굴 공모전 심사결과 안내</span>
                                <span className="board-list-date">2025-04-16</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">시스템 점검에 따른 안내</span>
                                <span className="board-list-date">2025-04-16</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">UI/UX개선을 위한 시스템 점검 안내</span>
                                <span className="board-list-date">2025-04-16</span>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      )}
                      {/* 행정뉴스 */}
                      {noticeActiveIndex === 3 &&  (
                        <div className="notice-tab-cont">
                          <ul className="board-list">
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">행정뉴스 시스템 점검에 따른 안내</span>
                                <span className="board-list-date">2025-04-16</span>
                              </Link>
                            </li>
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">지능형 분석 서비스 모델 발굴 공모전 심사결과 안내</span>
                                <span className="board-list-date">2025-04-16</span>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 지원사업 공고, 행사정보  */}
                <div className="notice-right">
                  <div className="info-card blue">
                    <h4 className="info-card-title">지원사업 공고</h4>
                    <ul className="info-card-list">
                      <li className="info-card-item">
                        <Link to="#" className="info-card-link">
                          <span className="info-card-label">진행중인 공고</span>
                          <div className="info-card-count">
                            <strong >23421</strong>건
                          </div>
                        </Link>
                      </li>
                      <li className="info-card-item">
                        <Link to="#" className="info-card-link">
                          <span className="info-card-label">최신공고</span>
                          <div className="info-card-count">
                            <strong >23421</strong>건
                          </div>
                        </Link>
                      </li>
                      <li className="info-card-item">
                        <Link to="#" className="info-card-link">
                          <span className="info-card-label">마감임박</span>
                          <div className="info-card-count">
                            <strong >23421</strong>건
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="event-info">
                    <div className="info-card purple">
                      <h4 className="info-card-title">행사정보</h4>
                      <ul className="info-card-list">
                        <li className="info-card-item">
                          <Link to="#" className="info-card-link">
                            <span className="info-card-label">최신정책뉴스</span>
                            <div className="info-card-count">
                              <strong >22</strong>건
                            </div>
                          </Link>
                        </li>
                        <li className="info-card-item">
                          <Link to="#" className="info-card-link">
                            <span className="info-card-label">입법·행정예고/고시</span>
                            <div className="info-card-count">
                              <strong >34</strong>건
                            </div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="option-link-wrap">
                      <Link to="#" className="option-link">
                        2026년 <br />중기지원사업
                        <i className="svg-icon ico-angle right"></i>
                      </Link>
                      <Link to="#" className="option-link">
                        테마별 <br />정책정보웹진
                        <i className="svg-icon ico-angle right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* E - main-notice */}

          { /*컨텐츠 영역 */}
        </div>
        <Footer />{ /* 임시 푸터 */}
      </div>
  );
};

export default MainPage;
