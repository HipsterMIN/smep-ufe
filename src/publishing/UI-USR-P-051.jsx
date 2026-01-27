import React from "react";
import { useState } from 'react';
import Popup from '../components/ui/Popup';
import Logo from '../assets/common/logo2.svg'

const UI_USR_P_051 = () => {
  // 팝업 동작
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <>
      {/* 예시 버튼 */}
	    <button type="button" className="krds-btn" onClick={() => setIsOpen(true)} >진위확인 완료 팝업</button>
      <Popup 
        size="small"
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        noCloseBtn //상단 닫기 버튼 없는 case
        footer={
          <>
            <button type="button" className="krds-btn tertiary medium" onClick={() => setIsOpen(false)}>닫기</button>
          </>
        }
      >
        <div className="confirm-guide">
          <span className="sub-title">진위확인</span>
          <p className="main-title"><i className="ico-confirm ico-success"></i> 발급 진위 확인이 완료되었습니다.</p>
          <p className="sub-desc">
            조회하신 중소기업확인서는 2026-01-21 18:15:06에 <br /> 
            <span className="txt-point">
            중소기업현황정보시스템(<a className="on-linktxt2" href="http://sminfo.mss.go.kr" target="_blank" title="새 창 열림">sminfo.mss.go.kr</a>)</span>과 연계하여 <br />
            <span className="txt-point">중소벤처24(<a className="on-linktxt2" href="http://smes.go.kr" target="_blank" title="새 창 열림">www.smes.go.kr</a>)</span>에서 출력한 문서임을 확인합니다.
          </p>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_P_051;


