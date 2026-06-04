# 개발 요청서 — QSign(Keycloak) 팀

> **요청일**: 2026-06-04  
> **요청 시스템**: SMEP (중소벤처기업 통합플랫폼)  
> **수신**: QSign / Keycloak 운영·개발팀  
> **목적**: SMEP 및 유관기관 SSO 정상 연동을 위한 QSign 설정 요청

---

## 1. 배경

SMEP(`www.smes.go.kr`)은 QSign(`isso.smes.go.kr`)을 IdP로 사용하여  
OIDC Authorization Code Flow 기반 SSO를 구현하고 있습니다.

현재 **SMEP 자체 로그인**은 정상 동작하나,  
아래 항목들에 대한 QSign 측 설정 확인 및 추가 작업이 필요합니다.

---

## 2. 요청 항목

### 2-1. Client 등록 및 Redirect URI 화이트리스트 확인

**Realm**: `ucube-qsign`

아래 Client ID의 허용 Redirect URI가 정확히 등록되어 있는지 확인 요청드립니다.

| Client ID | 허용 Redirect URI | 시스템 |
|-----------|-------------------|--------|
| `smes-prd` | `https://www.smes.go.kr/home/sso` | SMEP |
| `semas-sbiz24-prd` | `https://www.sbiz24.kr/qSignSsoPrcs` | sbiz24 |
| `kvca-mna-prd` | `https://www.smes.go.kr/mna-iam/iam/oauth/loginCallback.do` | MNA |
| `ksca-cobiz-prd` | `https://www.smes.go.kr/cobiz-iam/iam/oauth/loginCallback.do` | CoBiz |
| `kmtca-bizlink-prd` | `https://www.smes.go.kr/bizlink-iam/iam/oauth/loginCallback.do` | BizLink |

> ⚠️ Redirect URI가 정확히 일치하지 않으면 `invalid_redirect_uri` 오류가 발생하여  
> SSO 로그인이 불가능합니다. 와일드카드(`*`) 사용 금지를 원칙으로 합니다.

---

### 2-2. SSO 세션 설정 확인

**Realm**: `ucube-qsign`  
아래 세션 설정값의 현재 값과 정책 기준을 공유 요청드립니다.

| 설정 항목 | 설명 | 현재 값 확인 요청 |
|-----------|------|-------------------|
| SSO Session Max | KEYCLOAK_SESSION 쿠키 최대 유지 시간 | ? |
| SSO Session Idle | 비활동 시 세션 만료 시간 | ? |
| Access Token Lifespan | access_token 유효 시간 | ? |
| Refresh Token Lifespan | refresh_token 유효 시간 | ? |
| Client Session Idle | 클라이언트별 세션 유휴 시간 | ? |

> 📌 SMEP FE는 현재 타이머 기반으로 refresh_token을 갱신하고 있습니다.  
> Access Token 유효 시간을 기준으로 갱신 주기를 맞춰야 합니다.

---

### 2-3. `state` 파라미터 포함 여부 확인

**현재 상황**:  
SMEP이 OnePass 로그인 시작 시 Auth URL에 `state` 파라미터를 포함하지 않고 있습니다.  
QSign 콜백 응답에 `state`가 포함되는지 로그 관찰 중입니다.

**요청 사항**:  
1. QSign이 Auth URL에 `state` 없이 요청이 들어올 경우, 콜백에 `state`를 포함하는지 여부 확인
2. `state` 파라미터를 포함하지 않은 요청을 허용하는지 정책 확인

> 📌 SMEP은 CSRF 방어를 위해 `state` 검증을 재활성화할 예정입니다.  
> 이를 위해 QSign이 콜백에 `state`를 정상 반환하는지 확인이 필요합니다.

---

### 2-4. Back-Channel Logout URL 등록 (신규 요청)

**현재 문제**:  
SMEP 또는 유관기관에서 로그아웃 시 `KEYCLOAK_SESSION` 쿠키가 `isso.smes.go.kr`에 잔류하여,  
다른 SP에서 여전히 SSO 로그인이 가능한 상태가 됩니다.

