import React, { useState, useMemo, useEffect, useRef } from 'react';
import arrowIcon from '../../assets/main/icon-arrow.svg';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { useNavigate } from 'react-router-dom';
import { useMenuStore } from '@store/useMenuStore.js';
import { buildFullPath } from '@utils/menuUtils.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';

// BASE URL 상수
const BASE_URL = import.meta.env.VITE_BASE || '/';

// 관리자 - 상단 메뉴
export default function Header() {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState(0);
  const { isLogin, logout } = useAuthStore();
  const { menuTree, flatMenuMap, fetchMenuData } = useMenuStore();
  const mobGnbRef = useRef(null);
  const { getFullPath } = useUserMenu();
  const openTimeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  
  // 메뉴 데이터 로드
  useEffect(() => {
    if (!menuTree) {
      fetchMenuData();
    }
  }, [menuTree, fetchMenuData]);

  // 동적 메뉴 구성: depth 1에서 upendMenuExpsrYn === 'Y'인 메뉴만 필터링
  const dynamicMenus = useMemo(() => {
    if (!menuTree || !menuTree.children) return [];

    const basePath = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

    return menuTree.children
      .filter(menu => menu.depth === 1 && menu.upendMenuExpsrYn === 'Y')
      .sort((a, b) => a.sortSeq - b.sortSeq)
      .map(menu => ({
        ...menu,
        fullPath: basePath + buildFullPath(menu, flatMenuMap),
        children: (menu.children || [])
          .filter(child => child.lfsdMenuExpsrYn === 'Y')
          .sort((a, b) => a.sortSeq - b.sortSeq)
          .map(child => ({
            ...child,
            fullPath: basePath + buildFullPath(child, flatMenuMap),
            children: (child.children || [])
              .filter(grandChild => grandChild.lfsdMenuExpsrYn === 'Y')
              .sort((a, b) => a.sortSeq - b.sortSeq)
              .map(grandChild => ({
                ...grandChild,
                fullPath: basePath + buildFullPath(grandChild, flatMenuMap),
              })),
          })),
      }));
  }, [menuTree, flatMenuMap]);

  const handleMouseEnter = (menuId) => {
    clearTimeout(closeTimeoutRef.current);
    clearTimeout(openTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => {
      setOpenIndex(menuId);
    }, 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(openTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setOpenIndex(null);
    }, 230); // 딜레이 조절 가능
  };

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/service/login');
  };
  const handleClickMypage = () => {
    navigate(getFullPath('M_PIIO_00113')); // 증명서 발급 메뉴로 이동
  };

  const handleOpenMobGnb = () => {
    mobGnbRef.current?.classList.add('is-open', 'is-backdrop');
    document.body.classList.add('is-gnb-mobile');
  };
  const handleCloseMobGnb = () => {
    mobGnbRef.current?.classList.remove('is-open', 'is-backdrop');
    document.body.classList.remove('is-gnb-mobile');
  };

  const handleMobileTabClick = (e, index) => {
    e.preventDefault();
    setActiveMobileTab(index);
    const targetId = `mGnb-anchor${index + 1}`;
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <>
      <div id="krds-skip-link">
        <a href="#breadcrumb">본문 바로가기</a>
      </div>
      { /*본문 바로가기 영역  */}
      <div id="krds-masthead">
        <div className="toggle-wrap">
          <div className="toggle-head">
            <div className="inner">
              <span className="nuri-txt">이 누리집은 대한민국 공식 전자정부 누리집입니다.</span>
            </div>
          </div>
        </div>
      </div>
      { /*헤더 영역 */}
      <header id="krds-header">
        { /*헤더 컨텐츠 영역  */}
        <div className="header-in">
          { /*헤더 상단 기타메뉴 */}
          <div className="header-container">
            <div className="inner">
              <div className="header-branding">
                <h2 className="logo sample">
                  <a href={BASE_URL}>
                    <span className="sr-only">중소기업통합플랫폼</span>
                  </a>
                </h2>
                <div className="header-actions">
                  {/* <button type="button" className="btn-navi sch open-modal" data-target="popTotalSch">통합검색</button> */}
                  {isLogin ? (
                    <>
                      <button type="button" className="btn-navi logout" onClick={logout}>로그아웃</button>
                      <div className="krds-drop-wrap my-drop">
                        <button type="button" className="btn-navi my drop-btn active" onClick={() => handleClickMypage()}>마이 비즈니스</button>
                        <div className="drop-menu" >
                          <div className="drop-in">
                            <div className="drop-top">
                              <p className="my-name">홍길동님</p>
                              <dl className="my-time">
                                <dt>로그아웃까지 남은 시간</dt>
                                <dd>
                                  <span className="time">12:00</span>
                                  <button type="button" className="krds-btn small text h-auto">시간 연장</button>
                                </dd>
                              </dl>
                            </div>
                            <ul className="drop-list">
                              <li><a href="#" className="item-link">나의 GOV 홈<span className="sr-only"></span></a></li>
                              <li><a href="#" className="item-link">나의 신청내역<span className="sr-only"></span></a></li>
                              <li><a href="#" className="item-link">나의 생활정보<span className="sr-only"></span></a></li>
                              <li><a href="#" className="item-link">나의 정보관리<span className="sr-only"></span></a></li>
                            </ul>
                            <div className="drop-bottom">
                              <button type="button" className="krds-btn medium text" onClick={logout}>
                                <i className="svg-icon ico-logout"></i> 로그아웃
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <a href="#" className="btn-navi login" onClick={(e) => { handleClick();}}>로그인</a>
                      <button type="button" className="btn-navi join">회원가입</button>
                    </>
                  )}
                  <button type="button" onClick={handleOpenMobGnb} className="btn-navi all" aria-controls="mobile-nav">전체메뉴</button>
                </div>
              </div>
            </div>
          </div>
          { /*헤더 상단 기타메뉴 */}

          { /*메인메뉴 : 데스크탑 */}
          <nav className="krds-main-menu">
            <div className="inner">
              <ul className="gnb-menu" aria-label="메인 메뉴">
                {dynamicMenus.map((menu) => (
                  <li 
                    key={menu.menuId}
                    onMouseEnter={() => handleMouseEnter(menu.menuId)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      className={`gnb-main-trigger ${openIndex === menu.menuId ? 'active' : ''}`}
                    >
                      {menu.menuNm}
                    </button>
                    {/* gnb-toggle-wrap */}
                    <div className={`gnb-toggle-wrap ${openIndex === menu.menuId ? 'is-open' : ''}`}>
                      <div className="gnb-main-list">
                        <div className="gnb-sub-list single-list between">
                          <div className="gnb-sub-content">
                            <h2 className="sub-title">
                              <span className="on-p4">{menu.menuNm}</span>
                              <span>{menu.menuExplain}</span>
                            </h2>
                            <div>
                              <ul>
                                {menu.children.map((subMenu) => (
                                  <li key={subMenu.menuId}>
                                    <a href={subMenu.fullPath}>
                                      {subMenu.menuNm}
                                      <i className="svg-icon ico-angle right sm"></i>
                                    </a>
                                    <ul className='subMenuLists'>
                                      {(subMenu.children || []).map((depth3Menu) => (
                                        <li key={depth3Menu.menuId}>
                                          <a href={depth3Menu.fullPath}>{depth3Menu.menuNm}</a>
                                        </li>
                                      ))}
                                    </ul>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    { /*gnb-toggle-wrap */}
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          { /*메인메뉴 : 데스크탑 */}
        </div>
        { /*헤더 컨텐츠 영역  */}

        { /*메인메뉴 : 모바일 */}
        <div id="mobile-nav" className="krds-main-menu-mobile" ref={mobGnbRef}> 
          <div className="gnb-wrap">
            {/* gnb-header */}
            <div className="gnb-header">
              {/* gnb-login */}
              <div className="gnb-login">
                <span className="user">홍길동님</span>
                <button type="button" className="krds-btn large text"><i className="svg-icon ico-logout"></i> 로그아웃</button>
                <button type="button" className="krds-btn large text"><i className="svg-icon ico-log"></i> 로그인을 해주세요</button>
              </div>
              { /*gnb-login */}
              {/* 검색 */}
              <div className="sch-input">
                <input type="text" className="krds-input" placeholder="찾고자 하는 메뉴명을 입력해 주세요" title="찾고자 하는 메뉴명 입력"></input>
                <button type="button" className="krds-btn medium icon ico-search">
                  <span className="sr-only">검색</span>
                  <i className="svg-icon ico-sch"></i>
                </button>
              </div>
              { /*검색 */}
            </div>
            { /*gnb-header */}

            {/* gnb-body */}
            <div className="gnb-body">
              {/* gnb-menu */}
              <div className="gnb-menu">
                <div className="menu-wrap">
                  <ul role="tablist">
                    {dynamicMenus.map((menu, index) => (
                      <li role="none" key={menu.menuId}>
                        <a
                          href={`#mGnb-anchor${index + 1}`}
                          className={`gnb-main-trigger ${activeMobileTab === index ? 'active' : ''}`}
                          onClick={(e) => handleMobileTabClick(e, index)}
                        >
                          {menu.menuNm}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="submenu-wrap">
                  {dynamicMenus.map((menu, index) => (
                    <div
                      className="gnb-sub-list"
                      id={`mGnb-anchor${index + 1}`}
                      role="tabpanel"
                      aria-labelledby={`tab-${index}`}
                      key={menu.menuId}
                    >
                      <h2 className="sub-title">{menu.menuNm}</h2>
                      <ul>
                        {menu.children.map((subMenu) => (
                          <li key={subMenu.menuId}>
                            <a href={subMenu.fullPath} className="gnb-sub-trigger">{subMenu.menuNm}</a>
                            <ul className='subMenuLists'>
                              {(subMenu.children || []).map((depth3Menu) => (
                                <li key={depth3Menu.menuId}>
                                  <a href={depth3Menu.fullPath}>{depth3Menu.menuNm}</a>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              { /*gnb-menu */}
            </div>
            { /*gnb-body */}

            {/* gnb-close */}
            <button type="button" className="krds-btn medium icon" id="close-nav" onClick={handleCloseMobGnb}>
              <span className="sr-only">전체메뉴 닫기</span>
              <i className="svg-icon ico-popup-close"></i>
            </button>
            { /*gnb-close */}
          </div>
        </div>

        { /*메인메뉴 : 모바일 */}
      </header>
      <div className="quickbox">
        <button
          type="button"
          className="quickbox-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src={arrowIcon} alt="" />
          <span className="sr-only">상단으로</span>
        </button>
      </div>
    </>
  );
}
