import { lazy } from 'react';

// 즉시 import (페이지 로드 시 바로 필요한 것들)
import AiSmartSearch from '@pages/ai/AiSmartSearch.jsx';
import { MenuProviderOnly, SubpageLayoutWithMenu } from '@layouts/layoutIndex.jsx';

// Lazy import (필요할 때 로드)
const Pbanc = lazy(() => import('@pages/Pbanc.jsx'));
const PbancView = lazy(() => import('@pages/PbancView.jsx'));
const SprtBiz = lazy(() => import('@pages/SprtBiz.jsx'));
const SprtBizView = lazy(() => import('@pages/SprtBizView.jsx'));
const UI_USR_L_030 = lazy(() => import('@pages/UI_USR_L_030.jsx'));
const UI_USR_L_040 = lazy(() => import('@pages/certificate/UI_USR_L_040.jsx'));
const UI_USR_R_041 = lazy(() => import('@pages/certificate/UI_USR_R_041.jsx'));
const UI_USR_R_031 = lazy(() => import('@pages/UI_USR_R_031.jsx'));
const UI_USR_R_480 = lazy(() => import('@pages/my-business/UI_USR_R_480.jsx'));
const UI_USR_L_510 = lazy(() => import('@pages/my-business/UI_USR_L_510.jsx'));
const UI_USR_R_060 = lazy(() => import('@pages/certificate/UI_USR_R_060.jsx'));
const UI_USR_L_050 = lazy(() => import('@pages/certificate/UI_USR_L_050.jsx'));
const UI_USR_L_070 = lazy(() => import('@pages/policy-info/UI_USR_L_070.jsx'));
const UI_USR_R_091 = lazy(() => import('@pages/policy-info/UI_USR_R_091.jsx'));
const UI_USR_L_190 = lazy(() => import('@pages/policy-info/UI_USR_L_190.jsx'));
const UI_USR_R_191 = lazy(() => import('@pages/policy-info/UI_USR_R_191.jsx'));
const UI_USR_W_130 = lazy(() => import('@pages/policy-info/UI_USR_W_130.jsx'));
const UI_USR_R_131 = lazy(() => import('@pages/policy-info/UI_USR_R_131.jsx'));
const UI_USR_L_140 = lazy(() => import('@pages/more-service/UI_USR_L_140.jsx'));
const UI_USR_L_170 = lazy(() => import('@pages/policy-info/UI_USR_L_170.jsx'));
const UI_USR_L_210 = lazy(() => import('@pages/data-open/UI-USR-L-210.jsx'));
const UI_USR_L_220 = lazy(() => import('@pages/data-open/UI-USR-L-220.jsx'));
const UI_USR_L_230 = lazy(() => import('@pages/data-open/UI-USR-L-230.jsx'));
const UI_USR_R_211 = lazy(() => import('@pages/data-open/UI-USR-R-211.jsx'));
const UI_USR_R_212 = lazy(() => import('@pages/data-open/UI-USR-R-212.jsx'));
const UI_USR_R_213 = lazy(() => import('@pages/data-open/UI-USR-R-213.jsx'));
const UI_USR_R_214 = lazy(() => import('@pages/data-open/UI-USR-R-214.jsx'));
const UI_USR_R_215 = lazy(() => import('@pages/data-open/UI-USR-R-215.jsx'));
const UI_USR_R_232 = lazy(() => import('@pages/data-open/UI-USR-R-232.jsx'));
const UI_USR_W_231 = lazy(() => import('@pages/data-open/UI-USR-W-231.jsx'));
const UI_USR_L_310 = lazy(() => import('@pages/customer-support/UI-USR-L-310.jsx'));
const UI_USR_L_320 = lazy(() => import('@pages/customer-support/UI-USR-L-320.jsx'));
const UI_USR_L_330 = lazy(() => import('@pages/customer-support/UI-USR-L-330.jsx'));
const UI_USR_R_340 = lazy(() => import('@pages/customer-support/UI-USR-R-340.jsx'));
const UI_USR_R_341 = lazy(() => import('@pages/customer-support/UI-USR-R-341.jsx'));
const UI_USR_R_311 = lazy(() => import('@pages/customer-support/UI-USR-R-311.jsx'));
const UI_USR_R_331 = lazy(() => import('@pages/customer-support/UI-USR-R-331.jsx'));
const UI_USR_W_332 = lazy(() => import('@pages/customer-support/UI-USR-W-332.jsx'));
const UI_USR_R_451 = lazy(() => import('@pages/UI-USR-R-451.jsx'));
const UI_USR_R_420 = lazy(() => import('@pages/my-business/UI-USR-R-420.jsx'));
const UI_USR_W_430 = lazy(() => import('@pages/my-business/UI-USR-W-430.jsx'));
const UI_USR_R_440 = lazy(() => import('@pages/my-business/UI-USR-R-440.jsx'));
const UI_USR_R_450 = lazy(() => import('@pages/my-business/UI-USR-R-450.jsx'));
const UI_USR_L_460 = lazy(() => import('@pages/my-business/UI-USR-L-460.jsx'));
const UI_USR_L_020 = lazy(() => import('@pages/UI-USR-L-020.jsx'));
const UI_USR_L_520 = lazy(() => import('@pages/my-business/UI-USR-L-520.jsx'));
const UI_USR_L_530 = lazy(() => import('@pages/my-business/UI-USR-L-530.jsx'));
const UI_USR_L_540 = lazy(() => import('@pages/my-business/UI-USR-L-540.jsx'));
const UI_USR_L_550 = lazy(() => import('@pages/my-business/UI-USR-L-550.jsx'));
const UI_USR_L_100 = lazy(() => import('@pages/policy-info/UI_USR_L_100.jsx'));
const UI_USR_L_110 = lazy(() => import('@pages/policy-info/UI_USR_L_110.jsx'));
const UI_USR_L_150 = lazy(() => import('@pages/more-service/UI-USR-L-150.jsx'));
const UI_USR_L_180 = lazy(() => import('@pages/more-service/UI-USR-L-180.jsx'));
const UI_Usr_L_120 = lazy(() => import('@pages/more-service/UI-USR-L-120.jsx'));
const UI_USR_R_190 = lazy(() => import('@pages/more-service/UI-USR-R-190.jsx'));
/**
 * =============================================================================
 * Component Map - menuId와 실제 컴포넌트 매핑
 * =============================================================================
 *
 * @description
 * 메뉴 ID(menuId)를 기반으로 동적 라우팅을 위한 컴포넌트 매핑 테이블
 * - 각 메뉴에 대응하는 컴포넌트와 레이아웃을 정의
 * - 중첩 라우팅(children) 지원
 *
 * @structure
 * {
 *   'MENU_ID': {
 *     component: ReactComponent,        // 렌더링할 컴포넌트
 *     layout: LayoutComponent,          // 적용할 레이아웃 (옵션)
 *     children: [                       // 자식 라우트 (옵션)
 *       {
 *         path: 'relative-path',        // 상대 경로 (:id, :slug 등 동적 파라미터 가능)
 *         component: ChildComponent,    // 자식 컴포넌트
 *         layout: ChildLayout,          // 자식 레이아웃 (현재는 부모 상속, TODO : 구현예정)
 *       }
 *     ]
 *   }
 * }
 *
 * @example
 * // 기본 사용 (단일 페이지)
 * 'M_PIIO_00096': {
 *   component: ApiGuide,
 *   layout: SubpageLayoutWithMenu,
 * }
 *
 * @example
 * // 중첩 라우팅 (목록 + 상세)
 * 'M_PIIO_00075': {
 *   component: SprtBizList,              // /req/suprt/suprt
 *   layout: SubpageLayoutWithMenu,
 *   children: [
 *     {
 *       path: ':id',                      // /req/suprt/suprt/123
 *       component: SprtBizDetail,
 *     }
 *   ]
 * }
 *
 * @example
 * // 복잡한 중첩 라우팅
 * 'M_PIIO_00076': {
 *   component: PbancList,
 *   layout: SubpageLayoutWithMenu,
 *   children: [
 *     { path: ':id', component: PbancView },           // 상세
 *     { path: ':id/edit', component: PbancEdit },      // 수정
 *     { path: 'create', component: PbancCreate },      // 생성
 *   ]
 * }
 */

