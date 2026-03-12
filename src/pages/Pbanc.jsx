import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useMatches } from 'react-router-dom';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import Pagination from '../components/ui/Pagination.jsx';
import { api as apiClient } from '../lib/apiClient.js';
import { useUserMenu } from '../context/UserMenuContext';

const DEFAULT_SIZE = 10;
const DEFAULT_SORT = 'REG';

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

const Pbanc = () => {
  const matches = useMatches();
  const { breadcrumbItems, currentMenu, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [items, setItems] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);

  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('');
  const [bizPbancClsfCd, setBizPbancClsfCd] = useState('');
  const [applyStatus, setApplyStatus] = useState('AVAILABLE');
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [sortType, setSortType] = useState(DEFAULT_SORT);

  const schFormWrapRef = useRef(null);
  const bizPbancTypeCd = currentMenu?.menuId === 'M_PIIO_00091' ? 'HSSPLY' : 'BIZPBN';

  const fieldLabelMap = useMemo(
    () => Object.fromEntries(BIZ_FIELD_OPTIONS.map((option) => [option.value, option.label])),
    [],
  );
  const handleToggleFilter = () => {
    schFormWrapRef.current?.classList.toggle('on');
  };

  const buildParams = useCallback(
    (pageParam) => {
      const params = new URLSearchParams();
      params.set('page', String(pageParam));
      params.set('size', String(size));
      params.set('sortType', sortType);
      params.set('bizPbancTypeCd', bizPbancTypeCd);

      if (searchText.trim()) params.set('searchText', searchText.trim());
      if (searchType) params.set('searchType', searchType);
      if (bizPbancClsfCd) params.set('bizPbancClsfCd', bizPbancClsfCd);
      if (applyStatus) params.set('applyStatus', applyStatus);

      return params.toString();
    },
    [applyStatus, bizPbancClsfCd, bizPbancTypeCd, searchText, searchType, size, sortType],
  );

  const search = useCallback(
    async (pageParam = 1) => {
      const data = await apiClient.get(`/api/v1/pbanc?${buildParams(pageParam)}`);
      const pageData = data?.data || data;
      setItems(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      setPage(pageParam);
    },
    [buildParams],
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') search(1);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    search(1);
  }, []);

  useEffect(() => {
    search(1);
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
            <select className="krds-form-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="">전체</option>
              <option value="pbancnm">공고명</option>
              <option value="sprvsnInstNm">사업수행기관</option>
            </select>
            <div className="sch-input">
              <input
                type="text"
                className="krds-input"
                placeholder="공고명/사업수행기관으로 검색해 주세요"
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
            <button type="button" className="krds-btn medium text" onClick={handleToggleFilter}>
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
                  className="krds-form-select medium"
                  value={bizPbancClsfCd}
                  onChange={(e) => setBizPbancClsfCd(e.target.value)}
                >
                  <option value="">전체</option>
                  {BIZ_FIELD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="appl-sch-sel2">신청</label>
                <select
                  id="appl-sch-sel2"
                  className="krds-form-select medium"
                  value={applyStatus}
                  onChange={(e) => setApplyStatus(e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="AVAILABLE">신청가능</option>
                  <option value="PLANNED">진행예정</option>
                  <option value="CLOSED">신청마감</option>
                </select>
              </div>
            </div>
            {/*<div style={{ marginTop: '12px' }}>*/}
            {/*  <button type="button" className="krds-btn medium" onClick={() => search(1)}>필터 적용</button>*/}
            {/*</div>*/}
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
          <table className="tbl col data">
            <caption>지원사업 공고표. 번호, 제목, 신청기간, 신청, 지원기관, 조회수 정보가 제공됨.</caption>
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
                      <Link className="onellipsis-1" to={`${item.bizPbancNo}`}>
                        {fieldLabel && <span className="krds-badge bg-light-primary">{fieldLabel}</span>}
                        <span>{item.bizPbancNm}</span>
                      </Link>
                    </td>
                    <td className="ac"><span>{periodText}</span></td>
                    <td className="ac"><span className="onellipsis-1">{item.applyStatusText || '-'}</span></td>
                    <td className="ac"><span className="onellipsis-1">{item.bizSprvsnInstNm || '-'}</span></td>
                    <td className="ac"><span>{(item.bizPbancInqCnt || 0).toLocaleString()}</span></td>
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
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={(p) => search(p)} />
        </div>
      </div>
    </>
  );
};

export default Pbanc;
