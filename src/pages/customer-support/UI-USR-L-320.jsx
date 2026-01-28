import React, { useRef, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import Tab from '@components/ui/Tab';
import Accordion from '@components/ui/Accordion';
import { useUserMenu } from '@context/UserMenuContext.jsx';


const UI_USR_L_320 = () => {
  const tabData = useRef(['전체', '중소벤처24', '증명서발급', '정책정보']);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">자주 묻는 질문</h2>
        </div>

        <div className="search-top-box">
          <div className="sch-form-wrap">
            <select className="krds-form-select">
              <option value="">전체</option>
              <option value="">항목</option>
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

        <div className="mt-40">
          <Tab tabData={tabData.current} onTabChange={handleTabChange}></Tab>
        </div>

        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">24</span>개</li>
          </ul>
          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label for="search_result_count">목록 표시 개수</label></strong>
              <select className="krds-form-select-sort" id="search_result_count">
                <option>12개</option>
                <option>9개</option>
              </select>
            </li>
          </ul>
        </div>

        <Accordion type="single"> {/* multi일 경우 type="multi" */}
          <Accordion.Item>
            <Accordion.Header>
              <div className="accordion-title">
                <span className="krds-badge bg-light-primary">경영혁신 마일리지 제도</span>
                <p className="onellipsis-1">마일리지를 활용하여 사업신청을 했지만 지원대상이 되지 못하면(탈락하면) 사용한 마일리지는 어떻게 되나요?</p>
              </div>
            </Accordion.Header>
            <Accordion.Panel>
              <div className="accordion-panel-box">
                <p>
                  네, 마일리지를 사용하여 현장(서면)평가에 가점이 반영되었으나 지원 대상에서 탈락 시에는 사용한 마일리지는 반환처리 되지 않습니다.
                  단, 확인서 발급을 받았지만 변심으로 현장(서면)평가에 가점이 반영되기 전 상태에서만 반환신청이 가능합니다.
                </p>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item >
            <Accordion.Header>
              <div className="accordion-title">
                <span className="krds-badge bg-light-primary">경영혁신 마일리지 제도</span>
                <p className="onellipsis-1">마일리지를 활용하여 사업신청을 했지만 지원대상이 되지 못하면(탈락하면) 사용한 마일리지는 어떻게 되나요?</p>
              </div>
            </Accordion.Header>
            <Accordion.Panel>
              <div className="accordion-panel-box">
                <p>
                  네, 마일리지를 사용하여 현장(서면)평가에 가점이 반영되었으나 지원 대상에서 탈락 시에는 사용한 마일리지는 반환처리 되지 않습니다.
                  단, 확인서 발급을 받았지만 변심으로 현장(서면)평가에 가점이 반영되기 전 상태에서만 반환신청이 가능합니다.
                </p>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item >
            <Accordion.Header>
              <div className="accordion-title">
                <span className="krds-badge bg-light-primary">경영혁신 마일리지 제도</span>
                <p className="onellipsis-1">마일리지를 활용하여 사업신청을 했지만 지원대상이 되지 못하면(탈락하면) 사용한 마일리지는 어떻게 되나요?</p>
              </div>
            </Accordion.Header>
            <Accordion.Panel>
              <div className="accordion-panel-box">
                <p>
                  네, 마일리지를 사용하여 현장(서면)평가에 가점이 반영되었으나 지원 대상에서 탈락 시에는 사용한 마일리지는 반환처리 되지 않습니다.
                  단, 확인서 발급을 받았지만 변심으로 현장(서면)평가에 가점이 반영되기 전 상태에서만 반환신청이 가능합니다.
                </p>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Pagination/>

      </div> 
    </>
  );
};

export default UI_USR_L_320;