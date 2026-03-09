import React from "react";
import { Link } from 'react-router-dom';
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import LogoImg from "../assets/common/logo.svg";



const UI_USR_R_441 = () => {
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
            link: "/home-dev/service/UI_USR_L_030",
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
          <h2 className="h-tit">회원 탈퇴</h2>
        </div>

        <div className="bg-guide bg-gray">
          <span className="bg-guide-img auto">
            <img src={LogoImg} alt="중소벤처 24,기업마당" />
          </span>
          <p className="bg-guide-sub">회원 탈퇴가 완료되었습니다.</p> 
          <p className="bg-guide-desc">
            회원님의 계정은 정상적으로 탈퇴 처리되었습니다. <br />
            탈퇴 후 회원 정보 및 이용 기록은 복구할 수 없습니다. <br /><br />
            그동안 서비스를 이용해주셔서 감사합니다.
          </p>
          <Link to="#" className="krds-btn primary large">메인 페이지로 이동</Link>
        </div>
      </div> 
    </>
  );
};

export default UI_USR_R_441;