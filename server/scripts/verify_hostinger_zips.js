const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '../..');
const frontendZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-FRONTEND-HOSTINGER.zip');
const backendZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-BACKEND-HOSTINGER.zip');

console.log('=== VERIFYING HOSTINGER ZIP PACKAGES ===\n');

console.log('1. Inspecting FRONTEND ZIP...');
const feList = execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${frontendZipPath}').Entries.FullName"`, { encoding: 'utf8' });
const feFiles = feList.split('\n').map(s => s.trim().replace(/\\/g, '/')).filter(Boolean);

console.log(`Total items in Frontend ZIP: ${feFiles.length}`);
console.log('Contains node_modules?:', feFiles.some(f => f.includes('node_modules')));
console.log('Contains secret .env files?:', feFiles.some(f => f === '.env' || f.endsWith('/.env') || f === '.env.local' || f === '.env.production'));
console.log('Contains dist/index.html?:', feFiles.includes('dist/index.html'));
console.log('Contains root index.html?:', feFiles.includes('index.html'));
console.log('Contains gallery assets?:', feFiles.some(f => f.includes('gallery-01')));
console.log('Contains brand logos?:', feFiles.some(f => f.includes('velora')));

console.log('\n2. Inspecting BACKEND ZIP...');
const beList = execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${backendZipPath}').Entries.FullName"`, { encoding: 'utf8' });
const beFiles = beList.split('\n').map(s => s.trim().replace(/\\/g, '/')).filter(Boolean);

console.log(`Total items in Backend ZIP: ${beFiles.length}`);
beFiles.forEach(f => console.log(` - ${f}`));
console.log('Contains node_modules?:', beFiles.some(f => f.includes('node_modules')));
console.log('Contains secret .env files?:', beFiles.some(f => f === '.env' || f.endsWith('/.env')));
console.log('Contains migration scripts?:', beFiles.some(f => f.includes('scripts')));
console.log('Contains server.js?:', beFiles.includes('server.js'));
console.log('Contains supabase.js?:', beFiles.includes('supabase.js'));

