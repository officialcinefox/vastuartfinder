const fs = require('fs');

function generateHeroChakra() {
  // Rays (clockwise rotation)
  const rayAngles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5];
  let rays = rayAngles.map(deg => {
    if (deg === 0) return '            <line x1="500" y1="40" x2="500" y2="960" />';
    if (deg === 90) return '            <line x1="40" y1="500" x2="960" y2="500" />';
    return `            <line transform="rotate(${deg} 500 500)" x1="500" y1="50" x2="500" y2="950" />`;
  }).join('\n');

  // Astrolabe Ticks (counter-clockwise or clockwise rotation)
  let ticks = [];
  for (let deg = 0; deg < 360; deg += 10) {
    const isMajor = deg % 45 === 0;
    const isMid = deg % 30 === 0;
    const y1 = isMajor ? 38 : (isMid ? 44 : 48);
    const y2 = isMajor ? 64 : 58;
    const op = isMajor ? "0.85" : (isMid ? "0.6" : "0.45");
    const w = isMajor ? "1.4" : "0.9";
    if (deg === 0) {
      ticks.push(`              <line x1="500" y1="${y1}" x2="500" y2="${y2}" stroke="currentColor" stroke-opacity="${op}" stroke-width="${w}" />`);
    } else {
      ticks.push(`              <line transform="rotate(${deg} 500 500)" x1="500" y1="${y1}" x2="500" y2="${y2}" stroke="currentColor" stroke-opacity="${op}" stroke-width="${w}" />`);
    }
  }

  // 16 Petals Lotus
  let lotusPetals = [];
  for (let i = 0; i < 16; i++) {
    const deg = i * 22.5;
    if (deg === 0) {
      lotusPetals.push(`            <ellipse cx="500" cy="380" rx="44" ry="120" />`);
    } else {
      lotusPetals.push(`            <ellipse cx="500" cy="380" rx="44" ry="120" transform="rotate(${deg} 500 500)" />`);
    }
  }

  return { rays, ticks: ticks.join('\n'), lotus: lotusPetals.join('\n') };
}

const data = generateHeroChakra();
console.log('Rays count:', 8);
console.log('Ticks generated:', 36);
console.log('Lotus petals count:', 16);
