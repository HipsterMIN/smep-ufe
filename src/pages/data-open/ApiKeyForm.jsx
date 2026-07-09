import Popup from '@components/ui/Popup';
import { useEffect, useState } from 'react';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';

// 부모에게서 상태를 전달받도록 Props 설정
const ApiKeyForm = ({ isOpen, onClose, onSubmit, submitting, errorMessage, mbrNo, memberInfo }) => {

  const [institutions, setInstitutions] = useState({});
  const [isDirectInput, setIsDirectInput] = useState(false);
  const [appliedApis, setAppliedApis] = useState([]); // 1. 이미 신청된 API 코드들을 담을 상태
  const currentMode = useAuthStore((state) => state.currentMode);
  const [apiMasterList, setApiMasterList] = useState({});
  const INDIVIDUAL_API_CODES = ['AD05', 'AD02'];
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

  // 폼 초기화 함수
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

  const handleClose = () => {
    resetForm(); // 데이터 리셋
    onClose();   // 부모의 닫기 로직 실행
  };

  // 1. 컴포넌트 로드 시 기관 공통 코드 조회
  useEffect(() => {
    if (isOpen && memberInfo) {

      setFormData(prev => ({
        ...prev,
        picDeptNm: '',
        picJbpsNm: '',
        indvEmlAddr: currentMode === 'CORPORATE'
          ? (memberInfo.picEmlAddr || '')
          : (memberInfo.indvEmlAddr || ''),
      }));
    }
  }, [isOpen, memberInfo, currentMode]);

  // 2. 기관 공통 코드 조회
  useEffect(() => {
    if (isOpen) {
      const fetchCodes = async () => {
        try {
          const res = await apiClient.get('/api/v1/apikey/apply/codes/institutions');
          setInstitutions(res.data);
        } catch (error) {
          return null;
        }
      };
      fetchCodes();
    }
  }, [isOpen]);

  // 2. 이미 신청된 내역 조회 (SELECT 쿼리 결과 호출)
  useEffect(() => {
    // mbrNo가 없을 때는 아예 호출하지 않도록 확실히 체크
    if (isOpen && mbrNo && mbrNo !== '') {
      const fetchAppliedHistory = async () => {
        try {
          const res = await apiClient.get(`/api/v1/apikey/apply/list?mbrNo=${mbrNo}`);

          if (res.data) {
            const appliedCodes = res.data.map(item => item.apiSeCd);
            setAppliedApis(appliedCodes);
          }
        } catch (error) {
          return null;
        }
      };
      fetchAppliedHistory();
    }
  }, [isOpen, mbrNo]); // mbrNo가 변경될 때마다 재실행

  useEffect(() => {
    if (isOpen) {
      const fetchApiMaster = async () => {
        try {
          const res = await apiClient.get('/api/v1/apikey/apply/dvsn-code');
          setApiMasterList(res.data);
        } catch (error) {
          return null;
        }
      };
      fetchApiMaster();
    }
  }, [isOpen]);

  const getFilteredApiList = () => {
    // 1. Map 객체를 [key, value] 배열로 변환
    const allApis = Object.entries(apiMasterList);

    // 2. 권한에 따른 필터링
    if (currentMode === 'CORPORATE') {
      return allApis; // 기업은 전체 노출
    } else {
      // 개인은 정의된 코드만 노출
      return allApis.filter(([code]) => INDIVIDUAL_API_CODES.includes(code));
    }
  };

  // 셀렉트 박스 변경 핸들러
  const handleInstChange = (e) => {
    const val = e.target.value;
    if (val === 'DIRECT') {
      setIsDirectInput(true);
      setFormData({ ...formData, ogdpInstCd: 'DIRECT', ogdpInstNm: '', instNmDirect: '' });
    } else {
      setIsDirectInput(false);
      // 기관을 다시 선택하면 직접 입력했던 내용은 초기화
      setFormData({ ...formData, ogdpInstCd: val, ogdpInstNm: institutions[val] || '', instNmDirect: '' });
    }
  };

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

  const handleInternalSubmit = () => {


    const availableCodes = getFilteredApiList().map(([code]) => code);

    const isAllApplied = availableCodes.length > 0 &&
        availableCodes.every(code => appliedApis.includes(code));

    if (isAllApplied) {
      alert("모든 API가 이미 신청 완료되어 추가 신청이 불가능합니다.");
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

    if (!formData.usgSeCd){
      alert('용도를 선택해 주세요.');
      return;
    }
    // 소속기관 체크
    if (!formData.ogdpInstCd || (isDirectInput && !formData.instNmDirect)) {
      alert('소속기관을 선택하거나 입력해 주세요.');
      return;
    }
    // 직접입력이면 instNmDirect → ogdpInstNm으로 매핑하여 전송
    const submitData = {
      ...formData,
      linkUseTrgtSeCd: currentMode === 'CORPORATE' ? 'ENT' : 'IND',
      mbrNm: memberInfo?.mbrNm,
      picEmlAddr: formData.indvEmlAddr,      // 화면 입력값(이메일)
      picTelno: formData.indvGnrlTelno,      // 화면 입력값(유선전화)
      picMblTelno: currentMode === 'CORPORATE'
        ? memberInfo.picMblTelno
        : memberInfo.indvMblTelno,

      entPicMbrNo: memberInfo.entPicMbrNo,

      ogdpInstNm: isDirectInput ? formData.instNmDirect : formData.ogdpInstNm,
    };

    onSubmit(submitData);
  };


  // 유선전화번호 자동 하이픈 포맷 (숫자만 추출 후 최대 11자리)
  const formatTelno = (value) => {
    const digits = value.replace(/\D/g, '');

    if (digits.startsWith('02')) {
      // 02는 최대 10자리
      const d = digits.slice(0, 10);
      if (d.length <= 5)  return d.replace(/(\d{2})(\d+)/, '$1-$2');
      if (d.length <= 9)  return d.replace(/(\d{2})(\d{3})(\d+)/, '$1-$2-$3');
      return d.replace(/(\d{2})(\d{4})(\d+)/, '$1-$2-$3');
    } else {
      // 그 외 지역번호는 최대 11자리
      const d = digits.slice(0, 11);
      if (d.length <= 6)  return d.replace(/(\d{3})(\d+)/, '$1-$2');
      if (d.length <= 10) return d.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
      return d.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
    }
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="인증키 신청"
      footer={
        <>
          <button type="button" className="krds-btn tertiary medium" onClick={handleClose}>취소</button>
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
                {getFilteredApiList().map(([code, name]) => (
                  <div className="krds-form-check medium" key={code}>
                    <input
                      type="checkbox"
                      id={`chk_${code}`}
                      value={code}
                      checked={formData.apiSeCd.includes(code) || appliedApis.includes(code)}
                      disabled={appliedApis.includes(code)}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor={`chk_${code}`}>{name}</label>
                  </div>
                ))}
              </div>
              <p className="txt-caution mt-8">※ 이미 신청승인된 API는 신청이 불가능합니다.</p>
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
      </div>
    </Popup>
  );
};

export default ApiKeyForm;