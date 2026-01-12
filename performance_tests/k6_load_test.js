import http from 'k6/http';
import { check, sleep } from 'k6';

// Base URL for the API – can be overridden by the environment variable `BASE_URL`
const BASE_URL = __ENV.BASE_URL ?? 'http://localhost:3001';

export let options = {
  stages: [
    // ramp up to 500 VUs over 2 minutes
    { duration: '2m', target: 500 },
    // sustain 500 VUs for 5 minutes
    { duration: '5m', target: 500 },
    // ramp up to 1000 VUs over 2 minutes
    { duration: '2m', target: 1000 },
    // sustain 1000 VUs for 5 minutes
    { duration: '5m', target: 1000 },
    // ramp down to 0
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests below 500ms
    http_req_failed: ['rate<0.01'],   // less than 1% failures
  },
};

export default function () {
  // Create a new user with a deterministic email per virtual user & iteration
  const email = `user__${__VU}__${__ITER}@example.com`;
  const password = 'P@ssw0rd!';

  // 1. Register
  const registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(registerRes, {
    'register status 201': (r) => r.status === 201,
  });

  sleep(0.5);
  // 2. Login
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(loginRes, {
    'login status 200': (r) => r.status === 200,
  });
  const token = JSON.parse(loginRes.body).token;

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 3. Fetch haikus list (to simulate reading a battle)
  const listRes = http.get(`${BASE_URL}/api/haikus`, {
    headers: authHeaders,
  });
  check(listRes, {
    'haikus status 200': (r) => r.status === 200,
  });

  sleep(0.5);
  // 4. Submit a new haiku
  const submitRes = http.post(
    `${BASE_URL}/api/haikus`,
    JSON.stringify({ text: `Test haiku ${__VU} ${__ITER}`, tags: ['test'] }),
    { headers: { 'Content-Type': 'application/json', ...authHeaders } }
  );
  check(submitRes, {
    'submit status 201': (r) => r.status === 201,
  });

  sleep(1);
}
