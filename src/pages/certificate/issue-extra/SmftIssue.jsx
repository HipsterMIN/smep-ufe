import React, { useState, useEffect } from 'react';
import SideNavigation from '@/components/ui/SideNavigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Popup from '@/components/ui/Popup';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';

const SmftIssue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { prdocNm, prdocCd, prdocIssuGdCn } = location.state || {};

  const [records, setRecords]                     = useState([]);
  const [cmpNm, setCmpNm]                         = useState('');
  const [rpsntNm, setRpsntNm]                     = useState('');
  const [selectedCrtfIssuNo, setSelectedCrtfIssuNo] = useState('');
  const [isPopupOpen, setIsPopupOpen]             = useState(false);
  const [isLoading, setIsLoading]                 = useState(false);
  const [isFetching, setIsFetching]               = useState(false);

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu  = getDepth1Parent();

  const goBack = () => navigate(-1);
  const brno   = '1538701997'; // TODO: 실제 로그인 사용자 사업자번호로 교체

  // 종사업장 목록 조회
  useEffect(() => {
    const fetchRecords = async () => {
      setIsFetching(true);
      try {
        const res = await apiClient.get(`/api/v1/certificate/smft/records?brno=${brno}`);
        const data = res?.data;
        setRecords(data?.records || []);
        setCmpNm(data?.cmpNm || '');
        setRpsntNm(data?.rpsntNm || '');

        // 목록 1건이면 자동 선택
        if (data?.records?.length === 1) {
          setSelectedCrtfIssuNo(data.records[0].crtfIssuNo);
        }
      } catch (e) {
        console.error('스마트공장수준확인서 목록 조회 실패:', e);
        alert('발급 가능한 스마트공장수준확인서가 없습니다.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchRecords();
  }, []);

  // 드롭다운 옵션 레이블: "0001 (CRTF-2024-0001 / 서울특별시...)"
  const toLabel = (r) => {
    const inner = r.cmpAllAddr
      ? `${r.crtfIssuNo}  /  ${r.cmpAllAddr}`
      : r.crtfIssuNo;
    return `${r.mplcbNo}  (${inner})`;
  };

  // 발급 공통 (출력 / 전자문서지갑 모두 사용)
  const handleIssue = async (issuTypeCd) => {
    if (!selectedCrtfIssuNo) { alert('종사업장을 선택해주세요.'); return; }
    if (!prdocCd)            { alert('증명서 코드가 없습니다.');   return; }

    try {
      setIsLoading(true);
      const prdocIssuAplyNo = await apiClient.post('/api/v1/certificate/issue', {
        prdocCd,
        brno,
        prdocIssuTypeCd: issuTypeCd,
        extraParams: { crtfIssuNo: selectedCrtfIssuNo },
      });

      if (issuTypeCd === 'Y301') {
        window.open(
          `http://e-page.smes-tipa.go.kr/markany/report?prdocCd=${prdocCd}&prdocIssuAplyNo=${prdocIssuAplyNo}`,
          '_blank',
        );
      }
      setIsPopupOpen(false);
    } catch (e) {
      console.error('증명서 발급 실패:', e);
      alert('증명서 발급 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => handleIssue('Y301');

  const handleWalletClick = () => {
    if (!selectedCrtfIssuNo) { alert('종사업장을 선택해주세요.'); return; }
    setIsPopupOpen(true);
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
                    사업자등록번호 <span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-360">
                  <input type="text" id="id_01" className="krds-input small" value={brno} readOnly />
                </div>
              </dd>
            </div>

            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_02" className="form-label">
                    상호 <span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-360">
                  <input type="text" id="id_02" className="krds-input small" value={cmpNm} readOnly />
                </div>
              </dd>
            </div>

            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_03" className="form-label">
                    대표자명 <span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-360">
                  <input type="text" id="id_03" className="krds-input small" value={rpsntNm} readOnly />
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="id_04" className="form-label">종사업장번호</label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-360">
                  {isFetching ? (
                    <select id="id_04" className="krds-form-select small" disabled>
                      <option value="">조회 중...</option>
                    </select>
                  ) : records.length > 0 ? (
                    <select
                      id="id_04"
                      className="krds-form-select small"
                      value={selectedCrtfIssuNo}
                      onChange={(e) => setSelectedCrtfIssuNo(e.target.value)}
                    >
                      {records.length > 1 && (
                        <option value="">선택해주세요.</option>
                      )}
                      {records.map((r) => (
                        <option key={r.crtfIssuNo} value={r.crtfIssuNo}>
                          {toLabel(r)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select id="id_04" className="krds-form-select small" disabled>
                      <option value="">없음</option>
                    </select>
                  )}
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
              disabled={isLoading || isFetching}
            >
                전자문서지갑
            </button>
            <button
              type="button"
              className="krds-btn tertiary xlarge"
              onClick={handlePrint}
              disabled={isLoading || isFetching}
            >
              <i className="svg-icon ico-print"></i>
              {isLoading ? '발급 중...' : '출력'}
            </button>
          </div>
        </div>
      </div>

      {/* 전자문서지갑 용도 선택 팝업 */}
      <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} size="small" noBottomBtn>
        <div className="confirm-guide">
          <span className="sub-title">용도 확인</span>
          <p className="main-title">전자증명서 발급 용도를 선택해주세요</p>
          <div className="purpose-selection">
            <button type="button" className="btn-purpose" onClick={() => handleIssue('Y302')}>
              <i className="ico-public"></i>
              <span>공공기관 입찰용</span>
            </button>
            <button type="button" className="btn-purpose" onClick={() => handleIssue('Y303')}>
              <i className="ico-other"></i>
              <span>공공기관 입찰 이외의 용도</span>
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default SmftIssue;