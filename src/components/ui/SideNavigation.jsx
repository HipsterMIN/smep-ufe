import React from "react";

const SideNavigation = ({ pageTitle, depth = [] }) => {
  return (
    <nav className="krds-side-navigation">
      <h2 className="lnb-tit">{pageTitle}</h2>
      {/* lnb-list */}
      <ul className="lnb-list" role="menubar">
        {depth.map((item, index) => {
          const hasDepth3 = item.depth3 && item.depth3.length > 0;
          const menuId = `lnbmenu-${index}`;

          return (
            <li
              key={index}
              className={`lnb-item${item.active ? ' active' : ''}`}
              role="none"
            >
              {hasDepth3 ? (
                <>
                  <button
                    type="button"
                    className={`lnb-btn lnb-toggle${item.active ? ' active' : ''}`}
                    role="menuitem"
                    aria-controls={menuId}
                    aria-expanded={item.active ? "true" : "false"}
                  >
                    {item.depth2}
                  </button>
                  {/* lnb-submenu */}
                  <div className="lnb-submenu">
                    <ul id={menuId} role="menu">
                      {item.depth3.map((subItem, subIndex) => (
                        <li
                          key={subIndex}
                          className={`lnb-subitem${subItem.active ? ' active' : ''}`}
                          role="none"
                        >
                          <a
                            href={subItem.link || "#"}
                            className="lnb-btn lnb-link"
                            role="menuitem"
                            aria-current={subItem.active ? "page" : undefined}
                          >
                            {subItem.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* //lnb-submenu */}
                </>
              ) : (
                <button
                  type="button"
                  className="lnb-btn"
                  role="menuitem"
                  onClick={item.onClick}
                >
                  {item.depth2}
                </button>
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
