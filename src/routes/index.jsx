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

  // 최신 라우터 인스턴스를 ref로 추적한다.
  // setRouterInstance 직전에 이전 라우터의 state.location을 읽기 위해 사용.
  // useEffect deps에 routerInstance를 포함하면 라우터 교체 때마다 effect가 재실행되므로 ref를 사용.
  const routerInstanceRef = useRef(routerInstance);
  routerInstanceRef.current = routerInstance;

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
      // [타이밍 경쟁 수정 — router replace race condition fix]
      //
      // 문제: React Router의 navigate()는 router.state.location을 즉시 갱신하지만,
      // window.history.replaceState (= window.location 갱신)는 React commit 단계 이후에 실행된다.
      // fetchMenuData()가 그 사이(~23ms 네트워크)에 완료되면 createBrowserRouter가
      // 아직 갱신되지 않은 window.location(예: '/home/sso')을 읽어 새 라우터가
      // 잘못된 경로('/sso')로 초기화된다.
      // 초기화 후에는 window.location이 '/home'으로 바뀌어도 새 라우터는 popstate를 수신하지
      // 않으므로 (replaceState는 이벤트 발생 없음) 경로가 '/sso'에 고착된다.
      //
      // 수정: createBrowserRouter 호출 전에 이전 라우터의 state.location(이미 갱신됨)을 읽어
      // window.location이 다르면 window.history.replaceState로 동기화한다.
      const prevRouter = routerInstanceRef.current;
      if (prevRouter?.state?.location?.pathname != null) {
        const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, ''); // e.g. '/home'
        const internalPathname = prevRouter.state.location.pathname; // basename이 제거된 내부 경로
        // 내부 경로 '/' → 브라우저 경로 '/home'
        // 내부 경로 '/dashboard' → 브라우저 경로 '/home/dashboard'
        const expectedBrowserPath = internalPathname === '/' ? base : base + internalPathname;
        if (window.location.pathname !== expectedBrowserPath) {
          window.history.replaceState(window.history.state, '', expectedBrowserPath);
        }
      }

      setRouterInstance(createAppRouter(menuTree, flatMenuMap));
    }
  }, [menuTree, flatMenuMap]);

  return <RouterProvider router={routerInstance} />;
}

export default AppRouter;
