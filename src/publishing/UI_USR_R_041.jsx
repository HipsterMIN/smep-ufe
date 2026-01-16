import React from "react";
import { useState } from 'react';

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Popup from "../components/ui/Popup";


const UI_USR_R_041 = () => {
  // 팝업 동작
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
        <div className="page-title-wrap bottom-divide" data-type="responsive">
          <span className="h-sub">증명서 발급</span>
          <h2 className="h-tit2">벤처기업확인서</h2>
        </div>

        <div className="detail-list-wrap">
          <div className="on-detail-list">
            <dl>
              <dt className="w-200">서비스 명</dt>
              <dd>
                <p className="bold">벤처기업확인서 사본 발급</p>
              </dd>
            </dl>
            <dl>
              <dt className="w-200">서비스 개요</dt>
              <dd><p>「벤처기업육성에 관한 특별조치법」 제2조의2에서 정한 요건을 충족한 벤처기업임을 확인하는 확인서 사본 발급 서비스</p></dd>
            </dl>
            <dl>
              <dt className="w-200">지원내용</dt>
              <dd><p>벤처기업확인서 발급(영문/중문 확인서는 별도 신청 시 발급)</p></dd>
            </dl>
            <dl>
              <dt className="w-200">소관기관</dt>
              <dd><p>중소벤처기업부 벤처혁신정책과</p></dd>
            </dl>
            <dl>
              <dt className="w-200">출력대상</dt>
              <dd><p>벤처기업확인서를 발급받은 현재 유효한 확인기업만 출력 가능</p></dd>
            </dl>
            <dl>
              <dt className="w-200">선정기준</dt>
              <dd><p>벤처기업확인서를 발급받은 현재 유효한 확인기업만 출력 가능</p></dd>
            </dl>
            <dl>
              <dt className="w-200">출력대상</dt>
              <dd>
                <p>
                  [벤처투자 / 연구개발 / 혁신성장] 유형별 요건을 충족한 기업이  벤처확인종합관리시스템(<a className="on-linktxt2 primary" href="http://smes.go.kr/venturein" target="_blank" title="새 창 열림">www.smes.go.kr/venturein</a>)을
                  통해 신청하면, 전문평가기관의 서류검토 및 현장 실제조사, 벤처기업확인위원회의 심의·의결을 거쳐 선정
                </p>
              </dd>
            </dl>
            <dl>
              <dt className="w-200">지원대상</dt>
              <dd>
                <p>
                「벤처기업육성에 관한 특별조치법」 제2조의2에서 정한 요건을 충족한 벤처기업
                온벤처기업에 포함되지 않는 업종
                </p>
                <div className="krds-table-wrap">
                  <table className="tbl col data">
                    <caption>증명서 발급 조회 표. 순번, 증명(확인)서, 사업자등록번호, 신청일자, 유효기간, 상태, 출력언어, 발급 정보가 제공됨.</caption>
                    <colgroup>
                      <col />
                      <col style={{width: "33%"}}/>
                    </colgroup>
                    <thead>
                      <tr>
                        <th scope="col" className="ac border-r">업종</th>
                        <th scope="col" className="ac">분류코드</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="ac border-r">
                          <div className="text-box">
                            1. 일반 유흥 주점업 <br />2. 무도 유흥 주점업 <br />3. 기타 주점업<br />4. 블록체인 기반 암호화 자산 매매 및 중개업<br />5. 기타 사행시설 관리 및 운영업<br />6. 무도장 운영업
                          </div>
                        </td>
                        <td className="ac"><div>56211 <br />56212 <br />56219 <br />63999-1 <br />91249 <br />91291</div></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </dd>
            </dl>
            <dl>
              <dt className="w-200">절차 및 방법</dt>
              <dd>
                <ul className="krds-info-list decimal" role="list">
                  <li role="listitem">벤처확인종합관리시스템(<a className="on-linktxt2" href="http://smes.go.kr/venturein" target="_blank" title="새 창 열림">www.smes.go.kr/venturein</a>)에 접속하여 회원가입</li>
                  <li role="listitem">확인유형 선택 후 신청서 작성 및 서류제출</li>
                  <li role="listitem">전문평가기관의 서류검토 및 현장 실제조사</li>
                  <li role="listitem">벤처기업확인위원회의 심의·의결</li>
                  <li role="listitem">벤처기업확인서 발급</li>
                </ul>
              </dd>
            </dl>
            <dl>
              <dt className="w-200">문의처</dt>
              <dd><p>벤처기업확인기관 / 1566-6487</p></dd>
            </dl>
          </div>
        </div>

        <div className="onboard-btm-btngroup bt-0">
          <div>
            <button type="button" className="krds-btn tertiary xlarge">
              목록
            </button>
          </div>
          <div>
              <button type="button" className="krds-btn primary xlarge" onClick={() => setIsPopupOpen(true)} >
                증명서 발급 <i className="svg-icon ico-angle right"></i>
              </button>
          </div>
        </div>
      </div> 

      {/* 팝업 */}
      <Popup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        title="중소기업(소상공인) 확인서발급"
        footer={
          <>
            <button type="button" className="krds-btn tertiary md" onClick={() => setIsPopupOpen(false)}>닫기</button>
          </>
        }
      >
        <div className="txt-box outline">
          <h4 className="outline-tit">알려드립니다.</h4>
          <ul className="check-list">
            <li>중소기업현황정보시스템을 통해 중소기업임을 확인 받은 기업에 한하여 출력할 수 있습니다.</li>
            <li>신청 된 문서는 24시간 동안 출력할 수 있으며, 24시간 경과 후 삭제됩니다.</li>
            <li>아래 기업정보를 확인하신 후 출력버튼을 클릭해주세요.</li>
            <li>신규 신청버튼 클릭 시 중소기업임을 최초 확인받기 위하여 중소기업현황정보시스템으로 이동합니다.</li>
            <li>발급된 전자증명서는 정부전자문서지갑에서 확인이 가능합니다.</li>
          </ul>
        </div>

        {/* input  */}
        <div className="on-border-box">
          <div className="form-group">
            <div className="form-conts">
              <div className="form-tit">
                <label for="id_01" className="form-label">사업자등록번호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </div>
              <input type="text" id="id_01" className="krds-input small" placeholder="사업자등록번호를 입력해주세요" value="2288105280" disabled />
            </div>
          </div>
          <div className="form-group">
            <div className="form-conts">
              <div className="form-tit">
                <label for="id_02" className="form-label">상호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </div>
              <input type="text" id="id_02" className="krds-input small" placeholder="상호를 입력해주세요" value="주식회사 중소벤처" disabled />
            </div>
          </div>
          <div className="form-group">
            <div className="form-conts">
              <div className="form-tit">
                <label for="id_03" className="form-label">대표자명 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </div>
              <input type="text" id="id_03" className="krds-input small" placeholder="대표자명을 입력해주세요" value="홍길동" disabled />
            </div>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_R_041;
