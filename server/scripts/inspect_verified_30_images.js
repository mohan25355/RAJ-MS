const fs = require('fs');
const path = require('path');

function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.readUInt32BE(0) !== 0x89504E47) {
    return { width: 0, height: 0 };
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

const dir = path.join(__dirname, '../verified_30_images');
const files = fs.readdirSync(dir);
console.log('Inspecting server/verified_30_images/:');
files.forEach(f => {
  const fp = path.join(dir, f);
  const stat = fs.statSync(fp);
  const dims = f.endsWith('.png') ? getPngDimensions(fp) : { width: 0, height: 0 };
  console.log(`- ${f} | ${dims.width}x${dims.height} | ${(stat.size/1024).toFixed(1)} KB`);
});
