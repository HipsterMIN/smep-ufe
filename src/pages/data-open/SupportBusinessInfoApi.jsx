import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useEffect, useState } from 'react';
import ApiKeyForm from './ApiKeyForm';
import { useNavigate } from 'react-router-dom';
import { useApiKeyApply } from '@pages/data-open/useApiKeyApply';
import { useAuthStore } from '@store/useAuthStore.jsx';
import { onePassGetAuthCode } from '@utils/keycloakGetAuthCode.js';

const SupportBusinessInfoApi = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const userInfo = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);
  const isLoggedIn = Boolean(authToken);
  const navigate = useNavigate();

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
            <h2 className="h-tit">공고정보 API</h2>
          </div>

          <div className="search-top-box no-details">
            <div className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <label className="label" htmlFor="select_01">데이터타입</label>
                  <select id="select_01" className="krds-form-select small" value={formData.dataType} onChange={handleInputChange}>
                    <option value="rss">XML(RSS)</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="input_02">조회건수</label>
                  <input
                      type="text"
                      id="input_02"
                      className="krds-form-input small"
                      value={formData.searchCnt}
                      onChange={handleInputChange}
                      placeholder=""
                  />
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
                    <div className="krds-check-area" style={{ flexWrap: 'wrap' }}>
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
                    <div className="krds-check-area mt-8" style={{ flexWrap: 'wrap' }}>
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
                         title="생성된 샘플 파라미터" id="appl-sch-sel4" />
                </div>
                <button type="button" className="krds-btn medium primary mo-full" onClick={generateSample}>샘플 파라미터 생성</button>
              </div>
            </div>
          </div>

          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">공고정보 API</h3>
            <div className="def-list-wrap border">
              <dl className="def-list">
                <dt>URL</dt>
                <dd className="word-break">https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do</dd>
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
            <div className="krds-table-wrap">
              <table className="tbl col data word-break t-block">
                <caption>요청메시지. 파라미터명, 항목명, 타입, 필수여부, 샘플데이터, 설명 정보 제공</caption>
                <colgroup className="pc-only">
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '36%' }} />
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
                  <td className="ac"><span>지원사업 조회시 조회건수를 지정하여 조회하는 설정 값 <br />(0 또는 값이 없을 경우 전체 데이터 제공)</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>searchLclasId</span></td>
                  <td className="ac"><span>분야</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>02</span></td>
                  <td className="ac"><span>지원사업 조회시 분야를 지정하여 조회하는 설정 값</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>hashtags</span></td>
                  <td className="ac"><span>해시태그</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>금융,서울</span></td>
                  <td className="ac"><span>지원사업 조회시 해시태그를 지정하여 조회하는 설정 값(다중입력가능)</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>pageUnit</span></td>
                  <td className="ac"><span>데이터개수</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>4</span></td>
                  <td className="ac"><span>지원사업 조회시 한 페이지에 보여줄 수 있는 데이터 개수의 설정 값</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>pageIndex</span></td>
                  <td className="ac"><span>페이지번호</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>2</span></td>
                  <td className="ac"><span>지원사업 조회시 화면에 보여줄 페이지 번호의 설정 값</span></td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">결과상태 코드</h3>
            <div className="krds-table-wrap">
              <table className="tbl col data word-break t-block">
                <caption>결과상태 코드. 분류, 파라미터명, 코드명, 코드설명 정보 제공</caption>
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
                  <th scope="row" rowSpan="2" className="ac"><span>데이터타입</span></th>
                  <td rowSpan="2" className="ac br-1"><span>dataType</span></td>
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
                  <td className="ac" colSpan="2"><span className="ac">숫자 입력 제한 없음 <br />※ 0 또는 값이 없을 경우 전체 데이터 제공 <br /></span></td>
                </tr>
                <tr>
                  <th scope="row" rowSpan="8" className="ac"><span>분야</span></th>
                  <td rowSpan="8" className="ac br-1"><span>searchLclasId</span></td>
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
                  <th scope="row" rowSpan="25" className="ac"><span>해시태그</span></th>
                  <td rowSpan="25" className="ac br-1"><span>hashtags</span></td>
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
            <div className="krds-table-wrap">
              <table className="tbl col data word-break t-block">
                <caption>응답 메시지 항목 정보 제공</caption>
                <colgroup>
                  <col style={{width: '16%'}}/>
                  <col style={{width: '12%'}}/>
                  <col style={{width: '12%'}}/>
                  <col style={{width: '12%'}}/>
                  <col style={{width: '48%'}}/>
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

          {/* XML 응답 예시 */}
          <div className="conts-wrap mt-40">
            <h3 className="sec-tit">응답 예시(XML)</h3>
            <div className="on-subtitle-box pre">
              <div className="subtitle-boxcon overflow-auto">
              <pre className="code-pre">
                <code>
                  {`<rss version="2.0">
	<channel>
		<title>
			기업마당 지원사업정보
		</title>
		<link>
			https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do
		</link>
		<description>
			최신지원사업정보를 구독하세요
		</description>
		<language>
			ko-kr
		</language>
		<copyright>
			bizinfo
		</copyright>
		<managingEditor>
			develover@smba.go.kr
		</managingEditor>
		<webMaster>
			kosi@bizinfo.go.kr
		</webMaster>
		<pubDate/>
		<lastBuildDate/>
		<category>
			bizinfo
		</category>
		<ttl>
			60
		</ttl>
		<item>
			<title>
				착한임대인 장관 표창 신청 연장 공고
			</title>
			<link>
				https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000080236
			</link>
			<seq>
				PBLN_000000000080236
			</seq>
			<author>
				중소벤처기업부
			</author>
			<excInsttNm>
				지방중소벤처기업청
			</excInsttNm>
			<description>
				<div>코로나19라는 힘든 상황속에서소상공인에게 자발적으로 임대료를인하한 임대인을 '착한임대인'으로선정하는 사업입니다.</div>
			</description>
			<lcategory>
				경영
			</lcategory>
			<pubDate>
				2022-09-02 15:38:29
			</pubDate>
			<reqstDt>
				20220727 ~ 20220930
			</reqstDt>
			<trgetNm>
				중소기업
			</trgetNm>
			<inqireCo>
				43
			</inqireCo>
			<flpthNm>
				https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_000000000613641&fileSn=0
			</flpthNm>
			<fileNm>
				2022년 대한민국 메이커 스타 참가자모집 공고.pdf
			</fileNm>
			<printFlpthNm>
				https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_000000000613694&fileSn=1
			</printFlpthNm>
			<printFileNm>
				2022년 대한민국 메이커 스타 참가자모집 공고.pdf
			</printFileNm>
			<hashTags>
				2022,금융,충북,대전,중소벤처기업부
			</hashTags>
			<totCnt>
				1435
			</totCnt>
			<pblancNm>
				착한임대인 장관 표창 신청 연장 공고
			</pblancNm>
			<pblancUrl>
				https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000080236
			</pblancUrl>
			<pblancId>
				PBLN_000000000080236
			</pblancId>
			<jrsdInsttNm>
				중소벤처기업부
			</jrsdInsttNm>
			<bsnsSumryCn>
				코로나19라는 힘든 상황속에서 소상공인에게 자발적으로 임대료를 인하한 임대인을 '착한임대인'으로 선정하는 사업입니다.
			</bsnsSumryCn>
			<reqstMthPapersCn>
				
			</reqstMthPapersCn>
			<refrncNm>
				
			</refrncNm>
			<rceptEngnHmpgUrl>
				
			</rceptEngnHmpgUrl>
			<pldirSportRealmLclasCodeNm>
				경영
			</pldirSportRealmLclasCodeNm>
			<creatPnttm>
				2022-09-02 15:38:29
			</creatPnttm>
			<reqstBeginEndDe>
				20220727 ~ 20220930
			</reqstBeginEndDe>
		</item>
	</channel>
</rss>`}
                </code>
              </pre>
              </div>
            </div>
          </div>

          {/* JSON 응답 예시 */}
          <div className="conts-wrap mt-40">
            <h3 className="sec-tit">응답 예시(JSON)</h3>
            <div className="on-subtitle-box pre">
              <div className="subtitle-boxcon overflow-auto">
              <pre className="code-pre">
                <code>
                  {` {"jsonArray":{
	"title":기업마당 지원사업정보, 
	"link":https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do, 
	"description":최신지원사업정보를 구독하세요, 
	"language":ko-kr, 
	"copyright":bizinfo, 
	"managingEditor":develover@smba.go.kr, 
	"webMaster":kosi@bizinfo.go.kr, 
	"category":bizinfo, 
	"ttl":60, 
	"item":[{
		"title":착한임대인 장관 표창 신청 연장 공고, 
		"link":https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000080236, 
		"seq":PBLN_000000000080236, 
		"author":중소벤처기업부, 
		"excInsttNm":지방중소벤처기업청, 
		"description":<div>코로나19라는 힘든 상황속에서소상공인에게 자발적으로 임대료를인하한 임대인을 '착한임대인'으로선정하는 사업입니다.</div>, 
		"lcategory":경영, 
		"pubDate":2022-09-02 15:38:29, 
		"reqstDt":20220727 ~ 20220930, 
		"trgetNm":중소기업, 
		"inqireCo":43, 
		"flpthNm":https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_000000000613641&fileSn=0, 
		"fileNm":2022년 대한민국 메이커 스타 참가자모집 공고.pdf, 
		"printFlpthNm":https://www.bizinfo.go.kr/cmm/fms/getImageFile.do?atchFileId=FILE_000000000613694&fileSn=1, 
		"printFileNm":2022년 대한민국 메이커 스타 참가자모집 공고.pdf, 
		"hashTags":2022,금융,충북,대전,중소벤처기업부, 
		"totCnt":1435, 
		"pblancNm":착한임대인 장관 표창 신청 연장 공고, 
		"pblancUrl":https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000080236, 
		"pblancId":PBLN_000000000080236, 
		"jrsdInsttNm":중소벤처기업부, 
		"bsnsSumryCn":코로나19라는 힘든 상황속에서 소상공인에게 자발적으로 임대료를 인하한 임대인을 '착한임대인'으로 선정하는 사업입니다., 
		"reqstMthPapersCn":, 
		"refrncNm":, 
		"rceptEngnHmpgUrl":, 
		"pldirSportRealmLclasCodeNm":경영, 
		"creatPnttm":2022-09-02 15:38:29, 
		"reqstBeginEndDe":20220727 ~ 20220930
	}]
}}`}
                </code>
              </pre>
              </div>
            </div>
          </div>

          {/* JAVA 샘플 코드 */}
          <div className="conts-wrap mt-40">
            <h3 className="sec-tit">샘플코드 (JAVA)</h3>
            <div className="on-subtitle-box pre">
              <div className="subtitle-boxcon overflow-auto">
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
	public static void main(String[] args) throws IOException {
		StringBuilder urlBuilder = new StringBuilder("http://X.X.X.X:X/test?crtfcKey=XXXXX"); /*URL*/
		URL url = new URL(urlBuilder.toString());
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("GET");
		conn.setRequestProperty("Content-type", "application/json");
		System.out.println("Response code: " + conn.getResponseCode());
		BufferedReader rd;
		
		if (conn.getResponseCode()>=200 && conn.getResponseCode() <=300){
			rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
		} else {
			rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
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

          {/* 하단 버튼 */}
          <div className="onboard-btm-btngroup bt-0" data-type="responsive">
            <button type="button" className="krds-btn tertiary xlarge mo-full" onClick={() => navigate('..')}>
              목록
            </button>
            <button type="button" className="krds-btn primary xlarge mo-full" onClick={handleApplyClick}>
              신청하기
              <i className="svg-icon ico-angle right"></i>
            </button>
          </div>
        </div>

        <ApiKeyForm
            isOpen={isOpen}
            onClose={closePopup}
            submitting={submitting}
            errorMessage={errorMessage}
            memberInfo={memberInfo}
            mbrNo={mbrNo}
            onSubmit={(fd) => submitApply(mbrNo, fd)}
        />
      </>
  );
};

export default SupportBusinessInfoApi;