const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

function checkUrl(url) {
  return new Promise(resolve => {
    if (!url) return resolve({ status: 404, size: 0, error: 'Empty URL' });
    const getter = url.startsWith('https:') ? https : http;
    getter.get(url, res => {
      let size = 0;
      res.on('data', chunk => size += chunk.length);
      res.on('end', () => resolve({ status: res.statusCode, contentType: res.headers['content-type'], size }));
    }).on('error', err => resolve({ status: 500, size: 0, error: err.message }));
  });
}

async function inspectGallery() {
  console.log('===========================================================');
  console.log('INSPECTING GALLERY RECORDS IN SUPABASE');
  console.log('===========================================================');

  const { data: records, error } = await supabase.from('gallery').select('*');
  if (error) {
    console.error('Error selecting gallery:', error);
    process.exit(1);
  }

  console.log(`Total gallery records in DB: ${records.length}\n`);

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const rawRecord = rec.data ? { ...rec, ...rec.data } : rec;
    const imgUrl = rawRecord.image || rawRecord.image_url || rawRecord.url || '';
    const res = await checkUrl(imgUrl);

    console.log(`Record #${i + 1}:`);
    console.log(`  ID:           ${rec.id}`);
    console.log(`  Title:        ${rawRecord.title || rawRecord.name || '(No Title)'}`);
    console.log(`  Image URL:    ${imgUrl}`);
    console.log(`  HTTP Status:  ${res.status}`);
    console.log(`  Content-Type: ${res.contentType || 'N/A'}`);
    console.log(`  Size:         ${res.size} bytes`);
    console.log(`  Working:      ${res.status === 200 && res.size > 0 ? 'YES' : 'NO BROKEN'}\n`);
  }
}

inspectGallery();
