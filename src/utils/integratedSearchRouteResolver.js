import { fetchCommonCodes } from './commonCodeUtils.js';
import { useMenuStore } from '../store/useMenuStore.js';
import { buildFullPath } from './menuUtils.js';
import { api as apiClient } from '../lib/apiClient.js';

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
  BOARD_POST_DETAIL: 'BOARD_POST_DETAIL',
  BOARD_LIST_TITLE_SEARCH: 'BOARD_LIST_TITLE_SEARCH',
  BOARD_POST_DETAIL_WITH_BBS_NO: 'BOARD_POST_DETAIL_WITH_BBS_NO',
  EXTERNAL_LINK_ONLY: 'EXTERNAL_LINK_ONLY',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
});

/**
 * 최종 이동 방식
 *
 * - INTERNAL: React Router 내부 경로 이동
 * - EXTERNAL: 외부 URL로 새 창/새 탭 이동
 */
export const INTG_SEARCH_NAVIGATION_TYPE = Object.freeze({
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
});

/**
 * 힌트코드별 처리 케이스 매핑
 *
 * DB 기준:
 * - (상세) -> DETAIL_SIMPLE
 * - (게시판_상세) -> BOARD_POST_DETAIL
 * - (게시판_파라미터수신처리) -> BOARD_LIST_TITLE_SEARCH
 * - (게시판1_상세) -> BOARD_POST_DETAIL_WITH_BBS_NO
 * - (외부링크이동) -> EXTERNAL_LINK_ONLY
 *
 * 유지보수 규칙:
 * - 신규 힌트코드가 생기면 여기 먼저 등록한다.
 * - 그리고 resolveIntegratedSearchRouteByMap switch에 분기 로직을 추가한다.
 */
export const INTG_SEARCH_ROUTE_CASE_BY_HINT = Object.freeze({
  // com_cd_expln에 "(상세)"로 등록된 코드
  ISRH0001: INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE,
  ISRH0002: INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE,
  ISRH0003: INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE,
  ISRH0004: INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE,
  ISRH0007: INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE,
  ISRH0009: INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE,
  ISRH0011: INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE,
  ISRH0019: INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE,
  ISRH0020: INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE,

  // com_cd_expln에 "(게시판_상세)"로 등록된 코드
  ISRH0005: INTG_SEARCH_ROUTE_CASE.BOARD_POST_DETAIL,
  ISRH0006: INTG_SEARCH_ROUTE_CASE.BOARD_POST_DETAIL,
  ISRH0008: INTG_SEARCH_ROUTE_CASE.BOARD_POST_DETAIL,
  ISRH0010: INTG_SEARCH_ROUTE_CASE.BOARD_POST_DETAIL,
  ISRH0013: INTG_SEARCH_ROUTE_CASE.BOARD_POST_DETAIL,
  ISRH0015: INTG_SEARCH_ROUTE_CASE.BOARD_POST_DETAIL,
  ISRH0014: INTG_SEARCH_ROUTE_CASE.BOARD_LIST_TITLE_SEARCH,
  ISRH0016: INTG_SEARCH_ROUTE_CASE.BOARD_LIST_TITLE_SEARCH,
  ISRH0017: INTG_SEARCH_ROUTE_CASE.BOARD_POST_DETAIL_WITH_BBS_NO,

  // com_cd_expln에 "(외부링크이동)" 계열로 등록된 코드
  // - 세부 URL 조회 로직은 external provider 구현체에서 코드별로 분리 관리한다.
  ISRH0012: INTG_SEARCH_ROUTE_CASE.EXTERNAL_LINK_ONLY,
  ISRH0018: INTG_SEARCH_ROUTE_CASE.EXTERNAL_LINK_ONLY,
});

/**
 * 게시판 카테고리 ID(ctgryNo) 처리 정책
 *
 * - NONE: 항상 쿼리스트링을 붙이지 않는다.
 * - OPTIONAL: 값이 있을 때만 ctgryNo를 쿼리스트링으로 붙인다.
 * - REQUIRED: 값이 반드시 필요하다(없으면 reason에 누락 사유 기록).
 */
