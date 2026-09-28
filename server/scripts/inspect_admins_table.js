const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://ueohqicjodxwkwdxcrnj.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.DESTINATION_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectAdmins() {
  console.log('=== INSPECTING ADMINS TABLE IN NEW SUPABASE ===\n');

  const { data, error } = await supabase.from('admins').select('*');
  if (error) {
    console.error('Error selecting from admins table:', error);
    return;
  }

  console.log(`Retrieved ${data.length} rows from admins table.`);
  if (data.length > 0) {
    console.log('Admins table row structure keys:', Object.keys(data[0]));
    console.log('Sample Row 1 (sanitized):', {
      ...data[0],
      password_hash: data[0].password_hash ? '[HASH PRESENT]' : undefined,
      data: data[0].data ? { ...data[0].data, password_hash: '[HASH PRESENT]' } : undefined
    });
  }
}

inspectAdmins();
