import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';

/**
 * 상태 화면(로딩/에러/미지원)에서 보장할 최소 콘텐츠 높이(px)
 *
 * 목적:
 * - 본문 높이가 순간적으로 0에 가까워지는 상황을 방지
 * - footer가 위로 끌려 올라오는 시각적 점프(깜빡임)를 완화
 *
 * 참고:
 * - 실제 화면별 콘텐츠 높이는 더 클 수 있으며, 이 값은 "최소 안전 높이" 성격이다.
 */
const FALLBACK_CONTENT_MIN_HEIGHT_PX = 520;

/**
 * BoardResolverStateView
 *
 * 공통 상태 화면 전용 레이아웃 컴포넌트.
 * BoardResolver / BoardPostResolver에서 로딩/에러/미지원 상태에 재사용한다.
 *
 * 왜 별도 컴포넌트인가?
 * - 상태 분기마다 동일한 SideNavigation/Breadcrumb/타이틀 구조를 복붙하지 않기 위해
 * - 상태 전환 중에도 동일한 2컬럼 셸을 유지해 레이아웃 안정성을 확보하기 위해
 *
 * @param {Object} props
 * @param {string} [props.title='게시판'] 페이지 타이틀 영역 표시 문구
 * @param {string} props.message 사용자 안내 메시지(로딩/에러/미지원)
 */
const BoardResolverStateView = ({ title = '게시판', message }) => {
  /**
   * 메뉴 컨텍스트에서 현재 경로 기준 네비게이션 데이터 획득
   *
   * breadcrumbItems: 상단 경로 표시
   * getSideNavigationData: 좌측 LNB 메뉴 트리
   * getDepth1Parent: LNB 상단 제목(1depth 메뉴명)
   */
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  // 렌더 시점의 메뉴 상태를 기반으로 좌측/상단 네비 데이터 계산
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  return (
    <>
      {/* 좌측 사이드 네비: 상태 화면에서도 항상 유지해서 레이아웃 폭 변화를 막는다. */}
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        {/* 브레드크럼은 정상 화면과 동일 위치/형태로 유지 */}
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">{title}</h2>
        </div>
        <div
          /**
           * 접근성 메모:
           * - role="status" + aria-live="polite" 조합으로 상태 메시지 변화를
           *   보조기기 사용자가 과도한 인터럽트 없이 인지할 수 있게 한다.
           */
          role="status"
          aria-live="polite"
          style={{
            // 상태 화면 최소 높이 보장(footer 점프 방지 핵심)
            minHeight: `${FALLBACK_CONTENT_MIN_HEIGHT_PX}px`,
            // 메시지를 중앙 정렬해 로딩/오류 안내 가독성을 높임
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 상태별 안내 문구 출력 */}
          <span>{message}</span>
        </div>
      </div>
    </>
  );
};

export default BoardResolverStateView;
