import React, { useState, useEffect } from 'react';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import { api } from '@lib/apiClient.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import VerificationResultPopup from '@pages/certificate/VerificationResultPopup.jsx';
import { shortenInstName } from '@utils/stringUtils.js';

const UI_USR_L_050 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const [institutions, setInstitutions] = useState([]);
  const [certificateTypes, setCertificateTypes] = useState([]);
  const [formData, setFormData] = useState({
    issuInstCd: '',
    prdocCd: '',
    prdocIssuAplyNo: '',
  });

  // 팝업 관련 state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const [error, setError] = useState(''); // 폼 유효성 검증 에러만 표시

  useEffect(() => {
    fetchInstitutions();
    fetchCertificateTypes();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/api/v1/certificate/institutions');
      setInstitutions(response.data || []);
    } catch (err) {
      console.error('발급기관 조회 실패:', err);
    }
  };

  const fetchCertificateTypes = async () => {
    try {
      const response = await api.get('/api/v1/certificate/certificate-types');
      setCertificateTypes(response.data || []);
    } catch (err) {
      console.error('증명서 종류 조회 실패:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // 입력 시 에러 초기화
  };

  const handleVerify = async () => {
    // 유효성 검증
    if (!formData.prdocCd) {
      setError('문서종류는 필수사항입니다.');
      return;
    }
    if (!formData.prdocIssuAplyNo) {
      setError('문서확인번호는 필수사항입니다.');
      return;
    }
    if (formData.prdocIssuAplyNo.length !== 17) {
      setError('문서확인번호 17자리는 필수사항입니다.');
      return;
    }

    try {
      const params = new URLSearchParams({
        prdocCd: formData.prdocCd,
        prdocIssuAplyNo: formData.prdocIssuAplyNo,
      });

      if (formData.issuInstCd && formData.issuInstCd.trim()) {
        params.append('issuInstCd', formData.issuInstCd);
      }

      const response = await api.get(
        `/api/v1/certificate/verify?${params.toString()}`,
      );

      // 성공 케이스
      if (response.data) {
        setVerificationResult({
          isSuccess: true,
          data: response.data,
        });
        setError(''); // 폼 에러 초기화
      } else {
        // 실패 케이스 (데이터 없음)
        setVerificationResult({
          isSuccess: false,
          data: null,
        });
      }

      setIsPopupOpen(true); // 팝업 열기

    } catch (err) {
      console.error('진위확인 실패:', err);
      // 에러 발생 시 실패 팝업
      setVerificationResult({
        isSuccess: false,
        data: null,
      });
      setIsPopupOpen(true); // 팝업 열기
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    // 팝업 닫을 때 결과 초기화 (선택사항)
    // setVerificationResult(null);
  };

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap side-conts" data-type="responsive">
          <h2 className="h-tit">발급 진위 확인</h2>
        </div>

        <div className="txt-box outline">
          <h4 className="outline-tit">알려드립니다.</h4>
          <ul className="check-list">
            <li>중소벤처24 <a href="http://smes.go.kr/" target="_blank" rel="noopener noreferrer" className="on-linktxt2">(www.smes.go.kr)</a>를 통해 출력된 증명/확인서의 진위확인 서비스입니다.</li>
            <li>발급된 증명/확인서의 종류를 선택한 후 발급문서 우측 상단의 문서확인번호 17자리를 입력하세요.</li>
          </ul>
        </div>

        <div className="mt-24">
          <dl className="on-form-row">
            <div className="form-row-item ">
              <dt className="form-row-label">
                <label htmlFor="select_01">발급기관</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-272">
                  <select
                    id="select_01"
                    name="issuInstCd"
                    className="krds-form-select small"
                    value={formData.issuInstCd}
                    onChange={handleChange}
                  >
                    <option value="">전체</option>
                    {institutions.map(inst => (
                      <option key={inst.code} value={inst.code}>
                        {shortenInstName(inst.name)}
                      </option>
                    ))}
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="select_02">
                    문서종류<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-272">
                  <select
                    id="select_02"
                    name="prdocCd"
                    className="krds-form-select small"
                    value={formData.prdocCd}
                    onChange={handleChange}
                  >
                    <option value="">증명/확인서 선택</option>
                    {certificateTypes.map(type => (
                      <option key={type.code} value={type.code}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_01">
                    문서확인번호<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-272">
                  <input
                    type="text"
                    id="input_01"
                    name="prdocIssuAplyNo"
                    className="krds-input small"
                    placeholder="17자리 입력"
                    value={formData.prdocIssuAplyNo}
                    onChange={handleChange}
                    maxLength={17}
                  />
                </div>
              </dd>
            </div>
          </dl>
        </div>

        {/* 폼 유효성 검증 에러만 표시 */}
        {error && (
          <div className="mt-16" style={{ color: 'red', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div className="onboard-btm-btngroup btn-single bt-0">
          <div>
            <button
              type="button"
              className="krds-btn xlarge"
              onClick={handleVerify}
            >
                진위확인
            </button>
          </div>
        </div>
      </div>

      {/* 진위확인 결과 팝업 */}
      {verificationResult && (
        <VerificationResultPopup
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          isSuccess={verificationResult.isSuccess}
          data={verificationResult.data}
        />
      )}
    </>
  );
};

export default UI_USR_L_050;
