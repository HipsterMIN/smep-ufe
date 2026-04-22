import React from 'react';

export default function HeaderUserMenu({
  isLogin,
  currentMode,
  currentCompany,
  linkedCompanies,
  user,
  showSessionTimer,
  sessionTimerLabel,
  canExtendSession,
  isExtendingSession,
  onExtendSession,
  onLogin,
  onLogout,
  onMyPage,
  onSwitchContext,
}) {
  if (isLogin) {
    const modeLabel = currentMode === 'CORPORATE' ? '기업' : '개인';
    const displayName =
      currentMode === 'CORPORATE'
        ? currentCompany?.companyName || '기업'
        : user?.name || currentCompany?.companyName || '사용자';

    return (
      <>
        {/* <div className="user-info-wrap">
          <span className="user-name">
            {displayName}
          </span>
          <span>님 ({modeLabel})</span>
        </div> */}

        {/* <div className="chip-wrap krds-tag-wrap large on-mobile-none" style={{ marginRight: '12px' }}>
          {currentMode === 'INDIVIDUAL' && Array.isArray(linkedCompanies) && linkedCompanies.length > 0 ? (
            <select
              className="krds-form-select"
              style={{ minWidth: '180px' }}
              onChange={(e) => {
                const value = e.target.value;
                if (value && onSwitchContext) {
                  onSwitchContext(Number(value));
                }
              }}
            >
              <option value="">기업 전환</option>
              {linkedCompanies.map((company) => (
                <option key={company.companyId} value={company.companyId}>
                  {company.companyName}
                </option>
              ))}
            </select>
          ) : currentMode === 'CORPORATE' ? (
            <button
              type="button"
              className="krds-btn-tag"
              style={{
                backgroundColor: '#fff',
                color: '#000',
                border: '1px solid #ddd',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
              onClick={() => onSwitchContext && onSwitchContext(null)}
            >
              개인회원전환
            </button>
          ) : null}
        </div> */}

        <div className="krds-drop-wrap my-drop">
          <button type="button" className="btn-navi my drop-btn active" onClick={onMyPage}>
            마이 비즈니스
          </button>
        </div>

        {showSessionTimer ? (
          <div className="gnb-sesseion-timer">
            <div className="timer"><span className="sr-only">남은 시간</span><i className="svg-icon ico-clock"></i> {sessionTimerLabel}</div>
            <button
              type="button"
              className="krds-btn secondary xsmall"
              onClick={onExtendSession}
              disabled={!canExtendSession || isExtendingSession}
            >
              연장
            </button>
          </div>
        ) : null}

        <button type="button" className="btn-navi logout on-mobile-none" onClick={onLogout}>
          로그아웃
        </button>

      </>
    );
  }

  return (
    <>
      <button type="button" className="btn-navi login on-mobile-none" onClick={onLogin}>
        로그인
      </button>
      <button type="button" className="btn-navi join">
        회원가입
      </button>
    </>
  );
}
