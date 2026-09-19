const http = require('http');

http.get('http://localhost:10000/api/content', (res) => {
  let rawData = '';
  res.on('data', chunk => rawData += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(rawData);
      console.log('=== API CONTENT AUDIT FROM HTTP SERVER ===');
      console.log('Total categories returned in API:', data.categories.length);

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

      for (const catName of targetCategories) {
        const cat = data.categories.find(c => c.name === catName);
        if (!cat) {
          console.log(`\nCategory MISSING: ${catName}`);
          continue;
        }

        const catBrands = (data.brands || [])
          .filter(b => b.category === catName || b.data?.category === catName)
          .sort((a, b) => {
            const orderA = a.display_order !== undefined ? a.display_order : (a.data?.display_order || 99);
            const orderB = b.display_order !== undefined ? b.display_order : (b.data?.display_order || 99);
            return orderA - orderB;
          });

        console.log(`\nCategory: ${cat.name} (display_order: ${cat.display_order || cat.data?.display_order})`);
        catBrands.forEach((b, i) => {
          const order = b.display_order !== undefined ? b.display_order : (b.data?.display_order || 99);
          console.log(`  #${i + 1} (${order}) ${b.name} [id: ${b.id}]`);
        });
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
}).on('error', (e) => {
  console.error('HTTP Error:', e.message);
});
