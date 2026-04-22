import React, { useMemo, useRef, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import Tab from '@components/ui/Tab';
import Datepicker from '@components/ui/Datepicker';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { formatNumberWithCommas } from '@utils/numberUtils.js';

const INTEREST_NOTICE_MOCK = Array.from({ length: 28 }, (_, index) => {
  const categoryList = ['지원사업', '사업공고', '정책금융', '정책정보'];
  const category = categoryList[index % categoryList.length];

  return {
    id: index + 1,
    category,
    createdAt: `2025-12-${String((index % 28) + 1).padStart(2, '0')} 16:${String((index * 3) % 60).padStart(2, '0')}`,
    title: `[${category}] 관심공고 샘플 제목 ${index + 1}`,
  };
});

const UI_USR_L_530 = () => {
  const tabData = useRef(['지원사업', '사업공고', '정책금융', '정책정보']);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [registeredIds, setRegisteredIds] = useState(() => new Set());

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const activeCategory = tabData.current[activeTabIndex];

  const filteredRows = useMemo(() => {
    const normalizedKeyword = appliedKeyword.trim();

    return INTEREST_NOTICE_MOCK.filter((row) => {
      const isSameCategory = row.category === activeCategory;
      const isKeywordMatched = !normalizedKeyword || row.title.includes(normalizedKeyword);
      return isSameCategory && isKeywordMatched;
    });
  }, [activeCategory, appliedKeyword]);

  const totalElements = filteredRows.length;
  const totalPages = Math.ceil(totalElements / pageSize);

  const pagedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, filteredRows]);

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setAppliedKeyword(searchKeyword);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleRegister = (id) => {
    setRegisteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
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
                id="datepicker_530_start"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
              <span>~</span>
              <Datepicker
                id="datepicker_530_end"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
              />
            </div>
            <div className="input-group-box">
              <label className="label" htmlFor="input_01">제목</label>
              <div className="sch-input">
                <input
                  type="text"
                  id="input_01"
                  className="krds-input medium"
                  placeholder="검색어를 입력하세요"
                  title="검색어 입력"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <button type="button" className="krds-btn medium icon ico-search" onClick={handleSearch}>
                  <span className="sr-only">검색</span>
                  <i className="svg-icon ico-sch"></i>
                </button>
              </div>
              <button type="button" className="krds-btn primary medium" onClick={handleSearch}>검색</button>
            </div>
          </div>
        </div>

        <div className="search-list-top mt-40">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>건</li>
          </ul>
          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
              <select
                className="krds-form-select-sort"
                id="search_result_count"
                value={String(pageSize)}
                onChange={handlePageSizeChange}
              >
                <option value="12">12개</option>
                <option value="9">9개</option>
              </select>
            </li>
          </ul>
        </div>

        <div className="krds-table-wrap">
          <table className="tbl col data t-block">
            <caption>관심 공고 검색결과 목록. 번호, 등록일시, 구분, 내용 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '7.4%' }} />
              <col style={{ width: '16.8%' }} />
              <col style={{ width: '9.8%' }} />
              <col />
              <col style={{ width: '22%' }} />
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
              {pagedRows.map((row, index) => {
                const isRegistered = registeredIds.has(row.id);
                return (
                  <tr key={row.id}>
                    <th scope="row" className="ac">
                      <span>{totalElements - ((currentPage - 1) * pageSize + index)}</span>
                    </th>
                    <td className="ac"><span>{row.createdAt}</span></td>
                    <td className="ac"><span>{row.category}</span></td>
                    <td>
                      <a className="onellipsis-1" href="#">
                        <span>{row.title}</span>
                      </a>
                    </td>
                    <td className="ac btn-flex">
                      <button
                        type="button"
                        onClick={() => toggleRegister(row.id)}
                        className={`krds-btn small width-auto ${isRegistered ? 'tertiary' : 'primary'}`}
                        aria-pressed={isRegistered}
                      >
                        {isRegistered ? '관심공고 해제' : '관심공고 등록'}
                      </button>
                      <button type="button" className="krds-btn small tertiary width-auto">삭제</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          syncUrl
        />
      </div>
    </>
  );
};

export default UI_USR_L_530;
