// 마이비즈니스 > 나의 대시보드 > 기업

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
                <span className="krds-badge bg-purple large">기업</span>
                중소벤처24
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
                    <span className="card-info-tit">증명서<br/>보유현황</span>
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
                <h3>기업정보</h3>
                <button type="button" className="krds-btn secondary xsmall">기업정보수정</button>
              </div>
              <div className="myinfo-conts">
                <dl className="myinfo-details">
                  <dt>사업자 등록번호</dt>
                  <dd>01-2345-678984</dd>
                  <dt>기업 대표 전화번호</dt>
                  <dd>010-2345-6789</dd>
                  <dt>주요 사업분야</dt>
                  <dd className="onellipsis-1">시스템구축/유지보수/솔루션개발/솔루션개발</dd>
                </dl>
                <button type="button" className="krds-btn secondary xsmall w-full mt-20">나의 관심정보 알림받기 <i className="svg-icon ico-angle blue-right"></i></button>
              </div>
            </div>
          </div>
        </div>

        {/* 서비스 현황 */}
        <div className="my-section">
          <div className="sec-header">
            <div className="sec-tit">
              <h2>서비스 현황</h2>
              <p className="sub">나의 서비스 신청 현황을 확인하세요</p>
            </div>
          </div>

          <Accordion type="multi" shape="box">
            {/* [S] - 나의 관심공고 */}
            <Accordion.Item >
              <Accordion.Header>
                <div className="accordion-title">
                  <h3>나의 관심공고</h3>
                </div>
              </Accordion.Header>
              <Accordion.Panel>
                <div className="accordion-panel-box">
                  <div className="noneBox">
                    <h4>아직 저장된 관심 공고가 없어요</h4>
                    <p>관심정보를 등록하고 알림을 받아보세요.</p>
                    <a href="">나에게 맞는 사업공고 찾아보기 <i className="svg-icon ico-angle blue-right"></i></a>
                  </div>
                </div>
              </Accordion.Panel>
            </Accordion.Item>
            {/* [E] - 나의 관심공고 */}

            {/* [S] - 증명서 보유 현황 */}
            <Accordion.Item >
              <Accordion.Header>
                <div className="accordion-title">
                  <h3>증명서 보유 현황</h3>
                </div>
              </Accordion.Header>
              <Accordion.Panel>
                <div className="accordion-panel-box">
                  <ul className="krds-structured-list medium">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <li className="structured-item" key={index}>
                        <div className="card-top">
                          {/* 전체 상태 case */}
                          <span className="krds-badge small bg-light-primary">접수완료</span> 
                          <span className="krds-badge small bg-light-secondary">평가중</span> 
                          <span className="krds-badge small bg-light-warning">탈락</span> 
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text">
                            <p className="c-tit no-icon"><span className="span onellipsis-1">혁신성장지원자금</span></p>
                            <div className="c-etc">
                              <p className="c-ico-txt onellipsis-1">
                                <i className="svg-icon ico-coin"></i><span className="sr-only">용도</span>융자
                              </p>
                              <p className="c-ico-txt onellipsis-1">
                                <i className="svg-icon ico-build"></i><span className="sr-only">기관</span> 한국산업기술기획평가원
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
            {/* [E] - 증명서 보유 현황 */}
            
            {/* [S] - API 인증키 신청 이력 */}
            <Accordion.Item >
              <Accordion.Header>
                <div className="accordion-title">
                  <h3>API 인증키 신청 이력</h3>
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
            
            {/* [S] - Q&A */}
            <Accordion.Item >
              <Accordion.Header>
                <div className="accordion-title">
                  <h3>Q&A</h3>
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

            {/* [S] - 나의 알림 */}
            <Accordion.Item >
              <Accordion.Header>
                <div className="accordion-title">
                  <h3>나의 알림</h3>
                </div>
              </Accordion.Header>
              <Accordion.Panel>
                <div className="accordion-panel-box">
                  <ul className="krds-structured-list medium">
                    <li className="structured-item">
                      <div className="card-body">
                        <div className="c-text">
                          <p className="c-tit no-icon"><span className="span onellipsis-1">창업기업확인서</span></p>
                          <div className="c-etc">
                            <p className="c-ico-txt c-date">
                              <i className="svg-icon ico-calendar"></i><span className="tit">신청일자</span>
                              <span className="onellipsis-1">2025.11.14 09:11:04</span>
                            </p>
                            <p className="c-ico-txt c-date">
                              <i className="svg-icon ico-calendar"></i> <span className="tit">유효기간</span>
                              <span className="onellipsis-1">2026.11.13</span>
                            </p>
                          </div>
                        </div>
                        <div>
                          <button type="button" className="krds-btn primary small full">발급받기</button>
                        </div>
                      </div> 
                    </li>
                    <li className="structured-item">
                      <div className="card-body">
                        <div className="c-text">
                          <p className="c-tit no-icon"><span className="span onellipsis-1">창업기업확인서</span></p>
                          <div className="c-etc">
                            <p className="c-ico-txt c-date">
                              <i className="svg-icon ico-calendar"></i><span className="tit">신청일자</span>
                              <span className="onellipsis-1">2025.11.14 09:11:04</span>
                            </p>
                            <p className="c-ico-txt c-date">
                              <i className="svg-icon ico-calendar"></i> <span className="tit">유효기간</span>
                              <span className="onellipsis-1">2025.11.14 09:11:04</span>
                            </p>
                          </div>
                        </div>
                        <div>
                          <button type="button" className="krds-btn primary small full" disabled>출력불가</button>
                        </div>
                      </div> 
                    </li>
                    <li className="structured-item">
                      <div className="card-body">
                        <div className="c-text">
                          <p className="c-tit no-icon"><span className="span onellipsis-1">창업기업확인서</span></p>
                          <div className="c-etc">
                            <p className="c-ico-txt c-date">
                              <i className="svg-icon ico-calendar"></i><span className="tit">신청일자</span>
                              <span className="onellipsis-1">2025.11.14 09:11:04</span>
                            </p>
                            <p className="c-ico-txt c-date">
                              <i className="svg-icon ico-calendar"></i> <span className="tit">유효기간</span>
                              <span className="onellipsis-1">2025.11.14 09:11:04</span>
                            </p>
                          </div>
                        </div>
                        <div>
                          <button type="button" className="krds-btn primary small full" disabled>정부전자문서지갑</button>
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
            {/* [E] - 나의 알림*/}
          </Accordion>
        </div>
      </div> 
    </>
  );
};

export default UI_USR_R_480;
