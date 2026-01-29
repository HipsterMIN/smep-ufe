import Breadcrumb from '../components/ui/Breadcrumb';
import React, { useState } from 'react';
import { api as apiClient } from '../lib/apiClient.js';
import { useAuthStore } from '../store/useAuthStore.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { getCompanyProfileByBizNo } from '../lib/companyProfiles.js';


const UI_USR_R_002 = () => {
  const { login } = useAuthStore();
  const [lgnId, setLgnId] = useState('test01');

  const navigate = useNavigate();
  const breadcrumbItems = [
    { label: '로그인', link: '#' },
  ];

  // 로그인아이디 변경
  const lgnIdChange = (e) => {
    setLgnId(e.target.value);
  };

  const handleClick = async () => {
    try {
      let brno = '';

      if (lgnId === '01') {
        brno = '0000000001';
      } else if (lgnId === '02') {
        brno = '0000000002';
      } else if (lgnId === '03') {
        brno = '0000000003';
      } else if (lgnId === '04') {
        brno = '0000000004';
      } else if (lgnId === '05') {
        brno = '0000000005';
      } else if (lgnId === '06'){
        brno = '2288105280';
      } else if (lgnId === '07'){
        brno = '6058189115';
      } else if (lgnId === '08'){
        brno = '3078130710';
      }

      let body = {
        'brno': brno,
      };

      const response = await apiClient.post('/api/v1/account/scenario-login', body);
      //const companyProfile = getCompanyProfileByBizNo(brno);
      const companyProfile = response.data;

      // 로그인 처리
      login(brno, response.cmpNm, response.companySize, companyProfile);

      // ✅ 부모 창에 메시지 전송
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'LOGIN_SUCCESS',
            data: {
              brno,
              cmpNm: response.cmpNm,
              companySize: response.companySize,
            },
          },
          window.location.origin, // 보안: 같은 출처만 허용
        );

        // 새 창 닫기
        window.close();
      } else {
        // 새 창이 아닌 경우 (테스트 등)
        navigate('/');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      // 에러 처리
    }
  };

  return (
    <>
      <div className="contents">
        <div className="page-title-wrap" data-type="responsive" style={{ marginTop: '50px' }}>
          <h2 className="h-tit" style={{ textAlign: 'center' }}>통합 로그인</h2>
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
                    {/*<div className="form-conts">*/}
                    {/*  <input type="text" id="lgnId" className="krds-input" autoComplete="on" placeholder="아이디를 입력하세요"/>*/}
                    {/*</div>*/}
                    <select
                      className="krds-form-select"
                      id="login_id"
                      value={lgnId}
                      onChange={lgnIdChange}
                    >
                      <option value="01">그린푸드 영농조합법인</option>
                      <option value="02">테크스타트 주식회사</option>
                      <option value="03">스마트팩토리 주식회사</option>
                      <option value="04">실버케어 협동조합</option>
                      <option value="05">기쁨푸드</option>
                      <option value="06">유큐브</option>
                      <option value="07">유림이엔씨</option>
                      <option value="08">한국바이오켐제약</option>
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
  )
  ;
};

export default UI_USR_R_002;
