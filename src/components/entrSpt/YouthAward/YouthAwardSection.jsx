import React, { useState, useEffect } from 'react';

const YEARS = Array.from({ length: 14 }, (_, i) => 2025 - i); // 2025 ~ 2012

const YouthAwardSection = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [DataComponent, setDataComponent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDataComponent(null);

    import(`./data/YouthAward${selectedYear}.jsx`)
      .then((module) => {
        if (!cancelled) {
          setDataComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataComponent(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

  return (
    <>
      {/* 포상 개요 */}
      <div className="txt-box outline mt-22">
        <div className="def-list-wrap no-border">
          <dl className="def-list">
            <dt>포상목적</dt>
            <dd>국가 경제발전과 기술 창업 및 청년창업 활성화에 기여한 청년기업인의 성과와 노고를 격려</dd>
            <dt>신청자격</dt>
            <dd>
              <ul className="krds-info-list decimal small" role="list">
                <li role="listitem">창업에 성공한 만 39세 이하 기업대표</li>
                <li role="listitem">젊은 패기와 열정을 바탕으로 창업에 성공한 모법적인 기업인</li>
                <li role="listitem">사업의 실패를 극복하고 다시 도전하여 재기에 성공한 기업인</li>
                <li role="listitem">청년일자리 창출에 크게 기여한 기업인</li>
              </ul>
            </dd>
            <dt>포상내용</dt>
            <dd>정부 포상(대통령표창, 국무총리표창, 장관표창 등) 및 민간포상</dd>
          </dl>
        </div>
      </div>

      {/* 연도 선택 드롭다운 */}
      <div className="search-top-box no-details mt-22">
        <div className="form-row-box row-center">
          <div className="select-box">
            <label className="label" htmlFor="youth_award_year">수상년도</label>
            <select
              id="youth_award_year"
              className="krds-form-select medium"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {YEARS.map((year) => (
                <option key={year} value={year}>{year}년도</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 수상자 테이블 */}
      <div className="krds-table-wrap mt-40">
        {loading ? (
          <table className="tbl col data">
            <tbody>
              <tr>
                <td className="ac" colSpan={4}>
                  <span>로딩 중입니다.</span>
                </td>
              </tr>
            </tbody>
          </table>
        ) : DataComponent ? (
          <table className="tbl col data">
            <caption>
                            청년기업인상 {selectedYear}년도 수상자 목록 표. 훈격, 성명, 소속, 주요공적 정보가 제공됨.
            </caption>
            <DataComponent />
          </table>
        ) : (
          <table className="tbl col data">
            <tbody>
              <tr>
                <td className="ac" colSpan={4}>
                  <span>조회된 데이터가 없습니다.</span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default YouthAwardSection;