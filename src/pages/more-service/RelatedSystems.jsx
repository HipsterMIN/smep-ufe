import { useEffect, useMemo, useRef, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Tab from '@components/ui/Tab';
import Pagination from '@components/ui/Pagination';
import noImg from '@assets/common/noImg.png';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient } from '@lib/apiClient.js';
import { fetchAndConvertCommonCodes } from '@utils/commonCodeUtils.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';
import { onePassGetAuthCode } from '@utils/keycloakGetAuthCode.js';

const appBaseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

const defaultTabItems = [
  { label: '전체', value: 'ALL' },
  { label: '정책금융1', value: '정책금융' },
  { label: '창업·벤처2', value: '창업·벤처' },
  { label: '기술·R&D', value: '기술·R&D' },
  { label: '판로·수출', value: '판로·수출' },
  { label: '인력·교육', value: '인력·교육' },
  { label: '소상공인', value: '소상공인' },
  { label: '경영정보', value: '경영정보' },
];

const RLVNT_INST_SYS_BIZ_TYPE_GROUP_ID = 'RLVNT_INST_SYS_BIZ_TYPE_CD';

const resolveThumbnailSrc = (item) => {
  const atchFileId = String(item?.rlvntInstThmbAtchFileId ?? item?.rlvnt_inst_thmb_atch_file_id ?? '').trim();
  const atchFileSn = String(item?.atchFileSn ?? '').trim();
  if (!atchFileId || !atchFileSn) return '';

  return `${appBaseUrl}/api/v1/rlvntSys/thumbnails/${encodeURIComponent(atchFileId)}/${encodeURIComponent(atchFileSn)}`;
};

