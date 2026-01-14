import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, ChevronDown, Calendar, Building2, Rocket, Factory, Clock, Store } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import aiText from "../../assets/main/icon-aiText.png";
import aiIcon from "../../assets/main/icon-ai.png";
import "./FloatingChatbot.css";

// SDK Headless 컴포넌트 사용
import {
  ProgramChat,
  useProgramChat,
  calculateDaysRemaining,
  getApplicationStatus,
  SUGGESTED_QUESTIONS,
} from "@cube-i-ax/sdk/smes/program";

/**
 * Unescape markdown syntax that might be escaped by the backend
 */
function unescapeMarkdown(text) {
  if (!text) return "";
  return text
      .replace(/\\\*\\\*/g, '**')
      .replace(/\\\*/g, '*')
      .replace(/\\_/g, '_')
      .replace(/\\`/g, '`')
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']')
      .replace(/\\#/g, '#')
      .replace(/\\n/g, '\n');
}

const STATUS_STYLES = {
  "마감임박": { badge: "bg-red-600", label: "마감임박" },
  "접수중": { badge: "bg-emerald-600", label: "접수중" },
  "상시": { badge: "bg-blue-600", label: "상시" },
  "마감": { badge: "bg-slate-500", label: "마감" },
  "접수예정": { badge: "bg-amber-500", label: "접수예정" },
};

export function FloatingChatbot({ onSelectProgram }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { clear } = useProgramChat();
  const messagesAreaRef = useRef(null);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    if (messagesAreaRef.current) {
      const { scrollHeight, clientHeight } = messagesAreaRef.current;
      messagesAreaRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior
      });
    }
  }, []);

  if (!isOpen) {
    return (
        <div className="quickbox-ai group">
          <button
              type="button"
              className="ai-chatbot-open-btn"
              onClick={() => setIsOpen(true)}
          >
            <img src={aiIcon} alt="AI 컨설턴트" className="ai-chatbot-open-icon" />
          </button>
          <div className="ai-chatbot-tooltip">
            💡 AI 컨설턴트와 상담하기
            <div className="tooltip-arrow" />
          </div>
        </div>
    );
  }

  return (
      <div
          className={`ai-chatbot-container ${
              isMinimized ? "minimized" : "expanded"
          } z-50`}
      >
        {/* Header */}
        <div className="ai-chatbot-header">
          <div className="ai-header-left">
            <div className="ai-icon-box">
              <img src={aiIcon} alt="" className="ai-header-icon" />
            </div>
            <div className="ai-header-title">
              <h3>AI 지원사업 컨설턴트</h3>
              <p>신뢰할 수 있는 정부지원 안내</p>
            </div>
          </div>
          <div className="ai-header-actions">
            <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="ai-header-btn"
                title={isMinimized ? "펼치기" : "접기"}
            >
              <ChevronDown
                  className={`w-5 h-5 transition-transform ${isMinimized ? "rotate-180" : ""}`}
              />
            </button>
            <button
                onClick={() => {
                  clear();
                  setIsOpen(false);
                }}
                className="ai-header-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <ChatbotContent
            isMinimized={isMinimized}
            messagesAreaRef={messagesAreaRef}
            scrollToBottom={scrollToBottom}
            renderProgramCard={renderProgramCard}
        />
      </div>
  );

  function renderProgramCard(program) {
    const statusStyle = getStatusStyle(program);
    const daysRemaining = calculateDaysRemaining(program.endDate);

    return (
        <div key={program.id} className="ai-program-card">
          {program.aiRecommended && (
              <div className="ai-recommend-badge">
                <Sparkles className="w-3 h-3" />
                AI 추천
              </div>
          )}
          <button
              onClick={() => {
                if (onSelectProgram) onSelectProgram(program);
                setIsMinimized(true);
              }}
              className="ai-card-btn group"
          >
            <div className="ai-card-content">
              <div className="ai-card-badges">
                <span className="ai-badge field">
                  {program.supportField}
                </span>
                <span className={`ai-badge status ${statusStyle.badge}`}>
                  {statusStyle.label}
                </span>
              </div>
              <h4 className="ai-card-title group-hover:text-blue-600">
                {program.title}
              </h4>
              <div className="ai-card-agency">
                <Building2 className="w-3.5 h-3.5" />
                <span>{program.agency}</span>
              </div>
              <div className="ai-card-footer">
                <div className="ai-card-tags">
                  {program.companySizes?.slice(0, 2).map((size, index) => (
                      <span key={index} className="ai-tag check">
                        ✓ {size}
                      </span>
                  ))}
                  {program.companySizes?.length > 2 && (
                      <span className="ai-tag more">
                        +{program.companySizes.length - 2}
                      </span>
                  )}
                </div>
                <div className="ai-card-period">
                  <div className="ai-period-text">
                    <Calendar className="w-4 h-4" />
                    <span>{program.applyPeriod}</span>
                  </div>
                  {daysRemaining !== null &&
                      daysRemaining >= 0 &&
                      daysRemaining <= 14 && (
                          <span className="ai-dday">
                            D-{daysRemaining}
                          </span>
                      )}
                </div>
              </div>
            </div>
          </button>
          {program.aiRecommended && program.matchReason && (
              <div className="ai-match-reason">
                <p>
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-600" />
                  <span>{program.matchReason}</span>
                </p>
              </div>
          )}
        </div>
    );
  }

  function getStatusStyle(program) {
    const status = getApplicationStatus(
        program.startDate,
        program.endDate,
        program.deadlineType
    );
    return STATUS_STYLES[status] || STATUS_STYLES["상시"];
  }
}

