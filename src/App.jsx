import React from 'react';
import FileUpload from './components/FileUpload';
import RichEditor from './components/RichEditor'; // RichEditor도 함께 렌더링하여 비교
import './App.css';

function App() {
  // onUploadComplete와 같은 콜백은 App.jsx가 아닌,
  // FileUpload를 실제로 사용하는 상위 비즈니스 컴포넌트에서 정의하고 전달하는 것이 좋습니다.
  // 여기서는 props 전달 예시만 보여줍니다.
  const handleUploadComplete = (results) => {
    console.log('Upload results:', results);
    const successfulUploads = results.filter(r => r.success).length;
    const failedUploads = results.filter(r => !r.success).length;
    console.log(`${successfulUploads} files succeeded, ${failedUploads} files failed.`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Component Showcase</h1>
      </header>
      <main className="component-container">
        <section>
          <h2>File Uploader Component</h2>
          <FileUpload
            theme="dark"
            width="100%"
            height="400px"
            // 실제 서버의 업로드 URL을 입력하세요.
            // 테스트를 위해선 'https://httpbin.org/post' 와 같은 테스트용 URL을 사용할 수 있습니다.
            uploadUrl="https://httpbin.org/post"
            
            // 허용할 파일 타입 (MIME type). null이면 모두 허용.
            // allowedFileTypes={['image/jpeg', 'image/png', 'application/pdf']}
            
            // 금지할 파일 타입
            prohibitedFileTypes={['application/x-msdownload', 'application/octet-stream']}
            
            // 파일 당 최대 크기 (5MB)
            maxFileSize={5 * 1024 * 1024}
            
            // 최대 파일 개수
            maxFiles={10}
            
            // 업로드 완료 시 실행될 콜백
            onUploadComplete={handleUploadComplete}
          />
        </section>
        <section>
          <h2>Rich Text Editor Component</h2>
          <RichEditor theme="dark" />
        </section>
      </main>
      <style>{`
        .App {
          text-align: center;
          background-color: #1e1e1e;
          color: white;
          min-height: 100vh;
        }
        .App-header {
          padding: 20px;
        }
        .component-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        section {
          text-align: left;
        }
        h2 {
          margin-bottom: 16px;
          border-bottom: 1px solid #444;
          padding-bottom: 8px;
        }
      `}</style>
    </div>
  );
}

export default App;
