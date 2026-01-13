import { createBrowserRouter, Navigate } from 'react-router-dom';
import SubpageLayout from '../layouts/SubpageLayout.jsx';
import { autoPublishingRoutes } from './autoRoutes.jsx';

// 실제 운영용 페이지들 (src/pages)
import MainPage from '../pages/MainPage.jsx';
import AiSmartSearch from '../pages/AiSmartSearch.jsx';
import UI_USR_L_010 from '../pages/UI_USR_L_010.jsx';
import UI_USR_L_011 from '../pages/UI_USR_L_011.jsx';
import UI_USR_R_480 from '../pages/UI_USR_R_480.jsx';
import UI_USR_L_510 from '../pages/UI_USR_L_510.jsx';

// 퍼블리싱 목록 페이지
import PublishingList from '../publishing/PublishingList.jsx';

// Vite의 BASE_URL과 라우터 basename을 일치시킵니다. (예: '/', '/admin/')
const base = import.meta.env.BASE_URL || '/';
const basename = base.endsWith('/') ? base.slice(0, -1) : base;

const router = createBrowserRouter(
  [
    // 실제 서비스 라우트
    { path: '/', element: <MainPage /> },
    { path: '/ai-smart-search', element: <AiSmartSearch /> },
    
    // 서브페이지 레이아웃이 필요한 실제 서비스 페이지들
    {
      path: '/service',
      element: <SubpageLayout />,
      children: [
        { path: 'UI_USR_L_010', element: <UI_USR_L_010 /> },
        { path: 'UI_USR_L_011', element: <UI_USR_L_011 /> },
        { path: 'UI_USR_R_480', element: <UI_USR_R_480 /> },
        { path: 'UI_USR_L_510', element: <UI_USR_L_510 /> },
      ]
    },

    // 퍼블리싱 전용 라우트 (smep-afe 방식)
    {
      path: '/publishing',
      element: <SubpageLayout />,
      children: [
        { index: true, element: <PublishingList /> },
        ...autoPublishingRoutes,
      ],
    },

    // 404
    { path: '*', element: <div>페이지를 찾을 수 없습니다. (404)</div> },
  ],
  { basename }
);

export default router;
