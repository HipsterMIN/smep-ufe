import React, { useRef } from "react";
import { Link } from 'react-router-dom';
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";

const UI_USR_R_031 = () => {
   const shadowTextRef = useRef(null);
  const shadowTextRef2 = useRef(null);
  const shadowTextRef3 = useRef(null);
   

  const handleToggleTextShadow = () => {
    shadowTextRef.current.classList.toggle('on');
  }

  const handleToggleTextShadow2 = () => {
    shadowTextRef2.current.classList.toggle('on');
  }

  const handleToggleTextShadow3 = () => {
    shadowTextRef2.current.classList.toggle('on');
  }


  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
      {
        depth2: "AI 스마트 통합 검색",
      },
      {
        depth2: "중소벤처기업부 지원사업 소개",
      },
      {
        depth2: "사업공고",
      },
      {
        depth2: "정책금융",
        active: true,
        depth3: [
          {
            label: "정책금융안내",
            link: "/",
            active: true,
          },
        ],
      },
      {
        depth2: "증명서발급",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "신청·발급", link: "#" },
    { label: "정책금융", link: "#" },
    { label: "정책금융안내", link: "#" },
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
          <p className="on-p1 on-colorblue">정책금융안내</p>
          <h2 className="h-tit2">혁신성장지원자금</h2>
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

        <div className="conts-desc">
          사업성과 기술성이 우수한 성장유망 중소기업의 생산성 향상, 고부가가치화 등 경쟁력 강화에 필요한 자금을 지원하여 성장동력을 창출하는 사업입니다.
        </div>

        <div className="on-announcement">
          <div className="on-announcement-inner">
            <h4 className="announcement-title"><i className="svg-icon ico-building"></i> 중소벤처기업진흥공단</h4>
            <div className="announcement-info">
              <div className="announcement-item">
                <strong className="announcement-title"><i className="svg-icon ico-search-custom"></i>자금용도</strong>
                <p className="announcement-text">시설·운전자금</p>
              </div>
              <div className="announcement-item">
                <strong className="announcement-title"><i className="svg-icon ico-coin"></i>대출한도</strong>
                <p className="announcement-text">시설60억/운전5억</p>
              </div>
              <div className="announcement-item">
                <strong className="announcement-title"><i className="svg-icon ico-graph"></i>기업규모</strong>
                <p className="announcement-text">중소기업</p>
              </div>
            </div>
            <div className="ac">
              <Link to="#" className="krds-btn secondary large  krds-btn-shadow">
                <i className="svg-icon ico-information"></i>   
                상세정보
              </Link>
              <Link to="#" className="krds-btn secondary large  krds-btn-shadow">
                <i className="svg-icon ico-faq"></i>   
                문의하기
              </Link>
              <Link to="#" className="krds-btn primary large krds-btn-shadow">
                신청하기
              </Link>
            </div>
          </div>
        </div>

        <div className="krds-tag-wrap mt-24">
          <span className="krds-btn-tag">#혁신성장</span>
          <span className="krds-btn-tag">#혁신성장</span>
          <span className="krds-btn-tag">#혁신성장</span>
          <span className="krds-btn-tag">#혁신성장</span>
          <span className="krds-btn-tag">#혁신성장</span>
          <span className="krds-btn-tag">#혁신성장지원자금</span>
        </div>
          
          <div className="page-title-wrap on-btmline" data-type="responsive">
            <h3 className="h-tit3">상품안내</h3>
            <p className="conts-desc mb-0">본 상품은 해당 금융기관에서 제공하는 정책금융 상품이며, 정확한 조건 및 한도는 금융기관을 통해 확인하시기 바랍니다.</p>
          </div>
          <div className="def-list-wrap">
            <dl className="def-list">
              {/* 1열에 4개 들어가는 구조 */}
              <div className="def-list-group">
                <dt>기업규모</dt>
                <dd>중소기업</dd>
                <dt>우대 기업 유형</dt>
                <dd>수출 , 벤처 , 혁신성장공동기준 , 여성 , 장애인 , 고용창출우수</dd>
              </div>
              <div className="def-list-group">
                <dt>신청방식</dt>
                <dd>온라인 신청</dd>
                <dt>융자방식</dt>
                <dd>직접대출 , 대리대출 , 성장공유형 , 투자조건부융자</dd>
              </div>
              <div className="def-list-group">
                <dt>대출한도</dt>
                <dd>시설 : 60억, 운전 : 5억</dd>
                <dt>대출기간</dt>
                <dd>시설 : 10년, 운전 : 5년</dd>
              </div>
              <div className="def-list-group">
                <dt>지원대상</dt>
                <dd>업력 7년 이상 중소기업</dd>
                <dt>업종</dt>
                <dd>
                    <div className="onshadow-text" ref={shadowTextRef}>
                      농업, 임업 및 어업(01~03), 광업(05~08), 제조업(10~34), 전기, 가스, 증기 및 공기 조절 공급업(35), 수도, 하수 및 폐기물 처리, 
                      원료 재생업(36~39), 건설업(41~42), 도매 및 소매업(45~47), 운수 및 창고업(49~52), 숙박 및 음식점업(55~56), 정보통신업(58~63), 
                      전문, 과학 및 기술 서비스업(70~73), 사업시설 관리, 사업 지원 및 임대 서비스업(74~76), 교육 서비스업(85), 보건업 및 사
                        농업, 임업 및 어업(01~03), 광업(05~08), 제조업(10~34), 전기, 가스, 증기 및 공기 조절 공급업(35), 수도, 하수 및 폐기물 처리, 
                      원료 재생업(36~39), 건설업(41~42), 도매 및 소매업(45~47), 운수 및 창고업(49~52), 숙박 및 음식점업(55~56), 정보통신업(58~63), 
                      전문, 과학 및 기술 서비스업(70~73), 사업시설 관리, 사업 지원 및 임대 서비스업(74~76), 교육 서비스업(85), 보건업 및 사
                    </div>
                    <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow" onClick={handleToggleTextShadow}>
                      전체보기 
                      <i className="svg-icon ico-angle"></i>                    
                    </button>
                </dd>
              </div>
              <div className="def-list-group">
                <dt>자금용도</dt>
                <dd>시설자금 , 운전자금</dd>
                <dt>우대조건</dt>
                <dd>
                  <div className="onshadow-text" ref={shadowTextRef2}>
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                  </div>
                  <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow" onClick={handleToggleTextShadow2}>
                    전체보기
                    <i className="svg-icon ico-angle"></i>
                  </button>
                </dd>
              </div>
              <div className="def-list-group">
                <dt>대출제한대상</dt>
                <dd>
                  <div className="onshadow-text" ref={shadowTextRef3}>
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                  </div>
                  <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow" onClick={handleToggleTextShadow3}>
                    전체보기
                    <i className="svg-icon ico-angle"></i>
                  </button>
                </dd>
              </div>
              {/* 1열에 4개 들어가는 구조 */}
              <div className="def-list-group">
                <dt>상환방법</dt>
                <dd>분할상환</dd>
                <dt>금리변동여부</dt>
                <dd>변동</dd>
              </div>
              <div className="def-list-group">
                <dt>문의</dt>
                <dd>1357(중소기업 통합콜센터) 1811-3655(정책자금 전담콜센터)</dd>
              </div>
              <div className="def-list-group">
                <dt>매출액</dt>
                <dd>중소기업 범위 기준</dd>
                <dt>업력</dt>
                <dd>7년 이상</dd>
              </div>
              <div className="def-list-group">
                <dt>관할 지역</dt>
                <dd>전 지역본지부</dd>
                <dt>기준금리</dt>
                <dd>정책자금 기준금리(변동) + 0.5%p</dd>
              </div>
              <div className="def-list-group">
                <dt>거치기간</dt>
                <dd>시설 : 4년, 운전 : 2년</dd>
              </div>
            </dl>
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
                관심공고
              </button>
              <button type="button" className="krds-btn tertiary xlarge">
                 <i className="svg-icon ico-faq"></i>    
                문의하기
              </button>
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

export default UI_USR_R_031;
