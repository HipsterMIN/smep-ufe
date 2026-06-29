# IDO (OnePass-BE) 개발 요청서
_작성일: 2026-06-04_  
_수신: IDO (OnePass-BE) 개발팀_  
_참조: Q-IM 개발팀 / SMEP FE (smep-ufe) 팀_

---

> **이 문서의 전제**  
> IDO(OnePass-BE)는 인증 오케스트레이션의 **핵심 BFF 서버**입니다.  
> 브라우저는 IDO를 통해서만 Q-Sign 및 Q-IM과 간접적으로 통신합니다.  
> IDO는 모든 인증/회원 처리의 **결과를 Kafka Outbox 패턴으로 안정적으로 발행**해야 합니다.

---

## 목차

1. [IDO 역할 정의](#1-ido-역할-정의)
2. [아키텍처 내 위치](#2-아키텍처-내-위치)
3. [전체 로그인 시퀀스](#3-전체-로그인-시퀀스)
4. [FE 대상 API 명세](#4-fe-대상-api-명세)
5. [Q-Sign 연동 상세](#5-q-sign-연동-상세)
6. [Q-IM 연동 상세](#6-q-im-연동-상세)
7. [세션/토큰 설계](#7-세션토큰-설계)
8. [로그아웃 처리](#8-로그아웃-처리)
9. [Kafka Outbox 패턴 — 상세 설계](#9-kafka-outbox-패턴--상세-설계)
10. [보안 원칙](#10-보안-원칙)
11. [오류 처리 표준](#11-오류-처리-표준)
12. [개발 우선순위 및 단계](#12-개발-우선순위-및-단계)
13. [인수 조건](#13-인수-조건)

---

## 1. IDO 역할 정의

### 1.1 IDO가 하는 일

| 책임 | 설명 |
|------|------|
| **인증 URL 생성** | Q-Sign 로그인 URL 생성 (`state`, `nonce`, PKCE `code_verifier` 포함) |
| **코드 교환** | FE로부터 받은 `code`를 Q-Sign 토큰으로 교환 (서버→서버) |
| **토큰 검증** | Q-Sign ID Token의 서명·만료·nonce 검증 |
| **회원 식별** | Q-IM `/members/resolve` 호출로 통합 글로벌 ID 확보 |
| **매핑 조회** | Q-IM `/members/{globalId}/mappings` 조회 |
| **세션 발급** | 유관기관 자체 JWT 또는 세션 쿠키 발급 |
| **갱신 처리** | Refresh Token으로 세션 연장 |
| **로그아웃** | Front-Channel + Back-Channel Logout 처리 |
| **이벤트 발행** | 모든 인증 이벤트를 Kafka Outbox 패턴으로 안정 발행 |

### 1.2 IDO가 하지 않는 일

| 항목 | 담당 |
|------|------|
| 인증(비밀번호 검증) | Q-Sign(Keycloak) |
| 로그인 UI | OnePass UI |
| 통합 회원 관리 | Q-IM |
| 브라우저 직접 토큰 노출 | 금지 — BFF 패턴 원칙 |

---

## 2. 아키텍처 내 위치

```
┌──────────────────────────────────────────────────────────────────────┐
│                          브라우저 (사용자)                             │
│                                                                      │
│  로그인 버튼 클릭                   /oauth/callback 팝업              │
│       │                                   │                          │
│       ▼                                   ▼                          │
│  [1] GET /api/v1/auth/login-url    [2] POST /api/v1/auth/exchange    │
└───────────────────────────────────────────────────────────────────────┘
                │                                   │
                ▼                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      IDO (OnePass-BE)  ← 이 문서 대상                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  AuthController                                              │     │
│  │  ├── GET  /api/v1/auth/login-url      (URL 생성)             │     │
│  │  ├── POST /api/v1/auth/exchange       (코드 교환)            │     │
│  │  ├── POST /api/v1/auth/refresh        (토큰 갱신)            │     │
│  │  ├── POST /api/v1/auth/logout         (로그아웃)             │     │
│  │  └── POST /api/v1/auth/backchannel-logout (Keycloak Hook)   │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  AccountController                                           │     │
│  │  ├── GET  /api/v1/account/me          (내 정보)              │     │
│  │  └── GET  /api/v1/account/companies   (내 기업 목록)         │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  Outbox Processor (Kafka Outbox Pattern)                     │     │
│  │  └── 이벤트 테이블 → Kafka 발행                              │     │
│  └─────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
         │                          │                      │
    Q-Sign 호출                Q-IM 호출             Kafka 발행
         │                          │                      │
         ▼                          ▼                      ▼
   ┌──────────┐              ┌──────────┐          ┌──────────────┐
   │ Q-Sign   │              │  Q-IM    │          │  Kafka       │
   │(Keycloak)│              │          │          │  Broker      │
   └──────────┘              └──────────┘          └──────────────┘
```

---

## 3. 전체 로그인 시퀀스

```
FE(팝업창)       FE(부모창)         IDO(BE)          Q-Sign         Q-IM
    │                │                │                 │              │
    │ 로그인 버튼     │                │                 │              │
    │─────────────────────────────────▶                │              │
    │                │         GET /auth/login-url      │              │
    │                │         state/nonce 생성          │              │
    │                │         DB에 state 임시 저장      │              │
    │◀─────────────────────────────────                │              │
    │ loginUrl 수신   │                │                 │              │
    │                │                │                 │              │
    │ 팝업 열기       │                │                 │              │
    │──────────────────────────────────────────────────▶              │
    │                │                │     Q-Sign 로그인 화면         │
    │                │                │    (OnePass UI 위임)           │
    │                │                │                 │              │
    │                │                │    사용자 인증 완료             │
    │◀──────────────────────────────────────────────────              │
    │ /oauth/callback?code=xxx&state=yyy                │              │
    │                │                │                 │              │
    │─────────────────────────────────▶                │              │
    │                │  POST /auth/exchange             │              │
    │                │  {code, state, redirectUri}      │              │
    │                │                │                 │              │
    │                │         [1] state 검증            │              │
    │                │         [2] Q-Sign 토큰 교환──────▶              │
    │                │                │◀────── id_token + access_token │
    │                │         [3] id_token 검증         │              │
    │                │         [4] Q-IM resolve ─────────────────────▶ │
    │                │                │◀───────────────── {globalId}   │
    │                │         [5] Q-IM mappings ─────────────────────▶│
    │                │                │◀───────────────── {mappings}   │
    │                │         [6] 자체 JWT 발급          │              │
    │                │         [7] Outbox 이벤트 기록     │              │
    │◀─────────────────────────────────                │              │
    │ 200 {accessToken, profile}      │                 │              │
    │                │                │                 │              │
    │ postMessage(LOGIN_SUCCESS)       │                 │              │
    │────────────────▶                │                 │              │
    │ 팝업 닫힘       │ useAuthStore   │                 │              │
    │                │ .login() 호출   │                 │              │
```

---

## 4. FE 대상 API 명세

### 4.1 `GET /api/v1/auth/login-url`

**목적**: Q-Sign 인증 페이지 URL을 생성해서 FE에 반환합니다.  
FE는 이 URL로 팝업 창을 엽니다.

**요청**: 쿼리 파라미터 없음 (인증 불필요)

**처리 흐름**:
```
1. UUID v4 기반 state 생성
2. UUID v4 기반 nonce 생성
3. PKCE: code_verifier(랜덤 43~128자) → code_challenge(SHA-256 Base64URL)
4. {state, nonce, code_verifier, 생성시각} → DB 또는 Redis에 5분 TTL로 저장
5. Q-Sign authorize URL 조립 후 반환
```

**응답 예시**:
```json
{
  "loginUrl": "https://isso.smes.go.kr/realms/ucube-qsign/protocol/openid-connect/auth?client_id=smep-bff&response_type=code&scope=openid%20profile%20email&redirect_uri=https%3A%2F%2Fwww.smes.go.kr%2Foauth%2Fcallback&state=opaque-state-uuid&nonce=opaque-nonce-uuid&code_challenge=base64url-encoded-challenge&code_challenge_method=S256",
  "state": "opaque-state-uuid"
}
```

> `state` 값은 FE가 `/oauth/callback` 진입 시 URL 파라미터의 `state`와 동일한지 확인하는 용도로 사용합니다.  
> FE가 직접 검증하지 않더라도 IDO가 exchange 단계에서 반드시 검증합니다.

---

### 4.2 `POST /api/v1/auth/exchange`

**목적**: Q-Sign 인증 완료 후 FE callback이 받은 `code`와 `state`를 IDO에 전달하면, IDO가 모든 서버 처리를 완료하고 업무용 JWT를 반환합니다.

**요청**:
```json
{
  "code": "authorization-code-from-qsign",
  "state": "opaque-state-uuid",
  "redirectUri": "https://www.smes.go.kr/oauth/callback"
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `code` | ✅ | Q-Sign이 callback URL에 담아준 인가 코드 |
| `state` | ✅ | Q-Sign이 callback URL에 담아준 state (CSRF 검증용) |
| `redirectUri` | ✅ | Q-Sign에 등록된 redirect URI (토큰 교환 시 Q-Sign이 재검증) |

**내부 처리 순서** (상세는 5, 6절):
```
[1] state DB 조회 → 없거나 만료 시 즉시 실패 (400 STATE_MISMATCH)
[2] Q-Sign /token 엔드포인트 호출 (code + code_verifier 포함)
[3] Q-Sign id_token 검증 (서명, iss, aud, exp, nonce)
[4] state 레코드 삭제 (일회성)
[5] Q-IM POST /members/resolve 호출
[6] 계정 status 확인 → LOCKED/WITHDRAWN 시 실패 반환
[7] Q-IM GET /members/{globalId}/mappings 호출
[8] 업무용 JWT 발급
[9] Outbox 이벤트 기록 (DB 트랜잭션 내)
[10] 응답 반환
```

**성공 응답**:
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "profile": {
    "globalId": "gid-xxxx-xxxx-xxxx",
    "name": "홍길동",
    "email": "user@example.com",
    "currentCompany": {
      "companyId": "C001",
      "companyName": "샘플기업",
      "bizNo": "123-45-67890",
      "role": "ADMIN"
    },
    "linkedCompanies": [
      {
        "companyId": "C001",
        "companyName": "샘플기업",
        "role": "ADMIN"
      }
    ]
  }
}
```

**실패 응답 예시** (계정 잠금):
```json
{
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "계정이 잠금 상태입니다. 관리자에게 문의하세요.",
    "requestId": "req-uuid"
  }
}
```

---

### 4.3 `POST /api/v1/auth/refresh`

**목적**: Access Token 만료 시 Refresh Token으로 갱신합니다.

**요청**:
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9..."
}
```

**내부 처리**:
```
[1] Refresh Token 서명 검증 + 만료 확인
[2] Refresh Token이 블랙리스트(로그아웃 목록)에 없는지 확인
[3] 새 Access Token + 새 Refresh Token 발급 (Rotation)
[4] 이전 Refresh Token 블랙리스트 등록
[5] Outbox 이벤트 기록 (auth.token.refreshed)
```

**응답**: `exchange`와 동일한 토큰 구조

---

### 4.4 `GET /api/v1/account/me`

**목적**: 현재 로그인한 사용자의 프로필과 기업 정보를 반환합니다.

**요청 헤더**: `Authorization: Bearer {accessToken}`

**응답**:
```json
{
  "globalId": "gid-xxxx-xxxx-xxxx",
  "name": "홍길동",
  "email": "user@example.com",
  "status": "ACTIVE",
  "currentCompany": {
    "companyId": "C001",
    "companyName": "샘플기업",
    "bizNo": "123-45-67890",
    "role": "ADMIN"
  },
  "linkedCompanies": []
}
```

---

### 4.5 `GET /api/v1/account/companies`

**목적**: 사용자가 접근 가능한 기업 목록을 반환합니다.  
사용자가 기업을 전환할 때 목록 조회에 사용합니다.

**요청 헤더**: `Authorization: Bearer {accessToken}`

**응답**:
```json
{
  "companies": [
    {
      "companyId": "C001",
      "companyName": "샘플기업",
      "bizNo": "123-45-67890",
      "agencyCode": "SMEP",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  ]
}
```

---

### 4.6 `POST /api/v1/auth/logout`

**목적**: 현재 세션을 로그아웃 처리합니다.

**요청 헤더**: `Authorization: Bearer {accessToken}`

**요청 바디** (선택):
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9..."
}
```

**내부 처리**:
```
[1] Access Token 검증
[2] Refresh Token 블랙리스트 등록
[3] Q-Sign 로그아웃 요청 (선택 — id_token_hint 사용)
[4] Outbox 이벤트 기록 (auth.logout)
[5] 204 No Content 응답
```

---

### 4.7 `POST /api/v1/auth/backchannel-logout`

**목적**: Q-Sign(Keycloak)이 서버→서버로 로그아웃을 통보하는 Back-Channel Logout 수신 엔드포인트입니다.

**요청**: Keycloak이 `application/x-www-form-urlencoded`로 `logout_token` 전송

```
POST /api/v1/auth/backchannel-logout
Content-Type: application/x-www-form-urlencoded

logout_token=eyJhbGciOiJSUzI1NiJ9...
```

**내부 처리**:
```
[1] logout_token JWT 서명 검증 (Q-Sign 공개키 사용)
[2] logout_token의 sub 또는 sid로 해당 세션 식별
[3] 해당 사용자의 Refresh Token 전체 블랙리스트 등록
[4] Outbox 이벤트 기록 (auth.backchannel.logout)
[5] 200 OK 응답 (Keycloak 규격)
```

> Keycloak은 이 엔드포인트가 200을 반환하지 않으면 재시도합니다.  
> 멱등 처리 필수 (이미 로그아웃된 세션에 대한 중복 요청 정상 처리).

---

## 5. Q-Sign 연동 상세

### 5.1 토큰 교환 요청

```http
POST https://isso.smes.go.kr/realms/ucube-qsign/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=smep-bff
&client_secret={client_secret}
&code={authorization_code}
&redirect_uri={redirect_uri}
&code_verifier={pkce_code_verifier}
```

### 5.2 ID Token 검증 체크리스트

IDO는 Q-Sign으로부터 받은 `id_token`을 직접 검증해야 합니다.  
라이브러리(nimbus-jose-jwt, jose 등)를 사용하고, 검증 항목을 반드시 모두 통과해야 합니다.

| 검증 항목 | 기댓값 | 실패 시 처리 |
|-----------|--------|-------------|
| 서명 알고리즘 | RS256 | 즉시 거부 |
| `iss` (발급자) | `https://isso.smes.go.kr/realms/ucube-qsign` | 즉시 거부 |
| `aud` (대상) | `smep-bff` (Client ID) | 즉시 거부 |
| `exp` (만료) | 현재 시각 이전 | 즉시 거부 |
| `iat` (발급 시각) | 현재 시각 기준 ±5분 이내 | 즉시 거부 |
| `nonce` | DB에 저장한 nonce 값과 일치 | 즉시 거부 |

### 5.3 공개키 캐싱 전략

Q-Sign JWKS(`/protocol/openid-connect/certs`)를 매번 호출하지 않도록 캐싱합니다.

```
- 캐시 TTL: 1시간
- kid(Key ID)가 로컬 캐시에 없을 때만 갱신 (Key Rotation 대응)
- 서버 시작 시 초기 로딩
```

### 5.4 Q-Sign 설정 요구 사항 (Q-Sign 팀에 요청)

| 항목 | 요청 값 |
|------|---------|
| Client ID | `smep-bff` |
| Client Type | Confidential |
| Redirect URI | `https://www.smes.go.kr/oauth/callback` |
| Allowed Grant Types | Authorization Code |
| PKCE Required | Yes (S256) |
| Back-Channel Logout URL | `https://api.smes.go.kr/api/v1/auth/backchannel-logout` |

---

## 6. Q-IM 연동 상세

### 6.1 호출 순서 및 의존성

```
토큰 교환 성공
      │
      ▼
POST /members/resolve    ← sub, email, name 전달
      │
      ├── isNewMember: true  → (신규) 기업 매핑 없음, 회원가입 안내 처리
      │
      ├── status: LOCKED     → 업무 진입 차단, ACCOUNT_LOCKED 반환
      ├── status: WITHDRAWN  → 업무 진입 차단, ACCOUNT_WITHDRAWN 반환
      │
      └── status: ACTIVE
               │
               ▼
     GET /members/{globalId}/mappings
               │
               ├── 매핑 없음  → 업무 진입 차단 또는 기업 등록 유도
               │
               └── 매핑 있음  → 첫 번째 ACTIVE 매핑을 currentCompany로 설정
                              → JWT 발급
```

### 6.2 Q-IM 호출 실패 처리

Q-IM은 IDO의 **동기 의존성**입니다. Q-IM 장애 시 로그인은 불가합니다.

| Q-IM 응답 | IDO 처리 |
|-----------|---------|
| 200 OK | 정상 처리 |
| 5xx / Timeout (5초) | `SERVICE_TEMPORARILY_UNAVAILABLE` 반환 |
| `MEMBER_NOT_FOUND` | 시스템 오류 처리 (fallback으로 임의 생성 절대 금지) |

> **Q-IM은 fallback 생성 금지**: 회원 정보가 없을 때 임의로 계정을 만들어 로그인시키면 추후 데이터 정합성 문제가 발생합니다. 반드시 오류를 사용자에게 전달하고, 운영팀이 수동 처리하도록 합니다.

---

## 7. 세션/토큰 설계

### 7.1 IDO 발급 JWT 페이로드

IDO는 Q-Sign의 토큰을 그대로 FE에 전달하지 않습니다.  
IDO가 **자체 서명 JWT**를 발급하여 전달합니다.

```json
{
  "iss": "https://api.smes.go.kr",
  "sub": "gid-xxxx-xxxx-xxxx",
  "aud": "smep-client",
  "iat": 1717430000,
  "exp": 1717433600,
  "jti": "unique-token-id-uuid",
  "name": "홍길동",
  "email": "user@example.com",
  "agencyCode": "SMEP",
  "companyId": "C001",
  "role": "ADMIN"
}
```

| 클레임 | 설명 |
|--------|------|
| `sub` | Q-IM의 globalId (Keycloak sub 아님) |
| `jti` | 토큰 고유 ID (블랙리스트 등록에 사용) |
| `agencyCode` | 현재 세션의 유관기관 코드 |
| `companyId` | 현재 선택된 기업 ID |
| `role` | 해당 기업에서의 역할 |

### 7.2 토큰 유효 시간

| 토큰 | 유효 시간 | 비고 |
|------|-----------|------|
| Access Token | 1시간 | FE가 API 호출 시 헤더에 포함 |
| Refresh Token | 24시간 | DB에 jti 기록하여 Rotation 관리 |

### 7.3 Refresh Token Rotation

- Refresh Token 사용 시 **새 Refresh Token 발급 + 기존 무효화**
- 무효화된 Refresh Token 재사용 시 → 해당 사용자의 **모든 세션 강제 종료**

```
DB 테이블: refresh_token_registry
├── jti         PK (UUID)
├── globalId    FK
├── issuedAt    TIMESTAMP
├── expiresAt   TIMESTAMP
├── revokedAt   TIMESTAMP (NULL = 유효)
└── replacedBy  VARCHAR (후속 jti, Rotation 추적)
```

---

## 8. 로그아웃 처리

### 8.1 FE 시작 로그아웃 흐름

```
FE → POST /api/v1/auth/logout
IDO → Refresh Token jti 블랙리스트 등록
IDO → (선택) Q-Sign POST /protocol/openid-connect/logout
     - id_token_hint: 마지막 Q-Sign id_token
     - 목적: Q-Sign SSO 세션 종료
IDO → Outbox 이벤트 기록 (auth.logout)
IDO → 204 No Content 반환
```

### 8.2 Back-Channel Logout 흐름

다른 SP(서비스)에서 로그아웃하거나 Keycloak 관리콘솔에서 세션을 강제 종료할 때,  
Q-Sign이 IDO에 Back-Channel Logout을 전송합니다.

```
Q-Sign → POST /api/v1/auth/backchannel-logout
         Body: logout_token=eyJ...

logout_token Claims:
  {
    "iss": "https://isso.smes.go.kr/realms/ucube-qsign",
    "sub": "keycloak-user-uuid",    ← Q-Sign sub (globalId 아님)
    "sid": "keycloak-session-id",
    "iat": 1717430000,
    "jti": "unique-logout-token-id",
    "events": {
      "http://schemas.openid.net/event/backchannel-logout": {}
    }
  }

IDO 처리:
  [1] logout_token 서명 검증
  [2] sub로 globalId 역조회 (MEMBER_PROVIDER 테이블)
  [3] 해당 globalId의 모든 유효 Refresh Token jti 블랙리스트 등록
  [4] Outbox 이벤트 기록 (auth.backchannel.logout)
  [5] 200 OK 반환 (204 아님 — Keycloak 규격)
```

---

## 9. Kafka Outbox 패턴 — 상세 설계

### 9.1 배경 및 필요성

IDO는 로그인 성공, 로그아웃, 신규 회원 등록 등 중요한 인증 이벤트를 외부 시스템(통계, 알림, 감사, 연동 시스템)에 알려야 합니다.

**단순 Kafka 직접 발행의 문제점**:

```
// ❌ 이렇게 하면 안 됩니다
@Transactional
fun exchange(...) {
    db.save(sessionRecord)          // DB 저장 성공
    kafka.publish(loginEvent)       // ← Kafka 장애 or 네트워크 오류 → 이벤트 유실
                                    //   또는 DB 롤백 후 Kafka 발행 → 유령 이벤트
}
```

| 문제 | 설명 |
|------|------|
| 이벤트 유실 | Kafka 장애 시 이벤트가 발행되지 않음 |
| 유령 이벤트 | DB 트랜잭션 롤백 후 이미 발행된 이벤트는 취소 불가 |
| 순서 보장 불가 | 비동기 발행 시 이벤트 순서가 DB 변경 순서와 다를 수 있음 |
| 재시도 복잡성 | 실패 시 재시도 로직을 애플리케이션에서 직접 관리해야 함 |

**Outbox 패턴 해결 방식**:  
DB 트랜잭션과 이벤트 기록을 **하나의 트랜잭션**으로 묶어서, Kafka 발행은 별도 프로세스가 담당합니다.

```
DB 트랜잭션 (원자적):
  ├── 비즈니스 데이터 저장 (세션, 회원 등)
  └── Outbox 테이블에 이벤트 레코드 INSERT

별도 Outbox Processor:
  └── Outbox 테이블 폴링 → Kafka 발행 → 상태 업데이트
```

---

### 9.2 Outbox 테이블 스키마

```sql
CREATE TABLE outbox_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id  VARCHAR(100) NOT NULL,  -- 이벤트 주체 ID (globalId 등)
    aggregate_type VARCHAR(50) NOT NULL,  -- 이벤트 주체 유형 (MEMBER, SESSION 등)
    event_type    VARCHAR(100) NOT NULL,  -- 이벤트 종류 (auth.login.success 등)
    payload       JSONB NOT NULL,         -- 이벤트 본문 (직렬화된 JSON)
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                  -- PENDING | PROCESSING | PUBLISHED | FAILED
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at  TIMESTAMPTZ,           -- Kafka 발행 성공 시각
    retry_count   INT NOT NULL DEFAULT 0,
    last_error    TEXT,                  -- 마지막 실패 사유
    partition_key VARCHAR(100)           -- Kafka 파티션 키 (globalId 사용)
);

-- 폴링 성능을 위한 인덱스
CREATE INDEX idx_outbox_status_created
    ON outbox_events (status, created_at)
    WHERE status = 'PENDING';

-- aggregate_id 기반 조회용 인덱스
CREATE INDEX idx_outbox_aggregate
    ON outbox_events (aggregate_id, aggregate_type, created_at);
```

---

### 9.3 이벤트 종류 및 페이로드

#### `auth.login.success`
```json
{
  "eventId": "evt-uuid",
  "eventType": "auth.login.success",
  "occurredAt": "2026-06-04T10:00:00Z",
  "aggregateId": "gid-xxxx-xxxx-xxxx",
  "aggregateType": "MEMBER",
  "data": {
    "globalId": "gid-xxxx-xxxx-xxxx",
    "agencyCode": "SMEP",
    "companyId": "C001",
    "isNewMember": false,
    "loginMethod": "QSIGN_OIDC",
    "sessionJti": "jti-uuid",
    "ipAddressHash": "sha256-of-ip"
  }
}
```

#### `auth.login.failed`
```json
{
  "eventId": "evt-uuid",
  "eventType": "auth.login.failed",
  "occurredAt": "2026-06-04T10:00:01Z",
  "aggregateId": "gid-xxxx-xxxx-xxxx",
  "aggregateType": "MEMBER",
  "data": {
    "globalId": "gid-xxxx-xxxx-xxxx",
    "reason": "ACCOUNT_LOCKED",
    "agencyCode": "SMEP",
    "ipAddressHash": "sha256-of-ip"
  }
}
```

#### `auth.logout`
```json
{
  "eventId": "evt-uuid",
  "eventType": "auth.logout",
  "occurredAt": "2026-06-04T11:00:00Z",
  "aggregateId": "gid-xxxx-xxxx-xxxx",
  "aggregateType": "MEMBER",
  "data": {
    "globalId": "gid-xxxx-xxxx-xxxx",
    "sessionJti": "jti-uuid",
    "logoutType": "USER_INITIATED",
    "agencyCode": "SMEP"
  }
}
```

`logoutType` 값: `USER_INITIATED` / `BACKCHANNEL` / `ADMIN_FORCED` / `TOKEN_EXPIRED`

#### `auth.backchannel.logout`
```json
{
  "eventId": "evt-uuid",
  "eventType": "auth.backchannel.logout",
  "occurredAt": "2026-06-04T11:00:05Z",
  "aggregateId": "gid-xxxx-xxxx-xxxx",
  "aggregateType": "MEMBER",
  "data": {
    "globalId": "gid-xxxx-xxxx-xxxx",
    "keycloakSessionId": "kc-session-id",
    "revokedSessionCount": 2
  }
}
```

#### `member.registered`
```json
{
  "eventId": "evt-uuid",
  "eventType": "member.registered",
  "occurredAt": "2026-06-04T10:00:00Z",
  "aggregateId": "gid-xxxx-xxxx-xxxx",
  "aggregateType": "MEMBER",
  "data": {
    "globalId": "gid-xxxx-xxxx-xxxx",
    "agencyCode": "SMEP",
    "loginMethod": "QSIGN_OIDC"
  }
}
```

#### `auth.token.refreshed`
```json
{
  "eventId": "evt-uuid",
  "eventType": "auth.token.refreshed",
  "occurredAt": "2026-06-04T11:00:00Z",
  "aggregateId": "gid-xxxx-xxxx-xxxx",
  "aggregateType": "MEMBER",
  "data": {
    "globalId": "gid-xxxx-xxxx-xxxx",
    "oldJti": "old-jti-uuid",
    "newJti": "new-jti-uuid",
    "agencyCode": "SMEP"
  }
}
```

---

### 9.4 비즈니스 로직과 Outbox 기록 — 트랜잭션 설계

**핵심 원칙**: Outbox INSERT는 반드시 비즈니스 DB 변경과 **같은 트랜잭션**에 포함됩니다.

```kotlin
// ✅ 올바른 구현 예시 (Kotlin/Spring)
@Transactional
fun exchange(request: ExchangeRequest): ExchangeResponse {
    // [1] state 검증
    val stateRecord = stateRepository.findAndDelete(request.state)
        ?: throw BusinessException(ErrorCode.STATE_MISMATCH)

    // [2] Q-Sign 토큰 교환 (외부 HTTP — 트랜잭션 외부)
    val qsignTokens = qSignClient.exchangeToken(request.code, stateRecord.codeVerifier)
    // Q-Sign 호출은 트랜잭션 외부에서 먼저 수행 후, 결과를 트랜잭션 내에서 처리
    // 이 시점에서 예외 발생 시 DB 변경 없이 실패 반환 (정상)

    // [3] Q-IM 호출 (외부 HTTP — 트랜잭션 외부)
    val resolveResult = qImClient.resolve(qsignTokens.sub, qsignTokens.email, ...)
    val mappings = qImClient.getMappings(resolveResult.globalId)

    // [4] 트랜잭션 내 DB 작업 시작
    // 세션/토큰 저장
    val sessionJti = UUID.randomUUID().toString()
    refreshTokenRepository.save(RefreshToken(
        jti = sessionJti,
        globalId = resolveResult.globalId,
        expiresAt = Instant.now().plusSeconds(86400)
    ))

    // [5] Outbox 이벤트 동일 트랜잭션에 INSERT
    val eventPayload = LoginSuccessEvent(
        globalId = resolveResult.globalId,
        agencyCode = "SMEP",
        companyId = mappings.first().companyId,
        isNewMember = resolveResult.isNewMember,
        sessionJti = sessionJti
    )
    outboxRepository.save(OutboxEvent(
        aggregateId  = resolveResult.globalId,
        aggregateType = "MEMBER",
        eventType    = "auth.login.success",
        payload      = objectMapper.writeValueAsString(eventPayload),
        partitionKey = resolveResult.globalId
    ))
    // ↑ DB 저장과 Outbox INSERT가 하나의 트랜잭션
    //   → 둘 다 성공하거나 둘 다 실패

    // [6] JWT 발급 (트랜잭션 외부 — 순수 계산)
    val accessToken = jwtService.issueAccessToken(resolveResult.globalId, mappings.first())
    val refreshToken = jwtService.issueRefreshToken(sessionJti)

    return ExchangeResponse(accessToken, refreshToken, ...)
}
```

**외부 HTTP 호출(Q-Sign, Q-IM)과 트랜잭션 처리 원칙**:

```
외부 HTTP 호출은 트랜잭션 밖에서 먼저 완료
     └── 이유: HTTP 호출이 오래 걸리면 DB 커넥션을 오래 점유하게 됨
              + 외부 호출 실패 시 DB 롤백이 필요 없음 (저장 자체를 안 했으므로)

DB 트랜잭션 범위:
  ├── refresh_token_registry INSERT
  ├── outbox_events INSERT
  └── state_registry DELETE
     (모두 같은 트랜잭션 — 매우 빠른 로컬 DB 작업만 포함)
```

---

### 9.5 Outbox Processor 설계

Outbox 테이블을 읽어 Kafka에 발행하는 **독립 컴포넌트**입니다.

#### 방식 A: Polling Processor (최소 구성, 권장 시작점)

```
┌──────────────────────────────────────────────────────────┐
│  OutboxPollingProcessor (Spring @Scheduled)              │
│                                                          │
│  주기: 500ms                                             │
│                                                          │
│  1. SELECT * FROM outbox_events                          │
│     WHERE status = 'PENDING'                             │
│     ORDER BY created_at ASC                              │
│     LIMIT 100                                            │
│     FOR UPDATE SKIP LOCKED   ← 다중 인스턴스 경쟁 방지   │
│                                                          │
│  2. 각 레코드를 Kafka에 발행                              │
│     - topic: auth.events                                 │
│     - partition key: partition_key 필드 (= globalId)     │
│     - value: payload JSON                                │
│                                                          │
│  3. 성공 시: status = 'PUBLISHED', published_at = NOW()  │
│     실패 시: retry_count++, last_error = '...'            │
│              retry_count >= 5 이면 status = 'FAILED'      │
└──────────────────────────────────────────────────────────┘
```

```kotlin
@Component
class OutboxPollingProcessor(
    private val outboxRepository: OutboxRepository,
    private val kafkaTemplate: KafkaTemplate<String, String>
) {
    @Scheduled(fixedDelay = 500) // 500ms
    @Transactional
    fun process() {
        val events = outboxRepository.findPendingWithLock(limit = 100)

        events.forEach { event ->
            try {
                kafkaTemplate.send(
                    topic       = "auth.events",
                    key         = event.partitionKey,
                    value       = event.payload
                ).get(3, TimeUnit.SECONDS) // 동기 대기 (확인 후 상태 변경)

                event.status      = "PUBLISHED"
                event.publishedAt = Instant.now()

            } catch (e: Exception) {
                event.retryCount++
                event.lastError = e.message?.take(500)
                if (event.retryCount >= 5) {
                    event.status = "FAILED"
                    // 알림 발송 (Slack, PagerDuty 등)
                    alertService.sendOutboxFailureAlert(event)
                }
            }
            outboxRepository.save(event)
        }
    }
}
```

#### 방식 B: Debezium CDC (고가용성, 운영 환경 권장)

Debezium이 DB의 Write-Ahead Log(WAL)를 읽어 Kafka로 직접 발행합니다.  
Polling 방식 대비 지연이 매우 낮고, Polling이 DB에 주는 부하가 없습니다.

```
┌─────────┐    WAL     ┌──────────┐   Kafka   ┌────────┐
│ IDO DB  │──────────▶│ Debezium │──────────▶│ Kafka  │
│(Postgres│  변경감지  │ Connector│           │ Broker │
│/MySQL)  │           └──────────┘           └────────┘
│         │
│ outbox  │
│ _events │ ← IDO가 INSERT만 함
└─────────┘
```

**Debezium 설정 예시** (PostgreSQL):
```json
{
  "name": "ido-outbox-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "ido-db-host",
    "database.dbname": "idodb",
    "table.include.list": "public.outbox_events",
    "transforms": "outbox",
    "transforms.outbox.type":
      "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.table.field.event.id": "id",
    "transforms.outbox.table.field.event.key": "partition_key",
    "transforms.outbox.table.field.event.type": "event_type",
    "transforms.outbox.table.field.event.payload": "payload",
    "transforms.outbox.route.topic.replacement": "auth.events"
  }
}
```

#### 방식 비교 및 선택 기준

| 항목 | Polling | Debezium CDC |
|------|---------|--------------|
| 구현 복잡도 | 낮음 | 높음 (Debezium 운영 필요) |
| 지연 시간 | 500ms~1s | 100ms 미만 |
| DB 부하 | 있음 (SELECT 주기) | 없음 (WAL 읽기) |
| 운영 복잡도 | 낮음 | 높음 |
| 다중 인스턴스 | `SKIP LOCKED`로 안전 | 기본 안전 |
| 권장 시점 | **개발/스테이징 시작** | **운영 전환 시** |

> **권장**: Phase 1~2는 Polling으로 시작, Phase 3에서 Debezium으로 전환.  
> 애플리케이션 코드(Outbox INSERT)는 방식과 무관하게 동일합니다.

---

### 9.6 Kafka 토픽 설계

| 토픽 | 설명 | 파티션 수 | 보존 기간 |
|------|------|-----------|-----------|
| `auth.events` | 모든 인증 이벤트 통합 | 6 | 7일 |

파티션 키: `globalId` → 동일 사용자의 이벤트는 순서 보장

**향후 확장 시 토픽 분리 가능**:
```
auth.login.events    ← 로그인/로그아웃
auth.member.events   ← 회원 등록/탈퇴
auth.session.events  ← 토큰 갱신
```

---

### 9.7 Consumer 고려사항

IDO는 이벤트 **발행자**이지만, Consumer 팀이 구현할 때 IDO가 보장해야 할 사항입니다.

| 보장 항목 | 구현 방법 |
|-----------|-----------|
| **At-Least-Once 발행** | Outbox 패턴으로 보장. Consumer는 멱등 처리 필수 |
| **이벤트 순서** | 동일 `globalId`의 이벤트는 같은 파티션 → 순서 보장 |
| **이벤트 ID** | `eventId` (UUID) 포함. Consumer가 중복 처리 감지에 사용 |
| **스키마 버전** | `eventType`에 버전 포함 가능 (`auth.login.success.v2` 등) |
| **민감정보 제외** | 페이로드에 비밀번호, 토큰 원문, 개인정보 원문 포함 금지 |

---

### 9.8 FAILED 이벤트 처리 (Dead Letter)

`retry_count >= 5` → `status = 'FAILED'` 처리 후:

```
1. 운영 알림 발송 (Slack #alert-ido 채널)
   - 이벤트 ID, 이벤트 타입, 마지막 오류 포함

2. FAILED 이벤트 재처리 방법:
   - 수동: UPDATE outbox_events SET status='PENDING', retry_count=0 WHERE id='...'
   - 자동: /api/admin/outbox/{id}/retry 엔드포인트 제공 (내부 관리 API)

3. FAILED 이벤트는 절대 삭제하지 않음 (감사 추적 보존)
```

---

### 9.9 Outbox 테이블 아카이브 전략

장기 운영 시 `outbox_events` 테이블이 커질 수 있습니다.

```sql
-- PUBLISHED 상태이고 7일 초과된 레코드 아카이브
-- 별도 배치 스케줄러 또는 pg_cron으로 처리
INSERT INTO outbox_events_archive
    SELECT * FROM outbox_events
    WHERE status = 'PUBLISHED'
      AND published_at < NOW() - INTERVAL '7 days';

DELETE FROM outbox_events
WHERE status = 'PUBLISHED'
  AND published_at < NOW() - INTERVAL '7 days';
```

---

## 10. 보안 원칙

### 10.1 상태값(state) 보안 저장

| 항목 | 규칙 |
|------|------|
| 저장 위치 | DB 또는 Redis (메모리 내 저장 금지 — 다중 인스턴스 시 공유 불가) |
| TTL | 5분 (만료 후 자동 삭제) |
| 일회성 | exchange 성공 후 즉시 삭제 |
| 재사용 | state 레코드가 이미 삭제된 경우 즉시 거부 |

### 10.2 토큰 보안 전송

| 항목 | 규칙 |
|------|------|
| Access Token 전송 | `Authorization: Bearer` 헤더 |
| Access Token 저장 | FE 메모리 (`useAuthStore`) — localStorage/sessionStorage 금지 |
| Refresh Token 저장 | HttpOnly + Secure + SameSite=Strict 쿠키 권장 |

### 10.3 CORS 설정

```
허용 Origin:
  - https://www.smes.go.kr (SMEP FE)
  
비허용:
  - * (와일드카드)
  - localhost (운영 환경)
```

### 10.4 Rate Limiting

| 엔드포인트 | 제한 |
|------------|------|
| `POST /auth/exchange` | IP당 분당 10회 |
| `GET /auth/login-url` | IP당 분당 30회 |
| `POST /auth/refresh` | IP당 분당 60회 |
| `POST /auth/backchannel-logout` | Q-Sign IP Allowlist로만 허용 |

---

## 11. 오류 처리 표준

### 11.1 공통 오류 응답 형식

```json
{
  "error": {
    "code": "STATE_MISMATCH",
    "message": "인증 요청이 만료되었거나 올바르지 않습니다. 다시 로그인해 주세요.",
    "requestId": "req-uuid"
  }
}
```

### 11.2 오류 코드 목록

| HTTP | 코드 | 의미 | FE 처리 |
|------|------|------|---------|
| 400 | `STATE_MISMATCH` | state 불일치/만료 | 로그인 재시작 |
| 400 | `INVALID_CODE` | Q-Sign 코드 교환 실패 | 로그인 재시작 |
| 400 | `INVALID_TOKEN` | 토큰 형식 오류 | 로그인 재시작 |
| 401 | `TOKEN_EXPIRED` | Access Token 만료 | Refresh 시도 |
| 401 | `REFRESH_TOKEN_EXPIRED` | Refresh Token 만료 | 로그인 재시작 |
| 401 | `REFRESH_TOKEN_REUSED` | 이미 사용된 Refresh 재사용 | 보안 경고 + 재로그인 |
| 403 | `ACCOUNT_LOCKED` | 계정 잠금 | 잠금 안내 화면 |
| 403 | `ACCOUNT_WITHDRAWN` | 탈퇴 계정 | 탈퇴 안내 화면 |
| 403 | `NO_COMPANY_MAPPING` | 기업 매핑 없음 | 기업 등록 안내 |
| 503 | `SERVICE_TEMPORARILY_UNAVAILABLE` | Q-IM 장애 | 점검 안내 |

---

## 12. 개발 우선순위 및 단계

### Phase 1 — 로그인/로그아웃 최소 가동

- [ ] `GET /api/v1/auth/login-url` 구현 (state/nonce/PKCE 생성 + DB 저장)
- [ ] `POST /api/v1/auth/exchange` 구현 (Q-Sign 토큰 교환 + Q-IM 연동 + JWT 발급)
- [ ] `POST /api/v1/auth/logout` 구현
- [ ] `GET /api/v1/account/me` 구현
- [ ] Refresh Token Rotation 구현
- [ ] **Outbox 테이블 생성 + 비즈니스 로직 내 INSERT 구현**
- [ ] **Outbox Polling Processor 구현 (500ms)**
- [ ] Kafka 토픽 `auth.events` 생성
- [ ] 개발 환경 배포 + FE 연동 테스트

### Phase 2 — 안정성 강화

- [ ] `POST /api/v1/auth/refresh` 구현
- [ ] `POST /api/v1/auth/backchannel-logout` 구현
- [ ] `GET /api/v1/account/companies` 구현
- [ ] Rate Limiting 적용
- [ ] FAILED Outbox 이벤트 알림 구현
- [ ] 스테이징 환경 배포

### Phase 3 — 운영 품질

- [ ] Debezium CDC 전환 (Polling → CDC)
- [ ] Outbox 테이블 아카이브 배치
- [ ] REFRESH_TOKEN_REUSED 탐지 시 전체 세션 강제 종료
- [ ] 모니터링 대시보드 (로그인 성공률, Outbox 지연, Kafka 발행 성공률)
- [ ] 운영 환경 배포

---

## 13. 인수 조건

### Phase 1 인수 조건

```
시나리오 1 — 정상 로그인 전체 흐름
  1. GET /auth/login-url 호출 → loginUrl, state 반환
  2. Q-Sign 인증 완료 후 callback에서 POST /auth/exchange 호출
  3. 응답에 accessToken, refreshToken, profile 포함
  4. outbox_events 테이블에 auth.login.success 레코드 INSERT 확인
  5. 500ms 이내 Kafka auth.events 토픽에 이벤트 수신 확인

시나리오 2 — state 만료 처리
  1. GET /auth/login-url 호출 후 5분 이상 대기
  2. POST /auth/exchange 호출 → 400 STATE_MISMATCH 반환

시나리오 3 — 계정 잠금 처리
  1. Q-IM에서 해당 globalId status를 LOCKED로 설정
  2. 로그인 시도 → 403 ACCOUNT_LOCKED 반환
  3. outbox_events에 auth.login.failed (reason: ACCOUNT_LOCKED) 확인

시나리오 4 — Kafka 장애 시 Outbox 유지
  1. Kafka Broker를 의도적으로 중단
  2. 로그인 성공 → accessToken 정상 반환
  3. outbox_events 레코드 status = 'PENDING' 확인
  4. Kafka 재기동 후 → Polling Processor가 발행 → status = 'PUBLISHED' 확인

시나리오 5 — Outbox 재시도 (5회 초과)
  1. Kafka Broker 중단 상태에서 로그인 5회
  2. Polling Processor가 retry_count 5회 초과 → status = 'FAILED' 전환 확인
  3. 알림 발송 확인 (개발 환경 기준)
```

### 비기능 인수 조건

| 항목 | 기준 |
|------|------|
| `/auth/exchange` P95 응답 시간 | < 2초 (Q-IM, Q-Sign 호출 포함) |
| Outbox → Kafka 발행 지연 | Polling: < 1.5초, CDC: < 300ms |
| Outbox 발행 성공률 | > 99.9% (7일 기준) |
| 토큰 원문 로그 미노출 | 로그에서 JWT 원문 출력 없음 |

---

## 부록 A: 환경별 설정 체크리스트

| 설정 항목 | 개발 | 스테이징 | 운영 |
|-----------|------|----------|------|
| Q-Sign Client Secret | 개발용 | 스테이징용 | 운영용 (Vault/KMS) |
| Q-IM API Key | 개발용 | 스테이징용 | 운영용 (Vault/KMS) |
| JWT 서명 키 | 개발용 RSA | 스테이징용 RSA | 운영용 RSA (HSM 권장) |
| Kafka Broker | localhost | 내부 Kafka | MSK/내부 Kafka |
| Outbox 방식 | Polling (500ms) | Polling (500ms) | Debezium CDC |
| HTTPS | 선택 | 필수 | 필수 |
| Rate Limiting | 비활성 | 활성 (완화) | 활성 (엄격) |

---

## 부록 B: FE 팀 전달 사항

IDO Phase 1 완료 후 FE(smep-ufe) 팀에 다음을 전달합니다.

| 항목 | 내용 |
|------|------|
| 개발 환경 Base URL | `https://api-dev.smes.go.kr/api/v1` |
| `/oauth/callback` 등록 여부 | Q-Sign Redirect URI 등록 완료 여부 확인 |
| Postman Collection | 전체 API 테스트 컬렉션 |
| 오류 코드 목록 | 11.2절 오류 코드 정의 공유 |
| CORS 허용 Origin | FE 도메인 확인 후 설정 |
