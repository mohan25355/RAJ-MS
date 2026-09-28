const fs = require('fs');
const path = require('path');

const file1 = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\14b5616c-516a-4f7c-98cd-de8f845000e9\\media__1790581682262.jpg';
const file2 = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\14b5616c-516a-4f7c-98cd-de8f845000e9\\media__1790581686550.jpg';

const buf1 = fs.readFileSync(file1);
const buf2 = fs.readFileSync(file2);

console.log('File 1 size:', buf1.length);
console.log('File 2 size:', buf2.length);

// In the prompt, image 1 was Velora, image 2 was RK Innovations.
// Let's verify which buffer corresponds to which image if needed or copy them.
// media__1790581682262.jpg was uploaded first (Velora)
// media__1790581686550.jpg was uploaded second (RK Innovations)

const destDir = path.resolve('../client/public/assets/brands');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(file1, path.join(destDir, 'velora.jpg'));
fs.copyFileSync(file2, path.join(destDir, 'rk-innovations.jpg'));

console.log('Copied velora.jpg and rk-innovations.jpg successfully to client/public/assets/brands/');
