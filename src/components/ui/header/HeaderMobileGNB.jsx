import React, { useState, forwardRef } from 'react';

const HeaderMobileGNB = forwardRef(({ menus, onClose, userName, isLogin }, ref) => {
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

  return (
    <div id="mobile-nav" className="krds-main-menu-mobile" ref={ref}> 
      <div className="gnb-wrap">
        <div className="gnb-header">
          <div className="gnb-login">
            {isLogin ? (
              <>
                <span className="user">{userName}님</span>
                <button type="button" className="krds-btn large text"><i className="svg-icon ico-logout"></i> 로그아웃</button>
              </>
            ) : (
              <button type="button" className="krds-btn large text"><i className="svg-icon ico-log"></i> 로그인을 해주세요</button>
            )}
          </div>

          {/** HeaderUserMenu.jsx 개인/기업회원전환 디자인 변경 20260219 */}
          <div className="chip-wrap krds-tag-wrap large">
            {/* <select
              className="krds-form-select"
              style={{ minWidth: '180px' }}
              onChange={(e) => {
                const value = e.target.value;
                if (value && onSwitchContext) {
                  onSwitchContext(Number(value));
                }
              }}
            >
              <option value="">기업 전환</option>
              {linkedCompanies.map((company) => (
                <option key={company.companyId} value={company.companyId}>
                  {company.companyName}
                </option>
              ))}
            </select> */}

            <button
              type="button"
              className="krds-btn-tag"
              style={{
                backgroundColor: '#fff',
                color: '#000',
                border: '1px solid #ddd',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
              // onClick={() => onSwitchContext && onSwitchContext(null)}
            >
              개인회원전환
            </button>
        </div>


          <div className="sch-input">
            <input type="text" className="krds-input" placeholder="찾고자 하는 메뉴명을 입력해 주세요" title="찾고자 하는 메뉴명 입력"></input>
            <button type="button" className="krds-btn medium icon ico-search">
              <span className="sr-only">검색</span>
              <i className="svg-icon ico-sch"></i>
            </button>
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
                        <a href={subMenu.fullPath} className="gnb-sub-trigger">{subMenu.menuNm}</a>
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
  );
});

export default HeaderMobileGNB;
