import React from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext';

const UI_USR_L_190 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

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

        <div className="search-top-box">
          <div className="sch-form-wrap">
            <select className="krds-form-select">
              <option value="">품목명</option>
              <option value="">인증제도명</option>
            </select>
            <div className="sch-input">
              <input type="text" className="krds-input" placeholder="검색어를 입력해주세요." title="검색어 입력" />
              <button type="button" className="krds-btn medium icon ico-search" >
                <span className="sr-only">검색</span>
                <i className="svg-icon ico-sch"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>
              <button type="button" className="krds-btn medium text">
                <i className="svg-icon ico-excel"></i> 다운로드
              </button>
            </li>
          </ul>
          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label for="sort">정렬기준</label></strong>
              <div className="w-sort-btn">
                <button type="button" className="active">등록일순<span className="sr-only">선택됨</span></button>
                <button type="button">마감일순</button>
              </div>
              <div className="m-sort-btn">
                <select className="krds-form-select-sort" id="sort">
                  <option>등록일순</option>
                  <option>마감일수</option>
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
              {Array.from({ length: 10 }).map((_, index) => (
                <tr>
                  <th scope="row" className="ac">
                    <span>123</span>
                  </th>
                  <td className="ac"><span>안전</span></td>
                  <td>
                    <a href="#">
                      <span>가스용품검사</span>
                    </a>
                  </td>
                  <td className="ac"><span>2</span></td>
                  <td className="ac"><span>액화석유가스의 안전관리 및 사업법</span></td>
                  <td className="ac"><span>산업통상부</span></td>
                  <td className="ac"><span>87</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* table [E] */}

        <Pagination/>

      </div> 
    </>
  );
};

export default UI_USR_L_190;