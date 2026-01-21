import { useState } from 'react';
import {Link} from "react-router-dom";

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination";


const UI_USR_R_232 = () => {

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
    { label: "신청·발급", link: "#" },
    { label: "증명서 발급", link: "#" },
    { label: "증명서 발급", link: "#" },
  ];

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap side-conts" data-type="responsive">
          <h2 className="h-tit">
            정책정보 개방
          </h2>
        </div>

        <p className="guide-txt">
          중소벤처24에서는 중소벤처기업부에서 보유하고 있는 정보 및 서비스를 API를 통해 배포하고 있습니다. <br />
          Open API는 중소벤처기업부 각 기관 및 이를 서비스하고자 하는 일반을 대상으로 배포하고 있습니다.<br />
        * 다만, 해당 인증키는 신청 및 가능여부를 판단하여 제공하고 있습니다.
        </p>

        {/* tab link */}
        <div className="tab fill full mt-48">
            <ul>
                <li>
                  <Link to="#" className="btn-tab">
                    API 소개
                  </Link>
                </li>
                <li>
                  <Link to="#" className="btn-tab">
                   인증키 신청
                  </Link>
                </li>
                <li className="active">
                  <Link to="#" className="btn-tab">
                    API Q&A
                    <span className="sr-only">현재 페이지</span>
                  </Link>
                </li>
            </ul>
        </div>

        <div className="page-title-wrap" data-type="responsive">
            <h2 className="h-tit2">API 문의드립니다.</h2>
        </div>
        <ul className="onboard-summary">
          <li>
            문의 구분: 일반 문의
          </li>
          <li>
            <span className="sr-only">작성일</span>
            <span>2025.12.29</span>
          </li>
          <li>
            <span>작성자 홍길동</span>
          </li>
        </ul>

        {/* 게시글 내용 */}
        <div className="onboard-conts-area">
          <p>
            테스트입니다.
          </p>
        </div>


        {/* 하단 버튼 */} 
          <div className="onboard-btm-btngroup">
              <div>
                <button type="button" className="krds-btn tertiary xlarge">
                  목록
                </button>
              </div>
            </div>
        </div> 
    </>
  );
};

export default UI_USR_R_232;
