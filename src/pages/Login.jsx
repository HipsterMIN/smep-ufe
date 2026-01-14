import Breadcrumb from "../components/ui/Breadcrumb";
import React from "react";
import {api as apiClient} from "../lib/apiClient.js";
import {useAuthStore} from "../components/ui/useAuthStore.jsx";
import {useNavigate} from "react-router-dom";

const UI_USR_R_002 = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const breadcrumbItems = [
    { label: "로그인", link: "#" },
  ];

  const handleClick = async (brno) => {

      alert("로그인 되었습니다.");

      let body = {
          "brno" : brno
      };

      const response = await apiClient.post(`/api/v1/account/scenario-login`, body);
      console.log(response);
      login(brno, response.cmpNm, response.companySize);


      navigate('/'); // 지원사업 상세 이미지 페이지 링크
  };

  return (
      <>
          <div className="contents">
              <Breadcrumb items={breadcrumbItems}/>
              <div className="page-title-wrap" data-type="responsive">
                  <h2 className="h-tit">로그인 방식을 선택해주세요.</h2>
              </div>
              <button type="button" className="krds-btn xsmall" onClick={() => handleClick('2288105280')}>
                  [유큐브] 로그인
                  <i className="svg-icon ico-angle right"></i>
              </button>
             {/* <br/>
              <br/>
              <button type="button" className="krds-btn xsmall" onClick={() => handleClick('6058189115')}>
                  [유림이엔씨] 로그인
                  <i className="svg-icon ico-angle right"></i>
              </button>
              <br/>
              <br/>
              <button type="button" className="krds-btn xsmall" onClick={() =>handleClick('3078130710')}>
                  [한국바이오켐제약] 로그인
                  <i className="svg-icon ico-angle right"></i>
              </button>*/}
              {/*<img src={CON_UI_USR_R_002} alt="컨텐츠 이미지"/>*/}
          </div>
      </>
  )
      ;
};

export default UI_USR_R_002;
