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

  return (
    <nav className="krds-main-menu">
      <div className="inner">
        <ul className="gnb-menu" aria-label="메인 메뉴">
          {menus.map((menu) => (
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
