import React from "react";
import { useState } from 'react';
import Popup from '../components/ui/Popup';

const UI_USR_R_565 = () => {
	// 팝업 동작
  const [isPopupOpen, setPopupOpen] = useState(false); 
	const [isOpen, setOpen] = useState(false); 
	
  return (
    <>
	  <button type="button" className="krds-btn" onClick={() => setOpen(true)} > 정책정보 이메일 신청 등록</button>
      
	  <Popup 
        isOpen={isOpen} 
        onClose={() => setOpen(false)} 
        title="정책정보 이메일 신청 등록"
				footer={
          <>
            <button type="button" className="krds-btn tertiary medium" onClick={() => setPopupOpen(false)}>취소</button>
            <button type="button" className="krds-btn primary medium" onClick={() => setPopupOpen(false)}>등록</button>
          </>
        }
      >
        <div className="issuance-popup">
          <h3 style={{ marginBottom : '16px' }}>개인정보 수집 및 이용안내</h3>

          <div className="guide-txt">
            <ul className="krds-info-list none" role="list">
              <li role="listitem">1. 수집·이용 목적 : 중소·벤처기업, 소상공인 정책정보 안내</li>
              <li role="listitem">2. 수집하려는 개인정보의 항목<br/>- 업체명, 이름, 사업자등록번호, 이메일주소</li>
              <li role="listitem">3. 보유·이용기간 : 위 개인정보는 수집·이용에 관한 동의일로부터 중소·벤처기업, 소상공인 정책정보 안내만을 위해 보유·이용되며, 동의인이 삭제를 요청할 경우 지체없이 파기합니다.</li>
              <li role="listitem">4. 동 서비스를 받기 위해서는 개인정보 수집·이용에 관한 동의는 필수적입니다.</li>
              <li role="listitem">5. 귀하는 개인정보 수집·이용에 동의하지 않을 수 있으며, 거부 시에는 중소·벤처기업, 소상공인 정책정보 안내서비스를 받으실 수 없음을 알려드립니다.</li>
            </ul>
          </div>
          <div className="form-groupbox" style={{ marginTop : '24px' }}>
            <div className="form-item" role="group" aria-labelledby="question1">
              <div className="krds-check-area mb-24" style={{ padding : '0px' }}>
                <div className="krds-form-check medium">
                  <input name="question1" type="radio" id="chk_1-1" />
                  <label htmlFor="chk_1-1">동의합니다.</label>
                </div>
                <div className="krds-form-check medium">
                  <input name="question1" type="radio" id="chk_1-2" />
                  <label htmlFor="chk_1-2">동의하지 않습니다.</label>
                </div>
              </div>
            </div>
          </div>
          <p className="essential-text">*표시는 필수 입력입니다.</p>

          <div className="mt-24">
            <dl className="on-form-row">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_01">
                    이름<span className="on-required"><span className="sr-only">필수입력</span></span>
                  </label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-272">
                  <input type="number" id="input_01" className="krds-input small" placeholder="홍길동"></input>
                  </div>
                </dd>
              </div>

              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_05">이메일</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper row-small">
                    <input type="text" id="input_05" className="krds-input small w-140" placeholder="0000" title="이메일 첫번째 칸 입력"/>
                    <span>@</span>
                    <input type="text" className="krds-input small w-140" placeholder="0000" title="이메일 두번째 칸 입력" />
                    <span>-</span>
                    <select className="krds-form-select small w-140" title="이메일 선택">
                      <option value="">직접입력</option>
                    </select>
                  </div>
                </dd>
              </div>

              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_01">
                    업체명
                  </label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-272">
                  <input type="number" id="input_01" className="krds-input small" placeholder="업체명을 입력해주세요."></input>
                  </div>
                </dd>
              </div>

              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_01">
                    사업자등록번호
                  </label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-272">
                  <input type="number" id="input_01" className="krds-input small" placeholder="사업자등록번호를 입력해주세요."></input>
                  </div>
                  <p className="text-info">※ 기업 이용자의 경우, 사업자등록번호 입력시 기업 특성에 맞는 정책정보 제공(수시)</p>
                </dd>
              </div>

              

             
            </dl>
          </div>
				</div>
      </Popup>
    </>
  );
};

export default UI_USR_R_565;
