const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

async function checkDestination() {
  const destUrl = process.env.DESTINATION_SUPABASE_URL;
  const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

  if (!destUrl || !destKey) {
    console.error('Missing destination env variables');
    process.exit(1);
  }

  const destClient = createClient(destUrl, destKey);

  const tables = [
    'products',
    'brands',
    'categories',
    'gallery',
    'admins',
    'site_settings',
    'catalogues',
    'enquiries',
    'industries',
    'orders',
    'projects'
  ];

  console.log('=== DESTINATION TABLE ROW COUNTS ===');
  for (const table of tables) {
    const { count, error } = await destClient
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`${table}: ERROR - ${error.message}`);
    } else {
      console.log(`${table}: ${count}`);
    }
  }
}

checkDestination();
