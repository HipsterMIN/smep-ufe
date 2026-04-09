import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const PAGE_SIZE = 10;

const API_KEY_REQUEST_MOCK = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  orgName: '중소벤처기업부',
  systemName: `수출유망중소기업지정증_test_${index + 1}`,
  apiName: index % 2 === 0 ? '스마트공장수준확인서' : '성과공유기업확인서',
  email: `api${index + 1}@tipa.or.kr`,
  requestDate: `2025-08-${String((index % 28) + 1).padStart(2, '0')}`,
  canView: index % 3 === 0 ? 'N' : 'Y',
}));

const UI_USR_L_220 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const [currentPage, setCurrentPage] = useState(1);

  const totalElements = API_KEY_REQUEST_MOCK.length;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);

  const pagedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return API_KEY_REQUEST_MOCK.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
            정책정보 개방
          </h2>
        </div>

        <p className="guide-txt">
          중소벤처24에서는 중소벤처기업부에서 보유하고 있는 정보 및 서비스를 API를 통해 배포하고 있습니다. <br />
          Open API는 중소벤처기업부 각 기관 및 이를 서비스하고자 하는 일반을 대상으로 배포하고 있습니다.<br />
          * 다만, 해당 인증키는 신청 및 가능여부를 판단하여 제공하고 있습니다.
        </p>

        <div className="tab fill full mt-48">
          <ul>
            <li>
              <Link to="#" className="btn-tab">
                API 소개
              </Link>
            </li>
            <li className="active">
              <Link to="#" className="btn-tab">
                인증키 신청
                <span className="sr-only">현재 페이지</span>
              </Link>
            </li>
            <li>
              <Link to="#" className="btn-tab">
                API Q&A
              </Link>
            </li>
          </ul>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit side-conts">
            인증키 신청
            <button type="button" className="krds-btn secondary small">인증키 신청</button>
          </h3>
          <p className="conts-desc">
            중소벤처24의 Open API를 사용하시고자 하시는 기관 및 시스템 담당자께서는 인증키 신청서를 작성하여 인증키 정보를 확인하시거나, 중소벤처24 운영팀에게 문의해 주시면 담당자 확인 후 이메일로 인증키 정보를 보내드립니다.
          </p>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">인증키 신청 이력</h3>

          <div className="search-list-top">
            <ul className="sch-info" aria-live="polite">
              <li>검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>건</li>
            </ul>
            <ul className="sch-sort">
              <li>
                <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
                <div className="w-sort-btn">
                  <button type="button" className="active">최신순<span className="sr-only">선택됨</span></button>
                  <button type="button">과거순</button>
                </div>
                <div className="m-sort-btn">
                  <select className="krds-form-select-sort" id="sort">
                    <option>최신순</option>
                    <option>과거순 </option>
                  </select>
                </div>
              </li>
            </ul>
          </div>

          <div className="krds-table-wrap">
            <table className="tbl col data t-block">
              <caption>인증키 신청 이력 정보. 순번, 소속기관, 시스템명, 신청API, 신청 이메일, 신청일, 조회 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col />
                <col />
                <col style={{ width: '15%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '5%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">순번</th>
                  <th scope="col" className="ac">소속기관</th>
                  <th scope="col" className="ac">시스템명</th>
                  <th scope="col" className="ac">신청API</th>
                  <th scope="col" className="ac">신청 이메일</th>
                  <th scope="col" className="ac">신청일</th>
                  <th scope="col" className="ac">조회</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, index) => (
                  <tr key={row.id}>
                    <th scope="row" className="ac">
                      <span>{totalElements - ((currentPage - 1) * PAGE_SIZE + index)}</span>
                    </th>
                    <td className="ac"><span>{row.orgName}</span></td>
                    <td>
                      <span>{row.systemName}</span>
                    </td>
                    <td className="ac"><span>{row.apiName}</span></td>
                    <td className="ac"><span>{row.email}</span></td>
                    <td className="ac"><span>{row.requestDate}</span></td>
                    <td className="ac"><span>{row.canView}</span></td>
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

export default UI_USR_L_220;
