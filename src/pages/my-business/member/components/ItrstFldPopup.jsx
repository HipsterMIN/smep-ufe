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

const EMPTY_COMMON_CODE_OPTIONS = {
  businessType: [],
  supportField: [],
  companySize: [],
  businessAge: [],
  employeeCount: [],
  sales: [],
  certification: [],
};

const ItrstFldPopup = ({ isOpen = false, onClose }) => {
  const [commonCodeOptions, setCommonCodeOptions] = useState(EMPTY_COMMON_CODE_OPTIONS);
  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [selectedSidoCd, setSelectedSidoCd] = useState('');
  const [selectedSigunguCd, setSelectedSigunguCd] = useState('');
  const [sigunguLoading, setSigunguLoading] = useState(false);

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
        console.error('관심분야 공통코드 조회 실패:', error);
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

    const fetchSidoList = async () => {
      try {
        const response = await apiClient.get('/api/v1/stdg/sido');
        const responseData = response?.data ?? response;
        if (active) {
          setSidoList(Array.isArray(responseData) ? responseData : []);
        }
      } catch (error) {
        console.error('시도 목록 조회 실패:', error);
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
        console.error('시군구 목록 조회 실패:', error);
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

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleSidoChange = (event) => {
    setSelectedSidoCd(event.target.value);
    setSelectedSigunguCd('');
  };

  const renderCheckOptions = (idPrefix, options) => (
    <div className="krds-check-area">
      {options.map((option) => {
        const id = `${idPrefix}_${option.value}`;

        return (
          <div className="krds-form-check medium" key={id}>
            <input type="checkbox" id={id} value={option.value} />
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
          <button type="button" className="krds-btn tertiary medium" onClick={handleClose}>
            닫기
          </button>
          <button type="button" className="krds-btn primary medium" onClick={handleClose}>
            저장
          </button>
        </>
      }
    >
      <div className="form-area">
        <p className="required-msg">
          <button type="button" className="krds-btn primary small">
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
                {renderCheckOptions('business_type', commonCodeOptions.businessType)}
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">지원분야</span>
              </div>
              <div className="form-conts mt-16">
                {renderCheckOptions('support_field', commonCodeOptions.supportField)}
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
                {renderCheckOptions('company_size', commonCodeOptions.companySize)}
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
                {renderCheckOptions('business_age', commonCodeOptions.businessAge)}
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">근로자수</span>
              </div>
              <div className="form-conts mt-16">
                {renderCheckOptions('employee_count', commonCodeOptions.employeeCount)}
              </div>
            </div>

            <div className="form-group">
              <div className="form-tit">
                <span className="form-label">매출액</span>
              </div>
              <div className="form-conts mt-16">
                {renderCheckOptions('sales', commonCodeOptions.sales)}
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
                {renderCheckOptions('certification', commonCodeOptions.certification)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default ItrstFldPopup;
