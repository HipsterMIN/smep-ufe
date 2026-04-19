import React, { useMemo, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { formatNumberWithCommas } from '@utils/numberUtils.js';

const OPEN_API_REQUEST_HISTORY_MOCK = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  orgName: index % 2 === 0 ? '중소벤처기업부' : '중소벤처기업진흥공단',
  systemName: `스마트공장수준확인서_${index + 1}`,
  apiName: index % 2 === 0 ? '성과공유기업확인서' : '혁신성장유형 벤처기업 확인서',
  email: `haru${index + 1}@tipa.or.kr`,
  requestDate: `2025-08-${String((index % 28) + 1).padStart(2, '0')}`,
  useYn: index % 3 === 0 ? 'N' : 'Y',
}));

const MyApiRequestList = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeOption, setPageSizeOption] = useState('ALL');

  const totalElements = OPEN_API_REQUEST_HISTORY_MOCK.length;
  const effectivePageSize = pageSizeOption === 'ALL' ? Math.max(totalElements, 1) : 10;
  const totalPages = Math.ceil(totalElements / effectivePageSize);

  const pagedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * effectivePageSize;
    return OPEN_API_REQUEST_HISTORY_MOCK.slice(startIndex, startIndex + effectivePageSize);
  }, [currentPage, effectivePageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeOptionChange = (event) => {
    setPageSizeOption(event.target.value);
    setCurrentPage(1);
  };

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
            나의 Open API 신청내역
          </h2>
        </div>

        <div className="conts-wrap">
          <h3 className="sec-tit">인증키 신청 이력</h3>

          <div className="search-list-top">
            <ul className="sch-info" aria-live="polite">
              <li>검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>건</li>
            </ul>
            <ul className="sch-sort">
              <li>
                <strong className="sort-label"><label htmlFor="sort1">목록 표시 개수</label></strong>
                <div>
                  <select
                    className="krds-form-select-sort"
                    id="sort1"
                    value={pageSizeOption}
                    onChange={handlePageSizeOptionChange}
                  >
                    <option value="ALL">전체</option>
                    <option value="10">10개</option>
                  </select>
                </div>
              </li>
            </ul>
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
                {pagedRows.map((row, index) => (
                  <tr key={row.id}>
                    <th className="ac"><span>{totalElements - ((currentPage - 1) * effectivePageSize + index)}</span></th>
                    <td className="ac"><span>{row.orgName}</span></td>
                    <td className="ac"><span>{row.systemName}</span></td>
                    <td className="ac"><span className="txt-point">{row.apiName}</span></td>
                    <td className="ac"><span>{row.email}</span></td>
                    <td className="ac"><span>{row.requestDate}</span></td>
                    <td className="ac"><span>{row.useYn}</span></td>
                  </tr>
                ))}
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
