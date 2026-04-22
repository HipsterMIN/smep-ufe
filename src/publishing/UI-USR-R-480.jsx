import React, { useState } from "react";
import { Link } from 'react-router-dom';

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Accordion from "../components/ui/Accordion";

import captureImg from "../../styles/img/capture1.png";

const UI_USR_R_480 = () => {
  const navigationData = {
    depth1Title: "마이비즈니스",
    depth: [
      {
        depth2: "나의 대시보드",
      },
      {
        depth2: "회원정보관리",
      },
      {
        depth2: "기업정보관리",
      },
      {
        depth2: "서비스 이용이력",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "마이비즈니스", link: "#" },
    { label: "나의 대시보드", link: "#" },
  ];

  //  사업공고 좋아요 버튼
  const [likedAnnounce, setLikedAnnounce] = useState({});

  const handleToggleLike = (index) => {
    setLikedAnnounce(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents my-dashboard">
        <Breadcrumb items={breadcrumbItems} />
        <div className="my-area my-section">
          <div className="sec-header align-top">
            <div>
              <div className="my-tit">
                <span className="krds-badge bg-primary large">개인</span>
                홍길동님
              </div>
              <div className="access-info">
                <span className="tit">최종 접속 정보</span> 2026-03-19 10:58:31
              </div>
            </div>
            <div className="side-btn">
              <button type="button" className="krds-btn secondary xsmall">통합로그인 사이트 관리</button>
            </div>
          </div>
          <div className="flex-box">
            <ul className="mycard">
              <li>
                <Link to="#">
                  <div className="card-info">
                    <span className="card-info-tit">나의 관심공고</span>
                    <div className="card-info-number"><strong>32</strong>건</div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="#">
                  <div className="card-info">
                    <span className="card-info-tit">Q&A</span>
                    <div className="card-info-number"><strong>5</strong>건</div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="#">
                  <div className="card-info">
                    <span className="card-info-tit">API 인증키<br />신청 이력</span>
                    <div className="card-info-number"><strong>16</strong>건</div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="#">
                  <div className="card-info">
                    <span className="card-info-tit">통합로그인<br />사이트</span>
                    <div className="card-info-number"><strong>43</strong>건</div>
                  </div>
                </Link>
              </li>
            </ul>
            <div className="myinfo">
              <div className="myinfo-top">
                <h3>회원정보</h3>
                <button type="button" className="krds-btn secondary xsmall">회원정보수정</button>
              </div>
              <div className="myinfo-conts">
                <dl className="myinfo-details">
                  <dt>휴대전화번호</dt>
                  <dd>01-2345-678984</dd>
                  <dt>이메일</dt>
                  <dd>010-2345-6789</dd>
                </dl>
                <button type="button" className="round-btn">알림 문자 / 이메일 수신중</button>
              </div>
            </div>
          </div>
        </div>

        {/* 추천하는 사업 공고 */}
        {/* <div className="my-section">
          <div className="sec-header">
            <div className="sec-tit">
              <h2><span className="point">홍길동</span> 님께 추천하는 사업 공고</h2>
              <p className="sub">내가 선택한 관심분야 설정에 따른 사업공고를 추천합니다</p>
            </div>
            <button type="button" className="krds-btn secondary xsmall">관심분야 설정</button>
          </div>
          <ul className="krds-structured-list">
            {Array.from({ length: 3 }).map((_, index) => (
              <li className="structured-item" key={index}>
                <div className="card-top">
                  <span className="krds-badge bg-point number">D-10</span>
                  <span className="krds-badge bg-primary number">D-402</span>
                  <span className="krds-badge">경영</span>
                </div>
                <div className="card-body">
                  <a href="#" className="c-text">
                    <p className="c-tit no-icon"><span className="span onellipsis-2">2026년 소공인 복합지원센터 구축ㆍ운영사업 본공모</span></p>
                    <div className="c-etc">
                      <p className="c-ico-txt onellipsis-1">
                        <i className="svg-icon ico-build"></i> <span className="sr-only">기관</span> 한국산업기술기획평가원
                      </p>
                      <p className="c-ico-txt onellipsis-1">
                        <i className="svg-icon ico-calendar"></i> 2026.01.19 ~ 2026.02.12  
                      </p>
                    </div>
                  </a>
                </div> 
                <div className="card-btn">
                  <button type="button" className="krds-btn text" aria-label="2026년 제조DX멘토단 활용지원사업 통합공고" onClick={() => handleToggleLike(index)}> <i className={`svg-icon ico-like on-bgcolorgray ${likedAnnounce[index] ? 'on' : ''}`}></i></button>
                </div>
              </li>
            ))}
          </ul>
        </div> */}

        {/* 서비스 현황 */}
        <div className="my-section">
          <div className="sec-header">
            <div className="sec-tit">
              <h2>서비스 현황</h2>
              <p className="sub">내가 선택한 관심분야 설정에 따른 사업공고를 추천합니다</p>
            </div>
          </div>

          <Accordion type="multi" shape="box">
            {/* [S] - 나의 관심공고 */}
            <Accordion.Item >
              <Accordion.Header>
                <div className="accordion-title">
                  <h3>나의 관심공고</h3>
                  <span className="krds-badge bg-primary number">36</span>
                </div>
              </Accordion.Header>
              <Accordion.Panel>
                <div className="accordion-panel-box">
                  <ul className="krds-structured-list medium">
                    <li className="structured-item">
                      <div className="card-top">
                        <span className="krds-badge small bg-light-primary">사업공고</span> 
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit no-icon"><span className="span onellipsis-2">2026년 중동 특화 긴급 물류바우처 사업 참여기업 모집 공고</span></p>
                          <div className="c-etc">
                            <p className="c-ico-txt onellipsis-1">
                              <i className="svg-icon ico-build"></i> <span className="sr-only">기관</span>한국산업기술기획평가원
                            </p>
                            <p className="c-ico-txt onellipsis-1">
                              <i className="svg-icon ico-calendar"></i> <span className="sr-only">신청일</span>25-12-30 ~ 26-12-31
                            </p>
                          </div>
                        </a>
                        <div>
                          <a href="#" className="krds-btn primary small full" title="새 창 이동" target="_blank">자세히 보기</a>
                        </div>
                      </div> 
                    </li>

                    <li className="structured-item">
                      <div className="card-top">
                        <span className="krds-badge small bg-light-primary">정책금융</span> 
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit no-icon"><span className="span onellipsis-2">혁신성장지원자금</span></p>
                          <div className="c-etc">
                            <p className="c-ico-txt onellipsis-1">
                              <i className="svg-icon ico-coin"></i> <span className="sr-only">금액</span>융자
                            </p>
                            <p className="c-ico-txt onellipsis-1">
                              <i className="svg-icon ico-build"></i> <span className="sr-only">기관</span>한국산업기술기획평가원
                            </p>
                          </div>
                        </a>
                        <div>
                          <a href="#" className="krds-btn primary small full" title="새 창 이동" target="_blank">자세히 보기</a>
                        </div>
                      </div> 
                    </li>

                    <li className="structured-item">
                      <div className="card-top">
                        <span className="krds-badge small bg-light-primary">사업공고</span> 
                      </div>
                      <div className="card-body">
                        <a href="#" className="c-text">
                          <p className="c-tit no-icon"><span className="span onellipsis-2">2026년 중동 특화 긴급 물류바우처 사업 참여기업 모집 공고</span></p>
                          <div className="c-etc">
                            <p className="c-ico-txt onellipsis-1">
                              <i className="svg-icon ico-build"></i> <span className="sr-only">기관</span>한국산업기술기획평가원
                            </p>
                            <p className="c-ico-txt onellipsis-1">
                              <i className="svg-icon ico-calendar"></i> <span className="sr-only">신청일</span>25-12-30 ~ 26-12-31
                            </p>
                          </div>
                        </a>
                        <div>
                          <a href="#" className="krds-btn primary small full" title="새 창 이동" target="_blank">자세히 보기</a>
                        </div>
                      </div> 
                    </li>
                  </ul>
                  <div className="more-btn">
                    <button type="button" className="krds-btn secondary small full">더보기 <i className="svg-icon ico-angle right"></i></button>
                  </div>
                </div>
              </Accordion.Panel>
            </Accordion.Item>
            {/* [E] - 나의 관심공고 */}

            {/* [S] - Q&A */}
            <Accordion.Item >
              <Accordion.Header>
                <div className="accordion-title">
                  <h3>Q&A</h3>
                  <span className="krds-badge bg-primary number">36</span>
                </div>
              </Accordion.Header>
              <Accordion.Panel>
                <div className="accordion-panel-box">
                  <ul className="krds-structured-list medium">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <li className="structured-item" key={index}>
                        <div className="card-top">
                          {/* 전체 상태 case */}
                          <span className="krds-badge small bg-light-primary">답변완료</span> 
                          <span className="krds-badge small bg-light-gray">답변대기</span> 
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text">
                            <p className="c-tit no-icon"><span className="span onellipsis-2">소상공 정책자금 지원에서 일시적경영애로자금 관련 문의</span></p>
                            <div className="c-etc">
                              <p className="c-ico-txt onellipsis-1">
                                <i className="svg-icon ico-calendar"></i><span className="sr-only">작성일자</span> 25-12-30 ~ 26-12-31
                              </p>
                            </div>
                          </a>
                        </div> 
                      </li>
                    ))}
                  </ul>
                  <div className="more-btn">
                    <button type="button" className="krds-btn secondary small full">더보기 <i className="svg-icon ico-angle right"></i></button>
                  </div>
                </div>
              </Accordion.Panel>
            </Accordion.Item>
            {/* [E] - Q&A */}

            {/* [S] - API 인증키 신청 이력 */}
            <Accordion.Item >
              <Accordion.Header>
                <div className="accordion-title">
                  <h3>API 인증키 신청 이력</h3>
                  <span className="krds-badge bg-primary number">36</span>
                </div>
              </Accordion.Header>
              <Accordion.Panel>
                <div className="accordion-panel-box">
                  <ul className="krds-structured-list medium">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <li className="structured-item" key={index}>
                        <div className="card-body">
                          <div className="c-text">
                            <p className="c-tit no-icon"><span className="span onellipsis-1">글로벌강소기업지정서</span></p>
                            <div className="c-etc">
                              <p className="c-ico-txt onellipsis-1">
                                <i className="svg-icon ico-build"></i> <span className="sr-only">기관</span> 한국산업기술기획평가원
                              </p>
                              <p className="c-ico-txt onellipsis-1">
                                <i className="svg-icon ico-email"></i><span className="sr-only">신청 이메일</span>unearth123456@gmail.com
                              </p>
                            </div>
                          </div>
                          <div>
                            <button type="button" className="krds-btn primary small full">인증키 신청 조회</button>
                          </div>
                        </div> 
                      </li>
                    ))}
                  </ul>
                  <div className="more-btn">
                    <button type="button" className="krds-btn secondary small full">더보기 <i className="svg-icon ico-angle right"></i></button>
                  </div>
                </div>
              </Accordion.Panel>
            </Accordion.Item>
            {/* [E] - API 인증키 신청 이력 */}

            {/* [S] - 나의 알림 */}
            <Accordion.Item >
              <Accordion.Header>
                <div className="accordion-title">
                  <h3>나의 알림</h3>
                  <span className="krds-badge bg-primary number">36</span>
                </div>
              </Accordion.Header>
              <Accordion.Panel>
                <div className="accordion-panel-box">
                  <ul className="krds-structured-list medium">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <li className="structured-item">
                        <div className="card-top">
                          <span className="krds-badge small bg-light-primary">사업공고</span> 
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text">
                            <p className="c-tit no-icon"><span className="span onellipsis-2">2026년 중동 특화 긴급 물류바우처 사업 참여기업 모집 공고</span></p>
                            <div className="c-etc">
                              <p className="c-ico-txt onellipsis-1">
                                <i className="svg-icon ico-calendar"></i> <span className="sr-only">신청일</span>2025-12-11 10:04
                              </p>
                              <p className="c-ico-txt onellipsis-1">
                                <i className="svg-icon ico-alarm"></i> <span className="sr-only">알림</span>이메일 문자
                              </p>
                            </div>
                          </a>
                          <div>
                            <a href="#" className="krds-btn primary small full" title="새 창 이동" target="_blank">자세히 보기</a>
                          </div>
                        </div> 
                      </li>
                    ))}
                  </ul>
                  <div className="more-btn">
                    <button type="button" className="krds-btn secondary small full">더보기 <i className="svg-icon ico-angle right"></i></button>
                  </div>
                </div>
              </Accordion.Panel>
            </Accordion.Item>
            {/* [E] - 나의 알림 */}
          </Accordion>
        </div>
        
        {/* <div className="my-section">
          <ul className="menu-list">
            <li>
              <Link to="#" className="menu-link blue">통합로그인 사이트 관리</Link>
            </li>
            <li>
              <Link to="#" className="menu-link purple">나의 관심공고</Link>
            </li>
            <li>
              <Link to="#" className="menu-link pink">나의 알림</Link>
            </li>
          </ul>
        </div> */}
      </div> 
    </>
  );
};

export default UI_USR_R_480;
