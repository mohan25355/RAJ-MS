const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function inspectAdminsColumns() {
  const host = 'aws-0-ap-southeast-1.pooler.supabase.com';
  const user = 'postgres.yfbzapzceoqkwzsmsjmk';
  const password = 'Mohan@25355';

  const sourceClient = new Client({ user, password, host, port: 6543, database: 'postgres', ssl: { rejectUnauthorized: false } });
  await sourceClient.connect();

  const sourceRes = await sourceClient.query('SELECT * FROM public.admins;');
  console.log('Source admins rows:', sourceRes.rows);
  await sourceClient.end();

  const destUrl = process.env.DESTINATION_SUPABASE_URL;
  const destKey = process.env.DESTINATION_SUPABASE_SERVICE_KEY;
  const destClient = createClient(destUrl, destKey);

  const { data: destData, error: destErr } = await destClient.from('admins').select('*');
  console.log('Destination admins query error:', destErr);
  console.log('Destination admins rows:', destData);
}

inspectAdminsColumns().catch(console.error);
