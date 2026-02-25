import React from "react";
import { useState } from 'react';
import Popup from '../components/ui/Popup';
import Logo from '../assets/common/logo2.svg'

const UI_USR_P_043 = () => {
  // 팝업 동작
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <>
      {/* 예시 버튼 */}
	    <button type="button" className="krds-btn" onClick={() => setIsOpen(true)} > 증명서 발급불가대상안내 팝업</button>
      <Popup 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        footer={
          <>
            <button type="button" className="krds-btn tertiary medium" onClick={() => setIsOpen(false)}>닫기</button>
            <button type="button" className="krds-btn primary medium">바로가기</button>
          </>
        }
      >
        <div className="txt-box outline">
          <div className="guide-text-box">
            <div className="guide-logo"><img src={Logo} alt="중소벤처 24 로고" /></div>
            <div className="guide-text">
              귀사 <span className="bold">업체명</span>은(는)<br />
              <strong>현재 중소기업통합플랫폼에서 <br /> 벤처기업확인서 발급 대상이 아닙니다.</strong>
              <p>해당 증명서 발급 기관인 벤처확인종합관리시스템에서 확인바랍니다.</p>
            </div>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_P_043;


