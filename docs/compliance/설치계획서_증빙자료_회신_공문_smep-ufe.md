# 설치계획서 증빙자료 회신(안) - smep-ufe 보완본

- 작성일: 2026-04-13
- 대상 저장소: `C:\Users\User\Projects\smep-ufe`
- 기준 문서: `docs/설치계획서_증빙자료_회신_공문.md`

## 1. 첨부 공문 분석 결과
- 첨부 공문은 `smep-be` 결과를 중심으로 작성되어 있고, `smep-ufe`는 `1~11 항목 확인 필요` 상태로 비워져 있음.
- 따라서 프런트 제출용으로는 동일 1~11 항목에 대해 `smep-ufe` 기준의 Y/N, 절대경로, 캡처 파일명을 별도 작성해야 함.
- 요청 항목에는 JSP/WEB-INF/JAR 등 백엔드 성격 항목이 포함되어 있어 프런트 저장소에서는 `N`이 정상인 항목이 다수 존재함.

## 2. 프런트 증빙 정책 정합성
- 현재 `smep-ufe`는 `VITE_NPROTECT_EVIDENCE_ONLY=true` 기반 증적전용 모드임.
- 증적전용 모드에서는 `ensureNProtectReady()` 호출 시 초기화를 수행하지 않고 `nprotect_init_skipped` 이벤트만 남김.
- 따라서 제출 관점은 "연동 구조/증적 체계 반영"이며, "실동작 초기화 수행"은 포함하지 않음.

## 3. 공문 1~11 항목 대응 산출물
아래 명령으로 공문 형식 대응 산출물을 생성한다.

```bash
npm run evidence:nprotect:request
```

생성 파일:
- `artifacts/nprotect-request-evidence-smep-ufe-YYYYMMDD.json`
- `artifacts/nprotect-request-evidence-smep-ufe-YYYYMMDD.md`

포함 정보:
- 요청항목 1~11별 적용 여부(Y/N)
- 실제 경로(절대경로)
- 캡처 파일명 권장안
- 비고(프런트 구조 특성 반영)

## 4. 제출 전 확인 체크
1. 산출물의 `generatedAt`, `branch`, `commitSha` 확인
2. No.9/No.10의 실제 경로와 `package.json` 값 일치 확인
3. No.11의 설정 선언 파일 경로가 최신 코드와 일치 확인
4. 캡처 파일명 규칙(`smep-ufe_XX_...png`)으로 실제 캡처본 정리
