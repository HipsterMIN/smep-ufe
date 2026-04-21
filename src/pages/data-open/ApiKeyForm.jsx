import Popup from '@components/ui/Popup';
import {useEffect, useState} from "react";

// 부모에게서 상태를 전달받도록 Props 설정
const ApiKeyForm = ({ isOpen, onClose, onSubmit, submitting, errorMessage, mbrNo, memberInfo}) => {

  // const [memberInfo, setMemberInfo] = useState({});
  const [formData, setFormData] = useState({
    siteNm: '',
    apiRegAplyCn: '',
    // 추가적인 필드가 있다면 여기에 정의
  });

  // 3. 저장 버튼 클릭 시 실행
  const handleInternalSubmit = () => {
    if (!formData.siteNm || !formData.apiRegAplyCn) {
      alert("필수 항목을 모두 입력해 주세요.");
      return;
    }
    // 부모(훅)의 submitApply 함수를 호출
    onSubmit(formData);
  };

  return (
      <Popup
          isOpen={isOpen}
          onClose={onClose}
          title="인증키 신청"
          footer={
            <>
              <button type="button" className="krds-btn tertiary medium" onClick={onClose}>취소</button>
              <button
                  type="button"
                  className="krds-btn primary medium"
                  onClick={handleInternalSubmit}
                  disabled={submitting}
              >
                {submitting ? '신청 중...' : '인증키 신청'}
              </button>
            </>
          }
      >
        {/* 에러 메시지 표시 영역 */}
        {errorMessage && (
            <div className="txt-box mb-16">
              <p className="txt-caution">{errorMessage}</p>
            </div>
        )}

        <p className="guide-txt small">
          인증키 승인 과정에서 담당자 확인이 필요할 수 있으므로, 신청자 정보를 정확히 입력해 주세요.
        </p>

        {/* input  */}
        <div className="form-area mt-16">
          <p className="required-msg">*표시는 필수 입력입니다.</p>
          <div className="txt-box small bg-white">
            <h4 className="box-tit2">신청자 정보</h4>
            <div className="box-cnt gap-8">
              <div className="form-group-row">
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_01" className="form-label">이름</label>
                  </div>
                  <div className="form-conts">
                    <input type="text" className="krds-input small" value={memberInfo.mbrNm || ''} readOnly={true}/>
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_02" className="form-label">휴대전화 번호</label>
                  </div>
                  <div className="form-conts">
                    <input type="text" className="krds-input small" value={memberInfo.indvMblTelno || ''} readOnly={true}/>
                  </div>
                </div>
              </div>
              <div className="form-group-row">
              <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_03" className="form-label">이메일</label>
                  </div>
                <div className="form-conts">
                  <input
                      type="text"
                      id="id_03"
                      className="krds-input small"
                      value={memberInfo.emlAddr || '-'} readOnly={true}
                  />
                </div>
              </div>
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_04" className="form-label">유선전화번호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
                  </div>
                  <div className="form-conts">
                    <input
                        type="text"
                        id="id_04"
                        className="krds-input small"
                        placeholder="02-123-4567"
                        value={memberInfo.indvGnrlTelno || ''}
                        onChange={(e) => setMemberInfo({...memberInfo, indvGnrlTelno: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_04_1" className="form-label">소속기관 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
                  </div>
                  <div className="form-conts">
                    <select className="krds-form-select small">
                      <option value="">중소벤처기업부</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_04_2" className="form-label sr-only">소속기관</label>
                  </div>
                  <div className="form-conts">
                    <input type="text" id="id_04_2" className="krds-input small" defaultValue="중소벤처기업부" disabled />
                  </div>
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_05" className="form-label">부서</label>
                  </div>
                  <div className="form-conts">
                    <input type="text" className="krds-input small" value={memberInfo.picDeptNm || '-'} />
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_06" className="form-label">직위</label>
                  </div>
                  <div className="form-conts">
                    <input type="text" className="krds-input small" value={memberInfo.picJbpsNm || '-'} />
                  </div>
                </div>
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
                <input
                    type="text"
                    id="siteNm"
                    className="krds-input small"
                    placeholder="시스템명을 입력해주세요."
                    value={formData.siteNm}
                    onChange={(e) => setFormData({...formData, siteNm: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">API 선택<span className="on-required"><span
                    className="sr-only">필수입력</span></span></span>
              </div>
              <div className="form-conts mt-16">
                <div className="krds-check-area">
                  <div className="krds-form-check medium">
                    <input type="checkbox" name="hk_1-1a" id="hk_1-1a"/>
                    <label htmlFor="hk_1-1a">지원사업목록API</label>
                  </div>
                  <div className="krds-form-check medium">
                    <input type="checkbox" name="hk_1-2a" id="hk_1-2a"/>
                    <label htmlFor="hk_1-2a">행사정보</label>
                  </div>
                </div>

                <div className="krds-check-area">
                  <div className="krds-form-check medium">
                    <input type="checkbox" id="chk_1-3a"/>
                    <label htmlFor="chk_1-3a">이노비즈확인서 <br />[확인서 API]</label>
                  </div>
                  <div className="krds-form-check medium">
                    <input type="checkbox" id="chk_1-4a" />
                    <label htmlFor="chk_1-4a">벤처기업확인서</label>
                  </div>
                  <div className="krds-form-check medium">
                    <input type="checkbox" id="chk_1-5a" />
                    <label htmlFor="chk_1-5a">메인비즈확인서</label>
                  </div>
                </div>
                <p className="txt-caution">※ 이미 신청승인된 API는 신청이 불가능 합니다.</p>
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">용도<span className="on-required"><span className="sr-only">필수입력</span></span></span>
              </div>
              <div className="form-conts">
                <div className="krds-check-area">
                  <div className="krds-form-check medium">
                    <input type="radio" name="rdo_2-1" id="rdo_2-1" />
                    <label htmlFor="rdo_2-1">웹사이트 개발</label>
                  </div>
                  <div className="krds-form-check medium">
                    <input type="radio" name="rdo_2-1" id="rdo_2-2" />
                    <label htmlFor="rdo_2-2">앱 개발</label>
                  </div>
                  <div className="krds-form-check medium">
                    <input type="radio" name="rdo_2-1" id="rdo_2-3" />
                    <label htmlFor="rdo_2-3">기타</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="textarea" className="form-label">활용목적<span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </div>
              <div className="form-conts">
                <div className="textarea-wrap">
                  <textarea
                      className="krds-input"
                      id="apiRegAplyCn"
                      placeholder="활용목적은 500자 이내로 적어주세요."
                      value={formData.apiRegAplyCn}
                      onChange={(e) => setFormData({...formData, apiRegAplyCn: e.target.value})}
                  ></textarea>
                  <p className="textarea-count">
                    <span className="count-now">{formData.apiRegAplyCn.length}</span><span className="count-total">/500</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Popup>
  );
};

export default ApiKeyForm;