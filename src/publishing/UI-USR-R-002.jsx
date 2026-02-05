import {  Link } from "react-router-dom";
import Breadcrumb from "../components/ui/Breadcrumb";
import CON_UI_USR_R_002 from "../assets/common/CON_UI_USR_R_002.png";

const UI_USR_R_002 = () => {
  const breadcrumbItems = [
    { label: "로그인", link: "#" },
  ];

  return (
    <>
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
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
                      <div className="form-conts">
                        <input type="text" id="login_id" className="krds-input" autocomplete="on" placeholder="아이디를 입력하세요" />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="form-tit">
                        <label htmlFor="login_pw">비밀번호</label>
                      </div>
                      <div className="form-conts btn-ico-wrap">
                        <input type="password" id="login_pw" className="krds-input" placeholder="비밀번호를 입력하세요" />
                      </div>
                    </div>
                    <div className="form-group krds-check-area">
                      <div className="krds-form-check">
                        <input type="checkbox" name="save_id" id="save_id" />
                        <label htmlFor="save_id">아이디 저장</label>
                      </div>
                    </div>
                    <div className="form-group">
                      <button type="submit" className="krds-btn large primary">로그인</button>
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
                    <div className="login-sub-tit"><span>SNS 로그인</span></div>
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
                    다른 사용자가 <a href="#" className="krds-btn medium link"><span className="underline">자주 찾는 질문</span></a>을 확인해보세요.
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
