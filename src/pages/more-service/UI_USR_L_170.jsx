import { useEffect, useMemo, useState } from 'react';
import { Link, useMatches } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Pagination from '@components/ui/Pagination.jsx';
import ImgFormat from '@assets/sub/img_business_format_01.jpg';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

const UI_USR_L_170 = () => {
  const matches = useMatches();
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

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData(); // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent(); // depth1 부모 찾기

  const bbsNo = useMemo(() => {
    const currentMatch = matches[matches.length - 1];
    return [...matches]
      .reverse()
      .find((match) => match?.handle?.bbsNo != null)?.handle?.bbsNo ?? currentMatch?.handle?.bbsNo;
  }, [matches]);

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

  const renderCardList = () => {
    if (loading) {
      return (
        <li>
          <div className="on-boxlist-in">
            <img src={ImgFormat} alt="" />
            <div>
              <div className="page-title-wrap">
                <p className="h-tit3">로딩 중입니다.</p>
                <span className="sub-text">다운로드수 0</span>
              </div>
              <p className="desc">목록을 불러오는 중입니다.</p>
              <div className="side-btn">
                <Link to="#" className="krds-btn tertiary medium">
                  바로보기
                </Link>
                <a href="#" download className="krds-btn tertiary medium">
                  <i className="svg-icon ico-down"></i>
                  다운로드
                </a>
              </div>
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
                <p className="h-tit3">조회된 업무용 서식이 없습니다.</p>
                <span className="sub-text">다운로드수 0</span>
              </div>
              <p className="desc">검색 조건을 확인한 뒤 다시 시도해주세요.</p>
              <div className="side-btn">
                <Link to="#" className="krds-btn tertiary medium">
                  바로보기
                </Link>
                <a href="#" download className="krds-btn tertiary medium">
                  <i className="svg-icon ico-down"></i>
                  다운로드
                </a>
              </div>
            </div>
          </div>
        </li>
      );
    }

    return postList.map((item, index) => (
      <li key={item?.pstNo ?? `${item?.pstTtl ?? 'form'}-${index}`}>
        <div className="on-boxlist-in">
          <img src={ImgFormat} alt="" />
          <div>
            <div className="page-title-wrap">
              <Link to="/">
                <p className="h-tit3">{item?.pstTtl || '-'}</p>
                <span className="sub-text">다운로드수 {item?.inqCnt ?? 0}</span>
              </Link>
              <p className="desc">{item?.pstCn || '-'}</p>
            </div>
            <div className="side-btn">
              <Link to="#" className="krds-btn tertiary medium">
                바로보기
              </Link>
              <a href="#" download className="krds-btn tertiary medium">
                <i className="svg-icon ico-down"></i>
                다운로드
              </a>
            </div>
          </div>
        </div>
      </li>
    ));
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
              className="krds-form-select"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
              <option value="TITLE">제목</option>
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
            <li>이용가능한 업무용 서식<span className="point">{totalElements}</span>건</li>
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
          />
        )}
      </div>
    </>
  );
};

export default UI_USR_L_170;
