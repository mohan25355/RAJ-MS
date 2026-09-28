const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

async function inspectColumns() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
    return;
  }
  const row = data[0];
  console.log('PostgreSQL columns in products row:');
  console.log(Object.keys(row));
  console.log('\nJSONB data keys in products row:');
  console.log(row.data ? Object.keys(row.data) : 'No data field');
}

inspectColumns();
