import React, { useState, useRef } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";
import Popup from '../components/ui/Popup';

const UI_USR_L_140 = () => {
  const tabData = useRef(['소재부품장비 전문기업', '뿌리기술기업', '전문연구사업자']);
  const [isOpen, setIsOpen] = useState(false); 
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };
  
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
            link: "/main-dev/service/UI_USR_L_030",
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
          <h2 className="h-tit">소재부품장비·뿌리기술·전문연구사업자 조회</h2>
        </div>

         <div className="krds-tab-area layer">
            <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>

            <div className="tab-conts-wrap">
              <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
                <h3 className="sr-only">소재부품장비 전문기업</h3>
                <div className="txt-box outline">
                  <h4 className="outline-tit">소재부품장비 전문기업</h4>
                  <ul className="check-list">
                    <li>전문기업 확인 제도란? : 소재부품장비산업 기술경쟁력 제고를 위해 소재 부품 또는 장비 개발, 제조를 주된 사업으로 영위하는 기업을 전문기업으로 추천 확인하는 제도</li>
                    <li>
                      신청방법 : 소부장넷(<a className="on-linktxt2" href="https://www.sobujang.net/index.do#S22010" target="_blank" title="새 창 열림">https://www.sobujang.net/index.do#S22010</a>)에서 온라인 신청
                    </li>
                  </ul>
                </div>
                <div className="search-top-box mt-40">
                  <div className="sch-form-wrap">
                    <select className="krds-form-select">
                      <option value="">시도선택</option>
                      <option value="">항목</option>
                    </select>
                    <select className="krds-form-select">
                      <option value="">시군구선택</option>
                      <option value="">항목</option>
                    </select>
                    <select className="krds-form-select">
                      <option value="">전체</option>
                      <option value="">항목</option>
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
										<li>검색 결과 <span className="point">15,210</span>개</li>
									</ul>
									<ul className="sch-sort">
										<li>
											<strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
											<select className="krds-form-select-sort" id="search_result_count">
												<option>12개</option>
												<option>9개</option>
											</select>
										</li>
									</ul>
								</div>
                 {/* table [S] */}
                <div className="krds-table-wrap">
                  <table className="tbl col data">
                    <caption>소재부품장비 전문기업 표. 번호, 기업명, 업종명,만료일자 정보가 제공됨.</caption>
                    <colgroup>
                      <col style={{width: "8%"}} />
                      <col />
                      <col style={{width: "26%"}} />
                      <col style={{width: "12%"}} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th scope="col" className="ac">번호</th>
                        <th scope="col" className="ac">기업명</th>
                        <th scope="col" className="ac">업종명</th>
                        <th scope="col" className="ac">만료일자</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row" className="ac">
                          <span>123</span>
                        </th>
                        <td>
                          <button type="button" className="onellipsis-1 on-colorblue2" onClick={() => setIsOpen(true)}>
                            쓰리워터
                          </button>
                        </td>
                        <td className="ac"><span>금속 탱크 및 저장 용기 제조업</span></td>
                        <td className="ac"><span>2025-04-16</span></td>
                      </tr>
                      <tr>
                        <th scope="row" className="ac">
                          <span>123</span>
                        </th>
                        <td>
                           <button type="button" className="onellipsis-1 on-colorblue2" onClick={() => setIsOpen(true)}>
                            쓰리워터
                          </button>
                        </td>
                        <td className="ac"><span>금속 탱크 및 저장 용기 제조업</span></td>
                        <td className="ac"><span>2025-04-16</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* table [E] */}
                <Pagination /> 
              </section>
            </div>
        </div>
        <Popup 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          title="(주) 쓰리워터"
          noBottomBtn={true}
        >
          <div className="detail-list-wrap type2">
            <div className="on-detail-list">
              <dl>
                <dt className="w-100">업체명</dt>
                <dd><p>(주) 쓰리워터</p></dd>
                <dt className="w-100">홈페이지</dt>
                <dd></dd>
              </dl>
              <dl>
                <dt className="w-100">신고업종</dt>
                <dd><p>금속 탱크 및 저장 용기 제조업</p></dd>
                <dt className="w-100">대표자명</dt>
                <dd></dd>
              </dl>
              <dl>
                <dt className="w-100">만료일자</dt>
                <dd><p>2028-12-14</p></dd>
                <dt className="w-100">발급일자</dt>
                <dd><p>2028-12-15</p></dd>
              </dl>
              <dl>
                <dt className="w-100">주소</dt>
                <dd><p>경기도 화성시 장안면 중원길 5-57 1동</p></dd>
              </dl>
            </div>
        </div>
        </Popup>
      </div> 
    </>
  );
};

export default UI_USR_L_140;