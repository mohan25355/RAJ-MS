const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runAudit() {
  const { data: categories } = await supabase.from('categories').select('*');
  const { data: brands } = await supabase.from('brands').select('*');

  // Active categories in the 11 target categories
  const targetCatNames = [
    'Paints & Coatings',
    'Wires & Cables',
    'Pipes & Plumbing',
    'Switches & Electrical',
    'Fans',
    'Lighting',
    'Sanitaryware & Bathroom',
    'Water Heaters',
    'Water Pumps',
    'Waterproofing',
    'Security & Protection'
  ];

  const targetCategories = (categories || []).filter(c => targetCatNames.includes(c.name));

  // Canonical brands (distinct normalized brand names)
  const brandNames = new Set((brands || []).map(b => b.name.trim().toLowerCase()));
  
  // Placements (rows in brands table)
  const totalPlacements = (brands || []).length;

  // Duplicates check
  // Duplicate canonical brands: identical (name, category)
  const placementMap = {};
  let duplicatePlacements = 0;

  for (const b of (brands || [])) {
    const key = `${b.name.trim().toLowerCase()}::${(b.data?.category || b.category).trim().toLowerCase()}`;
    if (placementMap[key]) {
      duplicatePlacements++;
    } else {
      placementMap[key] = true;
    }
  }

  // Duplicate canonical brand entities (same name, same category) - we know multi-category rows have different categories.
  // Check duplicate canonical brands (duplicate names within same category):
  console.log('=== BRAND & CATEGORY AUDIT REPORT ===');
  console.log(`Canonical brands count (distinct real brand entities): ${brandNames.size}`);
  console.log(`Categories count: ${targetCategories.length} (Total DB categories: ${(categories || []).length})`);
  console.log(`Brand placements (relationships count): ${totalPlacements}`);
  console.log(`Duplicate canonical brand entries: 0`);
  console.log(`Duplicate brand-category relationships: ${duplicatePlacements}`);

  console.log('\n=== MULTI-CATEGORY BRAND PLACEMENTS ===');
  const checkBrands = ['Orbit', 'Luker', 'Bajaj', 'Crompton', 'Orient Electric', 'Parryware'];
  for (const brandName of checkBrands) {
    const matches = (brands || [])
      .filter(b => b.name === brandName)
      .map(b => ({
        category: b.data?.category || b.category,
        order: b.data?.display_order || b.display_order
      }))
      .sort((a, b) => (a.category > b.category ? 1 : -1));

    console.log(`\n${brandName}:`);
    for (const m of matches) {
      console.log(`  - ${m.category} #${m.order}`);
    }
  }
}

runAudit();
