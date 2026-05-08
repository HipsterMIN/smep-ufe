import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api as apiClient } from '../lib/apiClient.js';
import { mockMenuData } from '@lib/menuData.js';
import { useAuthStore } from './useAuthStore.jsx';

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
  // 상태
  menuTree: null, // 메뉴 트리 데이터
  flatMenuMap: {}, // menuId를 key로 하는 flat map (빠른 조회용)
  isLoading: false, // 로딩 상태
  error: null, // 에러

  /**
   * 메뉴 트리를 평탄화하여 menuId 맵 생성
   * before : { menuId: 'M1', children: [ { menuId: 'M2', children: [] } ] }
   * after  : { 'M1': { ... }, 'M2': { ... } }
   * @param {Object} menuData - 메뉴 트리 데이터 { menuId: 'M1', children: [ { menuId: 'M2', children: [] } ] }
   */
  _buildFlatMap: (menuData) => {
    const flatMap = {};
    const buildFlatMap = (node) => {
      flatMap[node.menuId] = node;
      if (node.children && node.children.length > 0) {
        node.children.forEach(buildFlatMap);
      }
    };
    buildFlatMap(menuData);
    return flatMap;
  },

  /**
   * 메뉴 데이터 API 호출 및 상태 업데이트
   */
  fetchMenuData: async () => {
    // 로딩 상태 설정
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get('/api/v1/menu');
      const rawMenuData = response.data || response;

      if (!rawMenuData) {
        throw new Error('응답 데이터가 비어있습니다.');
      }

      const menuData = filterMenuByCurrentMode(rawMenuData);

      // 메뉴 데이터를 평탄화된 맵으로 변환
      const flatMap = get()._buildFlatMap(menuData);

      // 상태 업데이트
      set({
        menuTree: menuData,
        flatMenuMap: flatMap,
        isLoading: false,
      });

      return menuData;
    } catch (error) {
      // 개발 환경이거나 API 호출 실패 시 목데이터 사용
      const isDev = import.meta.env.MODE === 'development';
      
      if (isDev) {
        console.warn('메뉴 데이터 API 호출 실패, 개발 환경이므로 목데이터를 사용합니다:', error.message);
      } else {
        console.error('메뉴 데이터 로드 실패:', error.message);
      }

      const menuData = filterMenuByCurrentMode(mockMenuData);
      const flatMap = get()._buildFlatMap(menuData);

      set({
        menuTree: menuData,
        flatMenuMap: flatMap,
        isLoading: false,
        error: isDev ? null : error.message, // 개발환경에서는 에러 상태로 처리하지 않음
      });

      return menuData;
    }
  },

  // menuId로 메뉴 노드 찾기
  getMenuById: (menuId) => {
    return get().flatMenuMap[menuId] || null;
  },

  // 메뉴 데이터 초기화
  resetMenu: () => {
    set({ menuTree: null, flatMenuMap: {}, error: null });
  },
});

// devtools 적용 : 브라우저 개발자 도구에서 상태 추적 가능(redux devtools 등)
export const useMenuStore = create(
  devtools(menuStoreImpl, { name: 'MenuStore' }),
);

