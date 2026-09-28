const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

async function auditStorage() {
  console.log('=== RAJA ELECTRICALS — SUPABASE STORAGE AUDIT ===\n');

  const sourceUrl = process.env.SOURCE_SUPABASE_URL;
  const sourceKey = process.env.SOURCE_SUPABASE_SERVICE_KEY;
  const destUrl = process.env.DESTINATION_SUPABASE_URL;
  const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

  if (!sourceUrl || !sourceKey || !destUrl || !destKey) {
    console.error('Missing credentials in .env');
    process.exit(1);
  }

  const sourceClient = createClient(sourceUrl, sourceKey);
  const destClient = createClient(destUrl, destKey);

  // 1. Discover Source Buckets
  console.log('--- TASK 1: DISCOVER SOURCE STORAGE ---');
  let sourceBuckets = [];
  const { data: sBuckets, error: sBucketErr } = await sourceClient.storage.listBuckets();
  if (sBucketErr) {
    console.log(`Source Storage API listBuckets error: ${sBucketErr.message}`);
  } else {
    sourceBuckets = sBuckets || [];
    console.log(`Discovered ${sourceBuckets.length} source buckets:`);
    for (const b of sourceBuckets) {
      console.log(`  - Bucket: "${b.name}" | ID: "${b.id}" | Public: ${b.public}`);
    }
  }

  // 2. Discover Destination Buckets
  console.log('\n--- TASK 2: DISCOVER DESTINATION STORAGE ---');
  let destBuckets = [];
  const { data: dBuckets, error: dBucketErr } = await destClient.storage.listBuckets();
  if (dBucketErr) {
    console.log(`Destination Storage API listBuckets error: ${dBucketErr.message}`);
  } else {
    destBuckets = dBuckets || [];
    console.log(`Discovered ${destBuckets.length} destination buckets.`);
    for (const b of destBuckets) {
      console.log(`  - Bucket: "${b.name}" | ID: "${b.id}" | Public: ${b.public}`);
    }
  }

  const destBucketNames = new Set(destBuckets.map(b => b.name));

  // 3. Cross-reference Database Image References
  console.log('\n--- TASK 3: CROSS-REFERENCE DATABASE IMAGE REFERENCES ---');

  const { data: products } = await destClient.from('products').select('id, name, image, data');
  const { data: brands } = await destClient.from('brands').select('id, name, logo, data');
  const { data: gallery } = await destClient.from('gallery').select('id, title, image, data');
  const { data: siteSettings } = await destClient.from('site_settings').select('id, data');

  const allRefs = [];

  function analyzeRef(table, recordId, fieldName, urlStr) {
    if (!urlStr || typeof urlStr !== 'string' || !urlStr.trim()) return;

    let type = 'unknown';
    let isSourceStorage = false;
    let isDestStorage = false;
    let bucket = null;
    let filePath = null;

    if (urlStr.includes('yfbzapzceoqkwzsmsjmk.supabase.co/storage/v1/object/public/')) {
      type = 'source_supabase_storage';
      isSourceStorage = true;
      const parts = urlStr.split('/storage/v1/object/public/')[1];
      if (parts) {
        const slashIdx = parts.indexOf('/');
        if (slashIdx !== -1) {
          bucket = parts.substring(0, slashIdx);
          filePath = parts.substring(slashIdx + 1);
        } else {
          bucket = parts;
          filePath = '';
        }
      }
    } else if (urlStr.includes('ueohqicjodxwkwdxcrnj.supabase.co/storage/v1/object/public/')) {
      type = 'destination_supabase_storage';
      isDestStorage = true;
      const parts = urlStr.split('/storage/v1/object/public/')[1];
      if (parts) {
        const slashIdx = parts.indexOf('/');
        if (slashIdx !== -1) {
          bucket = parts.substring(0, slashIdx);
          filePath = parts.substring(slashIdx + 1);
        } else {
          bucket = parts;
          filePath = '';
        }
      }
    } else if (urlStr.startsWith('/') || urlStr.startsWith('assets/') || urlStr.startsWith('images/') || urlStr.startsWith('./')) {
      type = 'local_asset';
    } else if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      type = 'external_url';
    } else {
      type = 'relative_or_other';
    }

    allRefs.push({
      table,
      recordId,
      fieldName,
      urlStr,
      type,
      isSourceStorage,
      isDestStorage,
      bucket,
      filePath
    });
  }

  // Extract from Products
  (products || []).forEach(p => {
    analyzeRef('products', p.id, 'image', p.image);
    if (p.data && typeof p.data === 'object') {
      if (p.data.image) analyzeRef('products', p.id, 'data.image', p.data.image);
      if (Array.isArray(p.data.images)) {
        p.data.images.forEach((img, idx) => analyzeRef('products', p.id, `data.images[${idx}]`, img));
      }
    }
  });

  // Extract from Brands
  (brands || []).forEach(b => {
    analyzeRef('brands', b.id, 'logo', b.logo);
    if (b.data && typeof b.data === 'object') {
      if (b.data.logo) analyzeRef('brands', b.id, 'data.logo', b.data.logo);
    }
  });

  // Extract from Gallery
  (gallery || []).forEach(g => {
    analyzeRef('gallery', g.id, 'image', g.image);
    if (g.data && typeof g.data === 'object') {
      if (g.data.image) analyzeRef('gallery', g.id, 'data.image', g.data.image);
    }
  });

  // Extract from Site Settings
  (siteSettings || []).forEach(s => {
    if (s.data && typeof s.data === 'object') {
      const strData = JSON.stringify(s.data);
      const urlMatches = strData.match(/https?:\/\/[^"\s]+/g) || [];
      urlMatches.forEach((url, idx) => analyzeRef('site_settings', s.id, `json_match_${idx}`, url));
    }
  });

  console.log(`Total image/logo URL references scanned: ${allRefs.length}`);

  const byType = {};
  allRefs.forEach(r => {
    byType[r.type] = (byType[r.type] || 0) + 1;
  });
  console.log('References by Type:', byType);

  const sourceStorageRefs = allRefs.filter(r => r.isSourceStorage);
  console.log(`Source Supabase Storage references: ${sourceStorageRefs.length}`);

  const bucketBreakdown = {};
  const uniquePaths = new Set();
  sourceStorageRefs.forEach(r => {
    bucketBreakdown[r.bucket] = (bucketBreakdown[r.bucket] || 0) + 1;
    if (r.bucket && r.filePath) {
      uniquePaths.add(`${r.bucket}/${r.filePath}`);
    }
  });
  console.log('Source Storage References by Bucket:', bucketBreakdown);
  console.log(`Unique object paths referenced: ${uniquePaths.size}`);

  let availableInDest = 0;
  let missingInDest = 0;

  for (const r of sourceStorageRefs) {
    if (!r.bucket || !destBucketNames.has(r.bucket)) {
      missingInDest++;
    } else {
      // Bucket exists, check file
      const { data: fileData } = await destClient.storage
        .from(r.bucket)
        .list(path.dirname(r.filePath) === '.' ? '' : path.dirname(r.filePath), {
          search: path.basename(r.filePath)
        });

      const exists = fileData && fileData.some(f => f.name === path.basename(r.filePath));
      if (exists) availableInDest++;
      else missingInDest++;
    }
  }

  console.log(`Available in Destination Storage: ${availableInDest}`);
  console.log(`Missing from Destination Storage: ${missingInDest}`);

  console.log('\n--- SAMPLE REFERENCED PATHS IN BUCKET "RAJA_ELE" ---');
  Array.from(uniquePaths).slice(0, 15).forEach(p => console.log(`  - ${p}`));
}

auditStorage().catch(err => {
  console.error('Audit Error:', err);
  process.exit(1);
});
