const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '../..');
const serverDir = path.join(rootDir, 'server');
const zipPath = path.join(rootDir, 'RAJA-ELECTRICALS-BACKEND-HOSTINGER-FINAL.zip');

console.log('=== BUILDING RAJA-ELECTRICALS-BACKEND-HOSTINGER-FINAL.ZIP ===\n');

// 1. Ensure any existing ZIP is removed
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
  console.log('Removed old RAJA-ELECTRICALS-BACKEND-HOSTINGER-FINAL.zip');
}

// 2. Define files to package
const filesToPackage = [
  'server.js',
  'supabase.js',
  'package.json',
  'package-lock.json',
  '.env.example'
];

// Verify all required files exist
filesToPackage.forEach(file => {
  const fullPath = path.join(serverDir, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Required backend file missing: ${file}`);
  }
});

// 3. Package ZIP using PowerShell Compress-Archive
console.log('Packaging backend files into ZIP...');
const psPaths = filesToPackage.map(f => `'${path.join(serverDir, f)}'`).join(',');
const psCmd = `Compress-Archive -Path ${psPaths} -DestinationPath '${zipPath}' -Force`;

execSync(`powershell -Command "${psCmd}"`, { stdio: 'inherit' });

const stats = fs.statSync(zipPath);
console.log(`\nZIP Created successfully at: ${zipPath}`);
console.log(`ZIP File Size: ${(stats.size / 1024).toFixed(2)} KB\n`);

// 4. Perform Clean Extraction Test
console.log('=== PERFORMING CLEAN EXTRACTION TEST ===\n');

const scratchDir = path.join(rootDir, 'scratch', 'extraction_test_backend');
if (fs.existsSync(scratchDir)) {
  fs.rmSync(scratchDir, { recursive: true, force: true });
}
fs.mkdirSync(scratchDir, { recursive: true });

console.log(`Extracting ZIP into temporary directory: ${scratchDir}`);
const expandCmd = `Expand-Archive -Path '${zipPath}' -DestinationPath '${scratchDir}' -Force`;
execSync(`powershell -Command "${expandCmd}"`, { stdio: 'inherit' });

console.log('\nExtracted File Hierarchy:');
const extractedFiles = fs.readdirSync(scratchDir);
extractedFiles.forEach(file => console.log(` - ${file}`));

// Verification Checks
console.log('\n--- VERIFICATION CHECKS ---');
const hasPackageJson = fs.existsSync(path.join(scratchDir, 'package.json'));
const hasServerJs = fs.existsSync(path.join(scratchDir, 'server.js'));
const hasSupabaseJs = fs.existsSync(path.join(scratchDir, 'supabase.js'));
const hasEnvFile = fs.existsSync(path.join(scratchDir, '.env'));
const hasNodeModules = fs.existsSync(path.join(scratchDir, 'node_modules'));
const hasClientDir = fs.existsSync(path.join(scratchDir, 'client')) || fs.existsSync(path.join(scratchDir, '../client'));

console.log(`[✓] package.json at root: ${hasPackageJson}`);
console.log(`[✓] Express entry server.js at root: ${hasServerJs}`);
console.log(`[✓] supabase.js included: ${hasSupabaseJs}`);
console.log(`[✓] NO .env included: ${!hasEnvFile}`);
console.log(`[✓] NO node_modules included: ${!hasNodeModules}`);
console.log(`[✓] NO frontend/client directory: ${!hasClientDir}`);

if (!hasPackageJson || !hasServerJs || !hasSupabaseJs || hasEnvFile || hasNodeModules || hasClientDir) {
  console.error('\n[X] EXTRACTION TEST FAILED VALIDATION CHECKS!');
  process.exit(1);
}

// 5. Test npm install inside extracted dir
console.log('\nRunning npm install inside extracted test directory...');
execSync('npm install --no-audit --no-fund', { cwd: scratchDir, stdio: 'inherit' });
console.log('npm install completed successfully in extracted directory!');

// 6. Test npm run build inside extracted dir
console.log('\nRunning npm run build inside extracted test directory...');
const buildOut = execSync('npm run build', { cwd: scratchDir, encoding: 'utf8' });
console.log('npm run build output:', buildOut.trim());

console.log('\nTesting server startup on process.env.PORT=10008 inside extracted test directory...');
const testScript = `
const { fork } = require('child_process');
const http = require('http');

const env = Object.assign({}, process.env, {
  PORT: '10008',
  SUPABASE_URL: 'https://ueohqicjodxwkwdxcrnj.supabase.co',
  SUPABASE_SECRET_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlb2hxaWNqb2R4d2t3ZHhjcm5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.mock_signature'
});

const child = fork('server.js', [], { cwd: process.cwd(), env, silent: false });

let attempts = 0;
const checkHealth = () => {
  attempts++;
  http.get('http://127.0.0.1:10008/api/health', (res) => {
    let body = '';
    res.on('data', chunk => { body += chunk; });
    res.on('end', () => {
      console.log('HTTP GET /api/health Status:', res.statusCode);
      console.log('HTTP GET /api/health Response:', body);
      child.kill();
      if (res.statusCode === 200) {
        console.log('\\nSUCCESS: Express server extracted, installed, built, and verified running cleanly!');
        process.exit(0);
      } else {
        console.error('FAILED: /api/health returned non-200 status');
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    if (attempts < 10) {
      setTimeout(checkHealth, 500);
    } else {
      console.error('FAILED to connect to backend /api/health after 10 attempts:', err.message);
      child.kill();
      process.exit(1);
    }
  });
};

setTimeout(checkHealth, 1500);
`;

execSync(`node -e "${testScript.replace(/\n/g, ' ')}"`, { cwd: scratchDir, stdio: 'inherit' });

console.log('\n=== ALL Packaging AND EXTRACTION VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
