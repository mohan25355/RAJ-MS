const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../supabase');

async function testBigInt() {
  console.log('--- ENQUIRIES WITH NUMERIC BIGINT ID ---');
  const enq = await supabase.from('enquiries').insert({
    id: Date.now(),
    data: { name: 'Test', phone: '123' },
    created_at: new Date().toISOString()
  }).select();
  console.log('Enquiry res:', enq.data ? 'SUCCESS' : enq.error);

  console.log('--- ORDERS WITH NUMERIC BIGINT ID ---');
  const ord = await supabase.from('orders').insert({
    id: Date.now(),
    data: { customerName: 'Test', phone: '123', productName: 'Item', quantity: 1 },
    created_at: new Date().toISOString()
  }).select();
  console.log('Order res:', ord.data ? 'SUCCESS' : ord.error);
}

testBigInt();
