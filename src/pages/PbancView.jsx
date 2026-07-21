import React, { useEffect, useMemo, useRef, useState } from 'react';
import SideNavigation from '../components/ui/SideNavigation';
import Breadcrumb from '../components/ui/Breadcrumb';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api as apiClient, apiBaseUrl } from '../lib/apiClient.js';
import { trackApplyStart, trackFileDownload, trackScrap } from '../lib/behaviorTracker.js';
import { fetchAndConvertCommonCodes } from '../utils/commonCodeUtils.js';
import { resolveListBackPath } from '../utils/listNavigation.js';
import { useUserMenu } from '../context/UserMenuContext.jsx';
import { useAuthStore } from '../store/useAuthStore.jsx';

const EMPTY_HTML_PATTERNS = new Set([
  '<p style="text-align: left;"></p>',
  '<p><br></p>',
  '<p>&nbsp;</p>',
]);

const STREAMDOCS_VIEWER_URL =
  import.meta.env.VITE_STREAMDOCS_VIEWER_URL
  || 'https://portal.smes.go.kr/e-paper/view/sd';

const STREAMDOCS_ADAPTER_URL =
  import.meta.env.VITE_STREAMDOCS_ADAPTER_URL
  || 'https://portal.smes.go.kr/e-paper/adapter.js';

// 의도: 첨부파일 바로보기는 공고문 인라인 미리보기와 분리해 새 창으로 열고, 본문 뷰어의 열림/닫힘 상태를 건드리지 않는다.
// 동작: StreamDocs viewer URL에 streamdocsId를 붙여 새 창 링크 href로 사용할 주소를 만든다.
// 주의: strmdcsId가 없는 첨부파일에는 사용하지 않으며, 기존 데이터 호환용 master strmdcsId fallback은 공고문에만 적용한다.
const buildStreamDocsPreviewUrl = (streamdocsId) =>
  `${STREAMDOCS_VIEWER_URL};streamdocsId=${encodeURIComponent(streamdocsId)}`;

const BIZ_PBANC_CLSF_GROUP_ID = 'BIZ_PBANC_CLSF_CD';
const resolveApiErrorMessage = (error, fallbackMessage) =>
  error?.data?.message || error?.message || fallbackMessage;

