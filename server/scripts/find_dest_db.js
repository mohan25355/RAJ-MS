const dns = require('dns').promises;
const { Client } = require('pg');

async function findDestDb() {
  const regions = [
    'ap-south-1', 'ap-southeast-1', 'us-east-1', 'us-west-1', 'us-east-2',
    'eu-central-1', 'eu-west-1', 'eu-west-3', 'ap-northeast-1', 'ap-northeast-2',
    'ap-southeast-2', 'ca-central-1', 'sa-east-1'
  ];
  const projectRef = 'ueohqicjodxwkwdxcrnj';

  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    const client = new Client({
      user: `postgres.${projectRef}`,
      password: 'dummy_password_for_check',
      host,
      port: 6543,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000
    });

    try {
      await client.connect();
    } catch (err) {
      if (!err.message.includes('tenant/user') && !err.message.includes('ENOTFOUND')) {
        console.log(`✓ DESTINATION TENANT EXISTS ON POOLER: ${r} (${host}) - Error: ${err.message}`);
        return { region: r, host };
      } else {
        console.log(`Region ${r}: ${err.message}`);
      }
    }
  }
}

findDestDb().catch(console.error);
