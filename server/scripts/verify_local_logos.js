const fs = require('fs');
const path = require('path');
const http = require('http');

async function testLogoFiles() {
  console.log('=== VERIFYING LOCAL BRAND LOGO INTEGRATION ===\n');

  const logos = [
    { name: 'Dr. Fixit', file: 'dr-fixit.png' },
    { name: 'Fosroc', file: 'fosroc.png' },
    { name: 'Zycosil+', file: 'zycosil-plus.png' },
    { name: 'MYNK', file: 'mynk.png' },
    { name: 'Ramco Supergrade', file: 'ramco-supergrade.png' }
  ];

  const publicDir = path.join(__dirname, '../../client/public/assets/brands');
  const srcDir = path.join(__dirname, '../../client/src/assets/brands');
  const distDir = path.join(__dirname, '../../client/dist/assets');

  let allFilesExist = true;

  logos.forEach(logo => {
    const pubPath = path.join(publicDir, logo.file);
    const srcPath = path.join(srcDir, logo.file);

    const pubExists = fs.existsSync(pubPath);
    const srcExists = fs.existsSync(srcPath);

    const pubSize = pubExists ? fs.statSync(pubPath).size : 0;
    const srcSize = srcExists ? fs.statSync(srcPath).size : 0;

    console.log(`Brand: "${logo.name}"`);
    console.log(` - File: ${logo.file}`);
    console.log(` - Public Asset: ${pubExists ? 'EXISTS (' + pubSize + ' bytes) ✓' : 'MISSING ✗'}`);
    console.log(` - Src Asset: ${srcExists ? 'EXISTS (' + srcSize + ' bytes) ✓' : 'MISSING ✗'}`);

    if (!pubExists || !srcExists || pubSize === 0 || srcSize === 0) {
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    console.error('\n✗ VERIFICATION FAILED: One or more local brand logo files are missing or empty.');
    process.exit(1);
  }

  console.log('\n✓ ALL 5 BRAND LOGOS VERIFIED LOCALLY WITH NON-ZERO FILE SIZES!');
}

testLogoFiles().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
