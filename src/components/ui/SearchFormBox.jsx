import React, { useRef } from "react";

const SearchFormBox = () => {
  const schFormWrapRef = useRef(null);

  const handleToggleFilter = () => {
    schFormWrapRef.current.classList.toggle('on');
  }

  return (
    <div className="search-top-box">
      <div className="sch-form-wrap" ref={schFormWrapRef}>
        <select className="krds-form-select">
          <option value="">전체</option>
          <option value="">항목</option>
          <option value="">항목</option>
        </select>
        <div className="sch-input">
          <input type="text" className="krds-input" placeholder="공고명·사업명·기관명으로 검색하세요" title="검색어 입력" />
          <button type="button" className="krds-btn medium icon ico-search" >
            <span className="sr-only">검색</span>
            <i className="svg-icon ico-sch"></i>
          </button>
        </div>
        <button type="button" className="krds-btn medium text" onClick={handleToggleFilter}><i className="svg-icon ico-sch-plus"></i>
          상세검색
          <span className="onfilter-open sr-only">열기</span>
          <span className="onfilter-close sr-only">닫기</span>
        </button>
      </div>
      <div className="sch-filter-box">
        <div className="filter-form">
          <div>
            <label className="label" for="appl-sch-sel1">분야</label>
            <select id="appl-sch-sel1" className="krds-form-select medium">
              <option value="">전체</option>
              <option value="">항목</option>
              <option value="">항목</option>
            </select>
          </div>
          <div>
            <label className="label" for="appl-sch-sel2">지역</label>
            <select id="appl-sch-sel2" className="krds-form-select medium">
              <option value="">전체</option>
              <option value="">항목</option>
              <option value="">항목</option>
            </select>
          </div>
          <div>
            <label className="label" for="appl-sch-sel3">기관별</label>
            <select id="appl-sch-sel3" className="krds-form-select medium">
              <option value="">전체</option>
              <option value="">항목</option>
              <option value="">항목</option>
            </select>
          </div>
        </div>
        <dl className="filter-chip">
          <dt>선택된 필터 <span className="num">4</span></dt>
          <dd>
            <button type="button" className="krds-btn xlarge icon border">
              <span className="sr-only">새로고침</span>
              <i className="svg-icon ico-refresh"></i>
            </button>
            <div className="chip-wrap krds-tag-wrap large">
              <span className="krds-btn-tag">
                중앙부처 복지사업
                <button type="button" className="btn-delete">
                  <span className="sr-only">삭제</span>
                </button>
              </span>
              <span className="krds-btn-tag">
                임신출산
                <button type="button" className="btn-delete">
                  <span className="sr-only">삭제</span>
                </button>
              </span>
              <span className="krds-btn-tag">
                저소득
                <button type="button" className="btn-delete">
                  <span className="sr-only">삭제</span>
                </button>
              </span>
              <span className="krds-btn-tag">
                맞춤형급여안내
                <button type="button" className="btn-delete">
                  <span className="sr-only">삭제</span>
                </button>
              </span>
            </div>
          </dd>
        </dl>
      </div>
    </div>
  )
};

export default SearchFormBox;
