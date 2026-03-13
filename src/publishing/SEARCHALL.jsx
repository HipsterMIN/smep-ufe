import React, { useRef, useState } from "react";
import Header from "../components/ui/Header.jsx";
import Footer from "../components/ui/Footer.jsx";
import Breadcrumb from "../components/ui/Breadcrumb.jsx";
import Tab from "../components/ui/Tab";

const SEARCHALL = () => {
  const tabData = useRef(['전체(2398)', '지원사업(340)', '증명서 발급(3)', '정책‧법령 정보(32)', '더 많은 서비스(2330)', '고객지원(3)']);
  const schFormWrapRef1 = useRef(null);
  const schFormWrapRef2 = useRef(null);
  const searchOptionModalRef = useRef(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  const handleOpenSearchOptionModal = () => {
    searchOptionModalRef.current.classList.add('on');
  }
  const handleCloseSearchOptionModal = () => {
    searchOptionModalRef.current.classList.remove('on');
  }

  const handleToggleFilter = (tabIndex) => {
    const ref = tabIndex === 0 ? schFormWrapRef1 : schFormWrapRef2;
    ref.current?.classList.toggle('on');
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };
  
  const breadcrumbItems = [
    { label: "통합 검색", link: "#" },
  ];

  return (
    <div id="wrap" className="integrated-search">
      <Header />
      <div id="container" className="on-gradientpage">
        <div className="inner">
          <div className="totalsearch-wrap">
            <Breadcrumb items={breadcrumbItems}/>
            <div className="page-title-wrap" data-type="responsive">
              <h2 className="h-tit ac">통합검색</h2>
            </div>
            
            <div className="onsearch-input-box">
              <div className="boxinner">
                <input type="text" />
                <button type="button"><i className="svg-icon ico-sch" style={{ backgroundColor : '#256EF4' }}></i></button>
              </div>
              <button type="button" className="krds-btn large text" onClick={handleOpenSearchOptionModal}><i className="svg-icon ico-sch-plus"></i>
                상세검색
                <span className="sr-only">툴팁 열기</span>
              </button>
              <div className="on-tooltipbox" ref={searchOptionModalRef}>
                <div className="on-tooltipbox-header">
                  <h3>상세검색</h3>
                  <button type="button" className="krds-btn medium text" onClick={handleCloseSearchOptionModal}><i className="svg-icon ico-modal-close"></i>
                    <span className="sr-only">상세검색 툴팁 닫기</span>
                  </button>
                </div>
                <div className="on-tooltipbox-body">
                  <div className="on-searchoption">
                    <div className="on-searchoption-checklists">
                      <h4>지역</h4>
                      <div className="krds-check-area">
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_1" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_1">전체</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_2" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_2">서울</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_3" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_3">부산</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_4" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_4">대구</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_5" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_5">인천</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_6" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_6">광주</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_7" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_7">대전</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_8" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_8">울산</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_9" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_9">세종</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_10" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_10">경기</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_11" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_11">강원</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_12" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_12">충북</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_13" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_13">충남</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_14" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_14">전북</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_15" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_15">전남</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_16" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_16">경북</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_17" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_17">경남</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk1_18" name="chk1"/>
                          <label className="krds-form-chip-outline" htmlFor="chk1_18">제주</label>
                        </div>
                      </div>
                    </div>
                      <div className="on-searchoption-checklists">
                      <h4>지역</h4>
                      <div className="krds-check-area">
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk2_1" name="chk2"/>
                          <label className="krds-form-chip-outline" htmlFor="chk2_1">기술개발</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk2_2" name="chk2"/>
                          <label className="krds-form-chip-outline" htmlFor="chk2_2">자금지원</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk2_3" name="chk2"/>
                          <label className="krds-form-chip-outline" htmlFor="chk2_3">판로개척</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk2_4" name="chk2"/>
                          <label className="krds-form-chip-outline" htmlFor="chk2_4">창업지원</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk2_5" name="chk2"/>
                          <label className="krds-form-chip-outline" htmlFor="chk2_5">시설·설비</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk2_6" name="chk2"/>
                          <label className="krds-form-chip-outline" htmlFor="chk2_6">인력양성</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk2_7" name="chk2"/>
                          <label className="krds-form-chip-outline" htmlFor="chk2_7">경영지원</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk2_8" name="chk2"/>
                          <label className="krds-form-chip-outline" htmlFor="chk2_8">해외진출</label>
                        </div>
                        <div className="krds-form-chip small">
                          <input type="checkbox" className="checkbox" id="chk2_9" name="chk2"/>
                          <label className="krds-form-chip-outline" htmlFor="chk2_9">기타</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="on-searchoption flexrow">
                    <div className="on-searchoption-selectlists">
                      <div>
                        <h4>기업규모</h4>
                        <select className="krds-form-select small">
                          <option value="">전체</option>
                        </select>
                      </div>
                    </div>
                    <div className="on-searchoption-selectlists">
                      <div>
                        <h4>지원유형</h4>
                        <select className="krds-form-select small">
                          <option value="">전체</option>
                        </select>
                      </div>
                    </div>
                    <div className="on-searchoption-selectlists">
                      <div>
                        <h4>접수유형</h4>
                        <select className="krds-form-select small">
                          <option value="">전체</option>
                        </select>
                      </div>
                    </div>
                    <div className="on-searchoption-selectlists">
                      <div>
                        <h4>신청현황</h4>
                        <select className="krds-form-select small">
                          <option value="">전체</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="on-tooltipbox-footer">
                  <button className="krds-btn medium primary">검색하기</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="integrated-result">
        <div className="inner">
          <div className="krds-tab-area layer">

            <div className="search-top-box">
              <div className="sch-filter-box">
                <dl className="filter-chip">
                  <dt>적용된 상세검색 조건 <span className="num point">2</span></dt>
                  <dd>
                    <button type="button" className="krds-btn xlarge icon border">
                      <span className="sr-only">새로고침</span>
                      <i className="svg-icon ico-refresh"></i>
                    </button>
                    <div className="chip-wrap krds-tag-wrap large">
                      <span className="krds-btn-tag">
                        뉴스
                        <button type="button" className="btn-delete">
                          <span className="sr-only">삭제</span>
                        </button>
                      </span>
                      <span className="krds-btn-tag">
                        자주 묻는 질문
                        <button type="button" className="btn-delete">
                          <span className="sr-only">삭제</span>
                        </button>
                      </span>
                      <span className="krds-btn-tag">
                        자료
                        <button type="button" className="btn-delete">
                          <span className="sr-only">삭제</span>
                        </button>
                      </span>
                      <span className="krds-btn-tag">
                        법령
                        <button type="button" className="btn-delete">
                          <span className="sr-only">삭제</span>
                        </button>
                      </span>
                      <span className="krds-btn-tag">
                        3개월
                        <button type="button" className="btn-delete">
                          <span className="sr-only">삭제</span>
                        </button>
                      </span>
                      <span className="krds-btn-tag">
                        PDF
                        <button type="button" className="btn-delete">
                          <span className="sr-only">삭제</span>
                        </button>
                      </span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>

            <div className="search-list-top">
              <ul className="sch-info" aria-live="polite">
                <li>적용된 검색어 ‘<span className="point">지원</span>’</li>
                <li>검색 결과 <span className="point">22,459</span> 건</li>
              </ul>
            </div>
            <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>
                    

            <div className="tab-conts-wrap">
              <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}></section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SEARCHALL;
