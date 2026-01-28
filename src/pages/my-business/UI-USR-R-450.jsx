import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_R_450 = () => {

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
          <h2 className="h-tit">기업 기본정보</h2>
        </div>
        
        <div className="conts-wrap">
          <h3 className="sec-tit">기본정보</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data tbl-row"> {/* row타입 테이블 class명: tbl-row */}
              <caption>기업 기본정보 표. 사업자등록번호(법인번호), 기업대표전화번호, 기업대표이메일, 주생산품, 기업주소 정보가 제공됨.  </caption>
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row" className="ac">사업자등록번호(법인번호)</th>
                  <td>100-20-30000</td>
                  <th scope="row"  className="ac">기업대표전화번호</th>
                  <td>02-1111-2222</td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업대표이메일</th>
                  <td></td>
                  <th scope="row"  className="ac">주생산품</th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업대표이메일</th>
                  <td></td>
                  <th scope="row"  className="ac">주생산품</th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업주소</th>
                  <td></td>
                  <th scope="row"></th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업주소</th>
                  <td></td>
                  <th scope="row"></th>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">상세정보</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data tbl-row"> {/* row타입 테이블 class명: tbl-row */}
              <caption>기업 기본정보 표. 사업자등록번호(법인번호), 기업대표전화번호, 기업대표이메일, 주생산품, 기업주소 정보가 제공됨.  </caption>
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row" className="ac">사업자등록번호(법인번호)</th>
                  <td>100-20-30000</td>
                  <th scope="row"  className="ac">기업대표전화번호</th>
                  <td>02-1111-2222</td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업대표이메일</th>
                  <td></td>
                  <th scope="row"  className="ac">주생산품</th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업대표이메일</th>
                  <td></td>
                  <th scope="row"  className="ac">주생산품</th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업주소</th>
                  <td></td>
                  <th scope="row"></th>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row"  className="ac">기업주소</th>
                  <td></td>
                  <th scope="row"></th>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="onboard-btm-btngroup bt-0 btn-single">
          <div>
            <button type="button" className="krds-btn primary xlarge" >
                상세정보 수정
            </button>
          </div>
        </div>
      </div> 

     
    </>
  );
};

export default UI_USR_R_450;
