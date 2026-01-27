import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';

import { useUserMenu } from '../context/UserMenuContext.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useRef, useState, useEffect } from 'react';
import { api as apiClient } from '../lib/apiClient.js';

const UI_USR_R_031 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const { plcyFnncNo } = useParams();

  const navigate = useNavigate();

  // ✅ API 데이터 상태 관리
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);

  const shadowTextRef = useRef(null);
  const shadowTextRef2 = useRef(null);
  const shadowTextRef3 = useRef(null);

  // ✅ API 호출
  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/v1/finance-policy/${plcyFnncNo}`);
        setDetailData(response.data);
      } catch (error) {
        console.error('상세 데이터 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (plcyFnncNo) {
      fetchDetailData();
    }
  }, [plcyFnncNo]);

  const handleToggleTextShadow = () => {
    shadowTextRef.current.classList.toggle('on');
  };

  const handleToggleTextShadow2 = () => {
    shadowTextRef2.current.classList.toggle('on');
  };

  const handleToggleTextShadow3 = () => {
    shadowTextRef3.current.classList.toggle('on');
  };

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  // ✅ 로딩 중 처리
  if (loading) {
    return <div>로딩중...</div>;
  }

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems}/>
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">정책금융안내</p>
          <h2 className="h-tit2">{detailData.plcyFnncNm}</h2>
        </div>
        <ul className="onboard-summary">
          <li>
            <span className="sr-only">작성일</span>
            <span>2025.12.29</span>
          </li>
          <li>
            <span>
              <span className="sr-only">조회수</span>
              <i className="svg-icon ico-scrap"></i>
              36
            </span>
          </li>
          <li>
            <span>
              <span className="sr-only">스크랩수</span>
              <i className="svg-icon ico-pw-visible-on"></i>
              0
            </span>
          </li>
        </ul>

        <div className="conts-desc">{detailData.plcyFnncGdsPrps}</div>

        <div className="on-announcement">
          <div className="on-announcement-inner">
            <h4 className="announcement-title"><i className="svg-icon ico-building"></i> 중소벤처기업진흥공단</h4>
            <div className="announcement-info">
              <div className="announcement-item">
                <strong className="announcement-title"><i className="svg-icon ico-search-custom"></i>자금용도</strong>
                <p className="announcement-text">시설·운전자금</p>
              </div>
              <div className="announcement-item">
                <strong className="announcement-title"><i className="svg-icon ico-coin"></i>대출한도</strong>
                <p className="announcement-text">{detailData.plcyFnncSprtLimCn || '한도 미정'}</p>
              </div>
              <div className="announcement-item">
                <strong className="announcement-title"><i className="svg-icon ico-graph"></i>기업규모</strong>
                <p className="announcement-text">{detailData.plcyFnncEntSclSmryCn || '미정'}</p>
              </div>
            </div>
            <div className="ac">
              <a
                href={detailData.plcyFnncDtlUrlAddr}
                target="_blank"
                rel="noopener noreferrer"
                className="krds-btn secondary large krds-btn-shadow"
              >
                <i className="svg-icon ico-information"></i>
                상세정보
              </a>
              <a
                href={detailData.plcyFnncInqplUrlAddr}
                target="_blank"
                rel="noopener noreferrer"
                className="krds-btn secondary large krds-btn-shadow"
              >
                <i className="svg-icon ico-faq"></i>
                문의하기
              </a>
              <a
                href={detailData.plcyFnncAplyUrlAddr}
                target="_blank"
                rel="noopener noreferrer"
                className="krds-btn primary large krds-btn-shadow"
              >
                신청하기
              </a>
            </div>
          </div>
        </div>

        <div className="krds-tag-wrap mt-24">
          <span className="krds-btn-tag">#혁신성장</span>
          <span className="krds-btn-tag">#혁신성장</span>
          <span className="krds-btn-tag">#혁신성장</span>
          <span className="krds-btn-tag">#혁신성장</span>
          <span className="krds-btn-tag">#혁신성장</span>
          <span className="krds-btn-tag">#혁신성장지원자금</span>
        </div>

        <div className="page-title-wrap on-btmline" data-type="responsive">
          <h3 className="h-tit3">상품안내</h3>
          <p className="conts-desc mb-0">본 상품은 해당 금융기관에서 제공하는 정책금융 상품이며, 정확한 조건 및 한도는 금융기관을 통해 확인하시기 바랍니다.</p>
        </div>
        <div className="def-list-wrap">
          <dl className="def-list">
            {/* 1열에 4개 들어가는 구조 */}
            <div className="def-list-group">
              <dt>기업규모</dt>
              <dd>{detailData.plcyFnncEntSclSmryCn || '미정'}</dd>
              <dt>우대 기업 유형</dt>
              <dd>수출 , 벤처 , 혁신성장공동기준 , 여성 , 장애인 , 고용창출우수</dd>
            </div>
            <div className="def-list-group">
              <dt>신청방식</dt>
              <dd>온라인 신청</dd>
              <dt>융자방식</dt>
              <dd>직접대출 , 대리대출 , 성장공유형 , 투자조건부융자</dd>
            </div>
            <div className="def-list-group">
              <dt>대출한도</dt>
              <dd>{detailData.plcyFnncSprtLimCn || '한도 미정'}</dd>
              <dt>대출기간</dt>
              <dd>시설 : 10년, 운전 : 5년</dd>
            </div>
            <dt>지원대상</dt>
            <dd>{detailData.plcyFnncSprtTrgtCn}</dd>
            <dt>업종</dt>
            <dd>
              {/*데이터없음*/}
              <div className="onshadow-text" ref={shadowTextRef}>
                  농업, 임업 및 어업(01~03), 광업(05~08), 제조업(10~34), 전기, 가스, 증기 및 공기 조절 공급업(35), 수도, 하수 및 폐기물 처리,
                  원료 재생업(36~39), 건설업(41~42), 도매 및 소매업(45~47), 운수 및 창고업(49~52), 숙박 및 음식점업(55~56), 정보통신업(58~63),
                  전문, 과학 및 기술 서비스업(70~73), 사업시설 관리, 사업 지원 및 임대 서비스업(74~76), 교육 서비스업(85), 보건업 및 사
                  농업, 임업 및 어업(01~03), 광업(05~08), 제조업(10~34), 전기, 가스, 증기 및 공기 조절 공급업(35), 수도, 하수 및 폐기물 처리,
                  원료 재생업(36~39), 건설업(41~42), 도매 및 소매업(45~47), 운수 및 창고업(49~52), 숙박 및 음식점업(55~56), 정보통신업(58~63),
                  전문, 과학 및 기술 서비스업(70~73), 사업시설 관리, 사업 지원 및 임대 서비스업(74~76), 교육 서비스업(85), 보건업 및 사
              </div>
              <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow"
                onClick={handleToggleTextShadow}>
                  전체보기
                <i className="svg-icon ico-angle"></i>
              </button>
            </dd>
            <dt>자금용도</dt>
            <dd>시설자금 , 운전자금</dd>
            <dt>우대조건</dt>
            <dd>
              <div className="onshadow-text" ref={shadowTextRef2}>
                  2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                  ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                  - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                  ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                  2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                  ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                  - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                  ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
                  2026년「국산 의료기기 사용자(의료기관) 임상평가 지원 사업」을 수행할 기관을 다음과 같이 공모하오니 의료기기 기업 및 의료기관의 적극적인 참여를 바랍니다.
                  ☞ 임상평가 대상 의료기기를 제조한 국내 의료기기 기업
                  - 국내 의료기기 제조기업(주관기업)과 제품 임상평가가 가능한 의료기관(참여기관)으로 구성된 컨소시엄
                  ※ 해외기업은 국내기업과 컨소시엄으로 참여 가능
              </div>
              <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow"
                onClick={handleToggleTextShadow2}>
                  전체보기
                <i className="svg-icon ico-angle"></i>
              </button>
            </dd>
            <dt>대출제한대상</dt>
            <dd>
              <div
                className="onshadow-text"
                ref={shadowTextRef3}
                dangerouslySetInnerHTML={{ __html: detailData.plcyFnncSprtExclTrgtCn || '신용거래 불가 기업' }}
              />
              <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow"
                onClick={handleToggleTextShadow3}>
                  전체보기
                <i className="svg-icon ico-angle"></i>
              </button>
            </dd>
            {/* 1열에 4개 들어가는 구조 */}
            <div className="def-list-group">
              <dt>상환방법</dt>
              <dd>분할상환</dd>
              <dt>금리변동여부</dt>
              <dd>변동</dd>
            </div>
            <dt>문의</dt>
            <dd>{detailData.inqplCn}</dd>
            <div className="def-list-group">
              <dt>매출액</dt>
              <dd>중소기업 범위 기준</dd>
              <dt>업력</dt>
              <dd>7년 이상</dd>
            </div>
            <div className="def-list-group">
              <dt>관할 지역</dt>
              <dd>{detailData.cmptncRgnNm}</dd>
              <dt>기준금리</dt>
              <dd>정책자금 기준금리(변동) + 0.5%p</dd>
            </div>
            <dt>거치기간</dt>
            <dd>시설 : 4년, 운전 : 2년</dd>
          </dl>
        </div>

        <div className="onboard-btm-btngroup">
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={goBack}>
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
            <a
              href={detailData.plcyFnncInqplUrlAddr}
              target="_blank"
              rel="noopener noreferrer"
              className="krds-btn tertiary xlarge"
            >
              <i className="svg-icon ico-faq"></i>
              문의하기
            </a>
            <a
              href={detailData.plcyFnncDtlUrlAddr}
              target="_blank"
              rel="noopener noreferrer"
              className="krds-btn tertiary xlarge"
            >
              상세정보
              <i className="svg-icon ico-link"></i>
            </a>
            <a
              href={detailData.plcyFnncAplyUrlAddr}
              target="_blank"
              rel="noopener noreferrer"
              className="krds-btn primary xlarge"
            >
              신청하기
              <i className="svg-icon ico-angle right"></i>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default UI_USR_R_031;
