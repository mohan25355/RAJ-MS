const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://ueohqicjodxwkwdxcrnj.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.DESTINATION_SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('ERROR: SUPABASE_SECRET_KEY or DESTINATION_SUPABASE_SERVICE_KEY is missing from server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('=== DESTINATION SUPABASE DATABASE & STORAGE AUDIT ===\n');
  console.log(`Target Supabase URL: ${supabaseUrl}\n`);

  const tables = ['products', 'brands', 'categories', 'gallery', 'admins', 'site_settings', 'projects', 'enquiries', 'orders'];
  const summary = {};

  for (const tbl of tables) {
    try {
      const { data, error, count } = await supabase.from(tbl).select('*', { count: 'exact' });
      if (error) {
        summary[tbl] = { error: error.message };
        continue;
      }

      summary[tbl] = {
        count: data.length,
        exactCount: count,
        sampleId: data[0]?.id || data[0]?.email || 'N/A'
      };

      // Audit image URLs in rows
      let oldUrlCount = 0;
      let newUrlCount = 0;
      let otherUrlCount = 0;

      data.forEach(row => {
        const img = row.image || row.logo || row.image_url;
        if (typeof img === 'string') {
          if (img.includes('yfbzapzceoqkwzsmsjmk')) oldUrlCount++;
          else if (img.includes('ueohqicjodxwkwdxcrnj')) newUrlCount++;
          else if (img.startsWith('http')) otherUrlCount++;
        }
      });

      summary[tbl].imageAudit = {
        oldSupabaseUrls: oldUrlCount,
        newSupabaseUrls: newUrlCount,
        otherUrls: otherUrlCount
      };

    } catch (err) {
      summary[tbl] = { error: err.message };
    }
  }

  console.log('Table Migration Audit Results:');
  console.log(JSON.stringify(summary, null, 2));

  // Verify total records across primary catalog tables
  const totalCatalogRecords = (summary.products?.count || 0) +
                              (summary.brands?.count || 0) +
                              (summary.categories?.count || 0) +
                              (summary.gallery?.count || 0) +
                              (summary.admins?.count || 0) +
                              (summary.site_settings?.count || 0);

  console.log(`\nTotal Primary Catalog Records in New Supabase: ${totalCatalogRecords} (Expected: ~280)`);

  if (summary.products?.imageAudit?.oldSupabaseUrls > 0 || summary.gallery?.imageAudit?.oldSupabaseUrls > 0 || summary.brands?.imageAudit?.oldSupabaseUrls > 0) {
    console.warn('\nWARNING: Some records still contain old Supabase image URLs!');
  } else {
    console.log('\nSUCCESS: Zero old Supabase image URLs detected in destination database!');
  }
}

runAudit();
