import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';

const FindIdResult = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const lgnId = state?.lgnId;

  const breadcrumbItems = [
    { label: '아이디 찾기 완료', link: '#' },
  ];

  return (
    <div className="contents">
      <Breadcrumb items={breadcrumbItems} />
      <div className="page-title-wrap" data-type="responsive">
        <h2 className="h-tit">아이디 찾기 완료</h2>
      </div>
      <div className="find-form-area find-result">
        <p>
                    회원님의 아이디는<br />
          <strong className="primary">{lgnId}</strong> 로 등록되어 있습니다.<br />
                    비밀번호가 기억나지 않으실 경우 <button type="button" className="krds-btn text primary" onClick={() => navigate('/service/find-password')}>[비밀번호 찾기]</button>에서 확인하시기 바랍니다.
        </p>
        <ul className="btn-group">
          <li>
            <button type="button" className="krds-btn large primary btn-confirm" onClick={() => navigate('/service/login')}>
                            로그인
            </button>
          </li>
          <li>
            <button type="button" className="krds-btn large secondary btn-cancel" onClick={() => navigate('/service/find-password')}>
                            비밀번호 찾기
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FindIdResult;