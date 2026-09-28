const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../client/src');

function scan(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const fp = path.join(dir, f.name);
    if (f.isDirectory()) scan(fp);
    else if (f.name.endsWith('.jsx') || f.name.endsWith('.js') || f.name.endsWith('.json')) {
      const text = fs.readFileSync(fp, 'utf8');
      if (text.includes('Sanitaryware') || text.includes('sanitaryware') || text.includes('resolveProductImage')) {
        console.log(`Found in: ${path.relative(srcDir, fp)}`);
        const lines = text.split('\n');
        lines.forEach((l, i) => {
          if (l.toLowerCase().includes('sanitary') || l.includes('resolveProductImage')) {
            console.log(`  L${i+1}: ${l.trim().slice(0, 100)}`);
          }
        });
      }
    }
  }
}

scan(srcDir);
