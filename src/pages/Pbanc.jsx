// pages/Pbanc.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import SearchListTop from '../components/ui/SearchListTop';
import Pagination from '../components/ui/Pagination.jsx';
import { api as apiClient } from '../lib/apiClient.js';
import { useUserMenu } from '../context/UserMenuContext';

const Pbanc = () => {
  // Context에서 메뉴 데이터 가져오기
  const { currentMenu, breadcrumbItems, loading: menuLoading } = useUserMenu();

  // 검색 상태
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('');
  const schFormWrapRef = useRef(null);

  // 검색 필터 토글
  const handleToggleFilter = () => {
    schFormWrapRef.current.classList.toggle('on');
  };

  // 검색 API 호출
  const search = async (pageParam) => {
    try {
      const response = await apiClient.get(
        `/api/v1/pbanc?page=${pageParam}&searchText=${searchText}&searchType=${searchType}`,
      );
      setItems(response);
      setPage(pageParam);
    } catch (error) {
      console.error('Failed to fetch pbanc data:', error);
      // 에러 처리 로직 추가 (예: toast 알림)
    }
  };

  // Enter 키 검색
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      search(1);
    }
  };

  // 초기 로드
  useEffect(() => {
    window.scrollTo(0, 0);
    search(1);
  }, []);

  // 날짜 포맷 유틸
  const formatToYYMMDD = (value) => {
    if (!value) return '';
    let date;

    // YYYYMMDD (숫자 또는 문자열)
    if (/^\d{8}$/.test(String(value))) {
      const str = String(value);
      const yyyy = str.slice(0, 4);
      const mm = str.slice(4, 6);
      const dd = str.slice(6, 8);
      date = new Date(`${yyyy}-${mm}-${dd}`);
    } else {
      // ISO 형식
      date = new Date(value);
    }

    // 유효성 체크
    if (isNaN(date.getTime())) return '';

    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  // 메뉴 로딩 중 처리
  if (menuLoading || !currentMenu) {
    return <div>로딩 중...</div>;
  }

  return (
    <>
      <SideNavigation
        pageTitle={currentMenu.depth1Title}
        depth={currentMenu.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />

        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">사업공고</h2>
        </div>

        {/* 검색 필터 */}
        <div ref={schFormWrapRef} className="sch-form-wrap">
          {/* 검색 UI 구현 */}
        </div>

        <SearchListTop
          title="검색 결과"
          handleToggleFilter={handleToggleFilter}
        />

        {/* 결과 테이블 */}
        <div className="board-list">
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>신청기간</th>
                <th>소관부처·지자체</th>
                <th>사업수행기관</th>
                <th>조회수</th>
              </tr>
            </thead>
            <tbody>
              {items.content?.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{(page - 1) * items.length + index + 1}</td>
                  <td>
                    <Link to={`/service/pbanc/${item.id}`}>
                      {item.sprtfld} {item.pbancnm}
                    </Link>
                  </td>
                  <td>
                    {item.aplybgngday ? formatToYYMMDD(item.aplybgngday) + ' ~ ' : ''}
                    {!item.aplyddlnday ? '예산소진시' : formatToYYMMDD(item.aplyddlnday)}
                  </td>
                  <td>{item.mngdeptnm}</td>
                  <td>{item.flfmtinst}</td>
                  <td>28</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <Pagination
          currentPage={page}
          totalPages={items.totalPages || 1}
          onPageChange={search}
        />
      </div>
    </>
  );
};

export default Pbanc;
