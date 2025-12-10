import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';
import RichEditor from "./components/RichEditor.jsx";
import SvarGridExample from "./SvarGridExample.jsx"; // SvarGridExample 임포트

// 공통 콜백 함수
const handleUploadComplete = (results) => {
  console.log('Upload results:', results);
  const successfulUploads = results.filter(r => r.success).length;
  const failedUploads = results.filter(r => !r.success).length;
  if (successfulUploads > 0) alert(`${successfulUploads}개 파일 업로드 성공!`);
  if (failedUploads > 0) alert(`${failedUploads}개 파일 업로드 실패.`);
};

function App() {
  return (
    <div className="App">
      <style>{`
        /* --- 글로벌 스타일 --- */
        .file-upload__dropzone { border: 2px dashed #ccc; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all .2s; }
        .file-upload__dropzone:hover, .file-upload__dropzone.dragging { border-color: #2196f3; background-color: rgba(33, 150, 243, .1); }
        .file-upload__trigger { background-color: #007bff; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
        .file-upload__list-container { margin-top: 15px; }
        .file-upload__list { list-style: none; padding: 0; margin: 0; }
        .file-upload__item { display: flex; align-items: center; padding: 10px; border: 1px solid #eee; border-radius: 4px; margin-bottom: 8px; background: #fff; color: #333; }
        .file-upload__item-icon { margin-right: 12px; }
        .file-upload__item-details { flex-grow: 1; overflow: hidden; }
        .file-upload__item-name { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
        .file-upload__item-info { display: flex; align-items: center; margin-top: 4px; font-size: 0.8rem; color: #666; }
        .file-upload__item-error { color: #f44336; margin-left: 8px; font-weight: 500; }
        .file-upload__progress-bar-container { width: 100%; height: 4px; background-color: #e0e0e0; border-radius: 2px; margin-top: 6px; }
        .file-upload__progress-bar { height: 100%; background-color: #2196f3; border-radius: 2px; transition: width .2s; }
        .file-upload__item-status { margin-left: 12px; }
        .file-upload__item-status .spinning { animation: spin 1.5s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .file-upload__item-remove { background: none; border: none; cursor: pointer; opacity: 0.6; margin-left: 12px; padding: 4px; border-radius: 50%; }
        .file-upload__item-remove:hover { opacity: 1; background-color: rgba(0,0,0,.05); }
        .file-upload__submit { background-color: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 15px; width: 100%; }
        .file-upload__submit:disabled { background-color: #9e9e9e; cursor: not-allowed; }

        /* --- 유형별 커스텀 스타일 --- */
        .type-1-container { display: flex; flex-direction: column; }
        .type-1-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        
        .type-2-container { display: flex; flex-direction: column; height: 400px; /* 높이 고정 예시 */ }
        .type-2-container .file-upload__list-container { flex-grow: 1; overflow-y: auto; } /* 목록이 남은 공간을 모두 차지하고 스크롤 */

        .type-3-container .file-upload__trigger { width: 100%; }
        .type-3-container .file-upload__list-container { max-height: 300px; overflow-y: auto; }
      `}</style>

      <main className="component-container">
        {/* --- 유형 1: 버튼 + 목록 + 제출 --- */}
        <section>
          <h2>Type 1: Trigger + List + Submit</h2>
          <FileUpload uploadUrl="https://httpbin.org/post" onUploadComplete={handleUploadComplete}>
            <div className="type-1-container">
              <div className="type-1-header">
                <h3>선택된 파일</h3>
                <FileUpload.Trigger>파일 선택</FileUpload.Trigger>
              </div>
              <FileUpload.List />
              <FileUpload.Submit />
            </div>
          </FileUpload>
        </section>

        {/* --- 유형 2: 드롭존 + 목록 + 제출 --- */}
        <section>
          <h2>Type 2: Dropzone + List + Submit</h2>
          <FileUpload uploadUrl="https://httpbin.org/post" onUploadComplete={handleUploadComplete}>
            <div className="type-2-container">
              <FileUpload.Dropzone>
                <p>여기에 파일을 드래그하거나, <FileUpload.Trigger>클릭하여 선택</FileUpload.Trigger>하세요.</p>
              </FileUpload.Dropzone>
              <FileUpload.List />
              <FileUpload.Submit />
            </div>
          </FileUpload>
        </section>

        {/* --- 유형 3: 버튼 + 자동 업로드 --- */}
        <section>
          <h2>Type 3: Trigger with Auto-Upload</h2>
          <FileUpload uploadUrl="https://httpbin.org/post" autoUpload={true} onUploadComplete={handleUploadComplete}>
            <div className="type-3-container">
              <FileUpload.Trigger>파일 선택 (즉시 업로드)</FileUpload.Trigger>
              <FileUpload.List />
            </div>
          </FileUpload>
        </section>

          <h2>TipTap 리치 에디터 예제</h2>
          <RichEditor />

          <hr style={{ margin: '40px 0' }} />

          {/* Svar Grid 예제 추가 */}
          <SvarGridExample />
      </main>
    </div>
  );
}

export default App;
