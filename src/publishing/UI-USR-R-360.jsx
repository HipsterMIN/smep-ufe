import React, { useRef, useState } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";

// tab1
import GuideTab1_01 from '@assets/sub/new/guide_tab1_01_pc.png';
import GuideTab1_02 from '@assets/sub/new/guide_tab1_02_pc.png';
import GuideTab1_03 from '@assets/sub/new/guide_tab1_03_pc.png';
/* mo img */
import GuideTab1_01_Mo from '@assets/sub/new/guide_tab1_01_mo.png';
import GuideTab1_02_Mo from '@assets/sub/new/guide_tab1_02_mo.png';
import GuideTab1_03_Mo from '@assets/sub/new/guide_tab1_03_mo.png';

// tab2
import GuideTab2_01 from '@assets/sub/new/guide_tab2_01_pc.png';
import GuideTab2_02 from '@assets/sub/new/guide_tab2_02_pc.png';
import GuideTab2_03 from '@assets/sub/new/guide_tab2_03_pc.png';
import GuideTab2_04 from '@assets/sub/new/guide_tab2_04_pc.png';
/* mo img */
import GuideTab2_01_Mo from '@assets/sub/new/guide_tab2_01_mo.png';
import GuideTab2_02_Mo from '@assets/sub/new/guide_tab2_02_mo.png';
import GuideTab2_03_Mo from '@assets/sub/new/guide_tab2_03_mo.png';
import GuideTab2_04_Mo from '@assets/sub/new/guide_tab2_04_mo.png';

///tab3
import GuideTab3_01 from '@assets/sub/new/guide_tab3_01_pc.png';
import GuideTab3_02 from '@assets/sub/new/guide_tab3_02_pc.png';
import GuideTab3_03 from '@assets/sub/new/guide_tab3_03_pc.png';
import GuideTab3_04 from '@assets/sub/new/guide_tab3_04_pc.png';
import GuideTab3_05 from '@assets/sub/new/guide_tab3_05_pc.png';
/* mo img */
import GuideTab3_01_Mo from '@assets/sub/new/guide_tab3_01_mo.png';
import GuideTab3_02_Mo from '@assets/sub/new/guide_tab3_02_mo.png';
import GuideTab3_03_Mo from '@assets/sub/new/guide_tab3_03_mo.png';
import GuideTab3_04_Mo from '@assets/sub/new/guide_tab3_04_mo.png';
import GuideTab3_05_Mo from '@assets/sub/new/guide_tab3_05_mo.png';

///tab4
import GuideTab4_01 from '@assets/sub/guide_tab4_01_pc.png';
import GuideTab4_02 from '@assets/sub/guide_tab4_02_pc.png';
import GuideTab4_03 from '@assets/sub/guide_tab4_03_pc.png';
/* mo img */
import GuideTab4_01_Mo from '@assets/sub/guide_tab4_01_mo.png';
import GuideTab4_02_Mo from '@assets/sub/guide_tab4_02_mo.png';
import GuideTab4_03_Mo from '@assets/sub/guide_tab4_03_mo.png';


