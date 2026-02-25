// stores/useSidebarStore.js
import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
  openMenus: {},
  toggleMenu: (index) =>
    set((state) => ({
      openMenus: {
        ...state.openMenus,
        [index]: !state.openMenus[index],
      },
    })),

  // ✅ 추가: 특정 메뉴를 열림/닫힘 상태로 직접 설정
  setOpenMenu: (index, isOpen) =>
    set((state) => ({
      openMenus: {
        ...state.openMenus,
        [index]: isOpen,
      },
    })),

  closeAllMenus: () => set({ openMenus: {} }),
}));