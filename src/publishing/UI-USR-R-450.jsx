import React from "react";
import { useState } from 'react';

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Popup from "../components/ui/Popup";


const UI_USR_R_450 = () => {
  // 팝업 동작
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
          <h2 className="h-tit">기업 기본정보</h2>
        </div>
        
        <div className="conts-wrap">
          <h3 className="sec-tit">기본정보</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data tbl-row"> {/* row타입 테이블 class명: tbl-row */}
              <caption>기업 기본정보 표. 사업자등록번호(법인번호), 기업대표전화번호, 기업대표이메일, 주생산품, 기업주소 정보가 제공됨.  </caption>
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row" className="ac">사업자등록번호(법인번호)</th>
                  <td>100-20-30000</td>
                  <th scope="row"  className="ac">기업대표전화번호</th>
                  <td>02-1111-2222</td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업대표이메일</th>
                  <td></td>
                  <th scope="row"  className="ac">주생산품</th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업대표이메일</th>
                  <td></td>
                  <th scope="row"  className="ac">주생산품</th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업주소</th>
                  <td></td>
                  <th scope="row"></th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업주소</th>
                  <td></td>
                  <th scope="row"></th>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">상세정보</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data tbl-row"> {/* row타입 테이블 class명: tbl-row */}
              <caption>기업 기본정보 표. 사업자등록번호(법인번호), 기업대표전화번호, 기업대표이메일, 주생산품, 기업주소 정보가 제공됨.  </caption>
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row" className="ac">사업자등록번호(법인번호)</th>
                  <td>100-20-30000</td>
                  <th scope="row"  className="ac">기업대표전화번호</th>
                  <td>02-1111-2222</td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업대표이메일</th>
                  <td></td>
                  <th scope="row"  className="ac">주생산품</th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업대표이메일</th>
                  <td></td>
                  <th scope="row"  className="ac">주생산품</th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업주소</th>
                  <td></td>
                  <th scope="row"></th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업주소</th>
                  <td></td>
                  <th scope="row"></th>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="onboard-btm-btngroup bt-0 btn-single">
          <div>
              <button type="button" className="krds-btn primary xlarge" >
                상세정보 수정
              </button>
          </div>
        </div>
      </div> 

     
    </>
  );
};

export default UI_USR_R_450;
