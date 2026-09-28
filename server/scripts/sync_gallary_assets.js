const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('../client/src/assets/gallery');
const destDir = path.resolve('../client/src/assets/gallary');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const files = fs.readdirSync(srcDir);
files.forEach(f => {
  fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
});

console.log('Successfully synced 7 gallery images to client/src/assets/gallary');
