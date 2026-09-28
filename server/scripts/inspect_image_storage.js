const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

async function inspectStorage() {
  const { data: rows } = await supabase.from('products').select('*');
  const recordFromRow = r => { const { data, ...cols } = r; return { ...cols, ...(data || {}) }; };
  const products = (rows || []).map(recordFromRow);

  console.log('Sample product images from DB:');
  products.slice(0, 10).forEach(p => console.log(`- [${p.category}] ${p.name}: ${p.image}`));

  const { data: storageFiles, error } = await supabase.storage.from('RAJA_ELE').list('products', { limit: 100 });
  console.log('\nSupabase Storage RAJA_ELE/products sample files count:', storageFiles?.length, error);

  // Check client assets directories
  const clientPublic = path.join(__dirname, '../../client/public');
  const clientAssets = path.join(__dirname, '../../client/src/assets');
  console.log('\nClient public exists:', fs.existsSync(clientPublic));
  if (fs.existsSync(clientPublic)) {
    console.log('Client public contents:', fs.readdirSync(clientPublic));
  }
  console.log('Client src/assets exists:', fs.existsSync(clientAssets));
  if (fs.existsSync(clientAssets)) {
    console.log('Client src/assets contents:', fs.readdirSync(clientAssets));
  }
}

inspectStorage();
