import { lazy } from 'react';

// layout 값은 문자열 키로 정의 — 실제 컴포넌트는 dynamicRoutes.jsx에서 resolve
// (UserMenuContext → componentMap → @layouts → UserMenuContext 순환 의존성 방지)

const Pbanc = lazy(() => import('@pages/Pbanc.jsx'));
const PbancView = lazy(() => import('@pages/PbancView.jsx'));
const SprtBiz = lazy(() => import('@pages/SprtBiz.jsx'));
const SprtBizView = lazy(() => import('@pages/SprtBizView.jsx'));
const UI_USR_L_030 = lazy(() => import('@pages/UI_USR_L_030.jsx'));
const UI_USR_L_040 = lazy(() => import('@pages/certificate/UI_USR_L_040.jsx'));
const UI_USR_R_041 = lazy(() => import('@pages/certificate/UI_USR_R_041.jsx'));
const UI_USR_P_042 = lazy(() => import('@pages/certificate/UI_USR_P_042.jsx'));
const DpcIssue = lazy(() => import('@pages/certificate/issue-extra/DpcIssue.jsx'));
const BizIssue = lazy(() => import('@pages/certificate/issue-extra/BizIssue.jsx'));
const CbzIssue = lazy(() => import('@pages/certificate/issue-extra/CbzIssue.jsx'));
const PfcIssue = lazy(() => import('@pages/certificate/issue-extra/PfcIssue.jsx'));
const SmtcIssue = lazy(() => import('@pages/certificate/issue-extra/SmtcIssue.jsx'));
const SmftIssue = lazy(() => import('@pages/certificate/issue-extra/SmftIssue.jsx'));
const UI_USR_R_031 = lazy(() => import('@pages/UI_USR_R_031.jsx'));
const MyBussiness = lazy(() => import('@pages/my-business/dashboard/MyBusinessDashBoard.jsx'));
const UI_USR_L_510 = lazy(() => import('@pages/my-business/UI_USR_L_510.jsx'));
const UI_USR_R_060 = lazy(() => import('@pages/certificate/UI_USR_R_060.jsx'));
const UI_USR_L_050 = lazy(() => import('@pages/certificate/UI_USR_L_050.jsx'));
const UI_USR_R_091 = lazy(() => import('@pages/policy-info/UI_USR_R_091.jsx'));
const UI_USR_L_190 = lazy(() => import('@pages/policy-info/UI_USR_L_190.jsx'));
const UI_USR_R_191 = lazy(() => import('@pages/policy-info/UI_USR_R_191.jsx'));
const UI_USR_W_130 = lazy(() => import('@pages/policy-info/UI_USR_W_130.jsx'));
const UI_USR_R_131 = lazy(() => import('@pages/policy-info/UI_USR_R_131.jsx'));
const UI_USR_L_140 = lazy(() => import('@pages/more-service/UI_USR_L_140.jsx'));

