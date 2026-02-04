// routes/staticRoutes.jsx
import MainPage from '../pages/MainPage.jsx';
import Login from '../pages/Login.jsx';
import SSOLogin from '../pages/SSOLogin.jsx';
import AiChat from '../pages/ai/AiChat.jsx';
import PublishingList from '../publishing/PublishingList.jsx';
import SubpageLayout from '../layouts/SubpageLayout.jsx';
import { autoPublishingRoutesWithLayout, autoPublishingRoutesWithoutLayout } from './autoRoutes.jsx';
import { MenuProviderOnly, SubpageLayoutWithMenu } from '@layouts';

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

  //=============================================================================
  // 업무 페이지 라우트
  //=============================================================================

  /*
    MenuProviderOnly 적용 route
  */
  {
    element: <MenuProviderOnly />,
    children: [
      {
        path: '/',
        element: <MainPage />,
      },
      {
        path: '/service/ai-chat', // AI 상담 페이지 (full layout)
        element: <AiChat/>,
      },
      {
        path: '/service/SSO-login', // 로그인 페이지
        element: <SSOLogin/>,
      },
    ],
  },

  /*
    SubpageLayout 적용 route (without menu)
   */
  // {
  //   element: <SubpageLayout />,
  //   children:
  //       [
  //         {
  //           path: '/service/login', // 로그인 페이지
  //           element: <Login/>,
  //         },
  //         {
  //           path: '/service/ai-chat', // AI 상담 페이지
  //           element: <AiChat/>,
  //         },
  //       ],
  // },

  /*
    SubpageLayoutWithMenu 적용 route
   */
  {
    element: <SubpageLayoutWithMenu />,
    children:
        [
          {
            path: '/service/login', // 로그인 페이지
            element: <Login/>,
          },
        ],
  },

  //=============================================================================
  // 퍼블리싱 관련 라우트
  //=============================================================================

  // 퍼블리싱 전용 라우트 - SubpageLayoutWIthMenu 적용
  {
    path: 'publishing',
    element: <SubpageLayoutWithMenu />,
    children: [
      { index: true, element: <PublishingList /> },
      ...autoPublishingRoutesWithLayout,
    ],
  },

  // 퍼블리싱 전용 라우트 - SubpageLayout 미적용 (MenuProviderOnly)
  {
    path: 'publishing',
    element: <MenuProviderOnly />,
    children: [
      ...autoPublishingRoutesWithoutLayout,
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
