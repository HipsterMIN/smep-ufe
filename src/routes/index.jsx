import { useState, useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { staticRoutes } from './staticRoutes.jsx';
import { generateDynamicRoutes } from './dynamicRoutes.jsx';
import { useMenuStore } from '../store/useMenuStore';

/**
 * Router 생성 함수
 */
const createAppRouter = (menuTree, flatMenuMap) => {
  const dynamicRoutes = generateDynamicRoutes(menuTree, flatMenuMap);
  const allRoutes = [
    ...dynamicRoutes,
    ...staticRoutes,
  ];

  console.log('동적 라우트:', dynamicRoutes);
  console.log('정적 라우트:', staticRoutes); 

  console.log(`총 ${allRoutes.length}개 라우트 생성 (동적: ${dynamicRoutes.length}, 정적: ${staticRoutes.length})`);

  const base = import.meta.env.BASE_URL || '/';
  const basename = base.endsWith('/') ? base.slice(0, -1) : base;

  return createBrowserRouter(allRoutes, { basename });
};


/**
 * AppRouter - 메뉴 로드 및 router 생성을 담당하는 컴포넌트
 */
function AppRouter() {
  const { menuTree, flatMenuMap, fetchMenuData, isLoading } = useMenuStore();
  const [routerInstance, setRouterInstance] = useState(null);

  useEffect(() => {
    if (!menuTree) {
      fetchMenuData();
    }
  }, [menuTree, fetchMenuData]);

  useEffect(() => {
    if (menuTree && flatMenuMap) {
      const router = createAppRouter(menuTree, flatMenuMap);
      setRouterInstance(router);
    }
  }, [menuTree, flatMenuMap]);

  if (isLoading || !routerInstance) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <div>라우터 초기화 중...</div>
      </div>
    );
  }

  return <RouterProvider router={routerInstance} />;
}

export default AppRouter;