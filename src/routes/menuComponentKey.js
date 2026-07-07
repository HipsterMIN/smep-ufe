/**
 * 메뉴 노드에서 React 컴포넌트 매핑에 사용할 key를 계산한다.
 *
 * 의도:
 * - 개발/운영 DB의 menuId가 달라도 화면 컴포넌트 연결이 깨지지 않도록
 *   DB에서 관리하는 scrnLnkgCd를 우선 사용한다.
 *
 * 동작:
 * - scrnLnkgCd가 문자열이고 trim 후 값이 있으면 그 값을 component key로 반환한다.
 * - scrnLnkgCd가 비어 있거나 과거 mock/API 캐시처럼 내려오지 않으면 기존 menuId를 반환한다.
 *
 * 주의:
 * - 이 값은 컴포넌트 선택 전용이며 메뉴 PK, 권한, breadcrumb, 게시판 bbsNo,
 *   통계 식별값, 부모-자식 관계를 바꾸는 용도로 사용하면 안 된다.
 */
const normalizeComponentKey = value => {
  if (typeof value !== 'string') return null;

  const trimmedValue = value.trim();
  return trimmedValue || null;
};

export const getMenuComponentKey = menuNode => {
  return normalizeComponentKey(menuNode?.scrnLnkgCd) ?? menuNode?.menuId;
};

