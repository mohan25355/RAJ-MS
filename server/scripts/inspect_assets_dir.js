const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

async function check() {
  const publicAssets = path.join(__dirname, '../../client/public/assets');
  if (fs.existsSync(publicAssets)) {
    console.log('client/public/assets subdirs:', fs.readdirSync(publicAssets));
  }

  const srcProductImage = path.join(__dirname, '../../client/src/assets/product image');
  if (fs.existsSync(srcProductImage)) {
    console.log('client/src/assets/product image subdirs:', fs.readdirSync(srcProductImage));
  }

  // Fetch all 15 Sanitaryware products from DB and print their exact image URLs
  const { data: rows } = await supabase.from('products').select('*');
  const recordFromRow = r => { const { data, ...cols } = r; return { ...cols, ...(data || {}) }; };
  const products = (rows || []).map(recordFromRow);
  const sanitary = products.filter(p => p.category && p.category.trim().toLowerCase() === 'sanitaryware');

  console.log('\nCurrent 15 Sanitaryware product image URLs in DB:');
  sanitary.forEach(p => console.log(`- [${p.id}] ${p.name}: ${p.image}`));
}

check();
