import React, { useState } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Popup from "../components/ui/Popup";

const UI_USR_R_121 = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
    { label: "정책정보", link: "#" },
    { label: "품목·인증·규제", link: "#" },
    { label: "품목별 법정의무 인증제도", link: "#" },
  ];

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className='contents'>
        <Breadcrumb items={breadcrumbItems} />
        <div className='page-title-wrap' data-type='responsive'>
          <p className='on-p1 on-colorblue'>품목별 법정의무 인증제도</p>
          <h2 className='h-tit2'>어린이제품 안전인증</h2>
        </div>
        <ul className='onboard-summary'>
          <li>
            <span className='sr-only'>작성일</span>
            <span>2025.12.29</span>
          </li>
          <li>
            <span>
              <span className='sr-only'>조회수</span>
              <i className='svg-icon ico-scrap'></i>
              36
            </span>
          </li>
          <li>
            <span>
              <span className='sr-only'>스크랩수</span>
              <i className='svg-icon ico-pw-visible-on'></i>0
            </span>
          </li>
        </ul>
        <div className='def-list-wrap'>
          <dl className='def-list'>
            <dt>분야</dt>
            <dd>안전</dd>
            <dt>소관부처</dt>
            <dd>보건복지부</dd>
            <dt>사업수행기관</dt>
            <dd>
              ☐ 개요
              <br />
              안전인증대상어린이제품의 제조업자 또는 수입업자가 출고 전 또는
              통관 전에 모델별로 안전인증기관으로부터 안전인증(제품검사와
              공장심사를 하여 어린이제품에 대한 안전성을 증명하는 것)을 받아야
              하는 제도
            </dd>
            <dt>법적근거</dt>
            <dd>어린이제품 안전 특별법</dd>
            <dt>인증제도 상세정보</dt>
            <dd>
              <a
                className='krds-btn tertiary xsmall'
                target='_blank'
                title='새 창 열림'
              >
                바로가기
                <i className='svg-icon ico-go'></i>
              </a>
            </dd>
            <dt>대상 품목</dt>
            <dd>
              <div className='krds-tag-wrap'>
                <span className='krds-btn-tag'>어린이용 물놀이기구</span>
                <span className='krds-btn-tag'>어린이 놀이기구</span>
                <span className='krds-btn-tag'>유아용 섬유제품</span>
                <span className='krds-btn-tag'>합성수지제 어린이제품</span>
                <span className='krds-btn-tag'>자동차용 어린이 보호장치</span>
                <span className='krds-btn-tag'>어린이용 비비탄총</span>
                <span className='krds-btn-tag'>어린이용 스케이트보드</span>
                <button
                  type='button'
                  className='krds-btn text primary xsmall ml-8'
                  onClick={() => setIsPopupOpen(true)}
                >
                  더보기
                  <i className='svg-icon ico-plus'></i>
                </button>
                {/* Popup [S] */}
                <Popup
                  isOpen={isPopupOpen}
                  onClose={() => setIsPopupOpen(false)}
                  title='어린이제품 안전인증'
                  noBottomBtn={true}
                >
                  <div className='on-flexcolumn gap12'>
                    <h3 className='on-p4'>대상 품목 목록</h3>
                    <p className='on-colorblue2'>
                      ※ Ctrl + F키를 활용하시면 품목 검색이 가능합니다.
                    </p>
                    <div className='krds-tag-wrap bg col-3'>
                      <span className='krds-btn-tag'>어린이용 물놀이기구</span>
                      <span className='krds-btn-tag'>어린이 놀이기구</span>
                      <span className='krds-btn-tag'>유아용 섬유제품</span>
                      <span className='krds-btn-tag'>합성수지제 어린이제품</span>
                      <span className='krds-btn-tag'>자동차용 어린이 보호장치</span>
                      <span className='krds-btn-tag'>어린이용 비비탄총</span>
                      <span className='krds-btn-tag'>어린이용 스케이트보드</span>
                      <span className='krds-btn-tag'>어린이용 물놀이기구</span>
                      <span className='krds-btn-tag'>어린이 놀이기구</span>
                      <span className='krds-btn-tag'>유아용 섬유제품</span>
                      <span className='krds-btn-tag'>합성수지제 어린이제품</span>
                      <span className='krds-btn-tag'>자동차용 어린이 보호장치</span>
                      <span className='krds-btn-tag'>어린이용 비비탄총</span>
                      <span className='krds-btn-tag'>어린이용 스케이트보드</span>
                      <span className='krds-btn-tag'>어린이용 물놀이기구</span>
                      <span className='krds-btn-tag'>어린이 놀이기구</span>
                      <span className='krds-btn-tag'>유아용 섬유제품</span>
                      <span className='krds-btn-tag'>합성수지제 어린이제품</span>
                      <span className='krds-btn-tag'>자동차용 어린이 보호장치</span>
                      <span className='krds-btn-tag'>어린이용 비비탄총</span>
                      <span className='krds-btn-tag'>어린이용 스케이트보드</span>
                      <span className='krds-btn-tag'>어린이용 스케이트보드</span>
                    </div>
                  </div>
                </Popup>
                {/* Popup [E] */}
              </div>
            </dd>
          </dl>
        </div>

        <div className='onboard-btm-btngroup'>
          <div>
            <button type='button' className='krds-btn tertiary xlarge'>
              목록
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UI_USR_R_121;
