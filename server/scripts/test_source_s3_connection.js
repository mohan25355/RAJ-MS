const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const https = require('https');

async function testSourceS3Connection() {
  console.log('=== SECTION I: CRITICAL SOURCE S3 CONNECTION TEST ===\n');

  const accessKey = process.env.SOURCE_S3_ACCESS_KEY_ID;
  const secretKey = process.env.SOURCE_S3_SECRET_ACCESS_KEY;

  const missing = [];
  if (!accessKey) missing.push('SOURCE_S3_ACCESS_KEY_ID');
  if (!secretKey) missing.push('SOURCE_S3_SECRET_ACCESS_KEY');

  if (missing.length > 0) {
    console.error(`CRITICAL STATUS: MISSING SOURCE S3 CREDENTIALS`);
    console.error(`Missing variable(s) in server/.env: ${missing.join(', ')}`);
    console.error(`Per Section C requirements: STOPPING migration. Do not invent credentials.`);
    process.exit(1);
  }

  // If credentials exist, perform S3 request
  const endpointHost = 'yfbzapzceoqkwzsmsjmk.storage.supabase.co';
  const bucketName = 'RAJA_ELE';
  const samplePath = 'products/1790278938385-949ui-1790278938385.jpg';
  const s3Url = `https://${endpointHost}/storage/v1/s3/${bucketName}/${samplePath}`;

  console.log('Testing S3 Endpoint connection...');

  // Simple S3 HEAD / GET request using AWS S3 signature v4 or basic HTTPS request
  return new Promise((resolve) => {
    const req = https.request(s3Url, { method: 'HEAD' }, (res) => {
      console.log(`HTTP Status: ${res.statusCode}`);
      if (res.statusCode === 402 || (res.headers['x-error-code'] && res.headers['x-error-code'].includes('exceed_egress_quota'))) {
        console.log('\nREPORT: SOURCE_S3_ACCESS_BLOCKED_BY_EGRESS_QUOTA');
        process.exit(1);
      } else if (res.statusCode === 200) {
        console.log('\nREPORT: SOURCE_S3_ACCESS_SUCCESSFUL');
        resolve(true);
      } else {
        console.log(`\nHTTP Status: ${res.statusCode}`);
        process.exit(1);
      }
    });

    req.on('error', (err) => {
      console.error('S3 Connection Error:', err.message);
      process.exit(1);
    });

    req.end();
  });
}

testSourceS3Connection().catch(err => {
  console.error('Fatal S3 Test Error:', err);
  process.exit(1);
});
