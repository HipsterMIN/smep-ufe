import React, { useRef } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination"; 

const UI_USR_L_330 = () => {
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
          <h2 className="h-tit">Q&A</h2>
        </div>
		<div className="search-top-box">
			<div className="sch-form-wrap">
				<select className="krds-form-select" aria-label="카테고리 선택"> {/* 기술진단보고서 반영 */}
					<option value="">카테고리 전체</option>
					<option value="">항목</option>
					<option value="">항목</option>
				</select>
				<select className="krds-form-select" aria-label="카테고리 선택"> {/* 기술진단보고서 반영 */}
					<option value="">제목</option>
					<option value="">항목</option>
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
				<li>검색 결과 <span className="point">24</span>개</li>
			</ul>
          <ul className="sch-sort">
			<li>
				<strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
				<select className="krds-form-select-sort" id="search_result_count">
					<option>10개</option>
					<option>9개</option>
				</select>
			</li>
          </ul>
        </div>
        {/* table [S] */}
		<div className="krds-table-wrap">
			<table className="tbl col data t-block">
				<caption>Q & A 목록. 번호, 카테고리, 제목, 작성자, 처리상태, 작성일, 조회수 정보가 제공됨.</caption>
						<colgroup>
							<col style={{width: "7.4%"}} />
							<col style={{width: "12%"}}/>
							<col />
							<col style={{width: "12%"}} />
							<col style={{width: "12%"}} />
							<col style={{width: "12%"}} />
							<col style={{width: "7.4 %"}} />
						</colgroup>
						<thead>
							<tr>
								<th scope="col" className="ac">번호</th>
								<th scope="col" className="ac">카테고리</th>
								<th scope="col" className="ac">제목</th>
								<th scope="col" className="ac">작성</th>
								<th scope="col" className="ac">처리상태</th>
								<th scope="col" className="ac">작성일</th>
								<th scope="col" className="ac">조회</th>
				            </tr>
						</thead>
						<tbody>
							<tr>
								<th scope="row" className="ac">
									<span>112</span>
								</th>
								<td className="ac"><span>비지니스지원단</span></td>
								<td>
									<a className="onellipsis-1" href="#">
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>홍*동</span></td>
								<td className="ac"><span>답변완료</span></td>
								<td className="ac"><span>2025-04-16</span></td>
								<td className="ac views"><span>4323</span></td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>112</span>
								</th>
								<td className="ac"><span>비지니스지원단</span></td>
								<td>
									<a className="onellipsis-1" href="#">
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>홍*동</span></td>
								<td className="ac"><span>답변완료</span></td>
								<td className="ac"><span>2025-04-16</span></td>
								<td className="ac views"><span>4323</span></td>
							</tr>
						</tbody>
			        </table>
				</div>
        {/* table [E] */}
		<Pagination /> 

		<div className="onboard-btm-btngroup btn-single bt-0">
            <div>
               <button type="button" className="krds-btn primary xlarge">
                문의하기
              </button>
            </div>
          </div>
      </div> 
    </>
  );
};

export default UI_USR_L_330;
