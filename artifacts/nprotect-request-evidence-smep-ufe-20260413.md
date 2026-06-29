# 설치계획서 증빙자료 회신(안) - smep-ufe

- 작성일: 2026. 04. 13.
- 프로젝트: smep-ufe
- 저장소 경로: `C:\Users\User\Projects\smep-ufe`
- 브랜치: `feature/keycloak-sso-im`
- 커밋 SHA: `218483962267ae9d62c6d74b7a2ed0789343be32`

## 점검 결과 표

| No | 요청 항목 | 적용 여부(Y/N) | 실제 경로(절대경로) | 캡처 파일명(권장) | 비고 |
|---|---|---|---|---|---|
| 1 | nppfs-1.13.0.js | N | - | smep-ufe_01_nppfs_js_path_or_not_found.png | 프로젝트 내 미존재 |
| 2 | nppfs.install.jsp | N | - | smep-ufe_02_nppfs_install_jsp_path_or_not_found.png | JSP 파일 미존재 |
| 3 | nppfs.key.jsp | N | - | smep-ufe_03_nppfs_key_jsp_path_or_not_found.png | JSP 파일 미존재 |
| 4 | nppfs.keypad.jsp | N | - | smep-ufe_04_nppfs_keypad_jsp_path_or_not_found.png | JSP 파일 미존재 |
| 5 | nprotect.properties | N | - | smep-ufe_05_nprotect_properties_path_or_not_found.png | 설정 파일 미존재 |
| 6 | com.nprotect.pluginfree.v1.5.1.java17.20240807 | N | - | smep-ufe_06_nprotect_plugin_jar_not_found.png | 프런트 저장소로 JAR 미사용(백엔드 항목) |
| 7 | WEB-INF-resources-default | N | - | smep-ufe_07_webinf_default_path_or_not_found.png | WEB-INF/JSP 리소스 구조 미사용 |
| 8 | WEB-INF-resources-mobile | N | - | smep-ufe_08_webinf_mobile_path_or_not_found.png | WEB-INF/JSP 리소스 구조 미사용 |
| 9 | noslib-nos-react-3.0.6.tgz | Y | C:\Users\User\Projects\smep-ufe\nosLib\nos-react-3.0.6.tgz | smep-ufe_09_noslib_tgz_path_or_not_found.png | 실제 파일명은 nosLib/nos-react-3.0.6.tgz |
| 10 | package.json dependencies 내 nos 경로 | Y | C:\Users\User\Projects\smep-ufe\package.json | smep-ufe_10_packagejson_nos_dependency.png | nos=file:nosLib/nos-react-3.0.6.tgz |
| 11 | config 선언 파일 경로 및 캡처(nosManagerConfig 등) | Y | C:\Users\User\Projects\smep-ufe\src\security\nprotect\nprotectConfig.js<br/>C:\Users\User\Projects\smep-ufe\src\security\nprotect\nprotectManager.js<br/>C:\Users\User\Projects\smep-ufe\src\context\NProtectContext.jsx<br/>C:\Users\User\Projects\smep-ufe\src\hooks\useNProtect.js<br/>C:\Users\User\Projects\smep-ufe\src\pages\Login.jsx<br/>C:\Users\User\Projects\smep-ufe\src\pages\SSOLogin.jsx<br/>C:\Users\User\Projects\smep-ufe\.env.example | smep-ufe_11_nos_config_declarations.png | nProtect 래퍼/정책 선언 파일 확인 |

## 제출 캡처 권고(프런트)
- 루트 구조 캡처 1장: `package.json`, `src`, `nosLib`, `docs`가 보이도록 촬영
- `nosLib` 폴더 캡처 1장: `nos-react-3.0.6.tgz` 파일명/경로 포함
- `package.json` 캡처 1장: `dependencies.nos` 항목 포함
- nProtect 설정 코드 캡처 2장 이상: `nprotectConfig.js`, `nprotectManager.js`
- 미존재 항목 검색결과 캡처 1장: `nppfs*.jsp`, `nprotect.properties`, `WEB-INF/resources/*`

## 주의 사항
- 현재 프런트는 `evidence-only` 정책(`VITE_NPROTECT_EVIDENCE_ONLY=true`)으로 nProtect 초기화를 수행하지 않음
- 본 문서는 증빙 제출 목적이며, 실동작 연계 전환 시 정책 및 런타임 설정 재검토 필요