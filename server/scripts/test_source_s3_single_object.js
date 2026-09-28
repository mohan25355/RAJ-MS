const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { S3Client, HeadObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const crypto = require('crypto');

async function testSingleObjectRecovery() {
  console.log('=== SECTION I: CRITICAL SOURCE S3 SINGLE-OBJECT RECOVERY TEST ===\n');

  const accessKeyId = process.env.SOURCE_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SOURCE_S3_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.error('ERROR: Missing SOURCE_S3_ACCESS_KEY_ID or SOURCE_S3_SECRET_ACCESS_KEY in server/.env');
    process.exit(1);
  }

  const s3Client = new S3Client({
    endpoint: 'https://yfbzapzceoqkwzsmsjmk.storage.supabase.co/storage/v1/s3',
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: accessKeyId.trim(),
      secretAccessKey: secretAccessKey.trim()
    },
    forcePathStyle: true
  });

  const bucket = 'RAJA_ELE';
  const objectKey = 'products/1790278938385-949ui-1790278938385.jpg';

  console.log(`Target Bucket: "${bucket}"`);
  console.log(`Target Object Key: "${objectKey}"`);
  console.log('Executing S3 HEAD/GetObject test...\n');

  try {
    // 1. HEAD Metadata Test
    const headCmd = new HeadObjectCommand({ Bucket: bucket, Key: objectKey });
    const headRes = await s3Client.send(headCmd);

    console.log('✓ S3 HEAD Object Metadata Received:');
    console.log(` - Content-Type: ${headRes.ContentType || 'N/A'}`);
    console.log(` - Content-Length: ${headRes.ContentLength || 'N/A'} bytes`);
    console.log(` - ETag: ${headRes.ETag || 'N/A'}`);

    // 2. GET Object Download Test
    const getCmd = new GetObjectCommand({ Bucket: bucket, Key: objectKey });
    const getRes = await s3Client.send(getCmd);

    const tmpDir = path.join(__dirname, '../scratch');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const tmpFilePath = path.join(tmpDir, 'test_single_object.jpg');
    const writeStream = fs.createWriteStream(tmpFilePath);

    const streamPipeline = new Promise((resolve, reject) => {
      getRes.Body.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    await streamPipeline;

    const stats = fs.statSync(tmpFilePath);
    if (stats.size === 0) {
      console.error('ERROR: Downloaded object is 0 bytes.');
      process.exit(1);
    }

    // Calculate SHA-256
    const fileBuffer = fs.readFileSync(tmpFilePath);
    const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    console.log('\n✓ S3 Single Object Successfully Recovered:');
    console.log(` - Local File Path: ${tmpFilePath}`);
    console.log(` - File Size: ${stats.size} bytes`);
    console.log(` - SHA-256 Checksum: ${sha256Hash}`);

    // Update SUPABASE_COMPLETE_MIGRATION_STATE.md
    const statePath = path.join(__dirname, '../../SUPABASE_COMPLETE_MIGRATION_STATE.md');
    let stateContent = '';
    if (fs.existsSync(statePath)) {
      stateContent = fs.readFileSync(statePath, 'utf8');
    }

    const updatedState = stateContent
      .replace(
        '| `RAJA_ELE` | `products/1790278938385-949ui-1790278938385.jpg` | `RAJA_ELE` | `products/1790278938385-949ui-1790278938385.jpg` | - | - | - | - | `PENDING` | - |',
        `| \`RAJA_ELE\` | \`products/1790278938385-949ui-1790278938385.jpg\` | \`RAJA_ELE\` | \`products/1790278938385-949ui-1790278938385.jpg\` | ${stats.size} | - | ${sha256Hash} | - | \`RECOVERED_VERIFIED\` | ${new Date().toISOString()} |`
      )
      .replace(
        '| **Section I** | Critical S3 Connection Test | **PENDING CREDENTIALS** | Awaiting `SOURCE_S3_ACCESS_KEY_ID` & `SOURCE_S3_SECRET_ACCESS_KEY` in `server/.env` |',
        '| **Section I** | Critical S3 Connection Test | **SUCCESSFUL** | Single Object `products/1790278938385-949ui-1790278938385.jpg` recovered & verified |'
      );

    fs.writeFileSync(statePath, updatedState);
    console.log('✓ Updated SUPABASE_COMPLETE_MIGRATION_STATE.md');

    console.log('\n----------------------------------------');
    console.log('SOURCE_S3_ACCESS_SUCCESSFUL');
    console.log('S3_SINGLE_OBJECT_RECOVERY_SUCCESS');
    console.log('----------------------------------------\n');

  } catch (err) {
    const httpStatus = err.$metadata ? err.$metadata.httpStatusCode : null;
    const errorCode = err.name || err.code || '';

    console.error(`\nS3 Operation Failed. HTTP Status: ${httpStatus || 'N/A'}, Error Code: ${errorCode}`);

    if (httpStatus === 402 || errorCode.includes('Quota') || errorCode.includes('PaymentRequired')) {
      console.log('\n----------------------------------------');
      console.log('REPORT: SOURCE_S3_ACCESS_BLOCKED_BY_EGRESS_QUOTA');
      console.log('----------------------------------------\n');
    } else {
      console.error('S3 Error Details:', err.message);
    }
    process.exit(1);
  }
}

testSingleObjectRecovery().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