/**
 * Chatbot content component to use chat context
 */
function ChatbotContent({
                          isMinimized,
                          messagesAreaRef,
                          scrollToBottom,
                          renderProgramCard,
                        }) {
  const { messages, streamingContent } = useProgramChat();

  return (
      <div className={`ai-chatbot-body ${isMinimized ? "hidden" : ""}`}>
        {/* Messages */}
        <ProgramChat.Messages
            className="ai-messages-area bg-neutral-50"
            ref={messagesAreaRef}
            renderEmpty={() => <QuickQuestions />}
            renderMessage={(msg) => (
                <MessageBubble 
                    content={msg.content} 
                    isUser={msg.role === "user"} 
                    onScroll={() => scrollToBottom("smooth")}
                />
            )}
            renderStreaming={(content, programs) => (
                <MessageBubble 
                    content={content} 
                    isUser={false} 
                    isStreaming 
                    onScroll={() => scrollToBottom("auto")}
                />
            )}
            renderPrograms={(programs, messageId) => (
                <div className="ai-programs-list" key={`programs-${messageId}`}>
                  {programs.map(renderProgramCard)}
                </div>
            )}
            renderTyping={() => (
                <div className="ai-message-row bot">
                  <div className="ai-typing-indicator">
                    <div className="ai-typing-dot" />
                    <div className="ai-typing-dot" />
                    <div className="ai-typing-dot" />
                  </div>
                </div>
            )}
        />

        {/* Input */}
        <div className="ai-input-area">
          <ProgramChat.Input
              className="ai-input-wrapper"
              placeholder="지원사업에 대해 물어보세요..."
              renderInput={(props) => (
                  <input {...props} className="ai-input-field" />
              )}
              renderSend={(props) => (
                  <button {...props} className="ai-send-btn">
                    <Send className="w-4 h-4" />
                  </button>
              )}
          />
          <p className="ai-disclaimer">
            AI가 생성한 답변은 참고용입니다. 반드시 공식 공고를 확인하세요.
          </p>
        </div>
      </div>
  );
}

function MessageBubble({ content, isUser, isStreaming, onScroll }) {
  useEffect(() => {
    onScroll?.();
  }, [content, onScroll]);

  return (
      <div className={`ai-message-row ${isUser ? "user" : "bot"}`}>
        <div className={`ai-message-bubble ${isUser ? "user" : "bot"}`}>
          {isUser ? (
              <p>{content}</p>
          ) : (
              <div className="markdown-content">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p>{children}</p>,
                      ul: ({ children }) => <ul>{children}</ul>,
                      ol: ({ children }) => <ol>{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => <strong>{children}</strong>,
                      h1: ({ children }) => <h1>{children}</h1>,
                      h2: ({ children }) => <h2>{children}</h2>,
                      h3: ({ children }) => <h3>{children}</h3>,
                      a: ({ children, href }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                      ),
                      code: ({ children }) => <code>{children}</code>,
                      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                    }}
                >
                  {unescapeMarkdown(content)}
                </ReactMarkdown>
                {isStreaming && (
                    <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1" />
                )}
              </div>
          )}
        </div>
      </div>
  );
}

function QuickQuestions() {
  const { send, isTyping } = useProgramChat();

  const handleSelect = (question) => {
    if (!isTyping) {
      send(question);
    }
  };

  return (
      <div className="ai-quick-questions">
        <div className="ai-welcome-box">
          <p className="ai-welcome-text">
            안녕하세요! 정부지원사업 검색을 도와드리는 AI 컨설턴트입니다. 어떤 지원사업을 찾고 계신가요?
          </p>
        </div>

        <div className="ai-quick-container">
          <div className="ai-quick-header">
            <div className="ai-quick-dot"></div>
            <p className="ai-quick-title">추천 질문을 선택하거나 직접 입력해보세요</p>
          </div>
          <div className="ai-quick-btn-group">
            <button
                onClick={() => handleSelect(SUGGESTED_QUESTIONS[0])}
                className="ai-quick-btn primary"
            >
              <Rocket className="w-3.5 h-3.5" />
              창업 지원사업
            </button>
            <button
                onClick={() => handleSelect(SUGGESTED_QUESTIONS[1])}
                className="ai-quick-btn outline"
            >
              <Factory className="w-3.5 h-3.5" />
              제조업 지원
            </button>
            <button
                onClick={() => handleSelect(SUGGESTED_QUESTIONS[2])}
                className="ai-quick-btn urgent"
            >
              <Clock className="w-3.5 h-3.5" />
              마감 임박
            </button>
            <button
                onClick={() => handleSelect(SUGGESTED_QUESTIONS[3])}
                className="ai-quick-btn neutral"
            >
              <Store className="w-3.5 h-3.5" />
              소상공인 지원
            </button>
            <button
                onClick={() => handleSelect(SUGGESTED_QUESTIONS[4])}
                className="ai-quick-btn indigo"
            >
              <Sparkles className="w-3.5 h-3.5" />
              기술개발·R&D
            </button>
          </div>

          <div className="ai-welcome-box secondary">
            <p className="ai-welcome-text">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>궁금하신 내용을 자유롭게 질문해주세요. AI가 맞춤형 지원사업을 찾아드립니다.</span>
            </p>
          </div>
        </div>
      </div>
  );
}
