const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

const targetCategories = [
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

const requiredPlacements = [
  { category: 'Paints & Coatings', items: ['Birla Opus', 'Nippon Paint', 'Kansai Nerolac', 'Vapour Paints'] },
  { category: 'Wires & Cables', items: ['Finolex Cables', 'RR Kabel', 'Orbit', 'Luker'] },
  { category: 'Pipes & Plumbing', items: ['Astral Pipes', 'Finolex Pipes', 'Ashirvad'] },
  { category: 'Switches & Electrical', items: ['Legrand', 'Norwood', 'Norisys', 'GM', 'Anchor by Panasonic', 'Roma', 'Orbit'] },
  { category: 'Fans', items: ['Crompton', 'Atomberg', 'Almonard', 'Orient Electric', 'Polar', 'Polstar', 'Bajaj', 'Luker'] },
  { category: 'Lighting', items: ['Philips', 'Jaquar Lighting', 'Luker', 'Orbit'] },
  { category: 'Sanitaryware & Bathroom', items: ['Jaquar', 'Essco by Jaquar', 'Parryware', 'Geberit'] },
  { category: 'Water Heaters', items: ['A. O. Smith', 'Bajaj', 'Crompton', 'Orient Electric', 'Luker', 'Parryware'] },
  { category: 'Water Pumps', items: ['C.R.I. Pumps', 'Hasten'] },
  { category: 'Waterproofing', items: ['Dr. Fixit', 'Zycocil+'] },
  { category: 'Security & Protection', items: ['Europa'] }
];

const logoMap = {
  'Birla Opus': '1.png',
  'Nippon Paint': null,
  'Kansai Nerolac': '10.jpg',
  'Vapour Paints': '26.png',
  'Finolex Cables': '3.jpg',
  'RR Kabel': '24.jpg',
  'Orbit': '25.png',
  'Luker': '25.png',
  'Astral Pipes': '4.jpg',
  'Finolex Pipes': '15.png',
  'Ashirvad': '9.png',
  'Legrand': '5.png',
  'Norwood': '11.png',
  'Norisys': '23.png',
  'GM': null,
  'Anchor by Panasonic': '7.png',
  'Roma': null,
  'Crompton': '16.jpg',
  'Atomberg': 'd1.jpg',
  'Almonard': 'd2.png',
  'Orient Electric': '22.png',
  'Polar': 'd4.png',
  'Polstar': 'd3.jpg',
  'Bajaj': '8.jpg',
  'Philips': '14.jpg',
  'Jaquar Lighting': '20.png',
  'Jaquar': '20.png',
  'Essco by Jaquar': '6.jpg',
  'Parryware': '13.png',
  'Geberit': '17.png',
  'A. O. Smith': '21.png',
  'C.R.I. Pumps': '19.png',
  'Hasten': '18.png',
  'Dr. Fixit': '12.jpg',
  'Zycocil+': 'd5.png',
  'Europa': '2.jpg'
};

async function resetCatalogue() {
  console.log('=== STEP 1: Updating Category Display Orders in Supabase ===');
  const { data: categories } = await supabase.from('categories').select('*');
  
  for (const cat of (categories || [])) {
    const idx = targetCategories.indexOf(cat.name);
    const displayOrder = idx !== -1 ? idx + 1 : 99;
    const isTarget = idx !== -1;
    const updatedData = {
      ...cat.data,
      display_order: displayOrder,
      is_active: isTarget ? true : (cat.data?.is_active ?? false)
    };
    await supabase.from('categories').update({ data: updatedData }).eq('id', cat.id);
    console.log(`Category "${cat.name}" -> display_order: ${displayOrder}`);
  }

  console.log('\n=== STEP 2: Syncing Required Placements & Deactivating Extra Placements ===');
  const { data: existingBrands } = await supabase.from('brands').select('*');
  console.log(`Total existing rows in brands table: ${(existingBrands || []).length}`);

  // Set of valid placement keys: "brandName::categoryName"
  const validPlacementKeys = new Set();
  requiredPlacements.forEach(group => {
    group.items.forEach(brandName => {
      validPlacementKeys.add(`${brandName.trim().toLowerCase()}::${group.category.trim().toLowerCase()}`);
    });
  });

  let activePlacementsCount = 0;
  let updatedCount = 0;
  let insertedCount = 0;

  // 1. Sync required 45 placements
  for (const group of requiredPlacements) {
    for (let i = 0; i < group.items.length; i++) {
      const brandName = group.items[i];
      const order = i + 1;
      activePlacementsCount++;

      const key = `${brandName.trim().toLowerCase()}::${group.category.trim().toLowerCase()}`;

      // Check if row already exists for this (brandName, category)
      const existingMatch = (existingBrands || []).find(b => {
        const bCat = b.data?.category || b.category;
        return b.name.trim().toLowerCase() === brandName.trim().toLowerCase() &&
               bCat && bCat.trim().toLowerCase() === group.category.trim().toLowerCase();
      });

      const logo = logoMap[brandName] !== undefined ? logoMap[brandName] : (existingMatch ? existingMatch.logo : null);

      if (existingMatch) {
        const updatedData = {
          ...existingMatch.data,
          id: existingMatch.id,
          name: brandName,
          category: group.category,
          logo: logo,
          display_order: order,
          is_active: true
        };
        await supabase.from('brands').update({
          logo: logo,
          data: updatedData
        }).eq('id', existingMatch.id);
        updatedCount++;
      } else {
        const slugCategory = group.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const slugBrand = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const newId = `brand-${slugBrand}-${slugCategory}`;
        const item = {
          id: newId,
          name: brandName,
          category: group.category,
          logo: logo,
          display_order: order,
          is_active: true
        };
        await supabase.from('brands').insert({
          id: newId,
          name: brandName,
          logo: logo,
          data: item
        });
        insertedCount++;
      }
    }
  }

  // 2. Deactivate any brand placement row that is NOT part of the 45 target placements
  let deactivatedCount = 0;
  for (const b of (existingBrands || [])) {
    const bCat = b.data?.category || b.category;
    const key = bCat ? `${b.name.trim().toLowerCase()}::${bCat.trim().toLowerCase()}` : '';
    if (!validPlacementKeys.has(key)) {
      // Deactivate placement row so it doesn't show on public Brands page
      const updatedData = {
        ...b.data,
        is_active: false
      };
      await supabase.from('brands').update({ data: updatedData }).eq('id', b.id);
      deactivatedCount++;
    }
  }

  console.log(`\nCatalogue Reset Complete!`);
  console.log(`Active target placements: ${activePlacementsCount}`);
  console.log(`Updated placements: ${updatedCount}`);
  console.log(`Newly inserted placements: ${insertedCount}`);
  console.log(`Deactivated extra placements: ${deactivatedCount}`);
}

resetCatalogue().catch(err => {
  console.error('Reset error:', err);
});
