import React, {useState, useRef} from "react";
import { Link } from "react-router-dom";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";

import pageImg from "../../src/assets/sub/page_sso_img.jpg";

const UI_USR_SSO = () => {
  const navigationData = {
    depth1Title: "더 많은 서비스",
    depth: [
      {
        depth2: "AI 스마트 통합 검색",
      },
      {
        depth2: "중소벤처기업부 지원사업공고",
        
      },
      {
        depth2: "사업공고",
        active: true,
        depth3: [
          {
            label: "사업공고",
            link: "/",
            active: true,
          },
        ],
      },
      {
        depth2: "정책금융",
      },
      {
        depth2: "증명서 발급",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "더 많은 서비스", link: "#" },
    { label: "통합로그인(SSO)", link: "#" },
    { label: "", link: "#" },
  ];

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-img-box">
          <img src={pageImg} alt="" />
        </div>


      

      </div> 
    </>
  );
};
 
export default UI_USR_SSO;
