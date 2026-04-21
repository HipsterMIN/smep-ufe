import React, { useState, useEffect } from 'react';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Pagination from '@components/ui/Pagination.jsx';
import Popup from '@components/ui/Popup.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';

// ─── 유틸 함수 ────────────────────────────────────────────────
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-';
  return dateTimeStr.replace('T', ' ').split('.')[0];
};

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

const isExpired = (aplyDt) => {
  if (!aplyDt) return true;
  const applyTime = new Date(aplyDt).getTime();
  const now = new Date().getTime();
  return (now - applyTime) > 24 * 60 * 60 * 1000;
};

// prdocCd 별 출력언어 옵션
const getLanguageOptions = (prdocCd) => {
  // if (prdocCd === 'Y104' || prdocCd === 'Y105') {
  //   return [
  //     { value: '',    label: '한국어' },
  //     { value: '_CN', label: '중국어' },
  //     { value: '_EN', label: '영어'   },
  //   ];
  // }
  // if (prdocCd === 'Y120') {
  //   return [
  //     { value: '',    label: '한국어' },
  //     { value: '_EN', label: '영어'   },
  //   ];
  // }
  return [{ value: '', label: '한국어' }];
};

// ─── 행 컴포넌트 ──────────────────────────────────────────────
const IssuanceTableRow = ({ item, totalElements, currentPage, pageSize, index, onRowClick }) => {
  const [selectedSuffix, setSelectedSuffix] = useState('');

  const langOptions = getLanguageOptions(item.prdocCd);
  const isMultiLang = langOptions.length > 1;
  const effectivePrdocCd = item.prdocCd + selectedSuffix;
  const expired = isExpired(item.aplyDt);
  const isDpaper = item.prdocIssuTypeCd === 'Y302';

  return (
    <tr>
      <th scope="row" className="ac">
        <span>{totalElements - (currentPage * pageSize + index)}</span>
      </th>
      <td>
        <button
          type="button"
          className="on-linktxt"
          onClick={() => onRowClick(item)}
        >
          {item.prdocTtl}
        </button>
      </td>
      <td className="ac"><span>{formatBrno(item.brno)}</span></td>
      <td className="ac"><span>{formatDateTime(item.aplyDt)}</span></td>
      <td className="ac"><span>{formatDate(item.vldEndYmd)}</span></td>
      <td className="ac"><span>{item.prdocIssuPrgrsStNm}</span></td>
      <td className="ac">
        <select
          className="krds-form-select small"
          disabled={!isMultiLang || expired || isDpaper}
          value={selectedSuffix}
          onChange={(e) => setSelectedSuffix(e.target.value)}
        >
          {langOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </td>
      <td className="ac">
        {isDpaper ? (
          <span>정부전자문서지갑</span>
        ) : expired ? (
          <button type="button" className="krds-btn small" disabled>출력</button>
        ) : (
          <button
            type="button"
            className="krds-btn small"
            onClick={() =>
              window.open(
                `http://e-page.smes-tipa.go.kr/markany/report?prdocCd=${effectivePrdocCd}&prdocIssuAplyNo=${item.prdocIssuAplyNo}`,
                '_blank',
              )
            }
          >
                출력
          </button>
        )}
      </td>
    </tr>
  );
};

// ─── 메인 컴포넌트 ────────────────────────────────────────────
const UI_USR_L_510 = () => {
  const [issuanceList, setIssuanceList] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // 상세 팝업
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage + 1,
          size: pageSize,
        });

        const response = await apiClient.get(
          `/api/v1/certificate/issuances?${params.toString()}`,
        );

        const data = response.data;

        setIssuanceList(data.content ?? []);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsDetailPopupOpen(true);
  };

  const handleDetailClose = () => {
    setIsDetailPopupOpen(false);
    setSelectedItem(null);
  };

  const selectedExpired = selectedItem ? isExpired(selectedItem.aplyDt) : true;
  const selectedIsDpaper = selectedItem?.prdocIssuTypeCd === 'Y302';

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

        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>검색 결과 <span className="point">{totalElements}</span>개</li>
          </ul>
          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label htmlFor="sort1">목록 표시 개수</label></strong>
              <div>
                <select
                  className="krds-form-select-sort"
                  id="sort1"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  <option value={10}>10개</option>
                  <option value={20}>20개</option>
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
              <col style={{ width: '150px' }}/>
              <col style={{ width: '90px' }}/>
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
                  <IssuanceTableRow
                    key={item.prdocIssuAplyNo}
                    item={item}
                    totalElements={totalElements}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    index={index}
                    onRowClick={handleRowClick}
                  />
                ))
              )}
            </tbody>
          </table>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage + 1}
            onPageChange={handlePageChange}
            syncUrl
          />
        </div>
        {/* table component end */}
      </div>

      {/* 증명서 발급이력 상세 팝업 */}
      {selectedItem && (
        <Popup
          isOpen={isDetailPopupOpen}
          onClose={handleDetailClose}
          title="증명서 발급이력"
          footer={
            <>
              <button
                type="button"
                className="krds-btn tertiary medium"
                onClick={handleDetailClose}
              >
                      닫기
              </button>
              {!selectedIsDpaper && (
                <button
                  type="button"
                  className="krds-btn primary medium"
                  disabled={selectedExpired}
                  onClick={() =>
                    window.open(
                      `http://e-page.smes-tipa.go.kr/markany/report?prdocCd=${selectedItem.prdocCd}&prdocIssuAplyNo=${selectedItem.prdocIssuAplyNo}`,
                      '_blank',
                    )
                  }
                >
                          출력
                </button>
              )}
            </>
          }
        >
          <div>
            {/* 발급 대상 기업 */}
            <div className="conts-wrap">
              <h2 className="sec-tit">발급 대상 기업</h2>
              <div className="krds-table-wrap">
                <table className="tbl col data tbl-row">
                  <caption>발급 대상 기업 표. 사업자등록번호, 기업명, 대표자명 정보가 제공됨.</caption>
                  <colgroup>
                    <col style={{ width: '26%' }}/>
                    <col/>
                  </colgroup>
                  <tbody>
                    <tr>
                      <th scope="row" className="ac">사업자등록번호</th>
                      <td>{formatBrno(selectedItem.brno)}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="ac">기업명</th>
                      <td>{selectedItem.mbrNm || '-'}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="ac">대표자명</th>
                      <td>{selectedItem.rprsvNm || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 증명서 발급 정보 */}
            <div className="conts-wrap">
              <h2 className="sec-tit">증명서 발급 정보</h2>
              <div className="krds-table-wrap">
                <table className="tbl col data tbl-row">
                  <caption>증명서 발급 정보 표. 신청번호, 증명(확인)서명, 신청일시, 상태, 유효기간, 출력여부 정보가 제공됨.</caption>
                  <colgroup>
                    <col style={{ width: '26%' }}/>
                    <col/>
                  </colgroup>
                  <tbody>
                    <tr>
                      <th scope="row" className="ac">신청번호</th>
                      <td>{selectedItem.prdocIssuAplyNo}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="ac">증명(확인)서명</th>
                      <td>{selectedItem.prdocTtl}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="ac">신청일시</th>
                      <td>{formatDateTime(selectedItem.aplyDt)}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="ac">상태</th>
                      <td>{selectedItem.prdocIssuPrgrsStNm}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="ac">유효기간</th>
                      <td>{formatDate(selectedItem.vldEndYmd)}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="ac">출력여부</th>
                      <td>
                        {selectedIsDpaper
                          ? '정부전자문서지갑'
                          : selectedExpired
                            ? '출력완료 (출력 가능 기간 경과)'
                            : '출력 가능'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
};

export default UI_USR_L_510;