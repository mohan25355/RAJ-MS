const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const destUrl = process.env.DESTINATION_SUPABASE_URL;
const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

if (!destUrl || !destKey) {
  console.error('ERROR: Missing DESTINATION_SUPABASE_URL or DESTINATION_SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(destUrl, destKey);

async function checkBrands() {
  const { data: brands, error } = await supabase.from('brands').select('*');
  if (error) {
    console.error('Error fetching brands:', error);
    process.exit(1);
  }

  console.log(`Found ${brands.length} brands in destination DB.`);
  const targetNames = ['rk innovations', 'velora'];
  const matched = brands.filter(b => targetNames.some(t => b.name.toLowerCase().includes(t)));
  
  console.log('\nMatched brands in DB:');
  console.log(matched);
}

checkBrands().catch(err => {
  console.error(err);
  process.exit(1);
});
