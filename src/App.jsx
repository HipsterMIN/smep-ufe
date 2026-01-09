import React from 'react';
import FileUpload from './components/FileUpload';
//import './App.css';
import RichEditor from "./components/RichEditor.jsx";
import SvarGridExample from "./SvarGridExample.jsx";
import Counter from './components/Counter.jsx';
import { AuthProvider } from './context/AuthContext';
import { Link } from 'react-router-dom';
import Header from "./components/ui/Header.jsx";
import Footer from "./components/ui/Footer.jsx";
// KRDS 스타일과 컴포넌트 불러오기
import '../styles/output.css';
import '../styles/onCommon.css';
import '@krds-ui/core/dist/style.css';
import { Display, Button } from '@krds-ui/core';
import { } from '@krds-ui/icon';



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
    <AuthProvider>
      <div id="wrap">
        <Header />{ /* 임시 해더 */}
        <div id="container">
          { /*컨텐츠 영역 */}
          <div className="inner">
            컨텐츠 영역
          </div>
          { /*컨텐츠 영역 */}
        </div>
        <Footer />{ /* 임시 푸터 */}
      </div>
    </AuthProvider>
  );
}

export default App;
