import { expect, test } from '@playwright/test';

test('Hello', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText('Hello =)');
});

