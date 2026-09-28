const dns = require('dns').promises;

async function findDestRegion() {
  const regions = [
    'ap-south-1', 'ap-southeast-1', 'us-east-1', 'us-west-1', 'us-east-2',
    'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'ap-northeast-1',
    'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-2', 'ca-central-1', 'sa-east-1'
  ];
  const projectRef = 'ueohqicjodxwkwdxcrnj';

  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    try {
      const res = await dns.lookup(host);
      // Let's test TCP connect
      const { Client } = require('pg');
      const client = new Client({
        user: `postgres.${projectRef}`,
        password: 'test',
        host,
        port: 6543,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 2000
      });
      try {
        await client.connect();
      } catch (err) {
        if (!err.message.includes('tenant/user') && !err.message.includes('ENOTFOUND')) {
          console.log(`✓ FOUND DESTINATION REGION: ${r} (${host}) - Error was: ${err.message}`);
          return r;
        }
      }
    } catch (e) {}
  }
  console.log('Region search complete.');
}

findDestRegion().catch(console.error);
