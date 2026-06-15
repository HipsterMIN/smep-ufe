import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;
const PASSWORD_ALLOWED_PATTERN = /^[A-Za-z0-9!@#$%^&*()=_+-]+$/;
const PASSWORD_DIGIT_PATTERN = /\d/;
const PASSWORD_SPECIAL_PATTERN = /[!@#$%^&*()=_+-]/;

const hasConsecutiveChars = (value) => {
  for (let i = 0; i < value.length - 2; i++) {
    const c1 = value.charCodeAt(i);
    const c2 = value.charCodeAt(i + 1);
    const c3 = value.charCodeAt(i + 2);
    if (c1 === c2 && c2 === c3) return true;
    if (c2 === c1 + 1 && c3 === c1 + 2) return true;
    if (c2 === c1 - 1 && c3 === c1 - 2) return true;
  }
  return false;
};

const validateNewPassword = (newPassword, loginId) => {
  if (newPassword.length < PASSWORD_MIN_LENGTH || newPassword.length > PASSWORD_MAX_LENGTH) {
    return `새 비밀번호는 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자여야 합니다.`;
  }
  if (!PASSWORD_ALLOWED_PATTERN.test(newPassword)) {
    return '새 비밀번호는 영문, 숫자, 특수문자(!@#$%^&*()=_+-)만 사용할 수 있습니다.';
  }
  if (!PASSWORD_DIGIT_PATTERN.test(newPassword)) {
    return '새 비밀번호에 숫자를 포함해야 합니다.';
  }
  if (!PASSWORD_SPECIAL_PATTERN.test(newPassword)) {
    return '새 비밀번호에 특수문자(!@#$%^&*()=_+-)를 포함해야 합니다.';
  }
  if (hasConsecutiveChars(newPassword)) {
    return '새 비밀번호에 연속된 문자(예: abc, 123, aaa)를 3개 이상 사용할 수 없습니다.';
  }
  const trimmedLoginId = loginId ? loginId.trim() : '';
  if (trimmedLoginId && newPassword.toLowerCase().includes(trimmedLoginId.toLowerCase())) {
    return '새 비밀번호에 로그인 ID를 포함할 수 없습니다.';
  }
  return null;
};

const validatePasswordChangeForm = ({ currentPassword, newPassword, confirmPassword, loginId }) => {
  if (!currentPassword.trim()) {
    return '현재 비밀번호를 입력해주세요.';
  }
  if (!newPassword.trim()) {
    return '새 비밀번호를 입력해주세요.';
  }
  if (!confirmPassword.trim()) {
    return '새 비밀번호 확인을 입력해주세요.';
  }
  if (newPassword === currentPassword) {
    return '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
  }
  const policyError = validateNewPassword(newPassword, loginId);
  if (policyError) {
    return policyError;
  }
  if (newPassword !== confirmPassword) {
    return '새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.';
  }

  return null;
};

const resolvePasswordChangeErrorMessage = (error) =>
  error?.data?.message ||
  error?.data?.error?.message ||
  error?.message ||
  '비밀번호 변경에 실패했습니다.';

const UI_USR_R_420 = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  const handleChangePassword = async () => {
    const validationMessage = validatePasswordChangeForm({
      currentPassword,
      newPassword,
      confirmPassword,
      loginId: user?.loginId,
    });

    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post('/api/v1/account/password', {
        currentPassword,
        newPassword,
      });
      alert('비밀번호가 변경되었습니다. 다시 로그인해 주세요.');
      logout();
      navigate('/service/login');
    } catch (error) {
      console.error('Password change failed:', error);
      alert(resolvePasswordChangeErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleChangePassword();
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
          <h2 className="h-tit">비밀번호 수정</h2>
        </div>
        
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className="conts-wrap form-confirm">
            <h3 className="sec-tit">비밀번호 재확인</h3>
            <ul className="krds-info-list decimal" role="list">
              <li role="listitem">정확한 본인확인을 위해 다시 한 번 비밀번호를 입력해 주세요.</li>
              <li role="listitem">비밀번호는 타인에게 노출되지 않도록 주의해 주세요.</li>
            </ul>

            {/*          <div className="form-group krds-check-area">
            <div className="krds-form-check">
              <input type="checkbox" name="save_id" id="chk_01" />
              <label htmlFor="chk_01">키보드 보안 프로그램 적용</label>
            </div>
          </div>
          <p className="txt-caution">※ 안전한 중소벤처24 서비스 이용을 위해 키보드보안 프로그램 적용을 권장합니다.</p>
          */}
            <dl className="on-form-row large">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_01">
                  현재 비밀번호
                  </label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input
                      type="password"
                      id="input_01"
                      name="currentPassword"
                      className="krds-input small"
                      placeholder="비밀번호를 입력해주세요."
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      autoComplete="current-password"
                      disabled={isSubmitting}
                    />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label flex-start">
                  <label htmlFor="input_02">
                  새 비밀번호
                  </label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input
                      type="password"
                      id="input_02"
                      name="newPassword"
                      className="krds-input small"
                      placeholder="비밀번호를 입력해주세요."
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="form-hint">
                    영문·숫자·특수문자를 포함하여 8~20자로 입력하세요. 숫자와 특수문자는 필수입니다.<br />
                    ( 사용가능 특수문자 : !, @, #, $, %, ^, &amp;, *, (, ), -, =, _, + ) / 연속된 문자 3개 이상 사용 불가
                  </p>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label flex-start">
                  <label htmlFor="input_03">
                  새 비밀번호 확인
                  </label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input
                      type="password"
                      id="input_03"
                      name="confirmPassword"
                      className="krds-input small"
                      placeholder="비밀번호를 입력해주세요."
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="form-hint point">새 비밀번호와 새 비밀번호 확인이 일치해야 합니다.</p>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/*         <div className="conts-wrap mt-64 certify-conts">
          <h3 className="sec-tit">기업 인증 </h3>
          <div className="certify-cont-box">
            <div className="certify-cont-item">
              <div className="certify-cont-img"></div>
              <button type="button" className="krds-btn medium primary">인증하기</button>
            </div>
          </div>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">
              인증 관련 문의 <br />
              - NICE평가정보(주) 고객센터 Tel : 1600-1522
            </li>
          </ul>
        </div> */}

          <div className="onboard-btm-btngroup bt-0 btn-single">
            <div>
              <button
                type="submit"
                className="krds-btn primary large"
                disabled={isSubmitting}
              >
              변경
              </button>
            </div>
          </div>
        </form>

      </div> 
    </>
  );
};

export default UI_USR_R_420;
