const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');

function scan(dir, results = []) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    if (entry.isDirectory()) {
      scan(fullPath, results);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
        const stat = fs.statSync(fullPath);
        results.push({
          path: fullPath,
          rel: path.relative(rootDir, fullPath),
          name: entry.name,
          ext,
          size: stat.size,
          sizeKB: (stat.size / 1024).toFixed(1) + ' KB'
        });
      }
    }
  }
  return results;
}

const allImages = scan(rootDir);
console.log(`Total local images found across project: ${allImages.length}`);
allImages.forEach(img => {
  if (img.rel.includes('san') || img.rel.includes('Sanitary') || img.name.toLowerCase().includes('wash') || img.name.toLowerCase().includes('tap') || img.name.toLowerCase().includes('wc')) {
    console.log(`- ${img.rel} (${img.sizeKB})`);
  }
});
