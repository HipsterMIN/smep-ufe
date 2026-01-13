import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE || '/'
  const apiHost = env.VITE_API_HOST || 'http://localhost:8081'
  const apiContext = env.VITE_API_CONTEXT || '/main-dev'

  const server = {}
  if (mode === 'development') {
    const apiPrefix = `${base}api`.replace(/\/+$/, '')
    server.proxy = {
      // 프론트엔드에서 /main-dev/api/... 로 요청하면 백엔드의 /... 로 전달
      [apiPrefix]: {
        target: apiHost,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(new RegExp(`^${apiPrefix}`), ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq) => {})
        },
      },
    }
  }

  return {
    base,
    plugins: [react()],
    server,
  }
})
