import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { useApiKeyApply } from '@pages/data-open/useApiKeyApply';
import ApiKeyForm from "@pages/data-open/ApiKeyForm.jsx";

const MainBizCertificateApi = () => {

  const navigationData = {
    depth1Title: '신청·발급',
    depth: [
      {
        depth2: 'AI 스마트 통합 검색',
      },
      {
        depth2: '지원사업 소개',
      },
      {
        depth2: '사업공고',
      },
      {
        depth2: '정책금융',
      },
      {
        depth2: '증명서발급',
        active: true,
        depth3: [
          {
            label: '증명서 발급',
            link: '/',
            active: true,
          },
        ],
      },
    ],
  };

  const breadcrumbItems = [
    { label: '신청·발급', link: '#' },
    { label: '증명서 발급', link: '#' },
    { label: '증명서 발급', link: '#' },
  ];

  const mbrNo = "2025120500381316";
  const {
    isOpen,
    submitting,
    errorMessage,
    memberInfo,
    openPopup,
    closePopup,
    submitApply
  } = useApiKeyApply();
  const navigate = useNavigate();
  return (
    <>
      <SideNavigation
        pageTitle={navigationData.depth1Title}
        depth={navigationData.depth}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">API안내</p>
          <h2 className="h-tit">메인비즈확인서 API</h2>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">메인비즈확인서 API</h3>
          <div className="def-list-wrap border">
            <dl className="def-list">
              <dt>URL</dt>
              <dd>https://www.smes.go.kr/api/certificates/증명서코드</dd>
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
          {/* table [S] */}
          <div className="krds-table-wrap">
            <table className="tbl col data word-break">
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
                  <td className="ac"><span>token</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>인증키</span></td>
                  <td className="ac"><span>GET 방식으로 호출시 url encoding 필요</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>token</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>인증키</span></td>
                  <td className="ac"><span>GET 방식으로 호출시 url encoding 필요</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* table [E] */}
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">결과상태 코드</h3>
          {/* table [S] */}
          <div className="krds-table-wrap">
            <table className="tbl col data word-break">
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
              <tr>
                <td className="ac"><span>0</span></td>
                <td><span>정상적으로 조회 되었습니다.</span></td>
                <td className="ac"><span>정상</span></td>
              </tr>
              <tr>
                <td className="ac"><span>2</span></td>
                <td><span>데이터가 없습니다.</span></td>
                <td className="ac"><span>정상</span></td>
              </tr>
              <tr>
                <td className="ac"><span>3</span></td>
                <td><span>확인서 발급기관과 연계 실패</span></td>
                <td className="ac"><span>오류</span></td>
              </tr>
              <tr>
                <td className="ac"><span>5</span></td>
                <td><span>기타 메세지</span></td>
                <td className="ac"><span>오류</span></td>
              </tr>
              <tr>
                <td className="ac"><span>9</span></td>
                <td><span>인증키 오류</span></td>
                <td className="ac"><span>오류</span></td>
              </tr>
              <tr>
                <td className="ac"><span>10</span></td>
                <td><span>인증키 오류. 해당 API의 인증키가 아닙니다.</span></td>
                <td className="ac"><span>오류</span></td>
              </tr>
              <tr>
                <td className="ac"><span>11</span></td>
                <td><span>인증키 오류. 존재하지 않는 인증키입니다.</span></td>
                <td className="ac"><span>오류</span></td>
              </tr>
              <tr>
                <td className="ac"><span>12</span></td>
                <td><span>인증키가 필요합니다.</span></td>
                <td className="ac"><span>오류</span></td>
              </tr>
              <tr>
                <td className="ac"><span>99</span></td>
                <td><span>기타 오류 발생</span></td>
                <td className="ac"><span>오류</span></td>
              </tr>
              <tr>
                <td className="ac"><span>429</span></td>
                <td><span>사용량이 많습니다. 잠시 후 이용해 주세요</span></td>
                <td className="ac"><span>오류</span></td>
              </tr>
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
                <code>
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
                <code>
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
]`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* bottom btn */}
        <div className="onboard-btm-btngroup bt-0 ">
          <div> 
            <button type="button" className="krds-btn tertiary xlarge" onClick={() => navigate('..')}>
              목록
            </button>
          </div>
          <div> 
            <button type="button" className="krds-btn primary xlarge"
                    onClick={() => openPopup(mbrNo)}>
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
