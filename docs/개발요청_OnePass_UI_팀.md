# 개발 요청서 — OnePass UI 팀

> **요청일**: 2026-06-04  
> **요청 시스템**: SMEP (중소벤처기업 통합플랫폼)  
> **수신**: OnePass UI 개발·운영팀 (`onepass.smes.go.kr`)  
> **목적**: SMEP SSO 연동 관련 OnePass UI 동작 확인 및 개선 요청

---

## 1. 배경

SMEP은 사용자 인증 UI로 OnePass(`onepass.smes.go.kr`)를 사용하고 있습니다.

현재 SMEP의 SSO 로그인 흐름은 아래와 같습니다.

```
사용자 로그인 클릭
    │
    ▼
QSign Auth URL로 redirect
(https://isso.smes.go.kr/qsign/realms/ucube-qsign/.../auth?client_id=smes-prd&...)
    │
    ▼ QSign이 로그인 화면 필요 시 OnePass UI로 위임
    │
    ▼
OnePass 로그인 화면 표시 (onepass.smes.go.kr)
    │
    ▼
사용자 인증 완료
    │
    ▼
QSign이 KEYCLOAK_SESSION 쿠키 발행 후 SMEP redirect_uri로 code 전달
```

**OnePass UI의 역할**: 사용자에게 로그인 화면을 제공하는 **인증 UI** 역할  
**쿠키 발행 주체**: OnePass UI가 아닌 QSign(Keycloak, `isso.smes.go.kr`)

---

## 2. 요청 항목

### 2-1. SSO 콜백 시 `state` 파라미터 포함 여부 확인

**현재 상황**:  
SMEP FE에서 QSign 콜백 파라미터를 관찰한 결과,  
OnePass를 통한 로그인 후 QSign 콜백에 `state` 파라미터 포함 여부가 불확실합니다.

**요청 사항**:  
1. SMEP → QSign Auth URL 생성 시 `state` 파라미터를 포함할 경우, QSign 콜백에 `state`가 정상 반환되는지 확인
2. OnePass UI를 통한 인증 과정에서 `state` 값이 변형되거나 누락되는지 확인
3. 테스트 결과 공유 요청

> 📌 SMEP은 CSRF 방어를 위해 `state` 파라미터 검증을 재활성화할 예정입니다.  
> 현재는 타 유관기관 인바운드 연동을 위해 임시 비활성화 중입니다.

---

### 2-2. OnePass 로그인 화면에서 SMEP 연동 여부 확인

**현재 동작 확인 필요**:  
QSign이 OnePass에 로그인 화면을 위임할 때, OnePass가 어떤 파라미터를 받는지 확인이 필요합니다.

**요청 사항**:  
1. QSign → OnePass로 위임 시 전달되는 파라미터 목록 공유
2. 사용자가 OnePass 화면에서 로그인 성공 후 QSign으로 자격증명이 어떻게 전달되는지 흐름 확인
3. OnePass에서 발생할 수 있는 오류 코드 목록 공유

---

### 2-3. 회원 추가정보 필요 여부 API 또는 응답 필드 확인

**현재 상황**:  
SMEP은 로그인 후 사용자의 추가 정보 등록 여부를 확인하는 `AdditionalInfoRequiredGate`를 운영하고 있습니다.

**요청 사항**:  
OnePass 또는 QSign token 응답(또는 userinfo)에 아래 정보가 포함되는지 확인 요청드립니다.

| 필드 | 설명 | 포함 여부 |
|------|------|-----------|
| 최초 로그인 여부 | 신규 가입 사용자인지 여부 | 확인 필요 |
| 추가정보 등록 여부 | 업체 정보 등 추가 등록 완료 여부 | 확인 필요 |
| 회원 상태 | 활성/잠금/탈퇴 등 | 확인 필요 |
| 이메일 인증 여부 | 이메일 인증 완료 여부 | 확인 필요 |

---

### 2-4. OnePass 로그아웃 처리 확인

