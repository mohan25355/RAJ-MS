const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const https = require('https');

const destUrl = process.env.DESTINATION_SUPABASE_URL;
const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

if (!destUrl || !destKey) {
  console.error('ERROR: Missing DESTINATION_SUPABASE_URL or DESTINATION_SUPABASE_SERVICE_KEY in server/.env');
  process.exit(1);
}

const supabase = createClient(destUrl, destKey);
const BUCKET = 'RAJA_ELE';

const CATEGORY_MAP = [
  {
    catName: 'Nippon Paint',
    folder: 'nippon',
    count: 7
  },
  {
    catName: 'Kansai Nerolac',
    folder: 'nerolac',
    count: 6
  },
  {
    catName: 'Birla Opus',
    folder: 'opus',
    count: 5
  },
  {
    catName: 'Vapocure Paints',
    folder: 'vapocure',
    count: 5
  }
];

function checkUrlHttp200(urlStr) {
  return new Promise((resolve) => {
    const reqModule = urlStr.startsWith('https') ? https : http;
    const req = reqModule.request(urlStr, { method: 'HEAD' }, (res) => {
      const is200 = res.statusCode === 200;
      const contentLength = parseInt(res.headers['content-length'] || '0', 10);
      const contentType = res.headers['content-type'] || '';
      resolve({
        ok: is200 && contentLength > 0,
        statusCode: res.statusCode,
        contentLength,
        contentType
      });
    });
    req.on('error', (err) => {
      resolve({ ok: false, statusCode: 0, error: err.message });
    });
    req.end();
  });
}

