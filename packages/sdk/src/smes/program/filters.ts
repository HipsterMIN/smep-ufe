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
 * UI 필터를 SDK/백엔드 쿼리 형식으로 변환
 *
 * @example
 * ```typescript
 * const filters = { regions: ['서울', '경기'], companySizes: ['중소기업'] };
 * const sdkFilters = convertFiltersToQuery(filters);
 * // { regions: { $contains_any: ['서울', '경기'] }, company_sizes: { $contains_any: ['중소기업'] } }
 *
 * search(query, { filters: sdkFilters });
 * ```
 */
export function convertFiltersToQuery(
    filters: SearchFilters | undefined
): Record<string, unknown> | undefined {
    if (!filters) return undefined;

    const query: Record<string, unknown> = {};

    // 지역: $contains_any (OR 조건)
    if (filters.regions && filters.regions.length > 0) {
        query.regions = { $contains_any: filters.regions };
    }

    // 기업규모: $contains_any (OR 조건)
    if (filters.companySizes && filters.companySizes.length > 0) {
        query.company_sizes = { $contains_any: filters.companySizes };
    }

    // 지원분야: 단일 값이면 직접, 복수면 $in
    if (filters.supportFields && filters.supportFields.length > 0) {
        if (filters.supportFields.length === 1) {
            query.support_field = filters.supportFields[0];
        } else {
            query.support_field = { $in: filters.supportFields };
        }
    }

    // 지원유형: $contains_any (OR 조건)
    if (filters.supportTypes && filters.supportTypes.length > 0) {
        query.support_types = { $contains_any: filters.supportTypes };
    }

    // 마감유형: 단일 값이면 직접, 복수면 $in
    if (filters.deadlineTypes && filters.deadlineTypes.length > 0) {
        if (filters.deadlineTypes.length === 1) {
            query.deadline_type = filters.deadlineTypes[0];
        } else {
            query.deadline_type = { $in: filters.deadlineTypes };
        }
    }

    // 지난 공고 제외 (includePast=false면 오늘 이후 마감만)
    // 백엔드에서 null 처리하므로 여기서는 날짜 조건만 추가
    if (filters.includePast === false) {
        const today = new Date();
        const todayNum = parseInt(
            `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
        );
        query.apply_end_date = { $gte: todayNum };
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
        (!filters.deadlineTypes || filters.deadlineTypes.length === 0)
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
