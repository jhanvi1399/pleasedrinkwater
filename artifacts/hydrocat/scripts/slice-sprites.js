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

// ─── Frame coordinates ────────────────────────────────────────────────────────
// Measured by automated connected-component scan of the 1536×1024 reference.
// Each entry is the tight bounding box of the cat pixels (background excluded).

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

// ─── Background removal (flood-fill from the four corners) ───────────────────

const BG_TOL = 35; // colour tolerance for background detection

function sampleBgColor(data, w, h) {
  // Pixel indices for the four corners of a w×h image
  const corners = [
    0,                      // top-left
    w - 1,                  // top-right
    (h - 1) * w,            // bottom-left
    (h - 1) * w + (w - 1), // bottom-right
  ];
  let r = 0, g = 0, b = 0;
  for (const idx of corners) {
    r += data[idx * 4];
    g += data[idx * 4 + 1];
    b += data[idx * 4 + 2];
  }
  return [Math.round(r / 4), Math.round(g / 4), Math.round(b / 4)];
}

function isBgPx(data, i, bg) {
  const a = data[i + 3];
  if (a < 128) return true;
  return (
    Math.abs(data[i]     - bg[0]) < BG_TOL &&
    Math.abs(data[i + 1] - bg[1]) < BG_TOL &&
    Math.abs(data[i + 2] - bg[2]) < BG_TOL
  );
}

function removeBg(data, w, h) {
  const out     = Buffer.from(data);
  const bg      = sampleBgColor(out, w, h);
  const visited = new Uint8Array(w * h);
  const stack   = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const pos = y * w + x;
    if (visited[pos]) continue;
    const i = pos * 4;
    if (!isBgPx(out, i, bg)) continue;
    visited[pos] = 1;
    out[i + 3] = 0; // transparent
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return out;
}

// ─── Nearest-neighbour resize to a square ────────────────────────────────────

function nnResize(src, srcW, srcH, dstSize) {
  const dst    = Buffer.alloc(dstSize * dstSize * 4, 0);
  const scaleX = srcW / dstSize;
  const scaleY = srcH / dstSize;

  for (let dy = 0; dy < dstSize; dy++) {
    const sy = Math.min(srcH - 1, Math.floor(dy * scaleY));
    for (let dx = 0; dx < dstSize; dx++) {
      const sx = Math.min(srcW - 1, Math.floor(dx * scaleX));
      const si = (sy * srcW + sx) * 4;
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
  const png  = new PNG({ width: size, height: size, filterType: -1 });
  png.data   = data;
  fs.writeFileSync(filePath, PNG.sync.write(png));
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

for (const [name, rect] of Object.entries(FRAMES)) {
  const crop    = cropSheet(sheet, rect);
  const noBg    = removeBg(crop, rect.w, rect.h);
  const resized = nnResize(noBg, rect.w, rect.h, OUT_SIZE);

  const filename = `sprites/${name}.png`;
  writePng(path.join(ROOT, 'assets', filename), resized, OUT_SIZE);
  manifest[name] = { file: filename, width: OUT_SIZE, height: OUT_SIZE };
}

fs.writeFileSync(JSON_OUT, JSON.stringify(manifest, null, 2));

const iconRect    = FRAMES['idle_1'];
const iconCrop    = cropSheet(sheet, iconRect);
const iconNoBg    = removeBg(iconCrop, iconRect.w, iconRect.h);
const iconResized = nnResize(iconNoBg, iconRect.w, iconRect.h, ICON_SIZE);
writePng(ICON_OUT, iconResized, ICON_SIZE);

console.log(`✅  Sliced ${Object.keys(FRAMES).length} frames → assets/sprites/`);
console.log(`   Output  : ${OUT_SIZE}×${OUT_SIZE} px (nearest-neighbour, transparent bg)`);
console.log(`   Manifest: assets/spritesheet.json`);
console.log(`   Icon    : assets/icon.png (${ICON_SIZE}×${ICON_SIZE})`);
