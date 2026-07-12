import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiKeyApply } from '@pages/data-open/useApiKeyApply';
import ApiKeyForm from './ApiKeyForm';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { onePassGetAuthCode } from '@utils/keycloakGetAuthCode.js';

const EventInfoApi = () => {
  const userInfo = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);
  const isLoggedIn = Boolean(authToken);
  const mbrNo = userInfo?.id;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const {
    isOpen,
    submitting,
    errorMessage,
    memberInfo,
    openPopup,
    closePopup,
    submitApply,
  } = useApiKeyApply();

  const [formData, setFormData] = useState({
    dataType: 'rss',
    searchCnt: '',
    hashtags: [],
  });
  const [sampleUrl, setSampleUrl] = useState('');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === 'select_01') setFormData(prev => ({ ...prev, dataType: value }));
    if (id === 'input_02') setFormData(prev => ({ ...prev, searchCnt: value }));
  };

  const handleHashtagChange = (e) => {
    const { checked, nextSibling } = e.target;
    const tagName = nextSibling.innerText;
    setFormData(prev => {
      if (checked) {
        return { ...prev, hashtags: [...prev.hashtags, tagName] };
      } else {
        return { ...prev, hashtags: prev.hashtags.filter(tag => tag !== tagName) };
      }
    });
  };

  const generateSample = () => {
    const { dataType, searchCnt, hashtags } = formData;
    let params = `&dataType=${dataType}`;
    if (searchCnt) params += `&searchCnt=${searchCnt}`;
    if (hashtags.length > 0) params += `&hashtags=${hashtags.join(',')}`;
    setSampleUrl(params);
  };

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const navigate = useNavigate();

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      const moveToLogin = window.confirm('로그인 후 인증키 신청이 가능합니다. 로그인 하시겠습니까?');
      if (moveToLogin) {
        //navigate('/service/login');
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
        <Breadcrumb items={breadcrumbItems}/>
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">API안내</p>
          <h2 className="h-tit">행사정보 API</h2>
        </div>

        {/*<div className="search-top-box no-details">*/}
        {/*  <div className="sch-filter-box">*/}
        {/*    <div className="filter-form">*/}
        {/*      <div>*/}
        {/*        <label className="label" htmlFor="select_01">데이터타입</label>*/}
        {/*        <select id="select_01" className="krds-form-select small" value={formData.dataType} onChange={handleInputChange}>*/}
        {/*          <option value="rss">XML(RSS)</option>*/}
        {/*          <option value="json">JSON</option>*/}
        {/*        </select>*/}
        {/*      </div>*/}
        {/*      <div>*/}
        {/*        <label className="label" htmlFor="input_02">조회건수</label>*/}
        {/*        <input type="text" id="input_02" className="krds-form-input small" value={formData.searchCnt} onChange={handleInputChange} />*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*    <dl className="filter-chip align-center">*/}
        {/*      <dt>해시태그</dt>*/}
        {/*      <dd>*/}
        {/*        <button type="button" className="krds-btn xlarge icon border" onClick={() => { setFormData({ dataType: 'rss', searchCnt: '', hashtags: [] }); setSampleUrl(''); }}>*/}
        {/*          <span className="sr-only">새로고침</span>*/}
        {/*          <i className="svg-icon ico-refresh"></i>*/}
        {/*        </button>*/}
        {/*        <div className="filter-check-box">*/}
        {/*          <div className="krds-check-area">*/}
        {/*            {['금융', '기술', '인력', '수출', '내수', '창업', '경영', '기타'].map((tag, idx) => (*/}
        {/*              <div className="krds-form-chip round" key={`field-${idx}`}>*/}
        {/*                <input type="checkbox" className="checkbox" id={`chk1_${idx + 1}`} onChange={handleHashtagChange} checked={formData.hashtags.includes(tag)} />*/}
        {/*                <label className="krds-form-chip-outline" htmlFor={`chk1_${idx + 1}`}>{tag}</label>*/}
        {/*              </div>*/}
        {/*            ))}*/}
        {/*          </div>*/}
        {/*          <div className="krds-check-area">*/}
        {/*            {['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map((tag, idx) => (*/}
        {/*              <div className="krds-form-chip round" key={`loc-${idx}`}>*/}
        {/*                <input type="checkbox" className="checkbox" id={`chk1_${idx + 9}`} onChange={handleHashtagChange} checked={formData.hashtags.includes(tag)} />*/}
        {/*                <label className="krds-form-chip-outline" htmlFor={`chk1_${idx + 9}`}>{tag}</label>*/}
        {/*              </div>*/}
        {/*            ))}*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*      </dd>*/}
        {/*    </dl>*/}
        {/*    <div className="form-box">*/}
        {/*      <label className="label sr-only" htmlFor="appl-sch-sel4">샘플 파라미터</label>*/}
        {/*      <div className="input-box">*/}
        {/*        <input type="text" className="krds-input medium" placeholder="&dataType=rss&hashtags=서울,부산,대구,인천,광주,대전,울산,세종,경기,강원,충북,충남,전북,전남,경북,경남,제주" value={sampleUrl} readOnly title="생성된 샘플 파라미터" id="appl-sch-sel4" />*/}
        {/*      </div>*/}
        {/*      <button type="button" className="krds-btn medium primary mo-full" onClick={generateSample}>샘플 파라미터 생성</button>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">행사정보 API</h3>
          <div className="def-list-wrap border">
            <dl className="def-list">
              <dt>URL</dt>
              <dd className="word-break">https://portal.smes.go.kr/ione-gw/api/event/list</dd>
              <dt>설명</dt>
              <dd>중소기업이 참여 가능한 교육, 세미나, 전시회 정보 제공</dd>
              <dt>호출방식</dt>
              <dd>POST</dd>
              <dt>데이터형식</dt>
              <dd>JSON</dd>
              <dt>등록일</dt>
              <dd>2026.07.12</dd>
              <dt>수정일</dt>
              <dd>2026.07.12</dd>
            </dl>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">요청메시지</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>요청메시지 상세 정보</caption>
              <colgroup>
                <col style={{ width: '16%' }}/>
                <col style={{ width: '12%' }}/>
                <col style={{ width: '12%' }}/>
                <col style={{ width: '12%' }}/>
                <col style={{ width: '12%' }}/>
                <col style={{ width: '36%' }}/>
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">파라미터명</th>
                  <th scope="col" className="ac">항목명</th>
                  <th scope="col" className="ac">타입</th>
                  <th scope="col" className="ac">필수여부</th>
                  <th scope="col" className="ac">샘플데이터</th>
                  <th scope="col" className="ac">설명</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>token</span></td>
                  <td className="ac" data-label="항목명"><span>서비스인증키</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>Y (택1)</span></td>
                  <td className="ac" data-label="샘플데이터"><span>인증키</span></td>
                  <td data-label="설명"><span>중소벤처24에서 발급받은 서비스 인증키. Authorization Bearer 헤더 또는 token 헤더로도 전달 가능</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>searchCnt</span></td>
                  <td className="ac" data-label="항목명"><span>조회건수</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>N</span></td>
                  <td className="ac" data-label="샘플데이터"><span>100</span></td>
                  <td data-label="설명"><span>조회할 건수. 0 또는 미입력 시 전체 조회</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>mdfcnYmd</span></td>
                  <td className="ac" data-label="항목명"><span>수정일자</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>N</span></td>
                  <td className="ac" data-label="샘플데이터"><span>20260601</span></td>
                  <td data-label="설명"><span>해당 일자 이후 수정된 데이터 조회 (YYYYMMDD). 미입력 시 전체 조회</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">결과상태 코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>결과상태 코드 상세</caption>
              <colgroup>
                <col style={{ width: '14%' }}/>
                <col style={{ width: '38%' }}/>
                <col style={{ width: '20%' }}/>
                <col style={{ width: '20%' }}/>
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">분류</th>
                  <th scope="col" className="ac">파라미터명</th>
                  <th scope="col" className="ac">코드명</th>
                  <th scope="col" className="ac">코드설명</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" rowSpan="7" className="ac"><span>결과코드</span></th>
                  <td rowSpan="7" className="ac br-1"><span>RES_CD</span></td>
                  <td className="ac"><span>0</span></td>
                  <td className="ac"><span>정상처리되었습니다.</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>2</span></td>
                  <td className="ac"><span>데이터가 없습니다.</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>3</span></td>
                  <td className="ac"><span>오류가 발생하였습니다.</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>5</span></td>
                  <td className="ac"><span>필수 파라미터가 누락되었습니다.</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>10</span></td>
                  <td className="ac"><span>해당 API의 인증키가 아닙니다.</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>11</span></td>
                  <td className="ac"><span>존재하지 않는 인증키입니다.</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>12</span></td>
                  <td className="ac"><span>인증키가 필요합니다.</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">응답 메시지</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>응답 메시지 상세</caption>
              <colgroup>
                <col style={{ width: '16%' }}/>
                <col style={{ width: '12%' }}/>
                <col style={{ width: '12%' }}/>
                <col style={{ width: '12%' }}/>
                <col style={{ width: '48%' }}/>
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">항목</th>
                  <th scope="col" className="ac">항목명</th>
                  <th scope="col" className="ac">타입</th>
                  <th scope="col" className="ac">필수여부</th>
                  <th scope="col" className="ac">샘플데이터</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ac"><span>evntInfoId</span></td>
                  <td className="ac"><span>행사정보ID</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>EVEN_000000000068946</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>evntInfoTtlNm</span></td>
                  <td className="ac"><span>행사정보제목명</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>[전북] 안전보건관리 체계구축 교육 개최</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>evntInfoFlfmtInstNm</span></td>
                  <td className="ac"><span>행사정보수행기관명</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>전주상공회의소</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>evntInfoFldNm</span></td>
                  <td className="ac"><span>행사정보분야명</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>인력</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>evntInfoTypeNm</span></td>
                  <td className="ac"><span>행사정보유형명</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>교육</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>evntInfoRgnNm</span></td>
                  <td className="ac"><span>행사정보지역명</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>전북</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>rcptPrdCn</span></td>
                  <td className="ac"><span>접수기간내용</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>~2026-07-15</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>evntPrdCn</span></td>
                  <td className="ac"><span>행사기간내용</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>20260721 ~ 20260721</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>evntOtlnCn</span></td>
                  <td className="ac"><span>행사개요내용</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>{'<p>전주상공회의소에서는 회원기업의 안전보건 수준 향상과...</p>'}</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>hstgCn</span></td>
                  <td className="ac"><span>해시태그내용</span></td>
                  <td className="ac"><span>Array&lt;String&gt;</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>["인력","전북","2026","안전보건","위험성평가"]</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>srcUrlAddr</span></td>
                  <td className="ac"><span>출처URL주소</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>https://jcci.korcham.net/front/event/eventView.do?eventId=20140338730</span>
                  </td>
                </tr>
                <tr>
                  <td className="ac"><span>pbancDocAtchFileUrls</span></td>
                  <td className="ac"><span>공고문서 첨부파일 다운로드 URL 목록</span></td>
                  <td className="ac"><span>Array&lt;String&gt;</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac">
                    <span>["https://portal.smes.go.kr/home/api/v1/files/download/EV_000000000068946_1/0"]</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>atchFileUrls</span></td>
                  <td className="ac"><span>첨부파일 다운로드 URL 목록</span></td>
                  <td className="ac"><span>Array&lt;String&gt;</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>[]</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>inqCnt</span></td>
                  <td className="ac"><span>조회수</span></td>
                  <td className="ac"><span>Long</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>4</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>regYmd</span></td>
                  <td className="ac"><span>등록일자</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>20260710</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>mdfcnYmd</span></td>
                  <td className="ac"><span>수정일자</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>20260710</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">응답 예시(JSON)</h3>
          <div className="on-subtitle-box pre">
            <div className="subtitle-boxcon ">
              <pre className="code-pre">
                <code>
                  {`{
  "result": {
    "RESULT": {
      "RES_MSG": "정상처리되었습니다.",
      "RES_CD": "0"
    },
    "RECORD": [
      {
        "evntInfoId": "EVEN_000000000068946",
        "evntInfoTtlNm": "[전북] 안전보건관리 체계구축 교육 개최",
        "evntInfoFlfmtInstNm": "전주상공회의소",
        "evntInfoFldNm": "인력",
        "evntInfoTypeNm": "교육",
        "evntInfoRgnNm": "전북",
        "rcptPrdCn": "~2026-07-15",
        "evntPrdCn": "20260721 ~ 20260721",
        "evntOtlnCn": "<p>전주상공회의소에서는 회원기업의 안전보건 수준 향상과 사업장 위험성평가 및 안전보건관리체계 구축·이행을 지원하고자 한국산업안전보건공단과 공동으로 아래와 같이 교육을 개최하오니 많은 참석을 부탁드립니다.</p>",
        "hstgCn": [
          "인력",
          "전북",
          "2026",
          "대한상공회의소",
          "전북특별자치도",
          "안전보건",
          "산업안전보건",
          "안전보건관리체계",
          "위험성평가"
        ],
        "srcUrlAddr": "https://jcci.korcham.net/front/event/eventView.do?eventId=20140338730&menuId=10105",
        "pbancDocAtchFileUrls": [
          "https://portal.smes.go.kr/home/api/v1/files/download/EV_000000000068946_1/0"
        ],
        "atchFileUrls": [],
        "inqCnt": 4,
        "regYmd": "20260710",
        "mdfcnYmd": "20260710"
      }
    ]
  }
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">샘플코드 (JAVA)</h3>
          <div className="on-subtitle-box pre">
            <div className="subtitle-boxcon ">
              <pre className="code-pre">
                <code>
                  {`/* Java 샘플 코드 */
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class ApiExplorer {
    public static void main(String[] args) throws Exception {
        String apiUrl = "https://portal.smes.go.kr/ione-gw/api/event/list";
        String token = "XXXXX"; /* 발급받은 인증키 */

        String requestBody = "{"
            + "\\"searchCnt\\":\\"100\\","
            + "\\"mdfcnYmd\\":\\"20260601\\""
            + "}";

        URL url = new URL(apiUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
        conn.setDoOutput(true);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes(StandardCharsets.UTF_8));
        }

        System.out.println("Response code: " + conn.getResponseCode());
        BufferedReader rd;

        if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
            rd = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
        } else {
            rd = new BufferedReader(new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8));
        }

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            sb.append(line);
        }
        rd.close();
        conn.disconnect();
        System.out.println(sb.toString());
    }
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="onboard-btm-btngroup bt-0" data-type="responsive">
          <div>
            <button type="button" className="krds-btn tertiary xlarge mo-full" onClick={() => navigate('..')}>목록
            </button>
          </div>
          <div>
            <button type="button" className="krds-btn primary xlarge mo-full" onClick={() => handleApplyClick(mbrNo)}>
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

export default EventInfoApi;