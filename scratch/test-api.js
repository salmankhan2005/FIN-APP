const https = require('https');

const BASE = 'https://fin-app-vtva.onrender.com';

function request(method, path, body, token) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'fin-app-vtva.onrender.com',
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', (e) => resolve({ status: 'ERR', body: e.message }));
    if (payload) req.write(payload);
    req.end();
  });
}

function log(label, result) {
  const ok = result.status >= 200 && result.status < 300;
  const icon = ok ? '✅' : result.status === 401 ? '🔒' : '❌';
  console.log(`${icon} [${result.status}] ${label}`);
  if (typeof result.body === 'object') {
    console.log('   ', JSON.stringify(result.body).slice(0, 200));
  } else {
    console.log('   ', String(result.body).slice(0, 200));
  }
}

async function run() {
  console.log('\n=== Testing API: ' + BASE + ' ===\n');

  // 1. Health check
  log('GET /health', await request('GET', '/health'));

  // 2. Auth - login with wrong creds (expect 401)
  log('POST /api/auth/login (bad creds)', await request('POST', '/api/auth/login', {
    email: 'wrong@test.com', password: 'badpass'
  }));

  // 3. Auth - unauthenticated /me (expect 401)
  log('GET /api/auth/me (no token)', await request('GET', '/api/auth/me'));

  // 4. Customers - unauthenticated (expect 401)
  log('GET /api/customers (no token)', await request('GET', '/api/customers'));

  // 5. Loans - unauthenticated (expect 401)
  log('GET /api/loans (no token)', await request('GET', '/api/loans'));

  // 6. Dashboard - unauthenticated (expect 401)
  log('GET /api/dashboard/summary (no token)', await request('GET', '/api/dashboard/summary'));

  console.log('\n=== Done ===\n');
  console.log('If all 401s show 🔒 and /health shows ✅ => API is live and auth is working correctly.');
}

run();
