import React, { useState } from 'react';
import Breadcrumb from '../components/ui/Breadcrumb';
import { useNiceIdAuth } from '../hooks/useNiceIdAuth';

const FindPassword = () => {
  const [memberType, setMemberType] = useState('personal');
  const [businessType, setBusinessType] = useState('corporate');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [personalAuthResult, setPersonalAuthResult] = useState(null);
  const { authenticate, reset: resetNiceIdAuth, loading: niceIdAuthLoading } = useNiceIdAuth();

  const isPersonal = memberType === 'personal';
  const isCompany = memberType === 'company';

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isPersonal) {
      console.log('개인회원 비밀번호 찾기');
      return;
    }

    console.log('기업회원 비밀번호 찾기', businessType);
  };

  const resetPersonalAuthResult = () => {
    setPersonalAuthResult(null);
    resetNiceIdAuth();
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

    const authResult = await authenticate({ svcTypes: [authMethod] });
    if (authResult?.success) {
      setPersonalAuthResult({
        authMethod,
        resultKey: authResult.resultKey,
      });
      alert('본인 인증이 완료되었습니다.');
      return;
    }

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
                <button type="button" className="btn-tab" onClick={() => setMemberType('personal')}>
                  개인회원
                </button>
              </li>
              <li role="tab" aria-selected={isCompany} className={isCompany ? 'active' : ''}>
                <button type="button" className="btn-tab" onClick={() => setMemberType('company')}>
                  기업회원
                </button>
              </li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="find-account-visual" aria-hidden="true">
            <div className="visual-key">
              <span className="key-ring"></span>
              <span className="key-shape"></span>
              <span className="handle"></span>
            </div>
          </div>
          <div className="find-id-fields">
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
                      disabled={niceIdAuthLoading}
                    >
                      {niceIdAuthLoading ? '인증 중...' : '인증하기'}
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
                      disabled={niceIdAuthLoading}
                    >
                      {niceIdAuthLoading ? '인증 중...' : '인증하기'}
                    </button>
                  </div>
                </div>

                {personalAuthResult && (
                  <p className="auth-complete" role="status">
                    본인 인증이 완료되었습니다.
                  </p>
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
