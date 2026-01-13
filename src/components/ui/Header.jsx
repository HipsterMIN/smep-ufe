import React, { useState } from "react";
import aiText from "../../assets/main/icon-aiText.png";
import aiIcon from "../../assets/main/icon-ai.png";
import arrowIcon from "../../assets/main/icon-arrow.svg";
import {useAuthStore} from "./useAuthStore.jsx";
import { ProgramChatProvider } from "@cube-i-ax/sdk/smes/program";
import { FloatingChatbot } from "../ai/FloatingChatbot.jsx";


// 관리자 - 상단 메뉴
export default function Header() {
  const [openIndex, setOpenIndex] = useState(null);
  const { isLogin, login, logout, bizno } = useAuthStore();

  const menuItems = [
    { id: 1, label: "메뉴1" },
    { id: 2, label: "메뉴2" },
    { id: 3, label: "메뉴3" },
  ];
  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  console.log("BIZNO ::: " + bizno);

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
                <a href="/">
                  <span className="sr-only">중소기업통합플랫폼</span>
                </a>
              </h2>
              <div className="header-actions">
                <button type="button" className="btn-navi sch open-modal" data-target="popTotalSch">통합검색</button>
                {isLogin ? (
                    <>
                      <button type="button" className="btn-navi logout" onClick={logout}>로그아웃</button>
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
                              <button type="button" className="krds-btn medium text" onClick={logout}>
                                <i className="svg-icon ico-logout"></i> 로그아웃
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                ) : (
                    <>
                      <a href="#" className="btn-navi login" onClick={(e) => { e.preventDefault(); login(); }}>로그인</a>
                      <button type="button" className="btn-navi join">회원가입</button>
                    </>
                )}
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
                <button type="button" className={`gnb-main-trigger ${openIndex === "menu1" ? "active" : ""}`} onClick={() => handleToggle("menu1")}>신청·발급</button>
                {/* gnb-toggle-wrap */}
                <div className={`gnb-toggle-wrap ${openIndex === "menu1" ? "is-open" : ""}`}>
                  <div className="gnb-main-list">
                    <div className="gnb-sub-list single-list between">
                      <div className="gnb-sub-content">
                        <h2 className="sub-title"><span>사업공고 및 정책금융 증명서 발급정보를 제공합니다.</span></h2>
                        <ul>
                          <li><a href="/main-dev/ai-smart-search">AI 스마트 통합 검색</a></li>
                          <li><a href="/main-dev/service/UI_USR_L_010">중소벤처기업부 지원사업공고</a></li>
                          <li><a href="/main-dev/service/pbanc">사업공고</a></li>
                          <li><a href="/main-dev/service/UI_USR_L_030">정책금융</a></li>
                          <li><a href="/main-dev/service/UI_USR_L_040">증명서 발급</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                { /*gnb-toggle-wrap */}
              </li>

              <li>
                <button type="button" className={`gnb-main-trigger ${openIndex === "menu2" ? "active" : ""}`} onClick={() => handleToggle("menu2")}>정책정보</button>
                {/* gnb-toggle-wrap */}
                <div className={`gnb-toggle-wrap ${openIndex === "menu2" ? "is-open" : ""}`}>
                  <div className="gnb-main-list">
                    <div className="gnb-sub-list single-list between">
                      <div className="gnb-sub-content">
                        <h2 className="sub-title"><span>정책 리포트 및 품목·인증·규제정보를 제공합니다.</span></h2>
                        <ul>
                          <li><a href="#">정책리포트</a></li>
                          <li><a href="#">품목·인증·규제</a></li>
                          <li><a href="#">더많은서비스</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                { /*gnb-toggle-wrap */}
              </li>

              <li>
                <button type="button" className={`gnb-main-trigger ${openIndex === "menu3" ? "active" : ""}`} onClick={() => handleToggle("menu3")}>데이터 개방</button>
                {/* gnb-toggle-wrap */}
                <div className={`gnb-toggle-wrap ${openIndex === "menu3" ? "is-open" : ""}`}>
                  <div className="gnb-main-list">
                    <div className="gnb-sub-list single-list between">
                      <div className="gnb-sub-content">
                        <h2 className="sub-title"><span>API 안내 및 인증키 신청 서비스를 제공합니다.</span></h2>
                        <ul>
                          <li><a href="#">정책정보 개방</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                { /*gnb-toggle-wrap */}
              </li>

              <li>
                <button type="button" className={`gnb-main-trigger ${openIndex === "menu4" ? "active" : ""}`} onClick={() => handleToggle("menu4")}>고객지원</button>
                {/* gnb-toggle-wrap */}
                <div className={`gnb-toggle-wrap ${openIndex === "menu4" ? "is-open" : ""}`}>
                  <div className="gnb-main-list">
                    <div className="gnb-sub-list single-list between">
                      <div className="gnb-sub-content">
                        <h2 className="sub-title"><span>고객센터 및 이용안내 정보를 제공합니다.</span></h2>
                        <ul>
                          <li><a href="#">고객센터</a></li>
                          <li><a href="#">이용안내</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
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
                  <h2 className="sub-title">신청·발급</h2>
                  <ul>
                    <li><a href="#" className="gnb-sub-trigger">AI 스마트 통합 검색</a></li>
                    <li><a href="#" className="gnb-sub-trigger">중소벤처기업부 지원사업공고</a></li>
                    <li><a href="#" className="gnb-sub-trigger">사업공고</a></li>
                    <li><a href="#" className="gnb-sub-trigger">정책금융</a></li>
                    <li><a href="#" className="gnb-sub-trigger">증명서 발급</a></li>
                  </ul>
                </div>
                <div className="gnb-sub-list" id="mGnb-anchor2" role="tabpanel" aria-labelledby="tab-1">
                  <h2 className="sub-title">정책정보</h2>
                  <ul>
                    <li><a href="#" className="gnb-sub-trigger">정책리포트</a></li>
                    <li><a href="#" className="gnb-sub-trigger">품목·인증·규제</a></li>
                    <li><a href="#" className="gnb-sub-trigger">더많은서비스</a></li>
                  </ul>
                </div>
                <div className="gnb-sub-list" id="mGnb-anchor3" role="tabpanel" aria-labelledby="tab-2">
                  <h2 className="sub-title">데이터 개방</h2>
                  <ul>
                    <li><a href="#" className="gnb-sub-trigger">정책정보 개방</a></li>
                  </ul>
                </div>
                <div className="gnb-sub-list" id="mGnb-anchor4" role="tabpanel" aria-labelledby="tab-3">
                  <h2 className="sub-title">고객지원</h2>
                  <ul>
                    <li><a href="#" className="gnb-sub-trigger">고객센터</a></li>
                    <li><a href="#" className="gnb-sub-trigger">이용안내</a></li>
                  </ul>
                </div>
              </div>
            </div>
            { /*gnb-menu */}
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
    <div className="quickbox">
      <ProgramChatProvider>
        <FloatingChatbot />
      </ProgramChatProvider>
      <button type="button" className="quickbox-top">
        <img src={arrowIcon} alt="" />
        <span className="sr-only">상단으로</span>
      </button>
    </div>
    </>
  );
}
