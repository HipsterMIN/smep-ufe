import { useEffect, useMemo, useState } from 'react';
import { useLocation, useMatches, useNavigate, useSearchParams } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Pagination from '@components/ui/Pagination';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { appendListSearchToPath, getNumberSearchParam, getSearchParam, setQueryParam } from '@utils/listNavigation.js';
import '@styles/custom.scss';
const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const UI_USR_L_130 = () => {
  const matches = useMatches();
  const pageTitle = [...matches].reverse().find((match) => match?.handle?.menuNm)?.handle?.menuNm || '';
  const location = useLocation();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">중기부 소관 법령</h2>
        </div>

        <div className="PrintArea">
          <div className="info-box">
            <h5 className="tit"><i className="svg-icon ico-check-tit"></i>소관법률</h5>
            <div className="txt">
              <i className="svg-icon pure circle-check"></i>
              <p>중소벤처기업부 소관법령(법률/시행령/시행규칙)자료는 법제처 "<b className="txt_bold">국가법령정보센터</b>"와 연계하여 제공하고 있으며, 좀더 자세한 정보를 확인 하시려면 "<b className="txt_bold">국가법령정보센터</b>" 에서 확인 하시기 바랍니다.
              </p>
            </div>
            <div className="btn-box">
              <a href="https://www.law.go.kr/" className="krds-btn" target="_blank" title="법령종합검색 새창열림">법령종합검색 바로가기<span className="svg-icon ico-go"></span></a>
            </div>
          </div>
          <div className="jurisdiction_law">
            <ul>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/중소기업기본법" title="중소기업기본법 새창열기">
                            중소기업기본법
                  <span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/중소기업협동조합법" title="중소기업협동조합법 새창열기">
                            중소기업협동조합법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/중소기업인력지원특별법" title="중소기업 인력지원 특별법 새창열기">
                            중소기업 인력지원 특별법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/중소기업기술보호지원에관한법률" title="중소기업 기술보호 지원에 관한 법률 새창열기">
                            중소기업 기술보호   지원에 관한 법률<span className="krds-badge"><i className="svg-icon ico-go"></i></span></a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/중소기업사업전환촉진에관한특별법" title="중소기업 사업전환 촉진에 관한 특별법 새창열기">
                            중소기업 사업전환 촉진에 관한 특별법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/중소기업제품구매촉진및판로지원에관한법률" title="중소기업제품 구매촉진 및 판로지원에 관한 법률 새창열기">
                            중소기업제품 구매촉진 및 판로지원에 관한 법률
                  <span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/중소기업기술혁신촉진법" title="중소기업 기술혁신 촉진법 새창열기">
                            중소기업 기술혁신 촉진법
                  <span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/중소기업진흥에관한법률" title="중소기업진흥에 관한 법률 새창열기">
                        중소기업진흥에 관한 법률<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/중소기업창업지원법" title="중소기업창업 지원법 새창열기">
                            중소기업창업 지원법
                  <span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/대ㆍ중소기업상생협력촉진에관한법률" title="대·중소기업 상생협력 촉진에 관한 법률 새창열기">
                            대·중소기업 상생협력 촉진에 관한 법률
                  <span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/1인창조기업육성에관한법률" title="1인 창조기업 육성에 관한 법률 새창열기">1인 창조기업 육성에 관한 법률<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/벤처기업육성에관한특별법" title="벤처기업육성에 관한 특별법 새창열기">벤처기업육성에 관한 특별법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/소상공인보호및지원에관한법률" title="소상공인 보호 및 지원에 관한 법률 새창열기">소상공인 보호 및 지원에 관한 법률<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/도시형소공인지원에관한특별법" title="도시형 소공인 지원에 관한 특별법 새창열기">도시형 소공인 지원에 관한 특별법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/소상공인생계형적합업종지정에관한특별법/(15687,20180612)" title="소상공인 생계형 적합업종 지정에 관한 특별법 새창열기">소상공인 생계형 적합업종 지정에 관한 특별법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/규제자유특구및지역특화발전특구에관한규제특례법" title="규제자유특구 및 지역특화발전특구에 관한 규제특례법 새창열기">규제자유특구 및 지역특화발전특구에 관한 규제특례법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/산업기술단지지원에관한특례법" title="산업기술단지 지원에 관한 특례법 새창열기">산업기술단지 지원에 관한 특례법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/지역신용보증재단법" title="지역신용보증재단법 새창열기">지역신용보증재단법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/전통시장및상점가육성을위한특별법" title="전통시장 및 상점가 육성을 위한 특별법 새창열기">전통시장 및 상점가 육성을 위한 특별법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/여성기업지원에관한법률" title="여성기업지원에 관한 법률 새창열기">여성기업지원에 관한 법률<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/장애인기업활동촉진법" title="장애인기업활동 촉진법 새창열기">장애인기업활동 촉진법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/기술보증기금법" title="기술보증기금법 새창열기">기술보증기금법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/소상공인기본법" title="소상공인기본법 새창열기">소상공인기본법<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li><a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/벤처투자촉진에관한법률" title="벤처투자 촉진에 관한 법률 새창열기">벤처투자 촉진에 관한 법률<span className="krds-badge"><i className="svg-icon ico-go"></i></span>
              </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/지역상권상생및활성화에관한법률" title="지역상권 상생 및 활성화에 관한 법률 새창열기">
                            지역상권 상생 및 활성화에 관한 법률
                  <span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/지역중소기업육성및혁신촉진등에관한법률" title="지역중소기업 육성 및 혁신촉진 등에 관한 법률 새창열기">
                            지역중소기업 육성 및 혁신촉진 등에 관한 법률
                  <span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/경영지도사및기술지도사에관한법률" title="경영지도사 및 기술지도사에 관한 법률 새창열기">
                            경영지도사 및 기술지도사에 관한 법률
                  <span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
              <li>
                <a target="_blank" className="link_type_blank" href="http://www.law.go.kr/법령/중소기업스마트제조혁신촉진에관한법률" title="중소기업 스마트제조혁신 촉진에 관한 법률 새창열기">
                            중소기업 스마트제조혁신 촉진에 관한 법률
                  <span className="krds-badge"><i className="svg-icon ico-go"></i></span>
                </a>
              </li>
            </ul>
		    </div>
        </div>
      </div>
    </>
  );
};

export default UI_USR_L_130;
