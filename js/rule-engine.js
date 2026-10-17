// Krutik Vastu Art Finder - Deterministic Intersection Rule Engine
// Evaluates active products against user answers at each question step.
// Pure deterministic filtering — No AI, no fuzzy guessing, no heuristic mutations.

export const QUESTION_DIMENSIONS = {
  intentions: [
    "Prosperity & Abundance",
    "Career & Success",
    "Peace & Positive Atmosphere",
    "Love & Harmonious Relationships",
    "Health & Vitality",
    "Spirituality & Devotion",
    "Growth & New Beginnings",
    "Protection & Courage",
    "Simply Beautiful, Meaningful Art"
  ],
  rooms: [
    "Entrance / Foyer",
    "Living Room",
    "Bedroom",
    "Puja Room / Meditation Area",
    "Home Office / Study",
    "Dining Room",
    "Other Space"
  ],
  directions: [
    "North",
    "North-East",
    "East",
    "South-East",
    "South",
    "South-West",
    "West",
    "North-West"
  ],
  styles: [
    "Traditional Indian Art / Pichwai",
    "Nature & Landscapes",
    "Symbolic Vastu Art",
    "Devotional Art",
    "Contemporary / Modern Art",
    "Open to Suggestions"
  ],
  devotional_preferences: [
    "Devotional Artwork",
    "Non-Religious Symbolic Artwork",
    "Open to Both"
  ]
};

// Quiz ID to canonical display name mapper
export const VALUE_NORMALIZER = {
  intentions: {
    "prosperity": "Prosperity & Abundance",
    "career": "Career & Success",
    "peace": "Peace & Positive Atmosphere",
    "love": "Love & Harmonious Relationships",
    "vitality": "Health & Vitality",
    "spiritual": "Spirituality & Devotion",
    "growth": "Growth & New Beginnings",
    "protection": "Protection & Courage",
    "aesthetic": "Simply Beautiful, Meaningful Art"
  },
  rooms: {
    "foyer": "Entrance / Foyer",
    "living": "Living Room",
    "bedroom": "Bedroom",
    "pooja": "Puja Room / Meditation Area",
    "office": "Home Office / Study",
    "dining": "Dining Room",
    "other": "Other Space"
  },
  directions: {
    "north": "North",
    "northeast": "North-East",
    "east": "East",
    "southeast": "South-East",
    "south": "South",
    "southwest": "South-West",
    "west": "West",
    "northwest": "North-West",
    "assist": "I'm Not Sure"
  },
  styles: {
    "traditional": "Traditional Indian Art / Pichwai",
    "nature": "Nature & Landscapes",
    "symbolic": "Symbolic Vastu Art",
    "devotional": "Devotional Art",
    "contemporary": "Contemporary / Modern Art",
    "suggestions": "Open to Suggestions"
  },
  devotional_preferences: {
    "devotional": "Devotional Artwork",
    "symbolic": "Non-Religious Symbolic Artwork",
    "both": "Open to Both"
  }
};

/**
 * Normalizes user answer value into canonical label string
 */
export function normalizeValue(dimension, value) {
  if (!value) return null;
  if (VALUE_NORMALIZER[dimension] && VALUE_NORMALIZER[dimension][value]) {
    return VALUE_NORMALIZER[dimension][value];
  }
  return value;
}

/**
 * Evaluates a single product and its mapping through all 5 question stages.
 * 
 * Rules:
 * - Active products only.
 * - Stage 1 (Intention): matches if mapping contains selected intention OR explicitly "ANY".
 * - Stage 2 (Room): matches if stage 1 passed AND (mapping contains selected room OR explicitly "ANY").
 * - Stage 3 (Direction): matches if stage 2 passed AND (selection is "I'm Not Sure" OR mapping contains selected direction OR explicitly "ANY").
 * - Stage 4 (Style): matches if stage 3 passed AND (selection is "Open to Suggestions" OR mapping contains selected style OR explicitly "ANY").
 * - Stage 5 (Devotional): matches if stage 4 passed AND (selection is "Open to Both" OR mapping contains selected devotional preference OR explicitly "ANY").
 * 
 * @param {Object} product - Product record
 * @param {Object} mapping - Condition mapping { intentions, rooms, directions, styles, devotional_preferences }
 * @param {Object} answers - Current user answers { intention, room, direction, style, devotional }
 * @returns {Object} Evaluation report per stage and overall pass/fail status
 */
