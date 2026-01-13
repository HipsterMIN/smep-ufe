import React, { useRef, useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from 'react-router-dom';
import Header from "../components/ui/Header.jsx";
import Footer from "../components/ui/Footer.jsx";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination"; 
import {
  ProgramSearchProvider,
  useProgramSearch,
  calculateDaysRemaining,
} from "@cube-i-ax/sdk/smes/program";

const SAMPLE_COMPANY_PROFILE = {
  region: "서울",
  companySize: "소기업",
  isSme: true,
  isVenture: true,
  isStartup: true,
  isYouth: true,
  hasInnobiz: false,
  hasMainbiz: false,
  hasResearchDept: true,
  registeredPatents: 3,
};

const AiSmartSearchContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || "");
  const searchOptionModalRef = useRef(null);

  const { programs, total, isLoading, error, summary, streamingSummary, isSummaryLoading, search } = useProgramSearch();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      search(q);
    }
  }, [searchParams, search]);

  const handleSearch = () => {
    if (query.trim()) {
      setSearchParams({ q: query });
      search(query);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
                    onKeyDown={handleKeyDown}
                  />
                  <button type="button" onClick={() => setQuery("")}><i className="svg-icon ico-cal-move"></i></button>
                </div>
                <button type="button" className="onsearch-submit" onClick={handleSearch}>
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
                        <h4>지원분야</h4>
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

              <div className="on-contentbox">
                {isLoading && !streamingSummary && !summary && (
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                )}
                {(streamingSummary || summary) && (
                  <p className="guide-txt sm">
                    <i className="svg-icon ico-ai lg"></i>
                    <span className="on-p2">
                      {streamingSummary || summary}
                    </span>
                  </p>
                )}
                <p className="on-p3 ac">
                  <button type="button" onClick={handleOpenSearchOptionModal} className="on-linktxt">상세검색</button>
                  을 변경하시면 검색 카테고리를 필터링하여 정보를 조정할 수 있습니다
                </p>
              </div>

              <div className="on-titlebox">
                <h3>사업공고</h3>
                <Link to="/" className="krds-btn medium text">전체보기 <i className="svg-icon ico-angle right"></i></Link>
              </div>

              <div className="search-list-top">
                <ul className="sch-info" aria-live="polite">
                  <li>검색 결과 <span className="point">{total}</span>개</li>
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

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                  검색 중 오류가 발생했습니다: {error.message}
                </div>
              )}

              <ul className="krds-structured-list type-full">
                {isLoading && programs.length === 0 ? (
                  <li className="structured-item">
                    <div className="in ac py-12">
                      <p className="text-neutral-600">검색 중입니다...</p>
                    </div>
                  </li>
                ) : programs.length > 0 ? (
                  programs.map((program) => {
                    const days = calculateDaysRemaining(program.endDate);
                    let ddayClass = "krds-badge bg-primary number";
                    let ddayText = days !== null ? (days === 0 ? "D-Day" : (days > 0 ? `D-${days}` : "마감")) : "상시";
                    
                    if (days !== null && days <= 7 && days >= 0) {
                      ddayClass = "krds-badge bg-primary number"; // 원래 예시에는 별도 색상이 없었으나 필요시 변경
                    }

                    return (
                      <li key={program.id} className="structured-item">
                        <div className="in">
                          <div className="card-top">
                              <div className="krds-badge-wrap">
                                <span className="krds-badge bg-light-primary">{program.supportField}</span>
                                <span className={ddayClass}>{ddayText}</span>
                              </div>
                          </div>
                          <div className="card-body">
                            <div className="c-text">
                              <p className="c-tit visited sml no-icon"><span className="span">{program.title}</span></p>
                              <p className="c-txt">
                                {program.summary}
                              </p>
                              {program.aiAnalysis && (
                                <p className="guide-txt sm">
                                  <i className="svg-icon ico-ai"></i>
                                  <span className="on-p3">
                                    {program.aiAnalysis}
                                  </span>
                                </p>
                              )}
                              <p className="on-list-btm">
                                <span> 
                                  {days !== null && days >= 0 ? (
                                    <>
                                      <i className="svg-icon ico-checkbox on-bgcolorblue"></i>
                                      <strong className="on-colorblue">접수중</strong>
                                    </>
                                  ) : (
                                    <strong className="on-colorgray">마감</strong>
                                  )}
                                </span>
                                <span>
                                  {program.startDate} ~ {program.endDate || "상시접수"}
                                </span>
                                <span>
                                  <i className="svg-icon ico-building"></i>
                                  {program.organization}
                                </span>
                              </p>
                            </div>
                            <div className="c-btn column">
                              <button className="krds-btn tertiary"><i className="svg-icon ico-like"></i> 관심</button>
                              <Link to={`/service/UI_USR_L_011?id=${program.id}`} className="krds-btn secondary">바로보기</Link>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })
                ) : !isLoading && (
                  <li className="structured-item">
                    <div className="in ac py-12">
                      <p className="text-neutral-600">검색 결과가 없습니다.</p>
                    </div>
                  </li>
                )}
              </ul>
              <Pagination /> 

            </div>
          </div>
      </div>
        <Footer />
      </div>
  );
};

const AiSmartSearch = () => {
  return (
    <ProgramSearchProvider profile={SAMPLE_COMPANY_PROFILE} stream topK={20}>
      <AiSmartSearchContent />
    </ProgramSearchProvider>
  );
}

export default AiSmartSearch;
