import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api as apiClient } from '../lib/apiClient.js';
import { mockMenuData } from '@lib/menuData.js';
import { useAuthStore } from './useAuthStore.jsx';

// 스토어 외부에서도 재사용 가능한 flatMap 빌더
export const buildFlatMap = (menuData) => {
  const flatMap = {};
  const build = (node) => {
    flatMap[node.menuId] = node;
    (node.children || []).forEach(build);
  };
  build(menuData);
  return flatMap;
};

const COMPANY_INFO_MANAGEMENT_MENU_ID = 'M_PIIO_00119';

const filterMenuByCurrentMode = (menuData) => {
  if (useAuthStore.getState().currentMode !== 'INDIVIDUAL') {
    return menuData;
  }

  const filterNode = (node) => ({
    ...node,
    children: (node.children || [])
      .filter((child) => {
        if (child.menuId === COMPANY_INFO_MANAGEMENT_MENU_ID) {
          return false;
        }

        return true;
      })
      .map(filterNode),
  });

  return filterNode(menuData);
};

/**
 * =============================================================================
 * useMenuStore - 메뉴 트리 데이터 전역 관리
 * =============================================================================
 *
 * 역할:
 * - 백엔드에서 받은 메뉴 트리를 Zustand로 관리
 * - 메뉴 데이터 로딩 상태 및 에러 핸들링
 * - 전체 앱에서 메뉴 데이터 접근 가능
 */
const menuStoreImpl  = (set, get) => ({
  // 상태 — mockMenuData로 즉시 초기화하여 첫 렌더 시 라우터를 동기적으로 생성 가능
  menuTree: mockMenuData,
  flatMenuMap: buildFlatMap(mockMenuData),
  isLoading: false,
  hasFetched: false, // 서버에서 실제 메뉴를 fetch했는지 여부
  error: null,

  // 하위 호환성을 위해 유지 (내부적으로 module-level buildFlatMap 위임)
  _buildFlatMap: buildFlatMap,

  /**
   * 메뉴 데이터 API 호출 및 상태 업데이트
   */
  fetchMenuData: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get('/api/v1/menu');
      const rawMenuData = response.data || response;

      if (!rawMenuData) {
        throw new Error('응답 데이터가 비어있습니다.');
      }

      const menuData = filterMenuByCurrentMode(rawMenuData);
      const flatMap = buildFlatMap(menuData);

      set({
        menuTree: menuData,
        flatMenuMap: flatMap,
        isLoading: false,
        hasFetched: true,
      });

      return menuData;
    } catch (error) {
      const isDev = import.meta.env.MODE === 'development';

      if (isDev) {
        console.warn('메뉴 데이터 API 호출 실패, 개발 환경이므로 목데이터를 사용합니다:', error.message);
      } else {
        console.error('메뉴 데이터 로드 실패:', error.message);
      }

      const menuData = filterMenuByCurrentMode(mockMenuData);
      const flatMap = buildFlatMap(menuData);

      set({
        menuTree: menuData,
        flatMenuMap: flatMap,
        isLoading: false,
        hasFetched: true,
        error: isDev ? null : error.message,
      });

      return menuData;
    }
  },

  // menuId로 메뉴 노드 찾기
  getMenuById: (menuId) => {
    return get().flatMenuMap[menuId] || null;
  },

  // 메뉴 데이터 초기화 (모드 전환 시 호출 — mockMenuData로 되돌려 즉시 라우터 유지)
  resetMenu: () => {
    set({
      menuTree: mockMenuData,
      flatMenuMap: buildFlatMap(mockMenuData),
      hasFetched: false,
      error: null,
    });
  },
});

// devtools 적용 : 브라우저 개발자 도구에서 상태 추적 가능(redux devtools 등)
export const useMenuStore = create(
  devtools(menuStoreImpl, { name: 'MenuStore' }),
);

