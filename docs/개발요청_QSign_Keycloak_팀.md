# 개발 요청서 — QSign(Keycloak) 팀

> **요청일**: 2026-06-04  
> **문서 버전**: v1.1  
> **수신**: QSign / Keycloak 운영·개발팀  
> **발신**: 유관기관 연동 개발팀  
> **목적**: 유관기관 SSO(Single Sign-On) 정식 연동을 위한 QSign 설정 요청  
> **참조 표준**: OIDC Core 1.0, OAuth 2.0 RFC 6749, OpenID Connect Front/Back-Channel Logout 1.0

---

## 이 문서를 읽기 전에

본 문서는 **QSign(Keycloak)이 무엇을 해야 하는지**와 **왜 그렇게 해야 하는지**를  
함께 설명합니다. 각 요청 항목을 독립적으로 이해하고 처리할 수 있도록  
배경 → 문제 → 원인 → 요청 순서로 기술합니다.

**QSign의 역할 (한 줄 요약)**:  
QSign은 여러 유관기관 시스템이 공유하는 **중앙 인증 서버(IdP)** 입니다.  
사용자는 QSign에 한 번 로그인하면, 연동된 모든 유관기관 시스템에서  
별도 로그인 없이 이용할 수 있어야 합니다. 이것이 SSO의 목표입니다.

---

## 전체 SSO 구조 이해

```
┌────────────────────────────────────────────────────────────────────┐
│                           브라우저 (사용자)                          │
│                                                                    │
│  ┌──────────────────┐   ┌──────────────────┐   ┌────────────────┐  │
│  │  기관포털A 탭      │   │  기관포털B 탭      │   │  기관포털C 탭  │  │
│  │  portal-a.go.kr  │   │  portal-b.go.kr  │   │  portal-c...  │  │
│  └────────┬─────────┘   └────────┬─────────┘   └───────┬────────┘  │
└───────────│─────────────────────│───────────────────────│───────────┘
            │  OIDC Auth Code      │  OIDC Auth Code       │
            │  Flow redirect       │  Flow redirect        │
            └──────────┬───────────┘                       │
                       │                                   │
                       ▼                                   │
          ┌────────────────────────────────┐               │
          │  isso.smes.go.kr               │◀──────────────┘
          │  QSign (Keycloak IdP)          │
          │                                │
          │  • OIDC/OAuth2 인증 서버        │
          │  • Realm: ucube-qsign          │
          │  • KEYCLOAK_SESSION 쿠키 발행   │
          │  • 모든 유관기관 토큰 교환 처리  │
          └────────────────────────────────┘
                       ▲
                       │  로그인 화면 위임
                       │
          ┌────────────────────────────────┐
          │  onepass.smes.go.kr            │
          │  OnePass UI (인증 화면 제공)    │
          │  ※ 쿠키 발행 없음, UI만 담당   │
          └────────────────────────────────┘
```

**SSO가 동작하는 핵심 원리**:

```
1단계: 기관포털A에서 최초 로그인
  → 브라우저가 QSign으로 이동
  → 사용자가 OnePass 화면에서 ID/PW 입력
  → QSign이 isso.smes.go.kr 도메인에 KEYCLOAK_SESSION 쿠키 발행
  → 기관포털A로 code 발급 후 redirect → 로그인 완료

2단계: 동일 브라우저에서 기관포털B 접속
  → 브라우저가 QSign으로 이동 (기관포털B의 client_id로)
  → 브라우저가 KEYCLOAK_SESSION 쿠키를 isso.smes.go.kr로 자동 전송
  → QSign이 쿠키 확인 → 세션 유효 → 로그인 화면 없이 즉시 code 발급
  → 기관포털B로 redirect → SSO 로그인 완료 ✅

이 과정에서 QSign 설정이 올바르지 않으면:
  → Client ID 미등록 → "unknown client" 오류
  → Redirect URI 불일치 → "invalid_redirect_uri" 오류
  → 세션 설정 부재 → KEYCLOAK_SESSION 쿠키 미발행 → SSO 불가
```

---

## 목차

