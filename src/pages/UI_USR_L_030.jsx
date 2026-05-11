import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import Pagination from '../components/ui/Pagination';
import Popup from '../components/ui/Popup';
import SideNavigation from '../components/ui/SideNavigation';
import Tab from '../components/ui/Tab.jsx';
import Tooltip from '../components/ui/Tooltip';
import { useUserMenu } from '../context/UserMenuContext.jsx';
import { api as apiClient } from '../lib/apiClient.js';
import { fetchAndConvertCommonCodes } from '../utils/commonCodeUtils.js';
import { appendListSearchToPath, getNumberSearchParam, getSearchParam, setQueryParam } from '../utils/listNavigation.js';
import { formatNumberWithCommas } from '../utils/numberUtils.js';

const TAB_LABELS = ['전체', '융자', '보증', '보험'];
const TAB_CODES = ['', 'FT01', 'FT02', 'FT03'];
const SORT_OPTIONS = [
  { code: 'INQ_CNT', name: '조회순' },
  { code: 'REG_DT', name: '등록순' },
];
const POLICY_FINANCE_COMMON_CODE_GROUPS = [
  'PLCY_FNNC_GDS_TYPE_CD',
  'PLCY_FNNC_RCPT_STTS_CD',
  'PLCY_FNNC_ENT_SCL_CD',
  'PLCY_FNNC_DTL_CND_CD',
  'PLCY_FNNC_APLY_MTH_CD',
  'PLCY_FNNC_SPRT_TRGT_FNDS_CD',
  'PLCY_FNDS_LOAN_MTH_CD',
  'FLCTN_IRT_TYPE_CD',
  'LOAN_PRD_SMRY_CD',
  'PLCY_FNNC_RPMT_MTHD_CD',
  'PLCY_FNNC_GDS_KND_CD',
  'PLCY_FNNC_GRNTE_RT_SMRY_CD',
  'PLCY_FNNC_CMPN_RT_SMRY_CD',
];
const SEARCH_TYPE_OPTIONS = [
  { code: 'ALL', name: '전체' },
  { code: '1', name: '상품명' },
  { code: '2', name: '해시태그' },
];
const COMMON_DETAIL_FILTER_KEYS = [
  'plcyFnncGdsTypeCd',
  'plcyFnncBizFlfmtInstNm',
  'plcyFnncEntSclCd',
  'plcyFnncRcptSttsCd',
  'plcyFnncAddDtlCndCn',
  'plcyFnncAplyMthCd',
];
const LOAN_DETAIL_FILTER_KEYS = [
  'plcyFnncSprtTrgtFndsCn',
  'flctnIrtYnCn',
  'plcyFnncRpmtMthdCd',
  'loanPrdSmryCd',
  'plcyFndsLoanMthCn',
  'thmTpbizNm',
];
const GRANT_DETAIL_FILTER_KEYS = [
  'plcyFnncSprtTrgtFndsCn',
  'plcyFnncGdsKndCd',
  'plcyFnncGrnteRtSmryCn',
];
const INSURANCE_DETAIL_FILTER_KEYS = [
  'plcyFnncCmpnRtSmryCn',
];
const EMPTY_FILTERS = {
  plcyFnncGdsTypeCd: '',
  plcyFnncSrchTypeCd: 'ALL',
  plcyFnncSrchKwdCn: '',
  plcyFnncBizFlfmtInstNm: '',
  plcyFnncEntSclCd: '',
  plcyFnncRcptSttsCd: '',
  plcyFnncAddDtlCndCn: '',
  plcyFnncAplyMthCd: '',
  plcyFnncSprtTrgtFndsCn: '',
  flctnIrtYnCn: '',
  plcyFnncRpmtMthdCd: '',
  loanPrdSmryCd: '',
  plcyFndsLoanMthCn: '',
  thmTpbizNm: '',
  plcyFnncGdsKndCd: '',
  plcyFnncGrnteRtSmryCn: '',
  plcyFnncCmpnRtSmryCn: '',
};

const getTabIndexFromSearch = (search) => {
  const tabIndex = getNumberSearchParam(search, 'tab', NaN);
  if (Number.isFinite(tabIndex) && tabIndex >= 0 && tabIndex < TAB_CODES.length) {
    return tabIndex;
  }

  const tabCode = getSearchParam(search, 'plcyFnncGdsTypeCd', '');
  const foundIndex = TAB_CODES.indexOf(tabCode);
  return foundIndex >= 0 ? foundIndex : 0;
};

const getFiltersFromSearch = (search) => {
  const nextFilters = { ...EMPTY_FILTERS };
  Object.keys(EMPTY_FILTERS).forEach((key) => {
    const value = getSearchParam(search, key, null);
    if (value !== null) {
      nextFilters[key] = value;
    }
  });
  return nextFilters;
};
const DEFAULT_FILTER_OPTIONS = {
  searchTypes: SEARCH_TYPE_OPTIONS,
  supportTypes: [],
  financialInsts: [],
  companySizes: [],
  receptionStatuses: [],
  preferredTypes: [],
  applicationMethods: [],
  repaymentMethods: [],
  interestChangeTypes: [],
  loanMethods: [],
  supportTargetFunds: [],
  loanPeriodSummaries: [],
  grantKinds: [],
  grantRateSummaries: [],
  insuranceRateSummaries: [],
};

const getStoredIndustries = () => {
  try {
    const stored = sessionStorage.getItem('policyFinanceIndustries');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to restore industry selection:', error);
    return [];
  }
};

