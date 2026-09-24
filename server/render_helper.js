const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tempHtml = path.join(__dirname, 'temp_render.html');
const tempPng = path.join(__dirname, 'temp_render.png');

function renderSvgToPng(svgContent, outputPath) {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; width: 600px; height: 600px; display: flex; justify-content: center; align-items: center; background: radial-gradient(circle at 50% 45%, #ffffff 0%, #f1f3f6 100%); overflow: hidden; }
  svg { width: 520px; height: 520px; filter: drop-shadow(0px 15px 20px rgba(0,0,0,0.15)); }
</style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  fs.writeFileSync(tempHtml, htmlContent);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const cmd = `"${edgePath}" --headless --disable-gpu --hide-scrollbars --screenshot="${outputPath}" --window-size=600,600 "file:///${tempHtml.replace(/\\/g, '/')}"`;
  execSync(cmd, { stdio: 'ignore' });
  if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  return fs.existsSync(outputPath);
}

console.log('Renderer test module loaded.');
