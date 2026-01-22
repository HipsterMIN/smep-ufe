 import React from "react";

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";


const UI_USR_R_420 = () => {

  const navigationData = {
    depth1Title: "신청·발급",
    depth: [
       {
        depth2: "지원사업",
        active: true,
      },
      {
        depth2: "사업공고",
      },
      {
        depth2: "정책금융",
      },
	    {
        depth2: "증명서 발급",
        active: true,
        depth3: [
			    {
            label: "증명서 발급",
            link: "/",
            active: true
          },
          {
            label: "발급 진위 확인",
            link: "/",
          },
          {
            label: "기타 증명서",
            link: "/",
          },
		]
      },
    ],
  };

  const breadcrumbItems = [
    { label: "마이비즈니스", link: "#" },
    { label: "나의 대시보드", link: "#" },
    { label: "증명서 발급 조회", link: "#" },
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
          <h2 className="h-tit">비밀번호 수정</h2>
        </div>
        
        <div className="conts-wrap form-confirm">
          <h3 className="sec-tit">비밀번호 재확인</h3>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">정확한 본인확인을 위해 다시 한 번 비밀번호를 입력해 주세요.</li>
            <li role="listitem">비밀번호는 타인에게 노출되지 않도록 주의해 주세요.</li>
          </ul>

          <div className="form-group krds-check-area">
            <div className="krds-form-check">
              <input type="checkbox" name="save_id" id="chk_01" />
              <label htmlFor="chk_01">키보드 보안 프로그램 적용</label>
            </div>
          </div>
          <p className="txt-caution">※ 안전한 중소벤처24 서비스 이용을 위해 키보드보안 프로그램 적용을 권장합니다.</p>

           <dl className="on-form-row large">
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="input_01">
                  현재 비밀번호
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                 <input type="password" id="input_01" className="krds-input small" placeholder="비밀번호를 입력해주세요." ></input>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label flex-start">
                <label htmlFor="input_02">
                  새 비밀번호
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                 <input type="password" id="input_02" className="krds-input small" placeholder="비밀번호를 입력해주세요." ></input>
                </div>
                 <p className="form-hint">
                  비밀번호는 영문자(대·소문자), 숫자, 특수문자중 두가지를 조합하여 8자~20자 이내로 입력하세요. <br />
                 ( 사용가능 특수문자 : !, @, #, $, %, ^, &, *, (, ), -, =, _, + )</p>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label flex-start">
                <label htmlFor="input_03">
                  새 비밀번호 확인
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                 <input type="password" id="input_03" className="krds-input small" placeholder="비밀번호를 입력해주세요." ></input>
                </div>
                 <p className="form-hint point">새 비밀번호를 8자 이상 , 영문자, 숫자, 특수문자 조합을 입력해야 합니다.</p>
              </dd>
            </div>
          </dl>
        </div>

        <div className="conts-wrap mt-64 certify-conts">
          <h3 className="sec-tit">기업 인증 </h3>
          <div className="certify-cont-box">
            <div className="certify-cont-item">
              <div className="certify-cont-img"></div>
              <button type="button" className="krds-btn medium primary">인증하기</button>
            </div>
          </div>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">
              인증 관련 문의 <br />
              - NICE평가정보(주) 고객센터 Tel : 1600-1522
            </li>
          </ul>
        </div>

      </div> 
    </>
  );
};

export default UI_USR_R_420;
