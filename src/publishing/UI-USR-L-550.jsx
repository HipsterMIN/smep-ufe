import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Pagination  from "../components/ui/Pagination";


const UI_USR_L_550 = () => {
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
            나의 Open API 신청내역
          </h2>
        </div>

        <div className="conts-wrap">
          <h3 className="sec-tit">인증키 신청 이력</h3>

          <div className="search-list-top">
            <ul className="sch-info" aria-live="polite">
              <li>검색 결과 <span className="point">2</span>건</li>
            </ul>
            <ul className="sch-sort">
              <li>
                <strong className="sort-label"><label htmlFor="sort1">목록 표시 개수</label></strong>
                <div>
                  <select className="krds-form-select-sort" id="sort1">
                    <option>전체</option>
                    <option>10개</option>
                  </select>
                </div>
              </li>
            </ul>
          </div>

          <div className="krds-table-wrap">
            <table className="tbl col data t-block">
              <caption>인증키 신청 이력 표. 순번, 소속기관, 시스템명, 신청API, 신청 이메일, 신청일, 사용여부 정보가 제공됨.</caption>
              <colgroup>
                <col style={{width: "7.4%"}}/>
                <col style={{width: "16.8%"}}/>
                <col style={{width: "16.2%"}}/>
                <col style={{width: "20%"}}/>
                <col style={{width: "16%"}}/>
                <col/>
                <col style={{width: "9.2%"}}/>
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">순번</th>
                  <th scope="col" className="ac">소속기관</th>
                  <th scope="col" className="ac">시스템명</th>
                  <th scope="col" className="ac">신청API</th>
                  <th scope="col" className="ac">신청 이메일</th>
                  <th scope="col" className="ac">신청일</th>
                  <th scope="col" className="ac">사용여부</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="ac"><span>2</span></th>
                  <td className="ac"><span>중소벤처기업부</span></td>
                  <td className="ac"><span>스마트공장수준확인서</span></td>
                  <td className="ac"><span className="txt-point">성과공유기업확인서</span></td>
                  <td className="ac"><span>haru@tipa.or.kr</span></td>
                  <td className="ac"><span>2025-08-14</span></td>
                  <td className="ac"><span>Y</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Pagination/>

      </div> 
    </>
  );
};

export default UI_USR_L_550;
