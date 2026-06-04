import { useNavigate } from 'react-router-dom';

// 관리자 - 상단 메뉴
export default function Footer() {
  const navigate = useNavigate();

  return (
    <>
      <footer id="krds-footer">
        <div className="foot-quick">
          <div className="inner">
            <button
              type="button"
              className="link open-modal"
              title="개인정보처리방침 레이어"
              data-target="popFootLink"
              onClick={() => {
                window.open('https://www.tipa.or.kr/s0801', '_blank', 'noopener,noreferrer');
              }}
            >
              개인정보처리방침
            </button>
            {/*<button
              type="button"
              className="link open-modal"
              title="이메일주소 무단수집거부안내 레이어"
              data-target="popFootLink"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => {
                navigate('/emailRejection');
              }}
            >
              이메일주소 무단수집거부안내
            </button>
            <button
              type="button"
              className="link open-modal"
              title="저작권 정책 레이어"
              data-target="popFootLink"
              onClick={() => {
                navigate('/copyrightPolicy');
              }}
            >
              저작권 정책
            </button>
            <button
              type="button"
              className="link open-modal"
              title="웹접근성 정책 레이어"
              data-target="popFootLink"
              onClick={() => {
                navigate('/webAccessibilityPolicy');
              }}
            >
              웹접근성 정책
            </button>*/}
            <button
              type="button"
              className="link open-modal"
              title="이용약관 레이어"
              data-target="popFootLink"
              onClick={() => {
                navigate('/termsOfUse');
              }}
            >
              이용약관
            </button>
          </div>
        </div>
        <div className="inner">
            <div className="footer-top">
                <div className="f-logo sample">
                    <span className="sr-only">중소벤처24</span>
                </div>
                <div className="footer-sns-list">
                    <ul>
                        <li>
                            <a
                            href="https://www.instagram.com/mss.go.kr"
                            className="footer-sns-item instagram"
                            aria-label="인스타그램 새창 열림"
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                                <span className="svg-icon sns instagram"></span>
                            </a>
                        </li>
                        <li>
                            <a
                            href="https://www.facebook.com/mss1357"
                            className="footer-sns-item facebook"
                            aria-label="페이스북 새창 열림"
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                            <span className="svg-icon sns facebook"></span>
                            </a>
                        </li>
                        <li>
                            <a
                            href="https://x.com/bizinfo1357"
                            className="footer-sns-item x"
                            aria-label="X 새창 열림"
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                            <span className="svg-icon sns x">𝕏</span>
                            </a>
                        </li>
                        <li>
                            <a
                            href="https://www.youtube.com/bizinfo1357"
                            className="footer-sns-item youtube"
                            aria-label="유튜브 새창 열림"
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                            <span className="svg-icon sns youtube"></span>
                            </a>
                        </li>
                        <li>
                            <a
                            href="https://blog.naver.com/bizinfo1357"
                            className="footer-sns-item blog"
                            aria-label="블로그 새창 열림"
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                            <span className="svg-icon sns blog"></span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="f-cnt">
                <div className="f-info">
                    {/*<p className="info-addr">30121, 세종특별자치시 가름로 180(어진동), 세종파이낸스센터3차 4층~6층</p>*/}
                    <ul className="info-cs">
                        <li>
                            <strong className="key-info">중소벤처24 시스템 장애 문의 <span>(044) 300-0990, (044) 300-0991</span></strong>
                            <strong className="more-info">메일문의 <span>smeshelp@tipa.or.kr</span></strong>
                        </li>
                        <li>
                            <strong className="key-info">중소벤처기업부 <span>30121, 세종특별자치시 가름로 180(어진동), 세종파이낸스센터3차 4층~6층</span></strong>대표전화 국번없이 1357
                            <strong className="more-info">대표전화 <span>국번없이 1357</span></strong>
                        </li>
                        <li>
                            <strong className="key-info">[운영기관] 중소기업기술정보진흥원 <span>(30141, 세종특별자치시 집현중앙로 79, 중소기업기술정보진흥원(TIPA))</span></strong>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="f-btm">
                <div className="f-btm-text">
                    <p className="f-copy">copyright ⓒ 중소벤처기업부. All rights reserved.</p>
                </div>
            </div>
        </div>
      </footer>
    </>
  );
}
