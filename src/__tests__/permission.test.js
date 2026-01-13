const request = require('supertest');
const app = require('../../app/server');

/**
 * Tests for the permission middleware and the protected `/accounts/:id/health`
 * route.  The tests spin up the express instance in memory using supertest
 * so no network activity is required.
 */

describe('Permission Middleware', () => {
  test('Owner with matching account can access health data', async () => {
    const res = await request(app)
      .get('/accounts/123/health')
      .set('x-user-role', 'Owner')
      .set('x-account-id', '123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ account_id: '123', health: 'Excellent' });
  });

  test('Collaborator cannot access health data', async () => {
    const res = await request(app)
      .get('/accounts/123/health')
      .set('x-user-role', 'Collaborator')
      .set('x-account-id', '123');
    expect(res.status).toBe(403);
  });

  test('Owner with mismatched account is forbidden', async () => {
    const res = await request(app)
      .get('/accounts/123/health')
      .set('x-user-role', 'Owner')
      .set('x-account-id', '999');
    expect(res.status).toBe(403);
  });

  test('Missing headers results in 401', async () => {
    const res = await request(app).get('/accounts/123/health');
    expect(res.status).toBe(401);
  });
});

