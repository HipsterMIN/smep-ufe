import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
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
        logout: () => {
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
          );
          // 세션 스토리지 강제 삭제 (persist 미들웨어 키)
          sessionStorage.removeItem('auth-storage');
          // AI 채팅 관련 세션 스토리지 정리
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith('ai-chat-payload:')) {
              sessionStorage.removeItem(key);
            }
          });
        },
        setBizno: (bizno) => set({ bizno, isLogin: true }, false, 'auth/setBizno'),
        setCompanyProfile: (companyProfile) => set({ companyProfile }, false, 'auth/setCompanyProfile'),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => sessionStorage), // sessionStorage 사용 설정
      },
    ),
    {
      name: 'AuthStore',
    },
  ),
);
