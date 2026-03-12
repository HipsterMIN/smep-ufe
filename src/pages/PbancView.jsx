import React, { useEffect, useRef, useState } from 'react';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import { useNavigate, useParams } from 'react-router-dom';
import { api as apiClient, apiBaseUrl } from '../lib/apiClient.js';
import { useUserMenu } from '../context/UserMenuContext.jsx';

const FIELD_LABEL_MAP = {
  PC10: '금융',
  PC20: '기술',
  PC30: '인력',
  PC40: '수출',
  PC50: '내수',
  PC60: '창업',
  PC70: '경영',
  PC80: '소상공인',
  PC12: '중견',
  PC99: '기타',
};

const EMPTY_HTML_PATTERNS = new Set([
  '<p style="text-align: left;"></p>',
  '<p><br></p>',
  '<p>&nbsp;</p>',
]);

const STREAMDOCS_VIEWER_URL =
  import.meta.env.VITE_STREAMDOCS_VIEWER_URL
  || 'http://192.168.16.82:8088/venturein-pdf/view/sd';

const STREAMDOCS_ADAPTER_URL =
  import.meta.env.VITE_STREAMDOCS_ADAPTER_URL
  || 'http://192.168.16.82:8088/venturein-pdf/adapter.js';

const PbancView = () => {
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerError, setViewerError] = useState('');
  const navigate = useNavigate();
  const viewerFrameRef = useRef(null);
  const streamdocsRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const detail = async () => {
      const response = await apiClient.get(`/api/v1/pbanc/${id}`);
      setItem(response?.data || response);
    };

    detail();
  }, [id]);

  useEffect(() => {
    if (!viewerVisible || !item?.strmdcsId || !viewerFrameRef.current) return undefined;

    let cancelled = false;
    setViewerError('');

    const ensureStreamDocsAdapter = () =>
      new Promise((resolve, reject) => {
        if (window.StreamDocs) {
          resolve(window.StreamDocs);
          return;
        }

        const existingScript = document.querySelector('script[data-streamdocs-adapter="true"]');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(window.StreamDocs), { once: true });
          existingScript.addEventListener('error', () => reject(new Error('StreamDocs adapter load failed')), { once: true });
          return;
        }

        const script = document.createElement('script');
        script.src = STREAMDOCS_ADAPTER_URL;
        script.async = true;
        script.dataset.streamdocsAdapter = 'true';
        script.onload = () => resolve(window.StreamDocs);
        script.onerror = () => reject(new Error('StreamDocs adapter load failed'));
        document.body.appendChild(script);
      });

    ensureStreamDocsAdapter()
      .then((StreamDocsCtor) => {
        if (cancelled || !StreamDocsCtor || !viewerFrameRef.current) return;

        streamdocsRef.current = new StreamDocsCtor({
          element: viewerFrameRef.current,
        });

        return streamdocsRef.current.document.open({
          streamdocsId: item.strmdcsId,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setViewerError('문서뷰어를 불러오지 못했습니다.');
        }
      });

    return () => {
      cancelled = true;
      streamdocsRef.current = null;
    };
  }, [viewerVisible, item?.strmdcsId]);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const pbancMtxtFiles = item?.pbancMtxtFiles || [];
  const pbancAtchFiles = item?.pbancAtchFiles || [];

  const isMeaningfulHtml = (html) => {
    if (!html || typeof html !== 'string') return false;

    const normalized = html.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!normalized || EMPTY_HTML_PATTERNS.has(normalized)) return false;

    const textOnly = normalized.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
    return textOnly.length > 0;
  };

  const renderTextRow = (label, value) => {
    if (!value) return null;
    return (
      <React.Fragment key={label}>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </React.Fragment>
    );
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

  const formatToYYMMDD = (value) => {
    if (!value) return '';

    if (/^\d{8}$/.test(String(value))) {
      const str = String(value);
      return `${str.slice(2, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy.slice(2)}-${mm}-${dd}`;
  };

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />

        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">사업공고</p>
          <h2 className="h-tit2">{item?.bizPbancNm}</h2>
        </div>

        <ul className="onboard-summary">
          <li>
            <span className="sr-only">작성일</span>
            <span>{formatToYYMMDD(item?.regDt)}</span>
          </li>
          <li>
            <span>
              <span className="sr-only">조회수</span>
              <i className="svg-icon ico-scrap"></i>
              {(item?.bizPbancInqCnt ?? 0).toLocaleString()}
            </span>
          </li>
          <li>
            <span>
              <span className="sr-only">스크랩수</span>
              <i className="svg-icon ico-pw-visible-on"></i>
              {(item?.scrapCnt ?? 0).toLocaleString()}
            </span>
          </li>
        </ul>

        <div className="def-list-wrap">
          <dl className="def-list">
            {renderTextRow('분야', item?.bizPbancClsfCd ? FIELD_LABEL_MAP[item.bizPbancClsfCd] || item.bizPbancClsfCd : '')}
            {renderTextRow('사업수행기관', item?.bizSprvsnInstNm)}
            {renderHtmlRow('사업개요', item?.bizPbancOtln)}
            {renderHtmlRow('지원규모', item?.bizSprtSclCn)}
            {renderHtmlRow('지원내용', item?.bizSprtCn)}
            {renderHtmlRow('지원대상', item?.bizSprtTrgtCn)}
            {renderTextRow('신청기간', item?.applyPeriodText)}
            {(isMeaningfulHtml(item?.bizAplyMthdCn) || item?.bizAplyUrlAddr) && (
              <>
                <dt>사업신청 방법</dt>
                <dd>
                  <ul className="list">
                    {isMeaningfulHtml(item?.bizAplyMthdCn) && (
                      <li dangerouslySetInnerHTML={{ __html: item.bizAplyMthdCn }} />
                    )}
                    {item?.bizAplyUrlAddr && (
                      <li>
                        <button
                          type="button"
                          className="krds-btn xsmall"
                          onClick={() => window.open(item?.bizAplyUrlAddr, '_blank')}
                        >
                          온라인 신청 바로가기
                          <i className="svg-icon ico-angle right"></i>
                        </button>
                      </li>
                    )}
                  </ul>
                </dd>
              </>
            )}
            {renderHtmlRow('문의처', item?.bizPbancInqplCn)}
          </dl>
        </div>

        {item?.strmdcsId && viewerVisible && (
          <div style={{ width: '100%', marginBottom: '48px' }}>
            <iframe
              ref={viewerFrameRef}
              title="문서뷰어"
              src={STREAMDOCS_VIEWER_URL}
              style={{ width: '100%', minHeight: '960px', border: 0 }}
            />
            {viewerError && (
              <p style={{ marginTop: '12px', textAlign: 'center' }}>{viewerError}</p>
            )}
          </div>
        )}

        {pbancMtxtFiles.length > 0 && (
          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">공고문</p>
            <ul className="box-group-area">
              {pbancMtxtFiles.map((file) => (
                <li key={`${file.atchFileId}-${file.atchFileSn}`}>
                  <p className="tit">
                    <i className="svg-icon ico-file2"></i>
                    {file.orgnlFileNm}
                  </p>
                  <div className="btn-wrap">
                    {item?.strmdcsId && (
                      <a
                        href="#"
                        className="krds-btn medium link basic"
                        target="_blank"
                        title="새 창 열기"
                        onClick={(e) => {
                          e.preventDefault();
                          setViewerVisible((visible) => !visible);
                        }}
                      >
                        <i className="svg-icon ico-sch-plus"></i> 바로보기
                      </a>
                    )}
                    <button
                      type="button"
                      className="krds-btn medium text on-colorblue"
                      onClick={() => {
                        window.location.href = `${apiBaseUrl}/api/v1/files/download/${file.atchFileId}/${file.atchFileSn}`;
                      }}
                    >
                      <i className="svg-icon ico-down on-bgcolorblue"></i> 다운로드
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pbancAtchFiles.length > 0 && (
          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">첨부파일</p>
            <ul className="box-group-area">
              {pbancAtchFiles.map((file) => (
                <li key={`${file.atchFileId}-${file.atchFileSn}`}>
                  <p className="tit">
                    <i className="svg-icon ico-file2"></i>
                    {file.orgnlFileNm}
                  </p>
                  <div className="btn-wrap">
                    <button
                      type="button"
                      className="krds-btn medium text on-colorblue"
                      onClick={() => {
                        window.location.href = `${apiBaseUrl}/api/v1/files/download/${file.atchFileId}/${file.atchFileSn}`;
                      }}
                    >
                      <i className="svg-icon ico-down on-bgcolorblue"></i> 다운로드
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="onboard-btm-btngroup">
          <div>
            <button type="button" className="krds-btn tertiary xlarge" onClick={() => navigate('/req/pbanc/pbanc')}>
              목록
            </button>
          </div>
          <div>
            {item?.bizDtlUrlAddr && (
              <button
                type="button"
                className="krds-btn tertiary xlarge"
                onClick={() => window.open(item?.bizDtlUrlAddr, '_blank')}
              >
                출처 바로가기
                <i className="svg-icon ico-angle right"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PbancView;
