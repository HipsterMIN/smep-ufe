import { lazy } from 'react';

// 즉시 import (페이지 로드 시 바로 필요한 것들)
import AiSmartSearch from '@pages/AiSmartSearch.jsx';
import { MenuProviderOnly, SubpageLayoutWithMenu } from '@layouts/layoutIndex.jsx';

// Lazy import (필요할 때 로드)
const Pbanc = lazy(() => import('@pages/Pbanc.jsx'));
const PbancView = lazy(() => import('@pages/PbancView.jsx'));
const SprtBiz = lazy(() => import('@pages/SprtBiz.jsx'));
const SprtBizView = lazy(() => import('@pages/SprtBizView.jsx'));
const UI_USR_L_030 = lazy(() => import('@pages/UI_USR_L_030.jsx'));
const UI_USR_L_040 = lazy(() => import('@pages/UI_USR_L_040.jsx'));
const UI_USR_R_041 = lazy(() => import('@pages/UI_USR_R_041.jsx'));
const UI_USR_R_031 = lazy(() => import('@pages/UI_USR_R_031.jsx'));
const UI_USR_R_480 = lazy(() => import('@pages/UI_USR_R_480.jsx'));
const UI_USR_L_510 = lazy(() => import('@pages/UI_USR_L_510.jsx'));
const UI_USR_R_060 = lazy(() => import('@pages/UI_USR_R_060.jsx'));
const UI_USR_L_050 = lazy(() => import('@pages/UI_USR_L_050.jsx'));
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
