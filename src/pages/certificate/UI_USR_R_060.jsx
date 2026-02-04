import React from 'react';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import LogoImg from '@styles/img/component/icon/ico_logo_24.svg';
import { useUserMenu } from '@context/UserMenuContext.jsx';



const UI_USR_R_060 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();


  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">기타 증명서</h2>
        </div>

        <div className="bg-guide">
          <span className="bg-guide-img">
            <img src={LogoImg} alt="정부24" />
          </span>
          <p className="bg-guide-sub">중앙행정기관, 공공기관, 지방자치단체의 서비스를</p> 
          <p className="bg-guide-title"><strong>정부24</strong>에서 받으실 수 있습니다.</p>
          <p className="bg-guide-desc">정부24 회원/비회원 신청 가능하지만,<br /> 일부 서비스는 공동인증서가 별도로 필요할 수 있습니다.</p>
          <a className="krds-btn primary large" href="https://plus.gov.kr/minwon" target="_blank" title="새창 열림">정부24 신청·조회·발급</a>
        </div>
      </div> 
    </>
  );
};

export default UI_USR_R_060;