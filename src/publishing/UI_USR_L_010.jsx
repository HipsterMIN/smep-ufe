import React from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import SearchFormBox from "../components/ui/SearchFormBox";
import SearchListTop from "../components/ui/SearchListTop";
import Table from "../components/ui/Table";

const UI_USR_L_010 = () => {
  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
      {
        depth2: "AI 스마트 통합 검색",
      },
      {
        depth2: "중소벤처기업부 지원사업공고",
        active: true,
        depth3: [
          {
            label: "지원사업 공고",
            link: "/",
            active: true,
          },
        ],
      },
      {
        depth2: "사업공고",
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
    { label: "신청·발급", link: "#" },
    { label: "중소벤처기업부 지원사업공고", link: "#" },
    { label: "지원사업 공고", link: "#" },
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
          <h2 className="h-tit">지원사업 공고</h2>
        </div>
        <SearchFormBox />
        <SearchListTop />
        <Table />
      </div> 
    </>
  );
};

export default UI_USR_L_010;
