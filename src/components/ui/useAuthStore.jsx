import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            isLogin: false,
            bizno: null,
            login: () => set({ isLogin: true }),
            logout: () => set({ isLogin: false, bizno: null }),
            setBizno: (bizno) => set({ bizno, isLogin: true }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
