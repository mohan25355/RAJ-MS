const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '../..');
const clientDir = path.join(rootDir, 'client');
const serverDir = path.join(rootDir, 'server');

const frontendZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-FRONTEND-HOSTINGER.zip');
const backendZipPath = path.join(rootDir, 'RAJA-ELECTRICALS-BACKEND-HOSTINGER.zip');

console.log('=== PREPARING HOSTINGER PRODUCTION ZIP DEPLOYMENTS ===\n');

// 1. Build Client First
console.log('1. Executing client production build...');
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });
console.log('Client build successful!\n');

// Delete old zips if exist
if (fs.existsSync(frontendZipPath)) fs.unlinkSync(frontendZipPath);
if (fs.existsSync(backendZipPath)) fs.unlinkSync(backendZipPath);

// 2. Package Frontend ZIP via PowerShell
console.log('2. Creating RAJA-ELECTRICALS-FRONTEND-HOSTINGER.zip...');

const frontendFilesToInclude = [
  'dist',
  'public',
  'src',
  'index.html',
  'package.json',
  'vite.config.mjs',
  '.env.example'
].filter(f => fs.existsSync(path.join(clientDir, f)));

const psFrontendCmd = `Compress-Archive -Path ${frontendFilesToInclude.map(f => `'${path.join(clientDir, f)}'`).join(',')} -DestinationPath '${frontendZipPath}' -Force`;
execSync(`powershell -Command "${psFrontendCmd}"`, { stdio: 'inherit' });

console.log(`Frontend ZIP created: ${frontendZipPath} (${(fs.statSync(frontendZipPath).size / 1024 / 1024).toFixed(2)} MB)\n`);

// 3. Package Backend ZIP via PowerShell
console.log('3. Creating RAJA-ELECTRICALS-BACKEND-HOSTINGER.zip...');

const backendFilesToInclude = [
  'server.js',
  'supabase.js',
  'package.json',
  'package-lock.json',
  '.env.example'
].filter(f => fs.existsSync(path.join(serverDir, f)));

const psBackendCmd = `Compress-Archive -Path ${backendFilesToInclude.map(f => `'${path.join(serverDir, f)}'`).join(',')} -DestinationPath '${backendZipPath}' -Force`;
execSync(`powershell -Command "${psBackendCmd}"`, { stdio: 'inherit' });

console.log(`Backend ZIP created: ${backendZipPath} (${(fs.statSync(backendZipPath).size / 1024).toFixed(2)} KB)\n`);

console.log('=== ZIP CREATION COMPLETE ===');
