// routes/componentMap.js
import { lazy } from 'react';
import SubpageLayout from '../layouts/SubpageLayout.jsx';

/**
 * =============================================================================
 * Component Map - menuId와 실제 컴포넌트 매핑
 * =============================================================================
 *
 * 구조:
 * {
 *   menuId: {
 *     component: React Component,
 *     layout: Layout Component (기본값: SubpageLayout)
 *   }
 * }
 *
 * 주의:
 * - menuId는 백엔드 메뉴 데이터의 menuId와 정확히 일치해야 함
 * - scrnTypeCd가 'T'인 노드만 등록
 */

//즉시 import (페이지 로드 시 바로 필요한 것들)
import AiSmartSearch from '../pages/AiSmartSearch.jsx';
import { SubpageLayoutWithMenu } from '../layouts/layoutIndex.jsx';

// Lazy import (필요할 때 로드)
const Pbanc = lazy(() => import('../pages/Pbanc.jsx'));
const PbancView = lazy(() => import('../pages/PbancView.jsx'));
const UI_USR_L_010 = lazy(() => import('../pages/UI_USR_L_010.jsx'));
const UI_USR_L_030 = lazy(() => import('../pages/UI_USR_L_030.jsx'));
const UI_USR_L_040 = lazy(() => import('../pages/UI_USR_L_040.jsx'));
const UI_USR_R_041 = lazy(() => import('../pages/UI_USR_R_041.jsx'));
const UI_USR_R_011 = lazy(() => import('../pages/UI_USR_R_011.jsx'));
const UI_USR_R_031 = lazy(() => import('../pages/UI_USR_R_031.jsx'));
const UI_USR_R_480 = lazy(() => import('../pages/UI_USR_R_480.jsx'));
const UI_USR_L_510 = lazy(() => import('../pages/UI_USR_L_510.jsx'));
const UI_USR_R_060 = lazy(() => import('../pages/UI_USR_R_060.jsx'));
const UI_USR_L_050 = lazy(() => import('../pages/UI_USR_L_050.jsx'));


// 컴포넌트 매핑
export const componentMap = {
  // ========== 신청·발급 (M_PIIO_00064) ==========

  // AI 스마트 검색
  'M_PIIO_00074': {
    component: AiSmartSearch,
    layout: null,
  },

  // 지원사업
  'M_PIIO_00075': {
    component: UI_USR_L_010,
    layout: SubpageLayoutWithMenu,
  },

  // 사업공고
  'M_PIIO_00076': {
    component: Pbanc,
    layout: SubpageLayoutWithMenu,
    // ✅ 자식 라우트 정의
    children: [
      {
        path: ':id',  // / req/pbanc/pbanc/123
        component: PbancView,
        // layout 상속 (부모와 동일)
      },
    /* example 추가 라우트
      {
        path: ':id/edit',   // /req/pbanc/pbanc/123/edit
        component: lazy(() => import('../pages/PbancEdit.jsx')),
      },
      {
        path: 'create',     // /req/pbanc/pbanc/create
        component: lazy(() => import('../pages/PbancCreate.jsx')),
      },
     */
    ],
  },

  // 정책금융안내
  'M_PIIO_00077': {
    component: UI_USR_L_030,
    layout: SubpageLayoutWithMenu,
  },

  // 증명서 발급
  'M_PIIO_00078': {
    component: UI_USR_L_040, // /req/crtf/UI_USR_L_040
    layout: SubpageLayoutWithMenu,
    children: [
      {
        path: ':prdocCd',  // ✅ 상세 페이지 라우트 추가 /req/crtf/UI_USR_L_040/ABC123
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

  // TODO: 나머지 메뉴는 컴포넌트 생성 후 추가
  // 'M_PIIO_00114': { component: UI_USR_L_520, layout: SubpageLayout }, // 지원사업 신청 현황
  // 'M_PIIO_00115': { component: UI_USR_R_410, layout: SubpageLayout }, // 회원정보변경
  // ... (계속 추가)
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
