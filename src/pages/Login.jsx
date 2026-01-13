import Breadcrumb from "../components/ui/Breadcrumb";
import React from "react";

const UI_USR_R_002 = () => {
  const breadcrumbItems = [
    { label: "로그인", link: "#" },
  ];

  return (
      <>
          <div className="contents">
              <Breadcrumb items={breadcrumbItems}/>
              <div className="page-title-wrap" data-type="responsive">
                  <h2 className="h-tit">로그인 방식을 선택해주세요.</h2>
              </div>
              <button type="button" className="krds-btn xsmall">
                  유큐브 로그인
                  <i className="svg-icon ico-angle right"></i>
              </button>
              <br/>
              <br/>
              <button type="button" className="krds-btn xsmall">
                  ? 사업자 로그인
                  <i className="svg-icon ico-angle right"></i>
              </button>
              {/*<img src={CON_UI_USR_R_002} alt="컨텐츠 이미지"/>*/}
          </div>
      </>
  )
      ;
};

export default UI_USR_R_002;
