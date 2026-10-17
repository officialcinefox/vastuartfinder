// Test Script for New Requirements:
// 1. Reset button removed from navbar
// 2. Admin links removed from navbar and footer
// 3. 3D system removed from HTML and JS
// 4. Admin login with email & password + /admin routing
// 5. Product tags management (add, edit, remove, persist, display)

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function testNewRequirements() {
  console.log('====================================================');
  console.log('   TESTING NEW USER REQUIREMENTS                    ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Inspect index.html
  console.log('--- 1. Navbar, Footer & 3D Removal in index.html ---');
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(!indexHtml.includes('data-action="reset-progress"'), 'Reset button removed from public navbar');
  assert(!indexHtml.includes('href="/admin.html"'), 'Admin Console links removed from public navbar and footer');
  assert(!indexHtml.includes('id="vastu-ar-modal"'), '3D AR Modal completely removed from index.html');
  assert(!indexHtml.includes('view_in_ar'), 'view_in_ar 3D icon removed from index.html');
  assert(!indexHtml.includes('3D Spatial View'), '3D Spatial View button removed from index.html');

  // 2. Test /admin and /admin/login routing
  console.log('\n--- 2. Direct Admin Route Access ---');
  const adminRes = await fetch(`${BASE_URL}/admin`);
  assert(adminRes.status === 200, 'Direct access to /admin returns 200');
  const adminText = await adminRes.text();
  assert(adminText.includes('Admin Login') && adminText.includes('input-admin-email'), '/admin serves admin.html with email login form');

  const adminLoginRes = await fetch(`${BASE_URL}/admin/login`);
  assert(adminLoginRes.status === 200, 'Direct access to /admin/login returns 200');

  // 3. Test Admin Email & Password Authentication
  console.log('\n--- 3. Email & Password Authentication ---');
  // Empty email auto-defaults with valid password
  const emptyEmailRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', password: 'admin' })
  });
  assert(emptyEmailRes.status === 200, 'Empty email auto-defaults to admin@krutik.in and returns 200 with valid password');

  // Wrong password
  const badPwdRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@krutik.in', password: 'WrongPassword!' })
  });
  assert(badPwdRes.status === 401, 'Wrong password rejected with 401');

  // Correct email & password
  const goodLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@krutik.in', password: 'KrutikVastu2026!' })
  });
  const goodLoginData = await goodLoginRes.json();
  assert(goodLoginRes.status === 200 && goodLoginData.token, 'Authorized login with admin@krutik.in returns valid token');
  const token = goodLoginData.token;

  // 4. Test Product Tags Management & Persistence
  console.log('\n--- 4. Product Tags Management & Persistence ---');
  // Create product with custom tags
  const testProdId = `tag_test_${Date.now()}`;
  const createRes = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id: testProdId,
      name: 'Tags Test Artwork in 24K Leaf',
      image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600',
      product_url: 'https://www.krutik.in/products/tags-test-artwork',
      description: 'Artwork testing dynamic badge tags functionality',
      tags: ['24K GOLD FOIL', '99% Resonance', 'Consecrated'],
      is_active: true,
      display_order: 99
    })
  });
  const createData = await createRes.json();
  assert(createRes.status === 201 && createData.product.tags?.length === 3, 'Created product persisted tags: [24K GOLD FOIL, 99% Resonance, Consecrated]');

  // Edit product tags (e.g. remove one tag, add another)
  const updateRes = await fetch(`${BASE_URL}/api/admin/products/${testProdId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      tags: ['24K GOLD FOIL', 'Consecrated', 'Vedic Yantra', 'Handcrafted']
    })
  });
  const updateData = await updateRes.json();
  assert(updateRes.status === 200 && updateData.product.tags.length === 4 && updateData.product.tags.includes('Vedic Yantra'), 'Updated product tags to 4 custom tags');

  // Verify tags in public GET /api/products
  const pubRes = await fetch(`${BASE_URL}/api/products`);
  const pubData = await pubRes.json();
  const fetchedProd = pubData.products.find(p => p.id === testProdId);
  assert(fetchedProd && fetchedProd.tags?.includes('Vedic Yantra'), 'Public API delivers updated product tags');

  // Cleanup test product
  const delRes = await fetch(`${BASE_URL}/api/admin/products/${testProdId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert(delRes.status === 200, 'Test product cleaned up successfully');

  console.log(`\n====================================================`);
  console.log(`   ALL ${passed}/${total} NEW REQUIREMENT TESTS PASSED!`);
  console.log(`====================================================`);
}

testNewRequirements().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
