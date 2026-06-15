import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useMatches, useNavigate, useSearchParams } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { appendListSearchToPath, getNumberSearchParam, getSearchParam, setQueryParam } from '@utils/listNavigation.js';

const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// bbsExplnCn은 에디터 HTML로 내려오므로 안내 박스에는 기존 컨벤션처럼 태그 제거 후 텍스트만 노출한다.
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

// API client interceptor 적용 여부에 따라 data wrapper가 달라져 두 응답 형태를 모두 허용한다.
const unwrapApiData = (response, fallback = null) => response?.data?.data ?? response?.data ?? fallback;

// 작성자명 마스킹: 첫글자 + 중간 마스킹 + 마지막글자, 2글자 이하는 전체 마스킹
const maskWriterName = (name) => {
  if (!name || typeof name !== 'string') return '-';
  const trimmed = name.trim();
  if (trimmed.length === 0) return '-';
  if (trimmed.length <= 2) return '*'.repeat(trimmed.length);
  const middle = '*'.repeat(trimmed.length - 2);
  return `${trimmed[0]}${middle}${trimmed[trimmed.length - 1]}`;
};

// 의미/출처: 이벤트 참여 메뉴 M_PIIO_00171은 현재 bbs_no 69 전용이며, 메뉴 API bbsNo 누락 시에만 fallback으로 사용한다.
const EVENT_PARTICIPATION_BBS_NO = 69;
// 의미/출처: 게시판 목록 API의 제목 검색 타입 값이다. 이벤트참여는 검색 조건 UI를 숨겨도 제목 검색만 허용한다.
const EVENT_PARTICIPATION_TITLE_SEARCH_TYPE = 'TITLE';

