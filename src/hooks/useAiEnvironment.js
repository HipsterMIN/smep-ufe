import { useEffect, useState } from 'react';

const AI_ENV_STORAGE_KEY = '__ai_env__';
const DEFAULT_AI_ENV = 'prod';

const getStoredAiEnv = () => {
  if (typeof window === 'undefined') return DEFAULT_AI_ENV;
  return localStorage.getItem(AI_ENV_STORAGE_KEY) || DEFAULT_AI_ENV;
};

export const useAiEnvironment = () => {
  const [aiEnv, setAiEnv] = useState(getStoredAiEnv);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== AI_ENV_STORAGE_KEY) return;
      setAiEnv(event.newValue || DEFAULT_AI_ENV);
    };

    const handleCustomChange = (event) => {
      setAiEnv(event.detail || DEFAULT_AI_ENV);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ai-env-change', handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ai-env-change', handleCustomChange);
    };
  }, []);

  return { aiEnv };
};
