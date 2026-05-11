import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { useApiKeyApply } from '@pages/data-open/useApiKeyApply';
import ApiKeyForm from "@pages/data-open/ApiKeyForm.jsx";
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useAuthStore } from '@store/useAuthStore.jsx';
import React, { useEffect } from "react";

const MainBizCertificateApi = () => {
  const navigate = useNavigate();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const userInfo = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);
  const isLoggedIn = Boolean(authToken);

  const mbrNo = userInfo?.id;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    isOpen,
    submitting,
    errorMessage,
    memberInfo,
    openPopup,
    closePopup,
    submitApply
  } = useApiKeyApply();

  // 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      const moveToLogin = window.confirm('로그인 후 인증키 신청이 가능합니다. 로그인 하시겠습니까?');
      if (moveToLogin) {
        navigate('/service/login');
      }
      return;
    }
    openPopup(mbrNo);
  };

  return (
      <>
        <SideNavigation
            pageTitle={depth1Menu?.menuNm || ''}
            menuItems={sidebarData}
        />
        {/* 1. contents 영역에 data-type="responsive" 추가 */}
        <div className="contents" data-type="responsive">
          <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap" data-type="responsive">
            <p className="on-p1 on-colorblue">API안내</p>
            <h2 className="h-tit">메인비즈확인서</h2>
          </div>

          <div className="conts-wrap mt-40">
            <h3 className="sec-tit">메인비즈확인서 API</h3>
            <div className="def-list-wrap border">
              <dl className="def-list">
                <dt>URL</dt>
                <dd className="word-break">https://www.smes.go.kr/api/certificates/y104</dd>
                <dt>설명</dt>
                <dd>메인비즈확인서 API</dd>
                <dt>호출방식</dt>
                <dd>GET</dd>
                <dt>데이터형식</dt>
                <dd>JSON</dd>
              </dl>
            </div>
          </div>

          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">요청메시지</h3>
            <div className="krds-table-wrap">
              {/* 2. t-block 클래스 추가 */}
              <table className="tbl col data word-break t-block">
                <caption>요청메시지. 파라미터명, 타입, 필수여부, 샘플데이터, 설명 정보가 제공됨.</caption>
                <colgroup>
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '16%' }}/>
                  <col style={{ width: '16%' }}/>
                  <col style={{ width: '16%' }}/>
                  <col  />
                </colgroup>
                <thead>
                <tr>
                  <th scope="col" className="ac">파라미터명</th>
                  <th scope="col" className="ac">타입</th>
                  <th scope="col" className="ac">필수여부</th>
                  <th scope="col" className="ac">샘플데이터</th>
                  <th scope="col" className="ac">설명</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  {/* 3. data-label 속성 추가 */}
                  <td className="ac" data-label="파라미터명"><span>token</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>Y</span></td>
                  <td className="ac" data-label="샘플데이터"><span>인증키</span></td>
                  <td data-label="설명"><span>GET 방식으로 호출시 url encoding 필요</span></td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">결과상태 코드</h3>
            <div className="krds-table-wrap">
              {/* t-block 클래스 추가 */}
              <table className="tbl col data word-break t-block">
                <caption>결과상태 코드. 코드, 메시지, 비고 정보가 제공됨.</caption>
                <colgroup>
                  <col style={{ width: '14%' }} />
                  <col />
                  <col style={{ width: '20%' }}/>
                </colgroup>
                <thead>
                <tr>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">메시지</th>
                  <th scope="col" className="ac">비고</th>
                </tr>
                </thead>
                <tbody>
                {[
                  {c:'0', m:'정상적으로 조회 되었습니다.', b:'정상'},
                  {c:'2', m:'데이터가 없습니다.', b:'정상'},
                  {c:'3', m:'확인서 발급기관과 연계 실패', b:'오류'},
                  {c:'9', m:'인증키 오류', b:'오류'},
                  {c:'99', m:'기타 오류 발생', b:'오류'},
                  {c:'429', m:'사용량이 많습니다. 잠시 후 이용해 주세요', b:'오류'}
                ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="ac" data-label="코드"><span>{row.c}</span></td>
                      <td data-label="메시지"><span>{row.m}</span></td>
                      <td className="ac" data-label="비고"><span>{row.b}</span></td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="conts-wrap mt-40">
            <h3 className="sec-tit">메인비즈 확인서 [증명서코드:y104]</h3>
            <div className="on-subtitle-box pre">
              <div className="subtitle-boxtit">요청메시지</div>
              <div className="subtitle-boxcon ">
              <pre className="code-pre">
                <code className="word-break">
{`{
  "bizno" : "", // 사업자번호
  "token" : "" // 인증키(header token 사용 권장)
}`}
                </code>
              </pre>
              </div>
            </div>

            <div className="on-subtitle-box pre mt-16">
              <div className="subtitle-boxtit">응답메시지</div>
              <div className="subtitle-boxcon ">
              <pre className="code-pre">
                <code className="word-break">
{`{ 
 "bizno": "",
 "resultCd": "0",
 "data" : [
   {
    "bizno": "",
    "resultCd": "0",
    "data": {
        "BIZNO": "", //사업자번호
        "VLD_SDT": "", //증명서유효시작일자
        "REPER_NM": "", //대표자명
        "VLD_EDT": "", //증명서유효종료일자
        "ADRES2": null, //상세주소
        "ADRES1": "", //기본주소
        "NO_POST": "", //우편번호
        "PRINT_DATE": "", //증명서발급일자
        "ISS_NO": "", //증명서발급번호
        "CMP_NM": "" //기업명
    },
    "crtfNm": "메인비즈확인서",
    "crtfCd": "Y104",
    "url": "", // 증명서 리포트 URL
    "resultMsg": "정상적으로 조회되었습니다."
   }
]}`}
                </code>
              </pre>
              </div>
            </div>
          </div>

          {/* 4. mo-full 클래스로 모바일 버튼 최적화 */}
          <div className="onboard-btm-btngroup bt-0" data-type="responsive">
            <div>
              <button type="button" className="krds-btn tertiary xlarge mo-full" onClick={() => navigate('..')}>
                목록
              </button>
            </div>
            <div>
              <button type="button" className="krds-btn primary xlarge mo-full"
                      onClick={() => handleApplyClick(mbrNo)}>
                신청하기
                <i className="svg-icon ico-angle right"></i>
              </button>
            </div>
          </div>
        </div>
        <ApiKeyForm
            isOpen={isOpen}
            onClose={closePopup}
            submitting={submitting}
            errorMessage={errorMessage}
            memberInfo={memberInfo}
            mbrNo={mbrNo}
            onSubmit={(formData) => submitApply(mbrNo, formData)}
        />
      </>
  );
};

export default MainBizCertificateApi;