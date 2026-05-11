import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import { useUserMenu } from '../context/UserMenuContext.jsx';
import { api as apiClient } from '../lib/apiClient.js';
import { resolveListBackPath } from '../utils/listNavigation.js';

const EMPTY_HTML_PATTERNS = new Set([
  '<p style="text-align: left;"></p>',
  '<p><br></p>',
  '<p>&nbsp;</p>',
]);

const SprtBizView = () => {
  const { breadcrumbItems, currentMenu, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiClient.get(`/api/v1/sprtBiz/${id}`);
        if (mounted) {
          setItem(response?.data || response);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || '데이터를 불러오지 못했습니다.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    window.scrollTo(0, 0);
    fetchDetail();

    return () => {
      mounted = false;
    };
  }, [id]);

  const isMeaningfulHtml = (html) => {
    if (!html || typeof html !== 'string') return false;

    const normalized = html.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!normalized || EMPTY_HTML_PATTERNS.has(normalized)) return false;

    const textOnly = normalized.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
    return textOnly.length > 0;
  };

  const renderHtmlRow = (label, html) => {
    if (!isMeaningfulHtml(html)) return null;
    return (
      <React.Fragment key={label}>
        <dt>{label}</dt>
        <dd dangerouslySetInnerHTML={{ __html: html }} />
      </React.Fragment>
    );
  };

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const ongoingPbancs = item?.ongoingPbancs || [];

  if (loading) {
    return (
      <>
        <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
        <div className="contents">
          <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap"><p>데이터를 불러오는 중입니다.</p></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
        <div className="contents">
          <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap"><p>{error}</p></div>
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
        <div className="contents">
          <Breadcrumb items={breadcrumbItems} />
          <div className="page-title-wrap"><p>데이터가 없습니다.</p></div>
        </div>
      </>
    );
  }

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />

        <div className="page-title-wrap on-btmline" data-type="responsive">
          <p className="on-p1 on-colorblue">{currentMenu?.menuNm || '지원사업 소개'}</p>
          <h2 className="h-tit2">{item.sprtBizNm}</h2>
        </div>

        {(isMeaningfulHtml(item.sprtBizNm) || isMeaningfulHtml(item.sprtBizOtln)) && (
          <>
            <div className="page-title-wrap on-btmline" data-type="responsive">
              <h3 className="h-tit3">사업정보</h3>
            </div>
            <div className="def-list-wrap">
              <dl className="def-list">
                {/*{renderHtmlRow('사업명', item.sprtBizNm)}*/}
                {renderHtmlRow('사업개요', item.sprtBizOtln)}
              </dl>
            </div>
          </>
        )}

        {(isMeaningfulHtml(item.sprtSclCn)
          || isMeaningfulHtml(item.sprtTrgtCn)
          || isMeaningfulHtml(item.sprtExclTrgtCn)
          || isMeaningfulHtml(item.sprtCn)) && (
          <>
            <div className="page-title-wrap on-btmline" data-type="responsive">
              <h3 className="h-tit3">사업개요</h3>
            </div>
            <div className="def-list-wrap">
              <dl className="def-list">
                {renderHtmlRow('지원규모', item.sprtSclCn)}
                {renderHtmlRow('지원대상', item.sprtTrgtCn)}
                {renderHtmlRow('지원제외대상', item.sprtExclTrgtCn)}
                {renderHtmlRow('지원내용', item.sprtCn)}
              </dl>
            </div>
          </>
        )}

        {(isMeaningfulHtml(item.aplyMthdCn)
          || isMeaningfulHtml(item.srngEvlCn)
          || isMeaningfulHtml(item.aplyPrcsCrsCn)
          || isMeaningfulHtml(item.bizAplySbmsnDcmntCn)
          || isMeaningfulHtml(item.refMttr)) && (
          <>
            <div className="page-title-wrap on-btmline" data-type="responsive">
              <h3 className="h-tit3">신청절차</h3>
            </div>
            <div className="def-list-wrap">
              <dl className="def-list">
                {renderHtmlRow('신청방법', item.aplyMthdCn)}
                {renderHtmlRow('심사평가', item.srngEvlCn)}
                {renderHtmlRow('신청처리과정', item.aplyPrcsCrsCn)}
                {renderHtmlRow('제출서류', item.bizAplySbmsnDcmntCn)}
                {renderHtmlRow('참고사항', item.refMttr)}
              </dl>
            </div>
          </>
        )}

        {isMeaningfulHtml(item.sprtBizInqplCn) && (
          <>
            <div className="page-title-wrap on-btmline" data-type="responsive">
              <h3 className="h-tit3">문의처</h3>
            </div>
            <div className="def-list-wrap">
              <dl className="def-list">
                {renderHtmlRow('문의처', item.sprtBizInqplCn)}
              </dl>
            </div>
          </>
        )}

        {ongoingPbancs.length > 0 && (
          <>
            <div className="page-title-wrap has-badge-type" data-type="responsive">
              <h3 className="h-tit3">진행중인 사업공고</h3>
              <span className="krds-badge bg-primary number">{ongoingPbancs.length}건</span>
            </div>
            <div className="krds-table-wrap">
              <table className="tbl col data">
                <caption>지원사업과 관련된 진행중인 사업공고 목록</caption>
                <colgroup>
                  <col />
                  <col style={{ width: '220px' }} />
                  <col style={{ width: '180px' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" className="ac">사업공고명</th>
                    <th scope="col" className="ac">신청기간</th>
                    <th scope="col" className="ac">사업수행기관</th>
                  </tr>
                </thead>
                <tbody>
                  {ongoingPbancs.map((pbanc) => (
                    <tr key={pbanc.bizPbancNo}>
                      <td>
                        <Link className="onellipsis-1" to={`/req/pbanc/pbanc/${pbanc.bizPbancNo}`}>
                          {pbanc.bizPbancNm}
                        </Link>
                      </td>
                      <td className="ac">{pbanc.applyPeriodText || '-'}</td>
                      <td className="ac">{pbanc.bizSprvsnInstNm || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="onboard-btm-btngroup">
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={() => navigate(resolveListBackPath(location))}>
              목록
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SprtBizView;
