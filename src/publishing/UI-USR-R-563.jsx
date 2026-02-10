import { useState } from 'react';
import {Link} from "react-router-dom";

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";

const UI_USR_R_563 = () => {

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
      },
      {
        depth2: "증명서발급",
        active: true,
        depth3: [
          {
            label: "증명서 발급",
            link: "/",
            active: true,
          },
        ],
      },
    ],
  };

  const breadcrumbItems = [
    { label: "약관 및 저작권", link: "#" },
    { label: "이용약관", link: "#" },
    { label: "", link: "#" },
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
          <h2 className="h-tit">웹접근성 정책</h2>
        </div>

        <div className="conts-wrap">
          <p className="conts-desc on-important">
            중소벤처기업부 기업마당 웹사이트는 장애인, 노인 등 정보취약계층에게 평등한 기회를 제공하고 새로운 기술 발전에 따른 인터페이스의 다양화와 효과적인 웹사이트 운용을 위해 2010년 12월 국가표준(KICS)으로 제정된 한국형 웹 콘텐츠 접근성 지침2.0(KICS.OT-0003R1)과 2009년 3월 공표된 "웹 접근성 향상을 위한 국가표준 기술 가이드라인"을 준수하여 구축, 운영하고있습니다.
          </p>
          <p className="conts-desc on-important">
            중소벤처기업부 기업마당 웹사이트는 국가표준에서 제시된 14개 항목을 기반으로 제작되어, 장애인들이 사용하는 화면낭독 프로그램(screen reader) 등 보조기기를 활용해서도 웹 콘텐츠에 접근할 수 있도록 제작되었습니다. 다만, 모든 보조기기가 웹 접근성 지침을 제대로 해석하여 작동되지 않음으로, 장애인 사용자가 이용하시는 보조기기제품에 따라 다소 문제가 발생할 수 있음을 알려 드리며, 이는 웹 사이트 제작의 문제가 아니라, 보조기기 제품의 문제임을 알려 드립니다.
          </p>

          <p className="conts-desc">
            전문가 테스트<br />
            실제 장애인과 접근성 전문가로 구성된 평가수행- 소스분석 및 기술에 의한 전문가 평가- 분석도구 : msie6.0, ie accessibility toolbar, mozila firefox 3.0 / firefox부가도구(web developer, firebug, html validator)
            <br /><br />
            전문가 테스트<br />
            장애인 접근도구 및 접근방법에 의한 사용성 평가- 시각장애인 스크린리더 사용(ScreenReader PE), 시각장애인 화면확대 s/w사용 (zoomtext, 돋보기, 색반전)- 지체 및 뇌병변 장애인 키보드 접근법, 마우스 접근법 등
            <br /><br />
            K-wah 4.0을 이용한 테스트<br />
            K-WAH4.0은 웹 사이트의 접근성 증진을 위해 한국정보문화진흥원에서 개발한 소프트웨어입니다. 이 소프트웨어를 이용하여 강화군 웹 사이트의 대체 텍스트, 프레임 사용제한, 깜빡임 객체 등의 기본적인 접근성에 대해 점검하여 중요도 95% 이상 준수 하였습니다.
            <br /><br />
            HTML, CSS validator <br />
            W3C (World Wide Web Consortium) 표준 중 CSS(Cascading Style Sheets)는 Level 2.1을 준수하여 W3C CSS Validation Service를 통과하였으며 HTML은 기본적으로 HTML5로 코딩을 하였으며 W3C Markup Validation Service를 통과하였습니다. 다만 외부 소스가 삽입된 경우는 HTML, CSS Validation Service를 통과하지 못 한 경우가 있습니다.
          </p>
          <div className="btns-box">
            <a href="#" target="_blank" title="새 창 열림" className="krds-btn xsmall tertiary">CSS VALIDATION 바로가기</a>
            <a href="#" target="_blank" title="새 창 열림" className="krds-btn xsmall tertiary">MARKUP VALIDATION 바로가기</a>
          </div>
        </div>

        <div className="conts-wrap mt-48">
          <p className="conts-desc">
            중소벤처기업부 기업마당 웹사이트는 앞으로도 장애인 사용자, 웹 접근성 전문가들의 의견을 청취하고, 웹 접근성 준수 여부를 지속 점검하여 접근성 100%준수를 위해 노력하겠습니다. <br />중소벤처기업부 기업마당 웹사이트의 웹 접근성 문제점을 발견하시는 이용자분께서는 언제든지 아래로 연락주시기 바랍니다. <br />(문의처 : 중소벤처기업부 정책분석평가과 최준영 / Tel : 044-204-7477)
          </p>
        </div>

        <div className="conts-wrap mt-48">
          <span className="conts-desc">관련 사이트</span>
          <ul className="mt-16">
            <li>
              <a href="#" target="_blank" title="새 창 열림" className="krds-btn medium text arrow-link">- 한국지능정보사회진흥원 <i className="svg-icon ico-angle right gray"></i> </a>
            </li>
            <li>
              <a href="#" target="_blank" title="새 창 열림" className="krds-btn medium text arrow-link">- 한국정보통신기술협회 <i className="svg-icon ico-angle right"></i></a>
            </li>
          </ul>
        </div>
      </div> 
    </>
  );
};

export default UI_USR_R_563;
