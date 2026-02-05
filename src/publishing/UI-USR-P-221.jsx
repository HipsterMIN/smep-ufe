import { useState } from 'react';
import Popup from '../components/ui/Popup';


const UI_USR_P_221 = () => {
  // 팝업 동작
    const [isPopupOpen, setIsPopupOpen] = useState(false); 

  return (
    <>
      {/* 예시 버튼 */}
	    <button type="button" className="krds-btn  primary" onClick={() => setIsPopupOpen(true)} > 인증키 신청 조회</button>
      <Popup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        title="인증키 신청 조회"
        footer={
          <>
            <button type="button" className="krds-btn tertiary medium" onClick={() => setIsPopupOpen(false)}>닫기</button>
            <button type="button" className="krds-btn primary medium" onClick={() => setIsPopupOpen(false)}>등록</button>
          </>
        }
      >
        {/* input  */}
        <div className="form-area mt-16">
          <div className="txt-box small bg-white">
            <h4 className="box-tit2">신청자 정보</h4>
            <div className="box-cnt gap-8">
              <div className="form-group-row">
                <div className="form-group">
                    <div className="form-tit">
                      <label htmlFor="id_01" className="form-label">이름</label>
                    </div>
                  <div className="form-conts">
                    <input type="text" id="id_01" className="krds-input small" value="010-0000-0000" disabled />
                  </div>
                </div>
                <div className="form-group">
                    <div className="form-tit">
                      <label htmlFor="id_02" className="form-label">휴대전화 번호</label>
                    </div>
                  <div className="form-conts">
                    <input type="text" id="id_02" className="krds-input small" value="010-0000-0000" disabled />
                  </div>
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                    <div className="form-tit">
                      <label htmlFor="id_03" className="form-label">이메일</label>
                    </div>
                  <div className="form-conts">
                    <input type="text" id="id_03" className="krds-input small" value="-" disabled />
                  </div>
                </div>
                <div className="form-group">
                    <div className="form-tit">
                      <label htmlFor="id_04" className="form-label">유선전화번호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
                    </div>
                  <div className="form-conts">
                    <input type="text" id="id_04" className="krds-input small"  value="010-0000-0000" disabled />
                  </div>
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                    <div className="form-tit">
                      <label htmlFor="id_04" className="form-label">소속기관 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
                    </div>
                  <div className="form-conts">
                    <select className="krds-form-select small" disabled>
                      <option value="">중소벤처기업부</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                    <div className="form-tit">
                      <label htmlFor="id_04" className="form-label sr-only">소속기관</label>
                    </div>
                  <div className="form-conts">
                    <input type="text" id="id_04" className="krds-input small" value="중소벤처기업부" disabled />
                  </div>
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                    <div className="form-tit">
                      <label htmlFor="id_05" className="form-label">부서</label>
                    </div>
                  <div className="form-conts">
                    <input type="text" id="id_05" className="krds-input small" value="-" disabled />
                  </div>
                </div>
                <div className="form-group">
                    <div className="form-tit">
                      <label htmlFor="id_06" className="form-label">직위</label>
                    </div>
                  <div className="form-conts">
                    <input type="text" id="id_06" className="krds-input small" value="-" disabled />
                  </div>
                </div>
              </div>
              <div className="form-info-group mt-24">
                <dl className="form-info">
                  <dt>사용여부</dt>
                  <dd>Y</dd>
                </dl>
                <dl className="form-info">
                  <dt>인증키</dt>
                  <dd>sltKZHk399z34dMORyUFfCzBFbynkplokQkvTRiX%2BBAnsip73zPZ2Wfi%2F9uCAG%2FQ</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="txt-box small bg-white">
          <h4 className="box-tit2">활용목적</h4>
          <div className="box-cnt gap-24">
            <div className="form-group">
                <div className="form-tit">
                  <label htmlFor="id_07" className="form-label">시스템명<span className="on-required"><span className="sr-only">필수입력</span></span></label>
                </div>
              <div className="form-conts">
                <input type="text" id="id_07" className="krds-input small" placeholder="API가 적용될 시스템명을 입력해주세요."  disabled />
              </div>
            </div>

            <div className="form-info-group mt-24">
                <dl className="form-info">
                  <dt>API 선택<span className="on-required"><span className="sr-only">필수입력</span></span></dt>
                  <dd></dd>
                </dl>
                <dl className="form-info">
                  <dt>용도<span className="on-required"><span className="sr-only">필수입력</span></span></dt>
                  <dd>웹사이트 개발</dd>
                </dl>
                <dl className="form-info">
                  <dt>활용목적<span className="on-required"><span className="sr-only">필수입력</span></span></dt>
                  <dd>스마트공장수준확인서</dd>
                </dl>
              </div>

          </div>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_P_221;
