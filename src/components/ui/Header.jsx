import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import arrowIcon from '@assets/main/icon-arrow.svg';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { useMenuStore } from '@store/useMenuStore.js';
import { buildFullPath, findFirstVisibleTMenu, getMenuExternalUrl } from '@utils/menuUtils.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import HeaderUserMenu from '@components/ui/header/HeaderUserMenu';
import HeaderDesktopGNB from '@components/ui/header/HeaderDesktopGNB';
import HeaderMobileGNB from '@components/ui/header/HeaderMobileGNB';
import HeaderFontDropdown from '@components/ui/header/HeaderFontDropdown';
import FullSystemPopup from '@components/ui/FullSystemPopup';
import { api as apiClient } from '@lib/apiClient.js';
import { buildOnePassRegisterUrl, onePassGetAuthCode } from '@utils/keycloakGetAuthCode.js';

// BASE URL 상수
const BASE_URL = import.meta.env.VITE_BASE || '/';
const MY_BUSINESS_MENU_ID = 'M_PIIO_00068';
const TOTAL_SEARCH_MENU_ID = 'M_PIIO_00152';

const resolveHeaderMenuPath = (menu, flatMenuMap, basePath) => {
  const menuExternalUrl = getMenuExternalUrl(menu);
  if (menuExternalUrl) {
    return menuExternalUrl;
  }

  if (menu.scrnTypeCd === 'M') {
    const firstVisibleTMenu = findFirstVisibleTMenu(menu);
    const firstExternalUrl = getMenuExternalUrl(firstVisibleTMenu);
    if (firstExternalUrl) {
      return firstExternalUrl;
    }
  }

  return basePath + buildFullPath(menu, flatMenuMap);
};

const buildHeaderMenuItem = (menu, flatMenuMap, basePath) => ({
  ...menu,
  fullPath: resolveHeaderMenuPath(menu, flatMenuMap, basePath),
  children: (menu.children || [])
    .filter(child => child.lfsdMenuExpsrYn === 'Y')
    .sort((a, b) => a.sortSeq - b.sortSeq)
    .map(child => ({
      ...child,
      fullPath: resolveHeaderMenuPath(child, flatMenuMap, basePath),
      children: (child.children || [])
        .filter(grandChild => grandChild.lfsdMenuExpsrYn === 'Y')
        .sort((a, b) => a.sortSeq - b.sortSeq)
        .map(grandChild => ({
          ...grandChild,
          fullPath: resolveHeaderMenuPath(grandChild, flatMenuMap, basePath),
        })),
    })),
});

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

function getTokenExpirationTime(token) {
  const claims = parseJwt(token);
  return typeof claims?.exp === 'number' ? claims.exp : null;
}

