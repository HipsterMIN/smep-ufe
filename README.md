# smep-ufe

중소기업 통합 포털(SMES Portal) 프론트엔드 애플리케이션.  
React + Vite 기반의 SPA로, 메뉴 기반 동적 라우팅, OnePass SSO 통합, 인증/권한 관리를 포함한다.

---

## 목차

- [개요](#개요)
- [개발 환경 설정](#개발-환경-설정)
- [프로젝트 구조](#프로젝트-구조)
- [환경 변수](#환경-변수)
- [라우팅 아키텍처](#라우팅-아키텍처)
- [인증 아키텍처](#인증-아키텍처)
- [주요 모듈](#주요-모듈)
- [로컬 패키지](#로컬-패키지)
- [빌드 최적화](#빌드-최적화)
- [알려진 이슈 및 해결 내역](#알려진-이슈-및-해결-내역)
- [유지보수 체크리스트](#유지보수-체크리스트)

---

## 개요

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 18 + Vite 5 |
| 라우터 | React Router 7 |
| 상태관리 | Zustand 4 |
| 스타일 | Sass + KRDS Design Tokens |
| HTTP | Axios |
| 테스트 | Vitest + React Testing Library |
| E2E | Playwright |
| 패키지 구조 | 모노레포 (`packages/core`, `packages/icon`) |

---

## 개발 환경 설정

### 사전 요구사항

- Node.js 18+
- npm 9+
- 백엔드 서버 (`smep-ube`) 실행 중 (기본 `http://localhost:8081`)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 로컬 패키지 빌드 (최초 1회 또는 packages/* 수정 후)
npm run build:packages

# 개발 서버 실행 (localhost 모드, HMR 포함)
npm run dev
```

### 개발 서버 모드

| 명령 | 모드 | 용도 |
|------|------|------|
| `npm run dev` | localhost | 로컬 개발 (`.env.localhost` 사용) |
| `npm run build:dev` | development | dev 서버 배포용 빌드 |
| `npm run build:prod` | production | 운영 배포용 빌드 |
| `npm run build:local` | localhost | 로컬 환경 빌드 |

### 테스트

```bash
npm run test           # 전체 테스트 (watch 모드)
npm run test:ui        # Vitest UI 실행
npm run test:coverage  # 커버리지 리포트 생성
```

---

## 프로젝트 구조

```
smep-ufe/
├── packages/
│   ├── core/          # @krds-ui/core — React + TypeScript + Tailwind UI 컴포넌트 라이브러리
│   └── icon/          # @krds-ui/icon — 아이콘 컴포넌트
├── src/
│   ├── components/    # 공통 컴포넌트
│   │   ├── ai/        # FloatingChatbot 등 AI 관련
│   │   ├── analytics/ # PageViewTracker
│   │   ├── nice-id/   # 본인인증 버튼
│   │   └── ui/        # Header, Footer, SideNavigation, Breadcrumb 등
│   ├── context/
│   │   ├── AuthContext.jsx       # (레거시, 현재 미사용)
│   │   └── UserMenuContext.jsx   # 메뉴 트리 전역 관리, 현재 메뉴 감지
│   ├── hooks/         # 커스텀 훅
│   ├── layouts/
│   │   ├── SubpageLayout.jsx         # 서브페이지 레이아웃 (헤더/사이드네비/푸터)
│   │   └── index.jsx                 # SubpageLayoutWithMenu, MenuProviderOnly export
│   ├── lib/           # apiClient, queryClient, menuData 등 공용 모듈
│   ├── pages/         # 페이지 컴포넌트
│   │   ├── onepass/   # OnePass SSO 콜백/로그아웃
│   │   ├── my-business/  # 마이비즈니스 (비밀번호 변경 등)
│   │   ├── certificate/  # 증명서 발급
│   │   └── ...
│   ├── publishing/    # 퍼블리싱 전용 페이지 (자동 라우팅)
│   ├── routes/
│   │   ├── index.jsx            # AppRouter — 라우터 인스턴스 생성/교체
│   │   ├── staticRoutes.jsx     # 정적 라우트 (/, /sso, /service/login 등)
│   │   ├── dynamicRoutes.jsx    # 메뉴 데이터 → React Router 라우트 변환
│   │   ├── componentMap.js      # menuId → React.lazy 컴포넌트 매핑 레지스트리
│   │   ├── routeChildrenMeta.js # child 경로 메타 (React.lazy 없음, TDZ 방지용)
│   │   └── autoRoutes.jsx       # src/publishing/*.jsx 자동 라우팅
│   ├── store/
│   │   ├── useAuthStore.jsx     # 인증 상태 (Zustand + sessionStorage persist)
│   │   ├── useMenuStore.js      # 메뉴 트리 상태
│   │   ├── useSidebarStore.js   # 사이드바 열림/닫힘 상태
│   │   └── useSearchStore.js    # 검색 상태
│   └── utils/
│       ├── menuUtils.js          # buildFullPath, findFirstVisibleTMenu 등
│       ├── onepassSilentSso.js   # Silent SSO sessionStorage 플래그 관리
│       └── keycloakGetAuthCode.js # Keycloak 인증코드 요청 유틸
├── styles/            # 전역 CSS (krds_tokens.css, onCommon.css 등)
├── .env.example       # 환경 변수 예시
├── .env.localhost     # 로컬 개발 환경
├── .env.development   # dev 서버 환경
├── .env.production    # 운영 환경
├── vite.config.js
└── vitest.config.js
```

### Path Alias

`vite.config.js`에 정의된 import alias:

| Alias | 실제 경로 |
|-------|----------|
| `@` | `src/` |
| `@components` | `src/components/` |
| `@context` | `src/context/` |
| `@layouts` | `src/layouts/` |
| `@lib` | `src/lib/` |
| `@pages` | `src/pages/` |
| `@routes` | `src/routes/` |
| `@store` | `src/store/` |
| `@utils` | `src/utils/` |
| `@styles` | `styles/` |

---

## 환경 변수

모든 변수는 `VITE_` 접두사를 사용해야 클라이언트에 노출된다.

| 변수 | 설명 |
|------|------|
| `VITE_BASE` | 애플리케이션 base URL (예: `/home-dev/`) |
| `VITE_API_HOST` | 백엔드 API 호스트 (개발 프록시 대상) |
| `VITE_ONEPASS_CONVERSION_URL` | OnePass 통합회원 전환 URL |
| `VITE_ONEPASS_REGISTER_URL` | OnePass 신규 가입 URL |
| `VITE_ONEPASS_CLIENT_ID` | OnePass OAuth2 Client ID |
| `VITE_ONEPASS_REDIRECT_SSO_URI` | SSO 콜백 redirect URI |
| `VITE_ONEPASS_REDIRECT_HOME_URI` | SSO 완료 후 홈 redirect URI |
| `VITE_QSIGN_URL` | QSign 전자서명 서비스 URL |
| `VITE_CUBE_IAX_API_URL` | AI 검색 API URL |
| `VITE_CUBE_IAX_API_KEY` | AI 검색 API 키 |
| `VITE_FULL_URL` | 포털 전체 URL (공유 링크 등에 사용) |

---

## 라우팅 아키텍처

### 전략 요약

라우터는 두 단계로 초기화된다:

1. **즉시 렌더**: `mockMenuData`로 라우터를 동기적으로 생성해 흰 화면 없이 즉시 렌더
2. **교체**: 백엔드 메뉴 API (`/api/v1/menu`) 응답이 도착하면 실제 데이터로 라우터 교체

### 라우트 우선순위

```
staticRoutes (앞에 배치)
  ├── /                  → MainPage (항상 고정)
  ├── /sso               → OnePassSsoCallback
  ├── /sso-logout        → OnePassSsoLogout
  ├── /service/login     → Login
  ├── /service/loginBef  → LoginBefore
  ├── /service/find-id   → FindId
  ├── /service/find-password → FindPassword
  ├── /publishing/*      → 퍼블리싱 페이지 (autoRoutes)
  └── *                  → 404

dynamicRoutes (뒤에 배치, 메뉴 데이터 기반)
  └── componentMap에 등록된 menuId의 scrnUrlAddr 조합 경로
```

정적 라우트를 앞에 배치하는 이유: 동적 M 타입 메뉴의 `<Navigate to="/" />` 리다이렉트가  
MainPage를 덮어쓰는 것을 방지한다.

### 컴포넌트 등록 방법

새 페이지를 메뉴에 연결하려면 `src/routes/componentMap.js`에 등록:

```js
// componentMap.js
'M_PIIO_00XXX': {
  component: lazy(() => import('@pages/my-page/MyPage.jsx')),
  layout: 'SubpageLayoutWithMenu',  // 또는 'MenuProviderOnly'
},
```

child 경로(상세/수정 등)가 있는 경우 `src/routes/routeChildrenMeta.js`에도 반드시 추가:

```js
// routeChildrenMeta.js — React.lazy 없이 순수 경로 데이터만
'M_PIIO_00XXX': {
  children: [
    { path: ':id' },
    { path: ':id/edit' },
  ],
},
```

> **주의**: `componentMap.js`와 `routeChildrenMeta.js`는 항상 동기화해야 한다.  
> `routeChildrenMeta.js`를 누락하면 해당 child 경로에서 Breadcrumb·현재 메뉴 감지가 동작하지 않는다.

### 퍼블리싱 자동 라우팅

`src/publishing/*.jsx` 파일은 `autoRoutes.jsx`가 `import.meta.glob`으로 자동 인식하여  
파일명 기반 URL로 등록한다. `PublishingList.jsx`는 제외된다.

---

## 인증 아키텍처

### 토큰 보안 정책

| 토큰 | 저장 위치 | 이유 |
|------|----------|------|
| Access Token | 메모리 (Zustand) | XSS 탈취 방지. sessionStorage에 저장하지 않음 |
| Refresh Token | sessionStorage | 페이지 리로드 후 재발급에 필요 |
| Keycloak id_token | sessionStorage | 로그아웃 시 Keycloak logout URL 조립에 사용 |

페이지 리로드 시 `isLogin=true & token=null` 상태가 되면  
`TokenRefreshInitializer`가 `/api/v1/account/refresh`를 호출해 새 access token을 메모리에만 저장한다.

### OnePass SSO 흐름

```
1. 비로그인 상태 감지 (TokenRefreshInitializer)
2. Silent SSO 시도: window.location.replace() → OnePass 인증 서버로 redirect
   (sessionStorage에 진행 중 플래그 및 return URL 저장)
3. OnePass → /sso?code=XXX 로 콜백
4. OnePassSsoCallback: code로 /api/v1/auth/keycloak/callback/local-login 교환
5. ssoLogin() → useAuthStore 상태 갱신 → 메뉴 재로드
6. return URL로 복귀 (window.location.replace — basename 이중화 방지)
```

Silent SSO 중 Router 교체를 방지하는 가드:  
`/sso?code=...` 경로에서는 `setRouterInstance()` 호출을 건너뛴다  
(OAuth2 Authorization Code는 1회용이므로 컴포넌트 리마운트 시 재사용 방지).

### 다중 탭 로그아웃

`BroadcastChannel('auth_channel')`을 통해 로그아웃 이벤트를 모든 열린 탭에 전파한다.

### 통합회원 초기 비밀번호 (`initialPassword`)

- 백엔드 profile에 `initialPassword: true`가 포함되면 `useAuthStore`에 저장
- 로그인 후 초기 비밀번호 변경 안내 모달 표시
- 변경 완료 후 `dismissInitialPasswordNotice()` 호출

---

## 주요 모듈

### UserMenuContext (`src/context/UserMenuContext.jsx`)

현재 URL에 맞는 메뉴를 자동으로 감지하고, Breadcrumb·SideNavigation 데이터를 제공한다.

```jsx
const { currentMenu, breadcrumbItems, getSideNavigationData, getHeaderMenus } = useUserMenu();
```

| 제공값 | 설명 |
|-------|------|
| `menuTree` | 백엔드 원본 메뉴 트리 |
| `flatMenuMap` | `menuId` → 노드 flat map |
| `currentMenu` | 현재 URL 매칭 메뉴 (자동 계산) |
| `breadcrumbItems` | 현재 페이지 Breadcrumb 배열 |
| `getSideNavigationData()` | 현재 depth1 하위 사이드 메뉴 구조 |
| `getHeaderMenus()` | 헤더 GNB 메뉴 목록 |
| `getBreadcrumbItems(menuId?)` | 특정 menuId의 Breadcrumb |
| `findMenuById(menuId)` | ID로 메뉴 노드 조회 |
| `getFullPath(menuId)` | ID → 전체 URL 경로 |

### useAuthStore (`src/store/useAuthStore.jsx`)

Zustand + sessionStorage persist 기반 인증 상태 관리.

```jsx
const { isLogin, user, token, login, logout, ssoLogin, updateProfile, dismissInitialPasswordNotice } = useAuthStore();
```

### Silent SSO 유틸 (`src/utils/onepassSilentSso.js`)

```js
markSilentSsoStart()      // 시작 시: attempted/in-progress 플래그 + return URL 저장
finishSilentSso()         // 완료 시: in-progress/return URL 제거
resetSilentSsoFlags()     // 로그아웃 시: 모든 플래그 초기화
```

### PageViewTracker (`src/components/analytics/PageViewTracker.jsx`)

`SubpageLayoutWithMenu`, `MenuProviderOnly` 레이아웃에 자동으로 포함되어  
라우트 변경 시 PV/UV 통계 이벤트를 전송한다.

---

## 로컬 패키지

### @krds-ui/core (`packages/core/`)

React + TypeScript + Tailwind CSS 기반 UI 컴포넌트 라이브러리.

- 컴포넌트: Accordion, Badge, Breadcrumb, Button, Calendar, Checkbox, Chip, CriticalAlert 등
- 빌드: `cd packages/core && npm run build` 또는 `npm run build:core`
- Import: `import { Button } from '@krds-ui/core'` + `import '@krds-ui/core/dist/style.css'`

### @krds-ui/icon (`packages/icon/`)

아이콘 컴포넌트 라이브러리.

> 패키지를 수정한 후 반드시 `npm run build:packages`를 실행해야 변경사항이 앱에 반영된다.

---

## 빌드 최적화

HTTP/1.1 환경(연결 6개 제한)을 고려한 최적화 설정이 `vite.config.js`에 적용되어 있다.

### vendor 청크 통합

```js
manualChunks(id) {
  if (!id.includes('node_modules')) return;
  return 'vendor';
}
```

모든 `node_modules`를 `vendor.js` 하나로 통합한다.  
이유: 청크를 분리하면 초기 요청이 6~8개 동시 발생 → HTTP/1.1 연결 한계 초과 → Pending 상태.

### modulePreload 비활성화

```js
modulePreload: { resolveDependencies: () => [] }
```

브라우저가 CSS를 최우선으로 처리하도록 modulepreload 힌트를 제거한다.

### gzip 사전 압축

빌드 완료 후 `dist/assets`의 JS/CSS를 `.gz`로 사전 압축한다.  
nginx `gzip_static on;`과 함께 사용 — `ERR_CONTENT_LENGTH_MISMATCH` 방지.

> HTTP/2로 전환 시 위 세 가지 설정을 되돌릴 것.

### lazyWithRetry

`staticRoutes.jsx`와 `autoRoutes.jsx`에서 모든 `React.lazy()` 대신 사용:

```js
const lazyWithRetry = (importFn) =>
  lazy(() =>
    Promise.race([importFn(), timeoutPromise(8000)])
      .catch(() => { reloadOnce(); return new Promise(() => {}); })
  );
```

청크 로드 타임아웃(8초) 또는 실패 시 5초 쿨다운 후 1회 자동 새로고침.

---

## 알려진 이슈 및 해결 내역

### [해결] `Cannot read properties of undefined (reading 'default')` 간헐적 오류

**증상**: 일부 페이지에서 에러가 잠깐 나타났다가 사라짐.

**원인**: `UserMenuContext.jsx`가 `componentMap.js`(React.lazy 50개 포함)를 동기 import함.  
Vite가 `UserMenuContext`를 공유 청크에 배치할 때, 해당 청크 평가 시 `componentMap`이  
아직 초기화되지 않아 TDZ(Temporal Dead Zone)가 발생 → `undefined.default` 에러.  
두 번째 렌더 시 청크가 캐시되어 정상 동작하므로 "잠깐 뜨고 사라지는" 현상이 됨.

**해결**:
1. `routeChildrenMeta.js` 신규 생성 — React.lazy 없이 child 경로 메타데이터만 포함
2. `UserMenuContext.jsx`의 `import { componentMap }` → `import routeChildrenMeta`로 교체
3. `autoRoutes.jsx`의 `lazy()` → `lazyWithRetry()`로 교체

### [해결] URL 이중화 `/home-dev/home-dev/`

**원인**: Silent SSO 복귀 시 `navigate()` 사용 → React Router가 basename을 이중 적용.

**해결**: `window.location.replace()`로 교체 (basename 처리 없이 브라우저 URL 직접 이동).  
`onepassSilentSso.js`의 `getSilentSsoReturnUrl()`은 브라우저 전체 경로를 저장한다.

### [해결] 라우터 교체 시 경로 경쟁 조건

**원인**: `fetchMenuData()`가 빠르게 완료(~23ms)되면 React Router의 `navigate()` 이후  
`window.location`이 아직 갱신되지 않은 시점에 `createBrowserRouter`가 호출됨.

**해결**: `routes/index.jsx`에서 이전 라우터의 `state.location.pathname`을 읽어  
`window.location`과 불일치하면 `window.history.replaceState`로 동기화 후 라우터 교체.

### [해결] SSO 콜백 중 라우터 교체로 인한 code 재사용 오류

**원인**: 메뉴 fetch가 빠르게 완료되면 `/sso?code=...` 처리 중 라우터가 교체되어  
`OnePassSsoCallback`이 리마운트 → OAuth2 코드 재사용 시도 → 실패 → 로그인 리다이렉트.

**해결**: `routes/index.jsx`에서 현재 경로가 `/sso?code=...`이면 `setRouterInstance()` 호출 스킵.

---

## 유지보수 체크리스트

### 새 메뉴(T 타입) 추가 시

- [ ] `src/routes/componentMap.js`에 `menuId` → 컴포넌트 등록
- [ ] child 경로(`:id`, `save` 등)가 있으면 `src/routes/routeChildrenMeta.js`에도 동일하게 추가
- [ ] `componentMap.js`의 `layout` 값은 `'SubpageLayoutWithMenu'` 또는 `'MenuProviderOnly'` 중 선택

### 환경 설정 체크

- [ ] `.env.development`의 `VITE_ONEPASS_CLIENT_ID`가 Keycloak Admin Console에 등록되어 있는지 확인
- [ ] OnePass valid redirect URIs에 `VITE_ONEPASS_REDIRECT_SSO_URI` 등록 여부 확인

### 빌드 전 확인

- [ ] 로컬 패키지 수정 시 `npm run build:packages` 선행 실행
- [ ] `npm run lint`로 ESLint 오류 없는지 확인
