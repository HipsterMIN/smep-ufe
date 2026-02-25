import { Navigate, Outlet } from 'react-router-dom';
import { componentMap } from './componentMap.js';
import { Suspense } from 'react';
import { buildFullPath } from '../utils/menuUtils.js';

/**
 * =============================================================================
 * Dynamic Routes Generator - 메뉴 데이터를 React Router 라우트로 변환
 * =============================================================================
 */

/**
 * M 타입 노드의 첫 번째 T 타입 자식 찾기 (redirect용)
 * DFS로 탐색하여 가장 먼저 만나는 T 타입 노드 반환
 * Side Navigation에서 사용되는 메뉴 노드 기준
 *
 * @param {Object} menuNode - 메뉴 노드
 * @returns {Object|null} 첫 번째 T 타입 노드 또는 null
 */
export const findFirstTComponentBySide = (menuNode) => {
  if (!menuNode.children || menuNode.children.length === 0) {
    return null;
  }

  // BFS로 자식들 탐색
  const queue = [...menuNode.children];
  while (queue.length > 0) {
    const node = queue.shift();
    // T 타입 발견 ( lfsdMenuExpsrYn 체크 )
    if (node.scrnTypeCd === 'T' && node.lfsdMenuExpsrYn === 'Y') {
      return node;
    }

    // M 타입이면 자식들을 큐에 추가
    if (node.children && node.children.length > 0) {
      queue.push(...node.children);
    }
  }
  return null;
};

/**
 * 단일 메뉴 노드를 라우트 객체로 변환
 *
 * @param {Object} menuNode - 메뉴 노드
 * @param {Object} flatMenuMap - menuId를 key로 하는 flat map
 * @returns {Object|null} React Router 라우트 객체
 */
const createRouteFromNode = (menuNode, flatMenuMap) => {
  // depth 0은 제외
  if (menuNode.depth === 0) {
    return null;
  }

  const fullPath = buildFullPath(menuNode, flatMenuMap);
  const routeConfig = {
    path: fullPath,
    // 메타데이터 저장 (나중에 breadcrumb 등에서 사용)
    handle: {
      menuId: menuNode.menuId,
      menuNm: menuNode.menuNm,
      scrnTypeCd: menuNode.scrnTypeCd,
      bbsNo: menuNode?.bbsNo,
    },
  };

  // T 타입: 실제 컴포넌트 매핑
  if (menuNode.scrnTypeCd === 'T') {
    const componentConfig = componentMap[menuNode.menuId];
    if (componentConfig) {
      const { component: Component, layout: Layout, children } = componentConfig;

      // ✅ children이 있는 경우: 중첩 라우트 구조 (목록 + 상세 등)
      if (children && children.length > 0) {
        // 부모는 Layout + Outlet만 (자식 라우트를 렌더링하기 위함)
        if (Layout) {
          routeConfig.element = (
            <Layout>
              <Suspense fallback={<div>로딩중...</div>}>
                <Outlet />
              </Suspense>
            </Layout>
          );
        } else {
          routeConfig.element = (
            <Suspense fallback={<div>로딩중...</div>}>
              <Outlet />
            </Suspense>
          );
        }

        // children 라우트 생성
        routeConfig.children = [
          // index 라우트: 부모 경로에서 기본으로 보여질 컴포넌트 (목록 화면)
          {
            index: true,
            element: (
              <Suspense fallback={<div>로딩중...</div>}>
                <Component />
              </Suspense>
            ),
          },
          // 추가 children: 상세 화면, 편집 화면 등
          ...children.map(child => {
            const ChildComponent = child.component;
            return {
              path: child.path,
              element: (
                <Suspense fallback={<div>로딩중...</div>}>
                  <ChildComponent />
                </Suspense>
              ),
            };
          }),
        ];
      } else {
        // ✅ children이 없는 경우: 일반 라우트 (단일 페이지)
        // Layout이 있는 경우 (중첩 라우트)
        if (Layout) {
          routeConfig.element = (
            <Layout>
              <Suspense fallback={<div>로딩중...</div>}>
                <Component />
              </Suspense>
            </Layout>
          );
        } else {
          // Layout이 없는 경우 (단독 페이지)
          routeConfig.element = (
            <Suspense fallback={<div>로딩중...</div>}>
              <Component />
            </Suspense>
          );
        }
      }
    } else {
      // 컴포넌트가 등록되지 않은 경우
      routeConfig.element = (
        <div style={{ padding: '2rem' }}>
          <h3>준비중입니다.</h3>
          <p>컴포넌트가 아직 등록되지 않았습니다. (menuId: {menuNode.menuId})</p>
        </div>
      );
    }
  } else if (menuNode.scrnTypeCd === 'M') {
    // M 타입: 메뉴 그룹 (실제 페이지 없음, 첫 자식으로 redirect)
    const firstTNode = findFirstTComponentBySide(menuNode);
    if (firstTNode) {
      const targetPath = buildFullPath(firstTNode, flatMenuMap);
      routeConfig.element = <Navigate to={targetPath} replace />;
    } else {
      routeConfig.element = (
        <div style={{ padding: '2rem' }}>
          <h3>준비중입니다.</h3>
          <p>하위 메뉴를 선택해주세요.</p>
        </div>
      );
    }
  }

  return routeConfig;
};

/**
 * 메뉴 트리 전체를 순회하며 동적 라우트 배열 생성
 *
 * @param {Object} menuTree - 메뉴 트리 루트
 * @param {Object} flatMenuMap - menuId를 key로 하는 flat map
 * @returns {Array} React Router 라우트 배열
 */
export const generateDynamicRoutes = (menuTree, flatMenuMap) => {
  if (!menuTree || !flatMenuMap) {
    return [];
  }

  const routes = [];
  const processNode = (node) => {
    const route = createRouteFromNode(node, flatMenuMap);
    if (route) {
      routes.push(route);
    }

    // 자식 노드들도 재귀적으로 처리
    if (node.children && node.children.length > 0) {
      node.children.forEach(processNode);
    }
  };

  processNode(menuTree);
  return routes;
};
