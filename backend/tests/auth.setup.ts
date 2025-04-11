import { expect, test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ request }) => {
  // Perform authentication steps. Replace these actions with your own.
    const response = await request.post(`/auth/login`, {
      data: {
        username: 'tester',
        password: '123'
      }
    });
    
  expect(response.ok()).toBeTruthy();

  // Check if cookies are trying to be set in response
  const headers = await response.headers();
  expect(headers['set-cookie']).toContain('spotify_accessToken');
  expect(headers['set-cookie']).toContain('spotify_refreshToken');
  // End of authentication steps.

  await request.storageState({ path: authFile });
});