// Simple API client using Fetch with environment-based base URL
// 백엔드는 컨텍스트 패스가 없으므로 프론트엔드의 컨텍스트 패스(/main-dev, /main)를 사용하여 API를 호출하고
// 개발 서버(Vite)나 Nginx에서 이를 제거하여 백엔드로 전달합니다.

import { useAuthStore } from '../store/useAuthStore';

const API_CONTEXT = (import.meta.env.VITE_API_CONTEXT || '').replace(/^\/?/, '/');

// 프론트엔드 베이스 경로(/main-dev/, /main/)
const APP_BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

// 모든 API 호출은 /main-dev/api/... 또는 /main/api/... 형태로 시작하도록 구성
export const apiBaseUrl = `${APP_BASE}${API_CONTEXT}`.replace(/\/$/, '');

function buildUrl(path) {
  if (!path) return apiBaseUrl;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const slash = path.startsWith('/') ? '' : '/';
  return `${apiBaseUrl}${slash}${path}`;
}

export async function apiFetch(path, { method = 'GET', headers = {}, body, token, raw = false, ...rest } = {}) {
  const baseHeaders = { 'Content-Type': 'application/json', ...headers };
  
  // 1. 명시적으로 전달된 토큰이 있으면 사용
  let authToken = token;

  // 2. 없으면 AuthStore에서 가져오기
  if (!authToken) {
    try {
      const state = useAuthStore.getState();
      authToken = state.token;
    } catch (e) {
      // 스토어 접근 실패 시 무시 (로그인 전일 수 있음)
    }
  }

  if (authToken) {
    baseHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const init = {
    method,
    headers: baseHeaders,
    ...rest,
  };

  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  } else if (body instanceof FormData) {
    // Let browser set multipart boundaries
    delete init.headers['Content-Type'];
    init.body = body;
  }

  const res = await fetch(buildUrl(path), init);
  if (!raw) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data?.message || 'API Error');
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    } else {
      const text = await res.text();
      if (!res.ok) {
        const err = new Error(text || 'API Error');
        err.status = res.status;
        err.data = text;
        throw err;
      }
      return text;
    }
  }
  // raw response
  if (!res.ok) {
    const err = new Error('API Error');
    err.status = res.status;
    throw err;
  }
  return res;
}

export const api = {
  get: (p, opts) => apiFetch(p, { ...opts, method: 'GET' }),
  post: (p, body, opts) => apiFetch(p, { ...opts, method: 'POST', body }),
  put: (p, body, opts) => apiFetch(p, { ...opts, method: 'PUT', body }),
  patch: (p, body, opts) => apiFetch(p, { ...opts, method: 'PATCH', body }),
  delete: (p, opts) => apiFetch(p, { ...opts, method: 'DELETE' }),
};
