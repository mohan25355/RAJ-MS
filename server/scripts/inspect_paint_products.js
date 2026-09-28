const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function inspectDestinationDatabase() {
  console.log('=== STEP 2: INSPECT CURRENT DESTINATION DATABASE FOR PAINT PRODUCTS ===\n');

  const destUrl = process.env.DESTINATION_SUPABASE_URL;
  const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

  if (!destUrl || !destKey) {
    console.error('ERROR: Missing DESTINATION_SUPABASE_URL or DESTINATION_SUPABASE_SERVICE_KEY in server/.env');
    process.exit(1);
  }

  const destClient = createClient(destUrl, destKey);

  // Query categories
  const { data: categories, error: catErr } = await destClient.from('categories').select('*');
  if (catErr) {
    console.error('Error fetching categories:', catErr.message);
    process.exit(1);
  }

  console.log(`Discovered ${categories.length} total categories.`);
  const targetCategoryNames = ['Nippon Paint', 'Kansai Nerolac', 'Birla Opus', 'Vapocure Paints', 'Paints & Coatings', 'Paints'];
  
  const targetCategories = categories.filter(c => 
    targetCategoryNames.some(t => c.name.toLowerCase().includes(t.toLowerCase()))
  );

  console.log('\nMatching Paint Categories in DB:');
  targetCategories.forEach(c => console.log(` - ID: "${c.id}" | Name: "${c.name}"`));

  // Query all products
  const { data: allProducts, error: prodErr } = await destClient.from('products').select('*');
  if (prodErr) {
    console.error('Error fetching products:', prodErr.message);
    process.exit(1);
  }

  console.log(`\nDiscovered ${allProducts.length} total products in destination database.`);

  // Group products by category or brand
  const paintCategories = ['Nippon Paint', 'Kansai Nerolac', 'Birla Opus', 'Vapocure Paints'];
  
  for (const catName of paintCategories) {
    console.log(`\n====================================================`);
    console.log(`   CATEGORY: "${catName}"`);
    console.log(`====================================================`);

    const matchingProducts = allProducts.filter(p => {
      const pCat = String(p.category || '').trim().toLowerCase();
      const pDataCat = String(p.data && p.data.category || '').trim().toLowerCase();
      const pDataBrand = String(p.data && p.data.brand || '').trim().toLowerCase();
      const pName = String(p.name || '').trim().toLowerCase();
      const target = catName.toLowerCase();

      return pCat === target || pDataCat === target || pDataBrand.includes(target) || pName.includes(target) || pCat.includes(target);
    });

    console.log(`Product Count: ${matchingProducts.length}`);
    if (matchingProducts.length === 0) {
      console.log(`CATEGORY HAS NO EXISTING PRODUCTS`);
    } else {
      matchingProducts.forEach((p, idx) => {
        console.log(`\n [Product ${idx + 1}]`);
        console.log(`  - ID: "${p.id}"`);
        console.log(`  - Name: "${p.name}"`);
        console.log(`  - Category: "${p.category}"`);
        console.log(`  - Price: ${p.price}`);
        console.log(`  - Current Image: "${p.image}"`);
        if (p.data) console.log(`  - Data payload keys:`, Object.keys(p.data));
      });
    }
  }
}

inspectDestinationDatabase().catch(err => {
  console.error('Fatal Inspection Error:', err);
  process.exit(1);
});
