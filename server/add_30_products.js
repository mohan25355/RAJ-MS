require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http = require('http');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = 'RAJA_ELE';

const ELECTRICALS_PRODUCTS = [
  { name: 'LED Bulb 9W', img: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=85' },
  { name: 'LED Panel Light', img: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=800&q=85' },
  { name: 'LED Downlight', img: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=800&q=85' },
  { name: 'Modular Switch', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=85' },
  { name: 'Power Socket 6A/16A', img: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=85' },
  { name: 'Electrical Wire', img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=85' },
  { name: 'MCB Mini Circuit Breaker', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=85' },
  { name: 'Distribution Box', img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=85' },
  { name: 'Ceiling Fan', img: 'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=800&q=85' },
  { name: 'Exhaust Fan', img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=85' },
  { name: 'Extension Board', img: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=85' },
  { name: 'LED Tube Light 18W', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85' },
  { name: 'LED Flood Light 50W', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=85' },
  { name: 'PVC Conduit Pipe', img: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=85' },
  { name: 'Cable Tie', img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=85' }
];

const SANITARYWARE_PRODUCTS = [
  { name: 'One Piece WC', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=85' },
  { name: 'Wall Hung WC', img: 'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?auto=format&fit=crop&w=800&q=85' },
  { name: 'Wash Basin', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=85' },
  { name: 'Pedestal Basin', img: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=85' },
  { name: 'Basin Mixer Tap', img: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=85' },
  { name: 'Bib Cock', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=85' },
  { name: 'Wall Mixer', img: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=85' },
  { name: 'Health Faucet', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=85' },
  { name: 'Overhead Shower', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=85' },
  { name: 'Angle Valve', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=85' },
  { name: 'Floor Drain', img: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=85' },
  { name: 'PVC Waste Pipe', img: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=85' },
  { name: 'Flush Tank / Cistern', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=85' },
  { name: 'Toilet Seat Cover', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=85' },
  { name: 'Connection Hose', img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=85' }
];

function fetchImageBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchImageBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download image: status code ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

const idGen = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

async function uploadToStorage(url, name, category) {
  const buffer = await fetchImageBuffer(url);
  const safeId = `${category.toLowerCase()}-${name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}`;
  const filePath = `products/${safeId}-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, { contentType: 'image/jpeg', upsert: true });

  if (error) {
    throw new Error(`Storage upload failed for ${name}: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return urlData?.publicUrl;
}

async function addProducts() {
  console.log('=== Step 1: Audit existing products ===');
  const { data: existingProducts, error: fetchErr } = await supabase.from('products').select('*');
  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
  }
  const existingList = existingProducts || [];
  const existingSet = new Set(
    existingList.map(p => `${(p.name || '').trim().toLowerCase()}::${(p.category || p.data?.category || '').trim().toLowerCase()}`)
  );

  console.log(`Current existing total products: ${existingList.length}`);

  const itemsToAdd = [
    ...ELECTRICALS_PRODUCTS.map(p => ({ ...p, category: 'Electricals' })),
    ...SANITARYWARE_PRODUCTS.map(p => ({ ...p, category: 'Sanitaryware' }))
  ];

  const reportRows = [];
  let addedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < itemsToAdd.length; i++) {
    const item = itemsToAdd[i];
    const key = `${item.name.trim().toLowerCase()}::${item.category.trim().toLowerCase()}`;

    if (existingSet.has(key)) {
      console.log(`⚠️  [${i + 1}/30] Skipping "${item.name}" in ${item.category} — already exists.`);
      skippedCount++;
      reportRows.push({ index: i + 1, name: item.name, category: item.category, image: 'Existing', price: 'Price on request', status: 'REUSED / SKIPPED' });
      continue;
    }

    console.log(`⏳ [${i + 1}/30] Uploading image & creating product: "${item.name}" (${item.category})...`);
    let publicUrl;
    try {
      publicUrl = await uploadToStorage(item.img, item.name, item.category);
    } catch (err) {
      console.error(`❌ Image upload error for ${item.name}:`, err.message);
      publicUrl = item.img;
    }

    const productId = idGen();
    const productObj = {
      id: productId,
      name: item.name,
      category: item.category,
      subcategory: '',
      price: 'Price on request',
      badge: 'Available',
      description: `${item.name} from our ${item.category} catalogue. Contact us for specifications and quotation.`,
      image: publicUrl,
      updated_at: new Date().toISOString()
    };

    const { error: insertErr } = await supabase.from('products').insert([{
      id: productId,
      name: item.name,
      category: item.category,
      description: productObj.description,
      price: null,
      image: publicUrl,
      data: productObj,
      updated_at: new Date().toISOString()
    }]);

    if (insertErr) {
      console.error(`❌ Insert error for ${item.name}:`, insertErr.message);
    } else {
      console.log(`✅ [${i + 1}/30] Created product "${item.name}" -> ${publicUrl}`);
      addedCount++;
      reportRows.push({ index: i + 1, name: item.name, category: item.category, image: publicUrl, price: 'Price on request', status: 'SUCCESS' });
    }
  }

  console.log('\n=== Step 2: Final Product Count Audit ===');
  const { data: finalProducts } = await supabase.from('products').select('*');
  const finalList = finalProducts || [];
  console.log(`Total products before: ${existingList.length}`);
  console.log(`Newly added products: ${addedCount}`);
  console.log(`Skipped existing: ${skippedCount}`);
  console.log(`Total products after: ${finalList.length}`);

  const byCat = {};
  finalList.forEach(p => {
    const cat = p.category || p.data?.category || 'Unknown';
    byCat[cat] = (byCat[cat] || 0) + 1;
  });
  console.log('\nFinal counts by category:', byCat);
  console.log('\nJSON_REPORT_START\n' + JSON.stringify(reportRows, null, 2) + '\nJSON_REPORT_END');
}

addProducts().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
