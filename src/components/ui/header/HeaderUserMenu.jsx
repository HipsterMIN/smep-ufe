import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserMenu } from '@context/UserMenuContext.jsx';

export default function HeaderUserMenu({ isLogin, companyProfile, onLogin, onLogout, onMyPage }) {
  const [isCompany, setIsCompany] = useState(false);
  const { getFullPath } = useUserMenu();
  const navigate = useNavigate();

  const handleClickAiSearch = () => {
    navigate(getFullPath('M_PIIO_00074'));
  };

  if (isLogin) {
    return (
      <>
        <div className="user-info-wrap" style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
          <span className="user-name" style={{ fontWeight: 'bold', marginRight: '4px' }}>
            {companyProfile?.company_name || '사용자'}
          </span>
          <span>님이 로그인 되었습니다.</span>
        </div>
        
        <div className="chip-wrap krds-tag-wrap large" style={{ marginRight: '12px' }}>
          <button
            type="button"
            className={`krds-btn-tag ${isCompany ? 'active' : ''}`}
            style={{
              backgroundColor: isCompany ? '#1c267b' : '#fff',
              color: isCompany ? '#fff' : '#000',
              border: '1px solid #ddd',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
            onClick={() => setIsCompany(!isCompany)}
          >
            {isCompany ? '기업회원 전환' : '개인회원 전환'}
          </button>
        </div>
{/*
        <button type="button" className="btn-navi sch" onClick={handleClickAiSearch}>
          AI 스마트검색
        </button>
        */}
        <button type="button" className="btn-navi logout" onClick={onLogout}>
          로그아웃
        </button>
        
        <div className="krds-drop-wrap my-drop">
          <button type="button" className="btn-navi my drop-btn active" onClick={onMyPage}>
            마이 비즈니스
          </button>
          {/* 드롭다운 메뉴 내용은 필요 시 추가 */}
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
