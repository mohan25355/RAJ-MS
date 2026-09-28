const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('../gallery_img');
const destPublic = path.resolve('../client/public/assets/gallery');
const destSrc = path.resolve('../client/src/assets/gallery');

if (!fs.existsSync(destPublic)) fs.mkdirSync(destPublic, { recursive: true });
if (!fs.existsSync(destSrc)) fs.mkdirSync(destSrc, { recursive: true });

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

const filePaths = scanDir(srcDir).sort((a, b) => path.basename(a).localeCompare(path.basename(b)));

console.log(`Found ${filePaths.length} gallery images to copy:\n`);

filePaths.forEach((srcFile, idx) => {
  const num = String(idx + 1).padStart(2, '0');
  const ext = path.extname(srcFile).toLowerCase() || '.jpeg';
  const targetName = `gallery-${num}${ext}`;

  const targetPublic = path.join(destPublic, targetName);
  const targetSrcPath = path.join(destSrc, targetName);

  fs.copyFileSync(srcFile, targetPublic);
  fs.copyFileSync(srcFile, targetSrcPath);

  const sizeKB = (fs.statSync(srcFile).size / 1024).toFixed(2);
  console.log(`[Gallery ${num}] ${path.basename(srcFile)} -> ${targetName} (${sizeKB} KB)`);
});

console.log('\nSuccessfully copied all 7 gallery images!');
