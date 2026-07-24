import Popup from '@components/ui/Popup';
import { useEffect,useRef, useState } from 'react';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { onePassGetAuthCode } from '@utils/keycloakGetAuthCode.js';
import { useNavigate } from 'react-router-dom';

const ApiKeyPolicyFinanceForm = () => {
  const currentMode = useAuthStore((state) => state.currentMode);
  const authToken = useAuthStore((state) => state.token);
  const userInfo = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(authToken);
  const mbrNo = userInfo?.id;
  const loginCheckedRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [memberInfo, setMemberInfo] = useState({});

  const [institutions, setInstitutions] = useState({});
  const [isDirectInput, setIsDirectInput] = useState(false);
  const [appliedApis, setAppliedApis] = useState([]);

  const HARDCODED_API = { code: 'AD10', name: '정책금융' };

  const initialFormState = {
    siteNm: '',
    apiRegAplyCn: '',
    ogdpInstCd: '',
    ogdpInstNm: '',
    instNmDirect: '',
    picDeptNm: '',
    picJbpsNm: '',
    indvEmlAddr: '',
    indvGnrlTelno: '',
    apiSeCd: [],
    usgSeCd: 'PD01',
  };

  const [formData, setFormData] = useState(initialFormState);

  // 로그인 안 되어 있으면 로그인 페이지로 이동
  useEffect(() => {
    if (isLoggedIn) {
      setIsOpen(true);
      return;
    }

    if (loginCheckedRef.current) return;
    loginCheckedRef.current = true;

    if (!isLoggedIn) {
      const moveToLogin = window.confirm('로그인 후 인증키 신청이 가능합니다. 로그인 하시겠습니까?');
      if (moveToLogin) {
        onePassGetAuthCode();
      } else {
        navigate('/');
      }
    }

  }, [isLoggedIn, navigate]);


  // 로그인 후 회원정보 조회
  useEffect(() => {
    if (!isLoggedIn || !mbrNo) return;

    const fetchMemberInfo = async () => {
      try {
        const res = await apiClient.get(
            `/api/v1/apikey/apply/member-info/${mbrNo}`
        );

        setMemberInfo(res.data);

        setFormData(prev => ({
          ...prev,
          indvEmlAddr:
              currentMode === 'CORPORATE'
                  ? (res.data.picEmlAddr || '')
                  : (res.data.indvEmlAddr || ''),
        }));

      } catch (e) {
        alert('회원 정보를 불러올 수 없습니다.');
      }
    };

    fetchMemberInfo();
  }, [isLoggedIn, mbrNo, currentMode]);

  // 기관 코드 조회
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchCodes = async () => {
      try {
        const res = await apiClient.get('/api/v1/apikey/apply/codes/institutions');
        setInstitutions(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCodes();
  }, [isLoggedIn]);

  // 이미 신청한 API 조회
  useEffect(() => {
    if (!isLoggedIn || !mbrNo) return;

    const fetchAppliedHistory = async () => {
      try {
        const res = await apiClient.get(
            `/api/v1/apikey/apply/list?mbrNo=${mbrNo}`
        );

        const appliedCodes = res.data.map(item => item.apiSeCd);
        setAppliedApis(appliedCodes);

      } catch (error) {
        console.error(error);
      }
    };

    fetchAppliedHistory();
  }, [isLoggedIn, mbrNo]);

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    // appliedApis(이미 신청 완료된 목록)에 있으면 무시
    if (appliedApis.includes(value)) return;

    setFormData(prev => ({
      ...prev,
      apiSeCd: checked
          ? [...prev.apiSeCd, value]
          : prev.apiSeCd.filter(item => item !== value),
    }));
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      indvEmlAddr: currentMode === 'CORPORATE'
          ? (memberInfo?.picEmlAddr || '')
          : (memberInfo?.indvEmlAddr || ''),
      usgSeCd: 'PD01',
    });
    setIsDirectInput(false);
  };

  // const resetForm = () => {
  //   const isAlreadyApplied = appliedApis.includes(HARDCODED_API.code);
  //   setFormData({
  //     ...initialFormState,
  //     apiSeCd: [],
  //     indvEmlAddr:
  //         currentMode === 'CORPORATE'
  //             ? (memberInfo?.picEmlAddr || '')
  //             : (memberInfo?.indvEmlAddr || ''),
  //   });
  //   setIsDirectInput(false);
  // };

  const handleClose = () => {
    resetForm();
    setIsOpen(false);
    navigate('/');
    // window.close();
  };

  const handleInstChange = (e) => {
    const val = e.target.value;

    if (val === 'DIRECT') {
      setIsDirectInput(true);
      setFormData({
        ...formData,
        ogdpInstCd: 'DIRECT',
        ogdpInstNm: '',
        instNmDirect: '',
      });
    } else {
      setIsDirectInput(false);
      setFormData({
        ...formData,
        ogdpInstCd: val,
        ogdpInstNm: institutions[val] || '',
        instNmDirect: '',
      });
    }
  };

  const submitApply = async (submitData) => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        ...submitData,
        indvGnrlTelno:
            submitData.indvGnrlTelno.replace(/-/g, ''),
      };

      await apiClient.post(
          `/api/v1/apikey/apply/${mbrNo}`,
          payload
      );

      alert('인증키 신청이 완료되었습니다.');
      navigate('/cs/opndata/UI_USR_L_220');

    } catch (err) {
      setErrorMessage(
          err.response?.data?.message || '신청 중 오류가 발생했습니다.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInternalSubmit = async () => {
    const isAlreadyApplied = appliedApis.includes(HARDCODED_API.code);

    if (isAlreadyApplied) {
      alert("정책금융 API가 이미 신청 완료되어 추가 신청이 불가능합니다.");
      return;
    }

    if(formData.apiSeCd.length === 0){
      alert("신청할 API를 선택해 주세요.");
      return;
    }

    if (!formData.siteNm) {
      alert('시스템명을 입력해 주세요.');
      return;
    }

    if (!formData.apiRegAplyCn) {
      alert('활용목적을 입력해 주세요.');
      return;
    }

    if (!formData.indvGnrlTelno) {
      alert('유선 전화번호를 입력해 주세요.');
      return;
    }

    if (!formData.ogdpInstCd ||
        (isDirectInput && !formData.instNmDirect)) {
      alert('소속기관을 입력해 주세요.');
      return;
    }

    const submitData = {
      ...formData,
      linkUseTrgtSeCd: currentMode === 'CORPORATE' ? 'ENT' : 'IND',
      mbrNm: memberInfo?.mbrNm,
      picEmlAddr: formData.indvEmlAddr,
      picTelno: formData.indvGnrlTelno,
      picMblTelno:
          currentMode === 'CORPORATE'
              ? memberInfo.picMblTelno
              : memberInfo.indvMblTelno,
      entPicMbrNo: memberInfo.entPicMbrNo,
      ogdpInstNm:
          isDirectInput
              ? formData.instNmDirect
              : formData.ogdpInstNm,
    };

    await submitApply(submitData);
  };

  const formatTelno = (value) => {
    const digits = value.replace(/\D/g, '');

    if (digits.startsWith('02')) {
      const d = digits.slice(0, 10);

      if (d.length <= 5)
        return d.replace(/(\d{2})(\d+)/, '$1-$2');

      if (d.length <= 9)
        return d.replace(/(\d{2})(\d{3})(\d+)/, '$1-$2-$3');

      return d.replace(/(\d{2})(\d{4})(\d+)/, '$1-$2-$3');
    }

    const d = digits.slice(0, 11);

    if (d.length <= 6)
      return d.replace(/(\d{3})(\d+)/, '$1-$2');

    if (d.length <= 10)
      return d.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');

    return d.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
  };

  const isAlreadyApplied = appliedApis.includes(HARDCODED_API.code);

  return (
      <Popup
          isOpen={isOpen}
          onClose={handleClose}
          title="인증키 신청"
          footer={
            <>
              <button
                  type="button"
                  className="krds-btn tertiary medium"
                  onClick={handleClose}
              >
                취소
              </button>

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
                    <input type="text" className="krds-input small" value={memberInfo.mbrNm || '-'} readOnly={true}/>
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_02" className="form-label">
                      {currentMode === 'CORPORATE' ? '대표전화번호' : '휴대전화 번호'}
                    </label>
                  </div>
                  <div className="form-conts">
                    <input type="text" className="krds-input small" value={
                      currentMode === 'CORPORATE'
                          ? (memberInfo.picMblTelno || '-')
                          : (memberInfo.indvMblTelno || '-')
                    } readOnly={true}/>
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
                        placeholder="example@mail.com"
                        value={formData.indvEmlAddr} // formData에서 값을 가져옴
                        onChange={(e) => setFormData({ ...formData, indvEmlAddr: e.target.value })} // 수정 핸들러
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_04" className="form-label">유선전화번호 <span className="on-required"><span
                        className="sr-only">필수입력</span></span></label>
                  </div>
                  <div className="form-conts">
                    <input
                        type="text"
                        id="id_04"
                        className="krds-input small"
                        placeholder="02-1234-5678"
                        value={formData.indvGnrlTelno}
                        onChange={(e) => setFormData({ ...formData, indvGnrlTelno: formatTelno(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="instSelect" className="form-label">소속기관 <span className="on-required"><span
                        className="sr-only">필수입력</span></span></label>
                  </div>
                  <div className="form-conts">
                    <select
                        id="instSelect"
                        className="krds-form-select small"
                        value={formData.ogdpInstCd}
                        onChange={handleInstChange}
                    >
                      <option value="">선택하세요</option>
                      {/* 1. API로 받아온 기관 목록을 먼저 렌더링 */}
                      {Object.entries(institutions).map(([code, name]) => (
                          <option key={code} value={code}>{name}</option>
                      ))}
                      {/* 2. 맨 마지막에 직접 입력 옵션 추가 */}
                      <option value="DIRECT">직접 입력</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="instDisplay" className="form-label sr-only">소속기관 상세입력</label>
                  </div>
                  <div className="form-conts">
                    <input
                        type="text"
                        id="instDisplay"
                        className={`krds-input small ${!isDirectInput ? 'bg-readonly' : ''}`}
                        placeholder={isDirectInput ? '기관명을 직접 입력하세요' : ''}

                        /* - 직접 입력이 아닐 때: 선택한 기관명(institutions[코드])을 보여줌
                                   - 직접 입력일 때: 사용자가 입력한 instNmDirect 값을 보여줌
                                */
                        value={isDirectInput ? formData.instNmDirect : (institutions[formData.ogdpInstCd] || '')}

                        /* 직접 입력 모드가 아닐 때만 readOnly 처리 */
                        readOnly={!isDirectInput}

                        /* 직접 입력 모드일 때만 데이터 변경 허용 */
                        onChange={(e) => {
                          if (isDirectInput) {
                            setFormData({ ...formData, instNmDirect: e.target.value });
                          }
                        }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_05" className="form-label">부서</label>
                  </div>
                  <div className="form-conts">
                    <input
                        type="text"
                        id="id_05"
                        className="krds-input small"
                        value={formData.picDeptNm}
                        onChange={(e) => setFormData({ ...formData, picDeptNm: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-tit">
                    <label htmlFor="id_06" className="form-label">직위</label>
                  </div>
                  <div className="form-conts">
                    <input
                        type="text"
                        id="id_06"
                        className="krds-input small"
                        value={formData.picJbpsNm}
                        onChange={(e) => setFormData({ ...formData, picJbpsNm: e.target.value })}
                    />
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
                <label htmlFor="id_07" className="form-label">시스템명<span className="on-required"><span
                    className="sr-only">필수입력</span></span></label>
              </div>
              <div className="form-conts">
                <input
                    type="text"
                    id="siteNm"
                    className="krds-input small"
                    placeholder="시스템명을 입력해주세요."
                    value={formData.siteNm}
                    onChange={(e) => setFormData({ ...formData, siteNm: e.target.value })}
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
                <div className="krds-form-check medium" key={HARDCODED_API.code}>
                  <input
                      type="checkbox"
                      id={`chk_${HARDCODED_API.code}`}
                      value={HARDCODED_API.code}
                      checked={formData.apiSeCd.includes(HARDCODED_API.code) || isAlreadyApplied}
                      disabled={isAlreadyApplied}
                      onChange={handleCheckboxChange}
                  />
                  <label htmlFor={`chk_${HARDCODED_API.code}`}>{HARDCODED_API.name}</label>
                </div>
              </div>
              <p className="txt-caution mt-8">
                ※ 이미 신청승인된 API는 신청이 불가능합니다.
              </p>
            </div>
          </div>
        </div>

            <div className="form-group">
              <div className="form-tit">
              <span className="form-label">용도<span className="on-required"><span
                  className="sr-only">필수입력</span></span></span>
              </div>
              <div className="form-conts">
                <div className="krds-check-area">
                  <div className="krds-form-check medium">
                    <input
                        type="radio"
                        name="usgSeCd"
                        id="rdo_2-1"
                        value="PD01"
                        checked={formData.usgSeCd === 'PD01'}
                        onChange={(e) => setFormData({ ...formData, usgSeCd: e.target.value })}
                    />
                    <label htmlFor="rdo_2-1">웹사이트 개발</label>
                  </div>
                  <div className="krds-form-check medium">
                    <input
                        type="radio"
                        name="usgSeCd"
                        id="rdo_2-2"
                        value="PD02"
                        checked={formData.usgSeCd === 'PD02'}
                        onChange={(e) => setFormData({ ...formData, usgSeCd: e.target.value })}
                    />
                    <label htmlFor="rdo_2-2">앱 개발</label>
                  </div>
                  <div className="krds-form-check medium">
                    <input
                        type="radio"
                        name="usgSeCd"
                        id="rdo_2-3"
                        value="PD03"
                        checked={formData.usgSeCd === 'PD03'}
                        onChange={(e) => setFormData({ ...formData, usgSeCd: e.target.value })}
                    />
                    <label htmlFor="rdo_2-3">기타</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="textarea" className="form-label">활용목적<span className="on-required"><span
                    className="sr-only">필수입력</span></span></label>
              </div>
              <div className="form-conts">
                <div className="textarea-wrap">
                <textarea
                    className="krds-input medium"
                    id="apiRegAplyCn"
                    placeholder="활용목적은 500자 이내로 적어주세요."
                    value={formData.apiRegAplyCn}
                    onChange={(e) => setFormData({ ...formData, apiRegAplyCn: e.target.value })}
                ></textarea>
                  <p className="textarea-count">
                    <span className="count-now">{formData.apiRegAplyCn.length}</span><span
                      className="count-total">/500</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
      </Popup>
  );
};

export default ApiKeyPolicyFinanceForm;