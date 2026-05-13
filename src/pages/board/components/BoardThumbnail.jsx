import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Tab from '@components/ui/Tab';
import Pagination from '@components/ui/Pagination';
import RetryImage from '@components/ui/RetryImage.jsx';
import noImg from '@assets/common/noImg.png';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';

const appBaseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const ALLOWED_PAGE_SIZES = new Set([12, 24, 36]);
const ALLOWED_SEARCH_TYPES = new Set(['TITLE']);

const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
};

const resolveThumbnailSrc = (post) => {
  const rprsImgAtchFileId = String(post?.rprsImgAtchFileId ?? post?.rprs_img_atch_file_id ?? '').trim();
  const atchFileSn = String(post?.atchFileSn ?? post?.atchFileSn ?? '').trim();
  if (!rprsImgAtchFileId) return '';
  return `${appBaseUrl}/api/v1/board/thumbnails/${encodeURIComponent(rprsImgAtchFileId)}/${encodeURIComponent(atchFileSn)}`;
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
  const normalized = normalizeTrimmedText(value).toUpperCase();
  if (!normalized) return '';
  return ALLOWED_SEARCH_TYPES.has(normalized) ? normalized : '';
};

/**
 * 썸네일 게시판 목록 URL query 생성기.
 *
 * 의도: 탭/검색/페이지 상태를 컴포넌트 내부 state에만 두지 않고 URL에 남겨,
 * 상세 화면에서 목록으로 돌아와도 사용자가 보던 조건을 복원하기 위해 필요하다.
 * 동작: 기존 query를 기준으로 ctgryNo/page/size/searchType/searchKeyword만 정규화해서 갱신하고,
 * 기본값은 제거해 기존 기본 진입 URL을 최대한 유지한다.
 * 주의: ctgryNo는 게시판별 서버 카테고리 값이므로 여기서 하드코딩하지 않고,
 * 호출부에서 현재 선택된 카테고리 번호를 전달해야 한다.
 */
const buildThumbnailListSearchParams = ({
  currentSearchParams,
  page,
  size,
  searchType,
  searchKeyword,
  categoryNo,
}) => {
  const params = new URLSearchParams(currentSearchParams);
  const normalizedKeyword = normalizeTrimmedText(searchKeyword);
  const normalizedSearchType = normalizeSearchType(searchType);
  const normalizedCategoryNo = normalizeTrimmedText(categoryNo);
  const normalizedPage = normalizePositiveInt(page, DEFAULT_PAGE);
  const normalizedSize = normalizePageSize(size);

  if (normalizedCategoryNo) {
    params.set('ctgryNo', normalizedCategoryNo);
  } else {
    params.delete('ctgryNo');
  }

  if (normalizedPage > DEFAULT_PAGE) {
    params.set('page', String(normalizedPage));
  } else {
    params.delete('page');
  }

  if (normalizedSize !== DEFAULT_PAGE_SIZE) {
    params.set('size', String(normalizedSize));
  } else {
    params.delete('size');
  }

  if (normalizedKeyword) {
    params.set('searchType', normalizedSearchType);
    params.set('searchKeyword', normalizedKeyword);
  } else {
    params.delete('searchType');
    params.delete('searchKeyword');
  }

  return params;
};

