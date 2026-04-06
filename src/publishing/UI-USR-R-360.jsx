import React, { useRef, useState } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";

// tab1
import GuideTab1_02 from '@assets/sub/guide_tab1_02_pc.png';
import GuideTab1_03 from '@assets/sub/guide_tab1_03_pc.png';
import GuideTab1_05 from '@assets/sub/guide_tab1_05_pc.png';
import GuideTab1_06 from '@assets/sub/guide_tab1_06_pc.png';
/* mo img */
import GuideTab1_02_Mo from '@assets/sub/guide_tab1_02_mo.png';
import GuideTab1_03_Mo from '@assets/sub/guide_tab1_03_mo.png';
import GuideTab1_05_Mo from '@assets/sub/guide_tab1_05_mo.png';
import GuideTab1_06_Mo from '@assets/sub/guide_tab1_06_mo.png';

// tab2
import GuideTab2_02 from '@assets/sub/guide_tab2_02_pc.png';
import GuideTab2_03 from '@assets/sub/guide_tab2_03_pc.png';
import GuideTab2_04 from '@assets/sub/guide_tab2_04_pc.png';

///tab3
import GuideTab3_01 from '@assets/sub/guide_tab3_01_pc.png'
import GuideTab3_02 from '@assets/sub/guide_tab3_02_pc.png'
import GuideTab3_03 from '@assets/sub/guide_tab3_03_pc.png'

// tab5
import GuideTab5_02 from '@assets/sub/guide_tab5_02_pc.png'
import GuideTab5_03 from '@assets/sub/guide_tab5_03_pc.png'



