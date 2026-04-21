import React, { useState } from 'react';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

const SmtcIssue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { prdocNm, prdocCd, prdocIssuGdCn } = location.state || {};

  const [lginId, setLginId]       = useState('');
  const [sbjtId, setSbjtId]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu  = getDepth1Parent();

  const brno = '1378626719'; // TODO: 실제 로그인 사용자 사업자번호로 교체

  const goBack = () => navigate(-1);

  const validate = () => {
    if (!prdocCd)           { alert('증명서 코드가 없습니다.');        return false; }
    if (!lginId.trim())     { alert('SMTECH 아이디를 입력해주세요.');   return false; }
    if (!sbjtId.trim())     { alert('과제번호를 입력해주세요.');         return false; }
    return true;
  };

  const handlePrint = async () => {
    if (!validate()) return;
    if (!window.confirm('증명서를 출력하시겠습니까?')) return;

    try {
      setIsLoading(true);

      const prdocIssuAplyNo = await apiClient.post('/api/v1/certificate/issue', {
        prdocCd,
        brno,
        prdocIssuTypeCd: 'Y301',
        extraParams: {
          lginId: lginId.trim(),
          sbjtId: sbjtId.trim(),
        },
      });

      window.open(
        `http://e-page.smes-tipa.go.kr/markany/report?prdocCd=${prdocCd}&prdocIssuAplyNo=${prdocIssuAplyNo}`,
        '_blank',
      );

      navigate('/mb/dash/UI_USR_L_510');
    } catch (e) {
      console.error('증명서 발급 실패:', e);
      alert('조회된 데이터가 없습니다. SMTECH 홈페이지에 문의해주세요.(https://www.smtech.go.kr)');
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
        brno,
        prdocIssuTypeCd: 'Y302',
        extraParams: {
          lginId: lginId.trim(),
          sbjtId: sbjtId.trim(),
        },
      });

      navigate('/mb/dash/UI_USR_L_510');
    } catch (e) {
      console.error('증명서 발급 실패:', e);
      alert('조회된 데이터가 없습니다. SMTECH 홈페이지에 문의해주세요.(https://www.smtech.go.kr)');
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

        <div className="conts-wrap">
          <div className="txt-box outline">
            <h4 className="outline-tit">알려드립니다.</h4>
            <ul className="check-list">
              {prdocIssuGdCn
                ? prdocIssuGdCn
                  .split('\n')
                  .filter((line) => line.trim() !== '')
                  .map((line, index) => <li key={index}>{line.trim()}</li>)
                : null}
            </ul>
          </div>

          <dl className="on-form-row large mt-24">
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_01" className="form-label">
                    SMTECH 아이디
                  <span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input
                    type="text"
                    id="id_01"
                    className="krds-input small"
                    placeholder="SMTECH 아이디를 입력해주세요"
                    value={lginId}
                    onChange={(e) => setLginId(e.target.value)}
                  />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_02" className="form-label">
                    과제번호
                  <span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input
                    type="text"
                    id="id_02"
                    className="krds-input small"
                    placeholder="과제번호를 입력해주세요"
                    value={sbjtId}
                    onChange={(e) => setSbjtId(e.target.value)}
                  />
                </div>
              </dd>
            </div>
          </dl>
        </div>

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

export default SmtcIssue;