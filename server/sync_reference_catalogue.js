const http = require('http');

const PORT = 10000;
const EMAIL = 'admin@rajaelectricals.in';
const PASSWORD = 'Raja@123';

function request(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const referenceCategories = [
  { name: 'Paints & Coatings', description: 'Colours for a brighter tomorrow.', icon: 'PaintRoller', color: 'rose', image: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=800&q=85', display_order: 1, is_active: true },
  { name: 'Wires & Cables', description: 'Powering a safer tomorrow.', icon: 'Cable', color: 'gold', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=85', display_order: 2, is_active: true },
  { name: 'Pipes & Plumbing', description: 'Flowing solutions for life.', icon: 'Droplets', color: 'blue', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=85', display_order: 3, is_active: true },
  { name: 'Switches & Electrical', description: 'Smart solutions for modern spaces.', icon: 'Wrench', color: 'purple', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=85', display_order: 4, is_active: true },
  { name: 'Lighting', description: 'Bright ideas for every space.', icon: 'Lightbulb', color: 'gold', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85', display_order: 5, is_active: true },
  { name: 'Fans', description: 'Cool comfort. Every day.', icon: 'Fan', color: 'blue', image: 'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=800&q=85', display_order: 6, is_active: true },
  { name: 'Water Heaters', description: 'Hot water. Happier living.', icon: 'Thermometer', color: 'rose', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=85', display_order: 7, is_active: true },
  { name: 'Sanitaryware & Bathroom', description: 'Elegance for everyday living.', icon: 'Bath', color: 'mint', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=85', display_order: 8, is_active: true },
  { name: 'Water Pumps', description: 'Reliable flow. Always.', icon: 'Droplets', color: 'blue', image: 'https://images.unsplash.com/photo-1581093458791-9d09d2e70ae4?auto=format&fit=crop&w=800&q=85', display_order: 9, is_active: true },
  { name: 'Waterproofing', description: 'Stronger spaces. Longer life.', icon: 'ShieldCheck', color: 'green', image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=85', display_order: 10, is_active: true },
  { name: 'Security & Protection', description: 'Safety for a better tomorrow.', icon: 'Camera', color: 'purple', image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=85', display_order: 11, is_active: true },
  { name: 'Home Appliances', description: 'Everyday essentials. Trusted brands.', icon: 'House', color: 'orange', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=85', display_order: 12, is_active: true },
];

const referenceBrands = [
  // 1. Paints & Coatings (4)
  { name: 'Birla Opus', category: 'Paints & Coatings', logo: '1.png', display_order: 1, is_active: true },
  { name: 'Nippon Paint', category: 'Paints & Coatings', logo: '1.png', display_order: 2, is_active: true },
  { name: 'Kansai Nerolac', category: 'Paints & Coatings', logo: '10.jpg', display_order: 3, is_active: true },
  { name: 'Vapour Paints', category: 'Paints & Coatings', logo: '26.png', display_order: 4, is_active: true },

  // 2. Wires & Cables (4)
  { name: 'Finolex Cables', category: 'Wires & Cables', logo: '3.jpg', display_order: 1, is_active: true },
  { name: 'RR Kabel', category: 'Wires & Cables', logo: '24.jpg', display_order: 2, is_active: true },
  { name: 'Orbit', category: 'Wires & Cables', logo: '25.png', display_order: 3, is_active: true },
  { name: 'Luker', category: 'Wires & Cables', logo: '25.png', display_order: 4, is_active: true },

  // 3. Pipes & Plumbing (3)
  { name: 'Astral Pipes', category: 'Pipes & Plumbing', logo: '4.jpg', display_order: 1, is_active: true },
  { name: 'Finolex Pipes', category: 'Pipes & Plumbing', logo: '15.png', display_order: 2, is_active: true },
  { name: 'Ashirvad', category: 'Pipes & Plumbing', logo: '9.png', display_order: 3, is_active: true },

  // 4. Switches & Electrical (6)
  { name: 'Legrand', category: 'Switches & Electrical', logo: '5.png', display_order: 1, is_active: true },
  { name: 'Norwood', category: 'Switches & Electrical', logo: '11.png', display_order: 2, is_active: true },
  { name: 'Norisys', category: 'Switches & Electrical', logo: '23.png', display_order: 3, is_active: true },
  { name: 'GM', category: 'Switches & Electrical', logo: '23.png', display_order: 4, is_active: true },
  { name: 'Anchor by Panasonic', category: 'Switches & Electrical', logo: '7.png', display_order: 5, is_active: true },
  { name: 'Roma', category: 'Switches & Electrical', logo: '7.png', display_order: 6, is_active: true },

  // 5. Lighting (4)
  { name: 'Philips', category: 'Lighting', logo: '14.jpg', display_order: 1, is_active: true },
  { name: 'Jaquar Lighting', category: 'Lighting', logo: '20.png', display_order: 2, is_active: true },
  { name: 'Luker', category: 'Lighting', logo: '25.png', display_order: 3, is_active: true },
  { name: 'Orbit', category: 'Lighting', logo: '25.png', display_order: 4, is_active: true },

  // 6. Fans (8)
  { name: 'Atomberg', category: 'Fans', logo: 'd1.jpg', display_order: 1, is_active: true },
  { name: 'Crompton', category: 'Fans', logo: '16.jpg', display_order: 2, is_active: true },
  { name: 'Almonard', category: 'Fans', logo: 'd2.png', display_order: 3, is_active: true },
  { name: 'Bajaj', category: 'Fans', logo: '8.jpg', display_order: 4, is_active: true },
  { name: 'Polstar', category: 'Fans', logo: 'd3.jpg', display_order: 5, is_active: true },
  { name: 'Orient Electric', category: 'Fans', logo: '22.png', display_order: 6, is_active: true },
  { name: 'Luker', category: 'Fans', logo: '25.png', display_order: 7, is_active: true },
  { name: 'Polar', category: 'Fans', logo: 'd4.png', display_order: 8, is_active: true },

  // 7. Water Heaters (6)
  { name: 'A. O. Smith', category: 'Water Heaters', logo: '21.png', display_order: 1, is_active: true },
  { name: 'Bajaj', category: 'Water Heaters', logo: '8.jpg', display_order: 2, is_active: true },
  { name: 'Crompton', category: 'Water Heaters', logo: '16.jpg', display_order: 3, is_active: true },
  { name: 'Orient Electric', category: 'Water Heaters', logo: '22.png', display_order: 4, is_active: true },
  { name: 'Luker', category: 'Water Heaters', logo: '25.png', display_order: 5, is_active: true },
  { name: 'Parryware', category: 'Water Heaters', logo: '13.png', display_order: 6, is_active: true },

  // 8. Sanitaryware & Bathroom (4)
  { name: 'Jaquar', category: 'Sanitaryware & Bathroom', logo: '20.png', display_order: 1, is_active: true },
  { name: 'Essco by Jaquar', category: 'Sanitaryware & Bathroom', logo: '6.jpg', display_order: 2, is_active: true },
  { name: 'Geberit', category: 'Sanitaryware & Bathroom', logo: '17.png', display_order: 3, is_active: true },
  { name: 'Parryware', category: 'Sanitaryware & Bathroom', logo: '13.png', display_order: 4, is_active: true },

  // 9. Water Pumps (2)
  { name: 'C.R.I. Pumps', category: 'Water Pumps', logo: '19.png', display_order: 1, is_active: true },
  { name: 'Hasten', category: 'Water Pumps', logo: '18.png', display_order: 2, is_active: true },

  // 10. Waterproofing (2)
  { name: 'Dr. Fixit', category: 'Waterproofing', logo: '12.jpg', display_order: 1, is_active: true },
  { name: 'Zycocil+', category: 'Waterproofing', logo: 'd5.png', display_order: 2, is_active: true },

  // 11. Security & Protection (1)
  { name: 'Europa', category: 'Security & Protection', logo: '2.jpg', display_order: 1, is_active: true },

  // 12. Home Appliances (1)
  { name: 'V-Guard', category: 'Home Appliances', logo: '13.png', display_order: 1, is_active: true },
];

async function syncCatalogue() {
  console.log('=== SYNCING REFERENCE CATALOGUE TO SUPABASE ===\n');

  // 1. Admin Login
  const loginRes = await request('/api/auth/login', 'POST', { email: EMAIL, password: PASSWORD });
  if (loginRes.status !== 200 || !loginRes.data.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginRes.data)}`);
  }
  const token = loginRes.data.token;
  console.log('✅ Admin login successful.');

  // 2. Fetch existing Supabase categories & brands
  const currentContent = await request('/api/content', 'GET');
  const existingCategories = currentContent.data.categories || [];
  const existingBrands = currentContent.data.brands || [];

  console.log(`Current Supabase categories count: ${existingCategories.length}`);
  console.log(`Current Supabase brands count: ${existingBrands.length}`);

  // 3. Upsert Categories
  console.log('\n--- Syncing 12 Reference Categories ---');
  for (const cat of referenceCategories) {
    const found = existingCategories.find(c => (c.name || '').trim().toLowerCase() === cat.name.toLowerCase());
    if (found) {
      const updateRes = await request(`/api/categories/${found.id}`, 'PUT', { ...found, ...cat }, token);
      console.log(`  Updated category: "${cat.name}" (ID: ${found.id})`);
    } else {
      const createRes = await request('/api/categories', 'POST', cat, token);
      console.log(`  Created category: "${cat.name}" (ID: ${createRes.data.id})`);
    }
  }

  // 4. Upsert Brands (47 Placements)
  console.log('\n--- Syncing 47 Reference Brand Placements ---');
  let addedCount = 0;
  let updatedCount = 0;

  for (const brand of referenceBrands) {
    const found = existingBrands.find(
      b =>
        (b.name || '').trim().toLowerCase() === brand.name.toLowerCase() &&
        (b.category || '').trim().toLowerCase() === brand.category.toLowerCase()
    );

    if (found) {
      await request(`/api/brands/${found.id}`, 'PUT', { ...found, ...brand }, token);
      updatedCount++;
    } else {
      await request('/api/brands', 'POST', brand, token);
      addedCount++;
    }
  }

  console.log(`\n✅ Brands sync complete: ${addedCount} added, ${updatedCount} updated.`);

  // 5. Verify final /api/content
  const finalContent = await request('/api/content', 'GET');
  const finalCats = finalContent.data.categories || [];
  const finalBrands = finalContent.data.brands || [];

  console.log('\n=== FINAL VERIFICATION FROM SUPABASE ===');
  console.log(`Total Categories in Supabase: ${finalCats.length}`);
  console.log(`Total Brand Placements in Supabase: ${finalBrands.length}`);
}

syncCatalogue().catch(err => {
  console.error('\n❌ SYNC ERROR:', err.message);
  process.exit(1);
});
