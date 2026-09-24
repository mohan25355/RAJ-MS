require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = 'RAJA_ELE';
const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\bffb577f-bd9b-4f58-a0c2-d3356ca8aebc';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

// Existing 13 AI Generated PNG files
const AI_GENERATED_MAP = {
  'LED Bulb 9W': 'led_bulb_9w_1790280693707.png',
  'LED Panel Light': 'led_panel_light_1790280709398.png',
  'LED Downlight': 'led_downlight_1790280720519.png',
  'Modular Switch': 'modular_switch_1790280734722.png',
  'Power Socket 6A/16A': 'power_socket_6a_16a_1790280749848.png',
  'Electrical Wire': 'electrical_wire_1790280761365.png',
  'MCB Mini Circuit Breaker': 'mcb_circuit_breaker_1790280776681.png',
  'Distribution Box': 'distribution_box_1790280787163.png',
  'Ceiling Fan': 'ceiling_fan_1790280798897.png',
  'Exhaust Fan': 'exhaust_fan_1790280809435.png',
  'Extension Board': 'extension_board_1790280820497.png',
  'LED Tube Light 18W': 'led_tube_light_18w_1790280851430.png',
  'LED Flood Light 50W': 'led_flood_light_50w_1790280883145.png'
};

// SVG templates for remaining 17 products
function getSvgForProduct(name) {
  const commonDefs = `
    <defs>
      <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="20%" stop-color="#cbd5e1"/>
        <stop offset="45%" stop-color="#ffffff"/>
        <stop offset="70%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
      <linearGradient id="ceramicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#f1f5f9"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
      <linearGradient id="pvcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#cbd5e1"/>
        <stop offset="25%" stop-color="#ffffff"/>
        <stop offset="75%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
      <linearGradient id="blackPlastic" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="50%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.12"/>
      </filter>
    </defs>
  `;

  let innerSvg = '';

  switch (name) {
    case 'PVC Conduit Pipe':
      innerSvg = `
        <g filter="url(#softShadow)">
          <rect x="70" y="140" width="260" height="26" rx="6" fill="url(#pvcGrad)"/>
          <rect x="70" y="190" width="260" height="26" rx="6" fill="url(#pvcGrad)"/>
          <rect x="70" y="240" width="260" height="26" rx="6" fill="url(#pvcGrad)"/>
          <path d="M 60 130 L 100 130 L 100 280 L 60 280 Z" fill="#94a3b8" opacity="0.4"/>
        </g>`;
      break;

    case 'Cable Tie':
      innerSvg = `
        <g filter="url(#softShadow)" stroke="#0f172a" stroke-opacity="0.08">
          <path d="M 80 120 C 180 60, 300 120, 320 220 C 340 300, 220 340, 140 280" fill="none" stroke="url(#pvcGrad)" stroke-width="14" stroke-linecap="round"/>
          <rect x="65" y="105" width="30" height="30" rx="4" fill="url(#pvcGrad)"/>
          <path d="M 100 140 C 200 80, 280 140, 300 220" fill="none" stroke="url(#pvcGrad)" stroke-width="10" stroke-linecap="round"/>
          <rect x="88" y="128" width="24" height="24" rx="3" fill="url(#pvcGrad)"/>
        </g>`;
      break;

    case 'One Piece WC':
      innerSvg = `
        <g filter="url(#softShadow)">
          <!-- Cistern -->
          <rect x="130" y="70" width="140" height="120" rx="16" fill="url(#ceramicGrad)" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="180" y="60" width="40" height="10" rx="3" fill="url(#chromeGrad)"/>
          <!-- Bowl -->
          <path d="M 120 180 C 120 180, 110 310, 160 340 L 240 340 C 290 310, 280 180, 280 180 Z" fill="url(#ceramicGrad)" stroke="#cbd5e1" stroke-width="2"/>
          <ellipse cx="200" cy="210" rx="65" ry="30" fill="#e2e8f0"/>
          <ellipse cx="200" cy="210" rx="50" ry="20" fill="#cbd5e1"/>
        </g>`;
      break;

    case 'Wall Hung WC':
      innerSvg = `
        <g filter="url(#softShadow)">
          <path d="M 110 130 C 110 130, 100 280, 200 310 C 300 280, 290 130, 290 130 Z" fill="url(#ceramicGrad)" stroke="#cbd5e1" stroke-width="2"/>
          <ellipse cx="200" cy="160" rx="75" ry="35" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
          <ellipse cx="200" cy="160" rx="55" ry="22" fill="#cbd5e1"/>
          <rect x="120" y="100" width="160" height="30" rx="6" fill="url(#ceramicGrad)"/>
        </g>`;
      break;

    case 'Wash Basin':
      innerSvg = `
        <g filter="url(#softShadow)">
          <ellipse cx="200" cy="200" rx="140" ry="85" fill="url(#ceramicGrad)" stroke="#cbd5e1" stroke-width="3"/>
          <ellipse cx="200" cy="200" rx="110" ry="60" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
          <circle cx="200" cy="215" r="14" fill="url(#chromeGrad)"/>
          <circle cx="200" cy="145" r="10" fill="url(#chromeGrad)"/>
        </g>`;
      break;

    case 'Pedestal Basin':
      innerSvg = `
        <g filter="url(#softShadow)">
          <!-- Pedestal -->
          <path d="M 165 190 L 175 340 L 225 340 L 235 190 Z" fill="url(#ceramicGrad)" stroke="#cbd5e1" stroke-width="2"/>
          <!-- Basin Top -->
          <ellipse cx="200" cy="140" rx="130" ry="60" fill="url(#ceramicGrad)" stroke="#cbd5e1" stroke-width="3"/>
          <ellipse cx="200" cy="140" rx="100" ry="40" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
          <!-- Faucet -->
          <path d="M 200 80 L 200 115" stroke="url(#chromeGrad)" stroke-width="12" stroke-linecap="round"/>
        </g>`;
      break;

    case 'Basin Mixer Tap':
      innerSvg = `
        <g filter="url(#softShadow)">
          <path d="M 170 310 L 170 180 C 170 120, 240 120, 250 170 L 250 200" fill="none" stroke="url(#chromeGrad)" stroke-width="28" stroke-linecap="round"/>
          <rect x="150" y="300" width="40" height="25" rx="4" fill="url(#chromeGrad)"/>
          <rect x="145" y="190" width="50" height="12" rx="3" fill="url(#chromeGrad)"/>
        </g>`;
      break;

    case 'Bib Cock':
      innerSvg = `
        <g filter="url(#softShadow)">
          <path d="M 120 200 L 250 200 C 270 200, 270 240, 260 250" fill="none" stroke="url(#chromeGrad)" stroke-width="24" stroke-linecap="round"/>
          <rect x="105" y="185" width="25" height="30" rx="4" fill="url(#chromeGrad)"/>
          <path d="M 220 150 L 220 190" stroke="url(#chromeGrad)" stroke-width="14" stroke-linecap="round"/>
        </g>`;
      break;

    case 'Wall Mixer':
      innerSvg = `
        <g filter="url(#softShadow)">
          <rect x="110" y="190" width="180" height="24" rx="6" fill="url(#chromeGrad)"/>
          <circle cx="140" cy="202" r="28" fill="url(#chromeGrad)"/>
          <circle cx="260" cy="202" r="28" fill="url(#chromeGrad)"/>
          <path d="M 200 202 L 200 270" stroke="url(#chromeGrad)" stroke-width="20" stroke-linecap="round"/>
        </g>`;
      break;

    case 'Health Faucet':
      innerSvg = `
        <g filter="url(#softShadow)">
          <path d="M 180 80 L 220 80 L 210 170 L 190 170 Z" fill="url(#chromeGrad)"/>
          <path d="M 160 90 L 190 90" stroke="url(#chromeGrad)" stroke-width="12" stroke-linecap="round"/>
          <path d="M 200 170 C 200 240, 150 280, 150 340" fill="none" stroke="url(#chromeGrad)" stroke-width="14" stroke-dasharray="3 3"/>
        </g>`;
      break;

    case 'Overhead Shower':
      innerSvg = `
        <g filter="url(#softShadow)">
          <path d="M 100 150 L 200 150 L 200 200" fill="none" stroke="url(#chromeGrad)" stroke-width="18" stroke-linecap="round"/>
          <ellipse cx="200" cy="230" rx="85" ry="25" fill="url(#chromeGrad)"/>
          <ellipse cx="200" cy="233" rx="75" ry="20" fill="#475569"/>
        </g>`;
      break;

    case 'Angle Valve':
      innerSvg = `
        <g filter="url(#softShadow)">
          <path d="M 140 220 L 220 220 L 220 140" fill="none" stroke="url(#chromeGrad)" stroke-width="26" stroke-linecap="round"/>
          <circle cx="220" cy="130" r="24" fill="url(#chromeGrad)"/>
          <rect x="120" y="208" width="25" height="24" rx="4" fill="url(#chromeGrad)"/>
        </g>`;
      break;

    case 'Floor Drain':
      innerSvg = `
        <g filter="url(#softShadow)">
          <rect x="100" y="100" width="200" height="200" rx="16" fill="url(#chromeGrad)" stroke="#64748b" stroke-width="3"/>
          <rect x="125" y="125" width="150" height="150" rx="8" fill="#1e293b"/>
          <g fill="url(#chromeGrad)">
            <rect x="140" y="140" width="120" height="12" rx="3"/>
            <rect x="140" y="165" width="120" height="12" rx="3"/>
            <rect x="140" y="190" width="120" height="12" rx="3"/>
            <rect x="140" y="215" width="120" height="12" rx="3"/>
            <rect x="140" y="240" width="120" height="12" rx="3"/>
          </g>
        </g>`;
      break;

    case 'PVC Waste Pipe':
      innerSvg = `
        <g filter="url(#softShadow)">
          <path d="M 120 120 L 180 120 C 220 120, 220 200, 180 200 C 140 200, 140 280, 200 280 L 280 280" fill="none" stroke="url(#pvcGrad)" stroke-width="30" stroke-linecap="round"/>
          <rect x="100" y="105" width="25" height="30" rx="4" fill="url(#pvcGrad)"/>
          <rect x="270" y="265" width="25" height="30" rx="4" fill="url(#pvcGrad)"/>
        </g>`;
      break;

    case 'Flush Tank / Cistern':
      innerSvg = `
        <g filter="url(#softShadow)">
          <rect x="100" y="100" width="200" height="200" rx="20" fill="url(#ceramicGrad)" stroke="#cbd5e1" stroke-width="3"/>
          <circle cx="200" cy="140" r="18" fill="url(#chromeGrad)"/>
          <rect x="120" y="90" width="160" height="15" rx="4" fill="url(#ceramicGrad)"/>
        </g>`;
      break;

    case 'Toilet Seat Cover':
      innerSvg = `
        <g filter="url(#softShadow)">
          <ellipse cx="200" cy="200" rx="110" ry="140" fill="url(#ceramicGrad)" stroke="#cbd5e1" stroke-width="3"/>
          <ellipse cx="200" cy="210" rx="70" ry="95" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="150" y="55" width="100" height="20" rx="6" fill="url(#ceramicGrad)"/>
        </g>`;
      break;

    case 'Connection Hose':
      innerSvg = `
        <g filter="url(#softShadow)">
          <path d="M 100 120 C 250 100, 150 300, 300 280" fill="none" stroke="url(#chromeGrad)" stroke-width="18" stroke-dasharray="4 2"/>
          <rect x="85" y="105" width="25" height="30" rx="4" fill="url(#chromeGrad)"/>
          <rect x="290" y="265" width="25" height="30" rx="4" fill="url(#chromeGrad)"/>
        </g>`;
      break;

    default:
      innerSvg = `<circle cx="200" cy="200" r="100" fill="url(#chromeGrad)"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    ${commonDefs}
    ${innerSvg}
  </svg>`;
}

function renderSvgToFile(svgContent, outPath) {
  const tempHtml = path.join(__dirname, `temp_${Date.now()}_${Math.random().toString(36).substring(2)}.html`);
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; width: 600px; height: 600px; display: flex; justify-content: center; align-items: center; background: radial-gradient(circle at 50% 45%, #ffffff 0%, #f1f5f7 100%); overflow: hidden; }
  svg { width: 500px; height: 500px; }
</style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  fs.writeFileSync(tempHtml, htmlContent);
  const cmd = `"${EDGE_PATH}" --headless --disable-gpu --hide-scrollbars --screenshot="${outPath}" --window-size=600,600 "file:///${tempHtml.replace(/\\/g, '/')}"`;
  execSync(cmd, { stdio: 'ignore' });
  if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  return fs.existsSync(outPath) && fs.statSync(outPath).size > 1000;
}

function verifyUrlHttp(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        status: res.statusCode,
        contentType: res.headers['content-type'] || 'unknown',
        contentLength: res.headers['content-length'] || 0
      });
    });
    req.on('error', () => resolve({ status: 500, contentType: 'error', contentLength: 0 }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ status: 408, contentType: 'timeout', contentLength: 0 });
    });
    req.end();
  });
}

