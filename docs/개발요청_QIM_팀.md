# Q-IM 개발 요청서 (정본 기준 재개발)
_작성일: 2026-06-04_  
_수신: Q-IM 개발팀_  
_참조: IDO(OnePass-BE) 개발팀_

---

> **이 문서의 전제**  
> 현재까지 개발 중이던 Q-IM 구현은 **전면 무효화**하고, 본 문서 기준으로 **정본(Authoritative)** 재개발을 진행합니다.  
> Q-IM의 역할은 **IDO(OnePass-BE)가 호출하는 서비스 간 API 제공**으로 단일화합니다.  
> 관리콘솔(Admin Console) UI/API는 **본 개발 범위에서 제외**하며, 별도 프로젝트(`onepass-admin`)에서 이관 후 진행합니다.

---

## 목차

1. [즉시 조치 사항](#1-즉시-조치-사항)
2. [Q-IM 역할 정의](#2-q-im-역할-정의)
3. [아키텍처 내 위치](#3-아키텍처-내-위치)
4. [IDO 연계 API 명세](#4-ido-연계-api-명세)
5. [데이터 모델](#5-데이터-모델)
6. [보안 원칙](#6-보안-원칙)
7. [오류 처리 표준](#7-오류-처리-표준)
8. [개발 우선순위 및 단계](#8-개발-우선순위-및-단계)
9. [인수 조건 (완료 기준)](#9-인수-조건-완료-기준)

---

## 1. 즉시 조치 사항

다음 항목은 정본 재개발 착수 **전에 반드시 완료**되어야 합니다.

### 1.1 관리콘솔 API 연결 차단

현재 Q-IM에 구현되어 있는 관리콘솔 대상 API 엔드포인트를 **전량 비활성화**합니다.

```
비활성화 대상 예시 (현행 구현에 포함된 경우):
  - GET  /admin/**
  - POST /admin/**
  - GET  /management/**
  - POST /management/**
  - 사용자/기업 CRUD UI 용도 엔드포인트 전체
```

**이유**: 관리콘솔 API가 활성화된 상태로 정본 개발을 진행하면  
① 기존 API 계약에 맞추는 불필요한 레거시 부채가 생기고  
② 향후 `onepass-admin` 프로젝트 이관 시 책임 경계가 불분명해집니다.

관리콘솔 기능이 필요한 운영 요구가 있다면 **별도 내부 CLI 스크립트** 또는 **DB 직접 조작** 방식을 임시 사용하고, 정식 관리콘솔은 추후 `onepass-admin` 프로젝트에서 구현합니다.

### 1.2 기존 Q-IM 스키마/코드 정리 방침

| 항목 | 방침 |
|------|------|
| 기존 DB 스키마 | 참고용 유지, 신규 스키마와 독립 설계 후 마이그레이션 계획 수립 |
| 기존 비즈니스 로직 | 재사용 여부는 팀 내 판단, 강요 없음 |
| API 계약 | 본 문서 기준으로 **완전 재정의** (기존 경로 호환 불필요) |
| 인증/권한 구조 | 본 문서 6절 보안 원칙 기준 재설계 |

---

## 2. Q-IM 역할 정의

### 2.1 Q-IM이 하는 일

Q-IM은 **통합 회원 식별 및 기관·기업 매핑 관리 시스템**입니다.  
브라우저(사용자)와 직접 통신하지 않으며, **IDO(OnePass-BE)만이 호출 주체**입니다.

```
브라우저 ──→ SMEP FE ──→ IDO(OnePass-BE) ──→ Q-IM
                                    ↑
                             여기서만 호출
```

**핵심 책임 3가지**:

| 책임 | 설명 |
|------|------|
| **통합 회원 식별** | Q-Sign(Keycloak)의 `sub` 클레임을 기반으로 통합 글로벌 ID 부여/조회 |
| **기관·기업 매핑** | 통합 회원이 어느 유관기관의 어느 기업에 소속되어 있는지 관리 |
| **계정 상태 판단** | 활성 / 잠금 / 탈퇴 등 계정 상태 조회 및 변경 |

### 2.2 Q-IM이 하지 않는 일

| 항목 | 담당 |
|------|------|
| 인증(Authentication) | Q-Sign(Keycloak) |
| 인증 UI (로그인 화면) | OnePass UI |
| 토큰 교환/검증 | IDO(OnePass-BE) |
| 유관기관 세션 발급 | IDO(OnePass-BE) |
| 관리콘솔 UI 제공 | 별도 `onepass-admin` 프로젝트 (추후) |
| 브라우저 직접 응답 | 절대 금지 |

---

## 3. 아키텍처 내 위치

```
┌─────────────────────────────────────────────────────────────┐
│                    브라우저 (사용자)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SMEP FE / 유관기관 FE (smep-ufe 등)             │
│              팝업 → Q-Sign 인증 → callback 처리              │
└────────────────────────┬────────────────────────────────────┘
                         │  code + state
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  IDO (OnePass-BE / smep-be)                  │
│                                                             │
│  1. Q-Sign 토큰 교환 (서버→서버)                             │
│  2. Q-IM 회원 조회/생성 (서버→서버)          ◀── 이 요청    │
│  3. 기관·기업 매핑 확인 (서버→서버)          ◀── 이 요청    │
│  4. 유관기관 자체 세션/토큰 발급                             │
└────────────────────────┬───────────────┬────────────────────┘
                         │               │
                    Q-Sign 호출      Q-IM 호출
                         │               │
                         ▼               ▼
               ┌─────────────┐   ┌──────────────┐
               │  Q-Sign      │   │  Q-IM        │
               │  (Keycloak)  │   │  (본 문서)   │
               └─────────────┘   └──────────────┘
```

**네트워크 원칙**:
- Q-IM은 퍼블릭 인터넷에 직접 노출되지 않습니다
- IDO ↔ Q-IM 통신은 내부망 또는 VPN 구간에서만 허용
- IP Allowlist 또는 mTLS 적용 필수

---

## 4. IDO 연계 API 명세

> Q-IM이 제공해야 할 API 전체입니다.  
> 관리콘솔용 API는 포함하지 않습니다.

### 4.1 API 공통 규칙

| 항목 | 규칙 |
|------|------|
| Base URL | `https://qim.internal.smes.go.kr/api/v1` (내부망) |
| 인증 방식 | Service-to-Service API Key 헤더 (`X-Service-Key`) 또는 mTLS |
| 요청 Content-Type | `application/json` |
| 응답 Content-Type | `application/json` |
| 오류 응답 | 7절 표준 형식 사용 |
| 요청 추적 | 모든 요청에 `X-Request-ID` 헤더 전달, Q-IM이 로그에 기록 |
| 개인정보 마스킹 | 로그에 이름·이메일·사업자번호 원문 출력 금지 (해시/마스킹) |

---

### 4.2 API 목록

#### ① `POST /members/resolve`
**목적**: Q-Sign 토큰의 클레임 정보로 통합 회원을 조회하거나 최초 등록합니다.  
IDO가 Q-Sign 토큰 교환 직후 **반드시 가장 먼저 호출**합니다.

**요청**:
```json
{
  "provider": "qsign",
  "sub": "keycloak-user-uuid",
  "email": "user@example.com",
  "name": "홍길동",
  "phoneHash": "sha256-hashed-phone-or-null"
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `provider` | ✅ | 인증 제공자 식별자. 현재는 `"qsign"` 고정 |
| `sub` | ✅ | Q-Sign(Keycloak) JWT의 `sub` 클레임. 변경 불가 식별자 |
| `email` | ✅ | 회원 이메일. 변경될 수 있으므로 식별 키로 사용 금지 |
| `name` | ✅ | 회원 이름 |
| `phoneHash` | ❌ | 전화번호 SHA-256 해시. 없으면 null |

**응답**:
```json
{
  "globalId": "gid-xxxx-xxxx-xxxx",
  "status": "ACTIVE",
  "isNewMember": false,
  "profile": {
    "name": "홍길동",
    "email": "user@example.com"
  }
}
```

| 필드 | 설명 |
|------|------|
| `globalId` | Q-IM이 부여한 통합 글로벌 ID. IDO가 이후 모든 Q-IM 호출에 사용 |
| `status` | `ACTIVE` / `LOCKED` / `WITHDRAWN` |
| `isNewMember` | `true`이면 이번 호출로 최초 등록된 회원 |

**중요 동작 정의**:
- `sub` 기준으로 기존 회원 조회 → 있으면 업데이트 후 반환
- 없으면 신규 글로벌 ID 발급 후 등록 → `isNewMember: true`
- `status`가 `LOCKED` 또는 `WITHDRAWN`인 경우에도 200으로 응답하되, IDO가 `status` 값을 보고 업무 진입 차단 결정

---

#### ② `GET /members/{globalId}`
**목적**: 통합 회원의 상세 프로필을 조회합니다.

**경로 파라미터**: `globalId` — `/members/resolve` 응답의 `globalId`

**응답**:
```json
{
  "globalId": "gid-xxxx-xxxx-xxxx",
  "status": "ACTIVE",
  "profile": {
    "name": "홍길동",
    "email": "user@example.com",
    "phoneHash": "abc123..."
  },
  "providers": [
    {
      "provider": "qsign",
      "sub": "keycloak-user-uuid",
      "linkedAt": "2026-01-01T00:00:00Z"
    }
  ],
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-06-01T00:00:00Z"
}
```

---

#### ③ `GET /members/{globalId}/mappings`
**목적**: 통합 회원이 연결된 유관기관 및 기업 목록을 반환합니다.  
IDO는 이 결과를 기반으로 사용자가 진입 가능한 기업/기관을 결정합니다.

**요청 쿼리 파라미터**:

| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `agencyCode` | ❌ | 특정 유관기관 코드로 필터링. 없으면 전체 반환 |
| `status` | ❌ | `ACTIVE` / `INACTIVE` 로 필터링 |

**응답**:
```json
{
  "globalId": "gid-xxxx-xxxx-xxxx",
  "mappings": [
    {
      "mappingId": "map-xxxx",
      "agencyCode": "SMEP",
      "agencyName": "중소벤처기업진흥공단",
      "companyId": "C001",
      "companyName": "샘플기업",
      "bizNo": "123-45-67890",
      "role": "ADMIN",
      "status": "ACTIVE",
      "linkedAt": "2026-01-15T00:00:00Z"
    },
    {
      "mappingId": "map-yyyy",
      "agencyCode": "SBIZ",
      "agencyName": "소상공인시장진흥공단",
      "companyId": "C002",
      "companyName": "또다른기업",
      "bizNo": "987-65-43210",
      "role": "MEMBER",
      "status": "ACTIVE",
      "linkedAt": "2026-02-01T00:00:00Z"
    }
  ]
}
```

| 필드 | 설명 |
|------|------|
| `agencyCode` | 유관기관 식별 코드 (SMEP, SBIZ 등 — Q-IM이 코드 테이블 관리) |
| `role` | 기업 내 역할. `ADMIN` / `MEMBER` / `READ_ONLY` 등 |
| `status` | `ACTIVE` / `INACTIVE` / `PENDING` |

---

#### ④ `POST /members/{globalId}/mappings`
**목적**: 통합 회원에 유관기관·기업 매핑을 추가합니다.  
사용자가 새 기업과 처음 연결될 때 IDO가 호출합니다.

**요청**:
```json
{
  "agencyCode": "SMEP",
  "companyId": "C003",
  "companyName": "신규기업",
  "bizNo": "111-22-33333",
  "role": "MEMBER"
}
```

**응답**:
```json
{
  "mappingId": "map-zzzz",
  "status": "ACTIVE",
  "createdAt": "2026-06-04T00:00:00Z"
}
```

---

#### ⑤ `PATCH /members/{globalId}/mappings/{mappingId}`
**목적**: 기존 매핑의 상태 또는 역할을 변경합니다.

**요청**:
```json
{
  "role": "ADMIN",
  "status": "INACTIVE"
}
```

변경이 필요한 필드만 포함하면 됩니다. (Partial Update)

**응답**:
```json
{
  "mappingId": "map-zzzz",
  "role": "ADMIN",
  "status": "INACTIVE",
  "updatedAt": "2026-06-04T10:00:00Z"
}
```

---

#### ⑥ `GET /members/{globalId}/status`
**목적**: 계정 상태만 빠르게 확인합니다. 매 업무 요청 전 경량 상태 체크에 사용합니다.

**응답**:
```json
{
  "globalId": "gid-xxxx-xxxx-xxxx",
  "status": "ACTIVE",
  "reason": null
}
```

| `status` | 의미 | IDO 처리 방침 |
|----------|------|---------------|
| `ACTIVE` | 정상 활성 | 업무 진입 허용 |
| `LOCKED` | 잠금 상태 | 업무 진입 차단, 잠금 해제 안내 |
| `WITHDRAWN` | 탈퇴 | 업무 진입 차단, 재가입 안내 |
| `PENDING` | 이메일 인증 등 대기 | 업무 진입 차단, 인증 완료 안내 |

`reason` 필드: 잠금 사유 등 관리자 메모 (영문 코드 권장, 예: `"ADMIN_LOCKED"`, `"POLICY_VIOLATION"`)

---

#### ⑦ `PATCH /members/{globalId}/status`
**목적**: 계정 상태를 변경합니다.  
IDO가 **관리 목적** 또는 **자동 정책** 적용 시 사용합니다.

**요청**:
```json
{
  "status": "LOCKED",
  "reason": "ADMIN_LOCKED",
  "memo": "운영팀 요청에 의한 잠금"
}
```

**응답**:
```json
{
  "globalId": "gid-xxxx-xxxx-xxxx",
  "status": "LOCKED",
  "updatedAt": "2026-06-04T10:00:00Z"
}
```

---

#### ⑧ `POST /members/{globalId}/withdraw`
**목적**: 회원 탈퇴 처리입니다. 개인정보 즉시 삭제가 아닌 상태 변경 + 삭제 예약 방식을 권장합니다.

**요청**:
```json
{
  "reason": "USER_REQUEST",
  "requestedBy": "user-self"
}
```

**응답**:
```json
{
  "globalId": "gid-xxxx-xxxx-xxxx",
  "status": "WITHDRAWN",
  "scheduledDeleteAt": "2026-09-03T00:00:00Z"
}
```

`scheduledDeleteAt`: 개인정보 법적 보존 기간 후 삭제 예정일 (일반적으로 탈퇴 후 90일)

---

### 4.3 API 요약표

| # | Method | Path | 설명 | 우선순위 |
|---|--------|------|------|----------|
| 1 | POST | `/members/resolve` | Q-Sign sub → 글로벌 ID 조회/생성 | **P1 (필수)** |
| 2 | GET | `/members/{globalId}` | 회원 상세 프로필 | **P1 (필수)** |
| 3 | GET | `/members/{globalId}/mappings` | 기관·기업 매핑 목록 | **P1 (필수)** |
| 4 | POST | `/members/{globalId}/mappings` | 기관·기업 매핑 추가 | **P1 (필수)** |
| 5 | PATCH | `/members/{globalId}/mappings/{mappingId}` | 매핑 상태/역할 변경 | **P2** |
| 6 | GET | `/members/{globalId}/status` | 계정 상태 조회 | **P1 (필수)** |
| 7 | PATCH | `/members/{globalId}/status` | 계정 상태 변경 | **P2** |
| 8 | POST | `/members/{globalId}/withdraw` | 회원 탈퇴 처리 | **P2** |

---

## 5. 데이터 모델

### 5.1 핵심 엔티티

```
MEMBER (통합 회원)
├── globalId          PK, UUID v4, 불변
├── status            ACTIVE | LOCKED | WITHDRAWN | PENDING
├── statusReason      VARCHAR, nullable
├── createdAt         TIMESTAMP
├── updatedAt         TIMESTAMP
└── scheduledDeleteAt TIMESTAMP, nullable (탈퇴 후 삭제 예정)

MEMBER_PROVIDER (인증 제공자 연결)
├── id                PK
├── globalId          FK → MEMBER.globalId
├── provider          VARCHAR (qsign, kakao 등 미래 확장)
├── sub               VARCHAR (제공자의 사용자 고유 ID)
├── linkedAt          TIMESTAMP
└── UNIQUE(provider, sub)

MEMBER_PROFILE (개인정보 — 분리 저장 권장)
├── globalId          PK, FK → MEMBER.globalId
├── name              VARCHAR (암호화 권장)
├── emailHash         VARCHAR (SHA-256 — 검색용)
├── emailEncrypted    VARBINARY (복호화 가능 — 발송용)
├── phoneHash         VARCHAR (SHA-256), nullable
└── updatedAt         TIMESTAMP

AGENCY_MAPPING (기관·기업 매핑)
├── mappingId         PK, UUID
├── globalId          FK → MEMBER.globalId
├── agencyCode        VARCHAR (기관 코드, 별도 코드 테이블 참조)
├── companyId         VARCHAR (기관 내부 기업 ID)
├── companyName       VARCHAR
├── bizNo             VARCHAR (사업자번호, 암호화 권장)
├── role              ADMIN | MEMBER | READ_ONLY
├── status            ACTIVE | INACTIVE | PENDING
├── linkedAt          TIMESTAMP
├── updatedAt         TIMESTAMP
└── UNIQUE(globalId, agencyCode, companyId)

AGENCY_CODE (기관 코드 테이블)
├── code              PK, VARCHAR
├── name              VARCHAR
├── domain            VARCHAR (연동 도메인 참고용)
└── isActive          BOOLEAN
```

### 5.2 설계 원칙

| 원칙 | 내용 |
|------|------|
| 개인정보 분리 | `MEMBER_PROFILE`은 별도 테이블로 분리하여 접근 제어 |
| 해시 + 암호화 이중 전략 | 검색에는 SHA-256 해시, 노출/발송에는 복호화 가능 암호화 |
| 소프트 딜리트 | 탈퇴 처리는 상태 변경 + 삭제 예약, 즉시 물리 삭제 금지 |
| `globalId` 불변 | 한 번 발급된 글로벌 ID는 절대 변경/재사용 금지 |
| `sub` 불변 | `provider + sub` 조합은 고유해야 하며 변경 불가 |

---

## 6. 보안 원칙

### 6.1 서비스 간 인증 (IDO → Q-IM)

**방식 A: API Key (최소 구성)**
```
요청 헤더:
  X-Service-Key: {사전 공유된 서비스 키}
  X-Request-ID: {UUID, 추적용}
```

**방식 B: mTLS (권장)**
- IDO 서버가 Q-IM에 접근할 때 클라이언트 인증서 제시
- Q-IM은 인증서 CN(Common Name)으로 호출 주체 식별

운영 환경에서는 방식 B(mTLS)를 권장하며,  
개발/스테이징 환경에서는 방식 A(API Key)를 허용합니다.

### 6.2 네트워크 접근 제어

```
허용:
  - IDO(OnePass-BE) 서버 IP → Q-IM 80/443 포트

차단:
  - 인터넷 퍼블릭 IP → Q-IM 모든 포트
  - 브라우저(사용자) → Q-IM 직접 접근
  - 유관기관 FE → Q-IM 직접 접근
```

### 6.3 로그 보안

| 항목 | 규칙 |
|------|------|
| 이름 | 로그 출력 시 `홍**` 형태로 마스킹 |
| 이메일 | `ho***@example.com` 형태로 마스킹 |
| 사업자번호 | 앞 6자리만 출력 (`123456-****`) |
| globalId | 로그 출력 허용 (익명 식별자) |
| sub (Keycloak UUID) | 로그 출력 허용 |
| API Key / 인증서 | 로그 절대 출력 금지 |

### 6.4 감사 로그 (Audit Log)

다음 이벤트는 반드시 별도 감사 로그 테이블에 기록합니다.

| 이벤트 | 기록 항목 |
|--------|-----------|
| 회원 최초 등록 (`isNewMember: true`) | globalId, provider, sub 해시, 타임스탬프 |
| 회원 상태 변경 | globalId, 이전 상태, 변경 상태, 변경 사유, 변경 주체 |
| 매핑 추가/변경 | globalId, agencyCode, companyId, 변경 내용 |
| 탈퇴 처리 | globalId, 사유, 삭제 예약일 |
| 상태 조회 실패 (globalId 없음) | 요청 정보, 타임스탬프 |

---

## 7. 오류 처리 표준

### 7.1 공통 오류 응답 형식

```json
{
  "error": {
    "code": "MEMBER_NOT_FOUND",
    "message": "요청한 globalId에 해당하는 회원이 존재하지 않습니다.",
    "requestId": "req-uuid"
  }
}
```

### 7.2 오류 코드 목록

| HTTP 상태 | 오류 코드 | 의미 |
|-----------|-----------|------|
| 400 | `INVALID_REQUEST` | 필수 파라미터 누락 또는 형식 오류 |
| 400 | `INVALID_PROVIDER` | 지원하지 않는 `provider` 값 |
| 401 | `UNAUTHORIZED` | API Key 또는 인증서 인증 실패 |
| 403 | `FORBIDDEN` | 호출 주체에게 해당 작업 권한 없음 |
| 404 | `MEMBER_NOT_FOUND` | `globalId`에 해당하는 회원 없음 |
| 404 | `MAPPING_NOT_FOUND` | `mappingId`에 해당하는 매핑 없음 |
| 409 | `ALREADY_WITHDRAWN` | 이미 탈퇴된 회원에 대한 재탈퇴 요청 |
| 409 | `MAPPING_ALREADY_EXISTS` | 동일 `(globalId, agencyCode, companyId)` 매핑 중복 |
| 422 | `INVALID_STATUS_TRANSITION` | 허용되지 않는 상태 전환 (예: WITHDRAWN → ACTIVE) |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |
| 503 | `SERVICE_UNAVAILABLE` | 의존 서비스(DB 등) 불가용 |

### 7.3 IDO 측 장애 대응 정책

Q-IM 팀이 아닌 IDO 팀에 공유하는 정책이나, Q-IM의 응답 설계에도 영향을 미치므로 명시합니다.

| Q-IM 응답 | IDO 처리 방침 |
|-----------|---------------|
| `503 SERVICE_UNAVAILABLE` | 인증 성공이어도 업무 진입 차단. 사용자에게 "잠시 후 다시 시도" 안내 |
| 타임아웃 (5초 초과) | 위와 동일 |
| `MEMBER_NOT_FOUND` (resolve 후) | 시스템 오류로 처리. 임의 계정 생성(fallback) 금지 |
| `status: LOCKED` | 업무 진입 차단. 잠금 해제 경로 안내 |

---

## 8. 개발 우선순위 및 단계

### Phase 1 (P1) — IDO 연동 최소 가동 세트

IDO와의 연동 테스트를 시작할 수 있는 **최소 API 세트**입니다.

- [ ] `POST /members/resolve` 구현
- [ ] `GET /members/{globalId}` 구현
- [ ] `GET /members/{globalId}/mappings` 구현
- [ ] `POST /members/{globalId}/mappings` 구현
- [ ] `GET /members/{globalId}/status` 구현
- [ ] Service-to-Service API Key 인증 구현
- [ ] 공통 오류 응답 형식 구현
- [ ] 감사 로그 테이블 및 기록 구현
- [ ] 개발 환경 배포

### Phase 2 (P2) — 상태 관리 및 탈퇴

- [ ] `PATCH /members/{globalId}/status` 구현
- [ ] `PATCH /members/{globalId}/mappings/{mappingId}` 구현
- [ ] `POST /members/{globalId}/withdraw` 구현
- [ ] 탈퇴 후 개인정보 삭제 스케줄러 구현
- [ ] mTLS 적용 (운영 환경)
- [ ] 스테이징 환경 배포

### Phase 3 (P3) — 운영 품질

- [ ] `agencyCode` 코드 테이블 관리 방안 수립
- [ ] 개인정보 암호화 적용 (`MEMBER_PROFILE`)
- [ ] 모니터링/알림 설정 (응답시간 SLO, 5xx 오류율)
- [ ] API 문서화 (Swagger / OpenAPI 3.0)

### Phase 4 (추후 별도 프로젝트) — 관리콘솔

- [ ] `onepass-admin` 프로젝트 별도 착수
- [ ] 관리자 전용 API (회원 검색, 수동 잠금/해제, 매핑 관리 등)
- [ ] 관리 이력 조회

---

## 9. 인수 조건 (완료 기준)

### Phase 1 인수 조건

IDO 팀이 다음 시나리오를 직접 테스트하여 통과해야 합니다.

```
시나리오 1 — 신규 회원 최초 로그인
  1. IDO가 POST /members/resolve 호출
  2. 응답에 isNewMember: true, status: ACTIVE 포함
  3. 이후 GET /members/{globalId}/mappings 호출 시 빈 배열 반환

시나리오 2 — 기존 회원 재로그인
  1. IDO가 동일 sub로 POST /members/resolve 재호출
  2. 응답에 isNewMember: false, 동일 globalId 반환

시나리오 3 — 기업 매핑 추가 후 목록 조회
  1. IDO가 POST /members/{globalId}/mappings 호출
  2. 이후 GET /members/{globalId}/mappings 호출 시 추가된 항목 반환

시나리오 4 — 잠금 계정 처리
  1. DB에서 해당 globalId의 status를 LOCKED로 수동 변경
  2. IDO가 GET /members/{globalId}/status 호출
  3. 응답에 status: LOCKED 반환
  4. IDO가 업무 진입 차단 처리

시나리오 5 — 인증 실패
  1. 잘못된 API Key로 요청
  2. Q-IM이 401 UNAUTHORIZED 반환

시나리오 6 — 오류 형식 확인
  1. 존재하지 않는 globalId로 GET /members/{globalId}
  2. Q-IM이 404 MEMBER_NOT_FOUND 반환 (공통 오류 형식)
```

### 비기능 인수 조건

| 항목 | 기준 |
|------|------|
| 응답 시간 | P95 < 200ms (내부망 기준) |
| 가용성 | 99.5% 이상 (스테이징 이후 적용) |
| 로그 마스킹 | 이름·이메일 원문 로그 미출력 확인 |
| API Key 로그 미노출 | 헤더값 로그 미출력 확인 |

---

## 부록 A: 유관기관 코드 초기 세트

Q-IM이 관리할 기관 코드 테이블의 초기값입니다.  
추가/변경은 IDO 팀과 협의 후 관리합니다.

| 코드 | 기관명 | 비고 |
|------|--------|------|
| `SMEP` | 중소벤처기업진흥공단 (스멥) | 1차 연동 대상 |
| `SBIZ` | 소상공인시장진흥공단 | 추후 연동 |
| `KVEC` | 한국벤처투자 | 추후 연동 |

---

## 부록 B: IDO 팀 인계 사항

Q-IM Phase 1 완료 후 IDO 팀이 바로 연동 작업을 시작할 수 있도록 다음 항목을 Q-IM 팀이 IDO에 전달합니다.

| 전달 항목 | 내용 |
|----------|------|
| 개발 환경 Base URL | `https://qim-dev.internal.smes.go.kr/api/v1` (예시) |
| Service API Key | 개발용 API Key (보안 채널로 전달) |
| OpenAPI Spec (or Postman Collection) | API 테스트용 컬렉션 |
| 초기 `agencyCode` 세트 | 부록 A 기준 |
| 연락 담당자 | Q-IM 팀 API 담당자 이름/연락처 |
