import React from "react";

const SearchListTop = () => {
  return (
    <div className="search-list-top">
            <ul className="sch-info" aria-live="polite">
              <li>
                 <button type="button" className="krds-btn medium text">
                    <i className="svg-icon ico-excel"></i> 다운로드
                  </button>
              </li>
            </ul>
            <ul className="sch-sort">
          		<li>
							<strong className="sort-label"><label for="sort">정렬기준</label></strong>
						    <div className="w-sort-btn">
                  <button type="button" onclick="fnSearch('0')" className=" active">등록일순</button>
                  <button type="button" onclick="fnSearch('1')">마감일순</button>
						    </div>
						    <div className="m-sort-btn">
							    <select className="krds-form-select-sort" id="sort">
									<option value="0" selected="selected">등록일순</option>
									<option value="1">마감일순</option>
							    </select>
						    </div>
				    	</li>
					  </ul>
          </div>
)
};

export default SearchListTop;
