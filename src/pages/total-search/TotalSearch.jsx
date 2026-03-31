import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/ui/Header.jsx';
import Footer from '@/components/ui/Footer.jsx';
import Breadcrumb from '@/components/ui/Breadcrumb.jsx';
import ResultMenuBreadcrumb from '@/components/ui/ResultMenuBreadcrumb.jsx';
import Tab from '@/components/ui/Tab';
import Pagination from '@/components/ui/Pagination.jsx';
import { api as apiClient } from '@/lib/apiClient.js';
import {
  preloadIntegratedSearchRouteResources,
  resolveIntegratedSearchRoute,
} from '@/utils/integratedSearchRouteResolver.js';
import { extractExternalUrl } from '@/utils/menuUtils.js';

const SEARCH_TAB_LIST_COUNT = 10;
const SEARCH_ALL_PREVIEW_COUNT = 3;

const CERT_BUTTON_LABEL_BY_HINT = Object.freeze({
  ISRH0011: '발급받기',
  ISRH0012: '발급안내',
});

// 컬렉션별 필드 매핑은 이 블록만 수정하면 되도록 분리
const COLLECTION_SECTION_CONFIG = [
  {
    collectionKey: 'smep_sprtbiz',
    tabLabel: '지원사업',
    defaultDepth1MenuNm: '지원사업',
    defaultDepth2MenuNm: '지원사업소개',
  },
  {
    collectionKey: 'smep_cert',
    tabLabel: '증명서발급',
    defaultDepth1MenuNm: '증명서발급',
    defaultDepth2MenuNm: '발급',
  },
  {
    collectionKey: 'smep_raw',
    tabLabel: '정책법령정보',
    defaultDepth1MenuNm: '정책법령정보',
    defaultDepth2MenuNm: '정책금융',
  },
  {
    collectionKey: 'smep_more',
    tabLabel: '더많은서비스',
    defaultDepth1MenuNm: '더많은서비스',
    defaultDepth2MenuNm: '공지사항',
  },
  {
    collectionKey: 'smep_cust',
    tabLabel: '고객지원',
    defaultDepth1MenuNm: '고객지원',
    defaultDepth2MenuNm: '자주하는 질문',
  },
];

const SEARCH_RESULT_FIELDS = Object.freeze({
  depth1MenuId: 'depth1_menu_id',
  depth1MenuNm: 'depth1_menu_nm',
  depth2MenuId: 'depth2_menu_id',
  depth2MenuNm: 'depth2_menu_nm',
  depth3MenuId: 'depth3_menu_id',
  depth3MenuNm: 'depth3_menu_nm',
  title: 'title',
  content: 'cont',
  dataKey: 'data_key',
  intgSrchRouteHintCd: 'intg_srch_route_hint_cd',
  dataCategory: 'data_category',
});

const createInitialCollectionState = () =>
  COLLECTION_SECTION_CONFIG.reduce((acc, config) => {
    acc[config.collectionKey] = { count: 0, items: [] };
    return acc;
  }, {});

const createInitialPageState = () =>
  COLLECTION_SECTION_CONFIG.reduce((acc, config) => {
    acc[config.collectionKey] = 1;
    return acc;
  }, {});

const toTrimmedString = (value) => String(value ?? '').trim();

const normalizeFieldKey = (value) =>
  toTrimmedString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const toCount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isAbsoluteHttpUrl = (value) => /^https?:\/\//i.test(toTrimmedString(value));

const pickResultFieldValue = (raw, fieldName, fallback = '') => {
  if (!raw || typeof raw !== 'object') return fallback;

  const directCandidates = [
    raw?.[fieldName],
    raw?.[String(fieldName).toLowerCase()],
    raw?.[String(fieldName).toUpperCase()],
  ];

  for (const candidate of directCandidates) {
    const value = toTrimmedString(candidate);
    if (value) return value;
  }

  const normalizedTarget = normalizeFieldKey(fieldName);
  const matchedEntry = Object.entries(raw).find(
    ([key]) => normalizeFieldKey(key) === normalizedTarget,
  );
  const matchedValue = toTrimmedString(matchedEntry?.[1]);
  return matchedValue || fallback;
};

