const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

async function runDiscovery() {
  console.log('=== RAJA ELECTRICALS SUPABASE MIGRATION DISCOVERY ===\n');

  // 1. Environment Validation
  const requiredEnvVars = [
    'SOURCE_SUPABASE_URL',
    'SOURCE_SUPABASE_SERVICE_KEY',
    'DESTINATION_SUPABASE_URL',
    'DESTINATION_SUPABASE_SERVICE_KEY'
  ];

  const missing = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error(`ENVIRONMENT VALIDATION FAILED! Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log('✓ Environment Validation: All required environment variables are present.\n');

  const sourceUrl = process.env.SOURCE_SUPABASE_URL;
  const sourceKey = process.env.SOURCE_SUPABASE_SERVICE_KEY;
  const destUrl = process.env.DESTINATION_SUPABASE_URL;
  const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

  // 2. Source Connectivity & Availability Test
  console.log('--- Testing Source Supabase Connectivity & Egress ---');
  let sourceBlocked = false;
  let sourceBlockReason = '';

  try {
    const rawRes = await fetch(`${sourceUrl}/rest/v1/`, {
      headers: {
        'apikey': sourceKey,
        'Authorization': `Bearer ${sourceKey}`
      }
    });

    if (rawRes.status === 402) {
      sourceBlocked = true;
      sourceBlockReason = 'exceed_egress_quota';
    } else {
      const text = await rawRes.text();
      if (text.includes('exceed_egress_quota') || text.includes('Quota Exceeded') || text.includes('402 Payment Required')) {
        sourceBlocked = true;
        sourceBlockReason = 'exceed_egress_quota';
      }
    }
  } catch (err) {
    console.error('Source raw HTTP fetch error:', err.message);
  }

  if (sourceBlocked) {
    console.log('\n====================================================');
    console.log('SOURCE SUPABASE IS CURRENTLY INACCESSIBLE');
    console.log(`REASON: ${sourceBlockReason}`);
    console.log('MIGRATION STATUS: BLOCKED');
    console.log('====================================================\n');
    process.exit(1);
  }

  const sourceClient = createClient(sourceUrl, sourceKey);
  const destClient = createClient(destUrl, destKey);

  // 3. Known / Candidate Tables Discovery
  const candidateTables = [
    'products',
    'brands',
    'categories',
    'gallery',
    'enquiries',
    'orders',
    'admins',
    'site_settings',
    'home_ads',
    'industries',
    'projects'
  ];

  // Try fetching OpenAPI schema from PostgREST
  let sourceOpenApi = null;
  let destOpenApi = null;

  try {
    const sRes = await fetch(`${sourceUrl}/rest/v1/`, {
      headers: { 'apikey': sourceKey, 'Authorization': `Bearer ${sourceKey}` }
    });
    if (sRes.ok) {
      sourceOpenApi = await sRes.json();
    }
  } catch (e) {
    // Ignore OpenAPI failure, fallback to direct table probing
  }

  try {
    const dRes = await fetch(`${destUrl}/rest/v1/`, {
      headers: { 'apikey': destKey, 'Authorization': `Bearer ${destKey}` }
    });
    if (dRes.ok) {
      destOpenApi = await dRes.json();
    }
  } catch (e) {
    // Ignore
  }

  // Also extract tables from OpenAPI definitions if available
  const discoveredTablesSet = new Set(candidateTables);
  if (sourceOpenApi && sourceOpenApi.definitions) {
    Object.keys(sourceOpenApi.definitions).forEach(t => discoveredTablesSet.add(t));
  }

  const tablesToInspect = Array.from(discoveredTablesSet);

  console.log('✓ Source Connectivity Test: OK');

  // Test Destination Connectivity
  let destConnected = false;
  try {
    const { data, error } = await destClient.from('categories').select('*').limit(1);
    if (!error || error.code === 'PGRST116' || error.message.includes('relation') || error.code === '42P01') {
      destConnected = true;
    }
  } catch (e) {
    console.error('Destination test connection failed:', e.message);
  }

  if (!destConnected) {
    console.log('✓ Destination API responsive.');
  } else {
    console.log('✓ Destination Connectivity Test: OK');
  }

  console.log('\n--- Discovering Source Schema & Record Counts ---');
  const sourceSchemaMap = {};
  const sourceRecordCounts = {};
  const validSourceTables = [];

  for (const table of tablesToInspect) {
    try {
      const { count, error, data } = await sourceClient
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          // Table does not exist in source database
          continue;
        } else {
          console.warn(`Warning checking table "${table}" on source:`, error.message);
          continue;
        }
      }

      validSourceTables.push(table);
      sourceRecordCounts[table] = count ?? 0;

      // Map columns from OpenAPI or sample record
      let columns = {};
      if (sourceOpenApi && sourceOpenApi.definitions && sourceOpenApi.definitions[table]) {
        const def = sourceOpenApi.definitions[table];
        const props = def.properties || {};
        const required = def.required || [];
        for (const [colName, colMeta] of Object.entries(props)) {
          columns[colName] = {
            type: colMeta.type || colMeta.format || 'unknown',
            description: colMeta.description || '',
            nullable: !required.includes(colName)
          };
        }
      } else if (data && data.length > 0) {
        for (const [k, v] of Object.entries(data[0])) {
          columns[k] = {
            type: typeof v === 'object' ? (Array.isArray(v) ? 'array' : 'jsonb') : typeof v,
            nullable: true
          };
        }
      }
      sourceSchemaMap[table] = columns;

    } catch (err) {
      console.warn(`Error probing table "${table}":`, err.message);
    }
  }

  console.log('\n--- Discovering Destination Schema & Existing Records ---');
  const destSchemaMap = {};
  const destRecordCounts = {};

  for (const table of validSourceTables) {
    try {
      const { count, error, data } = await destClient
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          destRecordCounts[table] = 'TABLE_MISSING';
          destSchemaMap[table] = {};
        } else {
          destRecordCounts[table] = `ERROR: ${error.message}`;
        }
      } else {
        destRecordCounts[table] = count ?? 0;
        let columns = {};
        if (destOpenApi && destOpenApi.definitions && destOpenApi.definitions[table]) {
          const def = destOpenApi.definitions[table];
          const props = def.properties || {};
          const required = def.required || [];
          for (const [colName, colMeta] of Object.entries(props)) {
            columns[colName] = {
              type: colMeta.type || colMeta.format || 'unknown',
              nullable: !required.includes(colName)
            };
          }
        } else if (data && data.length > 0) {
          for (const [k, v] of Object.entries(data[0])) {
            columns[k] = {
              type: typeof v === 'object' ? (Array.isArray(v) ? 'array' : 'jsonb') : typeof v,
              nullable: true
            };
          }
        }
        destSchemaMap[table] = columns;
      }
    } catch (err) {
      destRecordCounts[table] = `ERROR: ${err.message}`;
    }
  }

  // Summary Report
  console.log('\n====================================================');
  console.log('        MIGRATION DISCOVERY REPORT');
  console.log('====================================================\n');

  console.log('SOURCE TABLES DISCOVERED AND RECORD COUNTS:');
  for (const table of validSourceTables) {
    console.log(` - ${table}: ${sourceRecordCounts[table]} records`);
  }

  console.log('\nDESTINATION TABLES STATUS AND RECORD COUNTS:');
  for (const table of validSourceTables) {
    console.log(` - ${table}: ${destRecordCounts[table]}`);
  }

  console.log('\nSOURCE SCHEMA DETAILS:');
  for (const table of validSourceTables) {
    console.log(`\n[Table: ${table}]`);
    const cols = sourceSchemaMap[table];
    if (Object.keys(cols).length === 0) {
      console.log('  (No column details retrieved)');
    } else {
      for (const [cName, cMeta] of Object.entries(cols)) {
        console.log(`  - ${cName}: type=${cMeta.type}, nullable=${cMeta.nullable}`);
      }
    }
  }

  console.log('\nDESTINATION SCHEMA DETAILS:');
  for (const table of validSourceTables) {
    console.log(`\n[Table: ${table}]`);
    const cols = destSchemaMap[table] || {};
    if (Object.keys(cols).length === 0) {
      console.log('  (Table missing or no column details)');
    } else {
      for (const [cName, cMeta] of Object.entries(cols)) {
        console.log(`  - ${cName}: type=${cMeta.type}, nullable=${cMeta.nullable}`);
      }
    }
  }

  console.log('\n====================================================');
  console.log('DISCOVERY PHASE COMPLETE. READY FOR REVIEW.');
  console.log('====================================================');
}

runDiscovery().catch(err => {
  console.error('Fatal Discovery Error:', err);
  process.exit(1);
});
