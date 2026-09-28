const http = require('http');

const PORT = process.env.PORT || 10000;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    let payload = null;
    if (body) {
      payload = JSON.stringify(body);
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          let parsed = data;
          try {
            parsed = JSON.parse(data);
          } catch (e) {}
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING LOCAL SUPABASE PRODUCTION API VERIFICATION');
  console.log('====================================================');
  let passed = 0;
  let failed = 0;

  const check = (desc, condition) => {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('\n--- 1. Health Endpoint ---');
    const health = await request('GET', '/api/health');
    check('GET /api/health returns 200', health.status === 200);
    check('GET /api/health database is supabase', health.data?.database === 'supabase');

    // 2. Auth login
    console.log('\n--- 2. Admin Authentication ---');
    const login = await request('POST', '/api/auth/login', {
      email: 'admin@rajaelectricals.in',
      password: 'Raja@123',
    });
    check('POST /api/auth/login returns 200', login.status === 200);
    check('POST /api/auth/login returns JWT token', typeof login.data?.token === 'string');
    const token = login.data?.token;

    // 3. Invalid Login
    const invalidLogin = await request('POST', '/api/auth/login', {
      email: 'admin@rajaelectricals.in',
      password: 'WrongPassword123',
    });
    check('POST /api/auth/login with wrong password returns 401', invalidLogin.status === 401);

    // 4. Public Content Endpoint
    console.log('\n--- 3. Public Content Payload ---');
    const content = await request('GET', '/api/content');
    check('GET /api/content returns 200', content.status === 200);
    check('Content contains products array', Array.isArray(content.data?.products));
    check('Content contains brands array', Array.isArray(content.data?.brands));
    check('Content contains categories array', Array.isArray(content.data?.categories));
    check('Content contains site object', typeof content.data?.site === 'object');
    console.log(`   Fetched ${content.data?.products?.length} products, ${content.data?.categories?.length} categories, ${content.data?.brands?.length} brands.`);

    // 5. Active Home Ads
    console.log('\n--- 4. Active Home Advertisement ---');
    const homeAds = await request('GET', '/api/home-ads/active');
    check('GET /api/home-ads/active returns 200', homeAds.status === 200);
    check('Home ads returns success status', homeAds.data?.success === true);

    // 6. Public Enquiry & Order Submission
    console.log('\n--- 5. Public Enquiry & Order Submission ---');
    const enquiry = await request('POST', '/api/enquiries', {
      name: 'Verification Tester',
      phone: '9876543210',
      company: 'Local Test Corp',
      email: 'test@example.com',
      message: 'Testing local production Supabase setup',
    });
    check('POST /api/enquiries returns 201', enquiry.status === 201);

    const order = await request('POST', '/api/orders', {
      customerName: 'Verification Tester',
      phone: '9876543210',
      productName: 'Industrial Cables',
      quantity: 5,
    });
    check('POST /api/orders returns 201', order.status === 201);

    // 7. Protected Admin Endpoints
    if (token) {
      console.log('\n--- 6. Protected Admin Endpoints ---');
      const authHeaders = { Authorization: `Bearer ${token}` };

      const adminEnquiries = await request('GET', '/api/admin/enquiries', null, authHeaders);
      check('GET /api/admin/enquiries returns 200', adminEnquiries.status === 200);
      check('Admin enquiries is array', Array.isArray(adminEnquiries.data));

      const adminOrders = await request('GET', '/api/admin/orders', null, authHeaders);
      check('GET /api/admin/orders returns 200', adminOrders.status === 200);
      check('Admin orders is array', Array.isArray(adminOrders.data));

      const adminHomeAds = await request('GET', '/api/home-ads', null, authHeaders);
      check('GET /api/home-ads (admin) returns 200', adminHomeAds.status === 200);
      check('Admin home ads is array', Array.isArray(adminHomeAds.data));

      // Test CRUD in gallery
      const testId = `test-item-${Date.now()}`;
      const createItem = await request('POST', '/api/gallery', {
        id: testId,
        title: 'Local Verification Test Item',
        type: 'Test',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900'
      }, authHeaders);
      check('POST /api/gallery returns 201', createItem.status === 201);

      const updateItem = await request('PUT', `/api/gallery/${testId}`, {
        title: 'Updated Verification Test Item'
      }, authHeaders);
      check('PUT /api/gallery/:id returns 200', updateItem.status === 200);
      check('Item title was updated', updateItem.data?.title === 'Updated Verification Test Item');

      const deleteItem = await request('DELETE', `/api/gallery/${testId}`, null, authHeaders);
      check('DELETE /api/gallery/:id returns 204', deleteItem.status === 204);
    }

    console.log('\n====================================================');
    console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('API Verification error:', err);
    process.exit(1);
  }
}

runTests();
