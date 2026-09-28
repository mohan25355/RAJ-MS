const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testDestTables() {
  const url = process.env.DESTINATION_SUPABASE_URL;
  const key = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

  console.log('Testing Destination Supabase PostgREST tables...');
  const client = createClient(url, key);

  const testTables = ['categories', 'brands', 'products', 'gallery', 'site_settings', 'admins', 'enquiries', 'orders'];

  for (const tbl of testTables) {
    const { data, error } = await client.from(tbl).select('*').limit(1);
    if (error) {
      console.log(`Table "${tbl}": ${error.code} - ${error.message}`);
    } else {
      console.log(`Table "${tbl}": EXISTS (data len: ${data ? data.length : 0})`);
    }
  }
}

testDestTables().catch(console.error);