const parseSearchPayload = (payload) => {
  if (!payload) return null;
  if (typeof payload === 'string') {
    try {
      return parseSearchPayload(JSON.parse(payload));
    } catch (error) {
      return null;
    }
  }
  if (payload?.data !== undefined && payload?.data !== null) {
    return parseSearchPayload(payload.data);
  }
  return payload;
};

const normalizeApiPayload = (response) => {
  const parsed = parseSearchPayload(response);
  return parsed && typeof parsed === 'object' ? parsed : {};
};

const formatCount = (value) => toCount(value).toLocaleString('ko-KR');

const HIGHLIGHT_OPEN_TAG = '<!HS>';
const HIGHLIGHT_CLOSE_TAG = '<!HE>';
const HIGHLIGHT_OPEN_PLACEHOLDER = '__INTG_HS__';
const HIGHLIGHT_CLOSE_PLACEHOLDER = '__INTG_HE__';

const stripHtmlExceptHighlight = (value) => {
  const raw = toTrimmedString(value);
  if (!raw) return '';

  const protectedHighlight = raw
    .split(HIGHLIGHT_OPEN_TAG)
    .join(HIGHLIGHT_OPEN_PLACEHOLDER)
    .split(HIGHLIGHT_CLOSE_TAG)
    .join(HIGHLIGHT_CLOSE_PLACEHOLDER);

  const withoutHtml = protectedHighlight
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return withoutHtml
    .split(HIGHLIGHT_OPEN_PLACEHOLDER)
    .join(HIGHLIGHT_OPEN_TAG)
    .split(HIGHLIGHT_CLOSE_PLACEHOLDER)
    .join(HIGHLIGHT_CLOSE_TAG);
};

const renderHighlightedText = (value, fallback = '-') => {
  const rawText = stripHtmlExceptHighlight(value);
  const normalizedText = rawText || fallback;

  if (
    !normalizedText.includes(HIGHLIGHT_OPEN_TAG) &&
    !normalizedText.includes(HIGHLIGHT_CLOSE_TAG)
  ) {
    return normalizedText;
  }

  const nodes = [];
  let cursor = 0;
  let highlightedIndex = 0;

  while (cursor < normalizedText.length) {
    const start = normalizedText.indexOf(HIGHLIGHT_OPEN_TAG, cursor);

    if (start === -1) {
      const tail = normalizedText.slice(cursor);
      if (tail) nodes.push(tail);
      break;
    }

    if (start > cursor) {
      nodes.push(normalizedText.slice(cursor, start));
    }

    const contentStart = start + HIGHLIGHT_OPEN_TAG.length;
    const end = normalizedText.indexOf(HIGHLIGHT_CLOSE_TAG, contentStart);

    if (end === -1) {
      nodes.push(normalizedText.slice(start));
      break;
    }

    const highlightedText = normalizedText.slice(contentStart, end);
    nodes.push(
      <span key={`highlight-${highlightedIndex}`} className="point">
        {highlightedText}
      </span>,
    );
    highlightedIndex += 1;
    cursor = end + HIGHLIGHT_CLOSE_TAG.length;
  }

  return <>{nodes}</>;
};

