import React from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import SearchFormBox from "../components/ui/SearchFormBox";
import SearchListTop from "../components/ui/SearchListTop";

const UI_USR_L_020 = () => {
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
          <h2 className="h-tit">사업 공고</h2>
        </div>
        <SearchFormBox />
        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>
                <button type="button" className="krds-btn medium text">
                  <i className="svg-icon ico-excel"></i> 다운로드
                </button>
            </li>
          </ul>
          <ul className="sch-sort">
            <li>
            <strong className="sort-label"><label for="sort">정렬기준</label></strong>
              <div className="w-sort-btn">
                <button type="button" onclick="fnSearch('0')" className=" active">등록일순</button>
                <button type="button" onclick="fnSearch('1')">마감일순</button>
              </div>
              <div className="m-sort-btn">
                <select className="krds-form-select-sort" id="sort">
                <option value="0" selected="selected">등록일순</option>
                <option value="1">마감일순</option>
                </select>
              </div>
            </li>
          </ul>
        </div>
        {/* table [S] */}
				 <div className="krds-table-wrap">
					<table className="tbl col data">
            <caption>지원사업 공고표. 번호, 제목, 신청기간, 소관부처·지자체, 사업수행기관, 조회수 정보가 제공됨.</caption>
						<colgroup>
							<col style={{width: "5%"}} />
							<col />
							<col style={{width: "200px"}} />
							<col style={{width: "14%"}} />
							<col style={{width: "14%"}} />
							<col style={{width: "5%"}} />
						</colgroup>
						<thead>
							<tr>
								<th scope="col" className="ac">번호</th>
								<th scope="col" className="ac">제목</th>
								<th scope="col" className="ac">신청기간</th>
								<th scope="col" className="ac">소관부처·지자체</th>
								<th scope="col" className="ac">사업수행기관</th>
								<th scope="col" className="ac">조회수</th>
				            </tr>
						</thead>
						<tbody>
							<tr>
								<th scope="row" className="ac">
									<span>1444</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
									  <span className="krds-badge bg-light-primary">기술</span>
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
								<td className="ac"><span>보건복지부</span></td>
								<td className="ac"><span>한국부건산업진흥원</span></td>
								<td className="ac"><span>433</span></td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>1444</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
									  <span className="krds-badge bg-light-primary">기술</span>
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
								<td className="ac"><span>보건복지부</span></td>
								<td className="ac"><span>한국부건산업진흥원</span></td>
								<td className="ac"><span>433</span></td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>1444</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
									  <span className="krds-badge bg-light-primary">기술</span>
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
								<td className="ac"><span>보건복지부</span></td>
								<td className="ac"><span>한국부건산업진흥원</span></td>
								<td className="ac"><span>433</span></td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>1444</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
									  <span className="krds-badge bg-light-primary">기술</span>
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
								<td className="ac"><span>보건복지부</span></td>
								<td className="ac"><span>한국부건산업진흥원</span></td>
								<td className="ac"><span>433</span></td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>1444</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
									  <span className="krds-badge bg-light-primary">기술</span>
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
								<td className="ac"><span>보건복지부</span></td>
								<td className="ac"><span>한국부건산업진흥원</span></td>
								<td className="ac"><span>433</span></td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>1444</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
									  <span className="krds-badge bg-light-primary">기술</span>
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
								<td className="ac"><span>보건복지부</span></td>
								<td className="ac"><span>한국부건산업진흥원</span></td>
								<td className="ac"><span>433</span></td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>1444</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
									  <span className="krds-badge bg-light-primary">기술</span>
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
								<td className="ac"><span>보건복지부</span></td>
								<td className="ac"><span>한국부건산업진흥원</span></td>
								<td className="ac"><span>433</span></td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>1444</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
									  <span className="krds-badge bg-light-primary">기술</span>
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
								<td className="ac"><span>보건복지부</span></td>
								<td className="ac"><span>한국부건산업진흥원</span></td>
								<td className="ac"><span>433</span></td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>1444</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
									  <span className="krds-badge bg-light-primary">기술</span>
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
								<td className="ac"><span>보건복지부</span></td>
								<td className="ac"><span>한국부건산업진흥원</span></td>
								<td className="ac"><span>433</span></td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>1444</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
									  <span className="krds-badge bg-light-primary">기술</span>
										<span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
									</a>
								</td>
								<td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
								<td className="ac"><span>보건복지부</span></td>
								<td className="ac"><span>한국부건산업진흥원</span></td>
								<td className="ac"><span>433</span></td>
							</tr>
					
						</tbody>
			        </table>
				</div>
        {/* table [E] */}
      </div> 
    </>
  );
};

export default UI_USR_L_020;
