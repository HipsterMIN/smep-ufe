import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';


const UI_USR_R_451 = () => {

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
        
        <div className="conts-wrap form-confirm">
          <h3 className="sec-tit">비밀번호 재확인</h3>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">정확한 본인확인을 위해 다시 한 번 비밀번호를 입력해 주세요.</li>
            <li role="listitem">비밀번호는 타인에게 노출되지 않도록 주의해 주세요.</li>
          </ul>

          <div className="form-group krds-check-area">
            <div className="krds-form-check">
              <input type="checkbox" name="save_id" id="chk_01" />
              <label htmlFor="chk_01">키보드 보안 프로그램 적용</label>
            </div>
          </div>
          <p className="txt-caution">※ 안전한 중소벤처24 서비스 이용을 위해 키보드보안 프로그램 적용을 권장합니다.</p>

          <dl className="on-form-row large">
            <div className="form-row-item ">
              <dt className="form-row-label">
                <label htmlFor="input_01">
                  아이디
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="input_01" className="krds-input small" value="smes2025" disabled></input>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_02">
                  비밀번호
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="password" id="input_02" className="krds-input small" placeholder="비밀번호를 입력해주세요." ></input>
                </div>
              </dd>
            </div>
          </dl>
        </div>


        {/* bottom btn */}
        <div className="onboard-btm-btngroup bt-0 btn-single">
          <div> 
            <button type="button" className="krds-btn primary xlarge">
              다음 단계
            </button>
          </div>
        </div>
      </div> 

     
    </>
  );
};

export default UI_USR_R_451;
