import React, { useRef, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Tab from '@components/ui/Tab';
import serviceImgs1 from '@assets/main/platform_icon01.svg';
import serviceImgs2 from '@assets/main/platform_icon02.svg';
import serviceImgs3 from '@assets/main/platform_icon03.svg';
import serviceImgs4 from '@assets/main/platform_icon04.svg';
import certImgs1 from '@assets/main/certificate_icon_01.svg';
import certImgs2 from '@assets/main/certificate_icon_02.svg';
import certImgs3 from '@assets/main/certificate_icon_03.svg';
import certImgs4 from '@assets/main/certificate_icon_04.svg';
import certImgs5 from '@assets/main/certificate_icon_05.svg';
import certImgs6 from '@assets/main/certificate_icon_06.svg';
import logoImgsBi from '@assets/sub/bi_logo.svg';
import logoVertical from '@assets/sub/logo_vertical.svg';
import logoHorizontal from '@assets/sub/logo_horizontal.svg';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useMatches, useNavigate } from 'react-router-dom';

const PLATFORM_INTRO_LINKS = {
  supportBusiness: '/req/sprt',
  businessAnnouncement: '/req/pbanc',
  policyFinance: '/req/UI_USR_L_030',
  certificateIssue: '/crtf/UI_USR_L_040',
  relatedSystems: '/cs/UI_USR_L_160',
};

