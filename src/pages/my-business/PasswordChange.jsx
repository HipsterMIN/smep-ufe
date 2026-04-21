import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useAuthStore } from '@store/useAuthStore.jsx';

const PASSWORD_ALLOWED_REGEX = /^[A-Za-z0-9!@#$%^&*()=_+\-]{8,20}$/;
const PASSWORD_LETTER_REGEX = /[A-Za-z]/;
const PASSWORD_DIGIT_REGEX = /\d/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()=_+\-]/;

const countPasswordCategories = (password) => {
  let categoryCount = 0;

  if (PASSWORD_LETTER_REGEX.test(password)) {
    categoryCount += 1;
  }
  if (PASSWORD_DIGIT_REGEX.test(password)) {
    categoryCount += 1;
  }
  if (PASSWORD_SPECIAL_REGEX.test(password)) {
    categoryCount += 1;
  }

  return categoryCount;
};

const validatePasswordChangeForm = ({ currentPassword, newPassword, confirmPassword }) => {
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
  if (!PASSWORD_ALLOWED_REGEX.test(newPassword)) {
    return '새 비밀번호는 8~20자이며 허용된 영문, 숫자, 특수문자만 사용할 수 있습니다.';
  }
  if (countPasswordCategories(newPassword) < 2) {
    return '새 비밀번호는 영문, 숫자, 특수문자 중 두 가지 이상을 조합해야 합니다.';
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
    });

    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.patch('/api/v1/account/password', {
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
                    className="krds-input small"
                    placeholder="비밀번호를 입력해주세요."
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
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
                    className="krds-input small"
                    placeholder="비밀번호를 입력해주세요."
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <p className="form-hint">
                  비밀번호는 영문자(대·소문자), 숫자, 특수문자중 두가지를 조합하여 8자~20자 이내로 입력하세요. <br />
                 ( 사용가능 특수문자 : !, @, #, $, %, ^, &, *, (, ), -, =, _, + )</p>
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
                    className="krds-input small"
                    placeholder="비밀번호를 입력해주세요."
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <p className="form-hint point">새 비밀번호는 영문, 숫자, 특수문자 중 두 가지 이상을 조합해 입력해야 합니다.</p>
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
              type="button"
              className="krds-btn primary large"
              onClick={handleChangePassword}
              disabled={isSubmitting}
            >
              변경
            </button>
          </div>
        </div>

      </div> 
    </>
  );
};

export default UI_USR_R_420;
