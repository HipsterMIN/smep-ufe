/**
 * 지원사업 검색 Service Hook
 *
 * 2차 데이터레이크 스키마 기반 검색 필터링
 * @see labs/analysis/smes/02_implementation.xlsx - 3_UI_필터
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  SearchProvider as SearchRoot,
  useSearchContext as useSDKSearchContext,
  type Source,
} from "../../../react";
import {
  mapSourceToProgram,
  buildBackendProfile,
} from "../index";
import type {
  SupportProgram,
  Region,
  CompanySize,
  SupportField,
  SupportType,
  DeadlineType,
  CompanyProfile,
} from "../types";
import type { DomainType, SearchRequest } from "../../../core/types";
import type { StatusEvent } from "../../../react/hooks/useCubeIAxChat";

// ============================================
// Types
// ============================================

/**
 * 검색 필터 (3_UI_필터 시트)
 *
 * Milvus 필터 (7개):
 * - regions, companySizes, supportFields, supportTypes, deadlineTypes
 * - deadlineSoon, includeExpired (날짜 필터)
 */
export interface SearchFilters {
  // ─────────────────────────────────────────
  // Milvus 필터 (서버 측)
  // ─────────────────────────────────────────

  /** 지역 (17개 시도 + 전국) */
  regions?: Region[];

  /** 기업규모 (5개) */
  companySizes?: CompanySize[];

  /** 지원분야 (9개) */
  supportFields?: SupportField[];

  /** 지원유형 (15개) */
  supportTypes?: SupportType[];

  /** 마감유형 (5개) */
  deadlineTypes?: DeadlineType[];

  // ─────────────────────────────────────────
  // 날짜 필터 (서버 측)
  // ─────────────────────────────────────────

  /** 마감임박만 (D-7 이내) */
  deadlineSoon?: boolean;

  /** 지난 공고 포함 (기본 OFF = 마감 안 된 것만) */
  includePast?: boolean;

  /** 마감공고 포함 (호환용) */
  includeExpired?: boolean;

  /** 지역 필터 정확히 매칭 ($exact) */
  exactRegions?: boolean;
}

/**
 * UI 상태 관리용 필터 (모든 필드 Required)
 *
 * FilterPanel 등 UI 컴포넌트에서 사용
 */
export interface FilterState {
  /** 지역 */
  regions: Region[];
  /** 기업규모 */
  companySizes: CompanySize[];
  /** 지원분야 */
  supportFields: SupportField[];
  /** 지원유형 */
  supportTypes: SupportType[];
  /** 마감유형 */
  deadlineTypes: DeadlineType[];
  /** 마감임박만 */
  deadlineSoon: boolean;
  /** 마감공고 포함 */
  includeExpired: boolean;
}

/**
 * 필터 초기 상태
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  regions: [],
  companySizes: [],
  supportFields: [],
  supportTypes: [],
  deadlineTypes: [],
  deadlineSoon: false,
  includeExpired: false,
};

export interface ProgramSearchContextValue {
  /** 검색된 지원사업 목록 (DTO) */
  programs: SupportProgram[];
  /** 전체 결과 수 */
  total: number;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: Error | null;
  /** AI 요약 (파싱된, 최종) */
  summary: string | null;
  /** 스트리밍 중인 AI 요약 (실시간) */
  streamingSummary: string;
  /** 요약 로딩 중 */
  isSummaryLoading: boolean;
  /** 상태 메시지 */
  status: StatusEvent | null;
  /** 마지막 실행 쿼리 */
  lastQuery: string | null;
  /** 검색 실행 */
  search: (query: string, filters?: SearchFilters, options?: Partial<SearchRequest>) => void;
  /** 검색 중단 */
  abort: () => void;
}

// ============================================
// Context
// ============================================

const ProgramSearchContext = createContext<ProgramSearchContextValue | null>(null);

// ============================================
// Helper Functions
// ============================================

/**
 * AI 요약 콘텐츠 파싱
 *
 * 스트리밍/완료 모두 지원:
 * - 시작 코드펜스 (```json) 제거
 * - 종료 코드펜스 (```) 제거
 * - JSON에서 intent 추출
 */
