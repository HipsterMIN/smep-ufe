import React from 'react';
import { buildBizlinkAuthUrl, buildCobizAuthUrl, buildMnaAuthUrl } from '@utils/keycloakGetAuthCode.js';

import { useAuthStore } from '@store/useAuthStore.jsx';

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
  onOnePassLogin,
  onOnePassConfig, 
  onOnePassJoin,
  onLogout,
  onMyPage,
  onSwitchContext,
}) {
  const handleCollaborationInfoSystemClick = () => {
    const url = buildCobizAuthUrl();
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBusinessSupportClick = () => {
    const url = buildBizlinkAuthUrl();
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMnaClick = () => {
    const url = buildMnaAuthUrl();
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const externalLinkButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--krds-header--navi-gap)',
    minHeight: 'var(--krds-header--navi-min-height)',
    padding: 'var(--krds-header--navi-padding)',
    border: 0,
    borderRadius: 'var(--krds-header--navi-border-radius)',
    backgroundColor: 'transparent',
    color: 'var(--krds-header--navi-color-text)',
    fontFamily: 'inherit',
    fontSize: 'var(--krds-header--navi-font-size-pc)',
    fontWeight: 'var(--krds-font-weight-bold)',
    lineHeight: 'inherit',
    transition: 'var(--krds-transition-base)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  const externalLinkButtons = (
    <>
      <button
        type="button"
        className="btn-navi none-icon on-mobile-none"
        onClick={handleCollaborationInfoSystemClick}
      >
        협업정보시스템
      </button>
      <button
        type="button"
        className="btn-navi none-icon on-mobile-none"
        onClick={handleBusinessSupportClick}
      >
        비즈니스지원단
      </button>
      <button
        type="button"
        className="btn-navi none-icon on-mobile-none"
        onClick={handleMnaClick}>
        M&amp;A
      </button>
    </>
  );

  if (isLogin) {
    const modeLabel = currentMode === 'CORPORATE' ? '기업' : '개인';
    const displayName =
      currentMode === 'CORPORATE'
        ? currentCompany?.companyName || '기업'
        : user?.name || currentCompany?.companyName || '사용자';

    const isSsoLogin = useAuthStore((state) => state.isSsoLogin);

    return (
      <>
        {/*externalLinkButtons*/}

        
        {!isSsoLogin ? (
        <button type="button" className="btn-navi onepass on-mobile-none" onClick={onOnePassLogin}>
          중기통합회원 로그인
        </button>
          ) : (
        <button type="button" className="btn-navi onepass on-mobile-none" onClick={onOnePassConfig}>
          중기통합회원 관리
        </button>
        )}


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

        <strong className="pc-only">{displayName}</strong>

        {showSessionTimer ? (
          <div className="gnb-sesseion-timer new">
            <div className="timer">
                <span className="sr-only">남은 시간</span>
                <i className="svg-icon ico-clock"></i> {sessionTimerLabel}</div>
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

        <button type="button" className="btn-navi mypage on-mobile-none" onClick={onMyPage}>
          마이페이지
        </button>

        <div className="top-noti" aria-hidden="true"><span>1</span></div>

      </>
    );
  }

  return (
    <>
      {/*externalLinkButtons*/}

      {/* 통합로그인은 로그인 상태와 무관하게 같은 진입점을 사용한다. */}
      <button type="button" className="btn-navi onepass on-mobile-none" onClick={onOnePassLogin}>
        중기통합회원 로그인
      </button>
      <button type="button" className="btn-navi login on-mobile-none" onClick={onLogin}>
        로그인
      </button>
      <button type="button" className="btn-navi join" onClick={onOnePassJoin}>
        회원가입
      </button>
    </>
  );
}
