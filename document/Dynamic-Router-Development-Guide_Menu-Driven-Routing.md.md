# 동적 라우터 시스템 - 개발 가이드

## 🚀 빠른 시작 (Quick Start)

### 새 화면 추가하기 (3단계)

1. **컴포넌트 작성** (`src/pages/YourComponent.jsx`)
   ```jsx
   import { useUserMenu } from '../context/UserMenuContext';
   import SideNavigation from '../components/ui/SideNavigation';
   import Breadcrumb from '../components/ui/Breadcrumb';

   const YourComponent = () => {
     const { breadcrumbItems, getSideNavigationData } = useUserMenu();
     const sidebarData = getSideNavigationData();

     return (
       <>
         <SideNavigation 
           pageTitle={sidebarData.title} 
           menuItems={sidebarData.items} 
         />
         <Breadcrumb items={breadcrumbItems} />

         {/* 여기에 실제 페이지 컨텐츠 */}
       </>
     );
   };

   export default YourComponent;
   ```

2. **componentMap에 등록** (`src/routes/componentMap.js`)
   ```javascript
   import { lazy } from 'react';

   const YourComponent = lazy(() => import('../pages/YourComponent.jsx'));

   export const componentMap = {
     // ... 기존 코드

     'M_PIIO_00076': {  // 👈 백엔드 menuId와 정확히 일치해야 함
       component: YourComponent,
       layout: SubpageLayoutWithMenu,  // 레이아웃 선택
     },
   };
   ```

3. **끝!** 백엔드 메뉴 데이터에 해당 menuId가 있으면 자동으로 라우팅됨

---

## 📊 백엔드 메뉴 API 구조 이해하기

### API 엔드포인트
```
GET /api/v1/menu
```

### 응답 예제
```json
{
  "success": true,
  "data": {
    "menuId": "M_PIIO_00063",
    "menuNm": "사용자 최상위메뉴",
    "scrnTypeCd": "M",
    "scrnUrlAddr": "/",
    "depth": 0,
    "children": [
      {
        "menuId": "M_PIIO_00064",
        "menuNm": "신청·발급",
        "scrnTypeCd": "M",
        "scrnUrlAddr": "req",
        "depth": 1,
        "upendMenuExpsrYn": "Y",
        "lfsdMenuExpsrYn": "Y",
        "sortSeq": 1,
        "children": [
          {
            "menuId": "M_PIIO_00071",
            "menuNm": "사업공고",
            "scrnTypeCd": "M",
            "scrnUrlAddr": "pbanc",
            "depth": 2,
            "upendMenuExpsrYn": "Y",
            "lfsdMenuExpsrYn": "Y",
            "sortSeq": 3,
            "children": [
              {
                "menuId": "M_PIIO_00076",
                "menuNm": "사업공고",
                "scrnTypeCd": "T",
                "scrnUrlAddr": "pbanc",
                "depth": 3,
                "upendMenuExpsrYn": "Y",
                "lfsdMenuExpsrYn": "Y",
                "sortSeq": 1,
                "children": []
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 주요 필드 설명

| 필드 | 타입 | 설명 | 예시 |
|-----|------|------|------|
| `menuId` | String | 메뉴 고유 식별자 (componentMap의 키) | `M_PIIO_00076` |
| `menuNm` | String | 메뉴 표시 이름 | `사업공고` |
| `scrnTypeCd` | String | `M`: 디렉토리(메뉴), `T`: 페이지(Terminal) | `T` |
| `scrnUrlAddr` | String | URL 경로 세그먼트 | `pbanc` |
| `depth` | Number | 메뉴 계층 깊이 (0=루트, 1=상단메뉴, 2=중분류, 3=실제페이지) | `3` |
| `upMenuId` | String | 부모 메뉴 ID | `M_PIIO_00071` |
| `upendMenuExpsrYn` | String | 상단 메뉴(Header) 노출 여부 | `Y` / `N` |
| `lfsdMenuExpsrYn` | String | 좌측 메뉴(Sidebar) 노출 여부 | `Y` / `N` |
| `sortSeq` | Number | 정렬 순서 | `1`, `2`, `3`... |
| `children` | Array | 하위 메뉴 배열 | `[...]` |

---

## 🗺️ URL 생성 원리

### URL 조합 규칙
각 depth의 `scrnUrlAddr`를 조합하여 최종 경로 생성:

```
depth 0: /          (무시됨)
depth 1: req        (신청·발급)
depth 2: pbanc      (사업공고)
depth 3: pbanc      (사업공고 페이지)

