import { useState } from 'react';
import {Link} from "react-router-dom";

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";

const UI_USR_R_561 = () => {

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
    { label: "신청·발급", link: "#" },
    { label: "약관 및 저작권", link: "#" },
    { label: "이용약관", link: "#" },
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
          <h2 className="h-tit">이메일주소 무단 수집 거부안내</h2>
        </div>

        <p className="guide-txt">
          본 웹사이트에 게제된 모든 이메일 주소는 개인정보보호법 제15조(개인정보의 수집·이용)에 따라 <br />개인정보를 수집할 수 있는 각 호의 경우를 제외하고, 무단으로 수집되는 것을 거부합니다.
        </p>

        <div className="conts-wrap mt-48">
          <h3 className="sec-tit">제15조(개인정보의 수집·이용)</h3>
          <ul className="krds-info-list decimal point mt-12" role="list">
            <li role="listitem">
              <strong className="point">개인정보처리자는 다음 각 호의 어느 하나에 해당하는 경우에는 개인정보를 수집할 수 있으며 그 수집 목적의 범위에서 이용할 수 있다.</strong>
              <ol class="calc-list krds-info-list ordered" role="list">
                <li role="listitem"><span class="num">①</span>정보주체의 동의를 받은 경우</li>
                <li role="listitem"><span class="num">②</span>법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
                <li role="listitem"><span class="num">③</span>공공기관이 법령 등에서 정하는 소관 업무의 수행을 위하여 불가피한 경우</li>
                <li role="listitem"><span class="num">④</span>정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
                <li role="listitem"><span class="num">⑤</span>개인정보처리자의 정당한 이익을 달성하기 위하여 필요한 경우로서 명백하게 정보주체의 권리보다 우선하는 경우. 이 경우 개인정보처리자의 정당한 이익과 상당한 관련이 있고 합리적인 범위를 초과하지 아니하는 경우에 한한다.</li>
              </ol>
            </li>
            <li role="listitem">
              <strong className="point">개인정보처리자는 제1항제1호에 따른 동의를 받을 때에는 다음 각 호의 사항을 정보주체에게 알려야 한다. 다음 각 호의 어느 하나의 사항을 변경하는 경우에도 이를 알리고 동의를 받아야 한다.</strong>
              <ol class="calc-list krds-info-list ordered" role="list">
                <li role="listitem"><span class="num">①</span>개인정보의 수집·이용 목적</li>
                <li role="listitem"><span class="num">②</span>수집하려는 개인정보의 항목</li>
                <li role="listitem"><span class="num">③</span>개인정보의 보유 및 이용 기간</li>
                <li role="listitem"><span class="num">④</span>동의를 거부할 권리가 있다는 사실 및 동의 거부에 따른 불이익이 있는 경우에는 그 불이익의 내용</li>
              </ol>
            </li>
          </ul>
        </div>
      </div> 
    </>
  );
};

export default UI_USR_R_561;
