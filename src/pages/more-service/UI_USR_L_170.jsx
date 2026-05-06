import { useEffect, useMemo, useState } from 'react';
import { useMatches, useSearchParams } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Pagination from '@components/ui/Pagination.jsx';
import ImgFormat from '@assets/sub/img_business_format_01.jpg';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient, apiBaseUrl } from '@lib/apiClient.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';

const APP_BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

const stripHtmlTags = (value) => {
  if (!value) return '';

  const noTags = String(value).replace(/<[^>]*>/g, ' ');
  if (typeof window === 'undefined') {
    return noTags.replace(/\s+/g, ' ').trim();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(noTags, 'text/html');
  const decodedText = String(doc.documentElement.textContent ?? '');
  return decodedText.replace(/\s+/g, ' ').trim();
};

const toDisplayCount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildThumbnailUrl = (item) => {
  const rprsImgAtchFileId = String(item?.rprsImgAtchFileId ?? item?.rprs_img_atch_file_id ?? '').trim();
  const atchFileSn = String(item?.atchFileSn ?? '').trim();

  if (!rprsImgAtchFileId || !atchFileSn) return '';
  return `${APP_BASE_URL}/api/v1/board/thumbnails/${encodeURIComponent(rprsImgAtchFileId)}/${encodeURIComponent(atchFileSn)}`;
};

const buildDownloadUrl = (item) => {
  const atchFileId = String(item?.atchFileId ?? '').trim();
  if (!atchFileId) return '';
  return `${apiBaseUrl}/api/v1/files/download/${encodeURIComponent(atchFileId)}/1`;
};

const triggerDownload = (downloadUrl) => {
  if (!downloadUrl || typeof window === 'undefined' || typeof document === 'undefined') return;

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

const UI_USR_L_170 = () => {
  const matches = useMatches();
  const [searchParams] = useSearchParams();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [searchType, setSearchType] = useState('TITLE');
  const [appliedSearchType, setAppliedSearchType] = useState('TITLE');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const querySearchKeyword = String(searchParams.get('searchKeyword') ?? '').trim();
  const rawQuerySearchType = String(searchParams.get('searchType') ?? '').trim().toUpperCase();
  const querySearchType = ['TITLE'].includes(rawQuerySearchType) ? rawQuerySearchType : 'TITLE';

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const bbsNo = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    return [...matches]
      .reverse()
      .find((match) => match?.handle?.bbsNo != null)?.handle?.bbsNo ?? currentMatch?.handle?.bbsNo;
  }, [matches]);

  /**
   * 통합검색 랜딩 시 전달된 검색 파라미터를 초기 상태에 반영한다.
   *
   * 주의:
   * - Pagination의 syncUrl(page) 변경과 충돌하지 않도록
   *   searchType/searchKeyword 변화에만 반응한다.
   */
  useEffect(() => {
    setSearchType(querySearchType);
    setAppliedSearchType(querySearchType);
    setSearchKeyword(querySearchKeyword);
    setAppliedSearchKeyword(querySearchKeyword);
    setCurrentPage(0);
  }, [querySearchKeyword, querySearchType]);

  useEffect(() => {
    let isMounted = true;

    const fetchPostList = async () => {
      if (!bbsNo) {
        if (!isMounted) return;
        setPostList([]);
        setTotalElements(0);
        setTotalPages(0);
        setLoading(false);
        return;
      }

      try {
        if (!isMounted) return;
        setLoading(true);

        const params = new URLSearchParams({
          page: String(currentPage + 1),
          size: String(pageSize),
        });

        if (appliedSearchKeyword.trim()) {
          params.append('searchType', appliedSearchType);
          params.append('searchKeyword', appliedSearchKeyword.trim());
        }

        const response = await apiClient.get(`/api/v1/board/${bbsNo}/posts/list?${params.toString()}`);
        const data = response?.data ?? {};

        if (!isMounted) return;
        setPostList(Array.isArray(data?.content) ? data.content : []);
        setTotalElements(data?.totalElements || 0);
        setTotalPages(data?.totalPages || 0);
      } catch (error) {
        if (!isMounted) return;
        setPostList([]);
        setTotalElements(0);
        setTotalPages(0);
        console.error('기업업무용 서식 목록 조회 실패:', error);
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
  }, [bbsNo, currentPage, pageSize, appliedSearchType, appliedSearchKeyword]);

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

  const handleDownloadClick = async (event, item) => {
    event.preventDefault();

    const downloadUrl = buildDownloadUrl(item);
    if (!downloadUrl) return;

    try {
      if (bbsNo && item?.pstNo != null) {
        await apiClient.get(`/api/v1/board/${bbsNo}/posts/${item.pstNo}`);
        setPostList((previousList) => previousList.map((post) => {
          if (post?.pstNo !== item?.pstNo) return post;
          return {
            ...post,
            inqCnt: toDisplayCount(post?.inqCnt) + 1,
          };
        }));
      }
    } catch (error) {
      // 상세 조회 실패 시에도 다운로드는 진행한다.
      console.error('다운로드수 증가용 상세 조회 실패:', error);
    } finally {
      triggerDownload(downloadUrl);
    }
  };

  const renderDisabledActions = () => (
    <div className="side-btn">
      <a
        href="#"
        className="krds-btn tertiary medium disabled"
        aria-disabled="true"
        onClick={(event) => event.preventDefault()}
      >
        바로보기
      </a>
      <a
        href="#"
        className="krds-btn tertiary medium disabled"
        aria-disabled="true"
        onClick={(event) => event.preventDefault()}
      >
        <i className="svg-icon ico-down"></i>
        다운로드
      </a>
    </div>
  );

  const renderCardList = () => {
    if (loading) {
      return (
        <li>
          <div className="on-boxlist-in">
            <img src={ImgFormat} alt="" />
            <div>
              <div className="page-title-wrap">
                <p className="h-tit3">로딩 중입니다.</p>
                <span className="sub-text">다운로드 수 0</span>
              </div>
              <p className="desc">목록을 불러오는 중입니다.</p>
              {renderDisabledActions()}
            </div>
          </div>
        </li>
      );
    }

    if (postList.length === 0) {
      return (
        <li>
          <div className="on-boxlist-in">
            <img src={ImgFormat} alt="" />
            <div>
              <div className="page-title-wrap">
                <p className="h-tit3">조회된 기업업무용 서식이 없습니다.</p>
                <span className="sub-text">다운로드 수 0</span>
              </div>
              <p className="desc">검색 조건을 확인 후 다시 시도해 주세요.</p>
              {renderDisabledActions()}
            </div>
          </div>
        </li>
      );
    }

    return postList.map((item, index) => {
      const thumbnailUrl = buildThumbnailUrl(item);
      const downloadUrl = buildDownloadUrl(item);
      const plainDescription = stripHtmlTags(item?.pstCn) || '-';
      const downloadCount = toDisplayCount(item?.inqCnt);

      return (
        <li key={item?.pstNo ?? `${item?.pstTtl ?? 'form'}-${index}`}>
          <div className="on-boxlist-in">
            <img
              src={thumbnailUrl || ImgFormat}
              alt={item?.pstTtl || ''}
              onError={(event) => {
                if (event.currentTarget.src !== ImgFormat) {
                  event.currentTarget.src = ImgFormat;
                }
              }}
            />
            <div>
              <div className="page-title-wrap">
                <a>
                  <p className="h-tit3">{item?.pstTtl || '-'}</p>
                  <span className="sub-text">다운로드 수 {downloadCount}</span>
                </a>
                <p className="desc">{plainDescription}</p>
              </div>
              <div className="side-btn">
                <a
                  href={thumbnailUrl || '#'}
                  className={`krds-btn tertiary medium ${thumbnailUrl ? '' : 'disabled'}`}
                  target={thumbnailUrl ? '_blank' : undefined}
                  rel={thumbnailUrl ? 'noreferrer' : undefined}
                  aria-disabled={!thumbnailUrl}
                  onClick={(event) => {
                    if (!thumbnailUrl) {
                      event.preventDefault();
                    }
                  }}
                >
                  바로보기
                </a>
                <a
                  href={downloadUrl || '#'}
                  className={`krds-btn tertiary medium ${downloadUrl ? '' : 'disabled'}`}
                  aria-disabled={!downloadUrl}
                  onClick={(event) => handleDownloadClick(event, item)}
                >
                  <i className="svg-icon ico-down"></i>
                  다운로드
                </a>
              </div>
            </div>
          </div>
        </li>
      );
    });
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
          <h2 className="h-tit">기업업무용 서식</h2>
        </div>
        <div className="search-top-box">
          <div className="sch-form-wrap">
            <select
              className="krds-form-select medium"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
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

        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>이용가능한 업무용 서식<span className="point">{formatNumberWithCommas(totalElements || 0)}</span>건</li>
          </ul>
        </div>

        <ul className="on-boxlist gap24 img-formatlist">
          {renderCardList()}
        </ul>

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

export default UI_USR_L_170;
