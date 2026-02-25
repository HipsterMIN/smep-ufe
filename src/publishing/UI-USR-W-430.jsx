 import React from "react";

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";


const UI_USR_W_430 = () => {

  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
       {
        depth2: "지원사업",
        active: true,
      },
      {
        depth2: "사업공고",
      },
      {
        depth2: "정책금융",
      },
	    {
        depth2: "증명서 발급",
        active: true,
        depth3: [
			    {
            label: "증명서 발급",
            link: "/",
            active: true
          },
          {
            label: "발급 진위 확인",
            link: "/",
          },
          {
            label: "기타 증명서",
            link: "/",
          },
		]
      },
    ],
  };

  const breadcrumbItems = [
    { label: "마이비즈니스", link: "#" },
    { label: "나의 대시보드", link: "#" },
    { label: "증명서 발급 조회", link: "#" },
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
          <h2 className="h-tit">인증수단 재설정</h2>
        </div>
        
        <div className="conts-wrap certify-conts">
          <h3 className="sec-tit">인증수단 재설정 (기업)</h3>
           <ul className="krds-info-list decimal" role="list">
            <li role="listitem">기존에 사용하던 인증수단을 다른 인증수단으로 변경 할 수 있습니다.</li>
          </ul>
          <div className="certify-cont-box mt-40">
            <div className="certify-cont-item">
              <strong className="certify-cont-title">휴대전화 인증</strong>
              <div className="certify-cont-img phone"></div>
              <button type="button" className="krds-btn medium primary">인증하기</button>
            </div>
            <div className="certify-cont-item">
              <strong className="certify-cont-title">아이핀 인증</strong>
              <div className="certify-cont-img ipin"></div>
              <button type="button" className="krds-btn medium primary">인증하기</button>
            </div>
          </div>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">입력하신 인증정보는 실명인증을 위한 자료로 사용되며 이외의 용도로 사용 또는 제공되지 않습니다.</li>
            <li role="listitem">인증이 정상적으로 작동하지 않으면 브라우저의 팝업 차단 기능을 해제하신 후 이용하시기 바랍니다.</li>
            <li role="listitem">인증 관련 문의 <br />
              - NICE평가정보(주) 고객센터 Tel : 1600-1522
            </li>
          </ul>
        </div>

      </div> 
    </>
  );
};

export default UI_USR_W_430;
