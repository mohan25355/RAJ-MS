const fs = require('fs');
const path = require('path');

const galleryDir = path.resolve('../gallery_img');

function getJpegDimensions(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    const marker = buffer.readUInt16BE(offset);
    offset += 2;
    if (marker === 0xFFC0 || marker === 0xFFC2) {
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return { width, height };
    }
    const length = buffer.readUInt16BE(offset);
    offset += length;
  }
  return { width: 0, height: 0 };
}

function getPngDimensions(buffer) {
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

function scanDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDir(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

if (!fs.existsSync(galleryDir)) {
  console.error(`Directory not found: ${galleryDir}`);
  process.exit(1);
}

const filePaths = scanDir(galleryDir);
console.log(`Discovered ${filePaths.length} image files in ${galleryDir}:\n`);

const inventory = [];

filePaths.forEach((filePath, idx) => {
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();
  const stats = fs.statSync(filePath);
  const buffer = fs.readFileSync(filePath);
  let dims = { width: 0, height: 0 };
  if (ext === '.jpg' || ext === '.jpeg') dims = getJpegDimensions(buffer);
  else if (ext === '.png') dims = getPngDimensions(buffer);

  const item = {
    index: idx + 1,
    filename,
    filePath,
    ext,
    sizeBytes: stats.size,
    sizeKB: (stats.size / 1024).toFixed(2),
    mimeType: ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg',
    dimensions: `${dims.width}x${dims.height}`
  };
  inventory.push(item);
  console.log(`[File ${idx + 1}] ${filename} | ${item.sizeKB} KB | ${item.mimeType} | ${item.dimensions}`);
});

fs.writeFileSync(path.resolve(__dirname, 'gallery_inventory.json'), JSON.stringify(inventory, null, 2), 'utf8');