1. [Client 등록 및 Redirect URI 화이트리스트](#1-client-등록-및-redirect-uri-화이트리스트)
2. [SSO 세션 설정](#2-sso-세션-설정)
3. [CSRF 방어를 위한 state 파라미터 처리 정책](#3-csrf-방어를-위한-state-파라미터-처리-정책)
4. [로그아웃 연동 — Front-Channel Logout](#4-로그아웃-연동--front-channel-logout)
5. [로그아웃 연동 — Back-Channel Logout 등록 요청](#5-로그아웃-연동--back-channel-logout-등록-요청)
6. [직접 URL 접근 시 SSO 자동 처리 — prompt=none 지원](#6-직접-url-접근-시-sso-자동-처리--promptnone-지원)
7. [유관기관 간 상호 SSO 연동 정책 확인](#7-유관기관-간-상호-sso-연동-정책-확인)
8. [요청 항목 요약](#8-요청-항목-요약)

---

## 1. Client 등록 및 Redirect URI 화이트리스트

### 왜 필요한가?

OIDC Authorization Code Flow에서 QSign은 인증 완료 후  
사용자의 브라우저를 `redirect_uri`로 이동시키며 `code`를 전달합니다.  

이때 **QSign에 사전 등록된 redirect_uri**와 요청에 포함된 redirect_uri가  
**정확히 일치하지 않으면** QSign은 요청을 거부합니다.  
이는 공격자가 임의의 사이트로 code를 가로채는 것을 방지하는 필수 보안 장치입니다.

```
[공격 시나리오 — redirect_uri 검증이 없다면]

공격자가 조작한 Auth URL:
  GET .../auth?client_id=portal-a&redirect_uri=https://악의적사이트.com/steal

→ 사용자가 로그인 완료
→ code가 악의적사이트.com으로 전달
→ 공격자가 code로 access_token 획득
→ 사용자 계정 탈취

[redirect_uri 화이트리스트 검증이 있다면]
→ QSign이 "https://악의적사이트.com/steal"이 등록된 URI가 아님을 확인
→ 즉시 오류 반환 → 공격 차단
```

### 요청 사항

**Realm**: `ucube-qsign`

아래 각 유관기관 시스템의 Client를 Keycloak Admin Console에서 생성·확인하고,  
허용 Redirect URI가 정확히 등록되어 있는지 확인 및 조치 요청드립니다.

| Client ID | Redirect URI (정확히 일치해야 함) | 담당 기관 |
|-----------|----------------------------------|-----------|
| `기관A-client-id` | `https://www.portal-a.go.kr/sso/callback` | 기관포털A |
| `기관B-client-id` | `https://www.portal-b.go.kr/sso/callback` | 기관포털B |
| `기관C-client-id` | `https://www.portal-c.go.kr/auth/oidc/callback` | 기관포털C |
| *(추가 기관은 연동 시 별도 협의)* | | |

> ⚠️ **주의**: Redirect URI에 와일드카드(`*`) 또는 패턴 매칭 사용 금지.  
> 반드시 프로토콜(`https://`), 도메인, 경로까지 완전 일치하는 URI만 등록해야 합니다.  
> 슬래시 유무, 대소문자 차이도 불일치로 처리됩니다.

**Keycloak Admin Console 등록 경로**:
```
Keycloak Admin → Realm: ucube-qsign → Clients → [Client ID 선택]
→ Settings 탭 → Valid Redirect URIs 항목에 추가
```

**각 Client의 필수 설정값**:

| 설정 항목 | 권장값 | 이유 |
|-----------|--------|------|
| `Client Protocol` | `openid-connect` | OIDC 사용 |
| `Access Type` | `confidential` | client_secret 사용 (서버-서버 토큰 교환) |
| `Standard Flow Enabled` | `ON` | Authorization Code Flow 사용 |
| `Implicit Flow Enabled` | `OFF` | 보안 취약한 방식, 미사용 |
| `Direct Access Grants` | `OFF` | Resource Owner PW Grant 미사용 |
| `Valid Redirect URIs` | 위 표의 URI | 콜백 URI 화이트리스트 |
| `Web Origins` | 각 기관 도메인 | CORS 허용 |

---

## 2. SSO 세션 설정

### 왜 필요한가?

SSO의 핵심은 `KEYCLOAK_SESSION` 쿠키입니다.  
이 쿠키의 유효 시간이 짧으면 사용자가 자주 재로그인해야 하고,  
너무 길면 보안 위험이 커집니다.

또한 각 유관기관이 발급받는 `access_token`과 `refresh_token`의  
유효시간을 알아야, 각 기관 BE에서 **토큰 갱신 타이머를 올바르게 설정**할 수 있습니다.

```
[세션 시간 불일치로 발생하는 문제 예시]

QSign SSO Session Max: 8시간
기관포털A refresh_token 유효시간: 30분

→ 사용자가 30분 이상 비활성 시
→ 기관포털A의 refresh_token 만료 → 갱신 불가 → 강제 로그아웃
→ 기관포털A 로그인 버튼 → QSign으로 이동
→ KEYCLOAK_SESSION 쿠키 유효 → 로그인 화면 없이 code 즉시 발급
→ 사용자 입장: "로그인이 풀렸다가 다시 됨" → 혼란스러운 UX

→ 이를 방지하려면 refresh_token 유효시간 ≒ SSO Session Idle 설정이 맞아야 함
```

### 요청 사항

Realm `ucube-qsign`의 아래 설정값 현재값과 변경 가능 여부를 공유 요청드립니다.

**Keycloak Admin Console 확인 경로**:
```
Keycloak Admin → Realm: ucube-qsign → Realm Settings → Tokens 탭
```

| 설정 항목 | Keycloak 설정명 | 설명 | 현재값 (회신 요청) | 권장값 |
|-----------|----------------|------|--------------------|--------|
| SSO 세션 최대 시간 | `SSO Session Max` | 로그인 후 무조건 만료되는 절대 시간 | ? | 8~12시간 |
| SSO 세션 유휴 시간 | `SSO Session Idle` | 마지막 활동 이후 비활성 만료 시간 | ? | 30분~2시간 |
| Access Token 유효시간 | `Access Token Lifespan` | 발급된 JWT 유효시간 | ? | 5~30분 |
| Refresh Token 유효시간 | `Client Session Max` | refresh_token 최대 유효시간 | ? | SSO Session Max와 일치 권장 |
| Refresh Token 유휴 시간 | `Client Session Idle` | 갱신 없이 비활성 시 만료 | ? | SSO Session Idle과 일치 권장 |

**추가 확인 사항**:
- `Offline Session Max Limited`: 오프라인 세션(브라우저 재시작 후 유지) 활성화 여부
- `Remember Me` 기능 지원 여부 및 세션 연장 시간

---

## 3. CSRF 방어를 위한 state 파라미터 처리 정책

### 왜 필요한가?

`state`는 CSRF(Cross-Site Request Forgery) 공격을 막는 OIDC 표준 파라미터입니다.

```
[state 없이 SSO를 구현했을 때의 공격 시나리오]

1. 공격자가 피해자에게 아래 링크를 클릭하게 함
   https://isso.smes.go.kr/qsign/.../auth?client_id=portal-a
     &redirect_uri=https://www.portal-a.go.kr/sso/callback

2. 피해자가 로그인
   → QSign이 https://www.portal-a.go.kr/sso/callback?code=VICTIM_CODE 로 redirect

3. 공격자가 이 redirect를 가로채 자신의 세션에 code 주입
   → portal-a가 code로 access_token 발급
   → 공격자가 피해자 계정으로 로그인됨

[state를 사용했을 때]

1. 기관포털A FE가 로그인 시작 시:
   - 무작위 state 값 생성 (예: "a3f9k2m7")
   - sessionStorage에 저장
   - Auth URL에 포함: &state=a3f9k2m7

2. QSign이 콜백 시 state를 그대로 반환:
   → https://www.portal-a.go.kr/sso/callback?code=XXX&state=a3f9k2m7

3. 기관포털A FE가 검증:
   - sessionStorage의 "a3f9k2m7"과 콜백의 "a3f9k2m7" 비교
   - 일치 → 정상 처리
   - 불일치 또는 없음 → CSRF 공격 의심 → 즉시 로그인 거부

→ 공격자가 state 값을 모르므로 code 주입 불가
```

### 현재 상황 및 문제

현재 일부 유관기관에서 Auth URL에 `state` 파라미터를 포함하지 않거나,  
타 유관기관에서 우리 기관으로 사용자를 전달할 때 state를 생성하지 않는 경우가 있습니다.  
이로 인해 `state` 검증을 임시 비활성화한 상태입니다.  
**이는 보안상 취약한 임시 조치이므로 반드시 해소되어야 합니다.**

### 요청 사항

1. **QSign이 콜백에 state를 정상 반환하는지 확인**  
   - Auth URL에 `state=임의값` 포함 시 콜백에 동일한 `state` 반환 여부 테스트
   - 예: `GET .../auth?...&state=test-state-12345`
   - 기대 응답: `GET {redirect_uri}?code=XXX&state=test-state-12345`

2. **state 없는 요청에 대한 QSign의 현재 처리 방식 확인**  
   - `state` 파라미터 없이 Auth 요청 시 → 허용 or 거부?
   - 거부라면: 어떤 오류를 반환하는가?

3. **향후 정책 수립 협의**  
   - 모든 유관기관이 반드시 state를 포함해야 하는 정책 수립 요청
   - 타 유관기관에서 우리 기관으로 SSO 유입 시에도 state 포함 여부 정책

---

## 4. 로그아웃 연동 — Front-Channel Logout

### 왜 필요한가?

SSO 환경에서 한 기관에서 로그아웃했을 때 **QSign의 SSO 세션(KEYCLOAK_SESSION 쿠키)도 함께 제거되지 않으면**, 사용자가 로그아웃을 했음에도 불구하고 다른 기관에 접근 시 즉시 재로그인이 가능한 상태가 유지됩니다.

```
[로그아웃 연동이 없는 경우 — 현재 문제]

사용자가 기관포털A에서 "로그아웃" 클릭
  → 기관포털A 로컬 세션(JWT)만 삭제
  → isso.smes.go.kr의 KEYCLOAK_SESSION 쿠키는 그대로 존재

동일 브라우저에서 기관포털B 접속
  → QSign으로 redirect
  → 브라우저가 KEYCLOAK_SESSION 자동 전송
  → QSign: "세션 유효!" → 즉시 code 발급 → 기관포털B 로그인 성공 ❌
  
사용자가 로그아웃했는데 다른 기관은 여전히 로그인 상태

[로그아웃 연동이 있는 경우 — 목표 상태]

사용자가 기관포털A에서 "로그아웃" 클릭
  → 기관포털A BE가 QSign 로그아웃 엔드포인트 호출
  → QSign이 KEYCLOAK_SESSION 쿠키 삭제
  → isso.smes.go.kr 세션 무효화

동일 브라우저에서 기관포털B 접속
  → QSign으로 redirect
  → KEYCLOAK_SESSION 쿠키 없음 (삭제됨)
  → QSign: "세션 없음" → OnePass 로그인 화면 표시
  → 사용자가 로그아웃한 효과가 모든 기관에 적용됨 ✅
```

### 로그아웃 흐름 (OIDC RP-Initiated Logout)

```
[기관포털 FE]         [기관포털 BE]         [QSign]
      │                     │                   │
 로그아웃 클릭              │                   │
      │──POST /logout──────▶│                   │
      │    { kcIdToken }    │                   │
      │                     │──GET /logout──────▶│
      │                     │  ?id_token_hint=   │
      │                     │  {kcIdToken}       │
      │                     │  &post_logout_     │
      │                     │  redirect_uri=     │
      │                     │  {로그인페이지URL}  │
      │                     │                   │ KEYCLOAK_SESSION
      │                     │                   │ 쿠키 삭제
      │                     │◀──302 redirect────│
      │◀──로그인 페이지──────│                   │
```

**`id_token_hint`가 필요한 이유**:  
QSign은 어떤 사용자의 세션을 삭제해야 하는지 알기 위해 `id_token`이 필요합니다.  
`id_token_hint` 없이 로그아웃을 요청하면 QSign이 사용자를 특정할 수 없어  
세션을 삭제하지 못하거나 확인 화면을 표시합니다.

따라서 각 유관기관 FE는 로그인 시 발급받은 `id_token`을 안전하게 보관해야 합니다.

### 요청 사항

1. **QSign 로그아웃 엔드포인트 동작 확인**  
   - `id_token_hint` 포함 요청 시 `KEYCLOAK_SESSION` 쿠키가 정상 삭제되는지 테스트
   ```
   GET https://isso.smes.go.kr/qsign/realms/ucube-qsign/protocol/openid-connect/logout
     ?id_token_hint={발급받은 id_token}
     &post_logout_redirect_uri=https://www.portal-a.go.kr/login
   ```
   - 기대 동작: KEYCLOAK_SESSION 쿠키 삭제 + `post_logout_redirect_uri`로 이동

2. **`post_logout_redirect_uri` 화이트리스트 등록**  
   로그아웃 후 이동할 URL을 QSign에 사전 등록해야 합니다.  
   각 Client의 아래 경로를 `Valid Post Logout Redirect URIs`에 추가 요청드립니다.

   | Client ID | Post Logout Redirect URI |
   |-----------|--------------------------|
   | `기관A-client-id` | `https://www.portal-a.go.kr/login` |
   | `기관B-client-id` | `https://www.portal-b.go.kr/login` |
   | `기관C-client-id` | `https://www.portal-c.go.kr/login` |

   **Keycloak Admin Console 등록 경로**:
   ```
   Keycloak Admin → Realm: ucube-qsign → Clients → [Client ID]
   → Settings 탭 → Valid Post Logout Redirect URIs
   ```

3. **`id_token_hint` 없을 때의 동작 확인**  
   - id_token이 없는 경우(탭 종료 후 재방문 등) fallback 처리 방법 확인
   - `id_token_hint` 없이 로그아웃 요청 시 QSign이 세션을 삭제하는지 여부

---

## 5. 로그아웃 연동 — Back-Channel Logout 등록 요청

### 왜 필요한가?

Front-Channel Logout(섹션 4)은 브라우저를 통해 로그아웃 요청을 전달합니다.  
그러나 아래 상황에서는 브라우저 경로가 동작하지 않을 수 있습니다.

```
[Front-Channel Logout의 한계]

상황 1: 사용자가 브라우저 탭을 그냥 닫음
  → 로그아웃 버튼을 누르지 않음
  → QSign 세션이 유효시간까지 그대로 유지
  → 다른 사람이 같은 컴퓨터 사용 시 → 다른 기관 포털 접근 가능 ❌

상황 2: 관리자가 서버에서 강제 세션 만료
  → 브라우저를 통한 QSign 로그아웃 호출 불가
  → 각 SP에 로그아웃 전파 방법 없음

[Back-Channel Logout이 해결하는 것]

QSign이 서버-서버 HTTP POST로 모든 등록된 SP에 직접 로그아웃 이벤트 전달
  → 브라우저 없이도 세션 정리 가능
  → 서버에서 강제 만료도 즉시 전파 가능
```

### Back-Channel Logout 동작 흐름

```
[어느 기관에서든 로그아웃 이벤트 발생]

QSign 세션 만료 또는 로그아웃
        │
        ├─ HTTP POST → 기관포털A BE: /api/auth/backchannel-logout
        ├─ HTTP POST → 기관포털B BE: /api/auth/backchannel-logout
        └─ HTTP POST → 기관포털C BE: /api/auth/backchannel-logout

        각 기관 BE: logout_token JWT 검증 → 해당 사용자 세션 무효화

Body (application/x-www-form-urlencoded):
  logout_token=eyJhbGciOiJSUzI1NiJ9...  (JWT)

logout_token JWT 내부:
  {
    "iss": "https://isso.smes.go.kr/qsign/realms/ucube-qsign",
    "sub": "사용자 ID (UUID)",
    "sid": "QSign 세션 ID",
    "events": { "http://schemas.openid.net/event/backchannel-logout": {} },
    "iat": 1234567890,
    "exp": 1234567950
  }
```

### 요청 사항

각 Client에 아래 Back-Channel Logout URL을 등록해 주세요.

**Keycloak Admin Console 등록 경로**:
```
Keycloak Admin → Realm: ucube-qsign → Clients → [Client ID]
→ Settings 탭 → Logout Settings 섹션
  - Backchannel Logout URL: (아래 표의 URL 입력)
  - Backchannel Logout Session Required: ON  ← 반드시 ON
  - Backchannel Logout Revoke Offline Sessions: ON (권장)
```

| Client ID | Backchannel Logout URL | 비고 |
|-----------|------------------------|------|
| `기관A-client-id` | `https://www.portal-a.go.kr/api/auth/backchannel-logout` | 기관포털A BE |
| `기관B-client-id` | `https://www.portal-b.go.kr/api/auth/backchannel-logout` | 기관포털B BE |
| `기관C-client-id` | `https://www.portal-c.go.kr/api/auth/backchannel-logout` | 기관포털C BE |

> 📌 각 유관기관 BE는 이 엔드포인트를 구현하고 `logout_token`을 검증하는 로직을  
> 별도로 구현해야 합니다. (각 기관 개발팀 담당)

> 📌 `Backchannel Logout Session Required: ON`을 설정해야  
> QSign이 logout_token에 `sid` 클레임을 포함합니다.  
> `sid`가 있어야 각 기관이 어떤 세션을 만료해야 하는지 식별할 수 있습니다.

---

## 6. 직접 URL 접근 시 SSO 자동 처리 — prompt=none 지원

### 왜 필요한가?

사용자가 북마크나 바로가기로 유관기관 URL에 직접 접근하는 경우,  
해당 기관의 로컬 세션이 없어도 **QSign SSO 세션이 있다면 자동 로그인**이 가능해야  
진정한 SSO 경험을 제공할 수 있습니다.

```
[직접 URL 접근 시 현재 문제]

북마크: https://www.portal-b.go.kr/dashboard

사용자 접근 → 기관포털B 앱 로드 → 로컬 JWT 없음
→ 로그인 페이지 표시 ❌
(QSign에 유효한 SSO 세션이 있음에도 불구하고)

[prompt=none으로 해결]

사용자 접근 → 기관포털B 앱 로드 → 로컬 JWT 없음
→ 앱이 QSign으로 silent redirect
  &prompt=none  ← 이 파라미터가 핵심
→ KEYCLOAK_SESSION 쿠키 있음 → QSign이 로그인 화면 없이 즉시 code 발급
→ 기관포털B가 code로 JWT 발급 → 자동 로그인 ✅

→ KEYCLOAK_SESSION 쿠키 없음 → error=login_required 반환
→ 기관포털B가 로그인 페이지 표시 (정상)
```

### prompt=none 동작 명세 (OIDC 표준)

```
요청:
GET https://isso.smes.go.kr/qsign/realms/ucube-qsign/protocol/openid-connect/auth
  ?response_type=code
  &client_id=기관A-client-id
  &redirect_uri=https://www.portal-a.go.kr/sso/callback
  &scope=openid
  &prompt=none          ← 로그인/동의 화면 표시 금지
  &state=무작위값       ← CSRF 방어 (필수)

응답 케이스:

케이스 1 — SSO 세션 있음 (자동 로그인 성공):
  302 Redirect → https://www.portal-a.go.kr/sso/callback?code=XXX&state=무작위값

케이스 2 — SSO 세션 없음:
  302 Redirect → https://www.portal-a.go.kr/sso/callback
    ?error=login_required&state=무작위값
  → 기관포털A: 로그인 페이지 표시

케이스 3 — 추가 사용자 동의 필요:
  302 Redirect → https://www.portal-a.go.kr/sso/callback
    ?error=interaction_required&state=무작위값
  → 기관포털A: 로그인 페이지 표시 (사용자가 직접 동의해야 함)
```

### 요청 사항

1. **QSign이 `prompt=none` 파라미터를 지원하는지 확인**  
   - Keycloak 버전 및 설정에서 `prompt=none` 동작 여부 테스트
   - 위 3가지 케이스의 실제 동작 확인 후 결과 공유

2. **SameSite 쿠키 정책 확인**  
   - `KEYCLOAK_SESSION` 쿠키의 `SameSite` 속성 확인
   - `SameSite=Strict`이면 `prompt=none` redirect 시 쿠키가 전송되지 않아  
     SSO 세션 확인이 불가능합니다.
   - `SameSite=Lax` 또는 `SameSite=None; Secure` 이어야 합니다.

   ```
   현재 KEYCLOAK_SESSION 쿠키 설정 확인 요청:
     Domain: isso.smes.go.kr
     HttpOnly: ?
     SameSite: ?  ← Lax 이상이어야 prompt=none이 동작
     Secure: ?
   ```

---

## 7. 유관기관 간 상호 SSO 연동 정책 확인

### 왜 필요한가?

유관기관 시스템 간에 "연계 이동" 기능이 있는 경우,  
한 기관에 로그인된 사용자가 다른 기관 버튼을 클릭할 때  
로그인 화면 없이 자동으로 이동되어야 합니다.

```
[유관기관 간 SSO 연계 이동 흐름]

시나리오: 기관포털A에 로그인된 사용자가 "기관포털B 바로가기" 클릭

기관포털A FE → 기관포털B의 client_id로 QSign Auth URL 생성
  → window.open("https://isso.smes.go.kr/...
        ?client_id=기관B-client-id
        &redirect_uri=https://www.portal-b.go.kr/sso/callback
        ...", "_blank")

새 탭 열림 → QSign으로 이동
  → 동일 브라우저이므로 KEYCLOAK_SESSION 쿠키 자동 전송
  → QSign: 세션 유효 → 기관포털B redirect_uri로 code 발급
  → 기관포털B: code로 JWT 발급 → 자동 로그인 ✅

[핵심 질문]
기관포털A가 기관포털B의 client_id로 Auth URL을 생성하는 것이
QSign 정책상 허용되는가?
```

### 요청 사항

1. **상호 SSO 연계 이동 허용 정책 확인**  
   - 기관포털A가 `client_id=기관B-client-id`로 QSign Auth URL을 생성하는 것이 허용되는가?
   - 허용된다면: 별도 설정이 필요한가?
   - 허용되지 않는다면: 유관기관 간 SSO 연계 이동을 위한 대안 방법 제시 요청

2. **인바운드 SSO 유입 시 state 없는 요청 허용 정책**  
   ```
   시나리오:
   기관포털B가 사용자를 기관포털A로 보낼 때
   Auth URL에 state를 포함하지 않는 경우
   
   → 기관포털A 입장에서 sessionStorage에 state가 없음
   → state 검증 불가 → 임시 비활성화 필요
   
   이를 해소하기 위한 방법:
   - 모든 유관기관이 state를 포함하는 것을 정책으로 강제
   - 또는 인바운드 전용 callback 엔드포인트 분리 (state 검증 분기 처리)
   ```
   - 현재 정책 및 강제 방법 확인

3. **동일 Realm 내 Client 간 신뢰 관계 설정 필요 여부**  
   - 유관기관 간 SSO 연계 시 추가적인 Realm 설정이 필요한지 확인

---

## 8. 요청 항목 요약

| 번호 | 요청 항목 | 우선순위 | 선행 조건 여부 | 기한 |
|------|-----------|----------|---------------|------|
| 1 | Client 등록 및 Redirect URI 화이트리스트 | 🔴 긴급 | ✅ SSO 로그인의 전제조건 | 즉시 |
| 2 | SSO 세션 설정값 공유 | 🟠 높음 | ✅ 토큰 갱신 로직 구현 전제 | 1주 내 |
| 3 | state 파라미터 처리 정책 확인 | 🔴 긴급 | ✅ CSRF 보안 전제조건 | 즉시 |
| 4 | Front-Channel Logout 동작 확인 | 🟠 높음 | ❌ 동시 진행 가능 | 1주 내 |
| 5 | Back-Channel Logout URL 등록 | 🟠 높음 | ❌ 동시 진행 가능 | 1주 내 |
| 6 | prompt=none 지원 및 쿠키 정책 확인 | 🟡 보통 | ❌ 동시 진행 가능 | 2주 내 |
| 7 | 유관기관 간 상호 SSO 정책 확인 | 🟡 보통 | ❌ 연계 기능 구현 전 | 2주 내 |

---

## 문의 및 협의

요청 항목 중 정책적으로 불가하거나 Keycloak 버전 제한으로 불가능한 사항이 있으면  
대안을 함께 논의할 수 있도록 사전에 알려주시기 바랍니다.

**우선 긴급 처리 요청 항목**:
- **항목 1**: Client/Redirect URI 등록 — SSO 로그인 자체가 불가능한 상태이므로 즉시 처리 요청
- **항목 3**: state 파라미터 정책 — 보안 취약점 해소를 위해 즉시 확인 요청
