import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import Pagination from '../components/ui/Pagination';
import Tab from '../components/ui/Tab';
import { useUserMenu } from '../context/UserMenuContext';
import { api as apiClient } from '../lib/apiClient.js';
import { fetchAndConvertCommonCodes } from '../utils/commonCodeUtils.js';
import { appendListSearchToPath, getNumberSearchParam, getSearchParam, setQueryParam } from '../utils/listNavigation.js';
import { formatNumberWithCommas } from '../utils/numberUtils.js';

const DEFAULT_SIZE = 12;
const DEFAULT_SORT = 'REG';
const INITIAL_CONDITION = {
  activeTabIndex: 0,
  selectedBizTypes: [],
  selectedOrgs: [],
  searchStts: '',
  searchType: '',
  searchText: '',
};

const BIZ_PBANC_CLSF_GROUP_ID = 'BIZ_PBANC_CLSF_CD';
const BIZ_PBANC_SPRT_INST_GROUP_ID = 'BIZ_PBANC_SPRT_INST_CD';

const toCodeList = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);

const getConditionFromSearch = (search) => {
  const tabType = getSearchParam(search, 'tabType', 'bizType');
  const activeTabIndex = tabType === 'orgType' ? 1 : 0;
  const filterCodes = toCodeList(getSearchParam(search, 'filterCodes', ''));

  return {
    activeTabIndex,
    selectedBizTypes: activeTabIndex === 0 ? filterCodes : [],
    selectedOrgs: activeTabIndex === 1 ? filterCodes : [],
    searchStts: getSearchParam(search, 'searchStts', ''),
    searchType: getSearchParam(search, 'searchType', ''),
    searchText: getSearchParam(search, 'searchText', ''),
  };
};

const EMPTY_HTML_PATTERNS = new Set([
  '<p style="text-align: left;"></p>',
  '<p><br></p>',
  '<p>&nbsp;</p>',
]);

const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

