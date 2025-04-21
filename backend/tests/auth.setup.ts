import { expect, test as setup } from '@playwright/test';


setup('Register-Tester', async ({ request }) => {

  const exists = await request.post(`/auth/login`, {
    data: {
      username: 'tester',
      password: '123'
    }
  });

  if(!exists.ok()) {
    const response = await request.post(`/auth/register`, {
      data: {
        username: 'tester',
        password: '123'
      }
    });
    expect(response.ok()).toBeTruthy();
  }
});

