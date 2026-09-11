const https = require('https');

function checkUrl(url) {
  console.log('Testing URL:', url);
  const req = https.get(url, { timeout: 10000 }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => console.log('Response for', url, ':', res.statusCode, data));
  });
  req.on('error', e => console.error('Error for', url, ':', e.message));
  req.on('timeout', () => {
    console.error('Timeout for', url);
    req.destroy();
  });
}

checkUrl('https://finance-app-awae.onrender.com/health');
checkUrl('https://finance-app-841v.onrender.com/health');
