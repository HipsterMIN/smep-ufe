import { useState, useEffect, useRef } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { staticRoutes } from './staticRoutes.jsx';
import { generateDynamicRoutes } from './dynamicRoutes.jsx';
import { useMenuStore } from '../store/useMenuStore';
import { useAuthStore } from '../store/useAuthStore.jsx';

/**
 * Router 생성 함수
 */
const createAppRouter = (menuTree, flatMenuMap) => {
  // 동적 라우트 생성
  const dynamicRoutes = generateDynamicRoutes(menuTree, flatMenuMap);
  // 모든 라우트 병합
  const allRoutes = [
    ...dynamicRoutes, // 동적 라우트
    ...staticRoutes, // 정적 라우트
  ];

  // 개발용 라우트 정보 출력
  console.log('동적 라우트:', dynamicRoutes);
  console.log('정적 라우트:', staticRoutes); 
  console.log(`총 ${allRoutes.length}개 라우트 생성 (동적: ${dynamicRoutes.length}, 정적: ${staticRoutes.length})`);

  // BASE_URL 설정
  const base = import.meta.env.BASE_URL || '/'; // 기본값 '/'
  // ✅ React Router의 basename은 트레일링 슬래시가 없어야 함 (단, '/' 자체인 경우는 제외)
  // 트레일링 슬래시가 있으면 /main-dev (슬래시 없음)와 매칭되지 않는 문제가 발생함
  const basename = base.endsWith('/') && base !== '/' ? base.slice(0, -1) : base;

  // 브라우저 라우터 생성
  return createBrowserRouter(allRoutes, { basename });
};


/**
 * AppRouter - 메뉴 로드 및 router 생성을 담당하는 컴포넌트
 */
function AppRouter() {
  const currentMode = useAuthStore((state) => state.currentMode);
  const { menuTree, flatMenuMap, fetchMenuData, resetMenu, isLoading } = useMenuStore();
  const [routerInstance, setRouterInstance] = useState(null);
  const previousModeRef = useRef(currentMode);

  useEffect(() => {
    if (previousModeRef.current !== currentMode) {
      previousModeRef.current = currentMode;
      resetMenu();
    }
  }, [currentMode, resetMenu]);

  /**
   * menuTree, fetchMenuData 의존성으로 메뉴 데이터 fetch
   */
  useEffect(() => {
    // 메뉴 트리가 없을 때만 데이터 fetch
    if (!menuTree) {
      // 메뉴 데이터 가져오기
      fetchMenuData();
    }
  }, [menuTree, fetchMenuData]);

  /**
   * menuTree, flatMenuMap 의존성으로 라우터 생성
   */
  useEffect(() => {
    // 메뉴 트리와 flatMenuMap이 준비되면 라우터 생성
    if (menuTree && flatMenuMap) {
      const router = createAppRouter(menuTree, flatMenuMap);
      setRouterInstance(router);
    }
  }, [menuTree, flatMenuMap]);

  // 로딩 중이거나 라우터 인스턴스가 없으면 로딩 화면 표시 TODO 임의 스타일링이므로 디자인 개선
  if (isLoading || !routerInstance) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        {/*<div>라우터 초기화 중...</div>*/}
      </div>
    );
  }

  return <RouterProvider router={routerInstance} />;
}

export default AppRouter;
