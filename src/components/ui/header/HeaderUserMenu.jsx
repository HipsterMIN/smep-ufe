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
  const isSsoLogin = useAuthStore((state) => state.isSsoLogin);

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

    return (
      <>
        {/*externalLinkButtons*/}
        {isSsoLogin && (
          <button type="button" className="btn-navi onepass on-mobile-none" onClick={onOnePassConfig}>
              통합회원 관리
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
          <div className="gnb-sesseion-timer new pc-only">
            <div className="timer">
              <span className="sr-only">남은 시간</span>
              <i className="svg-icon ico-clock"></i> {sessionTimerLabel}
            </div>
            <button
              type="button"
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
          마이 비즈니스
        </button>
        <div className="top-noti" aria-hidden="true" style={{ display: 'none' }} ><span>1</span></div>
      </>
    );
  }

  return (
    <>
      {/*externalLinkButtons*/}

      {false && (
        // 왜 필요한지: 요구사항상 헤더에서는 중기 통합회원 로그인 버튼을 숨기지만, 재노출 가능성이 있어 기존 연결 코드를 완전히 제거하지 않는다.
        // 무엇을 하는지: 렌더 조건만 false로 막아 화면에는 보이지 않게 하고, 기존 onOnePassLogin 연결은 JSX 안에 그대로 보존한다.
        // 주의할 점: 이 버튼을 다시 노출해야 하면 false 조건만 제거하면 되며, SSO 시작 함수 자체는 Header.jsx에 남아 있다.
        <button type="button" className="btn-navi onepass on-mobile-none" onClick={onOnePassLogin}>
          중기 통합회원 로그인
        </button>
      )}
      <button type="button" className="btn-navi login on-mobile-none" onClick={onLogin}>
        로그인
      </button>
      <button type="button" className="btn-navi join" onClick={onOnePassJoin}>
        회원가입
      </button>
    </>
  );
}
