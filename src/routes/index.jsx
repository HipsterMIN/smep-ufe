import { createBrowserRouter, Navigate } from 'react-router-dom';
import SubpageLayout from '../layouts/SubpageLayout.jsx';
import UI_USR_R_005 from '../publishing/UI_USR_R_005.jsx';
import UI_USR_L_010 from '../publishing/UI_USR_L_010.jsx';
import UI_USR_R_011 from '../publishing/UI_USR_R_011.jsx';

import UI_USR_R_480 from '../publishing/UI_USR_R_480.jsx';
import UI_USR_L_510 from '../publishing/UI_USR_L_510.jsx';
import UI_USR_L_020 from '../publishing/UI_USR_L_020.jsx';
import UI_USR_R_021 from '../publishing/UI_USR_R_021.jsx';

import UI_USR_R_002 from '../publishing/UI_USR_R_002.jsx';
import UI_USR_L_030 from '../publishing/UI_USR_L_030.jsx';
import UI_USR_R_031 from '../publishing/UI_USR_R_031.jsx';
import UI_USR_L_040 from '../publishing/UI_USR_L_040.jsx';

import MainPage from '../publishing/MainPage.jsx';
import PublishingList from '../publishing/PublishingList.jsx';

// Vite의 BASE_URL과 라우터 basename을 일치시킵니다. (예: '/', '/admin/')
const base = import.meta.env.BASE_URL || '/';
const basename = base.endsWith('/') ? base.slice(0, -1) : base;

const router = createBrowserRouter(
  [
    // 루트 접근 시 퍼블리싱 메인으로 리다이렉트
    { path: '/', element: <Navigate to="publishing" replace /> },

    // 퍼블리싱 레이아웃 및 하위 페이지
    {
      path: 'publishing',
      element: <SubpageLayout />,
      children: [
        { index: true, element: <PublishingList /> },
        { path: 'UI_USR_L_010', element: <UI_USR_L_010 /> },
        { path: 'UI_USR_R_011', element: <UI_USR_R_011 /> },
        { path: 'UI_USR_L_020', element: <UI_USR_L_020 /> },
        { path: 'UI_USR_R_021', element: <UI_USR_R_021 /> },
        { path: 'UI_USR_R_480', element: <UI_USR_R_480 /> },
        { path: 'UI_USR_L_510', element: <UI_USR_L_510 /> },
        { path: 'UI_USR_R_002', element: <UI_USR_R_002 /> },
        { path: 'UI_USR_L_030', element: <UI_USR_L_030 /> },
        { path: 'UI_USR_R_031', element: <UI_USR_R_031 /> },
        { path: 'UI_USR_L_040', element: <UI_USR_L_040 /> },
      ],
    },

    // 레이아웃 없이 직접 매핑되는 퍼블리싱 화면들
    { path: 'publishing/main', element: <MainPage /> },
    { path: 'publishing/UI_USR_R_005', element: <UI_USR_R_005 /> },

    // 404
    { path: '*', element: <div>페이지를 찾을 수 없습니다. (404)</div> },
  ],
  { basename }
);

export default router;
