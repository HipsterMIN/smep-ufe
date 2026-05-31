// routes/staticRoutes.jsx
import { lazy, Suspense } from 'react';
import { autoPublishingRoutesWithLayout, autoPublishingRoutesWithoutLayout } from './autoRoutes.jsx';
import { MenuProviderOnly, SubpageLayoutWithMenu } from '@layouts';

// HTTP/1.1 커넥션 큐 대기로 인한 Pending 상태 대응
// — 청크 로드가 TIMEOUT 내에 완료되지 않으면 즉시 강제 새로고침
const CHUNK_LOAD_TIMEOUT_MS = 8_000;
const CHUNK_RELOAD_KEY = '__smep_chunk_reload_ts__';
const RELOAD_COOLDOWN_MS = 5_000;

const reloadOnce = () => {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch { /* ignore */ }
  window.location.reload();
};

const lazyWithRetry = (importFn) =>
  lazy(() =>
    Promise.race([
      importFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('ChunkLoadError: load timeout')), CHUNK_LOAD_TIMEOUT_MS),
      ),
    ]).catch(() => {
      reloadOnce();
      return new Promise(() => {}); // 재로딩 중 렌더 차단
    }),
  );

// 레이아웃/Provider 컴포넌트는 라우트 구조 정의에 즉시 필요하므로 eager 유지
// 페이지 컴포넌트는 해당 경로에 진입할 때만 로드
const MainPage                 = lazyWithRetry(() => import('../pages/MainPage.jsx'));
const Login                    = lazyWithRetry(() => import('../pages/Login.jsx'));
const SSOLogin                 = lazyWithRetry(() => import('../pages/SSOLogin.jsx'));
const OnePassSsoCallback       = lazyWithRetry(() => import('../pages/onepass/OnePassSsoCallback.jsx'));
const OnePassSsoLogout         = lazyWithRetry(() => import('../pages/onepass/OnePassSsoLogout.jsx'));
const IntegratedSearchRouteTest = lazyWithRetry(() => import('../pages/dev/IntegratedSearchRouteTest.jsx'));
const FindPassword             = lazyWithRetry(() => import('../pages/FindPassword.jsx'));
const PublishingList           = lazyWithRetry(() => import('../publishing/PublishingList.jsx'));

// Suspense fallback — MainPage lazy 로드 중 표시되는 골격 UI
const pageFallback = (
  <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
    {/* 헤더 자리 */}
    <div style={{ height: '60px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }} />
    {/* 검색 영역 자리 */}
    <div style={{ height: '260px', backgroundColor: '#1a3a6b' }} />
    {/* 컨텐츠 자리 */}
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[120, 80, 200].map((h, i) => (
        <div key={i} style={{ height: `${h}px`, borderRadius: '8px', backgroundColor: '#e5e7eb' }} />
      ))}
    </div>
  </div>
);

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
        element: <Suspense fallback={pageFallback}><MainPage /></Suspense>,
      },
      {
        path: '/service/SSO-login',
        element: <Suspense fallback={pageFallback}><SSOLogin /></Suspense>,
      },
      {
        path: '/service/intg-search-route-test',
        element: <Suspense fallback={pageFallback}><IntegratedSearchRouteTest /></Suspense>,
      },
      {
        path: '/sso',
        element: <Suspense fallback={pageFallback}><OnePassSsoCallback /></Suspense>,
      },
      {
        path: '/sso-logout',
        element: <Suspense fallback={pageFallback}><OnePassSsoLogout /></Suspense>,
      },
    ],
  },

  /*
    SubpageLayoutWithMenu 적용 route
   */
  {
    element: <SubpageLayoutWithMenu />,
    children: [
      {
        path: '/service/login',
        element: <Suspense fallback={pageFallback}><Login /></Suspense>,
      },
      {
        path: '/service/find-password',
        element: <Suspense fallback={pageFallback}><FindPassword /></Suspense>,
      },
    ],
  },

  //=============================================================================
  // 퍼블리싱 관련 라우트
  //=============================================================================

  // 퍼블리싱 전용 라우트 - SubpageLayoutWithMenu 적용
  {
    path: 'publishing',
    element: <SubpageLayoutWithMenu />,
    children: [
      { index: true, element: <Suspense fallback={pageFallback}><PublishingList /></Suspense> },
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
