import { useEffect, useMemo, useRef, useState } from 'react';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import Datepicker from '@components/ui/Datepicker';
import Pagination from '@components/ui/Pagination';
import { api as apiClient } from '@lib/apiClient.js';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { fetchAndConvertCommonCodes } from '@utils/commonCodeUtils.js';
import { formatNumberWithCommas } from '@utils/numberUtils.js';

const STATUS_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'IN_PROGRESS', label: '신청중' },
  { value: 'COMPLETED', label: '신청완료' },
];

const BIZ_PBANC_LINK_INST_GROUP_ID = 'BIZ_PBANC_LINK_INST_CD';
const BIZ_PBANC_CLSF_GROUP_ID = 'BIZ_PBANC_CLSF_CD';
const BIZ_PBANC_SPRT_INST_GROUP_ID = 'BIZ_PBANC_SPRT_INST_CD';

const BIZ_CATEGORY_OPTIONS = [
  { value: BIZ_PBANC_LINK_INST_GROUP_ID, label: '지원분야별' },
  { value: BIZ_PBANC_CLSF_GROUP_ID, label: '사업유형별' },
  { value: BIZ_PBANC_SPRT_INST_GROUP_ID, label: '지원기관별' },
];

const DEFAULT_SOURCE_OPTIONS_BY_CATEGORY = {
  [BIZ_PBANC_LINK_INST_GROUP_ID]: [],
  [BIZ_PBANC_CLSF_GROUP_ID]: [],
  [BIZ_PBANC_SPRT_INST_GROUP_ID]: [],
};

const LINK_INST_CODE_TO_SOURCE_CODE = {
  BI01: 'SMTC',
  BI02: 'KSU',
  BI03: 'SMF',
  BI04: 'SBI',
  BI05: 'KME',
  BI07: 'FANFAN',
  BI08: 'ULTARI',
  BI09: 'SHK',
  BI10: 'SME',
};

const INTEGRATED_LINK_INST_CODE_SET = new Set(Object.keys(LINK_INST_CODE_TO_SOURCE_CODE));

const SOURCE_NAME_FALLBACK_BY_SOURCE_CODE = {
  SMF: '스마트공장사업관리시스템',
  KME: '중진공홈페이지',
  KSU: 'K-STARTUP',
  FANFAN: '판판대로',
  SHK: '인력지원사업종합관리',
  SBI: '소상공인24',
  SME: '중소기업해외전시포털',
  ULTARI: '기술보호울타리',
  SMTC: 'SMTECH',
};

const DEFAULT_SUMMARY = {
  total: 0,
  inProgress: 0,
  completed: 0,
};

const DEFAULT_PAGE = {
  content: [],
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  empty: true,
};

const resolveSourceCodeForApi = (category, selectedCode) => {
  if (!selectedCode) {
    return '';
  }

  if (category !== BIZ_PBANC_LINK_INST_GROUP_ID) {
    return '';
  }

  return LINK_INST_CODE_TO_SOURCE_CODE[selectedCode] || '';
};

const formatDateToQuery = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const parseDateStringToPicker = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }

  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
};

const normalizeDisplayDate = (value) => {
  if (!value) {
    return '-';
  }

  const digits = String(value).replace(/[^0-9]/g, '');
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }

  return String(value);
};

const getStatusBadgeClass = (statusGroup, statusRaw) => {
  const normalizedStatus = String(statusRaw || '').trim();
  if (normalizedStatus.includes('선정')) {
    return 'bg-light-success';
  }
  if (normalizedStatus.includes('탈락') || normalizedStatus.includes('취소')) {
    return 'bg-light-warning';
  }
  if (statusGroup === 'COMPLETED') {
    return 'bg-light-primary';
  }
  return 'bg-light-secondary';
};

const getStatusLabel = (statusGroup, statusRaw) => {
  if (statusRaw) {
    return statusRaw;
  }
  if (statusGroup === 'COMPLETED') {
    return '신청완료';
  }
  if (statusGroup === 'IN_PROGRESS') {
    return '신청중';
  }
  return '미정';
};

