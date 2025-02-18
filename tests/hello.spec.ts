import { expect, test } from '@playwright/test';

test('API', async ({ page }) => {
  await page.goto('http://localhost:3001/');
  await expect(page.locator('body')).toContainText('Hello =)');
});