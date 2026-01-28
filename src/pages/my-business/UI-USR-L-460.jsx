import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination  from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_L_460 = () => {

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
              <col style={{ width: '7.4%' }}/>
              <col style={{ width: '9.2%' }}/>
              <col style={{ width: '14%' }}/>
              <col style={{ width: '16.8%' }}/>
              <col style={{ width: '9.2%' }}/>
              <col style={{ width: '13%' }}/>
              <col style={{ width: '13%' }}/>
              <col style={{ width: '16.6%' }}/>
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
              <tr>
                <td className="ac"><span>-</span></td>
                <td className="ac"><span>허강일</span></td>
                <td className="ac"><span>기업관리자</span></td>
                <td className="ac"><span>스마트공장수준확인서</span></td>
                <td className="ac"><span>대표</span></td>
                <td className="ac"><span>2025-08-14</span></td>
                <td className="ac"><span>2025-08-14</span></td>
                <td className="ac"><span>-</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <Pagination/>

      </div> 
    </>
  );
};

export default UI_USR_L_460;
