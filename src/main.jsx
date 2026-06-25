import './lib/faro.js' // Grafana Faro RUM 초기화 (최상단: 초기 에러/Web Vitals 캡처)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

export const CHUNK_RELOAD_KEY = '__smep_chunk_reload_ts__'
const RELOAD_COOLDOWN_MS = 5_000 // 5초 이내 자동 재로딩 중복 방지 (무한 루프 차단)

const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /ChunkLoadError/i,
  /Loading chunk[\s\S]*failed/i,
]

const isChunkLoadError = (errorLike) => {
  const message = String(errorLike?.message || errorLike || '')
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

export const reloadOnce = () => {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0)
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()))
  } catch {
    // sessionStorage 접근 불가 시 무조건 1회 새로고침
  }
  window.location.reload()
}

// Vite 4+: dynamic import 실패 시 가장 먼저 발생하는 이벤트
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault?.()
  reloadOnce()
})

window.addEventListener('error', (event) => {
  if (isChunkLoadError(event.error || event.message)) {
    reloadOnce()
  }
})

window.addEventListener('unhandledrejection', (event) => {
  if (isChunkLoadError(event.reason)) {
    event.preventDefault?.()
    reloadOnce()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
