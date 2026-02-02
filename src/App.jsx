import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/index.jsx';
import { CubeIAxProvider } from '@cube-i-ax/sdk/react';
import { ProgramChatProvider } from '@cube-i-ax/sdk/smes/program';
import { useAuthStore } from './store/useAuthStore.jsx';

const AI_CONFIGS = {
  prod: {
    url: 'https://www.smes-tipa.go.kr/aiax-dev/v1',
    key: 'sk-F4E9gAEtT-5NKFuPIiDnT3UoNyXqXSwOFqcfp__CUDY',
    label: '운영(개발) 서버'
  },
  dev: {
    url: 'https://ax.llmonx.kr:28443/v1',
    key: 'sk-dSXsb0I7zcjxqr23mwYsjJoFFpCfvjg5LHkwaf-CP0s',
    label: '개발 서버'
  }
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
  const [aiEnv, setAiEnv] = useState(() => localStorage.getItem('__ai_env__') || 'dev');

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
        </ProgramChatProvider>
      </CubeIAxProvider>
    </AuthProvider>
  );
}

export default App;