→ 최종 URL: /req/pbanc/pbanc
```

### 실제 예제

#### 예제 1: 사업공고 페이지
```json
{
  "menuId": "M_PIIO_00076",
  "menuNm": "사업공고",
  "scrnTypeCd": "T",
  "depth": 3,
  "scrnUrlAddr": "pbanc",
  "upMenuId": "M_PIIO_00071"
}
```
→ **URL**: `/req/pbanc/pbanc`

#### 예제 2: AI 스마트 검색
```json
{
  "menuId": "M_PIIO_00074",
  "menuNm": "AI 스마트 검색",
  "scrnTypeCd": "T",
  "depth": 3,
  "scrnUrlAddr": "ai-smart-search",
  "upMenuId": "M_PIIO_00069"
}
```
→ **URL**: `/req/ai/ai-smart-search`

#### 예제 3: 증명서 발급
```json
{
  "menuId": "M_PIIO_00078",
  "menuNm": "증명서 발급",
  "scrnTypeCd": "T",
  "depth": 3,
  "scrnUrlAddr": "UI_USR_L_040",
  "upMenuId": "M_PIIO_00073"
}
```
→ **URL**: `/req/crtf/UI_USR_L_040`

---

## 📐 시스템 아키텍처

### 전체 데이터 흐름
```
┌─────────────────┐
│  백엔드 API     │
│ /api/v1/menu    │
└────────┬────────┘
         │ JSON (메뉴 트리)
         ↓
┌─────────────────┐
│ useMenuStore    │ ← Zustand 전역 상태
│ (메뉴 데이터 저장)│
└────────┬────────┘
         │
         ├─→ dynamicRoutes.jsx ──→ React Router (자동 라우트 생성)
         │
         └─→ UserMenuContext ────→ 컴포넌트
                 │
                 ├─→ Header (상단 메뉴)
                 ├─→ SideNavigation (좌측 메뉴)
                 └─→ Breadcrumb (경로 표시)
```

### 메뉴 타입별 처리

#### M 타입 (Menu/Directory)
- 실제 페이지 없음
- 하위 메뉴를 그룹화하는 디렉토리 역할
- 접근 시 첫 번째 T 타입 자식으로 자동 리다이렉트

#### T 타입 (Terminal/Page)
- 실제 페이지 컴포넌트와 매핑
- componentMap에 반드시 등록 필요
- 사용자가 직접 접근 가능한 페이지

---

## 📁 주요 파일 구조

```
src/
├── routes/
│   ├── componentMap.js       ⭐ menuId → 컴포넌트 매핑 (개발자가 수정)
│   ├── dynamicRoutes.jsx      메뉴 트리 → 라우트 변환 (자동)
│   ├── staticRoutes.jsx       고정 라우트 (로그인, 메인 등)
│   └── index.jsx              라우터 생성 및 초기화
│
├── store/
│   ├── useMenuStore.js       ⭐ 메뉴 데이터 전역 상태 (API 호출)
│   └── useSidebarStore.js     사이드바 open/close 상태
│
├── context/
│   └── UserMenuContext.jsx   ⭐ 메뉴 유틸리티 제공 (개발자가 사용)
│
├── layouts/
│   ├── SubpageLayout.jsx      기본 레이아웃 (Header + Footer)
│   └── index.jsx        레이아웃 조합 (WithMenu 등)
│
├── components/ui/
│   ├── Header.jsx            ⭐ 상단 메뉴 (자동 생성)
│   ├── SideNavigation.jsx    ⭐ 좌측 사이드바
│   └── Breadcrumb.jsx         경로 표시
│
├── pages/
│   ├── Pbanc.jsx             ⭐ 실제 페이지 컴포넌트들
│   ├── SprtBiz.jsx
│   └── ...
│
└── utils/
    └── menuUtils.js           경로 생성 함수
