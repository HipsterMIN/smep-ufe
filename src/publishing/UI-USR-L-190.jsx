import React, { useRef, useState } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination";
import Tab from "../components/ui/Tab";

const UI_USR_L_190 = () => {
    const tabData = useRef(['전체', '전국', '수도권', '충청권', '전라권', '경상권', '강원권', '제주']);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
  
     const handleTabChange = (index) => {
      setActiveTabIndex(index);
    };

  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
      {
        depth2: "AI 스마트 통합 검색",
      },
      {
        depth2: "중소벤처기업부 지원사업 소개",
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
      },
    ],
  };

  const breadcrumbItems = [
    { label: "고객지원", link: "#" },
    { label: "고객센터", link: "#" },
    { label: "자주묻는질문", link: "#" },
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
          <h2 className="h-tit">행사정보</h2>
        </div>

        <div className="search-top-box">
          <div className="sch-form-wrap">
            <select className="krds-form-select">
              <option value="">행사명</option>
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

        <div className="mt-40">
          <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>
        </div>

        <div className="search-list-top">
           <ul className="sch-info" aria-live="polite">
               <li>
                  <button type="button" className="krds-btn medium text">
                    <i className="svg-icon ico-excel"></i> 다운로드
                  </button>
               </li>
               <li>
                  <button type="button" className="krds-btn medium text">
                    <i className="svg-icon ico-event-cal"></i> 지난 행사보기
                  </button>
               </li>
            </ul>
            <ul className="sch-sort">
              <li>
                <strong className="sort-label"><label for="sort">정렬기준</label></strong>
                <div className="w-sort-btn">
                  <button type="button" className="active">등록일순<span className="sr-only">선택됨</span></button>
                  <button type="button">마감일순</button>
                </div>
                <div className="m-sort-btn">
                  <select className="krds-form-select-sort" id="sort">
                    <option>등록일순</option>
                    <option>마감일수</option>
                  </select>
                </div>
              </li>
            </ul>
        </div>

        {/* table [S] */}
				 <div className="krds-table-wrap">
					<table className="tbl col data">
            <caption>행사정보 표. 번호, 지역, 제목, 행사기간, 수행기관, 작성일 조회수 정보가 제공됨.</caption>
						<colgroup>
							<col style={{width: "5%"}} />
							<col style={{width: "5%"}} />
							<col style={{width: "340px"}} />
							<col style={{width: "200px"}} />
							<col style={{width: "15%"}} />
							<col style={{width: "5%"}} />
							<col style={{width: "5%"}} />
						</colgroup>
						<thead>
							<tr>
								<th scope="col" className="ac">번호</th>
								<th scope="col" className="ac">지역</th>
								<th scope="col" className="ac">제목</th>
								<th scope="col" className="ac">행사기간</th>
								<th scope="col" className="ac">수행기관</th>
								<th scope="col" className="ac">작성일</th>
								<th scope="col" className="ac">조회수</th>
				            </tr>
						</thead>
						<tbody>
              {Array.from({ length: 10 }).map((_, index) => (
							<tr>
								<th scope="row" className="ac">
									<span>123</span>
								</th>
								<td className="ac"><span>대전</span></td>
								<td>
						 			<a href="#">
										<span>[경기ㆍ대전] 2026년 스마트 제조혁신 지원사업 사업설명회 추가 개최 안내</span>
									</a>
								</td>
								<td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
								<td className="ac"><span>스마트제조혁신추진단</span></td>
								<td className="ac"><span>2025.04.16</span></td>
								<td className="ac"><span>87</span></td>
							</tr>
              ))}
						  </tbody>
			        </table>
				</div>
        {/* table [E] */}

        <Pagination/>

      </div> 
    </>
  );
};

export default UI_USR_L_190;