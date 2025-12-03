import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';

// RichEditor.jsx 스타일을 따라 자체 내장 아이콘 정의
const Icon = {
  Upload: (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
    </svg>
  ),
  File: (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
    </svg>
  ),
  Remove: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  ),
  CheckCircle: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  ErrorCircle: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
};

/**
 * @param {object} props
 * @param {'dark'|'light'} [props.theme='dark'] - 컴포넌트 테마
 * @param {string} [props.width='100%'] - 컴포넌트 전체 너비
 * @param {string} [props.height='300px'] - 컴포넌트 전체 높이
 * @param {string} [props.className=''] - 추가적인 CSS 클래스
 * @param {string} props.uploadUrl - 파일 업로드를 처리할 서버 URL
 * @param {string[]} [props.allowedFileTypes=null] - 허용할 파일 MIME 타입 배열. (예: ['image/png', 'application/pdf'])
 * @param {string[]} [props.prohibitedFileTypes=[]] - 금지할 파일 MIME 타입 배열.
 * @param {number} [props.maxFileSize=5242880] - 파일당 최대 크기 (bytes, 기본 5MB)
 * @param {number} [props.maxFiles=10] - 한 번에 올릴 수 있는 최대 파일 수
 * @param {function(File[]): void} [props.onFilesUpdate] - 파일 목록이 변경될 때마다 호출되는 콜백
 * @param {function(object[]): void} [props.onUploadComplete] - 모든 파일 업로드가 완료되었을 때 호출되는 콜백
 */
