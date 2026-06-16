import React, { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Header from "@components/ui/Header.jsx";
import Footer from "@components/ui/Footer.jsx";

import '@styles/main.scss';


import mainBanner01 from "../assets/main/new/main-banner-01.png"
import mainBanner02 from "../assets/main/new/main-banner-02.png"
import mainIcon01 from "../assets/main/new/mainIcon_01.svg";
import mainIcon02 from "../assets/main/new/mainIcon_02.svg";
import mainIcon03 from "../assets/main/new/mainIcon_03.svg";
import mainIcon04 from "../assets/main/new/mainIcon_04.svg";
import mainIcon05 from "../assets/main/new/mainIcon_05.svg";
import mainIcon06 from "../assets/main/mainIcon_06.svg";
import mainIcon07 from "../assets/main/mainIcon_07.svg";
import cardNews01 from "../assets/main/new/card-news-01.png";
import bannerLine from "../assets/main/new/banner-support-biz.png";
import bannerLineM from "../assets/main/new/banner-support-biz-m.png";

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
  const [isSearchFixed, setIsSearchFixed] = useState(false);

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
    const fixedPoint = 120;

    const getScrollTop = () => {
        const container = document.querySelector("#container");

        return (
            window.scrollY ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            container?.scrollTop ||
            0
        );
    };

    const handleScroll = () => {
        setIsSearchFixed(getScrollTop() > fixedPoint);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, true);

    return () => {
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("scroll", handleScroll, true);
    };
}, []);


  // 자주 찾는 서비스 메뉴 - 슬라이드 처음, 끝 파악
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const platformMenus = [
    {
      img: mainIcon01,
      title: (
        <>
          사업공고 찾기
        </>
      ),
    },
    {
      img: mainIcon02,
      title: (
        <>
          증명서 발급
        </>
      )
    },
    {
      img: mainIcon03,
      title: (
        <>
          정책뉴스
        </>
      )
    },
    {
      img: mainIcon04,
      title: (
        <>
          정책금융상품
        </>
      )
    },
    {
      img: mainIcon05,
      title: (
        <>
          행사정보
        </>
      ),
    },
    {
      img: mainIcon06,
      title: "입법·행정예고/고시",
    },
  ]
  

    //지금 이용 가능한 서비스 Tab
    const supportData = {
        central: [
            {
                title: '창업',
                cards: [
                    {
                        badge: '중기부',
                        category: '창업',
                        deadline: false,
                        status: '접수중',
                        title: '[경북] 울진군 2026년 2차 블루(blue)푸드 산업 활성화 지원사업 기업지원 프로그램 참여기업 모집 공고',
                        date: '2026.05.13. ~ 2026.05.27.',
                        dday: 'D-11',
                        agency: '중소벤처기업부',
                        region: '경북테크노파크',
                        desc: '2026년도 중소벤처기업부 경상북도 및 울진군이 지원하는 신규 국고산업육성형 협업 프로젝트의 수행자로 선정된 수행기관별 지원 프로그램을 안내하오니, 해당 프로그램 참여를 희망하는 울진군 지역 중소기업의 많은 신청 바랍니다.',
                        target: '경북 내 블루푸드 관련 지역기업 중 해당 지원을 필요로 하는 기업',
                        detailHref: '#',
                        liked: true,
                    },
                    {
                        badge: '중기부',
                        category: '창업',
                        deadline: false,
                        status: '접수중',
                        title: '[경북] 울진군 2026년 2차 블루(blue)푸드 산업 활성화 지원사업 기업지원 프로그램 참여기업 모집 공고',
                        date: '2026.05.13. ~ 2026.05.27.',
                        dday: 'D-11',
                        agency: '중소벤처기업부',
                        region: '경북테크노파크',
                        desc: '2026년도 중소벤처기업부 경상북도 및 울진군이 지원하는 신규 국고산업육성형 협업 프로젝트의 수행자로 선정된 수행기관별 지원 프로그램을 안내하오니, 해당 프로그램 참여를 희망하는 울진군 지역 중소기업의 많은 신청 바랍니다.',
                        target: '경북 내 블루푸드 관련 지역기업 중 해당 지원을 필요로 하는 기업',
                        detailHref: '#',
                        liked: false,
                    },
                ],
            },
            {
                title: '정책자금',
                cards: [
                    {
                        badge: '중기부',
                        category: '금융',
                        deadline: true,
                        title: '2026년 소상공인 투자연계 지원사업 립스(LIPS) 프로그램 소상공...',
                        date: '2026.05.06. ~ 2026.05.17',
                        dday: 'D-3',
                        agency: '중소벤처기업부',
                        region: '경북테크노파크',
                        desc: '2026년도 중소벤처기업부 경상북도 및 울진군이 지원하는 신규 국고산업육성형 협업 프로젝트의 수행자로 선정된 수행기관별 지원 프로그램을 안내하오니, 해당 프로그램 참여를 희망하는 울진군 지역 중소기업의 많은 신청 바랍니다.',
                        target: '경북 내 블루푸드 관련 지역기업 중 해당 지원을 필요로 하는 기업',
                        detailHref: '#',
                        liked: false,
                    },
                    {
                        badge: '중기부',
                        category: '금융',
                        deadline: true,
                        title: '2026년 소상공인 투자연계 지원사업 립스(LIPS) 프로그램 소상공...',
                        date: '2026.05.06. ~ 2026.05.17',
                        dday: 'D-3',
                        agency: '중소벤처기업부',
                        region: '경북테크노파크',
                        desc: '2026년도 중소벤처기업부 경상북도 및 울진군이 지원하는 신규 국고산업육성형 협업 프로젝트의 수행자로 선정된 수행기관별 지원 프로그램을 안내하오니, 해당 프로그램 참여를 희망하는 울진군 지역 중소기업의 많은 신청 바랍니다.',
                        target: '경북 내 블루푸드 관련 지역기업 중 해당 지원을 필요로 하는 기업',
                        detailHref: '#',
                        liked: false,
                    },
                ],
            },
            {
                title: 'R&D',
                cards: [
                    {
                        badge: '중기부',
                        category: '기술',
                        title: '[경북] 경주시 2026년 2차 e-모빌리티산업 생태계 고도화...',
                        date: '2026.05.13. ~ 2026.05.26',
                        dday: 'D-12',
                        agency: '중소벤처기업부',
                        region: '경북테크노파크',
                        desc: '2026년도 중소벤처기업부 경상북도 및 울진군이 지원하는 신규 국고산업육성형 협업 프로젝트의 수행자로 선정된 수행기관별 지원 프로그램을 안내하오니, 해당 프로그램 참여를 희망하는 울진군 지역 중소기업의 많은 신청 바랍니다.',
                        target: '경북 내 블루푸드 관련 지역기업 중 해당 지원을 필요로 하는 기업',
                        detailHref: '#',
                        liked: false,
                    },
                    {
                        badge: '중기부',
                        category: '기술',
                        title: '[경북] 경주시 2026년 2차 e-모빌리티산업 생태계 고도화...',
                        date: '2026.05.13. ~ 2026.05.26',
                        dday: 'D-12',
                        agency: '중소벤처기업부',
                        region: '경북테크노파크',
                        desc: '2026년도 중소벤처기업부 경상북도 및 울진군이 지원하는 신규 국고산업육성형 협업 프로젝트의 수행자로 선정된 수행기관별 지원 프로그램을 안내하오니, 해당 프로그램 참여를 희망하는 울진군 지역 중소기업의 많은 신청 바랍니다.',
                        target: '경북 내 블루푸드 관련 지역기업 중 해당 지원을 필요로 하는 기업',
                        detailHref: '#',
                        liked: false,
                    },
                ],
            },
            {
                title: '소상공인',
                cards: [
                    {
                        badge: '중기부',
                        category: '소상공인',
                        title: '2026년 대한민국 브랜드 소상공인 점포형 사업',
                        date: '2026.05.11. ~ 2026.05.29',
                        dday: 'D-15',
                        agency: '중소벤처기업부',
                        region: '경북테크노파크',
                        desc: '2026년도 중소벤처기업부 경상북도 및 울진군이 지원하는 신규 국고산업육성형 협업 프로젝트의 수행자로 선정된 수행기관별 지원 프로그램을 안내하오니, 해당 프로그램 참여를 희망하는 울진군 지역 중소기업의 많은 신청 바랍니다.',
                        target: '경북 내 블루푸드 관련 지역기업 중 해당 지원을 필요로 하는 기업',
                        detailHref: '#',
                        liked: true,
                    },
                    {
                        badge: '중기부',
                        category: '소상공인',
                        title: '2026년 대한민국 브랜드 소상공인 점포형 사업',
                        date: '2026.05.11. ~ 2026.05.29',
                        dday: 'D-15',
                        agency: '중소벤처기업부',
                        region: '경북테크노파크',
                        desc: '2026년도 중소벤처기업부 경상북도 및 울진군이 지원하는 신규 국고산업육성형 협업 프로젝트의 수행자로 선정된 수행기관별 지원 프로그램을 안내하오니, 해당 프로그램 참여를 희망하는 울진군 지역 중소기업의 많은 신청 바랍니다.',
                        target: '경북 내 블루푸드 관련 지역기업 중 해당 지원을 필요로 하는 기업',
                        detailHref: '#',
                        liked: true,
                    },
                ],
            },
        ],

        local: [
            {
                title: '수도권',
                cards: [
                    {
                        badge: '서울',
                        category: '창업',
                        title: '[서울] 2026년 지역 창업기업 성장지원 사업 참여기업 모집...',
                        date: '2026.05.12. ~ 2026.05.25',
                        dday: 'D-11',
                        liked: true,
                    },
                    {
                        badge: '경기',
                        category: '금융',
                        title: '[경기] 2026년 소상공인 정책자금 지원사업 신청 공고...',
                        date: '2026.05.06. ~ 2026.05.17',
                        dday: 'D-3',
                        deadline: true,
                    },
                ],
            },
            {
                title: '충청권',
                cards: [
                    {
                        badge: '대전',
                        category: '기술',
                        title: '[대전] 2026년 지역특화 기술개발 지원사업 참여기업 모집...',
                        date: '2026.05.13. ~ 2026.05.26',
                        dday: 'D-12',
                    },
                    {
                        badge: '충북',
                        category: '경영',
                        title: '[충북] 중소기업 경영혁신 바우처 지원사업 참여기업 모집...',
                        date: '2026.05.08. ~ 2026.06.07',
                        dday: 'D-15',
                    },
                ],
            },
            {
                title: '경상권',
                cards: [
                    {
                        badge: '대구',
                        category: '기술',
                        title: '[대구] 지역특화 기술개발 지원사업 참여기업 모집...',
                        date: '2026.05.13. ~ 2026.05.26',
                        dday: 'D-12',
                    },
                    {
                        badge: '부산',
                        category: '창업',
                        title: '[부산] 2026년 스타트업 육성 지원사업 참여기업 모집...',
                        date: '2026.05.12. ~ 2026.05.25',
                        dday: 'D-11',
                    },
                ],
            },
            {
                title: '전라권',
                cards: [
                    {
                        badge: '전북',
                        category: '소상공인',
                        title: '[전북] 2026년 소상공인 점포환경 개선사업 모집 공고...',
                        date: '2026.05.11. ~ 2026.05.29',
                        dday: 'D-15',
                    },
                    {
                        badge: '광주',
                        category: '기술',
                        title: '[광주] 중소기업 기술혁신 지원사업 참여기업 모집...',
                        date: '2026.05.13. ~ 2026.05.26',
                        dday: 'D-12',
                    },
                ],
            },
        ],
    };

    const [activeGovTab, setActiveGovTab] = useState("central");
    const currentSupportGroups = supportData?.[activeGovTab] || [];

    const getNoticeStatus = (dday) => {
        const day = Number(String(dday).replace('D-', ''));
        if (!Number.isNaN(day) && day <= 3) {
            return '마감임박';
        }
        return '접수중';
    };
    const isUrgentDday = (dday) => {
        const day = Number(String(dday).replace('D-', ''));
        return !Number.isNaN(day) && day <= 3;
    };

    // notice (공지사항, 자주하는 질문, 정책 뉴스)
    const [noticeActiveIndex, setNoticeActiveIndex] = useState(0); //기본값 0(공지사항)
    const noticeTabMenu = ["자주찾는 질문", "행사정보", "자료실",  "새로운 뉴스"];

    // 지금 이용 가능한 서비스 - 사업공고 좋아요 버튼
    const [likedAnnounce, setLikedAnnounce] = useState({ 0: true, 4: true });
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

    const ddayList = ['D-11', 'D-3', 'D-12', 'D-15', 'D-11', 'D-3', 'D-12', 'D-15'];
    const supportCards = [
        { dday: 'D-11' },
        { dday: 'D-3' },
        { dday: 'D-12' },
        { dday: 'D-15' },
        { dday: 'D-11' },
        { dday: 'D-3' },
        { dday: 'D-12' },
        { dday: 'D-15' },
    ];
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
    const todayNoticeCards = [
        {
            badge: '중기부',
            category: '창업',
            status: '접수중',
            title: '[경북] 울진군 2026년 2차 블루(blue)푸드 산업 활성화 지원사업 계획 공고입니다. 일정은 다음과 같습니다.',
            date: '2026.05.13. ~ 2026.05.27.',
            dday: 'D-11',
            agency: '중소벤처기업부',
            region: '경북테크노파크',
            desc: '2026년도 중소벤처기업부 경상북도 및 울진군이 지원하는 신규 국고산업육성형 협업 프로젝트의 수행자로 선정된 수행기관별 지원 프로그램을 안내하오니, 해당 프로그램 참여를 희망하는 울진군 지역 중소기업의 많은 신청 바랍니다.',
            target: '경북 내 블루푸드 관련 지역기업 중 해당 지원을 필요로 하는 기업',
            detailHref: '#',
        },
        {
            badge: '중기부',
            category: '경영',
            status: '마감임박',
            title: '[경북] 청주시 2026년 2차 e-모빌리티 산업 생태계 고도화를 위한 기업지원사업 공고',
            date: '2026.05.13. ~ 2026.05.27.',
            dday: 'D-3',
            agency: '중소벤처기업부',
            region: '경북테크노파크',
            desc: '지역 중소기업의 경쟁력 강화를 위한 기업지원 프로그램을 안내하오니, 참여를 희망하는 기업은 신청 바랍니다.',
            target: '해당 지원을 필요로 하는 지역 중소기업',
            detailHref: '#',
        },
    ];
    const weekNoticeGroups = [
        {
            period: '2026.05.25.~2026.05.29',
            label: '이전주',
            days: [
            {
                date: '5.25.',
                day: '(월)',
                list: [
                { dday: 'D-18', badge: '중기부', title: '2026년 지역 창업기업 성장지원 사업 공고' },
                ],
            },
            {
                date: '5.26.',
                day: '(화)',
                list: [
                { dday: 'D-14', badge: '중기부', title: '중소기업 기술혁신 지원사업 모집 공고' },
                ],
            },
            {
                date: '5.27.',
                day: '(수)',
                list: [
                { dday: 'D-10', badge: '중기부', title: '수출바우처 참여기업 모집 공고' },
                ],
            },
            {
                date: '5.28.',
                day: '(목)',
                list: [
                { dday: 'D-7', badge: '중기부', title: '소상공인 판로개척 지원사업 모집 공고' },
                ],
            },
            {
                date: '5.29.',
                day: '(금)',
                list: [
                { dday: 'D-5', badge: '중기부', title: '중소기업 ESG 경영 컨설팅 지원사업 공고' },
                ],
            },
            ],
        },
        {
            period: '2026.06.01.~2026.06.07',
            label: '금주',
            days: [
            {
                date: '6.1.',
                day: '(월)',
                list: [
                { dday: 'D-3', badge: '중기부', title: '협업형 지역생활경제 활성화 시범사업 공고' },
                ],
            },
            {
                date: '6.2.',
                day: '(화)',
                list: [
                { dday: 'D-4', badge: '중기부', title: '2026년 미국 뉴욕 치과 전시회(GNYDM) 참가기업 모집 공고' },
                ],
            },
            {
                date: '6.3.',
                day: '(수)',
                list: [
                { dday: 'D-14', badge: '중기부', title: '2026년 중견기업-스타트업 오픈이노베이션 지원사업 공고' },
                ],
            },
            {
                date: '6.4.',
                day: '(목)',
                list: [
                { dday: 'D-9', badge: '중기부', title: '2026년 수출바우처 참여기업 모집 공고' },
                ],
            },
            {
                date: '6.5.',
                day: '(금)',
                list: [
                { dday: 'D-7', badge: '중기부', title: '소상공인 디지털 전환 지원사업 모집 공고' },
                ],
            },
            ],
        },
        {
            period: '2026.06.08.~2026.06.12',
            label: '다음주',
            days: [
            {
                date: '6.8.',
                day: '(월)',
                list: [
                { dday: 'D-11', badge: '중기부', title: '창업기업 성장지원 프로그램 참여기업 모집 공고' },
                ],
            },
            {
                date: '6.9.',
                day: '(화)',
                list: [
                { dday: 'D-12', badge: '중기부', title: '중소기업 온라인 판로지원 사업 공고' },
                ],
            },
            {
                date: '6.10.',
                day: '(수)',
                list: [
                { dday: 'D-15', badge: '중기부', title: '글로벌 진출 지원 프로그램 참여기업 모집 공고' },
                ],
            },
            {
                date: '6.11.',
                day: '(목)',
                list: [
                { dday: 'D-20', badge: '중기부', title: '지역특화산업 육성사업 참여기업 모집 공고' },
                ],
            },
            {
                date: '6.12.',
                day: '(금)',
                list: [
                { dday: 'D-23', badge: '중기부', title: '중소기업 브랜드 개발 지원사업 모집 공고' },
                ],
            },
            ],
        },
    ];
        const [weekGroupIndex, setWeekGroupIndex] = useState(1); // 0 이전주, 1 금주, 2 다음주

    const currentWeek = weekNoticeGroups[weekGroupIndex];

    const handlePrevWeek = () => {
    setWeekGroupIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleNextWeek = () => {
    setWeekGroupIndex((prev) => Math.min(prev + 1, weekNoticeGroups.length - 1));
    };

    const isPrevDisabled = weekGroupIndex === 0;
    const isNextDisabled = weekGroupIndex === weekNoticeGroups.length - 1;


    const [selectedNotice, setSelectedNotice] = useState(null);

    const openNoticeLayer = (card) => {
        setSelectedNotice(card);
    };

    const closeNoticeLayer = () => {
        setSelectedNotice(null);
    };
    const renderSupportCard = (card, keyIndex) => {
  const isLiked = likedAnnounce[keyIndex] ?? card.liked ?? false;

  return (
    <article className="support-card" key={`${card.title}-${keyIndex}`}>
      <div className="card-top">
        <span className="krds-badge bg-primary">{card.badge}</span>
        <span className="category">{card.category}</span>

        {isUrgentDday(card.dday) && (
          <span className="krds-badge text danger">마감임박</span>
        )}

        <button
          type="button"
          className={`svg-icon heart like-btn on-bgcolorgray ${isLiked ? 'is-on' : ''}`}
          aria-label={`${card.title} 찜하기`}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleLike1(keyIndex);
          }}
        />
      </div>

      <button
        type="button"
        className="card-title onellipsis-2"
        onClick={() => openNoticeLayer(card)}
      >
        {card.title}
      </button>

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
};
  return (
    <div id="wrap">
        <Header />{ /* 임시 해더 */}
        <div id="container"  className="main-container">
          { /*컨텐츠 영역 */}
            
            {/* S - main-totallayout */}
            <div className="main-toplayout">
                <div className="main-top-inner">
                    <div
                        className={`main-top-srch ${isSearchFixed ? "is-fixed" : ""}`}
                        ref={searchBarRef}
                    >
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
                            className="krds-input medium"
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
                                    <li className="sch-popular-item">
                                        <Link to="#" className="item-link">
                                        <em className="rank">
                                            <span className="sr-only">인기검색어</span>1
                                        </em>
                                        지원사업공고
                                        </Link>
                                    </li>
                                    <li className="sch-popular-item">
                                        <Link to="#" className="item-link">
                                        <em className="rank">
                                            <span className="sr-only">인기검색어</span>2
                                        </em>
                                        소상공인
                                        </Link>
                                    </li>
                                    <li className="sch-popular-item">
                                        <Link to="#" className="item-link">
                                        <em className="rank">
                                            <span className="sr-only">인기검색어</span>3
                                        </em>
                                        소상공인 확인서
                                        </Link>
                                    </li>
                                    <li className="sch-popular-item">
                                        <Link to="#" className="item-link">
                                        <em className="rank">
                                            <span className="sr-only">인기검색어</span>4
                                        </em>
                                        직접생산
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
                                <label htmlFor="switch"><span className="switch-toggle"><i></i></span>자동완성기능</label>
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
                    <div className="main-top-keyword fav">
                        <h3>자주 찾는 증명서</h3>
                        <ul className="keyword-list">
                        <li><a className="word" href="/home-dev/crtf/UI_USR_L_040/Y107">중소기업(소상공인) 확인서</a></li>
                        <li><a className="word" href="/home-dev/crtf/UI_USR_L_040/Y106">벤처확인서</a></li>
                        <li><a className="word" href="/home-dev/crtf/UI_USR_L_040/Y105">이노비즈확인서</a></li>
                        <li><a className="word" href="/home-dev/crtf/UI_USR_L_040/Y104">메인비즈확인서</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="container responsive-section">
                {/* S - 사업캘린더 */}
                <section className="main-section main-calendar">
                    <div className="calendar-layout">
                        {/* 오늘의 공고 */}
                        <article className="calendar-box today-box">
                            <div className="calendar-title-wrap">
                                <h2 className="calendar-title">사업캘린더</h2>
                            </div>
                            <div className="calendar-card">
                                <div className="calendar-card-head">
                                    <h3>오늘의 공고</h3>
                                    <span className="count">총 <strong>3</strong>건</span>
                                    <strong className="date">5월 18일(월)</strong>
                                </div>
                                {todayNoticeCards.map((card, index) => (
                                    <button
                                        type="button"
                                        className="today-item"
                                        key={index}
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
                                    <button type="button" className="krds-btn small">
                                        + 더보기
                                    </button>
                                </div>
                            </div>
                        </article>

                        {/* 이번 주 공고 */}
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
                                            onClick={handlePrevWeek}
                                            disabled={isPrevDisabled}
                                        >
                                            <i className="svg-icon ico-angle left"></i>
                                        </button>

                                        <button
                                            type="button"
                                            className="krds-btn week-move-btn next"
                                            aria-label="다음주 보기"
                                            onClick={handleNextWeek}
                                            disabled={isNextDisabled}
                                        >
                                            <i className="svg-icon ico-angle right"></i>
                                        </button>
                                    </div>
                                    <span className="period">{currentWeek.period}</span>
                                </div>

                                <div className="week-notice-list">
                                    {currentWeek.days.map((day, dayIndex) => {
                                        const card = day.list[0];
                                        const isActive = dayIndex === 0;

                                        return (
                                        <div
                                            className={`week-item ${isActive ? 'is-active' : ''}`}
                                            key={`${currentWeek.period}-${day.date}`}
                                        >
                                            <div className="week-date">
                                            <strong>{day.date}</strong>
                                            <span>{day.day}</span>
                                            </div>

                                            <ul className="week-list">
                                            <li>
                                                <span className={`krds-label state ${isUrgentDday(card.dday) ? 'danger' : ''}`}>
                                                {getNoticeStatus(card.dday)}
                                                </span>

                                                <span className="krds-badge bg-primary">{card.badge}</span>

                                                <button
                                                type="button"
                                                className="week-notice-link onellipsis-1"
                                                onClick={() => openNoticeLayer(card)}
                                                >
                                                {card.title}
                                                </button>
                                            </li>
                                            </ul>
                                        </div>
                                        );
                                    })}
                                    </div>
                            </div>
                        </article>
                        <article className="calendar-box week-box" style={{ display: "none" }}>
                            <div className="calendar-title-wrap">
                                <h2 className="calendar-title">사업캘린더</h2>
                            </div>
                            <div className="calendar-card">
                                <div className="calendar-card-head">
                                    <h3>이번 주 공고</h3>
                                    <div className="week-controls">
                                        <button type="button" className="krds-btn" aria-label="이전 주">
                                            <i className="svg-icon ico-angle up"></i>
                                        </button>
                                        <button type="button" className="krds-btn" aria-label="다음 주">
                                            <i className="svg-icon ico-angle"></i>
                                        </button>
                                    </div>
                                    <span className="period">2026.05.18.~2026.05.24</span>
                                </div>
                                {/*weekNoticeCards.map((day, dayIndex) => (
                                    <div className={`week-item ${dayIndex === 0 ? 'is-active' : ''}`} key={dayIndex}>
                                        <div className="week-date">
                                            <strong>{day.date}</strong>
                                            <span>{day.day}</span>
                                        </div>

                                        <ul className="week-list">
                                            {day.list.map((card, index) => (
                                                <li key={index}>
                                                    <span className={`krds-label state ${card.status === '마감임박' ? 'danger' : ''}`}>
                                                        {card.status}
                                                    </span>
                                                    <span className="krds-badge">{card.badge}</span>
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
                                ))*/}
                            </div>
                        </article>

                        {/* 카드뉴스 */}
                        <article className="calendar-box card-news-box">
                            <div className="card-news-head">
                                <h3>카드뉴스</h3>
                                <button type="button" className="krds-btn small text">
                                    더보기 <i className="svg-icon ico-plus"></i>
                                </button>
                            </div>
                            <a href="#" className="card-news-thumb">
                                <img src={cardNews01} alt="시작은 누구나 그 끝은 CEO 모두의 창업" />
                            </a>
                        </article>
                    </div>
                </section>
                {/* E - 사업캘린더 */}
                {/* S - 자주 찾는 서비스  */}
                <section className="main-quick-menu">
                    <h2 className="section-tit white sr-only">자주 찾는 <br />서비스 </h2>
                    <div className="quick-menu-swiper">
                    <Swiper
                        breakpoints={{
                            320: {
                                enabled: false,
                                slidesPerView: 6,
                                spaceBetween: 0
                            },
                            546: {
                                enabled: false,
                                slidesPerView: 6,
                                spaceBetween: 0
                            },
                            768: {
                                enabled: false,
                                slidesPerView: 6,
                                spaceBetween: 10
                            },
                            1200: {
                                enabled: true,
                                slidesPerView: 5,
                                spaceBetween: 20
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
                </section>
                {/*  E - 자주 찾는 서비스 */}
            </div>


            {/* S - 주요 지원 사업 공고 */}
            <section className="main-section main-support">
                <div className="container">
                    <h2 className="section-tit">주요 지원 사업 공고</h2>
                </div>
                <div className="support-board support-board-all">
                    {/* 중앙정부 */}
                    <section className="support-gov-section support-gov-central">
                        <div className="container">
                            <h3 className="support-gov-title">중앙정부</h3>
                            <div className="support-content">
                                <div className="support-group-scroll">
                                    {supportData.central.map((group, groupIndex) => (
                                        <section className="support-group" key={`central-${group.title}`}>
                                            <h4 className="support-group-title">{group.title}</h4>
                                            <div className="support-group-cards">
                                                {group.cards.map((card, cardIndex) => {
                                                    const keyIndex = groupIndex * 10 + cardIndex;
                                                    return renderSupportCard(card, keyIndex);
                                                })}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </div>
                            <div className="more-btn support-more">
                                <button type="button" className="krds-btn text medium">사업공고 더보기 <i className="svg-icon ico-angle right"></i></button>
                            </div>
                        </div>
                    </section>

                    {/* 지방정부 */}
                    <section className="support-gov-section support-gov-local">
                        <div className="container">
                            <h3 className="support-gov-title">지방정부</h3>
                            <div className="support-group-scroll">
                                {supportData.local.map((group, groupIndex) => (
                                    <section className="support-group" key={`local-${group.title}`}>
                                    <h4 className="support-group-title">{group.title}</h4>
                                    <div className="support-group-cards">
                                        {group.cards.map((card, cardIndex) => {
                                        const keyIndex = 100 + groupIndex * 10 + cardIndex;

                                        return renderSupportCard(card, keyIndex);
                                        })}
                                    </div>
                                    </section>
                                ))}
                            </div>

                            <div className="more-btn support-more">
                                <button type="button" className="krds-btn text medium">사업공고 더보기 <i className="svg-icon ico-angle right"></i></button>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
            {/* E - 주요 지원 사업 공고 */}
            <section className="main-section">
                <div className="container">
                    <a href="#">
                        <img src={bannerLine} className="pc-only" alt="2026년 중소벤처기업부  지원사업안내" />
                        <img src={bannerLineM} className="mobile-only" alt="2026년 중소벤처기업부  지원사업안내" />
                    </a>
                </div>
            </section>



          {/* E - main-totallayout */}

          {/* S - 주요 소식 및 안내*/}
          <section className="main-section section-notice">
            <div className="container">
              <h2 className="section-tit">주요 소식 및 안내</h2>
              <div className="notice-wrap">
                {/* 공지사항 tab */}
                <div className="notice-left main-notice">
                  <div className="notice-tab">
                    <div className="notice-tab-top">
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
                        <button type="button" className="krds-btn medium text more" aria-label="공지사항">더보기<i className="svg-icon ico-plus"></i></button>
                    </div>
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
                            <li className="board-list-item">
                              <Link to="#" className="board-list-link">
                                <span className="board-list-title onellipsis-1">지능형 분석 서비스모델 발굴 공모전(연장)</span>
                                <span className="board-list-date">2026.01.19</span>
                              </Link>
                            </li>
                          </ul>
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
                            <img src={mainBanner01} alt="2026년 중소벤처기업부  지원사업안내" />
                          </Link>
                        </div>
                      </SwiperSlide>
                      <SwiperSlide>
                        <div className="main-banner-item">
                          <Link to="#" className="main-banner-link">
                            <img src={mainBanner02} alt="중동전쟁관련 수출 현지진출 기업 애로 긴급 접수" />
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
        { /* 공고 팝업 */}
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
                            <dt>소관부처 · 지자체</dt>
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
                        <a href={selectedNotice.detailHref || '#'} className="krds-btn primary medium">
                            상세공고 바로가기
                        </a>
                    </div>
                </div>
            </div>
        )}

        <Footer />{ /* 임시 푸터 */}
    </div>
  );
};

export default MainPage;
