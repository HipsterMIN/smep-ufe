import { useEffect, useMemo, useState } from 'react';
import { useLocation, useMatches, useNavigate, useSearchParams } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Tab from '@components/ui/Tab';
import Pagination from '@components/ui/Pagination';
import RetryImage from '@components/ui/RetryImage.jsx';
import noImg from '@assets/common/noImg.png';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import {
  appendListSearchToPath,
  getNumberSearchParam,
  getSearchParam,
  setQueryParam,
} from '@utils/listNavigation.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';

const appBaseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

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

const UI_USR_L_100 = () => {
  const matches = useMatches();
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [boardDetail, setBoardDetail] = useState(null);
  const [categories, setCategories] = useState([]);
  const [postList, setPostList] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedCategoryNo, setSelectedCategoryNo] = useState(() => getSearchParam(location.search, 'ctgryNo', ''));
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => Math.max(0, getNumberSearchParam(location.search, 'page', 1) - 1));
  const [pageSize, setPageSize] = useState(() => getNumberSearchParam(location.search, 'size', 12));

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const bbsNo = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    return [...matches]
      .reverse()
      .find((match) => match?.handle?.bbsNo != null)?.handle?.bbsNo ?? currentMatch?.handle?.bbsNo;
  }, [matches]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const fetchBoardDetail = async () => {
      if (bbsNo == null || bbsNo === '') {
        if (!isMounted) return;
        setBoardDetail(null);
        return;
      }

      try {
        const response = await apiClient.get(`/api/v1/board/${bbsNo}`);
        if (!isMounted) return;
        setBoardDetail(response?.data ?? null);
      } catch (error) {
        if (!isMounted) return;
        setBoardDetail(null);
      }
    };

    fetchBoardDetail();

    return () => {
      isMounted = false;
    };
  }, [bbsNo]);

  const isCategoryEnabled = useMemo(() => {
    const raw = boardDetail?.ctgryUseYn ?? boardDetail?.ctgry_use_yn ?? '';
    return String(raw).trim().toUpperCase() === 'Y';
  }, [boardDetail]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const fetchCategories = async () => {
      if (!bbsNo || !isCategoryEnabled) {
        if (!isMounted) return;
        setCategories([]);
        setSelectedCategoryNo('');
        setActiveTabIndex(0);
        return;
      }

      try {
        const response = await apiClient.get(`/api/v1/board/${bbsNo}/categories`);
        const data = response?.data || [];
        if (!isMounted) return;

        const categoryList = Array.isArray(data)
          ? data.filter((category) => String(category?.useYn ?? 'Y').toUpperCase() === 'Y')
          : [];

        setCategories(categoryList);
      } catch (error) {
        if (!isMounted) return;
        setCategories([]);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [bbsNo, isCategoryEnabled]);

  useEffect(() => {
    if (!isCategoryEnabled) return;
    if (activeTabIndex > categories.length) {
      setActiveTabIndex(0);
      setSelectedCategoryNo('');
      setCurrentPage(0);
    }
  }, [isCategoryEnabled, activeTabIndex, categories]);

  useEffect(() => {
    if (!isCategoryEnabled) {
      setActiveTabIndex(0);
      return;
    }

    if (!selectedCategoryNo) {
      setActiveTabIndex(0);
      return;
    }

    const categoryIndex = categories.findIndex(
      (category) => String(category?.ctgryNo ?? '') === String(selectedCategoryNo),
    );

    if (categoryIndex >= 0) {
      setActiveTabIndex(categoryIndex + 1);
    } else if (categories.length > 0) {
      setSelectedCategoryNo('');
      setActiveTabIndex(0);
      setCurrentPage(0);
    }
  }, [isCategoryEnabled, categories, selectedCategoryNo]);

  const buildListSearchParams = () => {
    const params = new URLSearchParams();
    setQueryParam(params, 'page', currentPage + 1, 1);
    setQueryParam(params, 'size', pageSize, 12);
    setQueryParam(params, 'ctgryNo', selectedCategoryNo);
    return params;
  };

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
        setSearchParams(buildListSearchParams(), { replace: true });

        const params = new URLSearchParams({
          page: String(currentPage + 1),
          size: String(pageSize),
        });

        if (selectedCategoryNo) {
          params.append('ctgryNo', selectedCategoryNo);
        }

        const response = await apiClient.get(`/api/v1/board/${bbsNo}/posts/list?${params.toString()}`);
        const data = response?.data || {};

        if (!isMounted) return;
        setPostList(Array.isArray(data?.content) ? data.content : []);
        setTotalElements(data?.totalElements || 0);
        setTotalPages(data?.totalPages || 0);
      } catch (error) {
        if (!isMounted) return;
        setPostList([]);
        setTotalElements(0);
        setTotalPages(0);
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
  }, [bbsNo, currentPage, pageSize, selectedCategoryNo]);

  const boardTitle = useMemo(
    () => boardDetail?.bbsNm || depth1Menu?.menuNm || '월간중기누리',
    [boardDetail, depth1Menu],
  );

  const tabData = useMemo(() => {
    if (!isCategoryEnabled) {
      return ['전체'];
    }
    return ['전체', ...categories.map((category) => category?.ctgryNm || '-')];
  }, [isCategoryEnabled, categories]);

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    if (!isCategoryEnabled || index === 0) {
      setSelectedCategoryNo('');
    } else {
      const selectedCategory = categories[index - 1];
      setSelectedCategoryNo(selectedCategory?.ctgryNo != null ? String(selectedCategory.ctgryNo) : '');
    }
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
    window.scrollTo(0, 0);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0);
  };

  const moveToDetail = (pstNo) => {
    if (pstNo == null) return;
    navigate(appendListSearchToPath(`${pstNo}`, buildListSearchParams().toString()));
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
                      value={pageSize}
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
                        <p className="c-tit no-icon"><span className="span">로딩 중입니다.</span></p>
                      </div>
                    </div>
                  </li>
                ) : postList.length === 0 ? (
                  <li className="structured-item">
                    <div className="card-body">
                      <div className="c-text">
                        <p className="c-tit no-icon"><span className="span">조회된 게시물이 없습니다.</span></p>
                      </div>
                    </div>
                  </li>
                ) : (
                  postList.map((item, index) => {
                    const thumbnailSrc = resolveThumbnailSrc(item);
                    const badgeLabel = String(item?.ctgryNm ?? item?.pstSrcCn ?? '').trim() || '게시물';

                    return (
                      <li key={item?.pstNo ?? `${item?.pstTtl ?? 'post'}-${index}`} className="structured-item">
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
                              <RetryImage
                                src={thumbnailSrc}
                                fallbackSrc={noImg}
                                alt={item?.pstTtl || ''}
                              />
                            </div>
                            <div className="krds-badge-wrap">
                              <span className="krds-badge bg-light-primary">{badgeLabel}</span>
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
                  currentPage={currentPage + 1}
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

export default UI_USR_L_100;
