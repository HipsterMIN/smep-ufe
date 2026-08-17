import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/ui/Header.jsx';
import Footer from '@/components/ui/Footer.jsx';
import Breadcrumb from '@/components/ui/Breadcrumb.jsx';
import ResultMenuBreadcrumb from '@/components/ui/ResultMenuBreadcrumb.jsx';
import Tab from '@/components/ui/Tab';
import Pagination from '@/components/ui/Pagination.jsx';
import { api as apiClient } from '@/lib/apiClient.js';
import { trackSearch, trackSearchResultClick } from '@/lib/behaviorTracker.js';
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

const PBANC_COLLECTION_KEYS = new Set(['smep_pbanc_central', 'smep_pbanc_local']);

const PBANC_DETAIL_PATH_PREFIX_BY_COLLECTION = Object.freeze({
  smep_pbanc_central: '/req/pbanc',
  smep_pbanc_local: '/req/pbancProvincial',
});

const PBANC_RESULT_FIELDS = Object.freeze({
  pbancNo: 'BIZ_PBANC_NO',
  pbancName: 'BIZ_PBANC_NM',
  applyPeriod: 'BIZ_APLY_DT',
  applyStatus: 'APLY_STTS_NM',
  agency: 'BIZ_SPRVSN_INST_NM',
  deadline: 'BIZ_APLY_DDLN_YMD',
  regDate: 'REG_DT',
});

const COMMON_SEARCH_SORT_PARAM = 'SCORE/DESC,Date/DESC';
const PBANC_DEADLINE_SORT_PARAM = 'BIZ_APLY_DDLN_YMD/ASC,SCORE/DESC,Date/DESC';

