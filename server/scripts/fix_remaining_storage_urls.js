const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://ueohqicjodxwkwdxcrnj.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.DESTINATION_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'RAJA_ELE';

async function fixBrandsAndGallery() {
  console.log('=== FIXING REMAINING OLD SUPABASE STORAGE URLS IN BRANDS & GALLERY ===\n');

  // 1. Inspect Brands
  const { data: brands, error: bErr } = await supabase.from('brands').select('*');
  if (bErr) throw bErr;

  console.log(`Found ${brands.length} brand records.`);

  for (const bRow of brands) {
    const item = bRow.data || {};
    const logoUrl = item.logo || bRow.logo;
    if (typeof logoUrl === 'string' && logoUrl.includes('yfbzapzceoqkwzsmsjmk')) {
      console.log(`Brand requiring migration: ID=${bRow.id}, Name=${item.name || bRow.name}, Logo=${logoUrl}`);

      // Check if local brand image exists in client/public/assets/brands or client/src/assets/brands
      // Name-based mapping for brands
      const brandNameMap = {
        'Ramco Supergrade': 'ramco-supergrade.png',
        'VELORA': 'velora.jpg',
        'RK Innovations': 'rk-innovations.jpg',
        'Dr. Fixit': 'dr-fixit.png',
        'Fosroc': 'fosroc.png',
        'Zycosil+': 'zycosil-plus.png',
        'MYNK': 'mynk.png'
      };

      const mappedName = brandNameMap[item.name || bRow.name];
      const fileName = mappedName || logoUrl.split('/').pop().split('?')[0];
      const localPublic = path.join(__dirname, '../../client/public/assets/brands', fileName);
      const localSrc = path.join(__dirname, '../../client/src/assets/brands', fileName);

      let targetLocalPath = null;
      if (fs.existsSync(localPublic)) targetLocalPath = localPublic;
      else if (fs.existsSync(localSrc)) targetLocalPath = localSrc;

      if (targetLocalPath) {
        console.log(` -> Local asset found for brand "${bRow.name || item.name}" at: ${targetLocalPath}. Uploading...`);
        const fileBuffer = fs.readFileSync(targetLocalPath);
        const storagePath = `brands/${bRow.id}-${fileName}`;

        const { data: upData, error: upErr } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileBuffer, { contentType: fileName.endsWith('.png') ? 'image/png' : 'image/jpeg', upsert: true });

        if (upErr) {
          console.error(` Failed to upload ${storagePath}:`, upErr.message);
          continue;
        }

        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
        const newPublicUrl = urlData?.publicUrl;

        if (newPublicUrl) {
          console.log(` Uploaded! New Public URL: ${newPublicUrl}`);
          const updatedItem = { ...item, logo: newPublicUrl };
          const { error: uErr } = await supabase
            .from('brands')
            .update({ logo: newPublicUrl, data: updatedItem, updated_at: new Date().toISOString() })
            .eq('id', bRow.id);

          if (uErr) console.error(` Failed to update DB row for brand ${bRow.id}:`, uErr.message);
          else console.log(` Successfully updated DB record for brand ${bRow.id}!`);
        }
      } else {
        console.warn(` Could not find local file ${fileName} for brand ${bRow.id}`);
      }
    }
  }

  // 2. Inspect Gallery
  const { data: gallery, error: gErr } = await supabase.from('gallery').select('*');
  if (gErr) throw gErr;

  console.log(`\nFound ${gallery.length} gallery records.`);

  const galleryIdMap = {
    'g-1113': 'gallery-01.jpeg',
    '1790257567009-dtkvf': 'gallery-02.jpeg',
    '1790257343259-t7gj1': 'gallery-03.jpeg',
    '1790257447637-0piko': 'gallery-04.jpeg',
    '1790257475316-5src4': 'gallery-05.jpeg',
    '1790257511023-tr05i': 'gallery-06.jpeg',
    '1790257529703-8tbqz': 'gallery-07.jpeg',
  };

  for (const gRow of gallery) {
    const item = gRow.data || {};
    const imgUrl = item.image || gRow.image;
    if (typeof imgUrl === 'string' && imgUrl.includes('yfbzapzceoqkwzsmsjmk')) {
      console.log(`Gallery requiring migration: ID=${gRow.id}, Title=${item.title || gRow.title}, Image=${imgUrl}`);

      const mappedName = galleryIdMap[gRow.id];
      const fileName = mappedName || imgUrl.split('/').pop().split('?')[0];
      const localPublic = path.join(__dirname, '../../client/public/assets/gallery', fileName);
      const localSrc = path.join(__dirname, '../../client/src/assets/gallery', fileName);

      let targetLocalPath = null;
      if (fs.existsSync(localPublic)) targetLocalPath = localPublic;
      else if (fs.existsSync(localSrc)) targetLocalPath = localSrc;

      if (targetLocalPath) {
        console.log(` -> Local gallery asset found at: ${targetLocalPath}. Uploading...`);
        const fileBuffer = fs.readFileSync(targetLocalPath);
        const storagePath = `gallery/${gRow.id}-${fileName}`;

        const { data: upData, error: upErr } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileBuffer, { contentType: 'image/jpeg', upsert: true });

        if (upErr) {
          console.error(` Failed to upload ${storagePath}:`, upErr.message);
          continue;
        }

        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
        const newPublicUrl = urlData?.publicUrl;

        if (newPublicUrl) {
          console.log(` Uploaded! New Public URL: ${newPublicUrl}`);
          const updatedItem = { ...item, image: newPublicUrl };
          const { error: uErr } = await supabase
            .from('gallery')
            .update({ image: newPublicUrl, data: updatedItem, updated_at: new Date().toISOString() })
            .eq('id', gRow.id);

          if (uErr) console.error(` Failed to update DB row for gallery ${gRow.id}:`, uErr.message);
          else console.log(` Successfully updated DB record for gallery ${gRow.id}!`);
        }
      } else {
        console.warn(` Could not find local gallery file ${fileName} for gallery item ${gRow.id}`);
      }
    }
  }

  console.log('\n=== BRANDS & GALLERY STORAGE MIGRATION COMPLETED ===');
}

fixBrandsAndGallery().catch(err => {
  console.error('Fatal error in fix script:', err);
});
