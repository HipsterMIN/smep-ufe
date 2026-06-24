import React, { useEffect, useState } from 'react';
import SideNavigation from '@/components/ui/SideNavigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

const BizIssue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { prdocNm, prdocCd, prdocIssuGdCn, supportedLangs = [] } = location.state || {};
  const [enterpriseInfo, setEnterpriseInfo] = useState({ mbrNm: '', rprsvNm: '', brno: '' });

  const [outputLang, setOutputLang] = useState('');
  const [isLoading, setIsLoading]   = useState(false);

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu  = getDepth1Parent();

  const goBack = () => navigate(-1);

  // 출력언어에 따라 리포트용 prdocCd suffix 생성 (한국어: Y104, 영어: Y104_EN, 중국어: Y104_CN)
  const getReportPrdocCd = () => {
    if (outputLang === 'EN') return `${prdocCd}_EN`;
    if (outputLang === 'CN') return `${prdocCd}_CN`;
    return prdocCd;
  };

  const validate = () => {
    if (!prdocCd) { alert('증명서 코드가 없습니다.'); return false; }
    return true;
  };

  useEffect(() => {
    const fetchEnterpriseInfo = async () => {
      try {
        const data = await apiClient.get('/api/v1/member/common/me/enterprise-info');
        setEnterpriseInfo(data.data);
      } catch (e) {
        return null;
      }
    };
    fetchEnterpriseInfo();
  }, []);

  const handlePrint = async () => {
    if (!validate()) return;
    if (!window.confirm('증명서를 출력하시겠습니까?')) return;

    try {
      setIsLoading(true);
      const prdocIssuAplyNo = await apiClient.post('/api/v1/certificate/issue', {
        prdocCd,
        prdocIssuTypeCd: 'Y301',
        extraParams: { outputLang },
      });

      window.open(
        `https://portal.smes.go.kr/e-page?prdocCd=${getReportPrdocCd()}&prdocIssuAplyNo=${prdocIssuAplyNo}`,
        '_blank',
      );

      navigate('/mb/dash/UI_USR_L_510');
    } catch (e) {
      alert('증명서 발급 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletClick = async () => {
    if (!validate()) return;
    if (!window.confirm('전자증명서 발급을 신청하시겠습니까?')) return;

    try {
      setIsLoading(true);
      await apiClient.post('/api/v1/certificate/issue', {
        prdocCd,
        prdocIssuTypeCd: 'Y302',
      });

      navigate('/mb/dash/UI_USR_L_510');
    } catch (e) {
      alert('전자문서지갑 주소를 조회할 수 없습니다. 지갑 등록 여부를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">{prdocNm}발급</h2>
        </div>

        {/* 안내문구 */}
        <div className="conts-wrap">
          <div className="txt-box outline">
            <h4 className="outline-tit">알려드립니다.</h4>
            <ul className="check-list">
              {prdocIssuGdCn
                ? prdocIssuGdCn.split('\\n').filter(l => l.trim() !== '').map((line, i) => (
                  <li key={i}>{line.trim()}</li>
                ))
                : null}
            </ul>
          </div>

          {/* 기업 기본정보 */}
          <dl className="on-form-row mt-24 large">
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_01" className="form-label">
                    사업자등록번호
                  <span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="id_01" className="krds-input small"
                    placeholder="사업자등록번호를 입력해주세요" value={enterpriseInfo.brno} disabled/>
                </div>
              </dd>
            </div>

            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_02" className="form-label">
                    상호
                  <span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="id_02" className="krds-input small"
                    placeholder="상호를 입력해주세요" value={enterpriseInfo.mbrNm} disabled />
                </div>
              </dd>
            </div>

            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_03" className="form-label">
                    대표자명
                  <span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="id_03" className="krds-input small"
                    placeholder="대표자명을 입력해주세요" value={enterpriseInfo.rprsvNm} disabled/>
                </div>
              </dd>
            </div>

            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_04" className="form-label">
                    출력언어
                  <span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select
                    id="id_04"
                    className="krds-form-select small"
                    value={outputLang}
                    onChange={(e) => setOutputLang(e.target.value)}
                  >
                    <option value="">한국어</option>
                    <option value="EN" disabled={!supportedLangs.includes('EN')}>영어</option>
                    <option value="CN" disabled={!supportedLangs.includes('CN')}>중국어</option>
                  </select>
                </div>
              </dd>
            </div>
          </dl>
        </div>

        {/* 버튼 */}
        <div className="onboard-btm-btngroup bt-0">
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={goBack}>
                취소
            </button>
          </div>
          <div>
            <button
              type="button"
              className="krds-btn primary xlarge"
              onClick={handleWalletClick}
              disabled={isLoading}
            >
                전자문서지갑
            </button>
            <button
              type="button"
              className="krds-btn tertiary xlarge"
              onClick={handlePrint}
              disabled={isLoading}
            >
              <i className="svg-icon ico-print"></i>
              {isLoading ? '발급 중...' : '출력'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BizIssue;