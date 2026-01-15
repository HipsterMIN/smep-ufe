import React from "react";
import { useState } from 'react';
import Popup from '../components/ui/Popup';


const UI_USR_R_040_P = () => {
	// 팝업 동작
	const [isOpen, setIsOpen] = useState(false); 
	
  return (
    <>
	  <button type="button" className="krds-btn" onClick={() => setIsOpen(true)} > 증명서 발급 안내 열기</button>
      
	  <Popup 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="중소벤처24 증명(확인)서 발급"
				noBottomBtn={true}
      >
       <div className="issuance-popup">
					중소벤처24에서의 증명(확인)서를 발급받으신 이력이 있으신 경우 <br />인증로그인 후 중소벤처24에서 발급이 가능합니다.

					<div className="step-box">
						<span className="krds-badge bg-light-primary number">증명서</span>
						<ul className="krds-info-list decimal" role="list">
							<li role="listitem">중소벤처24에서의 증명(확인)서를 <strong>발급메뉴를 통해 증명(확인)서 발급이 가능합니다.</strong></li>
						</ul>
						<div className="step-imgguide">
							<div className="step-imgguide-item">
								<div className="step-imgguide-img img-login"></div>
								<div className="step-imgguide-title">인증로그인</div>
							</div>
							<div className="step-imgguide-item">
								<div className="step-imgguide-img img-click"></div>
								<div className="step-imgguide-title">발급 버튼 클릭</div>
							</div>
							<div className="step-imgguide-item">
								<div className="step-imgguide-img img-certificate"></div>
								<div className="step-imgguide-title">증명(확인)서 발급</div>
							</div>
						</div>
					</div>

					<div className="step-box">
						<span className="krds-badge bg-light-primary number">전자증명</span>
						<ul className="krds-info-list decimal" role="list">
							<li role="listitem">전자증명태그가 붙은 증명(확인)서는 전자증명서 신청이 가능합니다.</li>
							<li role="listitem">발급된 전자증명서는 정부전자문서지갑에서 확인이 가능합니다.</li>
						</ul>
						<div className="step-imgguide type-divide">
							<div className="step-imgguide-item">
								<div className="step-imgguide-title">개인사업자회원</div>
								<div className="step-imgguide-img img-individual"></div>
								<p className="step-imgguide-desc">전자증명서를 발급한 <br /> 담당자의 개인 정부전자문서지갑에서 확인</p>
							</div>
							<div className="step-imgguide-item">
								<div className="step-imgguide-title">법인사업자회원</div>
								<div className="step-imgguide-img img-corporate"></div>
								<p className="step-imgguide-desc">법인사업자용 <br />
									정부전자문서지갑(<a className="on-linktxt2 primary" href="http://dpaper.kr" target="_blank" title="새 창 열림">dpaper.kr</a>)에서 확인
								</p>
							</div>
						</div>
					</div>

					<div className="step-box">
						<span className="krds-badge bg-light-primary number">발급안내</span>
						<ul className="krds-info-list decimal" role="list">
							<li role="listitem">발급안내로 확인되는 증명(확인)서는 발급/조회가 가능한 각 해당 시스템으로 연결됩니다.</li>
						</ul>
						<div className="step-imgguide">
							<div className="step-imgguide-item">
								<div className="step-imgguide-img img-issuance"></div>
								<p className="step-imgguide-desc">발급안내 버튼 클릭</p>
							</div>
							<div className="step-imgguide-item">
								<div className="step-imgguide-img img-site"></div>
								<p className="step-imgguide-desc">발급/조회 가능한 해당 사이트로 연결</p>
							</div>
						</div>
					</div>

					<div className="txt-box small outline">
						중소벤처24의 증명서 발급 대상이 아닌 기업은 해당 증명서 발급기관에서 확인 바랍니다.
					</div>

				</div>
      </Popup>
    </>
  );
};

export default UI_USR_R_040_P;
