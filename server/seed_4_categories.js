require('dotenv').config();
const supabase = require('./supabase');

async function seedCategories() {
  const newCats = [
    { name: 'Nippon Paint', slug: 'nippon-paint', order: 21 },
    { name: 'Kansai Nerolac', slug: 'kansai-nerolac', order: 22 },
    { name: 'Birla Opus', slug: 'birla-opus', order: 23 },
    { name: 'Vapocure Paints', slug: 'vapocure-paints', order: 24 },
  ];

  const { data: existing } = await supabase.from('categories').select('*');
  const existingNames = (existing || []).map(c => c.name?.toLowerCase());

  const created = [];
  const reused = [];

  for (const cat of newCats) {
    if (existingNames.includes(cat.name.toLowerCase())) {
      console.log('Category already exists:', cat.name);
      reused.push(cat.name);
      continue;
    }

    const id = `cat-${cat.slug}`;
    const dataObj = {
      id,
      name: cat.name,
      icon: 'PaintRoller',
      color: 'rose',
      image: '',
      is_active: true,
      description: `${cat.name} industrial and decorative paint products.`,
      display_order: cat.order
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([{ id, name: cat.name, image: '', data: dataObj }])
      .select();

    if (error) {
      console.error('Error inserting:', cat.name, error.message);
    } else {
      console.log('Successfully created category:', cat.name, data[0].id);
      created.push({ id: data[0].id, name: cat.name, display_order: cat.order });
    }
  }

  // Ensure Tools & Instruments is active in DB
  const { data: toolsCat } = await supabase.from('categories').select('*').eq('id', 'tools-and-instrument').maybeSingle();
  if (toolsCat) {
    const updatedData = { ...toolsCat.data, name: 'Tools & Instruments', is_active: true, display_order: 15 };
    await supabase.from('categories').update({ name: 'Tools & Instruments', data: updatedData }).eq('id', 'tools-and-instrument');
    console.log('Updated tools-and-instrument category in DB to active.');
  }

  console.log('CREATED:', created);
  console.log('REUSED:', reused);
}

seedCategories();
