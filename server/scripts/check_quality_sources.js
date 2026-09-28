const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

function checkUrl(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      let size = 0;
      res.on('data', chunk => size += chunk.length);
      res.on('end', () => {
        resolve({ status: res.statusCode, contentType: res.headers['content-type'], size });
      });
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  const reportPath = path.join(__dirname, '../final_images_report.json');
  const content = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const sanitary = content.filter(item => item.category && item.category.toLowerCase().includes('sanitary'));

  console.log('Testing 15 Sanitaryware URLs from final_images_report.json:');
  for (const item of sanitary) {
    const res = await checkUrl(item.url);
    console.log(`- ${item.product} | Status: ${res.status} | Content-Type: ${res.contentType} | Size: ${(res.size/1024).toFixed(1)} KB | URL: ${item.url}`);
  }
}

run();
