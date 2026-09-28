const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

async function verifyMigratedApis() {
  console.log('=== VERIFYING API COMPATIBILITY WITH NEW SUPABASE PROJECT ===\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  console.log(`Active SUPABASE_URL: ${supabaseUrl}`);
  const client = createClient(supabaseUrl, supabaseKey);

  // Test Categories query
  const { data: categories, error: catErr } = await client.from('categories').select('*');
  console.log(`Categories Query: ${catErr ? 'ERROR: ' + catErr.message : 'SUCCESS (' + categories.length + ' records)'}`);

  // Test Brands query
  const { data: brands, error: brandErr } = await client.from('brands').select('*');
  console.log(`Brands Query: ${brandErr ? 'ERROR: ' + brandErr.message : 'SUCCESS (' + brands.length + ' records)'}`);

  // Test Products query
  const { data: products, error: prodErr } = await client.from('products').select('*');
  console.log(`Products Query: ${prodErr ? 'ERROR: ' + prodErr.message : 'SUCCESS (' + products.length + ' records)'}`);

  // Test Gallery query
  const { data: gallery, error: galErr } = await client.from('gallery').select('*');
  console.log(`Gallery Query: ${galErr ? 'ERROR: ' + galErr.message : 'SUCCESS (' + gallery.length + ' records)'}`);

  // Test Site Settings query
  const { data: siteSettings, error: siteErr } = await client.from('site_settings').select('data').eq('id', 1).maybeSingle();
  console.log(`Site Settings Query: ${siteErr ? 'ERROR: ' + siteErr.message : 'SUCCESS (data present: ' + !!siteSettings?.data + ')'}`);

  if (categories.length === 30 && brands.length === 51 && products.length === 189 && gallery.length === 7) {
    console.log('\n✓ ALL API QUERY TESTS PASSED WITH 100% RECORD INTEGRITY!');
  } else {
    console.error('\n✗ RECORD COUNT VERIFICATION FAILED!');
    process.exit(1);
  }
}

verifyMigratedApis().catch(err => {
  console.error('API Verification Error:', err);
  process.exit(1);
});
