import '@styles/custom.scss';
import '@styles/mypage.scss';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import BusinessSummarySection from './sections/BusinessSummarySection.jsx';
import InsightSection from './sections/InsightSection.jsx';
import DeadlineCalendarSection from './sections/DeadlineCalendarSection.jsx';
import ServiceStatusSection from './sections/ServiceStatusSection.jsx';

const MyBusinessDashBoard = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
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

        <BusinessSummarySection />
        <InsightSection />
        <DeadlineCalendarSection />
        <ServiceStatusSection />
      </main>
    </>
  );
};

export default MyBusinessDashBoard;
