import React, { useRef, useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header.jsx';
import Footer from '../../components/ui/Footer.jsx';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { api as apiClient } from '../../lib/apiClient.js';
import './ai.css';
import {
  ProgramSearchProvider,
  useProgramSearch,
  formatDate,
  calculateDaysRemaining,
  formatAIResponse,
  REGION_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  SUPPORT_FIELD_OPTIONS,
  SUPPORT_TYPE_OPTIONS,
  DEADLINE_TYPE_OPTIONS,
  DEFAULT_SEARCH_FILTERS,
  countSelectedFilters,
  toFriendlyStatusMessage,
} from '@cube-i-ax/sdk/smes/program';
import useSearchStore from '../../store/useSearchStore';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { useAiChatPopup } from '../../hooks/useAiChat';

import { AI_SETTINGS } from '../../App.jsx';

const AiSmartSearchContent = ({ profile }) => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const searchOptionModalRef = useRef(null);
  const totalSearchAbortRef = useRef(null);
  const totalRevealTimerRef = useRef(null);
  const TOTAL_SEARCH_ENDPOINT = '/api/v1/search/total';
  const TOTAL_REVEAL_INTERVAL_MS = 140;
  const [filters, setFilters] = useState(DEFAULT_SEARCH_FILTERS);
  const lastExecutedQueryRef = useRef('');
  
  // Custom Hook for AI Chat Popup
  const { openChat } = useAiChatPopup();
  
  // Zustand Store
  const { 
    programs: storedPrograms, 
    total: storedTotal, 
    summary: storedSummary, 
    lastQuery: storedLastQuery,
    setSearchResults, 
  } = useSearchStore();

  const [totalSearchResults, setTotalSearchResults] = useState([]);
  const [totalSearchTotal, setTotalSearchTotal] = useState(0);
  const [totalSearchLoading, setTotalSearchLoading] = useState(false);
  const [totalSearchError, setTotalSearchError] = useState(null);
  const [totalVisibleCount, setTotalVisibleCount] = useState(0);
  const [lastTotalQuery, setLastTotalQuery] = useState('');

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
    status,
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
  const qFromState = location.state?.q;
  const currentQuery = qFromState;
  const isMatchingStoredQuery = currentQuery && currentQuery === storedLastQuery;
  
  const displayPrograms = (isLoading || !isMatchingStoredQuery) ? sdkPrograms : (sdkPrograms.length > 0 ? sdkPrograms : storedPrograms);
  const displayTotal = (isLoading || !isMatchingStoredQuery) ? sdkTotal : (sdkTotal > 0 ? sdkTotal : storedTotal);
  const displaySummary = (isLoading || !isMatchingStoredQuery) ? sdkSummary : (sdkSummary || storedSummary);
  
  const summaryMarkdown = useMemo(() => {
    const rawSummary = streamingSummary || displaySummary || '';
    if (!rawSummary) return '';
    return formatAIResponse(rawSummary, { stripTags: true });
  }, [streamingSummary, displaySummary]);
  
  const statusMessage = useMemo(() => {
    return toFriendlyStatusMessage(status?.message, '관련 지원사업을 찾아보고 있어요.');
  }, [status]);

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
      if (totalSearchAbortRef.current) {
        totalSearchAbortRef.current.abort();
      }
      if (totalRevealTimerRef.current) {
        clearInterval(totalRevealTimerRef.current);
        totalRevealTimerRef.current = null;
      }
    };
  }, []);

  // 검색 실행 로직
  useEffect(() => {
    const q = qFromState;
    if (q) {
      setQuery(q);
      if (q !== sdkLastQuery && q !== storedLastQuery) {
        setVisibleCount(PAGE_SIZE);
        startSearch(q, filters);
        if (aiSmartSearchRef.current) {
          aiSmartSearchRef.current.classList.add('on');
        }
      }
      if (q !== lastTotalQuery) {
        startTotalSearch(q);
      }
    }
  }, [qFromState, sdkLastQuery, storedLastQuery, lastTotalQuery]); 

  const startSearch = (searchQuery, activeFilters = filters) => {
    setIsTimeout(false);
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      lastExecutedQueryRef.current = trimmedQuery;
    }
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsTimeout(true);
    }, SEARCH_TIMEOUT_MS);

    const sdkFilters = {
      regions: activeFilters.regions,
      companySizes: activeFilters.companySizes,
      supportFields: activeFilters.supportFields,
      supportTypes: activeFilters.supportTypes,
      deadlineTypes: activeFilters.deadlineTypes,
      includePast: activeFilters.includePast,
      exactRegions: true,
    };
    search(trimmedQuery, sdkFilters, { metadata: { summaryMode: true } });
  };

  const startTotalSearch = async (searchQuery) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    if (totalSearchAbortRef.current) {
      totalSearchAbortRef.current.abort();
    }

    const controller = new AbortController();
    totalSearchAbortRef.current = controller;

    setTotalSearchLoading(true);
    setTotalSearchError(null);
    setLastTotalQuery(trimmedQuery);

    try {
      const params = new URLSearchParams({ q: trimmedQuery });
      const response = await apiClient.get(`${TOTAL_SEARCH_ENDPOINT}?${params.toString()}`, {
        signal: controller.signal,
      });
      const list = response?.data || response?.items || response?.results || [];
      const total = response?.total ?? response?.totalCount ?? list.length;
      setTotalSearchResults(list);
      setTotalSearchTotal(total);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setTotalSearchResults([]);
      setTotalSearchTotal(0);
      setTotalSearchError(err);
    } finally {
      setTotalSearchLoading(false);
    }
  };

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      setVisibleCount(PAGE_SIZE);
      startSearch(trimmedQuery, filters);
      startTotalSearch(trimmedQuery);
      if (aiSmartSearchRef.current) {
        aiSmartSearchRef.current.classList.add('on');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Modal Handlers
  const handleOpenSearchOptionModal = () => searchOptionModalRef.current.classList.add('on');
  const handleCloseSearchOptionModal = () => searchOptionModalRef.current.classList.remove('on');
  const handleApplyFilters = () => {
    // handleSearch();
    handleCloseSearchOptionModal();
  };
  const handleResetFilters = () => setFilters(DEFAULT_SEARCH_FILTERS);
  
  const handleToggleFilterValue = (key, value) => {
    setFilters(prev => {
      const current = prev[key];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter(item => item !== value) : [...current, value],
      };
    });
  };
  
  const handleIncludePastChange = (value) => {
    setFilters(prev => ({ ...prev, includePast: value }));
  };

  const selectedFilterCount = countSelectedFilters(filters);
  const selectedFilterLabels = useMemo(() => {
    const labels = [
      ...filters.regions,
      ...filters.companySizes,
      ...filters.supportFields,
      ...filters.supportTypes,
      ...filters.deadlineTypes,
    ];
    if (filters.includePast) {
      labels.push('지난공고 포함');
    }
    return labels;
  }, [filters]);

  const handleAiChat = (programIds) => {
    if (isRealLoading) return;
    
    const targetIds = Array.isArray(programIds) ? programIds : [programIds];
    const targetPrograms = displayPrograms.filter(p => targetIds.includes(p.id));
    
    const currentQuery = lastExecutedQueryRef.current || query.trim() || sdkLastQuery || '';
    const summaryPayload = streamingSummary || displaySummary || '';
    
    const compactPrograms = targetPrograms.map((program) => ({
      id: program.id,
      title: program.title,
      agency: program.agency,
      supportField: program.supportField,
      deadlineType: program.deadlineType,
      startDate: program.startDate,
      endDate: program.endDate,
      tags: program.tags,
    }));

    const payload = {
      programs: compactPrograms,
      query: currentQuery || '',
      summary: summaryPayload || '',
      total: displayTotal || compactPrograms.length,
      filters: filters,
      profile: profile,
    };

    openChat(payload);
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === displayPrograms.length && displayPrograms.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayPrograms.map(p => p.id)));
    }
  };

  const handleConsultSelected = () => {
    if (isRealLoading) return;
    
    // 선택된 공고가 없으면 전체 공고를 대상으로 함
    const ids = Array.from(selectedIds);
    const targetIds = ids.length > 0 ? ids : displayPrograms.map(p => p.id);
    
    if (targetIds.length === 0) {
      alert('검색된 공고가 없습니다.');
      return;
    }
    handleAiChat(targetIds);
  };

  // Total Search Reveal Animation
  useEffect(() => {
    if (totalRevealTimerRef.current) {
      clearInterval(totalRevealTimerRef.current);
      totalRevealTimerRef.current = null;
    }

    if (totalSearchLoading || totalSearchResults.length === 0) {
      setTotalVisibleCount(0);
      return;
    }

    setTotalVisibleCount(0);
    totalRevealTimerRef.current = setInterval(() => {
      setTotalVisibleCount(prev => {
        const next = prev + 1;
        if (next >= totalSearchResults.length) {
          clearInterval(totalRevealTimerRef.current);
          totalRevealTimerRef.current = null;
          return totalSearchResults.length;
        }
        return next;
      });
    }, TOTAL_REVEAL_INTERVAL_MS);

    return () => {
      if (totalRevealTimerRef.current) {
        clearInterval(totalRevealTimerRef.current);
        totalRevealTimerRef.current = null;
      }
    };
  }, [totalSearchResults, totalSearchLoading]);

  const [visibleCount, setVisibleCount] = useState(4);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const PAGE_SIZE = 4;

  useEffect(() => {
    if (displayPrograms.length > 0) {
      if (isExpanded) {
        setVisibleCount(displayPrograms.length);
      } else {
        setVisibleCount(PAGE_SIZE);
      }
    }
  }, [displayPrograms.length, isExpanded]);

  const handleLoadMore = () => {
    setIsExpanded(!isExpanded);
  };

  const aiSmartSearchRef = useRef(null);
  const handleShowAllAiSearchPanel = () => {
    aiSmartSearchRef.current.classList.add('on');
  };

  const breadcrumbItems = [
    { label: '신청·발급', link: '#' },
    { label: 'AI 스마트검색', link: '#' },
  ];

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
                        {REGION_OPTIONS.map((region) => {
                          const id = `filter_region_${region}`;
                          return (
                            <div className="krds-form-chip small" key={region}>
                              <input
                                type="checkbox"
                                className="checkbox"
                                id={id}
                                checked={filters.regions.includes(region)}
                                onChange={() => handleToggleFilterValue('regions', region)}
                              />
                              <label className="krds-form-chip-outline" htmlFor={id}>{region}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="on-searchoption-checklists">
                      <h4>기업규모</h4>
                      <div className="krds-check-area">
                        {COMPANY_SIZE_OPTIONS.map((size) => {
                          const id = `filter_company_${size}`;
                          return (
                            <div className="krds-form-chip small" key={size}>
                              <input
                                type="checkbox"
                                className="checkbox"
                                id={id}
                                checked={filters.companySizes.includes(size)}
                                onChange={() => handleToggleFilterValue('companySizes', size)}
                              />
                              <label className="krds-form-chip-outline" htmlFor={id}>{size}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="on-searchoption-checklists">
                      <h4>지원분야</h4>
                      <div className="krds-check-area">
                        {SUPPORT_FIELD_OPTIONS.map((field) => {
                          const id = `filter_support_field_${field}`;
                          return (
                            <div className="krds-form-chip small" key={field}>
                              <input
                                type="checkbox"
                                className="checkbox"
                                id={id}
                                checked={filters.supportFields.includes(field)}
                                onChange={() => handleToggleFilterValue('supportFields', field)}
                              />
                              <label className="krds-form-chip-outline" htmlFor={id}>{field}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="on-searchoption-checklists">
                      <h4>지원유형</h4>
                      <div className="krds-check-area">
                        {SUPPORT_TYPE_OPTIONS.map((type) => {
                          const id = `filter_support_type_${type}`;
                          return (
                            <div className="krds-form-chip small" key={type}>
                              <input
                                type="checkbox"
                                className="checkbox"
                                id={id}
                                checked={filters.supportTypes.includes(type)}
                                onChange={() => handleToggleFilterValue('supportTypes', type)}
                              />
                              <label className="krds-form-chip-outline" htmlFor={id}>{type}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="on-searchoption-checklists">
                      <h4>마감유형</h4>
                      <div className="krds-check-area">
                        {DEADLINE_TYPE_OPTIONS.map((type) => {
                          const id = `filter_deadline_${type}`;
                          return (
                            <div className="krds-form-chip small" key={type}>
                              <input
                                type="checkbox"
                                className="checkbox"
                                id={id}
                                checked={filters.deadlineTypes.includes(type)}
                                onChange={() => handleToggleFilterValue('deadlineTypes', type)}
                              />
                              <label className="krds-form-chip-outline" htmlFor={id}>{type}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="on-tooltipbox-footer">
                  <div className="krds-form-toggle-switch medium">
                    <input
                      type="checkbox"
                      id="include_past_toggle"
                      checked={filters.includePast}
                      onChange={(e) => handleIncludePastChange(e.target.checked)}
                    />
                    <label htmlFor="include_past_toggle">
                      <span className="switch-toggle"><i></i></span>
                      지난 공고 포함
                      <span className="on-toggle-desc">(마감된 공고도 검색)</span>
                    </label>
                  </div>
                  <div className="on-tooltipbox-footer-meta">
                    <button className="krds-btn medium text" onClick={handleResetFilters}>전체 해제</button>
                    {selectedFilterCount > 0 && (
                      <span className="on-tooltipbox-footer-count">{selectedFilterCount}개 선택됨</span>
                    )}
                    <button className="krds-btn medium primary" onClick={handleApplyFilters}>적용하기</button>
                  </div>
                </div>
              </div>
            </div>
            {selectedFilterLabels.length > 0 && (
              <div className="on-search-filter-tags">
                {selectedFilterLabels.map((label, idx) => (
                  <span key={`${label}-${idx}`} className="on-search-filter-tag">{label}</span>
                ))}
              </div>
            )}
            <p className="on-p3 ac">
              <button type="button" onClick={handleOpenSearchOptionModal} className="on-linktxt">상세검색</button>을 변경하시면 검색 카테고리를 필터링하여 정보를 조정할 수 있습니다
            </p>

            <div className={`on-smartsearch ${ (streamingSummary || displaySummary || isRealLoading) ? 'on' : ''}`} ref={aiSmartSearchRef}>
              <div className="on-smartsearch-left">
                <div>
                  <h3>
                    <span className="content">
                      {isRealLoading && !streamingSummary && !displaySummary ? (
                        'AI가 검색 결과를 분석 중입니다...'
                      ) : (
                        `"${sdkLastQuery || storedLastQuery || query}"에 대한 검색 결과를 분석한 결과, 총 ${displayTotal}개의 지원사업을 발견했습니다.`
                      )}
                    </span>
                  </h3>
                  <div className="on-smartsearch-conts hide-scrollbar" style={{ height: '100%' }}>
                    {(isRealLoading || status) && (
                      <div className="on-ai-status">
                        <span className="on-ai-status-label">AI 분석</span>
                        <span className="on-ai-status-text">{statusMessage}</span>
                        <span className="on-ai-status-dots" aria-hidden="true">
                          <i></i><i></i><i></i>
                        </span>
                      </div>
                    )}
                    <div className="on-p3 on-ai-summary-markdown">
                      {summaryMarkdown ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {summaryMarkdown}
                        </ReactMarkdown>
                      ) : isRealLoading ? (
                        ' '
                      ) : (
                        ' '
                      )}
                    </div>
                    <button 
                      className="krds-btn gradient full medium mt-22" 
                      onClick={handleConsultSelected}
                      disabled={isRealLoading}
                    >
                        AI에게 더 자세히 물어보기
                      <i className="svg-icon ico-angle right"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="on-smartsearch-right">
                <div className="ai-type">
                  <div className="on-ai-type-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', backgroundColor: '#052B57', padding: '10px 16px', borderRadius: '8px' }}>
                    <div className="krds-check-area" style={{ flex: '1' }}>
                      <div className="krds-form-check">
                        <input 
                          type="checkbox" 
                          className="checkbox"
                          id="chk_all_programs"
                          checked={selectedIds.size === displayPrograms.length && displayPrograms.length > 0} 
                          onChange={handleSelectAll}
                        />
                        <label className="krds-form-check-label" htmlFor="chk_all_programs" style={{ color: '#fff', fontSize: '15px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                          {selectedIds.size > 0 ? `지원공고 ${selectedIds.size}건 선택됨` : `지원공고 ${displayPrograms.length}건`}
                        </label>
                      </div>
                    </div>
                    <button 
                      className="krds-btn white small" 
                      onClick={handleConsultSelected}
                      disabled={isRealLoading}
                      style={{ fontSize: '13px', padding: '4px 12px', height: 'auto', borderRadius: '4px', flexShrink: 0, marginLeft: '12px' }}
                    >
                      AI 컨설턴트
                    </button>
                  </div>
                  <ul className={`krds-structured-list type-full ${isExpanded ? 'is-active' : ''}`}>
                    {displayPrograms.slice(0, visibleCount).map((program) => {
                      const days = calculateDaysRemaining(program.endDate);
                      const ddayText = days !== null ? (days === 0 ? 'D-Day' : (days > 0 ? `D-${days}` : '마감')) : '상시';
                      const isSelected = selectedIds.has(program.id);
                      return (
                        <li key={program.id} className="structured-item">
                          <div className="in">
                            <div className="card-top">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="krds-check-area">
                                  <div className="krds-form-check">
                                    <input 
                                      type="checkbox" 
                                      className="checkbox"
                                      id={`chk_${program.id}`}
                                      checked={isSelected}
                                      onChange={() => handleToggleSelect(program.id)}
                                    />
                                    <label className="krds-form-check-label" htmlFor={`chk_${program.id}`}>
                                      <span className="sr-only">선택</span>
                                    </label>
                                  </div>
                                </div>
                                <div className="krds-badge-wrap">
                                  <span className="krds-badge bg-white">{program.supportField}</span>
                                  {program.deadlineType && <span className="krds-badge bg-white">{program.deadlineType}</span>}
                                  <span className="krds-badge bg-primary number">{ddayText}</span>
                                </div>
                              </div>
                              <button 
                                className="on-qna-ai on-colorblue2" 
                                type="button" 
                                onClick={() => handleAiChat(program.id)}
                                disabled={isRealLoading}
                              >
                                <i className="svg-icon ico-ai2 xs"></i>
                                    AI 상담
                              </button>
                            </div>
                            <div className="card-body">
                              <Link to={`/req/pbanc/pbanc/${program.id}`} className="c-text">
                                <p className="c-tit visited sml no-icon"><span className="span">{program.title}</span></p>
                                <p className="on-list-btm">
                                  <span>
                                    <i className="svg-icon ico-building"></i>
                                    {program.agency}
                                  </span>
                                  <span>
                                    {formatDate(program.startDate)} ~ {formatDate(program.endDate) === '-' ? '상시접수' : formatDate(program.endDate)}
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
                      {isExpanded ? (
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

            {/*{error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                  검색 중 오류가 발생했습니다: {error.message}
              </div>
            )}*/}

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
  const { companyProfile } = useAuthStore();
  const effectiveProfile = companyProfile || SAMPLE_COMPANY_PROFILE;
  const [aiEnv, setAiEnv] = useState(() => localStorage.getItem('__ai_env__') || 'dev');

  useEffect(() => {
    const handleEnvChange = (e) => {
      setAiEnv(e.detail || 'dev');
    };
    window.addEventListener('ai-env-change', handleEnvChange);
    return () => window.removeEventListener('ai-env-change', handleEnvChange);
  }, []);
  
  return (
    <ProgramSearchProvider 
      key={aiEnv} 
      profile={effectiveProfile} 
      stream 
      topK={AI_SETTINGS.topK}
      rerankerTopK={AI_SETTINGS.rerankerTopK}
      domain={AI_SETTINGS.domain}
      groupByField={AI_SETTINGS.groupByField}
    >
      <AiSmartSearchContent profile={effectiveProfile} />
    </ProgramSearchProvider>
  );
};

export default AiSmartSearch;
