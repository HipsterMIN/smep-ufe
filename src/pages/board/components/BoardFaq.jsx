import React, {useEffect, useMemo, useState} from 'react';
import {useMatches, useSearchParams} from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import Tab from '@components/ui/Tab';
import Accordion from '@components/ui/Accordion';
import {useUserMenu} from '@context/UserMenuContext.jsx';
import {api as apiClient} from '@lib/apiClient.js';
import {formatNumberWithCommas} from '@utils/numberUtils.js';

const stripHtmlTags = (value) => {
  if (!value) return '';
  return String(value).replace(/<[^>]*>/g, '').trim();
};

const BoardFaq = ({ bbsNo }) => {const matches = useMatches();
  const pageTitle = [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '자주 묻는 질문';
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const [searchParams] = useSearchParams();

  const [searchType, setSearchType] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchType, setAppliedSearchType] = useState('ALL');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');

  const [categories, setCategories] = useState([]);
  const [selectedCategoryNo, setSelectedCategoryNo] = useState('');

  const [postList, setPostList] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const querySearchKeyword = String(searchParams.get('searchKeyword') ?? '').trim();
  const rawQuerySearchType = String(searchParams.get('searchType') ?? '').trim().toUpperCase();
  const querySearchType = ['TITLE', 'CONTENT'].includes(rawQuerySearchType)
    ? rawQuerySearchType
    : 'ALL';

  // 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const tabData = useMemo(
    () => ['전체', ...categories.map((category) => category?.ctgryNm || '-')],
    [categories],
  );

  useEffect(() => {
    setSearchType(querySearchType);
    setAppliedSearchType(querySearchType);
    setSearchKeyword(querySearchKeyword);
    setAppliedSearchKeyword(querySearchKeyword);
    setCurrentPage(0);
  }, [querySearchKeyword, querySearchType]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      if (!bbsNo) {
        if (!isMounted) return;
        setCategories([]);
        return;
      }

      try {
        const response = await apiClient.get(`/api/v1/board/${bbsNo}/categories`);
        const data = response?.data || {};
        if (!isMounted) return;
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!isMounted) return;
        setCategories([]);
        console.error('게시판 카테고리 조회 실패:', error);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [bbsNo]);

  useEffect(() => {
    let isMounted = true;

    const fetchPostList = async () => {
      if (!bbsNo) {
        if (!isMounted) return;
        setPostList([]);
        setTotalElements(0);
        setTotalPages(0);
        return;
      }

      try {
        if (!isMounted) return;
        setLoading(true);

        const params = new URLSearchParams({
          page: String(currentPage + 1),
          size: String(pageSize),
        });

        if (selectedCategoryNo) {
          params.append('ctgryNo', selectedCategoryNo);
        }

        if (appliedSearchKeyword.trim()) {
          if (appliedSearchType && appliedSearchType !== 'ALL') {
            params.append('searchType', appliedSearchType);
          }
          params.append('searchKeyword', appliedSearchKeyword.trim());
        }

        const response = await apiClient.get(`/api/v1/board/${bbsNo}/posts/list?${params.toString()}`);
        const data = response?.data || {};

        if (!isMounted) return;
        setPostList(data?.content || []);
        setTotalElements(data?.totalElements || 0);
        setTotalPages(data?.totalPages || 0);
      } catch (error) {
        if (!isMounted) return;
        setPostList([]);
        setTotalElements(0);
        setTotalPages(0);
        console.error('FAQ 목록 조회 실패:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPostList();

    return () => {
      isMounted = false;
    };
  }, [bbsNo, currentPage, pageSize, selectedCategoryNo, appliedSearchType, appliedSearchKeyword]);

  const handleTabChange = (index) => {
    if (index === 0) {
      setSelectedCategoryNo('');
    } else {
      const selectedCategory = categories[index - 1];
      setSelectedCategoryNo(selectedCategory?.ctgryNo != null ? String(selectedCategory.ctgryNo) : '');
    }
    setCurrentPage(0);
  };

  const handleSearch = () => {
    setAppliedSearchType(searchType);
    setAppliedSearchKeyword(searchKeyword);
    setCurrentPage(0);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
    window.scrollTo(0, 0);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0);
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
          <h2 className="h-tit">{pageTitle}</h2>
        </div>

        <div className="search-top-box">
          <div className="sch-form-wrap">
            <select
              className="krds-form-select"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
              <option value="ALL">전체</option>
              <option value="TITLE">제목</option>
              <option value="CONTENT">내용</option>
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
            <li>검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>개</li>
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
                <option value={10}>10개</option>
                <option value={20}>20개</option>
                <option value={30}>30개</option>
                <option value={50}>50개</option>
              </select>
            </li>
          </ul>
        </div>

        <Accordion type="single"> {/* multi인 경우 type="multi" */}
          {loading ? (
            <Accordion.Item>
              <Accordion.Header>
                <div className="accordion-title">
                  <span className="krds-badge bg-light-primary">안내</span>
                  <p className="onellipsis-1">로딩 중입니다.</p>
                </div>
              </Accordion.Header>
              <Accordion.Panel>
                <div className="accordion-panel-box">
                  <p>목록을 불러오고 있습니다.</p>
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          ) : postList.length === 0 ? (
            <Accordion.Item>
              <Accordion.Header>
                <div className="accordion-title">
                  <span className="krds-badge bg-light-primary">안내</span>
                  <p className="onellipsis-1">조회된 데이터가 없습니다.</p>
                </div>
              </Accordion.Header>
              <Accordion.Panel>
                <div className="accordion-panel-box">
                  <p>등록된 FAQ가 없습니다.</p>
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          ) : (
            postList.map((item, index) => (
              <Accordion.Item key={item?.pstNo ?? `${item?.pstTtl ?? 'faq'}-${index}`}>
                <Accordion.Header>
                  <div className="accordion-title">
                    <span className="krds-badge bg-light-primary">{item?.ctgryNm || 'FAQ'}</span>
                    <p className="onellipsis-1">{stripHtmlTags(item?.pstTtl) || '-'}</p>
                  </div>
                </Accordion.Header>
                <Accordion.Panel>
                  <div className="accordion-panel-box">
                    <div dangerouslySetInnerHTML={{ __html: item?.pstCn || '-' }} />
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            ))
          )}
        </Accordion>

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

export default BoardFaq;
