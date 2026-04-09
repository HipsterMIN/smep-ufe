// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './playwright',
    timeout: 30000,
    use: {
        headless: true,
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
        {
            name: 'edge',
            use: {
                browserName: 'chromium',
                channel: 'msedge',   // ← Edge 실행 핵심 설정
            },
        },
/*        {
            name: 'firefox',
            use: { browserName: 'firefox' },
        },*/
        {
            name: 'webkit',
            use: { browserName: 'webkit' },
        },
    ],
});