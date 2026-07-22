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
import {
  SESSION_SUPERSEDED_MESSAGE,
  clearSessionSuperseded,
  isSupersededError,
  markSessionSuperseded,
} from '@utils/sessionSupersededGuard.js';

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
    tokenExpiresAt,
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
  // 왜 필요한지: 헤더 검색 영역은 로그인 관련 화면에서는 숨겨야 하는데, 신규 진입 화면(/service/loginBef)도 같은 로그인 흐름에 속한다.
  // 무엇을 하는지: 기존 ID/PW 로그인 화면과 신규 로그인 진입 화면을 모두 로그인 페이지로 판정한다.
  // 주의할 점: 세션 만료/연장 실패 fallback은 로그인 진입과 분리해 홈으로 이동시킨다.
  const isLoginPage = ['/service/login', '/service/loginBef'].includes(location.pathname);
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
      // store에서 파싱된 만료 시각을 우선 사용, 없으면 token 직접 파싱 (구버전 호환)
      const expirationTime = tokenExpiresAt ?? getTokenExpirationTime(token);
      if (!expirationTime) {
        setRemainingSeconds(null);
        return;
      }

      const nextRemainingSeconds = Math.max(expirationTime - Math.floor(Date.now() / 1000), 0);
      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds > 0 || sessionExpiryHandledRef.current) {
        return;
      }

      // client-side 만료 fallback은 로그인 진입이 아니라 홈으로 돌려 다음 행동을 사용자가 선택하게 한다.
      sessionExpiryHandledRef.current = true;
      logout();
      alert('로그인 유효시간이 만료되었습니다. 홈으로 이동합니다. 다시 로그인해 주세요.');
      navigate('/');
    };

    updateRemainingSeconds();
    const timerId = window.setInterval(updateRemainingSeconds, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [token, tokenExpiresAt, refreshToken, logout, navigate]);

  const handleServiceLogin = () => {
    navigate('/service/loginBef');
  };

  const handleOnePassIntegratedLogin = () => {
    onePassGetAuthCode();
  };

  const readEnv = (key) => String(import.meta.env[key] || '').trim();
  const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

  const fullUrl = trimTrailingSlash(readEnv('VITE_FULL_URL'));
  const clientId = trimTrailingSlash(readEnv('VITE_CLIENT_ID'));
  const tagetBizMypageUrl = trimTrailingSlash(readEnv('VITE_BIZ_TARGET_MYPAGE_URL'));
  const tagetMbrMypageUrl = trimTrailingSlash(readEnv('VITE_MBR_TARGET_MYPAGE_URL'));

  const handleOnePassConfig = () => {

    const { isLogin, currentMode, uuid } = useAuthStore.getState(); 
    
    if (!isLogin || !uuid) {
      alert('로그인 정보가 올바르지 않거나 UUID를 찾을 수 없습니다.');
      return;
    }

    if (currentMode === 'CORPORATE') {
      const onePassJoinUrl = `${tagetBizMypageUrl}?redirect_uri=${fullUrl}/mb/dash/UI_USR_L_510&client_id=${clientId}&uuid=${uuid}`;
      window.location.href = onePassJoinUrl;
    } else {
      const onePassJoinUrl = `${tagetMbrMypageUrl}?redirect_uri=${fullUrl}/mb/dash/UI_USR_L_510&client_id=${clientId}&uuid=${uuid}`;
      window.location.href = onePassJoinUrl;
    }
    
  };

  const handleOnePassJoin = () => {
    const onePassJoinUrl = buildOnePassRegisterUrl('member');
    window.location.href = onePassJoinUrl;
  };

  const isSsoLogin = useAuthStore((state) => state.isSsoLogin);

  /**
   * 로그아웃 핸들러.
   *
   * SSO 로그인인 경우:
   *   1. store에 보관 중인 kcIdToken을 서버에 전달하여 Keycloak logout URL을 수신한다.
   *   2. 로컬 상태(Zustand + sessionStorage)를 초기화한다.
   *   3. 반환된 logoutUrl로 리다이렉트하여 Keycloak 세션도 종료한다.
   *
   * 일반 로그인인 경우:
   *   로컬 상태만 초기화하고 홈으로 이동한다.
   *
   * 서버는 HttpSession에 id_token을 저장하지 않으므로(STATELESS)
   * FE가 kcIdToken을 보관하여 전달하는 방식으로 동작한다.
   */
  const handleLogout = async () => {
    if (isSsoLogin) {
      try {
        const kcIdToken = useAuthStore.getState().kcIdToken;
        const response = await apiClient.post('/api/v1/auth/keycloak/logout', {
          idToken: kcIdToken || null,
        });
        const responseData = response?.data || response;
        const logoutUrl = responseData?.logoutUrl || null;

        logout(); // 로컬 상태 초기화 (kcIdToken 포함)

        if (logoutUrl) {
          window.location.href = logoutUrl;
          return;
        }
      } catch (error) {
        logout();
      }
    } else {
      logout();
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
      // 세션 연장 실패는 복구 불가 fallback이므로 로그인 진입 대신 홈으로 이동시킨다.
      logout();
      if (isSupersededError(error)) {
        // 중복 로그인 강퇴: silent 자동 재로그인을 막고 정확한 사유를 알린다.
        markSessionSuperseded();
        alert(error?.data?.message || SESSION_SUPERSEDED_MESSAGE);
      } else {
        alert('로그인 유효시간 연장에 실패했습니다. 홈으로 이동합니다. 다시 로그인해 주세요.');
      }
      navigate('/');
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
              login({ token: receivedToken, profile: userInfo });
              return;
            }
          } catch (error) {
            return null;
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
        // 로그인 버튼 클릭 = 명시적 로그인 의사 — 중복 로그인 강퇴 가드를 해제한다.
        // (이 로그인이 성공하면 반대편 브라우저가 강퇴되는 것이 후입자 우선의 의도된 동작)
        clearSessionSuperseded();
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
          return null;
        }
        openFallback(loginUrl);
      } catch (error) {
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
      /*if (isMobile()) {
        setIsHeaderVisible(true);
        return;
      }*/

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
    // 이유: 라우트 전환은 Header를 remount하지 않아 접힘 상태와 이전 scroll 기준값이 다음 화면에 남을 수 있다.
    // 영향: 새 화면은 펼친 header로 시작하고, 이후 스크롤 방향 판정은 현재 위치에서 다시 시작한다.
    lastScrollY.current = Math.max(0, window.scrollY);
    isLocked.current = false;
    setIsHeaderVisible(true);
  }, [location.pathname]);

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
                {/*<div className="logo-platform">
                  <span className="sr-only">모두의 시작, 모두의 성장</span>
                </div>*/}
                <div className="header-right">
                  <a className="btn-go" href="https://smes.go.kr/main" target="_blank" style={{ padding: '0.5rem' }}>
                    기존 중소벤처24 이동
                  </a>
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
                      onLogin={handleOnePassIntegratedLogin}
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
                          return null;
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
          onLogin={handleOnePassIntegratedLogin}
          onOnePassLogin={handleOnePassIntegratedLogin}
          onOnePassJoin={handleOnePassJoin}
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
