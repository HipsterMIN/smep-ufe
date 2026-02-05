import React, { useRef } from "react";
import { Link } from 'react-router-dom';
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import captureImg2 from "../../styles/img/capture2.png";

const UI_USR_R_011 = () => {
  const shadowTextRef1 = useRef(null);
  const shadowTextRef2 = useRef(null);

  const handleToggleTextShadow1 = () => {
    shadowTextRef1.current.classList.toggle('on');
  }

  const handleToggleTextShadow2 = () => {
    shadowTextRef2.current.classList.toggle('on');
  }

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
    { label: "신청·발급", link: "#" },
    { label: "중소벤처기업부 지원사업 소개", link: "#" },
  ];

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap on-btmline" data-type="responsive">
            <p className="on-p1 on-colorblue">중소벤처기업부 지원사업 소개</p>
            <h2 className="h-tit2">초기창업패키지</h2>
          </div>

          <div className="on-announcement">
            <div className="on-announcement-inner">
              <p>
                <span>유망 창업 아이템을 보유한 업력 3년 이내 창업기업을 대상으로 사업화</span>
                <span>자금 및 창업프로그램을 지원하여 사업 안정화와 성장 지원</span>
              </p>
              <div className="on-announcement-imgbox">
                <img src={captureImg2} alt="" />
              </div>
              <div className="ac">
                <Link type="button" className="krds-btn large krds-btn-shadow">공고알림 예약하기</Link>
              </div>
            </div>
          </div>

          <div className="page-title-wrap on-btmline" data-type="responsive">
            <h3 className="h-tit3">초기창업패키지</h3>
          </div>
          <div className="def-list-wrap">
            <dl className="def-list">
              <dt>지원대상</dt>
              <dd>신청자격 : ｢중소기업기본법｣ 제2조제1항에 따른 중소기업의 대표자, 이자, ｢중소기업창업 지원법｣ 제2조제2호 및 제3호, 제10호에 따른 초기창업기업의 대표자로서 모집공고일 기준 창업 3년 이내인 자</dd>
              <dt>비지원대상</dt>
              <dd>
                  <div className="onshadow-text" ref={shadowTextRef1}>
                   2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                  </div>
                  <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow" onClick={handleToggleTextShadow1}>
                    전체보기
                    <i className="svg-icon ico-angle"></i>
                  </button>
              </dd>
              <dt>지원내용</dt>
              <dd>
                  <div className="onshadow-text" ref={shadowTextRef2}>
                 2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                    2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                    ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                    - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                    ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                  </div>
                  <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow" onClick={handleToggleTextShadow2}>
                    전체보기
                    <i className="svg-icon ico-angle"></i>
                  </button>
              </dd>
            </dl>
          </div>

          <div className="page-title-wrap on-btmline" data-type="responsive">
            <h3 className="h-tit3">신청절차</h3>
          </div>
          <div className="def-list-wrap">
            <dl className="def-list">
              <dt>신청접수</dt>
              <dd>스마트상점 홈페이지<a className="on-linktxt2" href="www.sbiz.or.kr/smst/index.do" target="_blank" title="새 창 열림">(www.sbiz.or.kr/smst/index.do)</a>를 통한 온라인 신청 </dd>
              <dt>신청시기</dt>
              <dd>2월~6월</dd>
              <dt>처리절차</dt>
              <dd>
                <div className="on-def-imgbox">
                  <img src={captureImg2} alt="" />
                </div>
              </dd>
            </dl>
          </div>

          <div className="page-title-wrap on-btmline" data-type="responsive">
            <h3 className="h-tit3">문의처</h3>
          </div>
          <div className="def-list-wrap">
            <dl className="def-list">
              <dt>문의처</dt>
                <ul className="list">
                  <li>◎ 전화상담 : 국번없이 1357 (중소기업통합콜센터)</li>
                  <li>◎ 창업진흥원 예비초기팀 : (전화) 044-410-1830~2, 1834, 1836</li>
                </ul>
              <dd>
              </dd>
            </dl>
          </div>

          <div className="page-title-wrap has-badge-type" data-type="responsive">
            <h3 className="h-tit3">진행중인 사업공고</h3>
            <span className="krds-badge bg-primary number">2건</span>
          </div>

          {/* table [S] */}
          <div className="krds-table-wrap">
            <table className="tbl col data">
              <caption>진행중인 사업공고 표. 번호, 제목, 신청기간, 소관부처·지자체, 사업수행기관, 조회수 정보가 제공됨.</caption>
              <colgroup>
                <col style={{width: "5%"}} />
                <col />
                <col style={{width: "200px"}} />
                <col style={{width: "14%"}} />
                <col style={{width: "14%"}} />
                <col style={{width: "5%"}} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">번호</th>
                  <th scope="col" className="ac">제목</th>
                  <th scope="col" className="ac">신청기간</th>
                  <th scope="col" className="ac">소관부처·지자체</th>
                  <th scope="col" className="ac">사업수행기관</th>
                  <th scope="col" className="ac">조회수</th>
                      </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="ac">
                    <span>1444</span>
                  </th>
                  <td>
                    <a className="onellipsis-1" href="#">
                      <span className="krds-badge bg-light-primary">기술</span>
                      <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                    </a>
                  </td>
                  <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                  <td className="ac"><span>보건복지부</span></td>
                  <td className="ac"><span>한국부건산업진흥원</span></td>
                  <td className="ac"><span>433</span></td>
                </tr>
                <tr>
                  <th scope="row" className="ac">
                    <span>1444</span>
                  </th>
                  <td>
                    <a className="onellipsis-1" href="#">
                      <span className="krds-badge bg-light-primary">기술</span>
                      <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                    </a>
                  </td>
                  <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                  <td className="ac"><span>보건복지부</span></td>
                  <td className="ac"><span>한국부건산업진흥원</span></td>
                  <td className="ac"><span>433</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* table [E] */}
 
          <div className="onboard-btm-btngroup">
            <div>
              <button type="button" className="krds-btn tertiary xlarge">
                목록
              </button>
            </div>
            <div>
               <button type="button" className="krds-btn secondary xlarge">
                <i className="svg-icon ico-faq"></i>     
                AI 상세 상담
              </button>
               <button type="button" className="krds-btn tertiary xlarge">
                 <i className="svg-icon ico-like"></i>    
                관심공고
              </button>
               <button type="button" className="krds-btn tertiary xlarge">
                <i className="svg-icon ico-copy"></i>    
                링크복사
              </button>
            </div>
          </div>

          <div className="assess-question-wrap">
            <div className="assess-qu">이 페이지에 만족하시나요?</div>
            <div className="assess-an">
              <div className="krds-form-chip large">
                <input type="radio" className="radio" name="rdo_chip_size2" id="rdo_chip_lg2-1" checked="" />
                <label className="krds-form-chip-outline yes" htmlFor="rdo_chip_lg2-1">
                  네
                  <i className="svg-icon ico-smile"></i>
                </label>
              </div>
              <div className="krds-form-chip large">
                <input type="radio" className="radio" name="rdo_chip_size2" id="rdo_chip_lg2-2" />
                <label className="krds-form-chip-outline no" htmlFor="rdo_chip_lg2-2">
                  아니오
                  <i className="svg-icon ico-sad"></i>
                </label>
              </div>
            </div>
          </div>


      </div>
    </>
  );
};

export default UI_USR_R_011;
