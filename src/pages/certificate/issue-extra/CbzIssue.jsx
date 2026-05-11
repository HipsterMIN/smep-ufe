import React, { useState, useEffect } from 'react';
import SideNavigation from '@/components/ui/SideNavigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';

const CbzIssue = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { prdocNm, prdocCd, prdocIssuGdCn } = location.state || {};
  const { brno, cmpNm } = useAuthStore((state) => ({ brno: state.bizno, cmpNm: state.cmpNm }));

  const [records, setRecords]               = useState([]);
  const [selectedCmpId1, setSelectedCmpId1] = useState(null);
  const [isLoading, setIsLoading]           = useState(false);
  const [isFetching, setIsFetching]         = useState(false);

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu  = getDepth1Parent();

  const goBack = () => navigate(-1);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsFetching(true);
      try {
        const data = await apiClient.get('/api/v1/certificate/cbz/records');
        setRecords(data?.data?.records || []);
      } catch (e) {
        console.error('CBZ 목록 조회 실패:', e);
        alert('협업기업선정확인서 목록 조회 중 오류가 발생했습니다.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchRecords();
  }, []);

  const validate = () => {
    if (!selectedCmpId1) { alert('발급할 항목을 선택해주세요.'); return false; }
    if (!prdocCd)        { alert('증명서 코드가 없습니다.');      return false; }
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
        extraParams: { cmpId1: selectedCmpId1 },
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
        extraParams: { cmpId1: selectedCmpId1 },
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
                  <input type="text" id="id_03" className="krds-input small" value="홍길동" readOnly />
                </div>
              </dd>
            </div>
          </dl>
        </div>

        <div className="conts-wrap mt-24">
          <h3 className="sec-tit">발급선택</h3>
          <div className="txt-box bg-white small">
            {isFetching ? (
              <p className="txt-center">목록을 불러오는 중입니다...</p>
            ) : records.length === 0 ? (
              <p className="txt-center">조회된 협업기업선정확인서가 없습니다.</p>
            ) : (
              <ul className="select-list">
                {records.map((rec, idx) => (
                  <li key={rec.CMP_ID_1}>
                    <div className="krds-form-check medium">
                      <input
                        type="radio"
                        name="radiogroup"
                        id={`radio_cbz_${idx}`}
                        checked={selectedCmpId1 === rec.CMP_ID_1}
                        onChange={() => setSelectedCmpId1(rec.CMP_ID_1)}
                      />
                      <label htmlFor={`radio_cbz_${idx}`}>
                        <div className="cont-inner">
                          <span className="sub-txt"><em>선정번호</em>{rec.CMP_ID_1}</span>
                          <span className="sub-txt"><em>참여기업명</em>{rec.PRTCPN_CMP_NM}</span>
                          {rec.PRJCT_NM}
                        </div>
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
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

export default CbzIssue;