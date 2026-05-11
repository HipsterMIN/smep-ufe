import React, { useRef } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import ServiceImg from "../../styles/img/sub/img_service_guide.jpg"

const UI_USR_R_341 = () => {
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
    { label: "고객지원", link: "#" },
    { label: "고객센터", link: "#" },
    { label: "홀센터 안내", link: "#" },
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
          <h2 className="h-tit">고객 만족도 조사</h2>
        </div>

        <div className="txt-box bg-white">
            <h3 className="box-tit1">기본 신청 정보 입력</h3>
            <div className="box-cnt gap-40">

              <div className="box-sec">
                <h4 className="box-tit2">
                  1. 중소벤처24 홈페이지에 대한 전반적인 만족도는 어떻습니까?
                  <em className="txt-caution">(필수)</em>
                </h4>
                <div className="form-group">
                  <div className="form-conts">
                    <div className="row krds-check-area chk-column">
                      <div className="krds-form-check large ">
                        <input type="radio" name="rdo_01" id="rdo_1"/>
                        <label htmlFor="rdo_1">매우만족</label>
                      </div>
                      <div className="krds-form-check large">
                        <input type="radio" name="rdo_01" id="rdo_2" />
                        <label htmlFor="rdo_2">만족</label>
                      </div>
                      <div className="krds-form-check large">
                        <input type="radio" name="rdo_01" id="rdo_3" />
                        <label htmlFor="rdo_3">불만족</label>
                      </div>
                      <div className="krds-form-check large">
                        <input type="radio" name="rdo_01" id="rdo_4" />
                        <label htmlFor="rdo_4">매우불만족</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="box-sec">
                <h4 className="box-tit2">
                  2. "정보검색의 편리성"에 대한 만족도는 어떻습니까? 
                  <em className="txt-caution">(필수)</em>
                </h4>
                <div className="form-group">
                  <div className="form-conts">
                    <div className="row krds-check-area chk-column">
                      <div className="krds-form-check large">
                        <input type="radio" name="rdo_02" id="rdo_02_1"/>
                        <label htmlFor="rdo_02_1">매우만족</label>
                      </div>
                      <div className="krds-form-check large">
                        <input type="radio" name="rdo_02" id="rdo_02_2" />
                        <label htmlFor="rdo_02_2">만족</label>
                      </div>
                      <div className="krds-form-check large">
                        <input type="radio" name="rdo_02" id="rdo_02_3" />
                        <label htmlFor="rdo_02_3">불만족</label>
                      </div>
                      <div className="krds-form-check large">
                        <input type="radio" name="rdo_02" id="rdo_02_4" />
                        <label htmlFor="rdo_02_4">매우불만족</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 나머지 리스트 동일 radio 폼 */}

              {/* textarea case */}
              <div className="box-sec">
                <h4 className="box-tit2">
                  8. 중소벤처24(편의성·기능·운영 측면 등)에 대하여 기능개선 및 요구사항이 있으면 자유롭게 기술해주시기 바랍니다.
                  <em className="txt-caution">(필수)</em>
                </h4>
                <div className="form-group">
                  <div className="form-conts">
                    <div className="textarea-wrap">
                      <textarea className="krds-input medium" placeholder="내용을 입력하세요" title="내용입력란"></textarea>
                      <p className="textarea-count">
                        <span className="count-now">0</span><span className="count-total">/100</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 하단 버튼 */} 
          <div className="onboard-btm-btngroup btn-single bt-0">
            <div>
                <button type="button" className="krds-btn primary xlarge">
                  설문완료
                </button>
            </div>
          </div>

      </div> 
    </>
  );
};

export default UI_USR_R_341;
