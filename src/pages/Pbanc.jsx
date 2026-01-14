import React, {useEffect, useRef, useState} from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import SearchListTop from "../components/ui/SearchListTop";
import Table from "../components/ui/Table";
import axios from "axios";
import {Link} from "react-router-dom";
import Pagination from "../components/ui/Pagination.jsx";
import {api as apiClient} from "../lib/apiClient.js";

const Pbanc = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchType, setSearchType] = useState("");

  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
      {
        depth2: "AI 스마트 검색",
        active: true,
        depth3: [
          {
            label: "AI 스마트 검색",
            link: "/main-dev/ai-smart-search",
          },
        ],
      },
      {
        depth2: "중소벤처기업부 지원사업공고",
        active: true,
        depth3: [
          {
            label: "지원사업",
            link: "/main-dev/service/UI_USR_L_010",
          },
        ],

      },
      {
        depth2: "사업공고",
        active: true,
        depth3: [
          {
            label: "사업공고",
            link: "/main-dev/service/pbanc",
            active: true,
          },
        ],
      },
      {
        depth2: "정책금융",
        active: true,
        depth3: [
          {
            label: "정책금융안내",
            link: "/main-dev/service/UI_USR_L_030",
          },
        ],
      },
      {
        depth2: "증명서 발급",
        active: true,
        depth3: [
          {
            label: "증명서 발급",
            link: "/main-dev/service/UI_USR_L_040",
          },
        ],
      },
    ],
  };

  const breadcrumbItems = [
    { label: "신청·발급", link: "#" },
    { label: "사업공고", link: "#" },
    { label: "사업공고", link: "#" },
  ];

  const schFormWrapRef = useRef(null);

  const handleToggleFilter = () => {
    schFormWrapRef.current.classList.toggle('on');
  }

  const search = async (pageParam) => {
    // 검색 로직 구현
    /*const config = {
      method: 'GET',
      url: `http://localhost:8081/api/v1/pbanc`,
      params: {page: pageParam},
      headers: {
        'Content-Type': 'application/json'
      },
    };
    const response = await axios(config);*/
    const response = await apiClient.get(`/api/v1/pbanc?page=${pageParam}&searchText=${searchText}&searchType=${searchType}`);
    console.log(response);
    setItems(response);
    setPage(pageParam);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      search(1);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    search(1);
  }, []);

  function formatToYYMMDD(value) {
    if (!value) return "";

    let date;

    // YYYYMMDD (숫자 또는 문자열)
    if (/^\d{8}$/.test(String(value))) {
      const str = String(value);
      const yyyy = str.slice(0, 4);
      const mm = str.slice(4, 6);
      const dd = str.slice(6, 8);

      date = new Date(`${yyyy}-${mm}-${dd}`);
    }
    // ISO 형식 (2024-01-12T00:00:00)
    else {
      date = new Date(value);
    }

    // 유효성 체크
    if (isNaN(date.getTime())) return "";

    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yy}-${mm}-${dd}`;
  }

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems}/>
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">지원사업 공고</h2>
        </div>
        <div className="search-top-box">
          <div className="sch-form-wrap" ref={schFormWrapRef}>
            <select
                className="krds-form-select"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="">전체</option>
              <option value="pbancnm">공고명</option>
              <option value="flfmtinst">기관명</option>
            </select>
            <div className="sch-input">
              <input
                  type="text"
                  className="krds-input"
                  placeholder="공고명·기관명으로 검색하세요"
                  title="검색어 입력"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleKeyDown}
              />
              <button
                  type="button"
                  className="krds-btn medium icon ico-search"
                    onClick={() => search(1)}
              >
                <span className="sr-only">검색</span>
                <i className="svg-icon ico-sch"></i>
              </button>
            </div>
            <button type="button" className="krds-btn medium text" onClick={handleToggleFilter}><i
                className="svg-icon ico-sch-plus"></i>
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
        <SearchListTop/>
        <div className="krds-table-wrap">
          <table className="tbl col data">
            <caption>지원사업 공고표. 번호, 제목, 신청기간, 소관부처·지자체, 사업수행기관, 조회수 정보가 제공됨.</caption>
            <colgroup>
              <col style={{width: "5%"}}/>
              <col/>
              <col style={{width: "200px"}}/>
              <col style={{width: "14%"}}/>
              <col style={{width: "14%"}}/>
              <col style={{width: "5%"}}/>
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
            {items.map((item, index) => (
                <tr key={item.id || index}>
                  <th scope="row" className="ac">
                    <span>{(page - 1) * items.length + index + 1}</span>
                  </th>
                  <td>
                    <Link className="onellipsis-1" to={`${item.id}`}>
                      <span className="krds-badge bg-light-primary">{item.sprtfld}</span>
                      <span>{item.pbancnm}</span>
                    </Link>
                  </td>
                  <td className="ac"><span>{item.aplybgngday ?  formatToYYMMDD(item.aplybgngday)+" ~ " : "" }{!item.aplyddlnday ? ("예산소진시") : formatToYYMMDD(item.aplyddlnday)}</span></td>
                  <td className="ac"><span className="onellipsis-1" >{item.mngdeptnm}</span></td>
                  <td className="ac"><span className="onellipsis-1" >{item.flfmtinst}</span></td>
                  <td className="ac"><span>28</span></td>
                </tr>
            ))}
            </tbody>
          </table>
          <Pagination
              currentPage={page}
              onPageChange={(p) => search(p)}
          />
        </div>
      </div>
    </>
  );
};

export default Pbanc;