const toPolicyFilterOptions = (commonCodes = {}) => ({
  searchTypes: SEARCH_TYPE_OPTIONS,
  supportTypes: (commonCodes.PLCY_FNNC_GDS_TYPE_CD || []).map((item) => ({ code: item.value, name: item.label })),
  companySizes: (commonCodes.PLCY_FNNC_ENT_SCL_CD || []).map((item) => ({ code: item.value, name: item.label })),
  receptionStatuses: (commonCodes.PLCY_FNNC_RCPT_STTS_CD || []).map((item) => ({ code: item.value, name: item.label })),
  preferredTypes: (commonCodes.PLCY_FNNC_DTL_CND_CD || []).map((item) => ({ code: item.value, name: item.label })),
  applicationMethods: (commonCodes.PLCY_FNNC_APLY_MTH_CD || []).map((item) => ({ code: item.value, name: item.label })),
  repaymentMethods: (commonCodes.PLCY_FNNC_RPMT_MTHD_CD || []).map((item) => ({ code: item.value, name: item.label })),
  interestChangeTypes: (commonCodes.FLCTN_IRT_TYPE_CD || []).map((item) => ({ code: item.value, name: item.label })),
  loanMethods: (commonCodes.PLCY_FNDS_LOAN_MTH_CD || []).map((item) => ({ code: item.value, name: item.label })),
  supportTargetFunds: (commonCodes.PLCY_FNNC_SPRT_TRGT_FNDS_CD || []).map((item) => ({ code: item.value, name: item.label })),
  loanPeriodSummaries: (commonCodes.LOAN_PRD_SMRY_CD || []).map((item) => ({ code: item.value, name: item.label })),
  grantKinds: (commonCodes.PLCY_FNNC_GDS_KND_CD || []).map((item) => ({ code: item.value, name: item.label })),
  grantRateSummaries: (commonCodes.PLCY_FNNC_GRNTE_RT_SMRY_CD || []).map((item) => ({ code: item.value, name: item.label })),
  insuranceRateSummaries: (commonCodes.PLCY_FNNC_CMPN_RT_SMRY_CD || []).map((item) => ({ code: item.value, name: item.label })),
});

const unwrapResponse = (response) => response?.data ?? response;
const tagList = (value) => (value || '').split(',').map((item) => item.trim()).filter(Boolean);
const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const asText = (value, fallback = '-') => (hasValue(value) ? value : fallback);
const formatDateDot = (value, fallback = '-') => {
  if (!hasValue(value)) return fallback;

  const text = String(value).trim();
  const ymd = text.match(/^(\d{4})[-./]?(\d{2})[-./]?(\d{2})$/);
  if (ymd) return `${ymd[1]}.${ymd[2]}.${ymd[3]}`;

  const ymdWithTime = text.match(/^(\d{4})[-./]?(\d{2})[-./]?(\d{2})[\sT].*$/);
  if (ymdWithTime) return `${ymdWithTime[1]}.${ymdWithTime[2]}.${ymdWithTime[3]}`;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return fallback;

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};
const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const asPlainText = (value, fallback = '-') => {
  const text = stripHtml(value);
  return text || fallback;
};
const stripHtmlKeepLineBreaks = (value) => {
  const text = String(value || '')
    .replace(/&lt;\s*br\s*\/?\s*&gt;/gi, '\n')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/&nbsp;|&#160;|&#xA0;/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\u00a0/g, ' ');

  return text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
};
const asPlainTextWithLineBreaks = (value, fallback = '-') => {
  const text = stripHtmlKeepLineBreaks(value);
  return text || fallback;
};
const splitMultiValue = (value) => String(value || '').split(/\s*,\s*/).map((item) => item.trim()).filter(Boolean);
const toCodeMap = (options = []) => options.reduce((acc, item) => {
  acc[String(item.code).trim()] = item.name;
  return acc;
}, {});
const decodeByMap = (value, codeMap) => {
  const values = splitMultiValue(value);
  if (values.length === 0) return '-';
  return values.map((item) => codeMap[item] || item).join(', ');
};
const decodeSingleValue = (value, codeMap, fallback = '-') => {
  if (!hasValue(value)) return fallback;
  return codeMap[String(value).trim()] || value;
};

const typeClass = (code) => {
  if (code === 'FT01') return 'bg-light-primary';
  if (code === 'FT02') return 'bg-light-success';
  if (code === 'FT03') return 'bg-light-warning';
  return 'bg-light-primary';
};

const renderSelectField = ({ id, label, value, onChange, options, placeholder, disabled = false }) => (
  <div>
    <label className="label" htmlFor={id}>{label}</label>
    <select id={id} className="krds-form-select small" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      <option value="">{placeholder}</option>
      {(options || []).map((item) => (
        <option key={item.code} value={item.code}>{item.name}</option>
      ))}
    </select>
  </div>
);

const renderIndustryFilterSection = ({ items, onOpen, onReset, onRemove }) => (
  <div className="on-mw100p filter-sect">
    <span className="label">업종</span>
    <button type="button" className="krds-btn small primary" onClick={onOpen}>
      선택
    </button>
    <dl className="filter-chip">
      <dd>
        <button type="button" className="krds-btn xlarge icon border" onClick={onReset}>
          <span className="sr-only">초기화</span>
          <i className="svg-icon ico-refresh"></i>
        </button>
        <div className="chip-wrap krds-tag-wrap large">
          {items.map((item) => (
            <span key={item.upperKsicCd} className="krds-btn-tag">
              {item.upperKsicNm}
              <button type="button" className="btn-delete" onClick={() => onRemove(item.upperKsicCd)}>
                <span className="sr-only">삭제</span>
              </button>
            </span>
          ))}
        </div>
      </dd>
    </dl>
  </div>
);

