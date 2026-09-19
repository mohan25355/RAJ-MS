const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const supabase = require('./supabase');

const records = [
  {
    id: 'g-1111',
    title: "Raja Electricals 'N' Hardwares",
    description: "Our Raja Electricals 'N' Hardwares storefront.",
    category: "Store",
    type: "Store",
    image: "1111.webp",
    display_order: 1,
    is_active: true,
  },
  {
    id: 'g-1112',
    title: "Raja Electricals Exterior",
    description: "Exterior view of the Raja Electricals 'N' Hardwares showroom.",
    category: "Store",
    type: "Store",
    image: "1112.webp",
    display_order: 2,
    is_active: true,
  },
  {
    id: 'g-1113',
    title: "Showroom & Product Display",
    description: "Inside view of our showroom featuring electrical and hardware products.",
    category: "Store",
    type: "Store",
    image: "1113.webp",
    display_order: 3,
    is_active: true,
  },
];

async function seed() {
  console.log('Seeding gallery items into Supabase...');

  // 1. Delete legacy/dummy records if needed or clear old base64 test records
  const existing = await supabase.from('gallery').select('*');
  if (existing.data && existing.data.length > 0) {
    for (const item of existing.data) {
      if (!records.some(r => r.id === item.id)) {
        console.log(`Cleaning old gallery record ${item.id}...`);
        await supabase.from('gallery').delete().eq('id', item.id);
      }
    }
  }

  // 2. Upsert the 3 real records
  for (const item of records) {
    const row = {
      id: item.id,
      title: item.title,
      image: item.image,
      data: item,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('gallery').upsert(row, { onConflict: 'id' }).select();
    if (error) {
      console.error(`Error upserting ${item.id}:`, error);
    } else {
      console.log(`Successfully upserted ${item.id}`);
    }
  }

  console.log('Gallery seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
