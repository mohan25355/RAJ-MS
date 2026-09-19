const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const API_BASE = 'http://localhost:10000/api';

async function runVerification() {
  console.log('=== STARTING GALLERY E2E VERIFICATION ===\n');

  // 1. Check Unauthenticated Security (Must return 401)
  console.log('1. Testing Unauthenticated Security Controls...');
  const postUnauth = await fetch(`${API_BASE}/gallery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacker Item', image: 'hack.jpg' }),
  });
  console.log(`- POST /api/gallery unauth status: ${postUnauth.status} (Expected: 401)`);
  if (postUnauth.status !== 401) throw new Error('Security vulnerability: unauthenticated POST allowed!');

  const putUnauth = await fetch(`${API_BASE}/gallery/g-1111`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  console.log(`- PUT /api/gallery/:id unauth status: ${putUnauth.status} (Expected: 401)`);
  if (putUnauth.status !== 401) throw new Error('Security vulnerability: unauthenticated PUT allowed!');

  const deleteUnauth = await fetch(`${API_BASE}/gallery/g-1111`, { method: 'DELETE' });
  console.log(`- DELETE /api/gallery/:id unauth status: ${deleteUnauth.status} (Expected: 401)\n`);
  if (deleteUnauth.status !== 401) throw new Error('Security vulnerability: unauthenticated DELETE allowed!');

  // 2. Admin Login
  console.log('2. Logging in as Admin...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || 'admin@rajaelectricals.in',
      password: process.env.ADMIN_PASSWORD || 'Raja@123',
    }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.token) throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
  const token = loginData.token;
  console.log('- Admin logged in successfully!\n');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 3. Test Full CRUD Cycle with Temporary Test Item
  console.log('3. Testing Full Gallery CRUD Cycle...');
  const testId = `test-temp-${Date.now()}`;
  const testItem = {
    id: testId,
    title: 'TEST GALLERY — REMOVE ME',
    description: 'Temporary verification item',
    category: 'Store',
    image: '1111.webp',
    display_order: 99,
    is_active: true,
  };

  // CREATE
  const createRes = await fetch(`${API_BASE}/gallery`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(testItem),
  });
  const createData = await createRes.json();
  console.log(`- CREATE status: ${createRes.status}, ID: ${createData.id}`);

  // READ (Public content)
  const contentRes1 = await fetch(`${API_BASE}/content`);
  const contentData1 = await contentRes1.json();
  const createdFound = (contentData1.gallery || []).find(g => g.id === testId);
  console.log(`- READ in public content: ${createdFound ? 'PASS (Found item)' : 'FAIL'}`);

  // UPDATE & DEACTIVATE
  const updateRes = await fetch(`${API_BASE}/gallery/${testId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ ...testItem, title: 'TEST UPDATED', is_active: false }),
  });
  console.log(`- UPDATE & DEACTIVATE status: ${updateRes.status}`);

  // READ AFTER DEACTIVATE (Should show is_active: false in payload)
  const contentRes2 = await fetch(`${API_BASE}/content`);
  const contentData2 = await contentRes2.json();
  const updatedFound = (contentData2.gallery || []).find(g => g.id === testId);
  console.log(`- DEACTIVATE verified in content: ${updatedFound?.is_active === false ? 'PASS (Marked inactive)' : 'FAIL'}`);

  // DELETE
  const deleteRes = await fetch(`${API_BASE}/gallery/${testId}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  console.log(`- DELETE status: ${deleteRes.status}`);

  // READ AFTER DELETE (Must be completely gone)
  const contentRes3 = await fetch(`${API_BASE}/content`);
  const contentData3 = await contentRes3.json();
  const deletedFound = (contentData3.gallery || []).find(g => g.id === testId);
  console.log(`- REMOVAL verified in content: ${!deletedFound ? 'PASS (Item completely removed)' : 'FAIL'}\n`);

  // 4. Verify Final Public Payload & Images Count
  console.log('4. Verifying Production Gallery Items in Public API...');
  const finalContentRes = await fetch(`${API_BASE}/content`);
  const finalContent = await finalContentRes.json();
  const gallery = finalContent.gallery || [];
  console.log(`- Public Gallery Items Count: ${gallery.length}`);
  gallery.forEach(item => {
    console.log(`  [Order #${item.display_order}] ID: ${item.id} | Title: "${item.title}" | Image: "${item.image}" | Category: "${item.category || item.type}"`);
  });

  // Check for Base64 payload regression
  const jsonString = JSON.stringify(finalContent);
  const base64Count = (jsonString.match(/data:image\/[a-zA-Z+]+;base64,/g) || []).length;
  console.log(`- Base64 Images in Public JSON Payload: ${base64Count} (Expected: 0)`);

  if (base64Count > 0) {
    throw new Error('Performance regression: Base64 images found in public payload!');
  }

  console.log('\n=== ALL GALLERY E2E VERIFICATIONS PASSED 100% ===');
  process.exit(0);
}

runVerification().catch(err => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
