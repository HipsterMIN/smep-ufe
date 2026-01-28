import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_L_310 = () => {
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
          <h2 className="h-tit">공지사항</h2>
        </div>
        <div className="search-top-box">
          <div className="sch-form-wrap">
            <select className="krds-form-select">
              <option value="">전체</option>
              <option value="">항목</option>
              <option value="">항목</option>
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
            <li>검색 결과 <span className="point">24</span>개</li>
          </ul>
          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label for="search_result_count">목록 표시 개수</label></strong>
              <select className="krds-form-select-sort" id="search_result_count">
                <option>12개</option>
                <option>9개</option>
              </select>
            </li>
          </ul>
        </div>
        {/* table [S] */}
        <div className="krds-table-wrap">
          <table className="tbl col data">
            <caption>공지사항 목록. 번호, 제목, 등록일, 조회수 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '7.4 %' }} />
              <col />
              <col style={{ width: '14%' }} />
              <col style={{ width: '7.4 %' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">번호</th>
                <th scope="col" className="ac">제목</th>
                <th scope="col" className="ac">등록일</th>
                <th scope="col" className="ac">조회</th>
              </tr>
            </thead>
            <tbody>
              {/* 고정 케이스 */}
              <tr>
                <th scope="row" className="ac">
                  <i className="svg-icon ico-pin"></i>
                  <span className="sr-only">고정 게시글</span>
                </th>
                <td>
                  <a className="onellipsis-1 notice-pinned" href="#">
                    <span className="krds-badge bg-light-primary">공지</span>
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>2025-04-16</span></td>
                <td className="ac"><span>433</span></td>
              </tr>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <a className="onellipsis-1" href="#">
                    <span className="krds-badge bg-light-primary">공지</span>
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>2025-04-16</span></td>
                <td className="ac"><span>433</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* table [E] */}
        <Pagination /> 
      </div> 
    </>
  );
};

export default UI_USR_L_310;
