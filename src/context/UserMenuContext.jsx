// context/UserMenuContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
//import { api } from '../lib/apiClient';
// import { useAuth } from './AuthContext'; // 필요시 token 가져오기용

/**
 * UserMenuContext
 *
 * 사용자 메뉴 구조를 관리합니다.
 * - 현재는 하드코딩 데이터 사용
 * - API 연동 코드는 주석 처리
 * - URL 기반 현재 메뉴 자동 판단
 */

const UserMenuContext = createContext();

/**
 * 하드코딩 메뉴 데이터
 * TODO : 실제 API 응답 형식에 맞게 조정 필요
 */
const MOCK_MENU_DATA = {
  '신청·발급': {
    depth1Title: '신청·발급',
    depth1Link: '/service',
    depth: [
      {
        depth2: 'AI 스마트 검색',
        depth3: [
          {
            label: 'AI 스마트 검색',
            link: '/ai-smart-search',
          },
        ],
      },
      {
        depth2: '중소벤처기업부 지원사업공고',
        depth3: [
          {
            label: '지원사업',
            link: '/service/UI_USR_L_010',
          },
        ],
      },
      {
        depth2: '사업공고',
        depth3: [
          {
            label: '사업공고',
            link: '/service/pbanc',
          },
        ],
      },
      {
        depth2: '정책금융',
        depth3: [
          {
            label: '정책금융안내',
            link: '/service/UI_USR_L_030',
          },
        ],
      },
      {
        depth2: '증명서 발급',
        depth3: [
          {
            label: '증명서 발급',
            link: '/service/UI_USR_L_040',
          },
        ],
      },
    ],
  },
  // 추가 대메뉴가 있다면 여기에 작성
};

export function UserMenuProvider({ children }) {
  const location = useLocation();
  // const { getToken } = useAuth(); // 필요시 주석 해제

  const [menuData, setMenuData] = useState(MOCK_MENU_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
     * API로 메뉴 데이터 가져오기 (현재 주석 처리)
     */
  const fetchMenuData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // const token = getToken();
      // const response = await api.get('/api/v1/menu', { token });
      // setMenuData(response.data || response);

      // 현재는 mock 데이터 사용
      setMenuData(MOCK_MENU_DATA);
    } catch (err) {
      console.error('Failed to fetch menu data:', err);
      setError(err.message);
      // 에러 시 mock 데이터 fallback
      setMenuData(MOCK_MENU_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
     * 초기 로드 시 메뉴 데이터 가져오기
     * 현재는 즉시 mock 데이터 설정
     */
  useEffect(() => {
    // fetchMenuData(); // API 연동 시 주석 해제
    setMenuData(MOCK_MENU_DATA); // 현재는 하드코딩
  }, []);

  /**
     * 현재 URL과 일치하는 메뉴 찾기
     */
  const findActiveMenu = useCallback(() => {
    const currentPath = location.pathname;

    for (const [menuKey, menu] of Object.entries(menuData)) {
      const hasActiveItem = menu.depth.some(item =>
        item.depth3?.some(sub =>
          matchPath({ path: sub.link, end: false }, currentPath),
        ),
      );

      if (hasActiveItem) {
        return menuKey;
      }
    }

    return null;
  }, [location.pathname, menuData]);

  /**
     * 현재 활성 메뉴의 데이터 반환 (2~3depth만)
     */
  const getCurrentMenu = useCallback(() => {
    const activeMenuKey = findActiveMenu();
    return activeMenuKey ? menuData[activeMenuKey] : null;
  }, [findActiveMenu, menuData]);

  /**
     * 특정 메뉴 이름으로 데이터 가져오기
     */
  const getMenuByName = useCallback((menuName) => {
    return menuData[menuName] || null;
  }, [menuData]);

  /**
     * Breadcrumb 자동 생성
     */
  const getBreadcrumb = useCallback(() => {
    const currentMenu = getCurrentMenu();
    if (!currentMenu) return [];

    const currentPath = location.pathname;
    const breadcrumbItems = [
      { label: currentMenu.depth1Title, link: currentMenu.depth1Link || '#' },
    ];

    // 현재 활성 depth3 항목 찾기
    for (const item of currentMenu.depth) {
      const activeSubItem = item.depth3?.find(sub =>
        matchPath({ path: sub.link, end: false }, currentPath),
      );

      if (activeSubItem) {
        breadcrumbItems.push({
          label: activeSubItem.label,
          link: '#',
        });
        break;
      }
    }

    return breadcrumbItems;
  }, [getCurrentMenu, location.pathname]);

  /**
     * 전체 메뉴 목록 (헤더 GNB용 - depth1만)
     */
  const getAllMenus = useCallback(() => {
    return Object.entries(menuData).map(([key, menu]) => ({
      name: key,
      title: menu.depth1Title,
      link: menu.depth1Link,
    }));
  }, [menuData]);

  const value = useMemo(() => ({
    // 현재 페이지 메뉴 (2~3depth)
    currentMenu: getCurrentMenu(),

    // 메뉴 조회
    getMenuByName,
    getAllMenus,

    // Breadcrumb
    breadcrumbItems: getBreadcrumb(),

    // 상태
    loading,
    error,

    // 리프레시 (필요시)
    refreshMenu: fetchMenuData,
  }), [getCurrentMenu, getMenuByName, getAllMenus, getBreadcrumb, loading, error, fetchMenuData]);

  return (
    <UserMenuContext.Provider value={value}>
      {children}
    </UserMenuContext.Provider>
  );
}

/**
 * useUserMenu Hook
 *
 * 사용 예시:
 * const { currentMenu, breadcrumbItems, loading } = useUserMenu();
 */
export function useUserMenu() {
  const context = useContext(UserMenuContext);
  if (!context) {
    throw new Error('useUserMenu must be used within UserMenuProvider');
  }
  return context;
}

export default UserMenuContext;
