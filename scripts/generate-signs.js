const fs = require('fs');
const path = require('path');

const signsDir = path.join(__dirname, '../public/signs');

// Ensure the signs directory exists
if (!fs.existsSync(signsDir)) {
  fs.mkdirSync(signsDir, { recursive: true });
}

const signDescriptions = {
  A: { desc: "Closed Fist", fingers: "All closed" },
  B: { desc: "Flat Hand", fingers: "All extended" },
  C: { desc: "C Shape", fingers: "Curved" },
  D: { desc: "Index Point", fingers: "Index only" },
  E: { desc: "Closed Fist", fingers: "All closed" },
  F: { desc: "OK Sign", fingers: "Index+Middle+Thumb" },
  G: { desc: "Index Side", fingers: "Index pointing" },
  H: { desc: "Two Fingers", fingers: "Index+Middle" },
  I: { desc: "Pinky Up", fingers: "Pinky only" },
  J: { desc: "Pinky J", fingers: "Pinky tracing J" },
  K: { desc: "V Shape", fingers: "Index+Middle" },
  L: { desc: "L Shape", fingers: "Index+Thumb" },
  M: { desc: "Three on Thumb", fingers: "Three fingers down" },
  N: { desc: "Two on Thumb", fingers: "Two fingers down" },
  O: { desc: "O Shape", fingers: "All curved" },
  P: { desc: "Middle Down", fingers: "Middle pointing down" },
  Q: { desc: "Index Down", fingers: "Index pointing down" },
  R: { desc: "Crossed", fingers: "Index+Middle crossed" },
  S: { desc: "Fist", fingers: "All closed" },
  T: { desc: "Thumb Between", fingers: "Thumb between fingers" },
  U: { desc: "Two Together", fingers: "Index+Middle together" },
  V: { desc: "V Shape", fingers: "Index+Middle apart" },
  W: { desc: "Three Fingers", fingers: "Index+Middle+Ring" },
  X: { desc: "Bent Index", fingers: "Index bent" },
  Y: { desc: "Thumb+Pinky", fingers: "Thumb+Pinky out" },
  Z: { desc: "Index Z", fingers: "Index tracing Z" }
};

