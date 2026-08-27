const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table & calculation for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPNG(width, height, getPixelRGBA) {
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowBytes);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(Buffer.concat([ihdrType, ihdrData])), 0);
  const ihdrLen = Buffer.alloc(4);
  ihdrLen.writeUInt32BE(13, 0);
  const ihdrChunk = Buffer.concat([ihdrLen, ihdrType, ihdrData, ihdrCrc]);

  // IDAT Chunk
  const idatType = Buffer.from('IDAT');
  const idatLen = Buffer.alloc(4);
  idatLen.writeUInt32BE(compressed.length, 0);
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(Buffer.concat([idatType, compressed])), 0);
  const idatChunk = Buffer.concat([idatLen, idatType, compressed, idatCrc]);

  // IEND Chunk
  const iendType = Buffer.from('IEND');
  const iendLen = Buffer.alloc(4);
  iendLen.writeUInt32BE(0, 0);
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendType), 0);
  const iendChunk = Buffer.concat([iendLen, iendType, iendCrc]);

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate Emerald Gradient & Wallet Icon Pixel Generator
function getKharchaPaniPixel(isMaskable = false) {
  return function(x, y, width, height) {
    const nx = x / width;
    const ny = y / height;
    const cx = 0.5;
    const cy = 0.5;
    const dx = nx - cx;
    const dy = ny - cy;

    // Corner radius for standard vs full bleed for maskable
    if (!isMaskable) {
      const cornerRadius = 0.22;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const limit = 0.45;
      const cornerX = absDx - (limit - cornerRadius);
      const cornerY = absDy - (limit - cornerRadius);
      if (cornerX > 0 && cornerY > 0) {
        const dist = Math.hypot(cornerX, cornerY);
        if (dist > cornerRadius) {
          return [0, 0, 0, 0];
        }
      } else if (absDx > limit || absDy > limit) {
        return [0, 0, 0, 0];
      }
    }

    // Emerald gradient background (#059669 to #10b981 to #34d399)
    const glowDist = Math.hypot(nx - 0.25, ny - 0.25);
    const gradFactor = (nx * 0.4 + ny * 0.6);

    let bgR = Math.round(5 + (16 - 5) * (1 - gradFactor));
    let bgG = Math.round(150 + (185 - 150) * (1 - gradFactor));
    let bgB = Math.round(105 + (129 - 105) * (1 - gradFactor));

    if (glowDist < 0.6) {
      const boost = (1 - glowDist / 0.6) * 35;
      bgR = Math.min(255, Math.round(bgR + boost * 0.5));
      bgG = Math.min(255, Math.round(bgG + boost * 1.2));
      bgB = Math.min(255, Math.round(bgB + boost * 0.8));
    }

    const wx = nx;
    const wy = ny;

    // Floating Coin
    const coinDist = Math.hypot(wx - 0.68, wy - 0.28);
    if (coinDist <= 0.09) {
      if (coinDist <= 0.075) {
        return [251, 191, 36, 255]; // Gold
      }
      return [217, 119, 6, 255];
    }

    // Wallet body & flap
    const inWalletBody = (wx >= 0.24 && wx <= 0.76 && wy >= 0.32 && wy <= 0.68);
    const inWalletFlap = (wx >= 0.24 && wx <= 0.76 && wy >= 0.32 && wy <= 0.44);
    const inClasp = (wx >= 0.52 && wx <= 0.76 && wy >= 0.43 && wy <= 0.57);
    const inLatch = Math.hypot(wx - 0.64, wy - 0.50) <= 0.035;

    if (inLatch) return [255, 255, 255, 255];
    if (inClasp) return [4, 120, 87, 255];
    if (inWalletFlap) return [240, 253, 244, 240];
    if (inWalletBody) return [255, 255, 255, 230];

    return [bgR, bgG, bgB, 255];
  };
}

function createSVGIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)"/>
  <rect x="8" y="8" width="496" height="496" rx="120" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="6"/>
  <g filter="url(#shadow)">
    <circle cx="365" cy="145" r="50" fill="url(#coinGrad)" stroke="#d97706" stroke-width="6"/>
    <text x="365" y="164" font-size="54" font-family="system-ui, -apple-system, sans-serif" font-weight="900" fill="#78350f" text-anchor="middle">₹</text>
    <rect x="110" y="175" width="292" height="195" rx="32" fill="#ffffff"/>
    <path d="M 110 215 L 402 215" stroke="#e2e8f0" stroke-width="4"/>
    <rect x="145" y="145" width="130" height="35" rx="8" fill="#10b981" opacity="0.9"/>
    <path d="M 270 235 L 395 235 C 410 235 410 305 395 305 L 270 305 Z" fill="#047857"/>
    <circle cx="360" cy="270" r="15" fill="#fcd34d" stroke="#b45309" stroke-width="3"/>
  </g>
</svg>`;
}

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA assets in:', iconsDir);

fs.writeFileSync(path.join(publicDir, 'icon.svg'), createSVGIcon());
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), createSVGIcon());
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), createSVGIcon());

const standardPixelFn = getKharchaPaniPixel(false);
const maskablePixelFn = getKharchaPaniPixel(true);

console.log('Rendering 192x192 standard icon...');
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), createPNG(192, 192, standardPixelFn));

console.log('Rendering 512x512 standard icon...');
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), createPNG(512, 512, standardPixelFn));

console.log('Rendering 192x192 maskable icon...');
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192x192.png'), createPNG(192, 192, maskablePixelFn));

console.log('Rendering 512x512 maskable icon...');
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), createPNG(512, 512, maskablePixelFn));

console.log('Rendering apple-touch-icon.png (180x180)...');
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPNG(180, 180, standardPixelFn));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, standardPixelFn));

console.log('PWA icons created successfully!');
