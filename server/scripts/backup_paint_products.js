const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const destUrl = process.env.DESTINATION_SUPABASE_URL;
const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

if (!destUrl || !destKey) {
  console.error('ERROR: Missing DESTINATION_SUPABASE_URL or DESTINATION_SUPABASE_SERVICE_KEY in server/.env');
  process.exit(1);
}

const supabase = createClient(destUrl, destKey);

const TARGET_CATEGORIES = [
  'Nippon Paint',
  'Kansai Nerolac',
  'Birla Opus',
  'Vapocure Paints'
];

async function createBackup() {
  const { data: allProducts, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Backup fetch error:', error.message);
    process.exit(1);
  }

  const targetProducts = allProducts.filter(p => {
    const cat = String(p.category || '').trim().toLowerCase();
    const dataCat = String(p.data?.category || '').trim().toLowerCase();
    return TARGET_CATEGORIES.some(tc => cat === tc.toLowerCase() || dataCat === tc.toLowerCase());
  });

  console.log(`Found ${targetProducts.length} product records to backup.`);

  const backupData = targetProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    category_id: p.category_id,
    brand: p.brand,
    brand_id: p.brand_id,
    price: p.price,
    description: p.description,
    previous_image: p.image,
    data_image: p.data?.image,
    full_product_record: p
  }));

  const backupPath = path.resolve(__dirname, '../../paint-product-image-backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log(`Successfully saved backup to ${backupPath}`);
}

createBackup().catch(err => {
  console.error('Backup error:', err);
  process.exit(1);
});

