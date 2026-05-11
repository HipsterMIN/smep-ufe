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
    { label: "고객지원", link: "#" },
    { label: "고객센터", link: "#" },
    { label: "Q&A", link: "#" },
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
          <h2 className="h-tit">Q&A</h2>
        </div>

        {/* form */}
        <div className="mt-48">
          <dl className="on-form-row large">
            <div className="form-row-item ">
              <dt className="form-row-label">
                <label htmlFor="select_01">
                  카테고리<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select id="select_01" className="krds-form-select small">
                    <option value="" selected>선택해주세요</option>
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_01">
                  제목<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                 <div className="form-wrapper">
                 <input type="text" id="input_01" className="krds-input small" placeholder="제목을 입력해주세요." ></input>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="textarea_01">
                  문의내용<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper">
                  <div className="textarea-wrap">
                    <textarea 
                       className="krds-input medium"
                      id="textarea_01" 
                      placeholder="문의내용을 입력해주세요."
                      required
                      rows={8}
                      />
                      <p className="textarea-count">
                        <span className="count-now">0</span><span className="count-total">/100</span>
                      </p>
                  </div>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
               <dt
                  className="form-row-label"
                >
                  <span className="label-title" id="visibility-label">
                    공개여부
                    <span className="on-required">
                      <span className="sr-only">필수입력</span>
                    </span>
                  </span>
                </dt>
               <dd className="form-row-content">
                <div className="form-wrapper">
                  <div
                    className="krds-check-area"
                    role="radiogroup"
                    aria-labelledby="visibility-label"
                    >
                    <div className="krds-form-check medium">
                      <input
                        type="radio"
                        name="visibility"
                        id="visibility-public"
                      />
                      <label htmlFor="visibility-public">공개</label>
                    </div>

                    <div className="krds-form-check medium">
                      <input
                        type="radio"
                        name="visibility"
                        id="visibility-private"
                      />
                      <label htmlFor="visibility-private">비공개</label>
                    </div>
                  </div>
                </div>
              </dd>
            </div>
          </dl>
        </div>

        {/* bottom btn */}
        <div className="onboard-btm-btngroup bt-0">
          <div> 
            <button type="button" className="krds-btn tertiary  xlarge">
              취소
            </button>
          </div>
          <div> 
            <button type="button" className="krds-btn xlarge">
              저장
            </button>
          </div>
        </div>


      </div> 
    </>
  );
};

export default UI_USR_L_050;