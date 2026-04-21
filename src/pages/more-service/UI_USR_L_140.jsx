import React, { useState, useRef, useCallback, useEffect } from 'react';
import SideNavigation from '@components/ui/SideNavigation.jsx';
import Breadcrumb from '@components/ui/Breadcrumb.jsx';
import Tab from '@components/ui/Tab.jsx';
import Pagination from '@components/ui/Pagination.jsx';
import Popup from '@components/ui/Popup.jsx';
import http from '@lib/http.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { useSearchParams } from 'react-router-dom';

const TAB_CLSF_CD = {
  0: 'SC01',
  1: 'SC02',
  2: 'SC04',
};

const TAB_COL_COUNT = { 0: 4, 1: 3, 2: 4 };

const UI_USR_L_140 = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const tabData = useRef(['소재부품장비 전문기업', '뿌리기술기업', '전문연구사업자']);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(
    () => Math.min(2, Math.max(0, Number(searchParams.get('tab') ?? 0))),
  );
  const [list, setList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    () => Math.max(0, Number(searchParams.get('page') ?? 1) - 1),
  );
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pageSize, setPageSize] = useState(20);

  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);

  const [sdoCd, setSdoCd] = useState('');
  const [sigunguCd, setSigunguCd] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [appliedSdoCd, setAppliedSdoCd] = useState('');
  const [appliedSigunguCd, setAppliedSigunguCd] = useState('');
  const [appliedSearchType, setAppliedSearchType] = useState('all');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  useEffect(() => {
    const fetchSidoList = async () => {
      try {
        const response = await http.get('/api/v1/stdg/sido');
        setSidoList(response.data.data ?? []);
      } catch (error) {
        console.error('시도 목록 조회 실패:', error);
      }
    };
    fetchSidoList();
  }, []);

  useEffect(() => {
    if (!sdoCd) {
      setSigunguList([]);
      setSigunguCd('');
      return;
    }
    const fetchSigunguList = async () => {
      try {
        const response = await http.get('/api/v1/stdg/sigungu', { params: { sidoCd: sdoCd } });
        setSigunguList(response.data.data ?? []);
        setSigunguCd('');
      } catch (error) {
        console.error('시군구 목록 조회 실패:', error);
      }
    };
    fetchSigunguList();
  }, [sdoCd]);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await http.get('/api/v1/bizm/cstm-spcltyent/list', {
        params: {
          cstmTelgmEntClsfCd: TAB_CLSF_CD[activeTabIndex],
          sdoCd: appliedSdoCd,
          sigunguCd: appliedSigunguCd,
          searchType: appliedSearchType,
          searchKeyword: appliedSearchKeyword,
          page: currentPage + 1,
        },
      });
      const res = response.data.data;
      setList(res.content ?? []);
      setTotalCount(res.totalElements ?? 0);
      setTotalPages(res.totalPages ?? 0);
      setPageSize(res.size ?? 20);
    } catch (error) {
      console.error('목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTabIndex, appliedSdoCd, appliedSigunguCd, appliedSearchType, appliedSearchKeyword, currentPage]);

  useEffect(() => {
    fetchList();
  }, [activeTabIndex, appliedSdoCd, appliedSigunguCd, appliedSearchType, appliedSearchKeyword, currentPage]);

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    setSdoCd('');
    setSigunguCd('');
    setSigunguList([]);
    setSearchType('all');
    setSearchKeyword('');
    setAppliedSdoCd('');
    setAppliedSigunguCd('');
    setAppliedSearchType('all');
    setAppliedSearchKeyword('');
    setCurrentPage(0);
    setList([]);
    setTotalCount(0);
    setTotalPages(0);

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', String(index));
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  const handleSdoCdChange = (e) => {
    setSdoCd(e.target.value);
    setSigunguCd('');
  };

  const handleSearch = () => {
    setAppliedSdoCd(sdoCd);
    setAppliedSigunguCd(sigunguCd);
    setAppliedSearchType(searchType);
    setAppliedSearchKeyword(searchKeyword);
    setCurrentPage(0);

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (page <= 1) {
          next.delete('page');
        } else {
          next.set('page', String(page));
        }
        return next;
      },
      { replace: true },
    );
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const formatDate = (ymd) => {
    if (!ymd || ymd.length !== 8) return '-';
    return `${ymd.substring(0, 4)}-${ymd.substring(4, 6)}-${ymd.substring(6, 8)}`;
  };

  const isSigunguDisabled = !sdoCd;

  const captionMap = {
    0: '번호, 기업명, 업종명, 만료일자 정보가 제공됨.',
    1: '번호, 기업명, 핵심기술 정보가 제공됨.',
    2: '번호, 기업명, 홈페이지, 위치 정보가 제공됨.',
  };

  const renderThead = () => {
    if (activeTabIndex === 0) {
      return (
        <>
          <colgroup>
            <col style={{ width: '70px' }} />
            <col style={{ width: '200px' }} />
            <col />
            <col style={{ width: '160px' }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="ac">번호</th>
              <th scope="col" className="ac">기업명</th>
              <th scope="col" className="ac">업종명</th>
              <th scope="col" className="ac">만료일자</th>
            </tr>
          </thead>
        </>
      );
    }
    if (activeTabIndex === 1) {
      return (
        <>
          <colgroup>
            <col style={{ width: '70px' }} />
            <col style={{ width: '200px' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="ac">번호</th>
              <th scope="col" className="ac">기업명</th>
              <th scope="col" className="ac">핵심기술</th>
            </tr>
          </thead>
        </>
      );
    }
    return (
      <>
        <colgroup>
          <col style={{ width: '70px' }} />
          <col />
          <col style={{ width: '120px' }} />
          <col style={{ width: '100px' }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="ac">번호</th>
            <th scope="col" className="ac">기업명</th>
            <th scope="col" className="ac">홈페이지</th>
            <th scope="col" className="ac">위치</th>
          </tr>
        </thead>
      </>
    );
  };

  const renderRows = () => {
    const colCount = TAB_COL_COUNT[activeTabIndex];

    if (loading) {
      return <tr><td colSpan={colCount} className="ac">로딩 중...</td></tr>;
    }
    if (list.length === 0) {
      return <tr><td colSpan={colCount} className="ac">조회된 데이터가 없습니다.</td></tr>;
    }

    return list.map((item, index) => {
      const no = totalCount - (currentPage * pageSize) - index;
      const noCell = (
        <th scope="row" className="ac">
          <span>{no}</span>
        </th>
      );
      const entNmCell = (
        <td>
          <button
            type="button"
            className="onellipsis-1 on-colorblue2"
            onClick={() => handleRowClick(item)}
          >
            {item.entNm}
          </button>
        </td>
      );

      if (activeTabIndex === 0) {
        return (
          <tr key={item.cstmTelgmEntEntCd}>
            {noCell}
            {entNmCell}
            <td><span>{item.cstmTelgmEntFldNm || '-'}</span></td>
            <td className="ac"><span>{formatDate(item.expryYmd)}</span></td>
          </tr>
        );
      }
      if (activeTabIndex === 1) {
        return (
          <tr key={item.cstmTelgmEntEntCd}>
            {noCell}
            {entNmCell}
            <td><span>{item.fdtnlTechNm || '-'}</span></td>
          </tr>
        );
      }
      return (
        <tr key={item.cstmTelgmEntEntCd}>
          {noCell}
          {entNmCell}
          <td className="ac">
            {item.urlAddr ? (
              <button
                type="button"
                className="krds-btn tertiary small"
                onClick={() => {
                  const url = item.urlAddr.startsWith('http://') || item.urlAddr.startsWith('https://')
                    ? item.urlAddr
                    : `https://${item.urlAddr}`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                title="새 창 열림"
              >
                    바로가기 <i className="svg-icon ico-angle right"></i>
              </button>
            ) : '-'}
          </td>
          <td className="ac">
            {item.bplcBscAddr ? (
              <button
                type="button"
                className="krds-btn tertiary small"
                aria-label="지도보기"
                onClick={() => {
                  const query = encodeURIComponent(item.bplcBscAddr);
                  window.open(`https://map.naver.com/v5/search/${query}`, '_blank', 'noopener,noreferrer');
                }}
              >
                <i className="svg-icon ico-location"></i>
              </button>
            ) : '-'}
          </td>
        </tr>
      );
    });
  };

  const renderTable = () => (
    <>
      <div className="search-top-box mt-40">
        <div className="sch-form-wrap">
          <select className="krds-form-select" value={sdoCd} onChange={handleSdoCdChange}>
            <option value="">전국</option>
            {sidoList.map((item) => (
              <option key={item.code} value={item.code}>{item.name}</option>
            ))}
          </select>

          <select
            className="krds-form-select"
            value={sigunguCd}
            onChange={(e) => setSigunguCd(e.target.value)}
            disabled={isSigunguDisabled}
          >
            <option value="">시군구선택</option>
            {sigunguList.map((item) => (
              <option key={item.code} value={item.code}>{item.name}</option>
            ))}
          </select>

          <select
            className="krds-form-select"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="entNm">기업명</option>
            <option value="cstmTelgmEntFldNm">업종명</option>
          </select>

          <div className="sch-input w-322">
            <input
              type="text"
              className="krds-input"
              placeholder="검색어를 입력해주세요."
              title="검색어 입력"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button type="button" className="krds-btn medium icon ico-search" onClick={handleSearch}>
              <span className="sr-only">검색</span>
              <i className="svg-icon ico-sch"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="search-list-top">
        <ul className="sch-info" aria-live="polite">
          <li>검색 결과 <span className="point">{formatNumberWithCommas(totalCount || 0)}</span>개</li>
        </ul>
      </div>

      <div className="krds-table-wrap">
        <table className="tbl col data t-block">
          <caption>
            {tabData.current[activeTabIndex]} 표. {captionMap[activeTabIndex]}
          </caption>
          {renderThead()}
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      <Pagination
        key={activeTabIndex}
        totalPages={totalPages}
        currentPage={currentPage + 1}
        onPageChange={handlePageChange}
      />
    </>
  );

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">소재부품장비·뿌리기술·전문연구사업자 조회</h2>
        </div>

        <div className="krds-tab-area layer">
          <Tab
            tabData={tabData.current}
            onTabChange={handleTabChange}
            activeIndex={activeTabIndex}
          />

          <div className="tab-conts-wrap">
            <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
              <h3 className="sr-only">소재부품장비 전문기업</h3>
              <div className="txt-box outline">
                <h4 className="outline-tit">소재부품장비 전문기업</h4>
                <ul className="check-list">
                  <li>전문기업 확인 제도란? : 소재부품장비산업 기술경쟁력 제고를 위해 소재 부품 또는 장비 개발, 제조를 주된 사업으로 영위하는 기업을 전문기업으로 추천 확인하는 제도</li>
                  <li>신청방법 : 소부장넷(<a className="on-linktxt2" href="https://www.sobujang.net/index.do#S22010" target="_blank" title="새 창 열림">https://www.sobujang.net/index.do#S22010</a>)에서 온라인 신청</li>
                </ul>
              </div>
              {activeTabIndex === 0 && renderTable()}
            </section>

            <section className={`tab-conts ${activeTabIndex === 1 ? 'active' : ''}`}>
              <h3 className="sr-only">뿌리기술기업</h3>
              <div className="txt-box outline">
                <h4 className="outline-tit">뿌리기술기업</h4>
                <ul className="check-list">
                  <li>뿌리기술이란? : 주조(鑄造), 금형(金型), 소성가공(塑性加工), 용접(鎔接), 표면처리(表面處理), 열처리(熱處理) 등 제조업 전반에 걸쳐 활용되는 기반 공정기술과 사출(射出)ㆍ프레스, 정밀가공(精密加工), 로봇, 센서 등 제조업의 미래 성장 발전에 핵심적인 차세대 공정기술로서 대통령령으로 정하는 기술</li>
                  <li>뿌리기술 전문기업이란? :<br />
                      1. 뿌리산업의 범위(*)에 해당하는 기업<br />
                      2. 핵심 뿌리기술을 보유한 기업<br />
                      3. 총 매출액 중 뿌리기술을 이용한 제품의 매출액이 100분의 50 이상<br />
                      4. 상호출자제한기업에 속하지 아니하는 기업
                  </li>
                  <li>신청방법 : 국가뿌리산업진흥센터(<a className="on-linktxt2" href="https://apply.kpic.re.kr/html/?pmode=guide" target="_blank" title="새 창 열림">https://apply.kpic.re.kr/html/?pmode=guide</a>)에서 온라인 신청</li>
                </ul>
              </div>
              {activeTabIndex === 1 && renderTable()}
            </section>

            <section className={`tab-conts ${activeTabIndex === 2 ? 'active' : ''}`}>
              <h3 className="sr-only">전문연구사업자</h3>
              <div className="txt-box outline">
                <h4 className="outline-tit">전문연구사업자</h4>
                <ul className="check-list">
                  <li>연구개발, 제작, 디자인 등의 기술전문 서비스 분야를 보유하고 있는 전문 기업</li>
                  <li>전문연구사업자 : 한국연구산업협회(<a className="on-linktxt2" href="https://www.rndia.or.kr/regSys/preCheck.do" target="_blank" title="새 창 열림">https://www.rndia.or.kr/regSys/preCheck.do</a>)에서 온라인 신청 및 조회</li>
                </ul>
              </div>
              {activeTabIndex === 2 && renderTable()}
            </section>
          </div>
        </div>

        <Popup
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={selectedItem?.entNm || ''}
          noBottomBtn={true}
        >
          {selectedItem && (
            <div className="detail-list-wrap type2">
              <div className="on-detail-list">
                {activeTabIndex === 0 && (
                  <>
                    <dl>
                      <dt className="w-100">업체명</dt>
                      <dd><p>{selectedItem.entNm || '-'}</p></dd>
                      <dt className="w-100">홈페이지</dt>
                      <dd>
                        {selectedItem.urlAddr ? (
                          <a
                            className="on-linktxt2"
                            href={selectedItem.urlAddr.startsWith('http') ? selectedItem.urlAddr : `https://${selectedItem.urlAddr}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="새 창 열림"
                          >
                            {selectedItem.urlAddr}
                          </a>
                        ) : '-'}
                      </dd>
                    </dl>
                    <dl>
                      <dt className="w-100">신고업종</dt>
                      <dd><p>{selectedItem.cstmTelgmEntFldNm || '-'}</p></dd>
                      <dt className="w-100">대표자명</dt>
                      <dd><p>{selectedItem.rprsvNm || '-'}</p></dd>
                    </dl>
                    <dl>
                      <dt className="w-100">만료일자</dt>
                      <dd><p>{formatDate(selectedItem.expryYmd)}</p></dd>
                      <dt className="w-100">발급일자</dt>
                      <dd><p>{formatDate(selectedItem.issuYmd)}</p></dd>
                    </dl>
                    <dl>
                      <dt className="w-100">주소</dt>
                      <dd><p>{selectedItem.bplcBscAddr || '-'}</p></dd>
                    </dl>
                  </>
                )}
                {activeTabIndex === 1 && (
                  <>
                    <dl>
                      <dt className="w-100">업체명</dt>
                      <dd><p>{selectedItem.entNm || '-'}</p></dd>
                      <dt className="w-100">홈페이지</dt>
                      <dd>
                        {selectedItem.urlAddr ? (
                          <a
                            className="on-linktxt2"
                            href={selectedItem.urlAddr.startsWith('http') ? selectedItem.urlAddr : `https://${selectedItem.urlAddr}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="새 창 열림"
                          >
                            {selectedItem.urlAddr}
                          </a>
                        ) : '-'}
                      </dd>
                    </dl>
                    <dl>
                      <dt className="w-100">신고업종</dt>
                      <dd><p>{selectedItem.cstmTelgmEntFldNm || '-'}</p></dd>
                      <dt className="w-100">대표자명</dt>
                      <dd><p>{selectedItem.rprsvNm || '-'}</p></dd>
                    </dl>
                    <dl>
                      <dt className="w-100">핵심기술</dt>
                      <dd><p>{selectedItem.fdtnlTechNm || '-'}</p></dd>
                    </dl>
                  </>
                )}
                {activeTabIndex === 2 && (
                  <>
                    <dl>
                      <dt className="w-100">업체명</dt>
                      <dd><p>{selectedItem.entNm || '-'}</p></dd>
                      <dt className="w-100">홈페이지</dt>
                      <dd>
                        {selectedItem.urlAddr ? (
                          <a
                            className="on-linktxt2"
                            href={selectedItem.urlAddr.startsWith('http') ? selectedItem.urlAddr : `https://${selectedItem.urlAddr}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="새 창 열림"
                          >
                            {selectedItem.urlAddr}
                          </a>
                        ) : '-'}
                      </dd>
                    </dl>
                    <dl>
                      <dt className="w-100">신고업종</dt>
                      <dd><p>{selectedItem.cstmTelgmEntFldNm || '-'}</p></dd>
                      <dt className="w-100">지역</dt>
                      <dd><p>{selectedItem.bplcRgnNm || '-'}</p></dd>
                    </dl>
                    <dl>
                      <dt className="w-100">연락처</dt>
                      <dd><p>{selectedItem.entTelno || '-'}</p></dd>
                    </dl>
                    <dl>
                      <dt className="w-100">주소</dt>
                      <dd><p>{selectedItem.bplcBscAddr || '-'}</p></dd>
                    </dl>
                  </>
                )}
              </div>
            </div>
          )}
        </Popup>
      </div>
    </>
  );
};

export default UI_USR_L_140;
