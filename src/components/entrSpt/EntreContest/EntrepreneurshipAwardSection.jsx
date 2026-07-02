import React from 'react';
import { ENTREPRENEURSHIP_AWARD_DATA } from './EntrepreneurshipAwardData.js';

const EntrepreneurshipAwardSection = () => (
  <>
    <div className="txt-box outline mt-22">
      <div className="def-list-wrap no-border">
        <dl className="def-list">
          <dt>포상목적</dt>
          <dd>최근 경제 어려움 타개와 창업 촉진 및 일자리 창출 등을 위하여 도전과 열정,혁신과 창의의 근간을 이루는 기업가정신의 중요성 매우 강조되고 있음</dd>
          <dt>신청자격</dt>
          <dd>기업가정신 생태계 구축과 문화조성에 기여한 기업가정신 유공자를 선정하여 성과와 노고를 격려</dd>
          <dt>포상내용</dt>
          <dd>중소벤처기업부 장관 표창, 한국청년기업가정신재단 이사장 표창</dd>
          <dt>대상</dt>
          <dd>기업가정신 교육, 정책 개발, 연구 등 기업가정신 생태계 구축과 문화조성에 3년 이상 기여한 공적이 있는 단체 또는 개인</dd>
        </dl>
      </div>
    </div>

    <div className="krds-table-wrap mt-40">
      <table className="tbl col data">
        <caption>기업가 정신 유공자 수상자 목록 표. 수상년도, 훈격, 소속/지위, 성명 정보가 제공됨.</caption>
        <colgroup>
          <col style={{ width: '16%' }} />
          <col style={{ width: '36%' }} />
          <col style={{ width: '35%' }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="ac">수상년도</th>
            <th scope="col" className="ac">훈격</th>
            <th scope="col" className="ac">소속/지위</th>
            <th scope="col" className="ac">성명</th>
          </tr>
        </thead>
        <tbody>
          {ENTREPRENEURSHIP_AWARD_DATA.map((item, index) => (
            <tr key={index}>
              <td className="ac"><span>{item.year}</span></td>
              <td className="ac"><span>{item.honor}</span></td>
              <td className="ac"><span>{item.affiliation}</span></td>
              <td className="ac">
                <span>
                  {item.name.includes('\n')
                    ? item.name.split('\n').map((n, i, arr) => (
                      <React.Fragment key={i}>
                        {n}{i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))
                    : item.name}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

export default EntrepreneurshipAwardSection;