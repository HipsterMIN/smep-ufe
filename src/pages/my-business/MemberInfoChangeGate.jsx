import { useEffect, useMemo, useState } from 'react';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';

import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import {
  JOINT_CERT_CLAIM,
  JOINT_CERT_PROVIDER,
  JOINT_CERT_PURPOSE,
} from '@lib/joint-cert/provider/contract.js';
import { createJointCertificateProviderClient } from '@lib/joint-cert/provider/jointCertificateProviderClient.js';
import {
  MEMBER_INFO_CHANGE_VERIFICATION_HEADER,
  clearStoredMemberInfoVerification,
  readStoredMemberInfoVerification,
  writeStoredMemberInfoVerification,
} from '@lib/memberInfoChangeVerification.js';
import { useNiceIdAuth } from '@/hooks/useNiceIdAuth.js';
import { useAuthStore } from '@store/useAuthStore.jsx';

const INDIVIDUAL_VERIFY_ENDPOINT = '/api/v1/member-info-change/verification/individual';
const CORPORATE_VERIFY_ENDPOINT = '/api/v1/member-info-change/verification/corporate';
const STATUS_ENDPOINT = '/api/v1/member-info-change/verification/status';
const SIGN_ORIGIN = 'magicLine';

const normalizePathname = (pathname) => pathname.replace(/\/+$/, '') || '/';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeDigits = (value) => String(value ?? '').replace(/[^0-9]/g, '');

const normalizeApiPayload = (response) => response?.data || response || null;

const getVerificationBasePath = (pathname, successPath) => {
  const normalizedPathname = normalizePathname(pathname);
  const normalizedSuccessPath = String(successPath || '')
    .replace(/^\.\//, '')
    .replace(/^\/+|\/+$/g, '');

  if (!normalizedSuccessPath) {
    return normalizedPathname;
  }

  return normalizedPathname.replace(
    new RegExp(`/${escapeRegExp(normalizedSuccessPath)}$`),
    '',
  );
};

const createCorrelation = () => {
  const randomId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    requestId: `member-info-change-${randomId}`,
    ceremonyId: randomId,
    startedAt: new Date().toISOString(),
  };
};

const buildStoredVerification = (response) => {
  const payload = normalizeApiPayload(response);
  if (!payload?.entryKey) {
    throw new Error('회원정보변경 인증 결과 형식이 올바르지 않습니다.');
  }
  return payload;
};

