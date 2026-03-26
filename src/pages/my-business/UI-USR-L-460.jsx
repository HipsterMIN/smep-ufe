import React, { useMemo, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const PAGE_SIZE = 10;

const MANAGER_LIST_MOCK = Array.from({ length: 13 }, (_, index) => ({
  id: index + 1,
  managerName: `담당자${index + 1}`,
  role: index === 0 ? '기업관리자' : '담당자',
  deptName: index % 2 === 0 ? '경영지원팀' : '사업운영팀',
  position: index % 2 === 0 ? '매니저' : '사원',
  mobilePhone: `010-1234-${String(1000 + index).slice(-4)}`,
  officePhone: `02-6000-${String(2000 + index).slice(-4)}`,
  email: `manager${index + 1}@example.com`,
}));

const UI_USR_L_460 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const [currentPage, setCurrentPage] = useState(1);

  const totalElements = MANAGER_LIST_MOCK.length;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);

  const pagedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return MANAGER_LIST_MOCK.slice(startIndex, startIndex + PAGE_SIZE);
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
            담당자 관리
          </h2>
        </div>

        <div className="txt-box outline">
          <ul className="check-list">
            <li>기업관리자 역할변경은 기업관리자, 담당자 누구나 할 수 있으나 반드시 법인 공동인증서로 인증하셔야 합니다.</li>
            <li>담당자 변경방법: <br />
              <ol>
                <li className="bold">1.담당자등록(변경할 담당자 개인회원 아이디 등록)</li>
                <li className="bold">2.기업관리자변경(기업인증서 필요)</li>
                <li className="bold">3.기존 담당자 삭제</li>
              </ol>
            </li>
          </ul>
        </div>

        <div className="search-list-top flex-end">
          <button type="button" className="krds-btn tertiary small">담당자 삭제</button>
          <button type="button" className="krds-btn secondary small">기업관리자 변경</button>
          <button type="button" className="krds-btn primary small">담당자 등록</button>
        </div>
        <div className="krds-table-wrap">
          <table className="tbl col data">
            <caption>담당자명 목록 표. 선택 여부, 담당자명, 역할, 부서명, 직위, 휴대전화, 유선전화, 이메일 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '7.4%' }} />
              <col style={{ width: '9.2%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '16.8%' }} />
              <col style={{ width: '9.2%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '16.6%' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">선택</th>
                <th scope="col" className="ac">담당자명</th>
                <th scope="col" className="ac">역할</th>
                <th scope="col" className="ac">부서명</th>
                <th scope="col" className="ac">직위</th>
                <th scope="col" className="ac">휴대전화</th>
                <th scope="col" className="ac">유선전화</th>
                <th scope="col" className="ac">이메일</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((row) => (
                <tr key={row.id}>
                  <td className="ac"><span>{row.role === '기업관리자' ? '-' : '선택'}</span></td>
                  <td className="ac"><span>{row.managerName}</span></td>
                  <td className="ac"><span>{row.role}</span></td>
                  <td className="ac"><span>{row.deptName}</span></td>
                  <td className="ac"><span>{row.position}</span></td>
                  <td className="ac"><span>{row.mobilePhone}</span></td>
                  <td className="ac"><span>{row.officePhone}</span></td>
                  <td className="ac"><span>{row.email}</span></td>
                </tr>
              ))}
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

export default UI_USR_L_460;
