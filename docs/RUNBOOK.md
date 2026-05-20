# SMEP-UFE — 장애 대응 런북 (Runbook)

> **버전**: 1.0.0 | **작성일**: 2026-05-20 | **대상 환경**: NHN Cloud K8s DMZ (운영)
>
> 이 문서는 실제 운영 클러스터 상태(2026-05-20 기준)를 바탕으로 작성되었습니다.  
> **DMZ 배스천(`tipa-prod-dmz-mgmt`)에서 실행합니다.**  
> (내부망 배스천과 별개의 클러스터입니다.)

---

## 목차

1. [서비스 개요](#1-서비스-개요)
2. [빠른 상태 점검 (First Check)](#2-빠른-상태-점검-first-check)
3. [장애 유형별 대응](#3-장애-유형별-대응)
   - [3-1. Pod 다운 / CrashLoopBackOff](#3-1-pod-다운--crashloopbackoff)
   - [3-2. 정적 파일 서비스 장애 (nginx 404/500)](#3-2-정적-파일-서비스-장애-nginx-404500)
   - [3-3. API 프록시 장애 (nginx → BE 연결)](#3-3-api-프록시-장애-nginx--be-연결)
   - [3-4. HPA 스케일 이상 (트래픽 폭증)](#3-4-hpa-스케일-이상-트래픽-폭증)
   - [3-5. 배포 실패 (ArgoCD)](#3-5-배포-실패-argocd)
   - [3-6. 롤백](#3-6-롤백)
4. [nginx 설정 구조 상세](#4-nginx-설정-구조-상세)
5. [주요 명령어 레퍼런스](#5-주요-명령어-레퍼런스)
6. [연락처 및 에스컬레이션](#6-연락처-및-에스컬레이션)

---

## 1. 서비스 개요

### 운영 환경 (실제 kubectl 기준)

| 항목 | 값 |
|------|-----|
| Deployment | `smep-ufe-prd` |
| Namespace | `smepfe` (DMZ 클러스터) |
| Replica | 1 (HPA: min 1, max 4, CPU 80%) |
| Service (ClusterIP) | `10.254.113.216:80` |
| 배스천 | `tipa-prod-dmz-mgmt` (**내부망과 다른 클러스터**) |
| 이미지 레지스트리 | NHN NCR or CubeI Flow Hub |
| 배포 방식 | ArgoCD + Helm |
| 서비스 | 사용자 프론트엔드 (React/Vite 빌드, nginx 서빙) |

### 서비스 트래픽 흐름

```
[외부 사용자 브라우저]
        │
        ▼
[DMZ 클러스터 — tipa-prod-dmz-mgmt 배스천]
  namespace: smepfe
  smep-ufe-prd (nginx, port 80)
        │
        ├── 정적 파일 서빙: /usr/share/nginx/html/
        │   컨텍스트: /main-dev/* → React SPA
        │
        └── API 프록시:
            /main-dev/api/ → proxy_pass http://smep-be-dev.smepbe:8080
            /main-dev/actuator/ → proxy_pass http://smep-be-dev.smepbe:8080
            /api/ → proxy_pass http://smep-be-dev.smepbe:8080 (호환용)
                      │
                      ▼
            [내부망 클러스터 — smepbe namespace]
            smep-be-prd (ClusterIP: 10.254.37.225:8080)
```

> ℹ️ nginx.conf의 `proxy_pass` 대상이 `smep-be-dev.smepbe:8080`으로 설정되어 있습니다.  
> DMZ ↔ 내부망 간 네트워크 정책(NetworkPolicy)이 허용되어 있어야 합니다.

### HPA 현황

```
NAME           REFERENCE               TARGETS       MINPODS   MAXPODS   REPLICAS
smep-ufe-prd   Deployment/smep-ufe-prd   cpu: 0%/80%   1         4         1
```

---

## 2. 빠른 상태 점검 (First Check)

**모든 명령어는 DMZ 배스천(`tipa-prod-dmz-mgmt`)에서 실행합니다.**

```bash
# 1. smep-ufe-prd Pod 상태
kubectl get pod -n smepfe -l app.kubernetes.io/name=smep-ufe -o wide
# 또는
kubectl get pod -n smepfe | grep smep-ufe

# 2. Pod 이벤트 확인
kubectl describe pod -n smepfe -l app.kubernetes.io/name=smep-ufe | tail -30

# 3. nginx 프로세스 및 설정 확인
UFE_POD=$(kubectl get pod -n smepfe -l app.kubernetes.io/name=smep-ufe -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n smepfe $UFE_POD -- nginx -t
kubectl exec -n smepfe $UFE_POD -- nginx -V 2>&1 | head -3

# 4. nginx access/error 로그
kubectl exec -n smepfe $UFE_POD -- tail -50 /var/log/nginx/access.log
kubectl exec -n smepfe $UFE_POD -- tail -50 /var/log/nginx/error.log

# 5. 정적 파일 존재 확인
kubectl exec -n smepfe $UFE_POD -- ls -la /usr/share/nginx/html/

# 6. BE API 프록시 연결 테스트 (DMZ → 내부망)
kubectl exec -n smepfe $UFE_POD -- \
  curl -s --connect-timeout 5 http://smep-be-dev.smepbe:8080/main-dev/actuator/health

# 7. HPA 상태
kubectl get hpa smep-ufe-prd -n smepfe

# 8. Service 상태
kubectl get svc smep-ufe-prd -n smepfe
```

### 정상 상태 기준

```
pod/smep-ufe-prd-xxxx   1/1     Running   0
service/smep-ufe-prd    ClusterIP   10.254.113.216   80/TCP
nginx -t: nginx: configuration file /etc/nginx/nginx.conf test is successful
BE health: {"status":"UP"}
```

---

## 3. 장애 유형별 대응

---

### 3-1. Pod 다운 / CrashLoopBackOff

#### 증상
- `kubectl get pod -n smepfe` 에서 `0/1 CrashLoopBackOff` 또는 `Error`
- 사용자 페이지 접속 불가

#### 진단

```bash
UFE_POD=$(kubectl get pod -n smepfe -l app.kubernetes.io/name=smep-ufe -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

# 현재 Pod 상태 및 재시작 횟수
kubectl get pod -n smepfe | grep smep-ufe

# 이전 인스턴스 로그 (종료 이후)
kubectl logs -n smepfe <UFE_POD> --previous 2>/dev/null || \
  kubectl logs -n smepfe -l app.kubernetes.io/name=smep-ufe --previous

# 이벤트
kubectl describe pod -n smepfe <UFE_POD> | grep -A20 "Events:"
```

#### 원인별 조치

| 원인 | 로그/이벤트 키워드 | 조치 |
|------|-------------------|------|
| nginx 설정 오류 | `nginx: [emerg]`, `nginx -t failed` | nginx.conf 오류 수정 후 재배포 |
| 이미지 풀 실패 | `ImagePullBackOff`, `ErrImagePull` | ImagePullSecret 재생성 |
| OOMKilled | `Exit Code: 137`, `OOMKilled` | 메모리 리소스 리밋 증가 |
| 정적 파일 없음 | `open() "/usr/share/nginx/html" failed` | 빌드 결과물 포함 이미지 재빌드 |

```bash
# Pod 재시작 (일시적 오류)
kubectl rollout restart deployment/smep-ufe-prd -n smepfe
kubectl rollout status deployment/smep-ufe-prd -n smepfe

# 이미지 풀 시크릿 재생성
kubectl delete secret ncr-secret -n smepfe 2>/dev/null
kubectl create secret docker-registry ncr-secret \
  --docker-server=<NCR_REGISTRY> \
  --docker-username=<USER> \
  --docker-password=<TOKEN> \
  -n smepfe
kubectl rollout restart deployment/smep-ufe-prd -n smepfe
```

---

### 3-2. 정적 파일 서비스 장애 (nginx 404/500)

#### 증상
- 페이지 접속 시 `404 Not Found` 또는 흰 화면
- `index.html`은 뜨지만 JS/CSS 로딩 실패 (경로 오류)

#### nginx 라우팅 구조 (smep-ufe prod)

| 요청 경로 | nginx 처리 | 비고 |
|----------|-----------|------|
| `/main-dev/api/*` | `proxy_pass smep-be-dev.smepbe:8080` | BE API 프록시 |
| `/main-dev/actuator/*` | `proxy_pass smep-be-dev.smepbe:8080` | Actuator 프록시 |
| `/api/*` | `proxy_pass smep-be-dev.smepbe:8080` | 호환용 직접 API |
| `/main-dev/assets/*` | `alias /usr/share/nginx/html/assets/` | Vite 빌드 정적 파일 |
| `/main-dev` | `try_files $uri /index.html` | React SPA fallback |
| `/main` | `try_files $uri /index.html` | React SPA fallback |

#### 진단

```bash
UFE_POD=$(kubectl get pod -n smepfe -l app.kubernetes.io/name=smep-ufe -o jsonpath='{.items[0].metadata.name}')

# 정적 파일 디렉토리 확인
kubectl exec -n smepfe $UFE_POD -- ls -la /usr/share/nginx/html/
kubectl exec -n smepfe $UFE_POD -- ls /usr/share/nginx/html/assets/ | head -10

# index.html 존재 확인
kubectl exec -n smepfe $UFE_POD -- cat /usr/share/nginx/html/index.html | head -5

# nginx 현재 설정 확인 (마운트된 configmap 등)
kubectl exec -n smepfe $UFE_POD -- cat /etc/nginx/nginx.conf | grep -A5 "location.*main"

# nginx error 로그 확인
kubectl exec -n smepfe $UFE_POD -- tail -100 /var/log/nginx/error.log | grep -E "open|failed|denied"

# 직접 요청 테스트 (Pod 내부)
kubectl exec -n smepfe $UFE_POD -- curl -s -I http://localhost/main-dev/
kubectl exec -n smepfe $UFE_POD -- curl -s -o /dev/null -w "%{http_code}" http://localhost/main-dev/
```

#### 조치

```bash
# Case 1: 빌드 파일 없음 → 이미지 재빌드 및 재배포
# Gitea에서 최신 빌드 이미지 태그 확인 후 ArgoCD에서 이미지 태그 업데이트

# Case 2: nginx.conf 오류 → ArgoCD Helm values에서 nginx configmap 수정 후 sync

# Case 3: SPA 라우팅 404 → try_files 설정 확인
kubectl exec -n smepfe $UFE_POD -- cat /etc/nginx/nginx.conf | grep -B2 -A3 "try_files"
```

---

### 3-3. API 프록시 장애 (nginx → BE 연결)

#### 증상
- 사이트 접속은 되지만 API 호출 시 `502 Bad Gateway` 또는 `504 Gateway Timeout`
- nginx error 로그: `connect() failed`, `upstream timed out`

#### 진단

```bash
UFE_POD=$(kubectl get pod -n smepfe -l app.kubernetes.io/name=smep-ufe -o jsonpath='{.items[0].metadata.name}')

# nginx error 로그에서 upstream 오류 확인
kubectl exec -n smepfe $UFE_POD -- tail -100 /var/log/nginx/error.log | \
  grep -E "upstream|connect|timeout|refused"

# DMZ → 내부망 BE 연결 테스트
kubectl exec -n smepfe $UFE_POD -- \
  curl -sv --connect-timeout 5 http://smep-be-dev.smepbe:8080/main-dev/actuator/health 2>&1

# DNS 해석 확인 (smep-be-dev.smepbe 서비스 DNS)
kubectl exec -n smepfe $UFE_POD -- \
  nslookup smep-be-dev.smepbe 2>/dev/null || \
  kubectl exec -n smepfe $UFE_POD -- getent hosts smep-be-dev.smepbe
```

> ℹ️ `smep-be-dev.smepbe`는 내부망 클러스터의 `smepbe` 네임스페이스에 있는  
> `smep-be-prd` 서비스를 가리킵니다 (`smep-be-dev`는 Service 별칭일 수 있음).  
> DNS 해석 실패 시 NetworkPolicy 또는 CoreDNS 설정 확인이 필요합니다.

#### 조치

```bash
# Case 1: BE Pod 자체 장애 → 내부망 배스천(tipa-prod-int-mgmt)에서 확인
# kubectl get pod -n smepbe -l app.kubernetes.io/name=smep-be-prd (내부망에서)

# Case 2: DMZ → 내부망 네트워크 단절 → 인프라팀 NetworkPolicy 확인

# Case 3: nginx 프록시 타임아웃 조정 (ArgoCD Helm values에서 nginx configmap 수정)
# proxy_read_timeout 60s; (기본값) → 필요시 증가

# Case 4: UFE Pod 재시작으로 nginx 커넥션 초기화
kubectl rollout restart deployment/smep-ufe-prd -n smepfe
```

---

### 3-4. HPA 스케일 이상 (트래픽 폭증)

#### HPA 설정

```
smep-ufe-prd: cpu: 0%/80%, min=1, max=4
```

#### 진단

```bash
# HPA 상태 확인
kubectl get hpa smep-ufe-prd -n smepfe -o wide
kubectl describe hpa smep-ufe-prd -n smepfe

# Pod CPU/Memory 사용량
kubectl top pod -n smepfe -l app.kubernetes.io/name=smep-ufe

# 현재 replica 수
kubectl get deployment smep-ufe-prd -n smepfe -o jsonpath='{.status.replicas}'
```

#### 조치

```bash
# 트래픽 폭증 시 수동 스케일 아웃 (HPA 상한 4개)
kubectl scale deployment smep-ufe-prd -n smepfe --replicas=4

# nginx 워커 프로세스 설정 확인 (worker_processes auto)
UFE_POD=$(kubectl get pod -n smepfe -l app.kubernetes.io/name=smep-ufe -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n smepfe $UFE_POD -- cat /etc/nginx/nginx.conf | grep worker

# nginx 커넥션 수 확인
kubectl exec -n smepfe $UFE_POD -- nginx -s status 2>/dev/null || \
  kubectl exec -n smepfe $UFE_POD -- curl -s localhost/nginx_status 2>/dev/null
```

---

### 3-5. 배포 실패 (ArgoCD)

```bash
# DMZ 클러스터에서 ArgoCD Application 확인
kubectl get application smep-ufe-prd -n argocd

# 상세 상태
kubectl describe application smep-ufe-prd -n argocd | tail -30

# 강제 재동기화
argocd app sync smep-ufe-prd --force

# 또는 kubectl로 refresh 트리거
kubectl annotate application smep-ufe-prd -n argocd \
  argocd.argoproj.io/refresh="hard" --overwrite
```

---

### 3-6. 롤백

#### ArgoCD를 통한 롤백 (권장)

```bash
# 릴리스 히스토리
argocd app history smep-ufe-prd

# 특정 Revision으로 롤백
argocd app rollback smep-ufe-prd <REVISION>
```

#### Deployment 롤백

```bash
# 롤백 히스토리
kubectl rollout history deployment/smep-ufe-prd -n smepfe

# 직전 버전으로 롤백
kubectl rollout undo deployment/smep-ufe-prd -n smepfe

# 특정 버전으로 롤백
kubectl rollout undo deployment/smep-ufe-prd -n smepfe --to-revision=<N>

# 진행 상태 확인
kubectl rollout status deployment/smep-ufe-prd -n smepfe
```

> ⚠️ ArgoCD Auto-Sync가 활성화된 경우, kubectl 롤백 후 다시 덮어쓸 수 있습니다.  
> Gitea Helm values의 이미지 태그를 직접 수정하여 롤백하는 것을 권장합니다.

---

## 4. nginx 설정 구조 상세

### Context Path 매핑 (smep-ufe prod)

```nginx
# API 프록시 (우선순위 높음 — ^~ prefix)
location ^~ /main-dev/api/ {
    rewrite ^/main-dev/(.*)$ /$1 break;
    proxy_pass http://smep-be-dev.smepbe:8080;
    # X-Matched-By: API-PROXY-BE-DEV
}

location ^~ /main-dev/actuator/ {
    rewrite ^/main-dev/(.*)$ /$1 break;
    proxy_pass http://smep-be-dev.smepbe:8080;
    # X-Matched-By: API-PROXY-ACTUATOR-DEV
}

location ^~ /api/ {
    proxy_pass http://smep-be-dev.smepbe:8080;
    # 호환용 직접 /api 호출
}

# 정적 자산
location /main/assets/ { access_log off; }

location ^~ /main-dev/assets/ {
    alias /usr/share/nginx/html/assets/;
    # X-Matched-By: STATIC-USER-DEV-ASSETS
}

# SPA fallback
location /main {
    try_files $uri $uri/ /index.html;
}

location ^~ /main-dev {
    alias /usr/share/nginx/html/;
    try_files $uri $uri/ /index.html;
}
```

### nginx 디버그 헤더

`X-Matched-By` 헤더를 활용해 어떤 location block이 처리했는지 확인:

```bash
UFE_POD=$(kubectl get pod -n smepfe -l app.kubernetes.io/name=smep-ufe -o jsonpath='{.items[0].metadata.name}')

# SPA 요청 확인
kubectl exec -n smepfe $UFE_POD -- \
  curl -s -I http://localhost/main-dev/ | grep -E "HTTP|X-Matched"

# API 프록시 확인
kubectl exec -n smepfe $UFE_POD -- \
  curl -s -I http://localhost/main-dev/api/test | grep -E "HTTP|X-Matched"

# 정적 자산 확인
kubectl exec -n smepfe $UFE_POD -- \
  curl -s -I http://localhost/main-dev/assets/ | grep -E "HTTP|X-Matched"
```

### Vite 빌드 환경 변수 (빌드 시 주입)

| 변수 | 설명 |
|------|------|
| `VITE_BASE` | nginx base path (예: `/main-dev/`) |
| `VITE_API_HOST` | API 백엔드 호스트 (로컬 개발용) |
| `VITE_API_CONTEXT` | API context path (예: `/main-dev`) |

> 운영 빌드 시 `npm run build:prod` 사용. 빌드된 파일은 Docker 이미지에 포함됨.

---

## 5. 주요 명령어 레퍼런스

```bash
# Pod 이름 변수 설정 (재사용)
UFE_POD=$(kubectl get pod -n smepfe -l app.kubernetes.io/name=smep-ufe \
  -o jsonpath='{.items[0].metadata.name}')

# Pod 상태
kubectl get pod -n smepfe | grep smep-ufe

# 로그 스트리밍
kubectl logs -n smepfe -l app.kubernetes.io/name=smep-ufe -f

# 로그 (타임스탬프 + 최근 200줄)
kubectl logs -n smepfe $UFE_POD --timestamps=true --tail=200

# 이전 인스턴스 로그
kubectl logs -n smepfe $UFE_POD --previous

# nginx 설정 테스트
kubectl exec -n smepfe $UFE_POD -- nginx -t

# nginx 무중단 reload (설정 변경 적용)
kubectl exec -n smepfe $UFE_POD -- nginx -s reload

# nginx access log
kubectl exec -n smepfe $UFE_POD -- tail -f /var/log/nginx/access.log

# nginx error log
kubectl exec -n smepfe $UFE_POD -- tail -f /var/log/nginx/error.log

# 정적 파일 목록
kubectl exec -n smepfe $UFE_POD -- ls -lh /usr/share/nginx/html/

# BE 연결 테스트
kubectl exec -n smepfe $UFE_POD -- \
  curl -sv --connect-timeout 5 http://smep-be-dev.smepbe:8080/main-dev/actuator/health

# Pod 재시작
kubectl rollout restart deployment/smep-ufe-prd -n smepfe
kubectl rollout status deployment/smep-ufe-prd -n smepfe

# HPA 상태
kubectl get hpa smep-ufe-prd -n smepfe -o wide

# 리소스 사용량
kubectl top pod -n smepfe -l app.kubernetes.io/name=smep-ufe

# Deployment 이미지 태그 확인
kubectl get deployment smep-ufe-prd -n smepfe \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
```

---

## 6. 연락처 및 에스컬레이션

| 단계 | 조건 | 담당 | 조치 |
|------|------|------|------|
| **1단계** | nginx Pod 재시작으로 해결 | 운영 담당자 | `kubectl rollout restart` |
| **2단계** | 빌드/이미지 문제 | 개발팀 | 이미지 재빌드 + ArgoCD 재배포 |
| **3단계** | BE API 연결 불가 | BE 운영팀 (내부망) | `smep-be-prd` Pod 상태 확인 (내부망 배스천) |
| **4단계** | DMZ ↔ 내부망 네트워크 단절 | 인프라팀 | NHN Cloud VPC/NetworkPolicy 확인 |
| **5단계** | DMZ 클러스터/노드 장애 | NHN Cloud 지원 | NHN Cloud NKS DMZ 클러스터 지원 요청 |

### DMZ ↔ 내부망 장애 체크리스트

사용자 프론트엔드에서 API 전체 불통 시:

```
1. smep-ufe-prd Pod nginx error log 확인
   → "connect() failed" 또는 "no route to host" 확인

2. DMZ Pod에서 내부망 BE 직접 ping/curl 테스트
   kubectl exec -n smepfe $UFE_POD -- curl http://smep-be-dev.smepbe:8080/main-dev/actuator/health

3. 내부망 smep-be-prd Pod 상태 확인 (내부망 배스천에서)
   kubectl get pod -n smepbe -l app.kubernetes.io/name=smep-be-prd

4. 내부망 → DMZ NetworkPolicy 확인 (인프라팀)

5. Envoy Gateway(192.168.32.60) 상태 확인 (내부망 배스천에서)
   kubectl get gateway envoy-gw -n envoy-gateway
```

---

*이 문서는 실제 운영 클러스터 상태(2026-05-20 기준)를 바탕으로 작성되었습니다.*