**요청 사항**:  
각 Client에 아래 Back-Channel Logout URL을 등록해 주세요.  
QSign이 로그아웃 이벤트 발생 시 서버-서버 HTTP POST로 각 SP에 알려줍니다.

| Client ID | Back-Channel Logout URL |
|-----------|------------------------|
| `smes-prd` | `https://www.smes.go.kr/api/v1/auth/backchannel-logout` |
| `semas-sbiz24-prd` | (sbiz24 팀에 URL 확인 필요) |
| `kvca-mna-prd` | (MNA 팀에 URL 확인 필요) |
| `ksca-cobiz-prd` | (CoBiz 팀에 URL 확인 필요) |
| `kmtca-bizlink-prd` | (BizLink 팀에 URL 확인 필요) |

> 📌 Back-Channel Logout을 위해 각 Client에서  
> `Backchannel Logout Session Required: ON` 설정도 필요합니다.

---

### 2-5. Front-Channel Logout 동작 확인 (kcIdToken 기반)

**현재 SMEP 로그아웃 방식**:  
```
SMEP FE → smep-be POST /api/v1/auth/logout { kcIdToken }
smep-be → QSign GET .../logout?id_token_hint={kcIdToken}&post_logout_redirect_uri=...
```

**요청 사항**:  
1. `id_token_hint` 포함 로그아웃 요청 시 `KEYCLOAK_SESSION` 쿠키가 정상 삭제되는지 확인
2. `post_logout_redirect_uri` 허용 URI 목록에 아래 주소 등록 확인:
   - `https://www.smes.go.kr/service/login`

---

### 2-6. `prompt=none` Silent Authentication 지원 확인

**목적**:  
북마크/직접 URL 접근 시 기존 SSO 세션이 있으면 로그인 화면 없이 자동 로그인 처리

**요청 사항**:  
1. `prompt=none` 파라미터 지원 여부 확인
2. 세션 있을 때 → `code` 즉시 발급 동작 확인
3. 세션 없을 때 → `error=login_required` 반환 동작 확인

```
요청 예시:
GET .../auth?response_type=code&client_id=smes-prd
  &redirect_uri=https://www.smes.go.kr/home/sso
  &scope=openid&prompt=none
```

---

### 2-7. 타 유관기관 인바운드 연동을 위한 정책 확인

**시나리오**:  
타 유관기관(sbiz24 등)이 사용자를 SMEP으로 보낼 때,  
`client_id=smes-prd`로 QSign Auth URL을 생성하여 redirect 합니다.

**요청 사항**:  
1. 위 시나리오(타 기관이 `smes-prd` client_id 사용)가 허용되는 구조인지 확인
2. 타 기관이 SMEP의 redirect_uri를 사용하는 것이 QSign 정책상 문제가 없는지 확인
3. 이 경우 `state` 파라미터 없이 요청이 들어올 수 있는데, 허용 가능한지 확인

---

## 3. 확인 요청 사항 요약

| 번호 | 항목 | 우선순위 | 비고 |
|------|------|----------|------|
| 2-1 | Client/Redirect URI 등록 확인 | 🔴 긴급 | SSO 로그인 전제조건 |
| 2-2 | 세션 유효시간 설정값 공유 | 🟡 보통 | 토큰 갱신 주기 설정에 필요 |
| 2-3 | state 파라미터 포함 여부 | 🟡 보통 | CSRF 검증 재활성화 전제 |
| 2-4 | Back-Channel Logout URL 등록 | 🟠 높음 | 로그아웃 세션 정리 |
| 2-5 | Front-Channel Logout 동작 확인 | 🟠 높음 | 로그아웃 쿠키 삭제 |
| 2-6 | prompt=none 지원 확인 | 🟡 보통 | 직접 URL 접근 SSO |
| 2-7 | 타 유관기관 인바운드 정책 | 🟡 보통 | 유관기관 연동 |

---

## 4. 문의 및 협의

요청 사항 중 정책적으로 불가하거나 추가 협의가 필요한 항목이 있으면  
SMEP 개발팀으로 연락 부탁드립니다.

특히 **2-4 Back-Channel Logout** 및 **2-5 Front-Channel Logout**은  
구현 전 QSign 설정이 선행되어야 하므로 우선 확인 요청드립니다.
