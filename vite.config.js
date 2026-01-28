import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE || '/'
  const apiHost = env.VITE_API_HOST || 'http://localhost:8081'
  //const apiContext = env.VITE_API_CONTEXT || '/main-dev'

  const server = {}
  if (mode === 'development') {
    const apiPrefix = `${base}api`.replace(/\/+$/, '')
    server.proxy = {
      // 프론트엔드에서 /main-dev/api/... 로 요청하면 백엔드의 /... 로 전달
      [apiPrefix]: {
        target: apiHost,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(new RegExp(`^${base.replace(/\/$/, '')}`), ''),
        configure: (proxy) => {
          // eslint-disable-next-line no-unused-vars
          proxy.on('proxyReq', (_proxyReq) => {})
        },
      },
    }
  }

  return {
    base,
    plugins: [react()],
    server,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),  // import Button from '@/components/Button'
        '@assets': path.resolve(__dirname, './src/assets'),  // import logo from '@assets/images/logo.png'
        '@components': path.resolve(__dirname, './src/components'),  // import Header from '@components/Header'
        '@context': path.resolve(__dirname, './src/context'),  // import { AuthContext } from '@context/AuthContext'
        '@layouts': path.resolve(__dirname, './src/layouts'),  // import MainLayout from '@layouts/MainLayout'
        '@lib': path.resolve(__dirname, './src/lib'),  // import axios from '@lib/axios'
        '@pages': path.resolve(__dirname, './src/pages'),  // import HomePage from '@pages/HomePage'
        '@publishing': path.resolve(__dirname, './src/publishing'),  // import styles from '@publishing/styles'
        '@routes': path.resolve(__dirname, './src/routes'),  // import { router } from '@routes/index'
        '@store': path.resolve(__dirname, './src/store'),  // import { useUserStore } from '@store/userStore'
        '@utils': path.resolve(__dirname, './src/utils'),  // import { formatDate } from '@utils/date'
        '@styles': path.resolve(__dirname, './styles'),  // import { formatDate } from '@style/common.css'
      },
    },
  }
})
