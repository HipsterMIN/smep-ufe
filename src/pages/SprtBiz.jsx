import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import Tab from '../components/ui/Tab';
import Pagination from '../components/ui/Pagination';
import { useUserMenu } from '../context/UserMenuContext';
import { api as apiClient } from '../lib/apiClient.js';

const SprtBiz = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const tabData = useRef(['사업유형별', '지원기관별']);
  const schFormWrapRef1 = useRef(null);
  const schFormWrapRef2 = useRef(null);

  // 탭 관련 상태
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // 페이징 관련 상태
  const pageSizeOptions = [12, 24, 36];
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  // 검색 관련 상태
  const [items, setItems] = useState([]);
  const [searchType, setSearchType] = useState('');
  const [searchStts, setSearchStts] = useState('');
  const [searchText, setSearchText] = useState('');

  // 체크박스 필터 상태
  const [selectedBizTypes, setSelectedBizTypes] = useState([]);
  const [selectedOrgs, setSelectedOrgs] = useState([]);

  // 정렬 관련 상태
  const [sortType, setSortType] = useState('createdAt');

  // 기타 상태
  const [likedItems, setLikedItems] = useState({});

  // 사업유형 목록
  const bizTypes = [
    { value: 'BT01', label: '금융' },
    { value: 'BT02', label: '기술' },
    { value: 'BT03', label: '인력' },
    { value: 'BT04', label: '수출' },
    { value: 'BT05', label: '내수' },
    { value: 'BT06', label: '창업' },
    { value: 'BT07', label: '경영' },
    { value: 'BT08', label: '소상공인' },
    { value: 'BT09', label: '중견' },
    { value: 'BT10', label: '기타' },
  ];

  // 지원기관 목록
  const organizations = [
    { value: 'SP16', label: '중소벤처기업부' },
    { value: 'SP01', label: '중소벤처기업진흥공단' },
    { value: 'SP02', label: '중소기업기술정보진흥원' },
    { value: 'SP03', label: '한국중소벤처기업유통원' },
    { value: 'SP04', label: '창업진흥원' },
    { value: 'SP05', label: '소상공인시장진흥공단' },
    { value: 'SP06', label: '기술보증기금' },
    { value: 'SP10', label: '대･중소기업･농어업협력재단' },
    { value: 'SP13', label: '장애인기업종합지원센터' },
    { value: 'SP17', label: '중소기업중앙회' },
    { value: 'SP22', label: '대한무역투자진흥공사' },
    { value: 'SP23', label: '기업은행' },
    { value: 'SP24', label: '대한상공회의소' },
    { value: 'SP25', label: '신용보증기금' },
    { value: 'SP26', label: '신용보증재단중앙회' },
    { value: 'SP27', label: '한국경제인협회중소기업협력센터' },
    { value: 'SP28', label: '한국무역보험공사' },
    { value: 'SP29', label: '한국무역협회' },
    { value: 'SP30', label: '한국산업은행' },
    { value: 'SP31', label: '한국수출입은행' },
  ];

  // 목록 조회 함수
  const search = async (pageParam) => {
    try {
      const filterCodes = activeTabIndex === 0
        ? selectedBizTypes.join(',')
        : selectedOrgs.join(',');

      const params = new URLSearchParams({
        page: pageParam + 1,
        size: pageSize,
        searchText: searchText,
        searchType: searchType,
        searchStts: searchStts,
        tabType: activeTabIndex === 0 ? 'bizType' : 'orgType',
        sortBy: sortType,
        sortDir: 'DESC',
      });

      if (filterCodes) {
        params.append('filterCodes', filterCodes);
      }

      const response = await apiClient.get(
        `/api/v1/sprtBiz/list?${params.toString()}`,
      );

      console.log('목록 데이터 조회');
      console.log(response);

      setItems(response.data.content || response.data);
      setTotalElements(response.data.totalElements || response.data.length);
    } catch (error) {
      console.error('조회 실패:', error);
      setItems([]);
      setTotalElements(0);
    }
  };

  // 정렬 버튼 클릭 핸들러
  const handleSortChange = (type) => {
    if (sortType !== type) {
      setSortType(type);
      setCurrentPage(0);
    }
  };

  // 체크박스 변경 핸들러 (사업유형)
  const handleBizTypeChange = (value) => {
    setSelectedBizTypes(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
    setCurrentPage(0);
  };

  // 체크박스 변경 핸들러 (지원기관)
  const handleOrgChange = (value) => {
    setSelectedOrgs(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
    setCurrentPage(0);
  };

  // 셀렉트박스 변경 핸들러
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    setCurrentPage(0);
  };

  // 엔터키 핸들러
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  // 상세검색 토글
  const handleToggleFilter = (tabIndex) => {
    const ref = tabIndex === 0 ? schFormWrapRef1 : schFormWrapRef2;
    ref.current?.classList.toggle('on');
  };

  // 탭 변경 핸들러
  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    setSearchType('');
    setSearchStts('');
    setSearchText('');
    setSelectedBizTypes([]);
    setSelectedOrgs([]);
    setSortType('createdAt');
    setCurrentPage(0);
  };

  // 좋아요 토글
  const handleToggleLike = (index) => {
    setLikedItems(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // currentPage 변경 시 조회 (가장 중요한 useEffect)
  useEffect(() => {
    search(currentPage);
  }, [currentPage]);

  // 컴포넌트 마운트 시 & 탭 변경 시 & pageSize 변경 시 조회
  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentPage(0);
  }, [activeTabIndex, pageSize]);

  // 필터 변경 시 자동 조회
  useEffect(() => {
    if (selectedBizTypes.length > 0 || selectedOrgs.length > 0) {
      setCurrentPage(0);
    }
  }, [selectedBizTypes, selectedOrgs]);

  // 정렬 변경 시 자동 조회
  useEffect(() => {
    if (currentPage === 0) {
      search(0);
    }
  }, [sortType]);

  // 사이드바 데이터
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">지원사업 소개</h2>
        </div>

        <div className="krds-tab-area layer">
          <Tab tabData={tabData.current} onTabChange={handleTabChange} />

          <div className="tab-conts-wrap">
            {/* 사업유형별 탭 */}
            <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
              <h3 className="sr-only">사업유형별</h3>

              {/* 검색 폼 */}
              <div className="search-top-box">
                <div className="sch-form-wrap" ref={schFormWrapRef1}>
                  <select
                    className="krds-form-select"
                    value={searchStts}
                    onChange={(e) => setSearchStts(e.target.value)}
                  >
                    <option value="">공고상태 전체</option>
                    <option value="1">진행중</option>
                    <option value="2">진행 예정</option>
                  </select>
                  <select
                    className="krds-form-select"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="">검색구분 전체</option>
                    <option value="1">제목</option>
                    <option value="2">내용</option>
                  </select>
                  <div className="sch-input">
                    <input
                      type="text"
                      className="krds-input"
                      placeholder="공고명·사업명·기관명으로 검색하세요"
                      title="검색어 입력"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      type="button"
                      className="krds-btn medium icon ico-search"
                      onClick={handleSearch}
                    >
                      <span className="sr-only">검색</span>
                      <i className="svg-icon ico-sch"></i>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="krds-btn medium text"
                    onClick={() => handleToggleFilter(0)}
                  >
                    <i className="svg-icon ico-sch-plus"></i>
                      상세검색
                    <span className="onfilter-open sr-only">열기</span>
                    <span className="onfilter-close sr-only">닫기</span>
                  </button>
                </div>
                <div className="sch-filter-box">
                  <div className="filter-form">
                    <div className="on-flexwrap on-mw100p">
                      <label className="label">사업유형</label>
                      <div className="krds-check-area">
                        {bizTypes.map((item) => (
                          <div className="krds-form-chip small" key={item.value}>
                            <input
                              type="checkbox"
                              className="checkbox"
                              id={`tab0_${item.value}`}
                              name="bizType"
                              checked={selectedBizTypes.includes(item.value)}
                              onChange={() => handleBizTypeChange(item.value)}
                            />
                            <label className="krds-form-chip-outline" htmlFor={`tab0_${item.value}`}>
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/*<dl className="filter-chip">
                    <dt>선택된 필터 <span className="num">2</span></dt>
                    <dd>
                      <button type="button" className="krds-btn xlarge icon border">
                        <span className="sr-only">새로고침</span>
                        <i className="svg-icon ico-refresh"></i>
                      </button>
                      <div className="chip-wrap krds-tag-wrap large">
                        <span className="krds-btn-tag">
                              금융
                          <button type="button" className="btn-delete">
                            <span className="sr-only">삭제</span>
                          </button>
                        </span>
                        <span className="krds-btn-tag">
                              서울
                          <button type="button" className="btn-delete">
                            <span className="sr-only">삭제</span>
                          </button>
                        </span>
                      </div>
                    </dd>
                  </dl>*/}
                </div>
              </div>

              {/* 목록 옵션 */}
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
                      value={pageSize}
                      onChange={handlePageSizeChange}
                    >
                      {pageSizeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}개
                        </option>
                      ))}
                    </select>
                  </li>
                  <li>
                    <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
                    <div className="w-sort-btn">
                      <button
                        type="button"
                        className={sortType === 'createdAt' ? 'active' : ''}
                        onClick={() => handleSortChange('createdAt')}
                      >
                          등록일순
                        {sortType === 'createdAt' && <span className="sr-only">선택됨</span>}
                      </button>
                      <button
                        type="button"
                        className={sortType === 'scrapCount' ? 'active' : ''}
                        onClick={() => handleSortChange('scrapCount')}
                      >
                          스크랩순
                        {sortType === 'scrapCount' && <span className="sr-only">선택됨</span>}
                      </button>
                    </div>
                    <div className="m-sort-btn">
                      <select
                        className="krds-form-select-sort"
                        id="sort"
                        value={sortType}
                        onChange={(e) => handleSortChange(e.target.value)}
                      >
                        <option value="createdAt">등록일순</option>
                        <option value="scrapCount">스크랩순</option>
                      </select>
                    </div>
                  </li>
                </ul>
              </div>

              {/* 목록 아이템 */}
              <ul className="krds-structured-list">
                {items.map((item, index) => (
                  <li className="structured-item" key={item.sprtBizId || index}>
                    <div className="card-top">
                      <span className="krds-badge bg-light-primary">{item.bizpbancclsfcd || '경영'}</span>
                    </div>
                    <div className="card-body">
                      <Link className="c-text" to={`${item.sprtBizId}`}>
                        <p className="c-tit no-icon">
                          <span className="span onellipsis-2">{item.sprtBizNm}</span>
                        </p>
                        <p className="c-txt onellipsis-2">
                          <span dangerouslySetInnerHTML={{ __html: item.sprtBizOtln }} />
                        </p>
                        <p className="c-date">
                          <strong className="key">자세히 보기 +</strong>
                        </p>
                      </Link>
                    </div>
                    <div className="card-btn">
                      <button
                        type="button"
                        className="krds-btn text"
                        title={item.sprtBizNm}
                        onClick={() => handleToggleLike(index)}
                      >
                        <i className={`svg-icon ico-like on-bgcolorgray ${likedItems[index] ? 'on' : ''}`}></i>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination
                totalItems={totalElements}
                currentPage={currentPage + 1}
                onPageChange={handlePageChange}
              />
            </section>

            {/* 지원기관별 탭 */}
            <section className={`tab-conts ${activeTabIndex === 1 ? 'active' : ''}`}>
              <h3 className="sr-only">지원기관별</h3>

              {/* 검색 폼 */}
              <div className="search-top-box">
                <div className="sch-form-wrap" ref={schFormWrapRef2}>
                  <select
                    className="krds-form-select"
                    value={searchStts}
                    onChange={(e) => setSearchStts(e.target.value)}
                  >
                    <option value="">공고상태 전체</option>
                    <option value="1">진행중</option>
                    <option value="2">진행 예정</option>
                  </select>
                  <select
                    className="krds-form-select"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="">검색구분 전체</option>
                    <option value="1">제목</option>
                    <option value="2">내용</option>
                  </select>
                  <div className="sch-input">
                    <input
                      type="text"
                      className="krds-input"
                      placeholder="공고명·사업명·기관명으로 검색하세요"
                      title="검색어 입력"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      type="button"
                      className="krds-btn medium icon ico-search"
                      onClick={handleSearch}
                    >
                      <span className="sr-only">검색</span>
                      <i className="svg-icon ico-sch"></i>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="krds-btn medium text"
                    onClick={() => handleToggleFilter(1)}
                  >
                    <i className="svg-icon ico-sch-plus"></i>
                      상세검색
                    <span className="onfilter-open sr-only">열기</span>
                    <span className="onfilter-close sr-only">닫기</span>
                  </button>
                </div>
                <div className="sch-filter-box">
                  <div className="filter-form">
                    <div className="on-flexwrap on-mw100p">
                      <label className="label">지원기관</label>
                      <div className="krds-check-area">
                        {organizations.map((item) => (
                          <div className="krds-form-chip small" key={item.value}>
                            <input
                              type="checkbox"
                              className="checkbox"
                              id={`tab1_${item.value}`}
                              name="orgType"
                              checked={selectedOrgs.includes(item.value)}
                              onChange={() => handleOrgChange(item.value)}
                            />
                            <label className="krds-form-chip-outline" htmlFor={`tab1_${item.value}`}>
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/*<dl className="filter-chip">
                    <dt>선택된 필터 <span className="num">2</span></dt>
                    <dd>
                      <button type="button" className="krds-btn xlarge icon border">
                        <span className="sr-only">새로고침</span>
                        <i className="svg-icon ico-refresh"></i>
                      </button>
                      <div className="chip-wrap krds-tag-wrap large">
                        <span className="krds-btn-tag">
                              금융
                          <button type="button" className="btn-delete">
                            <span className="sr-only">삭제</span>
                          </button>
                        </span>
                        <span className="krds-btn-tag">
                              서울
                          <button type="button" className="btn-delete">
                            <span className="sr-only">삭제</span>
                          </button>
                        </span>
                      </div>
                    </dd>
                  </dl>*/}
                </div>
              </div>

              {/* 목록 옵션 */}
              <div className="search-list-top">
                <ul className="sch-info" aria-live="polite">
                  <li>검색 결과 <span className="point">{(totalElements || 0).toLocaleString()}</span>개</li>
                </ul>
                <ul className="sch-sort">
                  <li>
                    <strong className="sort-label"><label htmlFor="search_result_count2">목록 표시 개수</label></strong>
                    <select
                      className="krds-form-select-sort"
                      id="search_result_count2"
                      value={pageSize}
                      onChange={handlePageSizeChange}
                    >
                      {pageSizeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}개
                        </option>
                      ))}
                    </select>
                  </li>
                  <li>
                    <strong className="sort-label"><label htmlFor="sort2">정렬기준</label></strong>
                    <div className="w-sort-btn">
                      <button
                        type="button"
                        className={sortType === 'createdAt' ? 'active' : ''}
                        onClick={() => handleSortChange('createdAt')}
                      >
                          등록일순
                        {sortType === 'createdAt' && <span className="sr-only">선택됨</span>}
                      </button>
                      <button
                        type="button"
                        className={sortType === 'scrapCount' ? 'active' : ''}
                        onClick={() => handleSortChange('scrapCount')}
                      >
                          스크랩순
                        {sortType === 'scrapCount' && <span className="sr-only">선택됨</span>}
                      </button>
                    </div>
                    <div className="m-sort-btn">
                      <select
                        className="krds-form-select-sort"
                        id="sort2"
                        value={sortType}
                        onChange={(e) => handleSortChange(e.target.value)}
                      >
                        <option value="createdAt">등록일순</option>
                        <option value="scrapCount">스크랩순</option>
                      </select>
                    </div>
                  </li>
                </ul>
              </div>

              {/* 목록 아이템 */}
              <ul className="krds-structured-list">
                {items.map((item, index) => (
                  <li className="structured-item" key={item.sprtBizId || index}>
                    <div className="card-top">
                      <span className="krds-badge bg-light-primary">{item.bizpbancclsfcd || '경영'}</span>
                    </div>
                    <div className="card-body">
                      <Link className="c-text" to={`${item.sprtBizId}`}>
                        <p className="c-tit no-icon">
                          <span className="span onellipsis-2">{item.sprtBizNm}</span>
                        </p>
                        <p className="c-txt onellipsis-2">
                          <span dangerouslySetInnerHTML={{ __html: item.sprtBizOtln }} />
                        </p>
                        <p className="c-date">
                          <strong className="key">자세히 보기 +</strong>
                        </p>
                      </Link>
                    </div>
                    <div className="card-btn">
                      <button
                        type="button"
                        className="krds-btn text"
                        title={item.sprtBizNm}
                        onClick={() => handleToggleLike(index)}
                      >
                        <i className={`svg-icon ico-like on-bgcolorgray ${likedItems[index] ? 'on' : ''}`}></i>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <Pagination
                totalItems={totalElements}
                currentPage={currentPage + 1}
                onPageChange={handlePageChange}
              />
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default SprtBiz;