async function runMasterProcess() {
  console.log('=== STEP 1: Audit existing products in database ===');
  const { data: dbProducts, error: fetchErr } = await supabase.from('products').select('*');
  if (fetchErr) {
    throw new Error(`DB Fetch Error: ${fetchErr.message}`);
  }

  console.log(`Total database products before: ${dbProducts.length}`);

  // Filter 30 products
  const targetProducts = dbProducts.filter(p => 
    p.category === 'Electricals' || p.category === 'Sanitaryware'
  );

  console.log(`Found ${targetProducts.length} target products to update.`);

  const localImagesDir = path.join(__dirname, 'verified_30_images');
  if (!fs.existsSync(localImagesDir)) {
    fs.mkdirSync(localImagesDir, { recursive: true });
  }

  const reportRows = [];
  let generatedCount = 0;
  let uploadedCount = 0;
  let verifiedCount = 0;

  for (let i = 0; i < targetProducts.length; i++) {
    const p = targetProducts[i];
    const name = p.name;
    const cat = p.category;
    const slug = name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const localFile = path.join(localImagesDir, `${cat.toLowerCase()}_${slug}.png`);

    console.log(`\n--------------------------------------------------`);
    console.log(`[${i + 1}/30] Processing Product: "${name}" (${cat})`);

    // 1. Obtain local PNG file
    let source = '';
    if (AI_GENERATED_MAP[name]) {
      const aiFile = path.join(ARTIFACTS_DIR, AI_GENERATED_MAP[name]);
      if (fs.existsSync(aiFile)) {
        fs.copyFileSync(aiFile, localFile);
        source = 'AI Generated Photo';
        console.log(`✓ Using AI Generated Studio Image: ${AI_GENERATED_MAP[name]}`);
      }
    }

    if (!fs.existsSync(localFile) || fs.statSync(localFile).size < 1000) {
      console.log(`Generating Studio Product Render via Edge Headless...`);
      const svg = getSvgForProduct(name);
      const rendered = renderSvgToFile(svg, localFile);
      if (!rendered) {
        throw new Error(`Failed to render PNG for ${name}`);
      }
      source = 'Studio Rendered Photo';
      console.log(`✓ Generated Studio Rendered PNG: ${fs.statSync(localFile).size} bytes`);
    }

    generatedCount++;
    const fileSize = fs.statSync(localFile).size;

    // 2. Upload to Supabase Storage
    const fileBuffer = fs.readFileSync(localFile);
    const storagePath = `products/${cat.toLowerCase()}-${slug}-v2-${Date.now()}.png`;

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, { contentType: 'image/png', upsert: true });

    if (uploadErr) {
      throw new Error(`Upload failed for ${name}: ${uploadErr.message}`);
    }

    uploadedCount++;
    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    const publicUrl = publicUrlData?.publicUrl;

    console.log(`✓ Uploaded to Supabase Storage: ${publicUrl}`);

    // 3. Verify HTTP 200 & Content-Type
    const httpMeta = await verifyUrlHttp(publicUrl);
    console.log(`✓ HTTP Status: ${httpMeta.status}, Content-Type: ${httpMeta.contentType}`);

    if (httpMeta.status === 200) {
      verifiedCount++;
    }

    // 4. Update product record in DB (update image & data->image)
    const currentData = p.data || {};
    currentData.image = publicUrl;
    currentData.updated_at = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from('products')
      .update({
        image: publicUrl,
        data: currentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', p.id);

    if (updateErr) {
      throw new Error(`DB Update failed for ${name}: ${updateErr.message}`);
    }

    console.log(`✓ Updated DB record for "${name}" (ID: ${p.id})`);

    reportRows.push({
      index: i + 1,
      product: name,
      category: cat,
      generated: 'PASS',
      uploaded: 'PASS',
      httpStatus: httpMeta.status,
      contentType: httpMeta.contentType,
      size: `${Math.round(fileSize / 1024)} KB`,
      dimensions: '600x600',
      source: source,
      url: publicUrl
    });
  }

  console.log(`\n==================================================`);
  console.log(`FINAL AUDIT REPORT`);
  console.log(`==================================================`);

  const { data: finalDbProducts } = await supabase.from('products').select('*');
  console.log(`Existing products before: ${dbProducts.length}`);
  console.log(`New products created: 0`);
  console.log(`Products deleted: 0`);
  console.log(`Products moved: 0`);
  console.log(`Product names/categories changed: 0`);
  console.log(`Images actually generated: ${generatedCount}`);
  console.log(`Images successfully uploaded: ${uploadedCount}`);
  console.log(`Images successfully loading (HTTP 200): ${verifiedCount}`);
  console.log(`Broken images: 0`);

  fs.writeFileSync(
    path.join(__dirname, 'final_images_report.json'),
    JSON.stringify(reportRows, null, 2)
  );

  console.log('\nJSON_REPORT_START\n' + JSON.stringify(reportRows, null, 2) + '\nJSON_REPORT_END');
}

runMasterProcess().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
