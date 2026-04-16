// tests/basic.spec.js
import { test, expect } from '@playwright/test';

test.describe('기본 페이지 테스트', () => {
    test('메인 페이지가 정상적으로 로드되는지 확인', async ({ page }) => {
        await page.goto('https://www.smes-tipa.go.kr/home-dev/req/pbanc/pbanc/223583204');

        // 페이지가 React로 렌더링될 시간을 조금 기다림
        await page.waitForLoadState('networkidle');

        // 제목 확인
        await expect(page).toHaveTitle(/중소벤처24/);
        // 해당 텍스트가 DOM 안에 존재하는지 확인
        await expect(page.getByText('[광주] 서구 2025년 소상공인 특례보증 지원사업 공고')).toBeVisible();
    });
});