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
    build: {
      // ─── modulePreload 선택적 적용 ──────────────────────────────────────────
      // Vite 기본 동작: 모든 manualChunk 벤더를 index.html에 <link rel="modulepreload">로 삽입
      // → 메인 페이지에서 recharts(332KB), datepicker(161KB), markdown(157KB) 등을 즉시 다운로드
      // → 서버(Nginx) 버퍼 오버플로 → ERR_CONTENT_LENGTH_MISMATCH 유발
      // 해결: 앱 초기화에 반드시 필요한 청크만 preload, 나머지는 실제 사용 시 지연 로드
      modulePreload: {
        // HTTP/1.1 환경(연결 6개 제한)에서 modulepreload 힌트가 연결 슬롯을 선점하면
        // CSS 파일이 Pending 상태로 밀려 흰 화면 발생.
        // preload를 비활성화하면 브라우저가 CSS(stylesheet)를 최우선 처리하고
        // JS는 index.js 파싱 후 순차적으로 로딩 → 흰 화면 방지.
        // HTTP/2 전환 시 이 설정을 되돌릴 것.
        resolveDependencies: () => [],
      },
      rollupOptions: {
        output: {
          // 자주 바뀌지 않는 라이브러리를 별도 청크로 분리 → 브라우저 캐시 재사용
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            // 순서 중요: 더 구체적인 패턴을 먼저 검사
            if (id.includes('/echarts') ||
                id.includes('/zrender/'))         return 'vendor-echarts';
            if (id.includes('/@tiptap/'))        return 'vendor-tiptap';
            if (id.includes('/swiper/'))          return 'vendor-swiper';
            if (id.includes('/recharts/') ||
                id.includes('/d3-') ||
                id.includes('/victory-'))         return 'vendor-recharts';
            if (id.includes('/lucide-react/'))    return 'vendor-lucide';
            if (id.includes('/react-datepicker/')) return 'vendor-datepicker';
            // vendor-markdown 제거 (react-markdown/remark 미사용)
            if (id.includes('/@svar-ui/'))        return 'vendor-grid';
            if (id.includes('/react-router') ||
                id.includes('/@remix-run/'))      return 'vendor-router';
            if (id.includes('/react/') ||
                id.includes('/react-dom/') ||
                id.includes('/scheduler/'))       return 'vendor-react';
            // zustand는 10.5KB로 소형이며 모든 페이지에서 항상 필요 → index 번들에 포함
            if (id.includes('/@tanstack/'))       return 'vendor-query';
          },
        },
      },
    },
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
