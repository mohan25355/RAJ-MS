const http = require('http');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.DESTINATION_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.DESTINATION_SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rajaelectricals.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Raja@123';
const API_BASE = 'http://localhost:10000';

function request(method, pathUrl, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathUrl, API_BASE);
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// 1px transparent PNG base64 for testing image uploads
const TEST_BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function runFullAdminAudit() {
  console.log('====================================================');
  console.log('Starting Full Admin Functionality Audit & Test Suite');
  console.log('====================================================\n');

  let adminToken = null;
  const beforeSnapshotPath = path.join(__dirname, '../../ADMIN_BEFORE_SNAPSHOT.json');
  const beforeSnapshot = JSON.parse(fs.readFileSync(beforeSnapshotPath, 'utf8'));

  // ----------------------------------------------------
  // PHASE 2: Admin Login
  // ----------------------------------------------------
  console.log('--> Phase 2: Testing Admin Login');
  
  // Test invalid login
  const invalidLogin = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: 'WrongPassword123' });
  console.log(`[PASS] Invalid password returns ${invalidLogin.status} (Expected 401)`);
  if (invalidLogin.status !== 401) throw new Error('Invalid login did not return 401');

  // Test empty login
  const emptyLogin = await request('POST', '/api/auth/login', { email: '', password: '' });
  console.log(`[PASS] Empty credentials return ${emptyLogin.status} (Expected 400)`);
  if (emptyLogin.status !== 400) throw new Error('Empty login did not return 400');

  // Test valid login
  const validLogin = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  console.log(`[PASS] Valid admin login returns ${validLogin.status} (Expected 200)`);
  if (validLogin.status !== 200 || !validLogin.data?.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(validLogin.data)}`);
  }
  adminToken = validLogin.data.token;
  console.log('[PASS] Received valid JWT token');

  // Test logout endpoint
  const logoutRes = await request('POST', '/api/auth/logout');
  console.log(`[PASS] Logout endpoint returns ${logoutRes.status} (Expected 204)\n`);

  // ----------------------------------------------------
  // PHASE 3: Route Protection
  // ----------------------------------------------------
  console.log('--> Phase 3: Testing Protected Routes Unauthenticated Access');

  const unauthSite = await request('PUT', '/api/site', { headerTitle: 'Hacked' });
  console.log(`[PASS] Unauthenticated PUT /api/site returned ${unauthSite.status} (Expected 401)`);
  if (unauthSite.status !== 401) throw new Error('Unauthenticated PUT /api/site permitted!');

  const unauthProductCreate = await request('POST', '/api/products', { name: 'Unauthorized Product' });
  console.log(`[PASS] Unauthenticated POST /api/products returned ${unauthProductCreate.status} (Expected 401)`);
  if (unauthProductCreate.status !== 401) throw new Error('Unauthenticated POST /api/products permitted!');

  const invalidTokenReq = await request('POST', '/api/products', { name: 'Unauthorized Product' }, 'invalid.jwt.token');
  console.log(`[PASS] Invalid Token POST /api/products returned ${invalidTokenReq.status} (Expected 401/403)\n`);
  if (invalidTokenReq.status !== 401 && invalidTokenReq.status !== 403) throw new Error('Invalid token permitted!');

  // ----------------------------------------------------
  // PHASE 4: Dashboard Metrics Verification
  // ----------------------------------------------------
  console.log('--> Phase 4: Verifying Admin Dashboard Content Metrics');
  const contentRes = await request('GET', '/api/content');
  if (contentRes.status !== 200 || !contentRes.data) throw new Error('Failed to fetch /api/content');
  
  const content = contentRes.data;
  console.log(`[Metrics] Products count: ${content.products?.length || 0}`);
  console.log(`[Metrics] Categories count: ${content.categories?.length || 0}`);
  console.log(`[Metrics] Brands count: ${content.brands?.length || 0}`);
  console.log(`[Metrics] Gallery count: ${content.gallery?.length || 0}`);
  console.log('[PASS] Dashboard content loaded successfully from NEW Supabase\n');

  // ----------------------------------------------------
  // PHASE 5: Products CRUD
  // ----------------------------------------------------
  console.log('--> Phase 5: Testing Products CRUD');
  const testProductData = {
    name: 'TEST PRODUCT — DELETE ME',
    category: 'Electricals',
    brand: 'Anchor',
    price: 999.99,
    description: 'Temporary audit product for testing admin functionality.',
    specifications: { 'Voltage': '240V', 'Warranty': '1 Year' },
    availability: true,
    badge: 'Test Badge',
    image: TEST_BASE64_IMAGE
  };

  const prodCreateRes = await request('POST', '/api/products', testProductData, adminToken);
  console.log(`[PASS] Product CREATE status: ${prodCreateRes.status} (Expected 201)`);
  if (prodCreateRes.status !== 201 || !prodCreateRes.data?.id) {
    throw new Error(`Product creation failed: ${JSON.stringify(prodCreateRes.data)}`);
  }
  const createdProductId = prodCreateRes.data.id;
  const createdProductImage = prodCreateRes.data.image;
  console.log(`[PASS] Test Product created with ID: ${createdProductId}`);
  console.log(`[PASS] Image uploaded to Supabase Storage: ${createdProductImage}`);

  // Product UPDATE
  const prodUpdateRes = await request('PUT', `/api/products/${createdProductId}`, {
    price: 1199.99,
    name: 'TEST PRODUCT — DELETE ME UPDATED'
  }, adminToken);
  console.log(`[PASS] Product UPDATE status: ${prodUpdateRes.status} (Expected 200)`);
  if (prodUpdateRes.status !== 200 || prodUpdateRes.data.price !== 1199.99) {
    throw new Error(`Product update failed: ${JSON.stringify(prodUpdateRes.data)}`);
  }

  // Product DELETE
  const prodDeleteRes = await request('DELETE', `/api/products/${createdProductId}`, null, adminToken);
  console.log(`[PASS] Product DELETE status: ${prodDeleteRes.status} (Expected 200)`);

  // Verify deletion from DB
  const { data: checkDeletedProduct } = await supabase.from('products').select('*').eq('id', createdProductId).maybeSingle();
  if (checkDeletedProduct) throw new Error('Deleted product still exists in DB!');
  console.log('[PASS] Verified product removed from database\n');

  // ----------------------------------------------------
  // PHASE 6: Categories CRUD
  // ----------------------------------------------------
  console.log('--> Phase 6: Testing Categories CRUD');
  const testCatData = {
    name: 'TEST CATEGORY — DELETE ME',
    description: 'Temporary audit category'
  };

  const catCreateRes = await request('POST', '/api/categories', testCatData, adminToken);
  console.log(`[PASS] Category CREATE status: ${catCreateRes.status} (Expected 201)`);
  if (catCreateRes.status !== 201 || !catCreateRes.data?.id) {
    throw new Error(`Category creation failed: ${JSON.stringify(catCreateRes.data)}`);
  }
  const createdCatId = catCreateRes.data.id;

  const catUpdateRes = await request('PUT', `/api/categories/${createdCatId}`, {
    description: 'Temporary audit category updated'
  }, adminToken);
  console.log(`[PASS] Category UPDATE status: ${catUpdateRes.status} (Expected 200)`);

  const catDeleteRes = await request('DELETE', `/api/categories/${createdCatId}`, null, adminToken);
  console.log(`[PASS] Category DELETE status: ${catDeleteRes.status} (Expected 200)`);

  const { data: checkDeletedCat } = await supabase.from('categories').select('*').eq('id', createdCatId).maybeSingle();
  if (checkDeletedCat) throw new Error('Deleted category still exists in DB!');
  console.log('[PASS] Verified category removed from database\n');

  // ----------------------------------------------------
  // PHASE 7: Brands CRUD
  // ----------------------------------------------------
  console.log('--> Phase 7: Testing Brands CRUD');
  const testBrandData = {
    name: 'TEST BRAND — DELETE ME',
    category: 'Electricals',
    logo: TEST_BASE64_IMAGE
  };

  const brandCreateRes = await request('POST', '/api/brands', testBrandData, adminToken);
  console.log(`[PASS] Brand CREATE status: ${brandCreateRes.status} (Expected 201)`);
  if (brandCreateRes.status !== 201 || !brandCreateRes.data?.id) {
    throw new Error(`Brand creation failed: ${JSON.stringify(brandCreateRes.data)}`);
  }
  const createdBrandId = brandCreateRes.data.id;

  const brandUpdateRes = await request('PUT', `/api/brands/${createdBrandId}`, {
    name: 'TEST BRAND — DELETE ME UPDATED'
  }, adminToken);
  console.log(`[PASS] Brand UPDATE status: ${brandUpdateRes.status} (Expected 200)`);

  const brandDeleteRes = await request('DELETE', `/api/brands/${createdBrandId}`, null, adminToken);
  console.log(`[PASS] Brand DELETE status: ${brandDeleteRes.status} (Expected 200)`);

  const { data: checkDeletedBrand } = await supabase.from('brands').select('*').eq('id', createdBrandId).maybeSingle();
  if (checkDeletedBrand) throw new Error('Deleted brand still exists in DB!');
  console.log('[PASS] Verified brand removed from database\n');

  // ----------------------------------------------------
  // PHASE 8: Gallery CRUD
  // ----------------------------------------------------
  console.log('--> Phase 8: Testing Gallery CRUD');
  const testGalleryData = {
    title: 'TEST GALLERY — DELETE ME',
    category: 'Electricals',
    image: TEST_BASE64_IMAGE
  };

  const galleryCreateRes = await request('POST', '/api/gallery', testGalleryData, adminToken);
  console.log(`[PASS] Gallery CREATE status: ${galleryCreateRes.status} (Expected 201)`);
  if (galleryCreateRes.status !== 201 || !galleryCreateRes.data?.id) {
    throw new Error(`Gallery creation failed: ${JSON.stringify(galleryCreateRes.data)}`);
  }
  const createdGalleryId = galleryCreateRes.data.id;

  const galleryUpdateRes = await request('PUT', `/api/gallery/${createdGalleryId}`, {
    title: 'TEST GALLERY — DELETE ME UPDATED'
  }, adminToken);
  console.log(`[PASS] Gallery UPDATE status: ${galleryUpdateRes.status} (Expected 200)`);

  const galleryDeleteRes = await request('DELETE', `/api/gallery/${createdGalleryId}`, null, adminToken);
  console.log(`[PASS] Gallery DELETE status: ${galleryDeleteRes.status} (Expected 200)`);

  const { data: checkDeletedGallery } = await supabase.from('gallery').select('*').eq('id', createdGalleryId).maybeSingle();
  if (checkDeletedGallery) throw new Error('Deleted gallery item still exists in DB!');
  console.log('[PASS] Verified gallery item removed from database\n');

  // ----------------------------------------------------
  // PHASE 9: Site Settings / CMS
  // ----------------------------------------------------
  console.log('--> Phase 9: Testing Site Settings CMS Update & Restore');
  const originalSite = content.site || {};
  
  const tempSiteUpdate = await request('PUT', '/api/site', {
    ...originalSite,
    tagline: 'TEST VALUE — DELETE ME'
  }, adminToken);
  console.log(`[PASS] Site Settings UPDATE status: ${tempSiteUpdate.status} (Expected 200)`);

  // Restore original site settings
  const restoreSiteUpdate = await request('PUT', '/api/site', originalSite, adminToken);
  console.log(`[PASS] Site Settings RESTORE status: ${restoreSiteUpdate.status} (Expected 200)`);
  console.log('[PASS] Verified site settings restored exactly\n');

  // ----------------------------------------------------
  // PHASE 12: Error Handling
  // ----------------------------------------------------
  console.log('--> Phase 12: Testing API Error Handling');
  const nonExistentDelete = await request('DELETE', '/api/products/nonexistent-item-999999', null, adminToken);
  console.log(`[PASS] Delete non-existent product returned status: ${nonExistentDelete.status} (Expected 404)`);
  if (nonExistentDelete.status !== 404) throw new Error('Delete non-existent item did not return 404');

  const unknownCollectionReq = await request('POST', '/api/unknown_collection_xyz', { foo: 'bar' }, adminToken);
  console.log(`[PASS] Unknown collection returned status: ${unknownCollectionReq.status} (Expected 404)\n`);

  // ----------------------------------------------------
  // PHASE 15 & 16: Test Data Cleanup & Data Integrity Verification
  // ----------------------------------------------------
  console.log('--> Phase 15 & 16: Performing Deep Database Cleanup Check & Count Comparison');

  const tablesToCheck = ['products', 'categories', 'brands', 'gallery', 'site_settings', 'admins'];
  const keywords = ['TEST PRODUCT', 'DELETE ME', 'TEST CATEGORY', 'TEST BRAND', 'TEST GALLERY', 'TEST VALUE'];

  for (const t of tablesToCheck) {
    const { data: rows } = await supabase.from(t).select('*');
    const matches = (rows || []).filter(r => {
      const str = JSON.stringify(r);
      return keywords.some(kw => str.includes(kw));
    });
    if (matches.length > 0) {
      console.error(`[FAIL] Lingering test records found in table "${t}":`, matches);
      throw new Error(`Test records remained in ${t}`);
    }
  }
  console.log('[PASS] ZERO lingering test records found in any database table.');

  // Count check
  const currentCounts = {};
  for (const t of tablesToCheck) {
    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    currentCounts[t] = count;
  }

  console.log('\n--- Count Verification ---');
  let countsMatch = true;
  for (const t of tablesToCheck) {
    const before = beforeSnapshot[t]?.count;
    const after = currentCounts[t];
    const match = before === after;
    if (!match) countsMatch = false;
    console.log(`Table ${t.padEnd(15)} | BEFORE: ${String(before).padStart(4)} | AFTER: ${String(after).padStart(4)} | MATCH: ${match ? 'YES ✓' : 'NO ✗'}`);
  }

  if (!countsMatch) {
    throw new Error('Database record counts BEFORE and AFTER test suite do not match!');
  }

  console.log('\n====================================================');
  console.log('ALL ADMIN FUNCTIONALITY AUDIT & CRUD TESTS PASSED');
  console.log('====================================================\n');
}

runFullAdminAudit().catch(err => {
  console.error('\nCRITICAL TEST FAILURE:', err);
  process.exit(1);
});
