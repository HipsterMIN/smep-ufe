import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Pagination from '@components/ui/Pagination.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_L_120 = () => {
  const navigate = useNavigate();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [certifications, setCertifications] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0);
  };

  // 입력용 (화면 표시용)
  const [searchType, setSearchType] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 전송용 (API 파라미터용)
  const [appliedSearchType, setAppliedSearchType] = useState('');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage + 1,
          size: pageSize,
        });

        // 전송용 state 사용
        if (appliedSearchKeyword && appliedSearchKeyword.trim()) {
          params.append('searchKeyword', appliedSearchKeyword);
          params.append('searchType', appliedSearchType);
        }

        const response = await apiClient.get(
          `/api/v1/product/certification?${params.toString()}`,
        );

        const data = response.data;

        setCertifications(data.content || []);
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);
      } catch (error) {
        console.error('조회 실패:', error);
        setCertifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, appliedSearchType, appliedSearchKeyword]);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  // 검색 타입 변경 핸들러 (입력용만 업데이트)
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
  };

  // 검색어 입력 핸들러 (입력용만 업데이트)
  const handleSearchKeywordChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  // 검색 버튼 클릭 핸들러 (입력용 → 전송용)
  const handleSearch = () => {
    setAppliedSearchType(searchType);
    setAppliedSearchKeyword(searchKeyword);
    setCurrentPage(0);
  };

  // 상세페이지 핸들러
  const goToDetail = (certSystmId) => {
    navigate(`${certSystmId}`);
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
          <h2 className="h-tit">품목별 법정의무 인증제도</h2>
        </div>

        {/* 검색 영역 */}
        <div className="search-top-box">
          <div className="sch-form-wrap">
            <select
              className="krds-form-select"
              value={searchType}
              onChange={handleSearchTypeChange}
            >
              <option value="">전체</option>
              <option value="certSystmNm">인증제도명</option>
              <option value="certSystmItemNm">품목명</option>
            </select>
            <div className="sch-input">
              <input
                type="text"
                className="krds-input"
                placeholder="검색어를 입력해주세요."
                title="검색어 입력"
                value={searchKeyword}
                onChange={handleSearchKeywordChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                type="button"
                className="krds-btn medium icon ico-search"
                onClick={handleSearch}
              >
                <span className="sr-only">검색</span>
                <i className="svg-icon ico-sch"></i>
              </button>
            </div>
          </div>
        </div>

        {/* 정렬 영역 */}
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
            <caption>품목별 법정의무 인증제도 표. 번호, 분야, 인증제도명, 대상 품목수, 관련법률, 소관부처, 조회수 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '5%' }}/>
              <col style={{ width: '5%' }}/>
              <col style={{ width: '340px' }}/>
              <col style={{ width: '5%' }}/>
              <col style={{ width: '340px' }}/>
              <col style={{ width: '15%' }}/>
              <col style={{ width: '5%' }}/>
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">번호</th>
                <th scope="col" className="ac">분야</th>
                <th scope="col" className="ac">인증제도명</th>
                <th scope="col" className="ac">대상 품목수</th>
                <th scope="col" className="ac">관련법률</th>
                <th scope="col" className="ac">소관부처</th>
                <th scope="col" className="ac">조회수</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="ac">로딩 중...</td>
                </tr>
              ) : certifications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="ac">조회된 데이터가 없습니다.</td>
                </tr>
              ) : (
                certifications.map((item, index) => (
                  <tr key={item.certSystmId || index}>
                    <th scope="row" className="ac">
                      <span>{totalElements - (currentPage * pageSize + index)}</span>
                    </th>
                    <td className="ac">
                      <span>{item.certSystmFldNm || '-'}</span>
                    </td>
                    <td className="ac">
                      <a href="#" onClick={(e) => {
                        e.preventDefault();
                        goToDetail(item.certSystmId);
                      }}>
                        <span>{item.certSystmNm}</span>
                      </a>
                    </td>
                    <td className="ac">
                      <span>{item.itemCnt || 0}</span>
                    </td>
                    <td className="ac">
                      <span>{item.lglBssCn || '-'}</span>
                    </td>
                    <td className="ac">
                      <span>{item.tkcgMaoNm || '-'}</span>
                    </td>
                    <td className="ac">
                      <span>{item.tinqCnt || 0}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage + 1}
            onPageChange={handlePageChange}
            syncUrl
          />
        </div>
        {/* table [E] */}
      </div>
    </>
  );
};

export default UI_USR_L_120;