// 컴포넌트 매핑
export const componentMap = {

  // ========== 신청·발급 (M_PIIO_00064) ==========

  // AI 스마트 검색
  'M_PIIO_00074': {
    component: AiSmartSearch,
    layout: MenuProviderOnly,
  },

  // 지원사업
  'M_PIIO_00075': {
    component: SprtBiz,
    layout: SubpageLayoutWithMenu,
    // 자식 라우트 정의
    children: [
      {
        path: ':id',  // / req/suprt/suprt/123
        component: SprtBizView,
        // layout 상속 (부모와 동일)
      },
    ],
  },

  // 사업공고
  'M_PIIO_00076': {
    component: Pbanc,
    layout: SubpageLayoutWithMenu,
    // 자식 라우트 정의
    children: [
      {
        path: ':id',  // /req/pbanc/pbanc/123
        component: PbancView,
        // layout 상속 (부모와 동일)
      },
    /* example 추가 라우트
      {
        path: ':id/edit',   // /req/pbanc/pbanc/123/edit
        component: lazy(() => import('@pages/PbancEdit.jsx')),
      },
      {
        path: 'create',     // /req/pbanc/pbanc/create
        component: lazy(() => import('@pages/PbancCreate.jsx')),
      },
     */
    ],
  },

  // 정책금융안내
  'M_PIIO_00077': {
    component: UI_USR_L_030,
    layout: SubpageLayoutWithMenu,
    children: [
      {
        path: ':plcyFnncNo',
        component: UI_USR_R_031,
      },
    ],
  },

  // 증명서 발급
  'M_PIIO_00078': {
    component: UI_USR_L_040, // /req/crtf/UI_USR_L_040
    layout: SubpageLayoutWithMenu,
    children: [
      {
        path: ':prdocCd',  // 상세 페이지 라우트 추가 /req/crtf/UI_USR_L_040/ABC123
        component: UI_USR_R_041,
      },
    ],
  },

  // 발급 진위 확인
  'M_PIIO_00079': {
    component: UI_USR_L_050,
    layout: SubpageLayoutWithMenu,
  },

  // 기타증명서
  'M_PIIO_00080': {
    component: UI_USR_R_060,
    layout: SubpageLayoutWithMenu,
  },

  // ========== 정책정보 (M_PIIO_00065) ==========

  // 정책뉴스
  'M_PIIO_00084': {
    component: UI_USR_L_070, // /plcy/reprt/UI_USR_L_070
    layout: SubpageLayoutWithMenu,
    children: [
      {
        path: ':id',  // /plcy/reprt/UI_USR_L_070/123
        component: UI_USR_R_091,
      },
    ],
  },

  // 행사정보
  'M_PIIO_00085': {
    component: UI_USR_L_190,
    layout: SubpageLayoutWithMenu,
    children: [
      {
        path: ':id',
        component: UI_USR_R_191,
      },
    ],
  },

  // 월간중기누리
  'M_PIIO_00086': {
    component: UI_USR_L_100,
    layout: SubpageLayoutWithMenu,
  },

  // 입법행정예고/고시
  'M_PIIO_00087': {
    component: UI_USR_L_110,
    layout: SubpageLayoutWithMenu,
  },

  // 품목별 법정의무 인증제도
  'M_PIIO_00088': {
    component: UI_Usr_L_120,
    layout: SubpageLayoutWithMenu,
  },

  // 중소벤처기업부 법정민원신청
  'M_PIIO_00089': {
    component: UI_USR_W_130,
    layout: SubpageLayoutWithMenu,
    children: [
      {
        path: ':id',
        component: UI_USR_R_131,
      },
    ],
  },

  // 소재부품장비·뿌리기술·전문연구사업자 조회
  'M_PIIO_00090': {
    component: UI_USR_L_140,
    layout: SubpageLayoutWithMenu,
  },

  // 주택특별공급 사업공고
  'M_PIIO_00091': {
    component: UI_USR_L_150, //퍼블없음 게시판관리로 해야돼서 없는듯
    layout: SubpageLayoutWithMenu,
  },

  // 기업업무용 서식
  'M_PIIO_00093': {
    component: UI_USR_L_170, //퍼블없음 게시판관리로 해야돼서 없는듯
    layout: SubpageLayoutWithMenu,
  },

  // 입주기업 모집공고
  'M_PIIO_00094': {
    component: UI_USR_L_180, //퍼블없음 게시판관리로 해야돼서 없는듯
    layout: SubpageLayoutWithMenu,
  },

  // 통합로그인 시스템
  'M_PIIO_00128': {
    component: UI_USR_R_190,
    layout: SubpageLayoutWithMenu,
  },

  // ========== 데이터 개방 (M_PIIO_00066) ==========

  // API 안내
  'M_PIIO_00096': {
    component: UI_USR_L_210,
    layout: SubpageLayoutWithMenu,
    children: [
      { path: 'a', component: UI_USR_R_211 }, // API_지원사업정보 상세
      { path: 'b', component: UI_USR_R_212 }, // API_행사정보 API 상세
      { path: 'c', component: UI_USR_R_213 }, // API_이노비즈확인서 상세
      { path: 'd', component: UI_USR_R_214 }, // API_벤처기업확인서 상세
      { path: 'e', component: UI_USR_R_215 }, // API_메인비즈확인서 상세
    ],
  },

  // 인증키 신청,
  'M_PIIO_00097': {
    component: UI_USR_L_220,
    layout: SubpageLayoutWithMenu,
  },

  // API Q&A
  'M_PIIO_00098': {
    component: UI_USR_L_230,
    layout: SubpageLayoutWithMenu,
    children: [
      { path: 'create', component: UI_USR_W_231 }, // API Q&A 등록
      { path: ':id', component: UI_USR_R_232 }, // API Q&A 상세
    ],
  },

  // ========== 고객지원 (M_PIIO_00067) ==========

  // 공지사항
  'M_PIIO_00101': {
    component: UI_USR_L_310,
    layout: SubpageLayoutWithMenu,
    children: [
      { path: ':id', component: UI_USR_R_311 }, // 공지사항 상세
    ],
  },

  // 자주 묻는 질문
  'M_PIIO_00102': {
    component: UI_USR_L_320,
    layout: SubpageLayoutWithMenu,
  },

  // Q&A
  'M_PIIO_00103': {
    component: UI_USR_L_330,
    layout: SubpageLayoutWithMenu,
    children: [
      { path: ':id', component: UI_USR_R_331 }, // Q&A 상세
      { path: 'save', component: UI_USR_W_332 }, // Q&A 등록/수정
    ],
  },

  // 콜센터안내
  'M_PIIO_00104': {
    component: UI_USR_R_340,
    layout: SubpageLayoutWithMenu,
  },

  // 고객 만족도 조사
  'M_PIIO_00105': {
    component: UI_USR_R_341,
    layout: SubpageLayoutWithMenu,
  },

  // 플랫폼 소개
  // 'M_PIIO_00106': {
  //   component: null,
  //   layout: SubpageLayoutWithMenu,
  // },

  // 이용가이드
  // 'M_PIIO_00107': {
  //   component: null,
  //   layout: SubpageLayoutWithMenu,
  // },

  // ========== 마이비즈니스 (M_PIIO_00068) ==========

  // AI맞춤추천공고
  'M_PIIO_00112': {
    component: UI_USR_R_480,
    layout: SubpageLayoutWithMenu,
  },

  // 증명서 발급 조회
  'M_PIIO_00113': {
    component: UI_USR_L_510,
    layout: SubpageLayoutWithMenu,
  },

  // 지원사업 신청 현황
  'M_PIIO_00114': {
    component: UI_USR_L_520,
    layout: SubpageLayoutWithMenu,
  },

  // 회원정보변경
  'M_PIIO_00115': {
    component: UI_USR_R_451, //from UI_USR_R_410
    layout: SubpageLayoutWithMenu,
  },

  // 비밀번호 수정
  'M_PIIO_00116': {
    component: UI_USR_R_420,
    layout: SubpageLayoutWithMenu,
  },

  // 인증수단 재설정
  'M_PIIO_00117': {
    component: UI_USR_W_430,
    layout: SubpageLayoutWithMenu,
  },

  // 회원탈퇴
  'M_PIIO_00118': {
    component: UI_USR_R_440,
    layout: SubpageLayoutWithMenu,
  },

  // 기업 기본정보
  'M_PIIO_00119': {
    component: UI_USR_R_450,
    layout: SubpageLayoutWithMenu,
  },

  // 경영현황 분석
  // 'M_PIIO_00120': {
  //   component: UI_USR_R_490,
  //   layout: SubpageLayoutWithMenu,
  // },

  // 담당자 관리
  'M_PIIO_00121': {
    component: UI_USR_L_460,
    layout: SubpageLayoutWithMenu,
  },

  // 문의 관리
  'M_PIIO_00122': {
    component: UI_USR_L_020, // from UI_USR_L_470,
    layout: SubpageLayoutWithMenu,
  },

  // 관심 공고
  'M_PIIO_00123': {
    component: UI_USR_L_530,
    layout: SubpageLayoutWithMenu,
  },

  // 나의 알림
  'M_PIIO_00124': {
    component: UI_USR_L_540,
    layout: SubpageLayoutWithMenu,
  },

  // 나의 Open API 신청내역
  'M_PIIO_00125': {
    component: UI_USR_L_550,
    layout: SubpageLayoutWithMenu,
  },

};

/**
 * 컴포넌트 존재 여부 확인
 */
export const hasComponent = (menuId) => {
  return !!componentMap[menuId];
};

/**
 * 컴포넌트 가져오기
 */
export const getComponent = (menuId) => {
  return componentMap[menuId] || null;
};
