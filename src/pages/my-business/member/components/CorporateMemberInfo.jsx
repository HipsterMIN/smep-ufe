import JusoAddressSearchButton from '@components/ui/JusoAddressSearchButton';
import {
  keepDigitsOnly,
  removeDigits,
  removeKoreanCharacters,
  renderManagerPhoneNumber,
} from '@utils/commonUtils.js';


const renderManagerValue = (value) => {
  const normalized = String(value ?? '').trim();
  return normalized || '--';
};

const CorporateMemberInfo = ({
  formValues,
  setFormValues,
  managerContact,
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

  const handleSelectAddress = (payload) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      zip: payload.zipNo || '',
      entAddr: payload.baseAddress || payload.roadFullAddress || '',
      entDaddr: payload.detailAddress || '',
    }));
  };

  const handleAddressSearchError = (error) => {
    window.alert(error?.message || '주소검색 중 오류가 발생했습니다.');
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
                <span className="form-tit">아이디</span>
              </dt>
              <dd className="form-row-content">
                <span className="text-value">{formValues.loginId}</span>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_01">기업명</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="input_01" className="krds-input small" maxLength={100} value={formValues.mbrNm} disabled></input>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_02">사업자등록번호</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="input_02" className="krds-input small" maxLength={10} value={formValues.brno} disabled></input>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_03">법인등록번호</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="input_03" className="krds-input small" maxLength={13} value={formValues.crno} disabled></input>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_04">대표자 이름</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="input_04" className="krds-input small" maxLength={100} value={formValues.rprsvNm} onChange={(event) => setFormValue('rprsvNm', removeDigits(event.target.value))} />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="select_01">대표 전화</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper row-small">
                  <select className="krds-form-select small w-120" id="select_01" value={formValues.rprsTelnoParts[0]} onChange={(event) => setPhonePartValue('rprsTelnoParts', 0, event.target.value)}>
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
                  <input type="text" className="krds-input small w-120" placeholder="0000" title="대표전화 중간번호 입력" maxLength={4} value={formValues.rprsTelnoParts[1]} onChange={(event) => setPhonePartValue('rprsTelnoParts', 1, keepDigitsOnly(event.target.value))} />
                  <span>-</span>
                  <input type="text" className="krds-input small w-120" placeholder="0000" title="대표전화 끝번호 입력" maxLength={4} value={formValues.rprsTelnoParts[2]} onChange={(event) => setPhonePartValue('rprsTelnoParts', 2, keepDigitsOnly(event.target.value))} />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="select_02">팩스 번호</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper row-small">
                  <select className="krds-form-select small w-120" id="select_02" value={formValues.rprsFxnoParts[0]} onChange={(event) => setPhonePartValue('rprsFxnoParts', 0, event.target.value)}>
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
                  <input type="text" className="krds-input small w-120" placeholder="0000" title="팩스번호 중간번호 입력" maxLength={4} value={formValues.rprsFxnoParts[1]} onChange={(event) => setPhonePartValue('rprsFxnoParts', 1, keepDigitsOnly(event.target.value))} />
                  <span>-</span>
                  <input type="text" className="krds-input small w-120" placeholder="0000" title="팩스번호 끝번호 입력" maxLength={4} value={formValues.rprsFxnoParts[2]} onChange={(event) => setPhonePartValue('rprsFxnoParts', 2, keepDigitsOnly(event.target.value))} />
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
            <div className="form-row-item">
              <dt className="form-row-label flex-start">
                <label htmlFor="input_06">회사주소</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper row-small">
                  <input type="text" id="input_06" className="krds-input small w-150" placeholder="-" maxLength={5} value={formValues.zip} onChange={(event) => setFormValue('zip', event.target.value)} disabled />
                  <JusoAddressSearchButton
                    onSelect={handleSelectAddress}
                    onError={handleAddressSearchError}
                    buttonText="우편번호 검색"
                  />
                </div>
                <div className="form-wrapper">
                  <input type="text" className="krds-input small w-460" placeholder="-" maxLength={200} value={formValues.entAddr} onChange={(event) => setFormValue('entAddr', event.target.value)} disabled />
                </div>
                <div className="form-wrapper">
                  <input type="text" className="krds-input small w-460" placeholder="상세 주소 입력" maxLength={200} value={formValues.entDaddr} onChange={(event) => setFormValue('entDaddr', event.target.value)} />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_07">홈페이지 주소</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper">
                  <input type="text" id="input_07" className="krds-input small w-220" placeholder="-" maxLength={2000} value={formValues.hmpgAddr} onChange={(event) => setFormValue('hmpgAddr', event.target.value)} />
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 기업관리자 정보 */}
      {/*<div className="conts-wrap mt-64">*/}
      {/*  <div className="on-form-register">*/}
      {/*    <h3 className="form-title">기업관리자 정보</h3>*/}
      {/*    <dl className="on-form-row large">*/}
      {/*      <div className="form-row-item">*/}
      {/*        <dt className="form-row-label">*/}
      {/*          <span className="form-tit">담당자</span>*/}
      {/*        </dt>*/}
      {/*        <dd className="form-row-content">*/}
      {/*          <span className="text-value">{renderManagerValue(managerContact?.mbrNm)}</span>*/}
      {/*        </dd>*/}
      {/*      </div>*/}
      {/*      <div className="form-row-item">*/}
      {/*        <dt className="form-row-label">*/}
      {/*          <span className="form-tit">휴대전화번호</span>*/}
      {/*        </dt>*/}
      {/*        <dd className="form-row-content">*/}
      {/*          <span className="text-value">{renderManagerPhoneNumber(managerContact?.picMblTelno)}</span>*/}
      {/*        </dd>*/}
      {/*      </div>*/}
      {/*      <div className="form-row-item">*/}
      {/*        <dt className="form-row-label">*/}
      {/*          <span className="form-tit">유선전화</span>*/}
      {/*        </dt>*/}
      {/*        <dd className="form-row-content">*/}
      {/*          <span className="text-value">{renderManagerPhoneNumber(managerContact?.picTelno)}</span>*/}
      {/*        </dd>*/}
      {/*      </div>*/}
      {/*      <div className="form-row-item">*/}
      {/*        <dt className="form-row-label">*/}
      {/*          <span className="form-tit">이메일</span>*/}
      {/*        </dt>*/}
      {/*        <dd className="form-row-content">*/}
      {/*          <span className="text-value">{renderManagerValue(managerContact?.picEmlAddr)}</span>*/}
      {/*        </dd>*/}
      {/*      </div>*/}
      {/*      <div className="form-row-item">*/}
      {/*        <dt className="form-row-label">*/}
      {/*          <span className="form-tit">부서명</span>*/}
      {/*        </dt>*/}
      {/*        <dd className="form-row-content">*/}
      {/*          <span className="text-value">{renderManagerValue(managerContact?.picDeptNm)}</span>*/}
      {/*        </dd>*/}
      {/*      </div>*/}
      {/*      <div className="form-row-item">*/}
      {/*        <dt className="form-row-label">*/}
      {/*          <span className="form-tit">직위</span>*/}
      {/*        </dt>*/}
      {/*        <dd className="form-row-content">*/}
      {/*          <span className="text-value">{renderManagerValue(managerContact?.picJbpsNm)}</span>*/}
      {/*        </dd>*/}
      {/*      </div>*/}
      {/*    </dl>*/}
      {/*  </div>*/}
      {/*  <ul className="info-list-point">*/}
      {/*    <li><i className="svg-icon ico-checkbox"></i>기업관리자 정보변경은 개인회원 마이페이지에서 변경이 가능합니다.</li>*/}
      {/*  </ul>*/}
      {/*</div>*/}
    </>
  );
};

export default CorporateMemberInfo;
