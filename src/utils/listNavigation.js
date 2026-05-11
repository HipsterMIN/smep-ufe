/**
 * 목록 화면의 검색조건을 상세 화면까지 전달하고, 다시 목록으로 돌아올 때
 * 동일한 조건을 복원하기 위한 공통 유틸입니다.
 *
 * 의도:
 * - 목록마다 검색조건 state 구조는 다르지만, 최종적으로 URL query에 담기는 값은
 *   React Router의 location/searchParams로 공통 처리할 수 있습니다.
 * - 목록 화면은 현재 검색조건을 URL query로 동기화하고, 상세 이동 시 이 query를
 *   상세 경로에 붙이면 새로고침 후에도 목록 복귀 조건이 유지됩니다.
 *
 * 사용 흐름:
 * - 목록 화면: getSearchParam/getNumberSearchParam으로 최초 state를 복원합니다.
 * - 목록 화면: 검색/필터/페이지 변경 시 setQueryParam으로 query를 만들고
 *   setSearchParams(..., { replace: true })로 URL을 갱신합니다.
 * - 목록 -> 상세: appendListSearchToPath(detailPath, currentQuery)를 사용합니다.
 * - 상세 -> 목록: resolveListBackPath(location) 결과를 navigate에 전달합니다.
 * - 다른 메뉴 목록 -> 공통 상세: appendReturnUrlToPath(detailPath, location)을 사용합니다.
 *
 * 주의:
 * - page 값은 화면별 Pagination 기준을 맞춰야 합니다. 현재 공통 Pagination은
 *   URL query의 page를 1부터 시작하는 값으로 다룹니다.
 * - 민감정보나 서버 내부 판단값은 query에 넣지 않습니다. 검색조건, 탭, 정렬,
 *   페이지 크기처럼 사용자가 화면에서 직접 선택한 값만 넣어야 합니다.
 */

export const RETURN_URL_PARAM = 'returnUrl';

/**
 * 의도:
 * - URLSearchParams는 빈 문자열 또는 '?'가 섞여 들어오면 화면마다 처리 결과가
 *   달라질 수 있어, 모든 query 입력을 동일한 형식으로 정규화합니다.
 *
 * 동작:
 * - 빈 값과 '?'는 빈 문자열로 돌려줍니다.
 * - '?' 없이 들어온 query 문자열은 앞에 '?'를 붙입니다.
 *
 * 주의:
 * - pathname이 포함된 전체 URL을 넣는 함수가 아닙니다. location.search 또는
 *   URLSearchParams.toString() 결과처럼 query 부분만 넣어야 합니다.
 */
const toSearchString = (search = '') => {
  const value = String(search || '').trim();
  if (!value || value === '?') return '';
  return value.startsWith('?') ? value : `?${value}`;
};

/**
 * 의도:
 * - 상세 경로에 목록 query를 붙일 때, 기존 경로가 query/hash를 이미 갖고 있어도
 *   안전하게 병합하기 위해 경로를 세 부분으로 나눕니다.
 *
 * 동작:
 * - 'path?foo=1#section' 형태를 pathname, query, hash로 분리합니다.
 *
 * 주의:
 * - 브라우저 절대 URL 전체를 파싱하는 용도는 아닙니다. React Router navigate에
 *   전달할 내부 경로 조합을 위한 최소 파서입니다.
 */
const splitPath = (path) => {
  const value = String(path || '');
  const hashIndex = value.indexOf('#');
  const withoutHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const hash = hashIndex >= 0 ? value.slice(hashIndex) : '';
  const queryIndex = withoutHash.indexOf('?');

  if (queryIndex < 0) {
    return { pathname: withoutHash, query: '', hash };
  }

  return {
    pathname: withoutHash.slice(0, queryIndex),
    query: withoutHash.slice(queryIndex + 1),
    hash,
  };
};

/**
 * 의도:
 * - splitPath로 분리한 경로를 다시 React Router가 이동할 수 있는 문자열로 만듭니다.
 *
 * 동작:
 * - URLSearchParams가 비어 있으면 '?'를 붙이지 않습니다.
 * - hash가 있으면 query 뒤에 유지합니다.
 *
 * 주의:
 * - params는 URLSearchParams 인스턴스라고 가정합니다. 일반 객체를 넘기지 않습니다.
 */
const toPath = (pathname, params, hash = '') => {
  const queryString = params.toString();
  return `${pathname}${queryString ? `?${queryString}` : ''}${hash}`;
};

/**
 * 의도:
 * - 목록 화면 최초 진입 시 URL query에서 문자열 검색조건을 복원하기 위한 helper입니다.
 *
 * 동작:
 * - key에 해당하는 값이 있으면 그대로 반환하고, 없으면 fallback을 반환합니다.
 *
 * 주의:
 * - 빈 문자열도 사용자가 의도한 값일 수 있으므로 null/undefined일 때만 fallback을
 *   사용합니다. 숫자 변환이 필요하면 getNumberSearchParam을 사용합니다.
 */