const EventParticipationList = () => {
  const matches = useMatches();
  const location = useLocation();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { currentMenu, breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const authToken = useAuthStore((state) => state.token);
  const isLoggedIn = Boolean(authToken);

  const [boardDetail, setBoardDetail] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryNo, setSelectedCategoryNo] = useState(() => getSearchParam(location.search, 'ctgryNo', ''));
  const [appliedCategoryNo, setAppliedCategoryNo] = useState(() => getSearchParam(location.search, 'ctgryNo', ''));
  const [searchKeyword, setSearchKeyword] = useState(() => getSearchParam(location.search, 'searchKeyword', ''));
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState(() => getSearchParam(location.search, 'searchKeyword', ''));

  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => Math.max(0, getNumberSearchParam(location.search, 'page', 1) - 1));
  const [pageSize, setPageSize] = useState(() => getNumberSearchParam(location.search, 'size', 10));

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const bbsNo = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    return [...matches]
      .reverse()
      .find((match) => match?.handle?.bbsNo != null)?.handle?.bbsNo ?? currentMatch?.handle?.bbsNo ?? EVENT_PARTICIPATION_BBS_NO;
  }, [matches]);

  const routeMenuTitle = useMemo(
    () => [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm,
    [matches],
  );

  const isCategoryEnabled = useMemo(() => {
    const raw = boardDetail?.ctgryUseYn ?? boardDetail?.ctgry_use_yn ?? '';
    return String(raw).trim().toUpperCase() === 'Y';
  }, [boardDetail]);

  const effectiveAppliedCategoryNo = useMemo(() => {
    if (isCategoryEnabled || boardDetail == null) {
      return appliedCategoryNo;
    }

    return '';
  }, [appliedCategoryNo, boardDetail, isCategoryEnabled]);

  const buildListSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    setQueryParam(params, 'page', currentPage + 1, 1);
    setQueryParam(params, 'size', pageSize, 10);
    setQueryParam(params, 'ctgryNo', effectiveAppliedCategoryNo);
    setQueryParam(params, 'searchType', EVENT_PARTICIPATION_TITLE_SEARCH_TYPE, EVENT_PARTICIPATION_TITLE_SEARCH_TYPE);
    setQueryParam(params, 'searchKeyword', appliedSearchKeyword);
    return params;
  }, [appliedSearchKeyword, currentPage, effectiveAppliedCategoryNo, pageSize]);

  const boardTitle = useMemo(
    () => routeMenuTitle || currentMenu?.menuNm || boardDetail?.bbsNm || '이벤트 참여',
    [boardDetail, currentMenu, routeMenuTitle],
  );

  const boardDescription = useMemo(
    // () => stripHtmlTags(boardDetail?.bbsExplnCn),
    () => boardDetail?.bbsExplnCn,
    [boardDetail],
  );

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
        setBoardDetail(unwrapApiData(response));
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

  useEffect(() => {
    let isMounted = true;

    const hasSelectedCategory = (categoryList, categoryNo) => (
      categoryList.some((category) => String(category?.ctgryNo ?? '') === String(categoryNo))
    );

    const fetchCategories = async () => {
      if (bbsNo == null || bbsNo === '') {
        if (!isMounted) return;
        setCategories([]);
        setSelectedCategoryNo('');
        setAppliedCategoryNo('');
        return;
      }

      if (boardDetail == null) {
        return;
      }

      // 게시판 설정상 카테고리 미사용이면 UI 상태와 ctgryNo query를 같이 비워 서버 필터 계약과 화면 상태를 맞춘다.
      if (!isCategoryEnabled) {
        if (!isMounted) return;
        setCategories([]);
        setSelectedCategoryNo('');
        setAppliedCategoryNo('');
        return;
      }

      try {
        const response = await apiClient.get(`/api/v1/board/${bbsNo}/categories`);
        const data = unwrapApiData(response, []);
        if (!isMounted) return;

        const categoryList = Array.isArray(data)
          ? data.filter((category) => String(category?.useYn ?? 'Y').toUpperCase() === 'Y')
          : [];

        setCategories(categoryList);
        setSelectedCategoryNo((prev) => (prev && hasSelectedCategory(categoryList, prev) ? prev : ''));
        setAppliedCategoryNo((prev) => (prev && hasSelectedCategory(categoryList, prev) ? prev : ''));
      } catch (error) {
        if (!isMounted) return;
        setCategories([]);
        console.error('이벤트 참여 카테고리 조회 실패:', error);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [bbsNo, boardDetail, isCategoryEnabled]);

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
        // UI_USR_L_230 Q&A처럼 로그인 사용자는 내 글만, 비로그인 사용자는 전체 목록을 조회한다.
        if (isLoggedIn) {
          params.append('mineOnly', 'true');
        }

        if (effectiveAppliedCategoryNo) {
          params.append('ctgryNo', effectiveAppliedCategoryNo);
        }

        if (appliedSearchKeyword.trim()) {
          params.append('searchType', EVENT_PARTICIPATION_TITLE_SEARCH_TYPE);
          params.append('searchKeyword', appliedSearchKeyword.trim());
        }

        const response = await apiClient.get(`/api/v1/board/${bbsNo}/posts/list?${params.toString()}`);
        const data = unwrapApiData(response, {});

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
  }, [
    bbsNo,
    buildListSearchParams,
    currentPage,
    effectiveAppliedCategoryNo,
    pageSize,
    appliedSearchKeyword,
    isLoggedIn,
    setSearchParams,
  ]);

  const handleSearch = () => {
    setAppliedCategoryNo(selectedCategoryNo);
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

  const moveToDetail = (pstNo) => {
    if (pstNo == null) return;
    navigate(appendListSearchToPath(`${pstNo}`, buildListSearchParams().toString()));
  };

  const moveToWrite = () => {
    navigate('save');
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

        {boardDescription && (
          <div
            className="guide-txt custom mb-40"
            dangerouslySetInnerHTML={{ __html: boardDescription }}
          />
        )}

        <div className="search-top-box">
          <div className="sch-form-wrap">
            {isCategoryEnabled && (
              <select
                className="krds-form-select medium"
                value={selectedCategoryNo}
                onChange={(event) => setSelectedCategoryNo(event.target.value)}
              >
                <option value="">카테고리 전체</option>
                {categories.map((category) => (
                  <option key={category?.ctgryNo} value={String(category?.ctgryNo ?? '')}>
                    {category?.ctgryNm || '-'}
                  </option>
                ))}
              </select>
            )}
            <div className="sch-input">
              <input
                type="text"
                className="krds-input medium"
                placeholder="제목을 입력하세요"
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
                value={pageSize}
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
            <caption>이벤트 참여 표. 번호, 카테고리, 제목, 작성자, 작성일 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '10px' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '300px' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '80px' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">번호</th>
                <th scope="col" className="ac">카테고리</th>
                <th scope="col" className="ac">제목</th>
                <th scope="col" className="ac">작성자</th>
                <th scope="col" className="ac">작성일</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="ac" colSpan={5}>
                    <span>로딩 중입니다.</span>
                  </td>
                </tr>
              ) : postList.length === 0 ? (
                <tr>
                  <td className="ac" colSpan={5}>
                    <span>조회된 데이터가 없습니다.</span>
                  </td>
                </tr>
              ) : (
                postList.map((item, index) => (
                  <tr key={item?.pstNo ?? `${item?.pstTtl ?? 'post'}-${index}`}>
                    <th scope="row" className="ac">
                      <span>{totalElements - (currentPage * pageSize + index)}</span>
                    </th>
                    <td className="ac"><span>{item?.ctgryNm || '-'}</span></td>
                    <td>
                      <a
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          moveToDetail(item?.pstNo);
                        }}
                      >
                        <span>{item?.pstTtl || '-'}</span>
                        {item?.pstRlsYn === 'N' && <i className="svg-icon ico-lock"></i>}
                      </a>
                    </td>
                    <td className="ac"><span className="onellipsis-1">{maskWriterName(item?.pstRgtrNm)}</span></td>
                    <td className="ac"><span>{formatDate(item?.pstRegDt ?? item?.regDt)}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* table [E] */}

        {!loading && totalPages > 0 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage + 1}
            onPageChange={handlePageChange}
            syncUrl
          />
        )}

        {isLoggedIn && (
          <div className="onboard-btm-btngroup btn-single bt-0">
            <div>
              <button type="button" className="krds-btn primary xlarge" onClick={moveToWrite}>
                참여하기
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EventParticipationList;
