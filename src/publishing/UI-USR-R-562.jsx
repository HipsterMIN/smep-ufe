import { useState } from 'react';
import {Link} from "react-router-dom";

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";

const UI_USR_R_562 = () => {

  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
      {
        depth2: "AI 스마트 통합 검색",
      },
      {
        depth2: "중소벤처기업부 지원사업 소개",
      },
      {
        depth2: "사업공고",
      },
      {
        depth2: "정책금융",
      },
      {
        depth2: "증명서발급",
        active: true,
        depth3: [
          {
            label: "증명서 발급",
            link: "/",
            active: true,
          },
        ],
      },
    ],
  };

  const breadcrumbItems = [
    { label: "약관 및 저작권", link: "#" },
    { label: "이용약관", link: "#" },
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
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">저작권 정책</h2>
        </div>

        <p className="guide-txt">
          저작권 정책과 관련하여 아래와 같이 안내해 드리며, 궁금한 사항이 있으시면 저희 홈페이지 운영자에게 문의해주시기 바랍니다.문의 : 02-867-9765 
        </p>

        <div className="conts-wrap mt-48">
          <p className="conts-desc on-important">
            기업마당 자료를 적법한 절차에 따라 다른 인터넷 사이트에 게재하는 경우에 단순한 오류 정정 이외에 내용의 무단변경을 금지하며 이를 위반할 때는 형사처벌을 받을 수 있습니다.
          </p>
          <p className="conts-desc on-important">
            기업마당에서 제공하는 콘텐츠를 무단 복제, 배포하는 경우에는 저작권법 제136조, 137조, 138조에 의한 권리의 침해죄, 출처명시위반의 죄 등에 해당될 수 있음을 유념하여 주시기 바랍니다.
          </p>
          <p className="conts-desc on-important">
            기업마당에서 제공하는 콘텐츠를 통해서 직접적으로 수익을 얻거나 이에 상응하는 혜택을 누리는 것을 금지합니다. 기업마당 콘텐츠를 이용하고자 하는 기관에서는 저희 중소벤처기업부와 사전에 별도의 협의를 하거나 중소벤처기업부의 허락을 얻어야 하며 협의 또는 허락을 얻어 자료의 내용을 게재하는 경우에도 출처가 기업마당임을 밝혀야 합니다.
          </p>
          <p className="conts-desc on-important">
            기업마당에서 창작하여 작성한 모든 콘텐츠는 저작권법에 의하여 보호받는 저작물로, 별도의 저작권 표시 또는 다른 출처를 명시한 경우를 제외하고는 원칙적으로 중소벤처기업부에 저작권이 있습니다.
          </p>
        </div>
      </div> 
    </>
  );
};

export default UI_USR_R_562;
