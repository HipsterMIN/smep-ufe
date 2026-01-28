import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/index.jsx';
import { CubeIAxProvider } from '@cube-i-ax/sdk/react';
import { ProgramChatProvider } from '@cube-i-ax/sdk/smes/program';
import { useAuthStore } from './store/useAuthStore.jsx';

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

function App() {
  const { companyProfile } = useAuthStore();
  const effectiveProfile = companyProfile || SAMPLE_COMPANY_PROFILE;

  return (
    <AuthProvider>
      <CubeIAxProvider
        apiKey={import.meta.env.VITE_CUBE_IAX_API_KEY}
        baseUrl={import.meta.env.VITE_CUBE_IAX_API_URL}
      >
        <ProgramChatProvider 
          profile={effectiveProfile}
          domain="support_program"
          includeCitations={true}
          maxResponseLength={2048}
          maxTokens={1024}
          topK={50}
          rerankerTopK={10}
          groupByField="group_id"
        >
          <AppRouter />
        </ProgramChatProvider>
      </CubeIAxProvider>
    </AuthProvider>
  );
}

export default App;
