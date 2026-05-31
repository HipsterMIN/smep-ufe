import Breadcrumb from '../components/ui/Breadcrumb';
import React, { useRef, useState } from 'react';
import { api as apiClient } from '../lib/apiClient.js';
import { useAuthStore } from '../store/useAuthStore.jsx';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { buildOnePassRegisterUrl } from '../utils/keycloakGetAuthCode.js';

const LOGIN_TYPE_INDIVIDUAL = 'INDIVIDUAL';
const LOGIN_TYPE_CORPORATE = 'CORPORATE';
const EMPTY_VALIDATION_ERROR = { field: '', message: '' };
const LOGIN_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: '아이디 또는 비밀번호가 일치하지 않습니다.',
  PASSWORD_LOCKED: '비밀번호 5회 이상 입력 오류로 계정이 잠겼습니다.',
  COMMUNICATION_DELAY: '현재 시스템 통신 지연으로 로그인이 불가합니다.',
};

const resolveLoginErrorMessage = (error) => {
  const code = error?.data?.code;
  const status = error?.status;

  if (code === 'ACCOUNT_LOGIN_002') {
    return LOGIN_ERROR_MESSAGES.PASSWORD_LOCKED;
  }

  if (!status || status >= 500 || code === 'COMMON_502' || code === 'COMMON_503') {
    return LOGIN_ERROR_MESSAGES.COMMUNICATION_DELAY;
  }

  return LOGIN_ERROR_MESSAGES.INVALID_CREDENTIALS;
};

