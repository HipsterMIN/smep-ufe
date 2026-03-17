import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import SideNavigation from '../components/ui/SideNavigation';
import { useUserMenu } from '../context/UserMenuContext.jsx';
import { api as apiClient } from '../lib/apiClient.js';

const DEFAULT_FILTER_OPTIONS = {
  searchTypes: [],
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

const unwrapResponse = (response) => response?.data ?? response;
const tagsFrom = (value) => (value || '').split(',').map((item) => item.trim()).filter(Boolean);
const splitMultiValue = (value) => String(value || '').split(/\s*,\s*/).map((item) => item.trim()).filter(Boolean);
const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const asText = (value, fallback = '-') => (hasValue(value) ? value : fallback);

const pairRows = (items) => {
  const pairs = [];
  for (let index = 0; index < items.length; index += 2) {
    pairs.push(items.slice(index, index + 2));
  }
  return pairs;
};

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

const createCodeFormatter = (filterOptions, industryGroups) => {
  const maps = {
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
      rows: [],
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
      rows: [
        { label: '기업규모', value: formatCode(detail.plcyFnncEntSclNm || detail.plcyFnncEntSclSmryCn, 'companySizes') },
        { label: '우대기업유형', value: formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') },
        { label: '신청방식', value: detail.plcyFnncAplyMthNm || formatCode(detail.plcyFnncAplyMthCd, 'applicationMethods') },
        { label: '융자방식', value: formatCode(detail.plcyFndsLoanMthCn, 'loanMethods') },
        { label: '지원한도', value: detail.plcyFnncSprtLimCn || detail.plcyFnncSprtLimSmryCn },
        { label: '대출기간', value: detail.loanPrdCn || detail.loanPrdSmryNm || formatCode(detail.loanPrdSmryCd, 'loanPeriodSummaries') },
        { label: '업종', value: formatCode(detail.plcyFnncTpbizNm, 'industryGroups') },
        { label: '업종 세부분류', value: detail.plcyFnncTpbizDtlClsfNm },
        { label: '지원대상', value: detail.plcyFnncSprtTrgtCn },
        { label: '자금용도', value: formatCode(detail.plcyFnncSprtTrgtFndsCn || detail.plcyFnncSprtTrgtFndsSmryCn, 'supportTargetFunds') },
        { label: '추가조건', value: detail.loanPrtrtCndCn || formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') },
        { label: '지원제외대상', value: detail.plcyFnncSprtExclTrgtCn },
        { label: '상환방법', value: detail.plcyFnncRpmtMthdNm || formatCode(detail.plcyFnncRpmtMthdCd, 'repaymentMethods') },
        { label: '금리변동여부', value: formatCode(detail.flctnIrtYnCn, 'interestChangeTypes') },
        { label: '문의', value: detail.plcyFnncInqCn },
        { label: '관할지역', value: detail.cmptncRgnNm },
        { label: '기준금리', value: detail.crtrIrtCn },
        { label: '대출금리', value: detail.loanIrtCn },
        { label: '거치기간', value: detail.dfmtPrdCn },
        { label: '추천기관', value: detail.loanRcmdtnInstNm },
        { label: '테마업종', value: detail.thmTpbizNm },
      ],
    };
  case 'FT02':
    return {
      typeName: '보증',
      summaryItems: [
        { label: '지원대상자금', value: formatCode(detail.plcyFnncSprtTrgtFndsUsgSmryCn || detail.plcyFnncSprtTrgtFndsUsgCn, 'supportTargetFunds') },
        { label: '보증비율', value: detail.plcyFnncGrnteRtSmryCn || detail.plcyFnncGrnteRtCn },
        { label: '기업규모', value: formatCode(detail.plcyFnncEntSclSmryCn || detail.plcyFnncEntSclNm, 'companySizes') },
      ],
      rows: [
        { label: '기업규모', value: formatCode(detail.plcyFnncEntSclNm || detail.plcyFnncEntSclSmryCn, 'companySizes') },
        { label: '우대기업유형', value: formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') },
        { label: '신청방식', value: detail.plcyFnncAplyMthNm || formatCode(detail.plcyFnncAplyMthCd, 'applicationMethods') },
        { label: '지원대상자금', value: formatCode(detail.plcyFnncSprtTrgtFndsUsgCn || detail.plcyFnncSprtTrgtFndsUsgSmryCn, 'supportTargetFunds') },
        { label: '보증비율', value: detail.plcyFnncGrnteRtCn || detail.plcyFnncGrnteRtSmryCn },
        { label: '상품종류', value: detail.plcyFnncGdsKndNm || formatCode(detail.plcyFnncGdsKndCd, 'grantKinds') },
        { label: '업종', value: formatCode(detail.plcyFnncTpbizNm, 'industryGroups') },
        { label: '업종 세부분류', value: detail.plcyFnncTpbizDtlClsfNm },
        { label: '지원대상', value: detail.plcyFnncSprtTrgtCn },
        { label: '추가조건', value: detail.grntePrtrtCndCn || formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') },
        { label: '보증한도', value: detail.plcyFnncSprtLimCn || detail.plcyFnncSprtLimSmryCn },
        { label: '지원제외대상', value: detail.plcyFnncSprtExclTrgtCn },
        { label: '문의', value: detail.plcyFnncInqCn },
        { label: '보증료', value: detail.plcyFnncGrfeCn },
        { label: '관할지역', value: detail.cmptncRgnNm },
        { label: '추천기관', value: detail.grnteRcmdtnInstNm },
      ],
    };
  default:
    return {
      typeName: '보험',
      summaryItems: [
        { label: '지급보험금', value: detail.plcyFnncGiveInsrncAmtSmryCn || detail.plcyFnncGiveInsrncAmtCn },
        { label: '부보율(보상비율)', value: detail.plcyFnncCmpnRtSmryCn || detail.plcyFnncCmpnRtCn },
        { label: '기업규모', value: formatCode(detail.plcyFnncEntSclSmryCn || detail.plcyFnncEntSclNm, 'companySizes') },
      ],
      rows: [
        { label: '기업규모', value: formatCode(detail.plcyFnncEntSclNm || detail.plcyFnncEntSclSmryCn, 'companySizes') },
        { label: '우대기업유형', value: formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') },
        { label: '신청방식', value: detail.plcyFnncAplyMthNm || formatCode(detail.plcyFnncAplyMthCd, 'applicationMethods') },
        { label: '업종', value: formatCode(detail.plcyFnncTpbizNm, 'industryGroups') },
        { label: '업종 세부분류', value: detail.plcyFnncTpbizDtlClsfNm },
        { label: '보험분류', value: detail.plcyFnncGrnteInsrncClsfCn },
        { label: '부보율(보상비율)', value: detail.plcyFnncCmpnRtCn || detail.plcyFnncCmpnRtSmryCn },
        { label: '지원대상', value: detail.plcyFnncSprtTrgtCn },
        { label: '지급보험금', value: detail.plcyFnncGiveInsrncAmtCn || detail.plcyFnncGiveInsrncAmtSmryCn },
        { label: '지원조건', value: detail.plcyFnncGiveCndCn },
        { label: '추가조건', value: detail.insrncPrtrtCndCn || detail.plcyFnncIspmPrtrtCndCn || formatCode(detail.plcyFnncAddDtlCndCn, 'preferredTypes') },
        { label: '보험료', value: detail.ispmCn },
        { label: '보험증권 유효기간', value: detail.insrncScrtVldPrdCn },
        { label: '보험기간', value: detail.insrncPrdCn },
        { label: '문의', value: detail.plcyFnncInqCn },
      ],
    };
  }
};

const UI_USR_R_031 = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const { plcyFnncNo } = useParams();
  const navigate = useNavigate();
  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  const [detail, setDetail] = useState(null);
  const [filterOptions, setFilterOptions] = useState(DEFAULT_FILTER_OPTIONS);
  const [industryGroups, setIndustryGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const shadowRefs = useRef({});

  useEffect(() => {
    apiClient.get('/api/v1/finance-policy/filters')
      .then((response) => {
        setFilterOptions({ ...DEFAULT_FILTER_OPTIONS, ...(unwrapResponse(response) || {}) });
      })
      .catch((error) => {
        console.error('Failed to load finance policy filters:', error);
        setFilterOptions(DEFAULT_FILTER_OPTIONS);
      });
  }, []);

  useEffect(() => {
    apiClient.get('/api/v1/finance-policy/industries')
      .then((response) => {
        setIndustryGroups(buildIndustryGroupMap(unwrapResponse(response) || []));
      })
      .catch((error) => {
        console.error('Failed to load finance policy industries:', error);
        setIndustryGroups({});
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/api/v1/finance-policy/${plcyFnncNo}`)
      .then((response) => setDetail(unwrapResponse(response)))
      .catch((error) => {
        console.error('정책금융 상세 조회 실패:', error);
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [plcyFnncNo]);

  const formatCode = useMemo(() => createCodeFormatter(filterOptions, industryGroups), [filterOptions, industryGroups]);
  const typeConfig = useMemo(() => getTypeConfig(detail, formatCode), [detail, formatCode]);
  const detailPairs = useMemo(
    () => pairRows((typeConfig.rows || []).filter((item) => hasValue(item.value))),
    [typeConfig],
  );

  const toggleShadow = (key) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
    shadowRefs.current[key]?.classList.toggle('on');
  };

  if (loading) return <div style={{ padding: 40 }}>로딩 중입니다.</div>;
  if (!detail) return <div style={{ padding: 40 }}>상세 정보를 불러오지 못했습니다.</div>;

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">정책금융 안내</p>
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
        </ul>

        <div className="conts-desc">
          {asText(detail.plcyFnncGdsPrpsCn)}
        </div>

        <div className="on-announcement">
          <div className="on-announcement-inner">
            <h4 className="announcement-title">
              <i className="svg-icon ico-building"></i> {asText(detail.plcyFnncBizFlfmtInstNm)}
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
                <a href={detail.plcyFnncDtlUrlAddr} target="_blank" rel="noreferrer" className="krds-btn secondary large krds-btn-shadow">
                  <i className="svg-icon ico-information"></i>
                  상세정보
                </a>
              )}
              {detail.plcyFnncInqplUrlAddr && (
                <a href={detail.plcyFnncInqplUrlAddr} target="_blank" rel="noreferrer" className="krds-btn secondary large krds-btn-shadow">
                  <i className="svg-icon ico-faq"></i>
                  문의하기
                </a>
              )}
              {detail.plcyFnncAplyUrlAddr && (
                <a href={detail.plcyFnncAplyUrlAddr} target="_blank" rel="noreferrer" className="krds-btn primary large krds-btn-shadow">
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
            본 상품은 해당 금융기관에서 제공하는 정책금융 상품이며, 정확한 조건 및 세부 내용은 금융기관을 통해 확인해 주시기 바랍니다.
          </p>
        </div>

        <div className="def-list-wrap">
          <dl className="def-list">
            {detailPairs.map((pair, pairIndex) => (
              <div className="def-list-group" key={`pair-${pairIndex}`}>
                {pair.map((item, itemIndex) => {
                  const rowKey = `${pairIndex}-${itemIndex}`;
                  const valueText = String(item.value ?? '');
                  const canExpand = valueText.length > 80;
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
                          {asText(item.value)}
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
            <button type="button" className="krds-btn tertiary xlarge" onClick={() => navigate(-1)}>
              목록
            </button>
          </div>
          <div>
            {detail.plcyFnncInqplUrlAddr && (
              <a href={detail.plcyFnncInqplUrlAddr} target="_blank" rel="noreferrer" className="krds-btn tertiary xlarge">
                <i className="svg-icon ico-faq"></i>
                문의하기
              </a>
            )}
            {detail.plcyFnncDtlUrlAddr && (
              <a href={detail.plcyFnncDtlUrlAddr} target="_blank" rel="noreferrer" className="krds-btn tertiary xlarge">
                상세정보
                <i className="svg-icon ico-link"></i>
              </a>
            )}
            {detail.plcyFnncAplyUrlAddr && (
              <a href={detail.plcyFnncAplyUrlAddr} target="_blank" rel="noreferrer" className="krds-btn primary xlarge">
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
