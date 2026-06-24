import React, { useEffect, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import Datepicker from '@components/ui/Datepicker';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { api as apiClient } from '@lib/apiClient.js';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  appendReturnUrlToPath,
  getNumberSearchParam,
  getSearchParam,
  setQueryParam,
} from '@utils/listNavigation.js';

const parseDateParam = (value) => {
  const text = String(value || '').trim();
  if (!text) return null;

  const date = new Date(`${text}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const UI_USR_L_540 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  // 검색 조건 (입력용)
  const [startDate, setStartDate] = useState(() => parseDateParam(getSearchParam(location.search, 'srchFrDt', '')));
  const [endDate, setEndDate] = useState(() => parseDateParam(getSearchParam(location.search, 'srchToDt', '')));
  const [selectedCategory, setSelectedCategory] = useState(() => getSearchParam(location.search, 'pbancTypeSeCd', ''));
  const [searchKeyword, setSearchKeyword] = useState(() => getSearchParam(location.search, 'srchTtl', ''));

  // 검색 조건 (전송용)
  const [appliedStartDate, setAppliedStartDate] = useState(() => parseDateParam(getSearchParam(location.search, 'srchFrDt', '')));
  const [appliedEndDate, setAppliedEndDate] = useState(() => parseDateParam(getSearchParam(location.search, 'srchToDt', '')));
  const [appliedCategory, setAppliedCategory] = useState(() => getSearchParam(location.search, 'pbancTypeSeCd', ''));
  const [appliedKeyword, setAppliedKeyword] = useState(() => getSearchParam(location.search, 'srchTtl', ''));

  // 목록 데이터
  const [notificationList, setNotificationList] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => getNumberSearchParam(location.search, 'page', 1));
  const [pageSize, setPageSize] = useState(() => getNumberSearchParam(location.search, 'size', 10));
  const [loading, setLoading] = useState(false);

  // Date → YYYY-MM-DD 포맷
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const buildListSearchParams = () => {
    const params = new URLSearchParams();
    setQueryParam(params, 'page', currentPage, 1);
    setQueryParam(params, 'size', pageSize, 10);
    setQueryParam(params, 'srchFrDt', formatDate(appliedStartDate));
    setQueryParam(params, 'srchToDt', formatDate(appliedEndDate));
    setQueryParam(params, 'pbancTypeSeCd', appliedCategory);
    setQueryParam(params, 'srchTtl', appliedKeyword);
    return params;
  };

  // LocalDateTime → 화면 표시용 포맷 (2025-12-11T10:04:00 → 2025-12-11 10:04)
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return dateTime.replace('T', ' ').substring(0, 16);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setSearchParams(buildListSearchParams(), { replace: true });

        const params = new URLSearchParams({
          page: currentPage,
          size: pageSize,
        });

        if (appliedStartDate) params.append('srchFrDt', formatDate(appliedStartDate));
        if (appliedEndDate) params.append('srchToDt', formatDate(appliedEndDate));
        if (appliedCategory) params.append('pbancTypeSeCd', appliedCategory);
        if (appliedKeyword?.trim()) params.append('srchTtl', appliedKeyword.trim());

        const response = await apiClient.get(`/api/v1/scrap/notifications?${params.toString()}`);
        const data = response.data;

        setNotificationList(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      } catch (error) {
        return null;
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, appliedStartDate, appliedEndDate, appliedCategory, appliedKeyword]);

  const handleSearch = () => {
    if (startDate && endDate && startDate > endDate) {
      alert('조회 종료일은 시작일보다 이후여야 합니다.');
      return;
    }
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedCategory(selectedCategory);
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

  // 자세히보기 - 공고 유형에 따라 라우팅
  const handleDetail = (item) => {
    if (item.pbancTypeSeCd === 'BIZP') {
      navigate(appendReturnUrlToPath(`/req/pbanc/${item.bizPbancNo}`, location));
    } else if (item.pbancTypeSeCd === 'PLCF') {
      navigate(appendReturnUrlToPath(`/req/UI_USR_L_030/${item.plcyFnncNo}`, location));
    }
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
                className="krds-form-select medium"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                <option value="">전체</option>
                <option value="BIZP">사업공고</option>
                <option value="PLCF">정책금융</option>
              </select>
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
                    if (event.key === 'Enter') handleSearch();
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
                <option value="10">10개</option>
                <option value="20">20개</option>
                <option value="30">30개</option>
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="ac">로딩 중...</td>
                </tr>
              ) : notificationList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="ac">조회된 데이터가 없습니다.</td>
                </tr>
              ) : (
                notificationList.map((item, index) => (
                  <tr key={`${item.pbancScrpSn}-${item.pbancScrpNtcSn}`}>
                    <th scope="row" className="ac">
                      <span>{totalElements - ((currentPage - 1) * pageSize + index)}</span>
                    </th>
                    <td className="ac">
                      <span>{formatDateTime(item.ntcDt)}</span>
                    </td>
                    <td className="ac">
                      <span>{item.pbancTypeSeNm}</span>
                    </td>
                    <td>
                      <span className="onellipsis-1">{item.gdPhrsCn}</span>
                    </td>
                    <td className="ac">
                      <button
                        type="button"
                        className="krds-btn small primary width-auto mo-full"
                        onClick={() => handleDetail(item)}
                      >
                            자세히 보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
