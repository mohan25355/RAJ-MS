const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testDestPg() {
  const regions = ['ap-south-1', 'ap-southeast-1', 'us-east-1', 'eu-west-1'];
  const projectRef = 'ueohqicjodxwkwdxcrnj';

  // Test password if provided in env or try standard service role key / password
  const passCandidates = [
    process.env.DESTINATION_SUPABASE_SERVICE_KEY,
    'Mohan@25355',
    'Raja@123'
  ];

  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    for (const pass of passCandidates) {
      if (!pass) continue;
      console.log(`Testing destination pooler host ${host} with user postgres.${projectRef}...`);
      const client = new Client({
        user: `postgres.${projectRef}`,
        password: pass,
        host,
        port: 6543,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });

      try {
        await client.connect();
        console.log(`✓ SUCCESSFUL CONNECTION TO DESTINATION POSTGRESQL IN REGION ${region}!`);
        const res = await client.query('SELECT version();');
        console.log('PG Version:', res.rows[0].version);
        await client.end();
        return;
      } catch (err) {
        console.log(` -> Failed: ${err.message}`);
      }
    }
  }
}

testDestPg().catch(err => console.error(err));
