import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/index.jsx';
import AdditionalInfoRequiredGate from './components/account/AdditionalInfoRequiredGate.jsx';
import { TokenRefreshInitializer } from './components/account/TokenRefreshInitializer.jsx';
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
// 에디터 본문 서식(.se-doc) — 공고/지원사업/행사 상세의 편집기 산출 HTML 을
// 관리자 편집/미리보기 화면과 동일한 서식으로 렌더링한다 (@smep/smart-editor 공용 소스)
import '@smep/smart-editor/content.css';
// import '@krds-ui/core/dist/style.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* 페이지 리로드 후 access token 복구 (AppRouter보다 먼저 실행) */}
        <TokenRefreshInitializer />
        <AppRouter />
        {/*<AdditionalInfoRequiredGate />*/}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
