import React, { useRef, useState } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";
import Tooltip from "../components/ui/Tooltip";

const UI_USR_L_030 = () => {
  const tabData = useRef(['전체', '융자', '보증', '보험']);
  const schFormWrapRef = useRef(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [likedItems, setLikedItems] = useState({});

  const handleToggleFilter = () => {
    schFormWrapRef.current.classList.toggle('on');
    
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
        depth2: "지원사업",
        active: true,
      },
      {
        depth2: "사업공고",
      },
      {
        depth2: "정책금융",
        active: true,
        depth3: [
          {
            label: "정책금융안내",
            link: "/main-dev/service/UI_USR_L_030",
            active: true,
          },
        ],
      },
      {
        depth2: "증명서 발급",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "신청·발급", link: "#" },
    { label: "정책금융", link: "#" },
    { label: "정책금융 안내", link: "#" },
  ];

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">정책금융</h2>
        </div>

        <div className="krds-tab-area layer">
            <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>
            <div className="conts-desc">
              장애아동수당은 현금 지급형 서비스로 한 달에 한 번, 현금으로 지급합니다.
              지급 금액은 장애 유형이나 소득 수준에 따라 달라질 수 있습니다.
            </div>            

            <div className="tab-conts-wrap">
              <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
                 <h3 className="sr-only">사업유형별</h3>
                 <div className="search-top-box">
                    <div className="sch-form-wrap" ref={schFormWrapRef}>
                      <select className="krds-form-select">
                        <option value="">전체</option>
                      </select>
                      <div className="sch-input">
                        <input type="text" className="krds-input" placeholder="금융상품 조회를 위한 검색어를 입력해주세요" title="검색어 입력" />
                        <button type="button" className="krds-btn medium icon ico-search" >
                          <span className="sr-only">검색</span>
                          <i className="svg-icon ico-sch"></i>
                        </button>
                      </div>
                      <button type="button" className="krds-btn medium text" onClick={() => handleToggleFilter(0)}><i className="svg-icon ico-sch-plus"></i>
                        상세검색
                        <span className="onfilter-open sr-only">열기</span>
                        <span className="onfilter-close sr-only">닫기</span>
                      </button>
                    </div>
                    <div className="sch-filter-box">
                      <div className="filter-form">
                        <div>
                          <label className="label" for="appl-sch-sel1">상품유형</label>
                          <select id="appl-sch-sel1" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div>
                          <label className="label" for="appl-sch-sel2">금융기관</label>
                          <select id="appl-sch-sel2" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div className="on-fit-width">
                          <label className="label" for="appl-sch-sel3">기업규모</label>
                          <select id="appl-sch-sel3" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                          <a href="#" className="krds-btn medium text" target="_blank" title="새 창 열림">
                            업종 <i className="svg-icon ico-go"></i>
                          </a>
                        </div>
                        <div>
                          <label className="label" for="appl-sch-sel4">접수상황</label>
                          <select id="appl-sch-sel4" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div>
                          <label className="label" for="appl-sch-sel5">우대기업</label>
                          <select id="appl-sch-sel5" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div>
                          <label className="label" for="appl-sch-sel6">신청방식</label>
                          <select id="appl-sch-sel6" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
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

                <div className="onhotbox">
                  <div className="onhot-title">
                    <p>
                      <i className="svg-icon ico-hot"></i>
                      인기 금융상품
                    </p>
                    <Tooltip tooltipText="인기 금융상품은 이용자가 가장 많이 찾는 금융정책상품입니다.">
                      <span className="sr-only">도움말</span>
                      <i className="svg-icon ico-help-gray"></i>
                    </Tooltip>
                  </div>
                  <div className="krds-tag-wrap">
                    <span className="krds-btn-tag">#개발기술사업화자금</span>
                    <span className="krds-btn-tag">#혁신성장지원자금</span>
                    <span className="krds-btn-tag">#수출기업글로벌화</span>
                  </div>
                </div>

                <div className="search-list-top">
                    <ul className="sch-info" aria-live="polite">
                      <li>검색 결과 <span className="point">24</span>개</li>
                    </ul>
                    <ul className="sch-sort">
                      <li>
                        <strong className="sort-label"><label for="search_result_count">목록 표시 개수</label></strong>
                        <select className="krds-form-select-sort" id="search_result_count">
                          <option>12개</option>
                          <option>9개</option>
                        </select>
                      </li>
                      <li>
                        <strong className="sort-label"><label for="sort">정렬기준</label></strong>
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
                <ul className="krds-structured-list type-full">
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                        <div className="krds-badge-wrap">
                          <span className="krds-badge bg-light-danger">인기</span>
                          <span className="krds-badge bg-light-primary">융자</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="c-txt onellipsis-2">
                            사업성과 기술성이 우수한 성장유망 중소기업의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.
                          </p>
                          <p className="on-list-btm">
                            <span> 
                              <i className="svg-icon ico-checkbox on-bgcolorblue"></i>
                              <strong className="on-colorblue">접수중</strong>
                            </span>
                            <span><strong>중소벤처기업진흥공단</strong></span>
                            <span><strong>지원대상</strong> 업력 7년 이상 중소기업</span>
                          </p>
                        </a>
                      </div>
                      <div className="card-btm">
                        <span className="tag">혁신성장</span>
                        <span className="tag">정책자금</span>
                        <span className="tag">중소기업</span>
                        <span className="tag">기업자금</span>
                      </div>
                      <div className="card-btn">
                        <span className="krds-btn text">
                          <span className="sr-only">조회수</span>
                          <i className="svg-icon ico-pw-visible-on"></i>
                          <span>22202</span>
                        </span>
                        <button type="button" className="krds-btn text"><i className="svg-icon ico-like on-bgcolorgray"></i></button>
                      </div>
                    </div>
                  </li>
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                        <div className="krds-badge-wrap">
                          <span className="krds-badge bg-light-success">신규</span>
                          <span className="krds-badge bg-light-primary">융자</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="c-txt onellipsis-2">
                            사업성과 기술성이 우수한 성장유망 중소기업의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.
                          </p>
                          <p className="on-list-btm">
                            <span> 
                              <i className="svg-icon ico-checkbox on-bgcolorblue"></i>
                              <strong className="on-colorblue">접수중</strong>
                            </span>
                            <span><strong>중소벤처기업진흥공단</strong></span>
                            <span><strong>지원대상</strong> 업력 7년 이상 중소기업</span>
                          </p>
                        </a>
                      </div>
                      <div className="card-btm">
                        <span className="tag">혁신성장</span>
                        <span className="tag">정책자금</span>
                        <span className="tag">중소기업</span>
                        <span className="tag">기업자금</span>
                      </div>
                      <div className="card-btn">
                        <span className="krds-btn text">
                          <span className="sr-only">조회수</span>
                          <i className="svg-icon ico-pw-visible-on"></i>
                          <span>22202</span>
                        </span>
                        <button type="button" className="krds-btn text"><i className="svg-icon ico-like on-bgcolorgray"></i></button>
                      </div>
                    </div>
                  </li>
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                        <div className="krds-badge-wrap">
                          <span className="krds-badge bg-light-danger">인기</span>
                          <span className="krds-badge bg-light-primary">융자</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="c-txt onellipsis-2">
                            사업성과 기술성이 우수한 성장유망 중소기업의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.
                          </p>
                          <p className="on-list-btm">
                            <span> 
                              <i className="svg-icon ico-checkbox on-bgcolorblue"></i>
                              <strong className="on-colorblue">접수중</strong>
                            </span>
                            <span><strong>중소벤처기업진흥공단</strong></span>
                            <span><strong>지원대상</strong> 업력 7년 이상 중소기업</span>
                          </p>
                        </a>
                      </div>
                      <div className="card-btm">
                        <span className="tag">혁신성장</span>
                        <span className="tag">정책자금</span>
                        <span className="tag">중소기업</span>
                        <span className="tag">기업자금</span>
                      </div>
                      <div className="card-btn">
                        <span className="krds-btn text">
                          <span className="sr-only">조회수</span>
                          <i className="svg-icon ico-pw-visible-on"></i>
                          <span>22202</span>
                        </span>
                        <button type="button" className="krds-btn text"><i className="svg-icon ico-like on-bgcolorgray"></i></button>
                      </div>
                    </div>
                  </li>
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                        <div className="krds-badge-wrap">
                          <span className="krds-badge bg-light-danger">인기</span>
                          <span className="krds-badge bg-light-primary">융자</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="c-txt onellipsis-2">
                            사업성과 기술성이 우수한 성장유망 중소기업의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.
                          </p>
                          <p className="on-list-btm">
                            <span> 
                              <i className="svg-icon ico-checkbox on-bgcolorblue"></i>
                              <strong className="on-colorblue">접수중</strong>
                            </span>
                            <span><strong>중소벤처기업진흥공단</strong></span>
                            <span><strong>지원대상</strong> 업력 7년 이상 중소기업</span>
                          </p>
                        </a>
                      </div>
                      <div className="card-btm">
                        <span className="tag">혁신성장</span>
                        <span className="tag">정책자금</span>
                        <span className="tag">중소기업</span>
                        <span className="tag">기업자금</span>
                      </div>
                      <div className="card-btn">
                        <span className="krds-btn text">
                          <span className="sr-only">조회수</span>
                          <i className="svg-icon ico-pw-visible-on"></i>
                          <span>22202</span>
                        </span>
                        <button type="button" className="krds-btn text"><i className="svg-icon ico-like on-bgcolorgray on"></i></button>
                      </div>
                    </div>
                  </li>
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                        <div className="krds-badge-wrap">
                          <span className="krds-badge bg-light-danger">인기</span>
                          <span className="krds-badge bg-light-primary">융자</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="c-txt onellipsis-2">
                            사업성과 기술성이 우수한 성장유망 중소기업의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.
                          </p>
                          <p className="on-list-btm">
                            <span> 
                              <i className="svg-icon ico-checkbox on-bgcolorblue"></i>
                              <strong className="on-colorblue">접수중</strong>
                            </span>
                            <span><strong>중소벤처기업진흥공단</strong></span>
                            <span><strong>지원대상</strong> 업력 7년 이상 중소기업</span>
                          </p>
                        </a>
                      </div>
                      <div className="card-btm">
                        <span className="tag">혁신성장</span>
                        <span className="tag">정책자금</span>
                        <span className="tag">중소기업</span>
                        <span className="tag">기업자금</span>
                      </div>
                      <div className="card-btn">
                        <span className="krds-btn text">
                          <span className="sr-only">조회수</span>
                          <i className="svg-icon ico-pw-visible-on"></i>
                          <span>22202</span>
                        </span>
                        <button type="button" className="krds-btn text"><i className="svg-icon ico-like on-bgcolorgray"></i></button>
                      </div>
                    </div>
                  </li>
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                        <div className="krds-badge-wrap">
                          <span className="krds-badge bg-light-danger">인기</span>
                          <span className="krds-badge bg-light-primary">융자</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="c-txt onellipsis-2">
                            사업성과 기술성이 우수한 성장유망 중소기업의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.
                          </p>
                          <p className="on-list-btm">
                            <span><strong className="on-colorgray">접수마감</strong></span>
                            <span><strong>중소벤처기업진흥공단</strong></span>
                            <span><strong>지원대상</strong> 업력 7년 이상 중소기업</span>
                          </p>
                        </a>
                      </div>
                      <div className="card-btm">
                        <span className="tag">혁신성장</span>
                        <span className="tag">정책자금</span>
                        <span className="tag">중소기업</span>
                        <span className="tag">기업자금</span>
                      </div>
                      <div className="card-btn">
                        <span className="krds-btn text">
                          <span className="sr-only">조회수</span>
                          <i className="svg-icon ico-pw-visible-on"></i>
                          <span>22202</span>
                        </span>
                        <button type="button" className="krds-btn text"><i className="svg-icon ico-like on-bgcolorgray"></i></button>
                      </div>
                    </div>
                  </li>
                </ul>
                {/* <Pagination />  */}
              </section>
            </div>
        </div>
      </div> 
    </>
  );
};

export default UI_USR_L_030;