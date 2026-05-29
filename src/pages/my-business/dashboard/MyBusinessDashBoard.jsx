import '@styles/custom.scss';
import '@styles/mypage.scss';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { shallow } from 'zustand/shallow';
import BusinessSummarySection from './component/BusinessSummarySection.jsx';
import InsightSection from './component/InsightSection.jsx';
import DeadlineCalendarSection from './component/DeadlineCalendarSection.jsx';
import ServiceStatusSection from './component/ServiceStatusSection.jsx';

// currentMode는 화면 모드이고, 하위 업무 API는 회원유형 코드(IND/ENT)를 받는다.
const MBR_TYPE_CD_BY_CURRENT_MODE = {
  CORPORATE: 'ENT',
  INDIVIDUAL: 'IND',
};

const MyBusinessDashBoard = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  // 대시보드 부모는 로그인 컨텍스트만 추출하고, 상세 업무 조회는 각 섹션이 담당한다.
  const myBusinessQueryProps = useAuthStore(
    (state) => ({
      mbrNo: String(state.user?.id ?? '').trim(),
      isLogin: state.isLogin,
      mbrTypeCd: MBR_TYPE_CD_BY_CURRENT_MODE[state.currentMode] || '',
    }),
    shallow,
  );
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <main className="mypage-content contents">
        <Breadcrumb items={breadcrumbItems} />

        {/* 기업 요약 */}
        <BusinessSummarySection {...myBusinessQueryProps} />
        {/* 데이터 인사이트 */}
        <InsightSection {...myBusinessQueryProps} />
        {/* 관심공고 마감 캘린더 */}
        <DeadlineCalendarSection {...myBusinessQueryProps} />
        {/* 서비스 현황 */}
        <ServiceStatusSection {...myBusinessQueryProps} />
      </main>
    </>
  );
};

export default MyBusinessDashBoard;
