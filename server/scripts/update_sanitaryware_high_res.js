const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.readUInt32BE(0) !== 0x89504E47) {
    return { width: 0, height: 0 };
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
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

function checkHttp(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      resolve(res.statusCode);
    }).on('error', () => resolve(500));
  });
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

async function run() {
  console.log('===================================================');
  console.log('STARTING SANITARYWARE HIGH-RES IMAGE UPGRADE');
  console.log('===================================================');

  const verifiedDir = path.join(__dirname, '../verified_30_images');
  const clientPublicSan = path.join(__dirname, '../../client/public/assets/sanitaryware');
  if (!fs.existsSync(clientPublicSan)) {
    fs.mkdirSync(clientPublicSan, { recursive: true });
  }

  // Fetch Sanitaryware products from DB
  const { data: rows, error: selectErr } = await supabase.from('products').select('*');
  if (selectErr) {
    console.error('DB Fetch Error:', selectErr);
    process.exit(1);
  }

  const allProducts = rows.map(recordFromRow);
  const sanitaryProducts = allProducts.filter(p => p.category && p.category.trim().toLowerCase() === 'sanitaryware');

  console.log(`Found ${sanitaryProducts.length} Sanitaryware products in DB.`);

  const updatedResults = [];

  for (const prod of sanitaryProducts) {
    const filename = highResMap[prod.name];
    if (!filename) {
      console.error(`No high-res file mapping for product "${prod.name}"`);
      continue;
    }

    const srcPath = path.join(verifiedDir, filename);
    if (!fs.existsSync(srcPath)) {
      console.error(`File missing: ${srcPath}`);
      continue;
    }

    const stat = fs.statSync(srcPath);
    const dims = getPngDimensions(srcPath);
    const safeSlug = prod.name.toLowerCase().replace(/[\/\-_]/g, ' ').replace(/\s+/g, '-');

    // 1. Copy local file to client/public/assets/sanitaryware/<safeSlug>.png
    const localAssetPath = path.join(clientPublicSan, `${safeSlug}.png`);
    fs.copyFileSync(srcPath, localAssetPath);

    // 2. Upload to Supabase Storage RAJA_ELE bucket under products/sanitaryware_<safeSlug>_highres.png
    const buffer = fs.readFileSync(srcPath);
    const storagePath = `products/sanitaryware_${safeSlug}_highres.png`;

    const { error: uploadErr } = await supabase.storage
      .from('RAJA_ELE')
      .upload(storagePath, buffer, { contentType: 'image/png', upsert: true });

    if (uploadErr) {
      console.error(`Upload error for ${storagePath}:`, uploadErr.message);
      continue;
    }

    const { data: urlData } = supabase.storage.from('RAJA_ELE').getPublicUrl(storagePath);
    const publicUrl = urlData?.publicUrl;

    const httpStatus = await checkHttp(publicUrl);

    // 3. Update DB record
    const updatedProd = {
      ...prod,
      image: publicUrl
    };

    const rowPayload = rowForProduct(updatedProd);
    const { error: updateErr } = await supabase.from('products').update(rowPayload).eq('id', prod.id);

    if (updateErr) {
      console.error(`DB Update error for ${prod.name}:`, updateErr.message);
    } else {
      console.log(`[UPDATED] ${prod.name} | ${dims.width}x${dims.height} | ${(stat.size/1024).toFixed(1)} KB | HTTP ${httpStatus} | URL: ${publicUrl}`);
      updatedResults.push({
        name: prod.name,
        id: prod.id,
        srcDims: `${dims.width}x${dims.height}`,
        sizeKB: (stat.size/1024).toFixed(1) + ' KB',
        httpStatus,
        url: publicUrl,
        localAsset: `/assets/sanitaryware/${safeSlug}.png`
      });
    }
  }

  console.log(`\nSuccessfully upgraded all ${updatedResults.length} Sanitaryware product images!`);
}

run();
