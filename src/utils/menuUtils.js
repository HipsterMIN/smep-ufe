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

export const isHttpProtocolUrl = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return false;

  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// 외부 링크 유틸리티 함수 (TODO : 데이터 구조 개선 시 제거)
export const extractExternalUrl = (link) => {
  /*
  결과: "http://..." 또는 "https://..."로 시작하는 부분을 찾아서 반환
  예: "/do/https://example.com" → "https://example.com" 추출
   */
  const raw = String(link ?? '').trim();
  if (!raw) return null;

  const httpMatch = raw.match(/https?:\/\/.+/i);
  const candidate = httpMatch ? httpMatch[0] : null;
  return isHttpProtocolUrl(candidate) ? candidate : null;
};

export const getMenuExternalUrl = (menuNode) => extractExternalUrl(menuNode?.scrnUrlAddr);

export const isExternalMenuNode = (menuNode) => Boolean(getMenuExternalUrl(menuNode));

export const findFirstVisibleTMenu = (menuNode, predicate = () => true) => {
  if (!menuNode?.children || menuNode.children.length === 0) {
    return null;
  }

  const queue = [...menuNode.children];
  while (queue.length > 0) {
    const node = queue.shift();

    if (node.scrnTypeCd === 'T' && node.lfsdMenuExpsrYn === 'Y' && predicate(node)) {
      return node;
    }

    if (node.children && node.children.length > 0) {
      queue.push(...node.children);
    }
  }

  return null;
};
