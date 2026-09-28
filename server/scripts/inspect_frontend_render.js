const fs = require('fs');
const path = require('path');
const http = require('http');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function inspect() {
  console.log('--- TESTING LOCAL BACKEND /api/content RESPONSES ---');
  const apiJsonStr = await fetchUrl('http://localhost:10000/api/content');
  const apiData = JSON.parse(apiJsonStr);

  const sanitaryProducts = (apiData.products || []).filter(p =>
    p.category && p.category.trim().toLowerCase() === 'sanitaryware'
  );

  console.log(`Backend API /api/content returned ${sanitaryProducts.length} Sanitaryware products:`);
  sanitaryProducts.forEach((p, index) => {
    console.log(`${index + 1}. Product: "${p.name}" (ID: ${p.id})`);
    console.log(`   image property: ${p.image}`);
    console.log(`   updated_at property: ${p.updated_at || p.updatedAt}`);
  });
}

inspect().catch(err => console.error(err));
