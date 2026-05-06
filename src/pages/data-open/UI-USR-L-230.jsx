import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const PAGE_SIZE = 10;

const API_QNA_MOCK = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  inquiryType: index % 2 === 0 ? '인증키 관련' : 'API 오류',
  title: `API 문의 제목 ${index + 1}`,
  writer: `홍*${String.fromCharCode(65 + (index % 26))}`,
  status: index % 3 === 0 ? '답변완료' : '접수',
  regDate: `2025-08-${String((index % 28) + 1).padStart(2, '0')}`,
  isPrivate: index % 4 === 0,
}));

const UI_USR_L_230 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  // --- 상태 관리 ---
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('latest'); // 'latest' | 'oldest'
  const [searchParams, setSearchParams] = useState({
    inquiryType: '',
    status: '',
    searchKeyword: ''
  });

  // --- 정렬 및 데이터 가공 ---
  const pagedRows = useMemo(() => {
    // 1. 정렬 수행
    const sortedList = [...API_QNA_MOCK].sort((a, b) => {
      return sortOrder === 'latest'
          ? b.regDate.localeCompare(a.regDate)
          : a.regDate.localeCompare(b.regDate);
    });

    // 2. 페이징 처리
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedList.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, sortOrder]);

  const totalElements = API_QNA_MOCK.length;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);

  // --- 핸들러 ---
  const handlePageChange = (page) => setCurrentPage(page);

  const handleSortChange = (order) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  return (
      <>
        <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
        <div className="contents">
          <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap side-conts" data-type="responsive">
            <h2 className="h-tit">정책정보 개방</h2>
          </div>

          <p className="guide-txt">
            중소벤처24에서는 중소벤처기업부에서 보유하고 있는 정보 및 서비스를 API를 통해 배포하고 있습니다. <br />
            Open API는 중소벤처기업부 각 기관 및 이를 서비스하고자 하는 일반을 대상으로 배포하고 있습니다.<br />
            * 다만, 해당 인증키는 신청 및 가능여부를 판단하여 제공하고 있습니다.
          </p>

          {/* 탭 영역 */}
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

          {/* 검색 필터 영역 */}
          <div className="search-top-box no-details mt-40">
            <div className="form-row-box">
              <div className="select-box">
                <label className="label" htmlFor="select_inquiry">문의구분</label>
                <select id="select_inquiry" className="krds-form-select medium">
                  <option value="">전체</option>
                  <option value="인증키 관련">인증키 관련</option>
                  <option value="API 오류">API 오류</option>
                </select>
              </div>
              <div className="select-box">
                <label className="label" htmlFor="select_status">처리상태</label>
                <select id="select_status" className="krds-form-select medium">
                  <option value="">전체</option>
                  <option value="접수">접수</option>
                  <option value="답변완료">답변완료</option>
                </select>
              </div>
            </div>
            <div className="form-row-box gap-12">
              <div className="select-box">
                <label className="label" htmlFor="select_search_type">검색구분</label>
                <select id="select_search_type" className="krds-form-select medium">
                  <option value="title">제목</option>
                  <option value="writer">작성자</option>
                </select>
              </div>
              <div className="sch-input w-476">
                <input type="text" className="krds-input medium" placeholder="검색어를 입력하세요" title="검색어 입력" />
                <button type="button" className="krds-btn medium icon ico-search">
                  <span className="sr-only">검색</span>
                  <i className="svg-icon ico-sch"></i>
                </button>
              </div>
            </div>
          </div>

          {/* 리스트 상단 정보 및 정렬 */}
          <div className="search-list-top mt-40">
            <ul className="sch-info" aria-live="polite">
              <li>검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>건</li>
            </ul>
            <ul className="sch-sort">
              <li>
                <strong className="sort-label">정렬기준</strong>
                <div className="w-sort-btn">
                  <button
                      type="button"
                      className={sortOrder === 'latest' ? 'active' : ''}
                      onClick={() => handleSortChange('latest')}
                  >
                    최신순 {sortOrder === 'latest' && <span className="sr-only">선택됨</span>}
                  </button>
                  <button
                      type="button"
                      className={sortOrder === 'oldest' ? 'active' : ''}
                      onClick={() => handleSortChange('oldest')}
                  >
                    과거순 {sortOrder === 'oldest' && <span className="sr-only">선택됨</span>}
                  </button>
                </div>
                <div className="m-sort-btn">
                  <select
                      className="krds-form-select-sort"
                      value={sortOrder}
                      onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="latest">최신순</option>
                    <option value="oldest">과거순</option>
                  </select>
                </div>
              </li>
            </ul>
          </div>

          {/* 테이블 영역 */}
          <div className="krds-table-wrap">
            <table className="tbl col data">
              <caption>API Q&A 정보 테이블</caption>
              <colgroup>
                <col style={{ width: '80px' }} />
                <col style={{ width: '140px' }} />
                <col />
                <col style={{ width: '120px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '120px' }} />
              </colgroup>
              <thead>
              <tr>
                <th scope="col" className="ac">순번</th>
                <th scope="col" className="ac">문의구분</th>
                <th scope="col" className="ac">제목</th>
                <th scope="col" className="ac">작성자</th>
                <th scope="col" className="ac">처리상태</th>
                <th scope="col" className="ac">등록일</th>
              </tr>
              </thead>
              <tbody>
              {pagedRows.length > 0 ? (
                  pagedRows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="ac">
                          <span>{totalElements - ((currentPage - 1) * PAGE_SIZE + index)}</span>
                        </td>
                        <td className="ac"><span>{row.inquiryType}</span></td>
                        <td>
                          <Link to={`/cs/opndata/UI_USR_L_230_detail/${row.id}`} className="onellipsis-1">
                            <span className="on-colorblue2">{row.title}</span>
                            {row.isPrivate && <i className="svg-icon ico-lock" style={{ marginLeft: '4px' }}></i>}
                          </Link>
                        </td>
                        <td className="ac"><span>{row.writer}</span></td>
                        <td className="ac">
                          {/* 답변완료 시 강조 스타일 예시 (공통 가이드가 있다면 해당 클래스 사용) */}
                          <span className={row.status === '답변완료' ? 'point' : ''}>{row.status}</span>
                        </td>
                        <td className="ac"><span>{row.regDate}</span></td>
                      </tr>
                  ))
              ) : (
                  <tr><td colSpan="6" className="ac">검색 결과가 없습니다.</td></tr>
              )}
              </tbody>
            </table>
          </div>

          {/* 페이징 */}
          <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              syncUrl
          />

          {/* 하단 버튼 그룹 */}
          <div className="onboard-btm-btngroup bt-0 btn-single">
            <div>
              <button type="button" className="krds-btn primary xlarge">
                문의하기
              </button>
            </div>
          </div>
        </div>
      </>
  );
};

export default UI_USR_L_230;