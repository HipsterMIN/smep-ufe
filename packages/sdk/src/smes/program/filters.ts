/**
 * SMES 지원사업 필터 유틸리티
 * 
 * UI 필터를 SDK/백엔드 쿼리 형식으로 변환
 */

import type { Region, CompanySize, SupportField, SupportType, DeadlineType } from './types';

// ============================================================================
// Filter Types
// ============================================================================

/**
 * UI에서 사용하는 필터 입력 타입
 */
export interface SearchFilters {
  /** 지역 필터 */
  regions?: Region[];
  /** 기업규모 필터 */
  companySizes?: CompanySize[];
  /** 지원분야 필터 */
  supportFields?: SupportField[];
  /** 지원유형 필터 */
  supportTypes?: SupportType[];
  /** 마감유형 필터 */
  deadlineTypes?: DeadlineType[];
  /** 접수유형 필터 */
  receptionTypes?: string[];
  /** 지난 공고 포함 여부 (false면 현재 접수중인 공고만) */
  includePast?: boolean;
}

/**
 * 빈 필터 기본값
 */
export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  regions: [],
  companySizes: [],
  supportFields: [],
  supportTypes: [],
  deadlineTypes: [],
  includePast: false,
};

// ============================================================================
// Filter Conversion
// ============================================================================

/**
 * 필터 변환 옵션
 */
export interface FilterConversionOptions {
  /**
   * 지역 필터를 정확히 매칭 (전국 확장 안함)
   * - false (기본): 세종 → 세종 + 전국 (프로필 기반 필터)
   * - true: 세종 → 세종만 (UI 명시적 선택)
   */
  exactRegions?: boolean;
}

/**
 * UI 필터를 SDK/백엔드 쿼리 형식으로 변환
 *
 * @example
 * ```typescript
 * // 기본: 전국 자동 확장
 * const filters = { regions: ['서울', '경기'], companySizes: ['중소기업'] };
 * const sdkFilters = convertFiltersToQuery(filters);
 * // { regions: { $contains_any: ['서울', '경기'] }, ... }
 * // 백엔드에서 전국/전체 자동 추가됨
 *
 * // UI 명시적 선택: 전국 확장 안함
 * const exactFilters = convertFiltersToQuery(filters, { exactRegions: true });
 * // { regions: { $exact: ['서울', '경기'] }, ... }
 * // 선택한 지역만 검색 (전국 포함 안함)
 * ```
 */
export function convertFiltersToQuery(
  filters: SearchFilters | undefined,
  options?: FilterConversionOptions
): Record<string, unknown> | undefined {
  const query: Record<string, unknown> = {};

  // 지역 필터
  // - $contains_any: 전국/전체 자동 확장 (프로필 기본 동작)
  // - $exact: 전국 확장 없이 정확히 매칭 (UI 명시적 선택)
  if (filters?.regions && filters.regions.length > 0) {
    const operator = options?.exactRegions ? '$exact' : '$contains_any';
    query.regions = { [operator]: filters.regions };
  }

  // 기업규모: $contains_any (OR 조건)
  if (filters?.companySizes && filters.companySizes.length > 0) {
    query.company_sizes = { $contains_any: filters.companySizes };
  }

  // 지원분야: 단일 값이면 직접, 복수면 $in
  if (filters?.supportFields && filters.supportFields.length > 0) {
    if (filters.supportFields.length === 1) {
      query.support_field = filters.supportFields[0];
    } else {
      query.support_field = { $in: filters.supportFields };
    }
  }

  // 지원유형: $contains_any (OR 조건)
  if (filters?.supportTypes && filters.supportTypes.length > 0) {
    query.support_types = { $contains_any: filters.supportTypes };
  }

  // 마감유형: 단일 값이면 직접, 복수면 $in
  if (filters?.deadlineTypes && filters.deadlineTypes.length > 0) {
    if (filters.deadlineTypes.length === 1) {
      query.deadline_type = filters.deadlineTypes[0];
    } else {
      query.deadline_type = { $in: filters.deadlineTypes };
    }
  }

  // 접수유형: $contains_any (OR 조건)
  if (filters?.receptionTypes && filters.receptionTypes.length > 0) {
    query.reception_types = { $contains_any: filters.receptionTypes };
  }

  // 지난 공고 제외 (기본: includePast가 true가 아니면 마감 공고 제외)
  // - 오늘 이후 마감인 공고 ($gte)
  // - 또는 상시모집 공고 (apply_end_date = 0)
  if (filters?.includePast !== true) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    query.apply_end_date = { $or: [{ $gte: todayStr }, { $eq: 0 }] };
  }

  return Object.keys(query).length > 0 ? query : undefined;
}

/**
 * 필터가 비어있는지 확인
 */
export function isFiltersEmpty(filters: SearchFilters | undefined): boolean {
  if (!filters) return true;

  return (
    (!filters.regions || filters.regions.length === 0) &&
    (!filters.companySizes || filters.companySizes.length === 0) &&
    (!filters.supportFields || filters.supportFields.length === 0) &&
    (!filters.supportTypes || filters.supportTypes.length === 0) &&
    (!filters.deadlineTypes || filters.deadlineTypes.length === 0) &&
    !filters.includePast  // 지난 공고 포함 체크
  );
}

/**
 * 선택된 필터 총 개수
 */
export function countSelectedFilters(filters: SearchFilters | undefined): number {
  if (!filters) return 0;
  
  return (
    (filters.regions?.length || 0) +
    (filters.companySizes?.length || 0) +
    (filters.supportFields?.length || 0) +
    (filters.supportTypes?.length || 0) +
    (filters.deadlineTypes?.length || 0) +
    (filters.includePast ? 1 : 0)
  );
}
