import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const CHUNK_RELOAD_KEY = '__smep_chunk_reload_ts__'
const RELOAD_COOLDOWN_MS = 15_000 // 15초 이내 재로딩은 무시 (무한 루프 방지)

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

const reloadOnce = () => {
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
