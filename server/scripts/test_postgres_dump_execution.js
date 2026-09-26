const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');

async function executePostgresDump() {
  console.log('=== RAJA ELECTRICALS DIRECT POSTGRES DUMP EXECUTION ===\n');

  let rawUrl = process.env.SOURCE_DB_URL;
  if (!rawUrl) {
    console.error('AUTHENTICATION FAILED: SOURCE_DB_URL is missing from server/.env');
    process.exit(1);
  }

  // Parse connection URL safely, handling unescaped '@' characters in password
  let dbConfig = null;
  let connectionString = rawUrl;

  // Check if unescaped '@' caused host misparsing
  try {
    const match = rawUrl.match(/^postgresql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/(.+)$/);
    if (match) {
      const user = match[1];
      const rawPass = match[2];
      const hostPortDb = match[3];
      const port = parseInt(match[4], 10);
      const database = match[5];

      // If rawPass contains '@', the last '@' separates user:pass from host
      const lastAtIdx = rawPass.lastIndexOf('@');
      let pass = rawPass;
      let host = hostPortDb;

      if (lastAtIdx !== -1 && !host.includes('supabase')) {
        // Password contains '@', e.g. "tamil@2006.yfbzapzceoqkwzsmsjmk.supabase.co" -> pass="tamil", host="2006.yfbzapzceoqkwzsmsjmk.supabase.co"
        pass = rawPass.substring(0, lastAtIdx);
        host = rawPass.substring(lastAtIdx + 1) + ':' + hostPortDb; // fix host
      }

      // Ensure proper host for Supabase direct DB if misparsed
      if (host.includes('yfbzapzceoqkwzsmsjmk.supabase.co') && !host.startsWith('db.')) {
        const parts = host.split('.');
        const domain = parts.slice(-3).join('.');
        host = 'db.' + domain;
      }

      dbConfig = {
        user,
        password: pass,
        host,
        port: port || 5432,
        database: database || 'postgres',
        ssl: { rejectUnauthorized: false }
      };

      connectionString = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port || 5432}/${database || 'postgres'}`;
    }
  } catch (e) {
    // Fall back to standard string connection
  }

  console.log('1. Testing PostgreSQL Direct Connection...');

  let client = null;
  if (dbConfig) {
    client = new Client(dbConfig);
  } else {
    client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000
    });
  }

  try {
    await client.connect();
    console.log('✓ PostgreSQL Authentication: SUCCESSFUL\n');
  } catch (err) {
    console.error('AUTHENTICATION FAILED: PostgreSQL connection could not be established.');
    console.error('Error Details:', err.message);
    process.exit(1);
  }

  // 2. Discover Schema & Record Counts
  console.log('2. Discovering Database Schema & Tables...');
  let pgVersion = 'Unknown';
  try {
    const vRes = await client.query('SELECT version();');
    pgVersion = vRes.rows[0].version;
  } catch (e) {}

  let publicTables = [];
  try {
    const tRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    publicTables = tRes.rows.map(r => r.table_name);
  } catch (e) {
    console.error('Failed to query tables:', e.message);
  }

  const tableCounts = {};
  for (const tbl of publicTables) {
    try {
      const cRes = await client.query(`SELECT COUNT(*) FROM public."${tbl}";`);
      tableCounts[tbl] = parseInt(cRes.rows[0].count, 10);
    } catch (e) {
      tableCounts[tbl] = 'Error: ' + e.message;
    }
  }

  await client.end();

  // 3. Schema-only Dump
  console.log('\n3. Creating Schema-only Dump (source_schema.sql)...');
  const scriptsDir = path.join(__dirname);
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  const schemaPath = path.join(scriptsDir, 'source_schema.sql');
  let schemaDumpSuccess = false;
  let schemaDumpSize = 0;

  try {
    // Attempt npx supabase db dump first
    const cmd = `npx supabase db dump --db-url "${connectionString}" --schema public -f "${schemaPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    if (fs.existsSync(schemaPath)) {
      schemaDumpSize = fs.statSync(schemaPath).size;
      schemaDumpSuccess = schemaDumpSize > 0;
    }
  } catch (err) {
    console.warn('supabase db dump warning:', err.message);
  }

  if (!schemaDumpSuccess) {
    // Fallback: use custom pg dump query if supabase CLI command fails
    try {
      console.log('Attempting fallback schema extraction via direct Postgres query...');
      const fallbackClient = new Client(dbConfig || { connectionString, ssl: { rejectUnauthorized: false } });
      await fallbackClient.connect();

      let schemaSql = `-- RAJA ELECTRICALS DIRECT SCHEMA DUMP\n-- Generated: ${new Date().toISOString()}\n\n`;

      for (const tbl of publicTables) {
        const colRes = await fallbackClient.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [tbl]);

        schemaSql += `CREATE TABLE IF NOT EXISTS public."${tbl}" (\n`;
        const colDefs = colRes.rows.map(c => {
          let def = `  "${c.column_name}" ${c.data_type}`;
          if (c.is_nullable === 'NO') def += ' NOT NULL';
          if (c.column_default) def += ` DEFAULT ${c.column_default}`;
          return def;
        });
        schemaSql += colDefs.join(',\n') + '\n);\n\n';
      }

      await fallbackClient.end();
      fs.writeFileSync(schemaPath, schemaSql, 'utf8');
      schemaDumpSize = fs.statSync(schemaPath).size;
      schemaDumpSuccess = schemaDumpSize > 0;
    } catch (fallbackErr) {
      console.error('Fallback schema extraction failed:', fallbackErr.message);
    }
  }

  // 4. Data-only Dump
  console.log('\n4. Creating Data-only Dump (source_data.sql)...');
  const dataPath = path.join(scriptsDir, 'source_data.sql');
  let dataDumpSuccess = false;
  let dataDumpSize = 0;

  try {
    const cmd = `npx supabase db dump --data-only --db-url "${connectionString}" --schema public -f "${dataPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    if (fs.existsSync(dataPath)) {
      dataDumpSize = fs.statSync(dataPath).size;
      dataDumpSuccess = dataDumpSize > 0;
    }
  } catch (err) {
    console.warn('supabase db dump (data) warning:', err.message);
  }

  if (!dataDumpSuccess) {
    try {
      console.log('Attempting fallback data extraction via direct Postgres queries...');
      const fallbackClient = new Client(dbConfig || { connectionString, ssl: { rejectUnauthorized: false } });
      await fallbackClient.connect();

      let dataSql = `-- RAJA ELECTRICALS DIRECT DATA DUMP\n-- Generated: ${new Date().toISOString()}\n\n`;

      for (const tbl of publicTables) {
        const rowsRes = await fallbackClient.query(`SELECT * FROM public."${tbl}";`);
        if (rowsRes.rows.length > 0) {
          dataSql += `-- Table: public.${tbl} (${rowsRes.rows.length} rows)\n`;
          for (const row of rowsRes.rows) {
            const keys = Object.keys(row).map(k => `"${k}"`).join(', ');
            const vals = Object.values(row).map(v => {
              if (v === null || v === undefined) return 'NULL';
              if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
              if (typeof v === 'number' || typeof v === 'boolean') return String(v);
              return `'${String(v).replace(/'/g, "''")}'`;
            }).join(', ');
            dataSql += `INSERT INTO public."${tbl}" (${keys}) VALUES (${vals}) ON CONFLICT DO NOTHING;\n`;
          }
          dataSql += '\n';
        }
      }

      await fallbackClient.end();
      fs.writeFileSync(dataPath, dataSql, 'utf8');
      dataDumpSize = fs.statSync(dataPath).size;
      dataDumpSuccess = dataDumpSize > 0;
    } catch (fallbackErr) {
      console.error('Fallback data extraction failed:', fallbackErr.message);
    }
  }

  // 5. Output Verification Report
  console.log('\n====================================================');
  console.log('   POSTGRESQL DUMP RECOVERY EXECUTION SUMMARY');
  console.log('====================================================\n');

  console.log(`PostgreSQL Version: ${pgVersion}`);
  console.log(`Discovered Public Tables (${publicTables.length}):`, publicTables.join(', '));
  console.log('\nTable Record Counts:');
  for (const [tbl, cnt] of Object.entries(tableCounts)) {
    console.log(` - ${tbl}: ${cnt} records`);
  }

  console.log(`\nSchema Dump File: server/scripts/source_schema.sql (${schemaDumpSize} bytes)`);
  console.log(`Data Dump File: server/scripts/source_data.sql (${dataDumpSize} bytes)`);

  if (schemaDumpSuccess && dataDumpSuccess) {
    console.log('\n====================================================');
    console.log('SOURCE DATABASE DUMP READY');
    console.log('====================================================\n');
  } else {
    console.error('\nDUMP CREATION FAILED: Schema or data dump files could not be verified.');
    process.exit(1);
  }
}

executePostgresDump().catch(err => {
  console.error('Fatal execution error:', err.message);
  process.exit(1);
});
