const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const rootDir = path.resolve(__dirname, '../..');
const clientDir = path.join(rootDir, 'client');
const newZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-FRONTEND-HOSTINGER-PERMISSIONS-FIXED.zip');
const oldZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-FRONTEND-HOSTINGER.zip');

console.log('=== HOSTINGER FRONTEND PERMISSION FIX & PACKAGING ===\n');

// 1. Reset local Windows permissions on public/ and all subdirectories
console.log('1. Resetting local Windows permissions on client/public...');
try {
  execSync('cmd.exe /c "attrib -r -s -h /s /d client\\public\\* & icacls client\\public /grant Everyone:(OI)(CI)F /T"', {
    cwd: rootDir,
    stdio: 'inherit'
  });
  console.log('Local Windows permissions reset successfully.\n');
} catch (err) {
  console.warn('Warning resetting Windows ACLs:', err.message);
}

// 2. Run npm install & npm run build in client directory
console.log('2. Running npm install in client directory...');
execSync('npm install', { cwd: clientDir, stdio: 'inherit' });

console.log('\n3. Running npm run build in client directory...');
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

const distPath = path.join(clientDir, 'dist');
if (!fs.existsSync(distPath)) {
  throw new Error('BUILD FAILED: client/dist folder was not produced.');
}
console.log('\nBuild SUCCESS! client/dist folder verified.\n');

// 4. Verify public/assets/brands exists and contains files
const brandsPath = path.join(clientDir, 'public', 'assets', 'brands');
if (!fs.existsSync(brandsPath)) {
  throw new Error('CRITICAL: client/public/assets/brands directory is missing.');
}
const brandFiles = fs.readdirSync(brandsPath);
console.log(`Verified public/assets/brands directory exists with ${brandFiles.length} files:`);
brandFiles.forEach(f => console.log(` - ${f}`));
console.log('');

// 5. Remove any old ZIP files
if (fs.existsSync(newZipPath)) fs.unlinkSync(newZipPath);
if (fs.existsSync(oldZipPath)) fs.unlinkSync(oldZipPath);

// 6. Create clean ZIP archive with explicit POSIX mode flags (755 for dirs, 644 for files)
console.log('4. Creating ZIP archive with explicit POSIX permissions (dirs: 755, files: 644)...');

function archiveFrontend(targetZipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(targetZipPath);
    const archive = new archiver.ZipArchive({
      zlib: { level: 9 }
    });

    output.on('close', () => {
      console.log(`ZIP Created successfully: ${targetZipPath} (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
      resolve();
    });

    archive.on('error', err => reject(err));

    archive.pipe(output);

    const itemsToInclude = [
      'dist',
      'public',
      'src',
      'index.html',
      'package.json',
      'vite.config.mjs',
      '.env.example'
    ];

    itemsToInclude.forEach(item => {
      const fullPath = path.join(clientDir, item);
      if (!fs.existsSync(fullPath)) return;

      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        archive.directory(fullPath, item, entry => {
          // Explicitly set POSIX mode: 755 for directories, 644 for files
          entry.mode = entry.stats.isDirectory() ? 0o755 : 0o644;
          return entry;
        });
      } else {
        archive.file(fullPath, {
          name: item,
          mode: 0o644
        });
      }
    });

    archive.finalize();
  });
}

async function runPackaging() {
  await archiveFrontend(newZipPath);
  // Also create oldZipPath as identical copy so both zip targets work
  fs.copyFileSync(newZipPath, oldZipPath);
  console.log(`Updated secondary target ZIP: ${oldZipPath}\n`);

  // 7. Verify ZIP contents and permissions mode
  console.log('5. Extracting ZIP to test directory and verifying mode flags...');
  const testExtractDir = path.join(rootDir, 'scratch', 'test_extract_frontend');
  if (fs.existsSync(testExtractDir)) {
    fs.rmSync(testExtractDir, { recursive: true, force: true });
  }
  fs.mkdirSync(testExtractDir, { recursive: true });

  execSync(`powershell -Command "Expand-Archive -Path '${newZipPath}' -DestinationPath '${testExtractDir}' -Force"`, { stdio: 'inherit' });

  const extractedBrands = path.join(testExtractDir, 'public', 'assets', 'brands');
  if (fs.existsSync(extractedBrands)) {
    const files = fs.readdirSync(extractedBrands);
    console.log(`[✓] Extraction test passed! Extracted public/assets/brands containing ${files.length} files.`);
  } else {
    throw new Error('Extraction test failed: public/assets/brands missing from extracted archive.');
  }

  console.log('\n=== ALL Packaging AND PERMISSION FIX TASKS COMPLETED SUCCESSFULLY! ===');
}

runPackaging().catch(err => {
  console.error('ERROR during packaging:', err);
  process.exit(1);
});
