import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatContext } from '@cube-i-ax/sdk/react';
import {
  calculateDaysRemaining,
  formatAIResponse,
  REGION_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  SUPPORT_FIELD_OPTIONS,
  SUPPORT_TYPE_OPTIONS,
  DEADLINE_TYPE_OPTIONS,
  convertFiltersToQuery,
  DEFAULT_SEARCH_FILTERS,
} from '@cube-i-ax/sdk/smes/program';
import Logo from '../../styles/img/ai_chat_logo.svg';

const AiChat = () => {
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [initialQuery, setInitialQuery] = useState('');
  const [initialSummary, setInitialSummary] = useState('');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(null);
  const [showList, setShowList] = useState(false);
  const [notice, setNotice] = useState('');
  const [payloadReady, setPayloadReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_SEARCH_FILTERS);
  const [openGroup, setOpenGroup] = useState('regions');
  const [activeCategory, setActiveCategory] = useState('사업공고');

  const SIDEBAR_CATEGORIES = [
    '전체', '사업공고', '지원사업안내', '정책금융', '제도 안내', '사용매뉴얼'
  ];

  const location = useLocation();
  const initialSentRef = useRef(false);
  const encodedPayload = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('payload');
  }, [location.search]);

  const {
    messages,
    isLoading,
    streamingContent,
    followupSuggestions,
    setDocumentContext,
    sendMessage,
    clearMessages,
  } = useChatContext();

  const applyPayload = (payload) => {
    console.log('[DEBUG_LOG] applyPayload called', { hasSummary: !!payload.summary, query: payload.query });
    setSelectedPrograms(payload.programs || []);
    setInitialQuery(payload.query || '');
    setInitialSummary(payload.summary || '');
    if (payload.filters) {
      setFilters(payload.filters);
    }
    clearMessages?.();
    // 이미 요약 정보가 있다면 진입 시 자동 검색을 수행하지 않음
    if (payload.summary) {
      console.log('[DEBUG_LOG] Summary found in payload, blocking initial sent');
      initialSentRef.current = true;
    } else {
      initialSentRef.current = false;
    }
    setPayloadReady(true);
  };

  useEffect(() => {
    console.log('[DEBUG_LOG] encodedPayload effect', { encodedPayload: !!encodedPayload });
    setPayloadReady(false);
    setSelectedPrograms([]);
    setInitialQuery('');
    setInitialSummary('');
    setDocumentContext(null);
    clearMessages?.();
    // encodedPayload가 바뀔 때만 리셋. applyPayload 내부에서 다시 설정될 것임.
    initialSentRef.current = false;

    if (!encodedPayload) {
      setNotice('공고 정보를 불러오지 못했습니다. 다시 시도해 주세요.');
      return;
    }

    try {
      const decoded = decodeURIComponent(encodedPayload);
      const json = decodeURIComponent(escape(atob(decoded)));
      const parsed = JSON.parse(json);
      applyPayload(parsed);
    } catch (e) {
      console.error('Failed to decode payload', e);
      setNotice('공고 정보를 불러오지 못했습니다. 다시 시도해 주세요.');
    }
  }, [encodedPayload]);

  useEffect(() => {
    const updateSidebar = () => {
      if (window.innerWidth < 1200) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    updateSidebar();
    window.addEventListener('resize', updateSidebar);
    return () => window.removeEventListener('resize', updateSidebar);
  }, []);

  const programIds = useMemo(
    () => selectedPrograms.map((program) => program.id).filter(Boolean),
    [selectedPrograms]
  );
  const filtersQuery = useMemo(
    () => convertFiltersToQuery(filters, { exactRegions: true }),
    [filters]
  );

  const lastUserMessage = useMemo(() => {
    return [...messages].reverse().find((msg) => msg.role === 'user');
  }, [messages]);

  const lastAssistantMessage = useMemo(() => {
    return [...messages].reverse().find((msg) => msg.role === 'assistant');
  }, [messages]);

  const displayContent = useMemo(() => {
    if (!payloadReady) return '';
    // 사용자가 명시적으로 질문을 던지기 전이고 초기 요약이 존재한다면,
    // SDK의 메시지(자동 검색 결과 등)보다 초기 요약을 우선 표시하여 결과가 바뀌는 것을 방지
    if (!hasUserInteracted && initialSummary && !streamingContent) {
      return formatAIResponse(initialSummary, { stripTags: true });
    }
    const rawContent = streamingContent || lastAssistantMessage?.content || initialSummary;
    if (!rawContent) return '';
    return formatAIResponse(rawContent, { stripTags: true });
  }, [payloadReady, streamingContent, lastAssistantMessage, initialSummary, hasUserInteracted]);

  useEffect(() => {
    if (!payloadReady) return;
    if (programIds.length > 0) {
      console.log('[DEBUG_LOG] Setting document context', programIds);
      setDocumentContext(programIds);
    }
  }, [payloadReady, programIds, setDocumentContext]);

  useEffect(() => {
    if (!payloadReady) return;
    
    // 이미 요약 정보가 존재한다면 절대로 자동 검색을 수행하지 않음
    if (initialSummary) {
      console.log('[DEBUG_LOG] Skip auto-search: initialSummary exists');
      initialSentRef.current = true;
      return;
    }

    if (initialSentRef.current) {
      console.log('[DEBUG_LOG] Skip auto-search: already sent or blocked');
      return;
    }

    if (!initialQuery || messages.length > 0 || programIds.length === 0) {
      console.log('[DEBUG_LOG] Skip auto-search: conditions not met', { initialQuery, messagesLen: messages.length, programsLen: programIds.length });
      return;
    }

    console.log('[DEBUG_LOG] Executing auto-search', initialQuery);
    initialSentRef.current = true;
    setHasUserInteracted(true);
    sendMessage(initialQuery, { documentContext: programIds, filters: filtersQuery });
  }, [payloadReady, initialQuery, messages.length, programIds, filtersQuery, sendMessage, initialSummary]);

  const handleToggle = (type) => {
    setStatus((prev) => (prev === type ? null : type));
  };

  const showMoreList = () => {
    setShowList(true);
  };

  const handleSendMessage = (message) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setHasUserInteracted(true);
    sendMessage(trimmed, { documentContext: programIds, filters: filtersQuery });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(input);
    }
  };
  const handleToggleFilter = (key, value) => {
    setFilters((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };
  const handleRefineSearch = () => {
    const message = input.trim() || initialQuery;
    if (!message) return;
    setHasUserInteracted(true);
    sendMessage(message, { documentContext: programIds, filters: filtersQuery });
    setInput('');
  };

  const openInNewTab = (path) => {
    const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const targetUrl = `${baseUrl}${path}`;
    if (window.opener && !window.opener.closed) {
      const opened = window.opener.open(targetUrl, '_blank');
      if (opened) return true;
    }
    const opened = window.open(targetUrl, '_blank');
    if (opened) return true;
    setNotice('새 탭이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.');
    window.setTimeout(() => setNotice(''), 2000);
    return false;
  };

  const handleCopyMarkdown = async () => {
    if (!displayContent) return;
    try {
      await navigator.clipboard.writeText(displayContent);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = displayContent;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  return (
    <>
      <div className="ai-chat-wrap">
        {notice && (
          <div className="ai-chat-toast" role="status" aria-live="polite">
            {notice}
          </div>
        )}
        {isSidebarOpen && <button type="button" className="ai-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
        <button
          type="button"
          className="ai-sidebar-toggle"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          상세검색
        </button>
        {/* sidebar */}
        <div className={`ai-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
          <div className="sidebar-logo">
            <Link to="#" className="sidebar-logo-link">
              <img src={Logo} alt="logo" />
            </Link>
          </div>
          <div className="sidebar-filter hide-scrollbar">
            {/* 상단 카테고리 그리드 */}
            <div className="sidebar-category-grid">
              {SIDEBAR_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  disabled={cat !== '사업공고'}
                >
                  {cat}
                </button>
              ))}
            </div>

            <h3 className="sidebar-title">지원공고</h3>

            <div className="sidebar-filter-panel">
              {/* 지역 */}
              <div className={`filter-group-accordion ${openGroup === 'regions' ? 'is-open' : ''}`}>
                <button 
                  type="button" 
                  className="accordion-header"
                  onClick={() => setOpenGroup(openGroup === 'regions' ? null : 'regions')}
                >
                  <span className="group-name">지역</span>
                  <div className="header-right">
                    {filters.regions.length > 0 && <span className="selection-count">{filters.regions.length}</span>}
                    <i className={`svg-icon ico-angle ${openGroup === 'regions' ? 'up' : 'down'}`}></i>
                  </div>
                </button>
                <div className="accordion-content">
                  <div className="filter-options-grid col-4">
                    <label className={`grid-option ${filters.regions.length === 0 ? 'is-active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={filters.regions.length === 0}
                        onChange={() => setFilters(prev => ({ ...prev, regions: [] }))}
                      />
                      <span>전체</span>
                    </label>
                    {REGION_OPTIONS.map((region) => (
                      <label
                        key={region}
                        className={`grid-option ${filters.regions.includes(region) ? 'is-active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.regions.includes(region)}
                          onChange={() => handleToggleFilter('regions', region)}
                        />
                        <span>{region}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 기업규모 */}
              <div className={`filter-group-accordion ${openGroup === 'companySizes' ? 'is-open' : ''}`}>
                <button 
                  type="button" 
                  className="accordion-header"
                  onClick={() => setOpenGroup(openGroup === 'companySizes' ? null : 'companySizes')}
                >
                  <span className="group-name">기업규모</span>
                  <div className="header-right">
                    {filters.companySizes.length > 0 && <span className="selection-count">{filters.companySizes.length}</span>}
                    <i className={`svg-icon ico-angle ${openGroup === 'companySizes' ? 'up' : 'down'}`}></i>
                  </div>
                </button>
                <div className="accordion-content">
                  <div className="filter-options-grid col-2">
                    {COMPANY_SIZE_OPTIONS.map((size) => (
                      <label
                        key={size}
                        className={`grid-option ${filters.companySizes.includes(size) ? 'is-active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.companySizes.includes(size)}
                          onChange={() => handleToggleFilter('companySizes', size)}
                        />
                        <span>{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 지원분야 */}
              <div className={`filter-group-accordion ${openGroup === 'supportFields' ? 'is-open' : ''}`}>
                <button 
                  type="button" 
                  className="accordion-header"
                  onClick={() => setOpenGroup(openGroup === 'supportFields' ? null : 'supportFields')}
                >
                  <span className="group-name">지원분야</span>
                  <div className="header-right">
                    {filters.supportFields.length > 0 && <span className="selection-count">{filters.supportFields.length}</span>}
                    <i className={`svg-icon ico-angle ${openGroup === 'supportFields' ? 'up' : 'down'}`}></i>
                  </div>
                </button>
                <div className="accordion-content">
                  <div className="filter-options-grid col-2">
                    {SUPPORT_FIELD_OPTIONS.map((field) => (
                      <label
                        key={field}
                        className={`grid-option ${filters.supportFields.includes(field) ? 'is-active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.supportFields.includes(field)}
                          onChange={() => handleToggleFilter('supportFields', field)}
                        />
                        <span>{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 지원유형 */}
              <div className={`filter-group-accordion ${openGroup === 'supportTypes' ? 'is-open' : ''}`}>
                <button 
                  type="button" 
                  className="accordion-header"
                  onClick={() => setOpenGroup(openGroup === 'supportTypes' ? null : 'supportTypes')}
                >
                  <span className="group-name">지원유형</span>
                  <div className="header-right">
                    {filters.supportTypes.length > 0 && <span className="selection-count">{filters.supportTypes.length}</span>}
                    <i className={`svg-icon ico-angle ${openGroup === 'supportTypes' ? 'up' : 'down'}`}></i>
                  </div>
                </button>
                <div className="accordion-content">
                  <div className="filter-options-grid col-2">
                    {SUPPORT_TYPE_OPTIONS.map((type) => (
                      <label
                        key={type}
                        className={`grid-option ${filters.supportTypes.includes(type) ? 'is-active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.supportTypes.includes(type)}
                          onChange={() => handleToggleFilter('supportTypes', type)}
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 접수유형 (샘플 이미지에 있으나 SDK에 없으면 빈 상태로 두거나 목데이터 활용) */}
              <div className={`filter-group-accordion ${openGroup === 'receptionTypes' ? 'is-open' : ''}`}>
                <button 
                  type="button" 
                  className="accordion-header"
                  onClick={() => setOpenGroup(openGroup === 'receptionTypes' ? null : 'receptionTypes')}
                >
                  <span className="group-name">접수유형</span>
                  <div className="header-right">
                    <i className={`svg-icon ico-angle ${openGroup === 'receptionTypes' ? 'up' : 'down'}`}></i>
                  </div>
                </button>
                <div className="accordion-content">
                  <div className="filter-options-grid col-2">
                    {['온라인', '오프라인', '우편', '기타'].map((type) => (
                      <label key={type} className="grid-option">
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 마감유형 */}
              <div className={`filter-group-accordion ${openGroup === 'deadlineTypes' ? 'is-open' : ''}`}>
                <button 
                  type="button" 
                  className="accordion-header"
                  onClick={() => setOpenGroup(openGroup === 'deadlineTypes' ? null : 'deadlineTypes')}
                >
                  <span className="group-name">마감유형</span>
                  <div className="header-right">
                    {filters.deadlineTypes.length > 0 && <span className="selection-count">{filters.deadlineTypes.length}</span>}
                    <i className={`svg-icon ico-angle ${openGroup === 'deadlineTypes' ? 'up' : 'down'}`}></i>
                  </div>
                </button>
                <div className="accordion-content">
                  <div className="filter-options-grid col-2">
                    {DEADLINE_TYPE_OPTIONS.map((type) => (
                      <label
                        key={type}
                        className={`grid-option ${filters.deadlineTypes.includes(type) ? 'is-active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.deadlineTypes.includes(type)}
                          onChange={() => handleToggleFilter('deadlineTypes', type)}
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 마감공고 포함 토글 */}
            <div className="sidebar-bottom-toggle">
              <div className="krds-form-check toggle-style">
                <input
                  type="checkbox"
                  id="includePast"
                  checked={filters.includePast}
                  onChange={(e) => setFilters(prev => ({ ...prev, includePast: e.target.checked }))}
                />
                <label htmlFor="includePast">
                  <span className="check-icon"></span>
                  마감공고 포함
                </label>
              </div>
            </div>
          </div>
          <button type="button" className="krds-btn primary medium" onClick={handleRefineSearch}>결과 내 재검색하기</button>
        </div>

        {/* container */}
        <div className="ai-container">
          <div className="chat-section">
            <div className="chat-box">

              {/* 답변 영역 */}
              <div className="answer-wrap">
                <div className="answer-box">
                  <div className="answer-title ai-summary-title">
                    <span className="ai-summary-badge">AI 요약</span>
                    <p>{payloadReady ? (initialQuery || 'AI 요약') : 'AI 요약'}</p>
                  </div>
                  <div className="answer-conts-inner">
                    <div className="answer-content">
                      {payloadReady && displayContent ? (
                        <div className="content-desc ai-chat-markdown">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {displayContent}
                          </ReactMarkdown>
                        </div>
                      ) : !payloadReady ? (
                        <p className="content-desc">데이터를 불러오는 중입니다...</p>
                      ) : (
                        <p className="content-desc">{isLoading ? 'AI가 응답을 생성 중입니다...' : '응답을 기다리고 있습니다.'}</p>
                      )}
                    </div>
                    {payloadReady && followupSuggestions.length > 0 && (
                      <div className="recommend-question">
                        <h3 className="gradient-text">추가 질문하기</h3>
                        <ul className="question-list">
                          {followupSuggestions.map((suggestion) => (
                            <li key={suggestion} className="question-item">
                              <button
                                type="button"
                                className="question-text"
                                onClick={() => handleSendMessage(suggestion)}
                              >
                                {suggestion}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="option-btn-box">
                      <button type="button" className="option-btn btn-smile" onClick={() => handleToggle('smile')}>
                        <i className={`svg-icon ico-smile ${status === 'smile' ? 'is-active' : ''}`}></i>
                      </button>
                      <button type="button" className="option-btn btn-sad" onClick={() => handleToggle('sad')}>
                        <i className={`svg-icon ico-sad ${status === 'sad' ? 'is-active' : ''}`}></i>
                      </button>
                      <button type="button" className="option-btn btn-copy" onClick={handleCopyMarkdown}>
                        <i className="svg-icon ico-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="announcement-cont">
                  <div className="ai-type">
                    <div className="on-ai-type-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', backgroundColor: '#052B57', padding: '10px 16px', borderRadius: '8px' }}>
                      <span style={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}>지원공고 {selectedPrograms.length}건</span>
                    </div>
                    <ul className={`krds-structured-list type-full ${showList ? 'is-active' : ''}`}>
                      {selectedPrograms.map((program) => {
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
                              </div>
                              <div className="card-body">
                                <a
                                  href={`/req/pbanc/pbanc/${program.id}`}
                                  className="c-text"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    openInNewTab(`/req/pbanc/pbanc/${program.id}`);
                                  }}
                                >
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
                                </a>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {selectedPrograms.length > 4 && (
                      <button className="krds-btn white full medium" onClick={showMoreList}>
                        더보기
                        <i className="svg-icon ico-angle down"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ai-bottom-search">
            <div className="bottom-search">
              <div className="search-field-wrap">
                <div className="search-field">
                  <button type="button" className="input-btn btn-upload"><span className="sr-only">이미지 업로드</span><i className="svg-icon ico-upload"></i></button>
                  <input
                    type="text"
                    placeholder="사업공고와 관련된 궁금한 점을 입력해주세요"
                    title="검색 입력"
                    className="search-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button type="button" className="input-btn btn-refresh"><span className="sr-only">새로고침</span><i className="svg-icon ico-refresh"></i></button>
                </div>
                <button type="button" className="btn-search" onClick={() => handleSendMessage(input)}>
                  <span className="sr-only">ai 검색</span>
                  <i className="svg-icon ico-sch"></i>
                </button>
              </div>
            </div>

            <p className="ai-bottom-guide">중소기업 지원정보 중심으로 안내되며, 일반 상식이나 개인 질문에는 답변이 제한될 수 있습니다.</p>
          </div>
        </div>

      </div>
    </>
  );
};

export default AiChat;
