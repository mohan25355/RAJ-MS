const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

// Helper to get JPG dimensions from binary header
function getJpgDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  let offset = 2;
  while (offset < buffer.length) {
    const marker = buffer.readUInt16BE(offset);
    offset += 2;
    if (marker === 0xFFC0 || marker === 0xFFC1 || marker === 0xFFC2) {
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return { width, height };
    }
    const length = buffer.readUInt16BE(offset);
    offset += length;
  }
  return { width: 0, height: 0 };
}

function recordFromRow(row) {
  if (!row) return row;
  const { data, ...columns } = row;
  return { ...columns, ...(data && typeof data === 'object' ? data : {}) };
}

async function inspect() {
  const sanDir = path.join(__dirname, '../../san');
  const files = fs.readdirSync(sanDir);
  console.log('===================================================');
  console.log('1. SANITARYWARE LOCAL IMAGE INVENTORY');
  console.log('===================================================');
  const localImages = [];
  for (const f of files) {
    const filePath = path.join(sanDir, f);
    const stat = fs.statSync(filePath);
    const ext = path.extname(f).toLowerCase();
    const dims = getJpgDimensions(filePath);
    const normName = path.basename(f, ext).replace(/\s+/g, ' ').trim().toLowerCase();
    localImages.push({
      filename: f,
      ext,
      sizeBytes: stat.size,
      sizeKB: (stat.size / 1024).toFixed(2) + ' KB',
      width: dims.width,
      height: dims.height,
      dimensions: `${dims.width}x${dims.height}`,
      normName,
      filePath
    });
    console.log(`- ${f} | ${ext} | ${dims.width}x${dims.height} | ${(stat.size/1024).toFixed(2)} KB | norm: "${normName}"`);
  }

  console.log('\n===================================================');
  console.log('2. EXISTING SANITARYWARE PRODUCTS IN SUPABASE DB');
  console.log('===================================================');
  const { data: rows, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  const allProducts = rows.map(recordFromRow);
  const sanitaryProducts = allProducts.filter(p =>
    p.category && p.category.trim().toLowerCase() === 'sanitaryware'
  );

  console.log(`Found ${sanitaryProducts.length} total Sanitaryware products in DB:`);
  sanitaryProducts.forEach((p, index) => {
    console.log(`${index + 1}. ID: "${p.id}" | Name: "${p.name}" | Current Image: "${p.image?.slice(0, 80)}..."`);
  });

  console.log('\n===================================================');
  console.log('3. MATCHING LOGIC EVALUATION');
  console.log('===================================================');
  const matched = [];
  const unmatchedProducts = [];

  for (const prod of sanitaryProducts) {
    const pNorm = prod.name.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    const matchingImages = localImages.filter(img => {
      const iNorm = img.normName.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      return iNorm === pNorm || iNorm.includes(pNorm) || pNorm.includes(iNorm);
    });

    if (matchingImages.length === 1) {
      const img = matchingImages[0];
      matched.push({ product: prod, image: img });
      console.log(`[MATCH] "${prod.name}" (ID: ${prod.id}) <---> "${img.filename}"`);
    } else if (matchingImages.length === 0) {
      unmatchedProducts.push(prod);
      console.log(`[UNMATCHED PRODUCT] "${prod.name}" (ID: ${prod.id}) - No image matched`);
    } else {
      console.log(`[AMBIGUOUS MATCH] "${prod.name}" matched multiple: ${matchingImages.map(i => i.filename).join(', ')}`);
    }
  }

  console.log(`\nMatched: ${matched.length}/${sanitaryProducts.length}`);
  console.log(`Unmatched Products: ${unmatchedProducts.length}`);
}

inspect();
