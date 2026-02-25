import React, { useRef } from "react";
import { Link } from 'react-router-dom';

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination"; 
import noticeDummyImg from "../../styles/img/notice_dummy1.jpg";



const UI_USR_R_091 = () => {
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
    { label: "신청·발급", link: "#" },
    { label: "사업공고", link: "#" },
    { label: "사업공고", link: "#" },
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
            <p className="on-p1 on-colorblue">영상</p>
            <h2 className="h-tit2">2026년 업무보고 사후 브리핑</h2>
        </div>
		<ul className="onboard-summary">
			<li>
				<span>출처 : 중소벤처기업부 블로그 </span>
			</li>
			 <li>
				<span className="sr-only">작성일</span>
				<span>2025.12.29</span>
			</li>
			<li>
				<span>
				<span className="sr-only">조회수</span>
				<i className="svg-icon ico-pw-visible-on"></i>
				36
				</span>
			</li>
    </ul>

		{/* 게시글 내용 */}

		<div className="onboard-conts-area">
			<p>
				중소벤처24에서 안내드립니다. <br /><br />
				2025년 10월 1일부로 중소벤처24의 새로운 기능이 출시되었습니다.<br /><br />
				1. 사업공고 캘린더를 통해 시작·마감·진행 중인 사업을 한눈에 확인하세요!
				2. 매 주 1회(월요일) 사업공고 알림을 통해 새로운 사업을 빠르게 확인해보세요!<br /><br />
				모든 내용은 모바일 기기를 통해 쉽게 확인하실 수 있습니다.
			</p>
			<br /><br />
			<div className="on-videobox">
          <iframe  src="https://www.youtube.com/embed/-UU21JeRvlc?si=iM-NcqRpAQIg1Kks" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
			</div>

      <div className="on-subtitle-box">
        <div className="subtitle-boxtit">동영상 자막</div>
        <div className="subtitle-boxcon">
          안녕하십니까. 중소벤처 기업부 장관 한성숙입니다.
오늘 오전 대통령님을 모시고 국민 여러분께 보고드린 2026년 중소벤처 기업부 업무 보고를 간략하게 브리핑하겠습니다.
지난 6개월간 중기부는 민생과 혁신을 회복하는데 정책 연 역 영량을 겹결집해 왔으며 현장 목소리를 적극적으로 정책에 반영했습니다.
가장 먼저 내수활력 불시 살리기에 집중했습니다.  안녕하십니까. 중소벤처 기업부 장관 한성숙입니다.
오늘 오전 대통령님을 모시고 국민 여러분께 보고드린 2026년 중소벤처 기업부 업무 보고를 간략하게 브리핑하겠습니다.
지난 6개월간 중기부는 민생과 혁신을 회복하는데 정책 연 역 영량을 겹결집해 왔으며 현장 목소리를 적극적으로 정책에 반영했습니다.
가장 먼저 내수활력 불시 살리기에 집중했습니다.  안녕하십니까. 중소벤처 기업부 장관 한성숙입니다.
오늘 오전 대통령님을 모시고 국민 여러분께 보고드린 2026년 중소벤처 기업부 업무 보고를 간략하게 브리핑하겠습니다.
지난 6개월간 중기부는 민생과 혁신을 회복하는데 정책 연 역 영량을 겹결집해 왔으며 현장 목소리를 적극적으로 정책에 반영했습니다.
가장 먼저 내수활력 불시 살리기에 집중했습니다.  
        </div>
      </div>
      
    </div>

		{/* 첨부파일 */}
		<div className="onbox-group-areawrap">
            <p className="onbox-group-title">첨부파일</p>
            <ul className="box-group-area">
              <li>
                <p className="tit">
                  <i className="svg-icon ico-file2"></i>
                  2026년 스마트 제조혁신 지원사업 사업설명회 추가 개최 안내.png
                </p>
                <div className="btn-wrap">
                  <a href="#" className="krds-btn medium link basic" target="_blank" title="새 창 열림"><i className="svg-icon ico-sch-plus"></i> 바로보기 </a>
                  <button type="button" className="krds-btn medium text on-colorblue"><i className="svg-icon ico-down on-bgcolorblue"></i> 다운로드 </button>
                </div>
              </li>
            </ul>
          </div>

		{/* 이전글, 다음글 */}
		<ul className="post-nav-list mt-40">
			{/* 이전글 */}
			<li className="post-nav-item prev">
				<Link to="#" className="post-nav-link">
					<i className="svg-icon ico-angle left"></i>
					<span className="post-nav-label">이전글</span>
					<span className="post-nav-title onellipsis-1">[중소벤처24 안내] 중소벤처24 신규 서비스 오픈</span>
				</Link>
				{/* disasbled 케이스 */}
				{/* <span className="post-nav-link is-disabled" aria-disabled="true">
					<i className="svg-icon ico-angle left"></i>
					<span className="post-nav-label">이전글</span>
					<span className="post-nav-title onellipsis-1">[중소벤처24 안내] 중소벤처24 신규 서비스 오픈</span>
				</span> */}
			</li>

			{/* 다음글 */}
			<li className="post-nav-item next">
				<Link to="#" className="post-nav-link">
					<span className="post-nav-label">다음글</span>
					<span className="post-nav-title onellipsis-1">[중소벤처24 안내] 중소벤처24 기업회원 담당자 변경 방법</span>
					<i className="svg-icon ico-angle right"></i>
				</Link>
				{/* disasbled 케이스 */}
				{/* <span className="post-nav-link is-disabled" aria-disabled="true">
					<span className="post-nav-label">다음글</span>
					<span className="post-nav-title onellipsis-1">[중소벤처24 안내] 중소벤처24 신규 서비스 오픈</span>
					<i className="svg-icon ico-angle right"></i>
				</span> */}
			</li>
		</ul>


		{/* 하단 버튼 */} 
		  <div className="onboard-btm-btngroup bt-0">
            <div>
              <button type="button" className="krds-btn tertiary xlarge">
                목록
              </button>
            </div>
            <div>
               <button type="button" className="krds-btn tertiary xlarge">
                 <i className="svg-icon ico-like"></i>    
                관심공고
               </button>
               <button type="button" className="krds-btn tertiary xlarge">
                <i className="svg-icon ico-copy"></i>    
                링크복사
               </button>
               <button type="button" className="krds-btn tertiary xlarge">
                동영상 바로가기
                <i className="svg-icon ico-go"></i>
              </button>
            </div>
          </div>

      </div> 
    </>
  );
};

export default UI_USR_R_091;
