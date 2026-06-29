# smep-ufe nProtect 적용 증적 + 지연 실행(On-Demand) 플랜

작성일: 2026-04-13
대상 프로젝트: `C:\Users\User\Projects\smep-ufe`

## 1) 목표와 제약
- 목표 1: 감리에서 "nProtect를 프로젝트에 적용했다"는 객관적 증적을 남긴다.
- 목표 2: 운영 리스크/성능 영향을 최소화하기 위해 기본 실행은 미룬다.
- 목표 3: 민감정보 입력 시점에만 nProtect를 지연 초기화(on-demand)한다.

## 2) 현재 기준선(이 프로젝트 실제 상태)
- `package.json`에 `"nos": "file:nosLib/nos-react-3.0.6.tgz"` 의존성은 이미 존재.
- 코드 레벨에서 `NosManager`, `NOSProvider`, `nosManager.init()` 등 실사용 흔적은 현재 없음.
- 실제 비밀번호 입력 UI가 존재:
  - `src/pages/Login.jsx` (`#login_pw`)
  - `src/pages/SSOLogin.jsx` (`#login_pw`)

즉, "라이브러리 반입"은 되어 있고 "실행 제어 설계/코드"가 없는 상태.

## 3) 감리 통과 관점의 핵심 설계
- 적용 증적은 3층으로 만든다.
  - 소스 증적: nProtect 전용 모듈/게이트/트리거 코드
  - 실행 증적: on-demand 초기화 로그/상태 기록
  - 문서 증적: 정책서 + 변경이력 + 재현 절차
- 실행 정책은 기본값을 "OFF"로 둔다.
  - 평시: nProtect 미초기화
  - 트리거 발생 시: `ensureNProtectReady()` 호출 후 필요한 입력에만 적용

## 4) 단계별 실행 플랜

### 단계 0. 증적 기준선 고정
- 산출물
  - `docs/compliance/nprotect-adoption-baseline.md`
- 내용
  - 현재 의존성 버전, tgz 파일명, 적용 대상 화면 후보, 적용 예정일
  - "현재는 실행 미적용" 사실 명시
- 목적
  - 나중에 "언제/무엇이 바뀌었는지" 감리에서 비교 가능하게 함

### 단계 1. nProtect 전용 래퍼 계층 생성
- 신규 권장 파일
  - `src/security/nprotect/nprotectConfig.js`
  - `src/security/nprotect/nprotectManager.js`
  - `src/security/nprotect/nprotectEvidence.js`
- 구현 포인트
  - `NosManager` 생성/초기화 로직을 앱 전역에서 직접 쓰지 않고 래퍼로 캡슐화
  - 외부에 노출하는 함수는 최소화
    - `ensureNProtectReady()`
    - `isNProtectReady()`
    - `markEvidence(event, payload)`
- 목적
  - 나중에 정책 변경(자동실행/지연실행)을 래퍼 한 곳에서 통제

### 단계 2. 환경변수 기반 실행정책 분리
- `.env.example`에 항목 추가
  - `VITE_NPROTECT_INTEGRATED=true`
  - `VITE_NPROTECT_AUTO_INIT=false`
  - `VITE_NPROTECT_ON_DEMAND=true`
  - `VITE_NPROTECT_EVIDENCE_LOG=true`
- 규칙
  - `AUTO_INIT=false`면 앱 시작 시 init 금지
  - `ON_DEMAND=true`면 트리거에서만 init 허용
- 목적
  - "코드 수정 없이 정책 전환 가능" 증적 확보

### 단계 3. 앱 진입점에 게이트 추가 (실행 지연의 핵심)
- 적용 위치
  - `src/App.jsx` 또는 `src/main.jsx`
- 구현 포인트
  - 앱 부팅 시 nProtect init 호출 금지
  - nProtect 상태 컨텍스트(예: `idle`, `initializing`, `ready`, `failed`)만 제공
- 목적
  - 전역 자동실행 방지 + 필요한 시점에만 호출할 수 있는 구조 마련

### 단계 4. 트리거 기반 on-demand 초기화
- 1차 트리거 대상(실제 민감입력 존재 화면)
  - `src/pages/Login.jsx`
  - `src/pages/SSOLogin.jsx`
- 트리거 방식
  - 비밀번호 input focus 시 1회 `ensureNProtectReady()`
  - 로그인 버튼 click 직전 `ensureNProtectReady()` 재확인
- 실패 정책
  - nProtect 초기화 실패 시 사용자 안내 + 평문 전송 차단 여부를 정책으로 명확히 결정
- 목적
  - "실행은 나중"을 구현하면서도 실제 사용 시점에는 보안 적용 보장

### 단계 5. 입력필드 표식(증적 + 적용대상 식별)
- 권장 규칙
  - 보호 대상 필드에 명시적 속성 부여
    - 예: `data-nprotect="on"`, `data-npkencrypt="on"`
- 1차 적용 필드
  - `#login_pw` (Login/SSOLogin)
- 목적
  - 감리 시 "어떤 필드가 보호 대상인지" 소스로 즉시 증명

### 단계 6. 증적 자동화 스크립트 추가
- 신규 권장 파일
  - `scripts/generate-nprotect-evidence.mjs`
- 생성 산출물
  - `artifacts/nprotect-evidence-YYYYMMDD.json`
- 포함 항목
  - 프로젝트명/브랜치/커밋 SHA
  - `nos` 의존성 버전
  - 환경변수 정책값
  - 보호대상 필드 목록
  - 마지막 on-demand init 이벤트 로그 요약
- 목적
  - 감리 요청 시 클릭 몇 번으로 동일 형식 증적 재생성

### 단계 7. 감리용 문서 패키지 완성
- 신규 권장 문서
  - `docs/compliance/nprotect-operational-policy.md`
  - `docs/compliance/nprotect-test-checklist.md`
  - `docs/compliance/nprotect-evidence-readme.md`
- 필수 기재
  - "기본 미실행, 필요 시 실행" 정책 이유
  - 실행 트리거 조건
  - 예외/장애 시 처리
  - 롤백 방법

### 단계 8. 검증 및 인수 기준
- 기능 검증
  - 기본 페이지 진입 시 nProtect init이 호출되지 않음
  - 로그인 비번 필드 focus 시 최초 1회 init 호출
  - 재입력 시 불필요한 재초기화 없음
- 증적 검증
  - 산출 JSON/문서/코드 경로가 서로 일치
- 인수 기준
  - "적용 증적"과 "지연 실행" 둘 다 재현 가능할 것

## 5) 권장 파일 변경 맵
- 필수(1차)
  - `src/App.jsx`
  - `src/pages/Login.jsx`
  - `src/pages/SSOLogin.jsx`
  - `.env.example`
  - `docs/compliance/*`
  - `scripts/generate-nprotect-evidence.mjs`
- 선택(2차)
  - `src/context/NProtectContext.jsx`
  - `src/hooks/useNProtect.js`

## 6) 감리 대응용 한 문장 정의
- "smep-ufe는 2026-04-13 기준 nProtect 연동 구조를 코드에 반영했으며, 운영 안정성을 위해 기본 미실행 정책을 적용하고 민감정보 입력 시점에만 on-demand 초기화하도록 설계되었습니다."

## 7) 실제 적용 순서(작업자 체크리스트)
1. nProtect 래퍼/게이트 코드 생성
2. 로그인/SSO 로그인 필드에 트리거 연결
3. 환경변수 정책 분리
4. 증적 스크립트 추가
5. 감리 문서 3종 작성
6. QA 시나리오로 동작/증적 동시 검증
7. 증적 JSON 생성 후 배포 산출물에 포함
