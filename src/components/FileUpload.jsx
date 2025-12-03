import React, {
  useState, useRef, useCallback, useMemo,
  createContext, useContext, useLayoutEffect
} from 'react';
import axios from 'axios';

// --- 아이콘 (변경 없음) ---
const Icon = {
  Upload: (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" /></svg>),
  File: (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" /></svg>),
  Remove: (props) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>),
  CheckCircle: (props) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>),
  ErrorCircle: (props) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>),
  Spinner: (props) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>)
};

// --- 유틸리티 함수 ---
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// --- React Context 생성 ---
const FileUploadContext = createContext();

// --- 메인 컨트롤러 컴포넌트 ---
function FileUpload({
  children,
  uploadUrl,
  autoUpload = false,
  maxFileSize = 5 * 1024 * 1024,
  maxFiles = 10,
  allowedFileTypes = null,
  onFilesUpdate,
  onUploadComplete,
}) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const uploadFile = useCallback(async (fileObject) => {
    if (!uploadUrl) {
      console.error("FileUpload: 'uploadUrl' prop이 지정되지 않았습니다.");
      return { success: false, file: fileObject.file.name, error: { message: "Upload URL not configured" } };
    }
    
    const formData = new FormData();
    formData.append('file', fileObject.file);

    setFiles(prev => prev.map(f => f.id === fileObject.id ? { ...f, status: 'uploading' } : f));

    try {
      const response = await axios.post(uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setFiles(prev => prev.map(f => f.id === fileObject.id ? { ...f, progress } : f));
        },
      });
      setFiles(prev => prev.map(f => f.id === fileObject.id ? { ...f, status: 'success', progress: 100 } : f));
      return { success: true, file: fileObject.file.name, response };
    } catch (error) {
      setFiles(prev => prev.map(f => f.id === fileObject.id ? { ...f, status: 'error', error: '업로드 실패' } : f));
      return { success: false, file: fileObject.file.name, error };
    }
  }, [uploadUrl]);

  const addFiles = useCallback((newFiles) => {
    const filesToAdd = Array.from(newFiles);
    
    if (files.length + filesToAdd.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 추가할 수 있습니다.`);
      return;
    }

    const fileObjects = filesToAdd.map((file) => {
      let error = null;
      if (allowedFileTypes && !allowedFileTypes.includes(file.type)) {
        error = `허용되지 않는 파일 형식입니다.`;
      } else if (file.size > maxFileSize) {
        error = `파일 크기가 너무 큽니다 (최대: ${formatBytes(maxFileSize)})`;
      }
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
    if (onFilesUpdate) onFilesUpdate(updatedFiles.map(f => f.file));

    if (autoUpload) {
      const validFiles = uniqueNewFiles.filter(f => f.status === 'pending');
      Promise.allSettled(validFiles.map(uploadFile)).then(results => {
        if (onUploadComplete) onUploadComplete(results.map(r => r.value));
      });
    }
  }, [files, maxFiles, allowedFileTypes, maxFileSize, onFilesUpdate, autoUpload, uploadFile, onUploadComplete]);

  const removeFile = useCallback((id) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      if (onFilesUpdate) onFilesUpdate(updated.map(f => f.file));
      return updated;
    });
  }, [onFilesUpdate]);

  const uploadAll = useCallback(async () => {
    const filesToUpload = files.filter(f => f.status === 'pending');
    if (filesToUpload.length === 0) return;

    const results = await Promise.allSettled(filesToUpload.map(uploadFile));
    if (onUploadComplete) onUploadComplete(results.map(r => r.value));
  }, [files, uploadFile, onUploadComplete]);

  const openFileDialog = () => fileInputRef.current?.click();

  const contextValue = useMemo(() => ({
    files,
    addFiles,
    removeFile,
    uploadAll,
    openFileDialog,
    formatBytes,
    Icon,
  }), [files, addFiles, removeFile, uploadAll]);

  return (
    <FileUploadContext.Provider value={contextValue}>
      <input type="file" multiple ref={fileInputRef} onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} style={{ display: 'none' }} />
      {children}
    </FileUploadContext.Provider>
  );
}

// --- 하위 컴포넌트들 ---

const Dropzone = ({ children, className = '' }) => {
  const { addFiles } = useContext(FileUploadContext);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }, [addFiles]);

  return (
    <div
      className={`file-upload__dropzone ${isDragging ? 'dragging' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

const Trigger = ({ children, className = '' }) => {
  const { openFileDialog } = useContext(FileUploadContext);
  return (
    <button type="button" className={`file-upload__trigger ${className}`} onClick={openFileDialog}>
      {children}
    </button>
  );
};

const List = ({ className = '' }) => {
  const { files } = useContext(FileUploadContext);
  if (files.length === 0) return null;

  return (
    <div className={`file-upload__list-container ${className}`}>
      <ul className="file-upload__list">
        {files.map(file => <Item key={file.id} file={file} />)}
      </ul>
    </div>
  );
};

const Item = React.memo(({ file }) => {
  const { removeFile, formatBytes, Icon } = useContext(FileUploadContext);
  const { id, progress, status, error } = file;

  return (
    <li className={`file-upload__item status--${status}`}>
      <div className="file-upload__item-icon"><Icon.File /></div>
      <div className="file-upload__item-details">
        <span className="file-upload__item-name" title={file.file.name}>{file.file.name}</span>
        <div className="file-upload__item-info">
          <span className="file-upload__item-size">{formatBytes(file.file.size)}</span>
          {status === 'error' && <span className="file-upload__item-error">{error}</span>}
        </div>
        {(status === 'uploading' || status === 'success') && (
          <div className="file-upload__progress-bar-container">
            <div className="file-upload__progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
      <div className="file-upload__item-status">
        {status === 'uploading' && <Icon.Spinner className="spinning" />}
        {status === 'success' && <Icon.CheckCircle style={{ color: '#4caf50' }} />}
        {status === 'error' && <Icon.ErrorCircle style={{ color: '#f44336' }} />}
      </div>
      <button type="button" className="file-upload__item-remove" title="파일 제거" onClick={() => removeFile(id)}>
        <Icon.Remove />
      </button>
    </li>
  );
});

const Submit = ({ children, className = '' }) => {
  const { files, uploadAll } = useContext(FileUploadContext);
  const pendingCount = useMemo(() => files.filter(f => f.status === 'pending').length, [files]);

  if (files.length === 0) return null;

  return (
    <button type="button" className={`file-upload__submit ${className}`} onClick={uploadAll} disabled={pendingCount === 0}>
      {children || (pendingCount > 0 ? `${pendingCount}개 파일 업로드` : '업로드 완료')}
    </button>
  );
};

// --- 네임스페이스에 하위 컴포넌트 할당 ---
FileUpload.Dropzone = Dropzone;
FileUpload.Trigger = Trigger;
FileUpload.List = List;
FileUpload.Submit = Submit;

export default FileUpload;
