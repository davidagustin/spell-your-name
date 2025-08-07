const fs = require('fs');
const path = require('path');
const https = require('https');

const signsDir = path.join(__dirname, '../public/signs');

// Ensure the signs directory exists
if (!fs.existsSync(signsDir)) {
  fs.mkdirSync(signsDir, { recursive: true });
}

// Real ASL hand sign images from more reliable sources
const aslImages = {
  A: 'https://www.signasl.org/images/asl-signs/A.jpg',
  B: 'https://www.signasl.org/images/asl-signs/B.jpg',
  C: 'https://www.signasl.org/images/asl-signs/C.jpg',
  D: 'https://www.signasl.org/images/asl-signs/D.jpg',
  E: 'https://www.signasl.org/images/asl-signs/E.jpg',
  F: 'https://www.signasl.org/images/asl-signs/F.jpg',
  G: 'https://www.signasl.org/images/asl-signs/G.jpg',
  H: 'https://www.signasl.org/images/asl-signs/H.jpg',
  I: 'https://www.signasl.org/images/asl-signs/I.jpg',
  J: 'https://www.signasl.org/images/asl-signs/J.jpg',
  K: 'https://www.signasl.org/images/asl-signs/K.jpg',
  L: 'https://www.signasl.org/images/asl-signs/L.jpg',
  M: 'https://www.signasl.org/images/asl-signs/M.jpg',
  N: 'https://www.signasl.org/images/asl-signs/N.jpg',
  O: 'https://www.signasl.org/images/asl-signs/O.jpg',
  P: 'https://www.signasl.org/images/asl-signs/P.jpg',
  Q: 'https://www.signasl.org/images/asl-signs/Q.jpg',
  R: 'https://www.signasl.org/images/asl-signs/R.jpg',
  S: 'https://www.signasl.org/images/asl-signs/S.jpg',
  T: 'https://www.signasl.org/images/asl-signs/T.jpg',
  U: 'https://www.signasl.org/images/asl-signs/U.jpg',
  V: 'https://www.signasl.org/images/asl-signs/V.jpg',
  W: 'https://www.signasl.org/images/asl-signs/W.jpg',
  X: 'https://www.signasl.org/images/asl-signs/X.jpg',
  Y: 'https://www.signasl.org/images/asl-signs/Y.jpg',
  Z: 'https://www.signasl.org/images/asl-signs/Z.jpg'
};

// Alternative URLs from different sources
const alternativeImages = {
  A: 'https://www.handspeak.com/word/images/a.jpg',
  B: 'https://www.handspeak.com/word/images/b.jpg',
  C: 'https://www.handspeak.com/word/images/c.jpg',
  D: 'https://www.handspeak.com/word/images/d.jpg',
  E: 'https://www.handspeak.com/word/images/e.jpg',
  F: 'https://www.handspeak.com/word/images/f.jpg',
  G: 'https://www.handspeak.com/word/images/g.jpg',
  H: 'https://www.handspeak.com/word/images/h.jpg',
  I: 'https://www.handspeak.com/word/images/i.jpg',
  J: 'https://www.handspeak.com/word/images/j.jpg',
  K: 'https://www.handspeak.com/word/images/k.jpg',
  L: 'https://www.handspeak.com/word/images/l.jpg',
  M: 'https://www.handspeak.com/word/images/m.jpg',
  N: 'https://www.handspeak.com/word/images/n.jpg',
  O: 'https://www.handspeak.com/word/images/o.jpg',
  P: 'https://www.handspeak.com/word/images/p.jpg',
  Q: 'https://www.handspeak.com/word/images/q.jpg',
  R: 'https://www.handspeak.com/word/images/r.jpg',
  S: 'https://www.handspeak.com/word/images/s.jpg',
  T: 'https://www.handspeak.com/word/images/t.jpg',
  U: 'https://www.handspeak.com/word/images/u.jpg',
  V: 'https://www.handspeak.com/word/images/v.jpg',
  W: 'https://www.handspeak.com/word/images/w.jpg',
  X: 'https://www.handspeak.com/word/images/x.jpg',
  Y: 'https://www.handspeak.com/word/images/y.jpg',
  Z: 'https://www.handspeak.com/word/images/z.jpg'
};

