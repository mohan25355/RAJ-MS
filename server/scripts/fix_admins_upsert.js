const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixAdminsUpsert() {
  const destUrl = process.env.DESTINATION_SUPABASE_URL;
  const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;
  const destClient = createClient(destUrl, destKey);

  const sampleAdmin = {
    id: 1,
    data: { email: 'admin@rajaelectricals.com', role: 'admin' },
    created_at: new Date().toISOString()
  };

  console.log('Testing admins upsert without optional un-cached columns...');
  const { data, error } = await destClient.from('admins').upsert([sampleAdmin], { onConflict: 'id' }).select();
  if (error) {
    console.error('Admins upsert error:', error.message);
  } else {
    console.log('✓ Admins upsert SUCCESSFUL:', data);
  }
}

fixAdminsUpsert().catch(console.error);
