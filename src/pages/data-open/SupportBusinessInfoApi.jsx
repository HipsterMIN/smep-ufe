import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import {useState} from "react";
import ApiKeyForm from './ApiKeyForm';
import { useNavigate } from 'react-router-dom';
import { useApiKeyApply } from '@pages/data-open/useApiKeyApply';
const SupportBusinessInfoApi = () => {

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
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

  // 1. 상태 관리 정의
  const [formData, setFormData] = useState({
    dataType: 'rss',
    searchCnt: '',
    hashtags: []
  });
  const [sampleUrl, setSampleUrl] = useState('');

  // 2. 입력값 핸들러
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === 'select_01') setFormData(prev => ({ ...prev, dataType: value }));
    if (id === 'input_02') setFormData(prev => ({ ...prev, searchCnt: value }));
  };

  // 3. 해시태그 핸들러
  const handleHashtagChange = (e) => {
    const { checked, nextSibling } = e.target;
    const tagName = nextSibling.innerText; // 라벨의 텍스트(금융, 서울 등)

    setFormData(prev => {
      if (checked) {
        return { ...prev, hashtags: [...prev.hashtags, tagName] };
      } else {
        return { ...prev, hashtags: prev.hashtags.filter(tag => tag !== tagName) };
      }
    });
  };

  // 4. 샘플 파라미터 생성 로직
  const generateSample = () => {
    const { dataType, searchCnt, hashtags } = formData;
    let params = `&dataType=${dataType}`;

    if (searchCnt) params += `&searchCnt=${searchCnt}`;
    if (hashtags.length > 0) params += `&hashtags=${hashtags.join(',')}`;

    setSampleUrl(params);
  };

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기
  const navigate = useNavigate();
  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">API안내</p>
          <h2 className="h-tit">지원사업정보 API</h2>
        </div>

        <div className="search-top-box no-details">
          <div className="sch-filter-box">
            <div className="filter-form">
              <div>
                <label className="label" htmlFor="select_01">데이터타입</label>
                <select id="select_01" className="krds-form-select medium " value={formData.dataType} onChange={handleInputChange}>
                  <option value="rss">XML(RSS)</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="input_02" >조회건수</label>
                <input
                    type="text"
                    id="input_02"
                    className="krds-form-input medium" value={formData.searchCnt} onChange={handleInputChange}/>
              </div>
            </div>
            <dl className="filter-chip align-center">
              <dt>해시태그</dt>
              <dd>
                <button type="button" className="krds-btn xlarge icon border"
                        onClick={() => {
                  setFormData({ dataType: 'rss', searchCnt: '', hashtags: [] });
                  setSampleUrl('');
                }}>
                  <span className="sr-only">새로고침</span>
                  <i className="svg-icon ico-refresh"></i>
                </button>
                <div className="filter-check-box">
                  <div className="krds-check-area">
                    {['금융', '기술', '인력', '수출', '내수', '창업', '경영', '기타'].map((tag, idx) => (
                        <div className="krds-form-chip round" key={`field-${idx}`}>
                          <input
                              type="checkbox"
                              className="checkbox"
                              id={`chk1_${idx + 1}`}
                              onChange={handleHashtagChange}
                              checked={formData.hashtags.includes(tag)}
                          />
                          <label className="krds-form-chip-outline" htmlFor={`chk1_${idx + 1}`}>{tag}</label>
                        </div>
                    ))}
                  </div>
                  {/* 지역 */}
                  <div className="krds-check-area">
                    {['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map((tag, idx) => (
                        <div className="krds-form-chip round" key={`loc-${idx}`}>
                          <input
                              type="checkbox"
                              className="checkbox"
                              id={`chk1_${idx + 9}`}
                              onChange={handleHashtagChange}
                              checked={formData.hashtags.includes(tag)}
                          />
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
          <input type="text" className="krds-input medium"
                 placeholder="&dataType=rss&hashtags=서울,부산,대구,인천,광주,대전,울산,세종,경기,강원,충북,충남,전북,전남,경북,경남,제주"
                 value={sampleUrl}
                 readOnly={true}
                 title="생성된 샘플 파라미터" id="appl-sch-sel4"/>
        </div>
        <button type="button" className="krds-btn medium primary" onClick={generateSample}>샘플 파라미터 생성</button>
      </div>
    </div>
</div>

  <div className="conts-wrap mt-64">
    <h3 className="sec-tit">지원사업정보 API</h3>
    <div className="def-list-wrap border">
      <dl className="def-list">
              <dt>URL</dt>
              <dd>https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do</dd>
              <dt>설명</dt>
              <dd>기관별, 분야별 최신 지원사업 공고 정보 제공</dd>
              <dt>호출방식</dt>
              <dd>GET</dd>
              <dt>데이터형식</dt>
              <dd>JSON, XML</dd>
              <dt>등록일</dt>
              <dd>2023.08.02</dd>
              <dt>수정일</dt>
              <dd>2025.10.22</dd>
            </dl>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">요청메시지</h3>
          {/* table [S] */}
          <div className="krds-table-wrap">
            <table className="tbl col data word-break">
              <caption>요청메시지. 파라미터명, 항목명, 타입, 필수여부, 샘플데이터, 설명 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '16%' }} />
                <col style={{ width: '12%' }}/>
                <col style={{ width: '12%' }}/>
                <col style={{ width: '12%' }}/>
                <col style={{ width: '12%' }} />
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
                  <td className="ac"><span>crtfcKey</span></td>
                  <td className="ac"><span>서비스키</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>인증키</span></td>
                  <td className="ac"><span>기업마당에서 발급받은 서비스 인증키</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>dataType</span></td>
                  <td className="ac"><span>데이터타입</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>rss / json</span></td>
                  <td className="ac"><span>API 데이터를 리턴받는 타입을 지정하는 설정 값</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>searchCnt</span></td>
                  <td className="ac"><span>조회건수</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>100</span></td>
                  <td className="ac"><span>행사정보 조회시 조회건수를 지정하여 조회하는 설정 값 <br />(0 또는 값이 없을 경우 전체 데이터 제공)</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>searchLclasId</span></td>
                  <td className="ac"><span>분야</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>02</span></td>
                  <td className="ac"><span>행사정보 조회시 분야를 지정하여 조회하는 설정 값</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>hashtags</span></td>
                  <td className="ac"><span>해시태그</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>금융,서울</span></td>
                  <td className="ac"><span>행사정보 조회시 해시태그를 지정하여 조회하는 설정 값(다중입력가능)</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>pageUnit</span></td>
                  <td className="ac"><span>데이터개수</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>4</span></td>
                  <td className="ac"><span>행사정보 조회시 한 페이지에 보여줄 수 있는 데이터 개수의 설정 값</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>pageIndex</span></td>
                  <td className="ac"><span>페이지번호</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>2</span></td>
                  <td className="ac"><span>행사정보 조회시 화면에 보여줄 페이지 번호의 설정 값</span></td>
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
              <caption>결과상태 코드. 분류, 파라미터명, 코드명, 코드설명 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '14%' }} />
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
                  <th scope="row" rowspan="2" className="ac"><span>데이터타입</span></th>
                  <td rowspan="2" className="ac br-1"><span>dataType</span></td>
                  <td className="ac"><span>rss</span></td>
                  <td className="ac"><span>XML(RSS)</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>json</span></td>
                  <td className="ac"><span>JSON</span></td>
                </tr>
                <tr>
                  <th className="ac" scope="row"><span>조회건수</span></th>
                  <td className="ac br-1"><span>searchCnt</span></td>
                  <td className="ac" colspan="2"><span className="ac">숫자 입력 제한 없음 <br />※ 0 또는 값이 없을 경우 500건 데이터 제공 <br /></span></td>
                </tr>

                <tr>
                  <th scope="row" rowspan="8" className="ac"><span>분야</span></th>
                  <td rowspan="8" className="ac br-1"><span>searchLclasId</span></td>
                  <td className="ac"><span>01</span></td>
                  <td className="ac"><span>금융</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>02</span></td>
                  <td className="ac"><span>기술</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>03</span></td>
                  <td className="ac"><span>인력</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>04</span></td>
                  <td className="ac"><span>수출</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>05</span></td>
                  <td className="ac"><span>내수</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>06</span></td>
                  <td className="ac"><span>창업</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>07</span></td>
                  <td className="ac"><span>경영</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>09</span></td>
                  <td className="ac"><span>기타</span></td>
                </tr>

                <tr>
                  <th scope="row" rowspan="25" className="ac"><span>해시태그</span></th>
                  <td rowspan="25" className="ac br-1"><span>hashtags</span></td>
                  <td className="ac"><span>금융</span></td>
                  <td className="ac"><span>금융 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>기술</span></td>
                  <td className="ac"><span>기술 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>인력</span></td>
                  <td className="ac"><span>인력 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>수출</span></td>
                  <td className="ac"><span>수출 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>내수</span></td>
                  <td className="ac"><span>내수 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>창업</span></td>
                  <td className="ac"><span>창업 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>경영</span></td>
                  <td className="ac"><span>경영 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>기타</span></td>
                  <td className="ac"><span>기타 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>서울</span></td>
                  <td className="ac"><span>서울 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>부산</span></td>
                  <td className="ac"><span>부산 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>대구</span></td>
                  <td className="ac"><span>대구 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>인천</span></td>
                  <td className="ac"><span>인천 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>광주</span></td>
                  <td className="ac"><span>광주 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>대전</span></td>
                  <td className="ac"><span>대전 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>울산</span></td>
                  <td className="ac"><span>울산 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>세종</span></td>
                  <td className="ac"><span>세종 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>경기</span></td>
                  <td className="ac"><span>경기 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>강원</span></td>
                  <td className="ac"><span>강원 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>충북</span></td>
                  <td className="ac"><span>충북 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>충남</span></td>
                  <td className="ac"><span>충남 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>전북</span></td>
                  <td className="ac"><span>전북 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>전남</span></td>
                  <td className="ac"><span>전남 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>경북</span></td>
                  <td className="ac"><span>경북 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>경남</span></td>
                  <td className="ac"><span>경남 분야 해시태그</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>제주</span></td>
                  <td className="ac"><span>제주 분야 해시태그</span></td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">응답 메시지</h3>
          {/* table [S] */}
          <div className="krds-table-wrap">
            <table className="tbl col data word-break">
              <caption>응답 메시지. 항목, 항목명, 타입, 필수여부, 샘플데이터 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '16%' }} />
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
                <td className="ac"><span>title</span></td>
                <td className="ac"><span>데이터 제목</span></td>
                <td className="ac"><span>String</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span>기업마당 지원사업정보</span></td>
              </tr>
              <tr>
                <td className="ac"><span>link</span></td>
                <td className="ac"><span>공고목록URL</span></td>
                <td className="ac"><span>String</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span>https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do</span></td>
              </tr>
              <tr>
                <td className="ac"><span>description</span></td>
                <td className="ac"><span>데이터 설명</span></td>
                <td className="ac"><span>String</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span>최신지원사업정보를 구독하세요</span></td>
              </tr>
              <tr>
                <td className="ac"><span>language</span></td>
                <td className="ac"><span>언어</span></td>
                <td className="ac"><span>String</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span>ko-kr</span></td>
              </tr>
              <tr>
                <td className="ac"><span>copyright</span></td>
                <td className="ac"><span>출처</span></td>
                <td className="ac"><span>String</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span>bizinfo</span></td>
              </tr>
              <tr>
                <td className="ac"><span>managingEditor</span></td>
                <td className="ac"><span>담당자</span></td>
                <td className="ac"><span>String</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span>develover@smba.go.kr</span></td>
              </tr>
              <tr>
                <td className="ac"><span>webMaster</span></td>
                <td className="ac"><span>관리자</span></td>
                <td className="ac"><span>String</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span>kosi@bizinfo.go.kr</span></td>
              </tr>
              <tr>
                <td className="ac"><span>pubDate</span></td>
                <td className="ac"><span>배포 일자</span></td>
                <td className="ac"><span>String</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span></span></td>
              </tr>
              <tr>
                <td className="ac"><span>lastBuildDate</span></td>
                <td className="ac"><span>마지막수정 일자</span></td>
                <td className="ac"><span>String</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span></span></td>
              </tr>
              <tr>
                <td className="ac"><span>category</span></td>
                <td className="ac"><span>제공구분</span></td>
                <td className="ac"><span>String</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span>bizinfo</span></td>
              </tr>
              <tr>
                <td className="ac"><span>ttl</span></td>
                <td className="ac"><span>유효시간</span></td>
                <td className="ac"><span>String</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span>60</span></td>
              </tr>
              <tr>
                <td className="ac"><span>item</span></td>
                <td className="ac"><span>아이템</span></td>
                <td className="ac"><span>Object</span></td>
                <td className="ac"><span>Y</span></td>
                <td className="ac"><span>-</span></td>
              </tr>
              <tr>
                <td className="ac">title</td>
                <td className="ac">공고명</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">착한임대인 장관 표창 신청 연장 공고</td>
              </tr>
              <tr>
                <td className="ac">link</td>
                <td className="ac">공고URL</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000080236</td>
              </tr>
              <tr>
                <td className="ac">seq</td>
                <td className="ac">공고ID</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">PBLN_000000000080236</td>
              </tr>
              <tr>
                <td className="ac">author</td>
                <td className="ac">소관기관명</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">중소벤처기업부</td>
              </tr>
              <tr>
                <td className="ac">excInsttNm</td>
                <td className="ac">수행기관명</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">지방중소벤처기업청</td>
              </tr>
              <tr>
                <td className="ac">description</td>
                <td className="ac">사업개요내용</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">코로나19라는 힘든 상황속에서소상공인에게 자발적으로 임대료를인하한 임대인을 '착한임대인'으로선정하는 사업입니다.</td>
              </tr>
              <tr>
                <td className="ac">lcategory</td>
                <td className="ac">지원분야대분류</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">경영</td>
              </tr>
              <tr>
                <td className="ac">pubDate</td>
                <td className="ac">등록일자</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">2022-09-02 15:38:29</td>
              </tr>
              <tr>
                <td className="ac">reqstDt</td>
                <td className="ac">신청기간</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">20220727 ~ 20220930</td>
              </tr>
              <tr>
                <td className="ac">trgetNm</td>
                <td className="ac">지원대상</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">중소기업</td>
              </tr>
              <tr>
                <td className="ac">inqireCo</td>
                <td className="ac">조회수</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">43</td>
              </tr>
              <tr>
                <td className="ac">flpthNm</td>
                <td className="ac">첨부파일경로명</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_000000000613641&fileSn=0</td>
              </tr>
              <tr>
                <td className="ac">fileNm</td>
                <td className="ac">첨부파일명</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">2022년 대한민국 메이커 스타 참가자모집 공고.pdf</td>
              </tr>
              <tr>
                <td className="ac">printFlpthNm</td>
                <td className="ac">본문출력파일경로명</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_000000000613694&fileSn=1</td>
              </tr>
              <tr>
                <td className="ac">printFileNm</td>
                <td className="ac">본문출력파일명</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">2022년 대한민국 메이커 스타 참가자모집 공고.pdf</td>
              </tr>
              <tr>
                <td className="ac">hashTags</td>
                <td className="ac">해시태그</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">2022,금융,충북,대전,중소벤처기업부</td>
              </tr>
              <tr>
                <td className="ac">totCnt</td>
                <td className="ac">전체건수</td>
                <td className="ac">String</td>
                <td className="ac">Y</td>
                <td className="ac">1435</td>
              </tr>
              <tr>
                <td className="ac">pblancNm</td>
                <td className="ac">공고명</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">착한임대인 장관 표창 신청 연장 공고</td>
              </tr>
              <tr>
                <td className="ac">pblancUrl</td>
                <td className="ac">공고URL</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000080236</td>
              </tr>
              <tr>
                <td className="ac">pblancId</td>
                <td className="ac">공고ID</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">PBLN_000000000080236</td>
              </tr>
              <tr>
                <td className="ac">jrsdInsttNm</td>
                <td className="ac">소관기관명</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">중소벤처기업부</td>
              </tr>
              <tr>
                <td className="ac">bsnsSumryCn</td>
                <td className="ac">사업개요내용</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">코로나19라는 힘든 상황속에서 소상공인에게 자발적으로 임대료를 인하한 임대인을 '착한임대인'으로 선정하는 사업입니다.</td>
              </tr>
              <tr>
                <td className="ac">reqstMthPapersCn</td>
                <td className="ac">사업신청방법</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac"></td>
              </tr>
              <tr>
                <td className="ac">refrncNm</td>
                <td className="ac">문의처</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac"></td>
              </tr>
              <tr>
                <td className="ac">rceptEngnHmpgUrl</td>
                <td className="ac">사업신청URL</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac"></td>
              </tr>
              <tr>
                <td className="ac">pldirSportRealmLclasCodeNm</td>
                <td className="ac">지원분야 대분류</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">경영</td>
              </tr>
              <tr>
                <td className="ac">creatPnttm</td>
                <td className="ac">등록일자</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">2022-09-02 15:38:29</td>
              </tr>
              <tr>
                <td className="ac">reqstBeginEndDe</td>
                <td className="ac">신청기간</td>
                <td className="ac">String</td>
                <td className="ac">N</td>
                <td className="ac">20220727 ~ 20220930</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">응답 예시(XML)</h3>
          <div className="on-subtitle-box pre">
            <div className="subtitle-boxcon ">
              <pre className="code-pre">
                <code>
                  {`<rss version="2.0">
\t<channel>
\t\t<title>
\t\t\t기업마당 지원사업정보
\t\t</title>
\t\t<link>
\t\t\thttps://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do
\t\t</link>
\t\t<description>
\t\t\t최신지원사업정보를 구독하세요
\t\t</description>
\t\t<language>
\t\t\tko-kr
\t\t</language>
\t\t<copyright>
\t\t\tbizinfo
\t\t</copyright>
\t\t<managingEditor>
\t\t\tdevelover@smba.go.kr
\t\t</managingEditor>
\t\t<webMaster>
\t\t\tkosi@bizinfo.go.kr
\t\t</webMaster>
\t\t<pubDate/>
\t\t<lastBuildDate/>
\t\t<category>
\t\t\tbizinfo
\t\t</category>
\t\t<ttl>
\t\t\t60
\t\t</ttl>
\t\t<item>
\t\t\t<title>
\t\t\t\t착한임대인 장관 표창 신청 연장 공고
\t\t\t</title>
\t\t\t<link>
\t\t\t\thttps://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000080236
\t\t\t</link>
\t\t\t<seq>
\t\t\t\tPBLN_000000000080236
\t\t\t</seq>
\t\t\t<author>
\t\t\t\t중소벤처기업부
\t\t\t</author>
\t\t\t<excInsttNm>
\t\t\t\t지방중소벤처기업청
\t\t\t</excInsttNm>
\t\t\t<description>
\t\t\t\t<div>코로나19라는 힘든 상황속에서소상공인에게 자발적으로 임대료를인하한 임대인을 '착한임대인'으로선정하는 사업입니다.</div>
\t\t\t</description>
\t\t\t<lcategory>
\t\t\t\t경영
\t\t\t</lcategory>
\t\t\t<pubDate>
\t\t\t\t2022-09-02 15:38:29
\t\t\t</pubDate>
\t\t\t<reqstDt>
\t\t\t\t20220727 ~ 20220930
\t\t\t</reqstDt>
\t\t\t<trgetNm>
\t\t\t\t중소기업
\t\t\t</trgetNm>
\t\t\t<inqireCo>
\t\t\t\t43
\t\t\t</inqireCo>
\t\t\t<flpthNm>
\t\t\t\thttps://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_000000000613641&fileSn=0
\t\t\t</flpthNm>
\t\t\t<fileNm>
\t\t\t\t2022년 대한민국 메이커 스타 참가자모집 공고.pdf
\t\t\t</fileNm>
\t\t\t<printFlpthNm>
\t\t\t\thttps://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_000000000613694&fileSn=1
\t\t\t</printFlpthNm>
\t\t\t<printFileNm>
\t\t\t\t2022년 대한민국 메이커 스타 참가자모집 공고.pdf
\t\t\t</printFileNm>
\t\t\t<hashTags>
\t\t\t\t2022,금융,충북,대전,중소벤처기업부
\t\t\t</hashTags>
\t\t\t<totCnt>
\t\t\t\t1435
\t\t\t</totCnt>
\t\t\t<pblancNm>
\t\t\t\t착한임대인 장관 표창 신청 연장 공고
\t\t\t</pblancNm>
\t\t\t<pblancUrl>
\t\t\t\thttps://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000080236
\t\t\t</pblancUrl>
\t\t\t<pblancId>
\t\t\t\tPBLN_000000000080236
\t\t\t</pblancId>
\t\t\t<jrsdInsttNm>
\t\t\t\t중소벤처기업부
\t\t\t</jrsdInsttNm>
\t\t\t<bsnsSumryCn>
\t\t\t\t코로나19라는 힘든 상황속에서 소상공인에게 자발적으로 임대료를 인하한 임대인을 '착한임대인'으로 선정하는 사업입니다.
\t\t\t</bsnsSumryCn>
\t\t\t<reqstMthPapersCn>
\t\t\t\t
\t\t\t</reqstMthPapersCn>
\t\t\t<refrncNm>
\t\t\t\t
\t\t\t</refrncNm>
\t\t\t<rceptEngnHmpgUrl>
\t\t\t\t
\t\t\t</rceptEngnHmpgUrl>
\t\t\t<pldirSportRealmLclasCodeNm>
\t\t\t\t경영
\t\t\t</pldirSportRealmLclasCodeNm>
\t\t\t<creatPnttm>
\t\t\t\t2022-09-02 15:38:29
\t\t\t</creatPnttm>
\t\t\t<reqstBeginEndDe>
\t\t\t\t20220727 ~ 20220930
\t\t\t</reqstBeginEndDe>
\t\t</item>
\t</channel>
</rss> `}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">응답 예시(JSON)</h3>
          <div className="on-subtitle-box pre">
            <div className="subtitle-boxcon ">
              <pre className="code-pre">
                <code>
                  {` {"jsonArray":{
\t"title":기업마당 지원사업정보, 
\t"link":https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do, 
\t"description":최신지원사업정보를 구독하세요, 
\t"language":ko-kr, 
\t"copyright":bizinfo, 
\t"managingEditor":develover@smba.go.kr, 
\t"webMaster":kosi@bizinfo.go.kr, 
\t"category":bizinfo, 
\t"ttl":60, 
\t"item":[{
\t\t"title":착한임대인 장관 표창 신청 연장 공고, 
\t\t"link":https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000080236, 
\t\t"seq":PBLN_000000000080236, 
\t\t"author":중소벤처기업부, 
\t\t"excInsttNm":지방중소벤처기업청, 
\t\t"description":<div>코로나19라는 힘든 상황속에서소상공인에게 자발적으로 임대료를인하한 임대인을 '착한임대인'으로선정하는 사업입니다.</div>, 
\t\t"lcategory":경영, 
\t\t"pubDate":2022-09-02 15:38:29, 
\t\t"reqstDt":20220727 ~ 20220930, 
\t\t"trgetNm":중소기업, 
\t\t"inqireCo":43, 
\t\t"flpthNm":https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_000000000613641&fileSn=0, 
\t\t"fileNm":2022년 대한민국 메이커 스타 참가자모집 공고.pdf, 
\t\t"printFlpthNm":https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_000000000613694&fileSn=1, 
\t\t"printFileNm":2022년 대한민국 메이커 스타 참가자모집 공고.pdf, 
\t\t"hashTags":2022,금융,충북,대전,중소벤처기업부, 
\t\t"totCnt":1435, 
\t\t"pblancNm":착한임대인 장관 표창 신청 연장 공고, 
\t\t"pblancUrl":https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000080236, 
\t\t"pblancId":PBLN_000000000080236, 
\t\t"jrsdInsttNm":중소벤처기업부, 
\t\t"bsnsSumryCn":코로나19라는 힘든 상황속에서 소상공인에게 자발적으로 임대료를 인하한 임대인을 '착한임대인'으로 선정하는 사업입니다., 
\t\t"reqstMthPapersCn":, 
\t\t"refrncNm":, 
\t\t"rceptEngnHmpgUrl":, 
\t\t"pldirSportRealmLclasCodeNm":경영, 
\t\t"creatPnttm":2022-09-02 15:38:29, 
\t\t"reqstBeginEndDe":20220727 ~ 20220930
\t}]
}} `}
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
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URLEncoder;
import java.io.BufferedReader;
import java.net.URL;
import java.io.IOException;

public class ApiExplorer {
\tpublic static void main(String[] args) throws IOException {
\t\tStringBuilder urlBuilder = new StringBuilder("http://X.X.X.X:X/test?crtfcKey=XXXXX"); /*URL*/
\t\tURL url = new URL(urlBuilder.toString());
\t\tHttpURLConnection conn = (HttpURLConnection) url.openConnection();
\t\tconn.setRequestMethod("GET");
\t\tconn.setRequestProperty("Content-type", "application/json");
\t\tSystem.out.println("Response code: " + conn.getResponseCode());
\t\tBufferedReader rd;
\t\t
\t\tif (conn.getResponseCode()>=200 && conn.getResponseCode() <=300){
\t\t\trd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
\t\t} else {
\t\t\trd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
\t\t}
\t\t
\t\tStringBuilder sb = new StringBuilder();
\t\tString line;
\t\twhile ((line = rd.readLine()) != null) {
\t\t\tsb.append(line);
\t\t}
\t\trd.close();
\t\tconn.disconnect();
\t\tSystem.out.println(sb.toString());
\t}
}

`}
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
            <button type="button" className="krds-btn xlarge"
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

export default SupportBusinessInfoApi;
