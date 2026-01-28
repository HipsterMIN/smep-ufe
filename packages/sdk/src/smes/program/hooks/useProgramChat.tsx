/**
 * 지원사업 채팅 Service Hook
 *
 * SDK의 Chat 기능을 래핑하여 Presentation Layer에
 * SupportProgram DTO만 노출합니다.
 *
 * @example
 * function ChatPage() {
 *   return (
 *     <ProgramChatProvider>
 *       <ChatContent />
 *     </ProgramChatProvider>
 *   );
 * }
 *
 * function ChatContent() {
 *   const { messages, send, isTyping } = useProgramChat();
 *   // messages[].programs는 SupportProgram[] 타입
 * }
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  ChatProvider as ChatRoot,
  useChatContext as useSDKChatContext,
  type Source,
} from "../../../react";
import { mapSourcesToPrograms } from "../mappers";
import {
  calculateDaysRemaining,
  formatAIResponse,
  REGION_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  SUPPORT_FIELD_OPTIONS,
  SUPPORT_TYPE_OPTIONS,
  DEADLINE_TYPE_OPTIONS,
} from '../constants';
import { convertFiltersToQuery, DEFAULT_SEARCH_FILTERS } from '../filters';
import type { SupportProgram, ProgramChatMessage, Citation, CompanyProfile } from "../types";
import type { DomainType } from "../../../core/types";

/** 지원사업 도메인 식별자 */
const BIZINFO_DOMAIN = "bizinfo";

// ============================================
// Types
// ============================================

export interface ProgramChatContextValue {
  /** 채팅 메시지 목록 (DTO) */
  messages: ProgramChatMessage[];
  /** 메시지 수 */
  messageCount: number;
  /** 타이핑 중 (응답 대기) */
  isTyping: boolean;
  /** 스트리밍 중인 콘텐츠 */
  streamingContent: string | null;
  /** 먼저 도착한 sources (스트리밍 UI용) */
  pendingPrograms: SupportProgram[];
  /** 추천 후속 질문 */
  followupSuggestions: string[];
  /** 에러 */
  error: Error | null;
  /** 컨텍스트 설정 */
  setDocumentContext: (documentIds: string[] | null) => void;
  /** 메시지 전송 */
  send: (message: string, options?: {
    metadata?: Record<string, unknown>;
    filters?: Record<string, unknown>;
    documentContext?: string[];
  }) => void;
  /** 대화 초기화 */
  clear: () => void;
  /** 응답 중단 */
  abort: () => void;
}

// ============================================
// Context
// ============================================

const ProgramChatContext = createContext<ProgramChatContextValue | null>(null);

// ============================================
// Inner Hook (SDK Context 사용)
// ============================================

/**
 * Source를 Citation으로 변환
 */
function mapSourceToCitation(source: Source): Citation {
  return {
    id: source.documentId || "",
    title: source.title || "",
    content: source.content || "",
    domain: source.domain || "unknown",
    score: source.score,
  };
}

function useProgramChatInternal(): ProgramChatContextValue {
  const sdk = useSDKChatContext();

  // SDK 메시지 → ProgramChatMessage DTO 변환
  // domain 기반으로 programs와 citations 분류
  const messages = useMemo<ProgramChatMessage[]>(() => {
    return sdk.messages.map((msg) => {
      let programs: SupportProgram[] | undefined;
      let citations: Citation[] | undefined;

      if (msg.role === "assistant" && msg.sources && msg.sources.length > 0) {
        // domain === 'bizinfo' → programs
        const bizinfoSources = msg.sources.filter(
          (s) => s.domain === BIZINFO_DOMAIN
        );
        if (bizinfoSources.length > 0) {
          programs = mapSourcesToPrograms(bizinfoSources, 4);
        }

        // domain !== 'bizinfo' → citations
        const otherSources = msg.sources.filter(
          (s) => s.domain !== BIZINFO_DOMAIN
        );
        if (otherSources.length > 0) {
          citations = otherSources.map(mapSourceToCitation);
        }
      }

      return {
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        programs: programs?.length ? programs : undefined,
        citations: citations?.length ? citations : undefined,
        timestamp: msg.timestamp,
      };
    });
  }, [sdk.messages]);

  // 먼저 도착한 sources → pendingPrograms 변환
  const pendingPrograms = useMemo<SupportProgram[]>(() => {
    if (!sdk.pendingSources || sdk.pendingSources.length === 0) {
      return [];
    }
    const bizinfoSources = sdk.pendingSources.filter(
      (s) => s.domain === BIZINFO_DOMAIN
    );
    return bizinfoSources.length > 0 ? mapSourcesToPrograms(bizinfoSources, 4) : [];
  }, [sdk.pendingSources]);

  return {
    messages,
    messageCount: sdk.messages.length,
    isTyping: sdk.isLoading,
    streamingContent: sdk.streamingContent || null,
    pendingPrograms,
    followupSuggestions: sdk.followupSuggestions,
    error: sdk.error,
    setDocumentContext: sdk.setDocumentContext,
    send: sdk.sendMessage,
    clear: sdk.clearMessages,
    abort: sdk.abort,
  };
}

// ============================================
// Provider Component
// ============================================

interface ProgramChatProviderProps {
  children: ReactNode;
  /** 최대 응답 길이 */
  maxResponseLength?: number;
  /** 인용 포함 여부 */
  includeCitations?: boolean;
  /** 기업 프로필 (맞춤 검색용) */
  profile?: CompanyProfile;
  /** 도메인 라우팅 */
  domain?: DomainType;
  /** 최대 토큰 */
  maxTokens?: number;
  /** 검색 결과 수 */
  topK?: number;
  /** 리랭커 결과 수 */
  rerankerTopK?: number;
  /** 그룹핑 필드 */
  groupByField?: string;
  /** 스트리밍 여부 */
  stream?: boolean;
}

/**
 * 지원사업 채팅 Provider
 *
 * SDK ChatRoot를 래핑하여 Presentation Layer에서
 * SDK를 직접 의존하지 않도록 합니다.
 */
export function ProgramChatProvider({
  children,
  maxResponseLength = 150,
  includeCitations = false,
  profile,
  domain = "support_program",
  maxTokens = 1024,
  topK = 50,
  rerankerTopK = 10,
  groupByField = "group_id",
  stream = true,
}: ProgramChatProviderProps) {
  return (
    <ChatRoot
      maxResponseLength={maxResponseLength}
      includeCitations={includeCitations}
      profile={profile as any}
      domain={domain}
      maxTokens={maxTokens}
      topK={topK}
      rerankerTopK={rerankerTopK}
      groupByField={groupByField}
      stream={stream}
    >
      <ProgramChatContextBridge>{children}</ProgramChatContextBridge>
    </ChatRoot>
  );
}

/**
 * SDK Context를 우리 Context로 브릿지
 */
function ProgramChatContextBridge({ children }: { children: ReactNode }) {
  const value = useProgramChatInternal();
  return (
    <ProgramChatContext.Provider value={value}>
      {children}
    </ProgramChatContext.Provider>
  );
}

// ============================================
// Consumer Hook
// ============================================

/**
 * 지원사업 채팅 Hook
 *
 * ProgramChatProvider 내부에서 사용해야 합니다.
 *
 * @returns 채팅 상태와 메서드 (SupportProgram DTO 기반)
 * @throws Provider 외부에서 사용 시 에러
 */
export function useProgramChat(): ProgramChatContextValue {
  const context = useContext(ProgramChatContext);

  if (!context) {
    throw new Error("useProgramChat must be used within ProgramChatProvider");
  }

  return context;
}
