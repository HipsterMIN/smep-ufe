import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import ApiKeyForm from './ApiKeyForm';
import { useNavigate } from 'react-router-dom';
import { useApiKeyApply } from '@pages/data-open/useApiKeyApply';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { useEffect } from 'react';
import { onePassGetAuthCode } from '@utils/keycloakGetAuthCode.js';

const VentureCertificateApi = () => {
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

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const navigate = useNavigate();

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      const moveToLogin = window.confirm('로그인 후 인증키 신청이 가능합니다. 로그인 하시겠습니까?');
      if (moveToLogin) {
        // navigate('/service/login');
        onePassGetAuthCode();
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
        <div className="contents" data-type="responsive">
          <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap" data-type="responsive">
            <p className="on-p1 on-colorblue">API안내</p>
            <h2 className="h-tit">벤처기업확인서</h2>
          </div>

          {/* API 기본 정보 */}
          <div className="conts-wrap mt-40">
            <h3 className="sec-tit">벤처기업확인서 API</h3>
            <div className="def-list-wrap border">
              <dl className="def-list">
                <dt>URL</dt>
                <dd className="word-break">https://www.smes.go.kr/api/certificates/증명서코드</dd>
                <dt>설명</dt>
                <dd>벤처기업확인서 정보 제공 API</dd>
                <dt>호출방식</dt>
                <dd>GET</dd>
                <dt>데이터형식</dt>
                <dd>JSON</dd>
              </dl>
            </div>
          </div>

          {/* 요청 메시지 테이블 */}
          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">요청메시지</h3>
            <div className="krds-table-wrap">
              <table className="tbl col data word-break t-block">
                <caption>요청메시지: 파라미터명, 타입, 필수여부, 샘플데이터, 설명 정보</caption>
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
                  <td className="ac" data-label="파라미터명"><span>token</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>Y</span></td>
                  <td className="ac" data-label="샘플데이터"><span>인증키</span></td>
                  <td data-label="설명"><span>GET 방식으로 호출 시 URL Encoding 필요 (Header 사용 권장)</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>bizno</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>Y</span></td>
                  <td className="ac" data-label="샘플데이터"><span>0000000000</span></td>
                  <td data-label="설명"><span>조회할 사업자등록번호 (숫자만 입력)</span></td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 결과상태 코드 테이블 */}
          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">결과상태 코드</h3>
            <div className="krds-table-wrap">
              <table className="tbl col data word-break t-block">
                <caption>결과상태 코드: 코드, 메시지, 비고 정보</caption>
                <colgroup>
                  <col style={{ width: '15%' }} />
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
                  { c: '0', m: '정상적으로 조회 되었습니다.', r: '정상' },
                  { c: '2', m: '데이터가 없습니다.', r: '정상' },
                  { c: '3', m: '확인서 발급기관과 연계 실패', r: '오류' },
                  { c: '5', m: '기타 메세지', r: '오류' },
                  { c: '9', m: '인증키 오류', r: '오류' },
                  { c: '10', m: '인증키 오류. 해당 API의 인증키가 아닙니다.', r: '오류' },
                  { c: '11', m: '인증키 오류. 존재하지 않는 인증키입니다.', r: '오류' },
                  { c: '12', m: '인증키가 필요합니다.', r: '오류' },
                  { c: '99', m: '기타 오류 발생', r: '오류' },
                  { c: '429', m: '사용량이 많습니다. 잠시 후 이용해 주세요', r: '오류' },
                ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="ac" data-label="코드"><span>{row.c}</span></td>
                      <td data-label="메시지"><span>{row.m}</span></td>
                      <td className="ac" data-label="비고"><span>{row.r}</span></td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 응답 예시 영역 */}
          <div className="conts-wrap mt-40">
            <h3 className="sec-tit">벤처기업 확인서 [증명서코드: y106]</h3>
            <div className="on-subtitle-box pre">
              <div className="subtitle-boxtit">요청메시지 예시</div>
              <div className="subtitle-boxcon">
              <pre className="code-pre">
                <code className="word-break">
                  {`{
  "bizno" : "1234567890",
  "token" : "YOUR_API_KEY"
}`}
                </code>
              </pre>
              </div>
            </div>

            <div className="on-subtitle-box pre mt-16">
              <div className="subtitle-boxtit">응답메시지 예시</div>
              <div className="subtitle-boxcon">
              <pre className="code-pre">
                <code className="word-break">
                  {`{
    "bizno": "1234567890",
    "resultCd": "0",
    "data": {
        "vnti_ymd": "20210603", 
        "vnia_sn": 123456, 
        "vnti_typ_nm": "벤처투자유형", 
        "rprsv_nm": "홍길동", 
        "hdofc_dtl_addr": "서울특별시 ...", 
        "vntr_end_vld_ymd": "2024년 06월 02일", 
        "vntr_bgng_vld_ymd": "2021년 06월 03일", 
        "cnfmt_issu_no": "20210401010001", 
        "bizrno": "1234567890", 
        "cmp_nm": "(주)테스트기업" 
    },
    "crtfNm": "벤처기업확인서",
    "crtfCd": "Y106",
    "resultMsg": "정상적으로 조회되었습니다.",
    "url": "https://www.smes.go.kr/ClipReport4/..." 
}
`}
                </code>
              </pre>
              </div>
            </div>
          </div>

          {/* 하단 버튼 그룹 */}
          <div className="onboard-btm-btngroup bt-0" data-type="responsive">
            <div>
              <button type="button" className="krds-btn tertiary xlarge mo-full" onClick={() => navigate('..')}>
                목록
              </button>
            </div>
            <div>
              <button type="button" className="krds-btn primary xlarge mo-full"
                      onClick={handleApplyClick}>
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

export default VentureCertificateApi;