const UI_USR_R_360 = () => {
  const tabData = useRef(['주요서비스', '회원서비스']);
  const subTabData = useRef(['지원사업소개', '증명서 발급', '기관/기업 조회', '정책금융안내']);
  const schFormWrapRef1 = useRef(null);
  const schFormWrapRef2 = useRef(null);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [activeSubTabIndex, setActiveSubTabIndex] = useState(0);

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    setActiveSubTabIndex(0); 
  };

  const handleSubTabChange = (index) => {
    setActiveSubTabIndex(index);
  };

  const navigationData = {
    depth1Title: "고객지원",
    depth: [
      {
        depth2: "이용안내",
      },
      {
        depth2: "이용가이드",
        active: true,
      }
    ],
  };

  const breadcrumbItems = [
    { label: "고객지원", link: "#" },
    { label: "이용안내", link: "#" },
    { label: "이용가이드", link: "#" },
  ];

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
        <div className="contents w-full">
            <Breadcrumb items={breadcrumbItems} />
            <div className="page-title-wrap" data-type="responsive">
            <h2 className="h-tit">이용가이드</h2>
            </div>

            <div className="krds-tab-area layer">
                <p className="guide-txt custom mb-40">중소벤처24의 주요 기능과 이용 절차를 안내합니다.</p>
                <Tab tabData={tabData.current} onTabChange={handleTabChange}  />
                
                <div className="tab-conts-wrap mt-40">
                    <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
                        <h3 className="sr-only">주요서비스</h3>
                        <Tab key={activeTabIndex} tabData={subTabData.current} onTabChange={handleSubTabChange} type="small"  />
                            <div className="tab-conts-wrap">
                                <div className={`tab-conts ${activeSubTabIndex === 0 ? 'active' : ''}`}>
                                    <h4 className="sr-only">지원사업소개</h4>
                                    <div className="conts-wrap">
                                        <h4 className="sec-tit2">지원사업 소개</h4>
                                        <p className="cont-desc">개별 웹사이트에서 각각 신청해야 했던 중소벤처기업부 지원사업 10개 분야 (금융, 기술, 인력, 수출, 내수, 창업, 경영, 소상공인, 중견, 기타)에 대해 중소벤처24 한 곳에서 조회, 신청할 수 있습니다.</p>
                                    </div>
                                    <ol className="main-step">
                                        <li>
                                            <ol className="sub-step">
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">1</span>사업 신청 화면으로 이동</strong>
                                                        <p className="sub-step-desc">
                                                            메인 페이지 및 상단 메뉴를 통해 지원사업 조회를 클릭합니다.
                                                        </p>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab1_01} alt="" className="img-pc" />
                                                            <img src={GuideTab1_01_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">2</span>지원사업 검색 방법</strong>
                                                        <ol className="sub-step-desc">
                                                            <li>공고명, 소관부처, 지자체 등 키워드를 입력하고, 검색 버튼을 클릭해서 원하는 사업공고를 조회할 수 있습니다.</li>
                                                            <li>상세검색 버튼을 클릭하여 분야 및 신청 상태 등 검색 조건을 추가할 수 있습니다.</li>
                                                        </ol>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab1_02} alt="" className="img-pc" />
                                                            <img src={GuideTab1_02_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">3</span>지원사업 상세 조회</strong>
                                                        <p className="sub-step-desc">
                                                            지원사업 공고 검색결과 리스트의 공고명을 클릭하여 상세정보를 조회할 수 있습니다.
                                                        </p>
                                                        <div className="img-box">
                                                            <img src={GuideTab1_03} alt="" className="img-pc" />
                                                            <img src={GuideTab1_03_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                            </ol>
                                        </li>
                                    </ol>
                                </div>
                                <div className={`tab-conts ${activeSubTabIndex === 1 ? 'active' : ''}`}>
                                    <h4 className="sr-only">증명서 발급</h4>
                                    <div className="conts-wrap">
                                        <h4 className="sec-tit2">증명서 발급</h4>
                                        <p className="cont-desc">
                                            개별 사이트에서 각각 신청 및 발급된 증명/확인서를 중소벤처24 한 곳에서 편리하게 출력할 수 있습니다. 
                                            <br />
                                            증명서는 중소기업, 소상공인이 기업경영과 각종 입찰, 계약 추진시 필요한 증명/확인서를 의미합니다.
                                        </p>
                                    </div>
                                    <ol className="main-step">
                                        <li>
                                            <ol className="sub-step">
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">1</span>기업회원 로그인</strong>
                                                        <p className="sub-step-desc">
                                                            인증/확인서는 기업회원만 신청/출력 가능하므로 중소벤처24에 기업회원으로 가입 후 로그인하시기 바랍니다.<br />
                                                            메뉴 또는 메인페이지의 증명서 관련 링크를 클릭하여 증명서 발급 화면으로 이동할 수 있습니다.
                                                        </p>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab2_01} alt="" className="img-pc" />
                                                            <img src={GuideTab2_01_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">2</span>증명서 발급 신청</strong>
                                                        <p className="sub-step-desc">발급받고자 하는 증명서 상세 안내 페이지 하단의 『증명서 발급』 버튼을 클릭하여 증명서 발급 신청을 할 수 있습니다. </p>
                                                        {/*
                                                        <ol className="sub-step-desc">
                                                            <li>다음 세 가지 방법으로 증명서 발급화면으로 이동할 수 있습니다.</li>
                                                            <li>1.메인 화면의 『자주찾는 증명서 발급』 중 원하는 증명서 아이콘 버튼을 클릭 후, 증명서 상세정보 하단의 『증명서발급』 버튼을 클릭합니다.</li>
                                                            <li>2.메인 메뉴의 『증명서 발급』 클릭 후 증명서 목록에서 원하는 증명서의 『발급』 버튼을 클릭합니다.</li>
                                                            <li>3.『증명서발급』 서브 메뉴에서 원하는 증명서를 선택 후, 증명서 상세정보 하단의 『증명서 발급』 버튼을 클릭합니다.</li>
                                                        </ol>
                                                        */}
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab2_02} alt="" className="img-pc" />
                                                            <img src={GuideTab2_02_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">3</span>증명서 발급 조회</strong>
                                                        <p className="sub-step-desc">
                                                            발급받은 증명서는 마이 비즈니스 &gt; 증명서 발급 조회 메뉴에서 출력하실 수 있습니다.<br />
                                                            증명서는 발급 완료 후 하루 동안 출력할 수 있으며, 익일 이후에는 다시 발급 신청을 해야 출력이 가능합니다.<br />
                                                            모바일에서는 PDF 파일 다운로드만 가능하므로, 인쇄를 원하실 경우 PC로 접속하여 출력을 진행해주시기 바랍니다.
                                                        </p>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab2_03} alt="" className="img-pc" />
                                                            <img src={GuideTab2_03_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">4</span>발급 진위 확인</strong>
                                                        <p className="sub-step-desc">
                                                            증명서발급 &gt; 발급 진위 확인 메뉴 선택 후 문서종류 및 문서확인번호 입력하여 진위확인을 할 수 있습니다.
                                                        </p>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab2_04} alt="" className="img-pc" />
                                                            <img src={GuideTab2_04_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                            </ol>
                                        </li>
                                    </ol>
                                </div>
                                <div className={`tab-conts ${activeSubTabIndex === 2 ? 'active' : ''}`}>
                                    <h4 className="sr-only">기관/기업 조회</h4>
                                    <div className="conts-wrap">
                                        <h4 className="sec-tit2">기관/기업 조회</h4>
                                        <p className="cont-desc">
                                            중소벤처24에서는 68개 유관 시스템 및 소재부품장비·뿌리기술·전문연구사업자 정보에 대한 조회 서비스를 제공합니다.
                                        </p>
                                    </div>
                                    <ol className="main-step">
                                        <li>
                                            <div className="main-step-tit mb-8">
                                                <strong><span className="number">1.</span>유관기관 정보 조회</strong>
                                                <p>68개 유관 시스템 정보를 조회할 수 있습니다.</p>
                                            </div>
                                            <ol className="sub-step">
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">1</span>유관시스템 둘러보기 화면 이동</strong>
                                                        <p className="sub-step-desc">메인 메뉴의 고객지원 &gt; 유관시스템 둘러보기 메뉴를 선택합니다.</p>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab3_01} alt="" className="img-pc" />
                                                            <img src={GuideTab3_01_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">2</span>유관시스템(유관기관 서비스) 조회</strong>
                                                        <p className="sub-step-desc">
                                                            유관기관 카테고리를 선택하고, 기관명 또는 서비스명 키워드를 입력하여 찾고자 하는 유관시스템을 검색할 수 있습니다.
                                                        </p>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab3_02} alt="" className="img-pc" />
                                                            <img src={GuideTab3_02_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                            </ol>
                                        </li>
                                        <li>
                                            <div className="main-step-tit mb-8">
                                                <strong><span className="number">2.</span>전문기업 조회</strong>
                                                <p>소재부품장비 전문기업, 뿌리기술기업, 전문연구사업자 분야별 인증받은 기업정보를 조회할 수 있습니다.</p>
                                            </div>
                                            <ol className="sub-step">
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">1</span>전문기업 조회 화면이동</strong>
                                                        <p className="sub-step-desc">메인 메뉴의 증명서 발급 &gt; 소재부품장비·뿌리기술·전문연구사업자 조회 메뉴를 클릭합니다.</p>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab3_03} alt="" className="img-pc" />
                                                            <img src={GuideTab3_03_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">2</span>전문기업 검색</strong>
                                                        <p className="sub-step-desc">
                                                            전문기업 조회 화면에서 기업 카테고리 선택 및 기업 검색 기능을 통해 원하는 전문기업 조회가 가능합니다.
                                                        </p>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab4_02} alt="" className="img-pc" />
                                                            <img src={GuideTab4_02_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                            </ol>
                                        </li>
                                    </ol>
                                </div>
                                <div className={`tab-conts ${activeSubTabIndex === 3 ? 'active' : ''}`}>
                                    <h4 className="sr-only">정책금융안내</h4>
                                    <div className="conts-wrap">
                                        <h4 className="sec-tit2">정책금융안내</h4>
                                        <p className="cont-desc">
                                            9개의 정책금융기관(중소벤처기업진흥공단, 기술보증기금, 한국산업은행, 중소기업은행, 한국수출입은행, 신용보증기금, 한국무역보험공사, 지역신용보증재단, 소상공인시장진흥공단)에서 제공하는 정책금융 정보를 조회할 수 있습니다.
                                        </p>
                                    </div>
                                    <ol className="main-step">
                                        <li>
                                            <ol className="sub-step">
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">1</span>정책금융 화면으로 이동</strong>
                                                        <p className="sub-step-desc">메인 및 상단 메뉴를 통해 지원사업 &gt; 정책금융 메뉴를 선택합니다.</p>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab4_01} alt="" className="img-pc" />
                                                            <img src={GuideTab4_01_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">2</span>정책금융 정보 검색</strong>
                                                        <p className="sub-step-desc">
                                                            정책금융 카테고리를 선택하고, 정책금융 검색 기능을 통해 원하는 정책금융 정보를 조회할 수 있습니다.
                                                        </p>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab4_02} alt="" className="img-pc" />
                                                            <img src={GuideTab4_02_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="img-box">
                                                        <strong className="sub-step-tit"><span className="number">3</span>정책금융 정보 상세 조회</strong>
                                                        <p className="sub-step-desc">
                                                            검색결과 정책금융 정보를 클릭하면 해당 정책금융 상세정보를 확인할 수 있습니다.
                                                        </p>
                                                        <div className="box md default mt-8 text-center">
                                                            <img src={GuideTab4_03} alt="" className="img-pc" />
                                                            <img src={GuideTab4_03_Mo} alt="" className="img-mo" />
                                                        </div>
                                                    </div>
                                                </li>
                                            </ol>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                    </section>
                
                    <section className={`tab-conts ${activeTabIndex === 1 ? 'active' : ''}`}>
                        <h3 className="sr-only">회원 서비스</h3>
                    </section>
                </div>
            </div>
        </div> 
    </>
  );
};

export default UI_USR_R_360;