function parseAISummary(content: string | undefined): string | null {
  if (!content) return null;

  let displayContent = content.trim();

  // 시작 코드펜스 제거 (스트리밍 중에도 동작)
  displayContent = displayContent.replace(/^```(?:json)?\s*\n?/, '');

  // 종료 코드펜스 제거 (완료 시)
  displayContent = displayContent.replace(/\n?```\s*$/, '');

  displayContent = displayContent.trim();

  // JSON인 경우 파싱 시도 (완료된 JSON만)
  if (displayContent.startsWith("{") && displayContent.endsWith("}")) {
    try {
      const parsed = JSON.parse(displayContent);
      if (parsed.query_analysis?.intent) {
        return parsed.query_analysis.intent;
      }
    } catch {
      // JSON 파싱 실패 시 원본 반환
    }
  }

  // JSON 시작이지만 미완성인 경우 숨김 (스트리밍 중)
  if (displayContent.startsWith("{") && !displayContent.endsWith("}")) {
    return null;
  }

  return displayContent || null;
}

/**
 * 오늘 날짜를 Unix timestamp (초 단위)로 반환
 * Milvus _ts 필드는 Unix timestamp로 저장됨
 */
function getTodayAsTimestamp(): number {
  const now = new Date();
  // 오늘 자정 기준 Unix timestamp (초)
  now.setHours(0, 0, 0, 0);
  return Math.floor(now.getTime() / 1000);
}

/**
 * 일수를 초로 변환
 */
function daysToSeconds(days: number): number {
  return days * 24 * 60 * 60;
}

/**
 * UI 필터를 Milvus 백엔드 필터로 변환
 */
function buildBackendFilters(filters?: SearchFilters): Record<string, unknown> | undefined {
  if (!filters) return undefined;

  const backendFilters: Record<string, unknown> = {};
  const includePast = filters.includePast ?? filters.includeExpired ?? false;
  const exactRegions = filters.exactRegions !== false;

  // 지역 → regions ($contains_any, 전국 자동포함)
  if (filters.regions && filters.regions.length > 0) {
    backendFilters.regions = {
      [exactRegions ? "$exact" : "$contains_any"]: filters.regions,
    };
  }

    // 기업규모 → company_sizes ($contains_any, 중소기업 확장)
    if (filters.companySizes && filters.companySizes.length > 0) {
      // 중소기업 선택 시 소기업도 포함 (실제 데이터에는 중기업 없음)
      const expanded = new Set<CompanySize>(filters.companySizes);
      if (expanded.has("중소기업" as CompanySize)) {
        expanded.add("소기업" as CompanySize);
      }
      backendFilters.company_sizes = { $contains_any: Array.from(expanded) };
    }

  // 지원분야 → support_field
  if (filters.supportFields && filters.supportFields.length > 0) {
    backendFilters.support_field = { $in: filters.supportFields };
  }

  // 지원유형 → support_types ($contains_any)
  if (filters.supportTypes && filters.supportTypes.length > 0) {
    backendFilters.support_types = { $contains_any: filters.supportTypes };
  }

  // 마감유형 → deadline_type
  if (filters.deadlineTypes && filters.deadlineTypes.length > 0) {
    backendFilters.deadline_type = { $in: filters.deadlineTypes };
  }

  // ─────────────────────────────────────────
  // 날짜 필터 (apply_end_date_ts: Unix timestamp)
  // Milvus _ts 필드는 Unix timestamp (초 단위)로 저장됨
  // ─────────────────────────────────────────
  const todayTs = getTodayAsTimestamp();

  if (filters.deadlineSoon) {
    // 마감임박: 오늘 ~ 7일 이내
    const weekLaterTs = todayTs + daysToSeconds(7);
    backendFilters.apply_end_date = { $gte: todayTs, $lte: weekLaterTs };
  } else if (!includePast) {
    // 기본: 마감 안 된 것만 (apply_end_date_ts >= 오늘 OR 상시=FAR_FUTURE)
    // 상시/미정은 FAR_FUTURE (4102444800 = 2100-01-01)로 저장됨
    backendFilters.apply_end_date = { $gte: todayTs };
  }
  // includePast=true인 경우: 날짜 필터 없음 (전체)

  return Object.keys(backendFilters).length > 0 ? backendFilters : undefined;
}

/**
 * 클라이언트 측 필터링
 *
 * 모든 필터는 백엔드(Milvus)에서 처리
 * 향후 클라이언트 전용 필터가 필요한 경우 여기에 추가
 */