function generateSVG(letter, description) {
  return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#f8fafc"/>
  
  ${generateHand(letter)}
  
  <!-- Letter -->
  <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1e40af">${letter}</text>
  
  <!-- Description -->
  <text x="100" y="195" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#6b7280">${description.desc}</text>
</svg>`;
}

function generateHand(letter) {
  // Base hand palm
  const palm = `<ellipse cx="100" cy="120" rx="35" ry="45" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>`;
  
  switch (letter) {
    case 'A': // Closed fist
      return `
        ${palm}
        <!-- Fingers closed into fist -->
        <ellipse cx="100" cy="85" rx="20" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'B': // Flat hand, all fingers extended
      return `
        ${palm}
        <!-- All fingers extended -->
        <rect x="75" y="60" width="50" height="35" rx="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb extended -->
        <ellipse cx="125" cy="105" rx="6" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'C': // C shape
      return `
        ${palm}
        <!-- Curved fingers forming C -->
        <path d="M 75 85 Q 100 65 125 85" fill="none" stroke="#92400e" stroke-width="6" stroke-linecap="round"/>
        <!-- Thumb curved -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'D': // Index finger only
      return `
        ${palm}
        <!-- Index finger extended -->
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'E': // Closed fist (similar to A)
      return `
        ${palm}
        <!-- Fingers closed into fist -->
        <ellipse cx="100" cy="85" rx="20" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'F': // OK sign (thumb and index touching, others extended)
      return `
        ${palm}
        <!-- Thumb and index forming circle -->
        <circle cx="100" cy="85" r="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Middle and ring fingers extended -->
        <rect x="85" y="60" width="3" height="20" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="3" height="20" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Pinky extended -->
        <rect x="105" y="60" width="3" height="20" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'G': // Index finger pointing to side
      return `
        ${palm}
        <!-- Index finger pointing to side -->
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'H': // Index and middle fingers
      return `
        ${palm}
        <!-- Index and middle fingers extended -->
        <rect x="85" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'I': // Pinky finger only
      return `
        ${palm}
        <!-- Pinky finger extended -->
        <rect x="105" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'J': // Pinky finger (same as I, but with motion)
      return `
        ${palm}
        <!-- Pinky finger extended -->
        <rect x="105" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'K': // Index and middle fingers in V shape
      return `
        ${palm}
        <!-- Index and middle fingers extended in V -->
        <rect x="85" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb between index and middle -->
        <ellipse cx="90" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'L': // L shape (thumb and index)
      return `
        ${palm}
        <!-- Index finger extended -->
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb extended -->
        <ellipse cx="125" cy="105" rx="6" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'M': // Three fingers down on thumb
      return `
        ${palm}
        <!-- Three fingers down on thumb -->
        <ellipse cx="100" cy="85" rx="20" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb visible -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'N': // Two fingers down on thumb
      return `
        ${palm}
        <!-- Two fingers down on thumb -->
        <ellipse cx="100" cy="85" rx="18" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb visible -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'O': // O shape (all fingers curved)
      return `
        ${palm}
        <!-- All fingers curved to form O -->
        <ellipse cx="100" cy="85" rx="18" ry="18" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'P': // Middle finger pointing down
      return `
        ${palm}
        <!-- Middle finger pointing down -->
        <rect x="95" y="90" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'Q': // Index finger pointing down
      return `
        ${palm}
        <!-- Index finger pointing down -->
        <rect x="95" y="90" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'R': // Crossed fingers (index and middle)
      return `
        ${palm}
        <!-- Crossed index and middle fingers -->
        <path d="M 85 60 L 95 85" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
        <path d="M 95 60 L 85 85" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'S': // Fist (same as A)
      return `
        ${palm}
        <!-- Fingers closed into fist -->
        <ellipse cx="100" cy="85" rx="20" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'T': // Thumb between index and middle
      return `
        ${palm}
        <!-- Fingers closed with thumb between -->
        <ellipse cx="100" cy="85" rx="20" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb between fingers -->
        <ellipse cx="90" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'U': // Index and middle fingers together
      return `
        ${palm}
        <!-- Index and middle fingers together -->
        <rect x="85" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'V': // V shape (index and middle apart)
      return `
        ${palm}
        <!-- Index and middle fingers in V shape -->
        <rect x="85" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'W': // Three fingers (index, middle, ring)
      return `
        ${palm}
        <!-- Three fingers extended -->
        <rect x="75" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="85" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Pinky and thumb closed -->
        <ellipse cx="100" cy="85" rx="8" ry="5" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'X': // Bent index finger
      return `
        ${palm}
        <!-- Bent index finger -->
        <path d="M 95 60 L 95 80 L 99 85" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'Y': // Thumb and pinky out
      return `
        ${palm}
        <!-- Pinky finger extended -->
        <rect x="105" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb extended -->
        <ellipse cx="125" cy="105" rx="6" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    case 'Z': // Index finger (for Z motion)
      return `
        ${palm}
        <!-- Index finger extended -->
        <rect x="95" y="60" width="4" height="25" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Other fingers closed -->
        <ellipse cx="100" cy="85" rx="15" ry="8" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <!-- Thumb on side -->
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
      
    default:
      return `
        ${palm}
        <!-- Default closed fist -->
        <ellipse cx="100" cy="85" rx="20" ry="12" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
        <ellipse cx="125" cy="105" rx="6" ry="10" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      `;
  }
}

// Generate SVG files for each letter
Object.entries(signDescriptions).forEach(([letter, description]) => {
  const svgContent = generateSVG(letter, description);
  const filePath = path.join(signsDir, `${letter}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Generated ${letter}.svg`);
});

console.log('All sign language SVG files generated successfully!'); 