import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getAnswerStatus = (post) => {
  if (post?.pstAnsCn && String(post.pstAnsCn).trim()) {
    return '답변완료';
  }

  return '접수중';
};

const BoardQna = ({ boardDetail, bbsNo }) => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const navigate = useNavigate();

  const [selectedCategoryNo, setSelectedCategoryNo] = useState('');
  const [searchType, setSearchType] = useState('TITLE');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [appliedCategoryNo, setAppliedCategoryNo] = useState('');
  const [appliedSearchType, setAppliedSearchType] = useState('TITLE');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');

  const [categories, setCategories] = useState([]);
  const [postList, setPostList] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const boardTitle = useMemo(() => boardDetail?.bbsNm || 'Q&A', [boardDetail]);

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
        console.error('Q&A 카테고리 조회 실패:', error);
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

        if (appliedCategoryNo) {
          params.append('ctgryNo', appliedCategoryNo);
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
        console.error('Q&A 목록 조회 실패:', error);
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
  }, [bbsNo, currentPage, pageSize, appliedCategoryNo, appliedSearchType, appliedSearchKeyword]);

  const handleSearch = () => {
    setAppliedCategoryNo(selectedCategoryNo);
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
        <div className="search-top-box">
          <div className="sch-form-wrap">
            <select
              className="krds-form-select"
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
            <select
              className="krds-form-select"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
              <option value="TITLE">제목</option>
              <option value="CONTENT">내용</option>
              <option value="WRITER">작성자</option>
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
                <option value={10}>10개</option>
                <option value={20}>20개</option>
                <option value={30}>30개</option>
                <option value={50}>50개</option>
              </select>
            </li>
          </ul>
        </div>
        {/* table [S] */}
        <div className="krds-table-wrap">
          <table className="tbl col data">
            <caption>Q & A 목록. 번호, 카테고리, 제목, 작성자, 처리상태, 작성일, 조회수 정보가 제공됩니다.</caption>
            <colgroup>
              <col style={{ width: '7.4%' }} />
              <col style={{ width: '12%' }} />
              <col />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '7.4 %' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">번호</th>
                <th scope="col" className="ac">카테고리</th>
                <th scope="col" className="ac">제목</th>
                <th scope="col" className="ac">작성</th>
                <th scope="col" className="ac">처리상태</th>
                <th scope="col" className="ac">작성일</th>
                <th scope="col" className="ac">조회</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="ac" colSpan={7}>
                    <span>로딩 중입니다.</span>
                  </td>
                </tr>
              ) : postList.length === 0 ? (
                <tr>
                  <td className="ac" colSpan={7}>
                    <span>조회된 데이터가 없습니다.</span>
                  </td>
                </tr>
              ) : (
                postList.map((item, index) => (
                  <tr key={item?.pstNo ?? `${item?.pstTtl ?? 'qna'}-${index}`}>
                    <th scope="row" className="ac">
                      <span>{item?.pstNo ?? '-'}</span>
                    </th>
                    <td className="ac"><span>{item?.ctgryNm || '-'}</span></td>
                    <td>
                      <a
                        className="onellipsis-1"
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
                    <td className="ac"><span>{item?.pstRgtrNm || '-'}</span></td>
                    <td className="ac"><span>{getAnswerStatus(item)}</span></td>
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
          />
        )}

        <div className="onboard-btm-btngroup btn-single bt-0">
          <div>
            <button type="button" className="krds-btn primary xlarge" onClick={moveToWrite}>
              문의하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardQna;
