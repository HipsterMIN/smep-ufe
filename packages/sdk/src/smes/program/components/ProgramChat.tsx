/**
 * ProgramChat Headless Components
 *
 * 스트리밍, sources 처리 등 복잡한 로직은 SDK가 담당하고,
 * 스타일링만 사용자가 커스터마이징할 수 있는 Headless 컴포넌트
 *
 * @example
 * ```tsx
 * <ProgramChat.Root>
 *   <ProgramChat.Messages
 *     renderMessage={(msg) => <MyBubble>{msg.content}</MyBubble>}
 *     renderStreaming={(content, programs) => <MyStreamingBubble content={content} />}
 *     renderPrograms={(programs) => <MyProgramList programs={programs} />}
 *   />
 *   <ProgramChat.Input
 *     renderInput={(props) => <input {...props} className="my-input" />}
 *     renderSend={(props) => <button {...props}>전송</button>}
 *   />
 * </ProgramChat.Root>
 * ```
 */

import {
  type ReactNode,
  type InputHTMLAttributes,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  useState,
  useCallback,
  forwardRef,
} from "react";
import {
  ProgramChatProvider,
  useProgramChat,
  type ProgramChatContextValue,
} from "../hooks/useProgramChat";
import type { ProgramChatMessage, SupportProgram } from "../types";

// ============================================
// Root Component
// ============================================

export interface ProgramChatRootProps {
  children: ReactNode;
  /** 최대 응답 길이 */
  maxResponseLength?: number;
  /** 인용 포함 여부 */
  includeCitations?: boolean;
}

/**
 * ProgramChat.Root - Provider wrapper
 */
export function ProgramChatRoot({
                                  children,
                                  maxResponseLength = 150,
                                  includeCitations = false,
                                }: ProgramChatRootProps) {
  return (
      <ProgramChatProvider
          maxResponseLength={maxResponseLength}
          includeCitations={includeCitations}
      >
        {children}
      </ProgramChatProvider>
  );
}

// ============================================
// Messages Component
// ============================================

export interface ProgramChatMessagesProps {
  /** 완료된 메시지 렌더링 */
  renderMessage: (message: ProgramChatMessage) => ReactNode;
  /** 스트리밍 중인 응답 렌더링 (content, 먼저 도착한 programs) */
  renderStreaming?: (content: string, programs: SupportProgram[]) => ReactNode;
  /** 프로그램 목록 렌더링 (메시지 하단) */
  renderPrograms?: (programs: SupportProgram[], messageId: string) => ReactNode;
  /** 타이핑 인디케이터 렌더링 */
  renderTyping?: () => ReactNode;
  /** 빈 상태 렌더링 */
  renderEmpty?: () => ReactNode;
  /** 루트 className */
  className?: string;
  /** 추가적인 하위 요소 (예: 스크롤용 div) */
  children?: ReactNode;
}

/**
 * ProgramChat.Messages - 메시지 목록 + 스트리밍 렌더링
 *
 * 스트리밍 로직을 내부에서 처리하고, render props로 스타일만 위임
 */
export const ProgramChatMessages = forwardRef<HTMLDivElement, ProgramChatMessagesProps>((
    {
      renderMessage,
      renderStreaming,
      renderPrograms,
      renderTyping,
      renderEmpty,
      className,
      children,
    },
    ref
) => {
  const { messages, isTyping, streamingContent, pendingPrograms } =
      useProgramChat();

  const hasStreamingContent = streamingContent && streamingContent.length > 0;
  const isEmpty = messages.length === 0 && !hasStreamingContent && !isTyping;

  return (
      <div className={className} ref={ref}>
        {/* 빈 상태 */}
        {isEmpty && renderEmpty?.()}

        {/* 완료된 메시지들 */}
        {messages.map((msg) => (
            <div key={msg.id}>
              {renderMessage(msg)}
              {/* 메시지에 포함된 프로그램 목록 */}
              {msg.programs &&
                  msg.programs.length > 0 &&
                  renderPrograms?.(msg.programs, msg.id)}
            </div>
        ))}

        {/* 스트리밍 중인 응답 */}
        {hasStreamingContent &&
            renderStreaming?.(streamingContent, pendingPrograms)}

        {/* 먼저 도착한 프로그램 (스트리밍 중) */}
        {hasStreamingContent &&
            pendingPrograms.length > 0 &&
            renderPrograms?.(pendingPrograms, "streaming")}

        {/* 타이핑 인디케이터 (스트리밍 시작 전) */}
        {isTyping && !hasStreamingContent && renderTyping?.()}

        {/* 추가 하위 요소 (e.g. scroll ref) */}
        {children}
      </div>
  );
});

// ============================================
// Input Component
// ============================================

export interface InputRenderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export interface SendButtonRenderProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  disabled: boolean;
  onClick: () => void;
}

export interface ProgramChatInputProps {
  /** Input 렌더링 */
  renderInput: (props: InputRenderProps) => ReactNode;
  /** 전송 버튼 렌더링 */
  renderSend: (props: SendButtonRenderProps) => ReactNode;
  /** placeholder */
  placeholder?: string;
  /** 루트 className */
  className?: string;
}

/**
 * ProgramChat.Input - 메시지 입력 + 전송
 *
 * Enter 키 전송, 로딩 중 비활성화 등 로직을 내부에서 처리
 */
export function ProgramChatInput({
                                   renderInput,
                                   renderSend,
                                   placeholder = "메시지를 입력하세요...",
                                   className,
                                 }: ProgramChatInputProps) {
  const { send, isTyping } = useProgramChat();
  const [inputValue, setInputValue] = useState("");

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isTyping) return;
    send(inputValue);
    setInputValue("");
  }, [inputValue, isTyping, send]);

  const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [handleSend]
  );

  const inputProps: InputRenderProps = {
    value: inputValue,
    onChange: (e) => setInputValue(e.target.value),
    onKeyDown: handleKeyDown,
    placeholder,
    disabled: isTyping,
  };

  const sendProps: SendButtonRenderProps = {
    onClick: handleSend,
    disabled: !inputValue.trim() || isTyping,
  };

  return (
      <div className={className}>
        {renderInput(inputProps)}
        {renderSend(sendProps)}
      </div>
  );
}

// ============================================
// Hook Export (for advanced usage)
// ============================================

export { useProgramChat, type ProgramChatContextValue };

// ============================================
// Compound Component Export
// ============================================

export const ProgramChat = {
  Root: ProgramChatRoot,
  Messages: ProgramChatMessages,
  Input: ProgramChatInput,
};
