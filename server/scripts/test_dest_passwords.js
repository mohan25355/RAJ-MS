const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testDestPasswords() {
  const host = 'aws-0-ap-southeast-1.pooler.supabase.com';
  const user = 'postgres.ueohqicjodxwkwdxcrnj';
  const passwords = [
    process.env.DESTINATION_SUPABASE_SERVICE_KEY,
    'Mohan@25355',
    'Raja@123',
    'Raja@123456',
    'admin123',
    'postgres'
  ];

  for (const pass of passwords) {
    if (!pass) continue;
    console.log(`Testing password candidate...`);
    const client = new Client({
      user,
      password: pass,
      host,
      port: 6543,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log('✓ SUCCESSFUL CONNECTION TO DESTINATION POSTGRESQL!');
      const res = await client.query('SELECT version();');
      console.log('Destination PG Version:', res.rows[0].version);
      await client.end();
      return pass;
    } catch (err) {
      console.log(` -> Failed: ${err.message}`);
    }
  }
  return null;
}

testDestPasswords().catch(console.error);
