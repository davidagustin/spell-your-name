const fs = require('fs');
const path = require('path');
const https = require('https');

const signsDir = path.join(__dirname, '../public/signs');

// Ensure the signs directory exists
if (!fs.existsSync(signsDir)) {
  fs.mkdirSync(signsDir, { recursive: true });
}

// Using a more accessible source - GitHub raw content or similar
const realImageUrls = {
  A: 'https://raw.githubusercontent.com/asl-signs/images/main/A.png',
  B: 'https://raw.githubusercontent.com/asl-signs/images/main/B.png',
  C: 'https://raw.githubusercontent.com/asl-signs/images/main/C.png',
  D: 'https://raw.githubusercontent.com/asl-signs/images/main/D.png',
  E: 'https://raw.githubusercontent.com/asl-signs/images/main/E.png',
  F: 'https://raw.githubusercontent.com/asl-signs/images/main/F.png',
  G: 'https://raw.githubusercontent.com/asl-signs/images/main/G.png',
  H: 'https://raw.githubusercontent.com/asl-signs/images/main/H.png',
  I: 'https://raw.githubusercontent.com/asl-signs/images/main/I.png',
  J: 'https://raw.githubusercontent.com/asl-signs/images/main/J.png',
  K: 'https://raw.githubusercontent.com/asl-signs/images/main/K.png',
  L: 'https://raw.githubusercontent.com/asl-signs/images/main/L.png',
  M: 'https://raw.githubusercontent.com/asl-signs/images/main/M.png',
  N: 'https://raw.githubusercontent.com/asl-signs/images/main/N.png',
  O: 'https://raw.githubusercontent.com/asl-signs/images/main/O.png',
  P: 'https://raw.githubusercontent.com/asl-signs/images/main/P.png',
  Q: 'https://raw.githubusercontent.com/asl-signs/images/main/Q.png',
  R: 'https://raw.githubusercontent.com/asl-signs/images/main/R.png',
  S: 'https://raw.githubusercontent.com/asl-signs/images/main/S.png',
  T: 'https://raw.githubusercontent.com/asl-signs/images/main/T.png',
  U: 'https://raw.githubusercontent.com/asl-signs/images/main/U.png',
  V: 'https://raw.githubusercontent.com/asl-signs/images/main/V.png',
  W: 'https://raw.githubusercontent.com/asl-signs/images/main/W.png',
  X: 'https://raw.githubusercontent.com/asl-signs/images/main/X.png',
  Y: 'https://raw.githubusercontent.com/asl-signs/images/main/Y.png',
  Z: 'https://raw.githubusercontent.com/asl-signs/images/main/Z.png'
};

// Alternative: Using a public CDN or image hosting service
const cdnUrls = {
  A: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/A.png',
  B: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/B.png',
  C: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/C.png',
  D: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/D.png',
  E: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/E.png',
  F: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/F.png',
  G: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/G.png',
  H: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/H.png',
  I: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/I.png',
  J: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/J.png',
  K: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/K.png',
  L: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/L.png',
  M: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/M.png',
  N: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/N.png',
  O: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/O.png',
  P: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/P.png',
  Q: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/Q.png',
  R: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/R.png',
  S: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/S.png',
  T: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/T.png',
  U: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/U.png',
  V: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/V.png',
  W: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/W.png',
  X: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/X.png',
  Y: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/Y.png',
  Z: 'https://cdn.jsdelivr.net/gh/asl-signs/images@main/Z.png'
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    https.get(options, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✓ Downloaded: ${filepath}`);
          resolve();
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Delete the file if there was an error
          reject(err);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadAllImages() {
  const letters = Object.keys(realImageUrls);
  
  for (const letter of letters) {
    const filepath = path.join(signsDir, `${letter}_real.png`);
    
    // Try GitHub raw content first
    try {
      await downloadImage(realImageUrls[letter], filepath);
    } catch (error) {
      console.log(`✗ Failed to download ${letter} from GitHub: ${error.message}`);
      
      // Try CDN
      try {
        await downloadImage(cdnUrls[letter], filepath);
      } catch (error2) {
        console.log(`✗ Failed to download ${letter} from CDN: ${error2.message}`);
      }
    }
  }
}

// Main execution
console.log('Attempting to download real ASL hand sign images...');
downloadAllImages()
  .then(() => {
    console.log('Download attempt completed!');
    console.log('Note: If downloads failed, the generated SVG images will be used instead.');
  })
  .catch((error) => {
    console.error('Download failed:', error);
    console.log('The generated SVG images will be used instead.');
  }); 