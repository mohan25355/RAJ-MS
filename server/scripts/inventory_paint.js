import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PAINT_DIR = path.resolve('../paint');

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

function getWebpDimensions(buffer) {
  // Simple webp header parsing
  if (buffer.toString('ascii', 12, 16) === 'VP8 ') {
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height };
  } else if (buffer.toString('ascii', 12, 16) === 'VP8L') {
    const b1 = buffer[21];
    const b2 = buffer[22];
    const b3 = buffer[23];
    const b4 = buffer[24];
    const width = 1 + (((b2 & 0x3f) << 8) | b1);
    const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
    return { width, height };
  } else if (buffer.toString('ascii', 12, 16) === 'VP8X') {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height };
  }
  return { width: 0, height: 0 };
}

function getImageDimensions(buffer, ext) {
  try {
    if (ext === '.jpg' || ext === '.jpeg') return getJpegDimensions(buffer);
    if (ext === '.png') return getPngDimensions(buffer);
    if (ext === '.webp') return getWebpDimensions(buffer);
  } catch (e) {
    console.error(`Dimension parse error: ${e.message}`);
  }
  return { width: 0, height: 0 };
}

function getMimeType(ext) {
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.webp': return 'image/webp';
    case '.avif': return 'image/avif';
    default: return 'application/octet-stream';
  }
}

function scanDirectory(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDirectory(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function generateInventory() {
  if (!fs.existsSync(PAINT_DIR)) {
    console.error(`Dir not found: ${PAINT_DIR}`);
    process.exit(1);
  }

  const filePaths = scanDirectory(PAINT_DIR);
  const inventory = [];

  for (const filePath of filePaths) {
    const relativePath = path.relative(path.resolve('..'), filePath).replace(/\\/g, '/');
    const filename = path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();
    const stats = fs.statSync(filePath);
    const buffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const mimeType = getMimeType(ext);
    const dims = getImageDimensions(buffer, ext);

    inventory.push({
      relativePath,
      filename,
      categoryFolder: path.basename(path.dirname(filePath)),
      extension: ext,
      sizeBytes: stats.size,
      sizeKB: (stats.size / 1024).toFixed(2),
      mimeType,
      dimensions: `${dims.width}x${dims.height}`,
      sha256: hash
    });
  }

  console.log(`Found ${inventory.length} image files.`);
  
  // Format markdown
  let md = `# PAINT IMAGE INVENTORY REPORT

Date: ${new Date().toISOString()}
Total Images Found: ${inventory.length}

## Inventory Summary by Folder

`;

  const folders = {};
  for (const item of inventory) {
    folders[item.categoryFolder] = (folders[item.categoryFolder] || 0) + 1;
  }

  for (const [folder, count] of Object.entries(folders)) {
    md += `- **${folder}**: ${count} images\n`;
  }

  md += `\n## Detailed Image Inventory Table\n\n`;
  md += `| Category Folder | Filename | Relative Path | Extension | Size (KB) | MIME Type | Dimensions | SHA-256 Hash |\n`;
  md += `| --- | --- | --- | --- | --- | --- | --- | --- |\n`;

  for (const item of inventory) {
    md += `| ${item.categoryFolder} | ${item.filename} | ${item.relativePath} | ${item.extension} | ${item.sizeKB} KB | ${item.mimeType} | ${item.dimensions} | \`${item.sha256.substring(0, 16)}...\` |\n`;
  }

  fs.writeFileSync(path.resolve('../PAINT_IMAGE_INVENTORY.md'), md, 'utf8');
  fs.writeFileSync(path.resolve('scripts/paint_inventory_data.json'), JSON.stringify(inventory, null, 2), 'utf8');
  console.log('PAINT_IMAGE_INVENTORY.md created successfully.');
}

generateInventory();
