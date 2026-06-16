import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Pagination from '@components/ui/Pagination.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const ALLOWED_PAGE_SIZES = new Set([10, 20, 30]);
const ALLOWED_SEARCH_TYPES = new Set(['TITLE', 'CONTENT', 'WRITER']);

const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const normalizeTrimmedText = (value) => String(value ?? '').trim();

const normalizePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizePageSize = (value) => {
  const normalized = normalizePositiveInt(value, DEFAULT_PAGE_SIZE);
  return ALLOWED_PAGE_SIZES.has(normalized) ? normalized : DEFAULT_PAGE_SIZE;
};

const normalizeSearchType = (value) => {
  if (value == null) {
    return 'TITLE';
  }

  const normalized = normalizeTrimmedText(value).toUpperCase();
  if (normalized === '') {
    return '';
  }

  return ALLOWED_SEARCH_TYPES.has(normalized) ? normalized : 'TITLE';
};

const buildBoardListSearchParams = ({
  currentSearchParams,
  page,
  size,
  searchType,
  searchKeyword,
  categoryNo,
  isCategoryEnabled,
}) => {
  const params = new URLSearchParams(currentSearchParams);
  const normalizedKeyword = normalizeTrimmedText(searchKeyword);
  const normalizedCategoryNo = isCategoryEnabled ? normalizeTrimmedText(categoryNo) : '';
  const normalizedSearchType = normalizeSearchType(searchType);

  if (page > DEFAULT_PAGE) {
    params.set('page', String(page));
  } else {
    params.delete('page');
  }

  if (size !== DEFAULT_PAGE_SIZE) {
    params.set('size', String(size));
  } else {
    params.delete('size');
  }

  if (normalizedCategoryNo) {
    params.set('ctgryNo', normalizedCategoryNo);
  } else {
    params.delete('ctgryNo');
  }

  // 검색어가 비면 searchType도 같이 정리해 통합검색 query 의미와 목록 기본 진입을 구분한다.
  if (normalizedKeyword) {
    params.set('searchType', normalizedSearchType);
    params.set('searchKeyword', normalizedKeyword);
  } else {
    params.delete('searchType');
    params.delete('searchKeyword');
  }

  return params;
};

