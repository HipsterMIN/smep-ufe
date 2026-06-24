import { useCallback, useEffect, useState } from 'react';

import Popup from '@components/ui/Popup.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { fetchAndConvertCommonCodes } from '@utils/commonCodeUtils.js';

const COMMON_CODE_GROUPS = {
  businessType: 'BIZ_PBANC_CLSF_CD',
  supportField: 'ITRST_SPRT_FLD_CD',
  companySize: 'ENT_CLSF_CD',
  businessAge: 'CRNCL_CLSF_CD',
  employeeCount: 'WRKR_CNT_CLSF_CD',
  sales: 'SLS_AMT_CLSF_CD',
  certification: 'ENT_CERT_IDNTY_TYPE_CD',
};

const COMMON_CODE_GROUP_IDS = Object.values(COMMON_CODE_GROUPS);
const LOCATION_INTEREST_FIELD_CODES = {
  sido: '1',
  sigungu: '2',
};

const EMPTY_COMMON_CODE_OPTIONS = {
  businessType: [],
  supportField: [],
  companySize: [],
  businessAge: [],
  employeeCount: [],
  sales: [],
  certification: [],
};

// 관심분야 조회 응답을 체크박스 상태 객체로 변환한다.
const normalizeInterestFieldSelections = (interestFields) => {
  if (!Array.isArray(interestFields)) {
    return {};
  }

  return interestFields.reduce((selectionMap, item) => {
    const interestFieldCode = String(item?.itrstFldCd || '').trim();
    const valueCode = String(item?.itrstFldVlCd || '').trim();
    if (!COMMON_CODE_GROUP_IDS.includes(interestFieldCode) || !valueCode) {
      return selectionMap;
    }

    return {
      ...selectionMap,
      [interestFieldCode]: [...(selectionMap[interestFieldCode] || []), valueCode],
    };
  }, {});
};

// 관심분야 조회 응답에서 소재지 선택값을 추출한다.
const normalizeLocationSelections = (interestFields) => {
  if (!Array.isArray(interestFields)) {
    return {
      sidoCd: '',
      sigunguCd: '',
    };
  }

  const sidoCd = String(
    interestFields.find((item) => item?.itrstFldCd === LOCATION_INTEREST_FIELD_CODES.sido)
      ?.itrstFldVlCd || '',
  ).trim();
  const sigunguCd = String(
    interestFields.find((item) => item?.itrstFldCd === LOCATION_INTEREST_FIELD_CODES.sigungu)
      ?.itrstFldVlCd || '',
  ).trim();

  return {
    sidoCd,
    sigunguCd,
  };
};

// 관심분야 체크박스 상태 객체를 안전하게 복사한다.
const cloneInterestFieldSelections = (interestFields) =>
  Object.fromEntries(
    Object.entries(interestFields || {}).map(([interestFieldCode, valueCodes]) => [
      interestFieldCode,
      [...valueCodes],
    ]),
  );

