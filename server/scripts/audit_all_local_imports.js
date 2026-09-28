const fs = require('fs');
const path = require('path');

const clientSrc = path.join(__dirname, '../../client/src');

function getAllFiles(dir, exts = ['.js', '.jsx', '.css']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, exts));
    } else {
      if (exts.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const allSrcFiles = getAllFiles(clientSrc);
console.log(`Found ${allSrcFiles.length} source files to audit.`);

let issues = [];

allSrcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relFile = path.relative(clientSrc, file);

  lines.forEach((line, idx) => {
    // Match import ... from '...' or url('...')
    const importMatch = line.match(/import\s+.*?from\s+['"](\..*?)['"]/);
    const cssUrlMatch = line.match(/url\(['"]?(\..*?)['"]?\)/);

    const refPath = importMatch ? importMatch[1] : (cssUrlMatch ? cssUrlMatch[1] : null);

    if (refPath && (refPath.includes('assets/') || refPath.endsWith('.jpg') || refPath.endsWith('.jpeg') || refPath.endsWith('.png') || refPath.endsWith('.webp') || refPath.endsWith('.svg'))) {
      const absoluteResolved = path.resolve(path.dirname(file), refPath);
      if (!fs.existsSync(absoluteResolved)) {
        issues.push({
          file: relFile,
          line: idx + 1,
          refPath,
          absoluteResolved
        });
      }
    }
  });
});

console.log('\n=== AUDIT RESULTS FOR LOCAL ASSET IMPORTS ===');
if (issues.length === 0) {
  console.log('PASS: All static asset imports in client/src resolve to real files on disk!');
} else {
  console.log(`FOUND ${issues.length} UNRESOLVED IMPORTS:`);
  issues.forEach(issue => {
    console.log(` - File: ${issue.file}:${issue.line}`);
    console.log(`   Import: ${issue.refPath}`);
    console.log(`   Resolved Path: ${issue.absoluteResolved}`);
  });
}