const decodeUrlHtmlEntities = (value) =>
  String(value ?? '')
    .trim()
    .replace(/&amp;/gi, '&')
    .replace(/&#38;|&#x26;/gi, '&');

const openExternalUrl = (value) => {
  const url = decodeUrlHtmlEntities(value);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

const PbancView = () => {
  const { breadcrumbItems, currentMenu, getSideNavigationData, getDepth1Parent } = useUserMenu();
  const { id } = useParams();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [bizFieldOptions, setBizFieldOptions] = useState([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [activeStreamdocsId, setActiveStreamdocsId] = useState('');
  const [viewerError, setViewerError] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [isScrapped, setIsScrapped] = useState(false);
  const navigate = useNavigate();
  const viewerFrameRef = useRef(null);
  const streamdocsRef = useRef(null);
  const authToken = useAuthStore((state) => state.token);
  const isLoggedIn = Boolean(authToken);
  const bizPbancTypeCd = currentMenu?.menuId === 'M_PIIO_00091' ? 'HSSPLY' : 'BIZPBN';

  const fieldLabelMap = useMemo(
    () => Object.fromEntries(bizFieldOptions.map((option) => [option.value, option.label])),
    [bizFieldOptions],
  );

  useEffect(() => {
    window.scrollTo(0, 0);

    const detail = async () => {
      try {
        const response = await apiClient.get(
          `/api/v1/pbanc/${id}?bizPbancTypeCd=${bizPbancTypeCd}`,
          { credentials: 'include' },
        );
        setItem(response?.data || response);
      } catch (error) {
        return null;
      }
    };

    detail();
  }, [bizPbancTypeCd, id]);

  useEffect(() => {
    let mounted = true;

    const loadCommonCodes = async () => {
      try {
        const commonCodes = await fetchAndConvertCommonCodes([BIZ_PBANC_CLSF_GROUP_ID]);
        if (!mounted) {
          return;
        }

        setBizFieldOptions(commonCodes[BIZ_PBANC_CLSF_GROUP_ID] || []);
      } catch (error) {
        if (mounted) {
          setBizFieldOptions([]);
        }
      }
    };

    loadCommonCodes();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!viewerVisible || !activeStreamdocsId || !viewerFrameRef.current) return undefined;

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
          streamdocsId: activeStreamdocsId,
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
  }, [viewerVisible, activeStreamdocsId]);

  useEffect(() => {
    const targetId = Number(item?.bizPbancNo);
    if (!isLoggedIn || !Number.isFinite(targetId) || targetId < 1) {
      setIsScrapped(false);
      return;
    }

    let isMounted = true;

    const loadScrapStatus = async () => {
      try {
        const response = await apiClient.get(
          `/api/v1/scraps/status?scrapTypeCd=BIZP&targetId=${targetId}`,
        );
        if (!isMounted) return;
        const payload = response?.data || response;
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
  }, [isLoggedIn, item?.bizPbancNo]);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();
  const pbancMtxtFiles = item?.pbancMtxtFiles || [];
  const pbancAtchFiles = item?.pbancAtchFiles || [];

  const resolveNoticePreviewId = (file, index) =>
    file?.strmdcsId || (index === 0 ? item?.strmdcsId : '');

  const toggleStreamdocsViewer = (streamdocsId) => {
    if (!streamdocsId) return;

    setViewerVisible((visible) => {
      const shouldClose = visible && activeStreamdocsId === streamdocsId;
      return !shouldClose;
    });
    setActiveStreamdocsId(streamdocsId);
  };

  const isMeaningfulHtml = (html) => {
    if (!html || typeof html !== 'string') return false;

    const normalized = html.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!normalized || EMPTY_HTML_PATTERNS.has(normalized)) return false;

    const textOnly = normalized.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
    return textOnly.length > 0;
  };

  const getPlainText = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const toggleExpandedRow = (key) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
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

  const renderExpandableTextRow = (label, value) => {
    if (!value) return null;

    const canExpand = getPlainText(String(value)).length > 200;
    const isExpanded = Boolean(expandedRows[label]);

    return (
      <React.Fragment key={label}>
        <dt>{label}</dt>
        <dd>
          <div className={canExpand ? `onshadow-text${isExpanded ? ' on' : ''}` : undefined}>
            {value}
          </div>
          {canExpand && (
            <button
              type="button"
              className="krds-btn tertiary xsmall ontoggle-textshadow"
              onClick={() => toggleExpandedRow(label)}
            >
              {isExpanded ? '접기' : '전체보기'}
              <i className="svg-icon ico-angle"></i>
            </button>
          )}
        </dd>
      </React.Fragment>
    );
  };

  const renderExpandableHtmlRow = (label, html) => {
    if (!isMeaningfulHtml(html)) return null;

    const canExpand = getPlainText(html).length > 200;
    const isExpanded = Boolean(expandedRows[label]);

    return (
      <React.Fragment key={label}>
        <dt>{label}</dt>
        <dd>
          {/* se-doc: 에디터 본문 서식 공용 스코프 — 관리자 편집/미리보기와 동일 렌더 */}
          <div
            className={`se-doc${canExpand ? ` onshadow-text${isExpanded ? ' on' : ''}` : ''}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {canExpand && (
            <button
              type="button"
              className="krds-btn tertiary xsmall ontoggle-textshadow"
              onClick={() => toggleExpandedRow(label)}
            >
              {isExpanded ? '접기' : '전체보기'}
              <i className="svg-icon ico-angle"></i>
            </button>
          )}
        </dd>
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

  // 행동 수집: 온라인 신청 바로가기(외부 신청 사이트 이동) = 신청 시작 전환 신호.
  // 신청 완료는 타 사이트에서 일어나 관측 불가 — 신청 데이터 수집 API 연계 전까지는
  // 이 이벤트가 신청 퍼널의 마지막 관측점이다. 목적지 url 을 남겨 추후 대사에 쓴다.
  const handleApplyShortcut = () => {
    trackApplyStart({
      refType: 'pbanc',
      refId: item?.bizPbancNo,
      attrs: {
        external: true,
        url: String(item?.bizAplyUrlAddr || '').slice(0, 200) || null,
      },
    });
    openExternalUrl(item?.bizAplyUrlAddr);
  };

  const handleToggleScrap = async () => {
    const targetId = Number(item?.bizPbancNo);
    if (!isLoggedIn || !Number.isFinite(targetId) || targetId < 1) {
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/scraps/toggle', {
        scrapTypeCd: 'BIZP',
        targetId,
      });
      const payload = response?.data || response;
      const nextScrapped = Boolean(payload.scrapped);
      setIsScrapped(nextScrapped);
      // 행동 수집: 스크랩은 가장 순도 높은 관심 신호라 등록/해제를 구분해 기록한다
      trackScrap({ refType: 'pbanc', refId: targetId, added: nextScrapped });
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

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />

        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">{currentMenu?.menuNm || '사업공고'}</p>
          <h2 className="h-tit2">{item?.bizPbancNm}</h2>
        </div>

        <ul className="onboard-summary">
          <li>
            <span className="sr-only">작성일</span>
            <span>{formatToYYMMDD(item?.regDt)}</span>
          </li>
          <li>
            <span>
              <span className="sr-only">스크랩수</span>
              <i className="svg-icon ico-scrap"></i>
              {(item?.scrapCnt ?? 0).toLocaleString()}
            </span>
          </li>
          <li>
            <span>
              <span className="sr-only">조회수</span>
              <i className="svg-icon ico-pw-visible-on"></i>
              {(item?.bizPbancInqCnt ?? 0).toLocaleString()}
            </span>
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

        <div className="def-list-wrap">
          <dl className="def-list">
            {renderTextRow('분야', item?.bizPbancClsfCd ? fieldLabelMap[item.bizPbancClsfCd] || item.bizPbancClsfCd : '')}
            {/* currentMenu?.menuId : M_PIIO_00076 (중앙정부), M_PIIO_00169 (지방정부)*/}
            {currentMenu?.menuId === 'M_PIIO_00076' || currentMenu?.menuId === 'M_PIIO_00169' ? (
              <>
                {renderExpandableHtmlRow('사업개요', item?.bizPbancOtln)}
                {renderExpandableHtmlRow('지원대상', item?.bizSprtTrgtCn)}
                {renderTextRow('신청기간', item?.applyPeriodText)}

                {(isMeaningfulHtml(item?.bizAplyMthdCn) || item?.bizAplyUrlAddr) && (
                  <>
                    <dt>사업신청 방법</dt>
                    <dd>
                      <ul className="list">
                        {isMeaningfulHtml(item?.bizAplyMthdCn) && (
                          <li className="se-doc" dangerouslySetInnerHTML={{ __html: item.bizAplyMthdCn }}/>
                        )}
                        {item?.bizAplyUrlAddr && (
                          <li>
                            <button
                              type="button"
                              className="krds-btn xsmall"
                              onClick={handleApplyShortcut}
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

                {renderTextRow('소관부처·지자체', item?.bizSprvsnInstNm)}
                {renderTextRow('사업수행기관', item?.bizTelgmInstNm)}
              </>
            ) : (
              <>
                {renderTextRow('소관부처·지자체', item?.bizSprvsnInstNm)}
                {renderExpandableHtmlRow('사업개요', item?.bizPbancOtln)}
                {renderExpandableHtmlRow('지원규모', item?.bizSprtSclCn)}
                {renderExpandableHtmlRow('지원내용', item?.bizSprtCn)}
                {renderExpandableHtmlRow('지원대상', item?.bizSprtTrgtCn)}
                {renderTextRow('신청기간', item?.applyPeriodText)}
                {(isMeaningfulHtml(item?.bizAplyMthdCn) || item?.bizAplyUrlAddr) && (
                  <>
                    <dt>사업신청 방법</dt>
                    <dd>
                      <ul className="list">
                        {isMeaningfulHtml(item?.bizAplyMthdCn) && (
                          <li className="se-doc" dangerouslySetInnerHTML={{ __html: item.bizAplyMthdCn }}/>
                        )}
                        {item?.bizAplyUrlAddr && (
                          <li>
                            <button
                              type="button"
                              className="krds-btn xsmall"
                              onClick={handleApplyShortcut}
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
              </>
            )}
            {renderExpandableHtmlRow('지원자격', item?.bizSprtQlfcRqmtCn)}
            {renderExpandableHtmlRow('신청제외대상', item?.bizAplyExclTrgtCn)}
            {renderExpandableHtmlRow('제출서류', item?.bizAplySbmsnDcmntCn)}
            {renderExpandableTextRow('기업규모', item?.sprtQlfcEntSclNm)}
            {renderExpandableHtmlRow('기업유형', item?.sprtQlfcEntTypeCn)}
            {renderExpandableHtmlRow('추진절차', item?.bizPbancPrtrtMttrCn)}
            {renderExpandableHtmlRow('지원금액', item?.bizPbancSprtAmtCn)}
            {renderExpandableHtmlRow('문의처', item?.bizPbancInqplCn)}
          </dl>
        </div>

        {activeStreamdocsId && viewerVisible && (
          <div style={ { width: '100%', marginBottom: '48px' } }>
            <iframe
              ref={viewerFrameRef}
              title="문서뷰어"
              src={STREAMDOCS_VIEWER_URL}
              style={ { width: '100%', minHeight: '960px', border: 0 } }
            />
            {viewerError && (
              <p style={ { marginTop: '12px', textAlign: 'center' } }>{viewerError}</p>
            )}
          </div>
        )}

        {pbancMtxtFiles.length > 0 && (
          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">공고문</p>
            <ul className="box-group-area">
              {pbancMtxtFiles.map((file, index) => {
                const previewId = resolveNoticePreviewId(file, index);
                return (
                  <li key={`${file.atchFileId}-${file.atchFileSn}`}>
                    <p className="tit">
                      <i className="svg-icon ico-file2"></i>
                      {file.orgnlFileNm}
                    </p>
                    <div className="btn-wrap">
                      {previewId && (
                        <a
                          href="#"
                          className="krds-btn medium link basic"
                          title="문서 미리보기"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleStreamdocsViewer(previewId);
                          }}
                        >
                          <i className="svg-icon ico-sch-plus"></i> 바로보기
                        </a>
                      )}
                      <button
                        type="button"
                        className="krds-btn medium text on-colorblue"
                        onClick={() => {
                          trackFileDownload({
                            refType: 'pbanc',
                            refId: item?.bizPbancNo,
                            fileName: file.orgnlFileNm,
                          });
                          window.location.href = `${apiBaseUrl}/api/v1/files/download/${file.atchFileId}/${file.atchFileSn}`;
                        }}
                      >
                        <i className="svg-icon ico-down on-bgcolorblue"></i> 다운로드
                      </button>
                    </div>
                  </li>
                );
              })}
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
                    {file?.strmdcsId && (
                      <a
                        href={buildStreamDocsPreviewUrl(file.strmdcsId)}
                        className="krds-btn medium link basic"
                        title="문서 미리보기 새 창 열림"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="svg-icon ico-sch-plus"></i> 바로보기
                      </a>
                    )}
                    <button
                      type="button"
                      className="krds-btn medium text on-colorblue"
                      onClick={() => {
                        trackFileDownload({
                          refType: 'pbanc',
                          refId: item?.bizPbancNo,
                          fileName: file.orgnlFileNm,
                        });
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
            <button type="button" className="krds-btn tertiary xlarge"
              onClick={() => navigate(resolveListBackPath(location))}>
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
            {item?.bizDtlUrlAddr && (
              <button
                type="button"
                className="krds-btn tertiary xlarge"
                onClick={() => openExternalUrl(item?.bizDtlUrlAddr)}
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
