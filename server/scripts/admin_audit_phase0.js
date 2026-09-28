const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

async function snapshot() {
  console.log('===========================================================');
  console.log('PHASE 0: RECORDING PRODUCTION DATABASE BEFORE SNAPSHOT');
  console.log('===========================================================');

  const tables = ['products', 'categories', 'brands', 'gallery', 'site_settings', 'admins', 'home_ads'];
  const snapshotData = {};

  for (const t of tables) {
    try {
      const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' });
      if (error) {
        console.log(`Table ${t}: Error (${error.message})`);
        snapshotData[t] = { count: 0, items: [] };
      } else {
        snapshotData[t] = { count: data.length, items: data.map(item => ({ id: item.id, name: item.name || item.title || item.key })) };
        console.log(`Table ${t}: ${data.length} records`);
      }
    } catch (err) {
      console.log(`Table ${t}: Exception (${err.message})`);
    }
  }

  const snapshotPath = path.join(__dirname, '../../ADMIN_BEFORE_SNAPSHOT.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshotData, null, 2));
  console.log(`\nSnapshot saved to ${snapshotPath}`);
}

snapshot();
