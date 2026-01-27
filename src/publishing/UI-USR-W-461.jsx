import { useState } from 'react';
import Popup from '../components/ui/Popup';


const UI_USR_W_461 = () => {
  // 팝업 동작
    const [isPopupOpen, setIsPopupOpen] = useState(false); 

  return (
    <>
      {/* 예시 버튼 */}
	    <button type="button" className="krds-btn  primary" onClick={() => setIsPopupOpen(true)} >담당자 등록</button>
      <Popup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        title="담당자 등록"
        footer={
          <>
            <button type="button" className="krds-btn tertiary medium" onClick={() => setIsPopupOpen(false)}>닫기</button>
            <button type="button" className="krds-btn primary medium" onClick={() => setIsPopupOpen(false)}>등록</button>
          </>
        }
      >

        {/* input  */}
        <div className="txt-box small bg-white gap-16">
          <h3 className="box-tit2">담당자 조회</h3>
          <p className="box-sub">조회하실 담당자의 개인ID를 입력해 주세요.</p>
          <div className="box-cnt gap-8">
            <div className="form-group row-sm">
              <div className="form-tit">
                <label htmlFor="id_01" className="form-label">이름</label>
              </div>
              <div className="form-conts">
                  <input type="text" id="id_01" className="krds-input small w-260" value="-"  />
              </div>
            </div>
            <div className="form-group row-sm">
              <div className="form-tit">
                <label htmlFor="id_02" className="form-label">아이디</label>
              </div>
              <div className="form-conts">
                <div className="form-wrapper">
                  <input type="text" id="id_02" className="krds-input small w-260" value="-"  />
                  <button type="button" className="krds-btn small secondary">조회</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="conts-wrap">
          <h2 className="sec-tit">담당자 정보</h2>
           <div className="on-detail-list small">
              <dl>
                <dt>홍길동</dt>
                <dd>
                  <div className="info-conts">
                    <span className="info-text">abc2340</span>
                    <span className="info-text">010-0000-0000</span>
                    <span className="info-text">abc2345@gmail.com</span>
                    <div className="info-btns">
                      <button type="button" className="krds-btn small tertiary">부서명</button>
                      <button type="button" className="krds-btn small tertiary">직급명</button>
                    </div>
                  </div>
                </dd>
              </dl>
          </div>
        </div>
          
      </Popup>
    </>
  );
};

export default UI_USR_W_461;
