const http = require('http');

http.get('http://localhost:10000/api/content', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const san = (json.products || []).filter(p => p.category && p.category.trim().toLowerCase() === 'sanitaryware');
      console.log(`Fetched ${san.length} Sanitaryware products via /api/content:`);
      san.forEach(p => console.log(`- ${p.name}: ${p.image}`));
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
}).on('error', err => console.error('HTTP error:', err.message));
