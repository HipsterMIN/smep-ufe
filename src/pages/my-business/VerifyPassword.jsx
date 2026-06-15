import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';

import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';
import {
  decodeJwtPayload,
} from '@utils/commonUtils.js';

const DEFAULT_VERIFY_ENDPOINT = '/api/v1/account/password/verify';
const VERIFICATION_STORAGE_PREFIX = 'verify-password:';

const normalizePathname = (pathname) => pathname.replace(/\/+$/, '') || '/';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

const getStoredVerificationStatus = (storageKey) => {
  if (!storageKey || typeof window === 'undefined') {
    return false;
  }

  try {
    return window.sessionStorage.getItem(storageKey) === 'true';
  } catch (error) {
    console.warn('Failed to read password verification status.', error);
    return false;
  }
};

const setStoredVerificationStatus = (storageKey) => {
  if (!storageKey || typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(storageKey, 'true');
  } catch (error) {
    console.warn('Failed to save password verification status.', error);
  }
};

const clearStoredVerificationStatus = (storageKey) => {
  if (!storageKey || typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(storageKey);
  } catch (error) {
    console.warn('Failed to clear password verification status.', error);
  }
};

const normalizeVerifyResult = (result) => {
  if (typeof result === 'boolean') {
    return result;
  }
  if (typeof result === 'string') {
    return result.trim().toLowerCase() === 'true';
  }

  return result?.data === true || result?.verified === true || result?.success === true;
};