const EntrSpt = lazy(() => import('@pages/more-service/EntrSpt.jsx'));
const EntrSptDetail = lazy(() => import('@pages/more-service/EntrSptDetail.jsx'));
const RelatedSystems = lazy(() => import('@pages/more-service/RelatedSystems.jsx'));
const UI_USR_L_170 = lazy(() => import('@pages/more-service/UI_USR_L_170.jsx'));
const ApiInfo = lazy(() => import('@pages/data-open/ApiInfo.jsx'));
const UI_USR_L_220 = lazy(() => import('@pages/data-open/UI-USR-L-220.jsx'));
const UI_USR_L_230 = lazy(() => import('@pages/board/BoardResolver.jsx'));
const SupportBusinessInfoApi = lazy(() => import('@pages/data-open/SupportBusinessInfoApi.jsx'));
const EventInfoApi = lazy(() => import('@pages/data-open/EventInfoApi.jsx'));
const InnoBizCertificateApi = lazy(() => import('@pages/data-open/InnoBizCertificateApi.jsx'));
const VentureCertificateApi = lazy(() => import('@pages/data-open/VentureCertificateApi.jsx'));
const MainBizCertificateApi = lazy(() => import('@pages/data-open/MainBizCertificateApi.jsx'));
const UI_USR_R_232 = lazy(() => import('@pages/data-open/UI-USR-R-232.jsx'));
const UI_USR_W_231 = lazy(() => import('@pages/data-open/UI-USR-W-231.jsx'));
const BoardResolver = lazy(() => import('@pages/board/BoardResolver.jsx'));
const BoardPostResolver = lazy(() => import('@pages/board/BoardPostResolver.jsx'));
const BoardWriteResolver = lazy(() => import('@pages/board/BoardWriteResolver.jsx'));
const UI_USR_L_070 = lazy(() => import('@pages/policy-info/UI_USR_L_070.jsx')); // image/video 일때 포멧
const UI_USR_R_340 = lazy(() => import('@pages/customer-support/UI-USR-R-340.jsx'));
const UI_USR_R_341 = lazy(() => import('@pages/customer-support/UI-USR-R-341.jsx'));
const PlatformIntro = lazy(() => import('@pages/customer-support/PlatformIntro.jsx'));
const VerifyPassword = lazy(() => import('@pages/my-business/VerifyPassword.jsx'));
const MemberInfoChangeGate = lazy(() => import('@pages/my-business/MemberInfoChangeGate.jsx'));
const UI_USR_W_411 = lazy( () => import('@pages/my-business/UI-USR-W-411.jsx'));

const UI_USR_R_420 = lazy(() => import('@pages/my-business/PasswordChange.jsx'));
const UI_USR_W_430 = lazy(() => import('@pages/my-business/UI-USR-W-430.jsx'));
const UI_USR_R_440 = lazy(() => import('@pages/my-business/UI-USR-R-440.jsx'));
const UI_USR_R_450 = lazy(() => import('@pages/my-business/member/CompanyDetail.jsx'));
const UI_USR_W_452 = lazy(() => import('@pages/my-business/member/CompanyEdit.jsx'));
const UI_USR_R_490 = lazy(() => import('@pages/my-business/UI-USR-R-490.jsx'));
const UI_USR_L_460 = lazy(() => import('@pages/my-business/member/ReassignOwner.jsx'));
const UI_USR_L_020 = lazy(() => import('@pages/UI-USR-L-020.jsx'));
const UI_USR_L_520 = lazy(() => import('@pages/my-business/UI-USR-L-520.jsx'));
const ScrapList = lazy(() => import('@pages/my-business/ScrapList.jsx'));
const UI_USR_L_540 = lazy(() => import('@pages/my-business/UI-USR-L-540.jsx'));
const MyApiRequestList = lazy(() => import('@pages/my-business/MyApiRequestList.jsx'));
const UI_USR_L_100 = lazy(() => import('@pages/policy-info/UI_USR_L_100.jsx'));
const UI_USR_R_101 = lazy(() => import('@pages/policy-info/UI_USR_R_101.jsx'));
const UI_USR_L_130 = lazy(() => import('@pages/policy-info/UI_USR_L_130.jsx'));
const UI_USR_L_110 = lazy(() => import('@pages/policy-info/UI_USR_L_110.jsx'));
const UI_USR_R_111 = lazy(() => import('@pages/policy-info/UI_USR_R_111.jsx'));
const UI_USR_L_150 = lazy(() => import('@pages/more-service/UI-USR-L-150.jsx'));
const UI_USR_L_180 = lazy(() => import('@pages/more-service/UI_USR_L_180.jsx'));
const UI_USR_R_181 = lazy(() => import('@pages/more-service/UI_USR_R_181.jsx'));
const UI_USR_L_120 = lazy(() => import('@pages/more-service/UI-USR-L-120.jsx'));
const UI_USR_R_121 = lazy(() => import('@pages/more-service/UI-USR-R-121.jsx'));
const UI_USR_R_190 = lazy(() => import('@pages/more-service/UI-USR-R-190.jsx'));
const UI_USR_R_360 = lazy(() => import('@pages/customer-support/UI-USR-R-360.jsx'));
const EventParticipationList = lazy(() => import('@pages/customer-support/EventParticipationList.jsx'));
const EventParticipationDetail = lazy(() => import('@pages/customer-support/EventParticipationDetail.jsx'));
const EventParticipationWrite = lazy(() => import('@pages/customer-support/EventParticipationWrite.jsx'));