```

**⭐ 표시**: 개발자가 주로 수정/참조하는 파일

---

## 🔧 상세 개발 가이드

### 1. componentMap 등록 패턴

#### 패턴 A: 기본 페이지
```javascript
'M_PIIO_00076': {
  component: Pbanc,
  layout: SubpageLayoutWithMenu,
}
```

#### 패턴 B: 레이아웃 없는 전체 화면
```javascript
'M_PIIO_00074': {
  component: AiSmartSearch,
  layout: null,  // Header, Footer 없음
}
```

#### 패턴 C: 중첩 라우트 (목록 + 상세)
```javascript
'M_PIIO_00076': {
  component: Pbanc,           // 목록 페이지
  layout: SubpageLayoutWithMenu,
  children: [
    {
      path: ':id',            // 동적 파라미터
      component: PbancView,   // 상세 페이지
    },
    {
      path: 'create',         // 고정 경로
      component: PbancCreate,
    },
  ],
}
```

**중첩 라우트 URL 예시:**
- 목록: `/req/pbanc/pbanc`
- 상세: `/req/pbanc/pbanc/123`
- 생성: `/req/pbanc/pbanc/create`

#### 패턴 D: Lazy Loading (권장)
```javascript
// 즉시 로드 (중요한 페이지)
import AiSmartSearch from '../pages/AiSmartSearch.jsx';

// 지연 로드 (일반 페이지)
const Pbanc = lazy(() => import('../pages/Pbanc.jsx'));

export const componentMap = {
  'M_PIIO_00074': {
    component: AiSmartSearch,  // 즉시 로드
    layout: null,
  },
  'M_PIIO_00076': {
    component: Pbanc,          // 지연 로드
    layout: SubpageLayoutWithMenu,
  },
};
```

---

### 2. Layout 옵션

| 레이아웃 | 포함 요소 | 사용 사례 |
|---------|----------|----------|
| `SubpageLayoutWithMenu` | Header + Footer + UserMenuContext | 일반 서브페이지 (사이드바 사용) |
| `SubpageLayout` | Header + Footer | 단순 페이지 (사이드바 불필요) |
| `null` | 없음 | 전체 화면 (로그인, AI 검색 등) |

**UserMenuContext 포함 여부:**
- `SubpageLayoutWithMenu`: ✅ 포함 (사이드바, Breadcrumb 사용 가능)
- `SubpageLayout`: ❌ 미포함
- `null`: ❌ 미포함

---

### 3. UserMenuContext 활용

#### 제공 함수

```javascript
const {
  menuTree,              // 전체 메뉴 트리
  flatMenuMap,           // menuId → 메뉴 노드 맵
  currentMenu,           // 현재 URL에 해당하는 메뉴
  breadcrumbItems,       // Breadcrumb 데이터
  getSideNavigationData, // 사이드바 데이터 자동 생성
  getDepth1Parent,       // depth1 부모 찾기
  getMenuById,           // menuId로 메뉴 찾기
  findMenuByUrl,         // URL로 메뉴 찾기
} = useUserMenu();
```

#### 실전 예제: Pbanc.jsx

```javascript
import { useUserMenu } from '../context/UserMenuContext';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';

