import React, { useState, useRef } from 'react';

const HeaderDesktopGNB = ({ menus }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const openTimeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);

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
    }, 230);
  };

  // tab키 이동 (접근성 추가)
  const handleFocus = (menuId) => {
    clearTimeout(closeTimeoutRef.current);
    clearTimeout(openTimeoutRef.current);
    setOpenIndex(menuId);
  }

  // tab 키로 메뉴 탐색하다 esc 눌러서 닫고, 다시 메뉴 탐색할때 active 버튼으로 돌아가기
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && openIndex !== null) {
      setOpenIndex(null);
      // 열었던 버튼으로 포커스 복귀
      document.querySelector('.gnb-main-trigger.active')?.focus();
    }
  };

  return (
    <nav className="krds-main-menu">
      <div className="inner">
        <ul className="gnb-menu" aria-label="메인 메뉴" onKeyDown={handleKeyDown}>
          {menus.map((menu) => (
            <li 
              key={menu.menuId}
              onMouseEnter={() => handleMouseEnter(menu.menuId)}
              onMouseLeave={handleMouseLeave}
              onBlur={(e) => {
                // li 내부 어딘가로 포커스가 이동하는 경우는 닫지 않음
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  clearTimeout(openTimeoutRef.current);
                  setOpenIndex(null);
                }
              }}
            >
              <button
                type="button"
                className={`gnb-main-trigger ${openIndex === menu.menuId ? 'active' : ''}`}
                onFocus={() => handleFocus(menu.menuId)} //키보드  tab키  event
                aria-haspopup="true"
                aria-expanded={openIndex === menu.menuId}
              >
                {menu.menuNm}
              </button>
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
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default HeaderDesktopGNB;
