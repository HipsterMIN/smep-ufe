import React, {useCallback, useEffect, useRef, useState} from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import Tab from '@components/ui/Tab';
import Datepicker from '@components/ui/Datepicker';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { api as apiClient } from '@lib/apiClient.js';
import { useNavigate } from 'react-router-dom';

function ScrapToggleButton({ row, onToggle }) {
  // 1. 처음 로딩 시 목록에 있다면 기본적으로 '등록된 상태(Y)'로 시작
  // 만약 서버에서 row.use_yn을 준다면 그 값을 초기값으로 사용
  const [isRegistered, setIsRegistered] = useState(row.use_yn !== undefined ? row.use_yn === 'Y' : true);

  const btnLabel = isRegistered ? '관심공고 해제' : '관심공고 등록';
  const btnClass = isRegistered ? 'tertiary' : 'primary';

  const handleClick = async (e) => {
    e.stopPropagation();

    // 부모의 toggleScrap을 실행하고 결과를 기다림
    const success = await onToggle(row.id);

    if (success) {
      // 서버 통신 성공 시에만 프론트엔드 버튼 상태를 반전시킴
      setIsRegistered(!isRegistered);
    }
  };

  return (
      <button
          type="button"
          className={`krds-btn small width-auto ${btnClass}`}
          onClick={handleClick}
      >
        {btnLabel}
      </button>
  );
}

