import React, { useRef } from "react";
import { Link } from 'react-router-dom';

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination"; 
import noticeDummyImg from "../../styles/img/notice_dummy1.jpg";



const UI_USR_R_331 = () => {
  const navigationData = {
    depth1Title: "신청·발급",
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
    { label: "고객지원", link: "#" },
    { label: "고객센터", link: "#" },
    { label: "Q&A", link: "#" },
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
            <h2 className="h-tit2">API 문의드립니다.</h2>
        </div>
		<ul className="onboard-summary">
			<li>
				<span className="sr-only">카테고리</span>
        일반 문의
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
				중소벤처24에서 안내드립니다. <br /><br />
				2025년 10월 1일부로 중소벤처24의 새로운 기능이 출시되었습니다.<br /><br />
				1. 사업공고 캘린더를 통해 시작·마감·진행 중인 사업을 한눈에 확인하세요!
				2. 매 주 1회(월요일) 사업공고 알림을 통해 새로운 사업을 빠르게 확인해보세요!<br /><br />
				모든 내용은 모바일 기기를 통해 쉽게 확인하실 수 있습니다.
			</p>
			<br /><br />
    </div>


		{/* 하단 버튼 */} 
		  <div className="onboard-btm-btngroup">
          <div className="onanswerbox">
            <dl>
              <dt>담당자</dt>
              <dd className="usrNm">허*일</dd>
            </dl>
            <p className="answer-txt">
              답변 테스트입니다.
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Distinctio obcaecati, voluptatem recusandae sint officiis consectetur totam fugit debitis ducimus, optio incidunt tenetur inventore ad unde odio, dolores cum dolorum accusantium?
            </p>
          </div>
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

export default UI_USR_R_331;
