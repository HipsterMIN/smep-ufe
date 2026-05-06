import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import Tab from '@components/ui/Tab';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { formatEventRegionForList } from '@utils/stringUtils.js';

const AREA_TABS = [
  { label: '전체', value: 'ALL' },
  { label: '전국', value: 'METRO' },
  { label: '수도권', value: 'CAPITAL' },
  { label: '충청권', value: 'CHUNGCHEONG' },
  { label: '호남권', value: 'HONAM' },
  { label: '영남권', value: 'YEONGNAM' },
  { label: '강원권', value: 'GANGWON' },
  { label: '제주', value: 'JEJU' },
];

const SEARCH_OPTIONS = [
  { label: '전체', value: 'ALL' },
  { label: '행사명', value: 'TITLE' },
  { label: '수행기관', value: 'ORGANIZATION' },
  { label: '지역', value: 'AREA' },
  { label: '해시태그', value: 'HASHTAG' },
];

const formatDateDot = (value) => {
  if (!value) return '-';
  const text = String(value).trim();

  const ymd = text.match(/^(\d{4})[-./]?(\d{2})[-./]?(\d{2})$/);
  if (ymd) return `${ymd[1]}.${ymd[2]}.${ymd[3]}`;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const formatShortYmd = (value) => {
  if (!value) return '';
  const text = String(value).trim();
  const ymd = text.match(/^(\d{4})[-./]?(\d{2})[-./]?(\d{2})$/);
  if (ymd) return `${ymd[1].slice(2)}-${ymd[2]}-${ymd[3]}`;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatEventPeriod = (value) => {
  if (!value) return '-';
  const text = String(value).trim();
  if (!text) return '-';

  const parts = text.split('~').map((part) => part.trim());
  if (parts.length === 2) {
    return `${formatShortYmd(parts[0])} ~ ${formatShortYmd(parts[1])}`;
  }
  return formatShortYmd(text);
};

const UI_USR_L_190 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [searchType, setSearchType] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchType, setAppliedSearchType] = useState('ALL');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [sortType, setSortType] = useState('REG_DT');

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const selectedAreaGroup = AREA_TABS[activeTabIndex]?.value || 'ALL';

  useEffect(() => {
    let mounted = true;

    const fetchList = async () => {
      try {
        if (!mounted) return;
        setLoading(true);

        const params = new URLSearchParams({
          page: String(currentPage + 1),
          size: String(pageSize),
          sortType,
          areaGroup: selectedAreaGroup,
        });

        if (appliedSearchKeyword.trim()) {
          params.append('searchType', appliedSearchType);
          params.append('searchKeyword', appliedSearchKeyword.trim());
        }

        const response = await apiClient.get(`/api/v1/event-info?${params.toString()}`);
        const pageData = response?.data || response || {};
        if (!mounted) return;

        setList(Array.isArray(pageData.content) ? pageData.content : []);
        setTotalElements(pageData.totalElements || 0);
        setTotalPages(pageData.totalPages || 0);
      } catch (error) {
        if (!mounted) return;
        console.error('행사정보 목록 조회 실패:', error);
        setList([]);
        setTotalElements(0);
        setTotalPages(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchList();
    return () => {
      mounted = false;
    };
  }, [currentPage, pageSize, appliedSearchType, appliedSearchKeyword, sortType, selectedAreaGroup]);

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    setCurrentPage(0);
  };

  const handleSearch = () => {
    setAppliedSearchType(searchType);
    setAppliedSearchKeyword(searchKeyword);
    setCurrentPage(0);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') handleSearch();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
    window.scrollTo(0, 0);
  };

  const handleSortChange = (nextSortType) => {
    setSortType(nextSortType);
    setCurrentPage(0);
  };

  const getDisplayNo = (index) => {
    const calculated = totalElements - (currentPage * pageSize + index);
    return calculated > 0 ? calculated : index + 1;
  };

  const tabData = useMemo(() => AREA_TABS.map((tab) => tab.label), []);

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">행사정보</h2>
        </div>

        <div className="search-top-box">
          <div className="sch-form-wrap">
            <select
              className="krds-form-select medium"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
              {SEARCH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="sch-input">
              <input
                type="text"
                 className="krds-input medium"
                placeholder="검색어를 입력하세요"
                title="검색어 입력"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <button type="button" className="krds-btn medium icon ico-search" onClick={handleSearch}>
                <span className="sr-only">검색</span>
                <i className="svg-icon ico-sch"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-40">
          <Tab tabData={tabData} onTabChange={handleTabChange}></Tab>
        </div>

        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>
              검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>건
            </li>
          </ul>
          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
              <div className="w-sort-btn">
                <button
                  type="button"
                  className={sortType === 'REG_DT' ? 'active' : ''}
                  onClick={() => handleSortChange('REG_DT')}
                >
                  등록일순{sortType === 'REG_DT' && <span className="sr-only">선택됨</span>}
                </button>
                <button
                  type="button"
                  className={sortType === 'DEADLINE' ? 'active' : ''}
                  onClick={() => handleSortChange('DEADLINE')}
                >
                  마감일순{sortType === 'DEADLINE' && <span className="sr-only">선택됨</span>}
                </button>
              </div>
              <div className="m-sort-btn">
                <select
                  className="krds-form-select-sort"
                  id="sort"
                  value={sortType}
                  onChange={(event) => handleSortChange(event.target.value)}
                >
                  <option value="REG_DT">등록일순</option>
                  <option value="DEADLINE">마감일순</option>
                </select>
              </div>
            </li>
          </ul>
        </div>

        <div className="krds-table-wrap">
          <table className="tbl col data t-block">
            <caption>행사정보 목록 번호, 지역, 제목, 행사기간, 수행기관, 작성일, 조회수 정보가 제공됩니다.</caption>
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '5%' }} />
              <col />
              <col style={{ width: '220px' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '5%' }} />
              <col style={{ width: '5%' }} />
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
              {loading ? (
                <tr>
                  <td className="ac" colSpan={7}>
                    <span>로딩 중입니다.</span>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td className="ac" colSpan={7}>
                    <span>조회된 데이터가 없습니다.</span>
                  </td>
                </tr>
              ) : (
                list.map((item, index) => (
                  <tr key={item?.evntInfoId ?? `${item?.evntInfoTtlNm ?? 'event'}-${index}`}>
                    <th scope="row" className="ac">
                      <span>{getDisplayNo(index)}</span>
                    </th>
                    <td className="ac"><span>{formatEventRegionForList(item?.evntInfoRgnNm)}</span></td>
                    <td>
                      <Link className="onellipsis-1" to={`${item.evntInfoId}`}>
                        <span>{item?.evntInfoTtlNm || '-'}</span>
                      </Link>
                    </td>
                    <td className="ac"><span>{formatEventPeriod(item?.evntPrdCn || item?.rcptPrdCn)}</span></td>
                    <td className="ac"><span className="onellipsis-1">{item?.evntInfoFlfmtInstNm || '-'}</span></td>
                    <td className="ac views"><span>{formatDateDot(item?.regDt)}</span></td>
                    <td className="ac views"><span>{item?.inqCnt ?? 0}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 0 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage + 1}
            onPageChange={handlePageChange}
            syncUrl
          />
        )}
      </div>
    </>
  );
};

export default UI_USR_L_190;
