import { expect, test } from '@playwright/test';

// Duplicate from auth.setup.ts
// Test for a successful (200) status code user login with authorization tokens set in response
test('Login-Successful', async ({ request }) => {
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
  const storage = await request.storageState();
});



// Test for unsucessful (400) status code user login. (User does not exist)
test('Login-Unsuccessful', async ({ request }) => {
  const response = await request.post(`/auth/login`, {
    data: {
      username: 'User_That_Doesnt_Exist',
      password: 'IncorrectPassword'
    }
  });
  expect(response.status()).toBe(400);
});

// Test for a successful (200) status code user login with authorization tokens set in response
auth('Regenerate', async ({ request  }) => {
  const response = await request.post(`/regenerate`, {
  });
  expect(response.ok()).toBeTruthy();

});
