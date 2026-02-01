import Breadcrumb from '../components/ui/Breadcrumb';
import React, { useState } from 'react';
import { api as apiClient } from '../lib/apiClient.js';
import { useAuthStore } from '../store/useAuthStore.jsx';
import { useNavigate, Link } from 'react-router-dom';

// 테스트 계정 정보 상수화
const TEST_ACCOUNTS = {
  test01: { brno: '2288105280', name: '유큐브' },
  test02: { brno: '6058189115', name: '유림이엔씨' },
  test03: { brno: '3078130710', name: '한국바이오켐제약' },
};

const UI_USR_R_002 = () => {
  const { login } = useAuthStore();
  const [lgnId, setLgnId] = useState('test01');
  const navigate = useNavigate();
  
  const breadcrumbItems = [
    { label: '로그인', link: '#' },
  ];

  const lgnIdChange = (e) => {
    setLgnId(e.target.value);
  };

  const handleClick = async () => {
    const account = TEST_ACCOUNTS[lgnId];
    if (!account) {
      alert('유효하지 않은 계정입니다.');
      return;
    }

    try {
      const body = { brno: account.brno };
      
      // apiClient는 fetch 기반이며, JSON 응답 본문을 그대로 반환함
      // 따라서 profileData는 { cmpNm: "...", ... } 형태의 객체임
      const profileData = await apiClient.post('/api/v1/account/scenario-login', body);
      
      console.log('Login Response:', profileData); // 디버깅용 로그

      // 응답 데이터 검증 (필수 필드 확인)
      if (!profileData || !profileData.cmpNm) {
        console.warn('Invalid login response structure:', profileData);
        // 필요 시 에러 처리 또는 폴백 로직 추가
      }
      
      // 로그인 상태 업데이트
      // profileData 자체가 companyProfile이 됨
      login(account.brno, profileData.cmpNm, profileData.companySize, profileData);

      // 메인 페이지로 이동
      navigate('/'); 
    } catch (error) {
      console.error('Login failed:', error);
      alert('로그인에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <>
      <div className="contents">
        <Breadcrumb items={breadcrumbItems}/>
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">로그인 방식을 선택해주세요.</h2>
        </div>

        <div className="login-contents">
          <div className="login-form-area">
            <div className="login-wrap">
              <fieldset>
                <legend>로그인 폼</legend>
                <div className="fieldset">
                  <div className="form-group">
                    <div className="form-tit">
                      <label htmlFor="login_id">아이디</label>
                    </div>
                    <select
                      className="krds-form-select"
                      id="login_id"
                      value={lgnId}
                      onChange={lgnIdChange}
                    >
                      {Object.entries(TEST_ACCOUNTS).map(([id, info]) => (
                        <option key={id} value={id}>{info.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <div className="form-tit">
                      <label htmlFor="login_pw">비밀번호</label>
                    </div>
                    <div className="form-conts btn-ico-wrap">
                      <input type="password" id="login_pw" className="krds-input" placeholder="비밀번호를 입력하세요"/>
                    </div>
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
                      <li><Link to="#" className="krds-btn medium text">회원가입</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="sns-login">
                  <div className="login-sub-tit">SNS 로그인</div>
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
                </div>
              </fieldset>
            </div>

            <div className="other-login-methods">
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
            </div>
          </div>


          <div className="helper-box refer blue">
            <p className="helper-tit has-icon">로그인에 어려움이 있으신가요?</p>
            <div className="helper-desc-wrap">
              <ul className="krds-info-list decimal" role="list">
                <li role="listitem">
                    로그인 <a href="#" className="krds-btn medium link"><span className="underline">관련 도움말</span></a>이나
                    다른 사용자가 <a href="#" className="krds-btn medium link"><span className="underline">자주 찾는 질문</span></a>을
                    확인해보세요.
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
