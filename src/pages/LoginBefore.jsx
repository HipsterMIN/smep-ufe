import Breadcrumb from '../components/ui/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import loginHomeImg01 from '../assets/sub/login_home_img01.svg';
import loginHomeImg02 from '../assets/sub/login_home_img02.svg';
import { buildOnePassRegisterUrl, onePassGetAuthCode } from '../utils/keycloakGetAuthCode.js';

const LoginBefore = () => {
  const navigate = useNavigate();
  const breadcrumbItems = [
    { label: '로그인', link: '#' },
  ];

  const handleOnePassLogin = (event) => {
    event?.preventDefault();
    // 왜 필요한지: 새 진입 화면의 중기통합회원 로그인 버튼이 헤더에서 쓰던 SSO 시작 동작과 동일해야 사용자 동선이 갈라지지 않는다.
    // 무엇을 하는지: 기존 공통 유틸을 호출해 Q-Sign/중기원패스 인증 요청 URL로 현재 창을 이동시킨다.
    // 주의할 점: 퍼블리싱 HTML의 a 태그 구조를 유지하므로 기본 링크 동작은 막고, 인증 URL은 이 화면에서 별도 조립하지 않는다.
    onePassGetAuthCode();
  };

  const handleOnePassJoin = (event) => {
    event?.preventDefault();
    // 왜 필요한지: 새 진입 화면의 회원가입 버튼이 헤더 회원가입 버튼과 같은 외부 가입 화면을 바라봐야 한다.
    // 무엇을 하는지: 기존 회원가입 URL 빌더를 통해 개인 회원가입 진입 URL을 만들고 현재 창을 이동시킨다.
    // 주의할 점: 퍼블리싱 HTML의 a 태그 구조를 유지하므로 기본 링크 동작은 막고, type 값은 기존 헤더와 같은 'member'를 유지한다.
    window.location.href = buildOnePassRegisterUrl('member');
  };

  const handleServiceLogin = (event) => {
    event?.preventDefault();
    // 왜 필요한지: 일반 로그인 영역은 기존 ID/PW 로그인 화면으로 보내야 기존 로컬 로그인 기능을 변경하지 않는다.
    // 무엇을 하는지: 같은 SPA 라우터 안에서 기존 /service/login 화면으로 이동한다.
    // 주의할 점: 퍼블리싱 HTML의 a 태그 구조를 유지하므로 기본 링크 동작은 막고, 기업회원 state 진입 흐름은 기존대로 별도 유지된다.
    navigate('/service/login');
  };

  return (
    <div className="contents login-before-contents">
      <Breadcrumb items={breadcrumbItems} />
      <style>{`
        .login-before-contents .login-home-container {font-family: "pretendard", "Pretendard GOV", "Pretendard", sans-serif; max-width: 1472px; border-radius: clamp(18px, 2vw, 24px); background: #fff; box-shadow: 0 0 16px rgb(0 0 0 / 5%); margin: 0 auto; padding: clamp(30px, 7%, 100px) clamp(20px, 6%, 80px); display: flex; justify-content: space-between; gap: 5%; word-break: keep-all;}
        .login-before-contents .login-home-container .login-line {width: 1px; background: #999; height: 626px;}
        .login-before-contents .login-home-container .login-left-box, .login-before-contents .login-home-container .login-right-box {max-width: 500px; width: 100%; display: flex; align-items: center; flex-direction: column; gap: clamp(16px, 3vw, 30px); text-align: center;}
        .login-before-contents .login-home-container .login-img-box {margin: 0; width: clamp(80px, 27vw, 150px); aspect-ratio: 1 / 1; border-radius: 50%; background: #EDF3FC; display: flex; align-items: center; justify-content: center;}
        .login-before-contents .login-home-container .login-img-box img {vertical-align: bottom; width: 60%; height: 60%; object-fit: contain;}
        .login-before-contents .login-home-container .login-left-box .login-img-box img {max-height: 130px;}
        .login-before-contents .login-home-container .login-right-box .login-img-box img {max-width: 150px;}
        .login-before-contents .login-home-container .login-box-tit {font-size: clamp(24px, 3.5vw, 30px); color: #333;}
        .login-before-contents .login-home-container .login-box-tit .blue {color: #1446a2;}
        .login-before-contents .login-home-container .login-box-txt {color: #666; line-height: 1.3; font-size: clamp(14px, 2vw, 16px); font-weight: 600; margin: 0;}
        .login-before-contents .login-home-container .login-btn {border-radius: clamp(18px, 2vw, 24px); background: #176CF0; width: 100%; display: flex; align-items: center; justify-content: center; text-decoration: none; color: #fff; height: clamp(54px, 5.5vw, 70px); font-size: clamp(16px, 2.2vw, 20px); font-weight: 600; border: 1px solid #176CF0; box-sizing: border-box; gap: 16px;}
        .login-before-contents .login-home-container .login-btn.white {background: #fff; border-color: #103D90; color: #103D90;}

        @media screen and (max-width: 900px) {
          .login-before-contents .login-home-container {flex-direction: column; gap: clamp(30px, 9vw, 60px);}
          .login-before-contents .login-home-container .login-line {width: 100%; height: 1px;}
          .login-before-contents .login-home-container .login-left-box, .login-before-contents .login-home-container .login-right-box {max-width: none;}
        }
      `}</style>
      <div className="login-home-container">
        <div className="login-left-box">
          <figure className="login-img-box">
            <img src={loginHomeImg01} alt="" aria-hidden="true" />
          </figure>
          <strong className="login-box-tit">로그인하기</strong>
          <p className="login-box-txt">기존 중소벤처24 아이디를 통해 사업공고 •정책금융상품 <br />조회 및 증명서 발급 등 다양한 서비스를 이용해보세요</p>
          <a href="javascript:;" className="login-btn" onClick={handleServiceLogin}>
            <span>로그인 하기</span>
          </a>
        </div>
        <div className="login-line"></div>
        <div className="login-right-box">
          <figure className="login-img-box">
            <img src={loginHomeImg02} alt="" aria-hidden="true" />
          </figure>
          <strong className="login-box-tit"><span className="blue">중기통합회원</span> 로그인하기</strong>
          <p className="login-box-txt">통합회원 가입을 통해 한번의 로그인으로 창업•벤처•R&amp;D•자금•소상공인 등 <br />64개 유관시스템의 서비스를 편리하게 이용해보세요</p>
          <a href="javascript:;" className="login-btn" onClick={handleOnePassLogin}>
            <span>로그인 하기</span>
          </a>
          <a href="javascript:;" className="login-btn white" onClick={handleOnePassJoin}>
            <span>중기 통합회원 회원가입하기 </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginBefore;
