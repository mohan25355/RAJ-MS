const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const destUrl = process.env.DESTINATION_SUPABASE_URL;
const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

if (!destUrl || !destKey) {
  console.error('ERROR: Missing DESTINATION_SUPABASE_URL or DESTINATION_SUPABASE_SERVICE_KEY in server/.env');
  process.exit(1);
}

const supabase = createClient(destUrl, destKey);

async function checkGallery() {
  const { data: galleryRecords, error } = await supabase.from('gallery').select('*');
  if (error) {
    console.error('Error fetching gallery:', error.message);
    process.exit(1);
  }

  console.log(`Found ${galleryRecords.length} gallery records in destination DB:\n`);
  
  // Sort by display_order if present, or id
  galleryRecords.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

  galleryRecords.forEach((item, idx) => {
    console.log(`[Record ${idx + 1}]`);
    console.log(`  ID           : "${item.id}"`);
    console.log(`  Title        : "${item.title}"`);
    console.log(`  Description  : "${item.description}"`);
    console.log(`  Display Order: ${item.display_order}`);
    console.log(`  Is Active    : ${item.is_active}`);
    console.log(`  Image Field  : "${item.image}"`);
    console.log(`  Image URL    : "${item.image_url}"`);
    if (item.data) console.log(`  Data keys    :`, Object.keys(item.data));
    console.log('');
  });
}

checkGallery().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
