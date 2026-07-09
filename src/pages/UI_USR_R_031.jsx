import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import SideNavigation from '../components/ui/SideNavigation';
import { useUserMenu } from '../context/UserMenuContext.jsx';
import { api as apiClient } from '../lib/apiClient.js';
import { trackApplyStart, trackScrap } from '../lib/behaviorTracker.js';
import { fetchAndConvertCommonCodes } from '../utils/commonCodeUtils.js';
import { resolveListBackPath } from '../utils/listNavigation.js';
import { useAuthStore } from '../store/useAuthStore.jsx';

const DEFAULT_FILTER_OPTIONS = {
  searchTypes: [{ code: 'ALL', name: '전체' }, { code: '1', name: '상품명' }, { code: '2', name: '해시태그' }],
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
const toPolicyFilterOptions = (commonCodes = {}) => ({
  searchTypes: DEFAULT_FILTER_OPTIONS.searchTypes,
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
const resolveApiErrorMessage = (error, fallbackMessage) =>
  error?.data?.message || error?.message || fallbackMessage;
const tagsFrom = (value) => (value || '').split(',').map((item) => item.trim()).filter(Boolean);
const splitMultiValue = (value) => String(value || '').split(/\s*,\s*/).map((item) => item.trim()).filter(Boolean);
const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const asText = (value, fallback = '-') => (hasValue(value) ? value : fallback);
const ALLOWED_HTML_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CAPTION', 'COL', 'COLGROUP', 'DIV', 'EM', 'FIGCAPTION', 'FIGURE',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'I', 'IMG', 'LI', 'OL', 'P', 'PRE', 'S', 'SPAN',
  'STRONG', 'SUB', 'SUP', 'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'U', 'UL',
]);
const ALLOWED_HTML_ATTRS = new Set(['alt', 'colspan', 'href', 'rowspan', 'src', 'target', 'title']);

const pairRows = (items) => {
  const pairs = [];
  for (let index = 0; index < items.length; index += 2) {
    pairs.push(items.slice(index, index + 2));
  }
  return pairs;
};
const groupRows = (...items) => items.filter((item) => hasValue(item?.value));

const toCodeMap = (options = []) => options.reduce((acc, item) => {
  acc[String(item.code).trim()] = item.name;
  return acc;
}, {});

const decodeByMap = (value, codeMap) => {
  const values = splitMultiValue(value);
  if (values.length === 0) return '-';
  return values.map((item) => codeMap[item] || item).join(', ');
};

const buildIndustryGroupMap = (items = []) => items.reduce((acc, item) => {
  if (item?.upperKsicCd && item?.upperKsicNm && !acc[item.upperKsicCd]) {
    acc[item.upperKsicCd] = item.upperKsicNm;
  }
  return acc;
}, {});

const sanitizeHtml = (html) => {
  if (!hasValue(html) || typeof window === 'undefined') return '';

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(String(html), 'text/html');

  const cleanNode = (node) => {
    if (node.nodeType === window.Node.TEXT_NODE) return;
    if (node.nodeType !== window.Node.ELEMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }

    const element = node;
    if (!ALLOWED_HTML_TAGS.has(element.tagName)) {
      const parent = element.parentNode;
      while (element.firstChild) {
        parent?.insertBefore(element.firstChild, element);
      }
      parent?.removeChild(element);
      return;
    }

    [...element.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value || '';
      const allowedAttr = ALLOWED_HTML_ATTRS.has(name);
      const eventAttr = name.startsWith('on');
      const javascriptUrl = (name === 'href' || name === 'src') && /^\s*javascript:/i.test(value);

      if (!allowedAttr || eventAttr || javascriptUrl) {
        element.removeAttribute(attr.name);
      }
    });

    if (element.tagName === 'A' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noreferrer noopener');
    }

    [...element.childNodes].forEach(cleanNode);
  };

  [...doc.body.childNodes].forEach(cleanNode);
  return doc.body.innerHTML;
};

