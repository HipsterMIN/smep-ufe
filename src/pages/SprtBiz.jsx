import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import Pagination from '../components/ui/Pagination';
import Tab from '../components/ui/Tab';
import { useUserMenu } from '../context/UserMenuContext';
import { api as apiClient } from '../lib/apiClient.js';

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

const BIZ_FIELD_OPTIONS = [
  { value: 'PC10', label: '금융' },
  { value: 'PC20', label: '기술' },
  { value: 'PC30', label: '인력' },
  { value: 'PC40', label: '수출' },
  { value: 'PC50', label: '내수' },
  { value: 'PC60', label: '창업' },
  { value: 'PC70', label: '경영' },
  { value: 'PC80', label: '소상공인' },
  { value: 'PC12', label: '중견' },
  { value: 'PC99', label: '기타' },
];

const ORGANIZATION_OPTIONS = [
  { value: 'SP16', label: '중소벤처기업부' },
  { value: 'SP01', label: '중소벤처기업진흥공단' },
  { value: 'SP02', label: '중소기업기술정보진흥원' },
  { value: 'SP03', label: '소상공인시장진흥공단' },
  { value: 'SP04', label: '창업진흥원' },
  { value: 'SP05', label: '소상공인시장진흥공단' },
  { value: 'SP06', label: '기술보증기금' },
  { value: 'SP10', label: '대중소기업농어업협력재단' },
  { value: 'SP13', label: '한국산업기술진흥원' },
  { value: 'SP17', label: '중소기업중앙회' },
  { value: 'SP22', label: '한국무역보험공사' },
  { value: 'SP23', label: '기업은행' },
  { value: 'SP24', label: '대한상공회의소' },
  { value: 'SP25', label: '신용보증기금' },
  { value: 'SP26', label: '신용보증재단중앙회' },
  { value: 'SP27', label: '소상공인연합회' },
  { value: 'SP28', label: '한국무역협회' },
  { value: 'SP29', label: '한국무역협회' },
  { value: 'SP30', label: '한국산업은행' },
  { value: 'SP31', label: '한국수출입은행' },
];

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
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const tabData = useRef(['사업유형별', '지원기관별']);
  const schFormWrapRef = useRef(null);
  const prevSizeRef = useRef(DEFAULT_SIZE);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedBizTypes, setSelectedBizTypes] = useState([]);
  const [selectedOrgs, setSelectedOrgs] = useState([]);

  const [items, setItems] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);

  const [searchStts, setSearchStts] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [appliedCondition, setAppliedCondition] = useState(INITIAL_CONDITION);

  const isMeaningfulHtml = (html) => {
    if (!html || typeof html !== 'string') return false;

    const normalized = html.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!normalized || EMPTY_HTML_PATTERNS.has(normalized)) return false;

    const textOnly = stripHtml(normalized);
    return textOnly.length > 0;
  };

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

  const fetchList = useCallback(async (pageParam, condition, sizeValue) => {
    const response = await apiClient.get(`/api/v1/sprtBiz?${buildParams(pageParam, condition, sizeValue)}`);
    const pageData = response?.data || response;

    setItems(pageData?.content || []);
    setTotalPages(pageData?.totalPages || 0);
    setTotalElements(pageData?.totalElements || 0);
    setPage(pageParam);
  }, [buildParams]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchList(1, INITIAL_CONDITION, DEFAULT_SIZE);
  }, [fetchList]);

  useEffect(() => {
    if (prevSizeRef.current !== size) {
      prevSizeRef.current = size;
      fetchList(1, appliedCondition, size);
    }
  }, [appliedCondition, fetchList, size]);

  const handleToggleFilter = () => {
    schFormWrapRef.current?.classList.toggle('on');
  };

  const executeSearch = () => {
    const nextCondition = {
      activeTabIndex,
      selectedBizTypes,
      selectedOrgs,
      searchStts,
      searchType,
      searchText,
    };

    setAppliedCondition(nextCondition);
    fetchList(1, nextCondition, size);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    setPage(1);
  };

  const handleBizTypeChange = (value) => {
    setSelectedBizTypes((prev) => (
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    ));
  };

  const handleOrgChange = (value) => {
    setSelectedOrgs((prev) => (
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    ));
  };

  const getFieldLabel = (code) => BIZ_FIELD_OPTIONS.find((option) => option.value === code)?.label || code;

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const currentFilters = activeTabIndex === 0 ? BIZ_FIELD_OPTIONS : ORGANIZATION_OPTIONS;
  const selectedFilters = activeTabIndex === 0 ? selectedBizTypes : selectedOrgs;

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">지원사업소개</h2>
        </div>

        <div className="krds-tab-area layer">
          <Tab tabData={tabData.current} onTabChange={handleTabChange} />

          <div className="tab-conts-wrap">
            <section className="tab-conts active">
              <h3 className="sr-only">{tabData.current[activeTabIndex]}</h3>

              <div className="search-top-box">
                <div className="sch-form-wrap" ref={schFormWrapRef}>
                  <select className="krds-form-select" value={searchStts} onChange={(e) => setSearchStts(e.target.value)}>
                    <option value="">공고상태 전체</option>
                    <option value="ONGOING">진행중</option>
                    <option value="PLANNED">진행예정</option>
                  </select>
                  <select className="krds-form-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="">검색구분 전체</option>
                    <option value="TITLE">제목</option>
                    <option value="CONTENT">내용</option>
                  </select>
                  <div className="sch-input">
                    <input
                      type="text"
                      className="krds-input"
                      placeholder="지원사업명을 입력해 주세요"
                      title="검색어 입력"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button type="button" className="krds-btn medium icon ico-search" onClick={executeSearch}>
                      <span className="sr-only">검색</span>
                      <i className="svg-icon ico-sch"></i>
                    </button>
                  </div>
                  <button type="button" className="krds-btn medium text" onClick={handleToggleFilter}>
                    <i className="svg-icon ico-sch-plus"></i>
                    상세검색
                    <span className="onfilter-open sr-only">열기</span>
                    <span className="onfilter-close sr-only">닫기</span>
                  </button>
                </div>

                <div className="sch-filter-box">
                  <div className="filter-form">
                    <div className="on-flexwrap on-mw100p">
                      <label className="label">{activeTabIndex === 0 ? '사업유형' : '지원기관'}</label>
                      <div
                        className="krds-check-area"
                        style={activeTabIndex === 1 ? { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', width: '100%' } : undefined}
                      >
                        {currentFilters.map((option) => {
                          const inputId = `${activeTabIndex === 0 ? 'biz' : 'org'}_${option.value}`;
                          return (
                            <div className="krds-form-chip small" key={option.value} style={activeTabIndex === 1 ? { width: '100%' } : undefined}>
                              <input
                                type="checkbox"
                                className="checkbox"
                                id={inputId}
                                checked={selectedFilters.includes(option.value)}
                                onChange={() => (activeTabIndex === 0 ? handleBizTypeChange(option.value) : handleOrgChange(option.value))}
                              />
                              <label
                                className="krds-form-chip-outline"
                                htmlFor={inputId}
                                style={activeTabIndex === 1 ? { width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex' } : undefined}
                              >
                                {option.label}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="search-list-top">
                <ul className="sch-info" aria-live="polite">
                  <li>검색 결과 <span className="point">{(totalElements || 0).toLocaleString()}</span>개</li>
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
                      <Link className="c-text" to={`${item.sprtBizId}`}>
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

              <Pagination totalPages={totalPages} currentPage={page} onPageChange={(nextPage) => fetchList(nextPage, appliedCondition, size)} />
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default SprtBiz;