const RelatedSystems = () => {
  const schFormWrapRef = useRef(null);
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [isOpen, setOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabItems, setTabItems] = useState(() => {
    const allTab = defaultTabItems.find((item) => item?.value === 'ALL');
    return allTab ? [allTab] : [{ label: 'ALL', value: 'ALL' }];
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [institutionOptions, setInstitutionOptions] = useState([]);
  const [selectedInstNmList, setSelectedInstNmList] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewType, setViewType] = useState('card'); // card | list

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const activeBizTypeCd = useMemo(
    () => tabItems[activeTabIndex]?.value ?? 'ALL',
    [activeTabIndex, tabItems],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchBizTypeCodes = async () => {
      const allTab = defaultTabItems.find((item) => item?.value === 'ALL') || { label: 'ALL', value: 'ALL' };

      try {
        const commonCodes = await fetchAndConvertCommonCodes([RLVNT_INST_SYS_BIZ_TYPE_GROUP_ID]);
        if (!isMounted) return;

        const bizTypeTabItems = commonCodes[RLVNT_INST_SYS_BIZ_TYPE_GROUP_ID] || [];
        setTabItems([allTab, ...bizTypeTabItems]);
      } catch (error) {
        if (!isMounted) return;
        setTabItems([allTab]);
        console.error('bizType common code load failed:', error);
      }
    };

    fetchBizTypeCodes();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeTabIndex < tabItems.length) return;
    setActiveTabIndex(0);
    setCurrentPage(0);
  }, [activeTabIndex, tabItems.length]);

  useEffect(() => {
    let isMounted = true;

    const fetchInstitutions = async () => {
      try {
        const response = await apiClient.get('/api/v1/rlvntSys/institutions');
        const data = response?.data;
        if (!isMounted) return;
        setInstitutionOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!isMounted) return;
        setInstitutionOptions([]);
        console.error('기관 선택 목록 조회 실패:', error);
      }
    };

    fetchInstitutions();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchList = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);

        const params = new URLSearchParams({
          page: String(currentPage + 1),
          size: String(12),
        });

        if (activeBizTypeCd && activeBizTypeCd !== 'ALL') {
          params.append('bizTypeCd', activeBizTypeCd);
        }
        if (appliedSearchKeyword.trim()) {
          params.append('searchKeyword', appliedSearchKeyword.trim());
        }
        selectedInstNmList.forEach((instNm) => params.append('instNm', instNm));

        const response = await apiClient.get(`/api/v1/rlvntSys/list?${params.toString()}`);
        const data = response?.data || {};

        if (!isMounted) return;
        setList(Array.isArray(data?.content) ? data.content : []);
        setTotalElements(data?.totalElements || 0);
        setTotalPages(data?.totalPages || 0);
      } catch (error) {
        if (!isMounted) return;
        setList([]);
        setTotalElements(0);
        setTotalPages(0);
        console.error('유관기관 시스템 목록 조회 실패:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchList();
    return () => {
      isMounted = false;
    };
  }, [activeBizTypeCd, appliedSearchKeyword, currentPage, selectedInstNmList]);

  const handleToggleFilter = () => {
    const node = schFormWrapRef.current;
    if (node) {
      node.classList.toggle('on');
    }
    setOpen((prev) => !prev);
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    setCurrentPage(0);
  };

  const handleSearch = () => {
    setAppliedSearchKeyword(searchKeyword);
    setCurrentPage(0);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInstitutionChange = (instNm) => {
    setSelectedInstNmList((prev) => {
      const exists = prev.includes(instNm);
      if (exists) {
        return prev.filter((name) => name !== instNm);
      }
      return [...prev, instNm];
    });
    setCurrentPage(0);
  };

  const handleResetInstitutions = () => {
    setSelectedInstNmList([]);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
    window.scrollTo(0, 0);
  };

  const moveToRlvntSystem = (url) => {
    const targetUrl = String(url ?? '').trim();
    if (!targetUrl) return;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents w-full">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">유관기관 둘러보기</h2>
        </div>

        <div className="krds-tab-area layer">
          <p className="guide-txt custom">
            <b
              // onClick={onePassGetAuthCode}
              // role="button"
              // tabIndex={0}
              // onKeyDown={(e) => e.key === 'Enter' && onePassGetAuthCode()}
              // style={{ cursor: 'pointer' }}
            >
                중기통합회원
            </b>
              으로 전환하고, <b>64개의 시스템</b>을 하나의 아이디로 편리하게 이용해 보세요.
          </p>
          <div className="tab-conts-wrap mt-40">
            <section className={`tab-conts ${activeTabIndex >= 0 ? 'active' : ''}`}>
              <h3 className="sr-only">유관기관 시스템 목록</h3>

              <div className="search-top-box mb-40">
                <div className="sch-form-wrap" ref={schFormWrapRef}>
                  <div className="sch-input">
                    <input
                      type="text"
                      className="krds-input medium"
                      placeholder="검색어를 입력하세요"
                      title="검색어 입력"
                      value={searchKeyword}
                      onChange={(event) => setSearchKeyword(event.target.value)}
                      onKeyDown={handleSearchKeyDown}
                    />
                    <button type="button" className="krds-btn medium icon ico-search" onClick={handleSearch}>
                      <span className="sr-only">검색</span>
                      <i className="svg-icon ico-sch"></i>
                    </button>
                  </div>

                  <button type="button" className={`krds-btn medium text ${isOpen ? 'on' : ''}`}
                    onClick={handleToggleFilter}>
                    기관선택
                    <i className={`svg-icon ico-angle ${isOpen ? 'up' : ''}`}/>
                    <span className="onfilter-open sr-only">열기</span>
                    <span className="onfilter-close sr-only">닫기</span>
                  </button>
                </div>

                <div className="sch-filter-box">
                  <div className="filter-form">
                    <div className="on-mw100p gap24">
                      <label className="label">기관별</label>
                      <div className="krds-check-area">
                        {institutionOptions.map((option, index) => {
                          const instNm = String(option?.name ?? option?.code ?? '').trim();
                          const inputId = `inst-check-${index}`;
                          if (!instNm) return null;

                          return (
                            <div className="krds-form-chip small" key={inputId}>
                              <input
                                type="checkbox"
                                className="checkbox"
                                id={inputId}
                                checked={selectedInstNmList.includes(instNm)}
                                onChange={() => handleInstitutionChange(instNm)}
                              />
                              <label className="krds-form-chip-outline" htmlFor={inputId}>{instNm}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {selectedInstNmList.length > 0 && (
                    <dl className="filter-chip">
                      <dt>
                          선택된 필터 <span className="num">{selectedInstNmList.length}</span>
                      </dt>
                      <dd>
                        <button type="button" className="krds-btn xlarge icon border"
                          onClick={handleResetInstitutions}>
                          <span className="sr-only">필터 초기화</span>
                          <i className="svg-icon ico-refresh"></i>
                        </button>
                        <div className="chip-wrap krds-tag-wrap large">
                          {selectedInstNmList.map((instNm) => (
                            <span className="krds-btn-tag" key={instNm}>
                              {instNm}
                              <button type="button" className="btn-delete"
                                onClick={() => handleInstitutionChange(instNm)}>
                                <span className="sr-only">삭제</span>
                              </button>
                            </span>
                          ))}
                        </div>
                      </dd>
                    </dl>
                  )}
                </div>
              </div>

              <Tab tabData={tabItems.map((item) => item.label)} onTabChange={handleTabChange}/>

              <div className="search-list-top mt-40">
                <ul className="sch-info" aria-live="polite">
                  <li>
                    검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>개
                  </li>
                </ul>
                <ul className="sch-sort">
                  <li>
                    <strong className="sort-label"><span>조회방식</span></strong>
                    <div className="w-sort-btn">
                      <button
                        type="button"
                        className={`view-btn ${viewType === 'card' ? 'active' : ''}`}
                        onClick={() => setViewType('card')}
                      >
                        카드형
                      </button>
                      <button
                        type="button"
                        className={`view-btn ${viewType === 'list' ? 'active' : ''}`}
                        onClick={() => setViewType('list')}
                      >
                        목록형
                      </button>
                    </div>
                  </li>
                </ul>
              </div>

              {viewType === 'card' ? (
                <ul className="krds-structured-list relate mt-40">
                  {loading ? (
                    <li className="structured-item">
                      <div className="card-body">
                        <p className="no-icon c-bold-tit">
                          <span className="onellipsis-1">로딩 중입니다.</span>
                        </p>
                      </div>
                    </li>
                  ) : list.length === 0 ? (
                    <li className="structured-item">
                      <div className="card-body">
                        <p className="no-icon c-bold-tit">
                          <span className="onellipsis-1">조회된 유관기관 시스템이 없습니다.</span>
                        </p>
                      </div>
                    </li>
                  ) : (
                    list.map((item, index) => {
                      const thumbnailSrc = resolveThumbnailSrc(item);
                      return (
                        <li className="structured-item"
                          key={item?.rlvntInstSysMngSn ?? `${item?.rlvntInstSysNm ?? 'system'}-${index}`}>
                          <div className="card-top">
                            <div className="corp-imgs">
                              <img
                                src={thumbnailSrc || noImg}
                                alt={item?.rlvntInstSysNm || '유관기관 로고'}
                                onError={(event) => {
                                  if (event.currentTarget.src !== noImg) {
                                    event.currentTarget.src = noImg;
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div className="card-body">
                            <p className="no-icon c-sub-tit">
                              <span className="onellipsis-1">{item?.rlvntInstInstNm || '-'}</span>
                            </p>
                            <p className="no-icon c-bold-tit">
                              <span className="onellipsis-2">{item?.rlvntInstSysNm || '-'}</span>
                            </p>
                            <p className="no-icon c-normal-tit mb-20">
                              <span className="onellipsis-2">{item?.rlvntInstSysExplnCn || '-'}</span>
                            </p>
                            <button type="button" className="krds-btn small tertiary go-btn"
                              onClick={() => moveToRlvntSystem(item?.rlvntInstUrlAddr)}>
                                    바로가기<i className="svg-icon ico-angle right"/>
                            </button>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              ) : (
                <div className="krds-table-wrap mt-40">
                  {loading ? (
                    <p className="no-icon c-bold-tit">로딩 중입니다.</p>
                  ) : list.length === 0 ? (
                    <p className="no-icon c-bold-tit">조회된 유관기관 시스템이 없습니다.</p>
                  ) : (
                    <table className="tbl col data">
                      <caption>
                            유관기관 목록 번호, 유관시스템명, 유관기관, 시스템 업무 정보가 제공됩니다.
                      </caption>
                      <colgroup>
                        <col style={{ width: '8%' }}/>
                        <col style={{ width: '28%' }}/>
                        <col style={{ width: '24%' }}/>
                        <col/>
                      </colgroup>
                      <thead>
                        <tr>
                          <th scope="col" className="ac">번호</th>
                          <th scope="col" className="ac">유관시스템명</th>
                          <th scope="col" className="ac">유관기관</th>
                          <th scope="col" className="ac">시스템 업무</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((item, index) => (
                          <tr key={item?.rlvntInstSysMngSn ?? `${item?.rlvntInstSysNm ?? 'system'}-${index}`}>
                            <td className="ac">{totalElements - currentPage * 12 - index}</td>
                            <td>
                              <button
                                type="button"
                                className="krds-btn small text"
                                onClick={() => moveToRlvntSystem(item?.rlvntInstUrlAddr)}
                              >
                                {item?.rlvntInstSysNm || '-'}
                              </button>
                            </td>
                            <td>{item?.rlvntInstInstNm || '-'}</td>
                            <td>{item?.rlvntInstSysExplnCn || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {!loading && totalPages > 0 && (
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage + 1}
                  onPageChange={handlePageChange}
                  syncUrl
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default RelatedSystems;