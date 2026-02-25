import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_L_050 = () => {

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
          <h2 className="h-tit">Q&A</h2>
        </div>

        {/* form */}
        <div className="mt-48">
          <dl className="on-form-row large">
            <div className="form-row-item ">
              <dt className="form-row-label">
                <label htmlFor="select_01">
                  카테고리<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select id="select_01" className="krds-form-select small">
                    <option value="" selected>선택해주세요</option>
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_01">
                  제목<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper">
                  <input type="text" id="input_01" className="krds-input small" placeholder="제목을 입력해주세요." ></input>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="textarea_01">
                  문의내용<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper">
                  <div className="textarea-wrap">
                    <textarea 
                      className="krds-input"
                      id="textarea_01" 
                      placeholder="문의내용을 입력해주세요."
                      required
                      rows={8}
                    />
                    <p className="textarea-count">
                      <span className="count-now">0</span><span className="count-total">/100</span>
                    </p>
                  </div>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt
                className="form-row-label"
              >
                <span className="label-title" id="visibility-label">
                    공개여부
                  <span className="on-required">
                    <span className="sr-only">필수입력</span>
                  </span>
                </span>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper">
                  <div
                    className="krds-check-area"
                    role="radiogroup"
                    aria-labelledby="visibility-label"
                  >
                    <div className="krds-form-check medium">
                      <input
                        type="radio"
                        name="visibility"
                        id="visibility-public"
                      />
                      <label htmlFor="visibility-public">공개</label>
                    </div>

                    <div className="krds-form-check medium">
                      <input
                        type="radio"
                        name="visibility"
                        id="visibility-private"
                      />
                      <label htmlFor="visibility-private">비공개</label>
                    </div>
                  </div>
                </div>
              </dd>
            </div>
          </dl>
        </div>

        {/* bottom btn */}
        <div className="onboard-btm-btngroup bt-0">
          <div> 
            <button type="button" className="krds-btn tertiary  xlarge">
              취소
            </button>
          </div>
          <div> 
            <button type="button" className="krds-btn xlarge">
              저장
            </button>
          </div>
        </div>


      </div> 
    </>
  );
};

export default UI_USR_L_050;