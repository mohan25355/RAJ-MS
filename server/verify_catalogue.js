const http = require('http');

const categoryDisplayNormalizations = {
  'Pipes & Plumbing': 'Pipes & Fittings',
  'Security & Protection': 'Security'
};

const brandDisplayNormalizations = {
  'A. O. Smith': 'AO Smith',
  'Essco by Jaquar': 'Essco',
  'Vapour Paints': 'Vapocure Paints',
  'Zycocil+': 'Zycosil+',
  'Europa': 'Europaa'
};

function fetchApi() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:10000/api/content', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function verifyAll() {
  const data = await fetchApi();

  const targetCategoryNames = [
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

  const activeCategories = (data.categories || [])
    .filter(c => targetCategoryNames.includes(c.name))
    .sort((a, b) => (a.display_order || 99) - (b.display_order || 99));

  console.log('=== PUBLIC BRANDS CATALOGUE ===\n');

  let placementCount = 0;
  activeCategories.forEach((cat, index) => {
    const publicCatLabel = categoryDisplayNormalizations[cat.name] || cat.name;
    console.log(`${index + 1}. ${publicCatLabel}`);

    const catBrands = (data.brands || [])
      .filter(b => b.is_active !== false && (b.category === cat.name || b.data?.category === cat.name))
      .sort((a, b) => {
        const orderA = a.display_order !== undefined ? a.display_order : (a.data?.display_order || 99);
        const orderB = b.display_order !== undefined ? b.display_order : (b.data?.display_order || 99);
        return orderA - orderB;
      });

    catBrands.forEach((b, i) => {
      placementCount++;
      const order = b.display_order !== undefined ? b.display_order : (b.data?.display_order || 99);
      const publicBrandLabel = brandDisplayNormalizations[b.name] || b.name;
      console.log(`   #${order} ${publicBrandLabel}`);
    });
    console.log('');
  });

  console.log(`Total public categories: ${activeCategories.length}`);
  console.log(`Total public placements: ${placementCount}\n`);

  console.log('=== MULTI-CATEGORY BRANDS ===\n');
  const multiBrands = ['Orbit', 'Luker', 'Bajaj', 'Crompton', 'Orient Electric', 'Parryware'];

  for (const bName of multiBrands) {
    console.log(`${bName}:`);
    const matches = (data.brands || [])
      .filter(b => b.name === bName && b.is_active !== false)
      .map(b => ({
        category: categoryDisplayNormalizations[b.category || b.data?.category] || (b.category || b.data?.category),
        order: b.display_order !== undefined ? b.display_order : (b.data?.display_order || 99)
      }));

    for (const m of matches) {
      console.log(`- ${m.category} #${m.order}`);
    }
    console.log('');
  }
}

verifyAll().catch(console.error);
