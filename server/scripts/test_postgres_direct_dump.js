const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');

async function testPostgresDirectDump() {
  console.log('=== RAJA ELECTRICALS DIRECT POSTGRESQL DUMP RECOVERY TEST ===\n');

  let dbUrl = process.env.SOURCE_DB_URL || process.env.DATABASE_URL || process.env.SOURCE_POSTGRES_URL;

  // If DB_URL is not directly set in env, construct potential connection URLs based on Supabase standard host
  const host = 'db.yfbzapzceoqkwzsmsjmk.supabase.co';
  const candidateUrls = [];

  if (dbUrl) {
    candidateUrls.push(dbUrl);
  }

  // Also construct candidate URLs if password/key is available
  if (process.env.SOURCE_SUPABASE_SERVICE_KEY) {
    // Attempt standard Supabase Postgres connection patterns (port 5432 direct, port 6543 pooler)
    candidateUrls.push(`postgresql://postgres:${encodeURIComponent(process.env.SOURCE_SUPABASE_SERVICE_KEY)}@${host}:5432/postgres`);
    candidateUrls.push(`postgresql://postgres.${host.split('.')[1]}:${encodeURIComponent(process.env.SOURCE_SUPABASE_SERVICE_KEY)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`);
    candidateUrls.push(`postgresql://postgres:${encodeURIComponent(process.env.SOURCE_SUPABASE_SERVICE_KEY)}@${host}:6543/postgres`);
  }

  if (process.env.ADMIN_PASSWORD) {
    candidateUrls.push(`postgresql://postgres:${encodeURIComponent(process.env.ADMIN_PASSWORD)}@${host}:5432/postgres`);
    candidateUrls.push(`postgresql://postgres:${encodeURIComponent(process.env.ADMIN_PASSWORD)}@${host}:6543/postgres`);
  }

  console.log('Testing direct PostgreSQL database connection...');
  let activeClient = null;
  let workingUrl = null;
  let connectionError = null;

  for (const url of candidateUrls) {
    const client = new Client({
      connectionString: url,
      connectionTimeoutMillis: 7000,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      activeClient = client;
      workingUrl = url;
      break;
    } catch (err) {
      connectionError = err;
      await client.end().catch(() => {});
    }
  }

  if (!activeClient) {
    console.log('\n====================================================');
    console.log('SOURCE POSTGRES CONNECTION BLOCKED');
    if (connectionError) {
      console.log('REASON:', connectionError.message);
    } else {
      console.log('REASON: No valid SOURCE_DB_URL found in environment or direct auth failed.');
    }
    console.log('MIGRATION STATUS: DIRECT DATABASE ACCESS BLOCKED');
    console.log('====================================================\n');
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('SOURCE POSTGRES CONNECTION SUCCESSFUL');
  console.log('====================================================\n');

  // Query PostgreSQL version
  let pgVersion = 'Unknown';
  try {
    const vRes = await activeClient.query('SELECT version();');
    pgVersion = vRes.rows[0].version;
  } catch (e) {
    console.warn('Failed to query version:', e.message);
  }

  // Query Public Tables
  let publicTables = [];
  try {
    const tRes = await activeClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    publicTables = tRes.rows.map(r => r.table_name);
  } catch (e) {
    console.warn('Failed to query public tables:', e.message);
  }

  // Query Record Counts
  const tableCounts = {};
  for (const table of publicTables) {
    try {
      const cRes = await activeClient.query(`SELECT COUNT(*) FROM public."${table}";`);
      tableCounts[table] = parseInt(cRes.rows[0].count, 10);
    } catch (e) {
      tableCounts[table] = `Error: ${e.message}`;
    }
  }

  // Check Storage Objects / Metadata
  let storageObjectsCount = 0;
  try {
    const sRes = await activeClient.query(`SELECT COUNT(*) FROM storage.objects;`);
    storageObjectsCount = parseInt(sRes.rows[0].count, 10);
  } catch (e) {
    storageObjectsCount = 'Not accessible / Table missing';
  }

  await activeClient.end();

  // 5. Run Schema-only Dump Test
  console.log('\n--- Running Schema-Only Dump Test ---');
  const schemaFile = path.join(__dirname, '../../source_schema_test.sql');
  let schemaDumpSuccess = false;
  let schemaDumpSize = 0;

  try {
    const cmd = `npx supabase db dump --db-url "${workingUrl}" -f "${schemaFile}"`;
    execSync(cmd, { stdio: 'pipe' });
    if (fs.existsSync(schemaFile)) {
      schemaDumpSize = fs.statSync(schemaFile).size;
      schemaDumpSuccess = schemaDumpSize > 0;
    }
  } catch (err) {
    console.warn('supabase db dump (schema) error:', err.message);
  }

  // 7. Run Data-only Dump Test
  console.log('--- Running Data-Only Dump Test ---');
  const dataFile = path.join(__dirname, '../../source_data_test.sql');
  let dataDumpSuccess = false;
  let dataDumpSize = 0;

  try {
    const cmd = `npx supabase db dump --data-only --db-url "${workingUrl}" -f "${dataFile}"`;
    execSync(cmd, { stdio: 'pipe' });
    if (fs.existsSync(dataFile)) {
      dataDumpSize = fs.statSync(dataFile).size;
      dataDumpSuccess = dataDumpSize > 0;
    }
  } catch (err) {
    console.warn('supabase db dump (data) error:', err.message);
  }

  // Check content of dumps for key tables
  const targetTables = [
    'products', 'brands', 'categories', 'gallery', 'enquiries',
    'orders', 'admins', 'site_settings', 'home_ads', 'industries', 'projects'
  ];

  const tableDumpPresence = {};
  if (fs.existsSync(dataFile) || fs.existsSync(schemaFile)) {
    const dataContent = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, 'utf8') : '';
    const schemaContent = fs.existsSync(schemaFile) ? fs.readFileSync(schemaFile, 'utf8') : '';
    const combined = dataContent + schemaContent;

    for (const tbl of targetTables) {
      tableDumpPresence[tbl] = combined.includes(`"${tbl}"`) || combined.includes(`public.${tbl}`);
    }
  }

  console.log('\n====================================================');
  console.log('   DIRECT DATABASE ACCESS & DUMP RECOVERY REPORT');
  console.log('====================================================\n');

  console.log(`FINAL STATUS: DIRECT DATABASE ACCESS SUCCESSFUL\n`);
  console.log(`PostgreSQL Version: ${pgVersion}`);
  console.log(`Schema Dump File: source_schema_test.sql (${schemaDumpSize} bytes)`);
  console.log(`Data Dump File: source_data_test.sql (${dataDumpSize} bytes)`);
  console.log(`Storage Objects Count: ${storageObjectsCount}`);

  console.log('\nDetected Public Tables & Record Counts:');
  for (const [tbl, count] of Object.entries(tableCounts)) {
    console.log(` - ${tbl}: ${count} records`);
  }

  console.log('\nTarget Table Presence in Dump Files:');
  for (const tbl of targetTables) {
    console.log(` - ${tbl}: ${tableDumpPresence[tbl] ? 'PRESENT' : 'NOT FOUND / MISSING'}`);
  }

  console.log('\n====================================================');
  console.log('DUMP TEST COMPLETE. NO DESTRUCTIVE CHANGES PERFORMED.');
  console.log('====================================================');
}

testPostgresDirectDump().catch(err => {
  console.log('\n====================================================');
  console.log('SOURCE POSTGRES CONNECTION BLOCKED');
  console.log('REASON:', err.message);
  console.log('MIGRATION STATUS: DIRECT DATABASE ACCESS BLOCKED');
  console.log('====================================================\n');
  process.exit(1);
});
