require('dotenv').config();
const supabase = require('./supabase');

async function seedCategories() {
  const newCats = [
    { name: 'Electricals', slug: 'electricals', order: 25, icon: 'Wrench', color: 'purple' },
    { name: 'Sanitaryware', slug: 'sanitaryware', order: 26, icon: 'Bath', color: 'mint' },
  ];

  const { data: existing } = await supabase.from('categories').select('*');
  const existingNames = (existing || []).map(c => (c.name || '').trim().toLowerCase());

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
      icon: cat.icon,
      color: cat.color,
      image: '',
      is_active: true,
      description: `${cat.name} products and solutions.`,
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

  console.log('CREATED:', created);
  console.log('REUSED:', reused);
}

seedCategories();
