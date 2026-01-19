import React from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import LogoImg from "../../styles/img/component/icon/ico_logo_24.svg";



const UI_USR_R_060 = () => {
  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
      {
        depth2: "AI 스마트 통합 검색",
      },
      {
        depth2: "지원사업",
        active: true,
      },
      {
        depth2: "사업공고",
      },
      {
        depth2: "정책금융",
        active: true,
        depth3: [
          {
            label: "정책금융안내",
            link: "/main-dev/service/UI_USR_L_030",
            active: true,
          },
        ],
      },
      {
        depth2: "증명서 발급",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "증명서 발급", link: "#" },
    { label: "발급 진위 확인", link: "#" },
  ];

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
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
          <a className="krds-btn primary large" href="" target="_blank" title="새창 열림">정부24 신청·조회·발급</a>
        </div>


      </div> 
    </>
  );
};

export default UI_USR_R_060;