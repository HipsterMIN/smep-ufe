/**
 * 동적 경로 매칭에 필요한 child path 메타정보만 모아둔 파일.
 *
 * UserMenuContext.jsx는 현재 URL이 동적 child 경로(:id 등)일 때 상위 메뉴를 찾기 위해
 * 각 component key의 children[].path 목록이 필요하다.
 * componentMap.js(React.lazy 포함)를 직접 import하면 Vite 청크 분리 시 TDZ 순환 의존성이
 * 생겨 "Cannot read properties of undefined (reading 'default')" 오류가 발생한다.
 * 이 파일은 React.lazy 없이 순수 경로 메타만 export하여 그 의존성을 끊는다.
 *
 * 현재 key는 운영 반영 안정성을 위해 기존 menuId 값을 유지한다.
 * scrnLnkgCd를 사람이 읽기 쉬운 값으로 바꾸는 시점에는 componentMap.js key와 함께
 * 이 파일의 key도 같은 배포 단위로 변경해야 child route의 currentMenu 판별이 유지된다.
 */

const routeChildrenMeta = {

  // ========== 신청·발급 ==========
  'M_PIIO_00075': { children: [{ path: ':id' }] },
  'M_PIIO_00076': { children: [{ path: ':id' }] },
  'M_PIIO_00169': { children: [{ path: ':id' }] },
  'M_PIIO_00077': { children: [{ path: ':plcyFnncNo' }] },
  'M_PIIO_00078': {
    children: [
      { path: ':prdocCd' },
      { path: ':prdocCd/apply' },
      { path: 'Y101/dpc-issue' },
      { path: 'Y104/biz-issue' },
      { path: 'Y109/cbz-issue' },
      { path: 'Y113/pfc-issue' },
      { path: ':prdocCd/smtc-issue' },
      { path: ':prdocCd/smft-issue' },
    ],
  },

  // ========== 정책정보 ==========
  'M_PIIO_00084': { children: [{ path: ':id' }] },
  'M_PIIO_00085': { children: [{ path: ':id' }] },
  'M_PIIO_00086': { children: [{ path: ':id' }] },
  'M_PIIO_00165': { children: [{ path: ':id' }] },
  'M_PIIO_00087': { children: [{ path: ':id' }] },
  'M_PIIO_00089': { children: [{ path: ':id' }] },
  'M_PIIO_00091': { children: [{ path: ':id' }] },
  'M_PIIO_00094': { children: [{ path: ':id' }] },
  'M_PIIO_00088': { children: [{ path: ':certSystmSn' }] },
  'M_PIIO_00149': { children: [{ path: ':id' }] },

  // ========== 데이터 개방 ==========
  'M_PIIO_00096': {
    children: [
      { path: 'supportBusinessInfoApi' },
      { path: 'eventInfoApi' },
      { path: 'innoBizCertificateApi' },
      { path: 'ventureCertificateApi' },
      { path: 'mainBizCertificateApi' },
    ],
  },
  'M_PIIO_00098': {
    children: [
      { path: 'save' },
      { path: ':id/edit' },
      { path: ':id' },
    ],
  },

  // ========== 고객지원 ==========
  'M_PIIO_00101': { children: [{ path: ':id' }] },
  'M_PIIO_00103': {
    children: [
      { path: ':id' },
      { path: ':id/edit' },
      { path: 'save' },
    ],
  },
  'M_PIIO_00171': {
    children: [
      { path: 'save' },
      { path: ':id/edit' },
      { path: ':id' },
    ],
  },

  // ========== 마이비즈니스 ==========
  'M_PIIO_00115': { children: [{ path: 'modify' }] },
  'M_PIIO_00119': { children: [{ path: 'edit' }] },
};

export default routeChildrenMeta;