const TotalSearch = lazy(() => import('@pages/total-search/TotalSearch.jsx'));

const EmailRejection = lazy(() => import('@pages/footer/EmailRejection.jsx'));
const CopyrightPolicy = lazy(() => import('@pages/footer/CopyrightPolicy.jsx'));
const WebAccessibilityPolicy = lazy(() => import('@pages/footer/WebAccessibilityPolicy.jsx'));
const TermsOfUse = lazy(() => import('@pages/footer/TermsOfUse.jsx'));
/**
 * =============================================================================
 * Component Map - component key와 실제 컴포넌트 매핑
 * =============================================================================
 *
 * @description
 * 화면 연결 코드(scrnLnkgCd)를 우선 기준으로 동적 라우팅을 위한 컴포넌트를 선택한다.
 * 현재 key는 운영 반영 안정성을 위해 기존 menuId 값을 유지하며,
 * scrnLnkgCd가 비어 있거나 mock/API 캐시에 없는 경우에도 menuId fallback으로 동작한다.
 * - 각 메뉴에 대응하는 컴포넌트와 레이아웃을 정의
 * - 중첩 라우팅(children) 지원
 * - component key는 컴포넌트 선택 전용이므로 메뉴 식별, 권한, breadcrumb, 게시판 조회에는 사용하지 않는다.
 *
 * @structure
 * {
 *   'COMPONENT_KEY': {
 *     component: ReactComponent,        // 렌더링할 컴포넌트
 *     layout: LayoutComponent,          // 적용할 레이아웃 (옵션)
 *     componentProps: {},               // 컴포넌트에 전달할 props (옵션)
 *     wrapChildren: false,              // true면 component가 자식 라우트 Outlet을 감싸는 래퍼로 동작
 *     children: [                       // 자식 라우트 (옵션)
 *       {
 *         path: 'relative-path',        // 상대 경로 (:id, :slug 등 동적 파라미터 가능)
 *         component: ChildComponent,    // 자식 컴포넌트
 *         componentProps: {},           // 자식 컴포넌트에 전달할 props (옵션)
 *         layout: ChildLayout,          // 자식 레이아웃 (현재는 부모 상속)
 *       }
 *     ]
 *   }
 * }
 *
 * @example
 * // 기본 사용 (단일 페이지)
 * 'M_PIIO_00096': {
 *   component: ApiGuide,
 *   layout: 'SubpageLayoutWithMenu',
 * }
 *
 * @example
 * // 중첩 라우팅 (목록 + 상세)
 * 'M_PIIO_00075': {
 *   component: SprtBizList,              // /req/suprt/suprt
 *   layout: 'SubpageLayoutWithMenu',
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
 *   layout: 'SubpageLayoutWithMenu',
 *   children: [
 *     { path: ':id', component: PbancView },           // 상세
 *     { path: ':id/edit', component: PbancEdit },      // 수정
 *     { path: 'create', component: PbancCreate },      // 생성
 *   ]
 * }
 *
 * @example
 * // 라우트 래퍼 (비밀번호 확인, 권한 확인 등)
 * 'M_PIIO_00115': {
 *   component: VerifyPassword,
 *   layout: 'SubpageLayoutWithMenu',
 *   wrapChildren: true,
 *   componentProps: {
 *     successPath: 'modify',
 *   },
 *   children: [
 *     { path: 'modify', component: MemberModify },
 *   ],
 * }
 */

