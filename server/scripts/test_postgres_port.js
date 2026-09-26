const net = require('net');

const host = 'db.yfbzapzceoqkwzsmsjmk.supabase.co';
const ports = [5432, 6543];

function testPort(h, p) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);
    socket.on('connect', () => {
      console.log(`Port ${p} on ${h}: OPEN / CONNECTED`);
      socket.destroy();
      resolve({ port: p, open: true });
    });
    socket.on('timeout', () => {
      console.log(`Port ${p} on ${h}: TIMEOUT`);
      socket.destroy();
      resolve({ port: p, open: false, reason: 'TIMEOUT' });
    });
    socket.on('error', (err) => {
      console.log(`Port ${p} on ${h}: ERROR - ${err.message}`);
      resolve({ port: p, open: false, reason: err.message });
    });
    socket.connect(p, h);
  });
}

async function run() {
  console.log(`Testing TCP connectivity to ${host}...`);
  for (const port of ports) {
    await testPort(host, port);
  }
}

run();
