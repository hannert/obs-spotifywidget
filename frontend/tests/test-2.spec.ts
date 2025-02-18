import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('div').filter({ hasText: 'Register' }).nth(2)).toBeVisible();
  await expect(page.getByText('UsernamePasswordConfirm PasswordEmailSubmitback to login')).toBeVisible();
  await expect(page.locator('input[name="username"]')).toBeEmpty();
  await page.getByRole('textbox', { name: 'password', exact: true }).click();
  await page.getByRole('textbox', { name: 'confirm password' }).click();
  await page.locator('input[name="email"]').click();
  await page.getByRole('button', { name: 'Submit' }).click();
});