

// 관리자 - 상단 메뉴
export default function Header() {
  return (
    <>
    <footer id="krds-footer">

      { /*foot-quick */}
      <div className="foot-quick">
        <div className="inner">
          <button type="button" className="link open-modal" title="개인정보처리방침 레이어" data-target="popFootLink">개인정보처리방침
          </button>
          <button type="button" className="link open-modal" title="이메일주소 무단수집거부안내 레이어" data-target="popFootLink">이메일주소 무단수집거부안내
          </button>
          <button type="button" className="link open-modal" title="저작권 정책 레이어" data-target="popFootLink">저작권 정책</button>
          <button type="button" className="link open-modal" title="웹접근성 정책 레이어" data-target="popFootLink">웹접근성 정책
          </button>
          <button type="button" className="link open-modal" title="이용약관 레이어" data-target="popFootLink">이용약관
          </button>
        </div>
      </div>
      { /*foot-quick */}
      { /*inner */}
      <div className="inner">
        <div className="f-logo sample">
          <span className="sr-only">중소기업통합플랫폼</span>
        </div>
        <div className="f-cnt">
          <div className="f-info">
            <p className="info-addr">30121, 세종특별자치시 가름로 180(어진동), 세종파이낸스센터3차 4층~6층</p>
            <ul className="info-cs">
              <li>
                <strong className="key-info">중소기업통합플랫폼 시스템 장애 문의 <span>(044) 300-0990, (044) 300-0991</span></strong>
                <strong className="more-info">메일문의 <span>smeshelp@tipa.or.kr</span></strong>
              </li>
              <li>
                <strong className="key-info">중소벤처기업부 <span>대표전화  국번없이 1357</span></strong>
              </li>
              <li>
                <strong className="key-info">[운영기관] 중소기업기술정보진흥원 <span>(30141, 세종특별자치시 집현중앙로 79, 중소기업기술정보진흥원(TIPA)</span></strong>
              </li>
            </ul>
          </div>
        </div>

        <div className="f-btm">
          <div className="f-btm-text">
           {/* <div className="f-menu">
              <a href="#" className="krds-btn small text">개인정보처리방침</a>
              <a href="#" className="krds-btn small text">이용약관</a>
              <a href="#" className="krds-btn small text">보안센터</a>
              <a href="#" className="krds-btn small text">웹 접근성 품질인증 마크 획득</a>
              <a href="#" className="krds-btn small text">정책명</a>
            </div>*/}
            <p className="f-copy">copyright ⓒ 중소벤처기업부. All rights reserved.</p>
          </div>
        </div>
      </div>
      { /*inner */}
    </footer>
    { /*푸터 영역 */}
    </>
  );
}
