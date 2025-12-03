import React, { useState, useRef, useCallback, useMemo } from 'react';
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
}) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [isDark, setIsDark] = useState(theme === 'dark');

  const containerStyle = useMemo(() => ({
    width,
    height,
  }), [width, height]);

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

  const handleSelectClick = () => fileInputRef.current?.click();
  const handleFileSelect = (e) => addFiles(e.target.files);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

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
    <div className={`file-upload-wrap ${isDark ? 'dark' : 'light'} ${className}`} style={containerStyle}>
      <style>{`
        .file-upload-wrap { display: flex; flex-direction: column; border: 1px solid; border-radius: 8px; overflow: hidden; font-family: system-ui, sans-serif; }
        .file-upload-wrap.light { background-color: #f9f9f9; border-color: #ddd; color: #333; }
        .file-upload-wrap.dark { background-color: #2a2a2a; border-color: #444; color: #eee; }
        
        .drop-zone { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; padding: 20px; border-bottom: 1px solid; transition: background-color 0.2s; }
        .file-upload-wrap.light .drop-zone { border-color: #ddd; }
        .file-upload-wrap.dark .drop-zone { border-color: #444; }
        .drop-zone.dragging { background-color: rgba(107, 156, 255, 0.1); }
        .drop-zone-icon { margin-bottom: 16px; opacity: 0.6; }
        .drop-zone-text { font-weight: 500; }
        .drop-zone-subtext { font-size: 0.8rem; opacity: 0.7; margin-top: 8px; }

        .file-list { flex-shrink: 0; max-height: 50%; overflow-y: auto; padding: 8px; }
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

        .upload-footer { padding: 12px; border-top: 1px solid; display: flex; justify-content: flex-end; align-items: center; }
        .file-upload-wrap.light .upload-footer { border-color: #ddd; }
        .file-upload-wrap.dark .upload-footer { border-color: #444; }
        
        .upload-btn { background-color: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
        .upload-btn:hover { background-color: #1976d2; }
        .upload-btn:disabled { background-color: #9e9e9e; cursor: not-allowed; }
      `}</style>
      
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onClick={handleSelectClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
        <div className="drop-zone-icon"><Icon.Upload width={48} height={48} /></div>
        <div className="drop-zone-text">파일을 드래그하거나 클릭하여 선택하세요.</div>
        <div className="drop-zone-subtext">최대 {maxFiles}개, 파일당 {Math.round(maxFileSize / 1024 / 1024)}MB</div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map(({ id, file, progress, status, error }) => (
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
        </div>
      )}

      {files.length > 0 && (
        <div className="upload-footer">
          <button className="upload-btn" onClick={handleUpload} disabled={!filesPending}>
            {filesPending ? '전체 업로드' : '업로드 완료'}
          </button>
        </div>
      )}
    </div>
  );
}
