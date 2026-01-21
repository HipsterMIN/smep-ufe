import React, { useRef } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import ServiceImg from "../../styles/img/sub/img_service_guide.jpg"

const UI_USR_R_340 = () => {
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
    { label: "홀센터 안내", link: "#" },
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
          <h2 className="h-tit">콜센터 안내</h2>
        </div>

		<div className="service-guide">
			<div className="guide-top">
				<p className="guide-top-sub">문의사항이 있을 땐,</p>
				<h3 className="guide-top-title">대한민국 9988을 위한 <br />원스톱 전화번호 
					<em className="tel-01">1</em><em className="tel-02">3</em><em className="tel-03">5</em><em className="tel-04">7</em>
				</h3>
			</div>
			<ul className="guide-cont-list">
				<li>
					<h4 className="title">중소기업통합콜센터</h4>
					<p className="info">
						전화 한 번으로 기업의 궁금한 사항을 빠르게 상담해 드리고 어려운 애로사항을 해결해 드립니다.
					</p>
					<div className="detail-info">
						<i className="svg-icon ico-tel-fill"></i>
						국번없이 1357
					</div>
				</li>
				<li>
					<h4 className="title">카카오톡플러스 친구</h4>
					<p className="info">
						카카오톡플러스 친구로 1357 중소기업통합콜센터를 추가해주시면 다양한 정보를 신속하게 알려드립니다.
					</p>
					<div className="detail-info">
						<a href="https://pf.kakao.com/_IIfqd" target="_blank" title="카카오톡플러스 친구(새 창 열림)" className="kakao-link">
							<i className="ico-kakao"></i>친구추가하기 <i className="svg-icon ico-link"></i>
						</a>
					</div>
				</li>
				<li>
					<h4 className="title">중소벤처24 서비스 문의</h4>
					<p className="info">
						중소벤처24 서비스 이용 중 궁금한 사항이나 통합로그인 관련 문의에 답변해드립니다.
					</p>
					<div className="detail-info">
						<i className="svg-icon ico-tel-fill pink"></i>
						044-300-0990 <br /> 044-300-0991
					</div>
					
				</li>
			</ul>
		</div>

      </div> 
    </>
  );
};

export default UI_USR_R_340;
