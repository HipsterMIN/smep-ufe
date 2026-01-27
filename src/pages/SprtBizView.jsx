import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import captureImg2 from '../../styles/img/capture2.png';
import { useUserMenu } from '../context/UserMenuContext.jsx';
import { api as apiClient } from '../lib/apiClient.js';

const SprtBizView = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const { id } = useParams();
  const [item, setItem] = useState(null);

  const shadowTextRef1 = useRef(null);
  const shadowTextRef2 = useRef(null);

  const handleToggleTextShadow1 = () => {
    shadowTextRef1.current.classList.toggle('on');
  };

  const handleToggleTextShadow2 = () => {
    shadowTextRef2.current.classList.toggle('on');
  };
  const detail = async () => {
    const response = await apiClient.get(`/api/v1/sprtBiz/${id}`);
    setItem(response.data);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    detail();
  }, [id]);

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
        <Breadcrumb items={breadcrumbItems}/>
        <div className="page-title-wrap on-btmline" data-type="responsive">
          <p className="on-p1 on-colorblue">중소벤처기업부 지원사업 소개</p>
          <h2 className="h-tit2">{item.sprtBizNm}</h2>
        </div>

        <div className="on-announcement">
          <div className="on-announcement-inner">
            <p>{item.sprtCn}</p>
            <div className="ac">
              <Link type="button" className="krds-btn large krds-btn-shadow">공고알림 예약하기</Link>
            </div>
          </div>
        </div>

        <div className="page-title-wrap on-btmline" data-type="responsive">
          <h3 className="h-tit3">{item.sprtBizNm}</h3>
        </div>
        <div className="def-list-wrap">
          <dl className="def-list">
            <dt>지원대상</dt>
            <dd>{item.sprtTrgtCn}sprtExclTrgtCn</dd>
            <dt>비지원대상</dt>
            <dd>
              <div className="onshadow-text" ref={shadowTextRef1}>
                {item.sprtExclTrgtCn}
              </div>
              <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow" onClick={handleToggleTextShadow1}>
                  전체보기
                <i className="svg-icon ico-angle"></i>
              </button>
            </dd>
            <dt>지원내용</dt>
            <dd>
              <div className="onshadow-text" ref={shadowTextRef2}>
                {item.sprtCn}
              </div>
              <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow" onClick={handleToggleTextShadow2}>
                  전체보기
                <i className="svg-icon ico-angle"></i>
              </button>
            </dd>
          </dl>
        </div>

        <div className="page-title-wrap on-btmline" data-type="responsive">
          <h3 className="h-tit3">신청절차</h3>
        </div>
        <div className="def-list-wrap">
          <dl className="def-list">
            <dt>신청접수</dt>
            <dd>{item.aplyMthdCn}</dd>
            <dt>신청시기</dt>
            <dd>-</dd>
            <dt>처리절차</dt>
            <dd>
              <div className="on-def-imgbox">
                <img src={captureImg2} alt="" />
              </div>
            </dd>
            <dt>심사평가내용</dt>
            <dd>{item.srngEvlCn}</dd>
          </dl>
        </div>

        <div className="page-title-wrap on-btmline" data-type="responsive">
          <h3 className="h-tit3">문의처</h3>
        </div>
        <div className="def-list-wrap">
          <dl className="def-list">
            <dt>문의처</dt>
            <dd>{item.sprtBizInqplCn}</dd>
          </dl>
        </div>

        <div className="page-title-wrap has-badge-type" data-type="responsive">
          <h3 className="h-tit3">진행중인 사업공고</h3>
          <span className="krds-badge bg-primary number">2건</span>
        </div>

        {/* table [S] */}
        {/*<div className="krds-table-wrap">
          <table className="tbl col data">
            <caption>진행중인 사업공고 표. 번호, 제목, 신청기간, 소관부처·지자체, 사업수행기관, 조회수 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '5%' }} />
              <col />
              <col style={{ width: '200px' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '5%' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">번호</th>
                <th scope="col" className="ac">제목</th>
                <th scope="col" className="ac">신청기간</th>
                <th scope="col" className="ac">소관부처·지자체</th>
                <th scope="col" className="ac">사업수행기관</th>
                <th scope="col" className="ac">조회수</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <a className="onellipsis-1" href="#">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac"><span>433</span></td>
              </tr>
              <tr>
                <th scope="row" className="ac">
                  <span>1444</span>
                </th>
                <td>
                  <a className="onellipsis-1" href="#">
                    <span className="krds-badge bg-light-primary">기술</span>
                    <span>2026년 국산의료기기 사용자(의료기관) 임상평가 지원 사업 모집 공고</span>
                  </a>
                </td>
                <td className="ac"><span>25-12-24 ~ 26-02-06</span></td>
                <td className="ac"><span>보건복지부</span></td>
                <td className="ac"><span>한국부건산업진흥원</span></td>
                <td className="ac"><span>433</span></td>
              </tr>
            </tbody>
          </table>
        </div>*/}
        {/* table [E] */}

        <div className="onboard-btm-btngroup">
          <div>
            <button type="button" className="krds-btn tertiary xlarge">
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
            <button type="button" className="krds-btn tertiary xlarge">
              <i className="svg-icon ico-copy"></i>
                링크복사
            </button>
          </div>
        </div>

        <div className="assess-question-wrap">
          <div className="assess-qu">이 페이지에 만족하시나요?</div>
          <div className="assess-an">
            <div className="krds-form-chip large">
              <input type="radio" className="radio" name="rdo_chip_size2" id="rdo_chip_lg2-1" checked="" />
              <label className="krds-form-chip-outline yes" for="rdo_chip_lg2-1">
                  네
                <i className="svg-icon ico-smile"></i>
              </label>
            </div>
            <div className="krds-form-chip large">
              <input type="radio" className="radio" name="rdo_chip_size2" id="rdo_chip_lg2-2" />
              <label className="krds-form-chip-outline no" for="rdo_chip_lg2-2">
                  아니오
                <i className="svg-icon ico-sad"></i>
              </label>
            </div>
          </div>
        </div>


      </div>
    </>
  );
};

export default SprtBizView;
