const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

async function testPublicStorageObject() {
  console.log('=== STORAGE PUBLIC OBJECT ACCESS TEST ===\n');

  const destUrl = process.env.DESTINATION_SUPABASE_URL;
  const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

  if (!destUrl || !destKey) {
    console.error('Missing destination env variables');
    process.exit(1);
  }

  const destClient = createClient(destUrl, destKey);

  // 1. Fetch products with source Supabase Storage image URLs
  const { data: products, error } = await destClient
    .from('products')
    .select('id, name, image')
    .like('image', '%yfbzapzceoqkwzsmsjmk.supabase.co/storage/v1/object/public/%')
    .limit(1);

  if (error || !products || products.length === 0) {
    console.error('Could not find product with source storage image URL:', error ? error.message : 'No products found');
    process.exit(1);
  }

  const targetProduct = products[0];
  const targetUrl = targetProduct.image;

  console.log(`Selected Product ID: "${targetProduct.id}" (${targetProduct.name})`);
  // Mask domain host / URL path lightly if needed, but standard public URL host is yfbzapzceoqkwzsmsjmk.supabase.co
  console.log(`Testing Public Storage URL...`);

  // 2. Perform HTTP HEAD request
  function makeRequest(url, method = 'HEAD') {
    return new Promise((resolve, reject) => {
      const req = https.request(url, { method }, (res) => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers
        });
      });
      req.on('error', (e) => reject(e));
      req.end();
    });
  }

  try {
    let result = await makeRequest(targetUrl, 'HEAD');
    console.log(`\nHTTP HEAD Result:`);
    console.log(`- Status Code: ${result.statusCode}`);
    console.log(`- Content-Type: ${result.headers['content-type'] || 'N/A'}`);
    console.log(`- Content-Length: ${result.headers['content-length'] || 'N/A'}`);

    if (result.statusCode === 405 || result.statusCode === 501) {
      console.log('HEAD unsupported, attempting single lightweight GET request...');
      result = await makeRequest(targetUrl, 'GET');
      console.log(`\nHTTP GET Result:`);
      console.log(`- Status Code: ${result.statusCode}`);
      console.log(`- Content-Type: ${result.headers['content-type'] || 'N/A'}`);
      console.log(`- Content-Length: ${result.headers['content-length'] || 'N/A'}`);
    }

    const statusCode = result.statusCode;
    const contentType = result.headers['content-type'] || '';

    console.log('\n----------------------------------------');
    if (statusCode === 200 && (contentType.includes('image/') || contentType.includes('application/octet-stream') || contentType.includes('binary'))) {
      console.log('INTERPRETATION: CASE A');
      console.log('REPORT: SOURCE STORAGE PUBLIC OBJECT ACCESSIBLE');
    } else if (statusCode === 402 || (result.headers['x-error-code'] && result.headers['x-error-code'].includes('exceed_egress_quota'))) {
      console.log('INTERPRETATION: CASE B');
      console.log('REPORT: SOURCE STORAGE PUBLIC OBJECT ACCESS BLOCKED BY EGRESS QUOTA');
    } else if (statusCode === 404) {
      console.log('INTERPRETATION: CASE C');
      console.log('REPORT: SOURCE STORAGE OBJECT NOT FOUND');
    } else {
      console.log('INTERPRETATION: CASE D');
      console.log(`REPORT: HTTP STATUS ${statusCode} - ${contentType}`);
    }
    console.log('----------------------------------------\n');

  } catch (err) {
    console.error('HTTP Request failed:', err.message);
  }
}

testPublicStorageObject().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
