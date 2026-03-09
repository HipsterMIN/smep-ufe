import { useEffect, useMemo, useState } from 'react';
import { useMatches } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Tab from '@components/ui/Tab';
import Pagination from '@components/ui/Pagination';
import noImg from '@assets/common/noImg.png';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

const IMAGE_URL_PATTERN = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i;

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
  const candidates = [
    post?.thumbnailUrl,
    post?.thumbnail_url,
    post?.thmbnUrl,
    post?.thmbn_url,
    post?.thmbnUrlAddr,
    post?.thmbn_url_addr,
    post?.imgUrl,
    post?.img_url,
    post?.rprsImgUrl,
    post?.rprs_img_url,
    post?.rprsImgUrlAddr,
    post?.rprs_img_url_addr,
    post?.rprsImgAtchFiles?.[0]?.fileUrlAddr,
    post?.rprsImgAtchFiles?.[0]?.file_url_addr,
    post?.rprsImgAtchFiles?.[0]?.url,
    post?.rprsImgAtchFiles?.[0]?.fileUrl,
    post?.rprsImgAtchFiles?.[0]?.file_url,
  ];

  const directUrl = candidates.find((value) => typeof value === 'string' && value.trim() !== '');
  if (directUrl) {
    return directUrl.trim();
  }

  const pstUrlAddr = String(post?.pstUrlAddr ?? '').trim();
  if (pstUrlAddr && IMAGE_URL_PATTERN.test(pstUrlAddr)) {
    return pstUrlAddr;
  }

  return '';
};

const UI_USR_L_100 = () => {
  const matches = useMatches();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [boardDetail, setBoardDetail] = useState(null);
  const [categories, setCategories] = useState([]);
  const [postList, setPostList] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedCategoryNo, setSelectedCategoryNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const bbsNo = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    return [...matches]
      .reverse()
      .find((match) => match?.handle?.bbsNo != null)?.handle?.bbsNo ?? currentMatch?.handle?.bbsNo;
  }, [matches]);

  useEffect(() => {
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
        console.error('게시판 상세 조회 실패:', error);
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
        console.error('게시판 카테고리 조회 실패:', error);
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
        console.error('게시물 목록 조회 실패:', error);
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
    () => boardDetail?.bbsNm || depth1Menu?.menuNm || '정책중기누리',
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
          <Tab tabData={tabData} onTabChange={handleTabChange}></Tab>

          <div className="tab-conts-wrap">
            <section className={`tab-conts ${activeTabIndex >= 0 ? 'active' : ''}`}>
              <h3 className="sr-only">{tabData[activeTabIndex] || '전체'}</h3>

              <div className="search-list-top">
                <ul className="sch-info" aria-live="polite">
                  <li>검색 결과 <span className="point">{totalElements}</span>개</li>
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
                    const postLink = String(item?.pstUrlAddr ?? '').trim();
                    const isExternalLink = /^https?:\/\//i.test(postLink);

                    return (
                      <li key={item?.pstNo ?? `${item?.pstTtl ?? 'post'}-${index}`} className="structured-item">
                        <div className="card-body">
                          <a
                            href={postLink || '#'}
                            className="c-text"
                            target={isExternalLink ? '_blank' : undefined}
                            rel={isExternalLink ? 'noreferrer' : undefined}
                            onClick={(event) => {
                              if (!postLink) {
                                event.preventDefault();
                              }
                            }}
                          >
                            <div className={`ongallery-thumnb ${thumbnailSrc ? '' : 'noImage'}`}>
                              <img
                                src={thumbnailSrc || noImg}
                                alt={item?.pstTtl || ''}
                                onError={(event) => {
                                  if (event.currentTarget.src !== noImg) {
                                    event.currentTarget.src = noImg;
                                  }
                                }}
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
                                <span>{item?.inqCnt ?? '-'}</span>
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
