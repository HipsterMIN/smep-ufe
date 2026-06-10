export const STREAMDOCS_VIEWER_URL =
  import.meta.env.VITE_STREAMDOCS_VIEWER_URL
  || 'https://portal.smes.go.kr/e-paper/view/sd';

export const STREAMDOCS_ADAPTER_URL =
  import.meta.env.VITE_STREAMDOCS_ADAPTER_URL
  || 'https://portal.smes.go.kr/e-paper/adapter.js';

// 의도: StreamDocs 새창 미리보기 URL 조합 규칙을 화면마다 따로 두면 파라미터 인코딩 방식이 달라질 수 있어 공통화한다.
// 동작: StreamDocs viewer 기본 URL 뒤에 streamdocsId를 안전하게 인코딩해 붙인다.
// 주의: 빈 ID는 호출부에서 미리 걸러야 하며, 이 함수는 URL 문자열 생성만 담당하고 창 열기나 접근 권한 검증은 하지 않는다.
export const buildStreamDocsPreviewUrl = (streamdocsId) =>
  `${STREAMDOCS_VIEWER_URL};streamdocsId=${encodeURIComponent(streamdocsId)}`;