const Pbanc = () => {
  const { breadcrumbItems, getSideNavigationData } = useUserMenu();

  // 사이드바 데이터 자동 계산
  const sidebarData = getSideNavigationData();

  return (
    <>
      {/* 좌측 사이드바 */}
      <SideNavigation 
        pageTitle={sidebarData.title}     // "사업공고" (depth2 부모)
        menuItems={sidebarData.items}     // depth3 자식들
      />

      {/* 상단 경로 표시 */}
      <Breadcrumb items={breadcrumbItems} />

      {/* 페이지 컨텐츠 */}
      <div>
        <h1>사업공고 목록</h1>
        {/* ... */}
      </div>
    </>
  );
};
```

#### getSideNavigationData() 반환값

**현재 URL이 `/req/pbanc/pbanc`일 때:**

```javascript
{
  title: "사업공고",           // depth2 메뉴명
  items: [
    {
      menuId: "M_PIIO_00076",
      menuNm: "사업공고",
      link: "/req/pbanc/pbanc",
      children: []
    }
  ]
}
```

**현재 URL이 `/req/crtf/UI_USR_L_040`일 때:**

```javascript
{
  title: "증명서 발급",         // depth2 메뉴명
  items: [
    {
      menuId: "M_PIIO_00078",
      menuNm: "증명서 발급",
      link: "/req/crtf/UI_USR_L_040",
      children: []
    },
    {
      menuId: "M_PIIO_00079",
      menuNm: "발급 진위 확인",
      link: "/req/crtf/UI_USR_L_050",
      children: []
    },
    {
      menuId: "M_PIIO_00080",
      menuNm: "기타증명서",
      link: "/req/crtf/UI_USR_L_060",
      children: []
    }
  ]
}
```

---

### 4. Header 메뉴 자동 생성

Header는 백엔드 메뉴 데이터를 기반으로 자동 생성됩니다.

#### 표시 조건
- **depth 1** 메뉴 중 `upendMenuExpsrYn === 'Y'`인 것만 표시
- **depth 2** 자식 중 `lfsdMenuExpsrYn === 'Y'`인 것만 드롭다운 표시
- `sortSeq` 기준으로 정렬

#### 실제 렌더링 예제

**백엔드 데이터:**
```json
{
  "menuId": "M_PIIO_00064",
  "menuNm": "신청·발급",
  "depth": 1,
  "upendMenuExpsrYn": "Y",  // ✅ 표시됨
  "sortSeq": 1,
  "children": [
    {
      "menuId": "M_PIIO_00071",
      "menuNm": "사업공고",
      "depth": 2,
      "lfsdMenuExpsrYn": "Y",  // ✅ 드롭다운 표시
      "sortSeq": 3
    },
    {
      "menuId": "M_PIIO_00073",
      "menuNm": "증명서 발급",
      "depth": 2,
      "lfsdMenuExpsrYn": "Y",  // ✅ 드롭다운 표시
      "sortSeq": 5
    }
  ]
}
```

**렌더링 결과:**
```
┌────────────────────────────────────┐
│  신청·발급 ▼                        │
│    ├─ 사업공고                     │
│    └─ 증명서 발급                  │
└────────────────────────────────────┘
```

---

### 5. 중첩 라우트 구현하기

#### 부모 컴포넌트 (목록)

```javascript
// Pbanc.jsx (목록 페이지)
import { Outlet, Link } from 'react-router-dom';

const Pbanc = () => {
  return (
    <div>
      <h1>사업공고 목록</h1>

      {items.map(item => (
        <Link to={`/req/pbanc/pbanc/${item.id}`}>
          {item.title}
        </Link>
      ))}

      {/* 자식 라우트가 여기에 렌더링됨 */}
      <Outlet />
    </div>
  );
};
```

#### componentMap 설정

```javascript
'M_PIIO_00076': {
  component: Pbanc,
  layout: SubpageLayoutWithMenu,
  children: [
    {
      path: ':id',              // /req/pbanc/pbanc/123
      component: PbancView,
    },
  ],
}
```

#### 자식 컴포넌트 (상세)

```javascript
// PbancView.jsx (상세 페이지)
import { useParams } from 'react-router-dom';

const PbancView = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>사업공고 상세: {id}</h2>
    </div>
  );
};
```

---

## 🐛 트러블슈팅

### ❌ 라우트가 생성되지 않아요

**원인 1: menuId 불일치**
```javascript
// ❌ 잘못된 예
'M_PIIO_99999': {  // 백엔드에 없는 menuId
  component: Pbanc,
}

// ✅ 올바른 예
'M_PIIO_00076': {  // 백엔드 menuId와 정확히 일치
  component: Pbanc,
}
```

**원인 2: scrnTypeCd가 M 타입**
- M 타입(디렉토리)는 라우트로 변환되지 않음
- T 타입(페이지)만 componentMap에 등록 필요

**원인 3: 백엔드 메뉴 데이터 미로드**
```javascript
// useMenuStore 확인
console.log('menuTree:', useMenuStore.getState().menuTree);
```

---

### ❌ 사이드바가 안 나와요

**원인 1: UserMenuProvider 누락**
```javascript
// ❌ 잘못된 레이아웃
'M_PIIO_00076': {
  component: Pbanc,
  layout: SubpageLayout,  // UserMenuContext 없음
}

