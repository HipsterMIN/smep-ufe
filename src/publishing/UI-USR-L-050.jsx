import React from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";

const UI_USR_L_050 = () => {
  
  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
      {
        depth2: "AI 스마트 통합 검색",
      },
      {
        depth2: "지원사업",
        active: true,
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
            link: "/home-dev/service/UI_USR_L_030",
            active: true,
          },
        ],
      },
      {
        depth2: "증명서 발급",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "증명서 발급", link: "#" },
    { label: "발급 진위 확인", link: "#" },
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
          <h2 className="h-tit">발급 진위 확인</h2>
        </div>

         <div className="txt-box outline">
          <h4 className="outline-tit">알려드립니다.</h4>
          <ul className="check-list">
            <li>중소벤처24 <a href="http://smes.go.kr/" target="_blank" title="새 창 열림" className="on-linktxt2">(www.smes.go.kr)</a>를 통해 출력된 증명/확인서의 진위확인 서비스입니다.</li>
            <li>발급된 증명/확인서의 종류를 선택한 후 발급문서 우측 상단의 문서확인번호 14자리를 입력하세요.</li>
          </ul>
        </div>

        {/* form */}
        <div className="mt-24">
          <dl className="on-form-row">
            <div className="form-row-item ">
              <dt className="form-row-label">
                <label htmlFor="select_01">
                  발급기관
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-272">
                  <select id="select_01" className="krds-form-select small">
                    <option value="" selected>전체</option>
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="select_02">
                  문서종류<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-272">
                  <select id="select_02" className="krds-form-select small">
                    <option value="">증명/확인서 선택</option>
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_01">
                  문서확인번번호<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-272">
                 <input type="number" id="input_01" className="krds-input small" placeholder="숫자만 입력해주세요."></input>
                </div>
              </dd>
            </div>
          </dl>
        </div>

        {/* bottom btn */}
        <div className="onboard-btm-btngroup btn-single bt-0">
          <div> 
            <button type="button" className="krds-btn xlarge">
              진위확인
            </button>
          </div>
        </div>


      </div> 
    </>
  );
};

export default UI_USR_L_050;