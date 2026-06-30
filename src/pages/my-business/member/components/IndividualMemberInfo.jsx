
import {
  keepDigitsOnly,
  removeKoreanCharacters, renderManagerPhoneNumber,
} from '@utils/commonUtils.js';



const IndividualMemberInfo = ({
  formValues,
  setFormValues,
}) => {
  const setFormValue = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const setPhonePartValue = (field, index, value) => {
    setFormValues((currentValues) => {
      const nextParts = [...currentValues[field]];
      nextParts[index] = value;
      return {
        ...currentValues,
        [field]: nextParts,
      };
    });
  };

  return (
    <>
      {/* 회원정보 변경 */}
      <div className="conts-wrap mt-64">
        <div className="on-form-register">
          <h3 className="form-title">회원정보 변경</h3>
          <dl className="on-form-row large">
            <div className="form-row-item">
              <dt className="form-row-label">
                <span className="form-tit">통합회원 아이디</span>
              </dt>
              <dd className="form-row-content">
                <span className="text-value">{formValues.loginId}</span>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_01">이름</label>
              </dt>
              <dd className="form-row-content">
                <span className="text-value">{formValues.mbrNm}</span>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_01">휴대전화번호</label>
              </dt>
              <dd className="form-row-content">
                <span className="text-value">{renderManagerPhoneNumber(formValues.indvMblTelno)}</span>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="select_01">전화번호</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper row-small">
                  <select className="krds-form-select small w-120" id="select_01" value={formValues.indvGnrlTelnoParts[0]} onChange={(event) => setPhonePartValue('indvGnrlTelnoParts', 0, event.target.value)}>
                    <option value="">선택</option>
                    <option value="02">02</option>
                    <option value="051">051</option>
                    <option value="053">053</option>
                    <option value="032">032</option>
                    <option value="062">062</option>
                    <option value="042">042</option>
                    <option value="052">052</option>
                    <option value="044">044</option>
                    <option value="031">031</option>
                    <option value="033">033</option>
                    <option value="043">043</option>
                    <option value="041">041</option>
                    <option value="063">063</option>
                    <option value="061">061</option>
                    <option value="054">054</option>
                    <option value="055">055</option>
                    <option value="064">064</option>
                    <option value="070">070</option>
                    <option value="060">060</option>
                    <option value="050">050</option>
                  </select>
                  <span>-</span>
                  <input type="text" className="krds-input small w-120" placeholder="0000" title="전화번호 중간번호 입력" maxLength={4} value={formValues.indvGnrlTelnoParts[1]} onChange={(event) => setPhonePartValue('indvGnrlTelnoParts', 1, keepDigitsOnly(event.target.value))} />
                  <span>-</span>
                  <input type="text" className="krds-input small w-120" placeholder="0000" title="전화번호 끝번호 입력" maxLength={4} value={formValues.indvGnrlTelnoParts[2]} onChange={(event) => setPhonePartValue('indvGnrlTelnoParts', 2, keepDigitsOnly(event.target.value))} />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_05">이메일</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper row-small">
                  <input type="text" id="input_05" className="krds-input small w-140" placeholder="0000" title="이메일 아이디 입력" maxLength={64} value={formValues.emailLocal} onChange={(event) => setFormValue('emailLocal', removeKoreanCharacters(event.target.value))}/>
                  <span>@</span>
                  <input type="text" className="krds-input small w-140" placeholder="0000" title="이메일 도메인 입력" maxLength={255} value={formValues.emailDomain} onChange={(event) => setFormValue('emailDomain', removeKoreanCharacters(event.target.value))} />
                  <span>-</span>
                  <select className="krds-form-select small w-140" title="이메일 선택" onChange={(event) => setFormValue('emailDomain', removeKoreanCharacters(event.target.value))}>
                    <option value="">직접입력</option>
                    <option value="naver.com">naver</option>
                    <option value="daum.net">daum</option>
                    <option value="gmail.com">gmail</option>
                    <option value="hotmail.com">hotmail</option>
                    <option value="nate.com">nate</option>
                    <option value="yahoo.com">yahoo</option>
                  </select>
                </div>
              </dd>
            </div>
          </dl>
        </div>
        <ul className="info-list-point">
          <li><i className="svg-icon ico-checkbox"></i>이름 및 휴대전화번호는 변경할 수 없습니다.</li>
        </ul>
      </div>
    </>
  );
};

export default IndividualMemberInfo;