function applyClientFilters(
  programs: SupportProgram[],
  _filters?: SearchFilters
): SupportProgram[] {
  return programs;
}

// ============================================
// Inner Hook (SDK Context 사용)
// ============================================

function useProgramSearchInternal(): ProgramSearchContextValue {
  const sdk = useSDKSearchContext();

  // 현재 필터 저장 (클라이언트 필터링용)
  const currentFiltersRef = useMemo(() => ({ current: undefined as SearchFilters | undefined }), []);

  // SDK Source → SupportProgram DTO 변환 + 클라이언트 필터링
  const programs = useMemo(() => {
    if (sdk.results.length === 0) return [];
    const mapped = sdk.results.map((result, i) =>
      mapSourceToProgram(result as Source, i)
    );
    // DEBUG
    // console.log('[useProgramSearch] sdk.results:', sdk.results);
    // console.log('[useProgramSearch] mapped programs:', mapped);
    return applyClientFilters(mapped, currentFiltersRef.current);
  }, [sdk.results, currentFiltersRef]);

  // AI 요약 파싱 (최종)
  const summary = useMemo(() => {
    if (sdk.isLoading) return null;
    return parseAISummary(sdk.content);
  }, [sdk.content, sdk.isLoading]);

  // 스트리밍 요약 (실시간)
  const streamingSummary = useMemo(() => {
    return parseAISummary(sdk.streamingContent) || '';
  }, [sdk.streamingContent]);

  return {
    programs,
    total: sdk.total,
    isLoading: sdk.isLoading,
    error: sdk.error,
    summary,
    streamingSummary,
    isSummaryLoading: sdk.isLoading && sdk.results.length > 0,
    status: sdk.status,
    lastQuery: sdk.lastQuery,
    search: (query: string, filters?: SearchFilters, options?: Partial<SearchRequest>) => {
      currentFiltersRef.current = filters;
      const backendFilters = buildBackendFilters(filters);
      // 빈 쿼리로 필터만 적용 시 기본 검색어 사용
      const effectiveQuery = query.trim() || "지원사업";
      sdk.search(effectiveQuery, { ...options, filters: backendFilters });
    },
    restore: sdk.restore,
    abort: sdk.abort,
  };
}

// ============================================
// Provider Component
// ============================================

export interface ProgramSearchProviderProps {
  children: ReactNode;
  /** 스트리밍 활성화 */
  stream?: boolean;
  /** 검색 결과 수 */
  topK?: number;
  /** 리랭커 결과 수 */
  rerankerTopK?: number;
  /** 기업 프로필 (맞춤 검색용) */
  profile?: CompanyProfile;
  /** 도메인 라우팅 */
  domain?: DomainType;
  /** 그룹핑 필드 */
  groupByField?: string | null;
}

/**
 * 지원사업 검색 Provider
 */
export function ProgramSearchProvider({
  children,
  stream = true,
  topK = 20,
  rerankerTopK = 10,
  profile,
  domain = "support_program",
  groupByField = "group_id",
}: ProgramSearchProviderProps) {
  // CompanyProfile → 백엔드 프로필 형식으로 변환 (snake_case)
  const backendProfile = useMemo(() => buildBackendProfile(profile), [profile]);

  return (
    <SearchRoot
      stream={stream}
      topK={topK}
      rerankerTopK={rerankerTopK}
      profile={backendProfile}
      domain={domain}
      groupByField={groupByField}
    >
      <ProgramSearchContextBridge>{children}</ProgramSearchContextBridge>
    </SearchRoot>
  );
}

/**
 * SDK Context를 우리 Context로 브릿지
 */
function ProgramSearchContextBridge({ children }: { children: ReactNode }) {
  const value = useProgramSearchInternal();
  return (
    <ProgramSearchContext.Provider value={value}>
      {children}
    </ProgramSearchContext.Provider>
  );
}

// ============================================
// Consumer Hook
// ============================================

/**
 * 지원사업 검색 Hook
 *
 * @returns 검색 상태와 메서드 (SupportProgram DTO 기반)
 * @throws Provider 외부에서 사용 시 에러
 */
export function useProgramSearch(): ProgramSearchContextValue {
  const context = useContext(ProgramSearchContext);

  if (!context) {
    throw new Error("useProgramSearch must be used within ProgramSearchProvider");
  }

  return context;
}