const BoardBasic = ({ boardDetail, bbsNo }) => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategoryNo, setSelectedCategoryNo] = useState('');
  const [searchType, setSearchType] = useState('TITLE');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [categories, setCategories] = useState([]);
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const nonPinnedPosts = useMemo(
    () => postList.filter((item) => item?.upendPstgYn !== 'Y'),
    [postList],
  );

  const isCategoryEnabled = useMemo(() => {
    const raw = boardDetail?.ctgryUseYn ?? boardDetail?.ctgry_use_yn ?? '';
    return String(raw).trim().toUpperCase() === 'Y';
  }, [boardDetail]);

  const normalizedQueryState = useMemo(() => {
    const queryPage = normalizePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
    const querySize = normalizePageSize(searchParams.get('size'));
    const querySearchType = normalizeSearchType(searchParams.get('searchType'));
    const querySearchKeyword = normalizeTrimmedText(searchParams.get('searchKeyword'));
    const queryCategoryNo = normalizeTrimmedText(searchParams.get('ctgryNo'));

    return {
      page: queryPage,
      size: querySize,
      searchType: querySearchType,
      searchKeyword: querySearchKeyword,
      categoryNo: queryCategoryNo,
    };
  }, [searchParams]);

  const effectiveCategoryNo = isCategoryEnabled ? normalizedQueryState.categoryNo : '';

  // 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      if (!bbsNo || !isCategoryEnabled) {
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
        console.error('Q&A 카테고리 조회 실패:', error);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [bbsNo, isCategoryEnabled]);

  // Pagination.syncUrl는 page만 다루므로, 목록 query hydrate는 부모가 직접 맡는다.
  useEffect(() => {
    setSearchType(normalizedQueryState.searchType);
    setSearchKeyword(normalizedQueryState.searchKeyword);
    setSelectedCategoryNo(effectiveCategoryNo);
  }, [
    normalizedQueryState.searchType,
    normalizedQueryState.searchKeyword,
    effectiveCategoryNo,
  ]);

  const boardTitle = useMemo(() => boardDetail?.bbsNm || '공지사항', [boardDetail]);

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
          page: String(normalizedQueryState.page),
          size: String(normalizedQueryState.size),
        });

        if (effectiveCategoryNo) {
          params.append('ctgryNo', effectiveCategoryNo);
        }

        if (normalizedQueryState.searchKeyword) {
          params.append('searchType', normalizedQueryState.searchType);
          params.append('searchKeyword', normalizedQueryState.searchKeyword);
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
        console.error('게시글 목록 조회 실패:', error);
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
  }, [
    bbsNo,
    normalizedQueryState.page,
    normalizedQueryState.size,
    normalizedQueryState.searchType,
    normalizedQueryState.searchKeyword,
    effectiveCategoryNo,
  ]);

  const handleSearch = () => {
    const nextSearchParams = buildBoardListSearchParams({
      currentSearchParams: searchParams,
      page: DEFAULT_PAGE,
      size: normalizedQueryState.size,
      searchType,
      searchKeyword,
      categoryNo: selectedCategoryNo,
      isCategoryEnabled,
    });
    setSearchParams(nextSearchParams);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = () => {
    window.scrollTo(0, 0);
  };

  const handlePageSizeChange = (event) => {
    const nextPageSize = normalizePageSize(event.target.value);
    const nextSearchParams = buildBoardListSearchParams({
      currentSearchParams: searchParams,
      page: DEFAULT_PAGE,
      size: nextPageSize,
      searchType: normalizedQueryState.searchType,
      searchKeyword: normalizedQueryState.searchKeyword,
      categoryNo: effectiveCategoryNo,
      isCategoryEnabled,
    });
    setSearchParams(nextSearchParams);
  };

  const moveToDetail = (pstNo) => {
    if (pstNo == null) return;
    const queryString = searchParams.toString();
    navigate(queryString ? `${pstNo}?${queryString}` : `${pstNo}`);
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
          <h2 className="h-tit">{boardTitle}</h2>
        </div>
        <div className="search-top-box">
          <div className="sch-form-wrap">
            {isCategoryEnabled && (
              <select
                className="krds-form-select medium"
                value={selectedCategoryNo}
                onChange={(event) => setSelectedCategoryNo(event.target.value)}
              >
                <option value="">구분 전체</option>
                {categories.map((category) => (
                  <option key={category?.ctgryNo} value={String(category?.ctgryNo ?? '')}>
                    {category?.ctgryNm || '-'}
                  </option>
                ))}
              </select>
            )}
            <select
              className="krds-form-select medium"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
              <option value="">전체</option>
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
                value={normalizedQueryState.size}
                onChange={handlePageSizeChange}
              >
                <option value={10}>10개</option>
                <option value={20}>20개</option>
                <option value={30}>30개</option>
              </select>
            </li>
          </ul>
        </div>
        {/* table [S] */}
        <div className="krds-table-wrap">
          <table className="tbl col data t-block">
            <caption>공지사항 목록. 번호, 제목, 등록일, 조회수 정보가 제공됩니다.</caption>
            <colgroup>
              <col style={{ width: '7.4 %' }}/>
              <col/>
              <col style={{ width: '14%' }}/>
              <col style={{ width: '7.4 %' }}/>
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">번호</th>
                <th scope="col" className="ac">제목</th>
                <th scope="col" className="ac">등록일</th>
                <th scope="col" className="ac">조회</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="ac" colSpan={4}>
                    <span>로딩 중입니다.</span>
                  </td>
                </tr>
              ) : postList.length === 0 ? (
                <tr>
                  <td className="ac" colSpan={4}>
                    <span>조회된 데이터가 없습니다.</span>
                  </td>
                </tr>
              ) : (
                postList.map((item, index) => {
                  const nonPinnedIndex = nonPinnedPosts.findIndex(
                    (nonPinnedItem) => nonPinnedItem?.pstNo === item?.pstNo,
                  );

                  const rowNo =
                      nonPinnedIndex === -1
                        ? '-'
                        : (normalizedQueryState.page - 1) * normalizedQueryState.size + (nonPinnedIndex + 1);

                  return (
                    <tr key={item?.pstNo ?? `${item?.pstTtl ?? 'post'}-${index}`}>
                      <th scope="row" className="ac">
                        {item?.upendPstgYn === 'Y' ? (
                          <>
                            <i className="svg-icon ico-pin"></i>
                            <span className="sr-only">고정 게시글</span>
                          </>
                        ) : (
                          <span>{rowNo}</span>
                        )}
                      </th>
                      <td>
                        <a
                          className={`onellipsis-1 ${item?.upendPstgYn === 'Y' ? 'notice-pinned' : ''} flex-row`}
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();
                            moveToDetail(item?.pstNo);
                          }}
                        >
                          {item?.upendPstgYn === 'Y' && <span className="krds-badge bg-light-primary">공지</span>}
                          <span>{item?.pstTtl || '-'}</span>
                        </a>
                      </td>
                      <td className="ac">
                        <span>{formatDate(item?.pstRegDt ?? item?.regDt)}</span>
                      </td>
                      <td className="ac views">
                        <span>{item?.inqCnt ?? 0}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* table [E] */}
        {!loading && totalPages > 0 && (
          <Pagination
            totalPages={totalPages}
            currentPage={normalizedQueryState.page}
            onPageChange={handlePageChange}
            syncUrl
          />
        )}
      </div>
    </>
  );
};

export default BoardBasic;