// 컴포넌트 매핑
export const componentMap = {

  // ========== 신청·발급 (M_PIIO_00064) ==========

  // 통합검색
  'M_PIIO_00152': {
    component: TotalSearch,
    layout: 'MenuProviderOnly',
  },

  // 지원사업
  'M_PIIO_00075': {
    component: SprtBiz,
    layout: 'SubpageLayoutWithMenu',
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
    layout: 'SubpageLayoutWithMenu',
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

  // 사업공고(지방정부)
  'M_PIIO_00169': {
    component: Pbanc,
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: ':id',
        component: PbancView,
      },
    ],
  },

  // 정책금융안내
  'M_PIIO_00077': {
    component: UI_USR_L_030,
    layout: 'SubpageLayoutWithMenu',
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
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: ':prdocCd',  // 상세 페이지 라우트 추가 /req/crtf/UI_USR_L_040/ABC123
        component: UI_USR_R_041,
      },
      {
        path: ':prdocCd/apply',
        component: UI_USR_P_042,
      },
      {
        path: 'Y101/dpc-issue',
        component: DpcIssue,
      },
      {
        path: 'Y104/biz-issue',
        component: BizIssue,
      },
      {
        path: 'Y109/cbz-issue',
        component: CbzIssue,
      },
      {
        path: 'Y113/pfc-issue',
        component: PfcIssue,
      },
      {
        path: ':prdocCd/smtc-issue',
        component: SmtcIssue,
      },
      {
        path: ':prdocCd/smft-issue',
        component: SmftIssue,
      },
    ],
  },

  // 발급 진위 확인
  'M_PIIO_00079': {
    component: UI_USR_L_050,
    layout: 'SubpageLayoutWithMenu',
  },

  // 기타증명서
  'M_PIIO_00080': {
    component: UI_USR_R_060,
    layout: 'SubpageLayoutWithMenu',
  },

  // ========== 정책정보 (M_PIIO_00065) ==========

  // 정책뉴스
  'M_PIIO_00084': {
    component: BoardResolver, // /plcy/reprt/UI_USR_L_070
    layout: 'SubpageLayoutWithMenu',
    children: [
      { path: ':id', component: BoardPostResolver }, // 공지사항 상세 (게시물 상세 공통 사용)
    ],
    /*children: [
      {
        path: ':id',  // /plcy/reprt/UI_USR_L_070/123
        component: UI_USR_R_091,
      },
    ],*/
  },

  // 행사정보
  'M_PIIO_00085': {
    component: UI_USR_L_190,
    layout: 'SubpageLayoutWithMenu',
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
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: ':id',
        component: UI_USR_R_101,
      },
    ],
  },

  // 중기부 소관 법령
  'M_PIIO_00165': {
    component: UI_USR_L_130,
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: ':id',
        component: UI_USR_L_130,
      },
    ],
  },
    
  // 입법행정예고/고시
  'M_PIIO_00087': {
    component: UI_USR_L_110,
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: ':id',
        component: UI_USR_R_111,
      },
    ],
  },

  // 중소벤처기업부 법정민원신청
  'M_PIIO_00089': {
    component: UI_USR_W_130,
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: ':id',
        component: UI_USR_R_131,
      },
    ],
  },

  // 기업업무용 서식
  'M_PIIO_00093': {
    component: UI_USR_L_170, //퍼블없음 게시판관리로 해야돼서 없는듯
    layout: 'SubpageLayoutWithMenu',
  },

  // 주택특별공급 사업공고
  'M_PIIO_00091': {
    component: Pbanc,
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: ':id',
        component: PbancView,
      },
    ],
  },

  // 입주기업 모집공고
  'M_PIIO_00094': {
    component: UI_USR_L_180,
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: ':id',
        component: UI_USR_R_181,
      },
    ],
  },

  // 품목별 법정의무 인증제도
  'M_PIIO_00088': {
    component: UI_USR_L_120,
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: ':certSystmSn',
        component: UI_USR_R_121,
      },
    ],
  },

  // 소재부품장비·뿌리기술·전문연구사업자 조회
  'M_PIIO_00090': {
    component: UI_USR_L_140,
    layout: 'SubpageLayoutWithMenu',
  },

  // 기업가정신
  'M_PIIO_00149': {
    component: EntrSpt,
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: ':id',
        component: EntrSptDetail,
      },
    ],
  },

  // 유관시스템 둘러보기
  'M_PIIO_00092': {
    component: RelatedSystems,
    layout: 'SubpageLayoutWithMenu',
  },

  'M_PIIO_00172': {
    component: RelatedSystems,
    layout: 'SubpageLayoutWithMenu',
  },

  // 통합로그인 시스템
  'M_PIIO_00128': {
    component: UI_USR_R_190,
    layout: 'SubpageLayoutWithMenu',
  },

  // ========== 데이터 개방 (M_PIIO_00066) ==========

  // API 안내
  'M_PIIO_00096': {
    component: ApiInfo,
    layout: 'SubpageLayoutWithMenu',
    children: [
      { path: 'supportBusinessInfoApi', component: SupportBusinessInfoApi }, // API_지원사업정보 상세
      { path: 'eventInfoApi', component: EventInfoApi }, // API_행사정보 API 상세
      { path: 'innoBizCertificateApi', component: InnoBizCertificateApi }, // API_이노비즈확인서 상세
      { path: 'ventureCertificateApi', component: VentureCertificateApi }, // API_벤처기업확인서 상세
      { path: 'mainBizCertificateApi', component: MainBizCertificateApi }, // API_메인비즈확인서 상세
    ],
  },

  // 인증키 신청,
  'M_PIIO_00097': {
    component: UI_USR_L_220,
    layout: 'SubpageLayoutWithMenu',
  },

  // API Q&A
  'M_PIIO_00098': {
    component: BoardResolver,
    layout: 'SubpageLayoutWithMenu',
    children: [
      { path: 'save', component: BoardWriteResolver }, // API Q&A 등록
      { path: ':id/edit', component: BoardWriteResolver }, // API Q&A 수정
      { path: ':id', component: BoardPostResolver }, // API Q&A 상세
    ],
  },

  // ========== 고객지원 (M_PIIO_00067) ==========

  // 공지사항
  'M_PIIO_00101': {
    component: BoardResolver, // (게시판 상세 공통 사용)
    layout: 'SubpageLayoutWithMenu',
    children: [
      { path: ':id', component: BoardPostResolver }, // 공지사항 상세 (게시물 상세 공통 사용)
    ],
    /*children: [
      { path: ':id', component: UI_USR_R_311 }, // 공지사항 상세
    ],*/
  },

  // 자주 묻는 질문 (FAQ)
  'M_PIIO_00102': {
    component: BoardResolver,
    layout: 'SubpageLayoutWithMenu',
  },

  // Q&A
  'M_PIIO_00103': {
    component: BoardResolver,
    layout: 'SubpageLayoutWithMenu',
    children: [
      { path: ':id', component: BoardPostResolver }, // Q&A 상세 (게시물 상세 공통 사용)
      { path: ':id/edit', component: BoardWriteResolver }, // Q&A 수정
      { path: 'save', component: BoardWriteResolver }, // Q&A 등록
    ],
  },

  // 콜센터안내
  'M_PIIO_00104': {
    component: UI_USR_R_340,
    layout: 'SubpageLayoutWithMenu',
  },

  // 고객 만족도 조사
  'M_PIIO_00105': {
    component: UI_USR_R_341,
    layout: 'SubpageLayoutWithMenu',
  },

  // 중소벤처24 소개
  'M_PIIO_00106': {
    component: PlatformIntro,
    layout: 'SubpageLayoutWithMenu',
  },

  // 이용가이드
  'M_PIIO_00107': {
    component: UI_USR_R_360,
    layout: 'SubpageLayoutWithMenu',
  },

  // 이벤트 참여
  'M_PIIO_00171': {
    component: EventParticipationList,
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: 'save',
        component: EventParticipationWrite,
      },
      {
        path: ':id/edit',
        component: EventParticipationWrite,
        componentProps: { mode: 'edit' },
      },
      {
        path: ':id',
        component: EventParticipationDetail,
      },
    ],
  },

  // ========== 마이비즈니스 (M_PIIO_00068) ==========

  // 마이비즈니스
  'M_PIIO_00112': {
    component: MyBussiness,
    layout: 'SubpageLayoutWithMenu',
  },

  // 증명서 발급 조회
  'M_PIIO_00113': {
    component: UI_USR_L_510,
    layout: 'SubpageLayoutWithMenu',
  },

  // 지원사업 신청 현황
  'M_PIIO_00114': {
    component: UI_USR_L_520,
    layout: 'SubpageLayoutWithMenu',
  },

  // 회원정보변경
  'M_PIIO_00115': {
    component: MemberInfoChangeGate,
    layout: 'SubpageLayoutWithMenu',
    wrapChildren: true,
    componentProps: {
      successPath: 'modify',
    },
    children: [
      {
        path: 'modify',
        component: UI_USR_W_411,
      },
    ],
  },

  // 비밀번호 수정
  'M_PIIO_00116': {
    component: UI_USR_R_420,
    layout: 'SubpageLayoutWithMenu',
  },

  // 인증수단 재설정
  'M_PIIO_00117': {
    component: UI_USR_W_430,
    layout: 'SubpageLayoutWithMenu',
  },

  // 회원탈퇴
  'M_PIIO_00118': {
    component: UI_USR_R_440,
    layout: 'SubpageLayoutWithMenu',
  },

  // 기업 기본정보
  'M_PIIO_00119': {
    component: UI_USR_R_450,
    layout: 'SubpageLayoutWithMenu',
    children: [
      {
        path: 'edit',
        component: UI_USR_W_452,
      },
    ],
  },

  // 경영현황 분석
  'M_PIIO_00120': {
    component: UI_USR_R_490,
    layout: 'SubpageLayoutWithMenu',
  },

  // 담당자 관리
  'M_PIIO_00121': {
    component: UI_USR_L_460,
    layout: 'SubpageLayoutWithMenu',
  },

  // 문의 관리
  'M_PIIO_00122': {
    component: UI_USR_L_020, // from UI_USR_L_470,
    layout: 'SubpageLayoutWithMenu',
  },

  // 관심 공고
  'M_PIIO_00123': {
    component: ScrapList,
    layout: 'SubpageLayoutWithMenu',
  },

  // 나의 알림
  'M_PIIO_00124': {
    component: UI_USR_L_540,
    layout: 'SubpageLayoutWithMenu',
  },

  // 나의 Open API 신청내역
  'M_PIIO_00125': {
    component: MyApiRequestList,
    layout: 'SubpageLayoutWithMenu',
  },

  // ========== 푸터화면 ==========
  // 이메일주소 무단수집거부 안내
  'M_PIIO_00153': {
    component: EmailRejection,
    layout: 'MenuProviderOnly',
  },

  // 저작권 정책
  'M_PIIO_00154': {
    component: CopyrightPolicy,
    layout: 'MenuProviderOnly',
  },

  // 웹접근성 정책
  'M_PIIO_00155': {
    component: WebAccessibilityPolicy,
    layout: 'MenuProviderOnly',
  },

  // 이용약관
  'M_PIIO_00156': {
    component: TermsOfUse,
    layout: 'MenuProviderOnly',
  },

};

/**
 * 컴포넌트 존재 여부 확인
 */
export const hasComponent = (componentKey) => {
  return !!componentMap[componentKey];
};

/**
 * 컴포넌트 가져오기
 */
export const getComponent = (componentKey) => {
  return componentMap[componentKey] || null;
};
