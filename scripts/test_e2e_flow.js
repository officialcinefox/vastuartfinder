// Krutik Vastu Art Finder - Complete End-to-End Flow Verification Script

const BASE_URL = 'http://localhost:3000';

async function runE2ETests() {
  console.log('====================================================');
  console.log('   KRUTIK VASTU ART FINDER - E2E FLOW VERIFICATION  ');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`✓ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`✗ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Fetch products and mappings from running server
  console.log('--- Phase 1: Public Catalog & Mappings Verification ---');
  const prodRes = await fetch(`${BASE_URL}/api/products`);
  const prodData = await prodRes.json();
  assert(prodRes.status === 200 && prodData.success, 'Public /api/products returns status 200 with success: true');
  assert(Array.isArray(prodData.products) && prodData.products.length >= 40, `Catalog contains ${prodData.products?.length} products (>= 40)`);

  const mapRes = await fetch(`${BASE_URL}/api/mappings`);
  const mapData = await mapRes.json();
  assert(mapRes.status === 200 && mapData.success, 'Public /api/mappings returns status 200 with success: true');
  assert(Object.keys(mapData.mappings).length >= 40, `Mappings configured for ${Object.keys(mapData.mappings).length} products`);

  // Verify URL integrity: All products must start with https://www.krutik.in/ or https://krutik.in/
  const allUrlsValid = prodData.products.every(p => {
    return p.product_url && (p.product_url.startsWith('https://www.krutik.in/') || p.product_url.startsWith('https://krutik.in/'));
  });
  assert(allUrlsValid, 'All catalog products have valid approved https://www.krutik.in/ product URLs');

  // 2. Admin Authentication & Protected Endpoints
  console.log('\n--- Phase 2: Admin Security & Auth ---');
  const badLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'WrongPassword999' })
  });
  assert(badLoginRes.status === 401, 'Unauthorized access rejected with 401 status code');

  const goodLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'KrutikVastu2026!' })
  });
  const goodLoginData = await goodLoginRes.json();
  assert(goodLoginRes.status === 200 && goodLoginData.token, 'Authorized login returns valid session token');

  const token = goodLoginData.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Supabase Live Connectivity Check
  console.log('\n--- Phase 3: Supabase Cloud Connectivity ---');
  const supaPingRes = await fetch(`${BASE_URL}/api/admin/supabase-ping`, { headers: authHeaders });
  const supaPingData = await supaPingRes.json();
  assert(supaPingRes.status === 200 && supaPingData.success, `Supabase Cloud Connected: Project ${supaPingData.projectId} (${supaPingData.supabaseUrl}) [Status ${supaPingData.status}]`);

  // 4. Test Deterministic Filtering Simulation for Public Quiz
  console.log('\n--- Phase 4: Deterministic Questionnaire Funnel Simulation ---');
  const { evaluateProductSuitability, filterCatalog } = await import('../js/rule-engine.js');

  const testAnswers = {
    intention: 'prosperity',
    room: 'living',
    direction: 'north',
    style: 'traditional',
    devotional: 'devotional'
  };

  const activeProducts = prodData.products.filter(p => p.is_active);
  const result = filterCatalog(activeProducts, mapData.mappings, testAnswers);

  assert(result.stage0.count === activeProducts.length, `Stage 0 (Initial active catalog): ${result.stage0.count} products`);
  assert(result.stage1.count > 0 && result.stage1.count <= result.stage0.count, `Stage 1 (After Intention 'prosperity'): ${result.stage1.count} products`);
  assert(result.stage2.count > 0 && result.stage2.count <= result.stage1.count, `Stage 2 (After Room 'living'): ${result.stage2.count} products`);
  assert(result.stage3.count > 0 && result.stage3.count <= result.stage2.count, `Stage 3 (After Direction 'north'): ${result.stage3.count} products`);
  assert(result.stage4.count > 0 && result.stage4.count <= result.stage3.count, `Stage 4 (After Style 'traditional'): ${result.stage4.count} products`);
  assert(result.stage5.count > 0 && result.stage5.count <= result.stage4.count, `Stage 5 (Final Devotional 'devotional'): ${result.stage5.count} recommendations`);

  // Verify that every passing product has a Buy Now URL
  const allFinalHaveBuyUrls = result.finalMatches.every(p => p.product_url && p.product_url.startsWith('https://www.krutik.in/'));
  assert(allFinalHaveBuyUrls, 'All final recommended artworks have verified direct Krutik Buy Now URLs');

  // 5. Special Answer Behavior Verification
  console.log('\n--- Phase 5: Special Answer Pass-Through Verification ---');
  const specialAnswers = {
    intention: 'prosperity',
    room: 'living',
    direction: "I'm Not Sure",
    style: 'Open to Suggestions',
    devotional: 'Open to Both'
  };

  const specialResult = filterCatalog(activeProducts, mapData.mappings, specialAnswers);
  assert(specialResult.stage3.count === specialResult.stage2.count, `Direction "I'm Not Sure" skipped elimination: count maintained (${specialResult.stage3.count})`);
  assert(specialResult.stage4.count === specialResult.stage3.count, `Style "Open to Suggestions" skipped elimination: count maintained (${specialResult.stage4.count})`);
  assert(specialResult.stage5.count === specialResult.stage4.count, `Devotional "Open to Both" skipped elimination: count maintained (${specialResult.stage5.count})`);

  // 6. Test Product Lifecycle in Admin: Add -> Map -> Filter Test -> Deactivate -> Delete
  console.log('\n--- Phase 6: Admin Management Lifecycle Test ---');
  const tempId = `art_e2e_${Date.now()}`;
  const newProductPayload = {
    id: tempId,
    name: 'E2E Sacred Vastu Test Painting',
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    product_url: 'https://www.krutik.in/products/e2e-sacred-vastu-test',
    description: 'Specially created for automated end-to-end test verification',
    is_active: true,
    display_order: 999
  };

  // Add Product
  const addRes = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(newProductPayload)
  });
  const addData = await addRes.json();
  assert(addRes.status === 201 && addData.success, 'Admin successfully added new product with Krutik URL');

  // Save Mapping with explicit ANY
  const mappingPayload = {
    intentions: ['Prosperity & Abundance', 'Career & Success'],
    rooms: ['Living Room', 'Home Office / Study'],
    directions: ['North', 'ANY'],
    styles: ['Traditional Indian Art / Pichwai'],
    devotional_preferences: ['Devotional Artwork']
  };

  const mapSaveRes = await fetch(`${BASE_URL}/api/admin/mappings/${tempId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(mappingPayload)
  });
  const mapSaveData = await mapSaveRes.json();
  assert(mapSaveRes.status === 200 && mapSaveData.success, 'Admin saved 5-dimension mapping with explicit ANY');

  // Verify that new product passes matching filter
  const updatedProdRes = await fetch(`${BASE_URL}/api/products`);
  const updatedProdData = await updatedProdRes.json();
  const updatedMapRes = await fetch(`${BASE_URL}/api/mappings`);
  const updatedMapData = await updatedMapRes.json();
  const testFilter = filterCatalog(updatedProdData.products, updatedMapData.mappings, {
    intention: 'prosperity',
    room: 'living',
    direction: 'south', // Direction is South, but product has 'ANY' in directions!
    style: 'traditional',
    devotional: 'devotional'
  });
  const foundInResults = testFilter.finalMatches.some(p => p.id === tempId);
  assert(foundInResults, 'Product with explicit ANY passed non-matching direction (South) as required');

  // Deactivate Product
  const toggleRes = await fetch(`${BASE_URL}/api/admin/products/${tempId}/toggle`, {
    method: 'PATCH',
    headers: authHeaders
  });
  const toggleData = await toggleRes.json();
  assert(toggleRes.status === 200 && toggleData.product.is_active === false, 'Admin successfully deactivated product');

  // Verify deactivated product is immediately excluded from public recommendations
  const deactFilter = filterCatalog([toggleData.product], updatedMapData.mappings, {
    intention: 'prosperity',
    room: 'living',
    direction: 'north',
    style: 'traditional',
    devotional: 'devotional'
  });
  assert(deactFilter.stage0.count === 0, 'Deactivated product is immediately excluded at Stage 0');

  // Delete Product
  const delRes = await fetch(`${BASE_URL}/api/admin/products/${tempId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  const delData = await delRes.json();
  assert(delRes.status === 200 && delData.success, 'Admin successfully deleted temporary test product');

  // 7. Question & Step Management Lifecycle Test
  console.log('\n--- Phase 7: Question & Step Management Lifecycle Test ---');
  const getQRes = await fetch(`${BASE_URL}/api/questions`);
  const getQData = await getQRes.json();
  assert(getQRes.status === 200 && getQData.count >= 5, `Public /api/questions returned ${getQData.count} questions (>= 5)`);

  // Admin creates new question
  const tempQId = `test_q_${Date.now()}`;
  const createQRes = await fetch(`${BASE_URL}/api/admin/questions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      id: tempQId,
      title: 'Aura Alignment',
      subtitle: 'Select the sacred elemental vibration of your environment',
      dimension_key: 'aura_alignment',
      step: 6,
      skip_special_answer: 'Universal Harmony',
      is_active: true,
      options: [
        { id: 'solar', label: 'Solar Radiance', description: 'Sun warmth', icon: 'wb_sunny' }
      ]
    })
  });
  const createQData = await createQRes.json();
  assert(createQRes.status === 201 && createQData.question?.id === tempQId, 'Admin created new custom question with custom dimension');

  // Admin updates question title
  const updateQRes = await fetch(`${BASE_URL}/api/admin/questions/${tempQId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Aura Alignment & Resonance',
      subtitle: 'Refined prompt description',
      dimension_key: 'aura_alignment',
      step: 6,
      skip_special_answer: 'Universal Harmony',
      is_active: true
    })
  });
  const updateQData = await updateQRes.json();
  assert(updateQRes.status === 200 && updateQData.question?.title === 'Aura Alignment & Resonance', 'Admin updated question details');

  // Admin adds option to question
  const addOptRes = await fetch(`${BASE_URL}/api/admin/questions/${tempQId}/options`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      id: 'lunar',
      label: 'Lunar Tranquility',
      description: 'Chandra soothing energy',
      icon: 'bedtime'
    })
  });
  const addOptData = await addOptRes.json();
  assert(addOptRes.status === 201 && addOptData.question?.options?.length === 2, 'Admin added new option to question');

  // Admin toggles question active state
  const toggleQRes = await fetch(`${BASE_URL}/api/admin/questions/${tempQId}/toggle`, {
    method: 'PATCH',
    headers: authHeaders
  });
  const toggleQData = await toggleQRes.json();
  assert(toggleQRes.status === 200 && toggleQData.question?.is_active === false, 'Admin toggled question status (deactivated)');

  // Admin deletes option
  const delOptRes = await fetch(`${BASE_URL}/api/admin/questions/${tempQId}/options/lunar`, {
    method: 'DELETE',
    headers: authHeaders
  });
  const delOptData = await delOptRes.json();
  assert(delOptRes.status === 200 && delOptData.question?.options?.length === 1, 'Admin deleted option from question');

  // Admin deletes temporary test question
  const delQRes = await fetch(`${BASE_URL}/api/admin/questions/${tempQId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  const delQData = await delQRes.json();
  assert(delQRes.status === 200 && delQData.success === true, 'Admin deleted temporary test question');

  console.log('\n====================================================');
  console.log(`   E2E VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED!`);
  console.log('====================================================\n');
}

runE2ETests().catch(err => {
  console.error('E2E Verification Failed with uncaught error:', err);
  process.exit(1);
});
