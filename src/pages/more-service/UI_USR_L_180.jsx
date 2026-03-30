import { useEffect, useMemo, useState } from 'react';
import { useMatches, useNavigate } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';

const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const UI_USR_L_180 = () => {
  const matches = useMatches();
  const navigate = useNavigate();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [boardDetail, setBoardDetail] = useState(null);
  const [searchType, setSearchType] = useState('TITLE');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchType, setAppliedSearchType] = useState('TITLE');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');

  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

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

        if (appliedSearchKeyword.trim()) {
          params.append('searchType', appliedSearchType);
          params.append('searchKeyword', appliedSearchKeyword.trim());
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
  }, [bbsNo, currentPage, pageSize, appliedSearchType, appliedSearchKeyword]);

  const boardTitle = useMemo(
    () => boardDetail?.bbsNm || depth1Menu?.menuNm || '입법·행정예고/고시',
    [boardDetail, depth1Menu],
  );

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

  const moveToDetail = (pstNo) => {
    if (pstNo == null) return;
    navigate(`${pstNo}`);
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
              <option value="TITLE">제목</option>
              <option value="CONTENT">내용</option>
            </select>
            <div className="sch-input">
              <input
                type="text"
                className="krds-input"
                placeholder="검색어를 입력해주세요."
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
                <option value={20}>20개</option>
                <option value={30}>30개</option>
                <option value={40}>40개</option>
              </select>
            </li>
          </ul>
        </div>

        {/* table [S] */}
        <div className="krds-table-wrap">
          <table className="tbl col data">
            <caption>행사정보 표. 번호, 제목, 출처, 작성일 조회수 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '10px' }} />
              <col style={{ width: '340px' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '80px' }} />
              <col style={{ width: '10px' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">번호</th>
                <th scope="col" className="ac">제목</th>
                <th scope="col" className="ac">출처</th>
                <th scope="col" className="ac">작성일</th>
                <th scope="col" className="ac">조회수</th>
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
                    <td>
                      <a
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          moveToDetail(item?.pstNo);
                        }}
                      >
                        <span>{item?.pstTtl || '-'}</span>
                      </a>
                    </td>
                    <td className="ac"><span>{item?.pstSrcCn || '-'}</span></td>
                    <td className="ac"><span>{formatDate(item?.pstRegDt ?? item?.regDt)}</span></td>
                    <td className="ac"><span>{item?.inqCnt ?? '-'}</span></td>
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

      </div>
    </>
  );
};

export default UI_USR_L_180;
