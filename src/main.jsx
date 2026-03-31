import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const CHUNK_RELOAD_KEY = '__smep_chunk_reload_once__'

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
    if (window.sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1') {
      return
    }
    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
  } catch {
    // ignore storage access errors; still attempt reload once
  }

  window.location.reload()
}

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
