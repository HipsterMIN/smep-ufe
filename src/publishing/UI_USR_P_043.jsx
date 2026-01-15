import React from "react";
import { useState } from 'react';
import Popup from '../components/ui/Popup';

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
            <button type="button" className="krds-btn tertiary md" onClick={() => setIsOpen(false)}>닫기</button>
            <button type="button" className="krds-btn primary md">바로가기</button>
          </>
        }
      >
        <div className="on-guide-box">
          귀사 업체명은(는) <br />현재 중소기업통합플랫폼에서 벤처기업확인서 발급 대상이 아닙니다.
          해당 증명서 발급 기관인 벤처확인종합관리시스템에서 확인바랍니다.
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_P_043;


