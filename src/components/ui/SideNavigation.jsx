// src/components/ui/SideNavigation.jsx

import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebarStore } from '../../store/useSidebarStore';

const SideNavigation = ({ pageTitle, menuItems = [] }) => {
  const { openMenus, toggleMenu, setOpenMenu } = useSidebarStore();
  const location = useLocation(); // ✅ 현재 URL

  // ✅ 페이지 진입 시 현재 URL에 해당하는 depth2 메뉴 자동 열기
  useEffect(() => {
    menuItems.forEach((item, index) => {
      const hasChildren = item.children && item.children.length > 0;

      if (hasChildren) {
        // 자식 메뉴 중에 현재 페이지가 있는지 확인
        const isCurrentPage = item.children.some(
          child => child.link === location.pathname,
        );

        // 있으면 해당 메뉴 열기
        if (isCurrentPage && !openMenus[index]) {
          setOpenMenu(index, true);
        }
      }
    });
  }, [menuItems, location.pathname]); // openMenus, setOpenMenu 의존성 제거 (무한루프 방지)

  return (
    <nav className="krds-side-navigation">
      <h2 className="lnb-tit">{pageTitle}</h2>
      {/* lnb-list */}
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
                  {/* lnb-submenu */}
                  <div className="lnb-submenu">
                    <ul id={menuId} role="menu">
                      {item.children.map((subItem, subIndex) => (
                        <li
                          key={subItem.menuId || subIndex}
                          className="lnb-subitem"
                          role="none"
                        >
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
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* //lnb-submenu */}
                </>
              ) : (
                item.link ? (
                  <NavLink
                    to={item.link}
                    className={({ isActive }) =>
                      `lnb-btn${isActive ? ' active' : ''}`
                    }
                    role="menuitem"
                  >
                    {item.menuNm}
                  </NavLink>
                ) : (
                  <button
                    type="button"
                    className="lnb-btn"
                    role="menuitem"
                    onClick={item.onClick}
                  >
                    {item.menuNm}
                  </button>
                )
              )}
            </li>
          );
        })}
      </ul>
      {/* //lnb-list */}
    </nav>
  );
};

export default SideNavigation;
