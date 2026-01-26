import React, { useEffect, useRef, useState } from 'react';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import SearchListTop from '../components/ui/SearchListTop';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { api as apiClient } from '../lib/apiClient.js';

const Pbanc = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  const shadowTextRef = useRef(null);

  const handleToggleTextShadow = () => {
    shadowTextRef.current.classList.toggle('on');
  };

  const navigationData = {
    depth1Title: '신청·발급',
    depth: [
      {
        depth2: 'AI 스마트 검색',
        active: true,
        depth3: [
          {
            label: 'AI 스마트 검색',
            link: '/req/ai/ai-smart-search',
          },
        ],
      },
      {
        depth2: '중소벤처기업부 지원사업공고',
        active: true,
        depth3: [
          {
            label: '지원사업',
            link: '/main-dev/service/UI_USR_L_010',
          },
        ],

      },
      {
        depth2: '사업공고',
        active: true,
        depth3: [
          {
            label: '사업공고',
            link: '/main-dev/service/pbanc',
            active: true,
          },
        ],
      },
      {
        depth2: '정책금융',
        active: true,
        depth3: [
          {
            label: '정책금융안내',
            link: '/main-dev/service/UI_USR_L_030',
          },
        ],
      },
      {
        depth2: '증명서 발급',
        active: true,
        depth3: [
          {
            label: '증명서 발급',
            link: '/main-dev/service/UI_USR_L_040',
          },
        ],
      },
    ],
  };

  const breadcrumbItems = [
    { label: '신청·발급', link: '#' },
    { label: '사업공고', link: '#' },
    { label: '사업공고', link: '#' },
  ];

  const schFormWrapRef = useRef(null);

  const handleToggleFilter = () => {
    schFormWrapRef.current.classList.toggle('on');
  };

  const detail = async () => {
    /*const config = {
      method: 'GET',
      url: `http://localhost:8081/api/v1/pbanc/${id}`,
      headers: {
        'Content-Type': 'application/json'
      },
    };
    const response = await axios(config);*/
    const response = await apiClient.get(`/api/v1/pbanc/${id}`);
    setItem(response.data);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    detail();
  }, [id]);

  function formatToYYMMDD(value) {
    if (!value) return '';

    let date;

    // YYYYMMDD (숫자 또는 문자열)
    if (/^\d{8}$/.test(String(value))) {
      const str = String(value);
      const yyyy = str.slice(0, 4);
      const mm = str.slice(4, 6);
      const dd = str.slice(6, 8);

      date = new Date(`${yyyy}-${mm}-${dd}`);
    }
    // ISO 형식 (2024-01-12T00:00:00)
    else {
      date = new Date(value);
    }

    // 유효성 체크
    if (isNaN(date.getTime())) return '';

    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}.${mm}.${dd}`;
  }

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems}/>
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">지원사업공고</p>
          <h2 className="h-tit2">지원사업 공고</h2>
        </div>
        <ul className="onboard-summary">
          <li>
            <span className="sr-only">작성일</span>
            <span>{formatToYYMMDD(item?.created_at)}</span>
          </li>
          <li>
            <span>
              <span className="sr-only">조회수</span>
              <i className="svg-icon ico-scrap"></i>
                0
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
        <div className="def-list-wrap">
          <dl className="def-list">
            <dt>분야</dt>
            <dd>{item?.sprtfld}</dd>
            <dt>소관부처·지자체</dt>
            <dd>{item?.mngdeptnm}</dd>
            <dt>사업개요</dt>
            <dd>
              <div className="onshadow-text" ref={shadowTextRef}>
                {item?.bizotln}
              </div>
              <button type="button" className="krds-btn tertiary xsmall ontoggle-textshadow"
                onClick={handleToggleTextShadow}>
                  전체보기
                <i className="svg-icon ico-angle"></i>
              </button>
            </dd>
            <dt>신청기간</dt>
            <dd>{item?.aplyprd}</dd>
            <dt>사업신청 방법</dt>
            <dd>
              <ul className="list">
                <li>{item?.aplymthcn}</li>
                {item?.bizaplyurl && (
                  <li>
                    <button type="button" className="krds-btn xsmall" onClick={() => window.open(item?.bizaplyurl, '_blank')}>
                          온라인 신청 바로가기
                      <i className="svg-icon ico-angle right"></i>
                    </button>
                  </li>
                )}
                {/*<li>오프라인 신청</li>*/}
              </ul>
            </dd>
            <dt>문의처</dt>
            <dd>{item?.inqpl}</dd>
          </dl>
        </div>
        <div style={{
          width: '100%',
          height: '800px',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          marginBottom: '48px',
        }}>
            PDF VIEWER
        </div>

        {/*<div className="onbox-group-areawrap">
            <p className="onbox-group-title">본문출력파일</p>
            <ul className="box-group-area">
              <li>
                <p className="tit">
                  <i className="svg-icon ico-file2"></i>
                  2026년 스마트 제조혁신 지원사업 사업설명회 추가 개최 안내.png
                </p>
                <div className="btn-wrap">
                  <a href="#" className="krds-btn medium link basic" target="_blank" title="새 창 열기"><i
                      className="svg-icon ico-sch-plus"></i> 바로보기 </a>
                  <button type="button" className="krds-btn medium text on-colorblue"><i
                      className="svg-icon ico-down on-bgcolorblue"></i> 다운로드
                  </button>
                </div>
              </li>
            </ul>
          </div>*/}
        {item?.atchfilenm && (
          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">첨부파일</p>
            <ul className="box-group-area">
              <li>
                <p className="tit">
                  <i className="svg-icon ico-file2"></i>
                  {item?.atchfilenm}
                </p>
                <div className="btn-wrap">
                  <a href="#" className="krds-btn medium link basic" target="_blank" title="새 창 열기"><i
                    className="svg-icon ico-sch-plus"></i> 바로보기 </a>
                  <button type="button" className="krds-btn medium text on-colorblue"><i
                    className="svg-icon ico-down on-bgcolorblue"></i> 다운로드
                  </button>
                </div>
              </li>
            </ul>
          </div>
        )}
        {/*<div className="onbox-group-areawrap">
            <p className="onbox-group-title">첨부파일</p>
            <ul className="box-group-area">
              <li>
                <p className="tit">
                  <i className="svg-icon ico-file2"></i>
                  2026년 스마트 제조혁신 지원사업 사업설명회 추가 개최 안내.png
                </p>
                <div className="btn-wrap">
                  <a href="#" className="krds-btn medium link basic" target="_blank" title="새 창 열기"><i
                      className="svg-icon ico-sch-plus"></i> 바로보기 </a>
                  <button type="button" className="krds-btn medium text on-colorblue"><i
                      className="svg-icon ico-down on-bgcolorblue"></i> 다운로드
                  </button>
                </div>
              </li>
              <li>
                <p className="tit">
                  <i className="svg-icon ico-file2"></i>
                  2026년 스마트 제조혁신 지원사업 사업설명회 추가 개최 안내.png
                </p>
                <div className="btn-wrap">
                  <a href="#" className="krds-btn medium link basic" target="_blank" title="새 창 열기"><i
                      className="svg-icon ico-sch-plus"></i> 바로보기 </a>
                  <button type="button" className="krds-btn medium text on-colorblue"><i
                      className="svg-icon ico-down on-bgcolorblue"></i> 다운로드
                  </button>
                </div>
              </li>
            </ul>
          </div>*/}

        <div className="onboard-btm-btngroup">
          <div>
            <button
              type="button"
              className="krds-btn tertiary xlarge"
              onClick={() => navigate('/service/pbanc')}
            >
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
                관심
            </button>
            <button type="button" className="krds-btn tertiary xlarge">
              <i className="svg-icon ico-copy"></i>
                링크복사
            </button>
            <button type="button" className="krds-btn tertiary xlarge">
                출처바로가기
              <i className="svg-icon ico-angle right"></i>
            </button>
          </div>
        </div>

        <div className="assess-question-wrap">
          <div className="assess-qu">이 페이지에 만족하시나요?</div>
          <div className="assess-an">
            <div className="krds-form-chip large">
              <input type="radio" className="radio" name="rdo_chip_size2" id="rdo_chip_lg2-1" checked=""/>
              <label className="krds-form-chip-outline yes" htmlFor="rdo_chip_lg2-1">
                  네
                <i className="svg-icon ico-smile"></i>
              </label>
            </div>
            <div className="krds-form-chip large">
              <input type="radio" className="radio" name="rdo_chip_size2" id="rdo_chip_lg2-2"/>
              <label className="krds-form-chip-outline no" htmlFor="rdo_chip_lg2-2">
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

export default Pbanc;
