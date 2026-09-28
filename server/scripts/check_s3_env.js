const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

function checkEnv() {
  console.log('=== PHASE 1 — VERIFY CREDENTIAL PRESENCE ===');
  
  const hasAccessKey = Boolean(process.env.SOURCE_S3_ACCESS_KEY_ID && process.env.SOURCE_S3_ACCESS_KEY_ID.trim());
  const hasSecretKey = Boolean(process.env.SOURCE_S3_SECRET_ACCESS_KEY && process.env.SOURCE_S3_SECRET_ACCESS_KEY.trim());

  console.log(`SOURCE_S3_ACCESS_KEY_ID: ${hasAccessKey ? 'PRESENT' : 'MISSING'}`);
  console.log(`SOURCE_S3_SECRET_ACCESS_KEY: ${hasSecretKey ? 'PRESENT' : 'MISSING'}`);

  if (!hasAccessKey || !hasSecretKey) {
    console.error('\nCRITICAL: One or both required S3 credential variables are missing or empty in server/.env.');
    process.exit(1);
  }
}

checkEnv();