export const getSearchParam = (search, key, fallback = '') => {
  const value = new URLSearchParams(toSearchString(search)).get(key);
  return value == null ? fallback : value;
};

/**
 * 의도:
 * - page, size, tab index처럼 숫자로 관리되는 검색조건을 URL query에서 안전하게
 *   복원하기 위한 helper입니다.
 *
 * 동작:
 * - parseInt 결과가 유효한 숫자이면 해당 숫자를 반환하고, 아니면 fallback을 반환합니다.
 *
 * 주의:
 * - 0도 유효한 값으로 처리됩니다. 다만 공통 Pagination의 page query는 1부터
 *   시작하므로, 내부 state가 0부터 시작하는 화면은 호출부에서 -1 보정이 필요합니다.
 */
export const getNumberSearchParam = (search, key, fallback) => {
  const value = Number.parseInt(getSearchParam(search, key, ''), 10);
  return Number.isFinite(value) ? value : fallback;
};

/**
 * 의도:
 * - 상세 화면에서 목록으로 돌아갈 때, 현재 상세 URL에 붙은 목록 검색조건만 골라
 *   목록 URL에 다시 붙이기 위한 helper입니다.
 *
 * 동작:
 * - search를 URLSearchParams로 변환합니다.
 * - returnUrl은 교차 메뉴 복귀용 값이므로 일반 목록 query에서는 제거합니다.
 * - 화면별로 제외해야 하는 임시 상세 query가 있으면 excludeKeys로 제거합니다.
 *
 * 주의:
 * - 목록 검색조건이 아닌 값이 상세 URL에 함께 붙어 있다면 호출부에서 excludeKeys에
 *   추가해야 합니다. 예: 정책금융 상세의 srchText/reSrchText.
 */
export const getListSearchParams = (search, excludeKeys = []) => {
  const params = new URLSearchParams(toSearchString(search));
  const blockedKeys = new Set([RETURN_URL_PARAM, ...excludeKeys]);
  blockedKeys.forEach((key) => params.delete(key));
  return params;
};

/**
 * 의도:
 * - 목록에서 상세로 이동할 때 현재 검색조건 query를 상세 경로에 붙입니다.
 *
 * 동작:
 * - path가 이미 query를 갖고 있으면 기존 query와 목록 query를 병합합니다.
 * - 같은 key가 있으면 목록 query 값으로 덮어씁니다.
 * - hash가 있는 경로도 유지합니다.
 *
 * 사용 예:
 * - appendListSearchToPath(`${id}`, location.search)
 * - appendListSearchToPath(`${id}`, buildListSearchParams().toString())
 *
 * 주의:
 * - location.search는 React 렌더 타이밍에 따라 최신 state보다 늦을 수 있습니다.
 *   검색 직후 즉시 상세 링크를 렌더해야 하는 화면은 현재 state로 만든
 *   buildListSearchParams().toString()을 넘기는 편이 안전합니다.
 */
export const appendListSearchToPath = (path, search, options = {}) => {
  const { excludeKeys = [] } = options;
  const { pathname, query, hash } = splitPath(path);
  const params = new URLSearchParams(query);
  const listParams = getListSearchParams(search, excludeKeys);

  listParams.forEach((value, key) => {
    params.set(key, value);
  });

  return toPath(pathname, params, hash);
};

/**
 * 의도:
 * - returnUrl은 다른 메뉴 목록에서 공고/정책금융 같은 공통 상세로 이동한 뒤
 *   원래 목록으로 되돌아가기 위한 값입니다. 이 값은 navigate에 그대로 쓰면
 *   open redirect 성격의 문제가 생길 수 있어 내부 경로만 허용합니다.
 *
 * 동작:
 * - '/'로 시작하고 '//'로 시작하지 않는 경로만 허용합니다.
 * - 더미 origin을 붙여 URL 파싱 후 같은 origin인지 확인합니다.
 *
 * 주의:
 * - 외부 URL, 프로토콜 상대 URL, 잘못된 URL은 모두 거부합니다.
 * - basename('/home-dev') 포함 여부는 React Router가 처리하므로 여기서는 내부
 *   pathname/search/hash 형태인지에만 집중합니다.
 */
const isSafeInternalReturnUrl = (value) => {
  const url = String(value || '').trim();
  if (!url || !url.startsWith('/') || url.startsWith('//')) return false;

  try {
    const parsed = new URL(url, 'http://smes.local');
    return parsed.origin === 'http://smes.local';
  } catch {
    return false;
  }
};