const UI_USR_R_350 = () => {

  const matches = useMatches();
  const navigate = useNavigate();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const tabData = useRef(['중소벤처24', 'BI 소개']);
  const schFormWrapRef1 = useRef(null);
  const schFormWrapRef2 = useRef(null);

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };

  const getInteractiveItemProps = (path, label) => ({
    role: 'link',
    tabIndex: 0,
    'aria-label': label,
    onClick: () => navigate(path),
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navigate(path);
      }
    },
  });

  const pageTitle = [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '사업 공고';

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">{pageTitle}</h2>
        </div>

        <div className="krds-tab-area layer">
          <p className="guide-txt custom mb-40">중소벤처24의 주요 기능과 이용 절차를 안내합니다.</p>
          <Tab tabData={tabData.current} onTabChange={handleTabChange} />

          <div className="tab-conts-wrap mt-40">
            <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
              <h3 className="sr-only">중소벤처24</h3>

              <div className="platform-intro-wrap" ref={schFormWrapRef1}>
                <h2>기업이 필요한 모든 지원을 하나의 흐름으로 연결합니다.</h2>
                <p>
                    중소벤처24는 <span className="point">분산된 중소기업 지원 서비스를 통합</span>하여
                  <span className="point">기업 중심의 이용 환경을 제공</span>합니다.
                </p>
                <p className="sub-text">
                    중소기업 지원 서비스는 영역별 시스템이 분산 운영되어, 기업이 정보 탐색·신청·확인 과정에서 반복 이동과 중복 입력 부담이 발생해 왔습니다.<br/>
                    이러한 비효율을 해소하고 기업 중심의 원스톱 업무 흐름을 제공하기 위해 중소벤처24 통합 서비스 환경을 구축하고<br/>
                    기업이 필요한 지원사업·정책금융·증명서 서비스를 한 곳에서 조회하고, 신청·관리까지 이어갈 수 있도록 서비스 경험을 재구성합니다.
                </p>
                <div className="platformObjImgs" />
                <div className="service-list">
                  <h4>주요 서비스 안내</h4>
                  <ul>
                    <li>
                      <div className="service-imgs">
                        <img src={serviceImgs1} alt="지원사업 안내 아이콘 이미지" />
                      </div>
                      <h2>지원사업</h2>
                      <p>중소기업 대상<br/>지원사업 공고 조회</p>
                    </li>
                    <li>
                      <div className="service-imgs">
                        <img src={serviceImgs2} alt="사업공고 안내 아이콘 이미지" />
                      </div>
                      <h2>사업공고</h2>
                      <p>기관별·유형별<br/>사업공고 통합 조회</p>
                    </li>
                    <li>
                      <div className="service-imgs">
                        <img src={serviceImgs3} alt="정책금융 안내 아이콘 이미지" />
                      </div>
                      <h2>정책금융</h2>
                      <p>정책자금 및 금융상품<br/>정보 확인과 신청 연계</p>
                    </li>
                    <li>
                      <div className="service-imgs">
                        <img src={serviceImgs4} alt="증명서 발급 안내 아이콘 이미지" />
                      </div>
                      <h2>증명서 발급</h2>
                      <p>증명서 발급 및<br/>발급 이력 관리</p>
                    </li>
                  </ul>
                </div>

                <div className="cert-form">
                  <h5>증명서 발급</h5>
                  <p>
                      중소기업확인서, 벤처기업확인서, 직접생산증명서 등 기업경영에 필요한 각종 증명서를 개별 시스템 방문 없이<br/>
                      한 곳에서 통합 조회, 발급할 수 있으며, 중소벤처24를 통해 출력된 문서에 대한 진위확인 서비스를 제공합니다.
                  </p>
                  <div className="cert-list">
                    <ul>
                      <li {...getInteractiveItemProps(PLATFORM_INTRO_LINKS.certificateIssue + '/Y106', '벤처기업 확인서 발급')}>
                        <div className="cert-imgs">
                          <img src={certImgs1} alt="벤처기업 확인서 발급 아이콘 이미지" />
                        </div>
                        <h2>벤처기업<br className="mob_none" />확인서 발급</h2>
                      </li>
                      <li {...getInteractiveItemProps(PLATFORM_INTRO_LINKS.certificateIssue + '/Y104', '메인비즈 확인서 발급')}>
                        <div className="cert-imgs">
                          <img src={certImgs2} alt="벤처기업 확인서 발급 아이콘 이미지" />
                        </div>
                        <h2>메인비즈<br className="mob_none" />확인서 발급</h2>
                      </li>
                      <li {...getInteractiveItemProps(PLATFORM_INTRO_LINKS.certificateIssue + '/Y107', '중소기업(소상공인) 확인서 발급')}>
                        <div className="cert-imgs">
                          <img src={certImgs3} alt="벤처기업 확인서 발급 아이콘 이미지" />
                        </div>
                        <h2>중소기업(소상공인)<br className="mob_none" />확인서 발급</h2>
                      </li>
                      <li {...getInteractiveItemProps(PLATFORM_INTRO_LINKS.certificateIssue + '/Y105', '이노비즈 확인서 발급')}>
                        <div className="cert-imgs">
                          <img src={certImgs4} alt="벤처기업 확인서 발급 아이콘 이미지" />
                        </div>
                        <h2>이노비즈<br className="mob_none" />확인서 발급</h2>
                      </li>
                      <li {...getInteractiveItemProps(PLATFORM_INTRO_LINKS.certificateIssue + '/Y102', '여성기업 확인서 발급')}>
                        <div className="cert-imgs">
                          <img src={certImgs5} alt="벤처기업 확인서 발급 아이콘 이미지" />
                        </div>
                        <h2>여성기업<br className="mob_none" />확인서 발급</h2>
                      </li>
                      <li {...getInteractiveItemProps(PLATFORM_INTRO_LINKS.certificateIssue + '/Y121', '스마트공장수준 확인서 발급')}>
                        <div className="cert-imgs">
                          <img src={certImgs6} alt="벤처기업 확인서 발급 아이콘 이미지" />
                        </div>
                        <h2>스마트공장수준<br className="mob_none" />확인서 발급</h2>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="policy-form">
                  <h5>사업공고 조회 및 정책금융</h5>
                  <p>
                      중소벤처기업부에서 제공하는 다양한 지원사업에 대한 안내와 산하기관 개별 시스템에서 제공하는 분야별 지원사업공고를 통합하여<br/>
                      한번에 확인하고 신청할 수 있으며, 기업의 경영 환경에 따라 맞춤형으로 조회할 수 있습니다.
                  </p>
                  <div className="policy-list">
                    <ul>
                      <li {...getInteractiveItemProps(PLATFORM_INTRO_LINKS.supportBusiness, '지원사업 조회')}><h2>지원사업 조회</h2></li>
                      <li {...getInteractiveItemProps(PLATFORM_INTRO_LINKS.businessAnnouncement, '사업공고 조회')}><h2>사업공고 조회</h2></li>
                      <li {...getInteractiveItemProps(PLATFORM_INTRO_LINKS.policyFinance, '정책금융 안내')}><h2>정책금융 안내</h2></li>
                    </ul>
                  </div>
                </div>

                <div className="policy-form">
                  <h5>유관기관 둘러보기</h5>
                  <p>
                      중소벤처24 통합 계정 하나로 별도의 가입 절차 없이 68개 핵심 플랫폼을 이용할 수 있는 단일 계정(SSO) 기반의 통합 환경을 제공합니다. 이를 통해 기관별로 산재한 주요 플랫폼을 효율적으로 이용할 수 있도록 통합 인증 기반의 유관 사이트 정보를 안내합니다
                  </p>
                  <div className="policy-list">
                    <ul>
                      <li {...getInteractiveItemProps(PLATFORM_INTRO_LINKS.relatedSystems, '유관시스템 알아보기')}><h2>유관시스템 알아보기</h2></li>
                    </ul>
                  </div>
                </div>
              </div>

            </section>

            <section className={`tab-conts ${activeTabIndex === 1 ? 'active' : ''}`}>
              <h3 className="sr-only">BI 소개</h3>
              <div className="platform-bi-wrap" ref={schFormWrapRef2}>
                <h4>기관상징 (MI)기본 디자인</h4>
                <div className="default-design-box mb-24">
                  <img src={logoImgsBi} alt="중소벤처24 BI 로고 이미지" />
                </div>
                <p>
                    태극을 청색과 적색의 하나된 모습으로 역동적으로 표현하여<br/>
                    국가와 국민, 대한민국과 세계, 과거와 현재를 융합하여 미래를 만들어가는 대한민국 정부를 상징.<br/>
                    태극 원형의 색상을 연계하여 대한민국다움을 극대화함과 동시에 코리아 프리미엄의 문화적 세련미를 표현.
                </p>

                <h4>기관상징 조합</h4>
                <div className="default-design-box space mb-48">
                  <div className="box-inner border-after">
                    <h5>기본형 세로조합</h5>
                    <img
                      src={logoVertical}
                      className="img-vertical"
                      alt="기본형 세로조합 - 중소벤처24 BI 로고 이미지"
                    />
                  </div>
                  <div className="box-inner">
                    <h5>기본형 가로조합</h5>
                    <img
                      src={logoHorizontal}
                      className="img-horizontal"
                      alt="기본형 가로조합 - 중소벤처24 BI 로고 이미지"
                    />
                  </div>
                </div>

                <h4>상징색상</h4>
                <div className="default-design-box grid">
                  <div className="box-color-inner">
                    <em className="circle blue" />
                    <div className="color-info">
                      <h4>정부청색 GOK Blue</h4>
                      <dl>
                        <dt>CMYK</dt>
                        <dd>C 100% + M 70% + Y 20% + K 40%</dd>
                      </dl>
                      <dl>
                        <dt>RGB</dt>
                        <dd>R 0 G 55 B 100</dd>
                      </dl>
                      <dl>
                        <dt>PANTONE</dt>
                        <dd>PANTONE 2955</dd>
                      </dl>
                    </div>
                  </div>

                  <div className="box-color-inner">
                    <em className="circle red" />
                    <div className="color-info">
                      <h4>정부적색 GOK Red</h4>
                      <dl>
                        <dt>CMYK</dt>
                        <dd>M 100% + Y 80%</dd>
                      </dl>
                      <dl>
                        <dt>RGB</dt>
                        <dd>R 228 G 3 B 46</dd>
                      </dl>
                      <dl>
                        <dt>PANTONE</dt>
                        <dd>PANTONE 1935 C</dd>
                      </dl>
                    </div>
                  </div>

                  <div className="box-color-inner">
                    <em className="circle gray" />
                    <div className="color-info">
                      <h4>정부회색 GOK Gray</h4>
                      <dl>
                        <dt>CMYK</dt>
                        <dd>K 80%</dd>
                      </dl>
                      <dl>
                        <dt>RGB</dt>
                        <dd>R 87 G 87 B 87</dd>
                      </dl>
                      <dl>
                        <dt>PANTONE</dt>
                        <dd>PANTONE Cool Gray 11 C</dd>
                      </dl>
                    </div>
                  </div>

                  <div className="box-color-inner">
                    <em className="circle white" />
                    <div className="color-info">
                      <h4>정부회색 GOK Gray</h4>
                      <dl>
                        <dt>CMYK</dt>
                        <dd>K 0%</dd>
                      </dl>
                      <dl>
                        <dt>RGB</dt>
                        <dd>R 255 G 255 B 255</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default UI_USR_R_350;
