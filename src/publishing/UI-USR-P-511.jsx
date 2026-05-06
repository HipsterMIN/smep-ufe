import React from "react";
import { useState } from 'react';
import Popup from '../components/ui/Popup';

const UI_USR_P_511 = () => {
  // 팝업 동작
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <>
      {/* 예시 버튼 */}
	    <button type="button" className="krds-btn" onClick={() => setIsOpen(true)} >증명서 발급 조회</button>
      <Popup 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="증명서 발급이력"
        footer={
          <>
            <button type="button" className="krds-btn tertiary medium" onClick={() => setIsOpen(false)}>닫기</button>
            <button type="button" className="krds-btn primary medium">출력</button>
          </>
        }
      >
        <div>
          
          <div className="conts-wrap">
            <h2 className="sec-tit">발급 대상 기업</h2>
            <div className="krds-table-wrap">
              <table className="tbl col data tbl-row"> {/* row타입 테이블 class명: tbl-row */}
                <caption>발급 대상 기업 표. 사업자등록번호, 기업명, 대표자명 정보가 제공됨.  </caption>
                <colgroup>
                  <col style={{ width: '26%' }} />
                  <col />
                </colgroup>
                <tbody>
                  <tr>
                    <th scope="row" className="ac">사업자등록번호</th>
                    <td>(주) 쓰리워터</td>
                  </tr>
                  <tr>
                    <th scope="row" className="ac">기업명</th>
                    <td>금속 탱크 및 저장 용기 제조업</td>
                  </tr>
                  <tr>
                    <th scope="row" className="ac">대표자명</th>
                    <td>김현아</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="conts-wrap">
            <h2 className="sec-tit">증명서 발급 정보</h2>
            <div className="krds-table-wrap">
              <table className="tbl col data tbl-row"> {/* row타입 테이블 class명: tbl-row */}
                <caption>증명서 발급 정보 표. 신청번호, 증명(확인)서명, 신청일시, 상태, 유효기간, 출력 여부 정보가 제공됨.  </caption>
                <colgroup>
                  <col style={{ width: '26%' }} />
                  <col />
                </colgroup>
                <tbody>
                  <tr>
                    <th scope="row" className="ac">신청번호</th>
                    <td>20251114324343</td>
                  </tr>
                  <tr>
                    <th scope="row" className="ac">증명(확인)서명</th>
                    <td>미래성과공유기업확인서</td>
                  </tr>
                  <tr>
                    <th scope="row" className="ac">신청일시</th>
                    <td>2025-11-14 09:11:04.0</td>
                  </tr>
                  <tr>
                    <th scope="row" className="ac">상태</th>
                    <td>발급 성공</td>
                  </tr>
                  <tr>
                    <th scope="row" className="ac">유효기간</th>
                    <td>20261113</td>
                  </tr>
                  <tr>
                    <th scope="row" className="ac">출력여부</th>
                    <td>출력완료 (출력 가능 기간 경과)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="conts-wrap">
            <h2 className="sec-tit">발급 불가 사유</h2>
            <div className="form-conts">
              <div className="textarea-wrap">
                <textarea className="krds-input medium" placeholder="" id="textarea" title="발급 불가 사유 입력란"></textarea>
                <p className="textarea-count">
                  <span className="count-now">0</span><span className="count-total">/100</span>
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_P_511;


