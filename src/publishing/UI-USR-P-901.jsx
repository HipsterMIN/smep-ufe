import { useState } from 'react';
import Popup from '../components/ui/Popup';

const companySizeOptions = [
  '중소기업',
  '소상공인',
  '1인기업',
  '창업기업',
  '예비창업자',
  '기타',
];

const businessTypeOptions = [
  '금융',
  '기술',
  '인력',
  '수출',
  '내수',
  '창업',
  '경영',
  '소상공인',
  '중견',
  '기타',
];

const supportFieldOptions = [
  '기술개발 지원',
  '창업지원',
  '스마트공장 지원',
  '소상공인 지원',
  '정책자금융자',
  '기술보증',
  '기타',
];

const businessAgeOptions = [
  '3년미만',
  '3년이상~5년미만',
  '5년이상~7년미만',
  '7년이상~10년미만',
  '10년이상~20년미만',
  '20년이상',
];

const employeeCountOptions = [
  '1~5명미만',
  '5~10명미만',
  '10~20명미만',
  '20~50명미만',
  '50~100명미만',
  '100명이상',
];

const salesOptions = [
  '5억미만',
  '5억이상~10억미만',
  '10억이상~20억미만',
  '20억이상~50억미만',
  '50억이상~100억미만',
  '100억이상~300억미만',
  '300억이상',
];

const certificationOptions = [
  '수출유망중소기업',
  '여성기업',
  '장애인기업',
  '중소기업',
  '소상공인',
  '기술혁신형중소기업',
  '경영혁신형중소기업',
  '벤처기업',
  '사회적기업',
  '연구소보유',
  '지식재산경영인증 기업',
  '부품소재기업',
  '뿌리기술기업',
  '에너지기술기업',
  '기술전문기업',
  '직접생산확인기업',
];

const UI_USR_P_901 = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const renderCheckOptions = (idPrefix, options) => (
    <div className="krds-check-area">
      {options.map((option, index) => {
        const id = `${idPrefix}_${index + 1}`;

        return (
          <div className="krds-form-check medium" key={id}>
            <input type="checkbox" id={id} />
            <label htmlFor={id}>{option}</label>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <button type="button" className="krds-btn primary" onClick={() => setIsPopupOpen(true)}>
        관심 분야 설정
      </button>

      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="관심 분야 설정"
        footer={
          <>
            <button type="button" className="krds-btn tertiary medium" onClick={() => setIsPopupOpen(false)}>
              닫기
            </button>
            <button type="button" className="krds-btn primary medium" onClick={() => setIsPopupOpen(false)}>
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
                  {renderCheckOptions('business_type', businessTypeOptions)}
                </div>
              </div>

              <div className="form-group">
                <div className="form-tit">
                  <span className="form-label">지원분야</span>
                </div>
                <div className="form-conts mt-16">
                  {renderCheckOptions('support_field', supportFieldOptions)}
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
                  {renderCheckOptions('company_size', companySizeOptions)}
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
                  {renderCheckOptions('business_age', businessAgeOptions)}
                </div>
              </div>

              <div className="form-group">
                <div className="form-tit">
                  <span className="form-label">근로자수</span>
                </div>
                <div className="form-conts mt-16">
                  {renderCheckOptions('employee_count', employeeCountOptions)}
                </div>
              </div>

              <div className="form-group">
                <div className="form-tit">
                  <span className="form-label">매출액</span>
                </div>
                <div className="form-conts mt-16">
                  {renderCheckOptions('sales', salesOptions)}
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
                        <select id="location_area" className="krds-form-select small w-260">
                          <option value="">전체</option>
                        </select>
                        <select id="location_detail" className="krds-form-select small w-260" title="상세 소재지 선택">
                          <option value="">전체</option>
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
                  {renderCheckOptions('certification', certificationOptions)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_P_901;
