import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        isLogin: false,
        bizno: null,
        cmpNm: null,
        companySize: null,
        companyProfile: null,
        login: (bizno, cmpNm, companySize, companyProfile) =>
          set(
            {
              isLogin: true,
              bizno: bizno,
              cmpNm: cmpNm,
              companySize: companySize,
              companyProfile: companyProfile || null,
            },
            false,
            'auth/login',
          ),
        logout: () =>
          set(
            {
              isLogin: false,
              bizno: null,
              cmpNm: null,
              companySize: null,
              companyProfile: null,
            },
            false,
            'auth/logout',
          ),
        setBizno: (bizno) => set({ bizno, isLogin: true }, false, 'auth/setBizno'),
        setCompanyProfile: (companyProfile) => set({ companyProfile }, false, 'auth/setCompanyProfile'),
      }),
      {
        name: 'auth-storage',
      },
    ),
    {
      name: 'AuthStore',
    },
  ),
);
