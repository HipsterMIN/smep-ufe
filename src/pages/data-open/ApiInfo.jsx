import { Link } from 'react-router-dom';

import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext';
import React from 'react';

const ApiInfo = () => {

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap side-conts" data-type="responsive">
          <h2 className="h-tit">
            정책정보 개방
          </h2>
        </div>

        <p className="guide-txt">
          중소벤처24에서는 중소벤처기업부에서 보유하고 있는 정보 및 서비스를 API를 통해 배포하고 있습니다. <br />
          Open API는 중소벤처기업부 각 기관 및 이를 서비스하고자 하는 일반을 대상으로 배포하고 있습니다.<br />
        * 다만, 해당 인증키는 신청 및 가능여부를 판단하여 제공하고 있습니다.
        </p>

        {/* tab link */}
        <div className="tab fill full mt-48">
          <ul>
            <li className="active">
              <Link to="#" className="btn-tab">
                    API 소개
                <span className="sr-only">현재 페이지</span>
              </Link>
            </li>
            <li>
              <Link to="#" className="btn-tab">
                   인증키 신청
              </Link>
            </li>
            <li>
              <Link to="#" className="btn-tab">
                    API Q&A
              </Link>
            </li>
          </ul>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">Open API 소개</h3>
          <p className="conts-desc">
            특정 시스템이 갖고 있는 콘텐츠 데이터를 다른 이용자들이 손쉽게 이용하거나 재활용 할 수 있도록 돕기 위해 <br />
            표준화된 규약을 만들어 공개적으로 제공하는 것을 Open API(Application Program Interface)라고 말합니다. <br />
            중소벤처24에서는 그 동안 수집된 기업정보나 증명(확인)서 정보 등을 다른 유관 시스템에서 사용할 수 있도록 API를 개발하여 제공하고 있습니다. <br />
            중소벤처24의 API를 사용하면, 지원사업 신청 시 클릭 한 번으로 기업의 기본 데이터를 자동 입력하거나, <br />
            지원 자격 증빙을 위해 인증서를 별도로 제출하지 않더라도 기업이 받은 인증 정보를 확인할 수 있게 됩니다.
          </p>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">API 배포 대상</h3>
          {/* eslint-disable-next-line no-irregular-whitespace */}
          <p className="conts-desc">중소벤처기업부 산하 유관기관 시스템 또는 이에 준하는 중소기업 관련 지원 사이트</p>
          <ul className="krds-info-list decimal mt-12" role="list">
            <li role="listitem">인증키 승인 과정에서 기관 및 담당자를 확인합니다.</li>
            <li role="listitem">증명(확인)서의 경우, 서비스를 제공하고자 하는 플랫폼 사업자를 대상으로 검토를 통해 API를 배포할 수 있습니다.</li>
          </ul>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">API 이용 방법</h3>
          <p className="conts-desc">중소벤처24의 Open API를 사용하시고자 하시는 기관 및 시스템 담당자께서는 인증키 신청서를 작성하여 인증키 정보를 확인하시거나, 중소벤처24 운영팀에게 문의해 주시면 담당자 확인 후 이메일로 인증키 정보를 보내드립니다.</p>
          <div className="helper-box refer mt-16">
            <p className="helper-tit">중소벤처24 Open API 관련 문의 : 중소벤처24 운영팀 (044-300-0990)</p>
          </div>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">제공 API 종류</h3>
          <div>
            <h4 className="sub-title">1. 증명(확인)서 정보 API <em className="txt-caution">※기업회원만 신청이 가능합니다.</em></h4>
            <p className="conts-desc">중소벤처24에서 확인 가능한 증명(확인)서 정보를 제공하는 API입니다. 지원사업 신청 시 자격요건에 증명(확인)서가 포함되어 있는 경우, 신청기업이 증명(확인)서를 제출하지 않더라도 API를 통해 간단히 자격여부 확인이 가능합니다.</p>
          </div>
           
          <ul className="krds-structured-list type-full  mt-40">
            <li className="structured-item">
              <div  className="in">
                <div className="card-body">
                  <Link to="innoBizCertificateApi" className="c-text">
                    <p className="c-tit">
                      <span className="span">이노비즈확인서</span>
                    </p>
                    <div className="c-txt">
                      <ul className="c-txt-ul no-dash">
                        <li className="c-date">
                          <strong className="key">발급기관</strong>
                          <span className="value">이노비즈협회(중소기업기술혁신협회)</span>
                        </li>
                        <li className="c-date">
                          <strong className="key">소관기관</strong>
                          <span className="value">중소벤처기업부 창업벤처혁신실 기술인재정책관 기술혁신정책과</span>
                        </li>
                      </ul>
                    </div>
                  </Link>
                  <div className="c-btn">
                    <Link to="innoBizCertificateApi" className="krds-btn secondary">신청하기</Link>
                  </div>
                </div>
              </div>
            </li>

            <li className="structured-item">
              <div  className="in">
                <div className="card-body">
                  <Link to="ventureCertificateApi" className="c-text">
                    <p className="c-tit">
                      <span className="span">벤처기업확인서</span>
                    </p>
                    <div className="c-txt">
                      <ul className="c-txt-ul no-dash">
                        <li className="c-date">
                          <strong className="key">발급기관</strong>
                          <span className="value">(사)벤처기업협회</span>
                        </li>
                        <li className="c-date">
                          <strong className="key">소관기관</strong>
                          <span className="value">중소벤처기업부 벤처혁신정책과</span>
                        </li>
                      </ul>
                    </div>
                  </Link>
                  <div className="c-btn">
                    <Link to="ventureCertificateApi" className="krds-btn secondary">신청하기</Link>
                  </div>
                </div>
              </div>
            </li>

            <li className="structured-item">
              <div  className="in">
                <div className="card-body">
                  <Link to="mainBizCertificateApi" className="c-text">
                    <p className="c-tit">
                      <span className="span">메인비즈확인서</span>
                    </p>
                    <div className="c-txt">
                      <ul className="c-txt-ul no-dash">
                        <li className="c-date">
                          <strong className="key">발급기관</strong>
                          <span className="value">메인비즈협회(한국경영혁신중소기업협회)</span>
                        </li>
                        <li className="c-date">
                          <strong className="key">소관기관</strong>
                          <span className="value">중소벤처기업부 창업벤처혁신실 기술인재정책관 기술혁신정책과</span>
                        </li>
                      </ul>
                    </div>
                  </Link>
                  <div className="c-btn">
                    <Link to="mainBizCertificateApi" className="krds-btn secondary">신청하기</Link>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <div className="mt-40">
            <h4 className="sub-title">2. 공고정보</h4>
            <p className="conts-desc">
              기업마당에서 제공중인 중앙부처, 지자체, 유관기관의 최신 지원사업 공고, 행사정보를 국민, 기업, 지원기관 등 누구나 참고하고 활용할 수 있도록<br />
               API(Application Programming Interface 애플리케이션 프로그래밍 인터페이스) 형태로 제공합니다. <br />
               지역, 기관 성격 등에 적합한 콘텐츠를 현재 운영중인 서비스에 API 연계를 통해 적용할 수 있습니다.
            </p>
          </div>
           
          <ul className="krds-structured-list type-full mt-40">
            <li className="structured-item">
              <div className="in">
                <div className="card-top">
                  <span className="krds-badge bg-light-primary">REST</span>
                  <span className="krds-badge bg-light-primary">JSON/XML</span>
                </div>
                <div className="card-body">
                  <Link to="supportBusinessInfoApi" className="c-text">
                    <p className="c-tit">
                      <span className="span">지원사업정보 API</span>
                    </p>
                    <p className="c-txt">기관별, 분야별 최신 지원사업 공고 정보 제공</p>
                    <div className="c-txt">
                      <ul className="c-txt-ul no-dash">
                        <li className="c-date">
                          <span className="key">등록일</span>
                          <span className="value">2023.08.02</span>
                        </li>
                        <li className="c-date">
                          <span className="key">수정일</span>
                          <span className="value">2025.11.14</span>
                        </li>
                      </ul>
                    </div>
                  </Link>
                  <div className="c-btn">
                    <Link to="supportBusinessInfoApi" className="krds-btn secondary">신청하기</Link>
                  </div>
                </div>
              </div>
            </li>

            <li className="structured-item">
              <div className="in">
                <div className="card-top">
                  <span className="krds-badge bg-light-primary">REST</span>
                  <span className="krds-badge bg-light-primary">JSON/XML</span>
                </div>
                <div className="card-body">
                  <Link to="eventInfoApi" className="c-text">
                    <p className="c-tit">
                      <span className="span">행사정보 API</span>
                    </p>
                    <p className="c-txt">기관별, 분야별 최신 지원사업 공고 정보 제공</p>
                    <div className="c-txt">
                      <ul className="c-txt-ul no-dash">
                        <li className="c-date">
                          <span className="key">등록일</span>
                          <span className="value">2023.08.02</span>
                        </li>
                        <li className="c-date">
                          <span className="key">수정일</span>
                          <span className="value">2025.11.14</span>
                        </li>
                      </ul>
                    </div>
                  </Link>
                  <div className="c-btn">
                    <Link to="eventInfoApi" className="krds-btn secondary">신청하기</Link>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* bottom btn */}
        <div className="onboard-btm-btngroup bt-0 btn-single">
          <div> 
            <button type="button" className="krds-btn xlarge" onClick={() => window.location.href = '/main/user/file/중소벤처24_API개발가이드_V2.zip'}>
              API 가이드
            </button>
          </div>
        </div>



      </div> 
    </>
  );
};

export default ApiInfo;
