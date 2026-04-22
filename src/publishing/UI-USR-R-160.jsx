import React, { useRef, useState } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";
import corpLogoImgs from "../assets/sub/ico_corp_logo1.svg";

const UI_USR_R_160 = () => {
  const tabData = useRef(['전체', '정책금융', '창업·벤처', '기술·R&D', '판로·수출', '인력·교육', '소상공인', '경영정보']);
  const schFormWrapRef1 = useRef(null);
  const schFormWrapRef2 = useRef(null);
	const [isOpen, setOpen] = useState(false); // 열기, 닫기 변수

  const [activeTabIndex, setActiveTabIndex] = useState(0);
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

  const navigationData = {
    depth1Title: "더 많은 서비스",
    depth: [
      {
        depth2: "유관기관 둘러보기",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "더 많은 서비스", link: "#" },
    { label: "유관기관 둘러보기", link: "#" },
  ];

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents w-full">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">유관기관 둘러보기</h2>
        </div>

        <div className="krds-tab-area layer">
            <p className="guide-txt custom">
							중소벤처기업부 및 산하 68개 핵심 플랫폼을 별도 가입 없이,<br/>
							<b>중소벤처24·기업마당</b> 통합 ID 하나로 이용하세요.
            </p>
            <div className="tab-conts-wrap mt-40">
              <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
                 <h3 className="sr-only">사업유형별</h3>
                 <div className="search-top-box mb-40">
                    <div className="sch-form-wrap" ref={schFormWrapRef1}>
                      <div className="sch-input">
                        <input type="text" className="krds-input" placeholder="검색어를 입력하세요" title="검색어 입력" />
                        <button type="button" className="krds-btn medium icon ico-search" >
                          <span className="sr-only">검색</span>
                          <i className="svg-icon ico-sch"></i>
                        </button>
                      </div>
                      <button type="button" className={`krds-btn medium text ${isOpen && 'on'}`} onClick={() => handleToggleFilter(0)}>
												기관선택
												<i className={`svg-icon ico-angle ${isOpen && 'up'}`}/>
                        
                        <span className="onfilter-open sr-only">열기</span>
                        <span className="onfilter-close sr-only">닫기</span>
                      </button>
                    </div>
                    <div className="sch-filter-box">
                      <div className="filter-form">
                        <div className="on-mw100p gap24">
                          <label className="label">기관별</label>
                          <div className="krds-check-area">
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_1" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_1">중소벤처기업진흥공단</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_2" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_2">소상공인시장진흥공단</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_3" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_3">창업진흥원</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_4" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_4">기술보증기금</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_5" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_5">중소기업기술정보진흥원</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_6" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_6">한국중소벤처기업유통원</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_7" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_7">대중소기업농어업협력재단</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_8" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_8">메인비즈협회</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_9" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_9">신용보증재단중앙회</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_10" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_10">한국벤처캐피탈협회</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_11" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_11">중소기업중앙회</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_12" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_12">중소벤처기업연구원</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_13" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_13">(사)벤처기업협회</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_14" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_14">한국창업보육협회</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_15" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_15">한국경영기술지도사회</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_16" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_16">창조경제혁신센터</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_17" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_17">중소기업융합중앙회</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_18" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_18">(재)장애인기업종합지원센터</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_19" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_19">이노비즈협회</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_20" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_20">KoDATA</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_21" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_21">(재)한국화학융합시험연구원</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_22" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_22">(재)여성기업종합지원센터</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <dl className="filter-chip">
                        <dt>선택된 필터 <span className="num">2</span></dt>
                        <dd>
                          <button type="button" className="krds-btn xlarge icon border">
                            <span className="sr-only">새로고침</span>
                            <i className="svg-icon ico-refresh"></i>
                          </button>
                          <div className="chip-wrap krds-tag-wrap large">
                            <span className="krds-btn-tag">
                              중소벤처기업진흥공단
                              <button type="button" className="btn-delete">
                                <span className="sr-only">삭제</span>
                              </button>
                            </span>
                            <span className="krds-btn-tag">
                              기술보증기금
                              <button type="button" className="btn-delete">
                                <span className="sr-only">삭제</span>
                              </button>
                            </span>
                            <span className="krds-btn-tag">
                              한국중소벤처기업유통원
                              <button type="button" className="btn-delete">
                                <span className="sr-only">삭제</span>
                              </button>
                            </span>
                          </div>
                        </dd>
                      </dl>
                    </div>
                </div>
								<Tab tabData={tabData.current} onTabChange={handleTabChange} />
                <ul className="krds-structured-list relate mt-40">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <li className="structured-item" key={index}>
                      <div className="card-top">
												<div className="corp-imgs">
													<img src={corpLogoImgs} alt="기업 로고" />
												</div>
                      </div>
                      <div className="card-body">
												<p className="no-icon c-sub-tit">
													<span className="onellipsis-1">중소벤처기업진흥공단</span>
												</p>
												<p className="no-icon c-bold-tit">
													<span className="onellipsis-2">기업인력애로센터 일자리매칭플랫폼 기업인력애로센터 일자리매칭플랫폼</span>
												</p>
												<p className="no-icon c-normal-tit mb-20">
													<span className="onellipsis-2">
														중소기업 구인난 해소를 위한 맞춤형 인재 매칭 중소기업 구인난 해소를 위한 맞춤형 인재 매칭
													</span>
												</p>
												<div className="hash-box">
													<span className="hashtag">#정책금융</span>
													<span className="hashtag">#창업·벤처</span>
												</div>
												<button type="button" className="krds-btn small tertiary go-btn">
													바로가기 <i className="svg-icon ico-angle right" />
												</button>
                      </div>


                    </li>
                  ))}
                </ul>
                <Pagination /> 
              </section>

              
            </div>
        </div>
        
      
      </div> 
    </>
  );
};

export default UI_USR_R_160;