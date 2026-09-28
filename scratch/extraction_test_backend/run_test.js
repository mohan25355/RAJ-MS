const { spawn } = require('child_process');
const http = require('http');

process.env.PORT = '10008';
process.env.SUPABASE_URL = 'https://ueohqicjodxwkwdxcrnj.supabase.co';
process.env.SUPABASE_SECRET_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlb2hxaWNqb2R4d2t3ZHhjcm5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.mock_signature';

console.log('Starting node server.js on PORT 10008...');

const serverProc = spawn('node', ['server.js'], { cwd: __dirname, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });

serverProc.stdout.on('data', data => console.log('[SERVER STDOUT]:', data.toString().trim()));
serverProc.stderr.on('data', data => console.error('[SERVER STDERR]:', data.toString().trim()));

let attempts = 0;
function pingHealth() {
  attempts++;
  http.get('http://127.0.0.1:10008/api/health', (res) => {
    let raw = '';
    res.on('data', d => raw += d);
    res.on('end', () => {
      console.log(`\nHTTP GET /api/health returned HTTP ${res.statusCode}:`, raw);
      serverProc.kill();
      if (res.statusCode === 200) {
        console.log('SUCCESS: Extracted backend server started and answered /api/health with status 200!');
        process.exit(0);
      } else {
        console.error('FAILED: /api/health did not return 200 OK');
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    if (attempts < 10) {
      setTimeout(pingHealth, 500);
    } else {
      console.error('FAILED: Could not connect to http://127.0.0.1:10008/api/health after 10 retries:', err.message);
      serverProc.kill();
      process.exit(1);
    }
  });
}

setTimeout(pingHealth, 1500);
