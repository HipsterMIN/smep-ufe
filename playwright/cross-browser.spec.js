// tests/cross-browser.spec.js
import {test, expect} from '@playwright/test';

const browsers = ['chromium', 'edge', 'webkit'];

for (const browserName of browsers) {
    test.describe(`${browserName} 브라우저 테스트`, () => {
        test('메인 페이지 로드 확인', async ({ page }) => {
            await page.goto('https://www.smes-tipa.go.kr/home-dev/req/pbanc/pbanc/223583204');

            await expect(page).toHaveTitle(/중소벤처24/);
            // await expect(page.locator('h1')).toBeVisible();
        });
    });
}