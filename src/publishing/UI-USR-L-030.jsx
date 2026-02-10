import React, { useRef, useState } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";
import Tooltip from "../components/ui/Tooltip";
import Popup from '../components/ui/Popup';

const UI_USR_L_030 = () => {
  const tabData = useRef(['전체', '융자', '보증', '보험']);
  const schFormWrapRef1 = useRef(null);
  const schFormWrapRef2 = useRef(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [likedItems, setLikedItems] = useState({});
  // 상품 비교 팝업 동작
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // 업종선택 팝업 동작
  const [isPopupOpen02, setIsPopupOpen02] = useState(false); 

  const handleToggleFilter = (tabIndex) => {
    const ref = tabIndex === 0 ? schFormWrapRef1 : schFormWrapRef2;
    ref.current?.classList.toggle('on');
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
                    <div className="sch-form-wrap" ref={schFormWrapRef1}>
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
                          <label className="label" htmlFor="appl-sch-sel1">상품유형</label>
                          <select id="appl-sch-sel1" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div>
                          <label className="label" htmlFor="appl-sch-sel2">금융기관</label>
                          <select id="appl-sch-sel2" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div className="on-fit-width">
                          <label className="label" htmlFor="appl-sch-sel3">기업규모</label>
                          <select id="appl-sch-sel3" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                          <button type="button" className="krds-btn medium text" onClick={() => setIsPopupOpen02(true)} >
                            업종<i className="svg-icon ico-go"></i>
                          </button>
                        </div>
                        <div>
                          <label className="label" htmlFor="appl-sch-sel4">접수상황</label>
                          <select id="appl-sch-sel4" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div>
                          <label className="label" htmlFor="appl-sch-sel5">우대기업</label>
                          <select id="appl-sch-sel5" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div>
                          <label className="label" htmlFor="appl-sch-sel6">신청방식</label>
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
                            <option>마감일순</option>
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
                <Pagination /> 
              </section>

               <section className={`tab-conts ${activeTabIndex === 1 ? 'active' : ''}`}>
                 <h3 className="sr-only">사업유형별</h3>
                 <div className="search-top-box">
                    <div className="sch-form-wrap" ref={schFormWrapRef2}>
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
                      <button type="button" className="krds-btn medium text" onClick={() => handleToggleFilter(1)}><i className="svg-icon ico-sch-plus"></i>
                        상세검색
                        <span className="onfilter-open sr-only">열기</span>
                        <span className="onfilter-close sr-only">닫기</span>
                      </button>
                    </div>
                    <div className="sch-filter-box">
                      <div className="filter-form">
                        <div>
                          <label className="label" htmlFor="appl-sch-sel1">상품유형</label>
                          <select id="appl-sch-sel1" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div>
                          <label className="label" htmlFor="appl-sch-sel2">금융기관</label>
                          <select id="appl-sch-sel2" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div className="on-fit-width">
                          <label className="label" htmlFor="appl-sch-sel3">기업규모</label>
                          <select id="appl-sch-sel3" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                          <a href="#" className="krds-btn medium text" target="_blank" title="새 창 열림">
                            업종 <i className="svg-icon ico-go"></i>
                          </a>
                        </div>
                        <div className="on-mw100p">
                          <label className="label" htmlFor="appl-sch-txt1">테마업종명</label>
                          <input type="text" id="appl-sch-txt1" className="krds-input medium" placeholder="내용을 입력하세요" title="테마업종명" />
                        </div>

                        <div>
                          <label className="label" htmlFor="appl-sch-sel4">접수상황</label>
                          <select id="appl-sch-sel4" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div>
                          <label className="label" htmlFor="appl-sch-sel5">우대기업</label>
                          <select id="appl-sch-sel5" className="krds-form-select medium">
                            <option value="">전체</option>
                            <option value="">항목</option>
                            <option value="">항목</option>
                          </select>
                        </div>
                        <div>
                          <label className="label" htmlFor="appl-sch-sel6">신청방식</label>
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
                            <option>마감일순</option>
                          </select>
                        </div>
                      </li>
                      <li>
                        <button type="button" className="krds-btn medium primary" onClick={() => setIsPopupOpen(true)} >
                          <i className="svg-icon ico-round-check"></i>
                          상품비교
                        </button>
                         <Popup 
                          isOpen={isPopupOpen} 
                          onClose={() => setIsPopupOpen(false)} 
                          title="상품비교"
                          footer={
                            <>
                              <button type="button" className="krds-btn tertiary medium" onClick={() => setIsPopupOpen(false)}>닫기</button>
                              <button type="button" className="krds-btn primary medium">적용</button>
                            </>
                          }
                        >
                          <div>
                            
                            <div className="conts-wrap">
                              <h2 className="sec-tit">발급 대상 기업</h2>
                              <div className="krds-table-wrap">
                                <table className="tbl col data tbl-row"> {/* row타입 테이블 class명: tbl-row */}
                                  <caption>발급 대상 기업 표. 사업자등록번호, 기업명, 대표자명 정보가 제공됨.  </caption>
                                  <colgroup>
                                    <col style={{ width: '10%' }} />
                                    <col />
                                    <col />
                                  </colgroup>
                                  <tbody>
                                    <tr>
                                      <th scope="row" className="ac">상품명</th>
                                      <th scope="row" className="ac">수출기업글로벌화</th>
                                      <th scope="row" className="ac">사업수행기관</th>
                                    </tr>
                                    <tr>
                                      <th scope="row" className="ac">상품목적</th>
                                      <td scope="row">중소기업이 보유한 우수 기술, 제품의 글로벌화 촉진 및 수출인프라 조성을 위한 생산설비 자금을 지원하여 기술기반 수출 중소기업을 육성하는 사업입니다.</td>
                                      <td scope="row">사업성과 기술성이 우수한 성장유망 중소기업의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.</td>
                                    </tr>
                                    <tr>
                                      <th scope="row" className="ac">금융기관</th>
                                      <td className="ac">중소벤처기업진흥공단</td>
                                      <td className="ac">중소벤처기업진흥공단</td>
                                    </tr>
                                    <tr>
                                      <th scope="row" className="ac">대출기간</th>
                                      <td className="ac">해양수산부</td>
                                      <td className="ac">해양수산부</td>
                                    </tr>
                                    <tr>
                                      <th scope="row" className="ac">지원대상</th>
                                      <td className="ac">해양수산부</td>
                                      <td className="ac">해양수산부</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </li>
                    </ul>
                </div>
                <ul className="krds-structured-list type-full">
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                        <div className="krds-form-check large no-txt">
                          <input type="checkbox" name="" id="chk_01" />
                          <label htmlFor="chk_01"></label>
                        </div>
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
                        <div className="krds-form-check large no-txt">
                          <input type="checkbox" name="" id="chk_02" />
                          <label htmlFor="chk_02"></label>
                        </div>
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
                        <div className="krds-form-check large no-txt">
                          <input type="checkbox" name="" id="chk_03" />
                          <label htmlFor="chk_03"></label>
                        </div>
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
                        <div className="krds-form-check large no-txt">
                          <input type="checkbox" name="" id="chk_04" />
                          <label htmlFor="chk_04"></label>
                        </div>
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
                        <div className="krds-form-check large no-txt">
                          <input type="checkbox" name="" id="chk_05" />
                          <label htmlFor="chk_05"></label>
                        </div>
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
                        <div className="krds-form-check large no-txt">
                          <input type="checkbox" name="" id="chk_01" />
                          <label htmlFor="chk_01"></label>
                        </div>
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
                <Pagination />  
                
              </section>
            </div>
        </div>
      </div> 

      {/* 업종선택 팝업 */}
      <Popup 
        isOpen={isPopupOpen02} 
        onClose={() => setIsPopupOpen02(false)} 
        title="업종선택"
        footer={
          <>
            <button type="button" className="krds-btn tertiary medium" onClick={() => setIsPopupOpen02(false)}>닫기</button>
            <button type="button" className="krds-btn primary medium" onClick={() => setIsPopupOpen02(false)}>적용</button>
          </>
        }
      >
          <div className="search-top-box">
            <div className="sch-form-wrap">
              <div className="input-wrap w-180">
                <input type="text" className="krds-input" placeholder="업종코드" title="업종코드 입력" />
              </div>

              <div className="sch-input w-304">
                <input type="text" className="krds-input" placeholder="업종명" title="업종명 입력" />
                <button type="button" className="krds-btn medium icon ico-search" >
                  <span className="sr-only">검색</span>
                  <i className="svg-icon ico-sch"></i>
                </button>
              </div>

              <button type="button" className="krds-btn xlarge icon border">
                  <span className="sr-only">새로고침</span>
                  <i className="svg-icon ico-refresh"></i>
              </button>
            </div>
          </div>
          <p className="txt-caution has-icon">
            <i className="svg-icon ico-info"></i> 업종코드 또는 업종명 중 하나는 2글자 이상 입력해야 합니다.
          </p>

          <div className="krds-table-wrap mt-8">
            <table className="tbl col data">
              <caption>업종선택 표. 번호, 코드, 항목명, 업종코드, 업종명 정보가 제공됨.</caption>
              <colgroup>
                <col style={{width: "6.7%"}}/>
                <col style={{width: "11%"}}/>
                <col style={{width: "25.8%"}}/>
                <col style={{width: "12%"}}/>
                <col/>
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" rowSpan={2} className="ac bd-r">번호</th>
                  <th scope="col" colSpan={2} className="ac bd-r">대분류</th>
                  <th scope="col" colSpan={2} className="ac">세세분류</th>
                </tr>
                <tr>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">항목명</th>
                  <th scope="col" className="ac">업종코드</th>
                  <th scope="col" className="ac">업종명</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td scope="row" className="ac"><span>0</span></td>
                  <td className="ac"><span>V</span></td>
                  <td className="ac"><span><button type="button" className="underline">기타 테마업종</button></span></td>
                  <td className="ac"><span>V</span></td>
                  <td><span>첨단전략산업,한국형녹색분류체계,혁신성장공동기준품목</span></td>
                </tr>
              </tbody>
            </table>
          </div>


          <div className="search-top-box only-filter mt-8">
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
      </Popup>
    </>
  );
};

export default UI_USR_L_030;