// ✅ 올바른 레이아웃
'M_PIIO_00076': {
  component: Pbanc,
  layout: SubpageLayoutWithMenu,  // UserMenuContext 포함
}
```

**원인 2: depth 구조 문제**
- 사이드바는 depth2 부모와 depth3 자식들로 구성
- depth3 메뉴가 없으면 사이드바 비어있음

**디버깅:**
```javascript
const sidebarData = getSideNavigationData();
console.log('사이드바 데이터:', sidebarData);
```

---

### ❌ URL이 이상해요

**원인: scrnUrlAddr 설정 오류**

백엔드에서 각 depth의 `scrnUrlAddr`를 확인:

```json
{
  "depth": 1,
  "scrnUrlAddr": "req",      // ✅
  "children": [{
    "depth": 2,
    "scrnUrlAddr": "pbanc",  // ✅
    "children": [{
      "depth": 3,
      "scrnUrlAddr": "pbanc" // ✅
    }]
  }]
}
```

→ 최종 URL: `/req/pbanc/pbanc` ✅

**빈 scrnUrlAddr:**
```json
{
  "depth": 2,
  "scrnUrlAddr": "",  // ❌ 문제!
}
```

---

### ❌ 페이지가 렌더링되지 않아요

**원인 1: Lazy Loading 미적용 컴포넌트**
```javascript
// ❌ Suspense 없음
const Pbanc = lazy(() => import('../pages/Pbanc.jsx'));

// ✅ dynamicRoutes.jsx에서 자동으로 Suspense 적용됨
// 개발자는 componentMap에만 등록하면 OK
```

**원인 2: 컴포넌트 import 오류**
```javascript
// ❌ 경로 오류
const Pbanc = lazy(() => import('../pages/Pbanc.jsx'));  // 파일 없음

// ✅ 파일 존재 확인
// src/pages/Pbanc.jsx 파일이 있는지 확인
```

---

## 📝 체크리스트

### ✅ 새 화면 추가 시

- [ ] 1. 페이지 컴포넌트 작성 (`src/pages/YourComponent.jsx`)
- [ ] 2. `useUserMenu()` 훅 import
- [ ] 3. `getSideNavigationData()` 호출 (사이드바 필요시)
- [ ] 4. `Breadcrumb` 추가 (필요시)
- [ ] 5. `componentMap.js`에 menuId 등록
- [ ] 6. Layout 선택 (WithMenu / 기본 / null)
- [ ] 7. Lazy import 적용 (일반 페이지)
- [ ] 8. 백엔드 팀에 menuId 요청 (신규 메뉴)

### ✅ 중첩 라우트 구현 시

- [ ] 1. 부모 컴포넌트에 `<Outlet />` 배치
- [ ] 2. `componentMap`에 children 배열 추가
- [ ] 3. 자식 라우트 path 정의 (`:id`, `create` 등)
- [ ] 4. `Link` 컴포넌트로 경로 연결
- [ ] 5. `useParams()` 훅으로 파라미터 접근

### ✅ 사이드 네비게이션 적용 시

- [ ] 1. Layout을 `SubpageLayoutWithMenu`로 설정
- [ ] 2. `useUserMenu()` 훅 import
- [ ] 3. `getSideNavigationData()` 호출
- [ ] 4. `SideNavigation` 컴포넌트 배치
- [ ] 5. 데이터 콘솔 출력으로 확인

---

## 🎯 실전 시나리오

### 시나리오 1: 신규 페이지 추가

**요구사항:**
- 메뉴명: "기업정보 조회"
- URL: `/req/info/UI_USR_L_999`
- 사이드바 필요

**백엔드 요청:**
```json
{
  "menuId": "M_PIIO_99999",
  "menuNm": "기업정보 조회",
  "scrnTypeCd": "T",
  "scrnUrlAddr": "UI_USR_L_999",
  "depth": 3,
  "upMenuId": "M_PIIO_00XXX",
  "upendMenuExpsrYn": "Y",
  "lfsdMenuExpsrYn": "Y"
}
```

**프론트 작업:**

1. 컴포넌트 작성:
```javascript
// src/pages/UI_USR_L_999.jsx
import { useUserMenu } from '../context/UserMenuContext';
import SideNavigation from '../components/ui/SideNavigation';

