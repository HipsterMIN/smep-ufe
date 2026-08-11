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
      <div className="contents" data-type="responsive">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">API안내</p>
          <h2 className="h-tit">공고정보</h2>
        </div>

        {/* 1. API 기본 정보 */}
        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">공고정보 API</h3>
          <div className="def-list-wrap border">
            <dl className="def-list">
              <dt>요청 URL</dt>
              <dd className="word-break">https://portal.smes.go.kr/ione-gw/api/pblanc/list</dd>
              <dt>설명</dt>
              <dd>중소벤처24 홈페이지에 공개된 사업공고 정보를 연계하기 위한 API</dd>
              <dt>메서드</dt>
              <dd>GET</dd>
              <dt>응답형식</dt>
              <dd>JSON</dd>
            </dl>
          </div>
        </div>

        {/* 2. 요청 파라미터 */}
        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">요청 파라미터</h3>
          <p className="on-p3 mt-8 on-colorgray mb-16">
              ※ token(인증키)은 기정원에 요청하여 발급 받아야 합니다.<br />
              ※ GET 방식으로 호출 시 token 값은 URL encoding하여 전달해야 합니다.
          </p>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>요청 파라미터. 파라미터명, 타입, 한글명, 필수여부, 설명 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '14%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '10%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">파라미터명</th>
                  <th scope="col" className="ac">타입</th>
                  <th scope="col" className="ac">한글명</th>
                  <th scope="col" className="ac">필수여부</th>
                  <th scope="col" className="ac">설명</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>token</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="한글명"><span>인증키</span></td>
                  <td className="ac" data-label="필수여부"><span>필수</span></td>
                  <td data-label="설명"><span>GET 방식으로 호출시 url encoding 필요</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>strDt</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="한글명"><span>검색시작일</span></td>
                  <td className="ac" data-label="필수여부"><span>선택</span></td>
                  <td data-label="설명"><span>yyyyMMdd 형식의 날짜 문자열</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>endDt</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="한글명"><span>검색종료일</span></td>
                  <td className="ac" data-label="필수여부"><span>선택</span></td>
                  <td data-label="설명"><span>yyyyMMdd 형식의 날짜 문자열</span></td>
                </tr>
                <tr>
                  <td className="ac" data-label="파라미터명"><span>html</span></td>
                  <td className="ac" data-label="타입"><span>String</span></td>
                  <td className="ac" data-label="한글명"><span>html 여부</span></td>
                  <td className="ac" data-label="필수여부"><span>선택</span></td>
                  <td data-label="설명"><span>yes : 컨텐츠 항목에 html 태그 포함(기본값) / no : html 태그 제외한 Text 출력</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="on-subtitle-box pre mt-16">
            <div className="subtitle-boxtit">호출 URL 예시</div>
            <div className="subtitle-boxcon">
              <pre className="code-pre">
                <code className="word-break">
                  {'https://portal.smes.go.kr/ione-gw/api/pblanc/list?token={인증키}&strDt=20260101&endDt=20260110'}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* 3. 결과상태 코드 */}
        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">결과상태 코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>결과상태 코드. 코드, 메시지, 비고 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '14%' }} />
                <col />
                <col style={{ width: '20%' }} />
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
                  { c: '9', m: '인증키 오류. 허용되지 않은 인증키입니다.', r: '오류' },
                  { c: '10', m: '인증키 오류. 해당 API의 인증키가 아닙니다.', r: '오류' },
                  { c: '11', m: '시작일자 길이 오류', r: '오류' },
                  { c: '12', m: '종료일자 길이 오류', r: '오류' },
                  { c: '13', m: '검색 기간 오류', r: '오류' },
                  { c: '14', m: '허용되지 않은 IP 접근입니다.', r: '오류' },
                  { c: '99', m: '기타 오류 발생', r: '오류' },
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

        {/* 4. 응답메시지 (Response Format) */}
        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">응답메시지</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>응답메시지. 필드명, 타입, 한글명, 필수여부, 설명 정보가 제공됨.</caption>
              <colgroup>
                <col style={{ width: '16%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '8%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">필드명</th>
                  <th scope="col" className="ac">타입</th>
                  <th scope="col" className="ac">한글명</th>
                  <th scope="col" className="ac">필수</th>
                  <th scope="col" className="ac">설명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'resultCd', t: 'String', n: '결과상태코드', r: 'Y', d: '결과상태 코드 참조' },
                  { f: 'data', t: 'Array', n: '공고 데이터', r: 'Y', d: '-' },
                  { f: 'pblancSeq', t: 'NUMBER', n: '공고SEQ', r: '-', d: '숫자' },
                  { f: 'creatDt', t: 'String', n: '공고등록일', r: '-', d: 'yyyy-MM-dd HH:mm:ss 형식의 문자열' },
                  { f: 'pblancDtlUrl', t: 'VARCHAR(1,000)', n: '상세정보경로', r: '-', d: 'URL 텍스트' },
                  { f: 'pblancNm', t: 'VARCHAR(500)', n: '공고명', r: '-', d: '텍스트' },
                  { f: 'detailBsnsNm', t: 'VARCHAR(500)', n: '세부사업명', r: '-', d: '텍스트' },
                  { f: 'policyCnts', t: 'CLOB', n: '사업개요', r: '-', d: '텍스트(HTML태그포함)' },
                  { f: 'sportMg', t: 'CLOB', n: '지원규모', r: '-', d: '텍스트(HTML태그포함)' },
                  { f: 'sportCnts', t: 'CLOB', n: '지원내용', r: '-', d: '텍스트(HTML태그포함)' },
                  { f: 'sportTrget', t: 'CLOB', n: '지원대상', r: '-', d: '텍스트(HTML태그포함)' },
                  { f: 'reqstRcept', t: 'CLOB', n: '신청방법', r: '-', d: '텍스트(HTML태그포함)' },
                  { f: 'sportInsttNm', t: 'VARCHAR(100)', n: '지원기관명', r: '-', d: '코드표 참조' },
                  { f: 'sportInsttCd', t: 'VARCHAR(4)', n: '지원기관코드', r: '-', d: '코드표 참조' },
                  { f: 'refrnc', t: 'CLOB', n: '문의처', r: '-', d: '텍스트(HTML태그포함)' },
                  { f: 'refrncUrl', t: 'VARCHAR(1,000)', n: '문의처 홈페이지', r: '-', d: 'URL 텍스트' },
                  { f: 'refrncDept', t: 'VARCHAR(200)', n: '문의처 부서', r: '-', d: '텍스트' },
                  { f: 'refrncTel', t: 'VARCHAR(100)', n: '문의처 전화번호', r: '-', d: '텍스트' },
                  { f: 'updDt', t: 'String', n: '수정일시', r: '-', d: 'yyyy-MM-dd HH:mm:ss 형식의 문자열' },
                  { f: 'pblancBgnDt', t: 'String', n: '신청시작일', r: '-', d: 'yyyy-MM-dd 형식의 문자열' },
                  { f: 'pblancEndDt', t: 'String', n: '신청마감일', r: '-', d: 'yyyy-MM-dd 형식의 문자열' },
                  { f: 'pblancAttach', t: 'VARCHAR(4,000)', n: '첨부파일URL', r: '-', d: '복수인 경우 \'|\' 기호로 구분하여 제공' },
                  { f: 'pblancAttachNm', t: 'VARCHAR(4,000)', n: '첨부파일명', r: '-', d: '복수인 경우 \'|\' 기호로 구분하여 제공' },
                  { f: 'reqstLinkInfo', t: 'VARCHAR(1,000)', n: '온라인 신청 URL', r: '-', d: 'URL 텍스트' },
                  { f: 'bizType', t: 'VARCHAR(100)', n: '사업유형', r: '-', d: '텍스트' },
                  { f: 'bizTypeCd', t: 'VARCHAR(4)', n: '사업유형코드', r: '-', d: '코드표 참조' },
                  { f: 'sportType', t: 'VARCHAR(100)', n: '지원유형', r: '-', d: '코드표 참조' },
                  { f: 'sportTypeCd', t: 'VARCHAR(4)', n: '지원유형코드', r: '-', d: '코드표 참조' },
                  { f: 'lifeCyclDvsn', t: 'VARCHAR(100)', n: '생애주기구분', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'lifeCyclDvsnCd', t: 'VARCHAR(4)', n: '생애주기구분코드', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'areaNm', t: 'VARCHAR(100)', n: '지역명', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'areaCd', t: 'VARCHAR(10)', n: '지역코드', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'salsAmt', t: 'VARCHAR(100)', n: '매출액', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'salsAmtCd', t: 'VARCHAR(4)', n: '매출액코드', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'minSalsAmt', t: 'NUMBER', n: '최소 매출액', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'maxSalsAmt', t: 'NUMBER', n: '최대 매출액', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'ablbiz', t: 'VARCHAR(100)', n: '업력', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'ablbizCd', t: 'VARCHAR(4)', n: '업력코드', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'minAblbiz', t: 'NUMBER', n: '최소 업력', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'maxAblbiz', t: 'NUMBER', n: '최대 업력', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'emplyCnt', t: 'VARCHAR(100)', n: '종업원수', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'emplyCntCd', t: 'VARCHAR(4)', n: '종업원수코드', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'minEmplyCnt', t: 'NUMBER', n: '최소 종업원수', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'mixEmplyCnt', t: 'NUMBER', n: '최대 종업원수', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'cmpScale', t: 'VARCHAR(100)', n: '기업규모', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'cmpScaleCd', t: 'VARCHAR(4)', n: '기업규모코드', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'needCrtfn', t: 'VARCHAR(100)', n: '필요인증', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'needCrtfnCd', t: 'VARCHAR(4)', n: '필요인증코드', r: '-', d: '코드표 참조, 복수는 \'|\' 구분' },
                  { f: 'cntcInsttNm', t: 'VARCHAR(100)', n: '연계기관명', r: '-', d: '코드표 참조' },
                  { f: 'cntcInsttCd', t: 'VARCHAR(4)', n: '연계기관코드', r: '-', d: '코드표 참조' },
                  { f: 'induty', t: 'VARCHAR(100)', n: '업종', r: '-', d: '코드 OR 텍스트' },
                  { f: 'rpsntAge', t: 'NUMBER', n: '대표자 연령', r: '-', d: '코드 OR 텍스트' },
                  { f: 'minRpsntAge', t: 'NUMBER', n: '최소 대표자 연령', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'maxRpsntAge', t: 'NUMBER', n: '최대 대표자 연령', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'minInrst', t: 'NUMBER', n: '최소 금리', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'maxInrst', t: 'NUMBER', n: '최대 금리', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'minSportAmt', t: 'NUMBER', n: '최소 지원금액', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'maxSportAmt', t: 'NUMBER', n: '최대 지원금액', r: '-', d: '제한 없는 경우 빈값' },
                  { f: 'refntnYn', t: 'CHAR(1)', n: '재창업여부', r: '-', d: 'Y 또는 N' },
                  { f: 'fntnYn', t: 'CHAR(1)', n: '(예비)창업여부', r: '-', d: 'Y 또는 N' },
                  { f: 'fmleRpsntYn', t: 'CHAR(1)', n: '여성대표여부', r: '-', d: 'Y 또는 N' },
                  { f: 'pblancFileUrl', t: 'VARCHAR(200)', n: '공고문 URL', r: '-', d: '공고문 첨부파일 URL' },
                  { f: 'pblancFileNm', t: 'VARCHAR(200)', n: '공고문 파일명', r: '-', d: '공고문 첨부파일 명' },
                  { f: 'resultMsg', t: 'String', n: '결과 메시지', r: 'Y', d: '처리 결과 메시지 출력' },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td className="ac" data-label="필드명"><span>{row.f}</span></td>
                    <td className="ac" data-label="타입"><span>{row.t}</span></td>
                    <td className="ac" data-label="한글명"><span>{row.n}</span></td>
                    <td className="ac" data-label="필수"><span>{row.r}</span></td>
                    <td data-label="설명"><span>{row.d}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. 결과 데이터 예시 */}
        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">결과 데이터 예시</h3>
          <div className="on-subtitle-box pre">
            <div className="subtitle-boxcon overflow-auto">
              <pre className="code-pre">
                <code className="word-break">
                  {`{
  "resultCd": "0",
  "data": [
    {
      "pblancSeq": ,
      "creatDt": "",
      "pblancDtlUrl": ""
      // ... (응답메시지 필드 참고)
    },
    {
      "pblancSeq": ,
      "creatDt": "",
      "pblancDtlUrl": ""
    }
  ],
  "resultMsg": "정상적으로 조회되었습니다."
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* 6. 코드 참조표 */}
        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조표</h3>

          <div className="krds-table-wrap mt-16">
            <table className="tbl col data word-break t-block">
              <caption>기업분류기준코드</caption>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['CC10', '중소기업'], ['CC30', '소상공인'], ['CC50', '1인기업'],
                  ['CC60', '창업기업'], ['CC70', '예비창업자'], ['CC80', '기타기업'],
                ].map(([c, n], idx) => (
                  <tr key={idx}>
                    {idx === 0 && <td className="ac" rowSpan={6} data-label="코드구분"><span>기업분류기준코드</span></td>}
                    <td className="ac" data-label="코드"><span>{c}</span></td>
                    <td data-label="코드명"><span>{n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="krds-table-wrap mt-16">
            <table className="tbl col data word-break t-block">
              <caption>인증/확인유형코드</caption>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['EC01', '수출유망중소기업'], ['EC02', '여성기업'], ['EC03', '장애인기업'],
                  ['EC04', '중소기업'], ['EC05', '소상공인'], ['EC06', '기술혁신형중소기업'],
                  ['EC07', '경영혁신형중소기업'], ['EC08', '벤처기업'], ['EC09', '우수그린비즈'],
                  ['EC10', '사회적기업'], ['EC11', '연구소보유'], ['EC12', '지식재산경영인증 기업'],
                  ['EC13', '부품소재기업'], ['EC14', '뿌리기술기업'], ['EC15', '에너지기술기업'],
                  ['EC16', '기술전문기업'], ['EC17', '직접생산확인기업'],
                ].map(([c, n], idx) => (
                  <tr key={idx}>
                    {idx === 0 && <td className="ac" rowSpan={17} data-label="코드구분"><span>인증/확인유형코드</span></td>}
                    <td className="ac" data-label="코드"><span>{c}</span></td>
                    <td data-label="코드명"><span>{n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="krds-table-wrap mt-16">
            <table className="tbl col data word-break t-block">
              <caption>근로자수구간코드</caption>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['EI01', '1~5명미만'], ['EI02', '5~10명미만'], ['EI03', '10~20명미만'],
                  ['EI04', '20~50명미만'], ['EI05', '50~100명미만'], ['EI06', '100명이상'],
                ].map(([c, n], idx) => (
                  <tr key={idx}>
                    {idx === 0 && <td className="ac" rowSpan={6} data-label="코드구분"><span>근로자수구간코드</span></td>}
                    <td className="ac" data-label="코드"><span>{c}</span></td>
                    <td data-label="코드명"><span>{n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="krds-table-wrap mt-16">
            <table className="tbl col data word-break t-block">
              <caption>생애주기구분코드</caption>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['LC01', '창업'], ['LC02', '성장'], ['LC03', '폐업·재기'],
                ].map(([c, n], idx) => (
                  <tr key={idx}>
                    {idx === 0 && <td className="ac" rowSpan={3} data-label="코드구분"><span>생애주기구분코드</span></td>}
                    <td className="ac" data-label="코드"><span>{c}</span></td>
                    <td data-label="코드명"><span>{n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="krds-table-wrap mt-16">
            <table className="tbl col data word-break t-block">
              <caption>업력구간코드</caption>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['OI01', '3년미만'], ['OI02', '3년이상~5년미만'], ['OI03', '5년이상~7년미만'],
                  ['OI04', '7년이상~10년미만'], ['OI05', '10년이상~20년미만'], ['OI06', '20년이상'],
                ].map(([c, n], idx) => (
                  <tr key={idx}>
                    {idx === 0 && <td className="ac" rowSpan={6} data-label="코드구분"><span>업력구간코드</span></td>}
                    <td className="ac" data-label="코드"><span>{c}</span></td>
                    <td data-label="코드명"><span>{n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="krds-table-wrap mt-16">
            <table className="tbl col data word-break t-block">
              <caption>사업유형코드</caption>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['PC10', '금융'], ['PC20', '기술'], ['PC30', '인력'], ['PC40', '수출'],
                  ['PC50', '내수'], ['PC60', '창업'], ['PC70', '경영'], ['PC80', '소상공인'],
                  ['PC90', '지원'], ['PC11', '벤처'],
                ].map(([c, n], idx) => (
                  <tr key={idx}>
                    {idx === 0 && <td className="ac" rowSpan={10} data-label="코드구분"><span>사업유형코드</span></td>}
                    <td className="ac" data-label="코드"><span>{c}</span></td>
                    <td data-label="코드명"><span>{n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="krds-table-wrap mt-16">
            <table className="tbl col data word-break t-block">
              <caption>지원유형코드</caption>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['RT01', '창업'], ['RT02', '기술개발'], ['RT03', '정책자금'], ['RT04', '기술보증'],
                  ['RT05', '스마트공장'], ['RT06', '소상공인'], ['RT07', '인력지원'], ['RT08', '수출지원'],
                  ['RT09', '기업지원'], ['RT10', '정보'],
                ].map(([c, n], idx) => (
                  <tr key={idx}>
                    {idx === 0 && <td className="ac" rowSpan={10} data-label="코드구분"><span>지원유형코드</span></td>}
                    <td className="ac" data-label="코드"><span>{c}</span></td>
                    <td data-label="코드명"><span>{n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="krds-table-wrap mt-16">
            <table className="tbl col data word-break t-block">
              <caption>매출액구간코드</caption>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['SI01', '5억미만'], ['SI02', '5억이상~10억미만'], ['SI03', '10억이상~20억미만'],
                  ['SI04', '20억이상~50억미만'], ['SI05', '50억이상~100억미만'],
                  ['SI06', '100억이상~300억미만'], ['SI07', '300억이상'],
                ].map(([c, n], idx) => (
                  <tr key={idx}>
                    {idx === 0 && <td className="ac" rowSpan={7} data-label="코드구분"><span>매출액구간코드</span></td>}
                    <td className="ac" data-label="코드"><span>{c}</span></td>
                    <td data-label="코드명"><span>{n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="krds-table-wrap mt-16">
            <table className="tbl col data word-break t-block">
              <caption>지원기관코드</caption>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['SP01', '중소벤처기업진흥공단'], ['SP02', '중소기업기술정보진흥원'], ['SP03', '중소기업유통센터'],
                  ['SP04', '창업진흥원'], ['SP05', '소상공인시장진흥공단'], ['SP06', '기술보증기금'],
                  ['SP10', '대·중소기업·농어업협력재단'], ['SP12', '여성기업종합지원센터'], ['SP13', '(재)장애인기업종합지원센터'],
                  ['SP14', '한국산업기술진흥원'], ['SP15', '지역신용보증재단'], ['SP16', '중소벤처기업부'],
                  ['SP17', '중소기업중앙회'], ['SP18', '중소기업융합중앙회'], ['SP19', '한국창업보육협회'],
                  ['SP20', '이노비즈협회'], ['SP21', '한국경영혁신중소기업협회'], ['SP22', '대한무역투자진흥공사'],
                  ['SP99', '기타'],
                ].map(([c, n], idx) => (
                  <tr key={idx}>
                    {idx === 0 && <td className="ac" rowSpan={19} data-label="코드구분"><span>지원기관코드</span></td>}
                    <td className="ac" data-label="코드"><span>{c}</span></td>
                    <td data-label="코드명"><span>{n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="krds-table-wrap mt-16">
            <table className="tbl col data word-break t-block">
              <caption>지역코드</caption>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1000', '전국'], ['1100', '서울특별시'], ['2600', '부산광역시'], ['2700', '대구광역시'],
                  ['2800', '인천광역시'], ['2900', '광주광역시'], ['3000', '대전광역시'], ['3100', '울산광역시'],
                  ['3611', '세종특별자치시'], ['4100', '경기도'], ['4200', '강원도'], ['4300', '충청북도'],
                  ['4400', '충청남도'], ['4500', '전라북도'], ['4600', '전라남도'], ['4700', '경상북도'],
                  ['4800', '경상남도'], ['5000', '제주특별자치도'],
                ].map(([c, n], idx) => (
                  <tr key={idx}>
                    {idx === 0 && <td className="ac" rowSpan={18} data-label="코드구분"><span>지역코드</span></td>}
                    <td className="ac" data-label="코드"><span>{c}</span></td>
                    <td data-label="코드명"><span>{n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="krds-table-wrap mt-16">
            <table className="tbl col data word-break t-block">
              <caption>연계기관코드</caption>
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['BI01', 'SMTECH'], ['BI02', 'K-STARTUP'], ['BI03', '스마트공장'], ['BI04', '소상공인 마당'],
                  ['BI05', '중소기업 벤처진흥공단(정책자금)'], ['BI06', '기술보증기금'], ['BI07', '판판대로'],
                  ['BI08', '기술보호울타리'], ['BI09', '중소기업인력지원사업종합관리시스템'], ['BI10', '중소기업해외전시포탈'],
                  ['BI11', '협업정보시스템'], ['BI12', '중소기업수출지원센터'], ['BI13', 'IRIS'],
                  ['BI14', '소셜벤처스퀘어'], ['BI15', '무역24'], ['BI90', '중소기업 벤처진흥공단(기타)'],
                ].map(([c, n], idx) => (
                  <tr key={idx}>
                    {idx === 0 && <td className="ac" rowSpan={16} data-label="코드구분"><span>연계기관코드</span></td>}
                    <td className="ac" data-label="코드"><span>{c}</span></td>
                    <td data-label="코드명"><span>{n}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. 호출 예시 */}
        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">JavaScript(Ajax) 호출 예시</h3>
          <div className="on-subtitle-box pre">
            <div className="subtitle-boxcon overflow-auto">
              <pre className="code-pre">
                <code className="word-break">
                  {`$.ajax({
  url: 'https://portal.smes.go.kr/ione-gw/api/pblanc/list',
  data: {
    'token': '{인증키}',
    'strDt': '20260101',
    'endDt': '20260110'
  },
  dataType: 'json',
  type: 'GET',
  success: function(data) {
    console.dir(data);
  }
});`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">Java(HttpURLConnection) 호출 예시</h3>
          <div className="on-subtitle-box pre">
            <div className="subtitle-boxcon overflow-auto">
              <pre className="code-pre">
                <code className="word-break">
                  {`String apiUrl = "https://portal.smes.go.kr/ione-gw/api/pblanc/list?token={URL_ENCODED_인증키}";
URL url = new URL(apiUrl);
HttpURLConnection con = (HttpURLConnection) url.openConnection();
con.setRequestMethod("GET");
con.setRequestProperty("Content-Type", "application/json");
int responseCode = con.getResponseCode();

BufferedReader br;
if (responseCode == 200) {
  br = new BufferedReader(new InputStreamReader(con.getInputStream()));
} else {
  br = new BufferedReader(new InputStreamReader(con.getErrorStream()));
}

String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = br.readLine()) != null) {
  response.append(inputLine);
}
br.close();

Gson gson = new GsonBuilder().setPrettyPrinting().create();
JsonParser jsonParser = new JsonParser();
JsonElement jsonElement = jsonParser.parse(response.toString());
System.out.println(gson.toJson(jsonElement));`}
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

export default SupportBusinessInfoApi;