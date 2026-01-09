import React, { useRef } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";

const UI_USR_L_011 = () => {
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
        active: true,
        depth3: [
          {
            label: "지원사업 공고",
            link: "/",
            active: true,
          },
        ],
      },
      {
        depth2: "사업공고",
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
    { label: "중소벤처기업부 지원사업공고", link: "#" },
    { label: "지원사업 공고", link: "#" },
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
            <p className="on-p1 on-colorblue">지원사업공고</p>
            <h2 className="h-tit2">지원사업 공고</h2>
          </div>
          <ul className="onboard-summary">
            <li>
              <span className="sr-only">작성일</span>
              <span>2025.12.29</span>
            </li>
            <li>
              <span>
                <span className="sr-only">조회수</span>
                <i className="svg-icon ico-scrap"></i>
                36
              </span>
            </li>
            <li>
              <span>
                <span className="sr-only">스크랩수</span>
                <i className="svg-icon ico-pw-visible-on"></i>
                0
              </span>
            </li>
          </ul>
          <div className="def-list-wrap">
            <dl className="def-list">
              <dt>분야</dt>
              <dd>기술</dd>
              <dt>소관부처·지자체</dt>
              <dd>보건복지부</dd>
              <dt>사업수행기관</dt>
              <dd>
                  <div className="onshadow-text" ref={shadowTextRef}>
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                  </div>
                  <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow" onClick={handleToggleTextShadow}>
                    전체보기 
                    <i className="svg-icon ico-angle"></i>                    
                  </button>
              </dd>
              <dt>신청기간</dt>
              <dd>2025.12.24 ~ 2026.02.06</dd>
              <dt>사업신청 방법</dt>
              <dd>
                 <ul className="list">
                  <li>온라인 접수 (의료기기산업 종합정보시스템)</li>
                  <li>
                    <button type="button" className="krds-btn xsmall">
                      온라인 신청 바로가기 
                      <i className="svg-icon ico-angle right"></i>                    
                    </button>
                  </li>
                  <li>오프라인 신청</li>
                </ul>
              </dd>
              <dt>문의처</dt>
              <dd>국번 없이 129 (보건복지부 장애인자립기반과)</dd>
            </dl>
          </div>
          <div style={{ width: '100%', height: '800px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#fff", marginBottom: '48px' }}>
            PDF VIEWER
          </div>

          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">본문출력파일</p>
            <ul className="box-group-area">
              <li>
                <p className="tit">
                  <i className="svg-icon ico-file2"></i>
                  2026년 스마트 제조혁신 지원사업 사업설명회 추가 개최 안내.png
                </p>
                <div className="btn-wrap">
                  <a href="#" className="krds-btn medium link basic" target="_blank" title="새 창 열기"><i className="svg-icon ico-sch-plus"></i> 바로보기 </a>
                  <button type="button" className="krds-btn medium text on-colorblue"><i className="svg-icon ico-down on-bgcolorblue"></i> 다운로드 </button>
                </div>
              </li>
            </ul>
          </div>
          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">첨부파일</p>
            <ul className="box-group-area">
              <li>
                <p className="tit">
                  <i className="svg-icon ico-file2"></i>
                  2026년 스마트 제조혁신 지원사업 사업설명회 추가 개최 안내.png
                </p>
                <div className="btn-wrap">
                  <a href="#" className="krds-btn medium link basic" target="_blank" title="새 창 열기"><i className="svg-icon ico-sch-plus"></i> 바로보기 </a>
                  <button type="button" className="krds-btn medium text on-colorblue"><i className="svg-icon ico-down on-bgcolorblue"></i> 다운로드 </button>
                </div>
              </li>
              <li>
                <p className="tit">
                  <i className="svg-icon ico-file2"></i>
                  2026년 스마트 제조혁신 지원사업 사업설명회 추가 개최 안내.png
                </p>
                <div className="btn-wrap">
                  <a href="#" className="krds-btn medium link basic" target="_blank" title="새 창 열기"><i className="svg-icon ico-sch-plus"></i> 바로보기 </a>
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
               <button type="button" className="krds-btn secondary xlarge">
                <i className="svg-icon ico-faq"></i>     
                AI 상세 상담
              </button>
               <button type="button" className="krds-btn tertiary xlarge">
                 <i className="svg-icon ico-like"></i>    
                관심
              </button>
               <button type="button" className="krds-btn tertiary xlarge">
                <i className="svg-icon ico-copy"></i>    
                링크복사
              </button>
               <button type="button" className="krds-btn tertiary xlarge">
                출처바로가기
                <i className="svg-icon ico-angle right"></i>              
              </button>
            </div>
          </div>

          <div className="assess-question-wrap">
            <div className="assess-qu">이 페이지에 만족하시나요?</div>
            <div className="assess-an">
              <div className="krds-form-chip large">
                <input type="radio" className="radio" name="rdo_chip_size2" id="rdo_chip_lg2-1" checked="" />
                <label className="krds-form-chip-outline yes" for="rdo_chip_lg2-1">
                  네
                  <i className="svg-icon ico-smile"></i>
                </label>
              </div>
              <div className="krds-form-chip large">
                <input type="radio" className="radio" name="rdo_chip_size2" id="rdo_chip_lg2-2" />
                <label className="krds-form-chip-outline no" for="rdo_chip_lg2-2">
                  아니오
                  <i className="svg-icon ico-sad"></i>
                </label>
              </div>
            </div>
          </div>


      </div>
    </>
  );
};

export default UI_USR_L_011;
