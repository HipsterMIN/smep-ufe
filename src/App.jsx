import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/index.jsx';
// KRDS 스타일과 컴포넌트 불러오기
import '../styles/output.css';
import '../styles/onCommon.css';
import '@krds-ui/core/dist/style.css';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
