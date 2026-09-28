const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '../..');
const frontendZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-FRONTEND-HOSTINGER-FINAL.zip');
const backendZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-BACKEND-HOSTINGER-FINAL.zip');
const sourceZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-FINAL-SOURCE.zip');

console.log('=== FINAL RELEASE VERIFICATION AUDIT ===\n');

// 1. Verify ZIP files exist and report sizes
const report = {
  frontendZip: { exists: fs.existsSync(frontendZipPath), size: 0 },
  backendZip: { exists: fs.existsSync(backendZipPath), size: 0 },
  sourceZip: { exists: fs.existsSync(sourceZipPath), size: 0 }
};

if (report.frontendZip.exists) report.frontendZip.size = (fs.statSync(frontendZipPath).size / 1024 / 1024).toFixed(2);
if (report.backendZip.exists) report.backendZip.size = (fs.statSync(backendZipPath).size / 1024).toFixed(2);
if (report.sourceZip.exists) report.sourceZip.size = (fs.statSync(sourceZipPath).size / 1024 / 1024).toFixed(2);

console.log('Zip Package Verification:');
console.log(`- Frontend ZIP: ${report.frontendZip.exists ? 'EXISTS' : 'MISSING'} (${report.frontendZip.size} MB)`);
console.log(`- Backend ZIP: ${report.backendZip.exists ? 'EXISTS' : 'MISSING'} (${report.backendZip.size} KB)`);
console.log(`- Source ZIP: ${report.sourceZip.exists ? 'EXISTS' : 'MISSING'} (${report.sourceZip.size} MB)\n`);

// 2. Perform Extraction & Deep Content Inspection of Frontend ZIP
console.log('--- FRONTEND PACKAGE AUDIT ---');
const testExtractFrontend = path.join(rootDir, 'scratch', 'release_audit_frontend');
if (fs.existsSync(testExtractFrontend)) fs.rmSync(testExtractFrontend, { recursive: true, force: true });
fs.mkdirSync(testExtractFrontend, { recursive: true });

execSync(`powershell -Command "Expand-Archive -Path '${frontendZipPath}' -DestinationPath '${testExtractFrontend}' -Force"`, { stdio: 'inherit' });

const feFiles = fs.readdirSync(testExtractFrontend);
console.log('Extracted Frontend Root Files:', feFiles.join(', '));

const hasDist = fs.existsSync(path.join(testExtractFrontend, 'dist'));
const hasBrands = fs.existsSync(path.join(testExtractFrontend, 'public', 'assets', 'brands'));
const hasEnvSecret = fs.existsSync(path.join(testExtractFrontend, '.env'));

console.log(`[✓] dist/ folder present: ${hasDist}`);
console.log(`[✓] public/assets/brands present: ${hasBrands}`);
console.log(`[✓] NO .env secret file: ${!hasEnvSecret}`);

// Inspect JS/JSON files in extracted frontend for old Supabase URL or Render URLs
let feOldUrlCount = 0;
let feRenderUrlCount = 0;

function scanFiles(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanFiles(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.html')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('yfbzapzceoqkwzsmsjmk')) feOldUrlCount++;
      if (content.includes('raj-ms.onrender.com')) feRenderUrlCount++;
    }
  });
}

scanFiles(testExtractFrontend);
console.log(`[✓] Old Supabase URL (yfbzapzceoqkwzsmsjmk) in Frontend Package: ${feOldUrlCount}`);
console.log(`[✓] Old Render URL (raj-ms.onrender.com) in Frontend Package: ${feRenderUrlCount}`);

// 3. Perform Extraction & Deep Content Inspection of Backend ZIP
console.log('\n--- BACKEND PACKAGE AUDIT ---');
const testExtractBackend = path.join(rootDir, 'scratch', 'release_audit_backend');
if (fs.existsSync(testExtractBackend)) fs.rmSync(testExtractBackend, { recursive: true, force: true });
fs.mkdirSync(testExtractBackend, { recursive: true });

execSync(`powershell -Command "Expand-Archive -Path '${backendZipPath}' -DestinationPath '${testExtractBackend}' -Force"`, { stdio: 'inherit' });

const beFiles = fs.readdirSync(testExtractBackend);
console.log('Extracted Backend Root Files:', beFiles.join(', '));

const hasServerJs = fs.existsSync(path.join(testExtractBackend, 'server.js'));
const hasSupabaseJs = fs.existsSync(path.join(testExtractBackend, 'supabase.js'));
const hasClientDep = fs.existsSync(path.join(testExtractBackend, 'client')) || fs.existsSync(path.join(testExtractBackend, '../client'));
const hasBeEnvSecret = fs.existsSync(path.join(testExtractBackend, '.env'));

console.log(`[✓] Express entry server.js present: ${hasServerJs}`);
console.log(`[✓] Supabase client supabase.js present: ${hasSupabaseJs}`);
console.log(`[✓] NO client/../client build dependency: ${!hasClientDep}`);
console.log(`[✓] NO .env secret file: ${!hasBeEnvSecret}`);

// Inspect backend server.js & supabase.js for new Supabase URL
const supabaseJsContent = fs.readFileSync(path.join(testExtractBackend, 'supabase.js'), 'utf8');
const serverJsContent = fs.readFileSync(path.join(testExtractBackend, 'server.js'), 'utf8');

const usesNewSupabaseEnv = supabaseJsContent.includes('process.env.SUPABASE_URL') && serverJsContent.includes('ueohqicjodxwkwdxcrnj');
const hasHealthCheck = serverJsContent.includes("app.get('/api/health'") && serverJsContent.includes("database: dbOk ? 'supabase' : 'disconnected'");

console.log(`[✓] Backend references NEW Supabase project configuration: ${usesNewSupabaseEnv}`);
console.log(`[✓] Backend /api/health endpoint tests Supabase database: ${hasHealthCheck}`);

// 4. Overall Runtime Code Old Supabase URL Audit
console.log('\n--- MASTER RUNTIME CODE SCAN FOR OLD SUPABASE (yfbzapzceoqkwzsmsjmk) ---');
let totalRuntimeOldUrls = 0;

function scanRuntimeFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('yfbzapzceoqkwzsmsjmk')) {
      console.warn(`FOUND OLD URL IN: ${filePath}`);
      totalRuntimeOldUrls++;
    }
  }
}

function scanRuntimeDir(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file.startsWith('.') || file.endsWith('.md') || file.endsWith('.json')) return;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanRuntimeDir(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html')) {
      scanRuntimeFile(filePath);
    }
  });
}

scanRuntimeDir(path.join(rootDir, 'client', 'src'));
scanRuntimeFile(path.join(rootDir, 'server', 'server.js'));
scanRuntimeFile(path.join(rootDir, 'server', 'supabase.js'));

console.log(`[✓] Total Runtime Old Supabase URL References Found: ${totalRuntimeOldUrls}`);

console.log('\n=== FINAL RELEASE AUDIT COMPLETE ===');
