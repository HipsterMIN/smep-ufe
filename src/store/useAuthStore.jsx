import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      isLogin: false,
      bizno: null,
      cmpNm: null,
      companySize: null,
      companyProfile: null,
      login: (bizno, cmpNm, companySize, companyProfile) =>
        set({
          isLogin: true,
          bizno: bizno,
          cmpNm: cmpNm,
          companySize: companySize,
          companyProfile: companyProfile || null,
        }),
      logout: () => set({ isLogin: false, bizno: null, cmpNm: null, companySize: null, companyProfile: null }),
      setBizno: (bizno) => set({ bizno, isLogin: true }),
      setCompanyProfile: (companyProfile) => set({ companyProfile }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
