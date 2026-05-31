import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/index.jsx';
import { CubeIAxProvider } from '@cube-i-ax/sdk/react';
import { ProgramChatProvider } from '@cube-i-ax/sdk/smes/program';
import { useAuthStore } from './store/useAuthStore.jsx';
import AdditionalInfoRequiredGate from './components/account/AdditionalInfoRequiredGate.jsx';
import { queryClient } from './lib/queryClient.js';

// 앱이 정상적으로 마운트되면 청크 리로드 쿨다운 타임스탬프를 제거
// → 이후 수동 새로고침 시 쿨다운에 막히지 않고 청크 오류를 복구할 수 있음
const CHUNK_RELOAD_KEY = '__smep_chunk_reload_ts__';
try { sessionStorage.removeItem(CHUNK_RELOAD_KEY); } catch { /* ignore */ }

const AI_CONFIGS = {
  prod: {
    url: 'https://www.smes-tipa.go.kr/aiax-dev/v1',
    key: 'sk-F4E9gAEtT-5NKFuPIiDnT3UoNyXqXSwOFqcfp__CUDY',
    label: '운영(개발) 서버',
  },
  dev: {
    url: 'https://ax.llmonx.kr:28443/v1',
    key: 'sk-dSXsb0I7zcjxqr23mwYsjJoFFpCfvjg5LHkwaf-CP0s',
    label: '개발 서버',
  },
};

const SAMPLE_COMPANY_PROFILE = {
  region: '서울',
  companySize: '소상공인',
  employeeCount: 20,
  sales: 3000000000,
  isSme: false,
  isVenture: false,
  isStartup: false,
  isSocialEnterpriseTarget: false,
  isExporter: false,
  isWomenOwned: false,
  isYouth: false,
  isDisabledOwned: false,
  isVeteran: false,
  isSenior: false,
  hasInnobiz: false,
  hasMainbiz: false,
  hasResearchDept: false,
  hasIso: false,
};

// KRDS 스타일과 컴포넌트 불러오기
import '../styles/output.css';
import '../styles/onCommon.css';
import '../styles/onCommon_2.css';
// import '@krds-ui/core/dist/style.css';

export const AI_SETTINGS = {
  topK: 20,
  rerankerTopK: 10,
  groupByField: 'group_id',
  domain: 'support_program',
};

function App() {
  const { companyProfile } = useAuthStore();
  const effectiveProfile = companyProfile || SAMPLE_COMPANY_PROFILE;
  const [aiEnv, setAiEnv] = useState(() => localStorage.getItem('__ai_env__') || 'prod');

  const currentAiConfig = AI_CONFIGS[aiEnv] || AI_CONFIGS.dev;

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === '__ai_env__') {
        setAiEnv(e.newValue || 'dev');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-window updates
    const handleCustomChange = (e) => {
      setAiEnv(e.detail || 'dev');
    };
    window.addEventListener('ai-env-change', handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ai-env-change', handleCustomChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CubeIAxProvider
        key={aiEnv}
        apiKey={currentAiConfig.key}
        baseUrl={currentAiConfig.url}
      >
        <ProgramChatProvider 
          profile={effectiveProfile}
          domain={AI_SETTINGS.domain}
          includeCitations={true}
          maxResponseLength={2048}
          maxTokens={1024}
          topK={AI_SETTINGS.topK}
          rerankerTopK={AI_SETTINGS.rerankerTopK}
          groupByField={AI_SETTINGS.groupByField}
        >
          <AppRouter />
          <AdditionalInfoRequiredGate />
        </ProgramChatProvider>
      </CubeIAxProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
