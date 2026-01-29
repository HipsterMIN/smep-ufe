import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatContext, useStreamingMessage } from '@cube-i-ax/sdk/react';
import {
  formatDate,
  calculateDaysRemaining,
  formatAIResponse,
  convertFiltersToQuery,
  DEFAULT_SEARCH_FILTERS,
  toFriendlyStatusMessage,
  transformMessagesToConversations,
  mapSourcesToPrograms,
} from '@cube-i-ax/sdk/smes/program';
import { api as apiClient } from '../lib/apiClient.js';
import Logo from '../../styles/img/ai_chat_logo.svg';

const AiChat = () => {
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
  const [filters, setFilters] = useState(DEFAULT_SEARCH_FILTERS);
  const [contextPanels, setContextPanels] = useState([]);
  const [assistantOverrides, setAssistantOverrides] = useState(() => new Map());
  const contextPanelKeysRef = useRef(new Set());
  const lastStreamingRef = useRef('');

  const location = useLocation();
  const encodedPayload = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('payload');
  }, [location.search]);
  const payloadId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('payloadId');
  }, [location.search]);

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

  const applyPayload = (payload) => {
    setSelectedPrograms(payload.programs || []);
    setSelectedProgramIds(new Set());
    setInitialQuery(payload.query || '');
    setInitialSummary(payload.summary || '');
    if (payload.filters) {
      setFilters(payload.filters);
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

  useEffect(() => {
    setPayloadReady(false);
    setSelectedPrograms([]);
    setSelectedProgramIds(new Set());
    setInitialQuery('');
    setInitialSummary('');
    setExpandedPanels(new Set());
    setContextPanels([]);
    setAssistantOverrides(new Map());
    lastStreamingRef.current = '';
    contextPanelKeysRef.current = new Set();
    setDocumentContext(null);
    clearMessages?.();
    setNotice('');

    if (encodedPayload) {
      try {
        const decoded = decodeURIComponent(encodedPayload);
        const json = decodeURIComponent(escape(atob(decoded)));
        const parsed = JSON.parse(json);
        applyPayload(parsed);
        return;
      } catch (e) {
        console.error('Failed to decode payload', e);
        setNotice('공고 정보를 불러오지 못했습니다. 다시 시도해 주세요.');
        return;
      }
    }

    if (payloadId) {
      try {
        const raw = sessionStorage.getItem(`ai-chat-payload:${payloadId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          sessionStorage.removeItem(`ai-chat-payload:${payloadId}`);
          applyPayload(parsed);
          return;
        }
      } catch (e) {
        console.warn('Failed to read ai-chat payload from sessionStorage', e);
      }
    }
  }, [encodedPayload, payloadId]);

  useEffect(() => {
    if (encodedPayload || payloadReady) return;
    const origin = window.location.origin;
    const parsePayload = (raw) => {
      if (!raw) return null;
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      if (typeof raw === 'object') return raw;
      return null;
    };
    const handleMessage = (event) => {
      if (event.origin !== origin) return;
      if (event.data?.type !== 'ai-chat-payload') return;
      const payload = parsePayload(event.data.payload);
      if (!payload) return;
      applyPayload(payload);
      if (event.data?.payloadId) {
        event.source?.postMessage(
          { type: 'ai-chat-payload-ack', payloadId: event.data.payloadId },
          event.origin
        );
      }
    };
    window.addEventListener('message', handleMessage);
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'ai-chat-request-payload' }, origin);
    }
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [encodedPayload, payloadReady]);

  useEffect(() => {
    if (encodedPayload || payloadReady) return;
    const timer = setTimeout(() => {
      if (!payloadReady) {
        setNotice('공고 정보를 불러오지 못했습니다. 다시 시도해 주세요.');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [encodedPayload, payloadReady]);

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

  const normalizeProgramDetail = (item) => {
    if (!item) return null;
    return {
      id: item.id || item.pbancid || item.pbancId || item.pbanc_id || '',
      title: item.pbancnm || item.pbancNm || item.title || '',
      agency: item.mngdeptnm || item.mngDeptNm || item.flfmtinst || item.agency || '',
      supportField: item.sprtfld || item.supportField || '',
      startDate: item.aplybgngday || item.applyStartDate || item.startDate || null,
      endDate: item.aplyddlnday || item.applyEndDate || item.endDate || null,
    };
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
        .map(normalizeProgramDetail)
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

  const chatSections = useMemo(() => {
    const sections = [];
    const shouldShowSummary =
      payloadReady ||
      initialSummary ||
      selectedPrograms.length > 0 ||
      (!payloadReady && !hasChatContent);

    if (shouldShowSummary) {
      sections.push({
        id: 'summary-section',
        type: 'summary',
        title: '지원공고',
        query: initialQuery,
        summary: initialSummary,
        programs: selectedPrograms,
        programIds: programIds,
      });
    }

    const contextQueue = [...contextPanels];

    // 1. Pending 섹션 미리 준비 (중복 체크용)
    let pendingSection = null;
    if (isPending) {
      const pendingPrograms = mapSourcesToPrograms(displaySources);
      const pendingProgramIds = pendingPrograms.map((p) => p.id).filter(Boolean);
      const fallbackProgramIds = displaySources.map((s) => s.documentId).filter(Boolean);
      const resolvedProgramIds = pendingProgramIds.length > 0 ? pendingProgramIds : fallbackProgramIds;
      const pendingKey = createProgramKey(resolvedProgramIds) || 'pending';
      pendingSection = {
        id: `pending-${pendingKey}`,
        type: 'pending',
        title: 'AI 추천 공고',
        query: pendingQuery || '검색',
        programs: pendingPrograms,
        programIds: resolvedProgramIds,
      };
    }

    // 2. conversations 처리
    conversations.forEach((conv) => {
      let programs = conv.programs || [];
      let panelIds = programs.map((program) => program.id).filter(Boolean);

      // contextQueue에서 매칭되는 패널 소모 (강화된 매칭)
      if (contextQueue.length > 0) {
        const convKey = createProgramKey(panelIds);
        const matchedIndex = contextQueue.findIndex((panel) => {
          // 쿼리가 정확히 일치하거나
          if (panel.query === conv.query) return true;
          // 공고 목록이 일치하는 경우 (둘 다 공고 정보가 있을 때만)
          const panelKey = createProgramKey(panel.programIds);
          return convKey && panelKey && convKey === panelKey;
        });

        if (matchedIndex !== -1) {
          const matchedPanel = contextQueue.splice(matchedIndex, 1)[0];
          // conversation에 프로그램 정보가 없으면 패널 정보를 가져옴
          if (programs.length === 0) {
            programs = matchedPanel.programs || [];
            panelIds = programs.map((p) => p.id).filter(Boolean);
            if (panelIds.length === 0) {
              panelIds = normalizeProgramIds(matchedPanel.programIds);
            }
          }
        }
      }

      sections.push({
        id: `conversation-${conv.id}`,
        type: 'conversation',
        title: 'AI 추천 공고',
        query: conv.query,
        conversation: conv,
        programs,
        programIds: panelIds,
      });
    });

    // 3. 남은 contextQueue 처리
    contextQueue.forEach((panel) => {
      const panelIds = normalizeProgramIds(panel.programIds);
      if (panelIds.length === 0 && (!panel.programs || panel.programs.length === 0)) {
        return;
      }

      const currentKey = createProgramKey(panelIds);

      // 직전 섹션(conversation)과 공고 목록이 중복되는지 체크
      if (sections.length > 0) {
        const lastSection = sections[sections.length - 1];
        const lastKey = createProgramKey(lastSection.programIds);
        if (currentKey && lastKey === currentKey) return;
      }

      // Pending 섹션과 공고 목록이 중복되는지 체크 (이미 나올 예정인 경우 생략)
      if (pendingSection) {
        const pendingKey = createProgramKey(pendingSection.programIds);
        if (currentKey && pendingKey === currentKey) return;
      }

      sections.push({
        id: panel.id,
        type: 'context',
        title: 'AI 추천 공고',
        query: panel.query,
        panel,
        programs: panel.programs || [],
        programIds: panelIds,
      });
    });

    // 4. Pending 섹션 추가
    if (pendingSection) {
      sections.push(pendingSection);
    }

    return sections;
  }, [
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
  ]);

  const lastConversationId = useMemo(() => {
    if (conversations.length === 0) return null;
    return conversations[conversations.length - 1].id;
  }, [conversations]);

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
            <Link to="#" className="sidebar-logo-link">
              <img src={Logo} alt="logo" />
            </Link>
          </div>
          <div className="sidebar-filter hide-scrollbar">
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
                                <div className="ai-chat-markdown">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {formatAIResponse(initialSummary, { stripTags: true })}
                                  </ReactMarkdown>
                                </div>
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
                                <div className="ai-chat-markdown">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {formatAIResponse(
                                      section.conversation?.aiResponse ||
                                        assistantOverrides.get(section.conversation?.id) ||
                                        '',
                                      { stripTags: true }
                                    )}
                                  </ReactMarkdown>
                                </div>
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
                                  <div className="ai-chat-markdown">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {formatAIResponse(displayContent, { stripTags: true })}
                                    </ReactMarkdown>
                                  </div>
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

export default AiChat;
