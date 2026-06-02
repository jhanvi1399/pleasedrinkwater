#!/usr/bin/env node
/**
 * slice-sprites.js
 *
 * Slices all 33 HydroCat animation frames from the approved spritesheet.
 *
 * Source : assets/spritesheet.png  (1536×1024 RGBA PNG — do not edit)
 * Output : assets/sprites/<name>.png   (128×128, nearest-neighbour, bg removed)
 *          assets/spritesheet.json     (manifest for the Electron main process)
 *          assets/icon.png             (512×512 app icon from idle_1)
 *
 * Usage  : node scripts/slice-sprites.js
 *   or   : npm run slice-sprites
 */

'use strict';

const { PNG } = require('pngjs');
const fs      = require('fs');
const path    = require('path');

const ROOT      = path.join(__dirname, '..');
const SRC       = path.join(ROOT, 'assets', 'spritesheet.png');
const DEST      = path.join(ROOT, 'assets', 'sprites');
const JSON_OUT  = path.join(ROOT, 'assets', 'spritesheet.json');
const ICON_OUT  = path.join(ROOT, 'assets', 'icon.png');

const OUT_SIZE  = 128;   // sprite output resolution (nearest-neighbour upscale)
const ICON_SIZE = 512;   // app icon output resolution
const CAT_PAD   = 8;     // transparent padding around the tight cat crop (px)

// ─── Frame coordinates ────────────────────────────────────────────────────────
// Generous bounding boxes — the slicer tight-crops to cat pixels automatically.

const FRAMES = {
  // 1. SLEEPING
  sleep_1:     { x:   44, y: 201, w: 143, h: 103 },
  sleep_2:     { x:  211, y: 201, w: 145, h: 103 },
  sleep_3:     { x:  382, y: 201, w: 147, h: 103 },
  sleep_4:     { x:  567, y: 206, w: 143, h: 102 },

  // 2. WAKING UP
  wake_1:      { x:  785, y: 197, w: 142, h: 120 },
  wake_2:      { x:  974, y: 173, w: 123, h: 144 },
  wake_3:      { x: 1137, y: 205, w: 167, h: 112 },
  wake_4:      { x: 1346, y: 168, w: 158, h: 150 },

  // 3. ALERT / IDLE
  idle_1:      { x:   44, y: 427, w: 146, h: 140 },
  idle_2:      { x:  214, y: 427, w: 147, h: 140 },
  idle_3:      { x:  397, y: 427, w: 119, h: 140 },
  idle_4:      { x:  565, y: 428, w: 142, h: 139 },

  // 4. REMINDER / BOUNCE
  bounce_1:    { x:  788, y: 438, w: 139, h: 129 },
  bounce_2:    { x:  962, y: 425, w: 145, h: 141 },
  bounce_3:    { x: 1143, y: 391, w: 166, h: 134 },
  bounce_4:    { x: 1337, y: 434, w: 148, h: 133 },

  // 5. HAPPY
  happy_1:     { x:   39, y: 691, w: 124, h: 123 },
  happy_2:     { x:  178, y: 691, w: 121, h: 123 },
  happy_3:     { x:  312, y: 647, w: 114, h: 124 },
  happy_4:     { x:  445, y: 692, w: 122, h: 122 },

  // 6. CELEBRATION
  celebrate_1: { x:  619, y: 694, w:  88, h: 120 },
  celebrate_2: { x:  745, y: 681, w:  95, h: 133 },
  celebrate_3: { x:  861, y: 676, w:  98, h: 127 },
  celebrate_4: { x: 1001, y: 697, w:  92, h: 117 },

  // 7. SAD / GUILTY
  sad_1:       { x: 1133, y: 692, w: 105, h: 122 },
  sad_2:       { x: 1265, y: 692, w: 104, h: 122 },
  sad_3:       { x: 1385, y: 698, w: 119, h: 116 },

  // EXTRA EXPRESSIONS (popups / UI)
  blink:       { x:   55, y: 910, w:  70, h:  62 },
  surprised:   { x:  147, y: 909, w:  71, h:  63 },
  love:        { x:  252, y: 909, w:  71, h:  63 },
  angry:       { x:  369, y: 909, w:  72, h:  63 },
  thinking:    { x:  488, y: 909, w:  72, h:  63 },
  excited:     { x:  602, y: 908, w:  71, h:  64 },
};

// ─── Background removal ───────────────────────────────────────────────────────
//
// The spritesheet has a uniform cream background ≈ (252, 242, 233).
// We hardcode this colour instead of sampling corners, because some crops
// have divider lines in their corners that would corrupt the colour estimate.
//
// The flood fill is seeded from the ENTIRE perimeter of the crop (not just
// 4 corners) so it can enter even if one edge is partially non-background.

const BG     = [252, 242, 233]; // known cream bg of the approved spritesheet
const BG_TOL = 38;              // per-channel tolerance

function isBgPx(data, i) {
  if (data[i + 3] < 128) return true; // already transparent
  return (
    Math.abs(data[i]     - BG[0]) <= BG_TOL &&
    Math.abs(data[i + 1] - BG[1]) <= BG_TOL &&
    Math.abs(data[i + 2] - BG[2]) <= BG_TOL
  );
}

