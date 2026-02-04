/**
 * 메뉴 노드의 전체 경로 생성
 * depth0은 무시하고 depth1부터 scrnUrlAddr를 조합
 *
 * @param {Object} menuNode - 메뉴 노드
 * @param {Object} flatMenuMap - menuId를 key로 하는 flat map
 * @returns {string} 전체 경로 (예: "/req/pbanc/pbanc")
 */
export const buildFullPath = (menuNode, flatMenuMap) => {
  const pathSegments = [];
  let currentNode = menuNode;

  // 현재 노드부터 루트까지 거슬러 올라가며 경로 수집
  while (currentNode) {
    // depth 0은 제외
    if (currentNode.depth > 0 && currentNode.scrnUrlAddr) {
      pathSegments.unshift(currentNode.scrnUrlAddr);
    }

    // 부모 노드로 이동
    if (currentNode.upMenuId) {
      currentNode = flatMenuMap[currentNode.upMenuId];
    } else {
      break;
    }
  }

  // 경로 조합 (선행 슬래시 포함)
  return '/' + pathSegments.join('/');
};

// ✅ 외부 링크 유틸리티 함수 (TODO : 데이터 구조 개선 시 제거)
export const extractExternalUrl = (link) => {
  /*
  정규식 패턴: https?:\/\/.+
  - http      → 문자열 "http"와 정확히 일치
  - s?        → "s"가 0개 또는 1개 (http 또는 https 둘 다 매칭)
  - :         → 콜론 문자 ":"
  - \/\/      → 슬래시 2개 "//" (정규식에서 /는 특수문자라 \로 이스케이프)
  - .+        → 임의의 문자(.)가 1개 이상(+) 반복
  결과: "http://..." 또는 "https://..."로 시작하는 부분을 찾아서 반환
  예: "/do/https://example.com" → "https://example.com" 추출
   */
  if (!link) return null;
  const httpMatch = link.match(/https?:\/\/.+/);
  return httpMatch ? httpMatch[0] : null;
};