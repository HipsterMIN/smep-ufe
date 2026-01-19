import React from "react";
import { NavLink } from "react-router-dom";
import { useSidebarStore } from "../../store/useSidebarStore";

const SideNavigation = ({ pageTitle, depth = [] }) => {
    const { openMenus, toggleMenu } = useSidebarStore();

    return (
        <nav className="krds-side-navigation">
            <h2 className="lnb-tit">{pageTitle}</h2>
            {/* lnb-list */}
            <ul className="lnb-list" role="menubar">
                {depth.map((item, index) => {
                    const hasDepth3 = item.depth3 && item.depth3.length > 0;
                    const menuId = `lnbmenu-${index}`;
                    const isOpen = openMenus[index] || false;

                    return (
                        <li
                            key={index}
                            className={`lnb-item${isOpen ? ' active' : ''}`}
                            role="none"
                        >
                            {hasDepth3 ? (
                                <>
                                    <button
                                        type="button"
                                        className={`lnb-btn lnb-toggle${isOpen ? ' active' : ''}`}
                                        role="menuitem"
                                        aria-controls={menuId}
                                        aria-expanded={isOpen ? "true" : "false"}
                                        onClick={() => toggleMenu(index)}
                                    >
                                        {item.depth2}
                                    </button>
                                    {/* lnb-submenu */}
                                    <div className="lnb-submenu">
                                        <ul id={menuId} role="menu">
                                            {item.depth3.map((subItem, subIndex) => (
                                                <li
                                                    key={subIndex}
                                                    className="lnb-subitem"
                                                    role="none"
                                                >
                                                    <NavLink
                                                        to={subItem.link || "#"}
                                                        className={({ isActive }) =>
                                                            `lnb-btn lnb-link${isActive ? ' active' : ''}`
                                                        }
                                                        role="menuitem"
                                                        aria-current={({ isActive }) => isActive ? "page" : undefined}
                                                    >
                                                        {subItem.label}
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
                                        {item.depth2}
                                    </NavLink>
                                ) : (
                                    <button
                                        type="button"
                                        className="lnb-btn"
                                        role="menuitem"
                                        onClick={item.onClick}
                                    >
                                        {item.depth2}
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