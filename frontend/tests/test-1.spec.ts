import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Login' }).click({
    button: 'right'
  });
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Register' }).click();
  await page.locator('div').nth(1).click();
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Login' }).click();
});