import { fetchCommonCodes } from './commonCodeUtils.js';
import { useMenuStore } from '../store/useMenuStore.js';
import { buildFullPath } from './menuUtils.js';

// =============================================================================
// Public Constants
// =============================================================================

/**
 * 통합검색 라우트 힌트 공통코드 그룹 ID
 */
export const INTG_SRCH_ROUTE_HINT_CD_GROUP_ID = 'INTG_SRCH_ROUTE_HINT_CD';

/**
 * 통합검색 라우팅 처리 "분류(케이스) 코드"
 */
export const INTG_SEARCH_ROUTE_CASE = Object.freeze({
  DETAIL_SIMPLE: 'DETAIL_SIMPLE',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
});

/**
 * 힌트코드별 처리 케이스 매핑
 *
 * 유지보수 규칙:
 * - 신규 힌트코드가 생기면 여기 먼저 등록한다.
 * - 그리고 resolveIntegratedSearchRouteByMap switch에 분기 로직을 추가한다.
 */
export const INTG_SEARCH_ROUTE_CASE_BY_HINT = Object.freeze({
  ISRH0001: INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE,
});

/**
 * 사용 예시(요구 시나리오)
 */
export const INTEGRATED_SEARCH_ROUTE_RESOLVER_EXAMPLE = Object.freeze({
  intgSrchRouteHintCd: 'ISRH0001',
  workId: 'ST_000000000001265',
});

// =============================================================================
// Primary Public API (업무개발자 권장 진입점)
// =============================================================================

/**
 * 리졸버에 필요한 내부 리소스를 미리 로드한다.
 *
 * 권장 사용:
 * - 앱/화면 초기 진입 시 1회 호출하면 첫 클릭 지연을 줄일 수 있다.
 */
export const preloadIntegratedSearchRouteResources = async () => {
  const [routeHintMap, menuFlatMap] = await Promise.all([
    ensureIntgSearchRouteHintMap(),
    ensureMenuFlatMap(),
  ]);

  return {
    routeHintMapSize: Object.keys(routeHintMap).length,
    menuFlatMapSize: Object.keys(menuFlatMap).length,
  };
};

/**
 * 통합검색 라우팅 핵심 resolver
 *
 * 입력:
 * - intgSrchRouteHintCd: 통합검색 단서코드
 * - workId: 업무ID(=상세 식별자)
 *
 * 출력:
 * - routeCase/menuId/basePath/path/reason/isFallback 포함 결과 객체
 *
 * 설계 원칙:
 * - 호출부는 getFullPath/menuMap/routeHintMap을 모른다.
 * - 이 함수가 내부에서 DB 공통코드 + 메뉴데이터를 보장하고 경로를 계산한다.
 */
export const resolveIntegratedSearchRoute = async ({
  intgSrchRouteHintCd,
  workId,
}) => {
  const routeHintMap = await ensureIntgSearchRouteHintMap();

  return resolveIntegratedSearchRouteByMap({
    intgSrchRouteHintCd,
    workId,
    routeHintMap,
    useCacheOnly: false,
  });
};

/**
 * path 문자열만 필요할 때 쓰는 축약 함수
 */
export const resolveIntegratedSearchPath = async ({
  intgSrchRouteHintCd,
  workId,
}) => {
  const resolved = await resolveIntegratedSearchRoute({
    intgSrchRouteHintCd,
    workId,
  });

  return resolved.path;
};

/**
 * 호출 편의용 별칭
 * - 현재는 resolveIntegratedSearchRoute와 동일 동작
 */
export const resolveSimpleDetailRoute = async ({
  intgSrchRouteHintCd,
  workId,
}) => {
  return resolveIntegratedSearchRoute({
    intgSrchRouteHintCd,
    workId,
  });
};

// =============================================================================
// Optional Public API (디버깅/호환/특수 상황)
// =============================================================================

/**
 * 캐시만 사용해서 동기처럼(네트워크 없이) 계산한다.
 *
 * 주의:
 * - 힌트맵/메뉴맵이 캐시에 없으면 실패(reason)로 반환될 수 있다.
 * - 일반 화면 로직에서는 async resolveIntegratedSearchRoute를 권장한다.
 */
export const resolveIntegratedSearchRouteFromCache = async ({
  intgSrchRouteHintCd,
  workId,
}) => {
  return resolveIntegratedSearchRouteByMap({
    intgSrchRouteHintCd,
    workId,
    routeHintMap: getIntgSearchRouteHintMap(),
    useCacheOnly: true,
  });
};

/**
 * 레거시 포맷 호환 함수
 * - 기존 호출부가 menuId/path/workId 형태만 필요할 때 사용한다.
 */
