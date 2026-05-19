import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SideNavigation from '@components/ui/SideNavigation';
import Breadcrumb from '@components/ui/Breadcrumb';
import { useUserMenu } from '@context/UserMenuContext.jsx';
import { api as apiClient, apiBaseUrl } from '@lib/apiClient.js';
import { resolveListBackPath } from '@utils/listNavigation.js';
import { formatEventRegionForDetail } from '@utils/stringUtils.js';

const STREAMDOCS_VIEWER_URL =
  import.meta.env.VITE_STREAMDOCS_VIEWER_URL
  || 'https://www.smes.go.kr/e-paper/view/sd';

const STREAMDOCS_ADAPTER_URL =
  import.meta.env.VITE_STREAMDOCS_ADAPTER_URL
  || 'https://www.smes.go.kr/e-paper/adapter.js';

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const formatFullYmd = (value) => {
  if (!value) return '';
  const text = String(value).trim();
  const ymd = text.match(/^(\d{4})[-./]?(\d{2})[-./]?(\d{2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatEventPeriod = (value) => {
  if (!value) return '-';
  const text = String(value).trim();
  if (!text) return '-';
  const parts = text.split('~').map((part) => part.trim());
  if (parts.length === 2) {
    return `${formatFullYmd(parts[0])} ~ ${formatFullYmd(parts[1])}`;
  }
  return formatFullYmd(text);
};

const UI_USR_R_191 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { breadcrumbItems, getSideNavigationData, getDepth1Parent } = useUserMenu();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerError, setViewerError] = useState('');
  const viewerFrameRef = useRef(null);
  const streamdocsRef = useRef(null);

  const sidebarData = getSideNavigationData();
  const depth1Menu = getDepth1Parent();

  useEffect(() => {
    window.scrollTo(0, 0);
    let mounted = true;

    const fetchDetail = async () => {
      if (!id) {
        if (!mounted) return;
        setItem(null);
        setErrorMessage('상세 정보를 확인할 수 없습니다.');
        return;
      }

      try {
        if (!mounted) return;
        setLoading(true);
        setErrorMessage('');

        const response = await apiClient.get(`/api/v1/event-info/${encodeURIComponent(id)}`);
        const data = response?.data || response || null;
        if (!mounted) return;

        setItem(data);
      } catch (error) {
        if (!mounted) return;
        setItem(null);
        setErrorMessage(error?.message || '상세 정보를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      mounted = false;
    };
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

  const hashtags = useMemo(() => (Array.isArray(item?.hstgCn) ? item.hstgCn : []), [item]);
  const pbancDocFiles = useMemo(() => (Array.isArray(item?.pbancDocFiles) ? item.pbancDocFiles : []), [item]);
  const atchFiles = useMemo(() => (Array.isArray(item?.atchFiles) ? item.atchFiles : []), [item]);

  const renderText = (value) => {
    if (value == null || value === '') return '-';
    return value;
  };

  const downloadFile = (atchFileId, atchFileSn) => {
    if (!atchFileId || atchFileSn == null) return;
    window.location.href = `${apiBaseUrl}/api/v1/files/download/${atchFileId}/${atchFileSn}`;
  };

  return (
    <>
      <SideNavigation pageTitle={depth1Menu?.menuNm || ''} menuItems={sidebarData} />
      <div className="contents">
        <Breadcrumb items={breadcrumbItems} />
        <div className="page-title-wrap" data-type="responsive">
          <p className="on-p1 on-colorblue">행사정보</p>
          <h2 className="h-tit2">{item?.evntInfoTtlNm || '-'}</h2>
        </div>
        <ul className="onboard-summary">
          <li>
            <span className="sr-only">작성일</span>
            <span>{formatDate(item?.regDt)}</span>
          </li>
          <li>
            <span>
              <span className="sr-only">조회수</span>
              <i className="svg-icon ico-pw-visible-on"></i>
              {item?.inqCnt ?? 0}
            </span>
          </li>
        </ul>

        <div className="def-list-wrap">
          <dl className="def-list">
            <dt>분야</dt>
            <dd>{renderText(item?.evntInfoFldNm)}</dd>
            <dt>행사유형</dt>
            <dd>{renderText(item?.evntInfoTypeNm)}</dd>
            <dt>수행기관</dt>
            <dd>{renderText(item?.evntInfoFlfmtInstNm)}</dd>
            <dt>지역</dt>
            <dd>{formatEventRegionForDetail(item?.evntInfoRgnNm)}</dd>
            <dt>접수기간</dt>
            <dd>{renderText(item?.rcptPrdCn)}</dd>
            <dt>행사기간</dt>
            <dd>{formatEventPeriod(item?.evntPrdCn)}</dd>
            <dt>행사개요</dt>
            <dd dangerouslySetInnerHTML={{ __html: item?.evntOtlnCn || '-' }} />
          </dl>
        </div>

        {hashtags.length > 0 && (
          <div className="krds-tag-wrap mt-24 mb-24">
            {hashtags.map((tag, index) => (
              <span key={`${tag}-${index}`} className="krds-btn-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

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

        {pbancDocFiles.length > 0 && (
          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">공고문</p>
            <ul className="box-group-area">
              {pbancDocFiles.map((file, index) => (
                <li key={`${file?.atchFileId ?? 'pbanc'}-${file?.atchFileSn ?? index}`}>
                  <p className="tit">
                    <i className="svg-icon ico-file2"></i>
                    {file?.orgnlFileNm || '-'}
                  </p>
                  <div className="btn-wrap">
                    {item?.strmdcsId && (
                      <a
                        href="#"
                        className="krds-btn medium link basic"
                        target="_blank"
                        title="새 창 열기"
                        onClick={(event) => {
                          event.preventDefault();
                          setViewerVisible((visible) => !visible);
                        }}
                      >
                        <i className="svg-icon ico-sch-plus"></i> 바로보기
                      </a>
                    )}
                    <button
                      type="button"
                      className="krds-btn medium text on-colorblue"
                      onClick={() => downloadFile(file?.atchFileId, file?.atchFileSn)}
                    >
                      <i className="svg-icon ico-down on-bgcolorblue"></i> 다운로드
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {atchFiles.length > 0 && (
          <div className="onbox-group-areawrap">
            <p className="onbox-group-title">첨부파일</p>
            <ul className="box-group-area">
              {atchFiles.map((file, index) => (
                <li key={`${file?.atchFileId ?? 'atch'}-${file?.atchFileSn ?? index}`}>
                  <p className="tit">
                    <i className="svg-icon ico-file2"></i>
                    {file?.orgnlFileNm || '-'}
                  </p>
                  <div className="btn-wrap">
                    <button
                      type="button"
                      className="krds-btn medium text on-colorblue"
                      onClick={() => downloadFile(file?.atchFileId, file?.atchFileSn)}
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
            <button type="button" className="krds-btn tertiary xlarge" onClick={() => navigate(resolveListBackPath(location))}>
              목록
            </button>
          </div>
          <div>
            {item?.srcUrlAddr && (
              <button
                type="button"
                className="krds-btn tertiary xlarge"
                onClick={() => window.open(item.srcUrlAddr, '_blank')}
              >
                출처 바로가기
                <i className="svg-icon ico-angle right"></i>
              </button>
            )}
          </div>
        </div>

        {(loading || errorMessage) && (
          <div className="mt-24">
            {loading && <p>로딩 중입니다.</p>}
            {!loading && errorMessage && <p>{errorMessage}</p>}
          </div>
        )}
      </div>
    </>
  );
};

export default UI_USR_R_191;
