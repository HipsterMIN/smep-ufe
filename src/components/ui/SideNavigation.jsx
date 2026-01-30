// src/components/ui/SideNavigation.jsx

import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebarStore } from '@store/useSidebarStore';

// ✅ 외부 링크 유틸리티 함수 (TODO : 데이터 구조 개선 시 제거)
const extractExternalUrl = (link) => {
  /*
  정규식 패턴: https?:\/\/.+
  - http      → 문자열 "http"와 정확히 일치
  - s?        → "s"가 0개 또는 1개 (http 또는 https 둘 다 매칭)
  - :         → 콜론 문자 ":"
  - \/\/      → 슬래시 2개 "//" (정규식에서 /는 특수문자라 \로 이스케이프)
  - .+        → 임의의 문자(.)가 1개 이상(+) 반복
  결과: "http://..." 또는 "https://..."로 시작하는 부분을 찾아서 반환
  예: "/do/https://example.com" → "https://example.com" 추출
   */
  if (!link) return null;
  const httpMatch = link.match(/https?:\/\/.+/);
  return httpMatch ? httpMatch[0] : null;
};

const SideNavigation = ({ pageTitle, menuItems = [] }) => {
  const { openMenus, toggleMenu, setOpenMenu } = useSidebarStore();
  const location = useLocation();

  useEffect(() => {
    menuItems.forEach((item, index) => {
      const hasChildren = item.children && item.children.length > 0;

      if (hasChildren) {
        const isCurrentPage = item.children.some(
          child => child.link === location.pathname,
        );

        if (isCurrentPage && !openMenus[index]) {
          setOpenMenu(index, true);
        }
      }
    });
  }, [menuItems, location.pathname]); // openMenus, setOpenMenu 의존성 제거 (무한루프 방지)

  return (
    <nav className="krds-side-navigation">
      <h2 className="lnb-tit">{pageTitle}</h2>
      <ul className="lnb-list" role="menubar">
        {menuItems.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const menuId = `lnbmenu-${index}`;
          const isOpen = openMenus[index] || false;

          return (
            <li
              key={item.menuId || index}
              className={`lnb-item${isOpen ? ' active' : ''}`}
              role="none"
            >
              {hasChildren ? (
                <>
                  <button
                    type="button"
                    className={`lnb-btn lnb-toggle${isOpen ? ' active' : ''}`}
                    role="menuitem"
                    aria-controls={menuId}
                    aria-expanded={isOpen ? 'true' : 'false'}
                    onClick={() => toggleMenu(index)}
                  >
                    {item.menuNm}
                  </button>
                  <div className="lnb-submenu">
                    <ul id={menuId} role="menu">
                      {item.children.map((subItem, subIndex) => {
                        const externalUrl = extractExternalUrl(subItem.link);

                        return (
                          <li
                            key={subItem.menuId || subIndex}
                            className="lnb-subitem"
                            role="none"
                          >
                            {externalUrl ? (
                              <a
                                href={externalUrl}
                                className="lnb-btn lnb-link"
                                role="menuitem"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {subItem.menuNm}
                              </a>
                            ) : (
                              <NavLink
                                to={subItem.link || '#'}
                                className={({ isActive }) =>
                                  `lnb-btn lnb-link${isActive ? ' active' : ''}`
                                }
                                role="menuitem"
                                aria-current={({ isActive }) => isActive ? 'page' : undefined}
                              >
                                {subItem.menuNm}
                              </NavLink>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              ) : (
                !item.children?.length && item.scrnTypeCd !== 'T' ? (
                  <button
                    type="button"
                    className="lnb-btn"
                    role="menuitem"
                    onClick={item.onClick}
                  >
                    {item.menuNm}
                  </button>
                ) : (
                  (() => {
                    const externalUrl = extractExternalUrl(item.link);

                    return externalUrl ? (
                      <a
                        href={externalUrl}
                        className="lnb-btn"
                        role="menuitem"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.menuNm}
                      </a>
                    ) : (
                      <NavLink
                        to={item.link}
                        className={({ isActive }) =>
                          `lnb-btn${isActive ? ' active' : ''}`
                        }
                        role="menuitem"
                      >
                        {item.menuNm}
                      </NavLink>
                    );
                  })()
                )
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SideNavigation;
