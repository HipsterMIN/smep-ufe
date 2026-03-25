import { useState } from 'react';

import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination";
import Popup from "../components/ui/Popup";

const UI_USR_L_040 = () => {
  // 증명서 발급 안내 팝업 동작
	const [isPopupOpen, setIsPopupOpen] = useState(false); 

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
    { label: "증명서 발급", link: "#" },
    { label: "증명서 발급", link: "#" },
  ];

  const certificateList = [
    {
      badge: "전자증명",
      title: "중소기업(소상공인) 확인서 발급",
      issuingAgency: "한국평가데이터",
      department: "중소벤처기업부 중소기업제도과",
    },
    { badge: "전자증명", title: "중소기업(소상공인) 확인서 발급", issuingAgency: "한국평가데이터", department: "중소벤처기업부 중소기업제도과" },
    { badge: "전자증명", title: "중소기업(소상공인) 확인서 발급", issuingAgency: "한국평가데이터", department: "중소벤처기업부 중소기업제도과" },
  ];
  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap side-conts" data-type="responsive">
          <h2 className="h-tit">
            증명서 발급
            <p className="krds-badge-wrap">
              <span className="krds-badge bg-light-primary large">※중소벤처24 증명(확인)서 발급 방법 안내</span>
              <button type="button" className="krds-btn medium icon btn-help-exec"  onClick={() => setIsPopupOpen(true)} > 
                <span className="sr-only">도움말</span>
                <i className="svg-icon ico-help"></i>
              </button>
            </p>
          </h2>
        </div>

        <p className="guide-txt">
          중소벤처기업 경영활동에 필요한 각종 증명서를 개별 시스템 방문 없이 출력하실 수 있습니다.
          각 증명(확인)서는 해당시스템과 연계를 통해 중소벤처24에서 출력되어지며, 최초 발급은 해당 시스템을 통해 가능합니다.
        </p>

        {/* guide */}
        <ul className="krds-info-list decimal mt-24" role="list">
          <li role="listitem"><strong>자주 찾는 증명(확인)서</strong></li>
          <li role="listitem">아래 증명(확인서)는 <strong>최근 누적 발급건수가 많은 증명(확인서)</strong>목록입니다.</li>
        </ul>

        <ul className="krds-structured-list small mt-24">
          {certificateList.map((item, index) => (
            <li className="structured-item" key={index}>
              <div className="card-top">
                <span className="krds-badge bg-light-primary">{item.badge}</span>
              </div>
              <div className="card-body">
                <a href="#" className="c-text">
                  {/* 제목 영역 */}
                  <p className="c-tit no-icon">
                    <span className="span onellipsis-2">{item.title}</span>
                  </p>
                  <div className="c-info-group">
                    <p className="c-date">
                      <strong className="key">발급기관</strong>
                      <span className="value">{item.issuingAgency}</span>
                    </p>
                    <p className="c-date">
                      <strong className="key">소관기간</strong>
                      <span className="value">{item.department}</span>
                    </p>
                  </div>
                </a>
              </div>
            </li>
          ))}
        </ul>

        <div className="search-top-box mt-48">
          <div className="sch-form-wrap">
            <select className="krds-form-select" title="카테고리 선택"> {/* 웹접근성 반영 */}
              <option value="">카테고리 전체</option>
            </select>
            <div className="sch-input">
              <input type="text" className="krds-input" placeholder="검색어를 입력해주세요." title="검색어 입력" />
              <button type="button" className="krds-btn medium icon ico-search" >
                <span className="sr-only">검색</span>
                <i className="svg-icon ico-sch"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">46</span>개</li>
          </ul>
          <ul className="sch-sort">
             <li>
              <strong className="sort-label"><label htmlFor="sort1">목록 표시 개수</label></strong>
              <div>
                <select className="krds-form-select-sort" id="sort1">
                  <option>전체</option>
                  <option>20개</option>
                </select>
              </div>
            </li>
          </ul>
        </div>

        {/* table [S] */}
			  <div className="krds-table-wrap">
					<table className="tbl col data t-block">
            <caption>증명 확인서 목록. 번호, 증명(확인)서, 발급기관, 소관기관 정보가 제공됨.</caption>
						<colgroup>
							<col style={{width: "7.4%%"}} />
							<col />
							<col style={{width: "26%"}} />
							<col style={{width: "26% "}} />
							<col style={{width: "118px"}} />
						</colgroup>
						<thead>
							<tr>
								<th scope="col" className="ac">번호</th>
								<th scope="col" className="ac">증명(확인)서</th>
								<th scope="col" className="ac">발급기관</th>
								<th scope="col" className="ac">소관기관</th>
								<th scope="col" className="ac">발급</th>
				      </tr>
						</thead>
						<tbody>
							<tr>
								<th scope="row" className="ac">
									<span>1</span>
								</th>
								<td className="ac">
                  <a className="onellipsis-1 flex-row" href="#">
                    <span>벤처기업확인서</span>
                    <span className="krds-badge bg-light-primary">전자증명</span> 
                  </a>
								</td>
								<td className="ac"><span>(사)벤처기업협회</span></td>
								<td className="ac"><span>중소벤처기업부 벤처혁신정책과</span></td>
								<td className="ac"><a href="#" className="krds-btn small primary mo-full">발급</a></td>
							</tr>
						</tbody>
			    </table>

          <Pagination /> 
				</div>
        {/* table [E] */}

      </div> 
      {/* 증명서 발급 안내 팝업 */}
      <Popup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        title="중소벤처24 증명(확인)서 발급"
				noBottomBtn={true}
      >
       <div className="issuance-popup">
					중소벤처24에서의 증명(확인)서를 발급받으신 이력이 있으신 경우 <br />인증로그인 후 중소벤처24에서 발급이 가능합니다.

					<div className="step-box">
						<span className="krds-badge bg-light-primary number">증명서</span>
						<ul className="krds-info-list decimal" role="list">
							<li role="listitem">중소벤처24에서의 증명(확인)서를 <strong>발급메뉴를 통해 증명(확인)서 발급이 가능합니다.</strong></li>
						</ul>
						<div className="step-imgguide">
							<div className="step-imgguide-item">
								<div className="step-imgguide-img img-login"></div>
								<div className="step-imgguide-title">인증로그인</div>
							</div>
							<div className="step-imgguide-item">
								<div className="step-imgguide-img img-click"></div>
								<div className="step-imgguide-title">발급 버튼 클릭</div>
							</div>
							<div className="step-imgguide-item">
								<div className="step-imgguide-img img-certificate"></div>
								<div className="step-imgguide-title">증명(확인)서 발급</div>
							</div>
						</div>
					</div>

					<div className="step-box">
						<span className="krds-badge bg-light-primary number">전자증명</span>
						<ul className="krds-info-list decimal" role="list">
							<li role="listitem">전자증명태그가 붙은 증명(확인)서는 전자증명서 신청이 가능합니다.</li>
							<li role="listitem">발급된 전자증명서는 정부전자문서지갑에서 확인이 가능합니다.</li>
						</ul>
						<div className="step-imgguide type-divide">
							<div className="step-imgguide-item">
								<div className="step-imgguide-title">개인사업자회원</div>
								<div className="step-imgguide-img img-individual"></div>
								<p className="step-imgguide-desc">전자증명서를 발급한 <br /> 담당자의 개인 정부전자문서지갑에서 확인</p>
							</div>
							<div className="step-imgguide-item">
								<div className="step-imgguide-title">법인사업자회원</div>
								<div className="step-imgguide-img img-corporate"></div>
								<p className="step-imgguide-desc">법인사업자용 <br />
									정부전자문서지갑(<a className="on-linktxt2 primary" href="http://dpaper.kr" target="_blank" title="새 창 열림">dpaper.kr</a>)에서 확인
								</p>
							</div>
						</div>
					</div>

					<div className="step-box">
						<span className="krds-badge bg-light-primary number">발급안내</span>
						<ul className="krds-info-list decimal" role="list">
							<li role="listitem">발급안내로 확인되는 증명(확인)서는 발급/조회가 가능한 각 해당 시스템으로 연결됩니다.</li>
						</ul>
						<div className="step-imgguide">
							<div className="step-imgguide-item">
								<div className="step-imgguide-img img-issuance"></div>
								<p className="step-imgguide-desc">발급안내 버튼 클릭</p>
							</div>
							<div className="step-imgguide-item">
								<div className="step-imgguide-img img-site"></div>
								<p className="step-imgguide-desc">발급/조회 가능한 해당 사이트로 연결</p>
							</div>
						</div>
					</div>

					<div className="txt-box small outline">
						중소벤처24의 증명서 발급 대상이 아닌 기업은 해당 증명서 발급기관에서 확인 바랍니다.
					</div>

				</div>
      </Popup>
    </>
  );
};

export default UI_USR_L_040;
