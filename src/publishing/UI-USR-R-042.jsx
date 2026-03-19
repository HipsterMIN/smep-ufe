import React from "react";
import { useState } from 'react';
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Popup from '../components/ui/Popup';

const UI_USR_R_042 = () => {
  // 팝업 동작
  const [isPopupOpen, setIsPopupOpen] = useState(false); 

  const navigationData = {
    depth1Title: "정책정보",
    depth: [
       {
        depth2: '정책리포트',
				active: true,
        depth3: [
          {
            label: '정책뉴스',
            link: '/',
						active: true
          },
          {
            label: '행사정보',
            link: '/',
						active: false
          },
          {
            label: '월간중기누리',
            link: '/',
						active: false
          },
        ],
      },
      {
        depth2: "중소벤처기업부 지원사업 소개",
        active: false,
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
    { label: "정책정보", link: "#" },
    { label: "정책리포트", link: "#" },
    { label: "정책뉴스", link: "#" },
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
          <h2 className="h-tit">직접생산확인증명서</h2>
        </div>

        <div className="conts-wrap">
          <div className="txt-box outline">
            <h4 className="outline-tit">알려드립니다.</h4>
            <ul className="check-list">
              <li>공공구매종합정보시스템을 통해 직접생산기업임을 확인 받은 기업에 한하여 증명서를 출력할 수 있습니다.</li>
              <li>신청 된 문서는 24시간 동안 출력할 수 있으며, 24시간 경과 후 삭제됩니다.</li>
              <li>아래 기업정보를 확인하신 후 출력버튼을 클릭해주세요.</li>
              <li>세부 품명이 많을 경우 출력의 제한이 있을 수 있으며, 공공구매종합정보시스템을 통해 출력하실 수 있습니다.</li>
              <li>발급된 전자증명서는 정부전자문서지갑에서 확인이 가능합니다.</li>
            </ul>
          </div>

          {/* input  */}
          <dl className="on-form-row mt-24 large ">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="id_01" className="form-label">사업자등록번호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-360">
                    <input type="text" id="id_01" className="krds-input small" placeholder="사업자등록번호를 입력해주세요" value="2288105280"  />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="id_02" className="form-label">상호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-360">
                    <input type="text" id="id_02" className="krds-input small" placeholder="상호를 입력해주세요" value="주식회사"  />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="id_03" className="form-label">대표자명 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-360">
                    <input type="text" id="id_03" className="krds-input small" placeholder="대표자명을 입력해주세요" value="홍길동"  />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="id_04" className="form-label">종사업장 번호<span className="on-required"><span className="sr-only">필수입력</span></span></label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-360">
                    <select id="id_04" className="krds-form-select small">
                      <option value="">선택해주세요.</option>
                    </select>
                  </div>
                </dd>
              </div>
          </dl>
        </div>

        <div className="conts-wrap mt-24">
          <h3 className="sec-tit">발급선택</h3>
          <div className="txt-box bg-white small">
            <ul className="select-list">
              <li>
                <div className="krds-form-check medium">
                  <input
                    type="radio"
                    name="radiogroup"
                    id="radio_01"
                  />
                  <label htmlFor="radio_01"><span className="code">CP2024001</span>상품1</label>
                </div>
                <button type="button" className="krds-btn small primary disabled">완료</button>
              </li>
              <li>
                <div className="krds-form-check medium">
                  <input
                    type="radio"
                    name="radiogroup"
                    id="radio_02"
                  />
                  <label htmlFor="radio_02">상품2</label>
                </div>
                <button type="button" className="krds-btn small primary disabled">완료</button>
              </li>
              <li>
                <div className="krds-form-check medium">
                  <input
                    type="radio"
                    name="radiogroup"
                    id="radio_03"
                  />
                  <label htmlFor="radio_03">상품3</label>
                </div>
                <button type="button" className="krds-btn small primary ">설문조사</button>
              </li>
              <li>
                <div className="krds-form-check medium">
                  <input
                    type="radio"
                    name="radiogroup"
                    id="radio_04"
                  />
                  <label htmlFor="radio_04">상품4</label>
                </div>
                <button type="button" className="krds-btn small primary ">설문조사</button>
              </li>
              <li>
                <div className="krds-form-check medium">
                  <input
                    type="radio"
                    name="radiogroup"
                    id="radio_05"
                  />
                  <label htmlFor="radio_05">상품5</label>
                </div>
                <button type="button" className="krds-btn small primary">설문조사</button>
              </li>
            </ul>
          </div>
        </div>

         <div className="onboard-btm-btngroup bt-0">
          <div>
            <button type="button" className="krds-btn tertiary xlarge">취소</button>
          </div>
          <div>
              <button type="button" className="krds-btn primary xlarge">
                전자문서지갑
              </button>
               <button type="button" className="krds-btn primary xlarge" onClick={() => setIsPopupOpen(true)} >
                <i className="svg-icon ico-print"></i> 출력 
              </button>
          </div>
        </div>
      </div>

      {/* 발급 용도 선택 팝업 */}
       <Popup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        size="small"
        noBottomBtn
      >
        <div className="confirm-guide">
          <span className="sub-title">용도 확인</span>
          <p className="main-title">전자증명서 발급 용도를 선택해주세요</p>

          <div className="purpose-selection">
            <button type="button" className="btn-purpose">
              <i className="ico-public"></i>
              <span>공공기관 입찰용</span>
            </button>
            
            <button type="button" className="btn-purpose">
              <i className="ico-other"></i>
              <span>공공기관 입찰 이외의 용도</span>
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_R_042;


