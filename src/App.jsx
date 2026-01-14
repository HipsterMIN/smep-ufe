import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import router from './routes/index.jsx';
import { CubeIAxProvider } from "@cube-i-ax/sdk/react";
import { ProgramChatProvider } from "@cube-i-ax/sdk/smes/program";

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
        <ProgramChatProvider>
          <RouterProvider router={router} />
        </ProgramChatProvider>
      </CubeIAxProvider>
    </AuthProvider>
  );
}

export default App;