// 화면에 노출할 컬렉션 순서와 기본 메뉴명은 이 설정에서 관리한다.
const COLLECTION_SECTION_CONFIG = [
  {
    collectionKey: 'smep_pbanc_central',
    tabLabel: '사업공고(중앙정부)',
    defaultDepth1MenuNm: '사업공고',
    defaultDepth2MenuNm: '중앙정부',
  },
  {
    collectionKey: 'smep_pbanc_local',
    tabLabel: '사업공고(지방정부)',
    defaultDepth1MenuNm: '사업공고',
    defaultDepth2MenuNm: '지방정부',
  },
  {
    collectionKey: 'smep_plcy_fnnc',
    tabLabel: '정책금융',
    defaultDepth1MenuNm: '정책금융',
    defaultDepth2MenuNm: '정책금융',
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

const normalizeTitleForRouteParameter = (value) =>
  stripHtmlExceptHighlight(value)
    .split(HIGHLIGHT_OPEN_TAG)
    .join('')
    .split(HIGHLIGHT_CLOSE_TAG)
    .join('')
    .trim();

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

const hasRenderableResultText = (value) => Boolean(stripHtmlExceptHighlight(value));

const sumVisibleCollectionCounts = (collections) =>
  COLLECTION_SECTION_CONFIG.reduce((sum, config) => {
    return sum + toCount(collections?.[config.collectionKey]?.count);
  }, 0);

const isPbancCollection = (collectionKey) => PBANC_COLLECTION_KEYS.has(collectionKey);

const buildPbancDetailPath = (collectionKey, pbancNo) => {
  const pathPrefix = PBANC_DETAIL_PATH_PREFIX_BY_COLLECTION[collectionKey];
  if (!pathPrefix || !pbancNo) return '';
  return `${pathPrefix}/${encodeURIComponent(pbancNo)}`;
};

const buildPbancContent = (raw) => {
  const agency = pickResultFieldValue(raw, PBANC_RESULT_FIELDS.agency);
  const applyStatus = pickResultFieldValue(raw, PBANC_RESULT_FIELDS.applyStatus);
  const applyPeriod = pickResultFieldValue(raw, PBANC_RESULT_FIELDS.applyPeriod);
  const parts = [
    agency && `주관기관: ${agency}`,
    applyStatus && `상태: ${applyStatus}`,
    applyPeriod && `신청기간: ${applyPeriod}`,
  ].filter(Boolean);

  return parts.join(' · ');
};

const getSearchStartCount = (page) => {
  // Wisenut pageInfo의 startCount는 결과 offset이 아니라 0-base page index다.
  return String(Math.max(0, toCount(page) - 1));
};

const getSearchSortParam = (sortType, collectionKey = '') => {
  if (sortType === 'DEADLINE' && isPbancCollection(collectionKey)) {
    return PBANC_DEADLINE_SORT_PARAM;
  }

  // ALL 검색은 여러 컬렉션에 하나의 sort 문자열을 적용하므로 공통 필드만 보낸다.
  return COMMON_SEARCH_SORT_PARAM;
};

const normalizeSearchItem = (rawItem, config) => {
  const raw = rawItem && typeof rawItem === 'object' ? rawItem : {};
  const isPbanc = isPbancCollection(config.collectionKey);

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
  const pbancNo = isPbanc ? pickResultFieldValue(raw, PBANC_RESULT_FIELDS.pbancNo) : '';
  const title = isPbanc
    ? pickResultFieldValue(raw, PBANC_RESULT_FIELDS.pbancName, '-')
    : pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.title, '-');
  const content = isPbanc
    ? buildPbancContent(raw)
    : pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.content);
  const workId = isPbanc
    ? pbancNo
    : pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.dataKey);
  const intgSrchRouteHintCd = pickResultFieldValue(
    raw,
    SEARCH_RESULT_FIELDS.intgSrchRouteHintCd,
  );
  const bbsCategoryId = pickResultFieldValue(raw, SEARCH_RESULT_FIELDS.dataCategory);
  const docId = workId;
  const linkUrl = isPbanc ? buildPbancDetailPath(config.collectionKey, pbancNo) : '';

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
    linkUrl,
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
    const [sortType, setSortType] = useState('Date');
    const [isAllLoading, setIsAllLoading] = useState(false);
    const [isTabLoading, setIsTabLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    //AI 답변 근거
    const [isAiAnswerBrief, setIsAiAnswerBrief] = useState(false);
    const [isAiEvidenceOpen, setIsAiEvidenceOpen] = useState(true);
    

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
        sort: getSearchSortParam(sortType),
      });
      const response = await apiClient.get(`/api/v1/search/totalSearch?${params.toString()}`);
      if (requestSerial !== allRequestSerialRef.current) return;

      const payload = normalizeApiPayload(response);
      const nextCollections = buildCollectionResultMap(payload, SEARCH_ALL_PREVIEW_COUNT);
      setTotalCount(sumVisibleCollectionCounts(nextCollections));
      setAllCollections(nextCollections);
      // 행동 수집: 어떤 검색어로 몇 건이 나왔는지 (JSONL WAL, best-effort)
      trackSearch(keyword, sumVisibleCollectionCounts(nextCollections), {
        scope: 'ALL',
        sort: sortType,
      });
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
  }, [sortType]);

  const fetchTabResults = useCallback(async ({ keyword, collectionKey, page }) => {
    const requestSerial = ++tabRequestSerialRef.current;
    setIsTabLoading(true);
    setErrorMessage('');

    try {
      const params = new URLSearchParams({
        query: keyword,
        collection: collectionKey,
        startCount: getSearchStartCount(page),
        sort: getSearchSortParam(sortType, collectionKey),
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
      // 행동 수집: 컬렉션 탭 검색(페이지 이동 포함)도 검색 행위로 기록한다
      trackSearch(keyword, normalized.count, {
        scope: collectionKey,
        page,
        sort: sortType,
      });
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
  }, [sortType]);

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

    if (!nextKeyword) {
      window.alert('검색어를 입력해주세요.');
      return;
    }

    setActiveTabIndex(0);
    setTabPageByCollection(createInitialPageState());

    if (nextKeyword === searchKeyword) {
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

  const handleSortChange = (nextSortType) => {
    setSortType(nextSortType);
    setTabPageByCollection(createInitialPageState());
  };

  const navigateByItem = useCallback(async (item) => {
    const hintCode = toTrimmedString(item.intgSrchRouteHintCd).toUpperCase();
    if (hintCode) {
      try {
        const resolved = await resolveIntegratedSearchRoute({
          intgSrchRouteHintCd: hintCode,
          workId: item.workId,
          bbsCategoryId: item.bbsCategoryId,
          parameter: {
            title: normalizeTitleForRouteParameter(item.title),
          },
        });

        if (resolved?.navigationType === 'EXTERNAL' && resolved?.externalUrl) {
          window.open(resolved.externalUrl, '_blank', 'noopener,noreferrer');
          return;
        }

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

  // 행동 수집: 어떤 검색어로 몇 번째 결과(어느 컬렉션의 어떤 문서)를 눌렀는지 기록한다
  const trackResultClick = useCallback(
    (item, rank) => {
      trackSearchResultClick({
        keyword: searchKeyword,
        refType: item.collectionKey,
        refId: item.workId || item.docId || null,
        rank,
        attrs: {
          title: normalizeTitleForRouteParameter(item.title).slice(0, 80) || null,
        },
      });
    },
    [searchKeyword],
  );

  const handleItemClick = async (event, item, rank) => {
    event.preventDefault();
    trackResultClick(item, rank);
    await navigateByItem(item);
  };

  const handleCertificateButtonClick = async (event, item, rank) => {
    event.preventDefault();
    trackResultClick(item, rank);
    await navigateByItem(item);
  };

  const totalCountByCollections = useMemo(
    () => sumVisibleCollectionCounts(allCollections),
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

  const renderCollectionCards = (config, items, { showCertificateButton, rankOffset = 0 }) => {
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
      const shouldRenderContent = hasRenderableResultText(item.content);
      const rank = rankOffset + index + 1;

      return (
        <div className="in" key={key}>
          <div className="card-top">
            <span className="krds-badge bg-light-primary">{buildBadgeLabel(item, config)}</span>
          </div>
          <div className="card-body">
            <a
              href={item.linkUrl || '#'}
              className="c-text c-date"
              onClick={(event) => handleItemClick(event, item, rank)}
            >
              <p className="c-tit no-icon">
                <span className="span onellipsis-2">{renderHighlightedText(item.title, '-')}</span>
              </p>
              {shouldRenderContent && (
                <p className="c-txt onellipsis-2">{renderHighlightedText(item.content, '')}</p>
              )}
              {!showCertificateButton && renderBreadcrumb(item)}
            </a>
          </div>
          {showCertificateButton && buttonLabel && (
            <div className="card-btn">
              <button
                type="button"
                className="krds-btn primary xlarge"
                onClick={(event) => handleCertificateButtonClick(event, item, rank)}
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
    // AI 검색 결과
    const renderAiAnswerSection = () => {
        if (!searchKeyword) return null;

        const evidenceList = [
            {
            type: '법령',
            title: '중소기업기본법 제2조',
            text: '중소기업의 기준과 범위에 대한 법령 근거입니다.',
            },
            {
            type: '법령',
            title: '중소기업기본법 시행령 별표1',
            text: '업종별 평균매출액 기준을 확인할 수 있습니다.',
            },
            {
            type: '고시',
            title: '중소기업 범위 관련 중기부 고시',
            text: '관계기업 및 독립성 기준에 대한 참고 근거입니다.',
            },
            {
            type: '고시',
            title: '중소기업 확인서 발급 안내',
            text: '확인서 발급 절차와 제출자료를 확인할 수 있습니다.',
            },
        ];

        return (
            <div className="search-result-list-wrap ai-answer-wrap">
                <ul className="krds-structured-list type-full ai-answer-list">
                    <li className={`structured-item ai-answer-item ${isAiEvidenceOpen ? 'is-evidence-open' : ''}`}>
                    <div className="ai-answer-main">
                        <div className="ai-answer-head">
                            <span className="ai-answer-badge">AI 답변</span>
                        </div>

                        <div className="in">
                            <div className="card-body">
                                <a className="c-text c-date">
                                    <p className="c-tit no-icon">
                                        <span className="span onellipsis-2">1. 중소기업 확인서란</span>
                                    </p>
                                    <p className="c-txt">
                                        중소기업 확인서는 중소기업기본법에 따른 중소기업 여부를 확인하는 서류입니다.
                                        공공기관 지원사업, 정책자금, 세제 혜택, 정부지원사업 신청 등에 활용될 수 있습니다.
                                    </p>
                                </a>
                            </div>
                        </div>

                        <div className="in">
                            <div className="card-body">
                                <a className="c-text c-date">
                                    <p className="c-tit no-icon">
                                        <span className="span onellipsis-2">2. 판정 기준</span>
                                    </p>
                                    <p className="c-txt">
                                        판정 기준은 크게 업종별 평균매출액 기준과 자산총액 기준으로 나뉩니다.
                                        기업의 업종, 매출액, 자산총액, 독립성 기준 등을 종합적으로 검토하여 판단합니다.
                                    </p>
                                </a>
                            </div>
                        </div>

                        {!isAiAnswerBrief && (
                        <>
                            <div className="in">
                                <div className="card-body">
                                    <a className="c-text c-date">
                                        <p className="c-tit no-icon">
                                            <span className="span onellipsis-2">3. 관계기업 주의사항</span>
                                        </p>
                                        <p className="c-txt">
                                            지배·종속 관계에 있는 계열기업이 있으면 매출액과 자산을 합산하여 판정할 수 있습니다.
                                            단독 기준을 충족하더라도 관계기업 기준에 따라 중소기업에서 제외될 수 있습니다.
                                        </p>
                                    </a>
                                </div>
                            </div>

                            <div className="in">
                                <div className="card-body">
                                    <a className="c-text c-date">
                                        <p className="c-tit no-icon">
                                            <span className="span onellipsis-2">4. 발급 방법</span>
                                        </p>
                                        <p className="c-txt">
                                            중소기업현황정보시스템에서 온라인으로 신청할 수 있으며, 제출자료를 기준으로
                                            규모 기준과 독립성 기준 충족 여부를 확인한 뒤 확인서가 발급됩니다.
                                        </p>
                                    </a>
                                </div>
                            </div>
                        </>
                        )}

                        <div className="ai-answer-btns">
                            <button
                                type="button"
                                className="krds-btn tertiary medium"
                                onClick={() => setIsAiAnswerBrief((prev) => !prev)}
                            >
                                {isAiAnswerBrief ? '자세히보기' : '간략보기'}
                            </button>

                            <button
                                type="button"
                                className="krds-btn tertiary medium"
                                onClick={() => setIsAiEvidenceOpen((prev) => !prev)}
                            >
                                <span>근거보기</span>
                                <strong>{evidenceList.length}</strong>
                            </button>

                            <button type="button" className="krds-btn primary medium">
                                AI에게 더 물어보기
                            </button>
                        </div>
                    </div>

                    {isAiEvidenceOpen && (
                        <div className="ai-answer-source">
                            <div className="ai-answer-source-head">
                                <strong>답변 근거</strong>
                                <button type="button"
                                    onClick={() => setIsAiEvidenceOpen(false)}
                                    aria-label="답변 근거 닫기"
                                >
                                <i className="svg-icon ico-close"></i>
                                </button>
                            </div>

                            <div className="ai-answer-source-list">
                                {evidenceList.map((item, index) => (
                                <button
                                    type="button"
                                    className="ai-answer-source-card"
                                    key={`${item.title}-${index}`}
                                >
                                    <span className="krds-badge bg-light-primary">{item.type}</span>
                                    <strong>{item.title}</strong>
                                    <p>{item.text}</p>
                                </button>
                                ))}
                            </div>

                            <p className="ai-answer-source-info">
                                원문 일부만 발췌했습니다. 전체는 외부 원문에서 확인하세요.
                            </p>
                        </div>
                    )}
                    </li>
                </ul>

                <p className="ai-answer-notice">
                    AI 답변은 참고용입니다. 정확한 내용은 공식 자료를 확인하세요.
                </p>
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
              rankOffset: (currentPage - 1) * SEARCH_TAB_LIST_COUNT,
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
            <ul className="sch-sort only-child">
              <li>
                <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
                <div className="w-sort-btn">
                  <button
                    type="button"
                    className={sortType === 'Date' ? 'active' : ''}
                    onClick={() => handleSortChange('Date')}
                  >
                    등록일순{sortType === 'Date' && <span className="sr-only">선택됨</span>}
                  </button>
                  <button
                    type="button"
                    className={sortType === 'DDLN' ? 'active' : ''}
                    onClick={() => handleSortChange('DDLN')}
                  >
                    마감일순{sortType === 'DDLN' && <span className="sr-only">선택됨</span>}
                  </button>
                </div>
                <div className="m-sort-btn">
                  <select
                    className="krds-form-select-sort"
                    id="sort"
                    value={sortType}
                    onChange={(event) => handleSortChange(event.target.value)}
                  >
                    <option value="Date">등록일순</option>
                    <option value="DDLN">마감일순</option>
                  </select>
                </div>
              </li>
            </ul>
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

                    {!isAllLoading && renderAiAnswerSection()}
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


