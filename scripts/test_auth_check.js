const http = require('http');

function testLogin(payload) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const req = http.request('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.write(data);
    req.end();
  });
}

async function testRoutes() {
  const paths = ["/admin", "/admin/", "/admin.html", "/admin/login", "/admin%20login", "/login", "/admin-login"];
  for (const p of paths) {
    await new Promise(res => {
      http.get("http://localhost:3000" + p, r => {
        console.log(`Route "${p}": status = ${r.statusCode}, type = ${r.headers['content-type']}`);
        res();
      }).on('error', e => {
        console.log(`Route "${p}": error = ${e.message}`);
        res();
      });
    });
  }
}

async function run() {
  console.log('Testing login endpoints:');
  console.log('Test 1 (email: admin@krutik.in, pwd: admin):', await testLogin({ email: 'admin@krutik.in', password: 'admin' }));
  console.log('Test 2 (email: "", pwd: admin):', await testLogin({ email: '', password: 'admin' }));
  console.log('Test 3 (no email, pwd: admin):', await testLogin({ password: 'admin' }));
  console.log('Test 4 (email: admin, pwd: admin):', await testLogin({ email: 'admin', password: 'admin' }));
  console.log('Test 5 (email: admin@krutik.in, pwd: KrutikVastu2026!):', await testLogin({ email: 'admin@krutik.in', password: 'KrutikVastu2026!' }));
  console.log('Test 6 (email: test@gmail.com, pwd: admin):', await testLogin({ email: 'test@gmail.com', password: 'admin' }));
  console.log('\nTesting routes:');
  await testRoutes();
}
run();
