const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function prepareStorageMigration() {
  console.log('=== SECTION F: VERIFY DESTINATION DATABASE RECORD COUNTS ===');

  const destUrl = process.env.DESTINATION_SUPABASE_URL;
  const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

  if (!destUrl || !destKey) {
    console.error('ERROR: Missing DESTINATION_SUPABASE_URL or DESTINATION_SUPABASE_SERVICE_KEY in server/.env');
    process.exit(1);
  }

  const destClient = createClient(destUrl, destKey);

  const expectedCounts = {
    products: 189,
    brands: 51,
    categories: 30,
    gallery: 7,
    admins: 2,
    site_settings: 1
  };

  let totalCount = 0;
  const actualCounts = {};

  for (const [table, expected] of Object.entries(expectedCounts)) {
    const { count, error } = await destClient
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`ERROR: Unable to query destination table "${table}": ${error.message}`);
      process.exit(1);
    }

    actualCounts[table] = count;
    totalCount += count;
    console.log(`Table "${table}": Expected=${expected}, Actual=${count} -> ${count === expected ? 'VERIFIED ✓' : 'MISMATCH ✗'}`);

    if (count !== expected) {
      console.error(`CRITICAL ERROR: Destination count mismatch for table "${table}". Expected ${expected}, got ${count}.`);
      console.error('STOPPING: Database integrity must be restored before proceeding.');
      process.exit(1);
    }
  }

  console.log(`Total Verified Records: ${totalCount} / 280 ✓\n`);

  console.log('=== SECTION G: BUILD CANONICAL STORAGE MIGRATION MANIFEST ===');

  const { data: products } = await destClient.from('products').select('id, name, image, data');
  const { data: brands } = await destClient.from('brands').select('id, name, logo, data');
  const { data: gallery } = await destClient.from('gallery').select('id, title, image, data');
  const { data: siteSettings } = await destClient.from('site_settings').select('id, data');

  const manifestMap = new Map(); // key: sourcePath -> manifest object
  let totalReferencesScanned = 0;
  let sourceStorageReferences = 0;

  function processUrl(table, recordId, fieldName, urlStr) {
    if (!urlStr || typeof urlStr !== 'string' || !urlStr.trim()) return;
    totalReferencesScanned++;

    if (urlStr.includes('yfbzapzceoqkwzsmsjmk.supabase.co/storage/v1/object/public/')) {
      sourceStorageReferences++;
      const parts = urlStr.split('/storage/v1/object/public/')[1];
      if (parts) {
        const slashIdx = parts.indexOf('/');
        const sourceBucket = slashIdx !== -1 ? parts.substring(0, slashIdx) : parts;
        const sourcePath = slashIdx !== -1 ? parts.substring(slashIdx + 1) : '';

        const destBucket = sourceBucket;
        const destPath = sourcePath;

        if (!manifestMap.has(sourcePath)) {
          manifestMap.set(sourcePath, {
            sourceBucket,
            sourcePath,
            destinationBucket: destBucket,
            destinationPath: destPath,
            sourceUrl: urlStr,
            destinationUrl: `${destUrl}/storage/v1/object/public/${destBucket}/${destPath}`,
            referencedBy: [{ table, recordId, fieldName }],
            status: 'PENDING'
          });
        } else {
          manifestMap.get(sourcePath).referencedBy.push({ table, recordId, fieldName });
        }
      }
    }
  }

  (products || []).forEach(p => {
    processUrl('products', p.id, 'image', p.image);
    if (p.data && typeof p.data === 'object') {
      if (p.data.image) processUrl('products', p.id, 'data.image', p.data.image);
      if (Array.isArray(p.data.images)) {
        p.data.images.forEach((img, idx) => processUrl('products', p.id, `data.images[${idx}]`, img));
      }
    }
  });

  (brands || []).forEach(b => {
    processUrl('brands', b.id, 'logo', b.logo);
    if (b.data && typeof b.data === 'object') {
      if (b.data.logo) processUrl('brands', b.id, 'data.logo', b.data.logo);
    }
  });

  (gallery || []).forEach(g => {
    processUrl('gallery', g.id, 'image', g.image);
    if (g.data && typeof g.data === 'object') {
      if (g.data.image) processUrl('gallery', g.id, 'data.image', g.data.image);
    }
  });

  (siteSettings || []).forEach(s => {
    if (s.data && typeof s.data === 'object') {
      const strData = JSON.stringify(s.data);
      const urlMatches = strData.match(/https?:\/\/[^"\s]+/g) || [];
      urlMatches.forEach((url, idx) => processUrl('site_settings', s.id, `json_match_${idx}`, url));
    }
  });

  const manifestItems = Array.from(manifestMap.values());

  console.log(`Total Media References Scanned: ${totalReferencesScanned}`);
  console.log(`Source Supabase Storage References: ${sourceStorageReferences}`);
  console.log(`Unique Object Paths Deduplicated: ${manifestItems.length}`);

  const manifestPath = path.join(__dirname, '../../storage-migration-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifestItems, null, 2));
  console.log(`✓ Manifest written to: ${manifestPath}\n`);

  console.log('=== SECTION H: CHECK/CREATE DESTINATION BUCKET "RAJA_ELE" ===');

  const { data: buckets, error: bErr } = await destClient.storage.listBuckets();
  if (bErr) {
    console.error(`ERROR listing destination buckets: ${bErr.message}`);
    process.exit(1);
  }

  const existingBucket = (buckets || []).find(b => b.name === 'RAJA_ELE' || b.id === 'RAJA_ELE');
  if (existingBucket) {
    console.log(`Destination bucket "RAJA_ELE" ALREADY EXISTS (Public: ${existingBucket.public}) ✓`);
  } else {
    console.log('Creating destination bucket "RAJA_ELE" (Public)...');
    const { data: newBucket, error: createErr } = await destClient.storage.createBucket('RAJA_ELE', {
      public: true
    });

    if (createErr) {
      console.error(`ERROR creating destination bucket "RAJA_ELE": ${createErr.message}`);
      process.exit(1);
    }
    console.log('✓ Destination bucket "RAJA_ELE" created successfully!');
  }

  console.log('\nPreparation complete.');
}

prepareStorageMigration().catch(err => {
  console.error('Fatal error during preparation:', err);
  process.exit(1);
});
