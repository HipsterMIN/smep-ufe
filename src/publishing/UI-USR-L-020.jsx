import React, { useRef } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from '../components/ui/Pagination.jsx';

const UI_USR_L_020 = () => {
	const schFormWrapRef = useRef(null);
 	const handleToggleFilter = () => {
    schFormWrapRef.current.classList.toggle('on');
  }

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
				<div className="search-top-box">
				<div className="sch-form-wrap" ref={schFormWrapRef}>
					<select className="krds-form-select" aria-label="검색구분 선택"> {/* 기술진단보고서 반영 */}
						<option value="">전체</option>
						<option value="">항목</option>
						<option value="">항목</option>
					</select>
					<div className="sch-input">
						<input type="text" className="krds-input" placeholder="공고명·사업명·기관명으로 검색하세요" title="검색어 입력" />
						<button type="button" className="krds-btn medium icon ico-search" >
							<span className="sr-only">검색</span>
							<i className="svg-icon ico-sch"></i>
						</button>
					</div>
					<button type="button" className="krds-btn medium text" onClick={handleToggleFilter}><i className="svg-icon ico-sch-plus"></i>
						상세검색
						<span className="onfilter-open sr-only">열기</span>
						<span className="onfilter-close sr-only">닫기</span>
					</button>
				</div>
				<div className="sch-filter-box">
					<div className="filter-form">
						<div>
							<label className="label" htmlFor="appl-sch-sel1">분야</label>
							<select id="appl-sch-sel1" className="krds-form-select medium">
								<option value="">전체</option>
								<option value="">항목</option>
								<option value="">항목</option>
							</select>
						</div>
						<div>
							<label className="label" htmlFor="appl-sch-sel2">지역</label>
							<select id="appl-sch-sel2" className="krds-form-select medium">
								<option value="">전체</option>
								<option value="">항목</option>
								<option value="">항목</option>
							</select>
						</div>
						<div>
							<label className="label" htmlFor="appl-sch-sel3">기관별</label>
							<select id="appl-sch-sel3" className="krds-form-select medium">
								<option value="">전체</option>
								<option value="">항목</option>
								<option value="">항목</option>
							</select>
						</div>
					</div>
					<dl className="filter-chip">
						<dt>선택된 필터 <span className="num">4</span></dt>
						<dd>
							<button type="button" className="krds-btn xlarge icon border">
								<span className="sr-only">새로고침</span>
								<i className="svg-icon ico-refresh"></i>
							</button>
							<div className="chip-wrap krds-tag-wrap large">
								<span className="krds-btn-tag">
									중앙부처 복지사업
									<button type="button" className="btn-delete">
										<span className="sr-only">삭제</span>
									</button>
								</span>
								<span className="krds-btn-tag">
									임신출산
									<button type="button" className="btn-delete">
										<span className="sr-only">삭제</span>
									</button>
								</span>
								<span className="krds-btn-tag">
									저소득
									<button type="button" className="btn-delete">
										<span className="sr-only">삭제</span>
									</button>
								</span>
								<span className="krds-btn-tag">
									맞춤형급여안내
									<button type="button" className="btn-delete">
										<span className="sr-only">삭제</span>
									</button>
								</span>
							</div>
						</dd>
					</dl>
				</div>
			</div>
        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
						<li>검색 결과 <span className="point">24</span>개</li>
					</ul>
          <button className="sch-ico-box">
            <i className="svg-icon ico-excel"/>
            <span className="">다운로드</span>
          </button>
          <ul className="sch-sort">
            <li>
            <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
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
          <table className="tbl col data t-block">
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
                  <div className="badge-txt-box">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span className="krds-badge bg-primary number">D-234</span>
                  </div>
                  <a className="onellipsis-1" href="#">
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac views"><span>433</span></td>
              </tr>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <div className="badge-txt-box">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span className="krds-badge bg-primary number">D-234</span>
                  </div>
                  <a className="onellipsis-1" href="#">
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac views"><span>433</span></td>
              </tr>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <div className="badge-txt-box">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span className="krds-badge bg-primary number">D-234</span>
                  </div>
                  <a className="onellipsis-1" href="#">
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac views"><span>433</span></td>
              </tr>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <div className="badge-txt-box">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span className="krds-badge bg-primary number">D-234</span>
                  </div>
                  <a className="onellipsis-1" href="#">
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac views"><span>433</span></td>
              </tr>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <div className="badge-txt-box">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span className="krds-badge bg-primary number">D-234</span>
                  </div>
                  <a className="onellipsis-1" href="#">
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac views"><span>433</span></td>
              </tr>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <div className="badge-txt-box">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span className="krds-badge bg-primary number">D-234</span>
                  </div>
                  <a className="onellipsis-1" href="#">
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac views"><span>433</span></td>
              </tr>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <div className="badge-txt-box">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span className="krds-badge bg-primary number">D-234</span>
                  </div>
                  <a className="onellipsis-1" href="#">
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac views"><span>433</span></td>
              </tr>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <div className="badge-txt-box">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span className="krds-badge bg-primary number">D-234</span>
                  </div>
                  <a className="onellipsis-1" href="#">
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac views"><span>433</span></td>
              </tr>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <div className="badge-txt-box">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span className="krds-badge bg-primary number">D-234</span>
                  </div>
                  <a className="onellipsis-1" href="#">
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac views"><span>433</span></td>
              </tr>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <div className="badge-txt-box">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span className="krds-badge bg-primary number">D-234</span>
                  </div>
                  <a className="onellipsis-1" href="#">
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac views"><span>433</span></td>
              </tr>
          
            </tbody>
          </table>
          </div>

          <Pagination />
        {/* table [E] */}
      </div> 
    </>
  );
};

export default UI_USR_L_020;