export default function FileUpload({
  theme = 'dark',
  width = '100%',
  height = '300px',
  className = '',
  uploadUrl,
  allowedFileTypes = null,
  prohibitedFileTypes = [],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 10,
  onFilesUpdate,
  onUploadComplete,
  // 레이아웃/UX 패턴 옵션
  layoutMode = 'auto', // 'auto' | 'compact' | 'full'
  autoExpandOnDrag = true,
  useOverlayDrop = false,
  summaryInline = true,
  maxVisibleItems = 3,
  // 풀 레이아웃에서도 상단 툴바(파일 선택/업로드 요약)를 표시할지
  showTopBarInFull = true,
  // 초소형 높이에서도 선택된 파일이 항상 보이도록, 컴팩트 모드 기본 목록을 "칩(Chip)" 한 줄로 표시
  showInlineChips = true,
  inlineMaxChips = 5,
  // 자동 전환 임계치(가로/세로) 및 히스테리시스(출렁임 방지)
  compactWidthThreshold = 420,
  compactHeightThreshold = 140,
  hysteresisPx = 40,
  // ResizeObserver 과도 호출 방지
  autoDebounceMs = 120,
  // width/height props를 우선 신뢰할지 여부 (숫자 또는 px 값일 때)
  respectPropSize = true,
}) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [isDark, setIsDark] = useState(theme === 'dark');
  const containerRef = useRef(null);
  const [effectiveLayout, setEffectiveLayout] = useState(layoutMode === 'compact' ? 'compact' : (layoutMode === 'full' ? 'full' : 'auto'));
  // 자동 판단의 마지막 상태 기억(히스테리시스 적용용)
  const lastAutoRef = useRef('full');
  const debounceTimerRef = useRef(null);
  const [expanded, setExpanded] = useState(false); // compact에서 드래그 진입 시 확장
  const [overlay, setOverlay] = useState(false); // 전체화면 드롭 오버레이
  const [showDetails, setShowDetails] = useState(false); // compact에서 상세 리스트 표시

  const containerStyle = useMemo(() => ({
    width,
    height,
  }), [width, height]);

  // 전체 진행률(요약용)
  const overallProgress = useMemo(() => {
    if (!files.length) return 0;
    const total = files.reduce((acc, f) => acc + (typeof f.progress === 'number' ? f.progress : 0), 0);
    return Math.round(total / files.length);
  }, [files]);

  // 문자열 길이값을 px 숫자로 파싱(숫자면 그대로 반환). 실패 시 null
  const parseSizeToPx = useCallback((v) => {
    if (v == null) return null;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const m = v.trim().match(/^([0-9]+(?:\.[0-9]+)?)px$/i);
      if (m) return parseFloat(m[1]);
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return null;
  }, []);

  // auto 레이아웃: width/height에 따라 compact/full 결정(히스테리시스/디바운스 포함)
  useEffect(() => {
    if (layoutMode !== 'auto') {
      setEffectiveLayout(layoutMode);
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    const decideNow = () => {
      // 드래그 확장 중에는 자동 전환 잠시 보류(사용자 의도를 우선)
      if (expanded) return;

      // 컨테이너 실제 사이즈
      const rect = el.getBoundingClientRect();
      let w = rect.width;
      let h = rect.height;

      // 명시된 width/height prop이 숫자(px)면 그 값을 우선 고려(옵션)
      if (respectPropSize) {
        const wp = parseSizeToPx(width);
        const hp = parseSizeToPx(height);
        if (Number.isFinite(wp)) w = Math.min(w, wp);
        if (Number.isFinite(hp)) h = Math.min(h, hp);
      }

      // 히스테리시스 적용: 진입/이탈 임계치 분리
      const lastAuto = lastAutoRef.current;
      let next = lastAuto;
      const enterW = compactWidthThreshold; // compact로 진입
      const enterH = compactHeightThreshold;
      const exitW = compactWidthThreshold + hysteresisPx; // full로 복귀
      const exitH = compactHeightThreshold + hysteresisPx;

      if (lastAuto === 'full') {
        if (w < enterW || h < enterH) next = 'compact';
      } else {
        if (w >= exitW && h >= exitH) next = 'full';
      }

      if (next !== lastAuto) {
        lastAutoRef.current = next;
        setEffectiveLayout(next);
      } else if (effectiveLayout === 'auto') {
        // 초기값 보정
        setEffectiveLayout(next);
      }
    };

    const decideDebounced = () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(decideNow, Math.max(0, autoDebounceMs));
    };

    // 초기 한 번 실행
    decideNow();

    const ro = new ResizeObserver(() => decideDebounced());
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [layoutMode, expanded, compactWidthThreshold, compactHeightThreshold, hysteresisPx, autoDebounceMs, respectPropSize, width, height, parseSizeToPx]);


  const validateFile = (file) => {
    if (allowedFileTypes && !allowedFileTypes.includes(file.type)) {
      return `허용되지 않는 파일 형식입니다: ${file.type}`;
    }
    if (prohibitedFileTypes.length > 0 && prohibitedFileTypes.includes(file.type)) {
      return `금지된 파일 형식입니다: ${file.type}`;
    }
    if (file.size > maxFileSize) {
      return `파일 크기가 너무 큽니다 (최대: ${Math.round(maxFileSize / 1024 / 1024)}MB)`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles) => {
    const filesToAdd = Array.from(newFiles);
    
    if (files.length + filesToAdd.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 추가할 수 있습니다.`);
      return;
    }

    const fileObjects = filesToAdd.map((file) => {
      const error = validateFile(file);
      return {
        id: `${file.name}-${file.lastModified}-${file.size}`,
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        error,
      };
    });

    const uniqueNewFiles = fileObjects.filter(
      (newFile) => !files.some((existingFile) => existingFile.id === newFile.id)
    );

    const updatedFiles = [...files, ...uniqueNewFiles];
    setFiles(updatedFiles);
    if (onFilesUpdate) {
      onFilesUpdate(updatedFiles.map(f => f.file));
    }
  }, [files, maxFiles, allowedFileTypes, prohibitedFileTypes, maxFileSize, onFilesUpdate]);

  // 전역 드래그 오버레이 (addFiles 초기화 이후에 정의하여 TDZ 회피)
  useEffect(() => {
    if (!useOverlayDrop) return;
    const onDragEnter = (e) => {
      const types = e?.dataTransfer?.types;
      if (types && (types.includes?.('Files') || types.indexOf?.('Files') >= 0)) {
        setOverlay(true);
      }
    };
    const onDragOver = (e) => {
      // 드래그 중 기본 동작 취소해 드롭 가능 상태 유지
      e.preventDefault();
    };
    const onDrop = (e) => {
      e.preventDefault();
      setOverlay(false);
      if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
    };
    const onDragLeave = (e) => {
      // 문서 밖으로 나가면 닫기
      if (!e.relatedTarget) setOverlay(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOverlay(false); };
    document.addEventListener('dragenter', onDragEnter);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    document.addEventListener('dragleave', onDragLeave);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('dragenter', onDragEnter);
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
      document.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('keydown', onKey);
    };
  }, [useOverlayDrop, addFiles]);

  const handleSelectClick = () => fileInputRef.current?.click();
  const handleFileSelect = (e) => addFiles(e.target.files);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    if (effectiveLayout === 'compact' && autoExpandOnDrag) setExpanded(true);
  }, [effectiveLayout, autoExpandOnDrag]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (effectiveLayout === 'compact' && autoExpandOnDrag) setExpanded(false);
  }, [effectiveLayout, autoExpandOnDrag]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
    if (effectiveLayout === 'compact' && autoExpandOnDrag) setExpanded(false);
  }, [addFiles, effectiveLayout, autoExpandOnDrag]);

  const removeFile = (id) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    if (onFilesUpdate) {
      onFilesUpdate(updatedFiles.map(f => f.file));
    }
  };

  const handleUpload = async () => {
    if (!uploadUrl) {
      console.error("FileUpload: 'uploadUrl' prop이 지정되지 않았습니다.");
      alert("업로드 URL이 설정되지 않아 진행할 수 없습니다.");
      return;
    }

    const filesToUpload = files.filter((f) => f.status === 'pending');
    if (filesToUpload.length === 0) return;

    const uploadPromises = filesToUpload.map((fileObject) => {
      const formData = new FormData();
      formData.append('file', fileObject.file);

      setFiles(prev => prev.map(f => f.id === fileObject.id ? { ...f, status: 'uploading' } : f));

      return axios.post(uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setFiles(prev => prev.map(f => f.id === fileObject.id ? { ...f, progress } : f));
        },
      })
      .then(response => {
        setFiles(prev => prev.map(f => f.id === fileObject.id ? { ...f, status: 'success', progress: 100 } : f));
        return { success: true, file: fileObject.file.name, response };
      })
      .catch(error => {
        setFiles(prev => prev.map(f => f.id === fileObject.id ? { ...f, status: 'error', error: '업로드 실패' } : f));
        return { success: false, file: fileObject.file.name, error };
      });
    });

    const results = await Promise.allSettled(uploadPromises);
    if (onUploadComplete) {
      onUploadComplete(results.map(r => r.value));
    }
  };

  const filesPending = files.some(f => f.status === 'pending');

  return (
    <div ref={containerRef} className={`file-upload-wrap ${isDark ? 'dark' : 'light'} ${className} ${effectiveLayout === 'compact' ? 'compact' : 'full'} ${files.length > 0 ? 'has-files' : ''}`} style={containerStyle}>
      <style>{`
        .file-upload-wrap { display: flex; flex-direction: column; border: 1px solid; border-radius: 8px; overflow: hidden; font-family: system-ui, sans-serif; }
        .file-upload-wrap.light { background-color: #f9f9f9; border-color: #ddd; color: #333; }
        .file-upload-wrap.dark { background-color: #2a2a2a; border-color: #444; color: #eee; }
        
        .drop-zone { flex: 1 1 auto; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; padding: 20px; border-bottom: 1px solid; transition: background-color 0.2s, height .2s ease, flex-basis .2s ease; min-height: 160px; }
        .file-upload-wrap.light .drop-zone { border-color: #ddd; }
        .file-upload-wrap.dark .drop-zone { border-color: #444; }
        .drop-zone.dragging { background-color: rgba(107, 156, 255, 0.1); }
        .drop-zone-icon { margin-bottom: 16px; opacity: 0.6; }
        .drop-zone-text { font-weight: 500; }
        .drop-zone-subtext { font-size: 0.8rem; opacity: 0.7; margin-top: 8px; }

        /* 파일 리스트: Full 모드에서는 남은 공간을 전부 차지하며 스크롤, Compact 상세보기에서는 적당한 최대 높이 */
        .file-list { padding: 8px; }
        .file-upload-wrap.full .file-list { flex: 1 1 auto; min-height: 0; overflow-y: auto; }
        .file-upload-wrap.compact .file-list { max-height: 220px; overflow-y: auto; }
        .file-item { display: flex; align-items: center; padding: 8px; border-radius: 4px; margin-bottom: 4px; font-size: 0.9rem; }
        .file-upload-wrap.light .file-item { background-color: #fff; }
        .file-upload-wrap.dark .file-item { background-color: #333; }
        
        .file-icon { margin-right: 12px; flex-shrink: 0; }
        .file-details { flex-grow: 1; overflow: hidden; }
        .file-name { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-size { font-size: 0.8rem; opacity: 0.7; }

        .progress-bar-container { width: 100%; height: 4px; background-color: rgba(127,127,127,0.2); border-radius: 2px; margin-top: 4px; }
        .progress-bar { height: 100%; background-color: #4caf50; border-radius: 2px; transition: width 0.2s; }
        
        .file-status { margin-left: 12px; flex-shrink: 0; display: flex; align-items: center; }
        .file-status .status-icon { color: #4caf50; }
        .file-status .status-icon.error { color: #f44336; }
        .file-status .status-text { font-size: 0.8rem; font-weight: bold; margin-left: 4px; }

        .remove-btn { background: none; border: none; cursor: pointer; opacity: 0.6; margin-left: 12px; padding: 4px; }
        .remove-btn:hover { opacity: 1; }
        .file-upload-wrap.light .remove-btn { color: #333; }
        .file-upload-wrap.dark .remove-btn { color: #eee; }

        .upload-footer { padding: 12px; border-top: 1px solid; display: flex; justify-content: flex-end; align-items: center; flex-shrink: 0; }
        .file-upload-wrap.light .upload-footer { border-color: #ddd; }
        .file-upload-wrap.dark .upload-footer { border-color: #444; }
        
        .upload-btn { background-color: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
        .upload-btn:hover { background-color: #1976d2; }
        .upload-btn:disabled { background-color: #9e9e9e; cursor: not-allowed; }

        /* 컴팩트 모드 */
        .file-upload-wrap.compact .drop-zone { min-height: 56px; padding: 12px; }
        .file-upload-wrap.compact .drop-zone .drop-zone-icon svg { width: 20px; height: 20px; }
        .file-upload-wrap.compact .drop-zone .drop-zone-text { font-size: 0.9rem; }
        .file-upload-wrap.compact .drop-zone .drop-zone-subtext { font-size: 0.75rem; }
        .file-upload-wrap.compact .drop-zone:not(.expanded) { height: 0; min-height: 0; padding: 0; border-bottom: 0; overflow: hidden; }
        .file-upload-wrap.compact .drop-zone.expanded { height: 160px; padding: 20px; border-bottom: 1px solid rgba(127,127,127,0.25); }

        /* Full 모드에서 파일이 하나라도 있으면 드롭존 높이를 줄여 리스트 공간 확보 */
        .file-upload-wrap.full.has-files .drop-zone { flex: 0 0 120px; min-height: 120px; }

        .toolbar-row { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid; }
        .file-upload-wrap.light .toolbar-row { border-color: #ddd; }
        .file-upload-wrap.dark .toolbar-row { border-color: #444; }
        .btn { background: #2196f3; color: #fff; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
        .btn.secondary { background: transparent; color: inherit; border: 1px solid; }
        .file-upload-wrap.light .btn.secondary { border-color: #ccc; }
        .file-upload-wrap.dark .btn.secondary { border-color: #555; }
        .summary { margin-left: auto; font-size: 0.85rem; opacity: .9; }

        .drop-overlay { position: fixed; inset: 0; background: rgba(33, 150, 243, 0.12); border: 2px dashed rgba(33, 150, 243, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; color: inherit; font-size: 1rem; }

        /* 초소형 높이에서도 파일이 보이도록: 컴팩트 모드 기본 상태에서 칩(Chip) 한 줄 목록 */
        .inline-file-chips { display: block; padding: 6px 12px; border-bottom: 1px solid; overflow-x: auto; white-space: nowrap; gap: 6px; }
        .file-upload-wrap.light .inline-file-chips { border-color: #ddd; }
        .file-upload-wrap.dark .inline-file-chips { border-color: #444; }
        .inline-file-chips .chip { display: inline-flex; align-items: center; max-width: 200px; padding: 4px 8px; border-radius: 12px; font-size: 12px; line-height: 1; margin-right: 6px; vertical-align: middle; }
        .file-upload-wrap.light .inline-file-chips .chip { background: #ffffff; color: #333; border: 1px solid #ddd; }
        .file-upload-wrap.dark .inline-file-chips .chip { background: #3a3a3a; color: #eee; border: 1px solid #555; }
        .inline-file-chips .chip .name { display: inline-block; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .inline-file-chips .chip .remove { background: none; border: 0; color: inherit; opacity: .7; cursor: pointer; margin-left: 6px; padding: 0; line-height: 0; }
        .inline-file-chips .chip .remove:hover { opacity: 1; }
      `}</style>

      {/* 항상 존재하는 숨김 파일 입력(툴바/드롭존 어디서든 트리거) */}
      <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />

      {/* 상단 툴바: 컴팩트에서는 항상, 풀 레이아웃에서도 옵션으로 표시 */}
      {(effectiveLayout === 'compact' || showTopBarInFull) && (
        <div className="toolbar-row">
          <button className="btn" onClick={handleSelectClick} title="파일 선택">파일 선택</button>
          {effectiveLayout === 'compact' && (
            <button className="btn secondary" onClick={() => setShowDetails(v => !v)}>{showDetails ? '숨기기' : '상세보기'}</button>
          )}
          <button className="btn" onClick={handleUpload} disabled={!filesPending} title={filesPending ? '추가된 파일 업로드' : '업로드할 파일이 없습니다'}>
            {filesPending ? '전체 업로드' : '업로드 완료'}
          </button>
          {summaryInline && (
            <span className="summary">{files.length}개 • {overallProgress}%</span>
          )}
        </div>
      )}

      {/* 드롭존 */}
      {(effectiveLayout === 'full' || expanded) && (
        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${expanded ? 'expanded' : ''}`}
          onClick={handleSelectClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="drop-zone-icon"><Icon.Upload width={effectiveLayout === 'compact' ? 24 : 48} height={effectiveLayout === 'compact' ? 24 : 48} /></div>
          <div className="drop-zone-text">파일을 드래그하거나 클릭하여 선택하세요.</div>
          <div className="drop-zone-subtext">최대 {maxFiles}개, 파일당 {Math.round(maxFileSize / 1024 / 1024)}MB</div>
        </div>
      )}

      {/* 컴팩트 기본 보기: 파일이 선택되어 있고 상세보기 모드가 아닐 때 한 줄 칩 목록을 항상 표시 */}
      {(effectiveLayout === 'compact' && showInlineChips && files.length > 0 && !showDetails) && (
        <div className="inline-file-chips" role="list" aria-label="선택된 파일">
          {files.slice(0, Math.max(1, inlineMaxChips)).map(({ id, file }) => (
            <span key={id} className="chip" role="listitem" title={file.name}>
              <span className="name">{file.name}</span>
              <button className="remove" aria-label={`${file.name} 제거`} onClick={() => removeFile(id)}>×</button>
            </span>
          ))}
          {files.length > inlineMaxChips && (
            <span className="chip more" aria-label={`추가 파일 ${files.length - inlineMaxChips}개 더 있음`}>+{files.length - inlineMaxChips}</span>
          )}
        </div>
      )}

      {(files.length > 0) && (effectiveLayout === 'full' || showDetails) && (
        <div className="file-list">
          {(effectiveLayout === 'full' ? files : files.slice(0, Math.max(1, maxVisibleItems))).map(({ id, file, progress, status, error }) => (
            <div key={id} className="file-item">
              <div className="file-icon"><Icon.File /></div>
              <div className="file-details">
                <span className="file-name" title={file.name}>{file.name}</span>
                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                {(status === 'uploading' || status === 'success') && (
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                  </div>
                )}
                {status === 'error' && <div className="status-text error">{error}</div>}
              </div>
              <div className="file-status">
                {status === 'success' && <Icon.CheckCircle className="status-icon" />}
                {status === 'error' && <Icon.ErrorCircle className="status-icon error" />}
              </div>
              <button className="remove-btn" title="파일 제거" onClick={() => removeFile(id)}>
                <Icon.Remove />
              </button>
            </div>
          ))}
          {effectiveLayout !== 'full' && files.length > maxVisibleItems && (
            <div className="file-item" style={{ justifyContent: 'center', opacity: .8 }}>+ {files.length - maxVisibleItems} 더 보기</div>
          )}
        </div>
      )}

      {(files.length > 0) && (effectiveLayout === 'full' || showDetails) && (
        <div className="upload-footer">
          <button className="upload-btn" onClick={handleUpload} disabled={!filesPending}>
            {filesPending ? '전체 업로드' : '업로드 완료'}
          </button>
        </div>
      )}

      {useOverlayDrop && overlay && (
        <div className="drop-overlay" onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{ e.preventDefault(); setOverlay(false); if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files); }}>
          여기에 파일을 드롭하세요
        </div>
      )}
    </div>
  );
}
