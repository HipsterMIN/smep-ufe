import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useEffect, useState } from "react";
import ApiKeyForm from './ApiKeyForm';
import { useNavigate } from 'react-router-dom';
import { useApiKeyApply } from '@pages/data-open/useApiKeyApply';
import { useAuthStore } from '@store/useAuthStore.jsx';

const SupportBusinessInfoApi = () => {
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
            <h2 className="h-tit">지원사업정보 API</h2>
          </div>

          {/* 샘플 생성 영역 (상단 박스) */}
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
                  <button type="button" className="krds-btn xlarge icon border" onClick={() => { setFormData({ dataType: 'rss', searchCnt: '', hashtags: [] }); setSampleUrl(''); }}>
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
                  <input type="text" className="krds-input medium" placeholder="샘플 파라미터가 생성됩니다." value={sampleUrl} readOnly title="생성된 샘플 파라미터" id="appl-sch-sel4" />
                </div>
                <button type="button" className="krds-btn medium primary" onClick={generateSample}>샘플 파라미터 생성</button>
              </div>
            </div>
          </div>

          {/* API 기본 정보 */}
          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">지원사업정보 API</h3>
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

          {/* 요청메시지 테이블 */}
          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">요청메시지</h3>
            <div className="krds-table-wrap">
              <table className="tbl col data word-break t-block">
                <caption>요청메시지. 파라미터명, 항목명, 타입, 필수여부, 샘플데이터, 설명 정보가 제공됨.</caption>
                <colgroup>
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                  <col />
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
                {[
                  { p: 'crtfcKey', n: '서비스키', t: 'String', r: 'Y', s: '인증키', d: '기업마당에서 발급받은 서비스 인증키' },
                  { p: 'dataType', n: '데이터타입', t: 'String', r: 'N', s: 'rss / json', d: 'API 데이터를 리턴받는 타입을 지정하는 설정 값' },
                  { p: 'searchCnt', n: '조회건수', t: 'String', r: 'N', s: '100', d: '조회건수를 지정 (0 또는 공백 시 전체 제공)' },
                  { p: 'searchLclasId', n: '분야', t: 'String', r: 'N', s: '02', d: '분야를 지정하여 조회' },
                  { p: 'hashtags', n: '해시태그', t: 'String', r: 'N', s: '금융,서울', d: '해시태그 지정 (다중입력 가능)' }
                ].map((row, i) => (
                    <tr key={i}>
                      <td className="ac" data-label="파라미터명"><span>{row.p}</span></td>
                      <td className="ac" data-label="항목명"><span>{row.n}</span></td>
                      <td className="ac" data-label="타입"><span>{row.t}</span></td>
                      <td className="ac" data-label="필수여부"><span>{row.r}</span></td>
                      <td className="ac" data-label="샘플데이터"><span>{row.s}</span></td>
                      <td data-label="설명"><span>{row.d}</span></td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 결과상태 코드 테이블 (생략 없이 반응형 처리) */}
          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">결과상태 코드</h3>
            <div className="krds-table-wrap">
              <table className="tbl col data word-break t-block">
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
                  <th scope="row" rowSpan="2" className="ac" data-label="분류"><span>데이터타입</span></th>
                  <td rowSpan="2" className="ac br-1" data-label="파라미터명"><span>dataType</span></td>
                  <td className="ac" data-label="코드명"><span>rss</span></td>
                  <td className="ac" data-label="코드설명"><span>XML(RSS)</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="코드명"><span>json</span></td>
                  <td className="ac" data-label="코드설명"><span>JSON</span></td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 응답 메시지 테이블 */}
          <div className="conts-wrap mt-64">
            <h3 className="sec-tit">응답 메시지</h3>
            <div className="krds-table-wrap">
              <table className="tbl col data word-break t-block">
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
                  { h: 'title', n: '데이터 제목', t: 'String', r: 'Y', s: '기업마당 지원사업정보' },
                  { h: 'link', n: '공고목록URL', t: 'String', r: 'Y', s: 'https://...' },
                  { h: 'item', n: '아이템', t: 'Object', r: 'Y', s: '-' }
                ].map((row, i) => (
                    <tr key={i}>
                      <td className="ac" data-label="항목"><span>{row.h}</span></td>
                      <td className="ac" data-label="항목명"><span>{row.n}</span></td>
                      <td className="ac" data-label="타입"><span>{row.t}</span></td>
                      <td className="ac" data-label="필수여부"><span>{row.r}</span></td>
                      <td data-label="샘플데이터"><span>{row.s}</span></td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 하단 버튼 그룹 */}
          <div className="onboard-btm-btngroup bt-0" data-type="responsive">
            <div>
              <button type="button" className="krds-btn tertiary xlarge mo-full" onClick={() => navigate('..')}>목록</button>
            </div>
            <div>
              <button type="button" className="krds-btn primary xlarge mo-full" onClick={handleApplyClick}>
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