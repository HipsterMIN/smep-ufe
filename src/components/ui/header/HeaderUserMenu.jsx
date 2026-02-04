import React, { useState } from 'react';

const HeaderUserMenu = ({ isLogin, companyProfile, onLogin, onLogout, onMyPage }) => {
  const [isCompany, setIsCompany] = useState(false);

  if (!isLogin) {
    return (
      <>
        <a href="#" className="btn-navi login" onClick={(e) => { e.preventDefault(); onLogin(); }}>로그인</a>
        <button type="button" className="btn-navi join">회원가입</button>
      </>
    );
  }

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '8px',
      }}>{companyProfile?.cmpNm || ''}님이 로그인 되었습니다.
      </div>
      <div className="chip-wrap krds-tag-wrap large" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '8px',
      }}>
        <span
          className="krds-btn-tag"
          style={{ cursor: 'pointer',
            backgroundColor: !isCompany ? '#FFFFFF' : '#1c267b',
            color: !isCompany ? '#000000' : '#FFFFFF' }}
          onClick={() => setIsCompany(!isCompany)}
        >
          {!isCompany ? '개인회원 전환' : '기업회원 전환'}
        </span>
      </div>
      <button type="button" className="btn-navi logout" onClick={onLogout}>로그아웃</button>
      <div className="krds-drop-wrap my-drop">
        <button type="button" className="btn-navi my drop-btn active" onClick={onMyPage}>마이 비즈니스</button>
        <div className="drop-menu">
          <div className="drop-in">
            <div className="drop-top">
              <p className="my-name">{companyProfile?.cmpNm || '사용자'}님</p>
              <dl className="my-time">
                <dt>로그아웃까지 남은 시간</dt>
                <dd>
                  <span className="time">12:00</span>
                  <button type="button" className="krds-btn small text h-auto">시간 연장</button>
                </dd>
              </dl>
            </div>
            <ul className="drop-list">
              <li><a href="#" className="item-link">나의 GOV 홈<span className="sr-only"></span></a></li>
              <li><a href="#" className="item-link">나의 신청내역<span className="sr-only"></span></a></li>
              <li><a href="#" className="item-link">나의 생활정보<span className="sr-only"></span></a></li>
              <li><a href="#" className="item-link">나의 정보관리<span className="sr-only"></span></a></li>
            </ul>
            <div className="drop-bottom">
              <button type="button" className="krds-btn medium text" onClick={onLogout}>
                <i className="svg-icon ico-logout"></i> 로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderUserMenu;