const UI_USR_R_360 = () => {
  const tabData = useRef(['주요서비스', '회원서비스']);
  const subTabData = useRef(['지원사업소개', '증명서 발급', '기관/기업 조회', '유관시스템', '정책금융안내']);
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
                      <p className="cont-desc">개별 웹사이트에서 각각 신청해야 했던 중소벤처기업부 지원사업 중 6개 분야 <br />(소상공인, 기술, 창업, 경영, 보증, 정책자금)에 대해 중소벤처24 한 곳에서 조회, 신청할 수 있습니다.</p>
                    </div>
                    <ol className="main-step">
                      <li>
                        <div className="main-step-tit">
                          <strong><span className="number">1.</span>지원사업 조회</strong>
                          <p>중소벤처기업부에서 제공하는 정책정보를 조회할 수 있습니다.</p>
                        </div>
                        <div className="img-box">
                          <img src="" alt="" className="img-pc" />
                          <img src="" alt="" className="img-mo" />
                        </div>
                        <ol className="sub-step">
                          <li>
                            <strong className="sub-step-tit"><span className="number">1</span>사업 신청 화면으로 이동</strong>
                            <p className="sub-step-desc">메인 페이지 및 상단 메뉴를 통해 지원사업 조회를 클릭합니다.</p>
                            <div className="img-box">
                              <img src={GuideTab1_02} alt="" className="img-pc" />
                              <img src={GuideTab1_02_Mo} alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">2</span>지원사업 검색 방법</strong>
                            <ol className="sub-step-desc">
                              <li>1.사업유형별/지원기관별 아이콘을 선택하고 『검색』버튼을 클릭해서 원하는 분류의 사업을 조회하실 수 있습니다.</li>
                              <li>2.분류방식에 의한 검색뿐 아니라, 검색어 입력으로 정확도를 높이는 통합검색을 하실 수 있습니다</li>
                            </ol>
                            <div className="img-box">
                              <img src={GuideTab1_03} alt="" className="img-pc" />
                              <img src={GuideTab1_03_Mo} alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">3</span>지원사업 정보 상세</strong>
                            <p className="sub-step-desc">목록에서 사업을 선택하여 사업개요와 신청절차 등 사업에 대한 상세정보를 확인 하실 수 있습니다.</p>
                          </li>
                        </ol>
                      </li>
                      
                      <li>
                        <div className="main-step-tit">
                          <strong><span className="number">2.</span>지원사업 신청</strong>
                          <p>중소벤처기업부 운영 6개 분야별 사이트(소상공인, 기술, 창업, 경영, 보증, 정책자금)에서 제공하는 공고정보입니다.</p>
                        </div>
                        <div className="img-box">
                          <img src="" alt="" className="img-pc" />
                          <img src="" alt="" className="img-mo" />
                        </div>  
                        <ol className="sub-step">
                          <li>
                            <strong className="sub-step-tit"><span className="number">1</span>지원사업 신청 화면으로 이동</strong>
                            <ol className="sub-step-desc">
                              <li>1.사업유형별/지원기관별 아이콘을 선택하고 『검색』버튼을 클릭해서 원하는 분류의 사업을 조회하실 수 있습니다.</li>
                              <li>2.분류방식에 의한 검색뿐 아니라, 검색어 입력으로 정확도를 높이는 통합검색을 하실 수 있습니다</li>
                            </ol>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">2</span>신청가능사업 공고 목록</strong>
                            <p className="sub-step-desc">사업유형, 신청가능사업, 신청기간 별로 지원사업 공고를 조회하실 수 있습니다.</p>
                            <div className="img-box">
                              <img src={GuideTab1_05} alt="" className="img-pc" />
                              <img src={GuideTab1_05_Mo} alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">3</span>공고(지원사업) 정보 상세</strong>
                            <p className="sub-step-desc">공고(지원사업) 신청은 『신청하기』 버튼을 클릭하여 해당 사이트에서 신청할 수 있습니다.</p>
                            <div className="img-box">
                              <img src={GuideTab1_06} alt="" className="img-pc" />
                              <img src={GuideTab1_06_Mo} alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">4</span>공고(지원사업) 신청이력</strong>
                            <p className="sub-step-desc">마이페이지 > 서비스이용이력 > 지원사업 메뉴 선택 후 지원사업 신청 현황을 확인할 수 있습니다.</p>
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
                        개별 사이트에서 각각 신청 및 발급된 증명/확인서를 중소벤처24 한 곳에서 편리하게 출력할 수 있습니다. <br />증명서는 중소기업, 소상공인이 기업경영과 각종 입찰, 계약 추진시 필요한 증명/확인서를 의미합니다.
                      </p>
                    </div>
                    <ol className="main-step">
                      <li>
                        <div className="main-step-tit">
                          <strong><span className="number">1.</span>증명서 발급</strong>
                        </div>
                        <ol className="sub-step">
                          <li>
                            <strong className="sub-step-tit"><span className="number">1</span>기업회원 로그인</strong>
                            <p className="sub-step-desc">인증/확인서는 기업회원만 신청/출력 가능하므로 중소벤처24에 기업회원으로 가입 후 로그인하시기 바랍니다.</p>
                            <div className="img-box">
                              <img src="" alt="" className="img-pc" />
                              <img src="" alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">2</span>증명서 발급 화면으로 이동</strong>
                            <ol className="sub-step-desc">
                              <li>다음 세 가지 방법으로 증명서 발급화면으로 이동할 수 있습니다.</li>
                              <li>1.메인 화면의 『자주찾는 증명서 발급』 중 원하는 증명서 아이콘 버튼을 클릭 후, 증명서 상세정보 하단의 『증명서발급』 버튼을 클릭합니다.</li>
                              <li>2.메인 메뉴의 『증명서 발급』 클릭 후 증명서 목록에서 원하는 증명서의 『발급』 버튼을 클릭합니다.</li>
                              <li>3.『증명서발급』 서브 메뉴에서 원하는 증명서를 선택 후, 증명서 상세정보 하단의 『증명서 발급』 버튼을 클릭합니다.</li>
                            </ol>
                            <div className="img-box">
                              <img src={GuideTab2_02} alt="" className="img-pc" />
                              <img src="" alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">3</span>증명서 신청 및 인쇄</strong>
                            <p className="sub-step-desc">기업정보 확인 후 『증명서 발급』 버튼을 클릭하여 발급기관 사이트로 이동 후 증명/확인서 발급 신청을 합니다. <br />발급 대상이 확인되면, 발급 완료 후 하루 동안 출력할 수 있으며, 익일 이후에는 다시 발급 신청을 해야 출력이 가능합니다. <br />모바일에서는 PDF 파일 다운로드만 가능하므로, 인쇄를 원하실 경우 PC로 접속하여 출력을 진행해주시기 바랍니다.</p>
                            <div className="img-box">
                              <img src={GuideTab2_03} alt="" className="img-pc" />
                              <img src="" alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">4</span>증명/확인서 이력조회</strong>
                            <p className="sub-step-desc">
                              다음 두 가지 방법으로 이력을 확인할 수 있습니다. <br />
                              1.마이 페이지 > 서비스 이용이력 > 증명서 메뉴에서 발급이력을 확인하고 출력할 수 있습니다.
                            </p>
                            <div className="img-box">
                              <img src={GuideTab2_04} alt="" className="img-pc" />
                              <img src="" alt="" className="img-mo" />
                            </div>
                          </li>
                           <li>
                            <strong className="sub-step-tit"><span className="number">5</span>발급 진위확인</strong>
                            <p className="sub-step-desc">증명서발급 > 발급 진위 확인 메뉴 선택 후 문서종류 및 문서확인번호 입력하여 진위확인을 할 수 있습니다.</p>
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
                        중소벤처기업진흥공단, 소상공인시장진흥공단, 신용보증재단중앙회, 기술보증기금, 신용보증기금 등 5개 기관에서 제공하는 정책자금 정보 뿐 아니라 기업지원기관 정보, 전문기업 정보, 우수기업 지원사례를 중소벤처24 한 곳에서 조회할 수 있습니다.
                      </p>
                    </div>
                    <ol className="main-step">
                      <li>
                        <div className="main-step-tit">
                          <strong><span className="number">1.</span>지원기관 안내</strong>
                          <p>R&D지원, 자금지원, 경영지원, 창업지원, 판로지원 분야별 각 지원기관에 소속된 기업지원기관을 조회할 수 있습니다.</p>
                        </div>
                        <ol className="sub-step">
                          <li>
                            <strong className="sub-step-tit"><span className="number">1</span>지원기관 화면이동</strong>
                            <p className="sub-step-desc">메인 메뉴의 더 많은 서비스 > 더 많은 서비스 전체보기 메뉴를 선택합니다.</p>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">2</span>지원기관 조회</strong>
                            <ol className="sub-step-desc">
                              <li>1.분야별(R&D지원, 자금지원, 경영지원, 창업지원, 판로지원) 및 기관명으로 조회할 수 있습니다.</li>
                              <li>2.전체 지역 및 지도상에서 특정지역을 선택하여 조회할 수 있습니다.</li>
                            </ol>
                            <div className="img-box">
                              <img src={GuideTab3_01} alt="" className="img-pc" />
                              <img src="" alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">3</span>지원기관 상세</strong>
                            <p className="sub-step-desc">지원기관목록에서 기관명을 선택하여 기관에 대한 상세정보를 확인할 수 있습니다.</p>
                          </li>
                        </ol>
                      </li>
                      <li>
                        <div className="main-step-tit">
                          <strong><span className="number">2.</span>전문기업 조회</strong>
                          <p>소재부품장비 전문기업, 뿌리기술기업, 전문연구사업자 분야별 인증받은 기업정보를 조회할 수 있습니다.</p>
                        </div>
                        <ol className="sub-step">
                          <li>
                            <strong className="sub-step-tit"><span className="number">1</span>전문기업 화면이동</strong>
                            <p className="sub-step-desc">메인 메뉴의 더 많은 서비스 > 소재부품장비·뿌리기술·전문연구사업자 조회 메뉴를 선택합니다.</p>
                            <div className="img-box">
                              <img src={GuideTab3_02} alt="" className="img-pc" />
                              <img src="" alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">2</span>지원기관 조회</strong>
                            <ol className="sub-step-desc">
                              <li>1.분야별(소재부품장비 전문기업, 뿌리기술기업, 전문연구사업자) 및 기업명, 업종별로 조회할 수 있습니다.</li>
                              <li>2.전체 지역 및 지도상에서 특정지역을 선택하여 조회할 수 있습니다.</li>
                            </ol>
                            <div className="img-box">
                              <img src={GuideTab3_03} alt="" className="img-pc" />
                              <img src="" alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">3</span>전문기업 상세</strong>
                            <p className="sub-step-desc">기업목록에서 선택하여 전문기업에 대한 상세정보를 확인할 수 있습니다.</p>
                          </li>
                        </ol>
                      </li>
                    </ol>
                  </div>
                  <div className={`tab-conts ${activeSubTabIndex === 3 ? 'active' : ''}`}>
								    <h4 className="sr-only">유관시스템</h4>
                    4
                  </div>
                  <div className={`tab-conts ${activeSubTabIndex === 4 ? 'active' : ''}`}>
								    <h4 className="sr-only">정책금융안내</h4>
                    <div className="conts-wrap">
                      <h4 className="sec-tit2">정책금융안내</h4>
                      <p className="cont-desc">9개의 정책금융기관(중소벤처기업진흥공단, 기술보증기금, 한국산업은행, 중소기업은행, 한국수출입은행, 신용보증기금, 한국무역보험공사, 지역신용보증재단, 소상공인시장진흥공단)에서 제공하는 정책금융 정보를 조회할 수 있습니다.</p>
                    </div>
                    <ol className="main-step">
                      <li>
                        <div className="main-step-tit">
                          <strong><span className="number">1.</span>정책금융안내 이용 방법</strong>
                        </div>
                        <div className="img-box">
                          <img src="" alt="" className="img-pc" />
                          <img src="" alt="" className="img-mo" />
                        </div>
                        <ol className="sub-step">
                          <li>
                            <strong className="sub-step-tit"><span className="number">1</span>정책금융 화면으로 이동</strong>
                            <p className="sub-step-desc">메인 및 상단 메뉴를 통해 지원사업 > 정책금융 메뉴를 선택합니다.</p>
                            <div className="img-box">
                              <img src={GuideTab5_02} alt="" className="img-pc" />
                              <img src="" alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">2</span>정책금융안내 검색 방법</strong>
                            <ol className="sub-step-desc">
                              <li>1.전체, 융자, 보증, 보험 탭을 클릭해서 원하는 분류의 정책금융 정보를 조회할 수 있습니다.</li>
                              <li>2.검색어 입력으로 정확도를 높이는 통합 검색을 하실 수 있으며, 검색 후 결과 내 재검색을 통해 원하는 정보를 조회할 수 있습니다.</li>
                            </ol>
                            <div className="img-box">
                              <img src={GuideTab5_03} alt="" className="img-pc" />
                              <img src="" alt="" className="img-mo" />
                            </div>
                          </li>
                          <li>
                            <strong className="sub-step-tit"><span className="number">3</span>정책금융안내 정보 상세</strong>
                            <p className="sub-step-desc">목록에서 정책금융 정보를 클릭하여 상품안내 및 문의 등 상품에 대한 상세정보를 확인 하실 수 있습니다.</p>
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