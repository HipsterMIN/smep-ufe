import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMenuStore } from '@/store/useMenuStore.js';
import { buildFullPath } from '@/utils/menuUtils.js';

/**
 * 통합검색 결과 카드 전용 Breadcrumb 컴포넌트
 *
 * 왜 별도 컴포넌트를 두는가?
 * - 일반 페이지용 Breadcrumb와 달리 "홈"을 강제 노출하지 않는다.
 * - 검색 결과 데이터에서 받은 메뉴 ID(depth1/2/3)만으로 경로를 복원한다.
 * - 카드 단위에서 재사용하기 위해 margin class, aria-label, id를 외부에서 제어할 수 있게 한다.
 *
 * 렌더링 규칙:
 * 1) depth1MenuId, depth2MenuId는 사실상 필수 입력으로 취급한다.
 * 2) depth3MenuId는 선택이며, 값이 없으면 2단계 breadcrumb만 렌더링한다.
 * 3) 전달된 메뉴 ID가 flatMenuMap에 없으면 해당 항목은 자동 제외한다.
 * 4) 최종 items가 0개면 불완전 breadcrumb를 보여주지 않고 null 반환한다.
 *
 * 데이터 소스:
 * - useMenuStore.flatMenuMap(menuId -> menuNode)에서 메뉴명(menuNm)과 노드를 조회한다.
 * - buildFullPath(menuNode, flatMenuMap)으로 각 breadcrumb 링크를 계산한다.
 *
 * 안전장치:
 * - flatMenuMap이 비어 있을 때 fetchMenuData를 1회 호출해 복구를 시도한다.
 * - fetch 함수가 없거나 menuIds 자체가 비어 있으면 불필요 호출을 하지 않는다.
 *
 * @typedef {Object} ResultMenuBreadcrumbProps
 * @property {string} depth1MenuId
 * depth 1 메뉴 ID. 예: `M_PIIO_00065`
 * - 일반적으로 대메뉴(1뎁스) ID를 전달한다.
 * - 빈 문자열/공백이면 무시되며 breadcrumb 첫 단계가 사라질 수 있다.
 *
 * @property {string} depth2MenuId
 * depth 2 메뉴 ID. 예: `M_PIIO_00081`
 * - 일반적으로 중메뉴(2뎁스) ID를 전달한다.
 * - depth1과 함께 카드 경로의 핵심 축을 구성한다.
 *
 * @property {string | undefined} [depth3MenuId]
 * depth 3 메뉴 ID(선택). 예: `M_PIIO_00084`
 * - 상세 분류가 필요한 케이스에서만 전달한다.
 * - 값이 없으면 2단계 breadcrumb만 표시된다.
 *
 * @property {string} [className='mb-0']
 * `<nav className="krds-breadcrumb-wrap ...">` 뒤에 추가될 클래스 문자열.
 * - 카드 하단 여백 조절 등 레이아웃 목적의 스타일 훅으로 사용한다.
 *
 * @property {string} [ariaLabel='현재 경로']
 * 접근성용 `aria-label` 값.
 * - 화면리더에서 breadcrumb의 의미를 전달한다.
 *
 * @property {string | undefined} [id]
 * `<nav>`의 id 속성.
 * - 카드 리스트처럼 동일 컴포넌트가 여러 번 렌더링되는 경우 중복 id를 피해야 한다.
 */
const ResultMenuBreadcrumb = ({
  depth1MenuId,
  depth2MenuId,
  depth3MenuId,
  className = 'mb-0',
  ariaLabel = '현재 경로',
  id,
}) => {
  const flatMenuMap = useMenuStore((state) => state.flatMenuMap);
  const fetchMenuData = useMenuStore((state) => state.fetchMenuData);

  /**
   * 입력된 메뉴 ID를 "표시 순서(depth1 -> depth2 -> depth3)" 그대로 정리한다.
   *
   * 처리 규칙:
   * - null/undefined/공백 문자열은 제거한다.
   * - 남은 값만 배열로 유지해 이후 map 단계에서 순서대로 breadcrumb를 만든다.
   */
  const menuIds = useMemo(() => {
    return [depth1MenuId, depth2MenuId, depth3MenuId].filter((value) => Boolean(String(value ?? '').trim()));
  }, [depth1MenuId, depth2MenuId, depth3MenuId]);

  /**
   * 메뉴맵 자동 복구 effect
   *
   * 의도:
   * - 결과 카드에서 바로 breadcrumb를 계산해야 하는데,
   *   앱 초기 시점엔 flatMenuMap이 아직 비어 있을 수 있다.
   * - 이 경우 1회 fetch를 시도해 다음 렌더에서 정상 링크를 계산할 수 있게 한다.
   */
  useEffect(() => {
    const hasFlatMenuMap = Boolean(flatMenuMap && Object.keys(flatMenuMap).length > 0);
    if (hasFlatMenuMap || menuIds.length === 0 || typeof fetchMenuData !== 'function') {
      return;
    }
    fetchMenuData();
  }, [flatMenuMap, fetchMenuData, menuIds.length]);

  /**
   * 렌더링용 breadcrumb item 계산
   *
   * 산출 구조:
   * - { menuId, label, link }
   *
   * 세부 동작:
   * - menuId별로 flatMenuMap에서 노드를 찾는다.
   * - 노드가 존재하면 menuNm을 label로 사용한다.
   * - buildFullPath로 링크를 계산한다.
   * - 중간에 찾지 못한 menuId는 null로 반환 후 filter(Boolean)로 제거한다.
   */
  const items = useMemo(() => {
    if (!flatMenuMap || Object.keys(flatMenuMap).length === 0) {
      return [];
    }

    return menuIds
      .map((menuId) => {
        const menuNode = flatMenuMap[menuId];
        if (!menuNode) {
          return null;
        }
        return {
          menuId,
          label: menuNode.menuNm,
          link: buildFullPath(menuNode, flatMenuMap),
        };
      })
      .filter(Boolean);
  }, [flatMenuMap, menuIds]);

  /**
   * 메뉴를 1개도 복원하지 못한 경우:
   * - 잘못된 breadcrumb UI를 억지로 노출하지 않고 렌더를 생략한다.
   */
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={`krds-breadcrumb-wrap ${className}`.trim()} aria-label={ariaLabel} id={id}>
      <ol className="breadcrumb">
        {items.map((item) => (
          <li key={item.menuId}>
            <Link className="txt" to={item.link || '/'}>
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default ResultMenuBreadcrumb;
