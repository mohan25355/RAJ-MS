const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function runMigration() {
  const startTime = new Date();
  console.log('=== RAJA ELECTRICALS FULL SUPABASE DATA MIGRATION ===');
  console.log(`Migration Start Time: ${startTime.toISOString()}\n`);

  const destUrl = process.env.DESTINATION_SUPABASE_URL;
  const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

  if (!destUrl || !destKey) {
    console.error('Migration Failed: Destination Supabase environment variables missing.');
    process.exit(1);
  }

  const destClient = createClient(destUrl, destKey);

  // 1. Connect to Source PostgreSQL Database
  const host = 'aws-0-ap-southeast-1.pooler.supabase.com';
  const user = 'postgres.yfbzapzceoqkwzsmsjmk';
  const password = 'Mohan@25355';

  const sourceClient = new Client({
    user,
    password,
    host,
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    await sourceClient.connect();
    console.log('✓ Source PostgreSQL Database: CONNECTED');
  } catch (err) {
    console.error('Migration Failed: Unable to connect to source database.', err.message);
    process.exit(1);
  }

  // Tables in dependency order
  const tables = [
    'categories',
    'brands',
    'products',
    'gallery',
    'site_settings',
    'admins',
    'catalogues',
    'enquiries',
    'industries',
    'orders',
    'projects'
  ];

  const migrationStats = {};

  for (const table of tables) {
    console.log(`\n--- Migrating Table: "${table}" ---`);

    // Fetch total source count
    const countRes = await sourceClient.query(`SELECT COUNT(*) FROM public."${table}";`);
    const sourceCount = parseInt(countRes.rows[0].count, 10);

    // Fetch all records from source
    const recordsRes = await sourceClient.query(`SELECT * FROM public."${table}";`);
    const extractedRecords = recordsRes.rows;
    const extractedCount = extractedRecords.length;

    if (sourceCount !== extractedCount) {
      console.error(`ERROR: Record count mismatch during extraction for table "${table}". Source=${sourceCount}, Extracted=${extractedCount}`);
      process.exit(1);
    }

    console.log(`Source Count: ${sourceCount}, Extracted: ${extractedCount}`);

    let migratedCount = 0;

    if (extractedCount > 0) {
      // Controlled batch write (100 records per batch)
      const BATCH_SIZE = 100;
      for (let i = 0; i < extractedRecords.length; i += BATCH_SIZE) {
        const batch = extractedRecords.slice(i, i + BATCH_SIZE);

        // Sanitize records for Supabase upsert
        const sanitizedBatch = batch.map(row => {
          const cleanRow = { ...row };
          for (const [k, v] of Object.entries(cleanRow)) {
            if (v instanceof Date) {
              cleanRow[k] = v.toISOString();
            }
          }

          if (table === 'admins') {
            // Store email/password_hash inside data if needed while keeping standard schema
            const adminData = typeof cleanRow.data === 'object' && cleanRow.data !== null ? { ...cleanRow.data } : {};
            if (cleanRow.email) adminData.email = cleanRow.email;
            if (cleanRow.password_hash) adminData.password_hash = cleanRow.password_hash;
            
            return {
              id: parseInt(cleanRow.id, 10) || cleanRow.id,
              data: adminData,
              created_at: cleanRow.created_at
            };
          }

          return cleanRow;
        });

        // Determine primary key on conflict
        let onConflictKey = 'id';
        const { error } = await destClient.from(table).upsert(sanitizedBatch, { onConflict: onConflictKey });

        if (error) {
          console.error(`Batch write failed for table "${table}" at offset ${i}:`, error.message);
          process.exit(1);
        }

        migratedCount += sanitizedBatch.length;
        console.log(` Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${sanitizedBatch.length} records upserted successfully.`);
      }
    } else {
      console.log(` Table "${table}" has 0 records, skipped batch write.`);
    }

    // Verify Destination Count
    const { count: destCount, error: destCountErr } = await destClient
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (destCountErr) {
      console.error(`Destination verification query failed for table "${table}":`, destCountErr.message);
      process.exit(1);
    }

    const missing = Math.max(0, sourceCount - (destCount ?? 0));
    const extra = Math.max(0, (destCount ?? 0) - sourceCount);

    console.log(`Destination Count: ${destCount}, Missing: ${missing}, Extra: ${extra}`);

    migrationStats[table] = {
      sourceCount,
      extractedCount,
      destCount: destCount ?? 0,
      missing,
      extra,
      duplicates: 0,
      modified: 0
    };

    if (sourceCount !== (destCount ?? 0)) {
      console.error(`VALIDATION FAILED: Table "${table}" count mismatch! Source=${sourceCount}, Dest=${destCount}`);
      process.exit(1);
    }
  }

  // DEEP DATA VALIDATION: Verify record IDs and content equality
  console.log('\n====================================================');
  console.log('   DEEP DATA VALIDATION & INTEGRITY CHECK');
  console.log('====================================================\n');

  for (const table of tables) {
    const { data: destRecords, error: fetchErr } = await destClient.from(table).select('*');
    if (fetchErr) {
      console.error(`Deep validation fetch failed for "${table}":`, fetchErr.message);
      process.exit(1);
    }

    const sourceRes = await sourceClient.query(`SELECT * FROM public."${table}";`);
    const sourceRecords = sourceRes.rows;

    const sourceIdMap = new Map();
    sourceRecords.forEach(r => sourceIdMap.set(String(r.id), r));

    const destIdMap = new Map();
    destRecords.forEach(r => destIdMap.set(String(r.id), r));

    let matched = 0;
    let missingIds = 0;
    let extraIds = 0;
    let modified = 0;

    for (const [id, sRec] of sourceIdMap.entries()) {
      if (!destIdMap.has(id)) {
        missingIds++;
      } else {
        matched++;
        const dRec = destIdMap.get(id);
        // Compare key JSON stringified data
        if (sRec.data && dRec.data && table !== 'admins') {
          if (JSON.stringify(sRec.data) !== JSON.stringify(dRec.data)) {
            modified++;
          }
        }
      }
    }

    for (const [id] of destIdMap.entries()) {
      if (!sourceIdMap.has(id)) {
        extraIds++;
      }
    }

    console.log(`[Deep Validation: ${table}]`);
    console.log(` - Matched Records: ${matched}`);
    console.log(` - Missing IDs: ${missingIds}`);
    console.log(` - Extra IDs: ${extraIds}`);
    console.log(` - Modified JSON Payload: ${modified}`);

    if (missingIds > 0 || extraIds > 0 || modified > 0) {
      console.error(`DEEP VALIDATION FAILED for table "${table}"!`);
      process.exit(1);
    }
  }

  await sourceClient.end();

  const endTime = new Date();
  const durationSec = Math.round((endTime - startTime) / 1000);

  console.log('\n====================================================');
  console.log('   MIGRATION COMPLETED SUCCESSFULLY!');
  console.log(`   Duration: ${durationSec} seconds`);
  console.log('====================================================\n');
}

runMigration().catch(err => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
