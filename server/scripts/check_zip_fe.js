const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '../..');
const zipPath = path.join(rootDir, 'RAJA-ELECTRICALS-FRONTEND-HOSTINGER.zip');
const simDir = path.join('C:', 'Users', 'HP', '.gemini', 'antigravity-ide', 'brain', '14b5616c-516a-4f7c-98cd-de8f845000e9', 'scratch', 'fe_sim');

if (fs.existsSync(simDir)) {
  fs.rmSync(simDir, { recursive: true, force: true });
}
fs.mkdirSync(simDir, { recursive: true });

console.log('Extracting ZIP to simulation folder...');
execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${simDir}' -Force"`, { stdio: 'inherit' });

const targetDir = path.join(simDir, 'src', 'assets', 'product image', 'Head Protection');
console.log('Target dir exists?:', fs.existsSync(targetDir));
if (fs.existsSync(targetDir)) {
  console.log('Files in Head Protection:');
  fs.readdirSync(targetDir).forEach(f => console.log(' -', f));
} else {
  console.log('Checking src/assets dirs:');
  const srcAssets = path.join(simDir, 'src', 'assets');
  if (fs.existsSync(srcAssets)) {
    console.log(fs.readdirSync(srcAssets));
  } else {
    console.log('src/assets does not exist in ZIP output!');
  }
}
