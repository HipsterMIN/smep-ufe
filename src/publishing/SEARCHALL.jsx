import React, { useRef, useState } from "react";
import Header from "../components/ui/Header.jsx";
import Footer from "../components/ui/Footer.jsx";
import Breadcrumb from "../components/ui/Breadcrumb.jsx";
import Tab from "../components/ui/Tab";
import Pagination from '../components/ui/Pagination.jsx';
import searchIMG from '../assets/sub/search_result_img.png';

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
      <div id="container" className="on-gradientpage sub-container">
        <div className="inner">
          <div className="totalsearch-wrap">
            <Breadcrumb items={breadcrumbItems}/>
            <div className="page-title-wrap" data-type="responsive">
              <h2 className="h-tit">통합검색</h2>
            </div>
            
            <div className="onsearch-input-box">
              <div className="boxinner">
                <input type="text" title="검색어 입력"/>{/* 기술진단보고서 반영 */}
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

            <div className="search-list-top mt-0">
              <ul className="sch-info" aria-live="polite">
                <li>‘<span className="point">지원</span>’</li>
                <li>검색 결과 <span className="point">22,459</span> 건</li>
              </ul>
            </div>
            <div className="search-tab-wrap">
              <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>
            </div>

            <div className="tab-conts-wrap">
              <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
                <div className="search-result-list-wrap">
                  <div className="search-result-caption">
                    <div className="search-title">
                      <h4>
                        지원사업{" "}
                        <p><span className="point">22,459</span> 건</p>
                      </h4>
                    </div>
                    <button className="search-more-btn">더보기 <i className="svg-icon ico-plus" /></button>
                  </div>
                  <ul className="krds-structured-list type-full">
                    <li className="structured-item">
                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">지원사업소개</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">
                                고용노동부, <span className="point">퇴직</span>정부혁신과 적극행정 우수사례를 확산하고, 일하는 방식 개선을 통해 정부혁신을 속도감 있게 추진
                              </h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              또 다른 최우수 사례로 선정된 “외국인 근로자 <span className="point">퇴직</span>금 자동환급제”는 외국인 근로자가 최초 입국 시 사전 등록한 계좌에
                              <span className="point">퇴직</span>금(출국만기보험)을 자동 지급함으로써 송출국가의 열악한 금융환경 등으로
                              <span className="point">퇴직</span>금(출국만기보험)이 미지급되는 문제점을 개선하여 외국인 근로자의 권리구제에
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">지원사업</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">지원사업소개</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">정책금융</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">혁신성장지원자금</h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              사업성과 기술성이 우수한 성장유망 <span className="point">중소기업</span>의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">지원사업</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">정책금융</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>
                      
                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">사업공고</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">2026년 콘텐츠도쿄(CONTENT TOKYO) 한국공동관 참가기업 모집 공고</h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              콘텐츠IP 사업권을 보유하고 <span className="point">라이선싱</span>, 기획, 제작, 유통 및 배급 등 해외수출을 원하는 국내 콘텐츠 기업
                              - 일본을 중심으로 콘텐츠IP 홍보 및 IP 활용 상품 판매 등 일본시장 진출에 대한 참여 목적이 명확한 기업
                              - 콘텐츠IP 저작권을 소유하거나 절대적 협상권을 보유하여 직접 수출상담이 가능한 기업(플랫폼사, 제작사, 스튜디오, 출판사, 에이전시 등)
                              - 콘텐츠IP 저작권을 소유하거나 절대적 협상권을 보유하여 직접 수출상담이 가능한 기업(플랫폼사, 제작사, 스튜디오, 출판사, 에이전시 등)
                              - 콘텐츠IP 저작권을 소유하거나 절대적 협상권을 보유하여 직접 수출상담이 가능한 기업(플랫폼사, 제작사, 스튜디오, 출판사, 에이전시 등)
                              - 콘텐츠IP 저작권을 소유하거나 절대적 협상권을 보유하여 직접 수출상담이 가능한 기업(플랫폼사, 제작사, 스튜디오, 출판사, 에이전시 등)
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">지원사업</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">사업공고</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="search-result-list-wrap">
                  <div className="search-result-caption">
                    <div className="search-title">
                      <h4>
                        증명서 발급{" "}
                        <p><span className="point">22,459</span> 건</p>
                      </h4>
                    </div>
                    <button className="search-more-btn">더보기 <i className="svg-icon ico-plus" /></button>
                  </div>
                  <ul className="krds-structured-list type-full">
                    <li className="structured-item">
                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">발급</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">벤처기업확인서</h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              「벤처기업육성에 관한 특별조치법」 제2조의2에서 정한 <span className="point">요건</span>을 충족한 벤처기업임을 확인하는 확인서 사본 발급 서비스
                            </p>
                          </a>
                        </div>
                        <div class="card-btn">
                          <button type="button" class="krds-btn primary xlarge">발급받기</button>
                        </div>
                      </div>
                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">발급</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">벤처기업확인서</h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              「벤처기업육성에 관한 특별조치법」 제2조의2에서 정한 <span className="point">요건</span>을 충족한 벤처기업임을 확인하는 확인서 사본 발급 서비스
                            </p>
                          </a>
                        </div>
                        <div class="card-btn">
                          <button type="button" class="krds-btn primary xlarge">발급받기</button>
                        </div>
                      </div>
                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">발급</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">벤처기업확인서</h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              「벤처기업육성에 관한 특별조치법」 제2조의2에서 정한 <span className="point">요건</span>을 충족한 벤처기업임을 확인하는 확인서 사본 발급 서비스
                            </p>
                          </a>
                        </div>
                        <div class="card-btn">
                          <button type="button" class="krds-btn primary xlarge">발급받기</button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="search-result-list-wrap">
                  <div className="search-result-caption">
                    <div className="search-title">
                      <h4>
                        정책‧법령 정보{" "}
                        <p><span className="point">22,459</span> 건</p>
                      </h4>
                    </div>
                    <button className="search-more-btn">더보기 <i className="svg-icon ico-plus" /></button>
                  </div>
                  <ul className="krds-structured-list type-full">
                    <li className="structured-item">
                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">뉴스∙소식</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">고용노동부, 정부혁신과 적극행정 우수사례를 확산하고, 일하는 방식 개선을 통해 정부혁신을 속도감 있게 추진</h4>
                            </p>
                            <p className="c-txt onellipsis-2 w-82-per">
                              또 다른 최우수 사례로 선정된 “외국인 근로자 <span className="point">퇴직</span>금 자동환급제”는 외국인 근로자가 최초 입국 시 사전 등록한 계좌에 <span className="point">퇴직</span>금(출국만기보험)을
                              자동 지급함으로써 송출국가의 열악한 금융환경 등으로 <span className="point">퇴직</span>금(출국만기보험)이 미지급되는 문제점을 개선하여 외국인 근로자의 권리구제에
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">뉴스・소식</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">뉴스소식</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                        <div class="card-imgs">
                          <img src={searchIMG} alt="갤러리 이미지" />
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">정책뉴스</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">
                                <span className="point">퇴직</span>연금복지과, <span className="point">퇴직</span>연금
                                수수료 부과에 관한 고시제정안 행정예고
                              </h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              고용노동부 공고 제2023-453호 <span className="point">퇴직</span>연금 수수료 부과에 관한 고시제정안을 행정예고 하는데 있어,
                              그 이유와 주요내용을 국민에게 미리 알려 이에 대한 의견을 듣기 위하여 「행정절차법」제46조에 따라 다음과 같이 공고합니다. 2023년 9월 13일 고용노동부장관
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">정책‧법령 정보</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">정책정보</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">정책뉴스</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">자주하는 질문</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">중소기업협동조합법 시행령 일부개정령(안) 입법예고</h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              고용노동부 공고 제2023-453호 <span className="point">퇴직</span>연금 수수료 부과에 관한 고시제정안을 행정예고 하는데 있어,
                              그 이유와 주요내용을 국민에게 미리 알려 이에 대한 의견을 듣기 위하여 「행정절차법」제46조에 따라 다음과 같이 공고합니다. 2023년 9월 13일 고용노동부장관
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">정책‧법령 정보</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">법령정보</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">입법·행정예고/고시</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="search-result-list-wrap">
                  <div className="search-result-caption">
                    <div className="search-title">
                      <h4>
                        더 많은 서비스{" "}
                        <p><span className="point">22,459</span> 건</p>
                      </h4>
                    </div>
                    <button className="search-more-btn">더보기 <i className="svg-icon ico-plus" /></button>
                  </div>
                  <ul className="krds-structured-list type-full">
                    <li className="structured-item">
                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">뉴스∙소식</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">고용노동부, 정부혁신과 적극행정 우수사례를 확산하고, 일하는 방식 개선을 통해 정부혁신을 속도감 있게 추진</h4>
                            </p>
                            <p className="c-txt onellipsis-2 w-82-per">
                              또 다른 최우수 사례로 선정된 “외국인 근로자 퇴직금 자동환급제”는 외국인 근로자가 최초 입국 시 사전 등록한 계좌에 <span className="point">퇴직</span>금(출국만기보험)을 자동 지급함으로써 송출국가의 열악한 금융환경 등으로 <span className="point">퇴직</span>금(출국만기보험)이 미지급되는 문제점을 개선하여 외국인 근로자의 권리구제에
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">뉴스・소식</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">뉴스소식</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                        <div class="card-imgs">
                          <img src={searchIMG} alt="갤러리 이미지" />
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">법령정보</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">
                                <span className="point">지원</span>연금복지과,
                                <span className="point">지원</span>연금 수수료 부과에 관한 고시제정안 행정예고
                              </h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              고용노동부 공고 제2023-453호 <span className="point">지원</span>연금 수수료 부과에 관한 고시제정안을 행정예고 하는데 있어,
                              그 이유와 주요내용을 국민에게 미리 알려 이에 대한 의견을 듣기 위하여 「행정절차법」제46조에 따라 다음과 같이 공고합니다. 2023년 9월 13일 고용노동부장관
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">정보공개</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">법령정보</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">입법・행정예고</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">자주하는 질문</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">임금 및 <span className="point">퇴직</span>금 소멸시효 기산일</h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              <span className="point">퇴직</span>금 산정시 산전.후 휴가기간이 포함되는지 여부?
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">민원</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">자주하는 질문</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="search-result-list-wrap mb-60">
                  <div className="search-result-caption">
                    <div className="search-title">
                      <h4>
                        고객지원{" "}
                        <p><span className="point">22,459</span> 건</p>
                      </h4>
                    </div>
                    <button className="search-more-btn">더보기 <i className="svg-icon ico-plus" /></button>
                  </div>
                  <ul className="krds-structured-list type-full">
                    <li className="structured-item">
                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">뉴스∙소식</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">고용노동부, 정부혁신과 적극행정 우수사례를 확산하고, 일하는 방식 개선을 통해 정부혁신을 속도감 있게 추진</h4>
                            </p>
                            <p className="c-txt onellipsis-2 w-82-per">
                              또 다른 최우수 사례로 선정된 “외국인 근로자 퇴직금 자동환급제”는 외국인 근로자가 최초 입국 시 사전 등록한 계좌에 <span className="point">퇴직</span>금(출국만기보험)을 자동 지급함으로써 송출국가의 열악한 금융환경 등으로 <span className="point">퇴직</span>금(출국만기보험)이 미지급되는 문제점을 개선하여 외국인 근로자의 권리구제에
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">뉴스・소식</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">뉴스소식</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                        <div class="card-imgs">
                          <img src={searchIMG} alt="갤러리 이미지" />
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">법령정보</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">
                                <span className="point">지원</span>연금복지과,
                                <span className="point">지원</span>연금 수수료 부과에 관한 고시제정안 행정예고
                              </h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              고용노동부 공고 제2023-453호 <span className="point">지원</span>연금 수수료 부과에 관한 고시제정안을 행정예고 하는데 있어,
                              그 이유와 주요내용을 국민에게 미리 알려 이에 대한 의견을 듣기 위하여 「행정절차법」제46조에 따라 다음과 같이 공고합니다. 2023년 9월 13일 고용노동부장관
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">정보공개</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">법령정보</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">입법・행정예고</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">자주하는 질문</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">임금 및 <span className="point">퇴직</span>금 소멸시효 기산일</h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              <span className="point">퇴직</span>금 산정시 산전.후 휴가기간이 포함되는지 여부?
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">민원</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">자주하는 질문</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </section>
              <section className={`tab-conts ${activeTabIndex === 1 ? 'active' : ''}`}>
                <div className="search-result-list-wrap indep-wrap">
                  <ul className="krds-structured-list type-full">
                    <li className="structured-item indep-item">
                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">지원사업소개</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">
                                고용노동부, 정부혁신과 적극행정 우수사례를 확산하고, 일하는 방식 개선을 통해 정부혁신을 속도감 있게 추진
                              </h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              또 다른 최우수 사례로 선정된 “외국인 근로자 <span className="point">퇴직</span>금 자동환급제”는 외국인 근로자가 최초 입국 시 사전 등록한 계좌에 <span className="point">퇴직</span>금(출국만기보험)을 자동 지급함으로써 송출국가의 열악한 금융환경 등으로 <span className="point">퇴직</span>금(출국만기보험)이 미지급되는 문제점을 개선하여 외국인 근로자의 권리구제에
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">지원사업</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">지원사업소개</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">사업공고</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">
                                2026년 콘텐츠도쿄(CONTENT TOKYO) 한국공동관 참가기업 모집 공고
                              </h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              콘텐츠IP 사업권을 보유하고 <span className="point">라이선싱</span>, 기획, 제작, 유통 및 배급 등 해외수출을 원하는 국내 콘텐츠 기업<br/>
                              - 일본을 중심으로 콘텐츠IP 홍보 및 IP 활용 상품 판매 등 일본시장 진출에 대한 참여 목적이 명확한 기업<br/>
                              - 콘텐츠IP 저작권을 소유하거나 절대적 협상권을 보유하여 직접 수출상담이 가능한 기업(플랫폼사, 제작사, 스튜디오, 출판사, 에이전시 등)
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">지원사업</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">사업공고</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">사업공고</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">
                                2026년 콘텐츠도쿄(CONTENT TOKYO) 한국공동관 참가기업 모집 공고
                              </h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              콘텐츠IP 사업권을 보유하고 <span className="point">라이선싱</span>, 기획, 제작, 유통 및 배급 등 해외수출을 원하는 국내 콘텐츠 기업<br/>
                              - 일본을 중심으로 콘텐츠IP 홍보 및 IP 활용 상품 판매 등 일본시장 진출에 대한 참여 목적이 명확한 기업<br/>
                              - 콘텐츠IP 저작권을 소유하거나 절대적 협상권을 보유하여 직접 수출상담이 가능한 기업(플랫폼사, 제작사, 스튜디오, 출판사, 에이전시 등)
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">지원사업</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">사업공고</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">정책금융</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">
                                혁신성장지원자금
                              </h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              사업성과 기술성이 우수한 성장유망 <span className="point">중소기업</span>의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">지원사업</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">정책금융</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">정책금융</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">
                                혁신성장지원자금
                              </h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              사업성과 기술성이 우수한 성장유망 <span className="point">중소기업</span>의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">지원사업</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">정책금융</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">정책금융</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">
                                혁신성장지원자금
                              </h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              사업성과 기술성이 우수한 성장유망 <span className="point">중소기업</span>의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.
                            </p>
                            <nav class="krds-breadcrumb-wrap mb-0" aria-label="현재 경로" id="breadcrumb">
                              <ol class="breadcrumb">
                                <li>
                                  <a class="txt" href="" data-discover="true">지원사업</a>
                                </li>
                                <li>
                                  <a class="txt" href="" data-discover="true">정책금융</a>
                                </li>
                              </ol>
                            </nav>
                          </a>
                        </div>
                      </div>
                    </li>
                  </ul>
                  <Pagination />
                </div>
              </section>
              <section className={`tab-conts ${activeTabIndex === 2 ? 'active' : ''}`}>
                <div className="search-result-list-wrap indep-wrap">
                  <ul className="krds-structured-list type-full">
                    <li className="structured-item indep-item">
                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">발급</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">벤처기업확인서</h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              「벤처기업육성에 관한 특별조치법」 제2조의2에서 정한 <span className="point">요건</span>을 충족한 벤처기업임을 확인하는 확인서 사본 발급 서비스
                            </p>
                          </a>
                        </div>
                        <div class="card-btn">
                          <button type="button" class="krds-btn primary xlarge">발급받기</button>
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">발급</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">벤처기업확인서</h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              「벤처기업육성에 관한 특별조치법」 제2조의2에서 정한 <span className="point">요건</span>을 충족한 벤처기업임을 확인하는 확인서 사본 발급 서비스
                            </p>
                          </a>
                        </div>
                        <div class="card-btn">
                          <button type="button" class="krds-btn primary xlarge">발급받기</button>
                        </div>
                      </div>

                      <div className="in">
                        <div className="card-top">
                          <span className="krds-badge bg-light-primary">발급</span>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text c-date">
                            <p className="c-tit no-icon">
                              <h4 className="onellipsis-2">벤처기업확인서</h4>
                            </p>
                            <p className="c-txt onellipsis-2">
                              「벤처기업육성에 관한 특별조치법」 제2조의2에서 정한 <span className="point">요건</span>을 충족한 벤처기업임을 확인하는 확인서 사본 발급 서비스
                            </p>
                          </a>
                        </div>
                        <div class="card-btn">
                          <button type="button" class="krds-btn primary xlarge">발급받기</button>
                        </div>
                      </div>
                    </li>
                  </ul>
                  <Pagination />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SEARCHALL;
