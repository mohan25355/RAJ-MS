const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function downloadBytes(url) {
  return new Promise((resolve, reject) => {
    const getter = url.startsWith('https:') ? https : http;
    getter.get(url, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function recordFromRow(r) {
  if (!r) return r;
  const { data, ...cols } = r;
  return { ...cols, ...(data && typeof data === 'object' ? data : {}) };
}

const managedCollectionsProducts = ['id', 'name', 'category', 'description', 'price', 'image'];

function rowForProduct(item) {
  const now = new Date().toISOString();
  const updatedItem = { ...item, updated_at: now, updatedAt: now };
  const columns = Object.fromEntries(
    managedCollectionsProducts
      .filter(column => updatedItem[column] !== undefined && !(column === 'price' && typeof updatedItem.price !== 'number'))
      .map(column => [column, updatedItem[column]])
  );
  return { ...columns, data: updatedItem, updated_at: now };
}

const UPLOADED_MAP = {
  'Cable Tie': {
    sourcePath: 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\b4893283-3f94-4382-b9f8-005bcb5bfb99\\media__1790623451657.jpg',
    localAsset: 'cable-tie.jpg',
    storageKey: 'products/electricals_cable-tie.jpg'
  },
  'PVC Conduit Pipe': {
    sourcePath: 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\b4893283-3f94-4382-b9f8-005bcb5bfb99\\media__1790623451659.jpg',
    localAsset: 'pvc-conduit-pipe.jpg',
    storageKey: 'products/electricals_pvc-conduit-pipe.jpg'
  }
};

async function main() {
  console.log('===========================================================');
  console.log('REPLACING PRODUCT IMAGES FOR CABLE TIE & PVC CONDUIT PIPE');
  console.log('===========================================================');

  const clientPublicDir = path.join(__dirname, '../../client/public/assets/electricals');
  if (!fs.existsSync(clientPublicDir)) {
    fs.mkdirSync(clientPublicDir, { recursive: true });
  }

  // 1. Fetch DB records
  const { data: rows, error: selectErr } = await supabase.from('products').select('*');
  if (selectErr) {
    console.error('Error selecting products:', selectErr);
    process.exit(1);
  }

  const allProducts = rows.map(recordFromRow);
  const targetProducts = allProducts.filter(p => p.name === 'Cable Tie' || p.name === 'PVC Conduit Pipe');

  console.log(`Found ${targetProducts.length} target products in DB:`);
  targetProducts.forEach(p => console.log(`  - ID: ${p.id} | Name: ${p.name} | Old Image: ${p.image}`));

  if (targetProducts.length !== 2) {
    console.error('Did not find exactly 2 target products in DB!');
    process.exit(1);
  }

  // 2. Backup complete product records to TWO_PRODUCT_IMAGE_BACKUP.json
  const backupPath = path.join(__dirname, '../../TWO_PRODUCT_IMAGE_BACKUP.json');
  fs.writeFileSync(backupPath, JSON.stringify(targetProducts, null, 2));
  console.log(`Saved backup to ${backupPath}`);

  const verificationReport = [];

  for (const prod of targetProducts) {
    const info = UPLOADED_MAP[prod.name];
    if (!info) {
      console.error(`No uploaded mapping info for ${prod.name}`);
      continue;
    }

    const srcBuffer = fs.readFileSync(info.sourcePath);
    const sourceHash = sha256(srcBuffer);
    console.log(`\nProcessing ${prod.name}:`);
    console.log(`  Source File: ${info.sourcePath}`);
    console.log(`  Source Size: ${srcBuffer.length} bytes`);
    console.log(`  Source Hash: ${sourceHash}`);

    // Copy to client/public/assets/electricals/
    const localAssetPath = path.join(clientPublicDir, info.localAsset);
    fs.copyFileSync(info.sourcePath, localAssetPath);
    console.log(`  Copied to local asset: ${localAssetPath}`);

    // Upload to Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from('RAJA_ELE')
      .upload(info.storageKey, srcBuffer, { contentType: 'image/jpeg', upsert: true });

    if (uploadErr) {
      console.error(`  Upload error for ${prod.name}:`, uploadErr.message);
      process.exit(1);
    }

    const { data: urlData } = supabase.storage.from('RAJA_ELE').getPublicUrl(info.storageKey);
    const publicUrl = urlData?.publicUrl;
    console.log(`  Public Storage URL: ${publicUrl}`);

    // Verify downloaded byte hash match
    const downloadedBuffer = await downloadBytes(publicUrl);
    const uploadedHash = sha256(downloadedBuffer);
    console.log(`  Downloaded Hash:    ${uploadedHash}`);
    const hashMatch = sourceHash === uploadedHash ? 'YES' : 'NO';
    console.log(`  Hash Match:         ${hashMatch}`);

    if (hashMatch !== 'YES') {
      console.error(`CRITICAL HASH MISMATCH FOR ${prod.name}! Stopping process.`);
      process.exit(1);
    }

    // Update DB record
    const nowIso = new Date().toISOString();
    const updatedProd = {
      ...prod,
      image: publicUrl,
      updated_at: nowIso,
      updatedAt: nowIso
    };

    const rowPayload = rowForProduct(updatedProd);
    const { error: updateErr } = await supabase.from('products').update(rowPayload).eq('id', prod.id);

    if (updateErr) {
      console.error(`  DB Update error for ${prod.name}:`, updateErr.message);
      process.exit(1);
    }

    console.log(`  DB Updated successfully!`);

    verificationReport.push({
      productName: prod.name,
      productId: prod.id,
      uploadedSource: info.sourcePath,
      supabaseObject: info.storageKey,
      publicUrl,
      sourceHash,
      uploadedHash,
      hashMatch: 'YES',
      oldImage: prod.image,
      newImage: publicUrl
    });
  }

  // Write temporary JSON for reporting
  fs.writeFileSync(path.join(__dirname, '../two_products_verification.json'), JSON.stringify(verificationReport, null, 2));
  console.log('\nTwo products update complete!');
}

main();
