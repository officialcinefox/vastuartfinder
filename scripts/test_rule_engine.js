// Test suite for Rule Engine and Filtering Logic
const assert = require('assert');

// Simple ESM import simulation for Node
async function runTests() {
  console.log('Testing Rule Engine...');
  const { evaluateProductSuitability, filterCatalog, getMappingStatus, normalizeValue } = await import('../js/rule-engine.js');

  const sampleProduct = {
    id: "test-art-1",
    name: "Golden Yantra",
    is_active: true,
    product_url: "https://www.krutik.in/products/golden-yantra"
  };

  const sampleMapping = {
    intentions: ["Prosperity & Abundance", "Career & Success"],
    rooms: ["Living Room", "Home Office / Study"],
    directions: ["North", "East"],
    styles: ["Traditional Indian Art / Pichwai"],
    devotional_preferences: ["Devotional Artwork"]
  };

  // Test 1: Full match
  const res1 = evaluateProductSuitability(sampleProduct, sampleMapping, {
    intention: "prosperity",
    room: "living",
    direction: "north",
    style: "traditional",
    devotional: "devotional"
  });
  assert.strictEqual(res1.finalPassed, true, 'Test 1 Failed: Expected full match to pass');
  console.log('✓ Test 1 Passed: Full match succeeds');

  // Test 2: Intention mismatch
  const res2 = evaluateProductSuitability(sampleProduct, sampleMapping, {
    intention: "love", // Love is not in mapping
    room: "living",
    direction: "north"
  });
  assert.strictEqual(res2.stage1.passed, false, 'Test 2 Failed: Intention mismatch must fail at stage 1');
  assert.strictEqual(res2.finalPassed, false, 'Test 2 Failed: Final passed must be false');
  console.log('✓ Test 2 Passed: Intention mismatch eliminates product at stage 1');

  // Test 3: ANY rule on Direction
  const anyDirMapping = {
    ...sampleMapping,
    directions: ["ANY"]
  };
  const res3 = evaluateProductSuitability(sampleProduct, anyDirMapping, {
    intention: "prosperity",
    room: "living",
    direction: "southwest" // Not cardinal, but mapping has ANY
  });
  assert.strictEqual(res3.stage3.passed, true, 'Test 3 Failed: ANY direction must pass');
  console.log('✓ Test 3 Passed: Explicit "ANY" passes regardless of answer');

  // Test 4: Special Answer "I'm Not Sure" (assist) skips direction check
  const res4 = evaluateProductSuitability(sampleProduct, sampleMapping, {
    intention: "prosperity",
    room: "living",
    direction: "assist" // "I'm Not Sure"
  });
  assert.strictEqual(res4.stage3.passed, true, 'Test 4 Failed: "assist" must skip direction elimination');
  console.log('✓ Test 4 Passed: "I\'m Not Sure" skips direction elimination');

  // Test 5: Special Answer "Open to Suggestions" (suggestions) skips style check
  const res5 = evaluateProductSuitability(sampleProduct, sampleMapping, {
    intention: "prosperity",
    room: "living",
    direction: "north",
    style: "suggestions" // Open to suggestions
  });
  assert.strictEqual(res5.stage4.passed, true, 'Test 5 Failed: "suggestions" must skip style elimination');
  console.log('✓ Test 5 Passed: "Open to Suggestions" skips style elimination');

  // Test 6: Special Answer "Open to Both" (both) skips devotional check
  const res6 = evaluateProductSuitability(sampleProduct, sampleMapping, {
    intention: "prosperity",
    room: "living",
    direction: "north",
    style: "traditional",
    devotional: "both" // Open to Both
  });
  assert.strictEqual(res6.stage5.passed, true, 'Test 6 Failed: "both" must skip devotional elimination');
  console.log('✓ Test 6 Passed: "Open to Both" skips devotional elimination');

  // Test 7: Inactive product eliminated at stage 0
  const inactiveProduct = { ...sampleProduct, is_active: false };
  const res7 = evaluateProductSuitability(inactiveProduct, sampleMapping, {
    intention: "prosperity"
  });
  assert.strictEqual(res7.stage0.passed, false, 'Test 7 Failed: Inactive product must fail stage 0');
  assert.strictEqual(res7.finalPassed, false, 'Test 7 Failed: Inactive product cannot pass');
  console.log('✓ Test 7 Passed: Deactivated products are immediately excluded');

  // Test 8: Mapping completeness status
  const completeStatus = getMappingStatus(sampleMapping);
  assert.strictEqual(completeStatus.status, 'complete', 'Test 8 Failed: Full mapping must be complete');

  const partialStatus = getMappingStatus({ intentions: ["Prosperity & Abundance"] });
  assert.strictEqual(partialStatus.status, 'partial', 'Test 8 Failed: 1 dimension must be partial');
  assert.strictEqual(partialStatus.count, 1);

  const unmappedStatus = getMappingStatus(null);
  assert.strictEqual(unmappedStatus.status, 'unmapped', 'Test 8 Failed: Null mapping must be unmapped');
  console.log('✓ Test 8 Passed: Mapping status helper accurately reports completeness');

  console.log('\nAll 8 Rule Engine Unit Tests Passed Perfectly!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