const UI_USR_R_002 = () => {
  const { login } = useAuthStore();
  const location = useLocation();
  const [loginType, setLoginType] = useState(
    location.state?.loginType || LOGIN_TYPE_INDIVIDUAL,
  );
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState(EMPTY_VALIDATION_ERROR);
  const loginIdRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: '로그인', link: '#' },
  ];

  const handleLoginTypeChange = (nextType) => {
    setLoginType(nextType);
    setLoginId('');
    setValidationError(EMPTY_VALIDATION_ERROR);
    if (nextType === LOGIN_TYPE_CORPORATE) {
      setPassword('');
    }
  };

  const clearValidationError = (field) => {
    if (validationError.field === field) {
      setValidationError(EMPTY_VALIDATION_ERROR);
    }
  };

  const validateLoginForm = () => {
    if (!loginId.trim()) {
      setValidationError({
        field: 'loginId',
        message: '아이디를 입력해 주시길 바랍니다.',
      });
      loginIdRef.current?.focus();
      return false;
    }

    if (!password.trim()) {
      setValidationError({
        field: 'password',
        message: '비밀번호를 입력해 주시길 바랍니다.',
      });
      passwordRef.current?.focus();
      return false;
    }

    setValidationError(EMPTY_VALIDATION_ERROR);
    return true;
  };

  const handleClick = async () => {
    if (!validateLoginForm()) {
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        id: loginId,
        password,
        type: loginType,
      });
      const accessToken = response.accessToken || response.data?.accessToken;
      const refreshToken = response.refreshToken || response.data?.refreshToken;
      if (!accessToken) {
        throw new Error('Access token is missing');
      }

      const profileResponse = await apiClient.get('/api/v1/account/me', { token: accessToken });
      const profile = profileResponse.data || profileResponse;
      // Header session timer는 ID/PW 로그인에서 받은 refresh token이 있을 때만 동작한다.
      login({ token: accessToken, refreshToken, profile });
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      alert(resolveLoginErrorMessage(error));
    }
  };

  const handleEnterSubmit = (event) => {
    if (event.key !== 'Enter' || event.nativeEvent?.isComposing) {
      return;
    }

    event.preventDefault();
    handleClick();
  };



  const handleOnePassJoin = () => {
    const typeStr = (loginType === LOGIN_TYPE_INDIVIDUAL) ? 'member' : 'business';
      
    const onePassJoinUrl = buildOnePassRegisterUrl(typeStr);
    console.log('onOnePassJoin (Current Type: ' + loginType + ') : ', onePassJoinUrl);
    window.location.href = onePassJoinUrl;
  };

  return (
    <>
      <div className="contents">
        <Breadcrumb items={breadcrumbItems}/>
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">로그인 방식을 선택해주세요.</h2>
        </div>

        <div className="login-tab" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            className={`krds-btn ${loginType === LOGIN_TYPE_INDIVIDUAL ? 'primary' : 'secondary'}`}
            onClick={() => handleLoginTypeChange(LOGIN_TYPE_INDIVIDUAL)}
          >
            개인 회원
          </button>
          <button
            type="button"
            className={`krds-btn ${loginType === LOGIN_TYPE_CORPORATE ? 'primary' : 'secondary'}`}
            onClick={() => handleLoginTypeChange(LOGIN_TYPE_CORPORATE)}
          >
            기업 회원
          </button>
        </div>

        <style>{`
          .login-form-area.login-form-area-no-divider::after {
            display: none;
          }
        `}</style>

        <div className="login-contents">
          <div className="login-form-area login-form-area-no-divider">
            <div className="login-wrap">
              <fieldset>
                <legend>로그인 폼</legend>
                <div className="fieldset">
                  <div className={`form-group ${validationError.field === 'loginId' ? 'is-error' : ''}`}>
                    <div className="form-tit">
                      <label htmlFor="login_id">아이디</label>
                    </div>
                    <input
                      ref={loginIdRef}
                      type="text"
                      id="login_id"
                      className="krds-input medium"
                      value={loginId}
                      onChange={(e) => {
                        setLoginId(e.target.value);
                        clearValidationError('loginId');
                      }}
                      onKeyDown={handleEnterSubmit}
                      placeholder={loginType === LOGIN_TYPE_CORPORATE ? '기업 로그인 ID' : '개인 로그인 ID'}
                      aria-invalid={validationError.field === 'loginId'}
                      aria-describedby={validationError.field === 'loginId' ? 'login_id_error' : undefined}
                    />
                    {validationError.field === 'loginId' && (
                      <p className="form-hint-invalid" id="login_id_error" role="alert">
                        {validationError.message}
                      </p>
                    )}
                  </div>
                  <div className={`form-group ${validationError.field === 'password' ? 'is-error' : ''}`}>
                    <div className="form-tit">
                      <label htmlFor="login_pw">비밀번호</label>
                    </div>
                    <div className="form-conts btn-ico-wrap">
                      <input
                        ref={passwordRef}
                        type="password"
                        id="login_pw"
                        className="krds-input medium"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearValidationError('password');
                        }}
                        onKeyDown={handleEnterSubmit}
                        placeholder="비밀번호를 입력하세요"
                        aria-invalid={validationError.field === 'password'}
                        aria-describedby={validationError.field === 'password' ? 'login_pw_error' : undefined}
                      />
                    </div>
                    {validationError.field === 'password' && (
                      <p className="form-hint-invalid" id="login_pw_error" role="alert">
                        {validationError.message}
                      </p>
                    )}
                  </div>
                  <div className="form-group krds-check-area">
                    <div className="krds-form-check">
                      <input type="checkbox" name="save_id" id="save_id"/>
                      <label htmlFor="save_id">아이디 저장</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <button type="button" className="krds-btn large primary" onClick={handleClick}>로그인</button>
                  </div>
                  <div className="form-group">
                    <ul className="link-group">
                      <li><Link to="#" className="krds-btn medium text">아이디 찾기</Link></li>
                      <li><Link to="#" className="krds-btn medium text">비밀번호 찾기</Link></li>
                      <li><button type="button" className="krds-btn medium text" onClick={handleOnePassJoin}>회원가입</button></li>
                    </ul>
                  </div>
                </div>
                {/*                <div className="sns-login">
                  <div className="login-sub-tit"><span>SNS 로그인</span></div>
                  <div className="sns-login-btns">
                    <button type="button" className="krds-btn large tertiary">
                      <i className="ico-google"></i>
                      <span className="sns-login-tit">구글</span>
                    </button>
                    <button type="button" className="krds-btn large tertiary">
                      <i className="ico-kakao"></i>
                      <span className="sns-login-tit">카카오</span>
                    </button>
                    <button type="button" className="krds-btn large tertiary">
                      <i className="ico-naver"></i>
                      <span className="sns-login-tit">네이버</span>
                    </button>
                  </div>
                </div>*/}
              </fieldset>
            </div>

            {/*           <div className="other-login-methods">
              <div className="login-sub-tit">다른 로그인 방식을 찾고 계신가요?</div>
              <div className="other-login-box">
                <ul className="other-login-btns">
                  <li>
                    <button type="button">
                      <span className="btn-icon phone"></span>
                      <strong className="btn-title">휴대폰 인증</strong>
                      <i className="svg-icon ico-angle right"></i>
                    </button>
                  </li>
                  <li>
                    <button type="button">
                      <span className="btn-icon public"></span>
                      <strong className="btn-title">공동 인증서</strong>
                      <i className="svg-icon ico-angle right"></i>
                    </button>
                  </li>
                  <li>
                    <button type="button">
                      <span className="btn-icon authentication"></span>
                      <strong className="btn-title">간편인증</strong>
                      <i className="svg-icon ico-angle right"></i>
                    </button>
                  </li>
                  <li>
                    <button type="button">
                      <span className="btn-icon any-id"></span>
                      <strong className="btn-title">Any-ID</strong>
                      <i className="svg-icon ico-angle right"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>*/}
          </div>


          <div className="helper-box refer blue">
            <p className="helper-tit has-icon">로그인에 어려움이 있으신가요?</p>
            <div className="helper-desc-wrap">
              <ul className="krds-info-list decimal" role="list">
                <li role="listitem">
                    로그인 관련 문의사항은 <Link to="/cs/csc/faq" className="krds-btn medium link"><span className="underline">자주 찾는 질문</span></Link>을 확인해보세요.
                </li>
                <li role="listitem">(044) 300-0990, (044) 300-0991으로 전화주세요. 서비스에 로그인할 수 있도록 도와드리겠습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UI_USR_R_002;
