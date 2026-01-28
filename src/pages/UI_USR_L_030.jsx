import React, { useEffect, useRef, useState } from 'react';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import Tab from '../components/ui/Tab.jsx';
import Tooltip from '../components/ui/Tooltip.jsx';
import Pagination from '../components/ui/Pagination';
import { useUserMenu } from '../context/UserMenuContext.jsx';
import { api as apiClient } from '../lib/apiClient.js';
import { useNavigate } from 'react-router-dom';

const UI_USR_L_030 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();


  const navigate = useNavigate();

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  // ============================================
  // 탭 & 검색 필터 State
  // ============================================
  const tabData = useRef(['전체', '융자', '보증', '보험']);
  const schFormWrapRef = useRef(null);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [likedItems, setLikedItems] = useState({});

  // ============================================
  // API 조회 State
  // ============================================
  const [dataList, setDataList] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [sortType, setSortType] = useState('INQ_CNT');

  // ============================================
  // 필터 검색 State (입력용)
  // ============================================
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');
  const [selectedFinancialInst, setSelectedFinancialInst] = useState('');
  const [selectedCompanySize, setSelectedCompanySize] = useState('');
  const [selectedReceptionStatus, setSelectedReceptionStatus] = useState('');
  const [selectedPreferredType, setSelectedPreferredType] = useState('');
  const [selectedApplicationMethod, setSelectedApplicationMethod] = useState('');

  // ============================================
  // 필터 검색 State (전송용)
  // ============================================
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [appliedProductType, setAppliedProductType] = useState('');
  const [appliedFinancialInst, setAppliedFinancialInst] = useState('');
  const [appliedCompanySize, setAppliedCompanySize] = useState('');
  const [appliedReceptionStatus, setAppliedReceptionStatus] = useState('');
  const [appliedPreferredType, setAppliedPreferredType] = useState('');
  const [appliedApplicationMethod, setAppliedApplicationMethod] = useState('');
  const [appliedTab, setAppliedTab] = useState('');

  // ============================================
  // API 호출 (페이징 및 필터 변경 시)
  // ============================================
  useEffect(() => {
    const fetchPolicyFinanceList = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage + 1,
          size: pageSize,
          sortType: sortType,
        });

        // 탭 필터
        if (appliedTab) {
          params.append('plcyFnncGdsTypeCd', appliedTab);
        }

        // 검색 키워드
        if (appliedSearchKeyword && appliedSearchKeyword.trim()) {
          params.append('searchKeyword', appliedSearchKeyword);
        }

        // 상세 필터
        if (appliedFinancialInst) {
          params.append('financialInst', appliedFinancialInst);
        }
        if (appliedCompanySize) {
          params.append('companySize', appliedCompanySize);
        }
        if (appliedReceptionStatus) {
          params.append('receptionStatus', appliedReceptionStatus);
        }
        if (appliedPreferredType) {
          params.append('preferredType', appliedPreferredType);
        }
        if (appliedApplicationMethod) {
          params.append('applicationMethod', appliedApplicationMethod);
        }

        const response = await apiClient.get(
          `/api/v1/finance-policy/list?${params.toString()}`,
        );

        const data = response.data;
        setDataList(data.content || []);
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);
      } catch (error) {
        console.error('정책금융 목록 조회 실패:', error);
        setDataList([]);
        setTotalElements(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyFinanceList();
  }, [
    currentPage,
    pageSize,
    sortType,
    appliedSearchKeyword,
    appliedTab,
    appliedProductType,
    appliedFinancialInst,
    appliedCompanySize,
    appliedReceptionStatus,
    appliedPreferredType,
    appliedApplicationMethod,
  ]);

  // ============================================
  // 핸들러 함수
  // ============================================

  // 탭 변경
  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    const tabValues = ['', 'FT01', 'FT02', 'FT03']; // 전체, 융자, 보증, 보험
    setAppliedTab(tabValues[index]);
    setCurrentPage(0);
  };

  // 필터 토글
  const handleToggleFilter = () => {
    schFormWrapRef.current?.classList.toggle('on');
  };

  // 좋아요 토글
  const handleToggleLike = (index) => {
    setLikedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // 정렬 핸들러
  const handleSortChange = (type) => {
    setSortType(type);
    setCurrentPage(0);
  };


  // 검색 버튼 클릭 (입력용 → 전송용)
  const handleSearch = () => {
    setAppliedSearchKeyword(searchKeyword);
    setCurrentPage(0);
  };

  // 엔터키 검색
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 필터 적용 (입력용 → 전송용)
  const handleApplyFilters = () => {
    setAppliedProductType(selectedProductType);
    setAppliedFinancialInst(selectedFinancialInst);
    setAppliedCompanySize(selectedCompanySize);
    setAppliedReceptionStatus(selectedReceptionStatus);
    setAppliedPreferredType(selectedPreferredType);
    setAppliedApplicationMethod(selectedApplicationMethod);
    setCurrentPage(0);
    handleToggleFilter();
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedProductType('');
    setSelectedFinancialInst('');
    setSelectedCompanySize('');
    setSelectedReceptionStatus('');
    setSelectedPreferredType('');
    setSelectedApplicationMethod('');
    setAppliedSearchKeyword('');
    setAppliedProductType('');
    setAppliedFinancialInst('');
    setAppliedCompanySize('');
    setAppliedReceptionStatus('');
    setAppliedPreferredType('');
    setAppliedApplicationMethod('');
    setActiveTabIndex(0);
    setAppliedTab('');
    setCurrentPage(0);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
    window.scrollTo(0, 0);
  };

  // 페이지 사이즈 변경
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };

  // 상세페이지 이동
  const goToDetail = (plcyFnncNo) => {
    navigate(`${plcyFnncNo}`);
  };

  // ============================================
  // 상태 표시 함수
  // ============================================
  const getReceptionStatusBadge = (statusCode) => {
    const statusMap = {
      'FG01': { text: '접수중', className: 'bg-light-success' },
      'FG02': { text: '접수마감', className: 'bg-light-danger' },
      'FG03': { text: '접수예정', className: 'bg-light-warning' },
    };
    return statusMap[statusCode] || { text: '미정', className: 'bg-light-gray' };
  };

  const getProductTypeBadge = (typeCode) => {
    const typeMap = {
      'FT01': '융자',
      'FT02': '보증',
      'FT03': '보험',
    };
    return typeMap[typeCode] || '';
  };

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />

        {/* 페이지 제목 */}
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">정책금융</h2>
        </div>

        {/* 탭 영역 */}
        <div className="krds-tab-area layer">
          <Tab tabData={tabData.current} onTabChange={handleTabChange} />
          <div className="conts-desc">
              정책금융은 정부 및 정책금융기관에서 중소기업의 성장과 발전을 지원하기 위해 제공하는
              금융상품입니다. 다양한 금융상품 중 기업의 상황에 맞는 상품을 찾아보세요.
          </div>

          {/* 탭 콘텐츠 */}
          <div className="tab-conts-wrap">
            <section className="tab-conts active">
              <h3 className="sr-only">정책금융 목록</h3>

              {/* 검색 영역 */}
              <div className="search-top-box">
                <div className="sch-form-wrap" ref={schFormWrapRef}>
                  <select className="krds-form-select">
                    <option value="">전체</option>
                    <option value="flcyFnncNm">상품명</option>
                  </select>
                  <div className="sch-input">
                    <input
                      type="text"
                      className="krds-input"
                      placeholder="검색어를 입력해주세요"
                      title="검색어 입력"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
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
                  {/*<button*/}
                  {/*  type="button"*/}
                  {/*  className="krds-btn medium text"*/}
                  {/*  onClick={handleToggleFilter}*/}
                  {/*>*/}
                  {/*  <i className="svg-icon ico-sch-plus"></i>*/}
                  {/*    상세검색*/}
                  {/*  <span className="onfilter-open sr-only">열기</span>*/}
                  {/*  <span className="onfilter-close sr-only">닫기</span>*/}
                  {/*</button>*/}
                </div>

                {/* 상세 필터 영역 */}
                <div className="sch-filter-box">
                  <div className="filter-form">
                    {/* 1. 상품유형 */}
                    <div>
                      <label className="label" htmlFor="appl-sch-sel1">
                        상품유형
                      </label>
                      <select
                        id="appl-sch-sel1"
                        className="krds-form-select medium"
                        value={selectedProductType}
                        onChange={(e) => setSelectedProductType(e.target.value)}
                      >
                        <option value="">상품유형 전체</option>
                        <option value="FT01">융자</option>
                        <option value="FT02">보증</option>
                        <option value="FT03">보험</option>
                      </select>
                    </div>

                    {/* 2. 금융기관 */}
                    <div>
                      <label className="label" htmlFor="appl-sch-sel2">
                        금융기관
                      </label>
                      <select
                        id="appl-sch-sel2"
                        className="krds-form-select medium"
                        value={selectedFinancialInst}
                        onChange={(e) => setSelectedFinancialInst(e.target.value)}
                      >
                        <option value="">금융기관 전체</option>
                        <option value="중소벤처기업진흥공단">중소벤처기업진흥공단</option>
                        <option value="기술보증기금">기술보증기금</option>
                        <option value="한국산업은행">한국산업은행</option>
                        <option value="중소기업은행">중소기업은행</option>
                        <option value="한국수출입은행">한국수출입은행</option>
                        <option value="신용보증기금">신용보증기금</option>
                        <option value="한국무역보험공사">한국무역보험공사</option>
                        <option value="지역신용보증재단">지역신용보증재단</option>
                        <option value="소상공인시장진흥공단">소상공인시장진흥공단</option>
                      </select>
                    </div>

                    {/* 3. 기업규모 */}
                    <div className="on-fit-width">
                      <label className="label" htmlFor="appl-sch-sel3">
                        기업규모
                      </label>
                      <select
                        id="appl-sch-sel3"
                        className="krds-form-select medium"
                        value={selectedCompanySize}
                        onChange={(e) => setSelectedCompanySize(e.target.value)}
                      >
                        <option value="">기업규모 전체</option>
                        <option value="FS01">예비창업</option>
                        <option value="FS02">소상공인</option>
                        <option value="FS03">중소기업</option>
                        <option value="FS04">중견기업</option>
                        <option value="FS05">계열대기업</option>
                      </select>
                      <button type="button" className="krds-btn medium text">
                        업종선택 <i className="svg-icon ico-go"></i>
                      </button>
                    </div>

                    {/* 4. 접수상황 */}
                    <div>
                      <label className="label" htmlFor="appl-sch-sel4">
                        접수상황
                      </label>
                      <select
                        id="appl-sch-sel4"
                        className="krds-form-select medium"
                        value={selectedReceptionStatus}
                        onChange={(e) => setSelectedReceptionStatus(e.target.value)}
                      >
                        <option value="">접수상황 전체</option>
                        <option value="FG01">접수중</option>
                        <option value="FG02">접수마감</option>
                        <option value="FG03">접수예정</option>
                      </select>
                    </div>

                    {/* 5. 우대기업유형 */}
                    <div>
                      <label className="label" htmlFor="appl-sch-sel5">
                        우대기업
                      </label>
                      <select
                        id="appl-sch-sel5"
                        className="krds-form-select medium"
                        value={selectedPreferredType}
                        onChange={(e) => setSelectedPreferredType(e.target.value)}
                      >
                        <option value="">우대기업유형 전체</option>
                        <option value="FU01">수출</option>
                        <option value="FU02">벤처</option>
                        <option value="FU03">창업</option>
                        <option value="FU04">혁신성장공동기준</option>
                        <option value="FU05">여성</option>
                        <option value="FU06">장애인</option>
                        <option value="FU07">고용창출우수</option>
                        <option value="FU08">기타</option>
                      </select>
                    </div>

                    {/* 6. 신청방식 */}
                    <div>
                      <label className="label" htmlFor="appl-sch-sel6">
                        신청방식
                      </label>
                      <select
                        id="appl-sch-sel6"
                        className="krds-form-select medium"
                        value={selectedApplicationMethod}
                        onChange={(e) => setSelectedApplicationMethod(e.target.value)}
                      >
                        <option value="">신청방식 전체</option>
                        <option value="FM01">온라인 신청</option>
                        <option value="FM02">영업점 방문신청</option>
                      </select>
                    </div>
                  </div>

                  {/*TODO ::: 필터 기능 구현*/}
                  <dl className="filter-chip">
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
                  </dl>
                </div>
              </div>

              {/* 인기 금융상품 */}
              <div className="onhotbox">
                <div className="onhot-title">
                  <p>
                    <i className="svg-icon ico-hot"></i>
                    인기 금융상품
                  </p>
                  <Tooltip tooltipText="인기 금융상품은 이용자가 가장 많이 찾는 금융정책상품입니다.">
                    <span className="sr-only">도움말</span>
                    <i className="svg-icon ico-help-gray"></i>
                  </Tooltip>
                </div>
                {/*TODO ::: 해시태그 구현*/}
                <div className="krds-tag-wrap">
                  <span className="krds-btn-tag">#개발기술사업화자금</span>
                  <span className="krds-btn-tag">#혁신성장지원자금</span>
                  <span className="krds-btn-tag">#수출기업글로벌화</span>
                </div>
              </div>

              {/* 검색 결과 정보 & 정렬 */}
              <div className="search-list-top">
                <ul className="sch-info" aria-live="polite">
                  <li>
                    검색 결과 <span className="point">{totalElements}</span>개
                  </li>
                </ul>
                <ul className="sch-sort">
                  <li>
                    <strong className="sort-label">
                      <label htmlFor="search_result_count">목록 표시 개수</label>
                    </strong>
                    <select
                      className="krds-form-select-sort"
                      id="search_result_count"
                      value={pageSize}
                      onChange={handlePageSizeChange}
                    >
                      <option value={10}>10개</option>
                      <option value={20}>20개</option>
                      <option value={30}>30개</option>
                      <option value={50}>50개</option>
                    </select>
                  </li>
                  <li>
                    <strong className="sort-label">
                      <label htmlFor="sort">정렬기준</label>
                    </strong>
                    <div className="w-sort-btn">
                      <button
                        type="button"
                        className={sortType === 'INQ_CNT' ? 'active' : ''}
                        onClick={() => handleSortChange('INQ_CNT')}
                      >
                        조회순
                        {sortType === 'INQ_CNT' && <span className="sr-only">선택됨</span>}
                      </button>
                      <button
                        type="button"
                        className={sortType === 'REG_DT' ? 'active' : ''}
                        onClick={() => handleSortChange('REG_DT')}
                      >
                        등록순
                        {sortType === 'REG_DT' && <span className="sr-only">선택됨</span>}
                      </button>
                    </div>
                    <div className="m-sort-btn">
                      <select
                        className="krds-form-select-sort"
                        id="sort"
                        value={sortType}
                        onChange={(e) => handleSortChange(e.target.value)}
                      >
                        <option value="INQ_CNT">조회순</option>
                        <option value="REG_DT">등록순</option>
                      </select>
                    </div>
                  </li>
                </ul>
              </div>

              {/* 목록 */}
              <ul className="krds-structured-list type-full">
                {loading ? (
                  <li style={{ padding: '40px', textAlign: 'center' }}>
                    <span>로딩 중...</span>
                  </li>
                ) : dataList.length === 0 ? (
                  <li style={{ padding: '40px', textAlign: 'center' }}>
                    <span>조회된 데이터가 없습니다.</span>
                  </li>
                ) : (
                  dataList.map((item, index) => (
                    <li className="structured-item" key={item.plcyFnncNo || index}>
                      <div className="in">
                        {/* 카드 상단 - 배지 */}
                        <div className="card-top">
                          <div className="krds-badge-wrap">
                            <span className="krds-badge bg-light-success">신규</span>
                            <span className="krds-badge bg-light-primary">
                              {getProductTypeBadge(item.plcyFnncGdsTypeCd)}
                            </span>
                          </div>
                        </div>

                        {/* 카드 본문 */}
                        <div className="card-body">
                          <a href="#" className="c-text" onClick={(e) => {
                            e.preventDefault();
                            goToDetail(item.plcyFnncNo);
                          }}>
                            <p className="c-tit visited sml no-icon">
                              <span className="span">{item.plcyFnncNm}</span>
                            </p>
                            <p className="c-txt onellipsis-2">
                              {item.plcyFnncGdsPrps || '정책금융상품 상세설명'}
                            </p>
                            <p className="on-list-btm">
                              <span>
                                <i className="svg-icon ico-checkbox on-bgcolorblue"></i>
                                <strong className="on-colorblue">
                                  {getReceptionStatusBadge(item.plcyFnncNtslSttsCd).text}
                                </strong>
                              </span>
                              <span>
                                <strong>{item.bizFlfmtInstNm || '중소벤처기업부'}</strong>
                              </span>
                              <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '500px',  // 👈 필요에 따라 조절
                                display: 'inline-block',
                              }}>
                                <strong>지원대상</strong> {item.plcyFnncSprtTrgtCn || '미정'}
                              </span>
                            </p>
                          </a>
                        </div>

                        {/* 카드 하단 - 태그 */}
                        <div className="card-btm">
                          <span className="tag">정책금융</span>
                          <span className="tag">{getProductTypeBadge(item.plcyFnncGdsTypeCd)}</span>
                          <span className="tag">중소기업</span>
                          <span className="tag">기업자금</span>
                        </div>

                        {/* 카드 우측 - 조회수 & 좋아요 */}
                        <div className="card-btn">
                          <span className="krds-btn text">
                            <span className="sr-only">조회수</span>
                            <i className="svg-icon ico-pw-visible-on"></i>
                            <span>{item.inqCnt || 0}</span>
                          </span>
                          <button
                            type="button"
                            className="krds-btn text"
                            onClick={() => handleToggleLike(index)}
                          >
                            <i
                              className={`svg-icon ico-like ${
                                likedItems[index] ? 'on-bgcolored' : 'on-bgcolorgray'
                              }`}
                            ></i>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>

              {/* 페이징 */}
              {!loading && dataList.length > 0 && (
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage + 1}
                  onPageChange={handlePageChange}
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default UI_USR_L_030;