function formatSessionTimer(remainingSeconds) {
  if (typeof remainingSeconds !== 'number' || remainingSeconds < 0) {
    return '';
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${String(minutes).padStart(2, '0')}: ${String(seconds).padStart(2, '0')}`;
}

// 관리자 - 상단 메뉴
export default function Header() {
  const {
    isLogin,
    token,
    refreshToken,
    user,
    currentMode,
    currentCompany,
    linkedCompanies,
    logout,
    login,
    setToken,
    setRefreshToken,
  } = useAuthStore();
  const { menuTree, flatMenuMap, fetchMenuData } = useMenuStore();
  const mobGnbRef = useRef(null);
  const sessionExpiryHandledRef = useRef(false);
  const { getFullPath } = useUserMenu();
  const navigate = useNavigate();
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  const isLoginPage = location.pathname.endsWith('/service/login');
  const showHeaderSearch = !isMainPage && !isLoginPage;
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [isExtendingSession, setIsExtendingSession] = useState(false);
  
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
        fullPath: resolveHeaderMenuPath(menu, flatMenuMap, basePath),
        children: (menu.children || [])
          .filter(child => child.lfsdMenuExpsrYn === 'Y')
          .sort((a, b) => a.sortSeq - b.sortSeq)
          .map(child => ({
            ...child,
            fullPath: resolveHeaderMenuPath(child, flatMenuMap, basePath),
            children: (child.children || [])
              .filter(grandChild => grandChild.lfsdMenuExpsrYn === 'Y')
              .sort((a, b) => a.sortSeq - b.sortSeq)
              .map(grandChild => ({
                ...grandChild,
                fullPath: resolveHeaderMenuPath(grandChild, flatMenuMap, basePath),
              })),
          })),
      }));
  }, [menuTree, flatMenuMap]);

  const mobileMenus = useMemo(() => {
    if (!isLogin || !menuTree || !menuTree.children) {
      return dynamicMenus;
    }

    const hasMyBusinessMenu = dynamicMenus.some(menu => menu.menuId === MY_BUSINESS_MENU_ID);
    const myBusinessMenu = menuTree.children.find(menu => menu.menuId === MY_BUSINESS_MENU_ID);
    if (hasMyBusinessMenu || !myBusinessMenu) {
      return dynamicMenus;
    }

    const basePath = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    // 모바일 로그인 전체메뉴에서만 마이비즈니스 1depth를 보강하고, 원본 상단 노출값은 바꾸지 않는다.
    return [...dynamicMenus, buildHeaderMenuItem(myBusinessMenu, flatMenuMap, basePath)]
      .sort((a, b) => a.sortSeq - b.sortSeq);
  }, [isLogin, menuTree, flatMenuMap, dynamicMenus]);

  // 타이머는 우리 관리 범위가 확정된 ID/PW 세션(access + refresh 보유)에만 노출한다.
  const showSessionTimer = Boolean(token && refreshToken && remainingSeconds !== null);
  const sessionTimerLabel = useMemo(
    () => formatSessionTimer(remainingSeconds),
    [remainingSeconds],
  );
  const canExtendSession = showSessionTimer && remainingSeconds > 0 && !isExtendingSession;

  useEffect(() => {
    sessionExpiryHandledRef.current = false;

    if (!token || !refreshToken) {
      setRemainingSeconds(null);
      return;
    }

    const updateRemainingSeconds = () => {
      const expirationTime = getTokenExpirationTime(token);
      if (!expirationTime) {
        setRemainingSeconds(null);
        return;
      }

      const nextRemainingSeconds = Math.max(expirationTime - Math.floor(Date.now() / 1000), 0);
      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds > 0 || sessionExpiryHandledRef.current) {
        return;
      }

      // 이번 단계의 만료 처리는 client-side expiry 로만 보고 로그인 페이지로 복귀시킨다.
      sessionExpiryHandledRef.current = true;
      logout();
      alert('로그인 유효시간이 만료되었습니다. 다시 로그인해주세요.');
      navigate('/service/login');
    };

    updateRemainingSeconds();
    const timerId = window.setInterval(updateRemainingSeconds, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [token, refreshToken, logout, navigate]);

  const handleServiceLogin = () => {
    navigate('/service/login');
  };

  const handleOnePassIntegratedLogin = () => {
    onePassGetAuthCode();
  };

  const handleOnePassConfig = () => {

    const { isLogin, currentMode, uuid } = useAuthStore.getState(); 
    
    if (!isLogin || !uuid) {
      alert('로그인 정보가 올바르지 않거나 UUID를 찾을 수 없습니다.');
      return;
    }

    if(currentMode === 'CORPORATE') {
      const onePassJoinUrl = `https://onepass-dev.smes.go.kr/mypage-business/information?redirect_uri=https://www.smes.go.kr/home-dev/mb/dash/UI_USR_L_510&client_id=smes-tipa-01&uuid=${uuid}`;
      console.log('onOnePassJoin : ', onePassJoinUrl);
      window.location.href = onePassJoinUrl;
    } else {
      const onePassJoinUrl = `https://onepass-dev.smes.go.kr/mypage-member/information?redirect_uri=https://www.smes.go.kr/home-dev/mb/dash/UI_USR_L_510&client_id=smes-tipa-01&uuid=${uuid}`;
      console.log('onOnePassJoin : ', onePassJoinUrl);
      window.location.href = onePassJoinUrl;
    }
    
  }

  const handleOnePassJoin = () => {
    const onePassJoinUrl = buildOnePassRegisterUrl('member');
    console.log('onOnePassJoin : ', onePassJoinUrl);
    window.location.href = onePassJoinUrl;
  };

  const handleLogout = async () => {
    let logoutUrl = null;

    try {
      const response = await apiClient.post('/api/v1/auth/keycloak/logout');
      const responseData = response?.data || response;
      logoutUrl = responseData?.logoutUrl || responseData?.data?.logoutUrl || null;
      console.log('[Header] keycloak logout url resolved', {
        hasLogoutUrl: Boolean(logoutUrl),
        logoutUrlLength: logoutUrl?.length ?? 0,
      });
    } catch (error) {
      console.error('[Header] failed to fetch keycloak logout url', {
        message: error?.message ?? 'unknown-error',
        status: error?.status ?? null,
      });
    }

    // 로컬 로그아웃은 항상 수행하고, OnePass 세션이 있으면 외부 logout redirect를 이어서 태운다.
    logout();
    if (logoutUrl) {
      window.location.href = logoutUrl;
      return;
    }

    navigate('/');
  };

  const handleExtendSession = async () => {
    if (!token || !refreshToken || isExtendingSession) {
      return;
    }

    setIsExtendingSession(true);
    try {
      const response = await apiClient.post('/api/v1/account/refresh', { refreshToken });
      const newAccessToken = response.accessToken || response.data?.accessToken;
      const newRefreshToken = response.refreshToken || response.data?.refreshToken;
      if (!newAccessToken || !newRefreshToken) {
        throw new Error('Refresh token response is incomplete');
      }
      setToken(newAccessToken);
      setRefreshToken(newRefreshToken);
    } catch (error) {
      console.error('Failed to extend session:', error);
      logout();
      alert('로그인 유효시간 연장에 실패했습니다. 다시 로그인해주세요.');
      navigate('/service/login');
    } finally {
      setIsExtendingSession(false);
    }
  };

  // 기존 로그인 버튼에서는 분리했고, 추후 통합로그인 버튼이 생기면 이 함수에 연결한다.
  const handleIntegratedLogin = () => {
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
              console.log('userInfo: ', userInfo);
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
        const basePath = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';
        openFallback(`${basePath}service/SSO-login`);
      }
    };
    void openLoginPopup();
  };

  const handleMyPage = () => {
    navigate('/mb');
  };

  const handleOpenMobGnb = () => {
    mobGnbRef.current?.classList.add('is-open', 'is-backdrop');
    document.body.classList.add('is-gnb-mobile');
  };

  const handleCloseMobGnb = () => {
    mobGnbRef.current?.classList.remove('is-open', 'is-backdrop');
    document.body.classList.remove('is-gnb-mobile');
  };

  // S - 헤더 버그 수정(2026-03-19)
  //  스크롤 시 header 숨김/ 보임
  const headerRef = useRef(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const lastScrollY = useRef(0);
  const MOBILE_BREAKPOINT = 1024;
  const isLocked = useRef(false); // 상태 변경 쿨다운 lock

  const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

  const updateContainerMargin = (visible) => {
    const container = document.querySelector('.main-container, .sub-container');
    if (container) {
      container.style.marginTop = visible
        ? `${headerRef.current?.offsetHeight || 0}px`
        : '0px';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isMobile()) {
        setIsHeaderVisible(true);
        return;
      }

      const currentScrollY = Math.max(0, window.scrollY); // 음수 방지
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

      // 바운스 구간(스크롤 끝)이면 lastScrollY 업데이트도 안 하고 완전 무시
      if (currentScrollY >= maxScrollY - 5) return;

      const delta = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      if (Math.abs(delta) < 5) return;

      if (delta < 0) {
        // 위로: 즉시 표시, lock 없음
        setIsHeaderVisible(true);
      } else if (delta > 0 && currentScrollY > 80) {
        // 아래로: lock 적용
        if (isLocked.current) return;
        const headerHeight = headerRef.current?.offsetHeight ?? 0;
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollableHeight <= headerHeight) return; // 숨기면 스크롤 불가 → 중단
        setIsHeaderVisible(false);
        isLocked.current = true;
        setTimeout(() => { isLocked.current = false; }, 400);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (isMobile()) setIsHeaderVisible(true);
      updateContainerMargin(isHeaderVisible);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isHeaderVisible]);

  useEffect(() => {
    updateContainerMargin(isHeaderVisible);
  }, [isHeaderVisible]);
  // E - 헤더 버그 수정(2026-03-19)

  const getTotalSearchPath = () => {
    const pathFromMenu = String(getFullPath(TOTAL_SEARCH_MENU_ID) || '').trim();
    return pathFromMenu || '/totalSearch';
  };

  const handleTotalSearch = () => {
    const keyword = String(headerSearchQuery || '').trim();
    const totalSearchPath = getTotalSearchPath();

    if (!keyword) {
      window.alert('검색어를 입력해주세요.');
      return;
    }

    const params = new URLSearchParams({ q: keyword });
    navigate(`${totalSearchPath}?${params.toString()}`, {
      state: { q: keyword },
    });
  };

  const handleTotalSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleTotalSearch();
    }
  };

  const [isPopOpen, setPopOpen] = useState(false); // 유관기관 둘러보기 팝업
  
  return (
    <>
      <div id="krds-skip-link">
        <a href="#container">본문 바로가기</a> {/* 웹접근성 반영 */}
      </div>
      
      <header 
        ref={headerRef}
        id="krds-header"
        className={isHeaderVisible ? '' : 'is-hidden'}
      >
        <div id="krds-masthead">
          <div className="toggle-wrap">
            <div className="toggle-head">
              <div className="inner">
                <span className="nuri-txt">이 누리집은 대한민국 공식 전자정부 누리집입니다.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="header-in">
          <div className="header-container">
            <div className="inner">
              <div className="header-utility">
                <ul className="utility-list">
                  {/* 글자 설정 dropdown */}
                  <li>
                    <HeaderFontDropdown />
                  </li>
                  {/*<li>*/}
                  {/*  <Link onClick={() => setPopOpen(true)} className="krds-btn small text">*/}
                  {/*    <i class="svg-icon ico-system"></i> 유관시스템 둘러보기*/}
                  {/*  </Link>*/}
                  {/*</li>*/}
                </ul>
              </div>
              <div className="header-branding">
                <h2 className="logo sample">
                  <a href={BASE_URL}>
                    <span className="sr-only">중소벤처24</span>
                  </a>
                </h2>
                <div className="logo-platform">
                  <span className="sr-only">모두의 시작, 모두의 성장</span>
                </div>
                <div className="header-right">
                  {/* 검색란 */}
                  {showHeaderSearch && (
                    <div className="sch-input">
                      <input
                        type="search"
                        name="headerSearchKeyword"
                        autoComplete="off"
                        className="krds-input medium"
                        placeholder="검색어를 입력하세요"
                        title="검색어 입력"
                        value={headerSearchQuery}
                        onChange={(event) => setHeaderSearchQuery(event.target.value)}
                        onKeyDown={handleTotalSearchKeyDown}
                      />
                      <button
                        type="button"
                        className="krds-btn medium icon ico-search"
                        onClick={handleTotalSearch}
                      >
                        <span className="sr-only">검색</span>
                        <i className="svg-icon ico-sch"></i>
                      </button>
                    </div>
                  )}
                  <div className="header-actions">
                    <HeaderUserMenu
                      isLogin={isLogin}
                      currentMode={currentMode}
                      currentCompany={currentCompany}
                      linkedCompanies={linkedCompanies}
                      user={user}
                      showSessionTimer={showSessionTimer}
                      sessionTimerLabel={sessionTimerLabel}
                      canExtendSession={canExtendSession}
                      isExtendingSession={isExtendingSession}
                      onExtendSession={handleExtendSession}
                      onLogin={handleServiceLogin}
                      onOnePassLogin={handleOnePassIntegratedLogin}
                      onOnePassConfig={handleOnePassConfig}
                      onOnePassJoin={handleOnePassJoin}
                      onLogout={handleLogout}
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
                    {/* <HeaderSearch /> */}
                    {/*<button type="button" className="btn-navi sch open-modal"><span className="sr-only">검색</span></button>*/}
                    <button type="button" onClick={handleOpenMobGnb} className="btn-navi all" aria-controls="mobile-nav"><span className="sr-only">전체메뉴</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <HeaderDesktopGNB menus={dynamicMenus} />
        </div>

        <HeaderMobileGNB 
          ref={mobGnbRef} 
          menus={mobileMenus}
          onClose={handleCloseMobGnb} 
          onLogin={handleServiceLogin}
          onOnePassLogin={handleOnePassIntegratedLogin}
          onOnePassConfig={handleOnePassConfig}
          onMyPage={handleMyPage}
          onLogout={handleLogout}
          isLogin={isLogin}
          userName={currentCompany?.companyName || user?.name}
          showSessionTimer={showSessionTimer}
          sessionTimerLabel={sessionTimerLabel}
          canExtendSession={canExtendSession}
          isExtendingSession={isExtendingSession}
          onExtendSession={handleExtendSession}
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


      <FullSystemPopup isPopOpen={isPopOpen} setPopOpen={setPopOpen} />
    </>
  );
}