export const resolveIntegratedSearchRouteLegacy = async ({
  intgSrchRouteHintCd,
  workId,
}) => {
  const resolved = await resolveIntegratedSearchRoute({
    intgSrchRouteHintCd,
    workId,
  });

  return {
    menuId: resolved.menuId || null,
    path: resolved.path || null,
    workId: resolved.workId || null,
  };
};

/**
 * path 존재 여부 헬퍼
 */
export const canNavigateIntegratedSearchRoute = (resolved) => {
  return Boolean(resolved?.path);
};

/**
 * 디버깅 로그 문자열 헬퍼
 */
export const toIntegratedSearchRouteDebugMessage = (resolved) => {
  if (!resolved) {
    return '[IntegratedSearchRoute] resolved is null';
  }

  return [
    '[IntegratedSearchRoute]',
    `hint=${resolved.intgSrchRouteHintCd ?? '-'}`,
    `menuId=${resolved.menuId ?? '-'}`,
    `case=${resolved.routeCase ?? '-'}`,
    `path=${resolved.path ?? '-'}`,
    `fallback=${resolved.isFallback ? 'Y' : 'N'}`,
    `reason=${resolved.reason ?? '-'}`,
  ].join(' ');
};

// =============================================================================
// Public Map/Cache Management API
// =============================================================================

/**
 * 공통코드 응답 배열을 힌트맵으로 변환한다.
 */
export const buildIntgSearchRouteHintMap = (codeList = []) => {
  if (!Array.isArray(codeList)) {
    return {};
  }

  return codeList.reduce((acc, item) => {
    const useYn = String(item?.useYn ?? 'Y').toUpperCase();
    const hintCode = item?.comCd;
    const menuId = item?.comCdNm;

    if (useYn !== 'Y' || !hintCode || !menuId) {
      return acc;
    }

    acc[hintCode] = menuId;
    return acc;
  }, {});
};

/**
 * 힌트코드에 대응하는 라우팅 케이스를 반환한다.
 */
export const getIntegratedSearchRouteCase = (intgSrchRouteHintCd) => {
  return INTG_SEARCH_ROUTE_CASE_BY_HINT[intgSrchRouteHintCd] || INTG_SEARCH_ROUTE_CASE.NOT_SUPPORTED;
};

/**
 * routeHintMap 캐시를 외부에서 강제로 설정한다.
 * 테스트 코드/스토리북/로컬 디버깅에서 사용 가능하다.
 */
export const setIntgSearchRouteHintMap = (routeHintMap = {}) => {
  intgSearchRouteHintMapCache = routeHintMap && typeof routeHintMap === 'object' ? routeHintMap : {};
  intgSearchRouteHintMapLoadedAt = new Date().toISOString();
  return intgSearchRouteHintMapCache;
};

/**
 * routeHintMap 캐시를 초기화한다.
 */
export const clearIntgSearchRouteHintMap = () => {
  intgSearchRouteHintMapCache = {};
  intgSearchRouteHintMapLoadedAt = null;
};

/**
 * 현재 routeHintMap 캐시를 반환한다.
 */
export const getIntgSearchRouteHintMap = () => {
  return intgSearchRouteHintMapCache;
};

/**
 * routeHintMap 캐시 적재 시각을 반환한다.
 */
export const getIntgSearchRouteHintMapLoadedAt = () => {
  return intgSearchRouteHintMapLoadedAt;
};

/**
 * DB 공통코드에서 routeHintMap을 재조회하여 캐시를 갱신한다.
 */
export const loadIntgSearchRouteHintMap = async () => {
  const codeResponse = await fetchCommonCodes([INTG_SRCH_ROUTE_HINT_CD_GROUP_ID]);
  const codeList = codeResponse?.[INTG_SRCH_ROUTE_HINT_CD_GROUP_ID] || [];
  const routeHintMap = buildIntgSearchRouteHintMap(codeList);
  setIntgSearchRouteHintMap(routeHintMap);
  return routeHintMap;
};

/**
 * routeHintMap 캐시가 비어 있으면 DB에서 1회 로드하고,
 * 이미 있으면 캐시를 그대로 반환한다.
 */
export const ensureIntgSearchRouteHintMap = async () => {
  const current = getIntgSearchRouteHintMap();
  if (hasEntries(current)) {
    return current;
  }
  return loadIntgSearchRouteHintMap();
};

/**
 * 메뉴 flat map을 반환한다.
 * - source='cache': 현재 store 상태만 확인
 * - source='fresh': 비어 있으면 fetchMenuData로 1회 로드
 */
export const getIntegratedSearchMenuFlatMap = async ({ source = 'fresh' } = {}) => {
  if (source === 'cache') {
    return getMenuFlatMapFromStore();
  }
  return ensureMenuFlatMap();
};

// =============================================================================
// Internal State / Helpers
// =============================================================================

/**
 * 모듈 내부 힌트맵 캐시
 */
let intgSearchRouteHintMapCache = {};
let intgSearchRouteHintMapLoadedAt = null;

