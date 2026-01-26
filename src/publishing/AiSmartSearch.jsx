import React, { useRef, useState, useEffect } from "react";
import { Link, useSearchParams } from 'react-router-dom';
import Header from "../components/ui/Header.jsx";
import Footer from "../components/ui/Footer.jsx";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination"; 

const AiSmartSearch = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || "");
  const aiSmartSearchRef = useRef(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const breadcrumbItems = [
    { label: "신청·발급", link: "#" },
    { label: "AI 스마트 통합 검색", link: "#" },
  ];

  const handleShowAllAiSearchPanel = () => {
    aiSmartSearchRef.current.classList.add('on');
  }

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

              <div className="onsearch-input-box pb-12">
                <div className="boxinner">
                  <select>
                    <option value="">사업공고</option>
                  </select>
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <button type="button" className="onsearch-submit">
                  <span className="sr-only">통합검색</span>
                  <i className="svg-icon ico-sch"></i>
                </button>
              </div>
              <p className="on-p3 ac">
                <Link to="/" className="on-linktxt">상세검색</Link>을 변경하시면 검색 카테고리를 필터링하여 정보를 조정할 수 있습니다
              </p>

              <div className="on-smartsearch" ref={aiSmartSearchRef}>
                <div className="on-smartsearch-left">
                  <div>
                    <h3>
                      <span className="title"><i className="svg-icon ico-ai2"></i> AI 스마트 검색</span>
                      <span className="content">"지원사업 찾아줘" 대한 검색 결과를 분석한 결과, 총 5개의 지원사업을 발견했습니다.</span>
                    </h3>
                    <div>
                      <p className="on-p2">종합 판단</p>
                      <p>검색 결과, 총 5건의 지원사업 공고가 발견되었습니다. 이들 공고는 다양한 산업 분야의 기업을 대상으로 하며, 컨설팅, 기술개발, 판로 확대 등 여러 유형의 지원을 포함합니다.</p>
                      <br />
                      <p className="on-p2">개별 공고 안내</p>
                      <ul class="krds-info-list decimal" role="list">
                        <li role="listitem">
                          <p className="on-p2">[장애인복지법] 제32조에 따라 등록한 장애인(중증장애인, 경증장애인)을 대상으로 합니다.</p>
                          <p>충북 소재 식품 관련 기업을 대상으로 컨설팅을 통해 브랜드 강화 및 경쟁력 제고를 지원하는 사업입니다. 해당 공고는 식품 관련 기업에 적합할 수 있습니다.</p>
                        </li>
                        <li role="listitem">
                          <p className="on-p2">[장애인복지법] 제32조에 따라 등록한 장애인(중증장애인, 경증장애인)을 대상으로 합니다.</p>
                          <p>충북 소재 식품 관련 기업을 대상으로 컨설팅을 통해 브랜드 강화 및 경쟁력 제고를 지원하는 사업입니다. 해당 공고는 식품 관련 기업에 적합할 수 있습니다.</p>
                        </li>
                        <li role="listitem">
                          <p className="on-p2">[장애인복지법] 제32조에 따라 등록한 장애인(중증장애인, 경증장애인)을 대상으로 합니다.</p>
                          <p>충북 소재 식품 관련 기업을 대상으로 컨설팅을 통해 브랜드 강화 및 경쟁력 제고를 지원하는 사업입니다. 해당 공고는 식품 관련 기업에 적합할 수 있습니다.</p>
                        </li>
                        <li role="listitem">
                          <p className="on-p2">[장애인복지법] 제32조에 따라 등록한 장애인(중증장애인, 경증장애인)을 대상으로 합니다.</p>
                          <p>충북 소재 식품 관련 기업을 대상으로 컨설팅을 통해 브랜드 강화 및 경쟁력 제고를 지원하는 사업입니다. 해당 공고는 식품 관련 기업에 적합할 수 있습니다.</p>
                        </li>
                        <li role="listitem">
                          <p className="on-p2">[장애인복지법] 제32조에 따라 등록한 장애인(중증장애인, 경증장애인)을 대상으로 합니다.</p>
                          <p>충북 소재 식품 관련 기업을 대상으로 컨설팅을 통해 브랜드 강화 및 경쟁력 제고를 지원하는 사업입니다. 해당 공고는 식품 관련 기업에 적합할 수 있습니다.</p>
                        </li>
                      </ul>
                      
                      <button className="krds-btn gradient full medium mt-22">
                        AI에게 더 자세히 물어보기
                        <i className="svg-icon ico-angle right"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="on-smartsearch-right">
                  <div className="ai-type">
                    <ul className="krds-structured-list type-full">
                      <li className="structured-item">
                        <div className="in">
                          <div className="card-top">
                              <div className="krds-badge-wrap">
                                <span className="krds-badge bg-white">기술</span>
                                <span className="krds-badge bg-primary number">D-234</span>
                              </div>
                              <button className="on-qna-ai on-colorblue2" type="button">
                                <i className="svg-icon ico-ai2 xs"></i>
                                이 공고 AI에게 질문하기
                              </button>
                          </div>
                          <div className="card-body">
                            <a href="#" className="c-text">
                              <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                              <p className="on-list-btm">
                                <span>
                                  <i className="svg-icon ico-building"></i>
                                  중소벤처기업진흥공단
                                </span>
                                <span>
                                  2025.10.24 ~ 2025.11.19
                                </span>
                              </p>
                              <div className="card-btm noborder pt-0">
                                <span className="tag emphasis">최대 5천만원</span>
                                <span className="tag">창업기업</span>
                                <span className="tag">창업기업</span>
                              </div>
                            </a>
                          </div>
                        </div>
                      </li>
                      <li className="structured-item">
                        <div className="in">
                          <div className="card-top">
                              <div className="krds-badge-wrap">
                                <span className="krds-badge bg-white">기술</span>
                                <span className="krds-badge bg-primary number">D-234</span>
                              </div>
                              <button className="on-qna-ai on-colorblue2" type="button">
                                <i className="svg-icon ico-ai2 xs"></i>
                                이 공고 AI에게 질문하기
                              </button>
                          </div>
                          <div className="card-body">
                            <a href="#" className="c-text">
                              <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                              <p className="on-list-btm">
                                <span>
                                  <i className="svg-icon ico-building"></i>
                                  중소벤처기업진흥공단
                                </span>
                                <span>
                                  2025.10.24 ~ 2025.11.19
                                </span>
                              </p>
                              <div className="card-btm noborder pt-0">
                                <span className="tag emphasis">최대 5천만원</span>
                                <span className="tag">창업기업</span>
                                <span className="tag">창업기업</span>
                              </div>
                            </a>
                          </div>
                        </div>
                      </li>
                      <li className="structured-item">
                        <div className="in">
                          <div className="card-top">
                              <div className="krds-badge-wrap">
                                <span className="krds-badge bg-white">기술</span>
                                <span className="krds-badge bg-primary number">D-234</span>
                              </div>
                              <button className="on-qna-ai on-colorblue2" type="button">
                                <i className="svg-icon ico-ai2 xs"></i>
                                이 공고 AI에게 질문하기
                              </button>
                          </div>
                          <div className="card-body">
                            <a href="#" className="c-text">
                              <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                              <p className="on-list-btm">
                                <span>
                                  <i className="svg-icon ico-building"></i>
                                  중소벤처기업진흥공단
                                </span>
                                <span>
                                  2025.10.24 ~ 2025.11.19
                                </span>
                              </p>
                              <div className="card-btm noborder pt-0">
                                <span className="tag emphasis">최대 5천만원</span>
                                <span className="tag">창업기업</span>
                                <span className="tag">창업기업</span>
                              </div>
                            </a>
                          </div>
                        </div>
                      </li>
                      <li className="structured-item">
                        <div className="in">
                          <div className="card-top">
                              <div className="krds-badge-wrap">
                                <span className="krds-badge bg-white">기술</span>
                                <span className="krds-badge bg-primary number">D-234</span>
                              </div>
                              <button className="on-qna-ai on-colorblue2" type="button">
                                <i className="svg-icon ico-ai2 xs"></i>
                                이 공고 AI에게 질문하기
                              </button>
                          </div>
                          <div className="card-body">
                            <a href="#" className="c-text">
                              <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                              <p className="on-list-btm">
                                <span>
                                  <i className="svg-icon ico-building"></i>
                                  중소벤처기업진흥공단
                                </span>
                                <span>
                                  2025.10.24 ~ 2025.11.19
                                </span>
                              </p>
                              <div className="card-btm noborder pt-0">
                                <span className="tag emphasis">최대 5천만원</span>
                                <span className="tag">창업기업</span>
                                <span className="tag">창업기업</span>
                              </div>
                            </a>
                          </div>
                        </div>
                      </li>
                    </ul>
                    <button className="krds-btn white full medium">
                      더보기
                      <i className="svg-icon ico-angle down"></i>
                    </button>
                  </div>
                </div>
                <div className="on-smartsearch-moreview" onClick={handleShowAllAiSearchPanel}>
                  <button type="button" class="krds-btn secondary medium">더보기<i className="svg-icon ico-angle"></i></button>
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
                </ul>
              </div>
              <ul className="krds-structured-list type-full box-type">
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                          <div className="krds-badge-wrap">
                            <span className="krds-badge bg-white">기술</span>
                            <span className="krds-badge bg-primary number">D-234</span>
                          </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="on-list-btm">
                            <span>
                               <i className="svg-icon ico-building"></i>
                               중소벤처기업진흥공단
                            </span>
                            <span>
                              2025.10.24 ~ 2025.11.19
                            </span>
                          </p>
                          <div className="card-btm noborder pt-0">
                            <span className="tag emphasis">최대 5천만원</span>
                            <span className="tag">벤처기업</span>
                            <span className="tag">청년기업</span>
                            <span className="tag">창업기업</span>
                          </div>
                        </a>
                        <div className="c-btn column">
                          <button className="krds-btn tertiary medium"><i className="svg-icon ico-faq"></i> AI질문</button>
                          <Link to="/" className="krds-btn secondary medium">바로보기</Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                          <div className="krds-badge-wrap">
                            <span className="krds-badge bg-white">기술</span>
                            <span className="krds-badge bg-primary number">D-234</span>
                          </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="on-list-btm">
                            <span>
                               <i className="svg-icon ico-building"></i>
                               중소벤처기업진흥공단
                            </span>
                            <span>
                              2025.10.24 ~ 2025.11.19
                            </span>
                          </p>
                          <div className="card-btm noborder pt-0">
                            <span className="tag emphasis">최대 5천만원</span>
                            <span className="tag">벤처기업</span>
                            <span className="tag">청년기업</span>
                            <span className="tag">창업기업</span>
                          </div>
                        </a>
                        <div className="c-btn column">
                          <button className="krds-btn tertiary medium"><i className="svg-icon ico-faq"></i> AI질문</button>
                          <Link to="/" className="krds-btn secondary medium">바로보기</Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                          <div className="krds-badge-wrap">
                            <span className="krds-badge bg-white">기술</span>
                            <span className="krds-badge bg-primary number">D-234</span>
                          </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="on-list-btm">
                            <span>
                               <i className="svg-icon ico-building"></i>
                               중소벤처기업진흥공단
                            </span>
                            <span>
                              2025.10.24 ~ 2025.11.19
                            </span>
                          </p>
                          <div className="card-btm noborder pt-0">
                            <span className="tag emphasis">최대 5천만원</span>
                            <span className="tag">벤처기업</span>
                            <span className="tag">청년기업</span>
                            <span className="tag">창업기업</span>
                          </div>
                        </a>
                        <div className="c-btn column">
                          <button className="krds-btn tertiary medium"><i className="svg-icon ico-faq"></i> AI질문</button>
                          <Link to="/" className="krds-btn secondary medium">바로보기</Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                          <div className="krds-badge-wrap">
                            <span className="krds-badge bg-white">기술</span>
                            <span className="krds-badge bg-primary number">D-234</span>
                          </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="on-list-btm">
                            <span>
                               <i className="svg-icon ico-building"></i>
                               중소벤처기업진흥공단
                            </span>
                            <span>
                              2025.10.24 ~ 2025.11.19
                            </span>
                          </p>
                          <div className="card-btm noborder pt-0">
                            <span className="tag emphasis">최대 5천만원</span>
                            <span className="tag">벤처기업</span>
                            <span className="tag">청년기업</span>
                            <span className="tag">창업기업</span>
                          </div>
                        </a>
                        <div className="c-btn column">
                          <button className="krds-btn tertiary medium"><i className="svg-icon ico-faq"></i> AI질문</button>
                          <Link to="/" className="krds-btn secondary medium">바로보기</Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="structured-item">
                    <div className="in">
                      <div className="card-top">
                          <div className="krds-badge-wrap">
                            <span className="krds-badge bg-white">기술</span>
                            <span className="krds-badge bg-primary number">D-234</span>
                          </div>
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit visited sml no-icon"><span className="span">산모·신생아 건강관리 지원사업</span></p>
                          <p className="on-list-btm">
                            <span>
                               <i className="svg-icon ico-building"></i>
                               중소벤처기업진흥공단
                            </span>
                            <span>
                              2025.10.24 ~ 2025.11.19
                            </span>
                          </p>
                          <div className="card-btm noborder pt-0">
                            <span className="tag emphasis">최대 5천만원</span>
                            <span className="tag">벤처기업</span>
                            <span className="tag">청년기업</span>
                            <span className="tag">창업기업</span>
                          </div>
                        </a>
                        <div className="c-btn column">
                          <button className="krds-btn tertiary medium"><i className="svg-icon ico-faq"></i> AI질문</button>
                          <Link to="/" className="krds-btn secondary medium">바로보기</Link>
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
