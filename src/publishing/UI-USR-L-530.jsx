import { useState,useRef } from 'react';
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination";
import Tab from "../components/ui/Tab";
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

  const tabData = useRef(['지원사업', '사업공고', '정책금융', '정책정보' ]);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
    
  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };

  // 조회기간 Datepicker start
  const [startDate, setStartDate] = useState(null);

  // 조회기간 Datepicker end
  const [endDate, setEndDate] = useState(null);

  // 관심 공고 등록 toggle
  const [isRegister, setIsRegister] = useState(false); // 초기값: 미등록(false)

  const toggleRegister = () => {
    setIsRegister(!isRegister); 
  };
  
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
            관심광고
          </h2>
        </div>

        <p className="guide-txt">
         중소벤처기업부의 지원사업 및 정책금융에 대한 관심공고(상품)을 조회할 수 있습니다.
        </p>

        <div className="mt-40">
          <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>
        </div>

        <div className="search-top-box no-details mt-40">
          <div className="form-row-box">
              <div className="datepicker-group">
                <Datepicker
                  menuName="조회기간" 
                  id="datepicker"
                  selected={startDate} 
                  onChange={(date) => setStartDate(date)} 
                />
                <span>~</span>
                 <Datepicker
                  id="datepicker"
                  selected={endDate} 
                  onChange={(date) => setEndDate(date)} 
                />
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
        <table className="tbl col data t-block">
          <caption>관심 공고 검색결과 목록. 번호, 등록일시, 구분, 내용 정보가 제공됨.</caption>
          <colgroup>
            <col style={{width: "7.4%"}} />
            <col style={{width: "16.8%"}} />
            <col style={{width: "9.8%"}}/>
            <col  />
            <col style={{width: "22%"}} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="ac">번호</th>
              <th scope="col" className="ac">등록일시</th>
              <th scope="col" className="ac">구분</th>
              <th scope="col" className="ac">내용</th>
              <th scope="col" className="ac">관리</th>
            </tr> 
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="ac">
                <span>15</span>
              </th>
              <td className="ac"><span>2025-12-17 16:16</span></td>
              <td className="ac"><span>지원사업</span></td>
              <td>
                  <a className="onellipsis-1" href="#">
                    <span>[경북] 안동시 2025년 1차 북부권 친환경 섬유산업 육성...</span>
                  </a>
              </td>
              <td className="ac btn-flex">
                  <button
                    type="button"
                    onClick={toggleRegister}
                    className={`krds-btn small width-auto ${isRegister ? 'primary' : 'tertiary'}`}
                    aria-pressed={isRegister} // 접근성
                  >
                    {isRegister ? '관심공고 등록' : '관심공고 해제'}
                  </button>
                  <button type="button" className="krds-btn small tertiary width-auto">삭제</button>
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
