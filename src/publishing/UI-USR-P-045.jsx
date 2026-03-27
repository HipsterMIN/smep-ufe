import { useState } from 'react';
import Popup from '../components/ui/Popup';


const UI_USR_P_045 = () => {
  // 팝업 동작
  const [isPopupOpen, setIsPopupOpen] = useState(false); 

  return (
    <>
      {/* 예시 버튼 */}
	    <button type="button" className="krds-btn  primary" onClick={() => setIsPopupOpen(true)} > 설문조사</button>
      <Popup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        title="직접생산확인 관련 만족도 설문조사 (CP2024002)"
        footer={
          <>
            <button type="button" className="krds-btn tertiary medium" onClick={() => setIsPopupOpen(false)}>취소</button>
            <button type="button" className="krds-btn primary medium" onClick={() => setIsPopupOpen(false)}>완료</button>
          </>
        }
      >

        <div className="guide-txt">
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">본 설문지는 공공구매 조달시장의 공정한 업무처리를 위하여 2016년도에 「중소기업제품 구매촉진 및 판로지원에 관한 법률」 제9조에 따라 직접생산확인을 받은 중소기업을 대상으로 실시하고 있습니다.</li>
            <li role="listitem">귀사에서 직접생산확인을 받는 과정에서 느끼셨던 사항에 대하여 솔직하게 기재하여 주시기 바랍니다.</li>
            <li role="listitem">본 설문지의 작성자는 철저히 비밀이 보장되오니 적극 협조하여 주시기 바랍니다.</li>
            <li role="listitem">문의 : 한국중소벤처기업유통원 (TEL : 02-2124-3251~8)</li>
          </ul>
        </div>

        <div className="form-groupbox">
          <div className="form-item" role="group" aria-labelledby="question1">
            <p className="form-question" id="question1"><span>1.</span> 직접생산확인 신청 절차는 어떠하셨습니까?</p>
            <div className="krds-check-area">
              <div className="krds-form-check medium">
                <input name="question1" type="radio" id="chk_1-1" />
                <label htmlFor="chk_1-1">매우 만족</label>
              </div>
              <div className="krds-form-check medium">
                <input name="question1" type="radio" id="chk_1-2" />
                <label htmlFor="chk_1-2">만족</label>
              </div>
              <div className="krds-form-check medium">
                <input name="question1" type="radio" id="chk_1-3" />
                <label htmlFor="chk_1-3">보통</label>
              </div>
              <div className="krds-form-check medium">
                <input name="question1" type="radio" id="chk_1-4" />
                <label htmlFor="chk_1-4">불만족</label>
              </div>
              <div className="krds-form-check medium">
                <input name="question1" type="radio" id="chk_1-5" />
                <label htmlFor="chk_1-5">매우 불만족</label>
              </div>
            </div>
          </div>
          <div className="form-item" role="group" aria-labelledby="question2">
            <p className="form-question" id="question2"><span>2.</span> 직접생산확인의 처리 기간은 어떠하셨습니까?</p>
            <div className="krds-check-area">
              <div className="krds-form-check medium">
                <input name="question2" type="radio" id="chk_2-1" />
                <label htmlFor="chk_2-1">매우 만족</label>
              </div>
              <div className="krds-form-check medium">
                <input name="question2" type="radio" id="chk_2-2" />
                <label htmlFor="chk_2-2">만족</label>
              </div>
              <div className="krds-form-check medium">
                <input name="question2" type="radio" id="chk_2-3" />
                <label htmlFor="chk_2-3">보통</label>
              </div>
              <div className="krds-form-check medium">
                <input name="question2" type="radio" id="chk_2-4" />
                <label htmlFor="chk_2-4">불만족</label>
              </div>
              <div className="krds-form-check medium">
                <input name="question2" type="radio" id="chk_2-5" />
                <label htmlFor="chk_2-5">매우 불만족</label>
              </div>
            </div>
          </div>
          <div className="form-item">
            <p className="form-question"><span>3.</span> 개선사항이나 건의사항이 있으시면 자유롭게 작성해 주세요.</p>
            <div className="textarea-wrap">
              <textarea className="krds-input" placeholder="내용을 입력하세요." title="개선사항이나 건의사항 입력" />
              <p className="textarea-count">
                <span className="count-now">0</span><span className="count-total">/100</span>
              </p>
            </div>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_P_045;
