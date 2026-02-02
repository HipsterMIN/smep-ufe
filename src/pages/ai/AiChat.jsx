import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useChatContext, useStreamingMessage } from '@cube-i-ax/sdk/react';
import {
  ProgramChatProvider,
  formatDate,
  calculateDaysRemaining,
  convertFiltersToQuery,
  DEFAULT_SEARCH_FILTERS,
  toFriendlyStatusMessage,
  transformMessagesToConversations,
  mapSourcesToPrograms,
  mapSourceToProgram,
  REGION_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  SUPPORT_FIELD_OPTIONS,
  SUPPORT_TYPE_OPTIONS,
  DEADLINE_TYPE_OPTIONS,
} from '@cube-i-ax/sdk/smes/program';
import { api as apiClient } from '../../lib/apiClient.js';
import Logo from '../../../styles/img/ai_chat_logo.svg';
import './ai.css';
import { usePopupReceiver } from '@/hooks/usePopupCommunication.js';
import { useChatSections } from '@/hooks/useChatSections.js';
import AIMarkdownRenderer from '../../components/ui/AIMarkdownRenderer';

import { AI_SETTINGS } from '../../App.jsx';

const AiChatContent = ({ profile, payload }) => {
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [selectedProgramIds, setSelectedProgramIds] = useState(() => new Set());
  const [initialQuery, setInitialQuery] = useState('');
  const [initialSummary, setInitialSummary] = useState('');
  const [input, setInput] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [expandedPanels, setExpandedPanels] = useState(new Set());
  const [notice, setNotice] = useState('');
  const [payloadReady, setPayloadReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    ...DEFAULT_SEARCH_FILTERS,
    includePast: false,
  });
  const [openSections, setOpenSections] = useState(new Set());
  const [contextPanels, setContextPanels] = useState([]);
  const [assistantOverrides, setAssistantOverrides] = useState(() => new Map());
  const initialFiltersRef = useRef(null);
  const contextPanelKeysRef = useRef(new Set());
  const lastStreamingRef = useRef('');

  const {
    messages = [],
    isLoading,
    status: chatStatus,
    streamingContent = '',
    pendingSources = [],
    contextDocuments,
    followupSuggestions = [],
    setDocumentContext,
    sendMessage,
    clearMessages,
  } = useChatContext();

  const applyPayload = (payloadData) => {
    setSelectedPrograms(payloadData.programs || []);
    setSelectedProgramIds(new Set());
    setInitialQuery(payloadData.query || '');
    setInitialSummary(payloadData.summary || '');
    if (payloadData.filters) {
      setFilters(payloadData.filters);
      initialFiltersRef.current = payloadData.filters;
    }
    setExpandedPanels(new Set());
    setContextPanels([]);
    setAssistantOverrides(new Map());
    lastStreamingRef.current = '';
    contextPanelKeysRef.current = new Set();
    if (messages.length === 0) {
      clearMessages?.();
    }
    setNotice('');
    setPayloadReady(true);
  };

  // 부모로부터 받은 payload가 있으면 적용
  useEffect(() => {
    if (payload) {
      applyPayload(payload);
    }
  }, [payload]);

  useEffect(() => {
    if (!payloadReady || !initialFiltersRef.current) return;
    if (JSON.stringify(filters) !== JSON.stringify(initialFiltersRef.current)) {
      setNotice('필터가 변경되었습니다. 다음 질문부터 새로운 조건으로 분석합니다.');
      const timer = setTimeout(() => setNotice(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [filters, payloadReady]);

  // 타임아웃 처리 (데이터 수신 실패 시)
  useEffect(() => {
    if (payload) return;
    const timer = setTimeout(() => {
      if (!payloadReady) {
        setNotice('공고 정보를 불러오지 못했습니다. 다시 시도해 주세요.');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [payload, payloadReady]);

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
  const conversations = useMemo(
    () => transformMessagesToConversations(messages),
    [messages]
  );
  const {
    isPending,
    pendingQuery,
    showStatus,
    showStreaming,
    showLoadingSpinner,
    displayContent,
    displaySources,
  } = useStreamingMessage({
    streamingContent,
    pendingSources,
    isLoading,
    status: chatStatus,
    messages,
    conversationIds: conversations.map((conv) => conv.id),
  });
  const lastConversation = useMemo(() => {
    const reversed = [...conversations].reverse();
    return reversed.find((conv) => conv.aiResponse) || reversed[0];
  }, [conversations]);
  const copySource = useMemo(() => {
    const override =
      lastConversation && assistantOverrides.get(lastConversation.id);
    return displayContent || override || lastConversation?.aiResponse || initialSummary || '';
  }, [displayContent, lastConversation, initialSummary, assistantOverrides]);
  const hasChatContent = useMemo(() => {
    return Boolean(initialSummary) || conversations.length > 0 || isPending;
  }, [initialSummary, conversations.length, isPending]);

  useEffect(() => {
    if (streamingContent) {
      lastStreamingRef.current = streamingContent;
    }
  }, [streamingContent]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant') return;
    if (lastMessage.content && lastMessage.content.trim()) return;
    const fallback = lastStreamingRef.current;
    if (!fallback) return;
    setAssistantOverrides((prev) => {
      const existing = prev.get(lastMessage.id);
      if (existing === fallback) return prev;
      const next = new Map(prev);
      next.set(lastMessage.id, fallback);
      return next;
    });
  }, [messages]);

  useEffect(() => {
    if (!payloadReady) return;
    if (programIds.length > 0) {
      setDocumentContext(programIds);
    }
  }, [payloadReady, programIds, setDocumentContext]);

  const handleToggle = (type) => {
    setFeedbackStatus((prev) => (prev === type ? null : type));
  };

  const togglePanel = (panelId) => {
    setExpandedPanels((prev) => {
      const next = new Set(prev);
      if (next.has(panelId)) {
        next.delete(panelId);
      } else {
        next.add(panelId);
      }
      return next;
    });
  };

  const handleToggleProgram = (programId) => {
    if (!programId) return;
    setSelectedProgramIds((prev) => {
      const next = new Set(prev);
      if (next.has(programId)) {
        next.delete(programId);
      } else {
        next.add(programId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = (programIdsList) => {
    if (!programIdsList || programIdsList.length === 0) return;
    setSelectedProgramIds((prev) => {
      const next = new Set(prev);
      const isAllSelected = programIdsList.every((id) => next.has(id));
      if (isAllSelected) {
        programIdsList.forEach((id) => next.delete(id));
      } else {
        programIdsList.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleAccordion = (section) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleToggleFilterValue = (key, value) => {
    setFilters((prev) => {
      if (key === 'includePast') {
        return { ...prev, [key]: value };
      }
      const current = prev[key] || [];
      const exists = current.includes(value);
      const nextValue = exists
        ? current.filter((item) => item !== value)
        : [...current, value];
      return {
        ...prev,
        [key]: nextValue,
      };
    });
  };

  const handleResetFilters = () => {
    setFilters({
      ...DEFAULT_SEARCH_FILTERS,
      includePast: false,
    });
  };

  const handleSendMessage = (message) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const shouldUseInitialContext = messages.length === 0 && programIds.length > 0;
    const selectedIds = Array.from(selectedProgramIds);
    const documentContext = selectedIds.length > 0
      ? selectedIds
      : (shouldUseInitialContext ? programIds : undefined);
    sendMessage(trimmed, { documentContext, filters: filtersQuery });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(input);
    }
  };
  const statusMessage = useMemo(() => {
    return toFriendlyStatusMessage(chatStatus?.message, 'AI가 답변을 준비 중입니다.');
  }, [chatStatus]);

  const normalizeProgramIds = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).filter(Boolean);
    }
    if (typeof value === 'string') {
      const tryParse = (raw) => {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      };
      const parsed = tryParse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean);
      }
      if (typeof parsed === 'string') {
        const parsedAgain = tryParse(parsed);
        if (Array.isArray(parsedAgain)) {
          return parsedAgain.map((item) => String(item)).filter(Boolean);
        }
      }
      if (value.includes(',')) {
        return value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
      return value ? [value] : [];
    }
    return [];
  };

  const normalizedContextDocuments = useMemo(
    () => normalizeProgramIds(contextDocuments),
    [contextDocuments]
  );

  const createProgramKey = (ids) => {
    const normalized = normalizeProgramIds(ids);
    if (normalized.length === 0) return '';
    return normalized.filter(Boolean).slice().sort().join('|');
  };

  useEffect(() => {
    if (!normalizedContextDocuments || normalizedContextDocuments.length === 0) return;
    if (pendingSources.length > 0) return;
    const contextKey = createProgramKey(normalizedContextDocuments);
    if (!contextKey) return;
    const initialKey = createProgramKey(programIds);
    if (contextKey === initialKey) return;
    if (contextPanelKeysRef.current.has(contextKey)) return;
    const hasConversationPanel = conversations.some((conv) => {
      if (!conv.programs || conv.programs.length === 0) return false;
      return createProgramKey(conv.programs.map((program) => program.id)) === contextKey;
    });
    if (hasConversationPanel) return;

    contextPanelKeysRef.current.add(contextKey);
    const panelId = `context-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const latestQuery =
      pendingQuery ||
      [...messages].reverse().find((msg) => msg.role === 'user')?.content ||
      '';
    setContextPanels((prev) => [
      ...prev,
      {
        id: panelId,
        title: 'AI 추천 공고',
        query: latestQuery,
        programs: [],
        programIds: normalizedContextDocuments,
      },
    ]);
    let active = true;
    Promise.all(
      normalizedContextDocuments.map((docId) =>
        apiClient
          .get(`/api/v1/pbanc/${docId}`)
          .then((res) => res?.data || res)
          .catch(() => null)
      )
    ).then((results) => {
      if (!active) return;
      const programs = results
        .map((item, idx) => item ? mapSourceToProgram(item, idx) : null)
        .filter((item) => item && item.id);
      if (programs.length === 0) return;
      setContextPanels((prev) =>
        prev.map((panel) =>
          panel.id === panelId ? { ...panel, programs } : panel
        )
      );
    });
    return () => {
      active = false;
    };
  }, [
    normalizedContextDocuments,
    conversations,
    messages,
    pendingQuery,
    programIds,
    pendingSources,
  ]);

  const chatSections = useChatSections({
    payloadReady,
    initialSummary,
    selectedPrograms,
    programIds,
    initialQuery,
    conversations,
    contextPanels,
    displaySources,
    isPending,
    pendingQuery,
    hasChatContent,
    createProgramKey,
    normalizeProgramIds,
  });

  const lastConversationId = useMemo(() => {
    if (conversations.length === 0) return null;
    return conversations[conversations.length - 1].id;
  }, [conversations]);

  const handleLogoClick = (event) => {
    if (!window.opener || window.opener.closed) return;
    event.preventDefault();
    try {
      window.opener.focus();
    } catch {
      // Ignore focus errors from cross-origin openers.
    }
    window.close();
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
    if (!copySource) return;
    try {
      await navigator.clipboard.writeText(copySource);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = copySource;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  // usePopupReceiver Hook 사용
  const [receivedPayload, setReceivedPayload] = useState(null);
  const { isReady } = usePopupReceiver((data) => {
    setReceivedPayload(data);
  });

  // 부모로부터 받은 payload가 있으면 적용
  useEffect(() => {
    if (receivedPayload) {
      applyPayload(receivedPayload);
    }
  }, [receivedPayload]);

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
          AI 상담 가이드
        </button>
        {/* sidebar */}
        <div className={`ai-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
          <div className="sidebar-logo">
            <Link to="/" className="sidebar-logo-link" onClick={handleLogoClick}>
              <img src={Logo} alt="logo" />
            </Link>
          </div>
          <div className="sidebar-filter hide-scrollbar">
            <div className="sidebar-filters-header">
              <h3>맞춤 필터</h3>
              <button type="button" className="krds-btn xsmall text" onClick={handleResetFilters}>
                <i className="svg-icon ico-refresh"></i>
                초기화
              </button>
            </div>
            <div className="sidebar-filters-wrap">
              <div className={`filter-section is-accordion ${openSections.has('regions') ? 'is-open' : ''}`}>
                <h4 onClick={() => toggleAccordion('regions')}>
                  지역 {filters.regions.length > 0 && <span className="count">{filters.regions.length}</span>}
                  <i className="svg-icon ico-angle"></i>
                </h4>
                <div className="filter-content">
                  <div className="filter-chips">
                    {REGION_OPTIONS.map((region) => (
                      <div className="krds-form-chip small" key={region}>
                        <input
                          type="checkbox"
                          className="checkbox"
                          id={`filter_region_${region}`}
                          checked={filters.regions.includes(region)}
                          onChange={() => handleToggleFilterValue('regions', region)}
                        />
                        <label className="krds-form-chip-outline" htmlFor={`filter_region_${region}`}>{region}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`filter-section is-accordion ${openSections.has('companySizes') ? 'is-open' : ''}`}>
                <h4 onClick={() => toggleAccordion('companySizes')}>
                  기업규모 {filters.companySizes.length > 0 && <span className="count">{filters.companySizes.length}</span>}
                  <i className="svg-icon ico-angle"></i>
                </h4>
                <div className="filter-content">
                  <div className="filter-chips">
                    {COMPANY_SIZE_OPTIONS.map((size) => (
                      <div className="krds-form-chip small" key={size}>
                        <input
                          type="checkbox"
                          className="checkbox"
                          id={`filter_size_${size}`}
                          checked={filters.companySizes.includes(size)}
                          onChange={() => handleToggleFilterValue('companySizes', size)}
                        />
                        <label className="krds-form-chip-outline" htmlFor={`filter_size_${size}`}>{size}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`filter-section is-accordion ${openSections.has('supportFields') ? 'is-open' : ''}`}>
                <h4 onClick={() => toggleAccordion('supportFields')}>
                  지원분야 {filters.supportFields.length > 0 && <span className="count">{filters.supportFields.length}</span>}
                  <i className="svg-icon ico-angle"></i>
                </h4>
                <div className="filter-content">
                  <div className="filter-chips">
                    {SUPPORT_FIELD_OPTIONS.map((field) => (
                      <div className="krds-form-chip small" key={field}>
                        <input
                          type="checkbox"
                          className="checkbox"
                          id={`filter_field_${field}`}
                          checked={filters.supportFields.includes(field)}
                          onChange={() => handleToggleFilterValue('supportFields', field)}
                        />
                        <label className="krds-form-chip-outline" htmlFor={`filter_field_${field}`}>{field}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`filter-section is-accordion ${openSections.has('deadlineTypes') ? 'is-open' : ''}`}>
                <h4 onClick={() => toggleAccordion('deadlineTypes')}>
                  마감유형 {filters.deadlineTypes.length > 0 && <span className="count">{filters.deadlineTypes.length}</span>}
                  <i className="svg-icon ico-angle"></i>
                </h4>
                <div className="filter-content">
                  <div className="filter-chips">
                    {DEADLINE_TYPE_OPTIONS.map((type) => (
                      <div className="krds-form-chip small" key={type}>
                        <input
                          type="checkbox"
                          className="checkbox"
                          id={`filter_deadline_${type}`}
                          checked={filters.deadlineTypes.includes(type)}
                          onChange={() => handleToggleFilterValue('deadlineTypes', type)}
                        />
                        <label className="krds-form-chip-outline" htmlFor={`filter_deadline_${type}`}>{type}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`filter-section is-accordion ${openSections.has('includePast') ? 'is-open' : ''}`}>
                <h4 onClick={() => toggleAccordion('includePast')}>
                  공고 상태
                  <i className="svg-icon ico-angle"></i>
                </h4>
                <div className="filter-content">
                  <div className="krds-form-toggle-switch medium">
                    <input
                      type="checkbox"
                      id="chk_include_past"
                      checked={filters.includePast}
                      onChange={(e) => handleToggleFilterValue('includePast', e.target.checked)}
                    />
                    <label htmlFor="chk_include_past">
                      <span className="switch-toggle"><i></i></span>
                      지난공고 포함
                      <span className="on-toggle-desc">(마감된 공고도 검색)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-guide">
              <h3>AI 상담 가이드</h3>
              <p className="guide-desc">
                지원사업 공고를 기준으로 요약과 맞춤형 답변을 제공합니다.
                질문을 구체적으로 적을수록 더 정확한 결과를 받을 수 있어요.
              </p>
              <ol className="guide-steps">
                <li>
                  <span className="step-title">질문 입력</span>
                  <span className="step-desc">업종, 지역, 기업 규모, 필요한 지원을 함께 적어 주세요.</span>
                </li>
                <li>
                  <span className="step-title">추천 공고 확인</span>
                  <span className="step-desc">오른쪽 목록에서 공고를 선택하고 상세 페이지를 새 탭에서 확인합니다.</span>
                </li>
                <li>
                  <span className="step-title">추가 질문</span>
                  <span className="step-desc">조건을 더 좁혀 공고 적합성을 재검토해 보세요.</span>
                </li>
              </ol>
              <div className="guide-note">
                공고 조건과 신청 자격은 기관 공고를 반드시 확인해 주세요.
              </div>
            </div>
          </div>
          {/*<button type="button" className="krds-btn primary medium" onClick={handleRefineSearch}>결과 내 재검색하기</button>*/}
        </div>

        {/* container */}
        <div className="ai-container">
          <div className="chat-section">
            <div className="chat-box">

              {/* 답변 영역 */}
              {chatSections.map((section) => {
                const panelPrograms = section.programs || [];
                const panelProgramIds = section.programIds && section.programIds.length > 0
                  ? section.programIds
                  : panelPrograms.map((program) => program.id).filter(Boolean);
                const selectedCount = panelProgramIds.filter((id) => selectedProgramIds.has(id)).length;
                const totalCount = panelPrograms.length > 0 ? panelPrograms.length : panelProgramIds.length;
                const isAllSelected = panelProgramIds.length > 0 && selectedCount === panelProgramIds.length;
                const isExpanded = expandedPanels.has(section.id);
                const visiblePrograms = isExpanded ? panelPrograms : panelPrograms.slice(0, 4);
                const showFollowups = followupSuggestions.length > 0 && !isPending && (
                  (section.type === 'conversation' && section.conversation?.id === lastConversationId) ||
                  (section.type === 'summary' && conversations.length === 0)
                );

                return (
                  <div key={section.id} className="answer-wrap ai-chat-section">
                    <div className="answer-box">
                      {section.type === 'summary' && (
                        <>
                          <div className="answer-title ai-summary-title">
                            <span className="ai-summary-badge">AI 요약</span>
                            <p>{payloadReady ? (initialQuery || 'AI 요약') : 'AI 요약'}</p>
                          </div>
                          <div className="answer-conts-inner">
                            <div className="answer-content">
                              {!payloadReady && !initialSummary ? (
                                <p className="content-desc">데이터를 불러오는 중입니다...</p>
                              ) : !initialSummary ? (
                                <p className="content-desc">{isLoading ? 'AI가 응답을 생성 중입니다...' : '응답을 기다리고 있습니다.'}</p>
                              ) : (
                                <AIMarkdownRenderer content={initialSummary} />
                              )}
                            </div>
                            {showFollowups && (
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
                                <i className={`svg-icon ico-smile ${feedbackStatus === 'smile' ? 'is-active' : ''}`}></i>
                              </button>
                              <button type="button" className="option-btn btn-sad" onClick={() => handleToggle('sad')}>
                                <i className={`svg-icon ico-sad ${feedbackStatus === 'sad' ? 'is-active' : ''}`}></i>
                              </button>
                              <button type="button" className="option-btn btn-copy" onClick={handleCopyMarkdown}>
                                <i className="svg-icon ico-copy"></i>
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {section.type === 'conversation' && (
                        <div className="answer-conts-inner">
                          <div className="ai-chat-thread">
                            <div className="ai-chat-message is-user">
                              <div className="ai-chat-bubble">
                                <p>{section.conversation?.query}</p>
                              </div>
                            </div>
                            <div className="ai-chat-message is-assistant">
                              <div className="ai-chat-bubble">
                                <AIMarkdownRenderer 
                                  content={
                                    section.conversation?.aiResponse ||
                                    assistantOverrides.get(section.conversation?.id) ||
                                    ''
                                  } 
                                />
                              </div>
                            </div>
                          </div>
                          {showFollowups && (
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
                        </div>
                      )}

                      {section.type === 'pending' && (
                        <div className="answer-conts-inner">
                          <div className="ai-chat-thread">
                            {pendingQuery && (
                              <div className="ai-chat-message is-user">
                                <div className="ai-chat-bubble">
                                  <p>{pendingQuery}</p>
                                </div>
                              </div>
                            )}
                            {showStatus && (
                              <div className="ai-chat-message is-status">
                                <div className="ai-chat-bubble ai-chat-status-bubble">
                                  <span className="ai-chat-status-label">AI 진행 상태</span>
                                  <span className="ai-chat-status-text">{statusMessage}</span>
                                  <span className="on-ai-status-dots" aria-hidden="true">
                                    <i></i><i></i><i></i>
                                  </span>
                                </div>
                              </div>
                            )}
                            {showStreaming && displayContent && (
                              <div className="ai-chat-message is-assistant is-streaming">
                                <div className="ai-chat-bubble">
                                  <AIMarkdownRenderer content={displayContent} />
                                </div>
                              </div>
                            )}
                            {showLoadingSpinner && !showStreaming && (
                              <div className="ai-chat-message is-assistant is-streaming">
                                <div className="ai-chat-bubble">
                                  <p>응답을 준비 중입니다...</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {section.type === 'context' && (
                        <div className="answer-conts-inner">
                          <div className="ai-chat-thread">
                            {section.query && (
                              <div className="ai-chat-message is-user">
                                <div className="ai-chat-bubble">
                                  <p>{section.query}</p>
                                </div>
                              </div>
                            )}
                            <div className="ai-chat-message is-assistant">
                              <div className="ai-chat-bubble">
                                <p>AI 추천 공고를 업데이트했습니다.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="announcement-cont">
                      <div className="ai-type">
                        <div className="on-ai-type-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginBottom: '16px', backgroundColor: '#052B57', padding: '10px 16px', borderRadius: '8px' }}>
                          <div className="krds-check-area" style={{ width: '100%' }}>
                            <div className="krds-form-check">
                              <input
                                type="checkbox"
                                className="checkbox"
                                id={`chk_all_${section.id}`}
                                checked={isAllSelected}
                                onChange={() => handleToggleSelectAll(panelProgramIds)}
                                disabled={panelProgramIds.length === 0}
                              />
                              <label className="krds-form-check-label" htmlFor={`chk_all_${section.id}`} style={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}>
                                {selectedCount > 0
                                  ? `${section.title} ${selectedCount}건 선택됨`
                                  : `${section.title} ${totalCount}건`}
                              </label>
                            </div>
                          </div>
                          {section.query && (
                            <span style={{ color: '#D6E4FF', fontSize: '12px' }}>
                              "{section.query}" 검색 결과
                            </span>
                          )}
                        </div>
                        <ul className={`krds-structured-list type-full ${isExpanded ? 'is-active' : ''}`}>
                          {visiblePrograms.length > 0 ? (
                            visiblePrograms.map((program) => {
                              const days = calculateDaysRemaining(program.endDate);
                              const ddayText = days !== null ? (days === 0 ? 'D-Day' : (days > 0 ? `D-${days}` : '마감')) : '상시';
                              return (
                                <li key={`${section.id}-${program.id}`} className="structured-item">
                                  <div className="in">
                                    <div className="card-top">
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="krds-check-area">
                                          <div className="krds-form-check">
                                            <input
                                              type="checkbox"
                                              className="checkbox"
                                              id={`chk_${section.id}_${program.id}`}
                                              checked={selectedProgramIds.has(program.id)}
                                              onChange={() => handleToggleProgram(program.id)}
                                            />
                                            <label className="krds-form-check-label" htmlFor={`chk_${section.id}_${program.id}`}>
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
                                            {formatDate(program.startDate)} ~ {formatDate(program.endDate) === '-' ? '상시접수' : formatDate(program.endDate)}
                                          </span>
                                        </p>
                                      </a>
                                    </div>
                                  </div>
                                </li>
                              );
                            })
                          ) : panelProgramIds.length > 0 ? (
                            <li className="structured-item">
                              <div className="in ac py-12">
                                <p className="text-neutral-600">추천 공고를 불러오는 중입니다...</p>
                              </div>
                            </li>
                          ) : (
                            <li className="structured-item">
                              <div className="in ac py-12">
                                <p className="text-neutral-600">추천 공고가 없습니다.</p>
                              </div>
                            </li>
                          )}
                        </ul>
                        {panelPrograms.length > 4 && (
                          <button
                            className="krds-btn white full medium"
                            onClick={() => togglePanel(section.id)}
                          >
                            {isExpanded ? '접기' : '더보기'}
                            <i className={`svg-icon ico-angle ${isExpanded ? 'up' : 'down'}`}></i>
                          </button>
                        )}
                        {panelPrograms.length === AI_SETTINGS.topK && !isExpanded && (
                          <p className="ai-bottom-guide" style={{ marginTop: '8px', color: '#666' }}>
                            최대 {AI_SETTINGS.topK}건의 결과만 표시됩니다. 더 정확한 결과를 원하시면 질문을 구체화해주세요.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

const AiChat = () => {
  // usePopupReceiver Hook을 사용하여 데이터 수신
  const [receivedPayload, setReceivedPayload] = useState(null);
  const { isReady } = usePopupReceiver((data) => {
    setReceivedPayload(data);
  });
  
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (isReady && receivedPayload?.profile) {
      setProfile(receivedPayload.profile);
    }
  }, [isReady, receivedPayload]);

  return (
    <ProgramChatProvider 
      profile={profile} 
      domain="support_program"
      topK={AI_SETTINGS.topK}
      rerankerTopK={AI_SETTINGS.rerankerTopK}
      groupByField={AI_SETTINGS.groupByField}
    >
      <AiChatContent profile={profile} payload={receivedPayload} />
    </ProgramChatProvider>
  );
};

export default AiChat;
