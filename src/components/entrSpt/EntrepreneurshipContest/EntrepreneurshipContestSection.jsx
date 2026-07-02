import React, { useState, useEffect } from 'react';

const ROUNDS = Array.from({ length: 12 }, (_, i) => 12 - i); // 12 ~ 1

const EntrepreneurshipContestSection = () => {
  const [selectedRound, setSelectedRound] = useState(12);
  const [DataComponent, setDataComponent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDataComponent(null);

    import(`./data/EntrepreneurshipContest${selectedRound}.jsx`)
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
  }, [selectedRound]);

  return (
    <>
      {/* 경진대회 개요 */}
      <div className="txt-box outline mt-22">
        <div className="def-list-wrap no-border">
          <dl className="def-list">
            <dt>추진목적</dt>
            <dd>
              <ul className="krds-info-list decimal small" role="list">
                <li role="listitem">교육현장에서 실현된 우수 기업가정신교육 사례를 발굴·공유하여, 현장 중심의 교육 모델 확산 기반을 마련</li>
                <li role="listitem">미래 교육환경 변화에 대응하는 기업가정신교육 프로그램과 실천 사례 및 우수 교육자 발굴</li>
                <li role="listitem">우수사례에 대한 포상을 통해 기업가정신 교육자의 전문성과 실천 의지를 제고하고 교육 프로그램 개발을 장려</li>
              </ul>
            </dd>
            <dt>훈격</dt>
            <dd>중소벤처기업부장관상 등</dd>
            <dt>대상</dt>
            <dd>초･중･고 교사, 대학교수, 민간 교육자 등 교육현장의 기업가정신 교육자 누구나</dd>
          </dl>
        </div>
      </div>

      {/* 회차 선택 드롭다운 */}
      <div className="search-top-box no-details mt-22">
        <div className="form-row-box row-center">
          <div className="select-box">
            <label className="label" htmlFor="contest_round">수상회차</label>
            <select
              id="contest_round"
              className="krds-form-select medium"
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number(e.target.value))}
            >
              {ROUNDS.map((round) => (
                <option key={round} value={round}>{round}회</option>
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
              기업가정신 교육 우수사례 경진대회 {selectedRound}회 수상자 목록 표. 성명, 소속, 직위, 주요공적 정보가 제공됨.
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

export default EntrepreneurshipContestSection;