const getCompareRows = (typeCode) => {
  switch (typeCode) {
  case 'FT01':
    return [
      { label: '상품목적', key: 'plcyFnncGdsPrpsCn' },
      { label: '금융기관', key: 'plcyFnncBizFlfmtInstNm' },
      { label: '대출기간', values: ['loanPrdCn', 'loanPrdSmryNm', 'loanPrdSmryCd'], format: 'loanPeriodSummaries' },
      { label: '지원대상', key: 'plcyFnncSprtTrgtCn' },
      { label: '자금용도', values: ['plcyFnncSprtTrgtFndsCn', 'plcyFnncSprtTrgtFndsSmryCn'], format: 'supportTargetFunds' },
      { label: '대출한도', values: ['plcyFnncSprtLimCn', 'plcyFnncSprtLimSmryCn'] },
      { label: '우대조건', values: ['loanPrtrtCndCn', 'plcyFnncAddDtlCndCn'], format: 'preferredTypes' },
      { label: '상환방법', values: ['plcyFnncRpmtMthdNm', 'plcyFnncRpmtMthdCd'], format: 'repaymentMethods' },
      { label: '대출제외대상', key: 'plcyFnncSprtExclTrgtCn' },
      { label: '금리변동여부', key: 'flctnIrtYnCn', format: 'interestChangeTypes' },
    ];
  case 'FT02':
    return [
      { label: '상품목적', key: 'plcyFnncGdsPrpsCn' },
      { label: '금융기관', key: 'plcyFnncBizFlfmtInstNm' },
      { label: '보증비율', values: ['plcyFnncGrnteRtCn', 'plcyFnncGrnteRtSmryCn'] },
      { label: '보증료', key: 'plcyFnncGrfeCn' },
      { label: '지원대상자금', values: ['plcyFnncSprtTrgtFndsUsgCn', 'plcyFnncSprtTrgtFndsUsgSmryCn'], format: 'supportTargetFunds' },
      { label: '보증한도', values: ['plcyFnncSprtLimCn', 'plcyFnncSprtLimSmryCn'] },
      { label: '우대조건', values: ['grntePrtrtCndCn', 'plcyFnncAddDtlCndCn'], format: 'preferredTypes' },
      { label: '상품종류', values: ['plcyFnncGdsKndNm', 'plcyFnncGdsKndCd'], format: 'grantKinds' },
      { label: '보증제한대상', key: 'plcyFnncSprtExclTrgtCn' },
    ];
  case 'FT03':
    return [
      { label: '상품목적', key: 'plcyFnncGdsPrpsCn' },
      { label: '금융기관', key: 'plcyFnncBizFlfmtInstNm' },
      { label: '보험료 우대', values: ['plcyFnncIspmPrtrtCndCn', 'insrncPrtrtCndCn', 'plcyFnncAddDtlCndCn'], format: 'preferredTypes' },
      { label: '부보율(보상비율)', values: ['plcyFnncCmpnRtCn', 'plcyFnncCmpnRtSmryCn'] },
      { label: '지급보험금', values: ['plcyFnncGiveInsrncAmtCn', 'plcyFnncGiveInsrncAmtSmryCn'] },
      { label: '보험한도', values: ['plcyFnncSprtLimCn', 'plcyFnncSprtLimSmryCn'] },
      { label: '우대조건', values: ['insrncPrtrtCndCn', 'plcyFnncIspmPrtrtCndCn', 'plcyFnncAddDtlCndCn'], format: 'preferredTypes' },
      { label: '보험료', key: 'ispmCn' },
      { label: '보험증권 유효기간', key: 'insrncScrtVldPrdCn' },
    ];
  default:
    return [];
  }
};

const getCompareValue = (item, row, filterOptions) => {
  if (!item) return '-';
  const codeMap = row.format ? toCodeMap(filterOptions[row.format] || []) : null;
  if (row.key) {
    if (codeMap && hasValue(item[row.key])) return asPlainTextWithLineBreaks(decodeByMap(item[row.key], codeMap));
    return asPlainTextWithLineBreaks(item[row.key]);
  }
  if (row.values) {
    const matched = row.values.find((key) => hasValue(item[key]));
    if (!matched) return '-';
    if (codeMap) return asPlainTextWithLineBreaks(decodeByMap(item[matched], codeMap));
    return asPlainTextWithLineBreaks(item[matched]);
  }
  return '-';
};

const firstValue = (...values) => values.find((value) => hasValue(value)) || '';

const getListSummaryValue = (value, codeMap) => {
  if (!hasValue(value)) return '-';
  if (!codeMap) return value;
  return decodeByMap(value, codeMap);
};

