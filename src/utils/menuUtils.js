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