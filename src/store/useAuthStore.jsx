import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { resetSilentSsoFlags } from '../utils/onepassSilentSso.js';

// BroadcastChannel 생성 (싱글톤)
const authChannel = new BroadcastChannel('auth_channel');

/**
 * JWT access token의 만료 시각(exp 클레임, Unix seconds)을 파싱한다.
 * 파싱 실패 시 null을 반환한다.
 */
const parseTokenExpiry = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create( 
  devtools(
    persist(
      (set) => {
        const normalizeCompany = (company) => {
          if (!company) return null;
          return {
            companyId: company.companyId || company.company_id || company.id || null,
            companyName: company.companyName || company.company_name || company.cmpNm || null,
            bizNo: company.bizNo || company.biz_no || company.business_reg_no || company.brno || null,
            role: company.role || company.contextRole || company.context_role || null,
            status: company.status || null,
          };
        };

        const buildCompanyProfile = (normalizedCompany, fallbackProfile) => {
          if (fallbackProfile) return fallbackProfile;
          if (!normalizedCompany) return null;
          return {
            company_id: normalizedCompany.companyId,
            company_name: normalizedCompany.companyName,
            business_reg_no: normalizedCompany.bizNo,
            role: normalizedCompany.role,
          };
        };

        const normalizeProfile = (profile) => {
          const safeProfile = profile || {};

          const uuid = safeProfile.uuid || safeProfile.userUuid || safeProfile.user_uuid || null;

          const currentCompany = normalizeCompany(
            safeProfile.currentCompany || safeProfile.companyProfile || safeProfile.company,
          );
          const fallbackProfile =
            safeProfile.companyProfile ||
            (safeProfile.cmpNm || safeProfile.companySize || safeProfile.brno ? safeProfile : null);
          const linkedCompaniesRaw =
            safeProfile.linkedCompanies || safeProfile.linked_companies || safeProfile.linked || [];
          const linkedCompanies = Array.isArray(linkedCompaniesRaw)
            ? linkedCompaniesRaw.map(normalizeCompany).filter(Boolean)
            : [];
          const currentMode =
            safeProfile.currentMode ||
            safeProfile.current_mode ||
            (currentCompany ? 'CORPORATE' : 'INDIVIDUAL');
          const companyProfile = buildCompanyProfile(currentCompany, fallbackProfile);
          const bizno =
            safeProfile.brno ||
            safeProfile.bizno ||
            currentCompany?.bizNo ||
            companyProfile?.business_reg_no ||
            companyProfile?.biz_no ||
            null;
          const cmpNm =
            safeProfile.cmpNm ||
            safeProfile.companyName ||
            currentCompany?.companyName ||
            companyProfile?.company_name ||
            safeProfile.name ||
            null;
          const companySize =
            safeProfile.companySize || companyProfile?.size || companyProfile?.company_size || null;
          const user =
            safeProfile.user ||
            {
              id: safeProfile.id || null,
              loginId: safeProfile.loginId || safeProfile.login_id || null,
              name: safeProfile.name || safeProfile.username || null,
              email: safeProfile.email || null,
            };
          const contextRole =
            safeProfile.contextRole || safeProfile.context_role || currentCompany?.role || null;
          const intgMbrSwtcYn =
            safeProfile.intgMbrSwtcYn || safeProfile.intg_mbr_swtc_yn || null;
          const additionalInfoMissingFields =
            safeProfile.additionalInfoMissingFields ||
            safeProfile.additional_info_missing_fields ||
            [];

          return {
            uuid,
            currentMode,
            currentCompany,
            linkedCompanies,
            companyProfile,
            bizno,
            cmpNm,
            companySize,
            user,
            contextRole,
            intgMbrSwtcYn,
            additionalInfoRequired: Boolean(
              safeProfile.additionalInfoRequired || safeProfile.additional_info_required,
            ),
            additionalInfoReason:
              safeProfile.additionalInfoReason || safeProfile.additional_info_reason || null,
            additionalInfoMissingFields: Array.isArray(additionalInfoMissingFields)
              ? additionalInfoMissingFields
              : [],
            suggestedLoginId:
              safeProfile.suggestedLoginId || safeProfile.suggested_login_id || null,
          };
        };

        // 채널 메시지 리스너 등록
        authChannel.onmessage = (event) => {
          if (event.data.type === 'LOGOUT') {
            // 다른 탭에서 로그아웃 메시지 수신 시 상태 초기화
            set(
              {
                isLogin: false,
                isSsoLogin: false,
                token: null,
                tokenExpiresAt: null,
                refreshToken: null,
                kcIdToken: null,
                user: null,
                uuid: null,
                currentMode: null,
                currentCompany: null,
                linkedCompanies: [],
                contextRole: null,
                intgMbrSwtcYn: null,
                bizno: null,
                cmpNm: null,
                companySize: null,
                companyProfile: null,
                additionalInfoRequired: false,
                additionalInfoReason: null,
                additionalInfoMissingFields: [],
                suggestedLoginId: null,
              },
              false,
              'auth/sync_logout',
            );
            // 다른 탭 로그아웃 시에도 저장소 정리
            try { sessionStorage.removeItem('auth-storage'); } catch { /* ignore */ }
            try { localStorage.removeItem('ai-search-storage'); } catch { /* ignore */ }
            // 재로그인 시 silent SSO가 다시 동작하도록 attempted 플래그 초기화
            resetSilentSsoFlags();
          }
        };

        return {
          isLogin: false,
          isSsoLogin: false,
          /**
           * access token: 메모리 전용 (sessionStorage에 저장하지 않음).
           * XSS 공격으로 sessionStorage 탈취 시 access token 노출을 방지하기 위해
           * partialize 옵션으로 persist 대상에서 제외된다.
           * 페이지 리로드 후에는 refreshToken으로 재발급받아 메모리에만 저장한다
           * (TokenRefreshInitializer 컴포넌트 담당).
           */
          token: null,
          /**
           * access token의 만료 시각 (JWT exp 클레임, Unix seconds).
           * token과 함께 메모리에만 존재하며 sessionStorage에 저장되지 않는다.
           * Header.jsx 세션 타이머가 이 값을 사용한다.
           */
          tokenExpiresAt: null,
          /**
           * refresh token: sessionStorage에 저장.
           * 페이지 리로드 후 access token 재발급에 사용한다.
           */
          refreshToken: null,
          /**
           * Keycloak id_token.
           * SSO callback(/callback/local-login) 응답의 kcIdToken 필드에서 수신하여 보관한다.
           * 로그아웃 시 POST /api/v1/auth/keycloak/logout 요청 body에 담아 전달하고,
           * 서버가 id_token_hint를 이용해 Keycloak logout URL을 조립한다.
           * 서버는 이 값을 HttpSession에 저장하지 않는다(STATELESS).
           */
          kcIdToken: null,
          user: null,
          uuid: null,
          currentMode: null,
          currentCompany: null,
          linkedCompanies: [],
          contextRole: null,
          intgMbrSwtcYn: null,
          bizno: null,
          cmpNm: null,
          companySize: null,
          companyProfile: null,
          additionalInfoRequired: false,
          additionalInfoReason: null,
          additionalInfoMissingFields: [],
          suggestedLoginId: null,
          login: ({ token, refreshToken, profile } = {}) => {
            const normalized = normalizeProfile(profile);
            set(
              {
                isLogin: true,
                token: token || null,
                tokenExpiresAt: parseTokenExpiry(token),
                refreshToken: refreshToken || null,
                user: normalized.user,
                uuid: normalized.uuid,
                currentMode: normalized.currentMode,
                currentCompany: normalized.currentCompany,
                linkedCompanies: normalized.linkedCompanies,
                contextRole: normalized.contextRole,
                intgMbrSwtcYn: normalized.intgMbrSwtcYn,
                bizno: normalized.bizno,
                cmpNm: normalized.cmpNm,
                companySize: normalized.companySize,
                companyProfile: normalized.companyProfile,
                additionalInfoRequired: normalized.additionalInfoRequired,
                additionalInfoReason: normalized.additionalInfoReason,
                additionalInfoMissingFields: normalized.additionalInfoMissingFields,
                suggestedLoginId: normalized.suggestedLoginId,
              },
              false,
              'auth/login',
            );
          },
          ssoLogin: ({ token, refreshToken, kcIdToken, profile } = {}) => {
            const normalized = normalizeProfile(profile);
            set(
              {
                isLogin: true,
                isSsoLogin: true,
                token: token || null,
                tokenExpiresAt: parseTokenExpiry(token),
                refreshToken: refreshToken || null,
                kcIdToken: kcIdToken || null,
                user: normalized.user,
                uuid: normalized.uuid,
                currentMode: normalized.currentMode,
                currentCompany: normalized.currentCompany,
                linkedCompanies: normalized.linkedCompanies,
                contextRole: normalized.contextRole,
                intgMbrSwtcYn: normalized.intgMbrSwtcYn,
                bizno: normalized.bizno,
                cmpNm: normalized.cmpNm,
                companySize: normalized.companySize,
                companyProfile: normalized.companyProfile,
                additionalInfoRequired: normalized.additionalInfoRequired,
                additionalInfoReason: normalized.additionalInfoReason,
                additionalInfoMissingFields: normalized.additionalInfoMissingFields,
                suggestedLoginId: normalized.suggestedLoginId,
              },
              false,
              'auth/ssoLogin',
            );
          },
          setRefreshToken: (refreshToken) =>
            set({ refreshToken: refreshToken || null }, false, 'auth/setRefreshToken'),
          updateProfile: (profile) => {
            const normalized = normalizeProfile(profile);
            set(
              {
                user: normalized.user,
                uuid: normalized.uuid,
                currentMode: normalized.currentMode,
                currentCompany: normalized.currentCompany,
                linkedCompanies: normalized.linkedCompanies,
                contextRole: normalized.contextRole,
                intgMbrSwtcYn: normalized.intgMbrSwtcYn,
                bizno: normalized.bizno,
                cmpNm: normalized.cmpNm,
                companySize: normalized.companySize,
                companyProfile: normalized.companyProfile,
                additionalInfoRequired: normalized.additionalInfoRequired,
                additionalInfoReason: normalized.additionalInfoReason,
                additionalInfoMissingFields: normalized.additionalInfoMissingFields,
                suggestedLoginId: normalized.suggestedLoginId,
              },
              false,
              'auth/update_profile',
            );
          },
          setToken: (token) => set(
            { token: token || null, tokenExpiresAt: parseTokenExpiry(token) },
            false,
            'auth/set_token',
          ),
          logout: () => {
            set(
              {
                isLogin: false,
                isSsoLogin: false,
                token: null,
                tokenExpiresAt: null,
                refreshToken: null,
                kcIdToken: null,
                user: null,
                uuid: null,
                currentMode: null,
                currentCompany: null,
                linkedCompanies: [],
                contextRole: null,
                intgMbrSwtcYn: null,
                bizno: null,
                cmpNm: null,
                companySize: null,
                companyProfile: null,
                additionalInfoRequired: false,
                additionalInfoReason: null,
                additionalInfoMissingFields: [],
                suggestedLoginId: null,
              },
              false,
              'auth/logout',
            );
            // 다른 탭에 로그아웃 이벤트 전파
            authChannel.postMessage({ type: 'LOGOUT' });

            // sessionStorage 강제 삭제 (persist 미들웨어 키)
            try { sessionStorage.removeItem('auth-storage'); } catch { /* ignore */ }
            // 재로그인 시 silent SSO가 다시 동작하도록 attempted 플래그 초기화
            resetSilentSsoFlags();
            // AI 채팅 관련 sessionStorage 정리
            try {
              Object.keys(sessionStorage).forEach((key) => {
                if (key.startsWith('ai-chat-payload:')) {
                  sessionStorage.removeItem(key);
                }
              });
            } catch { /* ignore */ }
            // 로그인 사용자 검색 결과 localStorage 정리
            try { localStorage.removeItem('ai-search-storage'); } catch { /* ignore */ }
          },
          setBizno: (bizno) => set({ bizno, isLogin: true }, false, 'auth/setBizno'),
          setCompanyProfile: (companyProfile) => set({ companyProfile }, false, 'auth/setCompanyProfile'),
        };
      },
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => sessionStorage),
        /**
         * access token(token, tokenExpiresAt)은 sessionStorage에 저장하지 않는다.
         *
         * 이유: sessionStorage는 JavaScript로 접근 가능하므로 XSS 공격 시 탈취 위험이 있다.
         *       refresh token은 페이지 리로드 후 access token 재발급에 필요하므로 유지한다.
         *       access token은 재발급 후 메모리(Zustand 상태)에만 존재한다.
         *
         * 페이지 리로드 후 복구 흐름:
         *   isLogin=true & token=null & refreshToken=있음
         *   → TokenRefreshInitializer가 /api/v1/account/refresh 호출
         *   → 새 access token을 setToken()으로 메모리에만 저장
         */
        partialize: (state) => ({
          isLogin: state.isLogin,
          isSsoLogin: state.isSsoLogin,
          // token, tokenExpiresAt 은 제외 (메모리 전용)
          refreshToken: state.refreshToken,
          kcIdToken: state.kcIdToken,
          user: state.user,
          uuid: state.uuid,
          currentMode: state.currentMode,
          currentCompany: state.currentCompany,
          linkedCompanies: state.linkedCompanies,
          contextRole: state.contextRole,
          intgMbrSwtcYn: state.intgMbrSwtcYn,
          bizno: state.bizno,
          cmpNm: state.cmpNm,
          companySize: state.companySize,
          companyProfile: state.companyProfile,
          additionalInfoRequired: state.additionalInfoRequired,
          additionalInfoReason: state.additionalInfoReason,
          additionalInfoMissingFields: state.additionalInfoMissingFields,
          suggestedLoginId: state.suggestedLoginId,
        }),
      },
    ),
    {
      name: 'AuthStore',
    },
  ),
);