const MemberInfoChangeGate = ({ children, successPath = 'modify' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const matches = useMatches();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const currentMode = useAuthStore((state) => state.currentMode);
  const niceIdAuth = useNiceIdAuth();

  const pageTitle =
    [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '회원정보변경';
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const [checkingStatus, setCheckingStatus] = useState(false);
  const [verified, setVerified] = useState(false);
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const isSuccessRouteActive = useMemo(() => {
    if (!successPath) {
      return false;
    }
    const normalizedPathname = normalizePathname(location.pathname);
    const normalizedSuccessPath = String(successPath).replace(/^\.\//, '').replace(/^\/+|\/+$/g, '');
    return normalizedSuccessPath
      ? normalizedPathname.endsWith(`/${normalizedSuccessPath}`)
      : false;
  }, [location.pathname, successPath]);

  const verificationBasePath = useMemo(
    () => getVerificationBasePath(location.pathname, successPath),
    [location.pathname, successPath],
  );

  useEffect(() => {
    let active = true;

    const validateStoredVerification = async () => {
      if (!isSuccessRouteActive) {
        setVerified(false);
        return;
      }

      const storedVerification = readStoredMemberInfoVerification();
      if (!storedVerification?.entryKey) {
        clearStoredMemberInfoVerification();
        setVerified(false);
        navigate(verificationBasePath, { replace: true });
        return;
      }

      setCheckingStatus(true);
      try {
        await apiClient.get(STATUS_ENDPOINT, {
          headers: {
            [MEMBER_INFO_CHANGE_VERIFICATION_HEADER]: storedVerification.entryKey,
          },
        });
        if (active) {
          setVerified(true);
        }
      } catch {
        clearStoredMemberInfoVerification();
        if (active) {
          setVerified(false);
          navigate(verificationBasePath, { replace: true });
        }
      } finally {
        if (active) {
          setCheckingStatus(false);
        }
      }
    };

    validateStoredVerification();
    return () => {
      active = false;
    };
  }, [isSuccessRouteActive, navigate, verificationBasePath]);

  const completeVerification = (verificationResponse) => {
    const storedVerification = buildStoredVerification(verificationResponse);
    writeStoredMemberInfoVerification(storedVerification);
    setVerified(false);
    setMessage('');
    if (!isSuccessRouteActive) {
      navigate(successPath, { replace: true });
    }
  };

  const handleIndividualVerification = async () => {
    setSubmitting(true);
    setMessage('');
    try {
      const niceResult = await niceIdAuth.authenticate({ svcTypes: ['M'] });
      if (!niceResult?.success) {
        setMessage(niceResult?.message || '휴대폰 인증을 완료하지 못했습니다.');
        return;
      }

      const verificationResponse = await apiClient.post(INDIVIDUAL_VERIFY_ENDPOINT, {
        resultKey: niceResult.resultKey,
      });
      completeVerification(verificationResponse);
    } catch (error) {
      setMessage(error?.data?.message || error?.message || '휴대폰 인증 확인 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCorporateVerification = async (event) => {
    event.preventDefault();

    const normalizedBusinessRegistrationNumber = normalizeDigits(businessRegistrationNumber);
    if (normalizedBusinessRegistrationNumber.length !== 10) {
      setMessage('사업자등록번호 10자리를 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      const providerClient = createJointCertificateProviderClient();
      const providerResult = await providerClient.startAuthentication({
        provider: JOINT_CERT_PROVIDER.MAGICLINE,
        purpose: JOINT_CERT_PURPOSE.CERT_CHANGE,
        challenge: {
          signOrigin: SIGN_ORIGIN,
        },
        identityHint: {
          businessNumber: normalizedBusinessRegistrationNumber,
        },
        requestedClaims: [
          JOINT_CERT_CLAIM.BUSINESS_NUMBER,
          JOINT_CERT_CLAIM.VID_CHECK,
          JOINT_CERT_CLAIM.SUBJECT_DN,
          JOINT_CERT_CLAIM.SOURCE_TEXT,
        ],
        correlation: createCorrelation(),
      });

      if (!providerResult?.success || !providerResult.serverVerificationRequest) {
        setMessage(providerResult?.error?.message || '공동인증서 인증을 완료하지 못했습니다.');
        return;
      }

      const verificationResponse = await apiClient.post(CORPORATE_VERIFY_ENDPOINT, {
        businessRegistrationNumber: normalizedBusinessRegistrationNumber,
        providerVerificationRequest: providerResult.serverVerificationRequest,
      });
      completeVerification(verificationResponse);
    } catch (error) {
      setMessage(error?.data?.message || error?.message || '공동인증서 인증 확인 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccessRouteActive && verified) {
    return <>{children}</>;
  }

  const isBusy = submitting || niceIdAuth.loading || checkingStatus;
  const isCorporate = currentMode === 'CORPORATE';
  const isIndividual = currentMode === 'INDIVIDUAL';

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">{pageTitle}</h2>
        </div>

        <div className="conts-wrap form-confirm">
          <h3 className="sec-tit">본인 확인</h3>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">정확한 본인확인을 위해 인증을 완료해 주세요.</li>
          </ul>

          {checkingStatus && (
            <p className="txt-caution" role="status">
              인증 상태를 확인하고 있습니다.
            </p>
          )}

          {isIndividual && (
            <div className="onboard-btm-btngroup bt-0 btn-single">
              <div>
                <button
                  type="button"
                  className="krds-btn primary xlarge"
                  onClick={handleIndividualVerification}
                  disabled={isBusy}
                >
                  휴대폰 인증
                </button>
              </div>
            </div>
          )}

          {isCorporate && (
            <form onSubmit={handleCorporateVerification}>
              <dl className="on-form-row large">
                <div className="form-row-item">
                  <dt className="form-row-label">
                    <label htmlFor="member_info_change_brno">사업자등록번호</label>
                  </dt>
                  <dd className="form-row-content">
                    <div className="form-wrapper w-220">
                      <input
                        type="text"
                        id="member_info_change_brno"
                        className="krds-input small"
                        value={businessRegistrationNumber}
                        onChange={(event) => setBusinessRegistrationNumber(event.target.value)}
                        inputMode="numeric"
                        maxLength={12}
                        placeholder="숫자 10자리"
                        disabled={isBusy}
                      />
                    </div>
                  </dd>
                </div>
              </dl>

              <div className="onboard-btm-btngroup bt-0 btn-single">
                <div>
                  <button
                    type="submit"
                    className="krds-btn primary xlarge"
                    disabled={isBusy}
                  >
                    공동인증서 인증
                  </button>
                </div>
              </div>
            </form>
          )}

          {!isIndividual && !isCorporate && (
            <p className="txt-caution" role="alert">
              회원유형을 확인할 수 없습니다. 다시 로그인해 주세요.
            </p>
          )}

          {message && (
            <p className="txt-caution" role="alert">
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default MemberInfoChangeGate;
