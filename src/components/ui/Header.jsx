import React, { useMemo, useEffect, useRef } from 'react';
import arrowIcon from '../../assets/main/icon-arrow.svg';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { useNavigate } from 'react-router-dom';
import { useMenuStore } from '@store/useMenuStore.js';
import { buildFullPath } from '@utils/menuUtils.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import HeaderDesktopGNB from './header/HeaderDesktopGNB';
import HeaderMobileGNB from './header/HeaderMobileGNB';
import HeaderUserMenu from './header/HeaderUserMenu';
import HeaderSearch from './header/HeaderSearch';

// BASE URL 상수
const BASE_URL = import.meta.env.VITE_BASE || '/';

// 관리자 - 상단 메뉴
export default function Header() {
  const { isLogin, logout, login, companyProfile } = useAuthStore();
  const { menuTree, flatMenuMap, fetchMenuData } = useMenuStore();
  const mobGnbRef = useRef(null);
  const { getFullPath } = useUserMenu();
  const navigate = useNavigate();
  
  // 메뉴 데이터 로드
  useEffect(() => {
    if (!menuTree) {
      fetchMenuData();
    }
  }, [menuTree, fetchMenuData]);

  // 동적 메뉴 구성
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

  const handleLogin = () => {
    const loginWindow = window.open('/main-dev/service/SSO-login', 'login-popup', 'width=1050,height=1000');

    const handleLoginMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'LOGIN_SUCCESS') {
        if (loginWindow && !loginWindow.closed) {
          loginWindow.close();
        }
        const data = event.data.data;
        login(data.brno, data.cmpNm, data.companySize, data.companyProfile);
      }
    };

    window.addEventListener('message', handleLoginMessage);

    const checkWindowClosed = setInterval(() => {
      if (loginWindow.closed) {
        clearInterval(checkWindowClosed);
        window.removeEventListener('message', handleLoginMessage);
      }
    }, 500);
  };

  const handleMyPage = () => {
    navigate(getFullPath('M_PIIO_00113'));
  };

  const handleOpenMobGnb = () => {
    mobGnbRef.current?.classList.add('is-open', 'is-backdrop');
    document.body.classList.add('is-gnb-mobile');
  };

  const handleCloseMobGnb = () => {
    mobGnbRef.current?.classList.remove('is-open', 'is-backdrop');
    document.body.classList.remove('is-gnb-mobile');
  };

  return (
    <>
      <div id="krds-skip-link">
        <a href="#breadcrumb">본문 바로가기</a>
      </div>
      
      <div id="krds-masthead">
        <div className="toggle-wrap">
          <div className="toggle-head">
            <div className="inner">
              <span className="nuri-txt">이 누리집은 대한민국 공식 전자정부 누리집입니다.</span>
            </div>
          </div>
        </div>
      </div>
      
      <header id="krds-header">
        <div className="header-in">
          <div className="header-container">
            <div className="inner">
              <div className="header-branding">
                <h2 className="logo sample">
                  <a href={BASE_URL}>
                    <span className="sr-only">중소기업통합플랫폼</span>
                  </a>
                </h2>
                <div className="header-actions">
                  <HeaderUserMenu
                    isLogin={isLogin}
                    companyProfile={companyProfile}
                    onLogin={handleLogin}
                    onLogout={logout}
                    onMyPage={handleMyPage}
                  />
                  <HeaderSearch />
                  <button type="button" onClick={handleOpenMobGnb} className="btn-navi all" aria-controls="mobile-nav">전체메뉴</button>
                </div>
              </div>
            </div>
          </div>

          <HeaderDesktopGNB menus={dynamicMenus} />
        </div>

        <HeaderMobileGNB 
          ref={mobGnbRef} 
          menus={dynamicMenus} 
          onClose={handleCloseMobGnb} 
          isLogin={isLogin}
          userName={companyProfile?.cmpNm}
        />
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
