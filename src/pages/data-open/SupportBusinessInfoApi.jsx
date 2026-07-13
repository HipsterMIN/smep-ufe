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
          <h2 className="h-tit">공고정보 API</h2>
        </div>
        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">공고정보 API</h3>
          <div className="def-list-wrap border">
            <dl className="def-list">
              <dt>URL</dt>
              <dd className="word-break">https://www.smes.go.kr/fnct/apiReqst/extPblancInfo</dd>
              <dt>설명</dt>
              <dd>중소벤처24 홈페이지에 공개된 사업공고 정보를 연계하기 위한 API</dd>
              <dt>호출방식</dt>
              <dd>GET</dd>
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
                  <td className="ac"><span>token</span></td>
                  <td className="ac"><span>인증키</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>인증키</span></td>
                  <td className="ac"><span>GET 방식으로 호출시 url encoding 필요. ※ 기정원에 요청하여 발급 받아야 합니다.</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>strDt</span></td>
                  <td className="ac"><span>검색시작일</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>20221101</span></td>
                  <td className="ac"><span>yyyyMMdd 형식의 날짜 문자열</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>endDt</span></td>
                  <td className="ac"><span>검색종료일</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>20221130</span></td>
                  <td className="ac"><span>yyyyMMdd 형식의 날짜 문자열</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>html</span></td>
                  <td className="ac"><span>html 여부</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>N</span></td>
                  <td className="ac"><span>yes</span></td>
                  <td className="ac"><span>yes : 컨텐츠 항목에 html 테그 포함(기본값) <br />no : 컨텐츠 항목에 html 테그를 제외한 Text 출력</span></td>
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
                  <th scope="row" rowSpan="8" className="ac"><span>결과상태코드</span></th>
                  <td rowSpan="8" className="ac br-1"><span>resultCd</span></td>
                  <td className="ac"><span>0</span></td>
                  <td className="ac"><span>정상적으로 조회 되었습니다.</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>9</span></td>
                  <td className="ac"><span>인증키 오류. 허용되지 않은 인증키입니다.</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>10</span></td>
                  <td className="ac"><span>인증키 오류. 해당 API의 인증키가 아닙니다.</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>11</span></td>
                  <td className="ac"><span>시작일자 길이 오류</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>12</span></td>
                  <td className="ac"><span>종료일자 길이 오류</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>13</span></td>
                  <td className="ac"><span>검색 기간 오류</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>14</span></td>
                  <td className="ac"><span>허용되지 않은 IP 접근입니다.</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>99</span></td>
                  <td className="ac"><span>기타 오류 발생</span></td>
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
                  <td className="ac"><span>resultCd</span></td>
                  <td className="ac"><span>결과상태코드</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>결과상태 코드 참조</span></td>
                </tr>
                <tr>
                  <td className="ac"><span>data</span></td>
                  <td className="ac"><span>공고 데이터</span></td>
                  <td className="ac"><span>Array</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>-</span></td>
                </tr>
                <tr>
                  <td className="ac">pblancSeq</td>
                  <td className="ac">공고SEQ</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">숫자</td>
                </tr>
                <tr>
                  <td className="ac">creatDt</td>
                  <td className="ac">공고등록일</td>
                  <td className="ac">String</td>
                  <td className="ac">-</td>
                  <td className="ac">yyyy-MM-dd HH:mm:ss 형식의 문자열</td>
                </tr>
                <tr>
                  <td className="ac">pblancDtlUrl</td>
                  <td className="ac">상세정보경로</td>
                  <td className="ac">VARCHAR(1,000)</td>
                  <td className="ac">-</td>
                  <td className="ac">URL 텍스트</td>
                </tr>
                <tr>
                  <td className="ac">pblancNm</td>
                  <td className="ac">공고명</td>
                  <td className="ac">VARCHAR(500)</td>
                  <td className="ac">-</td>
                  <td className="ac">텍스트</td>
                </tr>
                <tr>
                  <td className="ac">detailBsnsNm</td>
                  <td className="ac">세부사업명</td>
                  <td className="ac">VARCHAR(500)</td>
                  <td className="ac">-</td>
                  <td className="ac">텍스트</td>
                </tr>
                <tr>
                  <td className="ac">policyCnts</td>
                  <td className="ac">사업개요</td>
                  <td className="ac">CLOB</td>
                  <td className="ac">-</td>
                  <td className="ac">텍스트(HTML태그포함)</td>
                </tr>
                <tr>
                  <td className="ac">sportMg</td>
                  <td className="ac">지원규모</td>
                  <td className="ac">CLOB</td>
                  <td className="ac">-</td>
                  <td className="ac">텍스트(HTML태그포함)</td>
                </tr>
                <tr>
                  <td className="ac">sportCnts</td>
                  <td className="ac">지원내용</td>
                  <td className="ac">CLOB</td>
                  <td className="ac">-</td>
                  <td className="ac">텍스트(HTML태그포함)</td>
                </tr>
                <tr>
                  <td className="ac">sportTrget</td>
                  <td className="ac">지원대상</td>
                  <td className="ac">CLOB</td>
                  <td className="ac">-</td>
                  <td className="ac">텍스트(HTML태그포함)</td>
                </tr>
                <tr>
                  <td className="ac">reqstRcept</td>
                  <td className="ac">신청방법</td>
                  <td className="ac">CLOB</td>
                  <td className="ac">-</td>
                  <td className="ac">텍스트(HTML태그포함)</td>
                </tr>
                <tr>
                  <td className="ac">sportInsttNm</td>
                  <td className="ac">지원기관명</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조</td>
                </tr>
                <tr>
                  <td className="ac">sportInsttCd</td>
                  <td className="ac">지원기관코드</td>
                  <td className="ac">VARCHAR(4)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조</td>
                </tr>
                <tr>
                  <td className="ac">refrnc</td>
                  <td className="ac">문의처</td>
                  <td className="ac">CLOB</td>
                  <td className="ac">-</td>
                  <td className="ac">텍스트(HTML태그포함)</td>
                </tr>
                <tr>
                  <td className="ac">refrncUrl</td>
                  <td className="ac">문의처 홈페이지</td>
                  <td className="ac">VARCHAR(1,000)</td>
                  <td className="ac">-</td>
                  <td className="ac">URL 텍스트</td>
                </tr>
                <tr>
                  <td className="ac">refrncDept</td>
                  <td className="ac">문의처 부서</td>
                  <td className="ac">VARCHAR(200)</td>
                  <td className="ac">-</td>
                  <td className="ac">텍스트</td>
                </tr>
                <tr>
                  <td className="ac">refrncTel</td>
                  <td className="ac">문의처 전화번호</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">텍스트</td>
                </tr>
                <tr>
                  <td className="ac">updDt</td>
                  <td className="ac">수정일시</td>
                  <td className="ac">String</td>
                  <td className="ac">-</td>
                  <td className="ac">yyyy-MM-dd HH:mm:ss 형식의 문자열</td>
                </tr>
                <tr>
                  <td className="ac">pblancBgnDt</td>
                  <td className="ac">신청시작일</td>
                  <td className="ac">String</td>
                  <td className="ac">-</td>
                  <td className="ac">yyyy-MM-dd 형식의 문자열</td>
                </tr>
                <tr>
                  <td className="ac">pblancEndDt</td>
                  <td className="ac">신청마감일</td>
                  <td className="ac">String</td>
                  <td className="ac">-</td>
                  <td className="ac">yyyy-MM-dd 형식의 문자열</td>
                </tr>
                <tr>
                  <td className="ac">pblancAttach</td>
                  <td className="ac">첨부파일URL</td>
                  <td className="ac">VARCHAR(4,000)</td>
                  <td className="ac">-</td>
                  <td className="ac">복수인 경우 '|' 기호로 구분</td>
                </tr>
                <tr>
                  <td className="ac">pblancAttachNm</td>
                  <td className="ac">첨부파일명</td>
                  <td className="ac">VARCHAR(4,000)</td>
                  <td className="ac">-</td>
                  <td className="ac">복수인 경우 '|' 기호로 구분</td>
                </tr>
                <tr>
                  <td className="ac">reqstLinkInfo</td>
                  <td className="ac">온라인 신청 URL</td>
                  <td className="ac">VARCHAR(1,000)</td>
                  <td className="ac">-</td>
                  <td className="ac">URL 텍스트</td>
                </tr>
                <tr>
                  <td className="ac">bizType</td>
                  <td className="ac">사업유형</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">텍스트</td>
                </tr>
                <tr>
                  <td className="ac">bizTypeCd</td>
                  <td className="ac">사업유형코드</td>
                  <td className="ac">VARCHAR(4)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조</td>
                </tr>
                <tr>
                  <td className="ac">sportType</td>
                  <td className="ac">지원유형</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조</td>
                </tr>
                <tr>
                  <td className="ac">sportTypeCd</td>
                  <td className="ac">지원유형코드</td>
                  <td className="ac">VARCHAR(4)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조</td>
                </tr>
                <tr>
                  <td className="ac">lifeCyclDvsn</td>
                  <td className="ac">생애주기구분</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">lifeCyclDvsnCd</td>
                  <td className="ac">생애주기구분코드</td>
                  <td className="ac">VARCHAR(4)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">areaNm</td>
                  <td className="ac">지역명</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">areaCd</td>
                  <td className="ac">지역코드</td>
                  <td className="ac">VARCHAR(10)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">salsAmt</td>
                  <td className="ac">매출액</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">salsAmtCd</td>
                  <td className="ac">매출액코드</td>
                  <td className="ac">VARCHAR(4)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">minSalsAmt</td>
                  <td className="ac">최소 매출액</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">maxSalsAmt</td>
                  <td className="ac">최대 매출액</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">ablbiz</td>
                  <td className="ac">업력</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">ablbizCd</td>
                  <td className="ac">업력코드</td>
                  <td className="ac">VARCHAR(4)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">minAblbiz</td>
                  <td className="ac">최소 업력</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">maxAblbiz</td>
                  <td className="ac">최대 업력</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">emplyCnt</td>
                  <td className="ac">종업원수</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">emplyCntCd</td>
                  <td className="ac">종업원수코드</td>
                  <td className="ac">VARCHAR(4)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">minEmplyCnt</td>
                  <td className="ac">최소 종업원수</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">mixEmplyCnt</td>
                  <td className="ac">최대 종업원수</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">cmpScale</td>
                  <td className="ac">기업규모</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">cmpScaleCd</td>
                  <td className="ac">기업규모코드</td>
                  <td className="ac">VARCHAR(4)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">needCrtfn</td>
                  <td className="ac">필요인증</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">needCrtfnCd</td>
                  <td className="ac">필요인증코드</td>
                  <td className="ac">VARCHAR(4)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조, 복수는 '|' 구분</td>
                </tr>
                <tr>
                  <td className="ac">cntcInsttNm</td>
                  <td className="ac">연계기관명</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조</td>
                </tr>
                <tr>
                  <td className="ac">cntcInsttCd</td>
                  <td className="ac">연계기관코드</td>
                  <td className="ac">VARCHAR(4)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드표 참조</td>
                </tr>
                <tr>
                  <td className="ac">induty</td>
                  <td className="ac">업종</td>
                  <td className="ac">VARCHAR(100)</td>
                  <td className="ac">-</td>
                  <td className="ac">코드 OR 텍스트</td>
                </tr>
                <tr>
                  <td className="ac">rpsntAge</td>
                  <td className="ac">대표자 연령</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">코드 OR 텍스트</td>
                </tr>
                <tr>
                  <td className="ac">minRpsntAge</td>
                  <td className="ac">최소 대표자 연령</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">maxRpsntAge</td>
                  <td className="ac">최대 대표자 연령</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">minInrst</td>
                  <td className="ac">최소 금리</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">maxInrst</td>
                  <td className="ac">최대 금리</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">minSportAmt</td>
                  <td className="ac">최소 지원금액</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">maxSportAmt</td>
                  <td className="ac">최대 지원금액</td>
                  <td className="ac">NUMBER</td>
                  <td className="ac">-</td>
                  <td className="ac">제한 없는 경우 빈값</td>
                </tr>
                <tr>
                  <td className="ac">refntnYn</td>
                  <td className="ac">재창업여부</td>
                  <td className="ac">CHAR(1)</td>
                  <td className="ac">-</td>
                  <td className="ac">Y 또는 N</td>
                </tr>
                <tr>
                  <td className="ac">fntnYn</td>
                  <td className="ac">(예비)창업여부</td>
                  <td className="ac">CHAR(1)</td>
                  <td className="ac">-</td>
                  <td className="ac">Y 또는 N</td>
                </tr>
                <tr>
                  <td className="ac">fmleRpsntYn</td>
                  <td className="ac">여성대표여부</td>
                  <td className="ac">CHAR(1)</td>
                  <td className="ac">-</td>
                  <td className="ac">Y 또는 N</td>
                </tr>
                <tr>
                  <td className="ac">pblancFileUrl</td>
                  <td className="ac">공고문 URL</td>
                  <td className="ac">VARCHAR(200)</td>
                  <td className="ac">-</td>
                  <td className="ac">공고문 첨부파일 URL</td>
                </tr>
                <tr>
                  <td className="ac">pblancFileNm</td>
                  <td className="ac">공고문 파일명</td>
                  <td className="ac">VARCHAR(200)</td>
                  <td className="ac">-</td>
                  <td className="ac">공고문 첨부파일 명</td>
                </tr>
                <tr>
                  <td className="ac"><span>resultMsg</span></td>
                  <td className="ac"><span>결과 메시지</span></td>
                  <td className="ac"><span>String</span></td>
                  <td className="ac"><span>Y</span></td>
                  <td className="ac"><span>처리 결과 메시지 출력</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 코드 참조 */}
        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조 - 기업분류기준코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>기업분류기준코드 목록</caption>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row" rowSpan="6" className="ac"><span>기업분류기준코드</span></th><td className="ac"><span>CC10</span></td><td className="ac"><span>중소기업</span></td></tr>
                <tr><td className="ac"><span>CC30</span></td><td className="ac"><span>소상공인</span></td></tr>
                <tr><td className="ac"><span>CC50</span></td><td className="ac"><span>1인기업</span></td></tr>
                <tr><td className="ac"><span>CC60</span></td><td className="ac"><span>창업기업</span></td></tr>
                <tr><td className="ac"><span>CC70</span></td><td className="ac"><span>예비창업자</span></td></tr>
                <tr><td className="ac"><span>CC80</span></td><td className="ac"><span>기타</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조 - 기업인증/확인유형코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>기업인증/확인유형코드 목록</caption>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row" rowSpan="17" className="ac"><span>기업인증/확인유형코드</span></th><td className="ac"><span>EC01</span></td><td className="ac"><span>수출유망중소기업</span></td></tr>
                <tr><td className="ac"><span>EC02</span></td><td className="ac"><span>여성기업</span></td></tr>
                <tr><td className="ac"><span>EC03</span></td><td className="ac"><span>장애인기업</span></td></tr>
                <tr><td className="ac"><span>EC04</span></td><td className="ac"><span>중소기업</span></td></tr>
                <tr><td className="ac"><span>EC05</span></td><td className="ac"><span>소상공인</span></td></tr>
                <tr><td className="ac"><span>EC06</span></td><td className="ac"><span>기술혁신형중소기업</span></td></tr>
                <tr><td className="ac"><span>EC07</span></td><td className="ac"><span>경영혁신형중소기업</span></td></tr>
                <tr><td className="ac"><span>EC08</span></td><td className="ac"><span>벤처기업</span></td></tr>
                <tr><td className="ac"><span>EC09</span></td><td className="ac"><span>우수그린비즈</span></td></tr>
                <tr><td className="ac"><span>EC10</span></td><td className="ac"><span>사회적기업</span></td></tr>
                <tr><td className="ac"><span>EC11</span></td><td className="ac"><span>연구소보유</span></td></tr>
                <tr><td className="ac"><span>EC12</span></td><td className="ac"><span>지식재산경영인증 기업</span></td></tr>
                <tr><td className="ac"><span>EC13</span></td><td className="ac"><span>부품소재기업</span></td></tr>
                <tr><td className="ac"><span>EC14</span></td><td className="ac"><span>뿌리기술기업</span></td></tr>
                <tr><td className="ac"><span>EC15</span></td><td className="ac"><span>에너지기술기업</span></td></tr>
                <tr><td className="ac"><span>EC16</span></td><td className="ac"><span>기술전문기업</span></td></tr>
                <tr><td className="ac"><span>EC17</span></td><td className="ac"><span>직접생산확인기업</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조 - 근로자수구간코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>근로자수구간코드 목록</caption>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row" rowSpan="6" className="ac"><span>근로자수구간코드</span></th><td className="ac"><span>EI01</span></td><td className="ac"><span>1~5명미만</span></td></tr>
                <tr><td className="ac"><span>EI02</span></td><td className="ac"><span>5~10명미만</span></td></tr>
                <tr><td className="ac"><span>EI03</span></td><td className="ac"><span>10~20명미만</span></td></tr>
                <tr><td className="ac"><span>EI04</span></td><td className="ac"><span>20~50명미만</span></td></tr>
                <tr><td className="ac"><span>EI05</span></td><td className="ac"><span>50~100명미만</span></td></tr>
                <tr><td className="ac"><span>EI06</span></td><td className="ac"><span>100명이상</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조 - 생애주기구분코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>생애주기구분코드 목록</caption>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row" rowSpan="3" className="ac"><span>생애주기구분코드</span></th><td className="ac"><span>LC01</span></td><td className="ac"><span>창업</span></td></tr>
                <tr><td className="ac"><span>LC02</span></td><td className="ac"><span>성장</span></td></tr>
                <tr><td className="ac"><span>LC03</span></td><td className="ac"><span>폐업·재기</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조 - 업력구간코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>업력구간코드 목록</caption>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row" rowSpan="6" className="ac"><span>업력구간코드</span></th><td className="ac"><span>OI01</span></td><td className="ac"><span>3년미만</span></td></tr>
                <tr><td className="ac"><span>OI02</span></td><td className="ac"><span>3년이상~5년미만</span></td></tr>
                <tr><td className="ac"><span>OI03</span></td><td className="ac"><span>5년이상~7년미만</span></td></tr>
                <tr><td className="ac"><span>OI04</span></td><td className="ac"><span>7년이상~10년미만</span></td></tr>
                <tr><td className="ac"><span>OI05</span></td><td className="ac"><span>10년이상~20년미만</span></td></tr>
                <tr><td className="ac"><span>OI06</span></td><td className="ac"><span>20년이상</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조 - 사업유형코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>사업유형코드 목록</caption>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row" rowSpan="10" className="ac"><span>사업유형코드</span></th><td className="ac"><span>PC10</span></td><td className="ac"><span>금융</span></td></tr>
                <tr><td className="ac"><span>PC20</span></td><td className="ac"><span>기술</span></td></tr>
                <tr><td className="ac"><span>PC30</span></td><td className="ac"><span>인력</span></td></tr>
                <tr><td className="ac"><span>PC40</span></td><td className="ac"><span>수출</span></td></tr>
                <tr><td className="ac"><span>PC50</span></td><td className="ac"><span>내수</span></td></tr>
                <tr><td className="ac"><span>PC60</span></td><td className="ac"><span>창업</span></td></tr>
                <tr><td className="ac"><span>PC70</span></td><td className="ac"><span>경영</span></td></tr>
                <tr><td className="ac"><span>PC80</span></td><td className="ac"><span>소상공인</span></td></tr>
                <tr><td className="ac"><span>PC90</span></td><td className="ac"><span>지원</span></td></tr>
                <tr><td className="ac"><span>PC11</span></td><td className="ac"><span>벤처</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조 - 지원유형코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>지원유형코드 목록</caption>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row" rowSpan="10" className="ac"><span>지원유형코드</span></th><td className="ac"><span>RT01</span></td><td className="ac"><span>창업</span></td></tr>
                <tr><td className="ac"><span>RT02</span></td><td className="ac"><span>기술개발</span></td></tr>
                <tr><td className="ac"><span>RT03</span></td><td className="ac"><span>정책자금</span></td></tr>
                <tr><td className="ac"><span>RT04</span></td><td className="ac"><span>기술보증</span></td></tr>
                <tr><td className="ac"><span>RT05</span></td><td className="ac"><span>스마트공장</span></td></tr>
                <tr><td className="ac"><span>RT06</span></td><td className="ac"><span>소상공인</span></td></tr>
                <tr><td className="ac"><span>RT07</span></td><td className="ac"><span>인력지원</span></td></tr>
                <tr><td className="ac"><span>RT08</span></td><td className="ac"><span>수출지원</span></td></tr>
                <tr><td className="ac"><span>RT09</span></td><td className="ac"><span>기업지원</span></td></tr>
                <tr><td className="ac"><span>RT10</span></td><td className="ac"><span>정보</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조 - 매출액구간코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>매출액구간코드 목록</caption>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row" rowSpan="7" className="ac"><span>매출액구간코드</span></th><td className="ac"><span>SI01</span></td><td className="ac"><span>5억미만</span></td></tr>
                <tr><td className="ac"><span>SI02</span></td><td className="ac"><span>5억이상~10억미만</span></td></tr>
                <tr><td className="ac"><span>SI03</span></td><td className="ac"><span>10억이상~20억미만</span></td></tr>
                <tr><td className="ac"><span>SI04</span></td><td className="ac"><span>20억이상~50억미만</span></td></tr>
                <tr><td className="ac"><span>SI05</span></td><td className="ac"><span>50억이상~100억미만</span></td></tr>
                <tr><td className="ac"><span>SI06</span></td><td className="ac"><span>100억이상~300억미만</span></td></tr>
                <tr><td className="ac"><span>SI07</span></td><td className="ac"><span>300억이상</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조 - 지원기관코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>지원기관코드 목록</caption>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row" rowSpan="19" className="ac"><span>지원기관코드</span></th><td className="ac"><span>SP01</span></td><td className="ac"><span>중소벤처기업진흥공단</span></td></tr>
                <tr><td className="ac"><span>SP02</span></td><td className="ac"><span>중소기업기술정보진흥원</span></td></tr>
                <tr><td className="ac"><span>SP03</span></td><td className="ac"><span>중소기업유통센터</span></td></tr>
                <tr><td className="ac"><span>SP04</span></td><td className="ac"><span>창업진흥원</span></td></tr>
                <tr><td className="ac"><span>SP05</span></td><td className="ac"><span>소상공인시장진흥공단</span></td></tr>
                <tr><td className="ac"><span>SP06</span></td><td className="ac"><span>기술보증기금</span></td></tr>
                <tr><td className="ac"><span>SP10</span></td><td className="ac"><span>대·중소기업·농어업협력재단</span></td></tr>
                <tr><td className="ac"><span>SP12</span></td><td className="ac"><span>여성기업종합지원센터</span></td></tr>
                <tr><td className="ac"><span>SP13</span></td><td className="ac"><span>(재)장애인기업종합지원센터</span></td></tr>
                <tr><td className="ac"><span>SP14</span></td><td className="ac"><span>한국산업기술진흥원</span></td></tr>
                <tr><td className="ac"><span>SP15</span></td><td className="ac"><span>지역신용보증재단</span></td></tr>
                <tr><td className="ac"><span>SP16</span></td><td className="ac"><span>중소벤처기업부</span></td></tr>
                <tr><td className="ac"><span>SP17</span></td><td className="ac"><span>중소기업중앙회</span></td></tr>
                <tr><td className="ac"><span>SP18</span></td><td className="ac"><span>중소기업융합중앙회</span></td></tr>
                <tr><td className="ac"><span>SP19</span></td><td className="ac"><span>한국창업보육협회</span></td></tr>
                <tr><td className="ac"><span>SP20</span></td><td className="ac"><span>이노비즈협회</span></td></tr>
                <tr><td className="ac"><span>SP21</span></td><td className="ac"><span>한국경영혁신중소기업협회</span></td></tr>
                <tr><td className="ac"><span>SP22</span></td><td className="ac"><span>대한무역투자진흥공사</span></td></tr>
                <tr><td className="ac"><span>SP99</span></td><td className="ac"><span>기타</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조 - 지역코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>지역코드 목록</caption>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row" rowSpan="18" className="ac"><span>지역코드</span></th><td className="ac"><span>1000</span></td><td className="ac"><span>전국</span></td></tr>
                <tr><td className="ac"><span>1100</span></td><td className="ac"><span>서울특별시</span></td></tr>
                <tr><td className="ac"><span>2600</span></td><td className="ac"><span>부산광역시</span></td></tr>
                <tr><td className="ac"><span>2700</span></td><td className="ac"><span>대구광역시</span></td></tr>
                <tr><td className="ac"><span>2800</span></td><td className="ac"><span>인천광역시</span></td></tr>
                <tr><td className="ac"><span>2900</span></td><td className="ac"><span>광주광역시</span></td></tr>
                <tr><td className="ac"><span>3000</span></td><td className="ac"><span>대전광역시</span></td></tr>
                <tr><td className="ac"><span>3100</span></td><td className="ac"><span>울산광역시</span></td></tr>
                <tr><td className="ac"><span>3611</span></td><td className="ac"><span>세종특별자치시</span></td></tr>
                <tr><td className="ac"><span>4100</span></td><td className="ac"><span>경기도</span></td></tr>
                <tr><td className="ac"><span>4200</span></td><td className="ac"><span>강원도</span></td></tr>
                <tr><td className="ac"><span>4300</span></td><td className="ac"><span>충청북도</span></td></tr>
                <tr><td className="ac"><span>4400</span></td><td className="ac"><span>충청남도</span></td></tr>
                <tr><td className="ac"><span>4500</span></td><td className="ac"><span>전라북도</span></td></tr>
                <tr><td className="ac"><span>4600</span></td><td className="ac"><span>전라남도</span></td></tr>
                <tr><td className="ac"><span>4700</span></td><td className="ac"><span>경상북도</span></td></tr>
                <tr><td className="ac"><span>4800</span></td><td className="ac"><span>경상남도</span></td></tr>
                <tr><td className="ac"><span>5000</span></td><td className="ac"><span>제주특별자치도</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="conts-wrap mt-64">
          <h3 className="sec-tit">코드 참조 - 연계기관코드</h3>
          <div className="krds-table-wrap">
            <table className="tbl col data word-break t-block">
              <caption>연계기관코드 목록</caption>
              <thead>
                <tr>
                  <th scope="col" className="ac">코드구분</th>
                  <th scope="col" className="ac">코드</th>
                  <th scope="col" className="ac">코드명</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row" rowSpan="16" className="ac"><span>연계기관코드</span></th><td className="ac"><span>BI01</span></td><td className="ac"><span>SMTECH</span></td></tr>
                <tr><td className="ac"><span>BI02</span></td><td className="ac"><span>K-STARTUP</span></td></tr>
                <tr><td className="ac"><span>BI03</span></td><td className="ac"><span>스마트공장</span></td></tr>
                <tr><td className="ac"><span>BI04</span></td><td className="ac"><span>소상공인 마당</span></td></tr>
                <tr><td className="ac"><span>BI05</span></td><td className="ac"><span>중소기업 벤처진흥공단(정책자금)</span></td></tr>
                <tr><td className="ac"><span>BI06</span></td><td className="ac"><span>기술보증기금</span></td></tr>
                <tr><td className="ac"><span>BI07</span></td><td className="ac"><span>판판대로</span></td></tr>
                <tr><td className="ac"><span>BI08</span></td><td className="ac"><span>기술보호울타리</span></td></tr>
                <tr><td className="ac"><span>BI09</span></td><td className="ac"><span>중소기업인력지원사업종합관리시스템</span></td></tr>
                <tr><td className="ac"><span>BI10</span></td><td className="ac"><span>중소기업해외전시포탈</span></td></tr>
                <tr><td className="ac"><span>BI11</span></td><td className="ac"><span>협업정보시스템</span></td></tr>
                <tr><td className="ac"><span>BI12</span></td><td className="ac"><span>중소기업수출지원센터</span></td></tr>
                <tr><td className="ac"><span>BI13</span></td><td className="ac"><span>IRIS</span></td></tr>
                <tr><td className="ac"><span>BI14</span></td><td className="ac"><span>소셜벤처스퀘어</span></td></tr>
                <tr><td className="ac"><span>BI15</span></td><td className="ac"><span>무역24</span></td></tr>
                <tr><td className="ac"><span>BI90</span></td><td className="ac"><span>중소기업 벤처진흥공단(기타)</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* JSON 응답 예시 */}
        <div className="conts-wrap mt-40">
          <h3 className="sec-tit">응답 예시(JSON)</h3>
          <div className="on-subtitle-box pre">
            <div className="subtitle-boxcon overflow-auto">
              <pre className="code-pre">
                <code>
                  {`{
    "resultCd": "0",
    "data": [
        {
            "pblancSeq": 10082422,
            "creatDt": "2021-01-27 10:40:30",
            "pblancDtlUrl": "https://www.ultari.go.kr/portal/psi/techDefend.do",
            "pblancNm": "기술보호 현장자문",
            "policyCnts": "중소기업 기술유출, 기술보호 고민을 기술보호전문가가 기업 현장에서 해결해 드립니다.",
            "sportMg": "① 사전진단(최대 3일) : 무료. 현장진단(1), 보안교육(1), 기초자문(1) ② 심화자문(필요시, 최대 7일) : 1~7일, 75% 부분지원",
            "sportCnts": "① 보안전략/보안지침 수립 및 방안 코칭, 보안조직 구성 및 운영, 인적 및 정보화 자산 보안관리 체계 수립 등",
            "sportTrget": "중소기업 및 중견기업",
            "reqstRcept": "기술보호 울타리 홈페이지 신청 (https://www.ultari.go.kr/portal/psi/techDefend.do)",
            "sportInsttNm": "대·중소기업·농어업협력재단",
            "sportInsttCd": "SP18",
            "refrnc": "기술보호 통합 상담·신고센터 : 02-368-8787",
            "updDt": "2022-08-11 13:15:02",
            "pblancBgnDt": "2012-12-20",
            "pblancEndDt": "2022-12-31",
            "pblancAttach": "",
            "reqstLinkInfo": "https://www.ultari.go.kr/portal/pmy/serviceApply.do",
            "bizType": "기술",
            "bizTypeCd": "PC20",
            "sportType": "기술개발",
            "sportTypeCd": "RT02",
            "lifeCyclDvsn": "",
            "lifeCyclDvsnCd": "",
            "areaNm": "",
            "areaCd": "",
            "salsAmt": ""
        }
    ],
    "resultMsg": "정상적으로 조회되었습니다."
}`}
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
       String apiUrl = "https://www.smes.go.kr/fnct/apiReqst/extPblancInfo?token=pTWdMetgNZ4GXiII2Sy5FMsH8nnq9pe%2boM%2bGmjBsudONWad8Qb89e8K456YQ%2fhFW";
       URL url = new URL(apiUrl);
       HttpURLConnection conn = (HttpURLConnection) url.openConnection();
       conn.setRequestMethod("GET");
       conn.setRequestProperty("Content-Type", "application/json");
       int responseCode = conn.getResponseCode();
       BufferedReader rd;

       if (responseCode == 200) {
          rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
       } else {
          rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
       }

       String inputLine;
       StringBuffer response = new StringBuffer();
       while ((inputLine = rd.readLine()) != null) {
          response.append(inputLine);
       }
       rd.close();
       conn.disconnect();
       System.out.println(response.toString());
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