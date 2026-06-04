import React, { useRef, useState } from "react";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";
import corpLogoImgs from "../assets/sub/ico_corp_logo1.svg";

const UI_USR_R_160 = () => {
  const tabData = useRef([
    "전체",
    "정책금융",
    "창업·벤처",
    "기술·R&D",
    "판로·수출",
    "인력·교육",
    "소상공인",
    "경영정보",
  ]);

  const schFormWrapRef1 = useRef(null);

  const [isOpen, setOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [likedItems, setLikedItems] = useState({});
  const [selectedAgency, setSelectedAgency] = useState("");
  const [viewType, setViewType] = useState("card"); // card | list

  const handleToggleFilter = () => {
    schFormWrapRef1.current?.classList.toggle("on");
    setOpen((prev) => !prev);
  };

  const handleToggleLike = (index) => {
    setLikedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };

  const navigationData = {
    depth1Title: "더 많은 서비스",
    depth: [
      {
        depth2: "유관기관 둘러보기",
      },
    ],
  };

  const breadcrumbItems = [
    { label: "더 많은 서비스", link: "#" },
    { label: "유관기관 둘러보기", link: "#" },
  ];

  const agencyOptions = [
    { id: "agency_all", value: "", label: "전체" },
    { id: "agency_1", value: "중소벤처기업진흥공단", label: "중소벤처기업진흥공단" },
    { id: "agency_2", value: "소상공인시장진흥공단", label: "소상공인시장진흥공단" },
    { id: "agency_3", value: "창업진흥원", label: "창업진흥원" },
    { id: "agency_4", value: "기술보증기금", label: "기술보증기금" },
    { id: "agency_5", value: "중소기업기술정보진흥원", label: "중소기업기술정보진흥원" },
    { id: "agency_6", value: "한국중소벤처기업유통원", label: "한국중소벤처기업유통원" },
    { id: "agency_7", value: "대중소기업농어업협력재단", label: "대중소기업농어업협력재단" },
    { id: "agency_8", value: "메인비즈협회", label: "메인비즈협회" },
    { id: "agency_9", value: "신용보증재단중앙회", label: "신용보증재단중앙회" },
    { id: "agency_10", value: "한국벤처캐피탈협회", label: "한국벤처캐피탈협회" },
    { id: "agency_11", value: "중소기업중앙회", label: "중소기업중앙회" },
    { id: "agency_12", value: "중소벤처기업연구원", label: "중소벤처기업연구원" },
    { id: "agency_13", value: "(사)벤처기업협회", label: "(사)벤처기업협회" },
    { id: "agency_14", value: "한국창업보육협회", label: "한국창업보육협회" },
    { id: "agency_15", value: "한국경영기술지도사회", label: "한국경영기술지도사회" },
    { id: "agency_16", value: "창조경제혁신센터", label: "창조경제혁신센터" },
    { id: "agency_17", value: "중소기업융합중앙회", label: "중소기업융합중앙회" },
    { id: "agency_18", value: "(재)장애인기업종합지원센터", label: "(재)장애인기업종합지원센터" },
    { id: "agency_19", value: "이노비즈협회", label: "이노비즈협회" },
    { id: "agency_20", value: "KoDATA", label: "KoDATA" },
    { id: "agency_21", value: "(재)한국화학융합시험연구원", label: "(재)한국화학융합시험연구원" },
    { id: "agency_22", value: "(재)여성기업종합지원센터", label: "(재)여성기업종합지원센터" },
  ];

  const cardItems = Array.from({ length: 12 }).map((_, index) => ({
    id: index + 1,
    agency: index % 2 === 0 ? "중소벤처기업진흥공단" : "벤처기업협회",
    systemName:
      index % 2 === 0
        ? "기업인력애로센터 일자리매칭플랫폼"
        : "벤처확인종합관리시스템",
    description:
      index % 2 === 0
        ? "중소기업 구인난 해소를 위한 맞춤형 인재 매칭"
        : "벤처기업 인증 확인 및 공시 정보 조회",
    hashtags: index % 2 === 0 ? ["#정책금융", "#창업·벤처"] : ["#창업·벤처", "#경영정보"],
  }));

  const listItems = Array.from({ length: 10 }).map((_, index) => ({
    no: 305 - index,
    systemName: "벤처확인종합관리시스템",
    agency: "벤처기업협회",
    work: "벤처기업 인증 확인 및 공시 정보 조회",
  }));

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />

      <div className="contents w-full">
        <Breadcrumb items={breadcrumbItems} />

        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">유관기관 둘러보기</h2>
        </div>

        <div className="krds-tab-area layer">
          <p className="guide-txt custom">
            중소벤처기업부 및 산하 68개 핵심 플랫폼을 별도 가입 없이,<br />
            <b>중소벤처24·기업마당</b> 통합 ID 하나로 이용하세요.
          </p>

          <div className="tab-conts-wrap mt-40">
            <section className="tab-conts active">
              <h3 className="sr-only">사업유형별</h3>

              <div className="search-top-box mb-40">
                <div className="sch-form-wrap" ref={schFormWrapRef1}>
                  <div className="sch-input">
                    <input
                      type="text"
                      className="krds-input medium"
                      placeholder="검색어를 입력하세요"
                      title="검색어 입력"
                    />
                    <button type="button" className="krds-btn medium icon ico-search">
                      <span className="sr-only">검색</span>
                      <i className="svg-icon ico-sch"></i>
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`krds-btn medium text ${isOpen ? "on" : ""}`}
                    onClick={handleToggleFilter}
                  >
                    기관선택
                    <i className={`svg-icon ico-angle ${isOpen ? "up" : ""}`} />

                    <span className="onfilter-open sr-only">열기</span>
                    <span className="onfilter-close sr-only">닫기</span>
                  </button>

                  <div className="sch-filter-box">
                    <div className="filter-form">
                      <div className="on-mw100p gap24">
                        <strong className="label">기관별</strong>

                        <div className="krds-check-area">
                          {agencyOptions.map((item) => (
                            <div className="krds-form-chip small" key={item.id}>
                              <input
                                type="radio"
                                className="radio"
                                id={item.id}
                                name="agencySelect"
                                value={item.value}
                                checked={selectedAgency === item.value}
                                onChange={(event) => setSelectedAgency(event.target.value)}
                              />
                              <label
                                className="krds-form-chip-outline"
                                htmlFor={item.id}
                              >
                                {item.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Tab tabData={tabData.current} onTabChange={handleTabChange} />

              <ul className="sch-sort only-child mt-40">
                <li>
                    <strong className="sort-label"><label htmlFor="sort">조회방식</label></strong>
                   <div className="w-sort-btn">
                    <button
                    type="button"
                    className={`view-btn ${viewType === "card" ? "active" : ""}`}
                    onClick={() => setViewType("card")}
                    >
                    카드형
                    </button>

                    <button
                    type="button"
                    className={`view-btn ${viewType === "list" ? "active" : ""}`}
                    onClick={() => setViewType("list")}
                    >
                    목록형
                    </button>
                    </div>
                </li>
              </ul>

              {viewType === "card" ? (
                <ul className="krds-structured-list relate mt-40">
                  {cardItems.map((item, index) => (
                    <li className="structured-item" key={item.id}>
                      <div className="card-top">
                        <div className="corp-imgs">
                          <img src={corpLogoImgs} alt="기업 로고" />
                        </div>

                        <button
                          type="button"
                          className={`svg-icon heart like-btn ${
                            likedItems[index] ? "is-on" : ""
                          }`}
                          aria-label={`${item.systemName} 찜하기`}
                          onClick={() => handleToggleLike(index)}
                        />
                      </div>

                      <div className="card-body">
                        <p className="no-icon c-sub-tit">
                          <span className="onellipsis-1">{item.agency}</span>
                        </p>

                        <p className="no-icon c-bold-tit">
                          <span className="onellipsis-2">{item.systemName}</span>
                        </p>

                        <p className="no-icon c-normal-tit mb-20">
                          <span className="onellipsis-2">{item.description}</span>
                        </p>

                        <div className="hash-box">
                          {item.hashtags.map((tag) => (
                            <span className="hashtag" key={tag}>
                              {tag}
                            </span>
                          ))}
                        </div>

                        <button type="button" className="krds-btn small tertiary go-btn">
                          바로가기 <i className="svg-icon ico-angle right" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="krds-table-wrap mt-40">
                  <table className="tbl col data">
                    <caption>
                      유관기관 목록 번호, 유관시스템명, 유관기관, 시스템 업무 정보가 제공됩니다.
                    </caption>
                    <colgroup>
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "28%" }} />
                      <col style={{ width: "24%" }} />
                      <col />
                    </colgroup>
                    <thead>
                      <tr>
                        <th scope="col" className="ac">
                          번호
                        </th>
                        <th scope="col" className="ac">
                          유관시스템명
                        </th>
                        <th scope="col" className="ac">
                          유관기관
                        </th>
                        <th scope="col" className="ac">
                          시스템 업무
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {listItems.map((item) => (
                        <tr key={item.no}>
                          <td className="ac">{item.no}</td>
                          <td>{item.systemName}</td>
                          <td>{item.agency}</td>
                          <td>{item.work}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Pagination />
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default UI_USR_R_160;