// Wikimedia URLs with proper headers
const wikimediaImages = {
  A: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/American_Sign_Language_ASL.svg/200px-American_Sign_Language_ASL.svg.png',
  B: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/American_Sign_Language_B.svg/200px-American_Sign_Language_B.svg.png',
  C: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/American_Sign_Language_C.svg/200px-American_Sign_Language_C.svg.png',
  D: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/American_Sign_Language_D.svg/200px-American_Sign_Language_D.svg.png',
  E: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/American_Sign_Language_E.svg/200px-American_Sign_Language_E.svg.png',
  F: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/American_Sign_Language_F.svg/200px-American_Sign_Language_F.svg.png',
  G: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/American_Sign_Language_G.svg/200px-American_Sign_Language_G.svg.png',
  H: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/American_Sign_Language_H.svg/200px-American_Sign_Language_H.svg.png',
  I: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/American_Sign_Language_I.svg/200px-American_Sign_Language_I.svg.png',
  J: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/American_Sign_Language_J.svg/200px-American_Sign_Language_J.svg.png',
  K: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/American_Sign_Language_K.svg/200px-American_Sign_Language_K.svg.png',
  L: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/American_Sign_Language_L.svg/200px-American_Sign_Language_L.svg.png',
  M: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/American_Sign_Language_M.svg/200px-American_Sign_Language_M.svg.png',
  N: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/American_Sign_Language_N.svg/200px-American_Sign_Language_N.svg.png',
  O: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/American_Sign_Language_O.svg/200px-American_Sign_Language_O.svg.png',
  P: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/American_Sign_Language_P.svg/200px-American_Sign_Language_P.svg.png',
  Q: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/American_Sign_Language_Q.svg/200px-American_Sign_Language_Q.svg.png',
  R: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/American_Sign_Language_R.svg/200px-American_Sign_Language_R.svg.png',
  S: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/American_Sign_Language_S.svg/200px-American_Sign_Language_S.svg.png',
  T: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/American_Sign_Language_T.svg/200px-American_Sign_Language_T.svg.png',
  U: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/American_Sign_Language_U.svg/200px-American_Sign_Language_U.svg.png',
  V: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/American_Sign_Language_V.svg/200px-American_Sign_Language_V.svg.png',
  W: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/American_Sign_Language_W.svg/200px-American_Sign_Language_W.svg.png',
  X: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/American_Sign_Language_X.svg/200px-American_Sign_Language_X.svg.png',
  Y: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/American_Sign_Language_Y.svg/200px-American_Sign_Language_Y.svg.png',
  Z: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/American_Sign_Language_Z.svg/200px-American_Sign_Language_Z.svg.png'
};

function downloadImage(url, filepath, useHeaders = false) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
      headers: useHeaders ? {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      } : {}
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
  const letters = Object.keys(aslImages);
  
  for (const letter of letters) {
    const filepath = path.join(signsDir, `${letter}.png`);
    
    // Try Wikimedia first with proper headers
    try {
      await downloadImage(wikimediaImages[letter], filepath, true);
    } catch (error) {
      console.log(`✗ Failed to download ${letter} from Wikimedia: ${error.message}`);
      
      // Try primary URL
      try {
        await downloadImage(aslImages[letter], filepath);
      } catch (error2) {
        console.log(`✗ Failed to download ${letter} from primary source: ${error2.message}`);
        
        // Try alternative URL
        if (alternativeImages[letter]) {
          try {
            await downloadImage(alternativeImages[letter], filepath);
          } catch (altError) {
            console.log(`✗ Failed to download ${letter} from alternative source: ${altError.message}`);
          }
        }
      }
    }
  }
}

// Main execution
console.log('Starting download of ASL hand sign images...');
downloadAllImages()
  .then(() => {
    console.log('Download completed!');
  })
  .catch((error) => {
    console.error('Download failed:', error);
  }); 