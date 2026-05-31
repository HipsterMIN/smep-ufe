import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import { useNiceIdAuth } from '../hooks/useNiceIdAuth';
import { api } from '../lib/apiClient';

const PASSWORD_ALLOWED_REGEX = /^[A-Za-z0-9!@#$%^&*()=_+-]{8,20}$/;
const PASSWORD_LETTER_REGEX = /[A-Za-z]/;
const PASSWORD_DIGIT_REGEX = /\d/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()=_+-]/;

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

const validateResetPasswordForm = ({ newPassword, confirmPassword }) => {
  if (!newPassword.trim()) {
    return '새 비밀번호를 입력해주세요.';
  }
  if (!confirmPassword.trim()) {
    return '새 비밀번호 확인을 입력해주세요.';
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

const resolvePasswordResetErrorMessage = (error) =>
  error?.data?.message ||
  error?.data?.error?.message ||
  error?.message ||
  '비밀번호 재설정 처리 중 오류가 발생했습니다.';

const FindPassword = () => {
  const navigate = useNavigate();
  const [memberType, setMemberType] = useState('personal');
  const [businessType, setBusinessType] = useState('corporate');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [personalAuthResult, setPersonalAuthResult] = useState(null);
  const [resetKey, setResetKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerifyingPasswordReset, setIsVerifyingPasswordReset] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { authenticate, reset: resetNiceIdAuth, loading: niceIdAuthLoading } = useNiceIdAuth();

  const isPersonal = memberType === 'personal';
  const isCompany = memberType === 'company';
  const isAuthBusy = niceIdAuthLoading || isVerifyingPasswordReset;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isPersonal) {
      if (!resetKey) {
        alert('본인 인증을 완료해주세요.');
        return;
      }

      const validationMessage = validateResetPasswordForm({ newPassword, confirmPassword });
      if (validationMessage) {
        alert(validationMessage);
        return;
      }

      console.info('[FIND_PASSWORD_MARK] reset submit start', {
        hasResetKey: Boolean(resetKey),
        hasNewPassword: Boolean(newPassword),
        hasConfirmPassword: Boolean(confirmPassword),
      });
      setIsResettingPassword(true);

      try {
        await api.post('/api/v1/account/password-reset', {
          resetKey,
          newPassword,
          confirmPassword,
        });
        console.info('[FIND_PASSWORD_MARK] reset submit success');
        alert('비밀번호가 변경되었습니다. 로그인해 주세요.');
        navigate('/service/login');
      } catch (error) {
        console.error('[FIND_PASSWORD_MARK] reset submit failed', {
          status: error?.status,
          message: error?.message,
        });
        alert(resolvePasswordResetErrorMessage(error));
      } finally {
        setIsResettingPassword(false);
      }
      return;
    }

    console.log('기업회원 비밀번호 찾기', businessType);
  };

  const clearPasswordResetState = () => {
    setPersonalAuthResult(null);
    setResetKey('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const resetPersonalAuthResult = () => {
    clearPasswordResetState();
    resetNiceIdAuth();
  };

  const handleMemberTypeChange = (nextMemberType) => {
    setMemberType(nextMemberType);
    resetPersonalAuthResult();
  };

  const handleUserIdChange = (event) => {
    setUserId(event.target.value);
    resetPersonalAuthResult();
  };

  const handleUserNameChange = (event) => {
    setUserName(event.target.value);
    resetPersonalAuthResult();
  };

  const handlePersonalAuthClick = async (authMethod) => {
    if (!userId.trim()) {
      alert('아이디를 입력해주세요.');
      return;
    }

    if (!userName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    console.info('[FIND_PASSWORD_MARK] personal auth start', {
      authMethod,
      loginIdLength: userId.trim().length,
      memberNameLength: userName.trim().length,
    });

    const authResult = await authenticate({ svcTypes: [authMethod] });
    if (authResult?.success) {
      console.info('[FIND_PASSWORD_MARK] personal auth success', {
        authMethod,
        resultKeyLength: authResult.resultKey?.length || 0,
      });
      setIsVerifyingPasswordReset(true);

      try {
        const verifyResponse = await api.post('/api/v1/account/password-reset/verify', {
          loginId: userId.trim(),
          memberName: userName.trim(),
          resultKey: authResult.resultKey,
        });
        setResetKey(verifyResponse.resetKey || '');
        setPersonalAuthResult({ authMethod });
        console.info('[FIND_PASSWORD_MARK] personal verify success', {
          authMethod,
          hasResetKey: Boolean(verifyResponse.resetKey),
          expiresInSeconds: verifyResponse.expiresInSeconds,
        });
        alert('본인 인증이 완료되었습니다. 새 비밀번호를 입력해주세요.');
      } catch (error) {
        console.error('[FIND_PASSWORD_MARK] personal verify failed', {
          authMethod,
          status: error?.status,
          message: error?.message,
        });
        alert(resolvePasswordResetErrorMessage(error));
      } finally {
        setIsVerifyingPasswordReset(false);
      }
      return;
    }

    console.info('[FIND_PASSWORD_MARK] personal auth failed', {
      authMethod,
      code: authResult?.code,
    });
    // 이유: 실패 alert를 같은 tick에서 바로 띄우면 React가 loading 해제 렌더를 끝내기 전에 dialog가 화면을 막을 수 있다.
    window.setTimeout(() => {
      alert(authResult?.message || 'NICE ID 인증 처리 중 오류가 발생했습니다.');
    }, 0);
  };

  const breadcrumbItems = [
    { label: '비밀번호 찾기', link: '#' },
  ];

  return (
    <div className="contents">
      <Breadcrumb items={breadcrumbItems} />
      <div className="page-title-wrap" data-type="responsive">
        <h2 className="h-tit">비밀번호 찾기</h2>
      </div>
      <div className="find-form-area find-pw">
        <div className="krds-tab-area layer">
          <div className="tab fill full">
            <ul role="tablist" aria-label="회원 유형 선택">
              <li role="tab" aria-selected={isPersonal} className={isPersonal ? 'active' : ''}>
                <button type="button" className="btn-tab" onClick={() => handleMemberTypeChange('personal')}>
                  개인회원
                </button>
              </li>
              <li role="tab" aria-selected={isCompany} className={isCompany ? 'active' : ''}>
                <button type="button" className="btn-tab" onClick={() => handleMemberTypeChange('company')}>
                  기업회원
                </button>
              </li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`find-id-fields ${isPersonal ? 'is-personal' : 'is-company'}`}>
            <div className="form-group-wrap">
              <div className="form-group">
                <label htmlFor="userId">아이디</label>
                <input
                  id="userId"
                  type="text"
                  className="krds-input"
                  value={userId}
                  onChange={handleUserIdChange}
                />
              </div>
              {isCompany ? (
                <>
                  <div className="form-group">
                    <label htmlFor="companyName">기업명</label>
                    <input id="companyName" type="text" className="krds-input" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bizNo">사업자등록번호</label>
                    <div className="field-control">
                      <input id="bizNo" type="text" className="krds-input" inputMode="numeric" />
                      <p>‘-’를 제외하고 입력해주세요.</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="managerId">담당자 아이디</label>
                    <div className="field-control">
                      <input id="managerId" type="text" className="krds-input" />
                      <p>담당자의 개인회원 아이디를 입력해주세요.</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="managerName">담당자 이름</label>
                    <div className="field-control">
                      <input id="managerName" type="text" className="krds-input" />
                      <p>담당자의 개인회원 이름을 입력해주세요.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label htmlFor="userName">이름</label>
                  <input
                    id="userName"
                    type="text"
                    className="krds-input"
                    value={userName}
                    onChange={handleUserNameChange}
                  />
                </div>
              )}
            </div>
          </div>
          <section className="auth-section">
            {isPersonal ? (
              <>
                <h2 className="auth-title">본인 인증</h2>

                <div className="auth-card-grid">
                  <div className="auth-card">
                    <h3>휴대전화 인증</h3>
                    <div className="auth-icon phone">
                      <span></span>
                    </div>
                    <p>본인 명의의 휴대폰 정보로 인증 후 가입하실 수 있습니다.</p>
                    <button
                      type="button"
                      className="krds-btn large primary"
                      onClick={() => handlePersonalAuthClick('M')}
                      disabled={isAuthBusy}
                    >
                      {isAuthBusy ? '인증 중...' : '인증하기'}
                    </button>
                  </div>

                  <div className="auth-card">
                    <h3>아이핀 인증</h3>
                    <div className="auth-icon ipin">
                      <span></span>
                    </div>
                    <p>본인 아이핀 정보로 인증 후 가입하실 수 있습니다.</p>
                    <button
                      type="button"
                      className="krds-btn large primary"
                      onClick={() => handlePersonalAuthClick('I')}
                      disabled={isAuthBusy}
                    >
                      {isAuthBusy ? '인증 중...' : '인증하기'}
                    </button>
                  </div>
                </div>

                {personalAuthResult && (
                  <p className="auth-complete" role="status">
                    본인 인증이 완료되었습니다.
                  </p>
                )}

                {resetKey && (
                  <div className="conts-wrap form-confirm">
                    <h3 className="sec-tit">새 비밀번호 설정</h3>
                    <ul className="krds-info-list decimal" role="list">
                      <li role="listitem">본인 인증이 완료되었습니다. 새 비밀번호를 입력해 주세요.</li>
                      <li role="listitem">비밀번호는 타인에게 노출되지 않도록 주의해 주세요.</li>
                    </ul>
                    <dl className="on-form-row large">
                      <div className="form-row-item">
                        <dt className="form-row-label flex-start">
                          <label htmlFor="find_password_new">새 비밀번호</label>
                        </dt>
                        <dd className="form-row-content">
                          <div className="form-wrapper w-220">
                            <input
                              type="password"
                              id="find_password_new"
                              name="newPassword"
                              className="krds-input small"
                              placeholder="비밀번호를 입력해주세요."
                              value={newPassword}
                              onChange={(event) => setNewPassword(event.target.value)}
                              autoComplete="new-password"
                              disabled={isResettingPassword}
                            />
                          </div>
                          <p className="form-hint">
                            비밀번호는 영문자(대·소문자), 숫자, 특수문자중 두가지를 조합하여 8자~20자 이내로 입력하세요. <br />
                            ( 사용가능 특수문자 : !, @, #, $, %, ^, &, *, (, ), -, =, _, + )
                          </p>
                        </dd>
                      </div>
                      <div className="form-row-item">
                        <dt className="form-row-label flex-start">
                          <label htmlFor="find_password_confirm">새 비밀번호 확인</label>
                        </dt>
                        <dd className="form-row-content">
                          <div className="form-wrapper w-220">
                            <input
                              type="password"
                              id="find_password_confirm"
                              name="confirmPassword"
                              className="krds-input small"
                              placeholder="비밀번호를 입력해주세요."
                              value={confirmPassword}
                              onChange={(event) => setConfirmPassword(event.target.value)}
                              autoComplete="new-password"
                              disabled={isResettingPassword}
                            />
                          </div>
                          <p className="form-hint point">새 비밀번호는 영문, 숫자, 특수문자 중 두 가지 이상을 조합해 입력해야 합니다.</p>
                        </dd>
                      </div>
                    </dl>
                    <div className="onboard-btm-btngroup bt-0 btn-single">
                      <button type="submit" className="krds-btn large primary" disabled={isResettingPassword}>
                        {isResettingPassword ? '변경 중...' : '비밀번호 변경'}
                      </button>
                    </div>
                  </div>
                )}

                <ul className="auth-notice">
                  <li>입력하신 인증정보는 실명인증을 위한 자료로 사용되며 이외의 용도로 사용 또는 제공되지 않습니다.</li>
                  <li>인증이 정상적으로 작동하지 않으면 브라우저의 팝업 차단 기능을 해제하신 후 이용하시기 바랍니다.</li>
                  <li>인증 관련 문의 : - NICE평가정보(주) 고객센터 Tel : 1600-1522</li>
                </ul>
              </>
            ) : (
              <>
                <div className="krds-check-area gap-4">
                  <span className="krds-form-check">
                    <input
                      type="radio"
                      name="businessType"
                      id="businessType_01"
                      value="individual"
                      checked={businessType === 'individual'}
                      onChange={() => setBusinessType('individual')}
                    />
                    <label htmlFor="businessType_01">개인사업자</label>
                  </span>
                  <span className="krds-form-check">
                    <input
                      type="radio"
                      name="businessType"
                      id="businessType_02"
                      value="corporate"
                      checked={businessType === 'corporate'}
                      onChange={() => setBusinessType('corporate')}
                    />
                    <label htmlFor="businessType_02">법인사업자</label>
                  </span>
                </div>

                <div className="auth-card full">
                  <h3>공동인증서 인증</h3>
                  <div className="auth-icon cert">
                    <span></span>
                  </div>
                  <button type="button" className="krds-btn large primary">
                    인증하기
                  </button>
                </div>
                <ul className="auth-notice">
                  <li>인증 관련 문의 : - NICE평가정보(주) 고객센터 Tel : 1600-1522</li>
                </ul>
              </>
            )}
          </section>
        </form>
      </div>
    </div>
  );
};

export default FindPassword;
