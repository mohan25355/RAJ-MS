const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testSydneyPooler() {
  const host = 'aws-0-ap-southeast-2.pooler.supabase.com';
  const projectRef = 'ueohqicjodxwkwdxcrnj';
  const user = `postgres.${projectRef}`;

  const passwords = [
    'Mohan@25355',
    'Raja@123',
    'raja@123456',
    process.env.DESTINATION_SUPABASE_SERVICE_KEY
  ];

  for (const pass of passwords) {
    if (!pass) continue;
    console.log(`Connecting to ${host}:6543 with user ${user}...`);
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
      console.log(`✓ DESTINATION POSTGRESQL CONNECTED SUCCESSFULLY WITH PASSWORD!`);
      const res = await client.query('SELECT version();');
      console.log('PG Version:', res.rows[0].version);

      // Check tables
      const tRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
      `);
      console.log('Destination Public Tables:', tRes.rows.map(r => r.table_name).join(', '));

      await client.end();
      return { pass, client };
    } catch (err) {
      console.log(` -> Connection Error: ${err.message}`);
    }
  }
}

testSydneyPooler().catch(console.error);
