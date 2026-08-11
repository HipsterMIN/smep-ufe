import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useApiKeyApply } from '@pages/data-open/useApiKeyApply.js';
import ApiKeyForm from './ApiKeyForm';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { useEffect } from 'react';
import { onePassGetAuthCode } from '@utils/keycloakGetAuthCode.js';

const InnoBizCertificateApi = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const navigate = useNavigate();
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
    submitApply,
  } = useApiKeyApply();

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

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
      {/* contents 영역에 responsive 속성 추가 */}
      <div className="contents" data-type="responsive">
        <Breadcrumb items={breadcrumbItems}/>
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">API안내</p>
          <h2 className="h-tit">이노비즈확인서</h2>
        </div>

        {/* 1. API 기본 정보 */}
        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">이노비즈확인서 API</h3>
          <div className="def-list-wrap border">
            <dl className="def-list">
              <dt>기본 URL</dt>
              <dd className="word-break">https://portal.smes.go.kr/ione-gw</dd>
              <dt>단건 조회 URL</dt>
              <dd className="word-break">POST /api/cert/check</dd>
              <dt>다건 조회 URL</dt>
              <dd className="word-break">POST /api/cert/check-list</dd>
              <dt>설명</dt>
              <dd>이노비즈 확인서 API</dd>
              <dt>호출방식</dt>
              <dd>POST</dd>
              <dt>Content-Type</dt>
              <dd>application/json</dd>
              <dt>응답 형식</dt>
              <dd>JSON</dd>
            </dl>
          </div>
        </div>

        {/* 2. 인증 방식 안내 */}
        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">인증 방식</h3>
          <p className="on-p2 mb-16">
              모든 요청에는 인증키(token)를 포함해야 하며, 아래 우선순위 순서로 확인하여 먼저 확인된 값을 사용합니다.
          </p>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>인증 방식. 우선순위, 방식, 예시 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '12%' }}/>
                <col style={{ width: '24%' }}/>
                <col/>
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">우선순위</th>
                  <th scope="col" className="ac">방식</th>
                  <th scope="col" className="ac">예시</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ac" data-label="우선순위"><span>1</span></td>
                  <td data-label="방식"><span>token 헤더</span></td>
                  <td data-label="예시"><span>token: {'{인증키}'}</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="우선순위"><span>2</span></td>
                  <td data-label="방식"><span>token 쿼리 파라미터</span></td>
                  <td data-label="예시"><span>?token={'{인증키}'} (URL encoding 필요)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="on-p3 mt-8 on-colorgray">
              두 방식 중 하나만 포함하면 됩니다.
          </p>
        </div>

        {/* 3. 요청메시지 */}
        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">요청메시지</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>요청메시지. 파라미터명, 위치, 타입, 필수여부, 샘플데이터, 설명 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '14%' }}/>
                <col style={{ width: '10%' }}/>
                <col style={{ width: '10%' }}/>
                <col style={{ width: '10%' }}/>
                <col style={{ width: '16%' }}/>
                <col/>
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">파라미터명</th>
                  <th scope="col" className="ac">위치</th>
                  <th scope="col" className="ac">타입</th>
                  <th scope="col" className="ac">필수여부</th>
                  <th scope="col" className="ac">샘플데이터</th>
                  <th scope="col" className="ac">설명</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>token</span></td>
                  <td className="ac" data-label="위치"><span>Header</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>Y (택1)</span></td>
                  <td className="ac" data-label="샘플데이터"><span>인증키</span></td>
                  <td data-label="설명"><span>권장 인증 방식</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>token</span></td>
                  <td className="ac" data-label="위치"><span>Query String</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>Y (택1)</span></td>
                  <td className="ac" data-label="샘플데이터"><span>인증키</span></td>
                  <td data-label="설명"><span>헤더 방식 미사용 시 사용, URL encoding 필요</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>brno</span></td>
                  <td className="ac" data-label="위치"><span>Body</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>Y</span></td>
                  <td className="ac" data-label="샘플데이터"><span>사업자등록번호</span></td>
                  <td data-label="설명"><span>10자리 사업자등록번호</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>prdocCd</span></td>
                  <td className="ac" data-label="위치"><span>Body</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>Y</span></td>
                  <td className="ac" data-label="샘플데이터"><span>Y105</span></td>
                  <td data-label="설명"><span>증명서코드 (이노비즈확인서 고정값)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. 결과상태 코드 */}
        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">결과상태 코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>결과상태 코드. 코드, 메시지, 비고 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '14%' }}/>
                <col/>
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
                  { c: '0', m: '정상처리되었습니다.', n: '정상' },
                  { c: '2', m: '발급 가능한 증명서가 없습니다.', n: '정상' },
                  { c: '3', m: '연계기관 API 오류가 발생하였습니다.', n: '오류' },
                  { c: '5', m: '필수 파라미터 누락 또는 지원하지 않는 증명서 코드입니다.', n: '오류' },
                  { c: '10', m: '해당 API의 인증키가 아닙니다.', n: '오류' },
                  { c: '11', m: '존재하지 않는 인증키입니다.', n: '오류' },
                  { c: '12', m: '인증키가 필요합니다.', n: '오류' },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td className="ac" data-label="코드"><span>{row.c}</span></td>
                    <td data-label="메시지"><span>{row.m}</span></td>
                    <td className="ac" data-label="비고"><span>{row.n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. 단건 조회 예시 */}
        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">이노비즈확인서 단건 조회 [증명서코드:Y105]</h3>

          <div className="on-subtitle-box pre">
            <div className="subtitle-boxtit">요청메시지 (token 헤더 방식)</div>
            <div className="subtitle-boxcon">
              <pre className="code-pre">
                <code>
                  {`POST /api/cert/check
token: {인증키}
Content-Type: application/json

{
  "brno": "",
  "prdocCd": "Y105"
}`}
                </code>
              </pre>
            </div>
          </div>

          <div className="on-subtitle-box pre mt-16">
            <div className="subtitle-boxtit">응답메시지 (성공)</div>
            <div className="subtitle-boxcon">
              <pre className="code-pre">
                <code className="word-break">
                  {`{
  "bizno": "",
  "resultCd": "0",
  "resultMsg": "정상처리되었습니다.",
  "crtfCd": "Y105",
  "crtfNm": "이노비즈확인서",
  "url": "",
  "data": {
    "score": "A",
    "ceo_name": "",       // 대표자명
    "innobiz_num": "",    // 확인서 번호
    "co_name": "",        // 회사명
    "co_addr": "",        // 주소
    "inno_valday": "2017-11-21",     // 유효시작일
    "inno_valday_end": "2020-11-20"  // 유효종료일
  }
}`}
                </code>
              </pre>
            </div>
          </div>

          <div className="on-subtitle-box pre mt-16">
            <div className="subtitle-boxtit">응답메시지 (데이터 없음, resultCd: 2)</div>
            <div className="subtitle-boxcon">
              <pre className="code-pre">
                <code className="word-break">
                  {`{
  "bizno": "",
  "resultCd": "2",
  "resultMsg": "발급 가능한 증명서가 없습니다.",
  "crtfCd": "Y105",
  "crtfNm": "이노비즈확인서",
  "url": null,
  "data": null
}`}
                </code>
              </pre>
            </div>
          </div>

          <div className="on-subtitle-box pre mt-16">
            <div className="subtitle-boxtit">응답메시지 (인증키 누락, resultCd: 12)</div>
            <div className="subtitle-boxcon">
              <pre className="code-pre">
                <code className="word-break">
                  {`{
  "bizno": "",
  "resultCd": "12",
  "resultMsg": "인증키가 필요합니다.",
  "crtfCd": "Y105",
  "crtfNm": null,
  "url": null,
  "data": null
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* 6. 다건 조회 예시 */}
        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">이노비즈확인서 다건 조회 [증명서코드:Y105]</h3>
          <p className="on-p2 mb-16">
              동일 증명서코드(Y105)에 대해 복수의 사업자번호를 일괄 발급합니다. 부분 실패가 허용되며, 건별 resultCd로 성공/실패를 구분합니다.
          </p>

          <div className="on-subtitle-box pre">
            <div className="subtitle-boxtit">요청메시지 (token 헤더 방식)</div>
            <div className="subtitle-boxcon">
              <pre className="code-pre">
                <code>
                  {`POST /api/cert/check-list
token: {인증키}
Content-Type: application/json

{
  "prdocCd": "Y105",
  "items": [
    { "brno": "" },
    { "brno": "" }
  ]
}`}
                </code>
              </pre>
            </div>
          </div>

          <div className="on-subtitle-box pre mt-16">
            <div className="subtitle-boxtit">응답메시지</div>
            <div className="subtitle-boxcon">
              <pre className="code-pre">
                <code className="word-break">
                  {`[
  {
    "bizno": "",
    "resultCd": "0",
    "resultMsg": "정상처리되었습니다.",
    "crtfCd": "Y105",
    "crtfNm": "이노비즈확인서",
    "url": "",
    "data": {
      "score": "A",
      "ceo_name": "",
      "innobiz_num": "",
      "co_name": "",
      "co_addr": "",
      "inno_valday": "2023-05-10",
      "inno_valday_end": "2026-05-09"
    }
  },
  {
    "bizno": "",
    "resultCd": "2",
    "resultMsg": "발급 가능한 증명서가 없습니다.",
    "crtfCd": "Y105",
    "crtfNm": "이노비즈확인서",
    "url": null,
    "data": null
  }
]`}
                </code>
              </pre>
            </div>
          </div>
        </div>

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

export default InnoBizCertificateApi;