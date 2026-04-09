import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Tab from '@components/ui/Tab';
import Pagination from '@components/ui/Pagination';
import noImg from '@assets/common/noImg.png';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
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

const BoardThumbnail = ({ boardDetail, bbsNo }) => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const navigate = useNavigate();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedCategoryNo, setSelectedCategoryNo] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchType, setAppliedSearchType] = useState('');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');

  const [categories, setCategories] = useState([]);
  const [isCategoryLoaded, setIsCategoryLoaded] = useState(false);
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const boardTitle = useMemo(() => boardDetail?.bbsNm || '썸네일 게시판', [boardDetail]);

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

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      if (isMounted) {
        setIsCategoryLoaded(false);
      }

      if (!bbsNo) {
        if (!isMounted) return;
        setCategories([]);
        setActiveTabIndex(0);
        setSelectedCategoryNo('');
        setIsCategoryLoaded(true);
        return;
      }

      try {
        const response = await apiClient.get(`/api/v1/board/${bbsNo}/categories`);
        const data = response?.data || {};
        if (!isMounted) return;
        const nextCategories = Array.isArray(data) ? data : [];
        setCategories(nextCategories);

        if (nextCategories.length > 0) {
          const initialCategoryNo = nextCategories[0]?.ctgryNo != null
            ? String(nextCategories[0].ctgryNo)
            : '';
          setActiveTabIndex(0);
          setSelectedCategoryNo(initialCategoryNo);
        } else {
          setActiveTabIndex(0);
          setSelectedCategoryNo('');
        }
      } catch (error) {
        if (!isMounted) return;
        setCategories([]);
        setActiveTabIndex(0);
        setSelectedCategoryNo('');
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
    if (categories.length > 0 && activeTabIndex >= categories.length) {
      const fallbackCategoryNo = categories[0]?.ctgryNo != null
        ? String(categories[0].ctgryNo)
        : '';
      setActiveTabIndex(0);
      setSelectedCategoryNo(fallbackCategoryNo);
    }
  }, [categories, activeTabIndex]);

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
          page: String(currentPage + 1),
          size: String(pageSize),
        });

        if (selectedCategoryNo) {
          params.append('ctgryNo', selectedCategoryNo);
        }

        if (appliedSearchKeyword.trim()) {
          params.append('searchType', appliedSearchType);
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
  }, [bbsNo, currentPage, pageSize, selectedCategoryNo, appliedSearchType, appliedSearchKeyword, isCategoryLoaded, categories.length]);

  const handleSearch = () => {
    setAppliedSearchType(searchType);
    setAppliedSearchKeyword(searchKeyword);
    setCurrentPage(0);
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    const selectedCategory = categories[index];
    setSelectedCategoryNo(selectedCategory?.ctgryNo != null ? String(selectedCategory.ctgryNo) : '');
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

  const moveToDetail = (pstNo) => {
    if (pstNo == null) return;
    const queryString = selectedCategoryNo
      ? `?ctgryNo=${encodeURIComponent(selectedCategoryNo)}`
      : '';
    navigate(`${pstNo}${queryString}`);
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
              className="krds-form-select"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
              <option value="">전체</option>
              <option value="TITLE">제목</option>
            </select>
            <div className="sch-input">
              <input
                type="text"
                className="krds-input"
                placeholder="검색어를 입력해 주세요."
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
          <Tab tabData={tabData} onTabChange={handleTabChange}></Tab>

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
                              <img
                                src={thumbnailSrc || noImg}
                                alt={thumbnailAlt}
                                onError={(event) => {
                                  if (event.currentTarget.src !== noImg) {
                                    event.currentTarget.src = noImg;
                                  }
                                }}
                              />
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

export default BoardThumbnail;
