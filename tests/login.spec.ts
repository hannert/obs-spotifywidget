import { expect, test } from '@playwright/test';

test('Login from landing - Successful login', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('http://localhost:3000/login');
  await expect(page.locator('body')).toMatchAriaSnapshot(`
    - text: Login Username
    - textbox "Username"
    - text: Password
    - textbox "Password"
    - button:
      - img
    - button "Submit"
    - link "or register here"
    `);
  await expect(page.getByRole('textbox', { name: 'Username' })).toBeEmpty();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('tester');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123');
  await page.getByRole('button').nth(1).click();
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL('http://localhost:3000/home');
});


test('Successful login - Successful logout', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('http://localhost:3000/login');
  await expect(page.locator('body')).toMatchAriaSnapshot(`
    - text: Login Username
    - textbox "Username"
    - text: Password
    - textbox "Password"
    - button:
      - img
    - button "Submit"
    - link "or register here"
    `);
  await expect(page.getByRole('textbox', { name: 'Username' })).toBeEmpty();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('tester');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123');
  await page.getByRole('button').nth(1).click();
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL('http://localhost:3000/home');
});