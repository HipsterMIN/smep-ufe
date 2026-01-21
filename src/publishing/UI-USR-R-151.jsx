import React, { useRef } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";

const UI_USR_R_151 = () => {
  const shadowTextRef = useRef(null);

  const handleToggleTextShadow = () => {
    shadowTextRef.current.classList.toggle('on');
  }

  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
      {
        depth2: "AI 스마트 통합 검색",
      },
      {
        depth2: "중소벤처기업부 지원사업공고",
        
      },
      {
        depth2: "사업공고",
        active: true,
        depth3: [
          {
            label: "사업공고",
            link: "/",
            active: true,
          },
        ],
      },
      {
        depth2: "정책금융",
      },
      {
        depth2: "증명서 발급",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "신청·발급", link: "#" },
    { label: "사업공고", link: "#" },
    { label: "사업공고", link: "#" },
  ];

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap" data-type="responsive">
            <p className="on-p1 on-colorblue">주택특별공급 사업공고</p>
            <h2 className="h-tit2">(울산) '남울산 노르웨이숲' 중소기업 장기근속자 주택특별공급</h2>
          </div>
          <ul className="onboard-summary">
            <li>
              <span>주관기관: 중소벤처기업부</span>
            </li>
            <li>
              <span>진행상태: 신청 가능</span>
            </li>
          </ul>
          <div className="def-list-wrap">
            <dl className="def-list">
              <dt>사업개요</dt>
              <dd>
                  <div className="onshadow-text" ref={shadowTextRef}>
                      □ 공급 일정 (예정)<br/>
                       * (공고 및 모집) 2025. 12. 18(목) ~ 26(금) 18시<br/>
                       * (요건검토) 2025. 12. 29(월) ~ 2026. 1. 2(금)<br/>
                      * 중소기업 재직기간 주택소유여부 확인 등<br/>
                       * (입주자모집공고) 2026. 1. 16(금)<br/>
                       * (취하기간) 2026. 1. 16(금) ~ 19(월)<br/>
                      □ 공급 일정 (예정)<br/>
                       * (공고 및 모집) 2025. 12. 18(목) ~ 26(금) 18시<br/>
                       * (요건검토) 2025. 12. 29(월) ~ 2026. 1. 2(금)<br/>
                      * 중소기업 재직기간 주택소유여부 확인 등<br/>
                       * (입주자모집공고) 2026. 1. 16(금)<br/>
                       * (취하기간) 2026. 1. 16(금) ~ 19(월)<br/>
                      □ 공급 일정 (예정)<br/>
                       * (공고 및 모집) 2025. 12. 18(목) ~ 26(금) 18시<br/>
                       * (요건검토) 2025. 12. 29(월) ~ 2026. 1. 2(금)<br/>
                      * 중소기업 재직기간 주택소유여부 확인 등<br/>
                       * (입주자모집공고) 2026. 1. 16(금)<br/>
                       * (취하기간) 2026. 1. 16(금) ~ 19(월)<br/>
                  </div>
                  <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow" onClick={handleToggleTextShadow}>
                    전체보기 
                    <i className="svg-icon ico-angle"></i>                    
                  </button>
              </dd>
              <dt>지원대상</dt>
              <dd>
                 (1) 입주자모집 공고일 기준, 중소기업기본법* 제2조에 따른 현재 중소기업에 재직 중인 근로자<br/>
                   * 제외업종 : ①일반유흥 주점업 ②무도유흥주점업 ③기타 주점업 ④기타 사행 시설 관리 및 운영업 ⑤무도장 운영업<br/>
                 (2) 과거 근무경력을 포함하여 「중소기업기본법」제2조제1항에 따른 중소기업에서 재직 기간을 합해 5년(또는 동일한 중소기업 근무한 경우에는 3년)이상인 자<br/>
                 (3) 「근로기준법」제2조제1항제1호에 따라 임금을 목적으로 근로를 제공하는 자<br/>
                    (대표자 및 법인 임원* 제외)<br/>
                   * 다만, ①소기업(중소기업기본법 시행령 제8조) 재직 ②고용보험 가입 ③실질적 근로 제공(급여수령)시 이사 및 감사는 신청 가능<br/>
                 (4) 입주자 모집공고일 기준 무주택세대구성원인 자<br/>
                   * 본인과 세대원 전원이 무주택인 자여야 하며, 신청인의 배우자가 주민등록상 세대 분리된 경우에도 배우자 및 그 세대원을 포함<br/>
                 (5) 부산·울산·경남지역 거주자이며, 지역․면적별 예치금 기준 등 청약통장(종합저축, 청약저축) 가입 요건을 충족한 자(시행사 안내문 참고)
              </dd>
              <dt>신청기간</dt>
              <dd>
                2025-12-18 ~ 2025-12-26
              </dd>
              <dt>문의처</dt>
              <dd>
                  <div className="detail-list-wrap">
                    <div className="on-detail-list">
                      <dl>
                        <dt>기관추천</dt>
                        <dd className="w-150 flexsize-fix"><p>052-210-0062</p></dd>
                        <dt>청약, 무주택 요건</dt>
                        <dd><p>1644-7445(청약홈),1599-0001(국토부 콜센터)</p></dd>
                      </dl>
                      <dl>
                        <dt>시행사</dt>
                        <dd className="w-150 flexsize-fix"><p>052-256-0300</p></dd>
                        <dt>시스템오류</dt>
                        <dd><p>1661-7616</p></dd>
                      </dl>
                    </div>
                  </div>
              </dd>
            </dl>
          </div>
          <div style={{ width: '100%', height: '800px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#fff", marginBottom: '48px' }}>
            PDF VIEWER
          </div>

          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">공고문</p>
            <ul className="box-group-area">
              <li>
                <p className="tit">
                  <i className="svg-icon ico-file2"></i>
                  2026년 스마트 제조혁신 지원사업 사업설명회 추가 개최 안내.png
                </p>
                <div className="btn-wrap">
                  <a href="#" className="krds-btn medium link basic" target="_blank" title="새 창 열림"><i className="svg-icon ico-sch-plus"></i> 바로보기 </a>
                  <button type="button" className="krds-btn medium text on-colorblue"><i className="svg-icon ico-down on-bgcolorblue"></i> 다운로드 </button>
                </div>
              </li>
            </ul>
          </div>

          <div className="onboard-btm-btngroup">
            <div>
              <button type="button" className="krds-btn tertiary xlarge">
                목록
              </button>
            </div>
            <div>
              <button type="button" className="krds-btn tertiary xlarge">
                상세정보
                <i className="svg-icon ico-link"></i>    
              </button>
               <button type="button" className="krds-btn primary xlarge">
                신청하기
                <i className="svg-icon ico-angle right"></i>              
              </button>
            </div>
          </div>

      </div>
    </>
  );
};

export default UI_USR_R_151;
