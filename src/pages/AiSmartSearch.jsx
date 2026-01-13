import React, { useRef, useState, useEffect } from "react";
import { Link, useSearchParams } from 'react-router-dom';
import Header from "../components/ui/Header.jsx";
import Footer from "../components/ui/Footer.jsx";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination"; 

const AiSmartSearch = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || "");
  const searchOptionModalRef = useRef(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleOpenSearchOptionModal = () => {
    searchOptionModalRef.current.classList.add('on');
  }
  const handleCloseSearchOptionModal = () => {
    searchOptionModalRef.current.classList.remove('on');
  }

  const breadcrumbItems = [
    { label: "신청·발급", link: "#" },
    { label: "AI 스마트검색", link: "#" },
  ];

  return (
    <div id="wrap" >
        <Header />
        <div id="container" className="on-gradientpage">
          <div className="inner">
            <div className="totalsearch-wrap">
              <Breadcrumb items={breadcrumbItems}/>
              <div className="page-title-wrap" data-type="responsive">
                <h2 className="h-tit ac">AI 스마트검색</h2>
              </div>

              <div className="onsearch-input-box">
                <div className="boxinner">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {/*<button type="button"><i className="svg-icon ico-cal-move"></i></button>*/}
                </div>
                <button type="button" className="onsearch-submit">
                  <span className="sr-only">통합검색</span>
                  <i className="svg-icon ico-sch"></i>
                </button>
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
                            <label className="krds-form-chip-outline" for="chk1_1">전체</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_2" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_2">서울</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_3" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_3">부산</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_4" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_4">대구</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_5" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_5">인천</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_6" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_6">광주</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_7" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_7">대전</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_8" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_8">울산</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_9" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_9">세종</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_10" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_10">경기</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_11" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_11">강원</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_12" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_12">충북</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_13" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_13">충남</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_14" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_14">전북</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_15" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_15">전남</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_16" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_16">경북</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_17" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_17">경남</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk1_18" name="chk1"/>
                            <label className="krds-form-chip-outline" for="chk1_18">제주</label>
                          </div>
                        </div>
                      </div>
                       <div className="on-searchoption-checklists">
                        <h4>지역</h4>
                        <div className="krds-check-area">
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk2_1" name="chk2"/>
                            <label className="krds-form-chip-outline" for="chk2_1">기술개발</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk2_2" name="chk2"/>
                            <label className="krds-form-chip-outline" for="chk2_2">자금지원</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk2_3" name="chk2"/>
                            <label className="krds-form-chip-outline" for="chk2_3">판로개척</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk2_4" name="chk2"/>
                            <label className="krds-form-chip-outline" for="chk2_4">창업지원</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk2_5" name="chk2"/>
                            <label className="krds-form-chip-outline" for="chk2_5">시설·설비</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk2_6" name="chk2"/>
                            <label className="krds-form-chip-outline" for="chk2_6">인력양성</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk2_7" name="chk2"/>
                            <label className="krds-form-chip-outline" for="chk2_7">경영지원</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk2_8" name="chk2"/>
                            <label className="krds-form-chip-outline" for="chk2_8">해외진출</label>
                          </div>
                          <div className="krds-form-chip small">
                            <input type="checkbox" className="checkbox" id="chk2_9" name="chk2"/>
                            <label className="krds-form-chip-outline" for="chk2_9">기타</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="on-searchoption flexrow">
                      <div className="on-searchoption-selectlists">
                        <div>
                          <h4>기업규모</h4>
                          <select class="krds-form-select small">
                            <option value="">전체</option>
                          </select>
                        </div>
                      </div>
                      <div className="on-searchoption-selectlists">
                        <div>
                          <h4>지원유형</h4>
                          <select class="krds-form-select small">
                            <option value="">전체</option>
                          </select>
                        </div>
                      </div>
                      <div className="on-searchoption-selectlists">
                        <div>
                          <h4>접수유형</h4>
                          <select class="krds-form-select small">
                            <option value="">전체</option>
                          </select>
                        </div>
                      </div>
                      <div className="on-searchoption-selectlists">
                        <div>
                          <h4>신청현황</h4>
                          <select class="krds-form-select small">
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

              <div className="on-contentbox">
                <p className="guide-txt sm">
                  <i className="svg-icon ico-ai lg"></i>
                  <span className="on-p2">소상공인(SME)을 대상으로 한 정부 또는 공공기관의 지원 사업을 찾는 것 지역별 또는 산업별로 구체적인 지원 프로그램을 검색해보면 더 정확한 정보를 얻을 수 있습니다.</span>
                </p>
                <p className="on-p3 ac">
                  <Link to="/" className="on-linktxt">상세검색</Link>
                  을 변경하시면 검색 카테고리를 필터링하여 정보를 조정할 수 있습니다
                </p>
              </div>

              <div className="on-titlebox">
                <h3>사업공고</h3>
                <Link to="/" className="krds-btn medium text">전체보기 <i className="svg-icon ico-angle right"></i></Link>
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
                          <div class="krds-badge-wrap">
                            <span className="krds-badge bg-light-primary">기술</span>
                            <span class="krds-badge bg-primary number">D-234</span>
                          </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="c-txt">
                            시흥산업진흥원은 시뮬레이션 프로그램 참여기업(사업장, 부설연구소 및 공장 등 시흥스마트허브 입주기업) 대상 신뢰성 및 기술력 확보를 위해 시험ㆍ분석ㆍ인증 및 지식재산권을 지원하고자「2025년 공정혁신시뮬레이션 기업지원」 참여기업을 다음과 같이 재공고하오니 많은 참여 바랍니다.
                          </p>
                          <p className="guide-txt sm">
                            <i className="svg-icon ico-ai"></i>
                            <span className="on-p3">
                              사용자가 'sme support program agent' 지원사업을 찾고 있으며, 이 문서는 농업인을 대상으로 한 라이브커머스 지원 사업으로 SME(소상공인) 및 농업 기반 기업의 디지털 전환을 지원하는 프로그램으로 관련성이 높습니다. 지원 절차와 보조금 교부 등 구체적인 프로세스가 명시되어 있어 실제 지원 프로그램에 부합합니다.
                            </span>
                          </p>
                          <p className="on-list-btm">
                            <span> 
                              <i className="svg-icon ico-checkbox on-bgcolorblue"></i>
                              <strong className="on-colorblue">접수중</strong>
                            </span>
                            <span>
                              2025.10.24 ~ 2025.11.19
                            </span>
                            <span>
                               <i className="svg-icon ico-building"></i>
                               중소벤처기업진흥공단
                            </span>
                          </p>
                        </a>
                        <div className="c-btn column">
                          <button className="krds-btn tertiary"><i className="svg-icon ico-like"></i> 관심</button>
                          <Link to="/" className="krds-btn secondary">바로보기</Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                          <div class="krds-badge-wrap">
                            <span className="krds-badge bg-light-primary">기술</span>
                            <span class="krds-badge bg-primary number">D-234</span>
                          </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="c-txt">
                            시흥산업진흥원은 시뮬레이션 프로그램 참여기업(사업장, 부설연구소 및 공장 등 시흥스마트허브 입주기업) 대상 신뢰성 및 기술력 확보를 위해 시험ㆍ분석ㆍ인증 및 지식재산권을 지원하고자「2025년 공정혁신시뮬레이션 기업지원」 참여기업을 다음과 같이 재공고하오니 많은 참여 바랍니다.
                          </p>
                          <p className="on-list-btm">
                            <span> 
                              <strong className="on-colorred">마감임박</strong>
                            </span>
                            <span>
                              2025.10.24 ~ 2025.11.19
                            </span>
                            <span>
                               <i className="svg-icon ico-building"></i>
                               중소벤처기업진흥공단
                            </span>
                          </p>
                        </a>
                        <div className="c-btn column">
                          <button className="krds-btn tertiary"><i className="svg-icon ico-like"></i> 관심</button>
                          <Link to="/" className="krds-btn secondary">바로보기</Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                          <div class="krds-badge-wrap">
                            <span className="krds-badge bg-light-primary">기술</span>
                            <span class="krds-badge bg-primary number">D-234</span>
                          </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="c-txt">
                            시흥산업진흥원은 시뮬레이션 프로그램 참여기업(사업장, 부설연구소 및 공장 등 시흥스마트허브 입주기업) 대상 신뢰성 및 기술력 확보를 위해 시험ㆍ분석ㆍ인증 및 지식재산권을 지원하고자「2025년 공정혁신시뮬레이션 기업지원」 참여기업을 다음과 같이 재공고하오니 많은 참여 바랍니다.
                          </p>
                          <p className="on-list-btm">
                            <span> 
                              <strong className="on-colorgray">마감</strong>
                            </span>
                            <span>
                              2025.10.24 ~ 2025.11.19
                            </span>
                            <span>
                               <i className="svg-icon ico-building"></i>
                               중소벤처기업진흥공단
                            </span>
                          </p>
                        </a>
                        <div className="c-btn column">
                          <button className="krds-btn tertiary"><i className="svg-icon ico-like"></i> 관심</button>
                          <Link to="/" className="krds-btn secondary">바로보기</Link>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              <Pagination /> 

            </div>
          </div>
      </div>
        <Footer />
      </div>
  );
};

export default AiSmartSearch;