const buildDetailUrl = (item) => {
  if (!item?.detailUrl) {
    return null;
  }

  const trimmed = String(item.detailUrl).trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const UI_USR_L_520 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const [statusGroup, setStatusGroup] = useState('ALL');
  const [bCategory, setBCategory] = useState(BIZ_PBANC_LINK_INST_GROUP_ID);
  const [sourceCode, setSourceCode] = useState('');
  const [searchType, setSearchType] = useState('TITLE');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [appliedFilters, setAppliedFilters] = useState({
    statusGroup: 'ALL',
    bCategory: BIZ_PBANC_LINK_INST_GROUP_ID,
    sourceCode: '',
    searchType: 'TITLE',
    keyword: '',
    startDate: null,
    endDate: null,
  });

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [pageData, setPageData] = useState(DEFAULT_PAGE);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sourceOptionsByCategory, setSourceOptionsByCategory] = useState(DEFAULT_SOURCE_OPTIONS_BY_CATEGORY);
  // 연속 조회(필터/페이지 변경) 시 이전 요청을 중단하기 위한 AbortController 보관.
  const requestAbortControllerRef = useRef(null);
  // 최신 요청만 화면 상태를 갱신하도록 sequence 값을 관리한다.
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const loadCategoryCodeOptions = async () => {
      try {
        const commonCodes = await fetchAndConvertCommonCodes([
          BIZ_PBANC_LINK_INST_GROUP_ID,
          BIZ_PBANC_CLSF_GROUP_ID,
          BIZ_PBANC_SPRT_INST_GROUP_ID,
        ]);

        if (!mounted) {
          return;
        }

        setSourceOptionsByCategory({
          [BIZ_PBANC_LINK_INST_GROUP_ID]: commonCodes[BIZ_PBANC_LINK_INST_GROUP_ID] || [],
          [BIZ_PBANC_CLSF_GROUP_ID]: commonCodes[BIZ_PBANC_CLSF_GROUP_ID] || [],
          [BIZ_PBANC_SPRT_INST_GROUP_ID]: commonCodes[BIZ_PBANC_SPRT_INST_GROUP_ID] || [],
        });
      } catch (error) {
        console.error('지원사업 신청현황 공통코드 조회 실패:', error);
        if (mounted) {
          setSourceOptionsByCategory(DEFAULT_SOURCE_OPTIONS_BY_CATEGORY);
        }
      }
    };

    loadCategoryCodeOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const sourceOptions = useMemo(() => {
    let categoryOptions = sourceOptionsByCategory[bCategory] || [];
    if (bCategory === BIZ_PBANC_LINK_INST_GROUP_ID) {
      categoryOptions = categoryOptions.filter((option) =>
        INTEGRATED_LINK_INST_CODE_SET.has(option.value),
      );
    }
    return [{ value: '', label: '전체' }, ...categoryOptions];
  }, [bCategory, sourceOptionsByCategory]);

  const sourceLabelBySourceCode = useMemo(() => {
    const labels = { ...SOURCE_NAME_FALLBACK_BY_SOURCE_CODE };
    const linkInstOptions = sourceOptionsByCategory[BIZ_PBANC_LINK_INST_GROUP_ID] || [];

    linkInstOptions.forEach((option) => {
      const mappedSourceCode = LINK_INST_CODE_TO_SOURCE_CODE[option.value];
      if (mappedSourceCode) {
        labels[mappedSourceCode] = option.label;
      }
    });

    return labels;
  }, [sourceOptionsByCategory]);

  const getSourceLabel = (sourceCode, sourceName) => {
    const sourceLabel = sourceLabelBySourceCode[sourceCode];
    if (sourceLabel) {
      return sourceLabel;
    }

    if (sourceName) {
      return sourceName;
    }

    return sourceCode || '-';
  };

  useEffect(() => {
    if (!sourceCode) {
      return;
    }

    const exists = sourceOptions.some((option) => option.value === sourceCode);
    if (!exists) {
      setSourceCode('');
    }
  }, [sourceCode, sourceOptions]);

  useEffect(() => {
    const fetchSupportApplications = async () => {
      // 새 요청이 시작되면 이전 in-flight 요청을 취소해 불필요한 대기를 줄인다.
      if (requestAbortControllerRef.current) {
        requestAbortControllerRef.current.abort();
      }

      const requestAbortController = new AbortController();
      requestAbortControllerRef.current = requestAbortController;
      const requestSequence = requestSequenceRef.current + 1;
      requestSequenceRef.current = requestSequence;

      setLoading(true);
      setErrorMessage('');

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          size: String(pageSize),
          statusGroup: appliedFilters.statusGroup || 'ALL',
          searchType: appliedFilters.searchType || 'TITLE',
        });

        const resolvedSourceCode = resolveSourceCodeForApi(
          appliedFilters.bCategory,
          appliedFilters.sourceCode,
        );

        if (resolvedSourceCode) {
          params.set('sourceCode', resolvedSourceCode);
        }

        if (appliedFilters.keyword) {
          params.set('keyword', appliedFilters.keyword);
        }

        if (appliedFilters.startDate) {
          params.set('startDate', appliedFilters.startDate);
        }

        if (appliedFilters.endDate) {
          params.set('endDate', appliedFilters.endDate);
        }

        const data = await apiClient.get(
          `/api/v1/pbanc/support-applications?${params.toString()}`,
          { signal: requestAbortController.signal },
        );
        const payload = data?.data ?? data;

        // 느린 이전 요청 응답이 뒤늦게 도착해도 최신 요청 결과를 덮어쓰지 않도록 방어.
        if (requestSequence !== requestSequenceRef.current) {
          return;
        }

        setSummary(payload?.summary || DEFAULT_SUMMARY);
        setPageData({
          ...DEFAULT_PAGE,
          ...(payload?.page || {}),
        });
      } catch (error) {
        // 사용자가 새로운 조회를 시작해서 발생한 AbortError는 정상 흐름으로 간주한다.
        if (error?.name === 'AbortError') {
          return;
        }

        // 최신 요청이 아니면 에러 상태도 반영하지 않는다.
        if (requestSequence !== requestSequenceRef.current) {
          return;
        }

        console.error('Failed to load support application status list:', error);
        setSummary(DEFAULT_SUMMARY);
        setPageData(DEFAULT_PAGE);
        setErrorMessage(error?.message || '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        // 최신 요청일 때만 loading을 내려서 로딩 상태 경합을 방지한다.
        if (requestSequence === requestSequenceRef.current) {
          setLoading(false);
        }
      }
    };

    fetchSupportApplications();
    return () => {
      // effect 재실행/언마운트 시 잔여 요청 취소.
      if (requestAbortControllerRef.current) {
        requestAbortControllerRef.current.abort();
      }
    };
  }, [appliedFilters, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    if (Number.isFinite(pageData.totalPages)) {
      return pageData.totalPages;
    }

    if (!Number.isFinite(pageData.totalElements) || pageSize <= 0) {
      return 0;
    }

    return Math.ceil(pageData.totalElements / pageSize);
  }, [pageData.totalPages, pageData.totalElements, pageSize]);

  const handleSearch = () => {
    const normalizedKeyword = keyword.trim();
    const normalizedStartDate = formatDateToQuery(startDate);
    const normalizedEndDate = formatDateToQuery(endDate);

    setAppliedFilters({
      statusGroup,
      bCategory,
      sourceCode,
      searchType,
      keyword: normalizedKeyword,
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event) => {
    const nextSize = Number(event.target.value);
    if (!Number.isFinite(nextSize) || nextSize <= 0) {
      return;
    }

    setPageSize(nextSize);
    setCurrentPage(1);
  };

  const handleOpenDetail = (item) => {
    if (!item?.detailAvailable) {
      return;
    }

    const detailUrl = buildDetailUrl(item);
    if (!detailUrl) {
      return;
    }

    window.open(detailUrl, '_blank', 'noopener,noreferrer');
  };

  const handleKeywordEnter = (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    handleSearch();
  };

  const hasListData = Array.isArray(pageData.content) && pageData.content.length > 0;

  return (
    <>
      <SideNavigation
        pageTitle={depth1Menu?.menuNm || ''}
        menuItems={sidebarData}
      />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />

        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">지원사업 신청 현황</h2>
        </div>

        <p className="guide-txt">
          신청 진행중인 지원사업이 있을 경우, 해당 통합신청 페이지의 "과제신청내역조회" 버튼을 통해
          이어서 신청하실 수 있습니다.
        </p>

        <div className="search-top-box no-details mt-40">
          <div className="form-row-box gap-12">
            <div className="select-box">
              <label className="label" htmlFor="select_01">사업구분</label>
              <select
                id="select_01"
                className="krds-form-select medium w-164"
                value={bCategory}
                onChange={(event) => {
                  const nextCategory = event.target.value;
                  setBCategory(nextCategory);
                  setSourceCode('');
                }}
              >
                {BIZ_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="select-box">
              <select
                id="source_code"
                className="krds-form-select medium"
                title="사업구분 선택"
                value={sourceCode}
                onChange={(event) => setSourceCode(event.target.value)}
              >
                {sourceOptions.map((option) => (
                  <option key={option.value || 'ALL'} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="datepicker-group">
              <Datepicker
                menuName="조회기간"
                id="datepicker_01"
                selected={startDate || parseDateStringToPicker(appliedFilters.startDate)}
                onChange={(date) => setStartDate(date)}
              />
              <span>~</span>
              <Datepicker
                id="datepicker_02"
                selected={endDate || parseDateStringToPicker(appliedFilters.endDate)}
                onChange={(date) => setEndDate(date)}
              />
            </div>
          </div>

          <div className="form-row-box gap-12">
            <div className="select-box">
              <label className="label" htmlFor="select_03">신청상태</label>
              <select
                id="select_03"
                className="krds-form-select medium"
                value={statusGroup}
                onChange={(event) => setStatusGroup(event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="select-box">
              <label className="label" htmlFor="select_04">검색구분</label>
              <select
                id="select_04"
                className="krds-form-select medium w-164"
                value={searchType}
                onChange={(event) => setSearchType(event.target.value)}
              >
                <option value="TITLE">지원사업명</option>
                <option value="SOURCE">연계시스템명</option>
              </select>
            </div>

            <div className="input-group-box">
              <div className="sch-input">
                <input
                  type="text"
                  id="keyword_520"
                  className="krds-input medium"
                  placeholder="검색어를 입력해주세요."
                  title="검색어 입력"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onKeyDown={handleKeywordEnter}
                />
                <button type="button" className="krds-btn medium icon ico-search" onClick={handleSearch}>
                  <span className="sr-only">검색</span>
                  <i className="svg-icon ico-sch"></i>
                </button>
              </div>
              <button type="button" className="krds-btn primary medium" onClick={handleSearch}>검색</button>
            </div>
          </div>
        </div>

        <div className="on-search-summary mt-40">
          <div className="summary-list">
            <div className="summary-item">
              <div className="summary-title"><span className="sr-only">신청현황:</span>전체</div>
              <div className="summary-result"><strong>{formatNumberWithCommas(summary.total || 0)}</strong>건</div>
            </div>
            <i className="svg-icon ico-angle right"></i>
            <div className="summary-item">
              <div className="summary-title"><span className="sr-only">신청현황:</span>신청중</div>
              <div className="summary-result"><strong>{formatNumberWithCommas(summary.inProgress || 0)}</strong>건</div>
            </div>
            <i className="svg-icon ico-angle right"></i>
            <div className="summary-item">
              <div className="summary-title"><span className="sr-only">신청현황:</span>신청완료</div>
              <div className="summary-result"><strong>{formatNumberWithCommas(summary.completed || 0)}</strong>건</div>
            </div>
          </div>
        </div>

        <div className="search-list-top">
          <ul className="sch-info" aria-live="polite">
            <li>
              검색 결과 <span className="point">{formatNumberWithCommas(pageData.totalElements || 0)}</span>건
            </li>
          </ul>

          <ul className="sch-sort">
            <li>
              <strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
              <select
                className="krds-form-select-sort"
                id="search_result_count"
                value={String(pageSize)}
                onChange={handlePageSizeChange}
              >
                <option value="10">10개</option>
                <option value="20">20개</option>
                <option value="30">30개</option>
                <option value="40">40개</option>
                <option value="50">50개</option>
              </select>
            </li>
          </ul>
        </div>

        {loading && (
          <div className="on-no-data">
            <p>불러오는 중입니다...</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="on-no-data">
            <p>{errorMessage}</p>
          </div>
        )}

        {!loading && !errorMessage && !hasListData && (
          <div className="on-no-data">
            <p>등록된 데이터가 없습니다.</p>
          </div>
        )}

        {!loading && !errorMessage && hasListData && (
          <>
            <ul className="krds-structured-list type-full">
              {pageData.content.map((item) => {
                const detailAvailable = Boolean(item?.detailAvailable);

                return (
                  <li
                    className="structured-item"
                    key={`${item.requestId || ''}-${item.pbancId || ''}-${item.detailBizId || ''}-${item.title || ''}`}
                  >
                    <div className="in">
                      <div className="card-body">
                        <div className="c-text">
                          <div className="flex-row">
                            <div className="krds-badge-wrap">
                              <span className={`krds-badge ${getStatusBadgeClass(item.statusGroup, item.statusRaw)}`}>
                                {getStatusLabel(item.statusGroup, item.statusRaw)}
                              </span>
                            </div>
                            <p className="c-tit no-icon onellipsis-1 small">{item.title || '-'}</p>
                          </div>
                          <p className="on-list-btm">
                            <span><strong>{getSourceLabel(item.sourceCode, item.sourceName)}</strong></span>
                            {/*<span><strong>{item.statusRaw || '-'}</strong></span>*/}
                            <span><strong>신청일</strong> {normalizeDisplayDate(item.requestDate)}</span>
                          </p>
                        </div>

                        <div className="c-btn">
                          <button
                            type="button"
                            className="krds-btn primary medium"
                            disabled={!detailAvailable}
                            onClick={() => handleOpenDetail(item)}
                          >
                            상세조회
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              syncUrl
            />
          </>
        )}
      </div>
    </>
  );
};

export default UI_USR_L_520;
