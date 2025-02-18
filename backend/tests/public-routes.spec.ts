import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('body')).toContainText('Hello =)');
});

test('test1', async ({ request }) => {
  const response = await request.post(``, {
    data: {
      username: 'tester',
      password: '123'
    }
  });
  
});

