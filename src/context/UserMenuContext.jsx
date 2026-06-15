// context/UserMenuContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useMenuStore } from '../store/useMenuStore';
import { buildFullPath } from '../utils/menuUtils';
import routeChildrenMeta from '../routes/routeChildrenMeta';

/**
 * =============================================================================
 * UserMenuContext
 * =============================================================================
 *
 * 역할:
 * - 백엔드에서 받아온 메뉴 트리 데이터를 전역으로 관리
 * - 현재 URL에 맞는 메뉴 정보 자동 감지
 * - 메뉴 조회, Breadcrumb 생성 등의 유틸리티 제공
 *
 * 데이터 흐름:
 * 1. useMenuStore에서 메뉴 트리 조회 (/api/v1/menu)
 * 2. Context에서 유틸리티 함수 제공
 * 3. 각 컴포넌트에서 useUserMenu() 훅으로 메뉴 정보 사용
 */
const UserMenuContext = createContext();

/**
 * =============================================================================
 * UserMenuProvider 컴포넌트
 * =============================================================================
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Provider로 감싸질 자식 컴포넌트들
 *
 * 사용법:
 * <UserMenuProvider>
 *   <App />
 * </UserMenuProvider>
 */
export function UserMenuProvider({ children }) {
  // --------------------------------------------------------------------------
  // 1. React Router의 현재 위치 정보
  // --------------------------------------------------------------------------
  /**
   * location 객체 구조:
   * {
   *   pathname: "/mb/dash/UI_USR_L_480",  // 현재 URL 경로
   *   search: "?id=123",                   // 쿼리 스트링
   *   hash: "#section",                    // 해시
   *   state: {}                            // 라우터 state
   * }
   */
  const location = useLocation();

  // --------------------------------------------------------------------------
  // 2. Zustand Store에서 메뉴 데이터 가져오기
  // --------------------------------------------------------------------------
  /**
   * menuTree: 백엔드에서 받아온 메뉴 트리 원본
   * flatMenuMap: menuId를 key로 하는 flat map (빠른 조회용)
   * isLoading: 메뉴 API 호출 중인지 여부
   * error: API 호출 실패 시 에러 메시지
   * fetchMenuData: 메뉴 데이터 가져오기 함수
   */
  const { menuTree, flatMenuMap, isLoading, error, fetchMenuData } = useMenuStore();

  // --------------------------------------------------------------------------
  // 3. 초기화: 컴포넌트 마운트 시 메뉴 데이터 로드
  // --------------------------------------------------------------------------
  /**
   * 의존성 배열: [menuTree, fetchMenuData]
   * - menuTree가 없으면 fetchMenuData 호출
   * - 실질적으로 컴포넌트 마운트 시 1회만 실행
   */
  useEffect(() => {
    if (!menuTree) {
      fetchMenuData();
    }
  }, [menuTree, fetchMenuData]);

  // ==========================================================================
  // 핵심 함수들
  // ==========================================================================

  /**
   * ---------------------------------------------------------------------------
   * flattenMenu: 트리 구조를 평평한 배열로 변환 (재귀)
   * ---------------------------------------------------------------------------
   *
   * @param {Object} node - 메뉴 트리의 노드
   * @param {Array} result - 결과 배열 (재귀용, 처음 호출 시 빈 배열)
   *
   * @returns {Array} 모든 메뉴 노드를 담은 배열
   *
   * 변환 예시:
   *
   * Input (트리):
   * {
   *   menuId: "M1",
   *   scrnUrlAddr: "mb",
   *   children: [
   *     { menuId: "M2", scrnUrlAddr: "dash", children: [] }
   *   ]
   * }
   *
   * Output (배열):
   * [
   *   { menuId: "M1", scrnUrlAddr: "mb", ... },
   *   { menuId: "M2", scrnUrlAddr: "dash", ... }
   * ]
   *
   * 용도:
   * - 특정 menuId나 경로로 메뉴 검색 시
   * - 전체 메뉴 순회가 필요할 때
   */
  const flattenMenu = useCallback((node, result = []) => {
    // null 체크
    if (!node) return result;

    // 현재 노드를 결과 배열에 추가
    result.push(node);

    // 자식 노드가 있으면 재귀 호출
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        flattenMenu(child, result);
      });
    }

    return result;
  }, []);

  /**
   * 동적 라우트 패턴 매칭
   */
  const matchDynamicRoute = useCallback((pattern, pathname) => {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return false;

    return patternParts.every((part, i) => {
      if (part.startsWith(':')) return true;
      return part === pathParts[i];
    });
  }, []);

  /**
   * ---------------------------------------------------------------------------
   * findMenuByPath: URL 경로로 메뉴 찾기
   * ---------------------------------------------------------------------------
   *
   * @param {string} pathname - URL 경로 (예: "/req/pbanc/pbanc")
   *
   * @returns {Object|null} 매칭되는 메뉴 객체 또는 null
   *
   * 반환 객체 구조:
   * {
   *   menuId: "M_PIIO_00076",
   *   menuNm: "사업공고",
   *   scrnUrlAddr: "pbanc",
   *   scrnTypeCd: "T",
   *   depth: 3,
   *   ...
   * }
   *
   * 매칭 로직:
   * - flatMenuMap의 모든 노드를 순회하며 buildFullPath로 생성한 경로와 비교
   * - 정확히 일치하는 경로를 찾으면 해당 메뉴 객체 반환
   *
   * 예시:
   * findMenuByPath("/req/pbanc/pbanc")
   * → { menuId: "M_PIIO_00076", menuNm: "사업공고", ... }
   *
   * findMenuByPath("/nonexistent")
   * → null
   */
  const findMenuByPath = useCallback((pathname) => {
    // menuTree나 flatMenuMap이 없으면 null
    if (!menuTree || !flatMenuMap) return null;

    // 1. flatMenuMap을 순회하며 경로가 일치하는 노드 찾기 (완전일치)
    for (const menuId in flatMenuMap) {
      const node = flatMenuMap[menuId];
      const nodePath = buildFullPath(node, flatMenuMap);

      if (nodePath === pathname) {
        return node;
      }
    }

    // 2. 동적 라우트 패턴 매칭
    for (const menuId in flatMenuMap) {
      const node = flatMenuMap[menuId];
      const nodePath = buildFullPath(node, flatMenuMap);
      const componentConfig = routeChildrenMeta[menuId];

      if (componentConfig?.children) {
        for (const child of componentConfig.children) {
          const childPath = `${nodePath}/${child.path}`;

          if (matchDynamicRoute(childPath, pathname)) {
            return node;
          }
        }
      }
    }

    return null;
  }, [menuTree, flatMenuMap, matchDynamicRoute]);

  /**
   * ---------------------------------------------------------------------------
   * currentMenu: 현재 URL에 해당하는 메뉴 (자동 계산)
   * ---------------------------------------------------------------------------
   *
   * 특징:
   * - useMemo로 캐싱 (location.pathname이 바뀔 때만 재계산)
   * - 페이지 이동할 때마다 자동으로 업데이트됨
   *
   * 반환값:
   * - Object: 현재 페이지의 메뉴 정보
   * - null: 매칭되는 메뉴 없음 (404 상황)
   *
   * 사용 예시:
   * const { currentMenu } = useUserMenu();
   * if (currentMenu) {
   *   console.log(`현재 페이지: ${currentMenu.menuNm}`);
   * }
   */
  const currentMenu = useMemo(() => {
    return findMenuByPath(location.pathname);
  }, [location.pathname, findMenuByPath]);

  /**
   * ---------------------------------------------------------------------------
   * findMenuById: menuId로 메뉴 찾기
   * ---------------------------------------------------------------------------
   *
   * @param {string} menuId - 메뉴 고유 ID (예: "M_PIIO_00112")
   *
   * @returns {Object|null} 매칭되는 메뉴 객체 또는 null
   *
   * 용도:
   * - 컴포넌트 레지스트리에서 menuId로 메뉴 정보 조회
   * - 메뉴 간 관계 파악 (부모/자식 찾기)
   *
   * 예시:
   * findMenuById("M_PIIO_00112")
   * → { menuId: "M_PIIO_00112", menuNm: "AI맞춤추천공고", ... }
   *
   * findMenuById("INVALID_ID")
   * → null
   */
  const findMenuById = useCallback((menuId) => {
    return flatMenuMap[menuId] || null;
  }, [flatMenuMap]);

  /**
   * ---------------------------------------------------------------------------
   * getMenuByName: 메뉴명으로 메뉴 찾기
   * ---------------------------------------------------------------------------
   *
   * @param {string} menuName - 메뉴 이름 (예: "AI맞춤추천공고")
   *
   * @returns {Object|null} 매칭되는 메뉴 객체 또는 null
   *
   * 주의:
   * - 동일한 이름의 메뉴가 여러 개면 첫 번째만 반환
   * - 가급적 menuId로 찾는 것이 정확함
   *
   * 예시:
   * getMenuByName("AI맞춤추천공고")
   * → { menuId: "M_PIIO_00112", ... }
   */
  const getMenuByName = useCallback((menuName) => {
    if (!menuTree) return null;

    const allMenus = flattenMenu(menuTree);
    return allMenus.find(menu => menu.menuNm === menuName) || null;
  }, [menuTree, flattenMenu]);

  /**
   * ---------------------------------------------------------------------------
   * getAllMenus: 1depth 메뉴 목록 반환 (GNB용)
   * ---------------------------------------------------------------------------
   *
   * @returns {Array} 1depth 메뉴 배열
   *
   * 반환 배열 구조:
   * [
   *   {
   *     menuId: "M_PIIO_00068",
   *     name: "마이비즈니스",
   *     title: "마이비즈니스",
   *     link: "/mb",
   *     scrnTypeCd: "M"
   *   },
   *   ...
   * ]
   *
   * 용도:
   * - 헤더 GNB (Global Navigation Bar) 렌더링
   * - 최상위 메뉴 목록 표시
   *
   * 예시:
   * const { getAllMenus } = useUserMenu();
   * const gnbMenus = getAllMenus();
   *
   * gnbMenus.map(menu => (
   *   <a href={menu.link}>{menu.title}</a>
   * ))
   */
  const getAllMenus = useCallback(() => {
    // menuTree가 없거나 children이 없으면 빈 배열
    if (!menuTree || !menuTree.children) return [];

    // 1depth 메뉴들을 표준 형식으로 변환
    return menuTree.children.map(menu => ({
      menuId: menu.menuId,
      name: menu.menuNm,
      title: menu.menuNm,              // name과 동일 (호환성)
      link: buildFullPath(menu, flatMenuMap),
      scrnTypeCd: menu.scrnTypeCd,
    }));
  }, [menuTree, flatMenuMap]);

  /**
   * ---------------------------------------------------------------------------
   * getBreadcrumbItems: Breadcrumb 데이터 생성
   * ---------------------------------------------------------------------------
   *
   * @param {string} menuId - 메뉴 ID (선택사항, 없으면 currentMenu 사용)
   *
   * @returns {Array} Breadcrumb 배열 (부모 → 자식 순서)
   *
   * 반환 배열 구조:
   * [
   *   { label: "신청·발급", link: "/req", menuId: "M_PIIO_00064" },
   *   { label: "사업공고", link: "/req/pbanc", menuId: "M_PIIO_00071" },
   *   { label: "사업공고", link: "/req/pbanc/pbanc", menuId: "M_PIIO_00076" }
   * ]
   *
   * 알고리즘:
   * 1. 대상 메뉴부터 시작 (menuId가 있으면 해당 메뉴, 없으면 currentMenu)
   * 2. 현재 노드부터 루트까지 거슬러 올라가며 경로 수집
   * 3. depth가 0보다 큰 노드만 수집
   * 4. 결과를 역순으로 정렬 (최상위 → 현재 순)
   *
   * 사용 예시:
   * const { getBreadcrumbItems } = useUserMenu();
   * const items = getBreadcrumbItems();
   *
   * <nav>
   *   {items.map((item, i) => (
   *     <span key={item.menuId}>
   *       {i > 0 && ' > '}
   *       <a href={item.link}>{item.label}</a>
   *     </span>
   *   ))}
   * </nav>
   */
  const getBreadcrumbItems = useCallback((menuId) => {
    const targetMenu = menuId ? flatMenuMap[menuId] : currentMenu;
    if (!targetMenu || !flatMenuMap) return [];

    const items = [];
    let currentNode = targetMenu;

    // 현재 노드부터 루트까지 거슬러 올라가며 수집
    while (currentNode) {
      // depth 0은 제외
      if (currentNode.depth > 0) {
        items.unshift({
          label: currentNode.menuNm,
          link: buildFullPath(currentNode, flatMenuMap),
          menuId: currentNode.menuId,
        });
      }

      // 부모로 이동
      currentNode = currentNode.upMenuId
        ? flatMenuMap[currentNode.upMenuId]
        : null;
    }
    return items;
  }, [currentMenu, flatMenuMap]);

  /**
   * ---------------------------------------------------------------------------
   * getSideNavigationData: SideNavigation 컴포넌트용 데이터 생성
   * ---------------------------------------------------------------------------
   *
   * @param {string} menuId - 현재 메뉴 ID (선택사항, 없으면 currentMenu 사용)
   *
   * @returns {Array} SideNavigation에서 사용할 메뉴 구조
   *
   * 반환 배열 구조:
   * [
   *   {
   *     menuId: "M_PIIO_00069",
   *     menuNm: "AI 스마트 검색",
   *     link: "/req/ai",
   *     scrnTypeCd: "M",
   *     children: [
   *       {
   *         menuId: "M_PIIO_00074",
   *         menuNm: "AI 스마트 검색",
   *         link: "/req/ai/ai-smart-search",
   *         scrnTypeCd: "T"
   *       }
   *     ]
   *   },
   *   ...
   * ]
   *
   * 알고리즘:
   * 1. 현재 메뉴가 속한 depth1 노드 찾기
   * 2. depth1의 모든 children(depth2)를 순회
   * 3. 각 depth2의 children(depth3)도 포함
   *
   * 용도:
   * - 좌측 사이드바 네비게이션 렌더링
   * - 현재 속한 depth1의 전체 메뉴 구조 표시
   *
   * 사용 예시:
   * const { getSideNavigationData } = useUserMenu();
   * const sideMenus = getSideNavigationData();
   */
  const getSideNavigationData = useCallback((menuId) => {

    const targetMenu = menuId ? flatMenuMap[menuId] : currentMenu;
    if (!targetMenu || !flatMenuMap) return [];

    // 현재 메뉴가 속한 depth1 찾기
    let depth1Node = null;
    let currentNode = targetMenu;

    while (currentNode) {
      if (currentNode.depth === 1) {
        depth1Node = currentNode;
        break;
      }
      currentNode = currentNode.upMenuId
        ? flatMenuMap[currentNode.upMenuId]
        : null;
    }

    if (!depth1Node || !depth1Node.children) return [];

    // depth1의 children(depth2)을 변환
    return depth1Node.children
      .filter(depth2Node => depth2Node.lfsdMenuExpsrYn === 'Y')  // ✅ depth2 필터링
      .map(depth2Node => ({
        menuId: depth2Node.menuId,
        menuNm: depth2Node.menuNm,
        link: buildFullPath(depth2Node, flatMenuMap),
        scrnTypeCd: depth2Node.scrnTypeCd,
        children: depth2Node.children
          ? depth2Node.children
            .filter(depth3Node => depth3Node.lfsdMenuExpsrYn === 'Y')  // ✅ depth3 필터링
            .map(depth3Node => ({
              menuId: depth3Node.menuId,
              menuNm: depth3Node.menuNm,
              link: buildFullPath(depth3Node, flatMenuMap),
              scrnTypeCd: depth3Node.scrnTypeCd,
            }))
          : [],
      }));
  }, [currentMenu, flatMenuMap]);

  /**
   * 현재 메뉴의 depth1 부모 찾기
   */
  const getDepth1Parent = useCallback((menuId) => {
    const targetMenu = menuId ? flatMenuMap[menuId] : currentMenu;
    if (!targetMenu) return null;

    let currentNode = targetMenu;
    while (currentNode) {
      if (currentNode.depth === 1) return currentNode;
      currentNode = currentNode.upMenuId ? flatMenuMap[currentNode.upMenuId] : null;
    }
    return null;
  }, [currentMenu, flatMenuMap]);


  /**
   * ---------------------------------------------------------------------------
   * getHeaderMenus: Header용 depth1 메뉴 목록
   * ---------------------------------------------------------------------------
   *
   * @returns {Array} upendMenuExpsrYn이 'Y'인 depth1 메뉴 목록 (sortSeq 정렬)
   *
   * 반환 배열 구조:
   * [
   *   {
   *     menuId: "M_PIIO_00064",
   *     menuNm: "신청·발급",
   *     link: "/req",
   *     iconClssNm: null
   *   },
   *   ...
   * ]
   *
   * 특징:
   * - upendMenuExpsrYn이 'Y'인 메뉴만 필터링 (상단 노출 여부)
   * - sortSeq로 정렬 (표시 순서)
   *
   * 용도:
   * - 헤더의 상단 메뉴 렌더링
   * - 노출 가능한 depth1 메뉴만 표시
   *
   * 사용 예시:
   * const { getHeaderMenus } = useUserMenu();
   * const headerMenus = getHeaderMenus();
   *
   * headerMenus.map(menu => (
   *   <a href={menu.link}>{menu.menuNm}</a>
   * ))
   */
  const getHeaderMenus = useCallback(() => {
    if (!menuTree || !menuTree.children) return [];

    return menuTree.children
      .filter(node => node.upendMenuExpsrYn === 'Y')
      .sort((a, b) => a.sortSeq - b.sortSeq)
      .map(node => ({
        menuId: node.menuId,
        menuNm: node.menuNm,
        link: buildFullPath(node, flatMenuMap),
        iconClssNm: node.iconClssNm,
      }));
  }, [menuTree, flatMenuMap]);

  /**
   * ---------------------------------------------------------------------------
   * getPageMenus: 화면이 있는 메뉴만 필터링
   * ---------------------------------------------------------------------------
   *
   * @returns {Array} scrnTypeCd가 'T'인 메뉴들의 배열
   *
   * scrnTypeCd 의미:
   * - "M": Menu (메뉴 그룹, 화면 없음, Outlet만)
   * - "T": Terminal (실제 화면, 컴포넌트 매핑 필요)
   *
   * 용도:
   * - 컴포넌트 레지스트리 검증
   * - 라우트 생성
   * - 페이지 목록 표시
   *
   * 예시:
   * const { getPageMenus } = useUserMenu();
   * const pages = getPageMenus();
   *
   * // pages = [
   * //   { menuId: "M_PIIO_00112", menuNm: "AI맞춤추천공고", scrnTypeCd: "T", ... },
   * //   { menuId: "M_PIIO_00113", menuNm: "증명서 발급 조회", scrnTypeCd: "T", ... },
   * //   ...
   * // ]
   */
  const getPageMenus = useCallback(() => {
    if (!menuTree) return [];

    const allMenus = flattenMenu(menuTree);

    // scrnTypeCd가 'T'인 것만 필터링
    return allMenus.filter(menu => menu.scrnTypeCd === 'T');
  }, [menuTree, flattenMenu]);

  /**
   * ---------------------------------------------------------------------------
   * getFullPath: menuId로 전체 경로 가져오기
   * ---------------------------------------------------------------------------
   *
   * @param {string} menuId - 메뉴 ID
   *
   * @returns {string|null} 전체 경로 (예: "/req/pbanc/pbanc")
   *
   * 용도:
   * - menuId만 알고 있을 때 전체 경로 생성
   * - 링크 생성 시 활용
   *
   * 예시:
   * getFullPath("M_PIIO_00076")
   * → "/req/pbanc/pbanc"
   *
   * getFullPath("INVALID_ID")
   * → null
   */
  const getFullPath = useCallback((menuId) => {
    if (!flatMenuMap[menuId]) return null;
    return buildFullPath(flatMenuMap[menuId], flatMenuMap);
  }, [flatMenuMap]);

  /**
   * ---------------------------------------------------------------------------
   * Context Value 생성
   * ---------------------------------------------------------------------------
   *
   * useMemo로 캐싱:
   * - 의존성 배열의 값이 변경될 때만 새 객체 생성
   * - 불필요한 리렌더링 방지
   *
   * 제공되는 값들:
   * - 원본 데이터: menuTree, flatMenuMap
   * - 현재 메뉴: currentMenu
   * - 조회 함수: findMenuById, findMenuByPath, getMenuByName, getAllMenus, getPageMenus, getFullPath
   * - UI 생성: breadcrumbItems, getBreadcrumbItems, getSideNavigationData, getHeaderMenus
   * - 유틸리티: flattenMenu
   * - 상태: loading, error
   * - 액션: refreshMenu
   */
  const value = useMemo(() => ({
    // ===== 원본 데이터 =====
    menuTree,              // 백엔드에서 받아온 메뉴 트리 원본
    flatMenuMap,           // menuId를 key로 하는 flat map

    // ===== 현재 메뉴 =====
    currentMenu,           // 현재 URL에 해당하는 메뉴 (자동 계산)

    // ===== 조회 함수들 =====
    findMenuById,          // menuId로 메뉴 찾기
    findMenuByPath,        // URL 경로로 메뉴 찾기
    getMenuByName,         // 메뉴명으로 찾기
    getAllMenus,           // 1depth 메뉴 목록 (GNB용)
    getPageMenus,          // 화면이 있는 메뉴만 (scrnTypeCd === 'T')
    getFullPath,           // menuId → 전체 경로

    // ===== UI 생성 =====
    breadcrumbItems: getBreadcrumbItems(),  // 현재 페이지 Breadcrumb 배열
    getBreadcrumbItems,                     // menuId로 Breadcrumb 생성
    getSideNavigationData,                  // SideNavigation용 데이터
    getDepth1Parent,                        // 현재 메뉴의 depth1 부모
    getHeaderMenus,                         // Header용 depth1 메뉴

    // ===== 유틸리티 =====
    flattenMenu,           // 트리 → 배열 변환

    // ===== 상태 =====
    loading: isLoading,    // 메뉴 로딩 중 여부
    error,                 // 에러 메시지 (null이면 정상)

    // ===== 액션 =====
    refreshMenu: fetchMenuData,  // 메뉴 재조회 함수
  }), [menuTree, flatMenuMap, currentMenu, findMenuById, findMenuByPath, getMenuByName, getAllMenus, getPageMenus, getFullPath, getBreadcrumbItems, getSideNavigationData, getDepth1Parent, getHeaderMenus, flattenMenu, isLoading, error, fetchMenuData]);

  // 로딩 중 화면
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
          로딩 중...
      </div>
    );
  }

  return (
    <UserMenuContext.Provider value={value}>
      {children}
    </UserMenuContext.Provider>
  );
}



/**
 * =============================================================================
 * useUserMenu Hook
 * =============================================================================
 *
 * 사용법:
 * import { useUserMenu } from './context/UserMenuContext';
 *
 * function MyComponent() {
 *   const { currentMenu, breadcrumbItems, loading } = useUserMenu();
 *
 *   if (loading) return <div>로딩 중...</div>;
 *
 *   return (
 *     <div>
 *       <h1>{currentMenu?.menuNm}</h1>
 *       <nav>
 *         {breadcrumbItems.map(item => (
 *           <a key={item.menuId} href={item.link}>{item.label}</a>
 *         ))}
 *       </nav>
 *     </div>
 *   );
 * }
 *
 * 에러 처리:
 * - UserMenuProvider 바깥에서 사용 시 에러 발생
 */
export function useUserMenu() {
  const context = useContext(UserMenuContext);

  if (!context) {
    throw new Error('useUserMenu must be used within UserMenuProvider');
  }

  return context;
}

export default UserMenuContext;
