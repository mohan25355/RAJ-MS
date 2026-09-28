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
const IMAGES_DIR = path.resolve(__dirname, '../verified_30_images');

const PRODUCT_IMAGE_MAP = [
  // Electricals (15)
  { name: 'LED Bulb 9W', filename: 'electricals_led_bulb_9w.png' },
  { name: 'LED Panel Light', filename: 'electricals_led_panel_light.png' },
  { name: 'LED Downlight', filename: 'electricals_led_downlight.png' },
  { name: 'Modular Switch', filename: 'electricals_modular_switch.png' },
  { name: 'Power Socket 6A/16A', filename: 'electricals_power_socket_6a_16a.png' },
  { name: 'Electrical Wire', filename: 'electricals_electrical_wire.png' },
  { name: 'MCB Mini Circuit Breaker', filename: 'electricals_mcb_mini_circuit_breaker.png' },
  { name: 'Distribution Box', filename: 'electricals_distribution_box.png' },
  { name: 'Ceiling Fan', filename: 'electricals_ceiling_fan.png' },
  { name: 'Exhaust Fan', filename: 'electricals_exhaust_fan.png' },
  { name: 'Extension Board', filename: 'electricals_extension_board.png' },
  { name: 'LED Tube Light 18W', filename: 'electricals_led_tube_light_18w.png' },
  { name: 'LED Flood Light 50W', filename: 'electricals_led_flood_light_50w.png' },
  { name: 'PVC Conduit Pipe', filename: 'electricals_pvc_conduit_pipe.png' },
  { name: 'Cable Tie', filename: 'electricals_cable_tie.png' },

  // Sanitaryware (15)
  { name: 'One Piece WC', filename: 'sanitaryware_one_piece_wc.png' },
  { name: 'Wall Hung WC', filename: 'sanitaryware_wall_hung_wc.png' },
  { name: 'Wash Basin', filename: 'sanitaryware_wash_basin.png' },
  { name: 'Pedestal Basin', filename: 'sanitaryware_pedestal_basin.png' },
  { name: 'Basin Mixer Tap', filename: 'sanitaryware_basin_mixer_tap.png' },
  { name: 'Bib Cock', filename: 'sanitaryware_bib_cock.png' },
  { name: 'Wall Mixer', filename: 'sanitaryware_wall_mixer.png' },
  { name: 'Health Faucet', filename: 'sanitaryware_health_faucet.png' },
  { name: 'Overhead Shower', filename: 'sanitaryware_overhead_shower.png' },
  { name: 'Angle Valve', filename: 'sanitaryware_angle_valve.png' },
  { name: 'Floor Drain', filename: 'sanitaryware_floor_drain.png' },
  { name: 'PVC Waste Pipe', filename: 'sanitaryware_pvc_waste_pipe.png' },
  { name: 'Flush Tank / Cistern', filename: 'sanitaryware_flush_tank___cistern.png' },
  { name: 'Toilet Seat Cover', filename: 'sanitaryware_toilet_seat_cover.png' },
  { name: 'Connection Hose', filename: 'sanitaryware_connection_hose.png' }
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

async function run30Migration() {
  console.log('===========================================================');
  console.log('  STARTING MIGRATION OF 30 ELECTRICALS & SANITARYWARE IMAGES');
  console.log('===========================================================\n');

  // Fetch products from DB
  const { data: allProducts, error: fetchErr } = await supabase.from('products').select('*');
  if (fetchErr) {
    console.error('Error fetching products:', fetchErr.message);
    process.exit(1);
  }

  const migrationState = [];
  const uploadedHashes = new Map();

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < PRODUCT_IMAGE_MAP.length; i++) {
    const item = PRODUCT_IMAGE_MAP[i];
    const targetProduct = allProducts.find(p => String(p.name || '').trim().toLowerCase() === item.name.toLowerCase());

    console.log(`\n-----------------------------------------------------------`);
    console.log(`[Product ${i + 1}/30] "${item.name}"`);
    console.log(`-----------------------------------------------------------`);

    if (!targetProduct) {
      console.error(`  ERROR: Product "${item.name}" not found in destination DB!`);
      failCount++;
      migrationState.push({ ...item, status: 'FAILED', reason: 'Product not found in DB' });
      continue;
    }

    console.log(`  - DB Product ID : ${targetProduct.id}`);
    console.log(`  - Category      : ${targetProduct.category}`);

    const localFilePath = path.join(IMAGES_DIR, item.filename);
    if (!fs.existsSync(localFilePath)) {
      console.error(`  ERROR: Local file missing: ${localFilePath}`);
      failCount++;
      migrationState.push({ ...item, id: targetProduct.id, status: 'FAILED', reason: 'Local file missing' });
      continue;
    }

    const fileBuffer = fs.readFileSync(localFilePath);
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const storagePath = `products/${item.filename}`;
    const mimeType = 'image/png';

    let publicUrl = `${destUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`;

    // Upload to Storage
    console.log(`  - Uploading to Storage: ${BUCKET}/${storagePath}...`);
    const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

    if (uploadErr) {
      console.error(`  - UPLOAD FAILED: ${uploadErr.message}`);
      failCount++;
      migrationState.push({ ...item, id: targetProduct.id, status: 'FAILED', reason: `Upload error: ${uploadErr.message}` });
      continue;
    }

    console.log(`  - Upload successful! Public URL: ${publicUrl}`);

    // Verify HTTP 200
    console.log(`  - Verifying HTTP 200 public URL access...`);
    const httpCheck = await checkUrlHttp200(publicUrl);
    if (!httpCheck.ok) {
      console.error(`  - HTTP VERIFICATION FAILED: status=${httpCheck.statusCode}, len=${httpCheck.contentLength}`);
      failCount++;
      migrationState.push({ ...item, id: targetProduct.id, status: 'FAILED', reason: `HTTP status ${httpCheck.statusCode}` });
      continue;
    }
    console.log(`  - HTTP VERIFIED 200 OK! (Content-Length: ${httpCheck.contentLength}, Content-Type: ${httpCheck.contentType})`);

    // Perform targeted DB update
    const updatedDataPayload = {
      ...(targetProduct.data || {}),
      image: publicUrl
    };

    console.log(`  - Updating DB product record ID: ${targetProduct.id}...`);
    const { error: updateErr } = await supabase
      .from('products')
      .update({
        image: publicUrl,
        data: updatedDataPayload,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetProduct.id);

    if (updateErr) {
      console.error(`  - DB UPDATE FAILED: ${updateErr.message}`);
      failCount++;
      migrationState.push({ ...item, id: targetProduct.id, status: 'FAILED', reason: `DB update error: ${updateErr.message}` });
      continue;
    }

    // Re-read product record to verify URL
    const { data: verifyRow, error: reReadErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', targetProduct.id)
      .single();

    if (reReadErr || verifyRow.image !== publicUrl || verifyRow.data?.image !== publicUrl) {
      console.error(`  - RE-READ VERIFICATION FAILED for ID: ${targetProduct.id}`);
      failCount++;
      migrationState.push({ ...item, id: targetProduct.id, status: 'FAILED', reason: 'Re-read verification mismatch' });
      continue;
    }

    console.log(`  - SUCCESS: Product updated & verified cleanly!`);
    successCount++;
    migrationState.push({
      id: targetProduct.id,
      name: item.name,
      filename: item.filename,
      newUrl: publicUrl,
      status: 'SUCCESS',
      verified200: true
    });
  }

  // Save migration state manifest
  fs.writeFileSync(
    path.resolve(__dirname, '../../VERIFIED_30_IMAGE_MIGRATION_STATE.json'),
    JSON.stringify(migrationState, null, 2),
    'utf8'
  );

  console.log('\n===========================================================');
  console.log('  FINAL SYSTEM AUDIT FOR 30 PRODUCTS');
  console.log('===========================================================');

  const { data: finalProducts } = await supabase.from('products').select('*');
  const target30Names = PRODUCT_IMAGE_MAP.map(m => m.name.toLowerCase());
  const final30 = finalProducts.filter(p => target30Names.includes(String(p.name || '').trim().toLowerCase()));

  let oldUrlCount = 0;
  let newUrlCount = 0;
  let http200Count = 0;

  for (const p of final30) {
    const img = p.image || '';
    if (img.includes('yfbzapzceoqkwzsmsjmk')) oldUrlCount++;
    if (img.includes('ueohqicjodxwkwdxcrnj')) {
      newUrlCount++;
      const check = await checkUrlHttp200(img);
      if (check.ok) http200Count++;
    }
  }

  console.log(`Target Products Audited    : ${final30.length} / 30`);
  console.log(`Old Supabase URLs Remaining : ${oldUrlCount}`);
  console.log(`New Supabase Storage URLs  : ${newUrlCount}`);
  console.log(`HTTP 200 Verified Images    : ${http200Count}`);

  console.log(`\nMigration completed! Success: ${successCount}, Failures: ${failCount}`);
}

run30Migration().catch(err => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
