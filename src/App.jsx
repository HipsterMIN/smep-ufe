import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import router from './routes/index.jsx';
import { CubeIAxProvider } from "@cube-i-ax/sdk/react";
import { ProgramSearchProvider } from "@cube-i-ax/sdk/smes/program";

const SAMPLE_COMPANY_PROFILE = {
  region: "서울",
  companySize: "소기업",
  isSme: true,
  isVenture: true,
  isStartup: true,
  isYouth: true,
  hasInnobiz: false,
  hasMainbiz: false,
  hasResearchDept: true,
  registeredPatents: 3,
};

// KRDS 스타일과 컴포넌트 불러오기
import '../styles/output.css';
import '../styles/onCommon.css';
// import '@krds-ui/core/dist/style.css';

function App() {
  return (
    <AuthProvider>
      <CubeIAxProvider
        apiKey={import.meta.env.VITE_CUBE_IAX_API_KEY}
        baseUrl={import.meta.env.VITE_CUBE_IAX_API_URL}
      >
        <ProgramSearchProvider profile={SAMPLE_COMPANY_PROFILE} stream topK={20}>
          <RouterProvider router={router} />
        </ProgramSearchProvider>
      </CubeIAxProvider>
    </AuthProvider>
  );
}

export default App;
