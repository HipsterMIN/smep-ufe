import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { api as apiClient } from '@lib/apiClient.js';
import Logo from '@assets/common/logo2.svg';
import { useAuthStore } from '@store/useAuthStore';

import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Popup from '@components/ui/Popup.jsx';
import { resolveListBackPath } from '@utils/listNavigation.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_R_041 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent, getFullPath } = useUserMenu();

  const { isLogin, cmpNm, currentMode, logout  } = useAuthStore();

  const { prdocCd } = useParams();
  const location = useLocation();
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
    navigate(resolveListBackPath(location));
  };

  /**
   * 증명서 발급 버튼 클릭 핸들러
   */
  const handleClickIssue = async () => {
    if (!isLogin) {
      if (window.confirm('로그인 후 해당 서비스를 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?')) {
        navigate('/service/login', { state: { loginType: 'CORPORATE' } });
      }
      return;
    }

    if (currentMode !== 'CORPORATE') {
      if (window.confirm('기업회원 로그인 후 해당 서비스를 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?\n로그인 페이지 이동시 로그아웃 됩니다.')) {
        // 로그아웃 처리 후 로그인 페이지로 이동
        try {
          // kcIdToken: SSO callback 시 수신하여 store에 보관 중인 Keycloak id_token.
          // 서버는 HttpSession에서 id_token을 읽지 않으므로(STATELESS) body로 전달한다.
          const kcIdToken = useAuthStore.getState().kcIdToken;
          const response = await apiClient.post('/api/v1/auth/keycloak/logout', {
            idToken: kcIdToken || null,
          });
          const responseData = response?.data || response;
          const logoutUrl = responseData?.logoutUrl || null;

          logout(); // 로컬 로그아웃은 항상 수행

          if (logoutUrl) {
            // OnePass 세션이 있으면 외부 logout redirect 처리.
            // post_logout_redirect_uri는 BE 설정 고정값(/sso-logout)이므로 FE에서 직접 변경 불가.
            // Keycloak 로그아웃 완료 후 /sso-logout 경유 시 /service/login으로 복귀하도록
            // sessionStorage에 의도를 저장하고 OnePassSsoLogout에서 읽어 처리한다.
            sessionStorage.setItem(
              'post_logout_redirect',
              JSON.stringify({ path: '/service/login', state: { loginType: 'CORPORATE' } }),
            );
            window.location.href = logoutUrl;
            return;
          }
        } catch (error) {
          console.error('[Certificate] failed to fetch keycloak logout url', {
            message: error?.message ?? 'unknown-error',
            status: error?.status ?? null,
          });
          logout(); // API 실패해도 로컬 로그아웃은 수행
        }

        navigate('/service/login', { state: { loginType: 'CORPORATE' } });
      }
      return;
    }

    // 발급 가능 기업 여부 확인
    let supportedLangs = [];
    try {
      const result = await apiClient.post(
        '/api/v1/certificate/eligibility',
        {
          prdocCd,
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
      supportedLangs = result.data.supportedLangs || [];
    } catch (error) {
      console.error('발급 가능 여부 확인 실패:', error);
      alert('발급 가능 여부 확인 중 오류가 발생했습니다.');
      return;
    }

    const base = getFullPath('M_PIIO_00078');

    const state = {
      prdocCd,
      prdocNm: data.prdocTtl,
      prdocIssuGdCn: data.prdocIssuGdCn,
      elpblYn: data.elpblYn,
      supportedLangs,
    };

    if (prdocCd === 'Y101') {
      navigate(`${base}/Y101/dpc-issue`, { state });
    }  else if (prdocCd === 'Y104' || prdocCd === 'Y105') {
      navigate(`${base}/Y104/biz-issue`, { state });
    } else if (prdocCd === 'Y109') {
      navigate(`${base}/Y109/cbz-issue`, { state });
    } else if (prdocCd === 'Y113') {
      navigate(`${base}/Y113/pfc-issue`, { state });
    } else if (['Y114', 'Y115', 'Y116', 'Y117'].includes(prdocCd)) {
      navigate(`${base}/${prdocCd}/smtc-issue`, { state });
    } else if (prdocCd === 'Y121') {
      navigate(`${base}/Y121/smft-issue`, { state });
    } else {
      navigate(`${base}/${prdocCd}/apply`, { state });
    }
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
                onClick={() => window.open(`${ineligibleInfo.linkedSystemUrl}`, '_blank')}
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
                귀사 <span className="bold">{cmpNm}</span>은(는)
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
                navigate(getFullPath('M_PIIO_00113'));
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
