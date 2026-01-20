import React from "react";
import { Link } from "react-router-dom";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import infoIcon01 from "../assets/sub/icon-info01.svg";
import infoIcon02 from "../assets/sub/icon-info02.svg";
import infoIcon03 from "../assets/sub/icon-info03.svg";
import infoIcon04 from "../assets/sub/icon-info04.svg";
import infoIcon05 from "../assets/sub/icon-info05.svg";
import infoIcon06 from "../assets/sub/icon-info06.svg";

const UI_USR_W_130 = () => {
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
    { label: "정책정보", link: "#" },
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
          <h2 className="h-tit">중소벤처기업부 법정민원신청</h2>
        </div>
				<div className="search-top-box">
					<div className="sch-form-wrap">
						<select className="krds-form-select">
							<option value="">제목</option>
							<option value="">항목</option>
						</select>
						<div className="sch-input">
							<input type="text" className="krds-input" placeholder="검색어를 입력해주세요." title="검색어 입력" />
							<button type="button" className="krds-btn medium icon ico-search" >
								<span className="sr-only">검색</span>
								<i className="svg-icon ico-sch"></i>
							</button>
						</div>
					</div>
				</div>
				<div className="search-list-top">
					<ul className="sch-info" aria-live="polite">
						<li>검색 결과 <span className="point">6</span>개</li>
					</ul>
				</div>

        <ul className="on-boxlist gap24">
          <li>
            <div className="on-boxlist-in">
              <img src={infoIcon01} alt="" />
              <div>
                <div className="page-title-wrap">
                  <Link to="/"><p className="h-tit3">중소기업협동조합 해산신고 지방조합, 사업조합, 지역연합회</p></Link>
                  <span>이 민원은 중소기업협동조합 설립인가를 받은 자가 해산하고자 할 때 신고하여야 하는 민원입니다.</span>
                </div>
                <a 
                  className="krds-btn tertiary medium"
                  href="https://www.gov.kr/mw/AA020InfoCappView.do?HighCtgCD=A09006&amp;CappBizCD=14200000006&amp;tp_seq=02" target="_blank" title="새 창 열림">
                  정부 24 이동
                  <i className="svg-icon ico-go"></i>
                </a>
              </div>
            </div>  
          </li>          
          <li>
            <div className="on-boxlist-in">
              <img src={infoIcon02} alt="" />
              <div>
                <div className="page-title-wrap">
                  <Link to="/"><p className="h-tit3">창업보육센터사업자 지정(변경신고)</p></Link>
                  <span>이 민원은 예비창업자 또는 창업초기기업의 창업성공을 도모하기 위한 창업보육센터 운영사업자 지정을 신청하는 민원사무입니다.</span>
                </div>
                <a 
                  className="krds-btn tertiary medium"
                  href="https://www.gov.kr/nlogin/loginNonMember?cappBizCd=14200000042&amp;nonLoginUrl=%2Fmw%2FAA040OfferMainFrm.do%3Fcapp_biz_cd%3D14200000042%26amp%3BHighCtgCD%3DA09006%26amp%3BFAX_TYPE%3Dy%26amp%3Bimg%3D02%26amp%3BselectedSeq%3D01" target="_blank" title="새 창 열림">
                  정부 24 이동
                  <i className="svg-icon ico-go"></i>
                </a>
              </div>
            </div>  
          </li>          
          <li>
            <div className="on-boxlist-in">
              <img src={infoIcon03} alt="" />
              <div>
                <div className="page-title-wrap">
                  <Link to="/"><p className="h-tit3">중소벤처기업부 시험설비 이용신청</p></Link>
                  <span>이 민원은 중소벤처기업부 시험, 연구 및 설비지원 등에 관한 규칙 제10조에 의거 설비이용을 사용하는 민원사무입니다.</span>
                </div>
                <a 
                  className="krds-btn tertiary medium"
                  href="https://www.gov.kr/nlogin/loginNonMember?cappBizCd=14200000056&amp;nonLoginUrl=%2Fmw%2FAA040OfferMainFrm.do%3Fcapp_biz_cd%3D14200000056%26amp%3BHighCtgCD%3DA09006%26amp%3BFAX_TYPE%3Dy%26amp%3Bimg%3D02%26amp%3BselectedSeq%3D01" target="_blank" title="새 창 열림">
                  정부 24 이동
                  <i className="svg-icon ico-go"></i>
                </a>
              </div>
            </div>  
          </li>          
          <li>
            <div className="on-boxlist-in">
              <img src={infoIcon04} alt="" />
              <div>
                <div className="page-title-wrap">
                  <Link to="/"><p className="h-tit3">중소기업협동조합 해산신고</p></Link>
                  <span>이 민원은 중소기업협동조합 설립인가를 받은 자가 해산하고자 할 때 신고하여야 하는 민원입니다.</span>
                </div>
                <a 
                  className="krds-btn tertiary medium"
                  href="https://www.gov.kr/nlogin/loginNonMember?cappBizCd=14200000006&amp;nonLoginUrl=%2Fmw%2FAA040OfferMainFrm.do%3Fcapp_biz_cd%3D14200000006%26amp%3BHighCtgCD%3DA09006%26amp%3BFAX_TYPE%3Dy%26amp%3Bimg%3D02%26amp%3BselectedSeq%3D01" target="_blank" title="새 창 열림">
                  정부 24 이동
                  <i className="svg-icon ico-go"></i>
                </a>
              </div>
            </div>  
          </li>          
          <li>
            <div className="on-boxlist-in">
              <img src={infoIcon05} alt="" />
              <div>
                <div className="page-title-wrap">
                  <Link to="/"><p className="h-tit3">의뢰자의 시험분석성적서 등본 교부신청</p></Link>
                  <span>이 민원은 중소기업시험. 연구 및 설비지원 등에 대한 시험분석성적서를 신청할 수 있는 민원사무입니다.</span>
                </div>
                <a 
                  className="krds-btn tertiary medium"
                  href="https://www.gov.kr/nlogin/loginNonMember?cappBizCd=14200000053&amp;nonLoginUrl=%2Fmain%3Fa%3DAA040OfferMainFrmApp%26amp%3Bcapp_biz_cd%3D14200000053%26amp%3BHighCtgCD%3DA09006%26amp%3BFAX_TYPE%3D%26amp%3Bimg%3D02%26amp%3B" target="_blank" title="새 창 열림">
                  정부 24 이동
                  <i className="svg-icon ico-go"></i>
                </a>
              </div>
            </div>  
          </li>          
          <li>
            <div className="on-boxlist-in">
              <img src={infoIcon06} alt="" />
              <div>
                <div className="page-title-wrap">
                  <Link to="/"><Link><p className="h-tit3">전통시장 인정신청</p></Link></Link>
                  <span>이 민원은 전통시장으로 인정을 받고자 하는 자가 등록신청하는 민원사무입니다.</span>
                </div>
                <a 
                  className="krds-btn tertiary medium"
                  href="https://www.gov.kr/nlogin/loginNonMember?cappBizCd=14200000036&amp;nonLoginUrl=%2Fmw%2FAA040OfferMainFrm.do%3Fcapp_biz_cd%3D14200000036%26amp%3BHighCtgCD%3DA09006%26amp%3BFAX_TYPE%3Dy%26amp%3Bimg%3D02%26amp%3BselectedSeq%3D01" target="_blank" title="새 창 열림">
                  정부 24 이동
                  <i className="svg-icon ico-go"></i>
                </a>
              </div>
            </div>  
          </li>          
        </ul>
				
      </div> 
    </>
  );
};
 
export default UI_USR_W_130;
