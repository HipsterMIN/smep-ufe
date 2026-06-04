# SSO 연동 통합 매뉴얼

> **작성일**: 2026-06-04  
> **대상 시스템**: QSign(Keycloak) · OnePass UI · SMEP(smep-ufe / smep-be) · 유관기관  
> **기준 인증 프로토콜**: OIDC Authorization Code Flow (OAuth 2.0)

---

## 목차

1. [전체 아키텍처 개요](#1-전체-아키텍처-개요)
2. [도메인 및 역할 정의](#2-도메인-및-역할-정의)
3. [QSign(Keycloak) — IdP 서버 담당 업무](#3-qsignkeycloak--idp-서버-담당-업무)
4. [OnePass UI — 인증 UI 담당 업무](#4-onepass-ui--인증-ui-담당-업무)
5. [SMEP — SP(서비스 제공자) 담당 업무](#5-smep--sp서비스-제공자-담당-업무)
6. [유관기관 — 타 SP 연동 담당 업무](#6-유관기관--타-sp-연동-담당-업무)
7. [SSO 세션 유지 및 확인 방법](#7-sso-세션-유지-및-확인-방법)
8. [로그아웃 처리 (Back-Channel Logout)](#8-로그아웃-처리-back-channel-logout)
9. [직접 URL 접근 시 SSO 보장 방법론](#9-직접-url-접근-시-sso-보장-방법론)
10. [보안 체크리스트](#10-보안-체크리스트)
11. [트러블슈팅 가이드](#11-트러블슈팅-가이드)

---

## 1. 전체 아키텍처 개요

### 1.1 구성요소 관계도

```
┌─────────────────────────────────────────────────────────────────┐
│                         브라우저 (사용자)                         │
│                                                                 │
│  ┌──────────────────┐        ┌──────────────────────────────┐   │
│  │  SMEP 탭          │        │  유관기관 탭 (sbiz24 등)      │   │
│  │  www.smes.go.kr  │        │  www.sbiz24.kr 등            │   │
│  └────────┬─────────┘        └──────────────┬───────────────┘   │
└───────────│──────────────────────────────────│───────────────────┘
            │                                  │
            │  Authorization Code Flow         │  Authorization Code Flow
            │  (redirect)                      │  (redirect)
            ▼                                  ▼
┌───────────────────────────────────────────────────────────────┐
│                isso.smes.go.kr (QSign / Keycloak)              │
│                                                               │
│  • OIDC/OAuth2 IdP                                            │
│  • Realm: ucube-qsign                                         │
│  • SSO 쿠키 발행 주체 (KEYCLOAK_SESSION)                       │
│  • 모든 SP 의 토큰 교환 처리                                    │
└───────────────────────────────────────────────────────────────┘
            ▲
            │  인증 UI 위임
            │
┌───────────────────────────────┐
│  onepass.smes.go.kr (OnePass) │
│  • 로그인/회원가입 UI          │
│  • 쿠키 발행 없음 (UI 역할만)  │
└───────────────────────────────┘
```

### 1.2 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **쿠키 발행 주체** | `isso.smes.go.kr` (QSign/Keycloak) 단독 발행 |
| **인증 UI 주체** | `onepass.smes.go.kr` (사용자 로그인 화면) |
| **SSO 세션 근거** | `KEYCLOAK_SESSION` 쿠키 (HttpOnly, SameSite=Lax) |
| **SP 토큰 교환** | 각 SP의 BE ↔ QSign 서버 간 직접 통신 |
| **state 파라미터** | CSRF 방어용, 타 유관기관 인바운드 시 검증 비활성화 가능 |

---

## 2. 도메인 및 역할 정의

### 2.1 도메인별 역할

| 도메인 | 역할 | 쿠키 발행 | 비고 |
|--------|------|-----------|------|
| `isso.smes.go.kr` | QSign (Keycloak IdP) | ✅ `KEYCLOAK_SESSION` | SSO 핵심 |
| `onepass.smes.go.kr` | OnePass 인증 UI | ❌ | 로그인 화면만 제공 |
| `www.smes.go.kr` | SMEP (smep-ufe / smep-be) | ✅ 자체 세션 토큰 | SP |
| `www.sbiz24.kr` | sbiz24 (유관기관 SP) | ✅ 자체 세션 토큰 | SP |
| `www.bizlink.kr` | bizlink (유관기관 SP) | ✅ 자체 세션 토큰 | SP |

### 2.2 Keycloak Client ID 매핑

| SP 시스템 | Client ID | Redirect URI |
|-----------|-----------|--------------|
| SMEP | `smes-prd` | `https://www.smes.go.kr/home/sso` |
| sbiz24 | `semas-sbiz24-prd` | `https://www.sbiz24.kr/qSignSsoPrcs` |
| MNA | `kvca-mna-prd` | `https://www.smes.go.kr/mna-iam/iam/oauth/loginCallback.do` |
| CoBiz | `ksca-cobiz-prd` | `https://www.smes.go.kr/cobiz-iam/iam/oauth/loginCallback.do` |
| BizLink | `kmtca-bizlink-prd` | `https://www.smes.go.kr/bizlink-iam/iam/oauth/loginCallback.do` |

---

## 3. QSign(Keycloak) — IdP 서버 담당 업무

### 3.1 역할 요약

QSign은 모든 SP의 **인증 허브**다. 브라우저가 QSign으로 redirect 될 때 이미 발행된
`KEYCLOAK_SESSION` 쿠키가 존재하면 로그인 화면 없이 즉시 `code`를 발급하여 SP의
콜백 URL로 redirect 한다. 이것이 SSO의 핵심 동작이다.

### 3.2 제공 엔드포인트

```
Realm Base URL:
  https://isso.smes.go.kr/qsign/realms/ucube-qsign

Authorization Endpoint:
  GET .../protocol/openid-connect/auth
  파라미터: response_type=code, client_id, redirect_uri, scope, state, nonce
  → 로그인 성공 시: {redirect_uri}?code=XXX&state=YYY

Token Endpoint:
  POST .../protocol/openid-connect/token
  Body: grant_type=authorization_code, code, redirect_uri, client_id, client_secret
  → 응답: { access_token, refresh_token, id_token, expires_in }

UserInfo Endpoint:
  GET .../protocol/openid-connect/userinfo
  Header: Authorization: Bearer {access_token}

Logout Endpoint:
  GET/POST .../protocol/openid-connect/logout
  파라미터: id_token_hint, post_logout_redirect_uri
```

### 3.3 SSO 쿠키 발행 메커니즘

```
사용자 최초 로그인 성공
        │
        ▼
QSign이 isso.smes.go.kr 도메인에 쿠키 설정
  Set-Cookie: KEYCLOAK_SESSION=xxx; Domain=isso.smes.go.kr; HttpOnly; SameSite=Lax

이후 동일 브라우저에서 다른 SP가 QSign으로 redirect
  GET https://isso.smes.go.kr/qsign/realms/.../auth?client_id=다른_SP_CLIENT_ID&...
        │
        ▼ 브라우저가 KEYCLOAK_SESSION 쿠키 자동 전송
        │
        ▼
QSign이 쿠키 확인 → 유효 → code 즉시 발급 → SP 콜백으로 redirect
   (로그인 화면 표시 없음 → SSO 성공)
```

### 3.4 QSign 담당 체크리스트

- [ ] **Client 등록**: 각 SP의 Client ID 및 Redirect URI 등록
- [ ] **Realm 설정**: `ucube-qsign` realm에서 세션 유효시간 설정
- [ ] **SSO Session Max**: 브라우저 세션 최대 유지 시간 설정
- [ ] **Client Secret 관리**: 각 SP의 client_secret 발급 및 갱신 정책
- [ ] **Back-Channel Logout URL**: 각 SP의 로그아웃 수신 URL 등록
- [ ] **PKCE 설정**: 공개 클라이언트 여부에 따라 PKCE 요구 설정
- [ ] **Scope 정의**: `openid`, `profile`, `email` 등 필요 scope 정의

---

## 4. OnePass UI — 인증 UI 담당 업무

### 4.1 역할 요약

OnePass(`onepass.smes.go.kr`)는 **사용자에게 보이는 로그인/회원가입 화면**을 제공한다.
**쿠키를 직접 발행하지 않는다.** 인증 로직은 QSign(Keycloak)에 위임하며,
사용자가 ID/PW를 입력하면 내부적으로 QSign에 자격증명을 전달한다.

```
사용자 → QSign auth URL 접근
           │
           ▼ QSign이 로그인 UI가 필요하면
           │ → onepass.smes.go.kr 로그인 페이지로 이동 (UI 위임)
           │
           ▼
사용자 ID/PW 입력 (OnePass 화면)
           │
           ▼
QSign이 자격증명 검증 → KEYCLOAK_SESSION 쿠키 발행 (isso.smes.go.kr)
           │
           ▼
SP의 redirect_uri로 code 전달
```

### 4.2 OnePass 담당 체크리스트

- [ ] **로그인 화면 UI**: ID/PW 입력, 소셜 로그인 버튼 등
- [ ] **회원가입 플로우**: 신규 사용자 등록
- [ ] **비밀번호 찾기**: 본인인증 후 재설정
- [ ] **MFA 설정 (옵션)**: OTP 등 추가 인증
- [ ] **로그인 실패 처리**: 오류 메시지 표시
- [ ] **인증서 로그인 (옵션)**: 공동인증서 연동

---

## 5. SMEP — SP(서비스 제공자) 담당 업무

### 5.1 인증 흐름 — SMEP 로그인

```
사용자가 SMEP 로그인 버튼 클릭
        │
        ▼
[FE] onePassGetAuthCode() 호출
  → window.location.href = QSign Auth URL
    client_id = smes-prd
    redirect_uri = https://www.smes.go.kr/home/sso

        │ QSign redirect
        ▼
[브라우저] https://www.smes.go.kr/home/sso?code=XXX

        │ React Router
        ▼
[FE] OnePassSsoCallback.jsx 실행
  1. pathname이 /sso 인지 검증 (path guard)
  2. URL에서 code 파라미터 추출
  3. 로컬 로그인 여부 확인 (useAuthStore)

  Case 1 (비로그인):
    POST /api/v1/auth/keycloak/callback/local-login { code }
    → accessToken, refreshToken, kcIdToken 수신
    → GET /api/v1/account/me → profile 수신
    → useAuthStore.ssoLogin(...)
    → navigate('/')

  Case 2 (이미 로컬 로그인):
    POST /api/v1/auth/keycloak/callback { code }
    → navigate('/')
```

### 5.2 핵심 파일

#### `src/pages/onepass/OnePassSsoCallback.jsx`

> SSO 콜백 처리의 핵심 컴포넌트

```javascript
// 핵심 로직 구조

// [가드 1] 경로 검증 — 라우터 교체 시 잘못된 경로에서 실행 방지
const currentPathname = window.location.pathname;
if (!currentPathname.endsWith('/sso')) {
  return; // /sso 경로가 아니면 즉시 종료
}

// [가드 2] 중복 실행 방지 (StrictMode / 리마운트 대응)
if (hasHandledRef.current) return;
hasHandledRef.current = true;

// [코드 추출] URL 파라미터에서 code 추출
const code = new URLSearchParams(window.location.search).get('code');

// [코드 없음] 비정상 콜백 처리
if (!code) {
  navigate('/service/login', { replace: true });
  return;
}

// [토큰 교환] BE 호출 분기
const hasLocalLogin = Boolean(authState?.isLogin && authState?.token);
const endpoint = hasLocalLogin
  ? '/api/v1/auth/keycloak/callback'
  : '/api/v1/auth/keycloak/callback/local-login';

await apiClient.post(endpoint, { code });
navigate('/', { replace: true });
```

#### `src/utils/keycloakGetAuthCode.js`

> QSign Auth URL 생성 유틸리티

```javascript
// 환경변수
VITE_QSIGN_URL = 'https://isso.smes.go.kr/qsign'
VITE_QSIGN_REALM = 'ucube-qsign'
VITE_ONEPASS_CLIENT_ID = 'smes-prd'
VITE_ONEPASS_REDIRECT_SSO_URI = 'https://www.smes.go.kr/home/sso'

// SMEP 자체 로그인 Auth URL
export function onePassGetAuthCode() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,           // smes-prd
    redirect_uri: REDIRECT_SSO_URI, // https://www.smes.go.kr/home/sso
    response_type: 'code',
    scope: 'openid',
  });
  window.location.href = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?${params}`;
}

// 유관기관 Auth URL 빌더 (outbound)
const buildAgencyAuthUrl = ({ clientId, redirectUri }) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid',
  });
  return `${AGENCY_QSIGN_URL}/realms/${REALM}/protocol/openid-connect/auth?${params}`;
};
```

#### `src/routes/staticRoutes.jsx`

> `/sso` 경로 등록

```javascript
{ path: '/sso', element: <OnePassSsoCallback /> }
// 또는 환경에 따라: { path: '/home/sso', element: <OnePassSsoCallback /> }
```

### 5.3 BE — KeycloakController 엔드포인트

```
POST /api/v1/auth/keycloak/callback/local-login
  역할: 비로그인 상태 사용자의 SSO 로그인
  입력: { code: "authorization_code" }
  처리: code → QSign token 교환 → 로컬 token 발급
  출력: { accessToken, refreshToken, kcIdToken }

POST /api/v1/auth/keycloak/callback
  역할: 이미 로컬 로그인된 사용자의 SSO 연결 확인
  입력: { code: "authorization_code" }
  처리: code → QSign token 교환 → 확인만
  출력: 성공 여부

POST /api/v1/auth/logout
  역할: 로그아웃
  입력: { kcIdToken }
  처리: QSign logout endpoint 호출
  출력: 성공 여부
```

### 5.4 SMEP FE 담당 체크리스트

- [x] **path guard**: `/sso` 경로 확인 후 SSO 처리 (완료)
- [x] **중복 실행 방지**: `hasHandledRef` 가드 (완료)
- [x] **code 없음 처리**: `/service/login` redirect (완료)
- [x] **Case1/Case2 분기**: 로컬 로그인 여부에 따른 엔드포인트 분기 (완료)
- [ ] **state 검증 재활성화**: hasState=true 확인 후 검증 코드 주석 해제
- [ ] **`prompt=none` 초기화 인터셉터**: 앱 최초 로드 시 SSO 세션 자동 확인
- [ ] **유관기관 외부 링크 버튼**: `HeaderUserMenu.jsx` 주석 처리된 버튼 활성화
- [ ] **로그아웃 전파**: Back-Channel Logout 또는 Front-Channel Logout 구현

### 5.5 SMEP BE 담당 체크리스트

- [ ] **`GlobalExceptionHandler.java`**: `HttpClientErrorException` 핸들러 추가 (Keycloak 교환 실패 시 500 → 4xx)
- [ ] **Back-Channel Logout 수신 엔드포인트**: QSign에서 POST로 전달받는 logout 핸들러
- [ ] **kcIdToken 보관**: 로그아웃 시 QSign에 전달할 id_token 관리
- [ ] **token 갱신**: refresh_token으로 access_token 갱신 엔드포인트

---

## 6. 유관기관 — 타 SP 연동 담당 업무

### 6.1 인바운드 SSO (타 유관기관 → SMEP)

타 유관기관 시스템에서 사용자가 **SMEP 연계 버튼**을 클릭하면 아래 흐름으로 진입한다.

```
[타 기관 시스템]
사용자가 "SMEP 바로가기" 버튼 클릭
        │
        ▼
타 기관 BE가 QSign Auth URL 생성
  client_id = smes-prd (SMEP의 Client ID)
  redirect_uri = https://www.smes.go.kr/home/sso

        │ 브라우저 redirect
        ▼
https://isso.smes.go.kr/qsign/realms/ucube-qsign/.../auth?client_id=smes-prd&...

        │ KEYCLOAK_SESSION 쿠키 자동 전송
        ▼
QSign이 쿠키 확인 → 세션 유효 → code 즉시 발급

        │ QSign redirect
        ▼
https://www.smes.go.kr/home/sso?code=XXX

        │ React Router
        ▼
[SMEP FE] OnePassSsoCallback.jsx
  → POST /api/v1/auth/keycloak/callback/local-login { code }
  → 로컬 토큰 발급 → navigate('/')
```

**핵심**: 타 유관기관 시스템이 QSign Auth URL을 생성할 때 **SMEP의 client_id와 redirect_uri**를 사용해야 한다.

### 6.2 아웃바운드 SSO (SMEP → 타 유관기관)

SMEP 헤더에서 유관기관 버튼 클릭 시 아래 흐름으로 진행한다.

```
[SMEP]
사용자가 헤더의 "sbiz24" 버튼 클릭
        │
        ▼
[FE] buildBizlinkAuthUrl() / buildCobizAuthUrl() / buildMnaAuthUrl() 호출
  → window.open(authUrl, '_blank')
  authUrl 예시:
    https://isso.smes.go.kr/qsign/realms/ucube-qsign/.../auth
      ?client_id=semas-sbiz24-prd
      &redirect_uri=https://www.sbiz24.kr/qSignSsoPrcs
      &response_type=code&scope=openid

        │ 새 탭에서 QSign으로 이동
        ▼
KEYCLOAK_SESSION 쿠키 자동 전송 (동일 브라우저)

        │ QSign 세션 확인
        ├─ 유효 → code 발급 → sbiz24 콜백 → 자동 로그인 ✅
        └─ 무효 → sbiz24 로그인 화면 표시
```

> **현재 상태**: `HeaderUserMenu.jsx`에서 유관기관 버튼이 주석 처리되어 있음. 활성화 여부 결정 필요.

### 6.3 유관기관 인바운드 처리 시 주의사항

#### state 검증 비활성화 이유

```
일반적인 SMEP 로그인 흐름:
  SMEP FE가 Auth URL 생성 시 sessionStorage에 state 저장
  → QSign 콜백으로 state 수신
  → sessionStorage의 state와 비교 검증

타 유관기관에서 인바운드 진입 시:
  타 기관의 BE가 Auth URL 생성 (SMEP FE가 state 저장 안 함)
  → QSign 콜백으로 state 수신
  → sessionStorage에 state 없음 → 검증 실패!

∴ 타 유관기관 인바운드를 허용하기 위해 state 검증을 임시 비활성화.
   hasState 로그를 통해 state 포함 여부 확인 후 검증 재활성화 여부 결정.
```

### 6.4 유관기관 담당 체크리스트

**타 유관기관 시스템 (인바운드 제공):**
- [ ] QSign에 자기 시스템 Client ID 등록 완료
- [ ] SMEP 연계 시 `client_id=smes-prd` 사용
- [ ] `redirect_uri=https://www.smes.go.kr/home/sso` 사용
- [ ] QSign에 위 redirect_uri 화이트리스트 등록

**SMEP (아웃바운드 제공):**
- [ ] 유관기관 버튼 활성화 여부 결정
- [ ] `buildCobizAuthUrl()` / `buildBizlinkAuthUrl()` / `buildMnaAuthUrl()` 검증
- [ ] `window.open()` vs `window.location.href` 방식 결정

---

## 7. SSO 세션 유지 및 확인 방법

### 7.1 SSO 세션 구조

```
[브라우저 세션 계층]

1. KEYCLOAK_SESSION (isso.smes.go.kr 도메인)
   ├─ 발행: QSign(Keycloak)
   ├─ 유효시간: realm 설정에 따름 (예: 8시간)
   ├─ 보안: HttpOnly, SameSite=Lax
   └─ 역할: SSO의 핵심 — 이 쿠키가 있으면 모든 SP에서 로그인 없이 code 발급

2. SMEP 로컬 세션 (www.smes.go.kr 도메인)
   ├─ 발행: smep-be (자체 JWT)
   ├─ 저장: Zustand persist (sessionStorage)
   ├─ 유효시간: accessToken 기준 (예: 30분)
   └─ 갱신: refreshToken으로 자동 갱신 (Header.jsx 타이머)

3. 유관기관 로컬 세션 (각 도메인)
   ├─ 각 SP가 독립적으로 관리
   └─ SSO 쿠키와 별도로 존재
```

### 7.2 세션 갱신 메커니즘

#### SMEP Access Token 갱신

```javascript
// src/components/ui/Header.jsx 내부 타이머 (예시)
setInterval(async () => {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return;

  const response = await apiClient.post('/api/v1/account/refresh', { refreshToken });
  useAuthStore.getState().updateToken(response.data.accessToken);
}, TOKEN_REFRESH_INTERVAL_MS); // 예: 25분마다
```

#### Keycloak SSO 세션 갱신

```
KEYCLOAK_SESSION은 SP가 직접 갱신하지 않는다.
QSign에 요청이 올 때마다 (토큰 갱신 포함) QSign이 자동으로 세션을 연장한다.
SP가 refresh_token으로 /token 엔드포인트를 호출할 때도 세션이 연장된다.
```

---

## 8. 로그아웃 처리 (Back-Channel Logout)

### 8.1 현재 상태 (미구현)

```
현재 문제:
  SMEP에서 로그아웃 → SMEP 로컬 세션만 삭제
  → KEYCLOAK_SESSION 쿠키는 isso.smes.go.kr에 여전히 존재
  → 다른 탭에서 sbiz24 접근 시 여전히 SSO 로그인 가능 (의도치 않은 세션 잔류)
```

### 8.2 프론트 채널 로그아웃 (Front-Channel Logout)

```
구현 방법:
1. SMEP 로그아웃 버튼 클릭
2. smep-be에 로그아웃 요청
3. smep-be → QSign logout endpoint 호출
   GET https://isso.smes.go.kr/qsign/realms/ucube-qsign/.../logout
     ?id_token_hint={kcIdToken}
     &post_logout_redirect_uri=https://www.smes.go.kr/service/login
4. QSign이 KEYCLOAK_SESSION 쿠키 삭제
5. post_logout_redirect_uri로 이동

필요 데이터:
  - kcIdToken: 로그인 시 BE에서 수신, FE Zustand에 보관
```

```javascript
// 로그아웃 시 kcIdToken 전달
const handleLogout = async () => {
  const { kcIdToken } = useAuthStore.getState();
  await apiClient.post('/api/v1/auth/logout', { kcIdToken });
  useAuthStore.getState().logout();
  navigate('/service/login');
};
```

### 8.3 백 채널 로그아웃 (Back-Channel Logout) — 권장

```
구현 방법:
1. QSign에 각 SP의 back-channel logout URL 등록
   예: https://www.smes.go.kr/api/v1/auth/backchannel-logout

2. 어느 SP에서든 로그아웃 발생 시
   QSign → (서버-서버 HTTP POST) → 모든 SP의 logout URL

3. SP BE에서 수신 후 해당 세션 무효화

장점:
  - 브라우저 없이도 동작 (탭 닫힌 상태도 가능)
  - 쿠키 차단 환경에서도 동작
  - 가장 확실한 세션 정리

구현 대상 엔드포인트 (smep-be):
  POST /api/v1/auth/backchannel-logout
  Body: { logout_token: "JWT" }
  처리: logout_token 검증 → 해당 세션 무효화 → 200 OK
```

---

## 9. 직접 URL 접근 시 SSO 보장 방법론

### 9.1 문제 상황

```
사용자 시나리오:
  1. SMEP에서 로그인 (KEYCLOAK_SESSION 쿠키 발행됨)
  2. sbiz24 URL을 북마크로 직접 접근

현재 문제:
  sbiz24 앱 로드 → 자체 세션 없음 → 로그인 페이지 표시
  (KEYCLOAK_SESSION이 있음에도 불구하고 SSO 효과 없음)
```

### 9.2 해결책 비교

| 방법 | 적용 위치 | 장점 | 단점 | 현재 SMEP 적용 여부 |
|------|-----------|------|------|---------------------|
| `prompt=none` redirect | FE 초기화 | SPA에 적합, 구현 간단 | 서드파티 쿠키 차단 환경 불가 | ❌ 미구현 |
| SSO Filter (서버 미들웨어) | BE 필터 | 확실, 모든 요청 커버 | 서버 코드 필요 | ❌ 미구현 |
| Keycloak JS Adapter | FE 라이브러리 | 공식 Keycloak 솔루션 | 라이브러리 의존 | ❌ 미사용 |
| SSO Agent (웹서버 플러그인) | 웹서버 앞단 | 앱 코드 불필요 | Oracle SSO/SiteMinder 등 레거시 | ❌ 해당없음 |

### 9.3 SMEP에 `prompt=none` 인터셉터 구현 (권장)

```javascript
// src/App.jsx 또는 라우터 초기화 시

async function checkSsoSession() {
  const { isLogin, token } = useAuthStore.getState();

  // 이미 로컬 로그인된 경우 SSO 확인 불필요
  if (isLogin && token) return;

  // 콜백 처리 중인 경우 중복 redirect 방지
  if (window.location.pathname.endsWith('/sso')) return;

  // QSign에 silent 세션 확인
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_SSO_URI,
    response_type: 'code',
    scope: 'openid',
    prompt: 'none',  // ← 핵심: 로그인 화면 표시 안 함
  });

  window.location.href = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?${params}`;
}

// 단, QSign이 prompt=none 지원 여부 및
// 브라우저 SameSite 정책 확인 필요
```

**`prompt=none` 응답 분기:**

```
응답 1: QSign 세션 있음
  → {redirect_uri}?code=XXX
  → OnePassSsoCallback이 자동 로그인 처리

응답 2: QSign 세션 없음
  → {redirect_uri}?error=login_required
  → 로그인 페이지 표시 (정상)

응답 3: 사용자 동의 필요
  → {redirect_uri}?error=interaction_required
  → 로그인 페이지 표시 (정상)
```

### 9.4 SSO Filter 방식 — Spring Security 구현

```java
// smep-be 구현 예시 (현재 미구현)
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SsoSessionFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        // API 요청은 필터 적용 제외
        if (request.getRequestURI().startsWith("/api/")) {
            chain.doFilter(request, response);
            return;
        }

        // 로컬 세션 유효성 확인
        if (hasValidLocalSession(request)) {
            chain.doFilter(request, response);
            return;
        }

        // 로컬 세션 없음 → QSign으로 redirect (원래 URL을 state에 저장)
        String originalUrl = request.getRequestURL().toString();
        String authUrl = buildQSignAuthUrl(originalUrl); // state에 originalUrl 포함
        response.sendRedirect(authUrl);
    }
}
```

---

## 10. 보안 체크리스트

### 10.1 CSRF 방어 (state 파라미터)

```
정상 플로우:
  1. SMEP FE: state 생성 → sessionStorage 저장
  2. Auth URL에 state 포함
  3. QSign 콜백으로 state 수신
  4. sessionStorage의 state와 비교 → 일치 시만 처리

현재 임시 비활성화:
  타 유관기관 인바운드 허용을 위해 state 검증 비활성화
  hasState 로그로 state 포함 여부 모니터링 중

재활성화 조건:
  - 모든 유관기관이 SMEP의 state를 포함하는 Auth URL 사용
  - 또는 인바운드 전용 별도 엔드포인트로 분리
```

### 10.2 Redirect URI 검증

```
QSign 관리자 설정:
  - 각 Client에 허용 redirect_uri 화이트리스트 등록 필수
  - 와일드카드 사용 금지 (예: https://www.smes.go.kr/*)

SMEP FE:
  - 하드코딩된 REDIRECT_SSO_URI 사용 (환경변수)
  - 사용자 입력으로 redirect_uri 동적 생성 금지
```

### 10.3 postMessage 보안

```javascript
// 유관기관 팝업 방식 사용 시
window.addEventListener('message', (event) => {
  // ✅ origin 검증 필수
  if (event.origin !== 'https://www.smes.go.kr') return;

  if (event.data.type === 'LOGIN_SUCCESS') {
    // 처리...
  }
});
```

### 10.4 토큰 보관 보안

```
kcIdToken (Keycloak ID Token):
  - 저장: Zustand persist (sessionStorage)
  - 용도: 로그아웃 시 QSign에 전달
  - 주의: sessionStorage는 탭 종료 시 삭제됨
    → 탭 종료 후 재접속 시 kcIdToken 없이 로그아웃하면
      QSign 세션이 남을 수 있음 (KEYCLOAK_SESSION 잔류)

개선 방안:
  - BE의 HttpSession에 id_token 보관 (STATELESS 정책 위반 검토 필요)
  - 또는 로그아웃 시 id_token 없어도 QSign 로그아웃하는 fallback
```

---

## 11. 트러블슈팅 가이드

### 11.1 SSO 로그인 성공 후 `/service/login`으로 이동하는 문제

**증상:**
```
[OnePassSsoCallback] navigate home ▶ {to: '/', reason: 'case1-local-login-success'}
[OnePassSsoCallback] effect start ▶ {pathname: '/home', hasSearch: false, hasHandled: false}
IN /sso  code=null
⚠ [OnePassSsoCallback] missing code branch
```

**원인:**
> `AppRouter`가 메뉴 API 응답 후 `setRouterInstance(createAppRouter(...))`로 전체 라우터를 교체.
> 이때 `OnePassSsoCallback`이 `/home/` 경로에서 재마운트 (`hasHandledRef=false` 리셋).
> `code=null` → missing code branch → `/service/login` 이동.

**해결 (완료):**
```javascript
// OnePassSsoCallback.jsx useEffect 최상단
const currentPathname = window.location.pathname;
if (!currentPathname.endsWith('/sso')) {
  return; // /sso가 아니면 즉시 종료
}
```

### 11.2 SSO 로그인이 안 되고 계속 로그인 페이지가 나오는 경우

**체크 포인트:**

1. QSign에 client_id / redirect_uri 등록 여부 확인
2. 브라우저 DevTools → Application → Cookies → `isso.smes.go.kr`에 `KEYCLOAK_SESSION` 존재 여부
3. Network 탭에서 QSign auth URL 요청 시 `error=invalid_redirect_uri` 여부
4. `OnePassSsoCallback` console에서 `code` 값 확인

### 11.3 중복 로그인 요청이 발생하는 경우 (StrictMode)

**원인:** React StrictMode에서 useEffect가 2회 실행됨

**해결 (완료):**
```javascript
if (hasHandledRef.current) {
  console.log(`${LOG_PREFIX} duplicate effect blocked`);
  return;
}
hasHandledRef.current = true;
```

### 11.4 로그아웃 후 다른 SP에서 여전히 로그인 상태인 경우

**원인:** KEYCLOAK_SESSION 쿠키가 `isso.smes.go.kr`에 잔류

**확인:**
```
브라우저 DevTools → Application → Cookies → isso.smes.go.kr
KEYCLOAK_SESSION 쿠키 존재 여부 확인
```

**해결:**
- `kcIdToken`을 포함하여 QSign logout endpoint 호출 (BE에서 처리)
- Back-Channel Logout 구현 (모든 SP에 로그아웃 전파)

### 11.5 콘솔 로그 분석 가이드

```
[정상 SSO 로그인 흐름]
[OnePassSsoCallback] effect start ▶ {pathname: '/sso', hasSearch: true, hasHandled: false}
[OnePassSsoCallback] mark handled ▶ {hasHandled: true}
[OnePassSsoCallback] parsed callback params ▶ {hasCode: true, codeLength: 43, hasState: true, ...}
[OnePassSsoCallback] exchange start ▶ {endpoint: '.../local-login', hasCode: true}
[OnePassSsoCallback] exchange success ▶ {hasAccessToken: true, ...}
[OnePassSsoCallback] account me success ▶ {hasProfile: true, ...}
[OnePassSsoCallback] navigate home ▶ {to: '/', reason: 'case1-local-login-success'}

[비정상 — code 없음]
[OnePassSsoCallback] not on /sso path, skipping  ← path guard 동작 (정상)
또는
⚠ [OnePassSsoCallback] missing code branch  ← code 없는 비정상 콜백

[비정상 — 토큰 교환 실패]
✖ [OnePassSsoCallback] exchange failed ▶ {message: '...', status: 400}
```

---

## 부록

### A. 환경 변수 목록 (smep-ufe `.env.production`)

```env
VITE_QSIGN_URL=https://isso.smes.go.kr/qsign
VITE_QSIGN_REALM=ucube-qsign
VITE_ONEPASS_CLIENT_ID=smes-prd
VITE_ONEPASS_REDIRECT_SSO_URI=https://www.smes.go.kr/home/sso
VITE_AGENCY_QSIGN_URL=https://isso.smes.go.kr/qsign
VITE_MNA_REDIRECT_URI=https://www.smes.go.kr/mna-iam/iam/oauth/loginCallback.do
VITE_COBIZ_REDIRECT_URI=https://www.smes.go.kr/cobiz-iam/iam/oauth/loginCallback.do
VITE_BIZLINK_REDIRECT_URI=https://www.smes.go.kr/bizlink-iam/iam/oauth/loginCallback.do
```

### B. OIDC Authorization Code Flow 전체 시퀀스

```
사용자       SMEP FE         SMEP BE       QSign (Keycloak)    OnePass UI
  │             │                │                │                  │
  │─로그인클릭─▶│                │                │                  │
  │             │                │                │                  │
  │             │─Auth URL 생성─▶│ (선택: BE 생성)│                  │
  │             │                │                │                  │
  │◀─redirect──│                │                │                  │
  │─────────────────────────────▶│  GET /auth?... │                  │
  │             │                │◀─KEYCLOAK_SESSION─────────────────│
  │             │                │  쿠키 없음     │                  │
  │             │                │                │─로그인UI 표시──▶│
  │◀──────────────────────────────────────────────────────── 로그인페이지
  │─ID/PW 입력──────────────────────────────────────────────▶│
  │             │                │                │◀─자격증명전달──│
  │             │                │                │─쿠키발행───────▶│
  │             │                │◀─redirect with code────────────── │
  │◀─redirect──────────────────────────────────── /sso?code=XXX     │
  │─────────────▶│                │                │                  │
  │             │─POST /callback/local-login──────▶│                  │
  │             │                │─서버-서버────▶│                  │
  │             │                │ POST /token    │                  │
  │             │                │◀─tokens────────│                  │
  │             │◀─{accessToken, refreshToken}─────│                  │
  │             │─GET /account/me▶│                │                  │
  │             │◀─profile────────│                │                  │
  │             │─useAuthStore.ssoLogin()           │                  │
  │◀─홈 화면────│                │                │                  │
```

### C. 관련 파일 경로 목록

```
smep-ufe/
├── src/
│   ├── pages/onepass/OnePassSsoCallback.jsx    # SSO 콜백 처리
│   ├── utils/keycloakGetAuthCode.js            # Auth URL 빌더
│   ├── store/useAuthStore.jsx                  # 인증 상태 관리
│   ├── routes/staticRoutes.jsx                 # /sso 경로 등록
│   ├── routes/index.jsx                        # AppRouter (라우터 교체 주의)
│   └── components/ui/header/HeaderUserMenu.jsx # 유관기관 버튼 (주석)
└── .env.production                             # 환경 변수

smep-be/
├── src/main/java/kr/go/smes/account/
│   ├── api/KeycloakController.java             # /callback, /callback/local-login
│   ├── api/SsoAuthController.java              # 로컬 개발용 (@Profile("local"))
│   └── api/OidcController.java                 # /api/me (OIDC user info)
```
