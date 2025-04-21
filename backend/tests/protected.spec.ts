import { expect, test } from '@playwright/test';


test('Save-Client-ID', async ({ request }) => {
  const response = await request.post(`/client/id`, {
    data: {
      client_id: '123'
    }
  });
  expect(response.ok()).toBeTruthy();

});

test('Save-Client-Secret', async ({ request }) => {
  const response = await request.post(`/client/secret`, {
    data: {
      client_secret: '123'
    }
  });
  expect(response.ok()).toBeTruthy();

});

test('Get-Client', async ({ request }) => {
  const response = await request.get(`/client`);
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  console.log(body)
  expect(body).toStrictEqual({
    "data": {
      "Client_ID": "123",
      "Client_Secret": "123"
    }
  })
});

// Test for a successful (200) status code for account secret link regeneration
test('Regenerate', async ({ request }) => {
  const response = await request.post(`/regenerate`, {
  });
  expect(response.ok()).toBeTruthy();
});