const normalizeSearchItem = (rawItem, config) => {
  const raw = rawItem && typeof rawItem === 'object' ? rawItem : {};

  const depth1MenuId = pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.depth1MenuId);
  const depth1MenuNm = pickResultFieldValue(
    raw,
    SEARCH_RESULT_FIELDS.depth1MenuNm,
    config.defaultDepth1MenuNm || config.tabLabel,
  );
  const depth2MenuId = pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.depth2MenuId);
  const depth2MenuNm = pickResultFieldValue(
    raw,
    SEARCH_RESULT_FIELDS.depth2MenuNm,
    config.defaultDepth2MenuNm || config.tabLabel,
  );
  const depth3MenuId = pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.depth3MenuId);
  const depth3MenuNm = pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.depth3MenuNm);
  const title = pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.title, '-');
  const content = pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.content);
  const workId = pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.dataKey);
  const intgSrchRouteHintCd = pickResultFieldValue(
    raw,
    SEARCH_RESULT_FIELDS.intgSrchRouteHintCd,
  );
  const bbsCategoryId = pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.dataCategory);
  const docId = workId;

  return {
    collectionKey: config.collectionKey,
    depth1MenuId,
    depth1MenuNm,
    depth2MenuId,
    depth2MenuNm,
    depth3MenuId,
    depth3MenuNm,
    title,
    content,
    workId,
    intgSrchRouteHintCd,
    bbsCategoryId,
    linkUrl: '',
    docId,
    raw,
  };
};

const normalizeCollectionResult = (payload, config, itemLimit = null) => {
  const node = payload?.[config.collectionKey] || {};
  const rawItems = Array.isArray(node?.data) ? node.data : [];
  const items = rawItems.map((item) => normalizeSearchItem(item, config));

  return {
    count: toCount(node?.count),
    items: Number.isFinite(itemLimit) ? items.slice(0, itemLimit) : items,
  };
};

const buildCollectionResultMap = (payload, itemLimit = null) =>
  COLLECTION_SECTION_CONFIG.reduce((acc, config) => {
    acc[config.collectionKey] = normalizeCollectionResult(payload, config, itemLimit);
    return acc;
  }, {});

const buildBadgeLabel = (item, config) =>
  item.depth3MenuNm || item.depth2MenuNm || config.defaultDepth2MenuNm || config.tabLabel;

const getCertificateButtonLabel = (item) => {
  const hintCode = toTrimmedString(item.intgSrchRouteHintCd).toUpperCase();
  return CERT_BUTTON_LABEL_BY_HINT[hintCode] || '';
};

const resolveFallbackNavigation = (item) => {
  const rawLink = toTrimmedString(item.linkUrl);
  if (!rawLink) return null;

  const extractedExternalUrl = extractExternalUrl(rawLink);
  if (extractedExternalUrl) {
    return { type: 'external', value: extractedExternalUrl };
  }

  if (isAbsoluteHttpUrl(rawLink)) {
    return { type: 'external', value: rawLink };
  }

  if (rawLink.startsWith('/')) {
    return { type: 'internal', value: rawLink };
  }

  return null;
};

const TotalSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const allRequestSerialRef = useRef(0);
  const tabRequestSerialRef = useRef(0);

  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [allCollections, setAllCollections] = useState(createInitialCollectionState);
  const [tabCollections, setTabCollections] = useState(createInitialCollectionState);
  const [tabPageByCollection, setTabPageByCollection] = useState(createInitialPageState);
  const [isAllLoading, setIsAllLoading] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const breadcrumbItems = useMemo(
    () => [{ label: '통합 검색', link: '#' }],
    [],
  );

  const resetResultState = useCallback(() => {
    setTotalCount(0);
    setAllCollections(createInitialCollectionState());
    setTabCollections(createInitialCollectionState());
    setErrorMessage('');
  }, []);

  const fetchAllResults = useCallback(async (keyword) => {
    const requestSerial = ++allRequestSerialRef.current;
    setIsAllLoading(true);
    setErrorMessage('');

    try {
      const params = new URLSearchParams({
        query: keyword,
        collection: 'ALL',
      });
      const response = await apiClient.get(`/api/v1/search/totalSearch?${params.toString()}`);
      if (requestSerial !== allRequestSerialRef.current) return;

      const payload = normalizeApiPayload(response);
      setTotalCount(toCount(payload?.totalCount));
      setAllCollections(buildCollectionResultMap(payload, SEARCH_ALL_PREVIEW_COUNT));
    } catch (error) {
      if (requestSerial !== allRequestSerialRef.current) return;
      setTotalCount(0);
      setAllCollections(createInitialCollectionState());
      setErrorMessage('통합검색 조회 중 오류가 발생했습니다.');
    } finally {
      if (requestSerial === allRequestSerialRef.current) {
        setIsAllLoading(false);
      }
    }
  }, []);

  const fetchTabResults = useCallback(async ({ keyword, collectionKey, page }) => {
    const requestSerial = ++tabRequestSerialRef.current;
    setIsTabLoading(true);
    setErrorMessage('');

    try {
      const params = new URLSearchParams({
        query: keyword,
        collection: collectionKey,
        startCount: String(Math.max(0, page - 1)),
      });
      const response = await apiClient.get(`/api/v1/search/totalSearch?${params.toString()}`);
      if (requestSerial !== tabRequestSerialRef.current) return;

      const payload = normalizeApiPayload(response);
      const config = COLLECTION_SECTION_CONFIG.find((item) => item.collectionKey === collectionKey);
      if (!config) return;

      const normalized = normalizeCollectionResult(payload, config);
      setTabCollections((prev) => ({
        ...prev,
        [collectionKey]: normalized,
      }));
    } catch (error) {
      if (requestSerial !== tabRequestSerialRef.current) return;
      setTabCollections((prev) => ({
        ...prev,
        [collectionKey]: { count: 0, items: [] },
      }));
      setErrorMessage('검색결과 조회 중 오류가 발생했습니다.');
    } finally {
      if (requestSerial === tabRequestSerialRef.current) {
        setIsTabLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    preloadIntegratedSearchRouteResources().catch(() => {
      // 상세 이동 첫 클릭 지연을 줄이기 위한 사전 로드이므로 실패 시 무시
    });
  }, []);

  useEffect(() => {
    const stateQuery = toTrimmedString(location.state?.q);
    const queryParam = toTrimmedString(new URLSearchParams(location.search).get('q'));
    const nextQuery = stateQuery || queryParam;

    setSearchInput(nextQuery);
    setSearchKeyword(nextQuery);
    setActiveTabIndex(0);
    setTabPageByCollection(createInitialPageState());
  }, [location.key, location.search, location.state]);

  useEffect(() => {
    if (!searchKeyword) {
      resetResultState();
      return;
    }

    fetchAllResults(searchKeyword);
  }, [searchKeyword, fetchAllResults, resetResultState]);

  useEffect(() => {
    if (!searchKeyword || activeTabIndex === 0) return;

    const config = COLLECTION_SECTION_CONFIG[activeTabIndex - 1];
    if (!config) return;

    const page = tabPageByCollection[config.collectionKey] || 1;
    fetchTabResults({
      keyword: searchKeyword,
      collectionKey: config.collectionKey,
      page,
    });
  }, [activeTabIndex, fetchTabResults, searchKeyword, tabPageByCollection]);

  const handleSearch = () => {
    const nextKeyword = toTrimmedString(searchInput);
    setActiveTabIndex(0);
    setTabPageByCollection(createInitialPageState());

    if (nextKeyword === searchKeyword) {
      if (!nextKeyword) {
        resetResultState();
        return;
      }
      fetchAllResults(nextKeyword);
      return;
    }

    setSearchKeyword(nextKeyword);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
  };

  const handleMoreToTab = (tabIndex) => {
    setActiveTabIndex(tabIndex);
  };

  const handleTabPageChange = (collectionKey, page) => {
    setTabPageByCollection((prev) => ({
      ...prev,
      [collectionKey]: page,
    }));
  };

  const navigateByItem = useCallback(async (item) => {
    const hintCode = toTrimmedString(item.intgSrchRouteHintCd);
    if (hintCode) {
      try {
        const resolved = await resolveIntegratedSearchRoute({
          intgSrchRouteHintCd: hintCode,
          workId: item.workId,
          bbsCategoryId: item.bbsCategoryId,
        });

        if (resolved?.path) {
          navigate(resolved.path);
          return;
        }
      } catch (error) {
        // 리졸버 실패 시 아래 fallback 경로를 시도
      }
    }

    const fallback = resolveFallbackNavigation(item);
    if (!fallback) return;

    if (fallback.type === 'internal') {
      navigate(fallback.value);
      return;
    }

    window.open(fallback.value, '_blank', 'noopener,noreferrer');
  }, [navigate]);

  const handleItemClick = async (event, item) => {
    event.preventDefault();
    await navigateByItem(item);
  };

  const handleCertificateButtonClick = async (event, item) => {
    event.preventDefault();
    await navigateByItem(item);
  };

  const totalCountByCollections = useMemo(
    () =>
      COLLECTION_SECTION_CONFIG.reduce((sum, config) => {
        return sum + toCount(allCollections[config.collectionKey]?.count);
      }, 0),
    [allCollections],
  );

  const displayTotalCount = totalCount > 0 ? totalCount : totalCountByCollections;

  const tabData = useMemo(() => {
    const labels = [`전체(${formatCount(displayTotalCount)})`];
    COLLECTION_SECTION_CONFIG.forEach((config) => {
      labels.push(`${config.tabLabel}(${formatCount(allCollections[config.collectionKey]?.count)})`);
    });
    return labels;
  }, [allCollections, displayTotalCount]);

  const currentResultCount = useMemo(() => {
    if (activeTabIndex === 0) return displayTotalCount;
    const config = COLLECTION_SECTION_CONFIG[activeTabIndex - 1];
    return toCount(allCollections[config?.collectionKey]?.count);
  }, [activeTabIndex, allCollections, displayTotalCount]);

  const renderBreadcrumb = (item) => {
    return (
      <ResultMenuBreadcrumb
        depth1MenuId={item.depth1MenuId}
        depth2MenuId={item.depth2MenuId}
        depth3MenuId={item.depth3MenuId}
        className="mb-0"
        ariaLabel="현재 경로"
      />
    );
  };

  const renderCollectionCards = (config, items, { showCertificateButton }) => {
    if (!items.length) {
      return (
        <div className="in">
          <div className="card-body">
            <p className="c-txt onellipsis-2">검색 결과가 없습니다.</p>
          </div>
        </div>
      );
    }

    return items.map((item, index) => {
      const keyBase = item.docId || item.workId || item.title || 'item';
      const key = `${config.collectionKey}-${keyBase}-${index}`;
      const buttonLabel = showCertificateButton ? getCertificateButtonLabel(item) : '';

      return (
        <div className="in" key={key}>
          <div className="card-top">
            <span className="krds-badge bg-light-primary">{buildBadgeLabel(item, config)}</span>
          </div>
          <div className="card-body">
            <a
              href={item.linkUrl || '#'}
              className="c-text c-date"
              onClick={(event) => handleItemClick(event, item)}
            >
              <p className="c-tit no-icon">
                <h4 className="onellipsis-2">{renderHighlightedText(item.title, '-')}</h4>
              </p>
              <p className="c-txt onellipsis-2">{renderHighlightedText(item.content, '-')}</p>
              {!showCertificateButton && renderBreadcrumb(item)}
            </a>
          </div>
          {showCertificateButton && buttonLabel && (
            <div className="card-btn">
              <button
                type="button"
                className="krds-btn primary xlarge"
                onClick={(event) => handleCertificateButtonClick(event, item)}
              >
                {buttonLabel}
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  const renderAllTabSection = (config, tabIndex) => {
    const result = allCollections[config.collectionKey] || { count: 0, items: [] };

    return (
      <div className="search-result-list-wrap" key={config.collectionKey}>
        <div className="search-result-caption">
          <div className="search-title">
            <h4>
              {config.tabLabel}
              <p>
                <span className="point">{formatCount(result.count)}</span> 건
              </p>
            </h4>
          </div>
          <button type="button" className="search-more-btn" onClick={() => handleMoreToTab(tabIndex)}>
            더보기<i className="svg-icon ico-plus" />
          </button>
        </div>
        <ul className="krds-structured-list type-full">
          <li className="structured-item">
            {renderCollectionCards(config, result.items, {
              showCertificateButton: config.collectionKey === 'smep_cert',
            })}
          </li>
        </ul>
      </div>
    );
  };

  const renderIndependentTabSection = (config) => {
    const result = tabCollections[config.collectionKey] || { count: 0, items: [] };
    const currentPage = tabPageByCollection[config.collectionKey] || 1;
    const totalPages = Math.ceil(toCount(result.count) / SEARCH_TAB_LIST_COUNT);

    return (
      <div className="search-result-list-wrap indep-wrap">
        <ul className="krds-structured-list type-full">
          <li className="structured-item indep-item">
            {renderCollectionCards(config, result.items, {
              showCertificateButton: config.collectionKey === 'smep_cert',
            })}
          </li>
        </ul>
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(page) => handleTabPageChange(config.collectionKey, page)}
        />
      </div>
    );
  };

  return (
    <div id="wrap" className="integrated-search">
      <Header />
      <div id="container" className="on-gradientpage sub-container">
        <div className="inner">
          <div className="totalsearch-wrap">
            <Breadcrumb items={breadcrumbItems} />
            <div className="page-title-wrap" data-type="responsive">
              <h2 className="h-tit">통합검색</h2>
            </div>

            <div className="onsearch-input-box">
              <div className="boxinner">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                />
                <button type="button" onClick={handleSearch}>
                  <i className="svg-icon ico-sch" style={{ backgroundColor: '#256EF4' }}></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="integrated-result">
        <div className="inner">
          <div className="krds-tab-area layer">
            <div className="search-list-top mt-0">
              <ul className="sch-info" aria-live="polite">
                <li>
                  '<span className="point">{searchKeyword || '-'}</span>'
                </li>
                <li>
                  검색 결과 <span className="point">{formatCount(currentResultCount)}</span> 건
                </li>
              </ul>
            </div>

            {errorMessage && (
              <div className="search-list-top mt-0" role="alert">
                <ul className="sch-info">
                  <li>{errorMessage}</li>
                </ul>
              </div>
            )}

            <div className="search-tab-wrap">
              <Tab tabData={tabData} onTabChange={handleTabChange} activeIndex={activeTabIndex} />
            </div>

            <div className="tab-conts-wrap">
              <section className={`tab-conts ${activeTabIndex === 0 ? 'active' : ''}`}>
                {isAllLoading && (
                  <div className="search-result-list-wrap">
                    <ul className="krds-structured-list type-full">
                      <li className="structured-item">
                        <div className="in">
                          <div className="card-body">
                            <p className="c-txt onellipsis-2">검색결과 조회 중...</p>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
                {COLLECTION_SECTION_CONFIG.map((config, index) =>
                  renderAllTabSection(config, index + 1),
                )}
              </section>

              {COLLECTION_SECTION_CONFIG.map((config, index) => (
                <section
                  key={config.collectionKey}
                  className={`tab-conts ${activeTabIndex === index + 1 ? 'active' : ''}`}
                >
                  {isTabLoading && activeTabIndex === index + 1 ? (
                    <div className="search-result-list-wrap indep-wrap">
                      <ul className="krds-structured-list type-full">
                        <li className="structured-item indep-item">
                          <div className="in">
                            <div className="card-body">
                              <p className="c-txt onellipsis-2">검색결과 조회 중...</p>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    renderIndependentTabSection(config)
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TotalSearch;



