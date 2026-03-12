import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api as apiClient } from '@lib/apiClient.js';
import Logo from '@assets/common/logo2.svg';
// import { useAuthStore } from '@store/useAuthStore'; // TODO: 로그인/기업회원 정책 결정 후 활성화

import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Popup from '@components/ui/Popup.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_R_041 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent, getFullPath } = useUserMenu();

  const { prdocCd } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 발급 불가 팝업 상태
  const [isIneligiblePopupOpen, setIsIneligiblePopupOpen] = useState(false);
  const [ineligibleInfo, setIneligibleInfo] = useState(null);

  // 중복 발급 팝업 상태
  const [isDuplicatePopupOpen, setIsDuplicatePopupOpen] = useState(false);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/v1/certificate/detail/${prdocCd}`);
        setData(response.data);
      } catch (error) {
        console.error('상세 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [prdocCd]);

  const goBack = () => {
    navigate(-1);
  };

  /**
   * 증명서 발급 버튼 클릭 핸들러
   * TODO: 로그인/기업회원 정책 결정 후 아래 주석 처리된 체크 로직 활성화
   */
  const handleClickIssue = async () => {
    // TODO: 로그인 체크 - 정책 결정 후 활성화
    // if (!isLogin) {
    //   if (window.confirm('로그인 후 해당 서비스를 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?')) {
    //     navigate('/login');
    //   }
    //   return;
    // }

    // TODO: 기업회원 체크 - 정책 결정 후 활성화
    // if (currentMode !== 'CORPORATE') {
    //   if (window.confirm('기업회원 로그인 후 해당 서비스를 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?')) {
    //     navigate('/login');
    //   }
    //   return;
    // }

    // 발급 가능 기업 여부 확인
    try {
      const result = await apiClient.post(
        '/api/v1/certificate/eligibility',
        {
          prdocCd,
          bizNo: '1378626719', // TODO: 로그인 구현 후 Zustand store bizno로 교체
        },
      );

      // 24시간 내 중복 발급 이력 확인
      if (result.data.isDuplicate) {
        setIsDuplicatePopupOpen(true);
        return;
      }

      if (!result.data.eligible) {
        setIneligibleInfo({
          prdocNm: result.data.prdocNm,
          linkedSystemName: result.data.linkedSystemName,
          linkedSystemUrl: result.data.linkedSystemUrl,
        });
        setIsIneligiblePopupOpen(true);
        return;
      }
    } catch (error) {
      console.error('발급 가능 여부 확인 실패:', error);
      alert('발급 가능 여부 확인 중 오류가 발생했습니다.');
      return;
    }

    navigate(`${getFullPath('M_PIIO_00078')}/${prdocCd}/apply`, {
      state: {
        prdocCd,
        prdocNm: data.prdocTtl,
        prdocIssuGdCn: data.prdocIssuGdCn,
      },
    });
  };

  if (loading) return <div>로딩 중...</div>;
  if (!data) return <div>데이터를 찾을 수 없습니다.</div>;

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap bottom-divide" data-type="responsive">
          <span className="h-sub">증명서 발급</span>
          <h2 className="h-tit2">{data.prdocTtl}</h2>
        </div>

        <div
          className="detail-list-wrap"
          dangerouslySetInnerHTML={{ __html: data.prdocExpln }}
        />

        <div className="onboard-btm-btngroup bt-0">
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={goBack}>
                목록
            </button>
          </div>
          <div>
            <button type="button" className="krds-btn primary xlarge" onClick={handleClickIssue}>
                증명서 발급 <i className="svg-icon ico-angle right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 발급 불가 안내 팝업 */}
      <Popup
        isOpen={isIneligiblePopupOpen}
        onClose={() => setIsIneligiblePopupOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="krds-btn tertiary medium"
              onClick={() => setIsIneligiblePopupOpen(false)}
            >
                  닫기
            </button>
            {ineligibleInfo?.linkedSystemUrl && (
              <button
                type="button"
                className="krds-btn primary medium"
                onClick={() => window.open(`https://${ineligibleInfo.linkedSystemUrl}`, '_blank')}
              >
                      바로가기
              </button>
            )}
          </>
        }
      >
        <div className="txt-box outline">
          <div className="guide-text-box">
            <div className="guide-logo">
              <img src={Logo} alt="중소벤처 24 로고" />
            </div>
            <div className="guide-text">
                귀사 <span className="bold">업체명</span>은(는)
              <br />
              <strong>
                  현재 중소기업통합플랫폼에서 <br /> {ineligibleInfo?.prdocNm} 발급 대상이 아닙니다.
              </strong>
              {ineligibleInfo?.linkedSystemName && (
                <p>해당 증명서 발급 기관인 {ineligibleInfo.linkedSystemName}에서 확인바랍니다.</p>
              )}
            </div>
          </div>
        </div>
      </Popup>

      {/* 24시간 내 중복 발급 안내 팝업 */}
      <Popup
        isOpen={isDuplicatePopupOpen}
        onClose={() => setIsDuplicatePopupOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="krds-btn primary medium"
              onClick={() => {
                setIsDuplicatePopupOpen(false);
                // TODO: 발급이력 목록 페이지 경로 확정 후 교체
                navigate(getFullPath('M_PIIO_00078'));
              }}
            >
              예
            </button>
            <button
              type="button"
              className="krds-btn tertiary medium"
              onClick={() => {
                setIsDuplicatePopupOpen(false);
                navigate(-1);
              }}
            >
              아니오
            </button>
          </>
        }
      >
        <div className="txt-box outline">
          <div className="guide-text-box">
            <div className="guide-logo">
              <img src={Logo} alt="중소벤처 24 로고"/>
            </div>
            <div className="guide-text">
              <strong>24시간 이내에 발급된 증명서가 있습니다.</strong>
              <p>발급이력조회로 이동하시겠습니까?</p>
            </div>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_R_041;
