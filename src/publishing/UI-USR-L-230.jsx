import { useState } from 'react';
import {Link} from "react-router-dom";

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination";


const UI_USR_L_230 = () => {

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

        <div className="search-top-box no-details mt-40">
            <div className="form-row-box">
              <div className="select-box">
                <label className="label" htmlFor="select_01">문의구분</label>
                <select id="select_01" className="krds-form-select medium ">
                  <option value="">전체</option>
                </select>
              </div>
              <div className="select-box">
                <label className="label" htmlFor="select_02">처리상태</label>
                <select id="select_02" className="krds-form-select medium ">
                  <option value="">전체</option>
                </select>
              </div>
            </div>
            <div className="form-row-box gap-12">
              <div className="select-box">
                <label className="label" htmlFor="select_03">검색구분</label>
                <select id="select_03" className="krds-form-select medium ">
                  <option value="">전체</option>
                </select>
              </div>
              <div className="sch-input w-476">
                <input type="text" className="krds-input medium" placeholder="검색어를 입력해주세요." title="검색어 입력" />
                <button type="button" className="krds-btn medium icon ico-search" >
                  <span className="sr-only">검색</span>
                  <i className="svg-icon ico-sch"></i>
                </button>
              </div>
            </div>
        </div>

          <div className="search-list-top mt-40">
            <ul className="sch-info" aria-live="polite">
              <li>검색 결과 <span className="point">24</span>건</li>
            </ul>
            <ul className="sch-sort">
              <li>
                <strong className="sort-label"><label for="sort">정렬기준</label></strong>
                <div className="w-sort-btn">
                  <button type="button" className="active">최신순<span className="sr-only">선택됨</span></button>
                  <button type="button">과거순</button>
                </div>
                <div className="m-sort-btn">
                  <select className="krds-form-select-sort" id="sort">
                    <option>최신순</option>
                    <option>과거순 </option>
                  </select>
                </div>
              </li>
            </ul>
            </div>

          {/* table [S] */}
				 <div className="krds-table-wrap">
					<table className="tbl col data">
            <caption>API Q&A 정보. 순번, 문의구분, 제목, 작성자, 처리상태, 등록일 정보가 제공됨.</caption>
						<colgroup>
							<col style={{width: "7.4%"}} />
							<col style={{width: "14%"}} />
							<col />
							<col style={{width: "16.8%"}} />
							<col style={{width: "16.8%"}} />
							<col style={{width: "13 %"}} />
						</colgroup>
						<thead>
							<tr>
								<th scope="col" className="ac">순번</th>
								<th scope="col" className="ac">문의구분</th>
								<th scope="col" className="ac">제목</th>
								<th scope="col" className="ac">작성자</th>
								<th scope="col" className="ac">처리상태</th>
								<th scope="col" className="ac">등록일</th>
				            </tr> 
						</thead>
						<tbody>
              {Array.from({ length: 10 }).map((_, index) => (
							<tr>
								<th scope="row" className="ac">
									<span>15</span>
								</th>
								<td className="ac"><span>인증키 관련</span></td>
								<td>
										<a className="onellipsis-1" href="#">
										  <span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									  </a>
								</td>
								<td className="ac"><span>홍*동</span></td>
								<td className="ac"><span>접수</span></td>
								<td className="ac"><span>2025-08-14</span></td>
							</tr>
              ))}
						  </tbody>
			        </table>
            </div>
            {/* table [E] */}
        <Pagination /> 
      </div> 
    </>
  );
};

export default UI_USR_L_230;
