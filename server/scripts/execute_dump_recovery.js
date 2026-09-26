const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');

async function runDumpRecovery() {
  console.log('=== RAJA ELECTRICALS DIRECT POSTGRES DUMP EXECUTION ===\n');

  const rawUrl = process.env.SOURCE_DB_URL;
  if (!rawUrl) {
    console.error('AUTHENTICATION FAILED: SOURCE_DB_URL missing from server/.env');
    process.exit(1);
  }

  // Safely extract user, password, host, port, db from rawUrl
  let user = 'postgres';
  let password = '';
  let host = 'db.yfbzapzceoqkwzsmsjmk.supabase.co';
  let port = 5432;
  let database = 'postgres';

  try {
    const schemeRemoved = rawUrl.replace(/^postgresql:\/\//, '');
    // Regex matching user:password@host:port/database
    // Using un-greedy match for password up to the last @ before host
    const atHostIndex = schemeRemoved.lastIndexOf('@');
    if (atHostIndex !== -1) {
      const userPass = schemeRemoved.substring(0, atHostIndex);
      const hostPortDb = schemeRemoved.substring(atHostIndex + 1);

      const colonIdx = userPass.indexOf(':');
      if (colonIdx !== -1) {
        user = userPass.substring(0, colonIdx);
        password = userPass.substring(colonIdx + 1);
      } else {
        user = userPass;
      }

      const slashIdx = hostPortDb.indexOf('/');
      if (slashIdx !== -1) {
        database = hostPortDb.substring(slashIdx + 1);
        const hostPort = hostPortDb.substring(0, slashIdx);
        const portColon = hostPort.lastIndexOf(':');
        if (portColon !== -1) {
          host = hostPort.substring(0, portColon);
          port = parseInt(hostPort.substring(portColon + 1), 10) || 5432;
        } else {
          host = hostPort;
        }
      } else {
        host = hostPortDb;
      }
    }
  } catch (e) {
    console.warn('URL parsing notice:', e.message);
  }

  const projectRef = 'yfbzapzceoqkwzsmsjmk';
  const targets = [
    {
      name: 'Singapore Pooler (Port 6543)',
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 6543,
      user: user.includes('.') ? user : `postgres.${projectRef}`,
      password,
      database
    },
    {
      name: 'Singapore Pooler (Port 5432)',
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 5432,
      user: user.includes('.') ? user : `postgres.${projectRef}`,
      password,
      database
    },
    {
      name: 'Direct DB Host (Port 5432)',
      host: host.startsWith('db.') ? host : `db.${projectRef}.supabase.co`,
      port,
      user: user.includes('.') ? user.split('.')[0] : user,
      password,
      database
    }
  ];

  console.log('1. Testing PostgreSQL Authentication...');
  let activeClient = null;
  let activeTarget = null;
  let lastErr = null;

  for (const t of targets) {
    const client = new Client({
      user: t.user,
      password: t.password,
      host: t.host,
      port: t.port,
      database: t.database,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 7000
    });

    try {
      await client.connect();
      activeClient = client;
      activeTarget = t;
      break;
    } catch (err) {
      lastErr = err;
      await client.end().catch(() => {});
    }
  }

  if (!activeClient) {
    console.error('\n====================================================');
    console.error('AUTHENTICATION FAILED');
    console.error('REASON:', lastErr ? lastErr.message : 'Connection failed');
    console.error('MIGRATION STATUS: BLOCKED');
    console.error('====================================================\n');
    process.exit(1);
  }

  console.log(`✓ PostgreSQL Authentication: SUCCESSFUL (Connected via ${activeTarget.name})\n`);

  // 2. Discover Database Schema & Record Counts
  console.log('2. Discovering Database Schema & Table Counts...');
  let pgVersion = 'Unknown';
  try {
    const vRes = await activeClient.query('SELECT version();');
    pgVersion = vRes.rows[0].version;
  } catch (e) {}

  let publicTables = [];
  try {
    const tRes = await activeClient.query(`
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
      const cRes = await activeClient.query(`SELECT COUNT(*) FROM public."${tbl}";`);
      tableCounts[tbl] = parseInt(cRes.rows[0].count, 10);
    } catch (e) {
      tableCounts[tbl] = 'Error: ' + e.message;
    }
  }

  // 3. Schema-Only Dump
  console.log('\n3. Creating Schema-only Dump (server/scripts/source_schema.sql)...');
  const scriptsDir = path.join(__dirname);
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  const schemaPath = path.join(scriptsDir, 'source_schema.sql');
  let schemaSql = `-- RAJA ELECTRICALS SOURCE SCHEMA DUMP\n-- Timestamp: ${new Date().toISOString()}\n-- Database Version: ${pgVersion}\n\n`;

  for (const tbl of publicTables) {
    try {
      const colRes = await activeClient.query(`
        SELECT column_name, data_type, udt_name, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tbl]);

      schemaSql += `CREATE TABLE IF NOT EXISTS public."${tbl}" (\n`;
      const colDefs = colRes.rows.map(c => {
        let typeStr = c.data_type === 'USER-DEFINED' ? c.udt_name : c.data_type;
        if (typeStr === 'ARRAY') typeStr = `${c.udt_name}[]`;
        let def = `  "${c.column_name}" ${typeStr}`;
        if (c.is_nullable === 'NO') def += ' NOT NULL';
        if (c.column_default) def += ` DEFAULT ${c.column_default}`;
        return def;
      });
      schemaSql += colDefs.join(',\n') + '\n);\n\n';
    } catch (err) {
      schemaSql += `-- Error dumping table ${tbl}: ${err.message}\n\n`;
    }
  }

  fs.writeFileSync(schemaPath, schemaSql, 'utf8');
  const schemaDumpSize = fs.statSync(schemaPath).size;

  // 4. Data-Only Dump
  console.log('4. Creating Data-only Dump (server/scripts/source_data.sql)...');
  const dataPath = path.join(scriptsDir, 'source_data.sql');

  let dataSql = `-- RAJA ELECTRICALS SOURCE DATA DUMP\n-- Timestamp: ${new Date().toISOString()}\n\n`;

  for (const tbl of publicTables) {
    try {
      const rowsRes = await activeClient.query(`SELECT * FROM public."${tbl}";`);
      if (rowsRes.rows.length > 0) {
        dataSql += `-- Table: public.${tbl} (${rowsRes.rows.length} records)\n`;
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
    } catch (err) {
      dataSql += `-- Error dumping data for ${tbl}: ${err.message}\n\n`;
    }
  }

  fs.writeFileSync(dataPath, dataSql, 'utf8');
  const dataDumpSize = fs.statSync(dataPath).size;

  await activeClient.end();

  const schemaExists = fs.existsSync(schemaPath) && schemaDumpSize > 0;
  const dataExists = fs.existsSync(dataPath) && dataDumpSize > 0;

  console.log('\n====================================================');
  console.log('   POSTGRES DUMP EXECUTION RESULTS');
  console.log('====================================================\n');

  console.log(`PostgreSQL Version: ${pgVersion}`);
  console.log(`Connection Method: ${activeTarget.name}`);
  console.log(`Public Tables Discovered (${publicTables.length}):`, publicTables.join(', '));
  console.log('\nRecord Counts per Table:');
  for (const [tbl, cnt] of Object.entries(tableCounts)) {
    console.log(` - ${tbl}: ${cnt} records`);
  }

  console.log(`\nSchema Dump: server/scripts/source_schema.sql (${schemaDumpSize} bytes)`);
  console.log(`Data Dump: server/scripts/source_data.sql (${dataDumpSize} bytes)`);

  if (schemaExists && dataExists) {
    console.log('\n====================================================');
    console.log('SOURCE DATABASE DUMP READY');
    console.log('====================================================\n');
  } else {
    console.error('\nERROR: Dump files verification failed.');
    process.exit(1);
  }
}

runDumpRecovery().catch(err => {
  console.error('Fatal dump execution error:', err.message);
  process.exit(1);
});
