import { useState,useRef } from 'react';
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination";
import Datepicker from "../components/ui/Datepicker";

const UI_USR_L_530 = () => {

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

  // 조회기간 Datepicker start
  const [startDate, setStartDate] = useState(null);

  // 조회기간 Datepicker end
  const [endDate, setEndDate] = useState(null);

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">나의 알림</h2>
        </div>

        <p className="guide-txt">
         최근 1년 동안 받은 알림만 확인하실 수 있습니다. <br />
          알림을 받고자 하시면 마이페이지 &gt; 회원정보 에서 알림 수신에 동의해 주세요.
        </p>

        <div className="search-top-box no-details mt-40">
          <div className="form-row-box">
            <div className="datepicker-group">
              <Datepicker
                menuName="조회기간" 
                id="datepicker_01"
                selected={startDate} 
                onChange={(date) => setStartDate(date)} 
              />
              <span>~</span>
                <Datepicker
                id="datepicker_02"
                selected={endDate} 
                onChange={(date) => setEndDate(date)} 
              />
            </div>
          </div>
          <div className="form-row-box">
            <div className="select-box">
              <label className="label" htmlFor="select_01">구분</label>
              <select id="select_01" className="krds-form-select medium ">
                <option value="">지원분야별</option>
              </select>
            </div>
            <div className="input-group-box">
              <label className="label" htmlFor="input_01">제목</label>
              <div className="sch-input">
                <input type="text" id="input_01" className="krds-input medium" placeholder="검색어를 입력해주세요." title="검색어 입력" />
                <button type="button" className="krds-btn medium icon ico-search" >
                  <span className="sr-only">검색</span>
                  <i className="svg-icon ico-sch"></i>
                </button>
              </div>
              <button type="button" className="krds-btn primary medium">검색</button>
            </div>
          </div>
        </div>

        <div className="search-list-top mt-40">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">5</span>건</li>
          </ul>
          <ul className="sch-sort">
             <li>
                <strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
                <select className="krds-form-select-sort" id="search_result_count">
                  <option>12개</option>
                  <option>9개</option>
                </select>
              </li>
          </ul>
          </div>

        {/* table [S] */}
        <div className="krds-table-wrap">
        <table className="tbl col data">
          <caption>나의 알림 목록 표. 번호, 발송일시, 구분, 내용 정보가 제공됨.</caption>
          <colgroup>
            <col style={{width: "7.4%"}} />
            <col style={{width: "16.8%"}} />
            <col style={{width: "9.8%"}}/>
            <col  />
            <col style={{width: "13.6%"}} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="ac">번호</th>
              <th scope="col" className="ac">발송일시</th>
              <th scope="col" className="ac">구분</th>
              <th scope="col" className="ac">내용</th>
              <th scope="col" className="ac"></th>
            </tr> 
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="ac">
                <span>15</span>
              </th>
              <td className="ac"><span>2025-12-11 10:04</span></td>
              <td className="ac"><span>사업공고</span></td>
              <td>
                  <a className="onellipsis-1" href="#">
                    <span>스크랩한 공고( [경북] 2026년 구미국방벤처센터 협약기업 모집 공고 )의...</span>
                  </a>
              </td>
              <td className="ac">
                <button type="button" className="krds-btn small primary width-auto">자세히 보기</button>
              </td>
            </tr>
            </tbody>
            </table>
          </div>
          {/* table [E] */}

          <Pagination /> 

      </div> 
    </>
  );
};

export default UI_USR_L_530;
