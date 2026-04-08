import React, { useRef, useState, useEffect } from "react";
import Tab from "./Tab";
import corpLogoImgs from "../../assets/sub/ico_corp_logo1.svg";

const FullSystemPopup = ({ isPopOpen, setPopOpen }) => {
  
  useEffect(() => {
    if (isPopOpen) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isPopOpen]);

  const tabData = useRef(['전체', '정책금융', '창업·벤처', '기술·R&D', '판로·수출', '인력·교육', '소상공인', '경영정보']);
  const schFormWrapRef1 = useRef(null);
  const schFormWrapRef2 = useRef(null);
  const [isOpen, setOpen] = useState(false); // 열기, 닫기 변수

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [memberType, setMemberType] = useState('personal');
  const [likedItems, setLikedItems] = useState({});

  const handleToggleFilter = (tabIndex) => {
    const ref = tabIndex === 0 ? schFormWrapRef1 : schFormWrapRef2;
    ref.current.classList.toggle('on');
    setOpen(!isOpen);
  };
  const handleToggleLike = (index) => {
    setLikedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };


  return (
    <>
      <div className={`contents system-popup ${ isPopOpen && `show`}`}>
        <div className="onContainer">
          
          <div className="page-title-wrap" data-type="responsive">
            <h2 className="h-tit">유관기관 둘러보기</h2>

            <div className="member-type-toggle-wrap">
              <div className="member-type-toggle">
                <button
                  type="button"
                  className={memberType === 'personal' ? 'toggle-item selected' : 'toggle-item'}
                  onClick={() => setMemberType('personal')}
                >
                  개인회원
                </button>
                <button
                  type="button"
                  className={memberType === 'corporate' ? 'toggle-item selected' : 'toggle-item'}
                  onClick={() => setMemberType('corporate')}
                >
                  기업회원
                </button>
              </div>
            </div>
            
            <button
              type="button"
              className="krds-btn icon ico-clear"
              onClick={() => setPopOpen(false)}
            >
              <i className="svg-icon ico-del"></i>
            </button>
          </div>
          

          <div className="krds-tab-area layer">
            <div className="tab-conts-wrap mt-40">
              <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
                <Tab tabData={tabData.current} onTabChange={handleTabChange} />
                <ul className="krds-structured-list horizontal mt-40">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <li className="structured-item" key={index}>
                      <div className="card-horizontal">
                        <div className="corp-imgs">
                          <img src={corpLogoImgs} alt="기업 로고" />
                        </div>
                        <div className="c-h-info">
                          <h2 className="onellipsis-1">비대면스마트진단시스템 (K-doctor) 제목추가</h2>
                          <p>
                            <span>창업·벤처</span>
                            <span>정책금융</span>
                          </p>
                        </div>
                        <i className="svg-icon ico-angle right sm"></i>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
          <div className="onInfoBox">
            <ul>
              <li>
                ※ 통합 로그인 사이트는 중소벤처기업부에서 운영하는 다양한 서비스를 한번의 로그인으로 쉽고 빠르게 이용할 수 있도록 제공하는 중소벤처기업을 위한 통합 인증서비스 입니다.<br/>
                중소벤처24의 회원으로 가입하신 후 자주 찾는 사이트를 등록하실 수 있습니다 <strong>(본 서비스는 해당 사이트에 회원가입 및 본인인증 후 사용하실 수 있습니다.)</strong>
              </li>
              <li>※ 통합로그인 기능을 원할히 사용하기 위해서는 팝업 차단을 해제해 주셔야 합니다.</li>
              <li>※ 통합로그인 기능을 사용하기 위해서는 로그인을 해주셔야 합니다.</li>
              <li>※ 통합로그인 관련 문의 : (044) 300-0990, (044) 300-0991</li>
            </ul>
          </div>
        </div>
      </div> 
    </>
  );
};

export default FullSystemPopup;