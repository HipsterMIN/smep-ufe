import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useMatches, useSearchParams } from 'react-router-dom';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import Pagination from '../components/ui/Pagination.jsx';
import { api as apiClient } from '../lib/apiClient.js';
import { fetchAndConvertCommonCodes } from '../utils/commonCodeUtils.js';
import { formatNumberWithCommas } from '../utils/numberUtils.js';
import { appendListSearchToPath, getNumberSearchParam, getSearchParam, setQueryParam } from '../utils/listNavigation.js';
import { useUserMenu } from '../context/UserMenuContext';

const DEFAULT_SIZE = 10;
const DEFAULT_SORT = 'REG';
const BIZ_PBANC_CLSF_GROUP_ID = 'BIZ_PBANC_CLSF_CD';

const Pbanc = () => {
  const matches = useMatches();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const { breadcrumbItems, currentMenu, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [items, setItems] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(() => getNumberSearchParam(location.search, 'page', 1));
  const [bizFieldOptions, setBizFieldOptions] = useState([]);

  const [searchText, setSearchText] = useState(() => getSearchParam(location.search, 'searchText', ''));
  const [searchType, setSearchType] = useState(() => getSearchParam(location.search, 'searchType', ''));
  const [bizPbancClsfCd, setBizPbancClsfCd] = useState(() => getSearchParam(location.search, 'bizPbancClsfCd', ''));
  const [applyStatus, setApplyStatus] = useState(() => getSearchParam(location.search, 'applyStatus', 'AVAILABLE'));
  const [size, setSize] = useState(() => getNumberSearchParam(location.search, 'size', DEFAULT_SIZE));
  const [sortType, setSortType] = useState(() => getSearchParam(location.search, 'sortType', DEFAULT_SORT));

  const schFormWrapRef = useRef(null);
  const latestRequestIdRef = useRef(0);
  const skipInitialSortEffectRef = useRef(true);
  const bizPbancTypeCd = currentMenu?.menuId === 'M_PIIO_00091' ? 'HSSPLY' : 'BIZPBN';

  const fieldLabelMap = useMemo(
    () => Object.fromEntries(bizFieldOptions.map((option) => [option.value, option.label])),
    [bizFieldOptions],
  );

  const handleToggleFilter = () => {
    schFormWrapRef.current?.classList.toggle('on');
  };

  const buildParams = useCallback(
    (pageParam, overrides = {}) => {
      const params = new URLSearchParams();
      const nextSearchText = overrides.searchText ?? searchText;
      const nextSearchType = overrides.searchType ?? searchType;
      const nextBizPbancClsfCd = overrides.bizPbancClsfCd ?? bizPbancClsfCd;
      const nextApplyStatus = overrides.applyStatus ?? applyStatus;
      const nextSize = overrides.size ?? size;
      const nextSortType = overrides.sortType ?? sortType;

      params.set('page', String(pageParam));
      params.set('size', String(nextSize));
      params.set('sortType', nextSortType);
      params.set('bizPbancTypeCd', bizPbancTypeCd);

      if (nextSearchText.trim()) params.set('searchText', nextSearchText.trim());
      if (nextSearchType) params.set('searchType', nextSearchType);
      if (nextBizPbancClsfCd) params.set('bizPbancClsfCd', nextBizPbancClsfCd);
      if (nextApplyStatus) params.set('applyStatus', nextApplyStatus);

      return params.toString();
    },
    [applyStatus, bizPbancClsfCd, bizPbancTypeCd, searchText, searchType, size, sortType],
  );

  const buildListSearchParams = useCallback((pageParam, overrides = {}) => {
    const params = new URLSearchParams();
    const nextSearchText = overrides.searchText ?? searchText;
    const nextSearchType = overrides.searchType ?? searchType;
    const nextBizPbancClsfCd = overrides.bizPbancClsfCd ?? bizPbancClsfCd;
    const nextApplyStatus = overrides.applyStatus ?? applyStatus;
    const nextSize = overrides.size ?? size;
    const nextSortType = overrides.sortType ?? sortType;

    setQueryParam(params, 'page', pageParam, 1);
    setQueryParam(params, 'size', nextSize, DEFAULT_SIZE);
    setQueryParam(params, 'sortType', nextSortType, DEFAULT_SORT);
    setQueryParam(params, 'searchText', nextSearchText);
    setQueryParam(params, 'searchType', nextSearchType);
    setQueryParam(params, 'bizPbancClsfCd', nextBizPbancClsfCd);
    if (nextApplyStatus === 'AVAILABLE') {
      params.delete('applyStatus');
    } else {
      params.set('applyStatus', nextApplyStatus);
    }

    return params;
  }, [applyStatus, bizPbancClsfCd, searchText, searchType, size, sortType]);

  const getQueryState = useCallback(() => ({
    page: getNumberSearchParam(location.search, 'page', 1),
    searchText: getSearchParam(location.search, 'searchText', ''),
    searchType: getSearchParam(location.search, 'searchType', ''),
    bizPbancClsfCd: getSearchParam(location.search, 'bizPbancClsfCd', ''),
    applyStatus: getSearchParam(location.search, 'applyStatus', 'AVAILABLE'),
    size: getNumberSearchParam(location.search, 'size', DEFAULT_SIZE),
    sortType: getSearchParam(location.search, 'sortType', DEFAULT_SORT),
  }), [location.search]);

  const search = useCallback(
    async (pageParam = 1, overrides = {}) => {
      const requestId = ++latestRequestIdRef.current;
      const data = await apiClient.get(`/api/v1/pbanc?${buildParams(pageParam, overrides)}`);
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      const pageData = data?.data || data;
      setItems(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      setPage(pageParam);
      setSearchParams(buildListSearchParams(pageParam, overrides), { replace: true });
    },
    [buildListSearchParams, buildParams, setSearchParams],
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') search(1);
  };

  const handleBizFieldChange = (nextBizPbancClsfCd) => {
    setBizPbancClsfCd(nextBizPbancClsfCd);
    search(1, { bizPbancClsfCd: nextBizPbancClsfCd });
  };

  const handleApplyStatusChange = (nextApplyStatus) => {
    setApplyStatus(nextApplyStatus);
    search(1, { applyStatus: nextApplyStatus });
  };

  useEffect(() => {
    const queryState = getQueryState();
    window.scrollTo(0, 0);
    setSearchText(queryState.searchText);
    setSearchType(queryState.searchType);
    setBizPbancClsfCd(queryState.bizPbancClsfCd);
    setApplyStatus(queryState.applyStatus);
    setSize(queryState.size);
    setSortType(queryState.sortType);

    search(queryState.page, queryState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMenu?.menuId]);

  useEffect(() => {
    let mounted = true;

    const loadCommonCodes = async () => {
      try {
        const commonCodes = await fetchAndConvertCommonCodes([BIZ_PBANC_CLSF_GROUP_ID]);
        if (!mounted) {
          return;
        }

        setBizFieldOptions(commonCodes[BIZ_PBANC_CLSF_GROUP_ID] || []);
      } catch (error) {
        console.error('공통코드 조회 실패:', error);
        if (mounted) {
          setBizFieldOptions([]);
        }
      }
    };

    loadCommonCodes();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (skipInitialSortEffectRef.current) {
      skipInitialSortEffectRef.current = false;
      return;
    }

    search(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, sortType]);

  function formatToYYMMDD(value) {
    if (!value || !/^\d{8}$/.test(String(value))) return '';
    const str = String(value);
    return `${str.slice(2, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const pageTitle = [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '사업 공고';

  const getSortButtonClassName = (value) => (sortType === value ? 'active' : '');
  const hasDetailedSearchInput = Boolean(bizPbancClsfCd) || applyStatus !== 'AVAILABLE';

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">{pageTitle}</h2>
        </div>

        <div className="search-top-box">
          <div className="sch-form-wrap" ref={schFormWrapRef}>
            <select className="krds-form-select medium" aria-label="검색구분 선택" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="">전체</option>
              <option value="pbancnm">공고명</option>
              <option value="sprvsnInstNm">사업수행기관</option>
            </select>
            <div className="sch-input">
              <input
                type="text"
                className="krds-input medium"
                placeholder="공고명, 사업수행기관으로 검색해 주세요."
                title="검색어 입력"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button type="button" className="krds-btn medium icon ico-search" onClick={() => search(1)}>
                <span className="sr-only">검색</span>
                <i className="svg-icon ico-sch"></i>
              </button>
            </div>
            <button
              type="button"
              className={`krds-btn small text${hasDetailedSearchInput ? ' primary' : ''}`}
              onClick={handleToggleFilter}
            >
              <i className="svg-icon ico-sch-plus"></i>
              상세검색
              <span className="onfilter-open sr-only">열기</span>
              <span className="onfilter-close sr-only">닫기</span>
            </button>
          </div>

          <div className="sch-filter-box">
            <div className="filter-form">
              <div>
                <label className="label" htmlFor="appl-sch-sel1">분야</label>
                <select
                  id="appl-sch-sel1"
                  className="krds-form-select small"
                  value={bizPbancClsfCd}
                  onChange={(e) => handleBizFieldChange(e.target.value)}
                >
                  <option value="">전체</option>
                  {bizFieldOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="appl-sch-sel2">신청</label>
                <select
                  id="appl-sch-sel2"
                  className="krds-form-select small"
                  value={applyStatus}
                  onChange={(e) => handleApplyStatusChange(e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="AVAILABLE">신청가능</option>
                  <option value="PLANNED">진행예정</option>
                  <option value="CLOSED">신청마감</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>개</li>
          </ul>
          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
              <select
                className="krds-form-select-sort"
                id="search_result_count"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                <option value={10}>10개</option>
                <option value={20}>20개</option>
                <option value={30}>30개</option>
                <option value={40}>40개</option>
                <option value={50}>50개</option>
              </select>
            </li>
            <li>
              <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
              <div className="w-sort-btn">
                <button type="button" className={getSortButtonClassName('REG')} onClick={() => setSortType('REG')}>등록일순</button>
                <button type="button" className={getSortButtonClassName('DEADLINE')} onClick={() => setSortType('DEADLINE')}>마감일순</button>
                <button type="button" className={getSortButtonClassName('VIEW')} onClick={() => setSortType('VIEW')}>조회순</button>
              </div>
              <div className="m-sort-btn">
                <select className="krds-form-select-sort" id="sort" value={sortType} onChange={(e) => setSortType(e.target.value)}>
                  <option value="REG">등록일순</option>
                  <option value="DEADLINE">마감일순</option>
                  <option value="VIEW">조회순</option>
                </select>
              </div>
            </li>
          </ul>
        </div>

        <div className="krds-table-wrap">
          <table className="tbl col data t-block">
            <caption>지원사업 공고의 번호, 제목, 신청기간, 신청, 지원기관, 조회수 정보가 제공됩니다.</caption>
            <colgroup>
              <col style={{ width: '5%' }} />
              <col />
              <col style={{ width: '220px' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">번호</th>
                <th scope="col" className="ac">제목</th>
                <th scope="col" className="ac">신청기간</th>
                <th scope="col" className="ac">신청</th>
                <th scope="col" className="ac">사업수행기관</th>
                <th scope="col" className="ac">조회수</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const rowNo = totalElements - ((page - 1) * size + index);
                const fieldLabel = item.bizPbancClsfCd ? fieldLabelMap[item.bizPbancClsfCd] : '';
                const periodText = item.applyPeriodText
                  || (item.bizAplyBgngYmd || item.bizAplyDdlnYmd
                    ? `${formatToYYMMDD(item.bizAplyBgngYmd)} ~ ${formatToYYMMDD(item.bizAplyDdlnYmd)}`
                    : '');

                return (
                  <tr key={item.bizPbancNo || index}>
                    <th scope="row" className="ac"><span>{rowNo}</span></th>
                    <td>
                      {fieldLabel && (
                        <div className="badge-txt-box">
                          <span className="krds-badge bg-light-primary">{fieldLabel}</span>
                        </div>
                      )}
                      <Link className="onellipsis-1" to={appendListSearchToPath(`${item.bizPbancNo}`, location.search)}>
                        <span>{item.bizPbancNm}</span>
                      </Link>
                    </td>
                    <td className="ac"><span>{periodText}</span></td>
                    <td className="ac"><span className="onellipsis-1">{item.applyStatusText || '-'}</span></td>
                    <td className="ac"><span className="onellipsis-1">{item.bizSprvsnInstNm || '-'}</span></td>
                    <td className="ac views"><span>{formatNumberWithCommas(item.bizPbancInqCnt || 0)}</span></td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="ac">조회된 사업공고가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination totalPages={totalPages} currentPage={page} onPageChange={(p) => search(p)} syncUrl />
      </div>
    </>
  );
};

export default Pbanc;
