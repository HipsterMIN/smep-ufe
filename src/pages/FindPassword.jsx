import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import { useNiceIdAuth } from '../hooks/useNiceIdAuth';
import { api } from '../lib/apiClient';

const PASSWORD_FIND_SEND_OPTIONS = [
  {
    type: 'EMAIL',
    channelKey: 'email',
    label: '이메일',
    unavailableLabel: '등록된 이메일 없음',
  },
  {
    type: 'SMS',
    channelKey: 'sms',
    label: '문자',
    unavailableLabel: '등록된 휴대전화 없음',
  },
];

const SEND_TYPE_LABELS = PASSWORD_FIND_SEND_OPTIONS.reduce(
  (labels, option) => ({ ...labels, [option.type]: option.label }),
  {},
);

const resolvePasswordFindErrorMessage = (error) =>
  error?.data?.message ||
  error?.data?.error?.message ||
  error?.message ||
  '임시비밀번호 발송 처리 중 오류가 발생했습니다.';

const FindPassword = () => {
  const navigate = useNavigate();
  const [memberType, setMemberType] = useState('personal');
  const [businessType, setBusinessType] = useState('corporate');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [personalAuthResult, setPersonalAuthResult] = useState(null);
  const [passwordFindKey, setPasswordFindKey] = useState('');
  const [passwordFindChannels, setPasswordFindChannels] = useState(null);
  const [selectedSendType, setSelectedSendType] = useState('EMAIL');
  const [isVerifyingPasswordFind, setIsVerifyingPasswordFind] = useState(false);
  const [isSendingTemporaryPassword, setIsSendingTemporaryPassword] = useState(false);
  const { authenticate, reset: resetNiceIdAuth, loading: niceIdAuthLoading } = useNiceIdAuth();

  const isPersonal = memberType === 'personal';
  const isCompany = memberType === 'company';
  const isAuthBusy = niceIdAuthLoading || isVerifyingPasswordFind;

  const getSendTypeOption = (sendType) =>
    PASSWORD_FIND_SEND_OPTIONS.find((option) => option.type === sendType) || PASSWORD_FIND_SEND_OPTIONS[0];

  const getChannel = (sendType) => {
    const { channelKey } = getSendTypeOption(sendType);
    return passwordFindChannels?.[channelKey] || { available: false, maskedAddress: null };
  };

  const getVisibleSendOptions = () => PASSWORD_FIND_SEND_OPTIONS;

  const isSelectedSendTypeAvailable = () => Boolean(getChannel(selectedSendType).available);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isPersonal) {
      if (!passwordFindKey) {
        alert('본인 인증을 완료해주세요.');
        return;
      }

      if (!isSelectedSendTypeAvailable()) {
        alert('임시비밀번호를 받을 수 있는 발송 방법을 선택해주세요.');
        return;
      }

      console.info('[FIND_PASSWORD_MARK] temporary password send start', {
        hasFindKey: Boolean(passwordFindKey),
        sendType: selectedSendType,
      });
      setIsSendingTemporaryPassword(true);

      try {
        const sendResponse = await api.post('/api/v1/account/password-find/send', {
          findKey: passwordFindKey,
          sendType: selectedSendType,
        });
        console.info('[FIND_PASSWORD_MARK] temporary password send success', {
          sendType: sendResponse?.sendType,
          hasMaskedAddress: Boolean(sendResponse?.maskedAddress),
        });
        const sendTypeLabel = SEND_TYPE_LABELS[sendResponse?.sendType] || SEND_TYPE_LABELS[selectedSendType];
        const maskedAddress = sendResponse?.maskedAddress ? ` (${sendResponse.maskedAddress})` : '';
        alert(`${sendTypeLabel}${maskedAddress}로 임시비밀번호가 발송되었습니다. 로그인해 주세요.`);
        navigate('/service/login');
      } catch (error) {
        console.error('[FIND_PASSWORD_MARK] temporary password send failed', {
          status: error?.status,
          message: error?.message,
        });
        alert(resolvePasswordFindErrorMessage(error));
      } finally {
        setIsSendingTemporaryPassword(false);
      }
      return;
    }

    console.log('기업회원 비밀번호 찾기', businessType);
  };

  const clearPasswordFindState = () => {
    setPersonalAuthResult(null);
    setPasswordFindKey('');
    setPasswordFindChannels(null);
    setSelectedSendType('EMAIL');
  };

  const resetPersonalAuthResult = () => {
    clearPasswordFindState();
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
      setIsVerifyingPasswordFind(true);

      try {
        const verifyResponse = await api.post('/api/v1/account/password-find/verify', {
          loginId: userId.trim(),
          memberName: userName.trim(),
          resultKey: authResult.resultKey,
        });
        const channels = verifyResponse.channels || {};
        const defaultSendOption =
          PASSWORD_FIND_SEND_OPTIONS.find((option) => channels[option.channelKey]?.available) ||
          PASSWORD_FIND_SEND_OPTIONS[0];
        setPasswordFindKey(verifyResponse.findKey || '');
        setPasswordFindChannels(channels);
        setSelectedSendType(defaultSendOption.type);
        setPersonalAuthResult({ authMethod });
        console.info('[FIND_PASSWORD_MARK] personal verify success', {
          authMethod,
          hasFindKey: Boolean(verifyResponse.findKey),
          expiresInSeconds: verifyResponse.expiresInSeconds,
          emailAvailable: Boolean(channels.email?.available),
          smsAvailable: Boolean(channels.sms?.available),
        });
        alert('본인 인증이 완료되었습니다. 임시비밀번호를 받을 방법을 선택해주세요.');
      } catch (error) {
        console.error('[FIND_PASSWORD_MARK] personal verify failed', {
          authMethod,
          status: error?.status,
          message: error?.message,
        });
        alert(resolvePasswordFindErrorMessage(error));
      } finally {
        setIsVerifyingPasswordFind(false);
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

                {passwordFindKey && (
                  <div className="conts-wrap form-confirm">
                    <h3 className="sec-tit">임시비밀번호 발급</h3>
                    <ul className="krds-info-list decimal" role="list">
                      <li role="listitem">본인 인증이 완료되었습니다. 임시비밀번호를 받을 방법을 선택해 주세요.</li>
                      <li role="listitem">발급된 임시비밀번호로 로그인한 뒤 비밀번호를 변경해 주세요.</li>
                    </ul>
                    <dl className="on-form-row large">
                      <div className="form-row-item">
                        <dt className="form-row-label flex-start">
                          <span>발송 방법</span>
                        </dt>
                        <dd className="form-row-content">
                          <div className="krds-check-area gap-4">
                            {getVisibleSendOptions().map((option) => {
                              const channel = getChannel(option.type);
                              const optionId = `temporaryPasswordSend${option.type}`;
                              const channelLabel = channel.maskedAddress
                                ? ` (${channel.maskedAddress})`
                                : ` (${option.unavailableLabel})`;

                              return (
                                <span className="krds-form-check" key={option.type}>
                                  <input
                                    type="radio"
                                    name="temporaryPasswordSendType"
                                    id={optionId}
                                    value={option.type}
                                    checked={selectedSendType === option.type}
                                    onChange={() => setSelectedSendType(option.type)}
                                    disabled={!channel.available || isSendingTemporaryPassword}
                                  />
                                  <label htmlFor={optionId}>
                                    {option.label}
                                    {channelLabel}
                                  </label>
                                </span>
                              );
                            })}
                          </div>
                          <p className="form-hint point">선택한 방법으로 임시비밀번호가 발송됩니다.</p>
                        </dd>
                      </div>
                    </dl>
                    <div className="onboard-btm-btngroup bt-0 btn-single">
                      <button
                        type="submit"
                        className="krds-btn large primary"
                        disabled={isSendingTemporaryPassword || !isSelectedSendTypeAvailable()}
                      >
                        {isSendingTemporaryPassword ? '발송 중...' : '임시비밀번호 발송'}
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
