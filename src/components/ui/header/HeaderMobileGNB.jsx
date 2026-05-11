import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { extractExternalUrl } from '@utils/menuUtils.js';
import FullSystemPopup from '../../ui/FullSystemPopup';

const resolveMenuLinkAttrs = (fullPath) => {
  const externalUrl = extractExternalUrl(fullPath);

  if (externalUrl) {
    return {
      href: externalUrl,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }

  return {
    href: fullPath || '#',
  };
};

const MOBILE_ACTIVE_BOTTOM_THRESHOLD_PX = 96;
const MOBILE_ACTIVE_LINE_RATIO = 0.35;

const getNextActiveMobileTab = (scrollContainer, sectionElements, menuCount) => {
  if (!scrollContainer || menuCount === 0) {
    return 0;
  }

  const maxScrollTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
  const distanceToBottom = maxScrollTop - scrollContainer.scrollTop;
  const bottomThreshold = Math.min(
    MOBILE_ACTIVE_BOTTOM_THRESHOLD_PX,
    scrollContainer.clientHeight * 0.15,
  );

  if (maxScrollTop > 1 && distanceToBottom <= bottomThreshold) {
    return menuCount - 1;
  }

  const containerRect = scrollContainer.getBoundingClientRect();
  const activationLine = containerRect.top + containerRect.height * MOBILE_ACTIVE_LINE_RATIO;
  let nextActiveIndex = 0;

  for (let index = 0; index < menuCount; index += 1) {
    const sectionElement = sectionElements[index];
    if (!sectionElement) {
      continue;
    }

    const sectionRect = sectionElement.getBoundingClientRect();
    if (sectionRect.height <= 0) {
      continue;
    }

    if (sectionRect.top <= activationLine && sectionRect.bottom > activationLine) {
      return index;
    }

    if (sectionRect.top <= activationLine) {
      nextActiveIndex = index;
    }
  }

  return nextActiveIndex;
};

const HeaderMobileGNB = forwardRef(({
  menus,
  onClose,
  onLogin,
  onOnePassLogin,
  onMyPage,
  onLogout,
  userName,
  isLogin,
  showSessionTimer,
  sessionTimerLabel,
  canExtendSession,
  isExtendingSession,
  onExtendSession,
}, ref) => {
  const [activeMobileTab, setActiveMobileTab] = useState(0);
  const gnbBodyRef = useRef(null);
  const subMenuSectionRefs = useRef([]);

  /**
   * 모바일 전체메뉴 스크롤 위치를 기준으로 좌측 1depth active를 동기화한다.
   * 왜 필요한지: 사용자가 우측 목록을 스크롤로 탐색할 때도 현재 보고 있는 섹션이 좌측 메뉴에 즉시 반영되어
   * "보이는 섹션"과 "강조된 1depth"가 어긋나는 UX 혼선을 방지해야 한다.
   * 무엇을 하는지: 읽기 기준선에 걸친 섹션을 우선하되, 스크롤 하단 근처에서는 마지막 섹션을 active로 보정한다.
   * 주의할 점: 스크롤 이벤트는 매우 빈번하므로 requestAnimationFrame으로 계산 시점을 묶어 과도한 re-render를 피한다.
   */
  const syncActiveTabWithScroll = useCallback(() => {
    const scrollContainer = gnbBodyRef.current;

    if (!scrollContainer || menus.length === 0) {
      return;
    }

    const nextActiveIndex = getNextActiveMobileTab(
      scrollContainer,
      subMenuSectionRefs.current,
      menus.length,
    );

    setActiveMobileTab((prev) => (prev === nextActiveIndex ? prev : nextActiveIndex));
  }, [menus.length]);

  useEffect(() => {
    subMenuSectionRefs.current = subMenuSectionRefs.current.slice(0, menus.length);

    const scrollContainer = gnbBodyRef.current;
    if (!scrollContainer) {
      return;
    }

    let rafId = null;
    const handleScroll = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      rafId = window.requestAnimationFrame(() => {
        syncActiveTabWithScroll();
        rafId = null;
      });
    };

    // 초기 렌더 직후 현재 스크롤 위치 기준으로 active를 맞춰 두어, 첫 진입 시 강조 상태가 어긋나지 않도록 한다.
    syncActiveTabWithScroll();
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', syncActiveTabWithScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', syncActiveTabWithScroll);

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [menus.length, syncActiveTabWithScroll]);

  const handleMobileTabClick = (e, index) => {
    e.preventDefault();
    setActiveMobileTab(index);
    const targetElement = subMenuSectionRefs.current[index];
    const scrollContainer = gnbBodyRef.current;

    if (targetElement && scrollContainer) {
      /**
       * 클릭 이동도 동일한 스크롤 컨테이너 기준으로 처리한다.
       * 왜 필요한지: 브라우저 기본 scrollIntoView는 상위 스크롤 컨테이너 판단에 따라 예상과 다른 스크롤이 발생할 수 있다.
       * 무엇을 하는지: 컨테이너와 타겟의 현재 위치 차이를 계산해 컨테이너 scrollTop을 직접 보정한다.
       * 주의할 점: 부드러운 이동 중에는 scroll 이벤트가 연속 발생하므로 active 갱신은 위의 스크롤 동기화 로직이 최종 상태를 보장한다.
       */
      const containerTop = scrollContainer.getBoundingClientRect().top;
      const targetTop = targetElement.getBoundingClientRect().top;
      const nextScrollTop = scrollContainer.scrollTop + (targetTop - containerTop);

      scrollContainer.scrollTo({ top: nextScrollTop, behavior: 'smooth' });
    }
  };

  const [isPopOpen, setPopOpen] = useState(false); // 유관기관 둘러보기 팝업

  const handleLoginClick = () => {
    // 모바일 GNB 오버레이가 열린 채로 route 이동하지 않도록 먼저 닫는다.
    onClose?.();
    onLogin?.();
  };

  const handleLogoutClick = () => {
    // 모바일 GNB 오버레이가 열린 채로 로그아웃 상태 전환하지 않도록 먼저 닫는다.
    onClose?.();
    onLogout?.();
  };

  const handleOnePassLoginClick = () => {
    // 통합로그인 이동 전 모바일 GNB 오버레이를 먼저 닫아 배경 상태를 정리한다.
    onClose?.();
    onOnePassLogin?.();
  };
  const handleMyPageClick = () => {
    onClose?.();
    onMyPage?.();
  };

  return (
    <>
      <div id="mobile-nav" className="krds-main-menu-mobile" ref={ref}> 
        <div className="gnb-wrap">
          <div className="gnb-header">
            {/* 03-10 디자인 변경 */}
            <div className="gnb-utils">
              <ul className="utility-list">
                <li>
                  <Link onClick={() => setPopOpen(true)} className="krds-btn medium text">
                    <i className="svg-icon ico-system"></i> 유관시스템 둘러보기
                  </Link>
                </li>
              </ul>
            </div>
            <div className={`gnb-login ${isLogin ? 'is-login' : 'is-logout'}`}>
              {isLogin ? (
                <>
                  {/* 로그인 후 */}
                  <div className="gnb-user-info">
                    <span className="user">{userName}</span>님 안녕하세요
                    
                  </div>
                  {showSessionTimer ? (
                    <div className="gnb-sesseion-timer">
                      <div className="timer"><span className="sr-only">남은 시간</span><i className="svg-icon ico-clock"></i> {sessionTimerLabel}</div>
                      <button
                        type="button"
                        className="krds-btn secondary xsmall"
                        onClick={onExtendSession}
                        disabled={!canExtendSession || isExtendingSession}
                      >
                        연장
                      </button>
                    </div>
                  ) : null}
                  <div className="gnb-header-link">
                    <button type="button" className="krds-btn large text" onClick={handleOnePassLoginClick}><i className="svg-icon ico-onepass"></i> 중기원패스</button>
                    <button type="button" className="krds-btn large text" onClick={handleMyPageClick}><i className="svg-icon ico-my"></i> 마이비즈니스</button>
                    <button type="button" className="krds-btn large text" onClick={handleLogoutClick}><i className="svg-icon ico-logout"></i> 로그아웃</button>
                  </div>
                </>
              ) : (
                <>
                  {/* 로그인 전 */}
                  <button type="button" className="krds-btn large text" onClick={handleOnePassLoginClick}><i className="svg-icon ico-onepass"></i> 중기원패스</button>
                  <button type="button" className="krds-btn large text" onClick={handleLoginClick}><i className="svg-icon ico-log"></i> 로그인</button>
                  <button type="button" className="krds-btn large text"><i className="svg-icon ico-join"></i> 회원가입</button>
                  
                </>
              )}
            </div>

          </div>

          <div className="gnb-body" ref={gnbBodyRef}>
            <div className="gnb-menu">
              <div className="menu-wrap">
                <ul role="tablist">
                  {menus.map((menu, index) => (
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
                {menus.map((menu, index) => (
                  <div
                    className="gnb-sub-list"
                    id={`mGnb-anchor${index + 1}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${index}`}
                    key={menu.menuId}
                    ref={(element) => {
                      subMenuSectionRefs.current[index] = element;
                    }}
                  >
                    <h2 className="sub-title">{menu.menuNm}</h2>
                    <ul>
                      {menu.children.map((subMenu) => (
                        <li key={subMenu.menuId}>
                          <a {...resolveMenuLinkAttrs(subMenu.fullPath)} className="gnb-sub-trigger">{subMenu.menuNm}</a>
                          <ul className='subMenuLists'>
                            {(subMenu.children || []).map((depth3Menu) => (
                              <li key={depth3Menu.menuId}>
                                <a {...resolveMenuLinkAttrs(depth3Menu.fullPath)}>{depth3Menu.menuNm}</a>
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
          </div>

          <button type="button" className="krds-btn medium icon" id="close-nav" onClick={onClose}>
            <span className="sr-only">전체메뉴 닫기</span>
            <i className="svg-icon ico-popup-close"></i>
          </button>
        </div>
      </div>

      <FullSystemPopup isPopOpen={isPopOpen} setPopOpen={setPopOpen} />
    </>
  );
});

export default HeaderMobileGNB;
