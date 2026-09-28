const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

async function fixBrokenGallery() {
  console.log('===========================================================');
  console.log('BACKING UP AND REMOVING BROKEN GALLERY ITEM');
  console.log('===========================================================');

  const targetId = '1790617698070-bk6d1';

  // 1. Fetch exact record from Supabase
  const { data: record, error: fetchErr } = await supabase
    .from('gallery')
    .select('*')
    .eq('id', targetId)
    .single();

  if (fetchErr || !record) {
    console.error('Error fetching target broken record:', fetchErr);
    process.exit(1);
  }

  console.log('Found Broken Gallery Record:', JSON.stringify(record, null, 2));

  // 2. Save complete record to GALLERY_BROKEN_ITEM_BACKUP.json
  const backupPath = path.join(__dirname, '../../GALLERY_BROKEN_ITEM_BACKUP.json');
  fs.writeFileSync(backupPath, JSON.stringify(record, null, 2));
  console.log(`Saved backup to ${backupPath}`);

  // 3. Delete ONLY the broken record
  const { error: deleteErr } = await supabase
    .from('gallery')
    .delete()
    .eq('id', targetId);

  if (deleteErr) {
    console.error('Error deleting record from Supabase:', deleteErr);
    process.exit(1);
  }

  console.log(`Successfully deleted broken gallery record ID: ${targetId} from Supabase.`);

  // 4. Verify remaining gallery records
  const { data: remaining, error: selectErr } = await supabase
    .from('gallery')
    .select('*');

  if (selectErr) {
    console.error('Error selecting remaining gallery records:', selectErr);
    process.exit(1);
  }

  console.log(`\nRemaining gallery records count: ${remaining.length}`);
  remaining.forEach(r => console.log(`  - ${r.id} | ${r.title || (r.data && r.data.title)} | ${r.image || (r.data && r.data.image)}`));
}

fixBrokenGallery();