const UI_USR_L_030 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const location = useLocation();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const filterWrapRef = useRef(null);
  const initialFilters = useMemo(() => getFiltersFromSearch(location.search), []);
  const initialTabIndex = useMemo(() => getTabIndexFromSearch(location.search), []);
  const filtersRef = useRef(initialFilters);
  const listRequestSeqRef = useRef(0);

  const [activeTabIndex, setActiveTabIndex] = useState(initialTabIndex);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState(DEFAULT_FILTER_OPTIONS);
  const [items, setItems] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [page, setPage] = useState(() => getNumberSearchParam(location.search, 'page', 1));
  const [size, setSize] = useState(() => getNumberSearchParam(location.search, 'size', 12));
  const [sortType, setSortType] = useState(() => getSearchParam(location.search, 'sortType', 'INQ_CNT'));
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [industryKeyword, setIndustryKeyword] = useState({ ksicCd: '', ksicNm: '' });
  const [industryResults, setIndustryResults] = useState([]);
  const [industryDraft, setIndustryDraft] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState(() => getStoredIndustries());
  const [appliedIndustries, setAppliedIndustries] = useState(() => getStoredIndustries());
  const [industryMessage, setIndustryMessage] = useState('');
  const [compareIds, setCompareIds] = useState([]);
  const [comparePopupOpen, setComparePopupOpen] = useState(false);
  const [compareItems, setCompareItems] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    sessionStorage.setItem('policyFinanceIndustries', JSON.stringify(selectedIndustries));
  }, [selectedIndustries]);

  useEffect(() => {
    const itemIds = new Set(items.map((item) => item.plcyFnncGdsSn));
    setCompareIds((prev) => prev.filter((id) => itemIds.has(id)));
  }, [items]);

  useEffect(() => {
    fetchAndConvertCommonCodes(POLICY_FINANCE_COMMON_CODE_GROUPS)
      .then((commonCodes) => {
        setFilterOptions((prev) => ({ ...prev, ...toPolicyFilterOptions(commonCodes) }));
      })
      .catch((error) => {
        console.error('Failed to load finance policy common codes:', error);
        setFilterOptions(DEFAULT_FILTER_OPTIONS);
      });
  }, []);

  const buildListSearchParams = () => {
    const params = new URLSearchParams();

    setQueryParam(params, 'tab', activeTabIndex, 0);
    setQueryParam(params, 'page', page, 1);
    setQueryParam(params, 'size', size, 12);
    setQueryParam(params, 'sortType', sortType, 'INQ_CNT');

    Object.entries(appliedFilters).forEach(([key, value]) => {
      const defaultValue = EMPTY_FILTERS[key] ?? '';
      setQueryParam(params, key, value, defaultValue);
    });

    if (appliedIndustries.length > 0) {
      setQueryParam(params, 'plcyFnncTpbizNm', appliedIndustries.map((item) => item.upperKsicCd).join(','));
    }

    return params;
  };

  useEffect(() => {
    const params = new URLSearchParams();
    const tabCode = TAB_CODES[activeTabIndex];
    if (tabCode) {
      params.set('plcyFnncGdsTypeCd', tabCode);
    }

    apiClient.get(`/api/v1/finance-policy/institutions${params.toString() ? `?${params.toString()}` : ''}`)
      .then((response) => {
        const data = unwrapResponse(response);
        const options = Array.isArray(data)
          ? data.map((item) => ({ code: item, name: item }))
          : [];
        setFilterOptions((prev) => ({ ...prev, financialInsts: options }));
        setFilters((prev) => {
          if (options.some((item) => item.code === prev.plcyFnncBizFlfmtInstNm)) {
            return prev;
          }
          return prev.plcyFnncBizFlfmtInstNm ? { ...prev, plcyFnncBizFlfmtInstNm: '' } : prev;
        });
        setAppliedFilters((prev) => {
          if (options.some((item) => item.code === prev.plcyFnncBizFlfmtInstNm)) {
            return prev;
          }
          return prev.plcyFnncBizFlfmtInstNm ? { ...prev, plcyFnncBizFlfmtInstNm: '' } : prev;
        });
      })
      .catch((error) => {
        console.error('Failed to load finance policy institutions:', error);
        setFilterOptions((prev) => ({ ...prev, financialInsts: [] }));
      });
  }, [activeTabIndex]);

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortType,
    });
    const tabCode = TAB_CODES[activeTabIndex];

    params.set('plcyFnncGdsTypeCd', tabCode || appliedFilters.plcyFnncGdsTypeCd || '');

    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value && key !== 'plcyFnncGdsTypeCd') {
        params.set(key, value);
      }
    });

    if (appliedIndustries.length > 0) {
      params.set('plcyFnncTpbizNm', appliedIndustries.map((item) => item.upperKsicCd).join(','));
    }

    setSearchParams(buildListSearchParams(), { replace: true });

    const requestSeq = ++listRequestSeqRef.current;
    setLoading(true);
    apiClient.get(`/api/v1/finance-policy/list?${params.toString()}`)
      .then((response) => {
        if (requestSeq !== listRequestSeqRef.current) {
          return;
        }
        const data = unwrapResponse(response);
        const content = data?.content || [];
        setItems(content);
        setTotalElements(data?.totalElements || 0);
        setTotalPages(data?.totalPages || 0);
      })
      .catch((error) => {
        if (requestSeq !== listRequestSeqRef.current) {
          return;
        }
        console.error('Failed to load finance policy list:', error);
        setItems([]);
        setTotalElements(0);
        setTotalPages(0);
      })
      .finally(() => {
        if (requestSeq === listRequestSeqRef.current) {
          setLoading(false);
        }
      });
  }, [activeTabIndex, appliedFilters, appliedIndustries, page, size, sortType]);

  useEffect(() => {
    const params = new URLSearchParams();
    const tabCode = TAB_CODES[activeTabIndex];
    if (tabCode) {
      params.set('plcyFnncGdsTypeCd', tabCode);
    }

    apiClient.get(`/api/v1/finance-policy/popular${params.toString() ? `?${params.toString()}` : ''}`)
      .then((response) => {
        const data = unwrapResponse(response);
        setPopularItems(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Failed to load popular finance policy items:', error);
        setPopularItems([]);
      });
  }, [activeTabIndex]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const applyDetailFilter = (key, value) => {
    const nextFilters = { ...filtersRef.current, [key]: value };
    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setCompareIds([]);
    setPage(1);
  };

  const applyIndustrySelection = (nextIndustries) => {
    setSelectedIndustries(nextIndustries);
    setAppliedIndustries(nextIndustries);
    setCompareIds([]);
    setPage(1);
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setAppliedIndustries(selectedIndustries);
    setCompareIds([]);
    setPage(1);
  };

  const applyHashtagFilter = (tag) => {
    const keyword = String(tag || '').trim();
    if (!keyword) return;

    const nextFilters = {
      ...filtersRef.current,
      plcyFnncSrchTypeCd: '2',
      plcyFnncSrchKwdCn: keyword,
    };

    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setCompareIds([]);
    setPage(1);
  };

  const searchIndustries = async () => {
    const ksicCd = industryKeyword.ksicCd.trim();
    const ksicNm = industryKeyword.ksicNm.trim();

    if (ksicCd.length < 2 && ksicNm.length < 2) {
      setIndustryResults([]);
      setIndustryMessage('업종코드 또는 업종명을 2글자 이상 입력해 주세요.');
      return;
    }

    const params = new URLSearchParams();
    if (ksicCd.length >= 2) params.set('ksicCd', ksicCd);
    if (ksicNm.length >= 2) params.set('ksicNm', ksicNm);

    try {
      const response = await apiClient.get(`/api/v1/finance-policy/industries?${params.toString()}`);
      const data = unwrapResponse(response);
      setIndustryResults(data || []);
      setIndustryMessage(data?.length ? '' : '검색 결과가 없습니다.');
    } catch (error) {
      console.error('Failed to search industries:', error);
      setIndustryResults([]);
      setIndustryMessage('업종 검색에 실패했습니다.');
    }
  };

  const showLoan = activeTabIndex === 1;
  const showGrant = activeTabIndex === 2;
  const showInsurance = activeTabIndex === 3;
  const showCompare = activeTabIndex !== 0;
  const compareRows = useMemo(() => getCompareRows(TAB_CODES[activeTabIndex]), [activeTabIndex]);
  const hasActiveDetailFilters = useMemo(() => {
    const visibleKeys = [...COMMON_DETAIL_FILTER_KEYS];

    if (activeTabIndex === 0) {
      visibleKeys.unshift('plcyFnncGdsTypeCd');
    }
    if (activeTabIndex === 1) {
      visibleKeys.push(...LOAN_DETAIL_FILTER_KEYS);
    }
    if (activeTabIndex === 2) {
      visibleKeys.push(...GRANT_DETAIL_FILTER_KEYS);
    }
    if (activeTabIndex === 3) {
      visibleKeys.push(...INSURANCE_DETAIL_FILTER_KEYS);
    }

    return visibleKeys.some((key) => hasValue(filters[key])) || selectedIndustries.length > 0;
  }, [activeTabIndex, filters, selectedIndustries]);
  const supportTypesMap = useMemo(() => toCodeMap(filterOptions.supportTypes), [filterOptions.supportTypes]);
  const supportTargetFundsMap = useMemo(() => toCodeMap(filterOptions.supportTargetFunds), [filterOptions.supportTargetFunds]);
  const interestChangeTypesMap = useMemo(() => toCodeMap(filterOptions.interestChangeTypes), [filterOptions.interestChangeTypes]);

  const renderTypeSpecificListFields = (item) => {
    if (activeTabIndex === 1) {
      return (
        <p className="on-list-btm">
          <span><strong>용도</strong>{getListSummaryValue(firstValue(item.plcyFnncSprtTrgtFndsSmryCn, item.plcyFnncSprtTrgtFndsCn), supportTargetFundsMap)}</span>
          <span><strong>금리변동여부</strong>{getListSummaryValue(item.flctnIrtYnCn, interestChangeTypesMap)}</span>
          <span><strong>대출한도</strong>{asText(firstValue(item.plcyFnncSprtLimSmryCn, item.plcyFnncSprtLimCn))}</span>
        </p>
      );
    }
    if (activeTabIndex === 2) {
      return (
        <p className="on-list-btm">
          <span><strong>용도</strong>{getListSummaryValue(firstValue(item.plcyFnncSprtTrgtFndsUsgSmryCn, item.plcyFnncSprtTrgtFndsUsgCn), supportTargetFundsMap)}</span>
          <span><strong>보증비율</strong>{asText(firstValue(item.plcyFnncGrnteRtSmryCn, item.plcyFnncGrnteRtCn))}</span>
        </p>
      );
    }
    if (activeTabIndex === 3) {
      return (
        <p className="on-list-btm">
          <span><strong>지급보험금</strong><span className="onellipsis-1">{asText(firstValue(item.plcyFnncGiveInsrncAmtSmryCn, item.plcyFnncGiveInsrncAmtCn))}</span></span>
          <span><strong>보험료</strong><span className="onellipsis-1">{asText(item.ispmCn)}</span></span>
        </p>
      );
    }
    return null;
  };

  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    setFilterOptions((prev) => ({ ...prev, financialInsts: [] }));
    filtersRef.current = EMPTY_FILTERS;
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setSelectedIndustries([]);
    setAppliedIndustries([]);
    setIndustryDraft([]);
    setIndustryKeyword({ ksicCd: '', ksicNm: '' });
    setIndustryResults([]);
    setIndustryMessage('');
    setCompareIds([]);
    setCompareItems([]);
    setComparePopupOpen(false);
    setPage(1);
  };

  const resetIndustrySelection = () => {
    applyIndustrySelection([]);
    setIndustryDraft([]);
  };

  const removeIndustrySelection = (upperKsicCd) => {
    const next = selectedIndustries.filter((item) => item.upperKsicCd !== upperKsicCd);
    applyIndustrySelection(next);
    setIndustryDraft((prev) => prev.filter((item) => item.upperKsicCd !== upperKsicCd));
  };

  const toggleCompare = (goodsSn, checked) => {
    setCompareIds((prev) => {
      if (!checked) return prev.filter((id) => id !== goodsSn);
      if (prev.includes(goodsSn)) return prev;
      if (prev.length >= 2) {
        alert('상품 비교는 2개까지만 선택할 수 있습니다.');
        return prev;
      }
      return [...prev, goodsSn];
    });
  };

  const openComparePopup = async () => {
    if (compareIds.length === 0) {
      alert('선택된 항목이 없습니다.');
      return;
    }
    if (compareIds.length !== 2) {
      alert('항목은 반드시 2개만 선택해주세요.');
      return;
    }

    try {
      setCompareLoading(true);
      const responses = await Promise.all(
        // 비교 팝업용 상세 조회는 통계 집계(조회수/키워드/이력)에서 제외한다.
        compareIds.map((goodsSn) => apiClient.get(`/api/v1/finance-policy/${goodsSn}?trackYn=N`)),
      );
      setCompareItems(responses.map((response) => unwrapResponse(response)));
      setComparePopupOpen(true);
    } catch (error) {
      console.error('Failed to load finance policy compare data:', error);
      alert('상품 비교 정보를 불러오지 못했습니다.');
    } finally {
      setCompareLoading(false);
    }
  };

  const buildDetailSearchQuery = () => {
    const params = new URLSearchParams();
    const srchText = (appliedFilters.plcyFnncSrchKwdCn || '').trim();
    if (srchText) {
      params.set('srchText', srchText);
    }
    const reSrchText = new URLSearchParams(window.location.search).get('reSrchText')?.trim();
    if (reSrchText) {
      params.set('reSrchText', reSrchText);
    }
    return params.toString();
  };

  const navigateToDetail = (goodsSn) => {
    const queryString = buildDetailSearchQuery();
    const listSearch = buildListSearchParams().toString();
    const detailPath = queryString ? `${goodsSn}?${queryString}` : `${goodsSn}`;
    navigate(appendListSearchToPath(detailPath, listSearch));
  };

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <h2 className="h-tit">정책금융</h2>
        </div>

        <div className="krds-tab-area layer">
          <Tab tabData={TAB_LABELS} onTabChange={handleTabChange} activeIndex={activeTabIndex} />
          <div className="conts-desc">
            중소기업 성장과 경영 안정을 위해 제공하는 다양한 정책금융 상품을 조회할 수 있습니다.
          </div>

          <div className="tab-conts-wrap">
            <section className="tab-conts active">
              <h3 className="sr-only">정책금융 목록</h3>

              <div className="search-top-box">
                <div className="sch-form-wrap" ref={filterWrapRef}>
                  <select className="krds-form-select medium" aria-label="검색 구분 선택" value={filters.plcyFnncSrchTypeCd} onChange={(e) => updateFilter('plcyFnncSrchTypeCd', e.target.value)}>
                    <option value="ALL">전체</option>
                    {filterOptions.searchTypes.filter((item) => item.code !== 'ALL').map((item) => (
                      <option key={item.code} value={item.code}>{item.name}</option>
                    ))}
                  </select>
                  <div className="sch-input">
                    <input
                      type="text"
                      className="krds-input medium"
                      placeholder="금융상품 검색어를 입력해 주세요"
                      title="검색어 입력"
                      value={filters.plcyFnncSrchKwdCn}
                      onChange={(e) => updateFilter('plcyFnncSrchKwdCn', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                    <button type="button" className="krds-btn medium icon ico-search" onClick={applyFilters}>
                      <span className="sr-only">검색</span>
                      <i className="svg-icon ico-sch"></i>
                    </button>
                  </div>
                  <button
                    type="button"
                    className={`krds-btn small text${hasActiveDetailFilters ? ' primary' : ''}`}
                    onClick={() => filterWrapRef.current?.classList.toggle('on')}
                  >
                    <i className="svg-icon ico-sch-plus"></i>
                    상세검색
                    <span className="onfilter-open sr-only">열기</span>
                    <span className="onfilter-close sr-only">닫기</span>
                  </button>
                </div>

                <div className="sch-filter-box">
                  <div className="filter-form">
                    {activeTabIndex === 0 && renderSelectField({
                      id: 'plcyFnncGdsTypeCd',
                      label: '상품유형',
                      value: filters.plcyFnncGdsTypeCd,
                      onChange: (value) => applyDetailFilter('plcyFnncGdsTypeCd', value),
                      options: filterOptions.supportTypes,
                      placeholder: '전체',
                    })}
                    {renderSelectField({
                      id: `plcyFnncBizFlfmtInstNm-${activeTabIndex}`,
                      label: '금융기관',
                      value: filters.plcyFnncBizFlfmtInstNm,
                      onChange: (value) => applyDetailFilter('plcyFnncBizFlfmtInstNm', value),
                      options: filterOptions.financialInsts,
                      placeholder: '전체',
                    })}
                    {renderSelectField({
                      id: 'plcyFnncEntSclCd',
                      label: '기업규모',
                      value: filters.plcyFnncEntSclCd,
                      onChange: (value) => applyDetailFilter('plcyFnncEntSclCd', value),
                      options: filterOptions.companySizes,
                      placeholder: '전체',
                    })}
                    
                    {showLoan && (
                      <div className="on-mw100p">
                        <label className="label" htmlFor="thmTpbizNm">테마업종명</label>
                        <input id="thmTpbizNm" type="text" className="krds-input medium" value={filters.thmTpbizNm} onChange={(e) => updateFilter('thmTpbizNm', e.target.value)} />
                      </div>
                    )}
                    {renderSelectField({
                      id: 'plcyFnncRcptSttsCd',
                      label: '접수상태',
                      value: filters.plcyFnncRcptSttsCd,
                      onChange: (value) => applyDetailFilter('plcyFnncRcptSttsCd', value),
                      options: filterOptions.receptionStatuses,
                      placeholder: '전체',
                    })}
                    {renderSelectField({
                      id: 'plcyFnncAddDtlCndCn',
                      label: '우대기업',
                      value: filters.plcyFnncAddDtlCndCn,
                      onChange: (value) => applyDetailFilter('plcyFnncAddDtlCndCn', value),
                      options: filterOptions.preferredTypes,
                      placeholder: '전체',
                    })}
                    {renderSelectField({
                      id: 'plcyFnncAplyMthCd',
                      label: '신청방식',
                      value: filters.plcyFnncAplyMthCd,
                      onChange: (value) => applyDetailFilter('plcyFnncAplyMthCd', value),
                      options: filterOptions.applicationMethods,
                      placeholder: '전체',
                    })}
                    {renderIndustryFilterSection({
                      items: selectedIndustries,
                      onOpen: () => { setIndustryDraft(selectedIndustries); setPopupOpen(true); },
                      onReset: resetIndustrySelection,
                      onRemove: removeIndustrySelection,
                    })}
                  </div>

                  {showLoan && (
                    <div className="filter-form">
                      {renderSelectField({ id: 'plcyFnncRpmtMthdCd', label: '상환방법', value: filters.plcyFnncRpmtMthdCd, onChange: (value) => applyDetailFilter('plcyFnncRpmtMthdCd', value), options: filterOptions.repaymentMethods, placeholder: '전체' })}
                      {renderSelectField({ id: 'flctnIrtYnCn', label: '금리변동여부', value: filters.flctnIrtYnCn, onChange: (value) => applyDetailFilter('flctnIrtYnCn', value), options: filterOptions.interestChangeTypes, placeholder: '전체' })}
                      {renderSelectField({ id: 'plcyFndsLoanMthCn', label: '융자방식', value: filters.plcyFndsLoanMthCn, onChange: (value) => applyDetailFilter('plcyFndsLoanMthCn', value), options: filterOptions.loanMethods, placeholder: '전체' })}
                      {renderSelectField({ id: 'plcyFnncSprtTrgtFndsCn', label: '자금용도', value: filters.plcyFnncSprtTrgtFndsCn, onChange: (value) => applyDetailFilter('plcyFnncSprtTrgtFndsCn', value), options: filterOptions.supportTargetFunds, placeholder: '전체' })}
                      {renderSelectField({ id: 'loanPrdSmryCd', label: '대출기간', value: filters.loanPrdSmryCd, onChange: (value) => applyDetailFilter('loanPrdSmryCd', value), options: filterOptions.loanPeriodSummaries, placeholder: '전체' })}
                    </div>
                  )}

                  {showGrant && (
                    <div className="filter-form">
                      {renderSelectField({ id: 'plcyFnncSprtTrgtFndsCn', label: '지원대상 자금', value: filters.plcyFnncSprtTrgtFndsCn, onChange: (value) => applyDetailFilter('plcyFnncSprtTrgtFndsCn', value), options: filterOptions.supportTargetFunds, placeholder: '전체' })}
                      {renderSelectField({ id: 'plcyFnncGdsKndCd', label: '상품종류', value: filters.plcyFnncGdsKndCd, onChange: (value) => applyDetailFilter('plcyFnncGdsKndCd', value), options: filterOptions.grantKinds, placeholder: '전체' })}
                      {renderSelectField({ id: 'plcyFnncGrnteRtSmryCn', label: '보증비율', value: filters.plcyFnncGrnteRtSmryCn, onChange: (value) => applyDetailFilter('plcyFnncGrnteRtSmryCn', value), options: filterOptions.grantRateSummaries, placeholder: '전체' })}
                    </div>
                  )}

                  {showInsurance && (
                    <div className="filter-form">
                      {renderSelectField({ id: 'plcyFnncCmpnRtSmryCn', label: '보상비율', value: filters.plcyFnncCmpnRtSmryCn, onChange: (value) => applyDetailFilter('plcyFnncCmpnRtSmryCn', value), options: filterOptions.insuranceRateSummaries, placeholder: '전체' })}
                    </div>
                  )}
                </div>
              </div>

              <div className="onhotbox">
                <div className="onhot-title">
                  <p>
                    <i className="svg-icon ico-hot"></i>
                    인기 금융상품
                  </p>
                  <Tooltip tooltipText="인기 금융상품은 이용자가 가장 많이 찾는 금융 정책 상품입니다.">
                    <span className="sr-only">안내</span>
                    <i className="svg-icon ico-help-gray"></i>
                  </Tooltip>
                </div>
                <div className="krds-tag-wrap">
                  {popularItems.length === 0 ? (
                    <span className="krds-btn-tag">노출할 상품이 없습니다.</span>
                  ) : (
                    popularItems.map((item) => (
                      <button type="button" key={`popular-${item.plcyFnncGdsSn}`} className="krds-btn-tag" onClick={() => navigateToDetail(item.plcyFnncGdsSn)}>
                        #{item.plcyFnncGdsNm}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="search-list-top">
                <ul className="sch-info" aria-live="polite">
                  <li>검색 결과 <span className="point">{formatNumberWithCommas(totalElements || 0)}</span>건</li>
                </ul>
                <ul className="sch-sort">
                  <li>
                    <strong className="sort-label"><label htmlFor="search_result_count">목록 표시 개수</label></strong>
                    <select className="krds-form-select-sort" id="search_result_count" value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}>
                      {[12, 24, 36].map((item) => <option key={item} value={item}>{item}개</option>)}
                    </select>
                  </li>
                  <li>
                    <strong className="sort-label"><label htmlFor="sort">정렬기준</label></strong>
                    <div className="w-sort-btn">
                      {SORT_OPTIONS.map((option) => (
                        <button key={option.code} type="button" className={sortType === option.code ? 'active' : ''} onClick={() => { setSortType(option.code); setPage(1); }}>
                          {option.name}
                          {sortType === option.code && <span className="sr-only">선택됨</span>}
                        </button>
                      ))}
                    </div>
                    <div className="m-sort-btn">
                      <select className="krds-form-select-sort" id="sort" value={sortType} onChange={(e) => { setSortType(e.target.value); setPage(1); }}>
                        {SORT_OPTIONS.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}
                      </select>
                    </div>
                  </li>
                  {showCompare && (
                    <li className="margin-top13">
                      <button type="button" className="krds-btn small primary" onClick={openComparePopup} disabled={compareLoading}>
                        <i className="svg-icon ico-round-check"></i>
                        상품비교
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              <ul className="krds-structured-list type-full">
                {loading ? (
                  <li className="structured-item"><div className="in" style={{ padding: 40, textAlign: 'center' }}>목록을 불러오는 중입니다.</div></li>
                ) : items.length === 0 ? (
                  <li className="structured-item"><div className="in" style={{ padding: 40, textAlign: 'center' }}>조회 결과가 없습니다.</div></li>
                ) : (
                  items.map((item) => (
                    <li className="structured-item" key={item.plcyFnncGdsSn}>
                      <div className="in">
                        <div className="card-top">
                          {showCompare && (
                            <div className="krds-form-check large no-txt">
                              <input
                                type="checkbox"
                                id={`compare-${item.plcyFnncGdsSn}`}
                                checked={compareIds.includes(item.plcyFnncGdsSn)}
                                onChange={(e) => toggleCompare(item.plcyFnncGdsSn, e.target.checked)}
                              />
                              <label htmlFor={`compare-${item.plcyFnncGdsSn}`}></label>
                            </div>
                          )}
                          <div className="krds-badge-wrap">
                            {item.isHotGod === 'Y' && <span className="krds-badge bg-light-danger">인기</span>}
                            {item.isNewGod === 'Y' && <span className="krds-badge bg-light-success">신규</span>}
                            <span className={`krds-badge ${typeClass(item.plcyFnncGdsTypeCd)}`}>{decodeSingleValue(item.plcyFnncGdsTypeNm || item.plcyFnncGdsTypeCd, supportTypesMap, '정책금융')}</span>
                          </div>
                        </div>
                        <div className="card-body">
                          <a href="#" className="c-text" onClick={(e) => { e.preventDefault(); navigateToDetail(item.plcyFnncGdsSn); }}>
                            <p className="c-tit visited sml no-icon"><span className="span">{item.plcyFnncGdsNm}</span></p>
                            <p className="c-txt onellipsis-2">{asPlainText(item.plcyFnncGdsPrpsCn)}</p>
                            <p className="on-list-btm">
                              <span>
                                <i className="svg-icon ico-checkbox on-bgcolorblue"></i>
                                <strong className="on-colorblue">{item.plcyFnncRcptSttsNm || '상태미정'}</strong>
                              </span>
                              <span><strong>{asText(item.plcyFnncBizFlfmtInstNm || item.plcyFnncBizFlfmtInstCd)}</strong></span>
                              <span className="max-w"><strong>지원대상</strong> <span className="onellipsis-1">{asPlainText(item.plcyFnncSprtTrgtCn)}</span></span>
                            </p>
                            {renderTypeSpecificListFields(item)}
                          </a>
                        </div>
                        <div className="card-form">
                          <div className="card-btm">
                            {tagList(item.hashtags).slice(0, 4).map((tag) => (
                              <span
                                className="tag"
                                key={`${item.plcyFnncGdsSn}-${tag}`}
                                role="button"
                                tabIndex={0}
                                onClick={() => applyHashtagFilter(tag)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    applyHashtagFilter(tag);
                                  }
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="regist-date">
                            등록일 : <b>{formatDateDot(item.plcyFnncFrstRegDt)}</b>
                          </div>
                        </div>
                        <div className="card-btn">
                          <span className="krds-btn text">
                            <span className="sr-only">조회수</span>
                            <i className="svg-icon ico-pw-visible-on"></i>
                            <span>{item.inqCnt || 0}</span>
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>

              {!loading && totalPages > 0 && <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} syncUrl />}
            </section>
          </div>
        </div>
      </div>

      <Popup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        title="업종선택"
        footer={(
          <>
            <button type="button" className="krds-btn tertiary medium" onClick={() => setPopupOpen(false)}>닫기</button>
            <button type="button" className="krds-btn primary medium" onClick={() => { applyIndustrySelection(industryDraft); setPopupOpen(false); }}>적용</button>
          </>
        )}
      >
        <div className="search-top-box">
          <div className="sch-form-wrap">
            <div className="input-wrap w-180">
              <input
                type="text"
                className="krds-input medium"
                placeholder="업종코드"
                title="업종코드 입력"
                value={industryKeyword.ksicCd}
                onChange={(e) => setIndustryKeyword((prev) => ({ ...prev, ksicCd: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && searchIndustries()}
              />
            </div>

            <div className="sch-input w-304">
              <input
                type="text"
                className="krds-input medium"
                placeholder="업종명"
                title="업종명 입력"
                value={industryKeyword.ksicNm}
                onChange={(e) => setIndustryKeyword((prev) => ({ ...prev, ksicNm: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && searchIndustries()}
              />
              <button type="button" className="krds-btn medium icon ico-search" onClick={searchIndustries}>
                <span className="sr-only">검색</span>
                <i className="svg-icon ico-sch"></i>
              </button>
            </div>

            <button
              type="button"
              className="krds-btn xlarge icon border"
              onClick={() => {
                setIndustryKeyword({ ksicCd: '', ksicNm: '' });
                setIndustryResults([]);
                setIndustryMessage('');
                setIndustryDraft([]);
              }}
            >
              <span className="sr-only">초기화</span>
              <i className="svg-icon ico-refresh"></i>
            </button>
          </div>
        </div>

        <p className="txt-caution has-icon">
          <i className="svg-icon ico-info"></i> {industryMessage || '업종코드 또는 업종명 중 하나를 2글자 이상 입력해야 합니다.'}
        </p>

        <div className="krds-table-wrap mt-8">
          <table className="tbl col data">
            <caption>업종선택 표. 번호, 대분류 코드, 대분류명, 업종코드, 업종명 정보를 제공합니다.</caption>
            <colgroup>
              <col style={{ width: '8%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '16%' }} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" rowSpan={2} className="ac bd-r">번호</th>
                <th scope="col" colSpan={2} className="ac bd-r">대분류</th>
                <th scope="col" colSpan={2} className="ac">세분류</th>
              </tr>
              <tr>
                <th scope="col" className="ac">코드</th>
                <th scope="col" className="ac">분류명</th>
                <th scope="col" className="ac">업종코드</th>
                <th scope="col" className="ac">업종명</th>
              </tr>
            </thead>
            <tbody>
              {industryResults.length === 0 ? (
                <tr><td colSpan={5} className="ac">조회된 업종이 없습니다.</td></tr>
              ) : (
                industryResults.map((item, index) => (
                  <tr key={`${item.ksicCd}-${item.ksicNm}`}>
                    <td className="ac"><span>{index + 1}</span></td>
                    <td className="ac"><span>{item.upperKsicCd}</span></td>
                    <td className="ac">
                      <span>
                        <button
                          type="button"
                          className="underline"
                          onClick={() => {
                            setIndustryDraft((prev) => (
                              prev.some((selected) => selected.upperKsicCd === item.upperKsicCd) ? prev : [...prev, item]
                            ));
                          }}
                        >
                          {item.upperKsicNm}
                        </button>
                      </span>
                    </td>
                    <td className="ac"><span>{item.ksicCd}</span></td>
                    <td><span>{item.ksicNm}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="search-top-box only-filter mt-8">
          <dl className="filter-chip">
            <dt>선택된 필터 <span className="num">{industryDraft.length}</span></dt>
            <dd>
              <button
                type="button"
                className="krds-btn xlarge icon border"
                onClick={() => setIndustryDraft([])}
              >
                <span className="sr-only">초기화</span>
                <i className="svg-icon ico-refresh"></i>
              </button>
              <div className="chip-wrap krds-tag-wrap large">
                {industryDraft.map((item) => (
                  <span key={item.upperKsicCd} className="krds-btn-tag">
                    {item.upperKsicNm}
                    <button type="button" className="btn-delete" onClick={() => setIndustryDraft((prev) => prev.filter((selected) => selected.upperKsicCd !== item.upperKsicCd))}>
                      <span className="sr-only">삭제</span>
                    </button>
                  </span>
                ))}
              </div>
            </dd>
          </dl>
        </div>
      </Popup>

      <Popup
        isOpen={comparePopupOpen}
        onClose={() => setComparePopupOpen(false)}
        title="상품비교"
        footer={<button type="button" className="krds-btn tertiary medium" onClick={() => setComparePopupOpen(false)}>닫기</button>}
      >
        <div className="conts-wrap">
          <div className="krds-table-wrap">
            <table className="tbl col data tbl-row">
              <caption>정책금융 상품비교 표. 항목명과 선택한 두 상품의 비교 정보를 제공합니다.</caption>
              <colgroup>
                <col style={{ width: '18%' }} />
                <col />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row" className="ac">상품명</th>
                  <td className="ac"><strong>{asText(compareItems[0]?.plcyFnncGdsNm)}</strong></td>
                  <td className="ac"><strong>{asText(compareItems[1]?.plcyFnncGdsNm)}</strong></td>
                </tr>
                {compareRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="ac">{row.label}</th>
                    <td style={{ whiteSpace: 'pre-line' }}>{getCompareValue(compareItems[0], row, filterOptions)}</td>
                    <td style={{ whiteSpace: 'pre-line' }}>{getCompareValue(compareItems[1], row, filterOptions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default UI_USR_L_030;
