import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createReadStream, createWriteStream, readdirSync } from 'fs'
import { createGzip } from 'zlib'
import { extname, join } from 'path'
import { pipeline } from 'stream/promises'

/**
 * 빌드 완료 후 dist/assets 의 JS/CSS를 .gz로 사전 압축
 * nginx gzip_static on; 과 함께 사용 — ERR_CONTENT_LENGTH_MISMATCH 방지
 */
function gzipStaticPlugin() {
  return {
    name: 'vite-plugin-gzip-static',
    apply: 'build',
    async closeBundle() {
      const COMPRESSIBLE = new Set(['.js', '.css', '.html', '.json', '.svg', '.xml'])
      const dirs = ['dist/assets', 'dist']
      let count = 0

      for (const dir of dirs) {
        let files
        try { files = readdirSync(dir) } catch { continue }

        await Promise.all(
          files
            .filter(f => COMPRESSIBLE.has(extname(f)) && !f.endsWith('.gz'))
            .map(async (f) => {
              const src = join(dir, f)
              await pipeline(
                createReadStream(src),
                createGzip({ level: 9 }),
                createWriteStream(src + '.gz')
              )
              count++
            })
        )
      }
      console.log(`\n✓ gzip-static: ${count}개 파일 사전 압축 완료`)
    },
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE || '/'
  const apiHost = env.VITE_API_HOST || 'http://localhost:8081'
  //const apiContext = env.VITE_API_CONTEXT || '/main-dev'

  const apiPrefix = `${base}api`.replace(/\/+$/, '')
  const server = {
    proxy: {
      // 프론트엔드에서 /home-dev/api/... 로 요청하면 백엔드의 /api/... 로 전달
      [apiPrefix]: {
        target: apiHost,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(new RegExp(`^${base.replace(/\/$/, '')}`), ''),
      },
    },
  }

  return {
    base,
    plugins: [react(), gzipStaticPlugin()],
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
          // HTTP/1.1 환경 최적화: 모든 node_modules를 vendor.js 하나로 통합
          //
          // 이전 전략(청크 분리)의 문제:
          //   index.js 로드 시 vendor-react, vendor-router, vendor-query,
          //   vendor-recharts, vendor-datepicker가 동시에 정적 import됨
          //   → 순간 6~8개 동시 요청 → HTTP/1.1 연결 한계 초과 → Pending
          //
          // 현재 전략(vendor 통합):
          //   초기 요청: index.js + vendor.js + CSS 2개 = 4개 (6개 한계 이내)
          //   → Pending 없음, 안정적 로딩
          //   → vendor.js는 한 번 캐시되면 이후 재사용
          //   → HTTP/2 전환 시 다시 청크 분리로 되돌릴 것
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            return 'vendor';
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