const renderHtmlValue = (value) => {
  if (!hasValue(value)) return '-';
  const sanitized = sanitizeHtml(value);
  if (!sanitized) return '-';
  return <div className="editor-view" dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

const createCodeFormatter = (filterOptions, industryGroups) => {
  const maps = {
    supportTypes: toCodeMap(filterOptions.supportTypes),
    companySizes: toCodeMap(filterOptions.companySizes),
    preferredTypes: toCodeMap(filterOptions.preferredTypes),
    applicationMethods: toCodeMap(filterOptions.applicationMethods),
    repaymentMethods: toCodeMap(filterOptions.repaymentMethods),
    interestChangeTypes: toCodeMap(filterOptions.interestChangeTypes),
    loanMethods: toCodeMap(filterOptions.loanMethods),
    supportTargetFunds: toCodeMap(filterOptions.supportTargetFunds),
    loanPeriodSummaries: toCodeMap(filterOptions.loanPeriodSummaries),
    grantKinds: toCodeMap(filterOptions.grantKinds),
  };

  return (value, key) => {
    if (!hasValue(value)) return '-';
    if (key === 'industryGroups') {
      const values = splitMultiValue(value);
      if (values.length === 0) return '업종제한없음';
      const decoded = values
        .map((item) => industryGroups[item])
        .filter(Boolean);
      return decoded.length > 0 ? decoded.join(', ') : '업종제한없음';
    }
    const codeMap = maps[key];
    if (!codeMap || Object.keys(codeMap).length === 0) return asText(value);
    return decodeByMap(value, codeMap);
  };
};

const getTypeConfig = (detail, formatCode) => {
  if (!detail) {
    return {
      typeName: '',
      summaryItems: [],
      groups: [],
    };
  }

  switch (detail.plcyFnncGdsTypeCd) {
  case 'FT01':
    return {
      typeName: '융자',
      summaryItems: [
        { label: '자금용도', value: formatCode(detail.plcyFnncSprtTrgtFndsSmryCn || detail.plcyFnncSprtTrgtFndsCn, 'supportTargetFunds') },
        { label: '지원한도', value: detail.plcyFnncSprtLimSmryCn || detail.plcyFnncSprtLimCn },
        { label: '기업규모', value: formatCode(detail.plcyFnncEntSclSmryCn || detail.plcyFnncEntSclNm, 'companySizes') },
      ],
      groups: [
        groupRows(
          { label: '기업규모', value: formatCode(detail.plcyFnncEntSclNm || detail.plcyFnncEntSclSmryCn, 'companySizes') },
          { label: '우대기업유형', value: formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') },
        ),
        groupRows(
          { label: '신청방식', value: detail.plcyFnncAplyMthNm || formatCode(detail.plcyFnncAplyMthCd, 'applicationMethods') },
          { label: '융자방식', value: formatCode(detail.plcyFndsLoanMthCn, 'loanMethods') },
        ),
        groupRows(
          { label: '지원한도', value: detail.plcyFnncSprtLimCn || detail.plcyFnncSprtLimSmryCn },
          { label: '대출기간', value: detail.loanPrdCn || detail.loanPrdSmryNm || formatCode(detail.loanPrdSmryCd, 'loanPeriodSummaries') },
        ),
        groupRows({ label: '지원대상', value: detail.plcyFnncSprtTrgtCn }),
        groupRows({ label: '업종', value: formatCode(detail.plcyFnncTpbizNm, 'industryGroups') }),
        groupRows({ label: '업종 세부분류', value: detail.plcyFnncTpbizDtlClsfNm }),
        groupRows({ label: '자금용도', value: formatCode(detail.plcyFnncSprtTrgtFndsCn || detail.plcyFnncSprtTrgtFndsSmryCn, 'supportTargetFunds') }),
        groupRows({ label: '추가조건', value: detail.loanPrtrtCndCn || formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') }),
        groupRows({ label: '지원제외대상', value: detail.plcyFnncSprtExclTrgtCn }),
        groupRows(
          { label: '상환방법', value: detail.plcyFnncRpmtMthdNm || formatCode(detail.plcyFnncRpmtMthdCd, 'repaymentMethods') },
          { label: '금리변동여부', value: formatCode(detail.flctnIrtYnCn, 'interestChangeTypes') },
        ),
        groupRows({ label: '문의', value: detail.plcyFnncInqCn }),
        groupRows({ label: '관할지역', value: detail.cmptncRgnNm }),
        groupRows({ label: '기준금리', value: detail.crtrIrtCn }),
        groupRows({ label: '대출금리', value: detail.loanIrtCn }),
        groupRows({ label: '거치기간', value: detail.dfmtPrdCn }),
        groupRows({ label: '추천기관', value: detail.loanRcmdtnInstNm }),
        groupRows({ label: '테마업종', value: detail.thmTpbizNm }),
      ].filter((group) => group.length > 0),
    };
  case 'FT02':
    return {
      typeName: '보증',
      summaryItems: [
        { label: '지원대상자금', value: formatCode(detail.plcyFnncSprtTrgtFndsUsgSmryCn || detail.plcyFnncSprtTrgtFndsUsgCn, 'supportTargetFunds') },
        { label: '보증비율', value: detail.plcyFnncGrnteRtSmryCn || detail.plcyFnncGrnteRtCn },
        { label: '기업규모', value: formatCode(detail.plcyFnncEntSclSmryCn || detail.plcyFnncEntSclNm, 'companySizes') },
      ],
      groups: [
        groupRows(
          { label: '기업규모', value: formatCode(detail.plcyFnncEntSclNm || detail.plcyFnncEntSclSmryCn, 'companySizes') },
          { label: '우대기업유형', value: formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') },
        ),
        groupRows(
          { label: '신청방식', value: detail.plcyFnncAplyMthNm || formatCode(detail.plcyFnncAplyMthCd, 'applicationMethods') },
          { label: '지원대상자금', value: formatCode(detail.plcyFnncSprtTrgtFndsUsgCn || detail.plcyFnncSprtTrgtFndsUsgSmryCn, 'supportTargetFunds') },
        ),
        groupRows(
          { label: '보증비율', value: detail.plcyFnncGrnteRtCn || detail.plcyFnncGrnteRtSmryCn },
          { label: '상품종류', value: detail.plcyFnncGdsKndNm || formatCode(detail.plcyFnncGdsKndCd, 'grantKinds') },
        ),
        groupRows({ label: '업종', value: formatCode(detail.plcyFnncTpbizNm, 'industryGroups') }),
        groupRows({ label: '업종 세부분류', value: detail.plcyFnncTpbizDtlClsfNm }),
        groupRows({ label: '지원대상', value: detail.plcyFnncSprtTrgtCn }),
        groupRows({ label: '추가조건', value: detail.grntePrtrtCndCn || formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') }),
        groupRows({ label: '보증한도', value: detail.plcyFnncSprtLimCn || detail.plcyFnncSprtLimSmryCn }),
        groupRows({ label: '지원제외대상', value: detail.plcyFnncSprtExclTrgtCn }),
        groupRows({ label: '문의', value: detail.plcyFnncInqCn }),
        groupRows({ label: '보증료', value: detail.plcyFnncGrfeCn }),
        groupRows({ label: '관할지역', value: detail.cmptncRgnNm }),
        groupRows({ label: '추천기관', value: detail.grnteRcmdtnInstNm }),
      ].filter((group) => group.length > 0),
    };
  default:
    return {
      typeName: '보험',
      summaryItems: [
        { label: '지급보험금', value: detail.plcyFnncGiveInsrncAmtSmryCn || detail.plcyFnncGiveInsrncAmtCn },
        { label: '부보율(보상비율)', value: detail.plcyFnncCmpnRtSmryCn || detail.plcyFnncCmpnRtCn },
        { label: '기업규모', value: formatCode(detail.plcyFnncEntSclSmryCn || detail.plcyFnncEntSclNm, 'companySizes') },
      ],
      groups: [
        groupRows(
          { label: '기업규모', value: formatCode(detail.plcyFnncEntSclNm || detail.plcyFnncEntSclSmryCn, 'companySizes') },
          { label: '우대기업유형', value: formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') },
        ),
        groupRows({ label: '신청방식', value: detail.plcyFnncAplyMthNm || formatCode(detail.plcyFnncAplyMthCd, 'applicationMethods') }),
        groupRows({ label: '업종', value: formatCode(detail.plcyFnncTpbizNm, 'industryGroups') }),
        groupRows({ label: '업종 세부분류', value: detail.plcyFnncTpbizDtlClsfNm }),
        groupRows({ label: '보험분류', value: detail.plcyFnncGrnteInsrncClsfCn }),
        groupRows({ label: '부보율(보상비율)', value: detail.plcyFnncCmpnRtCn || detail.plcyFnncCmpnRtSmryCn }),
        groupRows({ label: '지원대상', value: detail.plcyFnncSprtTrgtCn }),
        groupRows({ label: '지급보험금', value: detail.plcyFnncGiveInsrncAmtCn || detail.plcyFnncGiveInsrncAmtSmryCn }),
        groupRows({ label: '지원조건', value: detail.plcyFnncGiveCndCn }),
        groupRows({ label: '추가조건', value: detail.insrncPrtrtCndCn || detail.plcyFnncIspmPrtrtCndCn || formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') }),
        groupRows({ label: '보험료', value: detail.ispmCn }),
        groupRows({ label: '보험증권 유효기간', value: detail.insrncScrtVldPrdCn }),
        groupRows({ label: '보험기간', value: detail.insrncPrdCn }),
        groupRows({ label: '문의', value: detail.plcyFnncInqCn }),
      ].filter((group) => group.length > 0),
    };
  }
};

const UI_USR_R_031 = () => {
  const { breadcrumbItems, currentMenu, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const { plcyFnncNo } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const [detail, setDetail] = useState(null);
  const [filterOptions, setFilterOptions] = useState(DEFAULT_FILTER_OPTIONS);
  const [industryGroups, setIndustryGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [isScrapped, setIsScrapped] = useState(false);
  const shadowRefs = useRef({});
  const authToken = useAuthStore((state) => state.token);
  const isLoggedIn = Boolean(authToken);

  useEffect(() => {
    fetchAndConvertCommonCodes(POLICY_FINANCE_COMMON_CODE_GROUPS)
      .then((commonCodes) => {
        setFilterOptions(toPolicyFilterOptions(commonCodes));
      })
      .catch(() => {
        setFilterOptions(DEFAULT_FILTER_OPTIONS);
      });
  }, []);

  useEffect(() => {
    apiClient.get('/api/v1/finance-policy/industries')
      .then((response) => {
        setIndustryGroups(buildIndustryGroupMap(unwrapResponse(response) || []));
      })
      .catch(() => {
        setIndustryGroups({});
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const detailParams = new URLSearchParams(location.search);
    const srchText = detailParams.get('srchText')?.trim();
    const reSrchText = detailParams.get('reSrchText')?.trim();
    const queryParams = new URLSearchParams();
    if (srchText) {
      queryParams.set('srchText', srchText);
    }
    if (reSrchText) {
      queryParams.set('reSrchText', reSrchText);
    }
    const detailUrl = queryParams.toString()
      ? `/api/v1/finance-policy/${plcyFnncNo}?${queryParams.toString()}`
      : `/api/v1/finance-policy/${plcyFnncNo}`;
    apiClient.get(detailUrl)
      .then((response) => setDetail(unwrapResponse(response)))
      .catch(() => {
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [plcyFnncNo, location.search]);

  useEffect(() => {
    const targetId = Number(plcyFnncNo);
    if (!isLoggedIn || !Number.isFinite(targetId) || targetId < 1) {
      setIsScrapped(false);
      return;
    }

    let isMounted = true;

    const loadScrapStatus = async () => {
      try {
        const response = await apiClient.get(
          `/api/v1/scraps/status?scrapTypeCd=PLCF&targetId=${targetId}`,
        );
        if (!isMounted) return;
        const payload = unwrapResponse(response);
        setIsScrapped(Boolean(payload.scrapped));
      } catch (error) {
        if (!isMounted) return;
        setIsScrapped(false);
      }
    };

    loadScrapStatus();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, plcyFnncNo]);

  const formatCode = useMemo(() => createCodeFormatter(filterOptions, industryGroups), [filterOptions, industryGroups]);
  const typeConfig = useMemo(() => getTypeConfig(detail, formatCode), [detail, formatCode]);
  const detailGroups = useMemo(() => {
    if (typeConfig.groups) return typeConfig.groups;
    return pairRows((typeConfig.rows || []).filter((item) => hasValue(item.value)));
  }, [typeConfig]);
  const showApplyButton = detail?.plcyFnncGdsTypeCd !== 'FT02';

  const toggleShadow = (key) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
    shadowRefs.current[key]?.classList.toggle('on');
  };

  const trackInquiry = (inqireTy) => {
    if (!plcyFnncNo || !inqireTy) {
      return;
    }
    const params = new URLSearchParams({
      plcyFnncGdsSn: String(plcyFnncNo),
      inqireTy: String(inqireTy),
    });
    apiClient
      .post(`/api/v1/finance-policy/inquiry?${params.toString()}`, null, { keepalive: true })
      .catch(() => {
      });
  };

  const handleToggleScrap = async () => {
    const targetId = Number(plcyFnncNo);
    if (!isLoggedIn || !Number.isFinite(targetId) || targetId < 1) {
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/scraps/toggle', {
        scrapTypeCd: 'PLCF',
        targetId,
      });
      const payload = unwrapResponse(response);
      const nextScrapped = Boolean(payload.scrapped);
      setIsScrapped(nextScrapped);
      // 행동 수집: 정책금융 상품 스크랩 등록/해제
      trackScrap({ refType: 'plcy_fnnc', refId: targetId, added: nextScrapped });
      window.alert(
        nextScrapped
          ? '관심공고에 등록되었습니다.'
          : '관심공고가 해제되었습니다.',
      );
    } catch (error) {
      window.alert(
        resolveApiErrorMessage(error, '관심공고 처리 중 오류가 발생했습니다.'),
      );
    }
  };

  if (loading) return <div style={{ padding: 40 }}>로딩 중입니다.</div>;
  if (!detail) return <div style={{ padding: 40 }}>상세 정보를 불러오지 못했습니다.</div>;

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">{currentMenu?.menuNm || '정책금융'}</p>
          <h2 className="h-tit2">{detail.plcyFnncGdsNm}</h2>
        </div>

        <ul className="onboard-summary">
          <li>
            <span className="sr-only">등록일</span>
            <span>{asText(detail.plcyFnncFrstRegDt)}</span>
          </li>
          <li>
            <span>
              <span className="sr-only">조회수</span>
              <i className="svg-icon ico-pw-visible-on"></i>
              {detail.inqCnt || 0}
            </span>
          </li>
          <li>
            <span>{typeConfig.typeName}</span>
          </li>
          {isLoggedIn && (
            <li className="bu-type">
              <span>
                <button
                  type="button"
                  className={`bu-like${isScrapped ? ' active' : ''}`}
                  onClick={handleToggleScrap}
                >
                  <i className="svg-icon ico-like"></i>
                  <span>{isScrapped ? '관심 공고 해제' : '관심 공고 등록'}</span>
                </button>
              </span>
            </li>
          )}

        </ul>

        <div className="conts-desc">
          {renderHtmlValue(detail.plcyFnncGdsPrpsCn)}
        </div>

        <div className="on-announcement">
          <div className="on-announcement-inner">
            <h4 className="announcement-title">
              <i className="svg-icon ico-building"></i> {asText(detail.plcyFnncBizFlfmtInstNm || detail.plcyFnncBizFlfmtInstCd)}
            </h4>
            <div className="announcement-info">
              {typeConfig.summaryItems.map((item) => (
                <div className="announcement-item" key={item.label}>
                  <strong className="announcement-title">{item.label}</strong>
                  <p className="announcement-text">{asText(item.value)}</p>
                </div>
              ))}
            </div>
            <div className="ac">
              {detail.plcyFnncDtlUrlAddr && (
                <a
                  href={detail.plcyFnncDtlUrlAddr}
                  target="_blank"
                  rel="noreferrer"
                  className="krds-btn secondary large krds-btn-shadow"
                  onClick={() => trackInquiry('3')}
                >
                  <i className="svg-icon ico-information"></i>
                  상세정보
                </a>
              )}
              {detail.plcyFnncInqplUrlAddr && (
                <a
                  href={detail.plcyFnncInqplUrlAddr}
                  target="_blank"
                  rel="noreferrer"
                  className="krds-btn secondary large krds-btn-shadow"
                  onClick={() => trackInquiry('2')}
                >
                  <i className="svg-icon ico-faq"></i>
                  문의하기
                </a>
              )}
              {showApplyButton && detail.plcyFnncAplyUrlAddr && (
                <a
                  href={detail.plcyFnncAplyUrlAddr}
                  target="_blank"
                  rel="noreferrer"
                  className="krds-btn primary large krds-btn-shadow"
                  onClick={() => {
                    trackInquiry('4');
                    // 행동 수집: 외부 신청 페이지 이동 = 신청 시작(전환 신호)
                    trackApplyStart({
                      refType: 'plcy_fnnc',
                      refId: plcyFnncNo,
                      attrs: { external: true },
                    });
                  }}
                >
                  신청하기
                </a>
              )}
            </div>
          </div>
        </div>

        {tagsFrom(detail.hashtags).length > 0 && (
          <div className="krds-tag-wrap mt-24">
            {tagsFrom(detail.hashtags).map((tag) => (
              <span className="krds-btn-tag" key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        <div className="page-title-wrap on-btmline" data-type="responsive">
          <h3 className="h-tit3">상품안내</h3>
          <p className="conts-desc mb-0">
            본 상품은 해당 금융기관에서 제공하는 정책금융 지원사업이며, 정확한 조건 및 세부 내용은 금융기관을 통해 확인해 주시기 바랍니다.
          </p>
        </div>

        <div className="def-list-wrap">
          <dl className="def-list">
            {detailGroups.map((pair, pairIndex) => (
              <div className="def-list-group" key={`pair-${pairIndex}`}>
                {pair.map((item, itemIndex) => {
                  const rowKey = `${pairIndex}-${itemIndex}`;
                  const valueText = String(item.value ?? '');
                  const canExpand = valueText.length > 200;
                  const isExpanded = Boolean(expandedRows[rowKey]);

                  return (
                    <React.Fragment key={rowKey}>
                      <dt>{item.label}</dt>
                      <dd>
                        <div
                          className={canExpand ? 'onshadow-text' : undefined}
                          ref={(node) => {
                            if (node) shadowRefs.current[rowKey] = node;
                          }}
                        >
                          {renderHtmlValue(item.value)}
                        </div>
                        {canExpand && (
                          <button
                            type="button"
                            className="krds-btn tertiary xsmall ontoggle-textshadow"
                            onClick={() => toggleShadow(rowKey)}
                          >
                            {isExpanded ? '접기' : '전체보기'}
                            <i className="svg-icon ico-angle"></i>
                          </button>
                        )}
                      </dd>
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </dl>
        </div>

        <div className="onboard-btm-btngroup">
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={() => navigate(resolveListBackPath(location, '..', { excludeKeys: ['srchText', 'reSrchText'] }))}>
              목록
            </button>
          </div>
          <div>
            {isLoggedIn && (
              <button
                type="button"
                className="krds-btn tertiary xlarge"
                onClick={handleToggleScrap}
              >
                <i className={`svg-icon ico-like${isScrapped ? ' on' : ''}`}></i>
                관심
              </button>
            )}
            {detail.plcyFnncInqplUrlAddr && (
              <a
                href={detail.plcyFnncInqplUrlAddr}
                target="_blank"
                rel="noreferrer"
                className="krds-btn tertiary xlarge"
                onClick={() => trackInquiry('2')}
              >
                <i className="svg-icon ico-faq"></i>
                문의하기
              </a>
            )}
            {detail.plcyFnncDtlUrlAddr && (
              <a
                href={detail.plcyFnncDtlUrlAddr}
                target="_blank"
                rel="noreferrer"
                className="krds-btn tertiary xlarge"
                onClick={() => trackInquiry('3')}
              >
                상세정보
                <i className="svg-icon ico-link"></i>
              </a>
            )}
            {showApplyButton && detail.plcyFnncAplyUrlAddr && (
              <a
                href={detail.plcyFnncAplyUrlAddr}
                target="_blank"
                rel="noreferrer"
                className="krds-btn primary xlarge"
                onClick={() => trackInquiry('4')}
              >
                신청하기
                <i className="svg-icon ico-angle right"></i>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UI_USR_R_031;
