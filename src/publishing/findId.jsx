import React, { useRef, useState } from "react";
//import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";

const UI_USR_L_010 = () => {
  const tabData = useRef(['사업유형별', '지원기간별']);
  const schFormWrapRef1 = useRef(null);
  const schFormWrapRef2 = useRef(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [likedItems, setLikedItems] = useState({});

  const handleToggleFilter = (tabIndex) => {
    const ref = tabIndex === 0 ? schFormWrapRef1 : schFormWrapRef2;
    ref.current.classList.toggle('on');
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
    depth1Title: "신청·발급",
    depth: [
      {
        depth2: "AI 스마트 통합 검색",
      },
      {
        depth2: "중소벤처기업부 지원사업 소개",
        active: true,
      },
      {
        depth2: "사업공고",
      },
      {
        depth2: "정책금융",
      },
      {
        depth2: "증명서 발급",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "신청·발급", link: "#" },
    { label: "중소벤처기업부 지원사업 소개", link: "#" },
  ];

  return (
    <>
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">중소벤처기업부 지원사업 소개</h2>
        </div>

        <div className="krds-tab-area layer">
            <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>

            <div className="tab-conts-wrap">
              <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
                 <h3 className="sr-only">사업유형별</h3>
                 <div className="search-top-box">
                    <div className="sch-form-wrap" ref={schFormWrapRef1}>
                      <select className="krds-form-select medium" title="공고상태 선택"> {/* 웹접근성 반영 */}
                        <option value="">공고상태 전체</option>
                      </select>
                      <select className="krds-form-select medium" title="검색구분 선택"> {/* 웹접근성 반영 */}
                        <option value="">검색구분 전체</option>
                      </select>
                      <div className="sch-input">
                        <input type="text" className="krds-input medium" placeholder="공고명·사업명·기관명으로 검색하세요" title="공고명·사업명·기관명 검색" />
                        <button type="button" className="krds-btn medium icon ico-search" >
                          <span className="sr-only">검색</span>
                          <i className="svg-icon ico-sch"></i>
                        </button>
                      </div>
                      <button type="button" className="krds-btn small text" onClick={() => handleToggleFilter(0)}><i className="svg-icon ico-sch-plus"></i>
                        상세검색
                        <span className="onfilter-open sr-only">열기</span>
                        <span className="onfilter-close sr-only">닫기</span>
                      </button>
                    </div>
                    <div className="sch-filter-box">
                      <div className="filter-form">
                        <div className="on-flexwrap on-mw100p">
                          <label className="label">사업유형</label>
                          <div className="krds-check-area">
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_1" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_1">금융</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_2" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_2">기술</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_3" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_3">인력</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_4" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_4">수출</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_5" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_5">내수</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_6" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_6">창업</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_7" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_7">경영</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_8" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_8">소상공인</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_9" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_9">중견</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_10" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_10">기타</label>
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
                              금융
                              <button type="button" className="btn-delete">
                                <span className="sr-only">삭제</span>
                              </button>
                            </span>
                            <span className="krds-btn-tag">
                              서울
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
                      <li>검색 결과 <span className="point">24</span>개</li>
                    </ul>
                    <ul className="sch-sort">
                      <li>
                        <strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
                        <select className="krds-form-select-sort" id="search_result_count">
                          <option>12개</option>
                          <option>9개</option>
                        </select>
                      </li>
                      <li>
                        <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
                        <div className="w-sort-btn">
                          <button type="button" className="active">등록일순<span className="sr-only">선택됨</span></button>
                          <button type="button">마감일순</button>
                        </div>
                        <div className="m-sort-btn">
                          <select className="krds-form-select-sort" id="sort">
                            <option>등록일순</option>
                            <option>마감일수</option>
                          </select>
                        </div>
                      </li>
                    </ul>
                </div>
                <ul className="krds-structured-list">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <li className="structured-item" key={index}>
                      <div className="card-top">
                        <span className="krds-badge bg-light-primary">경영</span>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit no-icon"><span className="span onellipsis-2">2026년 소공인 복합지원센터 구축ㆍ운영사업 본공모</span></p>
                          <p className="c-txt onellipsis-2">
                            소공인 집적지 활성화와 혁신성장 기반 조성을 위한「2026년 소공인 복합지원센터 구축ㆍ운영사업 본공모」를 다음과 같이 공고하오니 참여하고자 하는 지방자치단체는 공고문에 따라 신청하시기 바랍니다.
                          </p>
                          <p className="c-date">
                            <strong className="key">진행중인 공고</strong>
                            <span className="value">3건</span>
                          </p>
                        </a>
                      </div>
                      <div className="card-btn">
                        <button type="button" className="krds-btn text" title="다문화가족 자녀 언어발달지원서비스" onClick={() => handleToggleLike(index)}> <i className={`svg-icon ico-like on-bgcolorgray ${likedItems[index] ? 'on' : ''}`}></i></button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Pagination /> 
              </section>
              <section className={`tab-conts ${activeTabIndex === 1 ? 'active' : ''}`}>
                 <h3 className="sr-only">지원기간별</h3>
                 <div className="search-top-box">
                    <div className="sch-form-wrap" ref={schFormWrapRef2}>
                      <select className="krds-form-select medium" title="공고상태 선택"> {/* 웹접근성 반영 */}
                        <option value="">공고상태 전체</option>
                      </select>
                      <select className="krds-form-select medium" title="검색구분 선택"> {/* 웹접근성 반영 */}
                        <option value="">검색구분 전체</option>
                      </select>
                      <div className="sch-input">
                        <input type="text"  className="krds-input medium" placeholder="공고명·사업명·기관명으로 검색하세요" title="검색어 입력" />
                        <button type="button" className="krds-btn medium icon ico-search" >
                          <span className="sr-only">검색</span>
                          <i className="svg-icon ico-sch"></i>
                        </button>
                      </div>
                      <button type="button" className="krds-btn small text" onClick={() => handleToggleFilter(1)}><i className="svg-icon ico-sch-plus"></i>
                        상세검색
                        <span className="onfilter-open sr-only">열기</span>
                        <span className="onfilter-close sr-only">닫기</span>
                      </button>
                    </div>
                    <div className="sch-filter-box">
                      <div className="filter-form">
                        <div className="on-flexwrap on-mw100p">
                          <label className="label">사업유형</label>
                          <div className="krds-check-area">
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_1" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_1">금융</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_2" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_2">기술</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_3" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_3">인력</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_4" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_4">수출</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_5" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_5">내수</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_6" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_6">창업</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_7" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_7">경영</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_8" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_8">소상공인</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_9" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_9">중견</label>
                            </div>
                            <div className="krds-form-chip small">
                              <input type="checkbox" className="checkbox" id="chk1_10" name="chk1"/>
                              <label className="krds-form-chip-outline" htmlFor="chk1_10">기타</label>
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
                              금융
                              <button type="button" className="btn-delete">
                                <span className="sr-only">삭제</span>
                              </button>
                            </span>
                            <span className="krds-btn-tag">
                              서울
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
                      <li>검색 결과 <span className="point">24</span>개</li>
                    </ul>
                    <ul className="sch-sort">
                      <li>
                        <strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
                        <select className="krds-form-select-sort" id="search_result_count">
                          <option>12개</option>
                          <option>9개</option>
                        </select>
                      </li>
                      <li>
                        <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
                        <div className="w-sort-btn">
                          <button type="button" className="active">등록일순<span className="sr-only">선택됨</span></button>
                          <button type="button">마감일순</button>
                        </div>
                        <div className="m-sort-btn">
                          <select className="krds-form-select-sort" id="sort">
                            <option>등록일순</option>
                            <option>마감일수</option>
                          </select>
                        </div>
                      </li>
                    </ul>
                </div>
                <ul className="krds-structured-list">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <li className="structured-item" key={index}>
                      <div className="card-top">
                        <span className="krds-badge bg-light-primary">경영</span>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit no-icon"><span className="span onellipsis-2">2026년 소공인 복합지원센터 구축ㆍ운영사업 본공모</span></p>
                          <p className="c-txt onellipsis-2">
                            소공인 집적지 활성화와 혁신성장 기반 조성을 위한「2026년 소공인 복합지원센터 구축ㆍ운영사업 본공모」를 다음과 같이 공고하오니 참여하고자 하는 지방자치단체는 공고문에 따라 신청하시기 바랍니다.
                          </p>
                          <p className="c-date">
                            <strong className="key">진행중인 공고</strong>
                            <span className="value">3건</span>
                          </p>
                        </a>
                      </div>
                      <div className="card-btn">
                        <button type="button" className="krds-btn medium text" title="다문화가족 자녀 언어발달지원서비스" onClick={() => handleToggleLike(index)}> <i className={`svg-icon ico-like on-bgcolorgray ${likedItems[index] ? 'on' : ''}`}></i></button>
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

export default UI_USR_L_010;