import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import SearchListTop from '../components/ui/SearchListTop';
import Pagination from '../components/ui/Pagination.jsx';
import { api as apiClient } from '../lib/apiClient.js';
import { useUserMenu } from '../context/UserMenuContext';

const Pbanc = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [items, setItems] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('');

  const schFormWrapRef = useRef(null);

  const handleToggleFilter = () => {
    schFormWrapRef.current.classList.toggle('on');
  };

  const search = async (pageParam) => {
    const response = await apiClient.get(`/api/v1/pbanc?page=${pageParam}&searchText=${searchText}&searchType=${searchType}`);
    console.log(response.data);
    setItems(response.data.content);
    setTotalPages(response.data.totalPages);
    setTotalElements(response.data.totalElements);
    setPage(pageParam);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      search(1);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    search(1);
  }, []);

  function formatToYYMMDD(value) {
    if (!value) return '';

    let date;

    if (/^\d{8}$/.test(String(value))) {
      const str = String(value);
      const yyyy = str.slice(0, 4);
      const mm = str.slice(4, 6);
      const dd = str.slice(6, 8);
      date = new Date(`${yyyy}-${mm}-${dd}`);
    } else {
      date = new Date(value);
    }

    if (isNaN(date.getTime())) return '';

    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yy}-${mm}-${dd}`;
  }

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
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
            {/*<button type="button" className="krds-btn medium text" onClick={handleToggleFilter}>*/}
            {/*  <i className="svg-icon ico-sch-plus"></i>*/}
            {/*    상세검색*/}
            {/*  <span className="onfilter-open sr-only">열기</span>*/}
            {/*  <span className="onfilter-close sr-only">닫기</span>*/}
            {/*</button>*/}
          </div>
          {/*todo 상세검색 주석처리 ( 시연으로 인한 임시주석 )*/}
          {/*<div className="sch-filter-box">*/}
          {/*  <div className="filter-form">*/}
          {/*    <div>*/}
          {/*      <label className="label" htmlFor="appl-sch-sel1">분야</label>*/}
          {/*      <select id="appl-sch-sel1" className="krds-form-select medium">*/}
          {/*        <option value="">전체</option>*/}
          {/*        <option value="">항목</option>*/}
          {/*        <option value="">항목</option>*/}
          {/*      </select>*/}
          {/*    </div>*/}
          {/*    <div>*/}
          {/*      <label className="label" htmlFor="appl-sch-sel2">지역</label>*/}
          {/*      <select id="appl-sch-sel2" className="krds-form-select medium">*/}
          {/*        <option value="">전체</option>*/}
          {/*        <option value="">항목</option>*/}
          {/*        <option value="">항목</option>*/}
          {/*      </select>*/}
          {/*    </div>*/}
          {/*    <div>*/}
          {/*      <label className="label" htmlFor="appl-sch-sel3">기관별</label>*/}
          {/*      <select id="appl-sch-sel3" className="krds-form-select medium">*/}
          {/*        <option value="">전체</option>*/}
          {/*        <option value="">항목</option>*/}
          {/*        <option value="">항목</option>*/}
          {/*      </select>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*  <dl className="filter-chip">*/}
          {/*    <dt>선택된 필터 <span className="num">4</span></dt>*/}
          {/*    <dd>*/}
          {/*      <button type="button" className="krds-btn xlarge icon border">*/}
          {/*        <span className="sr-only">새로고침</span>*/}
          {/*        <i className="svg-icon ico-refresh"></i>*/}
          {/*      </button>*/}
          {/*      <div className="chip-wrap krds-tag-wrap large">*/}
          {/*        <span className="krds-btn-tag">*/}
          {/*          중앙부처 복지사업*/}
          {/*          <button type="button" className="btn-delete">*/}
          {/*            <span className="sr-only">삭제</span>*/}
          {/*          </button>*/}
          {/*        </span>*/}
          {/*        <span className="krds-btn-tag">*/}
          {/*          임신출산*/}
          {/*          <button type="button" className="btn-delete">*/}
          {/*            <span className="sr-only">삭제</span>*/}
          {/*          </button>*/}
          {/*        </span>*/}
          {/*        <span className="krds-btn-tag">*/}
          {/*          저소득*/}
          {/*          <button type="button" className="btn-delete">*/}
          {/*            <span className="sr-only">삭제</span>*/}
          {/*          </button>*/}
          {/*        </span>*/}
          {/*        <span className="krds-btn-tag">*/}
          {/*          맞춤형급여안내*/}
          {/*          <button type="button" className="btn-delete">*/}
          {/*            <span className="sr-only">삭제</span>*/}
          {/*          </button>*/}
          {/*        </span>*/}
          {/*      </div>*/}
          {/*    </dd>*/}
          {/*  </dl>*/}
          {/*</div>*/}
        </div>
        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">{(totalElements || 0).toLocaleString()}</span>개</li>
          </ul>
          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
              <div className="w-sort-btn">
                <button type="button" onClick="fnSearch('0')" className=" active">등록일순</button>
                <button type="button" onClick="fnSearch('1')">마감일순</button>
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
        <div className="krds-table-wrap">
          <table className="tbl col data">
            <caption>지원사업 공고표. 번호, 제목, 신청기간, 소관부처·지자체, 사업수행기관, 조회수 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '5%' }}/>
              <col/>
              <col style={{ width: '200px' }}/>
              <col style={{ width: '14%' }}/>
              <col style={{ width: '14%' }}/>
              <col style={{ width: '5%' }}/>
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
                  <td className="ac">
                    <span>
                      {item.aplybgngday ? formatToYYMMDD(item.aplybgngday) + ' ~ ' : ''}
                      {!item.aplyddlnday ? '예산소진시' : formatToYYMMDD(item.aplyddlnday)}
                    </span>
                  </td>
                  <td className="ac"><span className="onellipsis-1">{item.mngdeptnm}</span></td>
                  <td className="ac"><span className="onellipsis-1">{item.flfmtinst}</span></td>
                  <td className="ac"><span>28</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={(p) => search(p)}
          />
        </div>
      </div>
    </>
  );
};

export default Pbanc;
