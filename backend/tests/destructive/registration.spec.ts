import { expect, test } from '@playwright/test';

// Test for a successful (200) status code user login with authorization tokens set in response
// test('Register-Successful', async ({ request }) => {
//   const response = await request.post(`/auth/register`, {
//     data: {
//       username: 'User_To_Be_Deleted',
//       password: 'Test_Password'
//     }
//   });
//   expect(response.ok()).toBeTruthy();

//   // Check if cookies are trying to be set in response
//   const headers = await response.headers();
//   expect(headers['set-cookie']).toContain('spotify_accessToken');
//   expect(headers['set-cookie']).toContain('spotify_refreshToken');
  
// });

// Test for unsucessful (400) status code user login. (User does not exist)
test('Register-Unsuccessful', async ({ request }) => {
  const response = await request.post(`/auth/login`, {
    data: {
      username: 'tester',
      password: 'Test_Password'
    }
  });
  expect(response.status()).toBe(400);

});