const BoardThumbnail = ({ boardDetail, bbsNo }) => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchType, setSearchType] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [categories, setCategories] = useState([]);
  const [isCategoryLoaded, setIsCategoryLoaded] = useState(false);
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const boardTitle = useMemo(() => boardDetail?.bbsNm || '썸네일 게시판', [boardDetail]);
  const shouldRetryThumbnail = String(bbsNo ?? '') === '64';

  const boardTypeCd = useMemo(() => {
    const rawBoardTypeCd = boardDetail?.bbs_type_cd ?? boardDetail?.bbsTypeCd ?? '';
    return String(rawBoardTypeCd).trim().toUpperCase();
  }, [boardDetail]);

  const defaultBadgeLabel = useMemo(() => {
    if (boardTypeCd === 'VDO') return '영상';
    if (boardTypeCd === 'IMG') return '이미지';
    return '게시물';
  }, [boardTypeCd]);

  const tabData = useMemo(
    () => [...categories.map((category) => category?.ctgryNm || '-')],
    [categories],
  );

  const normalizedQueryState = useMemo(() => ({
    page: normalizePositiveInt(searchParams.get('page'), DEFAULT_PAGE),
    size: normalizePageSize(searchParams.get('size')),
    searchType: normalizeSearchType(searchParams.get('searchType')),
    searchKeyword: normalizeTrimmedText(searchParams.get('searchKeyword')),
    categoryNo: normalizeTrimmedText(searchParams.get('ctgryNo')),
  }), [searchParams]);

  const resolvedCategoryState = useMemo(() => {
    if (categories.length === 0) {
      return {
        activeTabIndex: 0,
        selectedCategoryNo: '',
      };
    }

    const queryCategoryIndex = categories.findIndex((category) => {
      const categoryNo = normalizeTrimmedText(category?.ctgryNo);
      return categoryNo && categoryNo === normalizedQueryState.categoryNo;
    });

    if (queryCategoryIndex >= 0) {
      return {
        activeTabIndex: queryCategoryIndex,
        selectedCategoryNo: normalizedQueryState.categoryNo,
      };
    }

    const fallbackCategoryNo = categories[0]?.ctgryNo != null
      ? String(categories[0].ctgryNo)
      : '';

    return {
      activeTabIndex: 0,
      selectedCategoryNo: fallbackCategoryNo,
    };
  }, [categories, normalizedQueryState.categoryNo]);

  const { activeTabIndex, selectedCategoryNo } = resolvedCategoryState;

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      if (isMounted) {
        setIsCategoryLoaded(false);
      }

      if (!bbsNo) {
        if (!isMounted) return;
        setCategories([]);
        setIsCategoryLoaded(true);
        return;
      }

      try {
        const response = await apiClient.get(`/api/v1/board/${bbsNo}/categories`);
        const data = response?.data || {};
        if (!isMounted) return;
        const nextCategories = Array.isArray(data) ? data : [];
        setCategories(nextCategories);
      } catch (error) {
        if (!isMounted) return;
        setCategories([]);
        console.error('썸네일 게시판 카테고리 조회 실패:', error);
      } finally {
        if (isMounted) {
          setIsCategoryLoaded(true);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [bbsNo]);

  useEffect(() => {
    setSearchType(normalizedQueryState.searchType);
    setSearchKeyword(normalizedQueryState.searchKeyword);
  }, [normalizedQueryState.searchType, normalizedQueryState.searchKeyword]);

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

      // 카테고리 로딩/초기 선택값 확정 전에 목록을 조회하면 전체 건수로 먼저 조회되는 문제가 있어 가드한다.
      if (!isCategoryLoaded) {
        return;
      }

      if (categories.length > 0 && !selectedCategoryNo) {
        return;
      }

      try {
        if (!isMounted) return;
        setLoading(true);

        const params = new URLSearchParams({
          page: String(normalizedQueryState.page),
          size: String(normalizedQueryState.size),
        });

        if (selectedCategoryNo) {
          params.append('ctgryNo', selectedCategoryNo);
        }

        if (normalizedQueryState.searchKeyword) {
          if (normalizedQueryState.searchType) {
            params.append('searchType', normalizedQueryState.searchType);
          }
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
        console.error('썸네일 게시판 목록 조회 실패:', error);
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
    selectedCategoryNo,
    isCategoryLoaded,
    categories.length,
  ]);

  const handleSearch = () => {
    const nextSearchParams = buildThumbnailListSearchParams({
      currentSearchParams: searchParams,
      page: DEFAULT_PAGE,
      size: normalizedQueryState.size,
      searchType,
      searchKeyword,
      categoryNo: selectedCategoryNo,
    });
    setSearchParams(nextSearchParams);
  };

  const handleTabChange = (index) => {
    const selectedCategory = categories[index];
    const nextCategoryNo = selectedCategory?.ctgryNo != null ? String(selectedCategory.ctgryNo) : '';
    const nextSearchParams = buildThumbnailListSearchParams({
      currentSearchParams: searchParams,
      page: DEFAULT_PAGE,
      size: normalizedQueryState.size,
      searchType: normalizedQueryState.searchType,
      searchKeyword: normalizedQueryState.searchKeyword,
      categoryNo: nextCategoryNo,
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
    const nextSearchParams = buildThumbnailListSearchParams({
      currentSearchParams: searchParams,
      page: DEFAULT_PAGE,
      size: event.target.value,
      searchType: normalizedQueryState.searchType,
      searchKeyword: normalizedQueryState.searchKeyword,
      categoryNo: selectedCategoryNo,
    });
    setSearchParams(nextSearchParams);
  };

  const moveToDetail = (pstNo) => {
    if (pstNo == null) return;
    const detailSearchParams = buildThumbnailListSearchParams({
      currentSearchParams: searchParams,
      page: normalizedQueryState.page,
      size: normalizedQueryState.size,
      searchType: normalizedQueryState.searchType,
      searchKeyword: normalizedQueryState.searchKeyword,
      categoryNo: selectedCategoryNo,
    });
    const queryString = detailSearchParams.toString();
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
            <select
              className="krds-form-select medium"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
              <option value="">전체</option>
              <option value="TITLE">제목</option>
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

        <div className="krds-tab-area layer">
          <Tab tabData={tabData} onTabChange={handleTabChange} activeIndex={activeTabIndex}></Tab>

          <div className="tab-conts-wrap">
            <section className={`tab-conts ${activeTabIndex >= 0 ? 'active' : ''}`}>
              <h3 className="sr-only">{tabData[activeTabIndex] || '전체'}</h3>

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
                      <option value={12}>12개</option>
                      <option value={24}>24개</option>
                      <option value={36}>36개</option>
                    </select>
                  </li>
                </ul>
              </div>

              <ul className="krds-structured-list">
                {loading ? (
                  <li className="structured-item">
                    <div className="card-body">
                      <div className="c-text">
                        <p className="c-tit no-icon">
                          <span className="span">로딩 중입니다.</span>
                        </p>
                      </div>
                    </div>
                  </li>
                ) : postList.length === 0 ? (
                  <li className="structured-item">
                    <div className="card-body">
                      <div className="c-text">
                        <p className="c-tit no-icon">
                          <span className="span">조회된 게시물이 없습니다.</span>
                        </p>
                      </div>
                    </div>
                  </li>
                ) : (
                  postList.map((item, index) => {
                    const thumbnailSrc = resolveThumbnailSrc(item);
                    const thumbnailAlt = item?.pstTtl || '';
                    const sourceName = String(item?.pstSrcCn ?? item?.pst_src_cn ?? '').trim();

                    return (
                      <li key={item?.pstNo ?? `${item?.pstTtl ?? 'thumbnail'}-${index}`} className="structured-item">
                        <div className="card-body">
                          <a
                            href="#"
                            className="c-text"
                            onClick={(event) => {
                              event.preventDefault();
                              moveToDetail(item?.pstNo);
                            }}
                          >
                            <div className={`ongallery-thumnb ${thumbnailSrc ? '' : 'noImage'}`}>
                              {shouldRetryThumbnail ? (
                                <RetryImage
                                  src={thumbnailSrc}
                                  fallbackSrc={noImg}
                                  alt={thumbnailAlt}
                                />
                              ) : (
                                <img
                                  src={thumbnailSrc || noImg}
                                  alt={thumbnailAlt}
                                  onError={(event) => {
                                    if (event.currentTarget.src !== noImg) {
                                      event.currentTarget.src = noImg;
                                    }
                                  }}
                                />
                              )}
                            </div>
                            <div className="krds-badge-wrap">
                              <span className="krds-badge bg-light-primary">{sourceName || defaultBadgeLabel}</span>
                            </div>
                            <p className="c-tit no-icon">
                              <span className="span onellipsis-2">{item?.pstTtl || '-'}</span>
                            </p>
                            <div className="c-date type2">
                              <p>
                                <strong className="key">일자</strong>
                                <span className="value">{formatDate(item?.pstRegDt ?? item?.regDt)}</span>
                              </p>
                              <p>
                                <span className="sr-only">조회수</span>
                                <i className="ml-auto svg-icon ico-pw-visible-on"></i>
                                <span>{item?.inqCnt ?? 0}</span>
                              </p>
                            </div>
                          </a>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>

              {!loading && totalPages > 0 && (
                <Pagination
                  totalPages={totalPages}
                  currentPage={normalizedQueryState.page}
                  onPageChange={handlePageChange}
                  syncUrl
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardThumbnail;
