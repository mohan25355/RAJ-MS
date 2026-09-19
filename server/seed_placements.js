const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categoryOrder = [
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

async function seedAll() {
  console.log('--- Step 1: Updating Category display_order ---');
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }

  for (const cat of categories || []) {
    const idx = categoryOrder.indexOf(cat.name);
    const order = idx !== -1 ? idx + 1 : (cat.data?.display_order || 99);
    const updatedData = { ...cat.data, display_order: order };
    await supabase.from('categories').update({ data: updatedData }).eq('id', cat.id);
    console.log(`Category "${cat.name}" -> display_order: ${order}`);
  }

  console.log('\n--- Step 2: Syncing Brand Placements ---');
  const { data: existingBrands, error: brandError } = await supabase.from('brands').select('*');
  if (brandError) {
    console.error('Error fetching brands:', brandError);
    return;
  }

  // Remove test records if any exist
  const testBrand = (existingBrands || []).find(b => b.id === 'test' || b.name === 'Test');
  if (testBrand) {
    console.log('Found test brand, deleting:', testBrand.id);
    await supabase.from('brands').delete().eq('id', testBrand.id);
  }

  let totalPlacements = 0;
  for (const group of requiredPlacements) {
    for (let i = 0; i < group.items.length; i++) {
      const brandName = group.items[i];
      const order = i + 1;
      totalPlacements++;

      // Check if brand placement already exists for this (brandName, category) pair
      const match = (existingBrands || []).find(b =>
        b.name === brandName &&
        (b.data?.category === group.category || b.category === group.category)
      );

      const logo = logoMap[brandName] !== undefined ? logoMap[brandName] : (match ? match.logo : null);

      if (match) {
        const updatedData = {
          ...match.data,
          id: match.id,
          name: brandName,
          logo: logo,
          display_order: order,
          is_active: true,
          category: group.category
        };
        const { error } = await supabase.from('brands').update({
          logo: logo,
          data: updatedData
        }).eq('id', match.id);

        if (error) console.error(`Error updating ${brandName} in ${group.category}:`, error);
        else console.log(`Updated placement #${order}: ${brandName} in ${group.category}`);
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

        const { error } = await supabase.from('brands').insert({
          id: newId,
          name: brandName,
          logo: logo,
          data: item
        });

        if (error) console.error(`Error inserting ${brandName} in ${group.category}:`, error);
        else console.log(`Created new placement #${order}: ${brandName} in ${group.category} (id: ${newId})`);
      }
    }
  }

  console.log(`\nSeed completed! Processed ${totalPlacements} placements across ${categoryOrder.length} categories.`);
}

seedAll().catch(err => {
  console.error('Fatal seed error:', err);
});
