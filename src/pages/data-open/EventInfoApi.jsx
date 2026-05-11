import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useApiKeyApply } from '@pages/data-open/useApiKeyApply';
import ApiKeyForm from './ApiKeyForm';
import { useAuthStore } from '@store/useAuthStore.jsx';

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
    submitApply
  } = useApiKeyApply();

  const [formData, setFormData] = useState({
    dataType: 'rss',
    searchCnt: '',
    hashtags: []
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
      if (moveToLogin) navigate('/service/login');
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
            <h2 className="h-tit">행사정보 API</h2>
          </div>

          <div className="search-top-box no-details">
            <div className="sch-filter-box">
              <div className="filter-form">
                <div>
                  <label className="label" htmlFor="select_01">데이터타입</label>
                  <select id="select_01" className="krds-form-select small" value={formData.dataType} onChange={handleInputChange}>
                    <option value="rss">XML(RSS)</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="input_02">조회건수</label>
                  <input type="text" id="input_02" className="krds-form-input small" value={formData.searchCnt} onChange={handleInputChange} />
                </div>
              </div>
              <dl className="filter-chip align-center">
                <dt>해시태그</dt>
                <dd>
                  <button type="button" className="krds-btn xlarge icon border" onClick={() => { setFormData({dataType: 'rss', searchCnt: '', hashtags: []}); setSampleUrl(''); }}>
                    <span className="sr-only">새로고침</span>
                    <i className="svg-icon ico-refresh"></i>
                  </button>
                  <div className="filter-check-box">
                    <div className="krds-check-area">
                      {['금융', '기술', '인력', '수출', '내수', '창업', '경영', '기타'].map((tag, idx) => (
                          <div className="krds-form-chip round" key={`field-${idx}`}>
                            <input type="checkbox" className="checkbox" id={`chk1_${idx + 1}`} onChange={handleHashtagChange} checked={formData.hashtags.includes(tag)} />
                            <label className="krds-form-chip-outline" htmlFor={`chk1_${idx + 1}`}>{tag}</label>
                          </div>
                      ))}
                    </div>
                    <div className="krds-check-area">
                      {['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map((tag, idx) => (
                          <div className="krds-form-chip round" key={`loc-${idx}`}>
                            <input type="checkbox" className="checkbox" id={`chk1_${idx + 9}`} onChange={handleHashtagChange} checked={formData.hashtags.includes(tag)} />
                            <label className="krds-form-chip-outline" htmlFor={`chk1_${idx + 9}`}>{tag}</label>
                          </div>
                      ))}
                    </div>
                  </div>
                </dd>
              </dl>
              <div className="form-box">
                <label className="label sr-only" htmlFor="appl-sch-sel4">샘플 파라미터</label>
                <div className="input-box">
                  <input type="text" className="krds-input medium" placeholder="&dataType=rss&hashtags=서울,부산,대구..." value={sampleUrl} readOnly title="생성된 샘플 파라미터" id="appl-sch-sel4" />
                </div>
                <button type="button" className="krds-btn medium primary mo-full" onClick={generateSample}>샘플 파라미터 생성</button>
              </div>
            </div>
          </div>

          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">행사정보 API</h3>
            <div className="def-list-wrap border">
              <dl className="def-list">
                <dt>URL</dt>
                <dd className="word-break">https://www.bizinfo.go.kr/uss/rss/bizinfoEventApi.do</dd>
                <dt>설명</dt>
                <dd>중소기업이 참여 가능한 교육, 세미나, 전시회 정보 제공</dd>
                <dt>호출방식</dt>
                <dd>GET</dd>
                <dt>데이터형식</dt>
                <dd>JSON, XML</dd>
                <dt>등록일</dt>
                <dd>2023.08.02</dd>
                <dt>수정일</dt>
                <dd>2025.09.08</dd>
              </dl>
            </div>
          </div>

          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">요청메시지</h3>
            <div className="krds-table-wrap">
              <table className="tbl col data word-break t-block">
                <caption>요청메시지 상세 정보</caption>
                <colgroup>
                  <col style={{width: '16%'}}/><col style={{width: '12%'}}/><col style={{width: '12%'}}/><col style={{width: '12%'}}/><col style={{width: '12%'}}/><col style={{width: '36%'}}/>
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
                  <td className="ac" data-label="파라미터명"><span>crtfcKey</span></td>
                  <td className="ac" data-label="항목명"><span>서비스키</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>Y</span></td>
                  <td className="ac" data-label="샘플데이터"><span>인증키</span></td>
                  <td data-label="설명"><span>기업마당에서 발급받은 서비스 인증키</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>dataType</span></td>
                  <td className="ac" data-label="항목명"><span>데이터타입</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>N</span></td>
                  <td className="ac" data-label="샘플데이터"><span>rss / json</span></td>
                  <td data-label="설명"><span>API 데이터를 리턴받는 타입을 지정하는 설정 값</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>searchCnt</span></td>
                  <td className="ac" data-label="항목명"><span>조회건수</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>N</span></td>
                  <td className="ac" data-label="샘플데이터"><span>100</span></td>
                  <td data-label="설명"><span>행사정보 조회시 조회건수 (0은 전체 데이터 제공)</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>searchLclasId</span></td>
                  <td className="ac" data-label="항목명"><span>분야</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>N</span></td>
                  <td className="ac" data-label="샘플데이터"><span>02</span></td>
                  <td data-label="설명"><span>행사정보 조회시 분야를 지정하여 조회</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>hashtags</span></td>
                  <td className="ac" data-label="항목명"><span>해시태그</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>N</span></td>
                  <td className="ac" data-label="샘플데이터"><span>금융,서울</span></td>
                  <td data-label="설명"><span>해시태그 다중입력 가능</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>pageUnit</span></td>
                  <td className="ac" data-label="항목명"><span>데이터개수</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>N</span></td>
                  <td className="ac" data-label="샘플데이터"><span>4</span></td>
                  <td data-label="설명"><span>한 페이지에 보여줄 수 있는 데이터 개수</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>pageIndex</span></td>
                  <td className="ac" data-label="항목명"><span>페이지번호</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="필수여부"><span>N</span></td>
                  <td className="ac" data-label="샘플데이터"><span>2</span></td>
                  <td data-label="설명"><span>화면에 보여줄 페이지 번호 설정</span></td>
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
                  <col style={{ width: '14%' }} /><col style={{ width: '38%' }}/><col style={{ width: '20%' }}/><col style={{ width: '20%' }}/>
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
                  <th scope="row" rowSpan="2" className="ac">데이터타입</th>
                  <td rowSpan="2" className="ac br-1">dataType</td>
                  <td className="ac" data-label="코드명"><span>rss</span></td>
                  <td data-label="코드설명"><span>XML(RSS)</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="코드명"><span>json</span></td>
                  <td data-label="코드설명"><span>JSON</span></td>
                </tr>
                <tr>
                  <th className="ac" scope="row">조회건수</th>
                  <td className="ac br-1">searchCnt</td>
                  <td className="ac" colSpan="2" data-label="코드설명"><span>숫자 입력 제한 없음 (0은 전체 데이터)</span></td>
                </tr>
                {/* 분야 (01-09) */}
                {[
                  {c:'01', n:'금융'}, {c:'02', n:'기술'}, {c:'03', n:'인력'}, {c:'04', n:'수출'},
                  {c:'05', n:'내수'}, {c:'06', n:'창업'}, {c:'07', n:'경영'}, {c:'09', n:'기타'}
                ].map((item, idx) => (
                    <tr key={`field-${idx}`}>
                      {idx === 0 && <th scope="row" rowSpan="8" className="ac">분야</th>}
                      {idx === 0 && <td rowSpan="8" className="ac br-1">searchLclasId</td>}
                      <td className="ac" data-label="코드명"><span>{item.c}</span></td>
                      <td data-label="코드설명"><span>{item.n}</span></td>
                    </tr>
                ))}
                {/* 해시태그 예시 (금융-제주) */}
                {[
                  '금융','기술','인력','수출','내수','창업','경영','기타','서울','부산','대구','인천','광주','대전','울산','세종','경기','강원','충북','충남','전북','전남','경북','경남','제주'
                ].map((item, idx) => (
                    <tr key={`hash-${idx}`}>
                      {idx === 0 && <th scope="row" rowSpan="25" className="ac">해시태그</th>}
                      {idx === 0 && <td rowSpan="25" className="ac br-1">hashtags</td>}
                      <td className="ac" data-label="코드명"><span>{item}</span></td>
                      <td data-label="코드설명"><span>{item} 분야 해시태그</span></td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">응답 메시지</h3>
            <div className="krds-table-wrap">
              <table className="tbl col data word-break t-block">
                <caption>응답 메시지 상세</caption>
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
                {[
                  {h:'title', m:'데이터 제목', t:'String', r:'Y', s:'기업마당 지원사업정보'},
                  {h:'link', m:'공고목록URL', t:'String', r:'Y', s:'https://www.bizinfo.go.kr/...'},
                  {h:'description', m:'데이터 설명', t:'String', r:'Y', s:'최신 행사 정보를 구독하세요'},
                  {h:'language', m:'언어', t:'String', r:'Y', s:'ko-kr'},
                  {h:'copyright', m:'출처', t:'String', r:'Y', s:'bizinfo'},
                  {h:'managingEditor', m:'담당자', t:'String', r:'Y', s:'develover@smba.go.kr'},
                  {h:'webMaster', m:'관리자', t:'String', r:'Y', s:'kosi@bizinfo.go.kr'},
                  {h:'pubDate', m:'배포 일자', t:'String', r:'Y', s:''},
                  {h:'lastBuildDate', m:'마지막수정 일자', t:'String', r:'Y', s:''},
                  {h:'category', m:'제공구분', t:'String', r:'Y', s:'bizinfo'},
                  {h:'ttl', m:'유효시간', t:'String', r:'Y', s:'60'},
                  {h:'item', m:'아이템', t:'Object', r:'Y', s:'-'},
                  {h:'seq', m:'행사정보 ID', t:'String', r:'Y', s:'EVEN_000000000058642'},
                  {h:'areaNm', m:'지역', t:'String', r:'Y', s:'전국'},
                  {h:'eventType', m:'행사유형', t:'String', r:'Y', s:'사업설명회'},
                  {h:'originOrg', m:'출처기관', t:'String', r:'N', s:'커뮤니티와 경제'},
                  {h:'rceptPd', m:'접수기간', t:'String', r:'N', s:'2022-03-16 ~ 2022-04-13'},
                  {h:'originUrl', m:'출처URL', t:'String', r:'N', s:'http://www.cne.or.kr/...'},
                  {h:'eventPeriod', m:'행사기간', t:'String', r:'Y', s:'20220413 ~ 20220413'},
                  {h:'inqireCo', m:'조회수', t:'String', r:'Y', s:'1'},
                  {h:'lcategory', m:'지원분야대분류명', t:'String', r:'Y', s:'경영@창업'},
                  {h:'registDe', m:'등록일자', t:'String', r:'Y', s:'20220316'},
                  {h:'hashTags', m:'해시태그', t:'String', r:'Y', s:'2022,금융,충북...'},
                  {h:'totCnt', m:'전체건수', t:'String', r:'Y', s:'1435'}
                ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="ac" data-label="항목"><span>{row.h}</span></td>
                      <td className="ac" data-label="항목명"><span>{row.m}</span></td>
                      <td className="ac" data-label="타입"><span>{row.t}</span></td>
                      <td className="ac" data-label="필수여부"><span>{row.r}</span></td>
                      <td data-label="샘플데이터"><span>{row.s}</span></td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="conts-wrap mt-40">
            <h3 className="sec-tit">응답 예시(XML)</h3>
            <div className="on-subtitle-box pre">
              <div className="subtitle-boxcon">
              <pre className="code-pre"><code className="word-break">{`<rss version="2.0">
    <channel>
       <title>기업마당 행사 정보</title>
       <link>https://www.bizinfo.go.kr/...</link>
       <item>
          <seq>EVEN_000000000058642</seq>
          <title>[전국] 2022년 4월 상시설명회</title>
          <areaNm>전국</areaNm>
          <eventType>사업설명회</eventType>
          <eventPeriod>20220413 ~ 20220413</eventPeriod>
       </item>
    </channel>
</rss>`}</code></pre>
              </div>
            </div>
          </div>

          <div className="conts-wrap mt-40">
            <h3 className="sec-tit">응답 예시(JSON)</h3>
            <div className="on-subtitle-box pre">
              <div className="subtitle-boxcon">
              <pre className="code-pre"><code className="word-break">{`{ "jsonArray": {
    "title": "기업마당 지원사업정보",
    "link": "https://www.bizinfo.go.kr/...",
    "description": "최신지원사업정보를 구독하세요",
    "language": "ko-kr"
}}`}</code></pre>
              </div>
            </div>
          </div>

          <div className="conts-wrap mt-40">
            <h3 className="sec-tit">샘플코드 (JAVA)</h3>
            <div className="on-subtitle-box pre">
              <div className="subtitle-boxcon">
              <pre className="code-pre"><code className="word-break">{`import java.io.BufferedReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class ApiExplorer {
    public static void main(String[] args) throws Exception {
       StringBuilder urlBuilder = new StringBuilder("http://api.bizinfo.go.kr/test?crtfcKey=XXXXX");
       URL url = new URL(urlBuilder.toString());
       HttpURLConnection conn = (HttpURLConnection) url.openConnection();
       conn.setRequestMethod("GET");
       System.out.println("Response code: " + conn.getResponseCode());
    }
}`}</code></pre>
              </div>
            </div>
          </div>

          <div className="onboard-btm-btngroup bt-0" data-type="responsive">
            <div>
              <button type="button" className="krds-btn tertiary xlarge mo-full" onClick={() => navigate('..')}>목록</button>
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