const hasEntries = (value) => {
  return Boolean(value && typeof value === 'object' && Object.keys(value).length > 0);
};

/**
 * store에서 현재 menu flat map을 읽는다.
 */
const getMenuFlatMapFromStore = () => {
  const state = useMenuStore?.getState?.();
  return state?.flatMenuMap && typeof state.flatMenuMap === 'object' ? state.flatMenuMap : {};
};

/**
 * 메뉴 flat map을 보장한다.
 *
 * 동작:
 * - store 캐시에 있으면 그대로 사용
 * - 없으면 store.fetchMenuData() 1회 호출 후 재조회
 */
const ensureMenuFlatMap = async () => {
  const cached = getMenuFlatMapFromStore();
  if (hasEntries(cached)) {
    return cached;
  }

  const state = useMenuStore?.getState?.();
  const fetchMenuData = state?.fetchMenuData;

  if (typeof fetchMenuData === 'function') {
    await fetchMenuData();
  }

  return getMenuFlatMapFromStore();
};

/**
 * menuId로 basePath를 계산한다.
 *
 * useCacheOnly=true:
 * - store 캐시만 사용(네트워크 호출 없음)
 */
const resolveBasePathByMenuId = async ({ menuId, useCacheOnly }) => {
  if (!menuId) {
    return null;
  }

  const menuFlatMap = useCacheOnly
    ? getMenuFlatMapFromStore()
    : await ensureMenuFlatMap();

  const menuNode = menuFlatMap?.[menuId];
  if (!menuNode) {
    return null;
  }

  return buildFullPath(menuNode, menuFlatMap);
};

/**
 * 상세 경로 생성 시 workId를 안전하게 문자열 segment로 정규화한다.
 */
const normalizeWorkId = (workId) => {
  if (workId === null || workId === undefined) {
    return '';
  }
  return String(workId).trim();
};

/**
 * basePath 뒤에 상세 식별자를 붙여 상세 경로를 생성한다.
 */
const buildDetailPath = (basePath, workId) => {
  const normalizedWorkId = normalizeWorkId(workId);
  if (!basePath || !normalizedWorkId) {
    return null;
  }

  return `${basePath}/${encodeURIComponent(normalizedWorkId)}`;
};

/**
 * 통합검색 라우팅 기본 결과 객체를 생성한다.
 */
const createDefaultResolveResult = ({ intgSrchRouteHintCd, workId }) => ({
  intgSrchRouteHintCd: intgSrchRouteHintCd || null,
  workId: normalizeWorkId(workId) || null,
  routeCase: INTG_SEARCH_ROUTE_CASE.NOT_SUPPORTED,
  menuId: null,
  basePath: null,
  path: null,
  isFallback: true,
  reason: 'UNRESOLVED',
});

/**
 * 내부 전용 resolver
 * - 입력 받은 routeHintMap 기준으로 계산한다.
 * - basePath 계산은 내부 메뉴 store를 사용한다.
 */
const resolveIntegratedSearchRouteByMap = async ({
  intgSrchRouteHintCd,
  workId,
  routeHintMap,
  useCacheOnly,
}) => {
  const defaultResult = createDefaultResolveResult({
    intgSrchRouteHintCd,
    workId,
  });

  const menuId = routeHintMap?.[intgSrchRouteHintCd] || null;
  if (!menuId) {
    return {
      ...defaultResult,
      reason: 'MENU_ID_NOT_FOUND_IN_ROUTE_HINT_MAP',
    };
  }

  const basePath = await resolveBasePathByMenuId({ menuId, useCacheOnly });
  if (!basePath) {
    return {
      ...defaultResult,
      menuId,
      reason: useCacheOnly ? 'BASE_PATH_NOT_FOUND_IN_MENU_CACHE' : 'BASE_PATH_NOT_FOUND',
    };
  }

  const routeCase = getIntegratedSearchRouteCase(intgSrchRouteHintCd);
  switch (routeCase) {
  case INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE: {
    const detailPath = buildDetailPath(basePath, workId);

    // 상세키(workId)가 없으면 목록(basePath)으로 폴백
    if (!detailPath) {
      return {
        ...defaultResult,
        routeCase,
        menuId,
        basePath,
        path: basePath,
        isFallback: true,
        reason: 'WORK_ID_MISSING_FALLBACK_TO_BASE',
      };
    }

    return {
      ...defaultResult,
      routeCase,
      menuId,
      basePath,
      path: detailPath,
      isFallback: false,
      reason: 'OK',
    };
  }

  // 아직 구현되지 않은 힌트코드는 목록(basePath)으로 폴백
  default:
    return {
      ...defaultResult,
      routeCase,
      menuId,
      basePath,
      path: basePath,
      isFallback: true,
      reason: 'ROUTE_CASE_NOT_SUPPORTED_FALLBACK_TO_BASE',
    };
  }
};
