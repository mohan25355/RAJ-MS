/**
 * add_construction_chemicals.js
 * Creates the "Construction Chemicals" category and adds 5 brands:
 *   1. Dr. Fixit    (supplied logo: media__1790264425423.png)
 *   2. Fosroc       (supplied logo: media__1790264425388.png)
 *   3. Zycosil+     (supplied logo: media__1790264425392.png)
 *   4. MYNK         (supplied logo: media__1790264425405.jpg)
 *   5. Ramco Supergrade (supplied logo: media__1790264425436.png)
 *
 * Rules:
 *  - Canonical brand "Dr. Fixit" already exists (Waterproofing) → add a NEW PLACEMENT row (same name, new category)
 *  - "Zycocil+" exists in Waterproofing → add NEW PLACEMENT row for "Zycosil+" in Construction Chemicals
 *  - Fosroc, MYNK, Ramco Supergrade are new → create fresh brand rows
 *  - Preserves all existing data
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = 'RAJA_ELE';
const MEDIA_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\bffb577f-bd9b-4f58-a0c2-d3356ca8aebc';

const LOGOS = [
  { brand: 'Dr. Fixit',         file: 'media__1790264425423.png', ext: 'png', mime: 'image/png' },
  { brand: 'Fosroc',            file: 'media__1790264425388.png', ext: 'png', mime: 'image/png' },
  { brand: 'Zycosil+',         file: 'media__1790264425392.png', ext: 'png', mime: 'image/png' },
  { brand: 'MYNK',              file: 'media__1790264425405.jpg', ext: 'jpg', mime: 'image/jpeg' },
  { brand: 'Ramco Supergrade',  file: 'media__1790264425436.png', ext: 'png', mime: 'image/png' },
];

const idGen = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

async function uploadLogo(brand, file, ext, mime) {
  const filePath = path.join(MEDIA_DIR, file);
  const buffer = fs.readFileSync(filePath);
  const safeId = brand.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const storagePath = `brands/${safeId}-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, buffer, { contentType: mime, upsert: true });

  if (error) throw new Error(`Upload failed for ${brand}: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
  const publicUrl = urlData?.publicUrl;
  console.log(`✅ Uploaded logo for ${brand}: ${publicUrl}`);
  return publicUrl;
}

async function run() {
  console.log('\n=== Step 1: Create Construction Chemicals category ===\n');

  const { data: existingCat } = await supabase
    .from('categories')
    .select('*')
    .ilike('name', 'Construction Chemicals')
    .maybeSingle();

  if (existingCat) {
    console.log('⚠️  "Construction Chemicals" category already exists. Skipping creation.');
  } else {
    const catId = idGen();
    const catData = {
      id: catId,
      name: 'Construction Chemicals',
      description: 'High-performance chemical solutions for construction.',
      icon: 'Package',
      color: 'green',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=85',
      display_order: 13,
      is_active: true,
    };

    const { error: catError } = await supabase.from('categories').insert({
      id: catId,
      name: catData.name,
      image: catData.image,
      data: catData,
      updated_at: new Date().toISOString(),
    });

    if (catError) {
      console.error('❌ Category creation failed:', catError.message);
      process.exit(1);
    }
    console.log(`✅ Created category "Construction Chemicals" (id: ${catId}, display_order: 13)`);
  }

  console.log('\n=== Step 2: Upload logos to Supabase Storage ===\n');

  const logoUrls = {};
  for (const { brand, file, ext, mime } of LOGOS) {
    try {
      logoUrls[brand] = await uploadLogo(brand, file, ext, mime);
    } catch (err) {
      console.error(`❌ ${err.message}`);
      process.exit(1);
    }
  }

  console.log('\n=== Step 3: Create brand placement rows ===\n');

  // Check for duplicate placements (same name + category) before inserting
  const { data: allBrands } = await supabase.from('brands').select('id, name, data');
  const existingPlacements = new Set(
    (allBrands || []).map(b => `${(b.name || '').trim().toLowerCase()}::${(b.data?.category || '').trim().toLowerCase()}`)
  );

  const newBrands = [
    { name: 'Dr. Fixit',        logo: logoUrls['Dr. Fixit'],       display_order: 1 },
    { name: 'Fosroc',           logo: logoUrls['Fosroc'],          display_order: 2 },
    { name: 'Zycosil+',        logo: logoUrls['Zycosil+'],       display_order: 3 },
    { name: 'MYNK',             logo: logoUrls['MYNK'],            display_order: 4 },
    { name: 'Ramco Supergrade', logo: logoUrls['Ramco Supergrade'], display_order: 5 },
  ];

  for (const brand of newBrands) {
    const placementKey = `${brand.name.trim().toLowerCase()}::construction chemicals`;

    if (existingPlacements.has(placementKey)) {
      console.log(`⚠️  Skipping "${brand.name}" in Construction Chemicals — already exists.`);
      continue;
    }

    const newId = idGen();
    const item = {
      id: newId,
      name: brand.name,
      logo: brand.logo,
      category: 'Construction Chemicals',
      display_order: brand.display_order,
      is_active: true,
    };

    const { error } = await supabase.from('brands').insert({
      id: newId,
      name: brand.name,
      logo: brand.logo,
      data: item,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`❌ Failed to create brand "${brand.name}":`, error.message);
      process.exit(1);
    }

    console.log(`✅ Created brand placement: "${brand.name}" → Construction Chemicals (order: ${brand.display_order})`);
  }

  console.log('\n=== Step 4: Verification ===\n');

  const { data: verifyBrands } = await supabase
    .from('brands')
    .select('id, name, logo, data')
    .eq('data->>category', 'Construction Chemicals');

  console.log(`Found ${verifyBrands?.length || 0} brands in Construction Chemicals:`);
  (verifyBrands || []).forEach(b => {
    console.log(`  - ${b.name} | logo: ${b.logo?.substring(0, 60)}... | order: ${b.data?.display_order}`);
  });

  const { data: verifyCategory } = await supabase
    .from('categories')
    .select('id, name, display_order, is_active')
    .ilike('name', 'Construction Chemicals')
    .maybeSingle();

  console.log('\nCategory record:', verifyCategory);

  console.log('\n✅ All done! Construction Chemicals category and 5 brands added successfully.\n');
  console.log('The public Brands page will show "Construction Chemicals" with 5 brands after cache refresh.');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
