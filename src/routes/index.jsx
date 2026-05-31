import { useState, useEffect, useRef } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { staticRoutes } from './staticRoutes.jsx';
import { generateDynamicRoutes } from './dynamicRoutes.jsx';
import { useMenuStore } from '../store/useMenuStore';
import { useAuthStore } from '../store/useAuthStore.jsx';
import { mockMenuData } from '@lib/menuData.js';

/**
 * Router 생성 함수
 */
const createAppRouter = (menuTree, flatMenuMap) => {
  const dynamicRoutes = generateDynamicRoutes(menuTree, flatMenuMap);
  const allRoutes = [
    ...dynamicRoutes,
    ...staticRoutes,
  ];

  // React Router의 basename은 트레일링 슬래시가 없어야 함 (단, '/' 자체인 경우는 제외)
  const base = import.meta.env.BASE_URL || '/';
  const basename = base.endsWith('/') && base !== '/' ? base.slice(0, -1) : base;

  return createBrowserRouter(allRoutes, { basename });
};


/**
 * AppRouter - 메뉴 로드 및 router 생성을 담당하는 컴포넌트
 *
 * 초기화 전략:
 *  1. useState lazy initializer에서 mockMenuData로 라우터를 동기적으로 생성 → 흰 화면 없이 즉시 렌더
 *  2. 백그라운드에서 실제 메뉴 API를 fetch
 *  3. 실제 데이터가 도착하면 라우터를 한 번 교체 (정적 라우트는 동일하므로 MainPage 등 remount 없음)
 */
function AppRouter() {
  const currentMode = useAuthStore((state) => state.currentMode);
  const { menuTree, flatMenuMap, fetchMenuData, resetMenu, hasFetched } = useMenuStore();
  const previousModeRef = useRef(currentMode);

  // mockMenuData로 라우터를 동기적으로 초기화 — 첫 렌더부터 RouterProvider 사용 가능
  const [routerInstance, setRouterInstance] = useState(() => {
    const { menuTree: initialTree, flatMenuMap: initialMap } = useMenuStore.getState();
    return createAppRouter(initialTree, initialMap);
  });

  // 모드 전환 감지 → resetMenu (hasFetched=false로 복귀 → 재fetch 트리거)
  useEffect(() => {
    if (previousModeRef.current !== currentMode) {
      previousModeRef.current = currentMode;
      resetMenu();
    }
  }, [currentMode, resetMenu]);

  // 실제 메뉴를 아직 fetch하지 않았을 때만 호출
  useEffect(() => {
    if (!hasFetched) {
      fetchMenuData();
    }
  }, [hasFetched, fetchMenuData]);

  // 실제 메뉴 데이터가 도착하면 라우터 교체 (mockMenuData 상태는 건너뜀)
  useEffect(() => {
    if (menuTree && flatMenuMap && menuTree !== mockMenuData) {
      setRouterInstance(createAppRouter(menuTree, flatMenuMap));
    }
  }, [menuTree, flatMenuMap]);

  return <RouterProvider router={routerInstance} />;
}

export default AppRouter;
