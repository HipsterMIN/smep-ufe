import React from "react";
import { useState } from 'react';
import Popup from '../components/ui/Popup';
import Logo from '../assets/common/logo2.svg'

const UI_USR_P_052 = () => {
  // 팝업 동작
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <>
      {/* 예시 버튼 */}
	    <button type="button" className="krds-btn" onClick={() => setIsOpen(true)} >진위확인 실패 팝업</button>
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
          <p className="main-title"><i className="ico-confirm ico-fail"></i>발급 진위 확인에 실패하였습니다.</p>
          <p className="sub-desc">
            해당 문서확인번호로 조회되는 출력내역이 없습니다.
          </p>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_P_052;


