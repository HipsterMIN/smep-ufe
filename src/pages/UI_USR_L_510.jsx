import React from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination";

const UI_USR_L_010 = () => {
  const navigationData = {
    depth1Title: "마이비즈니스",
    depth: [
       {
        depth2: "나의 대시보드",
        active: true,
        depth3: [
          {
            label: "AI맞춤추천공고",
            link: "/",
          },
           {
            label: "증명서 발급 조회",
            link: "/",
            active: true
          },
           {
            label: "지원사업 신청 현황",
            link: "/",
          },
        ],
      },
      {
        depth2: "회원정보관리",
      },
     
      {
        depth2: "사업공고",
      },
      {
        depth2: "기업정보관리",
      },
      {
        depth2: "서비스 이용이력",
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
          <h2 className="h-tit">증명서 발급 조회</h2>
        </div>
        <div className="txt-box">
            <p className="outline-txt">
              증명(확인)서는 발급완료 후 하루 동안 출력할 수 있으며, 익일 이후에는 다시 발급신청을 하셔야 출력 가능합니다.<br />
              (발급이후 변경 승인된 경우 발급으로부터 24시간 동안은 변경 이전 내용으로 동일하게 발급되며 24시간 이후 변경된 내용으로 발급 가능합니다.)<br />
              모바일에서는 PDF파일 다운로드 방식만 지원되므로, 인쇄를 원하실 경우 PC로 접속하여 증명서 출력을 진행해 주시기 바랍니다.<br /><br />
              발급된 전자증명서는 정부전자문서지갑에서 확인이 가능합니다.<br />
              · 개인사업자회원: 전자증명서를 발급한 담당자의 개인 정부전자문서지갑에서 확인<br />
              · 법인사업자회원: 법인사업자용 정부전자문서지갑(<a className="on-linktxt2" href="https://dpaper.kr/" target="_blank" title="새 창 열림">dpaper.kr</a>)에서 확인
            </p>
        </div>

         <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">24</span>개</li>
          </ul>
          <ul className="sch-sort">
             <li>
              <strong className="sort-label"><label for="sort1">출력</label></strong>
              <div>
                <select className="krds-form-select-sort" id="sort1">
                  <option>전체</option>
                </select>
              </div>
            </li>
            <li>
              <strong className="sort-label"><label for="sort2">정렬기준</label></strong>
              <div className="w-sort-btn">
                <button type="button" className="active">등록일순<span className="sr-only">선택됨</span></button>
                <button type="button">마감일순</button>
              </div>
              <div className="m-sort-btn">
                <select className="krds-form-select-sort" id="sort2">
                  <option>등록일순</option>
                  <option>마감일수</option>
                </select>
              </div>
            </li>
          </ul>
        </div>
        {/* table component start */}
        <div className="krds-table-wrap">
					<table className="tbl col data">
            <caption>증명서 발급 조회 표. 순번, 증명(확인)서, 사업자등록번호, 신청일자, 유효기간, 상태, 출력언어, 발급 정보가 제공됨.</caption>
						<colgroup>
							<col style={{width: "5%"}} />
							<col />
							<col  style={{width: "100px"}}/>
							<col />
							<col />
							<col style={{width: "100px"}}/>
							<col style={{width: "130px"}}/>
							<col />
							<col />
						</colgroup>
						<thead>
							<tr>
								<th scope="col" className="ac">순번</th>
								<th scope="col" className="ac">증명(확인)서</th>
								<th scope="col" className="ac">사업자등록번호</th>
								<th scope="col" className="ac">신청일자</th>
								<th scope="col" className="ac">유효기간</th>
								<th scope="col" className="ac">상태</th>
								<th scope="col" className="ac">출력언어</th>
								<th scope="col" className="ac">발급</th>
				      </tr>
						</thead>
						<tbody>
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
										<span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									</a>
								</td>
								<td className="ac"><span>1002030000</span></td>
								<td className="ac"><span>2025.11.14 09:11:04</span></td>
								<td className="ac"><span>2026.11.13</span></td>
								<td className="ac"><span>발급 성공</span></td>
								<td className="ac">
                  <select class="krds-form-select small"><option value="">한국어</option><option value="">항목</option><option value="">항목</option></select>
                </td>
								<td className="ac">
                  <button type="button" class="krds-btn small">출력</button>
                </td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
										<span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									</a>
								</td>
								<td className="ac"><span>1002030000</span></td>
								<td className="ac"><span>2025.11.14 09:11:04</span></td>
								<td className="ac"><span>2026.11.13</span></td>
								<td className="ac"><span>발급 성공</span></td>
								<td className="ac">
                  <select class="krds-form-select small"><option value="">한국어</option><option value="">항목</option><option value="">항목</option></select>
                </td>
								<td className="ac">
                  <button type="button" class="krds-btn small" disabled>출력불가</button>
                </td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
										<span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									</a>
								</td>
								<td className="ac"><span>1002030000</span></td>
								<td className="ac"><span>2025.11.14 09:11:04</span></td>
								<td className="ac"><span>2026.11.13</span></td>
								<td className="ac"><span>발급 성공</span></td>
								<td className="ac">
                  <select class="krds-form-select small"><option value="">한국어</option><option value="">항목</option><option value="">항목</option></select>
                </td>
								<td className="ac">
                  <button type="button" class="krds-btn small" disabled>출력불가</button>
                </td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
										<span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									</a>
								</td>
								<td className="ac"><span>1002030000</span></td>
								<td className="ac"><span>2025.11.14 09:11:04</span></td>
								<td className="ac"><span>2026.11.13</span></td>
								<td className="ac"><span>발급 성공</span></td>
								<td className="ac">
                  <select class="krds-form-select small"><option value="">한국어</option><option value="">항목</option><option value="">항목</option></select>
                </td>
								<td className="ac">
                  <button type="button" class="krds-btn small" disabled>출력불가</button>
                </td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
										<span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									</a>
								</td>
								<td className="ac"><span>1002030000</span></td>
								<td className="ac"><span>2025.11.14 09:11:04</span></td>
								<td className="ac"><span>2026.11.13</span></td>
								<td className="ac"><span>발급 성공</span></td>
								<td className="ac">
                  <select class="krds-form-select small"><option value="">한국어</option><option value="">항목</option><option value="">항목</option></select>
                </td>
								<td className="ac">
                  <button type="button" class="krds-btn small" disabled>출력불가</button>
                </td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
										<span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									</a>
								</td>
								<td className="ac"><span>1002030000</span></td>
								<td className="ac"><span>2025.11.14 09:11:04</span></td>
								<td className="ac"><span>2026.11.13</span></td>
								<td className="ac"><span>발급 성공</span></td>
								<td className="ac">
                  <select class="krds-form-select small"><option value="">한국어</option><option value="">항목</option><option value="">항목</option></select>
                </td>
								<td className="ac">
                  <button type="button" class="krds-btn small" disabled>출력불가</button>
                </td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
										<span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									</a>
								</td>
								<td className="ac"><span>1002030000</span></td>
								<td className="ac"><span>2025.11.14 09:11:04</span></td>
								<td className="ac"><span>2026.11.13</span></td>
								<td className="ac"><span>발급 성공</span></td>
								<td className="ac">
                  <select class="krds-form-select small"><option value="">한국어</option><option value="">항목</option><option value="">항목</option></select>
                </td>
								<td className="ac">
                  <button type="button" class="krds-btn small" disabled>출력불가</button>
                </td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
										<span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									</a>
								</td>
								<td className="ac"><span>1002030000</span></td>
								<td className="ac"><span>2025.11.14 09:11:04</span></td>
								<td className="ac"><span>2026.11.13</span></td>
								<td className="ac"><span>발급 성공</span></td>
								<td className="ac">
                  <select class="krds-form-select small"><option value="">한국어</option><option value="">항목</option><option value="">항목</option></select>
                </td>
								<td className="ac">
                  <button type="button" class="krds-btn small" disabled>출력불가</button>
                </td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
										<span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									</a>
								</td>
								<td className="ac"><span>1002030000</span></td>
								<td className="ac"><span>2025.11.14 09:11:04</span></td>
								<td className="ac"><span>2026.11.13</span></td>
								<td className="ac"><span>발급 성공</span></td>
								<td className="ac">
                  <select class="krds-form-select small"><option value="">한국어</option><option value="">항목</option><option value="">항목</option></select>
                </td>
								<td className="ac">
                  <button type="button" class="krds-btn small" disabled>출력불가</button>
                </td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
										<span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									</a>
								</td>
								<td className="ac"><span>1002030000</span></td>
								<td className="ac"><span>2025.11.14 09:11:04</span></td>
								<td className="ac"><span>2026.11.13</span></td>
								<td className="ac"><span>발급 성공</span></td>
								<td className="ac">
                  <select class="krds-form-select small"><option value="">한국어</option><option value="">항목</option><option value="">항목</option></select>
                </td>
								<td className="ac">
                  <button type="button" class="krds-btn small" disabled>출력불가</button>
                </td>
							</tr>
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td>
						 			<a className="onellipsis-1" href="#">
										<span>미래성과공유기업확미래성과공유기업확미래성과공유기업확미래성과공유기업확</span>
									</a>
								</td>
								<td className="ac"><span>1002030000</span></td>
								<td className="ac"><span>2025.11.14 09:11:04</span></td>
								<td className="ac"><span>2026.11.13</span></td>
								<td className="ac"><span>발급 성공</span></td>
								<td className="ac">
                  <select class="krds-form-select small"><option value="">한국어</option><option value="">항목</option><option value="">항목</option></select>
                </td>
								<td className="ac">
                  <button type="button" class="krds-btn small" disabled>출력불가</button>
                </td>
							</tr>
						</tbody>
			    </table>
          <Pagination /> 
				</div>
        {/* table component end */}
      </div> 
    </>
  );
};

export default UI_USR_L_010;
