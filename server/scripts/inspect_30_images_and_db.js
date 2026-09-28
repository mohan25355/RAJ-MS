const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const IMAGES_DIR = path.resolve(__dirname, '../verified_30_images');
const destUrl = process.env.DESTINATION_SUPABASE_URL;
const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;

if (!destUrl || !destKey) {
  console.error('ERROR: Missing DESTINATION_SUPABASE_URL or DESTINATION_SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(destUrl, destKey);

function getPngDimensions(buffer) {
  try {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  } catch (e) {
    return { width: 0, height: 0 };
  }
}

function getJpegDimensions(buffer) {
  try {
    let offset = 2;
    while (offset < buffer.length) {
      const marker = buffer.readUInt16BE(offset);
      offset += 2;
      if (marker === 0xFFC0 || marker === 0xFFC2) {
        const height = buffer.readUInt16BE(offset + 3);
        const width = buffer.readUInt16BE(offset + 5);
        return { width, height };
      }
      const length = buffer.readUInt16BE(offset);
      offset += length;
    }
  } catch (e) {}
  return { width: 0, height: 0 };
}

function scanDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDir(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp', '.avif'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const TARGET_MAP = {
  // Electricals
  'led bulb 9w': 'electricals_led_bulb_9w.png',
  'led panel light': 'electricals_led_panel_light.png',
  'led downlight': 'electricals_led_downlight.png',
  'modular switch': 'electricals_modular_switch.png',
  'power socket 6a/16a': 'electricals_power_socket_6a_16a.png',
  'electrical wire': 'electricals_electrical_wire.png',
  'mcb mini circuit breaker': 'electricals_mcb_mini_circuit_breaker.png',
  'distribution box': 'electricals_distribution_box.png',
  'ceiling fan': 'electricals_ceiling_fan.png',
  'exhaust fan': 'electricals_exhaust_fan.png',
  'extension board': 'electricals_extension_board.png',
  'led tube light 18w': 'electricals_led_tube_light_18w.png',
  'led flood light 50w': 'electricals_led_flood_light_50w.png',
  'pvc conduit pipe': 'electricals_pvc_conduit_pipe.png',
  'cable tie': 'electricals_cable_tie.png',

  // Sanitaryware
  'one piece wc': 'sanitaryware_one_piece_wc.png',
  'wall hung wc': 'sanitaryware_wall_hung_wc.png',
  'wash basin': 'sanitaryware_wash_basin.png',
  'pedestal basin': 'sanitaryware_pedestal_basin.png',
  'basin mixer tap': 'sanitaryware_basin_mixer_tap.png',
  'bib cock': 'sanitaryware_bib_cock.png',
  'wall mixer': 'sanitaryware_wall_mixer.png',
  'health faucet': 'sanitaryware_health_faucet.png',
  'overhead shower': 'sanitaryware_overhead_shower.png',
  'angle valve': 'sanitaryware_angle_valve.png',
  'floor drain': 'sanitaryware_floor_drain.png',
  'pvc waste pipe': 'sanitaryware_pvc_waste_pipe.png',
  'flush tank / cistern': 'sanitaryware_flush_tank_cistern.png',
  'flush tank': 'sanitaryware_flush_tank_cistern.png',
  'cistern': 'sanitaryware_flush_tank_cistern.png',
  'toilet seat cover': 'sanitaryware_toilet_seat_cover.png',
  'connection hose': 'sanitaryware_connection_hose.png',
};

async function main() {
  console.log('=== STEP 1: INSPECT LOCAL 30 IMAGES ===\n');

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`ERROR: Directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const localFilePaths = scanDir(IMAGES_DIR);
  console.log(`Discovered ${localFilePaths.length} local images in ${IMAGES_DIR}.\n`);

  const imageInventory = [];
  const localFileMap = new Map(); // filename (lowercase) -> file info

  for (const fp of localFilePaths) {
    const fn = path.basename(fp);
    const ext = path.extname(fn).toLowerCase();
    const stats = fs.statSync(fp);
    const buf = fs.readFileSync(fp);
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    let dims = { width: 0, height: 0 };
    if (ext === '.png') dims = getPngDimensions(buf);
    else if (ext === '.jpg' || ext === '.jpeg') dims = getJpegDimensions(buf);

    const info = {
      filename: fn,
      filePath: fp,
      ext,
      sizeBytes: stats.size,
      sizeKB: (stats.size / 1024).toFixed(2),
      mimeType: ext === '.png' ? 'image/png' : 'image/jpeg',
      dimensions: `${dims.width}x${dims.height}`,
      sha256: hash
    };

    imageInventory.push(info);
    localFileMap.set(fn.toLowerCase(), info);
    console.log(` [Local Image] ${fn} | ${info.sizeKB} KB | ${info.dimensions} | Hash: ${hash.substring(0, 10)}...`);
  }

  // Generate VERIFIED_30_IMAGE_INVENTORY.md
  let md = `# VERIFIED 30 IMAGE INVENTORY

Date: ${new Date().toISOString()}
Total Images Found: ${imageInventory.length}

| Index | Filename | Size (KB) | MIME Type | Dimensions | SHA-256 Hash |
| :---: | :--- | :---: | :---: | :---: | :--- |
`;

  imageInventory.forEach((item, idx) => {
    md += `| ${idx + 1} | \`${item.filename}\` | ${item.sizeKB} KB | ${item.mimeType} | ${item.dimensions} | \`${item.sha256.substring(0, 16)}...\` |\n`;
  });

  const invMdPath = path.resolve(__dirname, '../../VERIFIED_30_IMAGE_INVENTORY.md');
  fs.writeFileSync(invMdPath, md, 'utf8');
  console.log(`\nCreated ${invMdPath}`);

  // === STEP 2: INSPECT DESTINATION DATABASE ===
  console.log('\n=== STEP 2: INSPECT DESTINATION DATABASE FOR TARGET PRODUCTS ===\n');

  const { data: allProducts, error: prodErr } = await supabase.from('products').select('*');
  if (prodErr) {
    console.error('Error fetching products from DB:', prodErr.message);
    process.exit(1);
  }

  console.log(`Total products in destination DB: ${allProducts.length}`);

  const targetCategories = ['Electricals', 'Sanitaryware', 'Wires & Cables', 'Switches & Electrical', 'Sanitaryware & Bathroom'];
  
  const eleProducts = allProducts.filter(p => {
    const cat = String(p.category || p.data?.category || '').trim().toLowerCase();
    return cat.includes('electrical') || cat.includes('wire') || cat.includes('cable');
  });

  const sanProducts = allProducts.filter(p => {
    const cat = String(p.category || p.data?.category || '').trim().toLowerCase();
    return cat.includes('sanitary') || cat.includes('bath');
  });

  console.log(`Discovered Electricals products count: ${eleProducts.length}`);
  console.log(`Discovered Sanitaryware products count: ${sanProducts.length}`);

  // Let's inspect all product names and categories in DB to match exact 30 products
  console.log('\nAll Products matching target names:');
  const matchedProducts = [];

  for (const p of allProducts) {
    const pNameNorm = String(p.name || '').trim().toLowerCase();
    const expectedFn = TARGET_MAP[pNameNorm];
    if (expectedFn) {
      const localInfo = localFileMap.get(expectedFn.toLowerCase());
      matchedProducts.push({
        product: p,
        expectedFilename: expectedFn,
        localInfo
      });
      console.log(` - Matched: "${p.name}" (ID: ${p.id}, Cat: "${p.category}") -> Local File: ${expectedFn} (${localInfo ? 'FOUND ✓' : 'MISSING ❌'})`);
    }
  }

  console.log(`\nTotal Matched Target Products: ${matchedProducts.length} / 30`);

  if (matchedProducts.length !== 30) {
    console.log('\nListing unmatched target names from TARGET_MAP:');
    for (const [nameKey, fnKey] of Object.entries(TARGET_MAP)) {
      const found = matchedProducts.some(m => String(m.product.name).trim().toLowerCase() === nameKey);
      if (!found) {
        console.log(` ❌ NOT FOUND IN DB: "${nameKey}" (Expected file: ${fnKey})`);
      }
    }
  }

  // Create pre-migration backup
  const backupData = matchedProducts.map(m => ({
    id: m.product.id,
    name: m.product.name,
    category: m.product.category,
    brand: m.product.brand,
    price: m.product.price,
    previous_image: m.product.image,
    previous_data_image: m.product.data?.image,
    expected_local_file: m.expectedFilename,
    full_product_record: m.product
  }));

  const backupPath = path.resolve(__dirname, '../../ELECTRICALS_SANITARYWARE_IMAGE_BACKUP.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`\nCreated ${backupPath}`);
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
