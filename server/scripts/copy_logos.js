const fs = require('fs');
const path = require('path');

const mediaDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\14b5616c-516a-4f7c-98cd-de8f845000e9';

const logoMap = [
  { source: 'media__1790576362945.png', name: 'dr-fixit.png' },
  { source: 'media__1790576362970.png', name: 'fosroc.png' },
  { source: 'media__1790576362980.png', name: 'zycosil-plus.png' },
  { source: 'media__1790576363029.jpg', name: 'mynk.jpg' },
  { source: 'media__1790576363029.jpg', name: 'mynk.png' },
  { source: 'media__1790576362939.png', name: 'ramco-supergrade.png' }
];

const targetDirs = [
  path.join(__dirname, '../../client/public/assets/brands'),
  path.join(__dirname, '../../client/src/assets/brands')
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

logoMap.forEach(item => {
  const srcPath = path.join(mediaDir, item.source);
  if (!fs.existsSync(srcPath)) {
    console.error(`Source file missing: ${srcPath}`);
    process.exit(1);
  }

  targetDirs.forEach(dir => {
    const destPath = path.join(dir, item.name);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${item.source} -> ${destPath} (${fs.statSync(destPath).size} bytes)`);
  });
});

console.log('✓ All 5 Construction Chemicals logos successfully placed in client static assets!');
