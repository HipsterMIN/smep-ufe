import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';

// BroadcastChannel 생성 (싱글톤)
const authChannel = new BroadcastChannel('auth_channel');

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => {
        // 채널 메시지 리스너 등록
        authChannel.onmessage = (event) => {
          if (event.data.type === 'LOGOUT') {
            // 다른 탭에서 로그아웃 메시지 수신 시 상태 초기화
            set(
              {
                isLogin: false,
                bizno: null,
                cmpNm: null,
                companySize: null,
                companyProfile: null,
              },
              false,
              'auth/sync_logout'
            );
            // 필요 시 리다이렉트 로직 추가 가능 (예: window.location.href = '/')
          }
        };

        return {
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
            // 다른 탭에 로그아웃 이벤트 전파
            authChannel.postMessage({ type: 'LOGOUT' });

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
        };
      },
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
