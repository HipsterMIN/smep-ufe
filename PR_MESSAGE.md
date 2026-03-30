# feat: 검색 결과 건수 천콤마 포맷 공통화

## 배경
- 목록 화면별로 `검색 결과` 숫자 포맷이 일관되지 않아 가독성이 떨어짐
- 일부 화면은 천콤마 적용, 일부 화면은 미적용 상태로 유지보수 비용 증가

## 변경 내용
- 공통 숫자 포맷 유틸 추가
  - `src/utils/numberUtils.js`
  - `formatNumberWithCommas(value)` 제공
- `src/pages` 내 검색 결과 건수 UI 패턴(`검색 결과 <span className="point">{...}</span>개/건`) 전수 적용
  - 기존: `{totalElements}`, `{totalCount}`, `{noticeBoard.totalElements}` 등 직접 출력
  - 변경: `formatNumberWithCommas(... || 0)`로 통일

## 주요 적용 범위
- board 컴포넌트 목록 화면
- certificate 목록 화면
- data-open 목록 화면
- more-service 목록 화면
- my-business 목록 화면
- policy-info 목록 화면
- 기타 목록형 페이지(`UI_USR_L_030`)

## 검증
- 정적 스캔:
  - 동적 바인딩 기반 `검색 결과 + point` 패턴 미적용 0건 확인
- lint:
  - 변경 파일 대상 eslint 실행
  - 기존 코드에 존재하던 무관 이슈로 전체 통과 실패
  - 대표 에러:
    - `src/pages/more-service/RelatedSystems.jsx`: `bizTypeCd` unused
    - `src/pages/my-business/UI_USR_L_510.jsx`: `isExpired` unused

## 기대 효과
- 숫자 표기 UX 일관성 확보
- 포맷 로직 중복 제거로 유지보수성 향상
- 향후 포맷 정책 변경 시 단일 유틸 수정으로 대응 가능

## 리스크 및 롤백
- 리스크: 화면 렌더링 문자열 포맷 변경(로직 영향은 낮음)
- 롤백: 검색 결과 건수 바인딩 라인과 유틸 import만 되돌리면 복구 가능

## 리뷰 포인트
- `검색 결과` 텍스트가 노출되는 목록 화면에서 천콤마 표시가 의도대로 보이는지
- `0`, `null`, `undefined` 케이스에서 `0` 출력이 요구사항에 부합하는지
