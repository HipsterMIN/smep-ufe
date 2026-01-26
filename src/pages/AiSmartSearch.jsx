import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/ui/Header.jsx';
import Footer from '../components/ui/Footer.jsx';
import Breadcrumb from '../components/ui/Breadcrumb';
import Pagination from '../components/ui/Pagination'; 
import {
  ProgramSearchProvider,
  useProgramSearch,
  calculateDaysRemaining,
} from '@cube-i-ax/sdk/smes/program';
import useSearchStore from '../store/useSearchStore';

const AiSmartSearchContent = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const searchOptionModalRef = useRef(null);
  
  // Zustand Store
  const { 
    programs: storedPrograms, 
    total: storedTotal, 
    summary: storedSummary, 
    lastQuery: storedLastQuery,
    setSearchResults, 
  } = useSearchStore();

  // 타임아웃 상태 관리
  const [isTimeout, setIsTimeout] = useState(false);
  const timeoutRef = useRef(null);
  const SEARCH_TIMEOUT_MS = 15000; // 15초 타임아웃

  const { 
    programs: sdkPrograms, 
    total: sdkTotal, 
    isLoading, 
    error, 
    summary: sdkSummary, 
    streamingSummary, 
    isSummaryLoading, 
    lastQuery: sdkLastQuery, 
    search, 
  } = useProgramSearch();

  // SDK 결과를 Store에 동기화
  useEffect(() => {
    if (!isLoading && sdkLastQuery && (sdkPrograms.length > 0 || sdkSummary)) {
      setSearchResults({
        programs: sdkPrograms,
        total: sdkTotal,
        summary: sdkSummary,
        lastQuery: sdkLastQuery,
      });
    }
  }, [sdkPrograms, sdkTotal, sdkSummary, sdkLastQuery, isLoading, setSearchResults]);

  // 화면에 표시할 데이터 결정 (SDK 데이터가 우선, 없으면 Store 데이터)
  // location state q를 확인
  const qFromState = location.state?.q;
  const currentQuery = qFromState;

  const isMatchingStoredQuery = currentQuery && currentQuery === storedLastQuery;
  
  const displayPrograms = (isLoading || !isMatchingStoredQuery) ? sdkPrograms : (sdkPrograms.length > 0 ? sdkPrograms : storedPrograms);
  const displayTotal = (isLoading || !isMatchingStoredQuery) ? sdkTotal : (sdkTotal > 0 ? sdkTotal : storedTotal);
  const displaySummary = (isLoading || !isMatchingStoredQuery) ? sdkSummary : (sdkSummary || storedSummary);

  // 데이터 수신 시 타임아웃 해제
  useEffect(() => {
    if (sdkPrograms.length > 0 || sdkSummary || streamingSummary) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsTimeout(false);
    }
  }, [sdkPrograms, sdkSummary, streamingSummary]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // 검색 실행 로직
  useEffect(() => {
    const q = qFromState;
    if (q) {
      setQuery(q);
      // 이미 같은 쿼리로 검색된 결과가 있다면(SDK 또는 Store) 재검색하지 않음
      if (q !== sdkLastQuery && q !== storedLastQuery) {
        setVisibleCount(PAGE_SIZE);
        startSearch(q);
      }
    }
  }, [qFromState, sdkLastQuery, storedLastQuery]); 

  const startSearch = (searchQuery) => {
    setIsTimeout(false);
    
    // 기존 타이머 제거
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // 새 타이머 설정
    timeoutRef.current = setTimeout(() => {
      // 로딩 중이고 데이터가 없을 때만 타임아웃 처리
      setIsTimeout(true);
    }, SEARCH_TIMEOUT_MS);

    search(searchQuery);
  };

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      // 검색 시 visibleCount 초기화
      setVisibleCount(PAGE_SIZE);
      // 검색 실행
      startSearch(trimmedQuery);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOpenSearchOptionModal = () => {
    searchOptionModalRef.current.classList.add('on');
  };
  const handleCloseSearchOptionModal = () => {
    searchOptionModalRef.current.classList.remove('on');
  };

  const handleAiChat = () => {
    window.open('/service/ai-chat', '_blank');
  };

  const [visibleCount, setVisibleCount] = useState(4);
  const PAGE_SIZE = 4;
  const MAX_VISIBLE_COUNT = 10;

  const handleLoadMore = () => {
    setVisibleCount(prev => {
      if (prev >= MAX_VISIBLE_COUNT) {
        return PAGE_SIZE; // 접기 기능: 초기 개수로 복원
      }
      const nextCount = prev + PAGE_SIZE;
      return nextCount > MAX_VISIBLE_COUNT ? MAX_VISIBLE_COUNT : nextCount;
    });
  };

  const aiSmartSearchRef = useRef(null);

  const handleShowAllAiSearchPanel = () => {
    aiSmartSearchRef.current.classList.add('on');
  };

  const breadcrumbItems = [
    { label: '신청·발급', link: '#' },
    { label: 'AI 스마트검색', link: '#' },
  ];

  // 로딩 상태 판단 (SDK 로딩이면서 타임아웃이 아닐 때)
  const isRealLoading = isLoading && !isTimeout;

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
                  onKeyDown={handleKeyDown}
                  placeholder="기업 조건에 맞는 지원사업 공고를 찾아줘"
                />
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
                  <button className="krds-btn medium primary" onClick={handleSearch}>검색하기</button>
                </div>
              </div>
            </div>
            <p className="on-p3 ac">
              <button type="button" onClick={handleOpenSearchOptionModal} className="on-linktxt">상세검색</button>을 변경하시면 검색 카테고리를 필터링하여 정보를 조정할 수 있습니다
            </p>

            <div className={`on-smartsearch ${ (streamingSummary || displaySummary || isRealLoading) ? 'on' : ''}`} ref={aiSmartSearchRef}>
              <div className="on-smartsearch-left">
                <div>
                  <h3>
                    <span className="title"><i className="svg-icon ico-ai2"></i> AI 스마트 검색</span>
                    <span className="content">
                      {isRealLoading && !streamingSummary && !displaySummary ? (
                        'AI가 검색 결과를 분석 중입니다...'
                      ) : (
                        `"${sdkLastQuery || storedLastQuery || query}"에 대한 검색 결과를 분석한 결과, 총 ${displayTotal}개의 지원사업을 발견했습니다.`
                      )}
                    </span>
                  </h3>
                  <div className="on-smartsearch-conts hide-scrollbar" style={{ height: '100%' }}>
                    {isRealLoading && !streamingSummary && !displaySummary ? (
                      <div className="on-ai-loading">
                        <div className="icon-wrap">
                          <i className="svg-icon ico-ai lg"></i>
                        </div>
                        <h3 className="on-p2 mb-2">AI 스마트 검색 중입니다</h3>
                        <p className="on-p3">귀하의 기업에 꼭 맞는 지원사업을 인공지능이 분석하고 있습니다.</p>
                      </div>
                    ) : (
                      <>
                        <p className="on-p2">종합 판단</p>
                        <div className="on-p3" style={{ whiteSpace: 'pre-wrap' }}>
                          {streamingSummary || displaySummary || '분석 결과가 없습니다.'}
                        </div>
                        {/* 퍼블리싱 파일에 있던 샘플 리스트 구조는 필요 시 SDK 데이터에서 추출하여 바인딩 가능하나, 현재는 요약문 위주로 표시 */}
                        <button className="krds-btn gradient full medium mt-22">
                            AI에게 더 자세히 물어보기
                          <i className="svg-icon ico-angle right"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="on-smartsearch-right">
                <div className="ai-type" style={{ height: '100%' }}>
                  <ul className="krds-structured-list type-full">
                    {displayPrograms.slice(0, visibleCount).map((program) => {
                      const days = calculateDaysRemaining(program.endDate);
                      const ddayText = days !== null ? (days === 0 ? 'D-Day' : (days > 0 ? `D-${days}` : '마감')) : '상시';
                      return (
                        <li key={program.id} className="structured-item">
                          <div className="in">
                            <div className="card-top">
                              <div className="krds-badge-wrap">
                                <span className="krds-badge bg-white">{program.supportField}</span>
                                <span className="krds-badge bg-primary number">{ddayText}</span>
                              </div>
                              <button className="on-qna-ai on-colorblue2" type="button" onClick={handleAiChat}>
                                <i className="svg-icon ico-ai2 xs"></i>
                                    AI 상담
                              </button>
                            </div>
                            <div className="card-body">
                              <Link to={`/service/pbanc/${program.id}`} className="c-text">
                                <p className="c-tit visited sml no-icon"><span className="span">{program.title}</span></p>
                                <p className="on-list-btm">
                                  <span>
                                    <i className="svg-icon ico-building"></i>
                                    {program.agency}
                                  </span>
                                  <span>
                                    {program.startDate} ~ {program.endDate || '상시접수'}
                                  </span>
                                </p>
                                <div className="card-btm noborder pt-0">
                                  {program.tags?.slice(0, 3).map((tag, i) => (
                                    <span key={i} className={`tag ${i === 0 ? 'emphasis' : ''}`}>{tag}</span>
                                  ))}
                                  {/* 태그가 없는 경우 기본 태그 표시 (샘플 데이터 기반) */}
                                  {!program.tags && (
                                    <>
                                      <span className="tag emphasis">지원사업</span>
                                      <span className="tag">중소기업</span>
                                    </>
                                  )}
                                </div>
                              </Link>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                    {displayPrograms.length === 0 && !isRealLoading && (
                      <p className="ac py-20">검색 결과가 없습니다.</p>
                    )}
                  </ul>
                  {displayPrograms.length > PAGE_SIZE && (
                    <button className="krds-btn white full medium" onClick={handleLoadMore}>
                      {visibleCount >= MAX_VISIBLE_COUNT || visibleCount >= displayPrograms.length ? (
                        <>
                          접기
                          <i className="svg-icon ico-angle up"></i>
                        </>
                      ) : (
                        <>
                          더보기
                          <i className="svg-icon ico-angle down"></i>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="on-smartsearch-moreview" onClick={handleShowAllAiSearchPanel}>
                <button type="button" className="krds-btn secondary medium">더보기<i className="svg-icon ico-angle"></i></button>
              </div>
            </div>

            <div className="search-list-top">
              <ul className="sch-info" aria-live="polite">
                <li>검색 결과 <span className="point">{displayTotal}</span>개</li>
              </ul>
              <ul className="sch-sort">
                <li>
                  <strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
                  <select className="krds-form-select-sort" id="search_result_count">
                    <option>12개</option>
                    <option>9개</option>
                  </select>
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                  검색 중 오류가 발생했습니다: {error.message}
              </div>
            )}

            {isTimeout && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-700 mb-6 text-center">
                <p className="mb-2">검색 응답 시간이 초과되었습니다.</p>
                <button 
                  onClick={handleSearch}
                  className="px-4 py-2 bg-orange-100 hover:bg-orange-200 rounded text-sm font-medium transition-colors"
                >
                    다시 시도하기
                </button>
              </div>
            )}

            <ul className="krds-structured-list type-full">
              {isRealLoading && displayPrograms.length === 0 ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <li key={`skeleton-${idx}`} className="structured-item">
                    <div className="in">
                      <div className="card-top">
                        <div className="krds-badge-wrap">
                          <span className="on-skeleton badge"></span>
                          <span className="on-skeleton badge"></span>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="c-text">
                          <div className="on-skeleton title"></div>
                          <div className="on-skeleton text"></div>
                          <div className="on-skeleton text" style={{ width: '70%' }}></div>
                        </div>
                        <div className="c-btn column">
                          <div className="on-skeleton button"></div>
                          <div className="on-skeleton button"></div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : displayPrograms.length > 0 ? (
                displayPrograms.map((program) => {
                  const days = calculateDaysRemaining(program.endDate);
                  let ddayClass = 'krds-badge bg-primary number';
                  let ddayText = days !== null ? (days === 0 ? 'D-Day' : (days > 0 ? `D-${days}` : '마감')) : '상시';
                    
                  if (days !== null && days <= 7 && days >= 0) {
                    ddayClass = 'krds-badge bg-primary number'; 
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
                          <a href="#" className="c-text">
                            <p className="c-tit visited sml no-icon"><span className="span">{program.title}</span></p>
                            <p className="c-txt" style={{ whiteSpace: 'pre-wrap' }}>
                              {program.bizOutline}
                            </p>
                            {program.aiAnalysis && (
                              <p className="guide-txt sm">
                                <i className="svg-icon ico-ai"></i>
                                <span className="on-p3" style={{ whiteSpace: 'pre-wrap' }}>
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
                                {program.startDate} ~ {program.endDate || '상시접수'}
                              </span>
                              <span>
                                <i className="svg-icon ico-building"></i>
                                {program.agency}
                              </span>
                            </p>
                          </a>
                          <div className="c-btn column">
                            <button className="krds-btn tertiary"><i className="svg-icon ico-like"></i> 관심</button>
                            <button className="krds-btn tertiary medium" onClick={handleAiChat}><i className="svg-icon ico-faq"></i> AI상담</button>
                            <Link to={`/service/pbanc/${program.id}`} className="krds-btn secondary">바로보기</Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })
              ) : !isRealLoading && !isTimeout && (
                <li className="structured-item">
                  <div className="in ac py-12">
                    <p className="text-neutral-600">검색 결과가 없습니다.</p>
                  </div>
                </li>
              )}
            </ul>
            {/* <Pagination /> */}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const SAMPLE_COMPANY_PROFILE = {
  region: '전국',
  // companySize: "소기업",
  isSme: true,
  // isVenture: true,
  // isStartup: true,
  // isYouth: true,
  // hasInnobiz: false,
  // hasMainbiz: false,
  // hasResearchDept: true,
  // registeredPatents: 3,
};

const AiSmartSearch = () => {
  return (
    <ProgramSearchProvider profile={SAMPLE_COMPANY_PROFILE} stream topK={20}>
      <AiSmartSearchContent />
    </ProgramSearchProvider>
  );
};

export default AiSmartSearch;
