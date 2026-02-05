import React, {useState, useRef} from "react";
import { Link } from "react-router-dom";
import SideNavigation from "../components/ui/SideNavigation";
import Breadcrumb from "../components/ui/Breadcrumb";
import Tab from "../components/ui/Tab";
import Pagination from "../components/ui/Pagination";

const UI_USR_R_160 = () => {
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
    { label: "정책정보", link: "#" },
    { label: "사업공고", link: "#" },
    { label: "사업공고", link: "#" },
  ];

  // tab
    const tabData = useRef(['전체', '정책금융', '창업', '기술 R&D', '판로수출', '인력교육', '소상공인', '경영정보' ]);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
  
      const handleTabChange = (index) => {
      setActiveTabIndex(index);
    };

    const systemList = [
      {
        // logo: ,
        title: "벤처확인종합관리시스템",
        desc: "벤처기업 인증 확인 및<br/>공시 정보 조회"
      },
       {
        // logo: ,
        title: "벤처확인종합관리시스템",
        desc: "벤처기업 인증 확인 및<br/>공시 정보 조회"
      }
    ]
  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">통합로그인 시스템</h2>
        </div>

        <p className="guide-txt">
          <span>
            중소벤처기업부 및 산하 68개 핵심 플랫폼을 별도 가입 없이, <br/>
            <strong>중소벤처24·기업마당</strong> 통합 ID 하나로 이용하세요.
          </span>
        </p>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">Open API 소개</h3>
          <p className="conts-desc">
            특정 시스템이 갖고 있는 콘텐츠 데이터를 다른 이용자들이 손쉽게 이용하거나 재활용 할 수 있도록 돕기 위해 <br />
            표준화된 규약을 만들어 공개적으로 제공하는 것을 Open API(Application Program Interface)라고 말합니다. <br />
            중소벤처24에서는 그 동안 수집된 기업정보나 증명(확인)서 정보 등을 다른 유관 시스템에서 사용할 수 있도록 API를 개발하여 제공하고 있습니다. <br />
            중소벤처24의 API를 사용하면, 지원사업 신청 시 클릭 한 번으로 기업의 기본 데이터를 자동 입력하거나, <br />
            지원 자격 증빙을 위해 인증서를 별도로 제출하지 않더라도 기업이 받은 인증 정보를 확인할 수 있게 됩니다.
          </p>
        </div>

        <div className="helper-box refer mt-16">
          <p className="helper-tit">  통합로그인 관련 문의 : (044) 300-0990, (044) 300-0991</p>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">이용가능한 통합 시스템</h3>
          <div className="search-top-box">
            <div className="sch-form-wrap">
              <select className="krds-form-select">
                <option value="">전체</option>
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
        </div>

        <div className="mt-40">
          <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>
        </div>

        <div className="system-list-wrap">
          <ul className="system-list">
            {systemList.map((item, index) => (
              <li className="system-list-item">
                <div className="system-list-box">
                  <div className="logo-img"><img src={item.logo} alt="" /></div>
                  <strong className="title">{item.title}</strong>
                  <p className="desc">
                    {item.desc.split('<br/>').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i !== item.desc.split('<br/>').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
		
        <Pagination /> 

      </div> 
    </>
  );
};
 
export default UI_USR_R_160;
