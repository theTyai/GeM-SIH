const http = require('http');

http.get('http://localhost:3000/api/v1/extension/audits/34ee89c9-ab72-49a4-8e09-1625b4e990f1/status', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
