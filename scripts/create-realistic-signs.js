const fs = require('fs');
const path = require('path');

const signsDir = path.join(__dirname, '../public/signs');

// Ensure the signs directory exists
if (!fs.existsSync(signsDir)) {
  fs.mkdirSync(signsDir, { recursive: true });
}

function generateRealisticHandSVG(letter) {
  const baseHand = `
    <!-- Hand outline -->
    <ellipse cx="100" cy="120" rx="35" ry="45" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
    
    <!-- Wrist -->
    <ellipse cx="100" cy="160" rx="25" ry="15" fill="#fbbf24" stroke="#92400e" stroke-width="1"/>
  `;

  const fingerPositions = {
    A: {
      // Closed fist - all fingers curled
      fingers: `
        <!-- Fingers closed into fist -->
        <ellipse cx="100" cy="85" rx="20" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    B: {
      // Flat hand - all fingers extended
      fingers: `
        <!-- All fingers extended -->
        <rect x="75" y="60" width="50" height="35" rx="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb extended -->
        <ellipse cx="125" cy="105" rx="6" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    C: {
      // C shape - curved fingers
      fingers: `
        <!-- Curved fingers forming C -->
        <path d="M 75 85 Q 100 65 125 85" fill="none" stroke="#92400e" stroke-width="6" stroke-linecap="round"/>
        <!-- Thumb curved -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    D: {
      // Index finger only
      fingers: `
        <!-- Index finger extended -->
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    E: {
      // Closed fist (similar to A)
      fingers: `
        <!-- Fingers closed into fist -->
        <ellipse cx="100" cy="85" rx="20" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    F: {
      // OK sign - thumb and index touching, others extended
      fingers: `
        <!-- Thumb and index forming circle -->
        <circle cx="100" cy="85" r="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Middle and ring fingers extended -->
        <rect x="85" y="60" width="3" height="20" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="3" height="20" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Pinky extended -->
        <rect x="105" y="60" width="3" height="20" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    G: {
      // Index finger pointing to side
      fingers: `
        <!-- Index finger pointing to side -->
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    H: {
      // Index and middle fingers
      fingers: `
        <!-- Index and middle fingers extended -->
        <rect x="85" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    I: {
      // Pinky finger only
      fingers: `
        <!-- Pinky finger extended -->
        <rect x="105" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    J: {
      // Pinky finger (same as I, but with motion)
      fingers: `
        <!-- Pinky finger extended -->
        <rect x="105" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    K: {
      // Index and middle fingers in V shape
      fingers: `
        <!-- Index and middle fingers extended in V -->
        <rect x="85" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb between index and middle -->
        <ellipse cx="90" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    L: {
      // L shape - thumb and index
      fingers: `
        <!-- Index finger extended -->
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb extended -->
        <ellipse cx="125" cy="105" rx="6" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    M: {
      // Three fingers down on thumb
      fingers: `
        <!-- Three fingers down on thumb -->
        <ellipse cx="100" cy="85" rx="20" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb visible -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    N: {
      // Two fingers down on thumb
      fingers: `
        <!-- Two fingers down on thumb -->
        <ellipse cx="100" cy="85" rx="18" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb visible -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    O: {
      // O shape - all fingers curved
      fingers: `
        <!-- All fingers curved to form O -->
        <ellipse cx="100" cy="85" rx="18" ry="18" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    P: {
      // Middle finger pointing down
      fingers: `
        <!-- Middle finger pointing down -->
        <rect x="95" y="90" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    Q: {
      // Index finger pointing down
      fingers: `
        <!-- Index finger pointing down -->
        <rect x="95" y="90" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    R: {
      // Crossed fingers - index and middle
      fingers: `
        <!-- Crossed index and middle fingers -->
        <path d="M 85 60 L 95 85" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
        <path d="M 95 60 L 85 85" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    S: {
      // Fist (same as A)
      fingers: `
        <!-- Fingers closed into fist -->
        <ellipse cx="100" cy="85" rx="20" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    T: {
      // Thumb between index and middle
      fingers: `
        <!-- Fingers closed with thumb between -->
        <ellipse cx="100" cy="85" rx="20" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb between fingers -->
        <ellipse cx="90" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    U: {
      // Index and middle fingers together
      fingers: `
        <!-- Index and middle fingers together -->
        <rect x="85" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    V: {
      // V shape - index and middle apart
      fingers: `
        <!-- Index and middle fingers in V shape -->
        <rect x="85" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    W: {
      // Three fingers - index, middle, ring
      fingers: `
        <!-- Three fingers extended -->
        <rect x="75" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="85" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Pinky and thumb closed -->
        <ellipse cx="100" cy="85" rx="8" ry="5" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    X: {
      // Bent index finger
      fingers: `
        <!-- Bent index finger -->
        <path d="M 95 60 L 95 80 L 99 85" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    Y: {
      // Thumb and pinky out
      fingers: `
        <!-- Pinky finger extended -->
        <rect x="105" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb extended -->
        <ellipse cx="125" cy="105" rx="6" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    },
    Z: {
      // Index finger (for Z motion)
      fingers: `
        <!-- Index finger extended -->
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `
    }
  };

  const position = fingerPositions[letter] || fingerPositions['A'];
  
  return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="handGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="#f8fafc"/>
  
  <!-- Hand with gradient and shadow -->
  <g filter="url(#shadow)">
    ${baseHand}
    ${position.fingers}
  </g>
  
  <!-- Letter -->
  <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1e40af">${letter}</text>
  
  <!-- Description -->
  <text x="100" y="195" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#6b7280">ASL ${letter}</text>
</svg>`;
}

// Generate SVG files for each letter
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

letters.forEach(letter => {
  const svgContent = generateRealisticHandSVG(letter);
  const filePath = path.join(signsDir, `${letter}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Generated ${letter}.svg`);
});

console.log('All realistic ASL hand sign SVG files generated successfully!'); 