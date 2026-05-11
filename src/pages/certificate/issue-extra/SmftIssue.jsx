import React, { useState, useEffect } from 'react';
import SideNavigation from '@/components/ui/SideNavigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';

const SmftIssue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { prdocNm, prdocCd, prdocIssuGdCn } = location.state || {};
  const { brno } = useAuthStore((state) => ({ brno: state.bizno }));

  const [records, setRecords]                       = useState([]);
  const [cmpNm, setCmpNm]                           = useState('');
  const [rpsntNm, setRpsntNm]                       = useState('');
  const [selectedCrtfIssuNo, setSelectedCrtfIssuNo] = useState('');
  const [isLoading, setIsLoading]                   = useState(false);
  const [isFetching, setIsFetching]                 = useState(false);

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu  = getDepth1Parent();

  const goBack = () => navigate(-1);

  // 종사업장 목록 조회
  useEffect(() => {
    const fetchRecords = async () => {
      setIsFetching(true);
      try {
        const res = await apiClient.get('/api/v1/certificate/smft/records');
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

  const validate = () => {
    if (!selectedCrtfIssuNo) { alert('종사업장을 선택해주세요.'); return false; }
    if (!prdocCd)            { alert('증명서 코드가 없습니다.');   return false; }
    return true;
  };

  const handlePrint = async () => {
    if (!validate()) return;
    if (!window.confirm('증명서를 출력하시겠습니까?')) return;

    try {
      setIsLoading(true);
      const prdocIssuAplyNo = await apiClient.post('/api/v1/certificate/issue', {
        prdocCd,
        prdocIssuTypeCd: 'Y301',
        extraParams: { crtfIssuNo: selectedCrtfIssuNo },
      });

      window.open(
        `https://www.smes.go.kr/e-page?prdocCd=${prdocCd}&prdocIssuAplyNo=${prdocIssuAplyNo}`,
        '_blank',
      );

      navigate('/mb/dash/UI_USR_L_510');
    } catch (e) {
      console.error('증명서 발급 실패:', e);
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
        extraParams: { crtfIssuNo: selectedCrtfIssuNo },
      });

      navigate('/mb/dash/UI_USR_L_510');
    } catch (e) {
      console.error('증명서 발급 실패:', e);
      alert('증명서 발급 중 오류가 발생했습니다.');
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
    </>
  );
};

export default SmftIssue;