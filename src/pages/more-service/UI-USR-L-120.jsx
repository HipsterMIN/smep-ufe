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
  const pageSize = 10; // 고정값

  // 입력용 (화면 표시용)
  const [searchType, setSearchType] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 전송용 (API 파라미터용)
  const [appliedSearchType, setAppliedSearchType] = useState('');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');

  // 정렬 (TODO: 백엔드 구현 필요)
  const [sortType, setSortType] = useState('regDt');

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage,
          size: pageSize,
        });

        // 전송용 state 사용
        if (appliedSearchKeyword && appliedSearchKeyword.trim()) {
          params.append('searchKeyword', appliedSearchKeyword);
          params.append('searchType', appliedSearchType);
        }

        // TODO: 정렬 파라미터 추가 (백엔드 구현 후)
        // params.append('sortType', sortType);

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
  }, [currentPage, appliedSearchType, appliedSearchKeyword]);

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

  // 정렬 변경 핸들러 (TODO)
  const handleSortChange = (type) => {
    setSortType(type);
    // TODO: 백엔드 정렬 구현 후 API 재호출
    console.log('정렬 변경:', type);
  };

  // 상세페이지 핸들러
  const goToDetail = (certSystmNo) => {
    navigate(`${certSystmNo}`);
  };

  // 엑셀 다운로드
  const handleExcelDownload = () => {
    // TODO: 엑셀 다운로드 API 구현
    console.log('엑셀 다운로드');
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
              <option value="itemNm">품목명</option>
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

        {/* 정렬/다운로드 영역 */}
        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">{totalElements}</span>개</li>
            <li>
              <button
                type="button"
                className="krds-btn medium text"
                onClick={handleExcelDownload}
              >
                <i className="svg-icon ico-excel"></i> 다운로드
              </button>
            </li>
          </ul>
          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
              <div className="w-sort-btn">
                <button
                  type="button"
                  className={sortType === 'regDt' ? 'active' : ''}
                  onClick={() => handleSortChange('regDt')}
                >
                    등록일순{sortType === 'regDt' && <span className="sr-only">선택됨</span>}
                </button>
                <button
                  type="button"
                  className={sortType === 'inqCnt' ? 'active' : ''}
                  onClick={() => handleSortChange('inqCnt')}
                >
                    조회수순{sortType === 'inqCnt' && <span className="sr-only">선택됨</span>}
                </button>
              </div>
              <div className="m-sort-btn">
                <select
                  className="krds-form-select-sort"
                  id="sort"
                  value={sortType}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="regDt">등록일순</option>
                  <option value="inqCnt">조회수순</option>
                </select>
              </div>
            </li>
          </ul>
        </div>

        {/* table [S] */}
        <div className="krds-table-wrap">
          <table className="tbl col data">
            <caption>품목별 법정의무 인증제도 표. 번호, 분야, 인증제도명, 대상 품목수, 관련법률 소관부처 조회수 정보가 제공됨.</caption>
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
                  <tr key={item.certSystmNo || index}>
                    <th scope="row" className="ac">
                      <span>{currentPage * pageSize + index + 1}</span>
                    </th>
                    <td className="ac">
                      <span>{item.certSystmFldNm || '-'}</span>
                    </td>
                    <td className="ac">
                      <a href="#" onClick={(e) => {
                        e.preventDefault();
                        goToDetail(item.certSystmNo);
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
                      <span>{item.cmptncDept || '-'}</span>
                    </td>
                    <td className="ac">
                      <span>{item.inqCnt || 0}</span>
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
          />
        </div>
        {/* table [E] */}
      </div>
    </>
  );
};

export default UI_USR_L_120;