const CompanyInfo = () => {
  const { breadcrumbItems, getSideNavigationData } = useUserMenu();
  const sidebarData = getSideNavigationData();

  return (
    <>
      <SideNavigation 
        pageTitle={sidebarData.title} 
        menuItems={sidebarData.items} 
      />
      <div>
        <h1>기업정보 조회</h1>
        {/* 컨텐츠 */}
      </div>
    </>
  );
};

export default CompanyInfo;
```

2. componentMap 등록:
```javascript
// src/routes/componentMap.js
const CompanyInfo = lazy(() => import('../pages/UI_USR_L_999.jsx'));

export const componentMap = {
  // ...
  'M_PIIO_99999': {
    component: CompanyInfo,
    layout: SubpageLayoutWithMenu,
  },
};
```

3. 완료! 자동으로 라우트 생성됨

---

### 시나리오 2: 목록 + 상세 페이지

**요구사항:**
- 목록: `/req/pbanc/pbanc`
- 상세: `/req/pbanc/pbanc/:id`

**구현:**

```javascript
// componentMap.js
'M_PIIO_00076': {
  component: Pbanc,
  layout: SubpageLayoutWithMenu,
  children: [
    {
      path: ':id',
      component: PbancView,
    },
  ],
}

// Pbanc.jsx (목록)
import { Link, Outlet } from 'react-router-dom';

const Pbanc = () => {
  return (
    <>
      <div>
        {items.map(item => (
          <Link to={`/req/pbanc/pbanc/${item.id}`}>
            {item.title}
          </Link>
        ))}
      </div>
      <Outlet />  {/* PbancView가 여기 렌더링 */}
    </>
  );
};

// PbancView.jsx (상세)
import { useParams, Link } from 'react-router-dom';

const PbancView = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>공고 상세: {id}</h2>
      <Link to="/req/pbanc/pbanc">목록으로</Link>
    </div>
  );
};
```

---

## 💡 팁 & 모범 사례

### 1. menuId 네이밍 규칙 이해하기

```
M_PIIO_00076
│ │    └─ 일련번호
│ └────── 시스템 코드 (PIIO)
└──────── M = Menu

규칙:
- M으로 시작: 메뉴 ID
- S로 시작: 화면 ID (scrnId)
```

### 2. 성능 최적화

**Lazy Loading 활용:**
```javascript
// ✅ 일반 페이지는 lazy로
const Pbanc = lazy(() => import('../pages/Pbanc.jsx'));

// ✅ 중요한 페이지만 즉시 로드
import AiSmartSearch from '../pages/AiSmartSearch.jsx';
```

**메뉴 캐싱:**
- `useMenuStore`에서 메뉴 데이터 캐싱
- 페이지 새로고침 시에만 API 재호출

### 3. 디버깅 팁

```javascript
// 전체 메뉴 트리 확인
console.log('menuTree:', useMenuStore.getState().menuTree);

// 현재 메뉴 확인
const { currentMenu } = useUserMenu();
console.log('currentMenu:', currentMenu);

// 라우트 생성 확인
// routes/index.jsx의 console.log 출력 확인
```

### 4. 메뉴 데이터 없을 때 대처

```javascript
const { getSideNavigationData } = useUserMenu();
const sidebarData = getSideNavigationData();

// 데이터 없으면 렌더링 안 함
if (!sidebarData.items.length) {
  return null;
}

return <SideNavigation {...sidebarData} />;
```

---

## 🔗 관련 문서

- [React Router v6 공식 문서](https://reactrouter.com/)
- [Zustand 공식 문서](https://github.com/pmndrs/zustand)
- [React Lazy Loading 가이드](https://react.dev/reference/react/lazy)

---

## 📞 문의 및 지원

### 백엔드 메뉴 관련
- 신규 메뉴 추가/수정: 백엔드 팀에 요청
- API 엔드포인트: `/api/v1/menu`

### 프론트엔드 구현 관련
- componentMap 등록: 프론트엔드 팀
- 레이아웃 수정: `src/layouts/`
- 컴포넌트 개발: `src/pages/`

---

**작성일**: 2026-01-21  
**버전**: 1.0  
**작성자**: 개발팀