/**
 * 의도:
 * - 마이비즈니스 같은 목록 화면에서 다른 메뉴 상세로 이동하기 전, 현재 목록 위치와
 *   검색조건을 returnUrl 값으로 저장하기 위해 사용합니다.
 *
 * 동작:
 * - React Router location의 pathname, search, hash를 하나의 내부 경로로 조합합니다.
 *
 * 주의:
 * - location이 없거나 pathname이 비어 있으면 빈 문자열을 반환합니다.
 */
export const buildCurrentReturnUrl = (location) => {
  if (!location?.pathname) return '';
  return `${location.pathname || ''}${location.search || ''}${location.hash || ''}`;
};

/**
 * 의도:
 * - 현재 화면이 아닌 다른 메뉴의 상세로 이동할 때, 상세의 목록 버튼이 원래 목록으로
 *   돌아올 수 있도록 returnUrl query를 붙입니다.
 *
 * 동작:
 * - 현재 location을 buildCurrentReturnUrl로 문자열화합니다.
 * - path의 기존 query와 병합하여 returnUrl을 추가합니다.
 *
 * 사용 예:
 * - appendReturnUrlToPath(`/req/pbanc/${id}`, location)
 *
 * 주의:
 * - 같은 목록의 상세로 이동할 때는 returnUrl이 아니라 appendListSearchToPath를
 *   우선 사용합니다. returnUrl은 교차 메뉴 상세 이동용입니다.
 */
export const appendReturnUrlToPath = (path, location) => {
  const returnUrl = buildCurrentReturnUrl(location);
  if (!returnUrl) return path;

  const { pathname, query, hash } = splitPath(path);
  const params = new URLSearchParams(query);
  params.set(RETURN_URL_PARAM, returnUrl);
  return toPath(pathname, params, hash);
};

/**
 * 의도:
 * - 상세 화면의 "목록" 버튼에서 검색조건을 유지한 목록 경로를 계산합니다.
 * - 교차 메뉴 이동으로 들어온 상세라면 returnUrl을 우선 사용하고, 일반 상세라면
 *   현재 상세 URL의 query를 부모 목록 경로에 붙입니다.
 *
 * 동작:
 * - returnUrl이 안전한 내부 경로이면 해당 경로를 그대로 반환합니다.
 * - returnUrl이 없거나 안전하지 않으면 fallbackPath에 목록 query를 붙여 반환합니다.
 * - excludeKeys로 상세 전용 query를 제거할 수 있습니다.
 *
 * 사용 예:
 * - navigate(resolveListBackPath(location))
 * - navigate(resolveListBackPath(location, '..', { excludeKeys: ['srchText'] }))
 *
 * 주의:
 * - returnUrl을 검증 없이 navigate에 넘기면 외부 이동이나 의도하지 않은 내부 경로
 *   이동이 가능해질 수 있습니다. 반드시 이 함수의 검증 결과를 사용합니다.
 * - fallbackPath는 보통 '..'를 사용하지만, 라우트 구조가 특수한 화면은 명시 경로를
 *   넘겨야 합니다.
 */
export const resolveListBackPath = (location, fallbackPath = '..', options = {}) => {
  const { excludeKeys = [] } = options;
  const search = location?.search || '';
  const params = new URLSearchParams(toSearchString(search));
  const returnUrl = params.get(RETURN_URL_PARAM);

  if (isSafeInternalReturnUrl(returnUrl)) {
    return returnUrl;
  }

  const listParams = getListSearchParams(search, excludeKeys);
  const queryString = listParams.toString();
  return `${fallbackPath}${queryString ? `?${queryString}` : ''}`;
};

/**
 * 의도:
 * - 목록 query를 만들 때 기본값과 빈 값을 URL에서 제거하여 주소가 불필요하게
 *   길어지지 않도록 합니다.
 *
 * 동작:
 * - value가 비어 있거나 defaultValue와 같으면 params에서 key를 삭제합니다.
 * - 그 외 값은 문자열로 변환해 params에 저장합니다.
 *
 * 사용 예:
 * - setQueryParam(params, 'page', currentPage, 1)
 * - setQueryParam(params, 'searchKeyword', appliedKeyword)
 *
 * 주의:
 * - 배열/객체는 자동 직렬화하지 않습니다. 다중 선택값은 호출부에서
 *   selectedCodes.join(',')처럼 명시적으로 문자열화한 뒤 전달합니다.
 */
export const setQueryParam = (params, key, value, defaultValue = '') => {
  const normalized = value == null ? '' : String(value).trim();
  const defaultText = defaultValue == null ? '' : String(defaultValue).trim();

  if (!normalized || normalized === defaultText) {
    params.delete(key);
    return;
  }

  params.set(key, normalized);
};
