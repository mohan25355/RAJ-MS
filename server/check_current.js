const http = require('http');

http.get('http://127.0.0.1:10000/api/content', res => {
  let body = '';
  res.on('data', chunk => (body += chunk));
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log('=== CURRENT CATEGORIES ===');
      console.table((data.categories || []).map(c => ({ id: c.id, name: c.name, order: c.display_order, is_active: c.is_active })));

      console.log('\n=== CURRENT BRANDS ===');
      console.table((data.brands || []).map(b => ({ id: b.id, name: b.name, category: b.category, logo: (b.logo || '').slice(0, 40), order: b.display_order, is_active: b.is_active })));
    } catch (e) {
      console.error(e);
    }
  });
});
