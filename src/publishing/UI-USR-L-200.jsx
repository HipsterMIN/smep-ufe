import React, { useRef, useState } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination from "../components/ui/Pagination";
import Tab from "../components/ui/Tab";
import Accordion from "../components/ui/Accordion";


const UI_USR_L_200 = () => {
    const tabData = useRef(['공지사항', '언론보도', '청년기업인상', '기업가정신유공자', <>기업가정신교육<br />우수사례 경진대회</>  ]);
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
        depth2: "중소벤처기업부 지원사업 소개",
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
      },
    ],
  };

  const breadcrumbItems = [
    { label: "더많은서비스", link: "#" },
    { label: "기업가정신", link: "#" },
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
          <h2 className="h-tit">기업가정신</h2>
        </div>

        <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>

        <div className="tab-conts-wrap mt-48">
          {/* 공지사항 */}
          <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
            <div className="page-title-wrap">
              <h3 className="h-tit2">공지사항</h3>
            </div>

            <div className="search-top-box mt-22">
              <div className="sch-form-wrap">
                <select className="krds-form-select" aria-label="검색구분 선택">{/* 기술진단보고서 반영 */}
                  <option value="">전체</option>
                  <option value="">항목</option>
                  <option value="">항목</option>
                </select>
                <div className="sch-input">
                  <input type="text" className="krds-input" placeholder="검색어를 입력하세요" title="검색어 입력" />
                  <button type="button" className="krds-btn medium icon ico-search" >
                    <span className="sr-only">검색</span>
                    <i className="svg-icon ico-sch"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="search-list-top">
              <ul className="sch-info" aria-live="polite">
                  <li>검색 결과 <span className="point">24</span>건</li>
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

            <div className="krds-table-wrap">
              <table className="tbl col data">
              <caption>공지사항 표. 번호, 제목, 작성자, 작성일, 조회수, 첨부파일 정보가 제공됨.</caption>
                <colgroup>
                  <col style={{width: "5%"}} />
                  <col style={{width: "43.6%"}} />
                  <col />
                  <col />
                  <col />
                  <col style={{width: "5%"}} />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" className="ac">순번</th>
                    <th scope="col" className="ac">제목</th>
                    <th scope="col" className="ac">작성자</th>
                    <th scope="col" className="ac">작성일</th>
                    <th scope="col" className="ac">조회수</th>
                    <th scope="col" className="ac">첨부파일</th>
                  </tr>
                </thead>
                <tbody>
                   <tr>
                    <th scope="row" className="ac">
                      <span className="krds-badge bg-light-primary">공지</span>
                    </th>
                    <td>
                      <a className="onellipsis-1" href="#">
                        <span>2025 벤처창업진흥 유공 포상 추천 후보자 공개검증...</span>
                      </a>
                    </td>
                    <td className="ac"><span>한국청년기업가정신재단</span></td>
                    <td className="ac"><span>2025-08-12</span></td>
                    <td className="ac"><span>1194</span></td>
                    <td className="ac"><button type="button"><span className="sr-only">첨부파일</span><i className="svg-icon ico-file"></i></button></td>
                  </tr>
                  <tr>
                    <th scope="row" className="ac">
                      <span>123</span>
                    </th>
                    <td>
                      <a className="onellipsis-1" href="#">
                        <span>2025 벤처창업진흥 유공 포상 추천 후보자 공개검증...</span>
                      </a>
                    </td>
                    <td className="ac"><span>한국청년기업가정신재단</span></td>
                    <td className="ac"><span>2025-08-12</span></td>
                    <td className="ac"><span>1194</span></td>
                    <td className="ac"><button type="button"><span className="sr-only">첨부파일</span><i className="svg-icon ico-file"></i></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 언론보도 */}
          <section className={`tab-conts ${activeTabIndex === 1 ? 'active' : ''}`}>
            <div className="page-title-wrap">
              <h3 className="h-tit2">언론보도</h3>
            </div>

            <div className="search-top-box mt-22">
              <div className="sch-form-wrap">
                <div className="sch-input">
                  <input type="text" className="krds-input" placeholder="검색어를 입력하세요" title="검색어 입력" />
                  <button type="button" className="krds-btn medium icon ico-search" >
                    <span className="sr-only">검색</span>
                    <i className="svg-icon ico-sch"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="search-list-top">
              <ul className="sch-info" aria-live="polite">
                <li>검색 결과 <span className="point">24</span>건</li>
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

            <ul className="krds-structured-list small">
              {Array.from({ length: 9 }).map((_, index) => (
                <li className="structured-item" key={index}>
                  <div className="card-body">
                    <div className="c-text">
                      <p className="c-tit no-icon"><span className="span onellipsis-2">[머니투데이] 초격차·IPO 성과 바탕엔 '기업가정신'...혁신 인재 키우는 그들</span></p>
                    </div>
                  </div>
                  <div className="bottom-link">
                    <a href="#" className="krds-btn medium text" target="_blank" title="새 창">바로가기 <i className="svg-icon ico-link"></i> </a>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination />
          </section>

          {/* 청년기업인상 */}
          <section className={`tab-conts ${activeTabIndex === 2 ? 'active' : ''}`}>
            <div className="page-title-wrap">
              <h3 className="h-tit2">청년기업인상</h3>
            </div>

            <div className="txt-box outline mt-22">
              <div className="def-list-wrap no-border">
                <dl className="def-list">
                  <dt>포상목적</dt>
                  <dd>국가 경제발전과 기술 창업 및 청년창업 활성화에 기여한 청년기업인의 성과와 노고를 격려</dd>
                  <dt>신청자격</dt>
                  <dd>
                    <ul className="krds-info-list decimal small " role="list">
                      <li role="listitem">창업에 성공한 만 39세 이하 기업대표</li>
                      <li role="listitem">젊은 패기와 열정을 바탕으로 창업에 성공한 모법적인 기업인</li>
                      <li role="listitem">사업의 실패를 극복하고 다시 도전하여 재기에 성공한 기업인</li>
                      <li role="listitem">청년일자리 창출에 크게 기여한 기업인</li>
                    </ul>
                  </dd>
                  <dt>포상내용</dt>
                  <dd>정부 포상(대통령표창, 국무총리표창, 장관표창 등) 및 민간포상</dd>
                </dl>
              </div>
            </div>

            <div className="search-top-box no-details mt-22">
              <div className="form-row-box row-center">
                <div className="select-box">
                  <label className="label" htmlFor="select_01">수상년도</label>
                  <select id="select_01" className="krds-form-select medium ">
                    <option value="">2023년도</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="krds-table-wrap mt-40">
              <table className="tbl col data">
              <caption>청년기업인상 표. 훈격, 성명, 소속, 주요공적 정보가 제공됨.</caption>
                <colgroup>
                  <col />
                  <col />
                  <col />
                  <col style={{width: "54.8%"}}/>
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" className="ac">훈격</th>
                    <th scope="col" className="ac">성명</th>
                    <th scope="col" className="ac">소속</th>
                    <th scope="col" className="ac">주요공적</th>
                  </tr>
                </thead>
                <tbody>
                   <tr>
                    <td className="ac">
                      <span>대통령 표창</span>
                    </td>
                    <td className="ac">
                      <span>장민후</span>
                    </td>
                    <td className="ac"><span>(주)휴먼스케이프</span></td>
                    <td className="ac"><span className="onellipsis-2" >국내 유일 희귀질환 모바일 앱 ‘레어노트’개발 및 치료제 후보물질 개발 등 희귀질환 극복에 기여함. 임신 육아 관리 앱 ‘마미톡’의 글로벌 진출을 통한 K-디지털 헬스분야 인지도 제고 디지털 헬스 분야 청년창업가로 서울바이오의료국제컨퍼런스, CBS인구포럼 등 주요 행</span></td>
                  </tr>
                     <tr>
                    <th className="ac">
                      <span>대통령 표창</span>
                    </th>
                    <td className="ac">
                      <span>장민후</span>
                    </td>
                    <td className="ac"><span>(주)휴먼스케이프</span></td>
                    <td className="ac"><span className="onellipsis-2" >국내 유일 희귀질환 모바일 앱 ‘레어노트’개발 및 치료제 후보물질 개발 등 희귀질환 극복에 기여함. 임신 육아 관리 앱 ‘마미톡’의 글로벌 진출을 통한 K-디지털 헬스분야 인지도 제고 디지털 헬스 분야 청년창업가로 서울바이오의료국제컨퍼런스, CBS인구포럼 등 주요 행</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 기업가 정신 유공자 */}
          <section className={`tab-conts ${activeTabIndex === 3 ? 'active' : ''}`}>
            <div className="page-title-wrap">
              <h3 className="h-tit2">기업가 정신 유공자</h3>
            </div>

            <div className="txt-box outline mt-22">
              <div className="def-list-wrap no-border">
                <dl className="def-list">
                  <dt>포상목적</dt>
                  <dd>최근 경제 어려움 타개와 창업 촉진 및 일자리 창출 등을 위하여 도전과 열정,혁신과 창의의 근간을 이루는 기업가정신의 중요성 매우 강조되고 있음</dd>
                  <dt>신청자격</dt>
                  <dd>기업가정신 생태계 구축과 문화조성에 기여한 기업가정신 유공자를 선정하여 성과와 노고를 격려</dd>
                  <dt>포상내용</dt>
                  <dd>중소벤처기업부 장관 표창, 한국청년기업가정신재단 이사장 표창</dd>
                  <dt>대상</dt>
                  <dd>기업가정신 교육, 정책 개발, 연구 등 기업가정신 생태계 구축과 문화조성에 3년 이상 기여한 공적이 있는 단체 또는 개인</dd>
                </dl>
              </div>
            </div>

            <div className="krds-table-wrap mt-40">
              <table className="tbl col data">
              <caption>기업자 정신 유공자 수상자 목록 표. 수상년도, 훈격, 소속/지위, 성명 정보가 제공됨.</caption>
                <colgroup>
                  <col style={{width: "16%"}}/>
                  <col style={{width: "36%"}}/>
                  <col style={{width: "35%"}}/>
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" className="ac">수상년도</th>
                    <th scope="col" className="ac">훈격</th>
                    <th scope="col" className="ac">소속/지위</th>
                    <th scope="col" className="ac">성명</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="ac">
                      <span>2000</span>
                    </td>
                    <td className="ac">
                      <span>중소벤처기업부 장관 표창</span>
                    </td>
                    <td className="ac"><span>중소벤처기업진흥공단/팀장</span></td>
                    <td className="ac"><span>홍길동</span></td>
                  </tr>
                  <tr>
                    <th className="ac">
                      <span>2000</span>
                    </th>
                    <td className="ac">
                      <span>중소벤처기업부 장관 표창</span>
                    </td>
                    <td className="ac"><span>중소벤처기업진흥공단/팀장</span></td>
                    <td className="ac"><span>홍길동</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

           {/* 기업가정신교육 우수사례 경진대회 */}
          <section className={`tab-conts ${activeTabIndex === 4 ? 'active' : ''}`}>
            <div className="page-title-wrap">
              <h3 className="h-tit2">기업가정신교육 우수사례 경진대회</h3>
            </div>

            <div className="txt-box outline mt-22">
              <div className="def-list-wrap no-border">
                <dl className="def-list">
                  <dt>추진목적</dt>
                  <dd>
                    <ul className="krds-info-list decimal small " role="list">
                      <li role="listitem">교육현장에서 실현된 우수 기업가정신교육 사례를 발굴·공유하여, 현장 중심의 교육 모델 확산 기반을 마련</li>
                      <li role="listitem">미래 교육환경 변화에 대응하는 기업가정신교육 프로그램과 실천 사례 및 우수 교육자 발굴</li>
                      <li role="listitem">우수사례에 대한 포상을 통해 기업가정신 교육자의 전문성과 실천 의지를 제고하고 교육 프로그램 개발을 장려</li>
                    </ul>
                  </dd>
                  <dt>훈격</dt>
                  <dd>중소벤처기업부장관상 등</dd>
                  <dt>대상</dt>
                  <dd>초･중･고 교사, 대학교수, 민간 교육자 등 교육현장의 기업가정신 교육자 누구나</dd>
                </dl>
              </div>
            </div>

            <div className="search-top-box no-details mt-22">
              <div className="form-row-box row-center">
                <div className="select-box">
                  <label className="label" htmlFor="select_02">수상회차</label>
                  <select id="select_02" className="krds-form-select medium ">
                    <option value="">12회</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="krds-table-wrap mt-40">
              <table className="tbl col data">
              <caption>기업가정신 교육 우수사례 경진대회 수상회차에 따른 정보 표.  성명, 소속, 직위, 주요공적 정보가 제공됨.</caption>
                <colgroup>
                  <col />
                  <col />
                  <col />
                  <col style={{width: "57.8%"}}/>
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" className="ac">성명</th>
                    <th scope="col" className="ac">소속</th>
                    <th scope="col" className="ac">직위</th>
                    <th scope="col" className="ac">주요공적</th>
                  </tr>
                </thead>
                <tbody>
                   <tr>
                    <td className="ac"><span>홍길동</span></td>
                    <td className="ac"><span>수원동신초등학교</span></td>
                    <td className="ac"><span>교사</span></td>
                    <td>창업왕, ★★ 어린이!</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div> 
    </>
  );
};

export default UI_USR_L_200;