**현재 SMEP 로그아웃 흐름**:  
```
SMEP FE 로그아웃 버튼
    → smep-be POST /api/v1/auth/logout { kcIdToken }
    → smep-be → QSign GET .../logout?id_token_hint={kcIdToken}
    → QSign이 KEYCLOAK_SESSION 쿠키 삭제
```

**요청 사항**:  
1. QSign을 통한 로그아웃 시 OnePass 측에서 별도로 처리해야 할 사항이 있는지 확인
2. 소셜 로그인(카카오, 네이버 등) 연동 사용자의 경우 OnePass 측 로그아웃 세션도 별도 처리가 필요한지 확인
3. QSign Back-Channel Logout 이벤트 수신 시 OnePass가 별도 처리를 하는지 확인

---

### 2-5. 회원가입 후 SMEP 복귀 처리

**시나리오**:  
1. 비회원 사용자가 SMEP에서 "로그인" 클릭
2. QSign → OnePass 로그인 화면 진입
3. "회원가입" 클릭
4. 회원가입 완료 후 SMEP으로 복귀하여 로그인 처리

**요청 사항**:  
1. 위 시나리오가 현재 정상 동작하는지 확인
2. 회원가입 완료 후 QSign을 통해 `code`가 SMEP redirect_uri로 정상 전달되는지 확인
3. 회원가입 완료 → SMEP 자동 로그인까지 전체 흐름 테스트 결과 공유

---

### 2-6. OnePass 화면 커스터마이징 범위 확인 (선택 사항)

**요청 사항**:  
SMEP 로고나 서비스명을 OnePass 로그인 화면에 표시하는 것이 가능한지,  
가능하다면 어떤 방식으로 설정하는지 확인 요청드립니다.

- Client별 로그인 화면 테마 설정 지원 여부
- 로그인 화면에 표시할 서비스명/로고 설정 방법
- 로그인 후 "돌아가기" 링크 설정 가능 여부

---

## 3. 확인 요청 사항 요약

| 번호 | 항목 | 우선순위 | 비고 |
|------|------|----------|------|
| 2-1 | state 파라미터 콜백 포함 여부 | 🔴 긴급 | CSRF 검증 재활성화 전제 |
| 2-2 | OnePass 로그인 위임 파라미터 및 흐름 | 🟠 높음 | 연동 구조 이해 |
| 2-3 | 회원 추가정보 필드 포함 여부 | 🟠 높음 | AdditionalInfoGate 연동 |
| 2-4 | 로그아웃 처리 연동 | 🟠 높음 | 세션 정리 |
| 2-5 | 회원가입 후 SMEP 복귀 흐름 | 🟡 보통 | 신규 사용자 UX |
| 2-6 | 화면 커스터마이징 | 🔵 낮음 | 선택 사항 |

---

## 4. 참고 — OnePass의 역할 경계

아래 내용은 SMEP 팀의 현재 이해를 정리한 것입니다.  
다른 부분이 있으면 수정 공유 부탁드립니다.

| 항목 | OnePass UI (`onepass.smes.go.kr`) | QSign/Keycloak (`isso.smes.go.kr`) |
|------|-----------------------------------|-------------------------------------|
| 사용자에게 보이는 로그인 화면 | ✅ 담당 | ❌ |
| 자격증명(ID/PW) 검증 | ⚠️ UI 수집 후 QSign에 위임 | ✅ 실제 검증 |
| SSO 쿠키 발행 | ❌ | ✅ `KEYCLOAK_SESSION` |
| code 발급 | ❌ | ✅ |
| 회원가입 UI | ✅ 담당 | ❌ |
| 비밀번호 찾기 UI | ✅ 담당 | ❌ |
| MFA UI | ✅ (구현 시) | ✅ (정책 설정) |

---

## 5. 문의 및 협의

요청 사항 중 정책적으로 불가하거나 추가 협의가 필요한 항목이 있으면  
SMEP 개발팀으로 연락 부탁드립니다.

특히 **2-1 state 파라미터**는 보안 관련 사항으로  
빠른 확인 및 회신 부탁드립니다.