const ScrapList = () => {
  const tabData = useRef(['사업공고', '정책금융']);

  const categoryMap = { '사업공고': 'BIZP', '정책금융': 'PLCF' };

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


  // 서버에서 받아온 실제 데이터 상태
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);


  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const navigate = useNavigate();
  const activeCategory = tabData.current[activeTabIndex];

  const handleDetail = (row) => {
    // 서버 데이터 키값에 맞춰 안전하게 추출
    const type = row.pbanc_type_se_cd || row.pbancTypeSeCd;

    if (type === 'BIZP') {
      navigate(`/req/pbanc/${row.id}`);
    } else if (type === 'PLCF') {
      navigate(`/req/UI_USR_L_030/${row.id}`);
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // LocalDateTime → 화면 표시용 포맷 (2025-12-11T10:04:00 → 2025-12-11 10:04)
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return dateTime.replace('T', ' ').substring(0, 16);
  };
  const toggleScrap = async (targetId) => {
    try {
      const res = await apiClient.post('/api/v1/scraps/toggle', {
        scrapTypeCd: categoryMap[activeCategory],
        targetId: targetId,
      });
      const payload = res?.data ?? res;
      const result = payload?.data ?? payload;
      alert(result?.scrapped ? '등록되었습니다.' : '해제되었습니다.');
      return true; // 성공 시 true 반환
    } catch (error) {
      alert('요청 처리에 실패했습니다.');
      return false; // 실패 시 false 반환
    }
  };

  // 1. 목록 조회 함수
  const fetchListData = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        category: categoryMap[activeCategory],
        page: currentPage,
        size: pageSize,
        keyword: appliedKeyword,
        srchFrDt: formatDate(startDate),
        srchToDt: formatDate(endDate)
      };


      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && String(value).trim() !== '') {
          query.set(key, String(value));
        }
      });

      const res = await apiClient.get(`/api/v1/scraps/scrapsList?${query.toString()}`);
      const payload = res?.data ?? res;
      const result = payload?.data ?? payload;
      const items = result?.content || [];
      setRows(items);
      setTotalElements(result?.totalElements || 0);


    } catch (error) {
      console.error("목록 조회 실패", error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, currentPage, pageSize, appliedKeyword, startDate, endDate]);

  useEffect(() => {
    fetchListData();
  }, [fetchListData]);

  const deleteScrap = async (pbancScrpSn) => {
    if (!window.confirm("관심공고 목록에서 완전히 삭제하시겠습니까?")) return;

    try {
      // API 경로는 프로젝트 설계에 맞춰 수정하세요 (예: /api/v1/scraps/delete)
      await apiClient.post('/api/v1/scraps/delete', {
        scrapTypeCd: categoryMap[activeCategory],
        pbancScrpSn: pbancScrpSn
      });

      alert('삭제되었습니다.');
      fetchListData(); // 목록 새로고침 (delYn='Y'인 데이터는 백엔드 쿼리에서 필터링됨)
    } catch (error) {
      console.error("삭제 실패", error);
      alert('삭제 처리에 실패했습니다.');
    }
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    setCurrentPage(1);
    setRows([]); // 탭 변경 시 이전 데이터 초기화
  };

  const handleSearch = () => {
    setAppliedKeyword(searchKeyword);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalElements / pageSize);
  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap side-conts" data-type="responsive">
          <h2 className="h-tit">
            관심공고
          </h2>
        </div>

        <p className="guide-txt">
          중소벤처기업부의 사업공고 및 정책금융에 대한 관심공고(상품)을 조회할 수 있습니다.
        </p>

        <div className="mt-40">
          <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>
        </div>

        <div className="search-top-box no-details mt-40">
          <div className="form-row-box">
            <div className="datepicker-group">
              <Datepicker
                menuName="조회기간"
                id="datepicker_530_start"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
              <span>~</span>
              <Datepicker
                id="datepicker_530_end"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
              />
            </div>
            <div className="input-group-box">
              <label className="label" htmlFor="input_01">제목</label>
              <div className="sch-input">
                <input
                  type="text"
                  id="input_01"
                  className="krds-input medium"
                  placeholder="검색어를 입력해주세요."
                  title="검색어 입력"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <button type="button" className="krds-btn medium icon ico-search" onClick={handleSearch}>
                  <span className="sr-only">검색</span>
                  <i className="svg-icon ico-sch"></i>
                </button>
              </div>
              <button type="button" className="krds-btn primary medium" onClick={handleSearch}>검색</button>
            </div>
          </div>
        </div>

        <div className="search-list-top mt-40">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>건</li>
          </ul>
          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
              <select
                className="krds-form-select-sort"
                id="search_result_count"
                value={String(pageSize)}
                onChange={handlePageSizeChange}
              >
                <option value="12">12개</option>
                <option value="9">9개</option>
              </select>
            </li>
          </ul>
        </div>

        <div className="krds-table-wrap">
          <table className="tbl col data t-block">
            <caption>관심 공고 검색결과 목록. 번호, 등록일시, 구분, 내용 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '7.4%' }} />
              <col style={{ width: '16.8%' }} />
              <col style={{ width: '9.8%' }} />
              <col />
              <col style={{ width: '22%' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">번호</th>
                <th scope="col" className="ac">등록일시</th>
                <th scope="col" className="ac">구분</th>
                <th scope="col" className="ac">내용</th>
                <th scope="col" className="ac">관리</th>
              </tr>
            </thead>
            <tbody>
            {loading ? (
                <tr><td colSpan="5" className="ac">로딩 중...</td></tr>
            ) : rows.length > 0 ? (
                rows.map((row, index) => {

                  const displayNo = totalElements - ((currentPage - 1) * pageSize + index);
                  return (
                      <tr key={row.id}>
                        <th scope="row" className="ac">
                          <span>{displayNo}</span>
                        </th>
                        <td className="ac"><span>{formatDateTime(row.scrap_reg_dt)}</span></td>
                        <td className="ac"><span>{activeCategory}</span></td>
                        <td>
                          <span
                              onClick={() => handleDetail(row)}
                              style={{cursor: 'pointer', textDecoration: 'underline'}}
                              className="txt-link"
                          >
                            {row.title}
                          </span>
                        </td>
                        <td className="ac btn-flex">
                          <ScrapToggleButton
                              row={row}
                              onToggle={toggleScrap}
                          />
                          <button
                              type="button"
                              onClick={() => deleteScrap(row.pbanc_scrp_sn)}
                              className="krds-btn small width-auto outline" // 스타일은 krds 가이드에 맞게 조정
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                  );
                })
            ) : (
                <tr>
                  <td colSpan="5" className="ac">데이터가 없습니다.</td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          syncUrl
        />
      </div>
    </>
  );
};

export default ScrapList;
