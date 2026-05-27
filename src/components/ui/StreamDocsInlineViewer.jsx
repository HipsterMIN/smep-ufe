import { useEffect, useRef, useState } from 'react';
import { STREAMDOCS_ADAPTER_URL, STREAMDOCS_VIEWER_URL } from '@utils/streamDocsUtils.js';

// 의도: 게시물 본문 파일 미리보기는 상세 화면 진입 즉시 같은 위치/방식으로 떠야 하므로 StreamDocs 어댑터 로딩을 공통 컴포넌트로 묶는다.
// 동작: adapter.js를 한 번만 로드하고, 전달받은 streamdocsId를 iframe 기반 뷰어에 open 요청해 인라인으로 표시한다.
// 주의: StreamDocs 외부 서버 또는 어댑터 로드 실패는 게시물 상세 전체 오류로 전파하지 않고, 뷰어 영역에 안내 문구만 표시한다.
const StreamDocsInlineViewer = ({ streamdocsId, title = '문서뷰어' }) => {
  const viewerFrameRef = useRef(null);
  const streamdocsRef = useRef(null);
  const [viewerError, setViewerError] = useState('');

  useEffect(() => {
    if (!streamdocsId || !viewerFrameRef.current) return undefined;

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
        if (cancelled || !StreamDocsCtor || !viewerFrameRef.current) return null;

        streamdocsRef.current = new StreamDocsCtor({
          element: viewerFrameRef.current,
        });

        return streamdocsRef.current.document.open({
          streamdocsId,
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
  }, [streamdocsId]);

  if (!streamdocsId) return null;

  return (
    <div style={{ width: '100%', marginBottom: '48px' }}>
      <iframe
        ref={viewerFrameRef}
        title={title}
        src={STREAMDOCS_VIEWER_URL}
        style={{ width: '100%', minHeight: '960px', border: 0 }}
      />
      {viewerError && (
        <p style={{ marginTop: '12px', textAlign: 'center' }}>{viewerError}</p>
      )}
    </div>
  );
};

export default StreamDocsInlineViewer;
