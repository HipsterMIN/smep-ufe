import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/index.jsx';
import AdditionalInfoRequiredGate from './components/account/AdditionalInfoRequiredGate.jsx';
import { queryClient } from './lib/queryClient.js';

// 앱이 정상적으로 마운트되면 청크 리로드 쿨다운 타임스탬프를 제거
// → 이후 수동 새로고침 시 쿨다운에 막히지 않고 청크 오류를 복구할 수 있음
const CHUNK_RELOAD_KEY = '__smep_chunk_reload_ts__';
try { sessionStorage.removeItem(CHUNK_RELOAD_KEY); } catch { /* ignore */ }

// KRDS 스타일과 컴포넌트 불러오기
import '@styles/output.css';
import '@styles/onCommon.css';
import '@styles/onCommon_2.css';
import '@styles/custom.scss';
// import '@krds-ui/core/dist/style.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <AdditionalInfoRequiredGate />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
