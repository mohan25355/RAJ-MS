const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

function recordFromRow(r) {
  if (!r) return r;
  const { data, ...cols } = r;
  return { ...cols, ...(data && typeof data === 'object' ? data : {}) };
}

function checkUrl(url) {
  return new Promise(resolve => {
    if (!url) return resolve({ status: 404, size: 0 });
    const getter = url.startsWith('https:') ? https : http;
    getter.get(url, res => {
      let size = 0;
      res.on('data', chunk => size += chunk.length);
      res.on('end', () => resolve({ status: res.statusCode, size }));
    }).on('error', err => resolve({ status: 500, error: err.message, size: 0 }));
  });
}

function fetchApiContent() {
  return new Promise(resolve => {
    http.get('http://localhost:10000/api/content', res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, error: e.message });
        }
      });
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function runDiagnostic() {
  console.log('===========================================================');
  console.log('TRACE DIAGNOSTIC FOR ALL 15 SANITARYWARE PRODUCTS');
  console.log('===========================================================');

  // 1. Direct Supabase Query
  const { data: dbRows, error: dbErr } = await supabase.from('products').select('*');
  if (dbErr) {
    console.error('Supabase Query Error:', dbErr);
    return;
  }
  const dbProducts = dbRows.map(recordFromRow);
  const dbSanitary = dbProducts.filter(p => p.category && p.category.trim().toLowerCase() === 'sanitaryware');

  console.log(`Step 1: Database returned ${dbSanitary.length} Sanitaryware products.`);

  // 2. API Response from http://localhost:10000/api/content
  const apiRes = await fetchApiContent();
  const apiProducts = Array.isArray(apiRes.data?.products) ? apiRes.data.products : [];
  const apiSanitary = apiProducts.filter(p => p.category && p.category.trim().toLowerCase() === 'sanitaryware');

  console.log(`Step 2: Local API returned ${apiSanitary.length} Sanitaryware products.`);

  // 3. Trace for each product
  const diagnosticReport = [];

  for (const dbProd of dbSanitary) {
    const apiProd = apiSanitary.find(p => p.id === dbProd.id) || {};
    
    // Check URLs
    const dbUrl = dbProd.image || '';
    const apiUrl = apiProd.image || '';

    const dbHttp = await checkUrl(dbUrl);
    const apiHttp = await checkUrl(apiUrl);

    diagnosticReport.push({
      product: dbProd.name,
      id: dbProd.id,
      dbUrl,
      apiUrl,
      dbHttpStatus: dbHttp.status,
      apiHttpStatus: apiHttp.status,
      dbSizeKB: (dbHttp.size / 1024).toFixed(1) + ' KB',
      apiSizeKB: (apiHttp.size / 1024).toFixed(1) + ' KB',
    });
  }

  console.log('\n--- DIAGNOSTIC RESULTS ---');
  diagnosticReport.forEach((item, index) => {
    console.log(`${index + 1}. Product: "${item.product}" (ID: ${item.id})`);
    console.log(`   DB Image URL : ${item.dbUrl} [HTTP ${item.dbHttpStatus} | ${item.dbSizeKB}]`);
    console.log(`   API Image URL: ${item.apiUrl} [HTTP ${item.apiHttpStatus} | ${item.apiSizeKB}]`);
  });

  fs.writeFileSync(
    path.join(__dirname, 'diagnostic_output.json'),
    JSON.stringify(diagnosticReport, null, 2)
  );
}

runDiagnostic();
