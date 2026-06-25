// Grafana Faro RUM 초기화 (대민 SPA)
// 매뉴얼 2장(React/Webpack) 기준을 Vite 환경으로 변환: process.env → import.meta.env
import { initializeFaro, getWebInstrumentations, LogLevel } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

const collectorUrl = import.meta.env.VITE_FARO_COLLECTOR_URL || '';
const apiEndpoint = import.meta.env.VITE_FRONTEND_API_ENDPOINT || '';

let faro;

if (collectorUrl) {
  faro = initializeFaro({
    url: collectorUrl,
    app: {
      name: import.meta.env.VITE_FARO_APP_NAME || 'smep-ufe-prd',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE || 'production',
    },
    globalObjectKey: 'faro',
    user: {
      attributes: {
        // tenant_id 미설정 시 hostname 첫 토큰으로 자동 추출
        tenant_id:
          import.meta.env.VITE_FARO_TENANT_ID ||
          window.location.hostname.split('.')[0],
      },
    },
    sessionTracking: { enabled: true, samplingRate: 1.0 },
    // SPA 페이지 이동/종료 시 frontend span 유실 방지 위해 즉시 전송
    batching: { enabled: false },
    instrumentations: [
      ...getWebInstrumentations({
        captureConsole: true,
        captureConsoleDisabledLevels: [LogLevel.DEBUG, LogLevel.LOG],
      }),
      new TracingInstrumentation({
        instrumentationOptions: {
          // apiEndpoint 설정 시 해당 도메인 요청에 traceparent 헤더 전파(FE↔BE 분산추적)
          propagateTraceHeaderCorsUrls: apiEndpoint
            ? [new RegExp(apiEndpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*')]
            : [],
        },
      }),
    ],
  });

  // 활성 사용자(DAU) 집계용 heartbeat (60초, 탭 활성 시에만)
  setInterval(() => {
    if (!document.hidden && faro) faro.api.pushEvent('heartbeat');
  }, 60000);
} else if (import.meta.env.DEV) {
  // 로컬/개발: collector 미설정 → RUM 비활성화 (정상)
  console.warn('[Faro] VITE_FARO_COLLECTOR_URL 미설정 → RUM 비활성화');
}

export { faro };
