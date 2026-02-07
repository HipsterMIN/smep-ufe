import React from 'react';

export default function HeaderUserMenu({
  isLogin,
  currentMode,
  currentCompany,
  linkedCompanies,
  user,
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
        <div className="user-info-wrap" style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
          <span className="user-name" style={{ fontWeight: 'bold', marginRight: '4px' }}>
            {displayName}
          </span>
          <span>님 ({modeLabel})</span>
        </div>

        <div className="chip-wrap krds-tag-wrap large" style={{ marginRight: '12px' }}>
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
        </div>

        <button type="button" className="btn-navi logout" onClick={onLogout}>
          로그아웃
        </button>

        <div className="krds-drop-wrap my-drop">
          <button type="button" className="btn-navi my drop-btn active" onClick={onMyPage}>
            마이 비즈니스
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <button type="button" className="btn-navi login" onClick={onLogin}>
        로그인
      </button>
      <button type="button" className="btn-navi join">
        회원가입
      </button>
    </>
  );
}
