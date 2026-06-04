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
  // [라우트 우선순위 수정]
  // staticRoutes를 먼저 배치하여 '/'(MainPage), '/sso', '/service/login' 등 핵심 경로가
  // 동적 메뉴 라우트보다 높은 우선순위를 갖도록 한다.
  // 이전: [...dynamicRoutes, ...staticRoutes] → 동적 M타입 '/' 리다이렉트가 MainPage를 덮어씀
  //   → navigate('/') 후 동적 <Navigate to="/home" replace /> 발동 → URL이 /home/home으로 변경
  // 수정: staticRoutes가 먼저 오면 '/'는 항상 MainPage, React Router 스코어 기반 매칭으로
  //   '/req/pbanc' 등 동적 경로는 정상 동작, '*' catch-all은 여전히 최하위.
  const allRoutes = [
    ...staticRoutes,
    ...dynamicRoutes,
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
      // [SSO 콜백 중 라우터 교체 방지]
      //
      // 문제: fetchMenuData()가 빠르게 완료되면 (~23ms) OnePassSsoCallback의 exchangeCode()
      // (~200ms) 실행 중에 setRouterInstance()가 호출된다.
      // → 새 라우터가 /sso 경로로 초기화되어 OnePassSsoCallback이 리마운트되고
      //   useRef(false)로 초기화된 hasHandledRef가 리셋되어 동일 code로 exchangeCode()가 재실행된다.
      // → OAuth2 Authorization Code는 1회용이므로 두 번째 교환이 실패 → catch → /service/login 리다이렉트.
      //
      // 수정: /sso?code=... 경로에서는 라우터 교체를 건너뛴다.
      // SSO 성공 후 ssoLogin() → currentMode 변경 → resetMenu() → fetchMenuData() 재실행 시
      // 이 effect가 다시 발동되는데, 그 때는 window.location이 /home 이므로 정상 교체가 이루어진다.
      if (
        window.location.pathname.endsWith('/sso') &&
        new URLSearchParams(window.location.search).has('code')
      ) {
        return;
      }

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
        const rawBase = import.meta.env.BASE_URL || '/'; // e.g. '/home/'
        const base = rawBase.endsWith('/') && rawBase !== '/' ? rawBase.slice(0, -1) : rawBase; // e.g. '/home'
        const internalPathname = prevRouter.state.location.pathname;

        // internalPathname이 basename 제거 전/후 어떤 형태로 오더라도
        // 브라우저 경로를 중복 접두사 없이 안정적으로 계산한다.
        let expectedBrowserPath = internalPathname;
        if (!base || base === '/') {
          expectedBrowserPath = internalPathname || '/';
        } else if (internalPathname === '/' || internalPathname === '') {
          expectedBrowserPath = base;
        } else if (internalPathname === base || internalPathname.startsWith(`${base}/`)) {
          expectedBrowserPath = internalPathname;
        } else {
          expectedBrowserPath = `${base}${internalPathname}`;
        }

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
