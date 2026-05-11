import { useState } from 'react';

import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import Datepicker from '../components/ui/Datepicker';


const UI_USR_W_452 = () => {

  const navigationData = {
    depth1Title: '신청·발급',
    depth: [
      {
        depth2: 'AI 스마트 통합 검색',
      },
      {
        depth2: '중소벤처기업부 지원사업 소개',
      },
      {
        depth2: '사업공고',
      },
      {
        depth2: '정책금융',
      },
      {
        depth2: '증명서발급',
        active: true,
        depth3: [
          {
            label: '증명서 발급',
            link: '/',
            active: true,
          },
        ],
      },
    ],
  };

  const breadcrumbItems = [
    { label: '신청·발급', link: '#' },
    { label: '증명서 발급', link: '#' },
    { label: '증명서 발급', link: '#' },
  ];

  // 설립일 Datepicker start
  const [date, setDate] = useState(null);

  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">
            기업 기본정보
          </h2>
        </div>

        {/* form */}
        <div className="on-form-register">
          <div className="on-form-option">
            <p className="txt-caution">*표시는 필수 입력입니다.</p>
            {/*<button type="button" className="krds-btn small secondary">KoDATA정보 로드</button>*/}
          </div>
          <dl className="on-form-row large">
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="select_01">
                  기업규모<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select id="select_01" className="krds-form-select small">
                    <option value="" selected>중기업</option>
                  </select>
                </div>
              </dd>
              <dt className="form-row-label">
                <span className="label">
                  설립일<span className="on-required"><span className="sr-only">필수입력</span></span>
                </span>
              </dt>
              <dd className="form-row-content">
                <Datepicker
                  id="datepicker"
                  selected={date} 
                  onChange={(date) => setDate(date)} 
                  className="ondatepicker-small"
                  title="설립일 선택"
                />
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label">
                <label htmlFor="select_02">
                  근로자수<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select id="select_02" className="krds-form-select small">
                    <option value="" selected>1~5명미만</option>
                  </select>
                </div>
              </dd>
              <dt className="form-row-label">
                <label htmlFor="select_03">
                  매출액<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select id="select_03" className="krds-form-select small">
                    <option value="" selected>5억미만</option>
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item ">
              <dt className="form-row-label">
                <label htmlFor="input_01">주요사업분야<span className="on-required"><span className="sr-only">필수입력</span></span></label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <input type="text" id="input_01" className="krds-input small" placeholder="내용을 입력해주세요." ></input>
                </div>
              </dd>
              <dt className="form-row-label">
                <label htmlFor="select_04">
                  산업구분<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper w-220">
                  <select id="select_04" className="krds-form-select small">
                    <option value="" selected>선택</option>
                  </select>
                </div>
              </dd>
            </div>
            <div className="form-row-item ">
              <dt className="form-row-label">
                <label htmlFor="select_05">
                  소재지<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="select-group">
                  <div className="form-wrapper w-184">
                    <select id="select_05" className="krds-form-select small">
                      <option value="" selected>세종특별자치시</option>
                    </select>
                  </div>
                  <div className="form-wrapper w-184">
                    <select id="" className="krds-form-select small" title="상세 소재지 선택">
                      <option value="" >세종특별자치시</option>
                    </select>
                  </div>
                </div>
              </dd>
            </div>
            <div className="form-row-item">
              <dt className="form-row-label flex-start">
                <label htmlFor="input_02">
                  간단설명<span className="on-required"><span className="sr-only">필수입력</span></span>
                </label>
              </dt>
              <dd className="form-row-content">
                <div className="form-wrapper">
                  <input type="text" id="input_02" className="krds-input small" placeholder="내용을 입력해주세요." ></input>
                </div>
                <div className="form-wrapper">
                  <div className="textarea-wrap mt-16">
                    <textarea 
                      className="krds-input medium"
                      id="" 
                      title="간단 설명 입력"
                      placeholder="문의내용을 입력해주세요."
                      required
                      rows={8}
                    />
                    <p className="textarea-count">
                      <span className="count-now">0</span><span className="count-total">/100</span>
                    </p>
                  </div>
                </div>
              </dd>
            </div>
          </dl>
        </div>

        {/* bottom btn */}
        <div className="onboard-btm-btngroup bt-0">
          <div> 
            <button type="button" className="krds-btn tertiary xlarge">
              취소
            </button>
          </div>
          <div> 
            <button type="button" className="krds-btn primary xlarge">
              저장
            </button>
          </div>
        </div>
        
      </div> 
    </>
  );
};

export default UI_USR_W_452;
