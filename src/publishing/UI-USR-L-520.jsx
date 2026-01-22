import { useState } from 'react';
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Datepicker from "../components/ui/Datepicker";

const UI_USR_L_520 = () => {

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
          <h2 className="h-tit">지원사업 신청 현황</h2>
        </div>

        <p className="guide-txt">신청 진행중 지원사업이 있으신 경우, 해당 통합신청 페이지의 "과제신청내역조회" 버튼을 통해 이어서 신청하실 수 있습니다.</p>

        <div className="search-top-box no-details mt-40">
          <div className="form-row-box gap-12">
            <div className="select-box">
              <label className="label" htmlFor="select_01">사업구분</label>
              <select id="select_01" className="krds-form-select medium w-164">
                <option value="">지원분야별</option>
              </select>
            </div>
            <div className="select-box">
              <select className="krds-form-select medium" title="사업구분 선택">
                <option value="">전체</option>
              </select>
            </div>
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
          <div className="form-row-box gap-12">
            <div className="select-box">
              <label className="label" htmlFor="select_03">신청상태</label>
              <select id="select_03" className="krds-form-select medium ">
                <option value="">지원분야별</option>
              </select>
            </div>
            <div className="select-box">
              <label className="label" htmlFor="select_04">검색구분</label>
              <select id="select_04" className="krds-form-select medium w-164">
                <option value="">지원사업명</option>
              </select>
            </div>
            <div className="input-group-box">
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

        <div className="on-search-summary mt-40">
          <div className="summary-list">
             <div className="summary-item">
                <div className="summary-title"><span className="sr-only">신청현황:</span>전체</div>
                <div className="summary-result"><strong>0</strong>건</div>
             </div>
             <i className="svg-icon ico-angle right"></i>
             <div className="summary-item">
                <div className="summary-title"><span className="sr-only">신청현황:</span>신청중</div>
                <div className="summary-result"><strong>2</strong>건</div>
             </div>
             <i className="svg-icon ico-angle right"></i>
             <div className="summary-item">
                <div className="summary-title"><span className="sr-only">신청현황:</span>신청</div>
                <div className="summary-result"><strong>0</strong>건</div>
             </div>
          </div>
        </div>

        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">0</span>건</li>
          </ul>
          <ul className="sch-sort">
             <li>
                <strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
                <select className="krds-form-select-sort" id="search_result_count">
                  <option>10개</option>
                </select>
              </li>
          </ul>
          </div>

        {/* table [S] */}
        <div className="krds-table-wrap">
        <table className="tbl col data">
          <caption>나의 알림 목록 표. 번호, 발송일시, 구분, 내용 정보가 제공됨.</caption>
          <colgroup>
            <col />
          </colgroup>
          <tbody className="no-data">
            {/* 데이터 없을 시 */}
            <tr>
              <td colSpan={3} className="ac">등록된 데이터가 없습니다.</td>
            </tr>
          </tbody>
          </table>
        </div>
        {/* table [E] */}

      </div> 
    </>
  );
};

export default UI_USR_L_520;
