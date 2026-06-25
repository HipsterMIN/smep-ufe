import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { appendListSearchToPath, getNumberSearchParam, getSearchParam, setQueryParam } from '@utils/listNavigation.js';

const EMPTY_HTML_PATTERNS = new Set([
  '<p style="text-align: left;"></p>',
  '<p><br></p>',
  '<p>&nbsp;</p>',
]);

const isMeaningfulHtml = (html) => {
  if (!html || typeof html !== 'string') return false;

  const normalized = html.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!normalized || EMPTY_HTML_PATTERNS.has(normalized)) return false;

  const textOnly = normalized.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
  return textOnly.length > 0;
};

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
  if (isMeaningfulHtml(String(post?.pstAnsCn ?? ''))) {
    return '답변완료';
  }
  return '접수중';
};

// 작성자명 마스킹: 첫글자 + 중간 마스킹 + 마지막글자, 2글자 이하는 전체 마스킹
const maskWriterName = (name) => {
  if (!name || typeof name !== 'string') return '-';
  const trimmed = name.trim();
  if (trimmed.length === 0) return '-';
  if (trimmed.length <= 2) return '*'.repeat(trimmed.length);
  const middle = '*'.repeat(trimmed.length - 2);
  return `${trimmed[0]}${middle}${trimmed[trimmed.length - 1]}`;
};

const BoardQna = ({ boardDetail, bbsNo }) => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const location = useLocation();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const [selectedCategoryNo, setSelectedCategoryNo] = useState(() => getSearchParam(location.search, 'ctgryNo', ''));
  const [searchType, setSearchType] = useState(() => getSearchParam(location.search, 'searchType', 'TITLE'));
  const [searchKeyword, setSearchKeyword] = useState(() => getSearchParam(location.search, 'searchKeyword', ''));

  const [appliedCategoryNo, setAppliedCategoryNo] = useState(() => getSearchParam(location.search, 'ctgryNo', ''));
  const [appliedSearchType, setAppliedSearchType] = useState(() => getSearchParam(location.search, 'searchType', 'TITLE'));
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState(() => getSearchParam(location.search, 'searchKeyword', ''));

  const [categories, setCategories] = useState([]);
  const [postList, setPostList] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => Math.max(0, getNumberSearchParam(location.search, 'page', 1) - 1));
  const [pageSize, setPageSize] = useState(() => getNumberSearchParam(location.search, 'size', 10));
  const authToken = useAuthStore((state) => state.token);
  const isApiQnaPage = location.pathname.includes('UI_USR_L_230');
  // 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const boardTitle = useMemo(() => boardDetail?.bbsNm || 'Q&A', [boardDetail]);
  const isLoggedIn = Boolean(authToken);

  const buildListSearchParams = () => {
    const params = new URLSearchParams();
    setQueryParam(params, 'page', currentPage + 1, 1);
    setQueryParam(params, 'size', pageSize, 10);
    setQueryParam(params, 'ctgryNo', appliedCategoryNo);
    setQueryParam(params, 'searchType', appliedSearchType, 'TITLE');
    setQueryParam(params, 'searchKeyword', appliedSearchKeyword);
    return params;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
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

        // 로그인 상태면 내 글만 조회
        if (isLoggedIn) {
          params.append('myPost', 'true');
        }

        setSearchParams(buildListSearchParams(), { replace: true });

        const response = await apiClient.get(`/api/v1/board/${bbsNo}/qna/list?${params.toString()}`);
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
  }, [bbsNo, currentPage, pageSize, appliedCategoryNo, appliedSearchType, appliedSearchKeyword, isLoggedIn]);

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
        {!isApiQnaPage && (
          <div className="guide-txt custom mb-40">
            <p>
                  궁금한게 있으신가요? 먼저 자주 묻는 질문을 한번 살펴보세요.
            </p>
            <button
              type="button"
              className="krds-btn secondary small"
              style={{ marginTop: '5px', marginBottom: '5px' }}
              onClick={() => navigate('/cs/csc/faq')}
            >
                  자주 묻는 질문 바로가기
            </button>
            <p>
                  직접 상담원과 통화도 해보세요! (전화문의 : 044-300-0990~1)
            </p>
          </div>)}
        {isApiQnaPage && (
          <p className="guide-txt" style={{ marginBottom: '24px', clear: 'both' }}>
                중소벤처24에서는 중소벤처기업부에서 보유하고 있는 정보 및 서비스를 API를 통해 배포하고 있습니다. <br/>
                Open API는 중소벤처기업부 각 기관 및 이를 서비스하고자 하는 일반을 대상으로 배포하고 있습니다.<br/>
                * 다만, 해당 인증키는 신청 및 가능여부를 판단하여 제공하고 있습니다.
          </p>
        )}
        <div className="search-top-box">
          <div className="sch-form-wrap">
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
            <select
              className="krds-form-select medium"
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
        {isApiQnaPage && (
          <div className="tab fill full mt-48">
            <ul>
              <li><Link to="/cs/opndata/UI_USR_L_210" className="btn-tab">API 안내</Link></li>
              <li><Link to="/cs/opndata/UI_USR_L_220" className="btn-tab">인증키 신청</Link></li>
              <li className="active">
                <Link to="/cs/opndata/UI_USR_L_230" className="btn-tab">
                      API Q&A <span className="sr-only">현재 페이지</span>
                </Link>
              </li>
            </ul>
          </div>
        )}
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
            <caption>Q & A 목록. 번호, 카테고리, 제목, 작성자, 처리상태, 작성일, 조회수 정보가 제공됩니다.</caption>
            <colgroup>
              <col style={{ width: '7.4%' }}/>
              <col style={{ width: '12%' }}/>
              <col/>
              <col style={{ width: '18%' }}/>
              <col style={{ width: '12%' }}/>
              <col style={{ width: '12%' }}/>
              <col style={{ width: '7.4%' }}/>
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">번호</th>
                <th scope="col" className="ac">카테고리</th>
                <th scope="col" className="ac">제목</th>
                <th scope="col" className="ac">작성</th>
                <th scope="col" className="ac">처리상태</th>
                <th scope="col" className="ac">작성일</th>
                <th scope="col" className="ac views">조회</th>
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
                      <span>{totalElements - (currentPage * pageSize) - index}</span> 
                    </th>
                    <td className="ac"><span>{item?.ctgryNm || '-'}</span></td>
                    <td>
                      <a
                        className="onellipsis-1"
                        style={{ cursor: 'pointer' }}
                        title={item?.pstTtl || '-'}
                        onClick={(event) => {
                          event.preventDefault();
                          moveToDetail(item?.pstNo);
                        }}
                      >
                        {item?.upendPstgYn === 'Y' && <span className="krds-badge bg-light-primary">공지</span>}
                        <span>{item?.pstTtl || '-'}</span>
                        {item?.pstRlsYn === 'N' && <i className="svg-icon ico-lock"></i>}
                      </a>
                    </td>
                    {/* 비로그인 시 작성자명 마스킹 처리 */}
                    <td className="ac">
                      <span className="onellipsis-1">{isLoggedIn ? (item?.pstRgtrNm || '-') : maskWriterName(item?.pstRgtrNm)}</span>
                    </td>
                    <td className="ac"><span>{getAnswerStatus(item)}</span></td>
                    <td className="ac"><span>{formatDate(item?.pstRegDt ?? item?.regDt)}</span></td>
                    <td className="ac views"><span>{item?.inqCnt ?? 0}</span></td>
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
                    문의하기
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BoardQna;