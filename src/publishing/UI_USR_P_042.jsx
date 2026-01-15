import React from "react";

const UI_USR_P_042 = () => {


  return (
    <>
      <section id="modal_sample_01" class="krds-modal fade in shown" role="dialog" aria-labelledby="tit_modal_sample_01">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h2 id="tit_modal_sample_01" class="modal-title">
                중소기업(소상공인) 확인서발급
              </h2>
            </div>
            <div class="modal-conts">
              <div class="conts-area">
                <div class="txt-box outline">
                  <h4 class="outline-tit">알려드립니다.</h4>
                  <ul class="check-list">
                    <li>중소기업현황정보시스템을 통해 중소기업임을 확인 받은 기업에 한하여 출력할 수 있습니다.</li>
                    <li>신청 된 문서는 24시간 동안 출력할 수 있으며, 24시간 경과 후 삭제됩니다.</li>
                    <li>아래 기업정보를 확인하신 후 출력버튼을 클릭해주세요.</li>
                    <li>신규 신청버튼 클릭 시 중소기업임을 최초 확인받기 위하여 중소기업현황정보시스템으로 이동합니다.</li>
                    <li>발급된 전자증명서는 정부전자문서지갑에서 확인이 가능합니다.</li>
                  </ul>
                </div>

                {/* input  */}
                <div className="on-border-box">
                  <div class="form-group">
                    <div class="form-conts">
                      <div class="form-tit">
                        <label for="id_01" className="form-label">사업자등록번호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
                      </div>
                      <input type="text" id="id_01" class="krds-input small" placeholder="사업자등록번호를 입력해주세요" value="2288105280" disabled />
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="form-conts">
                      <div class="form-tit">
                        <label for="id_02" className="form-label">상호 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
                      </div>
                      <input type="text" id="id_02" class="krds-input small" placeholder="상호를 입력해주세요" value="주식회사 중소벤처" disabled />
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="form-conts">
                      <div class="form-tit">
                        <label for="id_03" className="form-label">대표자명 <span className="on-required"><span className="sr-only">필수입력</span></span></label>
                      </div>
                      <input type="text" id="id_03" class="krds-input small" placeholder="대표자명을 입력해주세요" value="홍길동" disabled />
                    </div>
                  </div>
                </div>

              </div>
            </div>
            {/* bottom btn */}
            <div class="modal-btn btn-wrap">
              <button type="button" class="krds-btn tertiary md close-modal">닫기</button>
            </div>
            {/* close btn */}
            <button type="button" class="btn-close close-modal"><span class="sr-only">닫기</span><i className="svg-icon ico-del"></i></button>
          </div>
        </div>
        <div class="modal-back in"></div>
      </section>
      
    </>
  );
};

export default UI_USR_P_042;
