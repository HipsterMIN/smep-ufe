import React from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import captureImg from "../../styles/img/capture1.png";

const UI_USR_L_010 = () => {
  const navigationData = {
    depth1Title: "마이비즈니스",
    depth: [
      {
        depth2: "나의 대시보드",
      },
      {
        depth2: "회원정보관리",
      },
      {
        depth2: "기업정보관리",
      },
      {
        depth2: "서비스 이용이력",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "마이비즈니스", link: "#" },
    { label: "나의 대시보드", link: "#" },
  ];

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <img src={captureImg} alt="대시보드" />
      </div> 
    </>
  );
};

export default UI_USR_L_010;
