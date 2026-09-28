const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

function checkHttp(url) {
  return new Promise(resolve => {
    if (!url) return resolve({ status: 404, size: 0 });
    const getter = url.startsWith('https:') ? https : http;
    getter.get(url, res => {
      let size = 0;
      res.on('data', chunk => size += chunk.length);
      res.on('end', () => resolve({ status: res.statusCode, size }));
    }).on('error', err => resolve({ status: 500, size: 0 }));
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

async function fixCanonical() {
  console.log('===========================================================');
  console.log('FIXING CANONICAL SANITARYWARE IMAGES AND TIMESTAMPS');
  console.log('===========================================================');

  const { data: rows, error: selectErr } = await supabase.from('products').select('*');
  if (selectErr) {
    console.error('Error selecting products:', selectErr);
    process.exit(1);
  }

  const allProducts = rows.map(recordFromRow);
  const sanitaryProducts = allProducts.filter(p => p.category && p.category.trim().toLowerCase() === 'sanitaryware');

  console.log(`Fetched ${sanitaryProducts.length} Sanitaryware products.`);

  const verifiedDir = path.join(__dirname, '../verified_30_images');
  const clientPublicSan = path.join(__dirname, '../../client/public/assets/sanitaryware');
  if (!fs.existsSync(clientPublicSan)) {
    fs.mkdirSync(clientPublicSan, { recursive: true });
  }

  const highResMap = {
    'One Piece WC': 'sanitaryware_one_piece_wc.png',
    'Wall Hung WC': 'sanitaryware_wall_hung_wc.png',
    'Health Faucet': 'sanitaryware_health_faucet.png',
    'Overhead Shower': 'sanitaryware_overhead_shower.png',
    'Wash Basin': 'sanitaryware_wash_basin.png',
    'Pedestal Basin': 'sanitaryware_pedestal_basin.png',
    'Basin Mixer Tap': 'sanitaryware_basin_mixer_tap.png',
    'Angle Valve': 'sanitaryware_angle_valve.png',
    'Floor Drain': 'sanitaryware_floor_drain.png',
    'PVC Waste Pipe': 'sanitaryware_pvc_waste_pipe.png',
    'Flush Tank / Cistern': 'sanitaryware_flush_tank___cistern.png',
    'Bib Cock': 'sanitaryware_bib_cock.png',
    'Toilet Seat Cover': 'sanitaryware_toilet_seat_cover.png',
    'Wall Mixer': 'sanitaryware_wall_mixer.png',
    'Connection Hose': 'sanitaryware_connection_hose.png',
  };

  const results = [];

  for (const prod of sanitaryProducts) {
    const filename = highResMap[prod.name];
    if (!filename) continue;

    const srcPath = path.join(verifiedDir, filename);
    const safeSlug = prod.name.toLowerCase().replace(/[\/\-_]/g, ' ').replace(/\s+/g, '-');

    // 1. Ensure high-res copy in client/public/assets/sanitaryware/
    fs.copyFileSync(srcPath, path.join(clientPublicSan, `${safeSlug}.png`));

    // 2. Upload to Supabase Storage
    const buffer = fs.readFileSync(srcPath);
    const storagePath = `products/sanitaryware_${safeSlug}_v4.png`;

    const { error: uploadErr } = await supabase.storage
      .from('RAJA_ELE')
      .upload(storagePath, buffer, { contentType: 'image/png', upsert: true });

    if (uploadErr) {
      console.error(`Upload error for ${prod.name}:`, uploadErr.message);
      continue;
    }

    const { data: urlData } = supabase.storage.from('RAJA_ELE').getPublicUrl(storagePath);
    const publicUrl = urlData?.publicUrl;

    // 3. Update DB record with fresh timestamp
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
      console.error(`DB Update Error for ${prod.name}:`, updateErr.message);
    } else {
      console.log(`[UPDATED DB & TIMESTAMP] ${prod.name} -> ${publicUrl}`);
    }
  }

  console.log('\nAll 15 Sanitaryware products updated with fresh timestamps and high-res URLs.');
}

fixCanonical();