function removeBg(data, w, h) {
  const out     = Buffer.from(data);
  const visited = new Uint8Array(w * h);

  // Seed stack with every pixel on the perimeter
  const stack = [];
  for (let x = 0; x < w; x++) {
    stack.push(x, 0);
    stack.push(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    stack.push(0, y);
    stack.push(w - 1, y);
  }

  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const pos = y * w + x;
    if (visited[pos]) continue;
    visited[pos] = 1;
    if (!isBgPx(out, pos * 4)) continue; // not background — stop spreading
    out[pos * 4 + 3] = 0;                // erase background pixel
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  return out;
}

// ─── Tight crop ──────────────────────────────────────────────────────────────
//
// After background removal, find the smallest rectangle containing all opaque
// pixels, add uniform padding, then square the canvas by centering the cat.
// This ensures all cats are consistently framed regardless of how large or
// eccentric the original bounding box was (motion lines, floating sparkles, etc.)

function tightSquare(data, w, h, pad) {
  let minX = w, maxX = -1, minY = h, maxY = -1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) return { data: Buffer.alloc(1 * 1 * 4, 0), size: 1 }; // empty

  const catW = maxX - minX + 1;
  const catH = maxY - minY + 1;
  const side  = Math.max(catW, catH) + pad * 2;

  // Center cat within the square canvas
  const ox = Math.floor((side - catW) / 2);
  const oy = Math.floor((side - catH) / 2);

  const out = Buffer.alloc(side * side * 4, 0);
  for (let y = 0; y < catH; y++) {
    for (let x = 0; x < catW; x++) {
      const si = ((minY + y) * w + (minX + x)) * 4;
      const di = ((oy + y) * side + (ox + x)) * 4;
      data.copy(out, di, si, si + 4);
    }
  }
  return { data: out, size: side };
}

// ─── Nearest-neighbour resize to a square ────────────────────────────────────

function nnResize(src, srcSize, dstSize) {
  const dst   = Buffer.alloc(dstSize * dstSize * 4, 0);
  const scale = srcSize / dstSize;

  for (let dy = 0; dy < dstSize; dy++) {
    const sy = Math.min(srcSize - 1, Math.floor(dy * scale));
    for (let dx = 0; dx < dstSize; dx++) {
      const sx = Math.min(srcSize - 1, Math.floor(dx * scale));
      const si = (sy * srcSize + sx) * 4;
      const di = (dy * dstSize + dx) * 4;
      dst[di]     = src[si];
      dst[di + 1] = src[si + 1];
      dst[di + 2] = src[si + 2];
      dst[di + 3] = src[si + 3];
    }
  }
  return dst;
}

// ─── PNG helpers ─────────────────────────────────────────────────────────────

function cropSheet(sheet, { x, y, w, h }) {
  const SW  = sheet.width;
  const buf = Buffer.alloc(w * h * 4);
  for (let row = 0; row < h; row++) {
    const srcOff = ((y + row) * SW + x) * 4;
    const dstOff = row * w * 4;
    sheet.data.copy(buf, dstOff, srcOff, srcOff + w * 4);
  }
  return buf;
}

function writePng(filePath, data, size) {
  const png = new PNG({ width: size, height: size, filterType: -1 });
  png.data  = data;
  fs.writeFileSync(filePath, PNG.sync.write(png));
}

// ─── Per-frame processing ─────────────────────────────────────────────────────

function processFrame(sheet, rect, outSize, pad) {
  const crop         = cropSheet(sheet, rect);
  const noBg         = removeBg(crop, rect.w, rect.h);
  const { data, size } = tightSquare(noBg, rect.w, rect.h, pad);
  const resized      = nnResize(data, size, outSize);
  return resized;
}

// ─── Main ────────────────────────────────────────────────────────────────────

if (!fs.existsSync(SRC)) {
  console.error('❌  Source not found:', SRC);
  process.exit(1);
}

fs.mkdirSync(DEST, { recursive: true });

console.log('Loading approved spritesheet…');
const sheet = PNG.sync.read(fs.readFileSync(SRC));
console.log(`  Source: ${sheet.width}×${sheet.height} px`);

const manifest = {};
let warnings   = 0;

for (const [name, rect] of Object.entries(FRAMES)) {
  const resized = processFrame(sheet, rect, OUT_SIZE, CAT_PAD);

  // Quick sanity check — count transparent pixels
  let transp = 0;
  for (let i = 3; i < resized.length; i += 4) if (resized[i] === 0) transp++;
  if (transp < OUT_SIZE * OUT_SIZE * 0.05) {
    console.warn(`  ⚠️  ${name}: only ${transp} transparent px — background removal may have failed`);
    warnings++;
  }

  const filename = `sprites/${name}.png`;
  writePng(path.join(ROOT, 'assets', filename), resized, OUT_SIZE);
  manifest[name] = { file: filename, width: OUT_SIZE, height: OUT_SIZE };
}

fs.writeFileSync(JSON_OUT, JSON.stringify(manifest, null, 2));

const iconData = processFrame(sheet, FRAMES['idle_1'], ICON_SIZE, CAT_PAD * 2);
writePng(ICON_OUT, iconData, ICON_SIZE);

console.log(`✅  Sliced ${Object.keys(FRAMES).length} frames → assets/sprites/`);
console.log(`   Output  : ${OUT_SIZE}×${OUT_SIZE} px (nearest-neighbour, transparent bg)`);
console.log(`   Manifest: assets/spritesheet.json`);
console.log(`   Icon    : assets/icon.png (${ICON_SIZE}×${ICON_SIZE})`);
if (warnings) console.warn(`   ⚠️  ${warnings} frame(s) may need attention (see above)`);