export const INTG_SEARCH_BBS_CATEGORY_POLICY = Object.freeze({
  NONE: 'NONE',
  OPTIONAL: 'OPTIONAL',
  REQUIRED: 'REQUIRED',
});

/**
 * 힌트코드별 bbsCategoryId 정책 매핑
 *
 * 현재 운영 방침:
 * - (게시판_상세)는 카테고리 값이 오면 전달하고, 없으면 상세 이동만 수행한다.
 */
export const INTG_SEARCH_BBS_CATEGORY_POLICY_BY_HINT = Object.freeze({
  ISRH0005: INTG_SEARCH_BBS_CATEGORY_POLICY.OPTIONAL,
  ISRH0006: INTG_SEARCH_BBS_CATEGORY_POLICY.OPTIONAL,
  ISRH0008: INTG_SEARCH_BBS_CATEGORY_POLICY.OPTIONAL,
  ISRH0010: INTG_SEARCH_BBS_CATEGORY_POLICY.OPTIONAL,
  ISRH0013: INTG_SEARCH_BBS_CATEGORY_POLICY.OPTIONAL,
  ISRH0015: INTG_SEARCH_BBS_CATEGORY_POLICY.OPTIONAL,
});

/**
 * 사용 예시(요구 시나리오)
 */
export const INTEGRATED_SEARCH_ROUTE_RESOLVER_EXAMPLE = Object.freeze({
  intgSrchRouteHintCd: 'ISRH0001',
  workId: 'ST_000000000001265',
  bbsCategoryId: '1001',
  parameter: {
    title: 'FAQ 검색어',
  },
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
 * - bbsCategoryId: 게시판 카테고리 식별자(해당 케이스에서 선택적으로 사용)
 * - parameter: 케이스별 확장 파라미터 객체(현재는 parameter.title만 사용)
 *
 * 출력:
 * - routeCase/menuId/basePath/path/navigationType/externalUrl/reason/isFallback 포함 결과 객체
 *
 * 설계 원칙:
 * - 호출부는 getFullPath/menuMap/routeHintMap을 모른다.
 * - 이 함수가 내부에서 DB 공통코드 + 메뉴데이터를 보장하고 경로를 계산한다.
 */
export const resolveIntegratedSearchRoute = async ({
  intgSrchRouteHintCd,
  workId,
  bbsCategoryId,
  parameter = {},
}) => {
  const routeHintMap = await ensureIntgSearchRouteHintMap();

  return resolveIntegratedSearchRouteByMap({
    intgSrchRouteHintCd,
    workId,
    bbsCategoryId,
    parameter,
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
  bbsCategoryId,
  parameter = {},
}) => {
  const resolved = await resolveIntegratedSearchRoute({
    intgSrchRouteHintCd,
    workId,
    bbsCategoryId,
    parameter,
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
  bbsCategoryId,
  parameter = {},
}) => {
  return resolveIntegratedSearchRoute({
    intgSrchRouteHintCd,
    workId,
    bbsCategoryId,
    parameter,
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
  bbsCategoryId,
  parameter = {},
}) => {
  return resolveIntegratedSearchRouteByMap({
    intgSrchRouteHintCd,
    workId,
    bbsCategoryId,
    parameter,
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
  bbsCategoryId,
  parameter = {},
}) => {
  const resolved = await resolveIntegratedSearchRoute({
    intgSrchRouteHintCd,
    workId,
    bbsCategoryId,
    parameter,
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
  if (!resolved) {
    return false;
  }
  return Boolean(resolved.path || resolved.externalUrl);
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
    `navigationType=${resolved.navigationType ?? '-'}`,
    `path=${resolved.path ?? '-'}`,
    `externalUrl=${resolved.externalUrl ?? '-'}`,
    `bbsNo=${resolved.bbsNo ?? '-'}`,
    `bbsCategoryId=${resolved.bbsCategoryId ?? '-'}`,
    `title=${resolved.parameterTitle ?? '-'}`,
    `bbsCategoryApplied=${resolved.bbsCategoryApplied ? 'Y' : 'N'}`,
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
 * 힌트코드에 대응하는 bbsCategoryId 처리 정책을 반환한다.
 */
export const getIntegratedSearchBbsCategoryPolicy = (intgSrchRouteHintCd) => {
  return INTG_SEARCH_BBS_CATEGORY_POLICY_BY_HINT[intgSrchRouteHintCd] || INTG_SEARCH_BBS_CATEGORY_POLICY.NONE;
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
 * bbsCategoryId를 쿼리스트링 값으로 사용할 수 있도록 문자열로 정규화한다.
 */
const normalizeBbsCategoryId = (bbsCategoryId) => {
  if (bbsCategoryId === null || bbsCategoryId === undefined) {
    return '';
  }
  return String(bbsCategoryId).trim();
};

/**
 * 게시판 번호(bbsNo)를 쿼리스트링 값으로 사용할 수 있도록 문자열로 정규화한다.
 */
const normalizeBbsNo = (bbsNo) => {
  if (bbsNo === null || bbsNo === undefined) {
    return '';
  }
  return String(bbsNo).trim();
};

/**
 * parameter.title을 쿼리스트링 값으로 사용할 수 있도록 문자열로 정규화한다.
 */
const normalizeParameterTitle = (parameter) => {
  if (!parameter || typeof parameter !== 'object') {
    return '';
  }
  const title = parameter.title;
  if (title === null || title === undefined) {
    return '';
  }
  return String(title).trim();
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
 * path 뒤에 단일 쿼리 파라미터를 안전하게 추가한다.
 */
const appendQueryParam = (path, key, value) => {
  if (!path || !key || value === null || value === undefined || value === '') {
    return path;
  }

  const prefix = path.includes('?') ? '&' : '?';
  return `${path}${prefix}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
};

/**
 * 게시판 카테고리 정책에 따라 detailPath에 ctgryNo 쿼리를 반영한다.
 */
const applyBbsCategoryPolicyToPath = ({
  detailPath,
  bbsCategoryId,
  bbsCategoryPolicy,
}) => {
  const normalizedBbsCategoryId = normalizeBbsCategoryId(bbsCategoryId);

  if (!detailPath) {
    return {
      path: null,
      normalizedBbsCategoryId,
      bbsCategoryApplied: false,
      bbsCategoryMissing: false,
    };
  }

  if (bbsCategoryPolicy === INTG_SEARCH_BBS_CATEGORY_POLICY.NONE) {
    return {
      path: detailPath,
      normalizedBbsCategoryId,
      bbsCategoryApplied: false,
      bbsCategoryMissing: false,
    };
  }

  if (!normalizedBbsCategoryId) {
    return {
      path: detailPath,
      normalizedBbsCategoryId,
      bbsCategoryApplied: false,
      bbsCategoryMissing: bbsCategoryPolicy === INTG_SEARCH_BBS_CATEGORY_POLICY.REQUIRED,
    };
  }

  return {
    path: appendQueryParam(detailPath, 'ctgryNo', normalizedBbsCategoryId),
    normalizedBbsCategoryId,
    bbsCategoryApplied: true,
    bbsCategoryMissing: false,
  };
};

/**
 * 게시판 상세(bbsNo 필요) 제공자 레지스트리(인터페이스/구현체 패턴)
 *
 * 설계 의도:
 * - "하드코딩 위치"를 한 곳으로 모아 변경 비용을 낮춘다.
 * - route switch는 구현체 세부값을 모르고 provider 결과만 사용한다.
 */
const createBoardPostDetailBbsNoProviderRegistry = () => ({
  // 기업가정신 > 공지사항 탭 고정 게시판 번호
  ISRH0017: () => ({
    bbsNo: '15',
    reason: 'OK_HARDCODED_BBS_NO',
  }),
});

const boardPostDetailBbsNoProviderRegistry = createBoardPostDetailBbsNoProviderRegistry();

/**
 * 힌트코드별 bbsNo 제공자를 실행한다.
 */
const resolveBoardPostDetailBbsNoByProvider = ({ intgSrchRouteHintCd }) => {
  const provider = boardPostDetailBbsNoProviderRegistry[intgSrchRouteHintCd];
  if (typeof provider !== 'function') {
    return {
      bbsNo: null,
      reason: 'BBS_NO_PROVIDER_NOT_FOUND',
    };
  }

  try {
    const provided = provider({ intgSrchRouteHintCd });
    const normalizedBbsNo = normalizeBbsNo(provided?.bbsNo);

    if (!normalizedBbsNo) {
      return {
        bbsNo: null,
        reason: provided?.reason || 'BBS_NO_EMPTY',
      };
    }

    return {
      bbsNo: normalizedBbsNo,
      reason: provided?.reason || 'OK_BBS_NO',
    };
  } catch (error) {
    console.error('[IntegratedSearchRoute] bbsNo provider 실행 실패:', error);
    return {
      bbsNo: null,
      reason: 'BBS_NO_PROVIDER_ERROR',
    };
  }
};

/**
 * apiClient 응답은 화면별로 response.data / response 형태가 혼재할 수 있어
 * 이 리졸버에서는 항상 plain object 데이터로 정규화해서 다룬다.
 */
const normalizeApiResponseData = (response) => {
  if (!response || typeof response !== 'object') {
    return {};
  }
  if (response.data && typeof response.data === 'object') {
    return response.data;
  }
  return response;
};

/**
 * 문자열이 http/https URL인지 검증한다.
 */
const isHttpProtocolUrl = (value) => {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * 외부링크 URL을 정규화한다.
 *
 * 정책:
 * - 값이 비어 있으면 null
 * - 프로토콜이 있으면 그대로 사용
 * - 프로토콜이 없으면 https://를 보완해 1회 검증
 */
const normalizeExternalUrl = (externalUrl) => {
  const raw = String(externalUrl ?? '').trim();
  if (!raw) {
    return null;
  }

  if (isHttpProtocolUrl(raw)) {
    return raw;
  }

  const withHttps = `https://${raw}`;
  if (isHttpProtocolUrl(withHttps)) {
    return withHttps;
  }

  return null;
};

/**
 * /api/v1/certificate/main 응답에서 증명서 행을 하나의 배열로 합친다.
 * - topCertificates + allCertificates.content를 dedupe(prdocCd) 처리한다.
 */
const extractCertificateRows = (mainPageData) => {
  const topList = Array.isArray(mainPageData?.topCertificates) ? mainPageData.topCertificates : [];
  const pagedList = Array.isArray(mainPageData?.allCertificates?.content)
    ? mainPageData.allCertificates.content
    : [];

  const merged = [...topList, ...pagedList];
  const uniqueByPrdocCd = new Map();

  merged.forEach((item) => {
    const key = String(item?.prdocCd ?? '').trim();
    if (!key) {
      return;
    }
    if (!uniqueByPrdocCd.has(key)) {
      uniqueByPrdocCd.set(key, item);
    }
  });

  return Array.from(uniqueByPrdocCd.values());
};

/**
 * 증명서 목록에서 workId(prdocCd)와 일치하는 행을 찾는다.
 */
const findCertificateRowByWorkId = ({ rows, workId }) => {
  if (!Array.isArray(rows) || rows.length === 0 || !workId) {
    return null;
  }

  return rows.find((item) => String(item?.prdocCd ?? '').trim() === workId) || null;
};

const CERTIFICATE_MAIN_PAGE_SIZE = 200;
const CERTIFICATE_MAIN_PAGE_MAX_SCAN = 20;
const ENTRSPT_PRESS_BBS_NO = '21';

/**
 * ISRH0012 전용 구현체(provider):
 * - 업무ID(workId=prdocCd) 기준으로 증명서 목록 API에서 대상행을 찾고 외부 URL을 반환한다.
 */
const resolveCertificateExternalLinkByWorkId = async ({ workId }) => {
  const normalizedWorkId = normalizeWorkId(workId);
  if (!normalizedWorkId) {
    return {
      externalUrl: null,
      reason: 'WORK_ID_MISSING_FOR_EXTERNAL_LINK',
    };
  }

  let totalPages = 1;
  for (let page = 1; page <= totalPages && page <= CERTIFICATE_MAIN_PAGE_MAX_SCAN; page += 1) {
    const params = new URLSearchParams({
      page: String(page),
      size: String(CERTIFICATE_MAIN_PAGE_SIZE),
    });

    const response = await apiClient.get(`/api/v1/certificate/main?${params.toString()}`);
    const mainPageData = normalizeApiResponseData(response);

    const scannedRows = extractCertificateRows(mainPageData);
    const matched = findCertificateRowByWorkId({
      rows: scannedRows,
      workId: normalizedWorkId,
    });

    if (matched) {
      const isExternalLinkTarget = String(matched?.otsdSiteLnkgYn ?? '').trim().toUpperCase() === 'Y';
      if (!isExternalLinkTarget) {
        return {
          externalUrl: null,
          reason: 'EXTERNAL_LINK_NOT_ENABLED',
        };
      }

      const rawExternalUrl = String(matched?.otsdSiteUrlAddr ?? '').trim();
      if (!rawExternalUrl) {
        return {
          externalUrl: null,
          reason: 'EXTERNAL_LINK_URL_MISSING',
        };
      }

      return {
        externalUrl: rawExternalUrl,
        reason: 'OK_EXTERNAL_LINK',
      };
    }

    const nextTotalPages = Number(mainPageData?.allCertificates?.totalPages ?? 1);
    totalPages = Number.isFinite(nextTotalPages) && nextTotalPages > 0
      ? nextTotalPages
      : 1;
  }

  return {
    externalUrl: null,
    reason: 'EXTERNAL_LINK_TARGET_NOT_FOUND',
  };
};

/**
 * 게시판 상세 API에서 pstUrlAddr를 조회해 외부 링크를 구한다.
 *
 * 대상:
 * - ISRH0018(기업가정신 > 언론보도 탭)
 *
 * 입력 계약:
 * - workId는 게시물 번호(pstNo)여야 한다.
 * - bbsNo는 구현체에서 고정값(현재 21)을 사용한다.
 */
const resolveBoardExternalLinkByWorkId = async ({ workId, bbsNo }) => {
  const normalizedWorkId = normalizeWorkId(workId);
  const normalizedBbsNo = normalizeBbsNo(bbsNo);

  if (!normalizedWorkId) {
    return {
      externalUrl: null,
      reason: 'WORK_ID_MISSING_FOR_EXTERNAL_LINK',
    };
  }

  if (!normalizedBbsNo) {
    return {
      externalUrl: null,
      reason: 'BBS_NO_MISSING_FOR_EXTERNAL_LINK',
    };
  }

  try {
    const response = await apiClient.get(
      `/api/v1/board/${encodeURIComponent(normalizedBbsNo)}/posts/${encodeURIComponent(normalizedWorkId)}`,
    );
    const postDetail = normalizeApiResponseData(response);
    const rawExternalUrl = String(postDetail?.pstUrlAddr ?? '').trim();

    if (!rawExternalUrl) {
      return {
        externalUrl: null,
        reason: 'EXTERNAL_LINK_URL_MISSING',
      };
    }

    return {
      externalUrl: rawExternalUrl,
      reason: 'OK_EXTERNAL_LINK',
    };
  } catch (error) {
    if (error?.status === 404) {
      return {
        externalUrl: null,
        reason: 'EXTERNAL_LINK_TARGET_NOT_FOUND',
      };
    }

    console.error('[IntegratedSearchRoute] 게시판 외부링크 조회 실패:', error);
    return {
      externalUrl: null,
      reason: 'EXTERNAL_LINK_LOOKUP_FAILED',
    };
  }
};

/**
 * 외부링크 제공자 레지스트리(인터페이스/구현체 패턴)
 *
 * 규칙:
 * - key: intgSrchRouteHintCd
 * - value: async provider({ workId, intgSrchRouteHintCd }) => { externalUrl, reason }
 * - 신규 외부링크 케이스는 여기 구현체를 추가한다.
 */
const createExternalLinkProviderRegistry = () => ({
  ISRH0012: resolveCertificateExternalLinkByWorkId,
  ISRH0018: ({ workId }) => resolveBoardExternalLinkByWorkId({
    workId,
    bbsNo: ENTRSPT_PRESS_BBS_NO,
  }),
});

const externalLinkProviderRegistry = createExternalLinkProviderRegistry();

/**
 * 힌트코드별 provider를 실행해 외부 URL을 계산한다.
 * - provider가 없거나 실패하면 reason만 남기고 null 반환한다.
 */
const resolveExternalLinkByProvider = async ({
  intgSrchRouteHintCd,
  workId,
}) => {
  const provider = externalLinkProviderRegistry[intgSrchRouteHintCd];
  if (typeof provider !== 'function') {
    return {
      externalUrl: null,
      reason: 'EXTERNAL_LINK_PROVIDER_NOT_FOUND',
    };
  }

  try {
    const provided = await provider({
      intgSrchRouteHintCd,
      workId,
    });

    const normalizedExternalUrl = normalizeExternalUrl(provided?.externalUrl);
    if (!normalizedExternalUrl) {
      return {
        externalUrl: null,
        reason: provided?.reason || 'EXTERNAL_LINK_URL_NOT_FOUND',
      };
    }

    return {
      externalUrl: normalizedExternalUrl,
      reason: provided?.reason || 'OK_EXTERNAL_LINK',
    };
  } catch (error) {
    console.error('[IntegratedSearchRoute] 외부링크 provider 실행 실패:', error);
    return {
      externalUrl: null,
      reason: 'EXTERNAL_LINK_PROVIDER_ERROR',
    };
  }
};

/**
 * 통합검색 라우팅 기본 결과 객체를 생성한다.
 */
const createDefaultResolveResult = ({ intgSrchRouteHintCd, workId, bbsCategoryId, parameter }) => ({
  intgSrchRouteHintCd: intgSrchRouteHintCd || null,
  workId: normalizeWorkId(workId) || null,
  bbsCategoryId: normalizeBbsCategoryId(bbsCategoryId) || null,
  parameterTitle: normalizeParameterTitle(parameter) || null,
  bbsCategoryPolicy: INTG_SEARCH_BBS_CATEGORY_POLICY.NONE,
  bbsCategoryApplied: false,
  routeCase: INTG_SEARCH_ROUTE_CASE.NOT_SUPPORTED,
  navigationType: INTG_SEARCH_NAVIGATION_TYPE.INTERNAL,
  menuId: null,
  basePath: null,
  path: null,
  bbsNo: null,
  externalUrl: null,
  isFallback: true,
  reason: 'UNRESOLVED',
});

/**
 * DETAIL_SIMPLE 케이스 처리
 */
const resolveDetailSimpleCase = ({
  defaultResult,
  routeCase,
  menuId,
  basePath,
  workId,
  bbsCategoryPolicy,
}) => {
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
    bbsCategoryPolicy,
    menuId,
    basePath,
    path: detailPath,
    isFallback: false,
    reason: 'OK',
  };
};

/**
 * BOARD_POST_DETAIL 케이스 처리
 */
const resolveBoardPostDetailCase = ({
  defaultResult,
  routeCase,
  menuId,
  basePath,
  workId,
  bbsCategoryId,
  bbsCategoryPolicy,
}) => {
  const detailPath = buildDetailPath(basePath, workId);

  // 상세키(workId)가 없으면 목록(basePath)으로 폴백
  if (!detailPath) {
    return {
      ...defaultResult,
      routeCase,
      bbsCategoryPolicy,
      menuId,
      basePath,
      path: basePath,
      isFallback: true,
      reason: 'WORK_ID_MISSING_FALLBACK_TO_BASE',
    };
  }

  const categoryAppliedResult = applyBbsCategoryPolicyToPath({
    detailPath,
    bbsCategoryId,
    bbsCategoryPolicy,
  });

  return {
    ...defaultResult,
    routeCase,
    bbsCategoryPolicy,
    bbsCategoryId: categoryAppliedResult.normalizedBbsCategoryId || null,
    bbsCategoryApplied: categoryAppliedResult.bbsCategoryApplied,
    menuId,
    basePath,
    path: categoryAppliedResult.path,
    isFallback: false,
    reason: categoryAppliedResult.bbsCategoryMissing
      ? 'BBS_CATEGORY_ID_REQUIRED_BUT_MISSING'
      : 'OK',
  };
};

/**
 * BOARD_LIST_TITLE_SEARCH 케이스 처리
 *
 * 대상:
 * - 게시판 목록 화면에서 상세 대신 "제목 검색"으로 랜딩해야 하는 케이스
 *
 * 규칙:
 * - parameter.title이 있으면 `searchType=TITLE&searchKeyword=<title>`을 붙인다.
 * - title이 비어 있으면 목록(basePath)으로 폴백한다.
 */
const resolveBoardListTitleSearchCase = ({
  defaultResult,
  routeCase,
  menuId,
  basePath,
  parameter,
}) => {
  const parameterTitle = normalizeParameterTitle(parameter);
  if (!parameterTitle) {
    return {
      ...defaultResult,
      routeCase,
      menuId,
      basePath,
      path: basePath,
      isFallback: true,
      reason: 'TITLE_MISSING_FALLBACK_TO_BASE',
    };
  }

  const pathWithSearchType = appendQueryParam(basePath, 'searchType', 'TITLE');
  const pathWithSearchKeyword = appendQueryParam(pathWithSearchType, 'searchKeyword', parameterTitle);

  return {
    ...defaultResult,
    routeCase,
    menuId,
    basePath,
    path: pathWithSearchKeyword,
    parameterTitle,
    isFallback: false,
    reason: 'OK',
  };
};

/**
 * BOARD_POST_DETAIL_WITH_BBS_NO 케이스 처리
 */
const resolveBoardPostDetailWithBbsNoCase = ({
  defaultResult,
  routeCase,
  menuId,
  basePath,
  workId,
  intgSrchRouteHintCd,
}) => {
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

  const boardBbsNoResult = resolveBoardPostDetailBbsNoByProvider({
    intgSrchRouteHintCd,
  });

  // bbsNo를 구하지 못하면 잘못된 상세 호출을 피하기 위해 목록으로 폴백
  if (!boardBbsNoResult.bbsNo) {
    return {
      ...defaultResult,
      routeCase,
      menuId,
      basePath,
      path: basePath,
      isFallback: true,
      reason: `${boardBbsNoResult.reason || 'BBS_NO_UNRESOLVED'}_FALLBACK_TO_BASE`,
    };
  }

  const pathWithBbsNo = appendQueryParam(detailPath, 'bbsNo', boardBbsNoResult.bbsNo);

  return {
    ...defaultResult,
    routeCase,
    menuId,
    basePath,
    path: pathWithBbsNo,
    bbsNo: boardBbsNoResult.bbsNo,
    isFallback: false,
    reason: boardBbsNoResult.reason || 'OK',
  };
};

/**
 * EXTERNAL_LINK_ONLY 케이스 처리
 */
const resolveExternalLinkOnlyCase = async ({
  defaultResult,
  routeCase,
  menuId,
  basePath,
  intgSrchRouteHintCd,
  workId,
  useCacheOnly,
}) => {
  // cache-only 모드에서는 네트워크 호출(provider)을 금지하고 목록으로 폴백한다.
  if (useCacheOnly) {
    return {
      ...defaultResult,
      routeCase,
      menuId,
      basePath,
      path: basePath,
      isFallback: true,
      reason: 'EXTERNAL_LINK_PROVIDER_SKIPPED_IN_CACHE_MODE_FALLBACK_TO_BASE',
    };
  }

  const externalLinkResult = await resolveExternalLinkByProvider({
    intgSrchRouteHintCd,
    workId,
  });

  if (externalLinkResult.externalUrl) {
    return {
      ...defaultResult,
      routeCase,
      navigationType: INTG_SEARCH_NAVIGATION_TYPE.EXTERNAL,
      menuId,
      basePath,
      path: null,
      externalUrl: externalLinkResult.externalUrl,
      isFallback: false,
      reason: externalLinkResult.reason || 'OK_EXTERNAL_LINK',
    };
  }

  return {
    ...defaultResult,
    routeCase,
    navigationType: INTG_SEARCH_NAVIGATION_TYPE.INTERNAL,
    menuId,
    basePath,
    path: basePath,
    externalUrl: null,
    isFallback: true,
    reason: `${externalLinkResult.reason || 'EXTERNAL_LINK_UNRESOLVED'}_FALLBACK_TO_BASE`,
  };
};

/**
 * 내부 전용 resolver
 * - 입력 받은 routeHintMap 기준으로 계산한다.
 * - basePath 계산은 내부 메뉴 store를 사용한다.
 */
const resolveIntegratedSearchRouteByMap = async ({
  intgSrchRouteHintCd,
  workId,
  bbsCategoryId,
  parameter,
  routeHintMap,
  useCacheOnly,
}) => {
  const defaultResult = createDefaultResolveResult({
    intgSrchRouteHintCd,
    workId,
    bbsCategoryId,
    parameter,
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
  const bbsCategoryPolicy = getIntegratedSearchBbsCategoryPolicy(intgSrchRouteHintCd);
  switch (routeCase) {
  case INTG_SEARCH_ROUTE_CASE.DETAIL_SIMPLE:
    return resolveDetailSimpleCase({
      defaultResult,
      routeCase,
      menuId,
      basePath,
      workId,
      bbsCategoryPolicy,
    });

  case INTG_SEARCH_ROUTE_CASE.BOARD_POST_DETAIL:
    return resolveBoardPostDetailCase({
      defaultResult,
      routeCase,
      menuId,
      basePath,
      workId,
      bbsCategoryId,
      bbsCategoryPolicy,
    });

  case INTG_SEARCH_ROUTE_CASE.BOARD_LIST_TITLE_SEARCH:
    return resolveBoardListTitleSearchCase({
      defaultResult,
      routeCase,
      menuId,
      basePath,
      parameter,
    });

  case INTG_SEARCH_ROUTE_CASE.BOARD_POST_DETAIL_WITH_BBS_NO:
    return resolveBoardPostDetailWithBbsNoCase({
      defaultResult,
      routeCase,
      menuId,
      basePath,
      workId,
      intgSrchRouteHintCd,
    });

  case INTG_SEARCH_ROUTE_CASE.EXTERNAL_LINK_ONLY:
    return resolveExternalLinkOnlyCase({
      defaultResult,
      routeCase,
      menuId,
      basePath,
      intgSrchRouteHintCd,
      workId,
      useCacheOnly,
    });

  // 아직 구현되지 않은 힌트코드는 목록(basePath)으로 폴백
  default:
    return {
      ...defaultResult,
      routeCase,
      bbsCategoryPolicy,
      menuId,
      basePath,
      path: basePath,
      isFallback: true,
      reason: 'ROUTE_CASE_NOT_SUPPORTED_FALLBACK_TO_BASE',
    };
  }
};
