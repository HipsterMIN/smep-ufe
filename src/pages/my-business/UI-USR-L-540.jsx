import React, { useMemo, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import Datepicker from '@components/ui/Datepicker';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { formatNumberWithCommas } from '@utils/numberUtils.js';

const NOTICE_MOCK = Array.from({ length: 22 }, (_, index) => {
  const categoryList = ['사업공고', '지원사업', '정책금융', '정책정보'];
  const category = categoryList[index % categoryList.length];

  return {
    id: index + 1,
    category,
    sentAt: `2025-12-${String((index % 28) + 1).padStart(2, '0')} 10:${String((index * 5) % 60).padStart(2, '0')}`,
    title: `${category} 알림 샘플 ${index + 1}`,
  };
});

const UI_USR_L_540 = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const filteredRows = useMemo(() => {
    const normalizedKeyword = appliedKeyword.trim();

    return NOTICE_MOCK.filter((row) => {
      const isSameCategory = !selectedCategory || row.category === selectedCategory;
      const isKeywordMatched = !normalizedKeyword || row.title.includes(normalizedKeyword);
      return isSameCategory && isKeywordMatched;
    });
  }, [selectedCategory, appliedKeyword]);

  const totalElements = filteredRows.length;
  const totalPages = Math.ceil(totalElements / pageSize);

  const pagedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, filteredRows]);

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

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
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
                id="datepicker_540_start"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
              <span>~</span>
              <Datepicker
                id="datepicker_540_end"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
              />
            </div>
          </div>
          <div className="form-row-box">
            <div className="select-box">
              <label className="label" htmlFor="select_01">구분</label>
              <select
                id="select_01"
                className="krds-form-select medium "
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">전체</option>
                <option value="지원사업">지원사업</option>
                <option value="사업공고">사업공고</option>
                <option value="정책금융">정책금융</option>
                <option value="정책정보">정책정보</option>
              </select>
            </div>
            <div className="input-group-box">
              <label className="label" htmlFor="input_01">제목</label>
              <div className="sch-input">
                <input
                  type="text"
                  id="input_01"
                  className="krds-input medium"
                  placeholder="검색어를 입력해주세요."
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
            <caption>나의 알림 목록 표. 번호, 발송일시, 구분, 내용 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '7.4%' }} />
              <col style={{ width: '16.8%' }} />
              <col style={{ width: '9.8%' }} />
              <col />
              <col style={{ width: '13.6%' }} />
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
              {pagedRows.map((row, index) => (
                <tr key={row.id}>
                  <th scope="row" className="ac">
                    <span>{totalElements - ((currentPage - 1) * pageSize + index)}</span>
                  </th>
                  <td className="ac"><span>{row.sentAt}</span></td>
                  <td className="ac"><span>{row.category}</span></td>
                  <td>
                    <a className="onellipsis-1" href="#">
                      <span>{row.title}</span>
                    </a>
                  </td>
                  <td className="ac">
                    <button type="button" className="krds-btn small primary width-auto mo-full">자세히 보기</button>
                  </td>
                </tr>
              ))}
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

export default UI_USR_L_540;
