const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const rootDir = path.resolve(__dirname, '../..');
const clientDir = path.join(rootDir, 'client');
const serverDir = path.join(rootDir, 'server');

const frontendZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-FRONTEND-HOSTINGER-FINAL.zip');
const backendZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-BACKEND-HOSTINGER-FINAL.zip');
const sourceZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-FINAL-SOURCE.zip');

console.log('=== BUILDING ALL PRODUCTION DEPLOYMENT ZIP ARCHIVES ===\n');

// 1. Build Client
console.log('1. Building frontend production dist bundle...');
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

if (!fs.existsSync(path.join(clientDir, 'dist'))) {
  throw new Error('Frontend build failed: client/dist not created.');
}
console.log('Frontend build successful!\n');

// 2. Build Backend Verification
console.log('2. Validating backend server directory...');
execSync('npm run build', { cwd: serverDir, stdio: 'inherit' });
console.log('Backend verification successful!\n');

// Helper function to create Zip using archiver with explicit POSIX permissions
function archiveDirectory(items, baseDir, targetZipPath, excludeFilter) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(targetZipPath)) fs.unlinkSync(targetZipPath);

    const output = fs.createWriteStream(targetZipPath);
    const archive = new archiver.ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => {
      const stats = fs.statSync(targetZipPath);
      console.log(`Created Archive: ${path.basename(targetZipPath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      resolve();
    });

    archive.on('error', err => reject(err));
    archive.pipe(output);

    items.forEach(item => {
      const fullPath = path.join(baseDir, item);
      if (!fs.existsSync(fullPath)) return;

      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        archive.directory(fullPath, item, entry => {
          if (excludeFilter && excludeFilter(entry.name)) return false;
          entry.mode = entry.stats.isDirectory() ? 0o755 : 0o644;
          return entry;
        });
      } else {
        if (excludeFilter && excludeFilter(item)) return;
        archive.file(fullPath, {
          name: item,
          mode: 0o644
        });
      }
    });

    archive.finalize();
  });
}

async function packageAll() {
  // A. Create FRONTEND HOSTINGER ZIP
  console.log('Packaging Frontend ZIP (RAJA-ELECTRICALS-FRONTEND-HOSTINGER-FINAL.zip)...');
  const frontendItems = [
    'dist',
    'public',
    'src',
    'index.html',
    'package.json',
    'vite.config.mjs',
    '.env.example'
  ];
  await archiveDirectory(frontendItems, clientDir, frontendZipPath);

  // B. Create BACKEND HOSTINGER ZIP
  console.log('\nPackaging Backend ZIP (RAJA-ELECTRICALS-BACKEND-HOSTINGER-FINAL.zip)...');
  const backendItems = [
    'server.js',
    'supabase.js',
    'package.json',
    'package-lock.json',
    '.env.example'
  ];
  await archiveDirectory(backendItems, serverDir, backendZipPath);

  // C. Create COMPLETE SOURCE ZIP
  console.log('\nPackaging Complete Source ZIP (RAJA-ELECTRICALS-FINAL-SOURCE.zip)...');
  const sourceItems = [
    'client',
    'server',
    'PROJECT_DOCUMENTATION.md',
    'README.md'
  ];
  const sourceExcludeFilter = (filePath) => {
    if (filePath.includes('node_modules')) return true;
    if (filePath.includes('.env') && !filePath.includes('.env.example')) return true;
    if (filePath.endsWith('.zip')) return true;
    if (filePath.includes('.git')) return true;
    return false;
  };
  await archiveDirectory(sourceItems, rootDir, sourceZipPath, sourceExcludeFilter);

  console.log('\n=== ALL 3 PRODUCTION ZIP DEPLOYMENT PACKAGES CREATED SUCCESSFULLY! ===');
}

packageAll().catch(err => {
  console.error('Fatal error during production ZIP packaging:', err);
  process.exit(1);
});
