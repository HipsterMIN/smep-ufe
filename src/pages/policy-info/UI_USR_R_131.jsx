import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_L_210 = () => {

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
          <p className="on-p1 on-colorblue">중소벤처기업부 법정민원신청</p>
          <h2 className="h-tit">
            중소기업협동조합 해산신고 지방조합, 사업조합, 지역연합회
          </h2>
        </div>

        <div className="conts-wrap mt-48">
          <h3 className="sec-tit2">민원안내</h3>
          <ul className="krds-info-list decimal mt-12" role="list">
            <li role="listitem">신청방법 : 인터넷, 방문, 우편</li>
            <li role="listitem">처리기간 : 유형에 따라 다름</li>
            <li role="listitem">수수료 : 수수료 없음</li>
            <li role="listitem">신청서 : 조합 해산신고서(중소기업협동조합법 시행규칙 : 별지서식 5호)</li>
            <li role="listitem">신청자격 : 누구나 신청 가능</li>
          </ul>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit2">기본정보</h3>
          <p className="conts-desc">이 민원은 중소기업협동조합 설립인가를 받은 자가 해산하고자 할 때 신고하여야 하는 민원입니다.</p>
          <ul className="krds-info-list decimal mt-12" role="list">
            <li role="listitem">접수 및 처리기관 (방문시) : 지방조합,사업조합,지역연합회 | 즉시(근무시간 내 3시간), 전국조합,업종연합회 | 즉시(근무시간 내 3시간)</li>
            <li role="listitem">신청 시 같이 제출 해야하는 서류(구비서류) : 해산을 결의한 총회의 의사록 2부</li>
          </ul>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit2">기본정보</h3>
          <p className="conts-desc">이 민원은 중소기업협동조합 설립인가를 받은 자가 해산하고자 할 때 신고하여야 하는 민원입니다.</p>
          <ul className="krds-info-list decimal mt-12" role="list">
            <li role="listitem">접수 및 처리기관 (방문시) : 지방조합,사업조합,지역연합회 | 즉시(근무시간 내 3시간), 전국조합,업종연합회 | 즉시(근무시간 내 3시간)</li>
            <li role="listitem">신청 시 같이 제출 해야하는 서류(구비서류) : 해산을 결의한 총회의 의사록 2부</li>
          </ul>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit2">민원안내</h3>
          <ul className="krds-info-list decimal mt-12" role="list">
            <li role="listitem">근거법령 : 중소기업협동조합법 ( 제63조제2항 ), 중소기업협동조합법 시행규칙 ( 제5조 제1항 별지 5호 )</li>
            <li role="listitem">
              제도를 담당하는 기관 : 중소벤처기업부 정책총괄과 042-481-4590
              <div className="helper-box refer mt-16">
                <p className="helper-tit has-icon">참고</p>
                <div className="helper-desc-wrap">
                  <p>
                    위 담당부서와 전화번호는 이 민원의 제도를 담당하고 있는 (중앙)행정기관입니다. 개별 민원에 대한 문의 사항은 접수·처리기관(관할처리기관)과 연락하시기 바랍니다.
                  </p>
                </div>
              </div>
            </li>
            <li role="listitem">최근 내용 변경일 : 2017.09.20.</li>
          </ul>
        </div>

        {/* bottom btn */}
        <div className="onboard-btm-btngroup bt-0">
          <div> 
            <button type="button" className="krds-btn tertiary xlarge">
              목록
            </button>
          </div>
          <div> 
            <button type="button" className="krds-btn xlarge">
              신청하기
              <i className="svg-icon ico-page-next"></i>
            </button>
          </div>
        </div>



      </div> 
    </>
  );
};

export default UI_USR_L_210;
