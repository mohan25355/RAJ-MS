const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

function recordFromRow(r) { const { data, ...cols } = r; return { ...cols, ...(data || {}) }; }

async function inspectCategories() {
  const { data: rows, error } = await supabase.from('categories').select('*');
  if (error) {
    console.error('Error fetching categories:', error);
    return;
  }
  const categories = rows.map(recordFromRow);
  console.log(`Fetched ${categories.length} categories from categories table:`);
  categories.forEach(c => console.log(`- ID: ${c.id} | Name: "${c.name}" | Active: ${c.is_active}`));
}

inspectCategories();