export function evaluateProductSuitability(product, mapping, answers = {}) {
  const result = {
    productId: product.id,
    productName: product.name,
    isActive: product.is_active,
    stage0: {
      passed: Boolean(product.is_active),
      reason: product.is_active ? "Product is active" : "Product is deactivated"
    },
    stage1: { passed: false, reason: "" },
    stage2: { passed: false, reason: "" },
    stage3: { passed: false, reason: "" },
    stage4: { passed: false, reason: "" },
    stage5: { passed: false, reason: "" },
    finalPassed: false
  };

  if (!product.is_active) {
    result.stage1.reason = "Excluded: Product is inactive";
    result.stage2.reason = "Excluded: Product is inactive";
    result.stage3.reason = "Excluded: Product is inactive";
    result.stage4.reason = "Excluded: Product is inactive";
    result.stage5.reason = "Excluded: Product is inactive";
    return result;
  }

  const map = {
    intentions: Array.isArray(mapping?.intentions) ? mapping.intentions : [],
    rooms: Array.isArray(mapping?.rooms) ? mapping.rooms : [],
    directions: Array.isArray(mapping?.directions) ? mapping.directions : [],
    styles: Array.isArray(mapping?.styles) ? mapping.styles : [],
    devotional_preferences: Array.isArray(mapping?.devotional_preferences) ? mapping.devotional_preferences : []
  };

  const selIntention = normalizeValue('intentions', answers.intention);
  const selRoom = normalizeValue('rooms', answers.room);
  const selDirection = normalizeValue('directions', answers.direction);
  const selStyle = normalizeValue('styles', answers.style);
  const selDevotional = normalizeValue('devotional_preferences', answers.devotional);

  // -----------------------------------------------------------------
  // STAGE 1: QUESTION 1 — INTENTION
  // -----------------------------------------------------------------
  if (selIntention) {
    const hasAny = map.intentions.includes("ANY");
    const hasMatch = map.intentions.includes(selIntention);
    if (hasAny) {
      result.stage1.passed = true;
      result.stage1.reason = `Passed via ANY intention rule (mapped: [${map.intentions.join(", ")}])`;
    } else if (hasMatch) {
      result.stage1.passed = true;
      result.stage1.reason = `Matched intention "${selIntention}"`;
    } else {
      result.stage1.passed = false;
      result.stage1.reason = `Intention "${selIntention}" not in mapped intentions [${map.intentions.join(", ")}]`;
    }
  } else {
    // Q1 not answered yet -> passes by default
    result.stage1.passed = true;
    result.stage1.reason = "Question 1 not answered yet";
  }

  // -----------------------------------------------------------------
  // STAGE 2: QUESTION 2 — ROOM
  // -----------------------------------------------------------------
  if (!result.stage1.passed) {
    result.stage2.passed = false;
    result.stage2.reason = "Eliminated at Question 1 (Intention)";
  } else if (selRoom) {
    const hasAny = map.rooms.includes("ANY");
    const hasMatch = map.rooms.includes(selRoom);
    if (hasAny) {
      result.stage2.passed = true;
      result.stage2.reason = `Passed via ANY room rule (mapped: [${map.rooms.join(", ")}])`;
    } else if (hasMatch) {
      result.stage2.passed = true;
      result.stage2.reason = `Matched room "${selRoom}"`;
    } else {
      result.stage2.passed = false;
      result.stage2.reason = `Room "${selRoom}" not in mapped rooms [${map.rooms.join(", ")}]`;
    }
  } else {
    result.stage2.passed = true;
    result.stage2.reason = "Question 2 not answered yet";
  }

  // -----------------------------------------------------------------
  // STAGE 3: QUESTION 3 — DIRECTION
  // -----------------------------------------------------------------
  if (!result.stage2.passed) {
    result.stage3.passed = false;
    result.stage3.reason = "Eliminated at earlier question";
  } else if (selDirection) {
    // Special answer: "I'm Not Sure" skips direction elimination
    if (selDirection === "I'm Not Sure" || answers.direction === "assist") {
      result.stage3.passed = true;
      result.stage3.reason = `Direction check skipped (Customer selected "I'm Not Sure")`;
    } else {
      const hasAny = map.directions.includes("ANY");
      const hasMatch = map.directions.includes(selDirection);
      if (hasAny) {
        result.stage3.passed = true;
        result.stage3.reason = `Passed via ANY direction rule (mapped: [${map.directions.join(", ")}])`;
      } else if (hasMatch) {
        result.stage3.passed = true;
        result.stage3.reason = `Matched direction "${selDirection}"`;
      } else {
        result.stage3.passed = false;
        result.stage3.reason = `Direction "${selDirection}" not in mapped directions [${map.directions.join(", ")}]`;
      }
    }
  } else {
    result.stage3.passed = true;
    result.stage3.reason = "Question 3 not answered yet";
  }

  // -----------------------------------------------------------------
  // STAGE 4: QUESTION 4 — ART STYLE
  // -----------------------------------------------------------------
  if (!result.stage3.passed) {
    result.stage4.passed = false;
    result.stage4.reason = "Eliminated at earlier question";
  } else if (selStyle) {
    // Special answer: "Open to Suggestions" skips art-style elimination
    if (selStyle === "Open to Suggestions" || answers.style === "suggestions") {
      result.stage4.passed = true;
      result.stage4.reason = `Art style check skipped (Customer selected "Open to Suggestions")`;
    } else {
      const hasAny = map.styles.includes("ANY");
      const hasMatch = map.styles.includes(selStyle);
      if (hasAny) {
        result.stage4.passed = true;
        result.stage4.reason = `Passed via ANY art style rule (mapped: [${map.styles.join(", ")}])`;
      } else if (hasMatch) {
        result.stage4.passed = true;
        result.stage4.reason = `Matched style "${selStyle}"`;
      } else {
        result.stage4.passed = false;
        result.stage4.reason = `Style "${selStyle}" not in mapped styles [${map.styles.join(", ")}]`;
      }
    }
  } else {
    result.stage4.passed = true;
    result.stage4.reason = "Question 4 not answered yet";
  }

  // -----------------------------------------------------------------
  // STAGE 5: QUESTION 5 — DEVOTIONAL PREFERENCE
  // -----------------------------------------------------------------
  if (!result.stage4.passed) {
    result.stage5.passed = false;
    result.stage5.reason = "Eliminated at earlier question";
  } else if (selDevotional) {
    // Special answer: "Open to Both" skips devotional-preference elimination
    if (selDevotional === "Open to Both" || answers.devotional === "both") {
      result.stage5.passed = true;
      result.stage5.reason = `Devotional preference check skipped (Customer selected "Open to Both")`;
    } else {
      const hasAny = map.devotional_preferences.includes("ANY");
      const hasMatch = map.devotional_preferences.includes(selDevotional);
      if (hasAny) {
        result.stage5.passed = true;
        result.stage5.reason = `Passed via ANY devotional rule (mapped: [${map.devotional_preferences.join(", ")}])`;
      } else if (hasMatch) {
        result.stage5.passed = true;
        result.stage5.reason = `Matched devotional preference "${selDevotional}"`;
      } else {
        result.stage5.passed = false;
        result.stage5.reason = `Devotional preference "${selDevotional}" not in mapped preferences [${map.devotional_preferences.join(", ")}]`;
      }
    }
  } else {
    result.stage5.passed = true;
    result.stage5.reason = "Question 5 not answered yet";
  }

  result.finalPassed = result.stage0.passed &&
                       result.stage1.passed &&
                       result.stage2.passed &&
                       result.stage3.passed &&
                       result.stage4.passed &&
                       result.stage5.passed;

  return result;
}

