import React, { useState, useEffect } from 'react';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Pagination from '@components/ui/Pagination.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import Datepicker from '@components/ui/Datepicker.jsx';
 
const UI_USR_L_510 = () => {
  const [issuanceList, setIssuanceList] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  // 날짜시간 포맷팅
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    return dateTimeStr.replace('T', ' ').split('.')[0];
  };

  // 날짜 포맷팅
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return '-';
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  };

  const formatBrno = (brno) => {
    if (!brno) return '';
    return brno
      .replace(/[^0-9]/g, '')
      .replace(/^(\d{0,3})(\d{0,2})(\d{0,5})$/g, '$1-$2-$3')
      .replace(/(-{1,2})$/g, '');
  };

  // 24시간 경과 체크 함수
  const isExpired = (aplyDt) => {
    if (!aplyDt) return true;
    const applyTime = new Date(aplyDt).getTime();
    const now = new Date().getTime();
    const diff = now - applyTime;
    const hours24 = 24 * 60 * 60 * 1000; // 24시간(밀리초)
    return diff > hours24;
  };

  // 증명서 발급 이력 조회
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage + 1,
          size: 10,
        });

        const response = await apiClient.get(
          `/api/v1/certificate/issuances?${params.toString()}`,
        );

        const data = response.data;

        setIssuanceList(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  // ✅ 사이드바 데이터 계산
  const sidebarData = getSideNavigationData();  // currentMenu 기준으로 자동 계산
  const depth1Menu = getDepth1Parent();         // depth1 부모 찾기

  // 조회기간 Datepicker start
  const [startDate, setStartDate] = useState(null);

  // 조회기간 Datepicker end
  const [endDate, setEndDate] = useState(null);

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems}/>
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">증명서 발급 조회</h2>
        </div>
        <div className="txt-box">
          <p className="outline-txt">
            증명(확인)서는 발급완료 후 하루 동안 출력할 수 있으며, 익일 이후에는 다시 발급신청을 하셔야 출력 가능합니다.<br/>
            (발급이후 변경 승인된 경우 발급으로부터 24시간 동안은 변경 이전 내용으로 동일하게 발급되며 24시간 이후 변경된 내용으로 발급 가능합니다.)<br/>
            모바일에서는 PDF파일 다운로드 방식만 지원되므로, 인쇄를 원하실 경우 PC로 접속하여 증명서 출력을 진행해 주시기 바랍니다.<br/><br/>
            발급된 전자증명서는 정부전자문서지갑에서 확인이 가능합니다.<br/>
            · 개인사업자회원: 전자증명서를 발급한 담당자의 개인 정부전자문서지갑에서 확인<br/>
            · 법인사업자회원: 법인사업자용 정부전자문서지갑(<a className="on-linktxt2" href="https://dpaper.kr/" target="_blank"
              title="새 창 열림">dpaper.kr</a>)에서 확인
          </p>
        </div>
        <div className="search-top-box no-details mt-40">
          <div className="form-row-box gap-12">

            <div className="datepicker-group">
              <Datepicker
                menuName="조회기간"
                id="datepicker_01"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
              <span>~</span>
              <Datepicker
                id="datepicker_02"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
              />
            </div>

            <button type="button" className="krds-btn primary medium">검색</button>
          </div>
        </div>


        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">{totalElements}</span>개</li>
          </ul>
          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label htmlFor="sort1">출력</label></strong>
              <div>
                <select className="krds-form-select-sort" id="sort1">
                  <option>전체</option>
                </select>
              </div>
            </li>
            <li>
              <strong className="sort-label"><label htmlFor="sort2">정렬기준</label></strong>
              <div className="w-sort-btn">
                <button type="button" className="active">등록일순<span className="sr-only">선택됨</span>
                </button>
                <button type="button">마감일순</button>
              </div>
              <div className="m-sort-btn">
                <select className="krds-form-select-sort" id="sort2">
                  <option>등록일순</option>
                  <option>마감일수</option>
                </select>
              </div>
            </li>
          </ul>
        </div>

        {/* table component start */}
        <div className="krds-table-wrap">
          <table className="tbl col data">
            <caption>증명서 발급 조회 표. 순번, 증명(확인)서, 사업자등록번호, 신청일자, 유효기간, 상태, 출력언어, 발급 정보가 제공됨.</caption>
            <colgroup>
              <col style={{ width: '5%' }}/>
              <col/>
              <col style={{ width: '150px' }}/>
              <col/>
              <col/>
              <col style={{ width: '100px' }}/>
              <col style={{ width: '130px' }}/>
              <col/>
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="ac">순번</th>
                <th scope="col" className="ac">증명(확인)서</th>
                <th scope="col" className="ac">사업자등록번호</th>
                <th scope="col" className="ac">신청일자</th>
                <th scope="col" className="ac">유효기간</th>
                <th scope="col" className="ac">상태</th>
                <th scope="col" className="ac">출력언어</th>
                <th scope="col" className="ac">발급</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="ac">로딩 중...</td>
                </tr>
              ) : issuanceList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="ac">발급 이력이 없습니다.</td>
                </tr>
              ) : (
                issuanceList.map((item, index) => (
                  <tr key={item.prdocIssuAplyNo}>
                    <th scope="row" className="ac">
                      <span>{totalElements - (currentPage * 20 + index)}</span>
                    </th>
                    <td>
                      <span>{item.prdocTtl}</span>
                    </td>
                    <td className="ac"><span>{formatBrno(item.brno)}</span></td>
                    <td className="ac"><span>{formatDateTime(item.aplyDt)}</span></td>
                    <td className="ac"><span>{formatDate(item.vldEndYmd)}</span></td>
                    <td className="ac"><span>{item.prdocIssuPrgrsStNm}</span></td>
                    <td className="ac">
                      <select className="krds-form-select small" disabled>
                        <option value="">한국어</option>
                      </select>
                    </td>
                    <td className="ac">
                      {/*{isExpired(item.aplyDt) ? (*/}
                      {/*  <button type="button" className="krds-btn small" disabled>출력</button>*/}
                      {/*) : (*/}
                      <button
                        type="button"
                        className="krds-btn small"
                        onClick={() => window.open('https://www.smes.go.kr/ClipReport4/commonTibero.jsp?fileName=AA_SME&CRTF_REQST_SNO=20260113620149', '_blank')}
                      >
                            출력
                      </button>
                      {/*)}*/}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage + 1}
            onPageChange={handlePageChange}
          />
        </div>
        {/* table component end */}
      </div>
    </>
  );
};

export default UI_USR_L_510;
