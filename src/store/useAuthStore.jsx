import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';

// BroadcastChannel 생성 (싱글톤)
const authChannel = new BroadcastChannel('auth_channel');

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
              },
              false,
              'auth/sync_logout',
            );
            // 필요 시 리다이렉트 로직 추가 가능 (예: window.location.href = '/')
          }
        };

        return {
          isLogin: false,
          isSsoLogin: false,
          token: null,
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
          login: ({ token, refreshToken, profile } = {}) => {
            const normalized = normalizeProfile(profile);
            set(
              {
                isLogin: true,
                token: token || null,
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
              },
              false,
              'auth/update_profile',
            );
          },
          setToken: (token) => set({ token: token || null }, false, 'auth/set_token'),
          logout: () => {
            set(
              {
                isLogin: false,
                isSsoLogin: false,
                token: null,
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
