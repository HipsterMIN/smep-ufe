import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            isLogin: false,
            bizno: null,
            cmpNm: null,
            companySize: null,
            login: (bizno, cmpNm, companySize) => set({ isLogin: true, bizno: bizno, cmpNm: cmpNm, companySize: companySize}),
            logout: () => set({ isLogin: false, bizno: null, cmpNm: null, companySize: null }),
            setBizno: (bizno) => set({ bizno, isLogin: true }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
