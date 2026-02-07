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
import { api as apiClient } from '../../lib/apiClient.js';

// BASE URL 상수
const BASE_URL = import.meta.env.VITE_BASE || '/';

// JWT 디코딩 함수 (간단한 구현)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT:', e);
    return null;
  }
}

// 관리자 - 상단 메뉴
export default function Header() {
  const {
    isLogin,
    token,
    user,
    currentMode,
    currentCompany,
    linkedCompanies,
    logout,
    login,
  } = useAuthStore();
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
    const loginWindow = window.open('about:blank', 'login-popup', 'width=1050,height=1000');
    const allowedOrigins = new Set([window.location.origin]);

    const handleLoginMessage = async (event) => {
      if (!allowedOrigins.has(event.origin)) return;

      if (event.data.type === 'LOGIN_SUCCESS') {
        if (loginWindow && !loginWindow.closed) {
          loginWindow.close();
        }

        const { token: receivedToken, data } = event.data;

        if (data && data.brno) {
          login({ profile: data });
          return;
        }

        if (receivedToken) {
          const decoded = parseJwt(receivedToken);
          let brno = decoded?.brno;
          if (!brno && decoded?.email) {
            const match = decoded.email.match(/corp\.(\d+)@/);
            if (match) {
              brno = match[1];
            }
          }

          try {
            const response = await apiClient.get('/api/v1/account/me', { token: receivedToken });
            const userInfo = response.data || response;
            if (userInfo) {
              console.log("userInfo: ", userInfo)
              login({ token: receivedToken, profile: userInfo });
              return;
            }
          } catch (error) {
            console.error('Failed to fetch user info:', error);
          }

          if (brno) {
            const fallbackProfile = {
              ...decoded,
              brno,
              cmpNm: decoded.name || '사용자',
              companySize: '중소기업',
            };
            login({ token: receivedToken, profile: fallbackProfile });
            return;
          }

          alert('사용자 정보를 불러올 수 없습니다.');
        } else {
          console.error('Invalid login event data: No token or user data found.', event.data);
        }
      }
    };

    window.addEventListener('message', handleLoginMessage);

    const checkWindowClosed = setInterval(() => {
      if (!loginWindow || loginWindow.closed) {
        clearInterval(checkWindowClosed);
        window.removeEventListener('message', handleLoginMessage);
      }
    }, 500);

    const openFallback = (url) => {
      if (!loginWindow) {
        window.location.href = url;
      } else {
        loginWindow.location.href = url;
      }
    };

    const openLoginPopup = async () => {
      try {
        const response = await apiClient.get('/api/v1/auth/login-url');
        const loginUrl = response?.loginUrl || response?.data?.loginUrl;
        if (!loginUrl) {
          throw new Error('Login URL is missing');
        }
        try {
          const parsed = new URL(loginUrl);
          const redirectUri = parsed.searchParams.get('redirect_uri');
          if (redirectUri) {
            allowedOrigins.add(new URL(redirectUri).origin);
          }
        } catch (error) {
          console.warn('Failed to parse login URL for redirect origin.', error);
        }
        openFallback(loginUrl);
      } catch (error) {
        console.error('Failed to fetch login URL:', error);
        openFallback('/main-dev/service/SSO-login');
      }
    };

    void openLoginPopup();
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
                    currentMode={currentMode}
                    currentCompany={currentCompany}
                    linkedCompanies={linkedCompanies}
                    user={user}
                    onLogin={handleLogin}
                    onLogout={logout}
                    onMyPage={handleMyPage}
                    onSwitchContext={async (companyId) => {
                      if (!token) {
                        return;
                      }
                      try {
                        const response = await apiClient.post(
                          '/api/v1/auth/switch-context',
                          { targetCompanyId: companyId },
                          { token },
                        );
                        const newToken = response.accessToken || response.data?.accessToken;
                        if (!newToken) {
                          throw new Error('Missing access token');
                        }
                        const profileResponse = await apiClient.get('/api/v1/account/me', {
                          token: newToken,
                        });
                        const profile = profileResponse.data || profileResponse;
                        login({ token: newToken, profile });
                      } catch (error) {
                        console.error('Failed to switch context:', error);
                      }
                    }}
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
          userName={currentCompany?.companyName || user?.name}
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
