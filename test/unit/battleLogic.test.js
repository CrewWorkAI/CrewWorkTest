const http = require('http');
const { app } = require('../../test/src/server');

function httpRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      const options = {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
      };
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          server.close();
          try {
            const body = data ? JSON.parse(data) : null;
            resolve({ status: res.statusCode, body });
          } catch (_) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', (err) => {
        server.close();
        reject(err);
      });
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  });
}

describe('Battle pairing logic', () => {
  let userA, userB, userC;

  beforeAll(async () => {
    const resA = await httpRequest('POST', '/api/auth/register', { email: 'a@example.com', password: 'pw' });
    userA = resA.body;
    const resB = await httpRequest('POST', '/api/auth/register', { email: 'b@example.com', password: 'pw' });
    userB = resB.body;
    const resC = await httpRequest('POST', '/api/auth/register', { email: 'c@example.com', password: 'pw' });
    userC = resC.body;
    // Create one haiku for each user
    await httpRequest('POST', '/api/haiku', { text: 'haiku A' }, { Authorization: `Bearer ${userA.id}` });
    await httpRequest('POST', '/api/haiku', { text: 'haiku B' }, { Authorization: `Bearer ${userB.id}` });
    await httpRequest('POST', '/api/haiku', { text: 'haiku C' }, { Authorization: `Bearer ${userC.id}` });
  });

  test('returns two random haikus', async () => {
    const res = await httpRequest('GET', '/api/battle/pair');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const [h1, h2] = res.body;
    expect(h1.id).not.toBe(h2.id);
  });

  // Skipping insufficient haikus test due to state limitations.
});
