

// 관리자 - 상단 메뉴
export default function Header() {
  return (
    <>
    <div id="krds-skip-link">
      <a href="#breadcrumb">본문 바로가기</a>
    </div>
    { /*본문 바로가기 영역  */}
    <div id="krds-masthead">
      <div className="toggle-wrap">
        <div className="toggle-head">
          <div className="inner">
            <span className="nuri-txt">이 누리집은 대한민국 공식 전자정부 누리집입니다.</span>
          </div>
        </div>
      </div>
    </div>
    { /*헤더 영역 */}
    <header id="krds-header">
      { /*헤더 컨텐츠 영역  */}
      <div className="header-in">
        { /*헤더 상단 기타메뉴 */}
        <div className="header-container">
          <div className="inner">
            <div className="header-branding">
              <h2 className="logo sample">
                <a href="#">
                  <span className="sr-only">중소기업통합플랫폼</span>
                </a>
              </h2>
              <div className="header-actions">
                <button type="button" className="btn-navi sch open-modal" title="통합검색 레이어" data-target="popTotalSch">통합검색</button>
                <a href="#" className="btn-navi login">로그인</a>
                <button type="button" className="btn-navi join">회원가입</button>
                <div className="krds-drop-wrap my-drop">
                  <button type="button" className="btn-navi my drop-btn active">마이 비즈니스</button>
                  <div className="drop-menu" >
                    <div className="drop-in">
                      <div className="drop-top">
                        <p className="my-name">홍길동님</p>
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
                        <button type="button" className="krds-btn medium text">
                          <i className="svg-icon ico-logout"></i> 로그아웃
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-navi all" aria-controls="mobile-nav">전체메뉴</button>
              </div>
            </div>
          </div>
        </div>
        { /*헤더 상단 기타메뉴 */}

        { /*메인메뉴 : 데스크탑 */}
        <nav className="krds-main-menu">
          <div className="inner">
            <ul className="gnb-menu" aria-label="메인 메뉴">
              <li>
                <button type="button" className="gnb-main-trigger" data-trigger="gnb" aria-controls="gnb-main-menu-wsr36py" aria-expanded="false" aria-haspopup="true">민원</button>
                {/* gnb-toggle-wrap */}
                <div className="gnb-toggle-wrap" id="gnb-main-menu-wsr36py">
                  {/* gnb-main-list */}
                  <div className="gnb-main-list" data-has-submenu="true">
                    <ul>
                      <li>
                        <button type="button" className="gnb-sub-trigger active" data-trigger="gnb" aria-controls="gnb-sub-menu-a4g8zga" aria-expanded="true" aria-haspopup="true">2Depth</button>
                        {/* gnb-sub-list */}
                        <div className="gnb-sub-list active" id="gnb-sub-menu-a4g8zga">
                          <div className="gnb-sub-content">
                            <h2 className="sub-title">
                              2Depth title
                              <a href="#" className="krds-btn link basic small">
                                <span className="underline">바로가기</span>
                                <i className="svg-icon ico-angle right"></i>
                              </a>
                            </h2>
                            <ul>
                              <li><button type="button">Last depth</button></li>
                              <li><a href="#">Last depth</a></li>
                            </ul>
                          </div>
                          <div className="gnb-sub-banner">
                            <span className="krds-badge bg-secondary">신규 서비스</span>
                            <button type="button" className="krds-btn medium text">메뉴명 <i className="svg-icon ico-angle right"></i></button>
                          </div>
                        </div>
                        { /*gnb-sub-list */}
                      </li>
                      <li>
                        <button type="button" className="gnb-sub-trigger" data-trigger="gnb" aria-controls="gnb-sub-menu-xpk1jhs" aria-expanded="false" aria-haspopup="true">2Depth</button>
                        {/* gnb-sub-list */}
                        <div className="gnb-sub-list between" id="gnb-sub-menu-xpk1jhs">
                          <div className="gnb-sub-content">
                            <h2 className="sub-title"><span>2Depth title</span></h2>
                            <ul>
                              <li><button type="button">Last depth</button></li>
                              <li><a href="#">Last depth</a></li>
                            </ul>
                          </div>
                          <div className="gnb-sub-banner">
                            <span className="krds-badge bg-secondary">신규 서비스</span>
                            <button type="button" className="krds-btn medium text">메뉴명 <i className="svg-icon ico-angle right"></i></button>
                          </div>
                        </div>
                        { /*gnb-sub-list */}
                      </li>
                      <li>
                        <a href="#" className="gnb-sub-trigger is-link" data-trigger="gnb">2Depth</a>
                      </li>
                      <li>
                        <a href="#" className="gnb-sub-trigger is-link external-link" data-trigger="gnb" target="_blank" title="새 창 열림">2Depth</a>
                      </li>
                    </ul>
                  </div>
                  { /*gnb-main-list */}
                </div>
                { /*gnb-toggle-wrap */}
              </li>

              <li>
                <button type="button" className="gnb-main-trigger" data-trigger="gnb" aria-controls="gnb-main-menu-058ueee" aria-expanded="false" aria-haspopup="true">서비스신청</button>
                {/* gnb-toggle-wrap */}
                <div className="gnb-toggle-wrap" id="gnb-main-menu-058ueee">
                  {/* gnb-main-list */}
                  <div className="gnb-main-list" data-has-submenu="true">
                    <ul>
                      <li>
                        <button type="button" className="gnb-sub-trigger active" data-trigger="gnb" aria-controls="gnb-sub-menu-cdtgeol" aria-expanded="true" aria-haspopup="true">2Depth</button>
                        {/* gnb-sub-list */}
                        <div className="gnb-sub-list active" id="gnb-sub-menu-cdtgeol">
                          <div className="gnb-sub-content">
                            <h2 className="sub-title"><span>2Depth title</span></h2>
                            <ul className="type-description">
                              <li>
                                <h3 className="tit">
                                  <a href="#" target="_blank" title="새 창 열림">3Depth title <i className="svg-icon ico-go"></i></a>
                                </h3>
                                <p className="txt">메뉴명과 메뉴에 관한 간략한 설명이 표시되는 스타일입니다.</p>
                              </li>
                              <li>
                                <h3 className="tit">
                                  <a href="#" target="_blank" title="새 창 열림">3Depth title <i className="svg-icon ico-go"></i></a>
                                </h3>
                                <p className="txt">메뉴명과 메뉴에 관한 간략한 설명이 표시되는 스타일입니다.</p>
                              </li>
                              <li>
                                <h3 className="tit">
                                  <a href="#" target="_blank" title="새 창 열림">3Depth title <i className="svg-icon ico-go"></i></a>
                                </h3>
                                <p className="txt">메뉴명과 메뉴에 관한 간략한 설명이 표시되는 스타일입니다.</p>
                              </li>
                              <li>
                                <h3 className="tit">
                                  <a href="#" target="_blank" title="새 창 열림">3Depth title <i className="svg-icon ico-go"></i></a>
                                </h3>
                                <p className="txt">메뉴명과 메뉴에 관한 간략한 설명이 표시되는 스타일입니다.</p>
                              </li>
                            </ul>
                          </div>
                          <div className="gnb-sub-banner">
                            <span className="krds-badge bg-secondary">신규 서비스</span>
                            <button type="button" className="krds-btn medium text">메뉴명 <i className="svg-icon ico-angle right"></i></button>
                          </div>
                        </div>
                        { /*gnb-sub-list */}
                      </li>
                      <li>
                        <button type="button" className="gnb-sub-trigger" data-trigger="gnb" aria-controls="gnb-sub-menu-i4bbod7" aria-expanded="false" aria-haspopup="true">2Depth</button>
                        {/* gnb-sub-list */}
                        <div className="gnb-sub-list between" id="gnb-sub-menu-i4bbod7">
                          <div className="gnb-sub-content">
                            <h2 className="sub-title"><span>2Depth title</span></h2>
                            <ul className="type-description">
                              <li>
                                <h3 className="tit">
                                  <a href="#" target="_blank" title="새 창 열림">3Depth title <i className="svg-icon ico-go"></i></a>
                                </h3>
                                <p className="txt">메뉴명과 메뉴에 관한 간략한 설명이 표시되는 스타일입니다.</p>
                              </li>
                            </ul>
                          </div>
                          <div className="gnb-sub-banner">
                            <span className="krds-badge bg-secondary">신규 서비스</span>
                            <button type="button" className="krds-btn medium text">메뉴명 <i className="svg-icon ico-angle right"></i></button>
                          </div>
                        </div>
                        { /*gnb-sub-list */}
                      </li>
                      <li>
                        <a href="#" className="gnb-sub-trigger is-link" data-trigger="gnb">2Depth</a>
                      </li>
                      <li>
                        <a href="#" className="gnb-sub-trigger is-link external-link" data-trigger="gnb" target="_blank" title="새 창 열림">2Depth</a>
                      </li>
                    </ul>
                  </div>
                  { /*gnb-main-list */}
                </div>
                { /*gnb-toggle-wrap */}
              </li>

              <li>
                <button type="button" className="gnb-main-trigger" data-trigger="gnb" aria-controls="gnb-main-menu-as97fut" aria-expanded="false" aria-haspopup="true">정책정보</button>
                {/* gnb-toggle-wrap */}
                <div className="gnb-toggle-wrap" id="gnb-main-menu-as97fut">
                  {/* gnb-main-list */}
                  <div className="gnb-main-list">
                    {/* gnb-sub-list */}
                    <div className="gnb-sub-list single-list between">
                      <div className="gnb-sub-content">
                        <h2 className="sub-title"><span>2Depth title</span></h2>
                        <ul>
                          <li><a href="#">Last depth</a></li>
                          <li><a href="#">Last depth</a></li>
                          <li><a href="#">Last depth</a></li>
                          <li><a href="#">Last depth</a></li>
                          <li><a href="#">Last depth</a></li>
                          <li><a href="#">Last depth</a></li>
                          <li><a href="#">Last depth</a></li>
                          <li><a href="#">Last depth</a></li>
                          <li><a href="#">Last depth</a></li>
                          <li><a href="#">Last depth</a></li>
                        </ul>
                      </div>
                      <div className="gnb-sub-banner">
                        <span className="krds-badge bg-secondary">신규 서비스</span>
                        <button type="button" className="krds-btn medium text">메뉴명 <i className="svg-icon ico-angle right"></i></button>
                      </div>
                    </div>
                    { /*gnb-sub-list */}
                  </div>
                  { /*gnb-main-list */}
                </div>
                { /*gnb-toggle-wrap */}
              </li>

              <li>
                <button type="button" className="gnb-main-trigger" data-trigger="gnb" aria-controls="gnb-main-menu-1d42y0p" aria-expanded="false" aria-haspopup="true">기관소개</button>
                {/* gnb-toggle-wrap */}
                <div className="gnb-toggle-wrap" id="gnb-main-menu-1d42y0p">
                  {/* gnb-main-list */}
                  <div className="gnb-main-list" data-has-submenu="true">
                    <ul>
                      <li>
                        <button type="button" className="gnb-sub-trigger active" data-trigger="gnb" aria-controls="gnb-sub-menu-w6p6mp5" aria-expanded="true" aria-haspopup="true">2Depth</button>
                        {/* gnb-sub-list */}
                        <div className="gnb-sub-list active" id="gnb-sub-menu-w6p6mp5">
                          <div className="gnb-sub-content">
                            <h2 className="sub-title"><span>2Depth title</span></h2>
                            <ul className="type-description">
                              <li>
                                <h3 className="tit">
                                  <a href="#" target="_blank" title="새 창 열림">3Depth title <i className="svg-icon ico-go"></i></a>
                                </h3>
                                <p className="txt">메뉴명과 메뉴에 관한 간략한 설명이 표시되는 스타일입니다.</p>
                              </li>
                            </ul>
                          </div>
                        </div>
                        { /*gnb-sub-list */}
                      </li>
                      <li>
                        <button type="button" className="gnb-sub-trigger" data-trigger="gnb" aria-controls="gnb-sub-menu-z4uuajr" aria-expanded="false" aria-haspopup="true">2Depth</button>
                        {/* gnb-sub-list */}
                        <div className="gnb-sub-list" id="gnb-sub-menu-z4uuajr">
                          <div className="gnb-sub-content">
                            <h2 className="sub-title"><span>2Depth title</span></h2>
                            <ul>
                              <li><a href="#">Last depth</a></li>
                            </ul>
                          </div>
                        </div>
                        { /*gnb-sub-list */}
                      </li>
                      <li>
                        <a href="#" className="gnb-sub-trigger is-link" data-trigger="gnb">2Depth</a>
                      </li>
                      <li>
                        <a href="#" className="gnb-sub-trigger is-link external-link" data-trigger="gnb" target="_blank" title="새 창 열림">2Depth</a>
                      </li>
                    </ul>
                  </div>
                  { /*gnb-main-list */}
                </div>
                { /*gnb-toggle-wrap */}
              </li>

              <li>
                <button type="button" className="gnb-main-trigger" data-trigger="gnb" aria-controls="gnb-main-menu-0p4oyca" aria-expanded="false" aria-haspopup="true">고객센터</button>
                {/* gnb-toggle-wrap */}
                <div className="gnb-toggle-wrap" id="gnb-main-menu-0p4oyca">
                  {/* gnb-main-list */}
                  <div className="gnb-main-list" data-has-submenu="true">
                    <ul>
                      <li>
                        <button type="button" className="gnb-sub-trigger active" data-trigger="gnb" aria-controls="gnb-sub-menu-bo57h39" aria-expanded="true" aria-haspopup="true">2Depth</button>
                        {/* gnb-sub-list */}
                        <div className="gnb-sub-list active" id="gnb-sub-menu-bo57h39">
                          <div className="gnb-sub-content">
                            <h2 className="sub-title"><span>2Depth title</span></h2>
                            <ul>
                              <li><a href="#">Last depth</a></li>
                            </ul>
                          </div>
                          <div className="gnb-sub-banner">
                            <span className="krds-badge bg-secondary">신규 서비스</span>
                            <button type="button" className="krds-btn medium text">메뉴명 <i className="svg-icon ico-angle right"></i></button>
                          </div>
                        </div>
                        { /*gnb-sub-list */}
                      </li>
                      <li>
                        <a href="#" className="gnb-sub-trigger is-link" data-trigger="gnb">2Depth</a>
                      </li>
                      <li>
                        <a href="#" className="gnb-sub-trigger is-link" data-trigger="gnb">2Depth</a>
                      </li>
                      <li>
                        <a href="#" className="gnb-sub-trigger is-link external-link" data-trigger="gnb" target="_blank" title="새 창 열림">2Depth</a>
                      </li>
                    </ul>
                  </div>
                  { /*gnb-main-list */}
                </div>
                { /*gnb-toggle-wrap */}
              </li>
            </ul>
          </div>
        </nav>

        { /*메인메뉴 : 데스크탑 */}
      </div>
      { /*헤더 컨텐츠 영역  */}

      { /*메인메뉴 : 모바일 */}
      <div id="mobile-nav" className="krds-main-menu-mobile" >
        <div className="gnb-wrap">
          {/* gnb-header */}
          <div className="gnb-header">
            {/* gnb-utils */}
            <div className="gnb-utils">
              <ul className="utility-list">
                <li>
                  <div className="krds-drop-wrap">
                    <button type="button" className="krds-btn small text drop-btn" aria-expanded="false">
                      지원 <i className="svg-icon ico-toggle"></i>
                    </button>
                    <div className="drop-menu" >
                      <div className="drop-in">
                        <ul className="drop-list">
                          <li><a href="#" className="item-link">인증센터<span className="sr-only"></span></a></li>
                          <li><a href="#" className="item-link">누리집안내지도<span className="sr-only"></span></a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
                <li>

                  { /*언어설정: 언어전환 */}
                  <div className="krds-drop-wrap krds-language">
                    <button type="button" className="krds-btn small text drop-btn" aria-expanded="false">
                      <i className="svg-icon ico-global"></i>
                      Language
                      <i className="svg-icon ico-toggle"></i>
                    </button>
                    <div className="drop-menu" >
                      <div className="drop-in">
                        <ul className="drop-list">
                          <li><a href="#" className="item-link active" lang="ko">한국어<span className="sr-only">선택됨</span></a></li>
                          <li><a href="#" className="item-link" lang="en">English (영어)<span className="sr-only"></span></a></li>
                          <li><a href="#" className="item-link" lang="zh">中文 (중국어)<span className="sr-only"></span></a></li>
                          <li><a href="#" className="item-link" lang="ja">日本語 (일본어)<span className="sr-only"></span></a></li>
                          <li><a href="#" className="item-link" lang="fr">français (프랑스어)<span className="sr-only"></span></a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  {/* 언어설정: 언어전환 */}

                </li>
              </ul>
            </div>
            { /*gnb-utils */}
            {/* gnb-login */}
            <div className="gnb-login">
              <span className="user">홍길동님</span>
                <button type="button" className="krds-btn large text"><i className="svg-icon ico-logout"></i> 로그아웃</button>
              <button type="button" className="krds-btn large text"><i className="svg-icon ico-log"></i> 로그인을 해주세요</button>
            </div>
            { /*gnb-login */}
            {/* gnb-service-menu */}
            <div className="gnb-service-menu">
              <a href="#" className="link">메뉴명</a>
              <a href="#" className="link">메뉴명</a>
              <a href="#" className="link">메뉴명</a>
              <a href="#" className="link">메뉴명</a>
            </div>
            {/* gnb-service-menu */}
            {/* 검색 */}
            <div className="sch-input">
              <input type="text" className="krds-input" placeholder="찾고자 하는 메뉴명을 입력해 주세요" title="찾고자 하는 메뉴명 입력"></input>
              <button type="button" className="krds-btn medium icon ico-search">
                <span className="sr-only">검색</span>
                <i className="svg-icon ico-sch"></i>
              </button>
            </div>
            { /*검색 */}
          </div>
          { /*gnb-header */}

          {/* gnb-body */}
          <div className="gnb-body">
            {/* gnb-menu */}
            <div className="gnb-menu">
              <div className="menu-wrap">
                <ul role="tablist">
                  <li role="none">
                    <a href="#mGnb-anchor1" className="gnb-main-trigger active" >신청·발급</a>
                  </li>
                  <li role="none">
                    <a href="#mGnb-anchor2" className="gnb-main-trigger" >정책정보</a>
                  </li>
                  <li role="none">
                    <a href="#mGnb-anchor3" className="gnb-main-trigger" >데이터 개방</a>
                  </li>
                  <li role="none">
                    <a href="#mGnb-anchor4" className="gnb-main-trigger" >고객지원</a>
                  </li>
                </ul>
              </div>
              <div className="submenu-wrap">
                <div className="gnb-sub-list" id="mGnb-anchor1" role="tabpanel" aria-labelledby="tab-0">
                  <h2 className="sub-title">MyGOV</h2>
                  <ul>
                    <li><a href="#" className="gnb-sub-trigger">MyGOV 홈</a></li>
                    <li><a href="#" className="gnb-sub-trigger">나의 신청내역</a></li>
                    <li><a href="#" className="gnb-sub-trigger">나의 생활정보</a></li>
                    <li><a href="#" className="gnb-sub-trigger">나의 정보관리</a></li>
                  </ul>
                </div>
                <div className="gnb-sub-list" id="mGnb-anchor2" role="tabpanel" aria-labelledby="tab-1">
                  <h2 className="sub-title">민원서비스</h2>
                  <ul>
                    <li><a href="#" className="gnb-sub-trigger">민원 신청·안내</a></li>
                    <li><a href="#" className="gnb-sub-trigger">사실/진위 확인</a></li>
                    <li><a href="#" className="gnb-sub-trigger">원스톱 서비스</a></li>
                    <li><a href="#" className="gnb-sub-trigger">분야별 서비스</a></li>
                    <li><a href="#" className="gnb-sub-trigger">기업/단체 서비스</a></li>
                    <li><a href="#" className="gnb-sub-trigger">돌봄시설 등 위치 찾기</a></li>
                  </ul>
                </div>
                <div className="gnb-sub-list" id="mGnb-anchor3" role="tabpanel" aria-labelledby="tab-2">
                  <h2 className="sub-title">보조금24</h2>
                  <ul>
                    <li><a href="#" className="gnb-sub-trigger">보조금24 홈</a></li>
                    <li><a href="#" className="gnb-sub-trigger">나의 혜택</a></li>
                    <li><a href="#" className="gnb-sub-trigger">간편 찾기</a></li>
                    <li><a href="#" className="gnb-sub-trigger">전체 혜택</a></li>
                    <li>
                      <a href="#" className="gnb-sub-trigger has-depth3" aria-expanded="false">보조금24란</a>
                      <div className="depth3-wrap">
                        <ul>
                          <li>
                            <a href="#" className="depth3-trigger has-depth4">소개(4depth)</a>
                            <div className="depth4-wrap">
                              <div className="depth4-head">
                                <button type="button" className="krds-btn icon trigger-prev">
                                  <span className="sr-only">이전화면</span>
                                  <i className="svg-icon ico-angle left"></i>
                                </button>
                                <button type="button" className="krds-btn icon trigger-close">
                                  <span className="sr-only">전체메뉴 닫기</span>
                                  <i className="svg-icon ico-popup-close"></i>
                                </button>
                              </div>
                              <ul className="depth4-body">
                                <h4 className="sub-title">4depth title</h4>
                                <ul className="depth4-ul">
                                  <li><a href="#">depth title</a></li>
                                  <li><a href="#">depth title</a></li>
                                  <li><a href="#">depth title</a></li>
                                  <li><a href="#">depth title</a></li>
                                </ul>
                              </ul>
                            </div>
                          </li>
                          <li><a href="#" className="depth3-trigger">이용안내</a></li>
                          <li><a href="#" className="depth3-trigger">자주묻는 질문</a></li>
                        </ul>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="gnb-sub-list" id="mGnb-anchor4" role="tabpanel" aria-labelledby="tab-3">
                  <h2 className="sub-title">정책정보</h2>
                  <ul>
                    <li><a href="#" className="gnb-sub-trigger">분야별 정책정보</a></li>
                    <li><a href="#" className="gnb-sub-trigger">정부/지자체 조직도</a></li>
                    <li><a href="#" className="gnb-sub-trigger">정부/지자체 누리집</a></li>
                    <li><a href="#" className="gnb-sub-trigger">지자체 소식</a></li>
                    <li><a href="#" className="gnb-sub-trigger">공모전</a></li>
                    <li><a href="#" className="gnb-sub-trigger">공공자원공유</a></li>
                    <li><a href="#" className="gnb-sub-trigger">국고보조금 부정수급 신고</a></li>
                  </ul>
                </div>
                <div className="gnb-sub-list" id="mGnb-anchor5" role="tabpanel" aria-labelledby="tab-4">
                  <h2 className="sub-title">고객센터</h2>
                  <ul>
                    <li><a href="#" className="gnb-sub-trigger">공지사항</a></li>
                    <li><a href="#" className="gnb-sub-trigger">이용안내</a></li>
                    <li><a href="#" className="gnb-sub-trigger">자주 묻는 질문(FAQ)</a></li>
                    <li><a href="#" className="gnb-sub-trigger">자료실</a></li>
                    <li><a href="#" className="gnb-sub-trigger">상담 예약</a></li>
                    <li><a href="#" className="gnb-sub-trigger">개선 의견</a></li>
                  </ul>
                </div>
              </div>
            </div>
            { /*gnb-menu */}
            {/* gnb-bottom */}
            <div className="gnb-bottom">
              <a href="#" className="krds-btn small text">인증 센터 <i className="svg-icon ico-angle right"></i></a>
              <a href="#" className="krds-btn small text" target="_blank" title="새 창 열기"> 어린이 정부포털 <i className="svg-icon ico-go"></i></a>
            </div>
            { /*gnb-bottom */}
          </div>
          { /*gnb-body */}

          {/* gnb-close */}
          <button type="button" className="krds-btn medium icon" id="close-nav">
            <span className="sr-only">전체메뉴 닫기</span>
            <i className="svg-icon ico-popup-close"></i>
          </button>
          { /*gnb-close */}
        </div>
      </div>

      { /*메인메뉴 : 모바일 */}
    </header>
    </>
  );
}
