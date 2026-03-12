import React from 'react';
import { useState } from 'react';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Popup from '@components/ui/Popup.jsx';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@store/useAuthStore.jsx';

const UI_USR_P_042 = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { prdocNm, prdocCd, prdocIssuGdCn } = location.state || {};

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const brno = '1378626719'; // TODO: 실제 로그인 사용자 사업자번호로 교체

  const goBack = () => {
    navigate(-1);
  };

  // 출력 버튼 → 발급 API 호출 + PDF 다운로드
  const handlePrint = async () => {
    if (!prdocCd) {
      alert('증명서 코드가 없습니다.');
      return;
    }

    try {
      setIsLoading(true);

      // 1. 발급 API (apiClient 사용)
      const prdocIssuAplyNo = await apiClient.post('/api/v1/certificate/issue', {
        prdocCd,
        brno,
        prdocIssuTypeCd: 'Y301', // 직접 발급
      });

      console.log('증명서 발급 완료 - 번호:', prdocIssuAplyNo);

      // 2. ClipReport & MarkAny 서버 호출
      const response = await axios.post('http://localhost:8080/markany/certificate', null, {
        params: {
          prdocCd: prdocCd,
          prdocIssuAplyNo: prdocIssuAplyNo,
        },
        responseType: 'blob',
      });

      // PDF 다운로드
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificate.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      console.error('증명서 발급/다운로드 실패:', e);
      alert('증명서 발급 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
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
                  .map((line, index) => (
                    <li key={index}>{line.trim()}</li>
                  ))
                : null}
            </ul>
          </div>

          <dl className="on-form-row large mt-24">
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_01" className="form-label">사업자등록번호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="id_01" className="krds-input small" placeholder="사업자등록번호를 입력해주세요" value={brno} disabled />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_02" className="form-label">상호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="id_02" className="krds-input small" placeholder="상호를 입력해주세요" value="주식회사 중소벤처" disabled />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_03" className="form-label">대표자명 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="id_03" className="krds-input small" placeholder="대표자명을 입력해주세요" value="홍길동" disabled />
                </div>
              </dd>
            </div>
          </dl>
        </div>

        <div className="onboard-btm-btngroup bt-0">
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={goBack}>취소</button>
          </div>
          <div>
            {/* 전자문서지갑 → 용도 선택 팝업 */}
            <button
              type="button"
              className="krds-btn primary xlarge"
              onClick={() => setIsPopupOpen(true)}
            >
                전자문서지갑
            </button>
            {/* 출력 → 발급 API 호출 */}
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

      {/* 발급 용도 선택 팝업 - 전자문서지갑 전용 */}
      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        size="small"
        noBottomBtn
      >
        <div className="confirm-guide">
          <span className="sub-title">용도 확인</span>
          <p className="main-title">전자증명서 발급 용도를 선택해주세요</p>

          <div className="purpose-selection">
            <button type="button" className="btn-purpose">
              <i className="ico-public"></i>
              <span>공공기관 입찰용</span>
            </button>
            <button type="button" className="btn-purpose">
              <i className="ico-other"></i>
              <span>공공기관 입찰 이외의 용도</span>
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_P_042;
