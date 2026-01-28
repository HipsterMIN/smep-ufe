import React from 'react';
import { Link } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import ImgFormat from '@assets/sub/img_business_format_01.jpg';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_L_170 = () => {
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
          <h2 className="h-tit">기업업무용 서식</h2>
        </div>
        <div className="search-top-box">
          <div className="sch-form-wrap">
            <select className="krds-form-select">
              <option value="">제목</option>
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
            <li>이용가능한 업무용 서식<span className="point">3207</span>건</li>
          </ul>
        </div>

        <ul className="on-boxlist gap24 img-formatlist">
          <li>
            <div className="on-boxlist-in">
              <img src={ImgFormat} alt="" />
              <div>
                <div className="page-title-wrap">
                  <Link to="/">
                    <p className="h-tit3">업무 회의록 (월간 마케팅)</p>
                    <span className="sub-text">다운로드수 330</span>
                  </Link>
                  <p className="desc">회의명과 일자 시간 장소 참석자의 기본정보와 안건 의결사항을 입력할 수 있는 회의록 템플릿입니다. 회사 이름과 로고를 삽입할 수 있어 비즈니스용으로 적합합니다.월간 마케팅 회의내용이 작성 예시로 첨부되어 있습니다.</p>
                </div>
                <div className="side-btn">
                  <Link
                    to="#"
                    className="krds-btn tertiary medium">
                    바로보기
                  </Link>
                  <a
                    href="#"
                    download
                    className="krds-btn tertiary medium">
                    <i className="svg-icon ico-down"></i>
                    다운로드
                  </a>
                </div>
              </div>
            </div>  
          </li>          
          <li>
            <div className="on-boxlist-in">
              <img src={ImgFormat} alt="" />
              <div>
                <div className="page-title-wrap">
                  <Link to="/">
                    <p className="h-tit3">무급확인서(사업장개요)</p>
                    <span className="sub-text">다운로드수 330</span>
                  </Link>
                  <p className="desc">근무자가 개인적인 사유로 근무를 수행할 수 없게 되어 대치근무를 신청하는 대근 신청원 양식(작성예시)입니다. 근무자와 대치 근무자의 소속 부서 직위 성명과 대치 근무일자가 기재되어 있습니다. 제출사유로 가족행사 참여 등의 개인 사유가 언급되고 대치근무 내용으로 기획부 업무 전반 프로젝트 기획 및 관리 각 부서와의 협의 및 커뮤니케이션 등이 명시되어 있습니다.</p>
                </div>
                <div className="side-btn">
                  <Link
                    to="#"
                    className="krds-btn tertiary medium">
                    바로보기
                  </Link>
                  <a
                    href="#"
                    download
                    className="krds-btn tertiary medium">
                    <i className="svg-icon ico-down"></i>
                    다운로드
                  </a>
                </div>
              </div>
            </div>  
          </li> 
          <li>
            <div className="on-boxlist-in">
              <img src={ImgFormat} alt="" />
              <div>
                <div className="page-title-wrap">
                  <Link to="/">
                    <p className="h-tit3">면접기록표</p>
                    <span className="sub-text">다운로드수 330</span>
                  </Link>
                  <p className="desc">회의명과 일자 시간 장소 참석자의 기본정보와 안건 의결사항을 입력할 수 있는 회의록 템플릿입니다. 회사 이름과 로고를 삽입할 수 있어 비즈니스용으로 적합합니다.월간 마케팅 회의내용이 작성 예시로 첨부되어 있습니다.</p>
                </div>
                <div className="side-btn">
                  <Link
                    to="#"
                    className="krds-btn tertiary medium">
                    바로보기
                  </Link>
                  <a
                    href="#"
                    download
                    className="krds-btn tertiary medium">
                    <i className="svg-icon ico-down"></i>
                    다운로드
                  </a>
                </div>
              </div>
            </div>  
          </li>  
          <li>
            <div className="on-boxlist-in">
              <img src={ImgFormat} alt="" />
              <div>
                <div className="page-title-wrap">
                  <Link to="/">
                    <p className="h-tit3">면접결과 집계표</p>
                    <span className="sub-text">다운로드수 330</span>
                  </Link>
                  <p className="desc">회의명과 일자 시간 장소 참석자의 기본정보와 안건 의결사항을 입력할 수 있는 회의록 템플릿입니다. 회사 이름과 로고를 삽입할 수 있어 비즈니스용으로 적합합니다.월간 마케팅 회의내용이 작성 예시로 첨부되어 있습니다.</p>
                </div>
                <div className="side-btn">
                  <Link
                    to="#"
                    className="krds-btn tertiary medium">
                    바로보기
                  </Link>
                  <a
                    href="#"
                    download
                    className="krds-btn tertiary medium">
                    <i className="svg-icon ico-down"></i>
                    다운로드
                  </a>
                </div>
              </div>
            </div>  
          </li>
          <li>
            <div className="on-boxlist-in">
              <img src={ImgFormat} alt="" />
              <div>
                <div className="page-title-wrap">
                  <Link to="/">
                    <p className="h-tit3">디자이너 평가표</p>
                    <span className="sub-text">다운로드수 330</span>
                  </Link>
                  <p className="desc">회의명과 일자 시간 장소 참석자의 기본정보와 안건 의결사항을 입력할 수 있는 회의록 템플릿입니다. 회사 이름과 로고를 삽입할 수 있어 비즈니스용으로 적합합니다.월간 마케팅 회의내용이 작성 예시로 첨부되어 있습니다.</p>
                </div>
                <div className="side-btn">
                  <Link
                    to="#"
                    className="krds-btn tertiary medium">
                    바로보기
                  </Link>
                  <a
                    href="#"
                    download
                    className="krds-btn tertiary medium">
                    <i className="svg-icon ico-down"></i>
                    다운로드
                  </a>
                </div>
              </div>
            </div>  
          </li>          
        </ul>
				
        <Pagination /> 
      </div> 
    </>
  );
};
 
export default UI_USR_L_170;
