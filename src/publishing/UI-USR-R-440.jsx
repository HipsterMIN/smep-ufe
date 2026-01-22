 import React from "react";

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";


const UI_USR_R_440 = () => {

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
          <h2 className="h-tit">회원 탈퇴</h2>
        </div>

        <div className="txt-box outline">
          <h4 className="outline-tit">알려드립니다.</h4>
          <ul className="check-list">
            <li>중소벤처24를 이용해 주신 회원님께 진심으로 감사드립니다.</li>
            <li>탈퇴 이후에 재가입은 가능하지만 기존에 사용하였던 ID는 더이상 사용할 수 없습니다.</li>
            <li>기업회원은 해당 기업관리자만이 회원탈퇴가 가능합니다.</li>
          </ul>
        </div>

        <div className="krds-table-wrap mt-24">
          <table className="tbl col data tbl-row"> {/* row타입 테이블 class명: tbl-row */}
            <caption>회원 기업 정보. 기업명, 기업 관리자 정보가 제공됨.  </caption>
            <colgroup>
              <col style={{ width: '20%' }} />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <th scope="row" className="ac">기업명</th>
                <td>에스엠이에스</td>
              </tr>
              <tr>
                <th scope="row"  className="ac">기업관리자</th>
                <td>허강일</td>
              </tr>
            </tbody>
          </table>
        </div>
{/* 
        <div className="conts-wrap certify-conts mt-64">
          <h3 className="sec-tit">회원 탈퇴 시 회원 정보 보관 안내</h3>
          <p className="conts-desc" >회원가입 시 입력하신 회원정보는 “개인정보처리방침”에 따라 아래와 같이 일정기간 저장함을 안내합니다.</p>
           <div className="krds-table-wrap mt-24">
          <table className="tbl col data">
            <caption>회원 정보 보관 안내 표. 보유기간, 수집동의, 법적근거, 비고 정보가 제공됨. </caption>
            <colgroup>
              <col style={{width: "16%"}} />
              <col style={{width: "16%"}}/>
              <col style={{width: "16%"}}/>
              <col style={{width: "16%"}}/>
              <col  />
            </colgroup>
             <thead>
                <tr>
                  <th scope="col" className="ac">구분</th>
                  <th scope="col" className="ac">보유기간</th>
                  <th scope="col" className="ac">수집동의</th>
                  <th scope="col" className="ac">법적근거</th>
                  <th scope="col" className="ac">비고</th>
                  </tr>
              </thead>
            <tbody>
              <tr>
                <th scope="row" className="ac"><span>회원정보</span></th>
                <td className="ac"><span>즉시 파기</span></td>
                <td className="ac" colSpan={4}><span>정보주체의 동의</span></td>
                <td className="ac" colSpan={4}><span>개인정보보호법 제3장정보통신망 이용촉진 및 정보보호 등에 관한 법률 제27조</span></td>
                <td className="ac" colSpan={4}><span>GET 방식으로 호출시 url encoding 필요</span></td>
              </tr>
            </tbody>
          </table>
          </div>
        </div> */}

        <div className="conts-wrap mt-64 certify-conts">
          <h3 className="sec-tit">기업 인증 </h3>
          <div className="certify-cont-box">
            <div className="certify-cont-item">
              <div className="certify-cont-img"></div>
              <button type="button" className="krds-btn medium primary">인증하기</button>
            </div>
          </div>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">
              인증 관련 문의 <br />
              - NICE평가정보(주) 고객센터 Tel : 1600-1522
            </li>
          </ul>
        </div>

      </div> 
    </>
  );
};

export default UI_USR_R_440;
