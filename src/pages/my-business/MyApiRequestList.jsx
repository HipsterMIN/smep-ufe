import React, { useMemo, useState, useEffect } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { api as apiClient } from '@lib/apiClient.js';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/useAuthStore.jsx'; // API 클라이언트 임포트

const MyApiRequestList = () => { // mbrNo를 받아옵니다.
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const mbrNo = '2025120500381316';
  const [historyList, setHistoryList] = useState([]); // 실제 데이터를 담을 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeOption, setPageSizeOption] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const authToken = useAuthStore((state) => state.token);

  const isLoggedIn = Boolean(authToken);

  // 1. 백엔드 API로부터 데이터 호출
  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get(`/api/v1/apikey/history/list?mbrNo=${mbrNo}`);
        if (!isMounted) return;
        setHistoryList(res.data);
      } catch (error) {
        if (!isMounted) return;
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (isLoggedIn && mbrNo) {
      fetchHistory();
    } else {
      setIsLoading(false);
      setHistoryList([]); // 로그인 상태가 아니면 이력 초기화
    }
    return () => {
      isMounted = false;
    };
  }, [mbrNo, isLoggedIn]);

  // 2. 페이징 계산 로직
  const totalElements = historyList.length;
  const effectivePageSize = pageSizeOption === 'ALL' ? Math.max(totalElements, 1) : 10;
  const totalPages = Math.ceil(totalElements / effectivePageSize);

  const pagedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * effectivePageSize;
    return historyList.slice(startIndex, startIndex + effectivePageSize);
  }, [currentPage, effectivePageSize, historyList]);

  const handlePageChange = (page) => setCurrentPage(page);

  // const handlePageSizeOptionChange = (event) => {
  //   setPageSizeOption(event.target.value);
  //   setCurrentPage(1);
  // };

  const getLinkSitePath = (apiSeCd) => {
    const pathMap = {
      AD05: 'supportBusinessInfoApi',
      AD02: 'eventInfoApi',
      Y105: 'innoBizCertificateApi',
      Y106: 'ventureCertificateApi',
      Y104: 'mainBizCertificateApi',
    };
    return pathMap[apiSeCd] ?? null;
  };

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap side-conts" data-type="responsive">
          <h2 className="h-tit">나의 Open API 신청내역</h2>
        </div>

        <div className="conts-wrap">
          <h3 className="sec-tit">인증키 신청 이력</h3>

          <div className="search-list-top">
            <ul className="sch-info" aria-live="polite">
              <li>검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>건</li>
            </ul>
            {/*<ul className="sch-sort">*/}
            {/*  <li>*/}
            {/*    <strong className="sort-label"><label htmlFor="sort1">목록 표시 개수</label></strong>*/}
            {/*    <div>*/}
            {/*      <select*/}
            {/*        className="krds-form-select-sort"*/}
            {/*        id="sort1"*/}
            {/*        value={pageSizeOption}*/}
            {/*        onChange={handlePageSizeOptionChange}*/}
            {/*      >*/}
            {/*        <option value="ALL">전체</option>*/}
            {/*        <option value="10">10개</option>*/}
            {/*      </select>*/}
            {/*    </div>*/}
            {/*  </li>*/}
            {/*</ul>*/}
          </div>

          <div className="krds-table-wrap">
            <table className="tbl col data t-block">
              <caption>인증키 신청 이력 표. 순번, 소속기관, 시스템명, 신청API, 신청 이메일, 신청일, 사용여부 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '7.4%' }} />
                <col style={{ width: '16.8%' }} />
                <col style={{ width: '16.2%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '16%' }} />
                <col />
                <col style={{ width: '9.2%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">순번</th>
                  <th scope="col" className="ac">소속기관</th>
                  <th scope="col" className="ac">시스템명</th>
                  <th scope="col" className="ac">신청API</th>
                  <th scope="col" className="ac">신청 이메일</th>
                  <th scope="col" className="ac">신청일</th>
                  <th scope="col" className="ac">사용여부</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="7" className="ac">데이터를 불러오는 중입니다...</td></tr>
                ) : pagedRows.length > 0 ? (
                  pagedRows.map((row, index) => (
                    <tr key={index}>
                      {/* 순번: 전체 개수에서 역순으로 계산 */}
                      <th className="ac"><span>{totalElements - ((currentPage - 1) * effectivePageSize + index)}</span></th>
                      <td className="ac"><span>{row.ogdpInstNm}</span></td>
                      <td className="ac"><span>{row.siteNm}</span></td>
                      <td className="ac">
                        <span
                          className="txt-point"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            const path = getLinkSitePath(row.apiSeCd);
                            if (path) navigate(`/cs/opndata/UI_USR_L_210/${path}`);
                          }}
                        >
                          {row.apiNm}
                        </span>
                      </td>
                      <td className="ac"><span>{row.picEmlAddr}</span></td>
                      <td className="ac"><span>{row.apiAplyYmd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}</span></td>
                      <td className="ac"><span>{row.useYn}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="ac">신청 내역이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
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

export default MyApiRequestList;