const ItrstFldPopup = ({ isOpen = false, onClose }) => {
  const [commonCodeOptions, setCommonCodeOptions] = useState(EMPTY_COMMON_CODE_OPTIONS);
  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [selectedSidoCd, setSelectedSidoCd] = useState('');
  const [selectedSigunguCd, setSelectedSigunguCd] = useState('');
  const [sigunguLoading, setSigunguLoading] = useState(false);
  const [savedLocationFields, setSavedLocationFields] = useState({ sidoCd: '', sigunguCd: '' });
  const [savedInterestFields, setSavedInterestFields] = useState({});
  const [selectedInterestFields, setSelectedInterestFields] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let active = true;

    const loadCommonCodes = async () => {
      try {
        const commonCodes = await fetchAndConvertCommonCodes(COMMON_CODE_GROUP_IDS);
        if (!active) {
          return;
        }

        setCommonCodeOptions({
          businessType: commonCodes[COMMON_CODE_GROUPS.businessType] || [],
          supportField: commonCodes[COMMON_CODE_GROUPS.supportField] || [],
          companySize: commonCodes[COMMON_CODE_GROUPS.companySize] || [],
          businessAge: commonCodes[COMMON_CODE_GROUPS.businessAge] || [],
          employeeCount: commonCodes[COMMON_CODE_GROUPS.employeeCount] || [],
          sales: commonCodes[COMMON_CODE_GROUPS.sales] || [],
          certification: commonCodes[COMMON_CODE_GROUPS.certification] || [],
        });
      } catch (error) {
        if (active) {
          setCommonCodeOptions(EMPTY_COMMON_CODE_OPTIONS);
        }
      }
    };

    loadCommonCodes();

    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let active = true;

    // 저장된 관심분야를 조회해 체크박스 선택 상태에 반영한다.
    const loadSavedInterestFields = async () => {
      try {
        const response = await apiClient.get('/api/v1/member/common/me/interest-fields');
        const responseData = response?.data ?? response;
        const nextInterestFields = normalizeInterestFieldSelections(responseData);
        const nextLocationFields = normalizeLocationSelections(responseData);
        if (active) {
          setSavedInterestFields(nextInterestFields);
          setSavedLocationFields(nextLocationFields);
          setSelectedInterestFields(cloneInterestFieldSelections(nextInterestFields));
          setSelectedSidoCd(nextLocationFields.sidoCd);
          setSelectedSigunguCd(nextLocationFields.sigunguCd);
        }
      } catch (error) {
        if (active) {
          setSavedInterestFields({});
          setSavedLocationFields({ sidoCd: '', sigunguCd: '' });
          setSelectedInterestFields({});
          setSelectedSidoCd('');
          setSelectedSigunguCd('');
        }
      }
    };

    loadSavedInterestFields();

    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let active = true;

    const fetchSidoList = async () => {
      try {
        const response = await apiClient.get('/api/v1/stdg/sido');
        const responseData = response?.data ?? response;
        if (active) {
          setSidoList(Array.isArray(responseData) ? responseData : []);
        }
      } catch (error) {
        if (active) {
          setSidoList([]);
        }
      }
    };

    fetchSidoList();

    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedSidoCd) {
      setSigunguList([]);
      setSigunguLoading(false);
      return undefined;
    }

    let active = true;

    const fetchSigunguList = async () => {
      setSigunguLoading(true);
      try {
        const response = await apiClient.get(
          `/api/v1/stdg/sigungu?sidoCd=${encodeURIComponent(selectedSidoCd)}`,
        );
        const responseData = response?.data ?? response;
        if (active) {
          setSigunguList(Array.isArray(responseData) ? responseData : []);
        }
      } catch (error) {
        if (active) {
          setSigunguList([]);
        }
      } finally {
        if (active) {
          setSigunguLoading(false);
        }
      }
    };

    fetchSigunguList();

    return () => {
      active = false;
    };
  }, [isOpen, selectedSidoCd]);

  // 팝업을 닫을 때 현재 체크박스 선택 상태를 비운다.
  const handleClose = useCallback(() => {
    setSelectedInterestFields({});
    setSavedInterestFields({});
    setSelectedSidoCd('');
    setSelectedSigunguCd('');
    setSavedLocationFields({ sidoCd: '', sigunguCd: '' });
    onClose?.();
  }, [onClose]);

  const handleSidoChange = (event) => {
    setSelectedSidoCd(event.target.value);
    setSelectedSigunguCd('');
  };

  // 체크박스 선택 상태를 관심분야 구분 코드별로 갱신한다.
  const handleInterestFieldChange = (interestFieldCode, valueCode, checked) => {
    setSelectedInterestFields((currentFields) => {
      const currentValues = new Set(currentFields[interestFieldCode] || []);
      if (checked) {
        currentValues.add(valueCode);
      } else {
        currentValues.delete(valueCode);
      }

      return {
        ...currentFields,
        [interestFieldCode]: Array.from(currentValues),
      };
    });
  };

  // 선택된 체크박스 값을 관심분야 저장 API 요청 형식으로 변환한다.
  const buildInterestFieldPayload = () => ({
    interestFields: [
      ...COMMON_CODE_GROUP_IDS.flatMap((interestFieldCode) =>
        (selectedInterestFields[interestFieldCode] || []).map((valueCode) => ({
          itrstFldCd: interestFieldCode,
          itrstFldVlCd: valueCode,
        })),
      ),
      ...(selectedSidoCd
        ? [{ itrstFldCd: LOCATION_INTEREST_FIELD_CODES.sido, itrstFldVlCd: selectedSidoCd }]
        : []),
      ...(selectedSigunguCd
        ? [{ itrstFldCd: LOCATION_INTEREST_FIELD_CODES.sigungu, itrstFldVlCd: selectedSigunguCd }]
        : []),
    ],
  });

  // 관심분야 체크 상태를 팝업 호출 시점에 조회된 저장값으로 복원한다.
  const handleReset = () => {
    setSelectedInterestFields(cloneInterestFieldSelections(savedInterestFields));
    setSelectedSidoCd(savedLocationFields.sidoCd);
    setSelectedSigunguCd(savedLocationFields.sigunguCd);
  };

  // 선택된 관심분야 체크박스를 서버에 저장한다.
  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post('/api/v1/member/common/me/interest-fields', buildInterestFieldPayload());
      window.alert('저장되었습니다.');
      handleClose();
    } catch (error) {
      window.alert(error?.message || '관심분야 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const renderCheckOptions = (idPrefix, options, interestFieldCode) => (
    <div className="krds-check-area">
      {options.map((option) => {
        const id = `${idPrefix}_${option.value}`;

        return (
          <div className="krds-form-check medium" key={id}>
            <input
              type="checkbox"
              id={id}
              value={option.value}
              checked={(selectedInterestFields[interestFieldCode] || []).includes(option.value)}
              onChange={(event) =>
                handleInterestFieldChange(interestFieldCode, option.value, event.target.checked)
              }
            />
            <label htmlFor={id}>{option.label}</label>
          </div>
        );
      })}
    </div>
  );

  return (
    <Popup
      isOpen={isOpen}
      onClose={handleClose}
      title="관심 분야 설정"
      footer={
        <>
          <button type="button" className="krds-btn tertiary medium" onClick={handleClose} disabled={saving}>
            닫기
          </button>
          <button type="button" className="krds-btn primary medium" onClick={handleSave} disabled={saving}>
            저장
          </button>
        </>
      }
    >
      <div className="form-area">
        <p className="required-msg">
          <button type="button" className="krds-btn primary small" onClick={handleReset} disabled={saving}>
            초기화
          </button>
        </p>
        <div className="txt-box small bg-white">
          <h4 className="box-tit2">관심정보</h4>
          <div className="box-cnt gap-24">
            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">사업유형</span>
              </div>
              <div className="form-conts mt-16">
                {renderCheckOptions(
                  'business_type',
                  commonCodeOptions.businessType,
                  COMMON_CODE_GROUPS.businessType,
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">지원분야</span>
              </div>
              <div className="form-conts mt-16">
                {renderCheckOptions(
                  'support_field',
                  commonCodeOptions.supportField,
                  COMMON_CODE_GROUPS.supportField,
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="txt-box small bg-white">
          <h4 className="box-tit2">기업정보</h4>
          <div className="box-cnt gap-24">
            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">기업규모</span>
              </div>
              <div className="form-conts mt-16">
                {renderCheckOptions(
                  'company_size',
                  commonCodeOptions.companySize,
                  COMMON_CODE_GROUPS.companySize,
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="business_type" className="form-label">업종</label>
              </div>
              <div className="form-conts">
                <div className="form-group row-sm">
                  <div className="form-conts">
                    <select id="business_type" className="krds-form-select small w-260">
                      <option value="">선택</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">업력</span>
              </div>
              <div className="form-conts mt-16">
                {renderCheckOptions(
                  'business_age',
                  commonCodeOptions.businessAge,
                  COMMON_CODE_GROUPS.businessAge,
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">근로자수</span>
              </div>
              <div className="form-conts mt-16">
                {renderCheckOptions(
                  'employee_count',
                  commonCodeOptions.employeeCount,
                  COMMON_CODE_GROUPS.employeeCount,
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">매출액</span>
              </div>
              <div className="form-conts mt-16">
                {renderCheckOptions(
                  'sales',
                  commonCodeOptions.sales,
                  COMMON_CODE_GROUPS.sales,
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <label htmlFor="location_area" className="form-label">소재지</label>
              </div>
              <div className="form-conts">
                <div className="form-group row-sm">
                  <div className="form-conts">
                    <div className="form-wrapper">
                      <select
                        id="location_area"
                        className="krds-form-select small w-260"
                        value={selectedSidoCd}
                        onChange={handleSidoChange}
                      >
                        <option value="">전체</option>
                        {sidoList.map((item) => (
                          <option key={item.code} value={item.code}>{item.name}</option>
                        ))}
                      </select>
                      <select
                        id="location_detail"
                        className="krds-form-select small w-260"
                        title="상세 소재지 선택"
                        value={selectedSigunguCd}
                        onChange={(event) => setSelectedSigunguCd(event.target.value)}
                        disabled={!selectedSidoCd || sigunguLoading}
                      >
                        <option value="">{sigunguLoading ? '조회 중' : '전체'}</option>
                        {sigunguList.map((item) => (
                          <option key={item.code} value={item.code}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">인증</span>
              </div>
              <div className="form-conts mt-16">
                {renderCheckOptions(
                  'certification',
                  commonCodeOptions.certification,
                  COMMON_CODE_GROUPS.certification,
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default ItrstFldPopup;
