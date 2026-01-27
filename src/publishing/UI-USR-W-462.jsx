import { useState } from 'react';
import Popup from '../components/ui/Popup';

const UI_USR_R_62 = () => {
  // 팝업 동작
    const [isPopupOpen, setIsPopupOpen] = useState(false); 

  return (
    <>
      {/* 예시 버튼 */}
	    <button type="button" className="krds-btn  primary" onClick={() => setIsPopupOpen(true)} >기업관리자 변경</button>
      <Popup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        title="기업관리자 변경"
        footer={
          <>
            <button type="button" className="krds-btn tertiary medium" onClick={() => setIsPopupOpen(false)}>취소</button>
            <button type="button" className="krds-btn primary medium" onClick={() => setIsPopupOpen(false)}>기업관리자 변경</button>
          </>
        }
      >
        <div className="conts-wrap">
          <h2 className="sec-tit">변경 전</h2>
          <div className="on-detail-list">
            <dl>
              <dt>홍길동</dt>
              <dd>
                <div className="info-conts">
                  <span className="info-text">abc2340</span>
                  <span className="info-text">010-0000-0000</span>
                  <span className="info-text">abc2345@gmail.com</span>
                  <span className="left-auto">경영지원실 대표</span>
                </div>
              </dd>
            </dl>
          </div>
        </div>

        <div className="conts-wrap">
          <h2 className="sec-tit">변경 후</h2>
          <div className="on-detail-list">
            <dl>
              <dt>홍길동</dt>
              <dd>
                <div className="info-conts">
                  <span className="info-text">abc2340</span>
                  <span className="info-text">010-0000-0000</span>
                  <span className="info-text">abc2345@gmail.com</span>
                  <span className="left-auto">경영지원실 대표</span>
                </div>
              </dd>
            </dl>
          </div>

          <div className="form-group row-sm mt-16">
            <div className="form-tit">
              <label htmlFor="select_01" className="form-label">변경사유</label>
            </div>
            <div className="form-conts">
              <select className="krds-form-select small" id="select_01">
                <option>선택</option>
              </select>
            </div>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_R_62;
