const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

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

const managedCollectionsProducts = ['id', 'name', 'category', 'description', 'price', 'image'];

function rowForProduct(item) {
  const columns = Object.fromEntries(
    managedCollectionsProducts
      .filter(column => item[column] !== undefined && !(column === 'price' && typeof item.price !== 'number'))
      .map(column => [column, item[column]])
  );
  return { ...columns, data: item, updated_at: new Date().toISOString() };
}

async function run() {
  console.log('===================================================');
  console.log('STARTING SANITARYWARE PRODUCT IMAGE REPLACEMENT');
  console.log('===================================================');

  const sanDir = path.join(__dirname, '../../san');
  const files = fs.readdirSync(sanDir);

  const localImages = files.map(f => {
    const filePath = path.join(sanDir, f);
    const stat = fs.statSync(filePath);
    const ext = path.extname(f).toLowerCase();
    const dims = getJpgDimensions(filePath);
    const normName = path.basename(f, ext)
      .replace(/[\/\-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    const safeSlug = path.basename(f, ext)
      .replace(/[\/\-_]/g, ' ')
      .replace(/\s+/g, '-')
      .toLowerCase();

    return {
      filename: f,
      ext,
      sizeBytes: stat.size,
      dimensions: `${dims.width}x${dims.height}`,
      normName,
      safeSlug,
      filePath
    };
  });

  // Fetch Sanitaryware products from Supabase DB
  const { data: rows, error: selectErr } = await supabase.from('products').select('*');
  if (selectErr) {
    console.error('Error selecting products:', selectErr);
    process.exit(1);
  }

  const allProducts = rows.map(recordFromRow);
  const sanitaryProducts = allProducts.filter(p => p.category && p.category.trim().toLowerCase() === 'sanitaryware');

  console.log(`Fetched ${sanitaryProducts.length} Sanitaryware products from DB.`);

  // Prepare backup data & match map
  const backupRecords = [];
  const mappings = [];

  // Copy destination in client/public/assets/sanitaryware
  const clientPublicSan = path.join(__dirname, '../../client/public/assets/sanitaryware');
  if (!fs.existsSync(clientPublicSan)) {
    fs.mkdirSync(clientPublicSan, { recursive: true });
  }

  for (const prod of sanitaryProducts) {
    const pNorm = prod.name
      .replace(/[\/\-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    const matchedImg = localImages.find(img => img.normName === pNorm);

    if (!matchedImg) {
      console.error(`ERROR: No matched image found for product "${prod.name}" (ID: ${prod.id})`);
      mappings.push({
        product: prod,
        image: null,
        status: 'UNMATCHED'
      });
      continue;
    }

    // 1. Copy local file to client/public/assets/sanitaryware/<safeSlug>.jpg
    const safeAssetPath = path.join(clientPublicSan, `${matchedImg.safeSlug}.jpg`);
    fs.copyFileSync(matchedImg.filePath, safeAssetPath);

    // 2. Upload to Supabase Storage RAJA_ELE bucket under products/sanitaryware_<safeSlug>_v3.jpg
    const buffer = fs.readFileSync(matchedImg.filePath);
    const storagePath = `products/sanitaryware_${matchedImg.safeSlug}_v3.jpg`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('RAJA_ELE')
      .upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: true });

    if (uploadErr) {
      console.error(`Failed to upload ${storagePath} to Supabase Storage:`, uploadErr.message);
      process.exit(1);
    }

    const { data: urlData } = supabase.storage.from('RAJA_ELE').getPublicUrl(storagePath);
    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      console.error(`Failed to get public URL for ${storagePath}`);
      process.exit(1);
    }

    backupRecords.push({
      productId: prod.id,
      productName: prod.name,
      oldImage: prod.image,
      newImage: publicUrl
    });

    mappings.push({
      product: prod,
      image: matchedImg,
      newUrl: publicUrl,
      status: 'UPDATED'
    });
  }

  // Write SANITARYWARE_IMAGE_BACKUP.json at workspace root
  const backupPath = path.join(__dirname, '../../SANITARYWARE_IMAGE_BACKUP.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupRecords, null, 2), 'utf8');
  console.log(`Saved SANITARYWARE_IMAGE_BACKUP.json with ${backupRecords.length} records.`);

  // Update Database records in Supabase DB
  let updatedCount = 0;
  for (const item of mappings) {
    if (item.status !== 'UPDATED') continue;

    const updatedProduct = {
      ...item.product,
      image: item.newUrl
    };

    const rowPayload = rowForProduct(updatedProduct);

    const { error: updateErr } = await supabase
      .from('products')
      .update(rowPayload)
      .eq('id', item.product.id);

    if (updateErr) {
      console.error(`Failed to update DB for product ID ${item.product.id}:`, updateErr.message);
    } else {
      updatedCount++;
      console.log(`[UPDATED DB] Product "${item.product.name}" -> ${item.newUrl}`);
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} DB product records in Supabase.`);
}

run();
