// routes/staticRoutes.jsx
import MainPage from '../pages/MainPage.jsx';
import Login from '../pages/Login.jsx';
import PublishingList from '../publishing/PublishingList.jsx';
import SubpageLayout from '../layouts/SubpageLayout.jsx';
import { autoPublishingRoutes } from './autoRoutes.jsx';
import { MenuProviderOnly } from '../layouts/layoutIndex.jsx';

/**
 * =============================================================================
 * 정적 라우트 정의
 * =============================================================================
 *
 * 특징:
 * - 메뉴 데이터와 무관하게 항상 존재하는 라우트
 * - 로그인, 메인, 퍼블리싱 페이지 등
 * - outlet 구조를 활용하여 레이아웃 적용
 */

export const staticRoutes = [
  // 메인 페이지
  {
    element: <MenuProviderOnly />,
    children: [
      {
        path: '/',
        element: <MainPage />,
      },
    ],
  },

  // subpageLayout을 사용하는 단일 페이지
  {
    element: <SubpageLayout />,
    children:
        [
          {
            path: '/service/login', // 로그인 페이지
            element: <Login/>,
          },
        ],
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

  // 404 페이지 (가장 마지막에 위치)
  {
    path: '*',
    element: (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>404</h1>
        <p>페이지를 찾을 수 없습니다.</p>
        <a href="/">홈으로 돌아가기</a>
      </div>
    ),
  },
];
