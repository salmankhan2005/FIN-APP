const https = require('https');

const data = JSON.stringify({
  email: 'salmankhandwork@gmail.com',
  name: 'Salman Khan',
  isGoogle: true
});

const req = https.request('https://finance-app-awae.onrender.com/api/auth/google-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 15000
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', body);
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e.message);
});

req.write(data);
req.end();
