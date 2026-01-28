import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination  from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_L_550 = () => {
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
            나의 Open API 신청내역
          </h2>
        </div>

        <div className="conts-wrap">
          <h3 className="sec-tit">인증키 신청 이력</h3>

          <div className="search-list-top">
            <ul className="sch-info" aria-live="polite">
              <li>검색 결과 <span className="point">2</span>건</li>
            </ul>
            <ul className="sch-sort">
              <li>
                <strong className="sort-label"><label htmlFor="sort1">목록 표시 개수</label></strong>
                <div>
                  <select className="krds-form-select-sort" id="sort1">
                    <option>전체</option>
                    <option>10개</option>
                  </select>
                </div>
              </li>
            </ul>
          </div>

          <div className="krds-table-wrap">
            <table className="tbl col data">
              <caption>인증키 신청 이력 표. 순번, 소속기관, 시스템명, 신청API, 신청 이메일, 신청일, 사용여부 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '7.4%' }}/>
                <col style={{ width: '16.8%' }}/>
                <col style={{ width: '16.2%' }}/>
                <col style={{ width: '20%' }}/>
                <col style={{ width: '16%' }}/>
                <col/>
                <col style={{ width: '9.2%' }}/>
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
                <tr>
                  <td className="ac"><span>2</span></td>
                  <td className="ac"><span>중소벤처기업부</span></td>
                  <td className="ac"><span>스마트공장수준확인서</span></td>
                  <td className="ac"><span className="txt-point">성과공유기업확인서</span></td>
                  <td className="ac"><span>haru@tipa.or.kr</span></td>
                  <td className="ac"><span>2025-08-14</span></td>
                  <td className="ac"><span>Y</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Pagination/>

      </div> 
    </>
  );
};

export default UI_USR_L_550;
