// src/components/ui/SideNavigation.jsx

import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebarStore } from '@store/useSidebarStore';
import { extractExternalUrl } from '@utils/menuUtils.js';

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