async function runMigration() {
  console.log('===========================================================');
  console.log('  STARTING SAFE PAINT IMAGE MIGRATION TO NEW SUPABASE STORAGE');
  console.log('===========================================================\n');

  // 1. Fetch all products from destination DB
  const { data: allProducts, error: fetchErr } = await supabase.from('products').select('*');
  if (fetchErr) {
    console.error('Error fetching products:', fetchErr.message);
    process.exit(1);
  }

  const uploadedHashes = new Map(); // sha256 -> publicUrl
  const migrationResults = {
    totalProductsFound: 0,
    imagesFound: 23,
    imagesMatched: 0,
    imagesUploaded: 0,
    productsUpdated: 0,
    productsSkipped: 0,
    unmatchedImages: 0,
    failedUploads: 0,
    failedDbUpdates: 0,
    details: []
  };

  for (const catInfo of CATEGORY_MAP) {
    console.log(`\n-----------------------------------------------------------`);
    console.log(` Processing Category: "${catInfo.catName}" (${catInfo.folder})`);
    console.log(`-----------------------------------------------------------`);

    // Match products for this category
    const catProducts = allProducts.filter(p => {
      const cat = String(p.category || '').trim().toLowerCase();
      const dataCat = String(p.data?.category || '').trim().toLowerCase();
      const target = catInfo.catName.toLowerCase();
      return cat === target || dataCat === target;
    }).sort((a, b) => String(a.id).localeCompare(String(b.id)));

    console.log(`Found ${catProducts.length} matching products in DB (Expected ${catInfo.count}).`);
    migrationResults.totalProductsFound += catProducts.length;

    if (catProducts.length === 0) {
      console.log(`CATEGORY HAS NO EXISTING PRODUCTS. Skipping.`);
      continue;
    }

    for (let i = 0; i < catProducts.length; i++) {
      const product = catProducts[i];
      const fileNum = i + 1;
      const localFileName = `${fileNum}.jpg`;
      const localFilePath = path.resolve(__dirname, `../../paint/${catInfo.folder}/${localFileName}`);

      console.log(`\n [Product ${i + 1}/${catProducts.length}]`);
      console.log(`  Product ID  : ${product.id}`);
      console.log(`  Product Name: "${product.name}"`);
      console.log(`  Local File  : paint/${catInfo.folder}/${localFileName}`);

      if (!fs.existsSync(localFilePath)) {
        console.error(`  ERROR: Local file does not exist: ${localFilePath}`);
        migrationResults.unmatchedImages++;
        migrationResults.productsSkipped++;
        continue;
      }

      migrationResults.imagesMatched++;

      // Read & hash file
      const fileBuffer = fs.readFileSync(localFilePath);
      const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      const hashShort = sha256.substring(0, 10);
      const ext = path.extname(localFileName).toLowerCase() || '.jpg';
      const storagePath = `products/paint_${catInfo.folder}_${fileNum}_${hashShort}${ext}`;
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

      let publicUrl = '';

      // Check if already uploaded (deduplication)
      if (uploadedHashes.has(sha256)) {
        publicUrl = uploadedHashes.get(sha256);
        console.log(`  - SHA-256 match found! Reusing Storage object: ${publicUrl}`);
      } else {
        console.log(`  - Uploading to Storage: ${BUCKET}/${storagePath}...`);
        const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });

        if (uploadErr) {
          console.error(`  - UPLOAD FAILED: ${uploadErr.message}`);
          migrationResults.failedUploads++;
          migrationResults.productsSkipped++;
          continue;
        }

        publicUrl = `${destUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`;
        uploadedHashes.set(sha256, publicUrl);
        migrationResults.imagesUploaded++;
        console.log(`  - Upload successful! Public URL: ${publicUrl}`);
      }

      // Verify HTTP 200 access
      console.log(`  - Verifying HTTP 200 public URL access...`);
      const httpCheck = await checkUrlHttp200(publicUrl);
      if (!httpCheck.ok) {
        console.error(`  - HTTP VERIFICATION FAILED: status=${httpCheck.statusCode}, len=${httpCheck.contentLength}`);
        migrationResults.failedUploads++;
        migrationResults.productsSkipped++;
        continue;
      }
      console.log(`  - HTTP VERIFIED 200 OK! (Content-Length: ${httpCheck.contentLength}, Content-Type: ${httpCheck.contentType})`);

      // Prepare targeted product update
      const updatedDataPayload = {
        ...(product.data || {}),
        image: publicUrl
      };

      console.log(`  - Updating DB product record ID: ${product.id}...`);
      const { data: updatedProduct, error: updateErr } = await supabase
        .from('products')
        .update({
          image: publicUrl,
          data: updatedDataPayload,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)
        .select('*')
        .single();

      if (updateErr) {
        console.error(`  - DB UPDATE FAILED: ${updateErr.message}`);
        migrationResults.failedDbUpdates++;
        migrationResults.productsSkipped++;
        continue;
      }

      // Re-read product record to verify URL
      const { data: verifyRow, error: reReadErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .single();

      if (reReadErr || verifyRow.image !== publicUrl || verifyRow.data?.image !== publicUrl) {
        console.error(`  - RE-READ VERIFICATION FAILED for ID: ${product.id}`);
        migrationResults.failedDbUpdates++;
        migrationResults.productsSkipped++;
        continue;
      }

      console.log(`  - SUCCESS: Product updated & verified cleanly!`);
      migrationResults.productsUpdated++;
      migrationResults.details.push({
        id: product.id,
        name: product.name,
        category: product.category,
        localFile: `paint/${catInfo.folder}/${localFileName}`,
        newUrl: publicUrl,
        verified200: true
      });
    }
  }

  // Verification pass for all target products
  console.log('\n===========================================================');
  console.log('  FINAL POST-MIGRATION SYSTEM AUDIT');
  console.log('===========================================================');

  const { data: finalProducts } = await supabase.from('products').select('*');
  const targetFinalProducts = finalProducts.filter(p => {
    const cat = String(p.category || '').trim().toLowerCase();
    const dataCat = String(p.data?.category || '').trim().toLowerCase();
    return CATEGORY_MAP.some(c => c.catName.toLowerCase() === cat || c.catName.toLowerCase() === dataCat);
  });

  let oldUrlCount = 0;
  let newUrlCount = 0;
  let http200Count = 0;

  for (const p of targetFinalProducts) {
    const img = p.image || '';
    if (img.includes('yfbzapzceoqkwzsmsjmk')) {
      oldUrlCount++;
    }
    if (img.includes('ueohqicjodxwkwdxcrnj')) {
      newUrlCount++;
      const check = await checkUrlHttp200(img);
      if (check.ok) http200Count++;
    }
  }

  console.log(`Target Paint Products Audited : ${targetFinalProducts.length}`);
  console.log(`Old Supabase URLs Remaining   : ${oldUrlCount}`);
  console.log(`New Supabase Storage URLs    : ${newUrlCount}`);
  console.log(`HTTP 200 Verified Images      : ${http200Count}`);

  // Write report JSON for markdown generator
  fs.writeFileSync(
    path.resolve(__dirname, 'paint_migration_summary.json'),
    JSON.stringify({
      migrationResults,
      postAudit: {
        totalTargetProducts: targetFinalProducts.length,
        oldUrlCount,
        newUrlCount,
        http200Count
      }
    }, null, 2),
    'utf8'
  );

  console.log('\nMigration complete! Saved summary to paint_migration_summary.json.');
}

runMigration().catch(err => {
  console.error('Migration Fatal Error:', err);
  process.exit(1);
});