const SprtBiz = () => {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const initialQueryRef = useRef({
    condition: getConditionFromSearch(location.search),
    page: getNumberSearchParam(location.search, 'page', 1),
    size: getNumberSearchParam(location.search, 'size', DEFAULT_SIZE),
  });
  const didInitialFetchRef = useRef(false);
  const { condition: initialCondition, page: initialPage, size: initialSize } = initialQueryRef.current;
  const tabData = useRef(['사업유형별', '지원기관별']);
  const schFormWrapRef = useRef(null);
  const prevSizeRef = useRef(initialSize);
  const requestSequenceRef = useRef(0);
  const appliedConditionRef = useRef(initialCondition);

  const [activeTabIndex, setActiveTabIndex] = useState(initialCondition.activeTabIndex);
  const [selectedBizTypes, setSelectedBizTypes] = useState(initialCondition.selectedBizTypes);
  const [selectedOrgs, setSelectedOrgs] = useState(initialCondition.selectedOrgs);
  const [bizFieldOptions, setBizFieldOptions] = useState([]);
  const [organizationOptions, setOrganizationOptions] = useState([]);

  const [items, setItems] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(initialPage);

  const [searchStts] = useState(initialCondition.searchStts);
  const [searchType, setSearchType] = useState(initialCondition.searchType);
  const [searchText, setSearchText] = useState(initialCondition.searchText);
  const [size, setSize] = useState(initialSize);
  const [appliedCondition, setAppliedCondition] = useState(initialCondition);

  const fieldLabelMap = useMemo(
    () => Object.fromEntries(bizFieldOptions.map((option) => [option.value, option.label])),
    [bizFieldOptions],
  );

  const isMeaningfulHtml = (html) => {
    if (!html || typeof html !== 'string') return false;

    const normalized = html.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!normalized || EMPTY_HTML_PATTERNS.has(normalized)) return false;

    const textOnly = stripHtml(normalized);
    return textOnly.length > 0;
  };

  const buildManualCondition = useCallback(() => ({
    activeTabIndex,
    selectedBizTypes,
    selectedOrgs,
    searchStts,
    searchType,
    searchText,
  }), [
    activeTabIndex,
    selectedBizTypes,
    selectedOrgs,
    searchStts,
    searchType,
    searchText,
  ]);

  const buildAutoCondition = useCallback((overrides = {}) => ({
    ...appliedConditionRef.current,
    activeTabIndex: overrides.activeTabIndex ?? activeTabIndex,
    selectedBizTypes: overrides.selectedBizTypes ?? selectedBizTypes,
    selectedOrgs: overrides.selectedOrgs ?? selectedOrgs,
    searchStts: overrides.searchStts ?? searchStts,
  }), [
    activeTabIndex,
    selectedBizTypes,
    selectedOrgs,
    searchStts,
  ]);

  const buildParams = useCallback((pageParam, condition, sizeValue) => {
    const params = new URLSearchParams();
    params.set('page', String(pageParam));
    params.set('size', String(sizeValue));
    params.set('sortType', DEFAULT_SORT);
    params.set('tabType', condition.activeTabIndex === 0 ? 'bizType' : 'orgType');

    const filterCodes = condition.activeTabIndex === 0
      ? condition.selectedBizTypes.join(',')
      : condition.selectedOrgs.join(',');

    if (condition.searchStts) params.set('searchStts', condition.searchStts);
    if (condition.searchType) params.set('searchType', condition.searchType);
    if (condition.searchText.trim()) params.set('searchText', condition.searchText.trim());
    if (filterCodes) params.set('filterCodes', filterCodes);

    return params.toString();
  }, []);

  const buildListSearchParams = useCallback((pageParam, condition, sizeValue) => {
    const params = new URLSearchParams();
    const filterCodes = condition.activeTabIndex === 0
      ? condition.selectedBizTypes.join(',')
      : condition.selectedOrgs.join(',');

    setQueryParam(params, 'page', pageParam, 1);
    setQueryParam(params, 'size', sizeValue, DEFAULT_SIZE);
    setQueryParam(params, 'tabType', condition.activeTabIndex === 0 ? 'bizType' : 'orgType', 'bizType');
    setQueryParam(params, 'searchStts', condition.searchStts);
    setQueryParam(params, 'searchType', condition.searchType);
    setQueryParam(params, 'searchText', condition.searchText);
    setQueryParam(params, 'filterCodes', filterCodes);

    return params;
  }, []);

  const fetchList = useCallback(async (pageParam, condition, sizeValue) => {
    const requestSequence = ++requestSequenceRef.current;
    const response = await apiClient.get(`/api/v1/sprtBiz?${buildParams(pageParam, condition, sizeValue)}`);
    if (requestSequence !== requestSequenceRef.current) {
      return;
    }
    const pageData = response?.data || response;

    setItems(pageData?.content || []);
    setTotalPages(pageData?.totalPages || 0);
    setTotalElements(pageData?.totalElements || 0);
    setPage(pageParam);
    setSearchParams(buildListSearchParams(pageParam, condition, sizeValue), { replace: true });
  }, [buildListSearchParams, buildParams, setSearchParams]);

  useEffect(() => {
    if (didInitialFetchRef.current) {
      return;
    }

    didInitialFetchRef.current = true;
    window.scrollTo(0, 0);
    fetchList(initialPage, initialCondition, initialSize);
  }, [fetchList, initialCondition, initialPage, initialSize]);

  useEffect(() => {
    let mounted = true;

    const loadCommonCodes = async () => {
      try {
        const commonCodes = await fetchAndConvertCommonCodes([
          BIZ_PBANC_CLSF_GROUP_ID,
          BIZ_PBANC_SPRT_INST_GROUP_ID,
        ]);

        if (!mounted) {
          return;
        }

        setBizFieldOptions(commonCodes[BIZ_PBANC_CLSF_GROUP_ID] || []);
        setOrganizationOptions(commonCodes[BIZ_PBANC_SPRT_INST_GROUP_ID] || []);
      } catch (error) {
        console.error('공통코드 조회 실패:', error);
        if (mounted) {
          setBizFieldOptions([]);
          setOrganizationOptions([]);
        }
      }
    };

    loadCommonCodes();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (prevSizeRef.current !== size) {
      prevSizeRef.current = size;
      fetchList(1, appliedCondition, size);
    }
  }, [appliedCondition, fetchList, size]);

  const handleToggleFilter = () => {
    schFormWrapRef.current?.classList.toggle('on');
  };

  const manualSearch = useCallback(() => {
    const nextCondition = buildManualCondition();
    appliedConditionRef.current = nextCondition;
    setAppliedCondition(nextCondition);
    fetchList(1, nextCondition, size);
  }, [buildManualCondition, fetchList, size]);

  const autoSearch = useCallback((overrides = {}) => {
    const nextCondition = buildAutoCondition(overrides);
    appliedConditionRef.current = nextCondition;
    setAppliedCondition(nextCondition);
    fetchList(1, nextCondition, size);
  }, [buildAutoCondition, fetchList, size]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      manualSearch();
    }
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    autoSearch({ activeTabIndex: index });
  };

  const handleBizTypeChange = (value) => {
    const nextSelectedBizTypes = value ? [value] : [];
    setSelectedBizTypes(nextSelectedBizTypes);
    autoSearch({
      activeTabIndex: 0,
      selectedBizTypes: nextSelectedBizTypes,
    });
  };

  const handleOrgChange = (value) => {
    const nextSelectedOrgs = value ? [value] : [];
    setSelectedOrgs(nextSelectedOrgs);
    autoSearch({
      activeTabIndex: 1,
      selectedOrgs: nextSelectedOrgs,
    });
  };

  const getFieldLabel = (code) => fieldLabelMap[code] || code;

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const currentFilters = activeTabIndex === 0 ? bizFieldOptions : organizationOptions;
  const selectedFilters = activeTabIndex === 0 ? selectedBizTypes : selectedOrgs;
  const detailFilterLabel = activeTabIndex === 0 ? '사업유형' : '지원기관';
  const detailFilterSelectId = activeTabIndex === 0 ? 'appl-sch-sel1' : 'appl-sch-sel2';
  const hasDetailedSearchInput = activeTabIndex === 0
    ? selectedBizTypes.length > 0
    : selectedOrgs.length > 0;

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">지원사업소개</h2>
        </div>

        <div className="krds-tab-area layer">
          <Tab tabData={tabData.current} onTabChange={handleTabChange} activeIndex={activeTabIndex} />

          <div className="tab-conts-wrap">
            <section className="tab-conts active">
              <h3 className="sr-only">{tabData.current[activeTabIndex]}</h3>

              <div className="search-top-box">
                <div className="sch-form-wrap" ref={schFormWrapRef}>
                  {/*<select className="krds-form-select medium" value={searchStts} onChange={(e) => handleSearchSttsChange(e.target.value)}>*/}
                  {/*  <option value="">공고상태 전체</option>*/}
                  {/*  <option value="ONGOING">진행중</option>*/}
                  {/*  <option value="PLANNED">진행예정</option>*/}
                  {/*</select>*/}
                  <select className="krds-form-select medium" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="">검색구분 전체</option>
                    <option value="TITLE">제목</option>
                    <option value="CONTENT">내용</option>
                  </select>
                  <div className="sch-input">
                    <input
                      type="text"
                      className="krds-input medium"
                      placeholder="지원사업명을 입력해 주세요"
                      title="검색어 입력"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button type="button" className="krds-btn medium icon ico-search" onClick={manualSearch}>
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
                      <label className="label" htmlFor={detailFilterSelectId}>{detailFilterLabel}</label>
                      <select
                        id={detailFilterSelectId}
                        className="krds-form-select small"
                        value={selectedFilters[0] || ''}
                        onChange={(e) => (activeTabIndex === 0 ? handleBizTypeChange(e.target.value) : handleOrgChange(e.target.value))}
                      >
                        <option value="">전체</option>
                        {currentFilters.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
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
                      <option value={12}>12개</option>
                      <option value={24}>24개</option>
                      <option value={36}>36개</option>
                    </select>
                  </li>
                  <li>
                    <strong className="sort-label">정렬기준</strong>
                    <div className="w-sort-btn">
                      <button type="button" className="active">
                        등록일순
                      </button>
                    </div>
                    <div className="m-sort-btn">
                      <select className="krds-form-select-sort" id="sort" value={DEFAULT_SORT} disabled>
                        <option value="REG">등록일순</option>
                      </select>
                    </div>
                  </li>
                </ul>
              </div>

              <ul className="krds-structured-list">
                {items.map((item) => (
                  <li className="structured-item" key={item.sprtBizId}>
                    <div className="card-top">
                      {item.bizPbancClsfCd && (
                        <span className="krds-badge bg-light-primary">{getFieldLabel(item.bizPbancClsfCd)}</span>
                      )}
                    </div>
                    <div className="card-body">
                      <Link
                        className="c-text"
                        to={appendListSearchToPath(
                          `${item.sprtBizId}`,
                          buildListSearchParams(page, appliedCondition, size).toString(),
                        )}
                      >
                        <p className="c-tit no-icon">
                          <span className="span onellipsis-2">{item.sprtBizNm}</span>
                        </p>
                        {isMeaningfulHtml(item.sprtBizOtln) && (
                          <p className="c-txt onellipsis-2">
                            <span>{stripHtml(item.sprtBizOtln)}</span>
                          </p>
                        )}
                        <p className="c-date">
                          <strong className="key">상세보기 +</strong>
                        </p>
                      </Link>
                    </div>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="structured-item">
                    <div className="card-body">
                      <p className="c-txt">조회된 지원사업이 없습니다.</p>
                    </div>
                  </li>
                )}
              </ul>

              <Pagination totalPages={totalPages} currentPage={page} onPageChange={(nextPage) => fetchList(nextPage, appliedCondition, size)} syncUrl />
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default SprtBiz;
