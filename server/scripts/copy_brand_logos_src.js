const fs = require('fs');
const path = require('path');

const src1 = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\14b5616c-516a-4f7c-98cd-de8f845000e9\\media__1790581682262.jpg';
const src2 = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\14b5616c-516a-4f7c-98cd-de8f845000e9\\media__1790581686550.jpg';

const destDirSrc = path.resolve('../client/src/assets/brands');
const destDirPublic = path.resolve('../client/public/assets/brands');

fs.copyFileSync(src1, path.join(destDirSrc, 'velora.jpg'));
fs.copyFileSync(src2, path.join(destDirSrc, 'rk-innovations.jpg'));

fs.copyFileSync(src1, path.join(destDirPublic, 'velora.jpg'));
fs.copyFileSync(src2, path.join(destDirPublic, 'rk-innovations.jpg'));

console.log('Copied velora.jpg and rk-innovations.jpg to client/src/assets/brands and client/public/assets/brands');
