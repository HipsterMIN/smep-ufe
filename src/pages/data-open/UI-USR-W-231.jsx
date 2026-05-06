import React, { useRef } from 'react';
import { Link } from 'react-router-dom'; 

import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';


const UI_USR_W_231 = () => {
  //  숨겨진 file input ref 
  const fileInputRef = useRef(null);

  // 첨부파일 버튼 클릭 시 input 이벤트 트리거
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

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
            정책정보 개방
          </h2>
        </div>

        <p className="guide-txt">
          중소벤처24에서는 중소벤처기업부에서 보유하고 있는 정보 및 서비스를 API를 통해 배포하고 있습니다. <br />
          Open API는 중소벤처기업부 각 기관 및 이를 서비스하고자 하는 일반을 대상으로 배포하고 있습니다.<br />
        * 다만, 해당 인증키는 신청 및 가능여부를 판단하여 제공하고 있습니다.
        </p>

        {/* tab link */}
        <div className="tab fill full mt-48">
          <ul>
            <li>
              <Link to="#" className="btn-tab">
                    API 소개
              </Link>
            </li>
            <li>
              <Link to="#" className="btn-tab">
                   인증키 신청
              </Link>
            </li>
            <li className="active">
              <Link to="#" className="btn-tab">
                    API Q&A
                <span className="sr-only">현재 페이지</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* form */}
        <div className="mt-48">
          <div className="on-form-register">
            <p className="txt-caution">*표시는 필수 입력입니다.</p>
            <dl className="on-form-row large">
              <div className="form-row-item ">
                <dt className="form-row-label">
                  <label htmlFor="input_01">이름</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper  w-220">
                    <input type="text" id="input_01" className="krds-input small" placeholder="이름을 입력해주세요." ></input>
                  </div>
                </dd>
                <dt className="form-row-label">
                  <label htmlFor="input_02">휴대전화번호</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper  w-220">
                    <input type="text" id="input_02" className="krds-input small" placeholder="휴대전화번호를 입력해주세요." ></input>
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="select_01">
                    문의구분<span className="on-required"><span className="sr-only">필수입력</span></span>
                  </label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <select id="select_01" className="krds-form-select small">
                      <option value="" selected>일반문의</option>
                    </select>
                  </div>
                </dd>
                <dt
                  className="form-row-label"
                >
                  <span className="label-title" id="visibility-label">
                      공개여부
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
              <div className="form-row-item ">
                <dt className="form-row-label">
                  <label htmlFor="input_03">제목<span className="on-required"><span className="sr-only">필수입력</span></span></label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <input type="text" id="input_03" className="krds-input small" placeholder="제목을 입력해주세요." ></input>
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
                        className="krds-input medium"
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
                <dt className="form-row-label">
                  <label htmlFor="file-input" className="label">첨부파일</label>
                </dt>
                <dd className="form-row-content">
                  <ul className="info-list-point">
                    <li><i className="svg-icon ico-checkbox"></i>첨부파일은 10MB 이하의 파일만 가능합니다.</li>
                    <li><i className="svg-icon ico-checkbox"></i>첨부파일은 zip 압축파일, 문서(한글, 엑셀, MS워드, 파워포인트, PDF, TXT)또는 이미지(jpg, png, gif 등)파일만 가능합니다.</li>
                  </ul>
                  <div className="file-upload mt-16">
                    {/* 실제 파일 입력창은 숨김 처리 */}
                    <input 
                      type="file" 
                      id="file-input" 
                      className="sr-only" 
                      ref={fileInputRef}
                    />
                    <button 
                      type="button" 
                      className="krds-btn secondary medium"
                      onClick={handleButtonClick}
                    >
                      찾아보기
                    </button>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* bottom btn */}
        <div className="onboard-btm-btngroup bt-0">
          <div> 
            <button type="button" className="krds-btn tertiary xlarge">
              취소
            </button>
          </div>
          <div> 
            <button type="button" className="krds-btn primary xlarge">
              저장
            </button>
          </div>
        </div>
        
      </div> 
    </>
  );
};

export default UI_USR_W_231;
