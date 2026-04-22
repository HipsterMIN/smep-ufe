import React, { useState, forwardRef } from 'react';
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

const HeaderMobileGNB = forwardRef(({
  menus,
  onClose,
  onLogin,
  onOnePassLogin,
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

  const handleMobileTabClick = (e, index) => {
    e.preventDefault();
    setActiveMobileTab(index);
    const targetId = `mGnb-anchor${index + 1}`;
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
                    <i class="svg-icon ico-system"></i> 유관시스템 둘러보기
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
                    <Link to="#" className="krds-btn large text"><i className="svg-icon ico-my"></i> 마이비즈니스</Link>
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

          <div className="gnb-body">
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
