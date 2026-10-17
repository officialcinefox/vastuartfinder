// Verification test for Question Management API
const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('--- Testing Questions API ---');

  // 1. Get public questions
  const getPub = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/questions',
    method: 'GET'
  });
  console.log('1. GET /api/questions -> Status:', getPub.status, 'Count:', getPub.data.count);
  if (getPub.status !== 200 || !getPub.data.success) {
    throw new Error('Failed GET /api/questions');
  }

  // 2. Admin Auth
  const loginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { password: 'KrutikVastu2026!' });
  const token = loginRes.data.token;
  console.log('2. Admin Login -> Token received:', !!token);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Create a new question
  const newQ = {
    id: 'test_dimension_color',
    step: 6,
    dimension_key: 'color_harmony',
    title: 'Color Essence & Vibration',
    subtitle: 'Which elemental hue aligns with your residence?',
    is_active: true,
    options: [
      { id: 'gold', label: 'Radiant Gold & Ochre', description: 'Sun energy', icon: 'wb_sunny' },
      { id: 'earth', label: 'Earthy Terracotta', description: 'Grounding energy', icon: 'terrain' }
    ]
  };

  const createRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/questions',
    method: 'POST',
    headers: authHeaders
  }, newQ);
  console.log('3. POST /api/admin/questions -> Status:', createRes.status, 'Created ID:', createRes.data.question?.id);
  if (createRes.status !== 201) throw new Error('Failed create question');

  // 4. Update the question
  const updateRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/questions/test_dimension_color',
    method: 'PUT',
    headers: authHeaders
  }, {
    title: 'Color Essence & Vibration (Updated)',
    subtitle: 'Elemental vibration',
    step: 6,
    dimension_key: 'color_harmony',
    is_active: true
  });
  console.log('4. PUT /api/admin/questions/test_dimension_color -> Status:', updateRes.status, 'Title:', updateRes.data.question?.title);
  if (updateRes.status !== 200) throw new Error('Failed update question');

  // 5. Add option to the question
  const addOptRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/questions/test_dimension_color/options',
    method: 'POST',
    headers: authHeaders
  }, {
    id: 'ocean',
    label: 'Deep Ocean Blue',
    description: 'Calm water energy',
    icon: 'water_drop',
    is_pass_through: false
  });
  console.log('5. POST /api/admin/questions/:id/options -> Status:', addOptRes.status, 'Option count:', addOptRes.data.question?.options?.length);
  if (addOptRes.status !== 201) throw new Error('Failed add option');

  // 6. Update option
  const updateOptRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/questions/test_dimension_color/options/ocean',
    method: 'PUT',
    headers: authHeaders
  }, {
    label: 'Deep Ocean Azure (Refined)',
    description: 'Water element',
    icon: 'waves'
  });
  console.log('6. PUT /api/admin/questions/:id/options/:optId -> Status:', updateOptRes.status, 'Option label:', updateOptRes.data.question?.options?.find(o => o.id === 'ocean')?.label);
  if (updateOptRes.status !== 200) throw new Error('Failed update option');

  // 7. Toggle question active status
  const toggleRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/questions/test_dimension_color/toggle',
    method: 'PATCH',
    headers: authHeaders
  });
  console.log('7. PATCH /api/admin/questions/:id/toggle -> Status:', toggleRes.status, 'Active state:', toggleRes.data.question?.is_active);
  if (toggleRes.status !== 200 || toggleRes.data.question?.is_active !== false) throw new Error('Failed toggle');

  // 8. Delete option
  const delOptRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/questions/test_dimension_color/options/ocean',
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('8. DELETE /api/admin/questions/:id/options/:optId -> Status:', delOptRes.status, 'Option count:', delOptRes.data.question?.options?.length);
  if (delOptRes.status !== 200) throw new Error('Failed delete option');

  // 9. Delete test question
  const delQRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/questions/test_dimension_color',
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('9. DELETE /api/admin/questions/test_dimension_color -> Status:', delQRes.status, 'Success:', delQRes.data.success);
  if (delQRes.status !== 200) throw new Error('Failed delete question');

  console.log('\n--- ALL QUESTION CRUD TESTS PASSED SUCCESSFULLY! ---');
}

run().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
