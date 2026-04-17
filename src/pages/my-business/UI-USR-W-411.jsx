import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';

const UI_USR_W_411 = () => {

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">회원 탈퇴</h2>
        </div>

        <p className="guide-txt">
          <span className="guide-txt-check">
            <i className="svg-icon ico-checkbox"></i>
          </span>
          회원정보는 개인정보처리방침에 따라 안전하게 보호되며, 회원님의 명백한 동의 없이 공개 또는 제 3자에게 제공되지 않습니다.</p>

        <div className="conts-wrap mt-64">
          <div className="on-form-register">
            <h3 className="form-title">회원정보 변경</h3>
            <dl className="on-form-row large">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">이름</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">smes2025</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_01">기업명</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input type="text" id="input_01" className="krds-input small" value="에스엠이에스" disabled></input>
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_02">사업자등록번호</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input type="text" id="input_02" className="krds-input small" value="1002030000" disabled></input>
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_03">법인등록번호</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input type="text" id="input_03" className="krds-input small" disabled></input>
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_04">대표자 이름</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper w-220">
                    <input type="text" id="input_04" className="krds-input small" />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="select_01">대표 전화</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper row-small">
                    <select className="krds-form-select small w-120" id="select_01">
                      <option value="">서울 02</option>
                    </select>
                    <span>-</span>
                    <input type="text" className="krds-input small w-120" placeholder="0000" title="대표 전화 두번째 칸 입력" />
                    <span>-</span>
                    <input type="text" className="krds-input small w-120" placeholder="0000" title="대표 전화 세번째 칸 입력" />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="select_02">팩스 번호</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper row-small">
                    <select className="krds-form-select small w-120" id="select_02">
                      <option value="">선택</option>
                    </select>
                    <span>-</span>
                    <input type="text" className="krds-input small w-120" placeholder="0000" title="팩스 번호 두번째 칸 입력" />
                    <span>-</span>
                    <input type="text" className="krds-input small w-120" placeholder="0000" title="팩스 번호 세번째 칸 입력" />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_05">이메일</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper row-small">
                    <input type="text" id="input_05" className="krds-input small w-140" placeholder="0000" title="이메일 첫번째 칸 입력"/>
                    <span>@</span>
                    <input type="text" className="krds-input small w-140" placeholder="0000" title="이메일 두번째 칸 입력" />
                    <span>-</span>
                    <select className="krds-form-select small w-140" title="이메일 선택">
                      <option value="">직접입력</option>
                    </select>
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label flex-start">
                  <label htmlFor="input_06">회사주소</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper row-small">
                    <input type="text" id="input_06" className="krds-input small w-150" placeholder="-" />
                    <button type="button" className="krds-btn secondary small">우편번호 검색</button>
                  </div>
                  <div className="form-wrapper">
                    <input type="text" className="krds-input small w-460" placeholder="-" />
                  </div>
                  <div className="form-wrapper">
                    <input type="text" className="krds-input small w-460" placeholder="상세 주소 입력" />
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <label htmlFor="input_07">홈페이지 주소</label>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <input type="text" id="input_07" className="krds-input small w-220" placeholder='-' />
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 기업관리자 정보 */}
        <div className="conts-wrap mt-64">
          <div className="on-form-register">
            <h3 className="form-title">기업관리자 정보</h3>
            <dl className="on-form-row large">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">아이디</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">smes2025</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">휴대전화번호</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">--</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">유선전화</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">--</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">이메일</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">--</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">부서명</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">경영지원팀</span>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="form-tit">직위</span>
                </dt>
                <dd className="form-row-content">
                  <span className="text-value">대표</span>
                </dd>
              </div>
            </dl>
          </div>
          <ul className="info-list-point">
            <li><i className="svg-icon ico-checkbox"></i>기업관리자 정보변경은 개인회원 마이페이지에서 변경이 가능합니다.</li>
          </ul>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit3">관심 분야 설정</h3>
          <div className="flex-between center">
            <p className="cont-desc">관심을 갖고 있는 분야를 선택하시면, 빠르고 정확한 지원사업 검색이 가능합니다.</p>
            <button type="button" className="krds-btn secondary small">인증키 신청</button>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit3">알림 수신 동의</h3>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">중소벤처24의 알림을 받으시겠습니까?</li>
            <li role="listitem">중소벤처24의 알림은 이메일과 SMS 또는 알림톡으로 발송되며, 정책자금 상담, Q&A, 민원 등의 처리현황정보가 발송됩니다.</li>
          </ul>
          <div className="on-form-register mt-16">
            <dl className="on-form-row large">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="label-title" id="receive-label">수신방법</span>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <div
                      className="krds-check-area"
                      role="radiogroup"
                      aria-labelledby="receive-label"
                    >
                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="receive"
                          id="message"
                        />
                        <label htmlFor="message">문자</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="receive"
                          id="kakaotalk"
                        />
                        <label htmlFor="kakaotalk">알림톡(카카오톡)</label>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="label-title" id="emailreceive-label">이메일 수신</span>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <div
                      className="krds-check-area"
                      role="radiogroup"
                      aria-labelledby="emailreceive-label"
                    >
                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="receive"
                          id="email_on"
                        />
                        <label htmlFor="email_on">예</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="receive"
                          id="email_off"
                        />
                        <label htmlFor="email_off">아니오</label>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit3">맞춤 알림 서비스 선택</h3>
          <ul className="krds-info-list decimal" role="list">
            <li role="listitem">중소벤처24의 정책금융 상품, 사업공고, 증명서 발급 현황 등의 맞춤형 알림 서비스를 받아 보실 수 있습니다. 알림 수신 방법은 알림 수신 동의에서 선택하신 방법으로 발송됩니다.</li>
          </ul>
          <div className="on-form-register mt-16">
            <dl className="on-form-row large">
              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="label-title" id="business-label">사업공고</span>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <div
                      className="krds-check-area"
                      role="radiogroup"
                      aria-labelledby="business-label"
                    >
                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="business"
                          id="business_on"
                        />
                        <label htmlFor="business_on">받기</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="business"
                          id="business_off"
                        />
                        <label htmlFor="business_off">끄기</label>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>

              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="label-title" id="policy-label">정책금융 상품</span>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <div
                      className="krds-check-area"
                      role="radiogroup"
                      aria-labelledby="policy-label"
                    >
                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="policy"
                          id="policy_on"
                        />
                        <label htmlFor="policy_on">받기</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="policy"
                          id="policy_off"
                        />
                        <label htmlFor="policy_off">끄기</label>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>

              <div className="form-row-item">
                <dt className="form-row-label">
                  <span className="label-title" id="certificate-label">증명서 발급</span>
                </dt>
                <dd className="form-row-content">
                  <div className="form-wrapper">
                    <div
                      className="krds-check-area"
                      role="radiogroup"
                      aria-labelledby="certificate-label"
                    >
                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="certificate"
                          id="certificate_on"
                        />
                        <label htmlFor="certificate_on">받기</label>
                      </div>

                      <div className="krds-form-check medium">
                        <input
                          type="radio"
                          name="certificate"
                          id="certificate_off"
                        />
                        <label htmlFor="certificate_off">끄기</label>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
          <ul className="info-list-point">
            <li><i className="svg-icon ico-checkbox"></i>정보변경은 법인 공동인증서 인증 후 변경이 가능합니다.</li>
          </ul>
        </div>

        {/* bottom btn */}
        <div className="onboard-btm-btngroup bt-0">
          <div> 
            <button type="button" className="krds-btn tertiary xlarge">
              취소
            </button>
          </div>
          <div> 
            <button type="button" className="krds-btn primary xlarge">
              저장
            </button>
          </div>
        </div>
        
      </div> 
    </>
  );
};

export default UI_USR_W_411;
