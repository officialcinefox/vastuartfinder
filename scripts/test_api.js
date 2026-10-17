// API Integration Test Suite for Krutik Master Server
const http = require('http');

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = http.request(opts, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resp) });
        } catch (e) {
          resolve({ status: res.statusCode, data: resp });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runApiTests() {
  console.log('Testing Server API Endpoints...');

  // 1. GET /api/products
  const res1 = await request('/api/products');
  console.log('1. GET /api/products status:', res1.status, 'Count:', res1.data.count);
  if (res1.status !== 200 || res1.data.count < 40) throw new Error('GET /api/products failed');

  // 2. GET /api/mappings
  const res2 = await request('/api/mappings');
  console.log('2. GET /api/mappings status:', res2.status, 'Keys:', Object.keys(res2.data.mappings).length);
  if (res2.status !== 200) throw new Error('GET /api/mappings failed');

  // 3. Admin Login (Bad Password)
  const res3Bad = await request('/api/admin/login', { method: 'POST' }, { password: 'WrongPassword' });
  console.log('3. Bad password status:', res3Bad.status, res3Bad.data);
  if (res3Bad.status !== 401) throw new Error('Admin login security failed to reject bad password');

  // 4. Admin Login (Good Password)
  const res3Good = await request('/api/admin/login', { method: 'POST' }, { password: 'KrutikVastu2026!' });
  console.log('4. Good password status:', res3Good.status, 'Token acquired:', Boolean(res3Good.data.token));
  if (res3Good.status !== 200 || !res3Good.data.token) throw new Error('Admin login failed');
  const token = res3Good.data.token;

  // 5. URL Validation: Attempt to add product with non-Krutik domain (MUST FAIL)
  const resBadUrl = await request('/api/admin/products', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }, {
    name: "Fake Shopify Artwork",
    image_url: "https://example.com/art.jpg",
    product_url: "https://shopify.com/products/fake-art" // Invalid domain!
  });
  console.log('5. Invalid URL rejection status:', resBadUrl.status, resBadUrl.data.error);
  if (resBadUrl.status !== 400 || !resBadUrl.data.error.includes('krutik.in')) {
    throw new Error('URL domain validation failed: Non-krutik URL was not blocked');
  }

  // 6. Add valid Krutik product (MUST SUCCEED)
  const testProdId = `test_art_${Date.now()}`;
  const resGoodProd = await request('/api/admin/products', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }, {
    id: testProdId,
    name: "Authentic Tanjore Temple Sanctum",
    image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800",
    product_url: "https://www.krutik.in/products/authentic-tanjore-temple-sanctum",
    description: "Handcrafted 24K gold foil with Teak frame",
    display_order: 99
  });
  console.log('6. Add valid product status:', resGoodProd.status, 'Product created:', resGoodProd.data.product?.name);
  if (resGoodProd.status !== 201) throw new Error('Add product failed');

  // 7. Save Condition Mapping with explicit ANY option
  const resMap = await request(`/api/admin/mappings/${testProdId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  }, {
    intentions: ["Prosperity & Abundance", "Career & Success"],
    rooms: ["Living Room", "Home Office / Study"],
    directions: ["ANY"], // Explicit ANY
    styles: ["Traditional Indian Art / Pichwai"],
    devotional_preferences: ["Devotional Artwork"]
  });
  console.log('7. Save mapping status:', resMap.status, 'Directions:', resMap.data.mapping?.directions);
  if (resMap.status !== 200 || !resMap.data.mapping.directions.includes('ANY')) throw new Error('Save mapping failed');

  // 8. Toggle product active/inactive
  const resToggle = await request(`/api/admin/products/${testProdId}/toggle`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('8. Toggle status:', resToggle.status, 'is_active is now:', resToggle.data.product?.is_active);
  if (resToggle.status !== 200 || resToggle.data.product?.is_active !== false) throw new Error('Toggle failed');

  // 9. Clean up test product
  const resDel = await request(`/api/admin/products/${testProdId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('9. Delete status:', resDel.status, resDel.data);
  if (resDel.status !== 200) throw new Error('Delete product failed');

  // 10. GET /api/settings
  const resSet = await request('/api/settings');
  console.log('10. Settings status:', resSet.status, 'Supabase URL:', resSet.data.settings?.supabase_project_url);

  console.log('\n✓ All 10 Backend API & Security Tests Passed Successfully!');
}

runApiTests().catch(err => {
  console.error('API Test Failure:', err);
  process.exit(1);
});