const VerifyPassword = ({
  children,
  successPath,
  verifyEndpoint = DEFAULT_VERIFY_ENDPOINT,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const matches = useMatches();
  const authUser = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);
  const isInitialPassword = useAuthStore((state) => state.initialPassword);
  const tokenPayload = decodeJwtPayload(authToken);
  const tokenLoginId = tokenPayload?.login_id;
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const pageTitle = [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '비밀번호 확인';
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const defaultLoginId = useMemo(() => {
    return tokenLoginId || authUser?.loginId || authUser?.username || '';
  }, [tokenLoginId, authUser]);

  const isSuccessRouteActive = useMemo(() => {
    if (!successPath) {
      return false;
    }

    const normalizedPathname = location.pathname.replace(/\/$/, '');
    const normalizedSuccessPath = successPath.replace(/^\.\//, '').replace(/\/$/, '');
    if (successPath.startsWith('/')) {
      return normalizedPathname === normalizedSuccessPath;
    }

    return normalizedPathname.endsWith(`/${normalizedSuccessPath}`);
  }, [location.pathname, successPath]);

  const verificationStorageKey = useMemo(() => {
    const menuId = [...matches].reverse().find((match) => match?.handle?.menuId)?.handle?.menuId;
    return `${VERIFICATION_STORAGE_PREFIX}${menuId || verifyEndpoint}:${successPath || 'default'}`;
  }, [matches, successPath, verifyEndpoint]);
  const verificationBasePathRef = useRef(null);

  if (verificationBasePathRef.current === null && typeof window !== 'undefined') {
    verificationBasePathRef.current = getVerificationBasePath(
      window.location.pathname,
      successPath,
    );
  }

  const [loginId, setLoginId] = useState(defaultLoginId);
  const [password, setPassword] = useState('');
  const [isVerified, setIsVerified] = useState(() => (
    isSuccessRouteActive && getStoredVerificationStatus(verificationStorageKey)
  ));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setLoginId((currentLoginId) => currentLoginId || defaultLoginId);
  }, [defaultLoginId]);

  useEffect(() => {
    if (!successPath) {
      return;
    }

    if (!isSuccessRouteActive) {
      clearStoredVerificationStatus(verificationStorageKey);
      setIsVerified(false);
      return;
    }

    setIsVerified(getStoredVerificationStatus(verificationStorageKey));
  }, [isSuccessRouteActive, successPath, verificationStorageKey]);

  useEffect(() => {
    if (!successPath) {
      return undefined;
    }

    return () => {
      if (typeof window === 'undefined') {
        return;
      }

      const verificationBasePath = verificationBasePathRef.current;
      const currentPathname = normalizePathname(window.location.pathname);
      const isInVerificationFlow =
        currentPathname === verificationBasePath ||
        currentPathname.startsWith(`${verificationBasePath}/`);

      if (!isInVerificationFlow) {
        clearStoredVerificationStatus(verificationStorageKey);
      }
    };
  }, [successPath, verificationStorageKey]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedLoginId = loginId.trim();
    if (!trimmedLoginId) {
      setErrorMessage('아이디를 입력해 주세요.');
      return;
    }
    if (!password) {
      setErrorMessage('비밀번호를 입력해 주세요.');
      return;
    }

    setErrorMessage('');

    try {
      const result = await apiClient.post(verifyEndpoint, {
        id: trimmedLoginId,
        password,
      });

      if (!normalizeVerifyResult(result.data)) {
        setErrorMessage('아이디 또는 비밀번호가 일치하지 않습니다.');
        return;
      }

      setStoredVerificationStatus(verificationStorageKey);
      setIsVerified(true);
      if (successPath && !isSuccessRouteActive) {
        navigate(successPath, {
          replace: true,
          state: {
            passwordVerified: true,
            verifiedAt: Date.now(),
          },
        });
      }
    } catch (error) {
      console.error('Password verification failed:', error);
      setErrorMessage(error?.message || '비밀번호 확인 중 오류가 발생했습니다.');
    }
  };

  if (isVerified) {
    return <>{children}</>;
  }

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

        <form onSubmit={handleSubmit}>
          {isInitialPassword && (
            <div
              className="conts-wrap"
              style={{ marginBottom: '1.6rem', padding: '1.6rem 2rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '0.6rem' }}
            >
              <p style={{ margin: 0, fontWeight: 700, color: '#92400e', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
                ⚠ 초기 비밀번호 상태 — 회원정보 변경 불가
              </p>
              <p style={{ margin: 0, fontSize: '1.3rem', color: '#78350f', lineHeight: 1.6 }}>
                자동 발급 초기 비밀번호를 사용하고 있어 회원정보를 변경할 수 없습니다.
                <br />
                비밀번호를 먼저 변경해 주세요.
              </p>
              <div style={{ marginTop: '1.2rem' }}>
                <button
                  type="button"
                  className="krds-btn small primary"
                  onClick={() => navigate('/mb/mbr/UI_USR_R_420')}
                >
                  비밀번호 수정 페이지로 이동
                </button>
              </div>
            </div>
          )}
          <div className="conts-wrap form-confirm">
            <h3 className="sec-tit">비밀번호 재확인</h3>
            <ul className="krds-info-list decimal" role="list">
              <li role="listitem">정확한 본인확인을 위해 다시 한번 비밀번호를 입력해 주세요.</li>
              <li role="listitem">비밀번호는 타인에게 노출되지 않도록 주의해 주세요.</li>
            </ul>

            {/* TODO 키보드 보안 적용시 주석해제하여 구현 */}
            {/*<div className="form-group krds-check-area">
              <div className="krds-form-check">
                <input type="checkbox" name="keyboard_security" id="keyboard_security" />
                <label htmlFor="keyboard_security">키보드 보안 프로그램 적용</label>
              </div>
            </div>
            <p className="txt-caution">
              안전한 중소벤처24 서비스 이용을 위해 키보드 보안 프로그램 적용을 권장합니다.
            </p>*/}

            <dl className="on-form-row large">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="verify_login_id">아이디</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input
                      type="text"
                      id="verify_login_id"
                      className="krds-input small"
                      value={loginId}
                      autoComplete="username"
                      disabled
                    />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="verify_password">비밀번호</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input
                      type="password"
                      id="verify_password"
                      className="krds-input small"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="비밀번호를 입력해 주세요."
                      autoComplete="current-password"
                      aria-invalid={!!errorMessage}
                    />
                  </div>

                  {errorMessage && (
                    <p className="txt-caution" role="alert">
                      {errorMessage}
                    </p>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="onboard-btm-btngroup bt-0 btn-single">
            <div>
              <button
                type="submit"
                className="krds-btn primary xlarge"
                disabled={isInitialPassword}
                title={isInitialPassword ? '초기 비밀번호를 먼저 변경해 주세요.' : undefined}
              >
                다음 단계
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default VerifyPassword;