/**
 * Filters the entire catalog of products across all stages for the Live Quiz Preview
 * @param {Array} products - List of products
 * @param {Object} mappingsMap - Map of product_id -> mapping
 * @param {Object} answers - Current answers
 * @returns {Object} Comprehensive stage-by-stage breakdown
 */
export function filterCatalog(products, mappingsMap, answers = {}) {
  const evaluations = products.map(p => {
    const map = mappingsMap[p.id] || {
      intentions: [],
      rooms: [],
      directions: [],
      styles: [],
      devotional_preferences: []
    };
    return {
      product: p,
      mapping: map,
      eval: evaluateProductSuitability(p, map, answers)
    };
  });

  const stage0 = evaluations.filter(e => e.eval.stage0.passed);
  const stage1 = stage0.filter(e => e.eval.stage1.passed);
  const stage2 = stage1.filter(e => e.eval.stage2.passed);
  const stage3 = stage2.filter(e => e.eval.stage3.passed);
  const stage4 = stage3.filter(e => e.eval.stage4.passed);
  const stage5 = stage4.filter(e => e.eval.stage5.passed);

  return {
    all: evaluations,
    stage0: { count: stage0.length, items: stage0 },
    stage1: { count: stage1.length, items: stage1 },
    stage2: { count: stage2.length, items: stage2 },
    stage3: { count: stage3.length, items: stage3 },
    stage4: { count: stage4.length, items: stage4 },
    stage5: { count: stage5.length, items: stage5 },
    finalMatches: stage5.map(e => e.product)
  };
}

/**
 * Returns mapping completeness status for a product mapping
 * @param {Object} mapping 
 * @returns {Object} { status: 'complete'|'partial'|'unmapped', count: number, total: 5, missing: Array }
 */
export function getMappingStatus(mapping) {
  if (!mapping) return { status: 'unmapped', count: 0, total: 5, missing: ['intentions', 'rooms', 'directions', 'styles', 'devotional_preferences'] };

  const dimensions = ['intentions', 'rooms', 'directions', 'styles', 'devotional_preferences'];
  const filled = dimensions.filter(d => Array.isArray(mapping[d]) && mapping[d].length > 0);
  const missing = dimensions.filter(d => !Array.isArray(mapping[d]) || mapping[d].length === 0);

  if (filled.length === 5) {
    return { status: 'complete', count: 5, total: 5, missing: [] };
  } else if (filled.length > 0) {
    return { status: 'partial', count: filled.length, total: 5, missing };
  } else {
    return { status: 'unmapped', count: 0, total: 5, missing };
  }
}
