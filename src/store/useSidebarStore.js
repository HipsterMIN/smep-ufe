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
  closeAllMenus: () => set({ openMenus: {} }),
}));