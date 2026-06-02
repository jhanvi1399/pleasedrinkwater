#!/usr/bin/env node
/**
 * HydroCat Sprite Generator
 * Generates pixel-art sprite PNGs, a combined spritesheet, and the app icon.
 * Run: node scripts/generate-sprites.js (from artifacts/hydrocat/)
 *
 * Output:
 *   assets/sprites/<frame>.png  — individual 128x128 PNG per frame
 *   assets/spritesheet.png      — all frames combined in a grid
 *   assets/spritesheet.json     — frame manifest (name → x, y, w, h)
 *   assets/icon.png             — 512x512 app icon
 */

const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const ART  = 32;   // art-pixel grid (32×32 design)
const SCALE = 4;   // pixels per art-pixel → 128×128 output
const OUT  = ART * SCALE; // 128

// ─── Palette ─────────────────────────────────────────────────────────────────
const P = {
  T: [0,   0,   0,   0  ], // transparent
  A: [247, 201, 165, 255], // cream  #F7C9A5
  B: [233, 168, 131, 255], // orange #E9A883
  C: [212, 138, 106, 255], // dk-orange #D48A6A
  D: [196, 123,  90, 255], // brown-orange #C47B5A
  E: [141,  90,  60, 255], // dark brown #8D5A3C
  F: [242, 215, 193, 255], // very light cream #F2D7C1
  G: [247, 168, 194, 255], // pink #F7A8C2
  H: [122, 106, 102, 255], // gray shadow #7A6A66
  K: [  0,   0,   0, 255], // black
  W: [255, 255, 255, 255], // white
  J: [255, 107, 138, 255], // heart #FF6B8A
};

// ─── Canvas ───────────────────────────────────────────────────────────────────
class Canvas {
  constructor(size = ART) {
    this.size = size;
    this.data = Array.from({ length: size * size }, () => [...P.T]);
  }

  setPixel(x, y, color) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return;
    this.data[y * this.size + x] = [...color];
  }

  fillRect(x, y, w, h, color) {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        this.setPixel(x + dx, y + dy, color);
  }

  fillEllipse(cx, cy, rx, ry, color) {
    for (let dy = -ry; dy <= ry; dy++)
      for (let dx = -rx; dx <= rx; dx++)
        if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1)
          this.setPixel(cx + dx, cy + dy, color);
  }

  /** Scale art-pixel data to a pngjs PNG at SCALE× size */
  toPNG(scale = SCALE) {
    const size = this.size * scale;
    const png = new PNG({ width: size, height: size });
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const c = this.data[y * this.size + x];
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const i = ((y * scale + sy) * size + (x * scale + sx)) * 4;
            png.data[i] = c[0]; png.data[i + 1] = c[1];
            png.data[i + 2] = c[2]; png.data[i + 3] = c[3];
          }
        }
      }
    }
    return png;
  }
}

// ─── Drawing primitives ───────────────────────────────────────────────────────

function drawEars(c, hx, hy, flick = false) {
  const oy = flick ? -1 : 0;
  c.fillRect(hx + 1, hy - 3 + oy, 2, 3, P.B);
  c.setPixel(hx + 2, hy - 3 + oy, P.G);
  c.fillRect(hx + 5, hy - 3 + oy, 2, 3, P.B);
  c.setPixel(hx + 6, hy - 3 + oy, P.G);
}

function drawEyes(c, hx, hy, state) {
  const lx = hx + 1, rx = hx + 6, ey = hy + 2;
  if (state === 'open') {
    c.setPixel(lx, ey, P.K);     c.setPixel(lx, ey + 1, P.K);
    c.setPixel(rx, ey, P.K);     c.setPixel(rx, ey + 1, P.K);
    c.setPixel(lx, ey, P.W);     c.setPixel(rx, ey, P.W);
  } else if (state === 'closed') {
    c.setPixel(lx, ey + 1, P.E); c.setPixel(rx, ey + 1, P.E);
  } else if (state === 'halfopen') {
    c.setPixel(lx, ey + 1, P.K); c.setPixel(rx, ey + 1, P.K);
  } else if (state === 'happy') {
    c.fillRect(lx, ey + 1, 2, 1, P.E); c.fillRect(rx, ey + 1, 2, 1, P.E);
    c.setPixel(lx, ey, P.E);           c.setPixel(rx + 1, ey, P.E);
  } else if (state === 'sad') {
    c.setPixel(lx, ey, P.K);     c.setPixel(rx, ey, P.K);
    c.setPixel(lx - 1, ey - 1, P.E); c.setPixel(rx + 1, ey - 1, P.E);
  } else if (state === 'surprised') {
    c.fillRect(lx - 1, ey, 2, 2, P.K); c.fillRect(rx, ey, 2, 2, P.K);
    c.setPixel(lx - 1, ey, P.W);       c.setPixel(rx, ey, P.W);
  }
}

function drawHead(c, hx, hy, eyeState = 'open') {
  c.fillEllipse(hx + 4, hy + 3, 5, 4, P.B);
  c.fillRect(hx + 1, hy + 1, 6, 1, P.A);
  c.setPixel(hx, hy + 3, P.A);       c.setPixel(hx + 8, hy + 3, P.A);
  c.fillRect(hx + 3, hy + 4, 2, 1, P.G);
  c.setPixel(hx + 3, hy + 5, P.E);   c.setPixel(hx + 5, hy + 5, P.E);
  c.setPixel(hx + 3, hy + 1, P.C);   c.setPixel(hx + 4, hy + 1, P.C);
  drawEyes(c, hx, hy, eyeState);
}

function drawBody(c, bx, by) {
  c.fillEllipse(bx + 4, by + 4, 5, 5, P.B);
  c.fillEllipse(bx + 4, by + 4, 3, 3, P.A);
  c.setPixel(bx - 1, by + 1, P.C); c.setPixel(bx + 9, by + 1, P.C);
  c.setPixel(bx - 1, by + 3, P.C); c.setPixel(bx + 9, by + 3, P.C);
  c.fillRect(bx, by + 8, 3, 1, P.B);
  c.fillRect(bx + 6, by + 8, 3, 1, P.B);
  c.setPixel(bx + 1, by + 9, P.A); c.setPixel(bx + 7, by + 9, P.A);
}

function drawTail(c, tx, ty, style = 0) {
  if (style === 0) {
    c.fillRect(tx, ty, 4, 1, P.B); c.setPixel(tx + 3, ty - 1, P.A);
  } else if (style === 1) {
    c.fillRect(tx, ty - 2, 3, 1, P.B);
    c.setPixel(tx + 1, ty - 3, P.A); c.setPixel(tx + 2, ty - 4, P.A);
  } else if (style === 2) {
    c.fillRect(tx, ty, 3, 1, P.B);
    c.setPixel(tx + 3, ty + 1, P.B);
    c.setPixel(tx + 2, ty + 2, P.A); c.setPixel(tx + 1, ty + 2, P.B);
  } else if (style === 3) {
    c.fillRect(tx, ty - 3, 1, 4, P.B); c.setPixel(tx + 1, ty - 4, P.A);
  }
}

function drawCurledCat(c, cx, cy, breathe = 0) {
  const by = breathe;
  c.fillEllipse(cx + 5, cy + 5 + by, 6, 5, P.B);
  c.fillEllipse(cx + 5, cy + 5 + by, 4, 3, P.A);
  c.setPixel(cx - 1, cy + 3 + by, P.C);
  c.setPixel(cx + 11, cy + 3 + by, P.C);
  c.fillEllipse(cx + 8, cy + 4 + by, 3, 3, P.B);
  c.setPixel(cx + 7, cy + 4 + by, P.E);
  c.setPixel(cx + 9, cy + 4 + by, P.E);
  c.setPixel(cx + 8, cy + 5 + by, P.G);
  c.setPixel(cx + 7, cy + 1 + by, P.B);
  c.setPixel(cx + 9, cy + 1 + by, P.B);
  c.setPixel(cx + 8, cy + 1 + by, P.G);
  c.fillRect(cx + 2, cy + 9 + by, 2, 1, P.B);
  c.fillRect(cx + 5, cy + 9 + by, 2, 1, P.B);
  drawTail(c, cx - 1, cy + 4 + by, 2);
}

function drawHeart(c, hx, hy) {
  c.setPixel(hx,     hy, P.J); c.setPixel(hx + 2, hy, P.J);
  c.fillRect(hx - 1, hy + 1, 5, 2, P.J);
  c.fillRect(hx,     hy + 3, 3, 1, P.J);
  c.setPixel(hx + 1, hy + 4, P.J);
}

// ─── Frame definitions ────────────────────────────────────────────────────────

const FRAMES = {};

// SLEEP (curled, slow breathing)
[0, 1, 1, 0].forEach((breathe, i) => {
  FRAMES[`sleep_${i + 1}`] = (() => {
    const c = new Canvas();
    drawCurledCat(c, 9, 12, breathe);
    if (i === 3) c.setPixel(18, 11, P.B); // ear flick
    return c;
  })();
});

// WAKE (progressive waking)
['closed', 'halfopen', 'halfopen', 'open'].forEach((eyes, i) => {
  FRAMES[`wake_${i + 1}`] = (() => {
    const c = new Canvas();
    const dy = i === 2 ? -1 : 0;
    drawEars(c, 12, 8 + dy);
    drawHead(c, 12, 8 + dy, eyes);
    drawBody(c, 11, 17 + dy);
    drawTail(c, 21, 21 + dy, i >= 2 ? 1 : 2);
    return c;
  })();
});

// IDLE (sitting, blinking cycle)
['open', 'open', 'closed', 'open'].forEach((eyes, i) => {
  FRAMES[`idle_${i + 1}`] = (() => {
    const c = new Canvas();
    drawEars(c, 12, 7);
    drawHead(c, 12, 7, eyes);
    drawBody(c, 11, 16);
    drawTail(c, 21, 20, i === 3 ? 1 : 0);
    return c;
  })();
});

// BOUNCE (hydration reminder)
[0, -2, -3, -2].forEach((dy, i) => {
  FRAMES[`bounce_${i + 1}`] = (() => {
    const c = new Canvas();
    drawEars(c, 12, 7 + dy);
    drawHead(c, 12, 7 + dy, 'surprised');
    drawBody(c, 11, 16 + dy);
    drawTail(c, 21, 20 + dy, 3);
    if (dy < 0) c.fillRect(12, 27, 8, 1, P.H); // ground shadow
    return c;
  })();
});

// HAPPY (jump after drinking)
[-1, -4, -6, -4].forEach((dy, i) => {
  FRAMES[`happy_${i + 1}`] = (() => {
    const c = new Canvas();
    drawEars(c, 12, 7 + dy, i % 2 === 0);
    drawHead(c, 12, 7 + dy, 'happy');
    drawBody(c, 11, 16 + dy);
    drawTail(c, 21, 20 + dy, 3);
    c.fillRect(12, 27, 8, 1, P.H);
    return c;
  })();
});

// CELEBRATE (spin with hearts)
[0, 1, 0, -1].forEach((dx, i) => {
  const dy = [-2, -4, -5, -3][i];
  FRAMES[`celebrate_${i + 1}`] = (() => {
    const c = new Canvas();
    drawEars(c, 12 + dx, 7 + dy, i % 2 === 0);
    drawHead(c, 12 + dx, 7 + dy, 'happy');
    drawBody(c, 11 + dx, 16 + dy);
    drawTail(c, 21 + dx, 20 + dy, 3);
    drawHeart(c, 24, 5 + dy);
    drawHeart(c, 6,  8 + dy);
    c.fillRect(13, 27, 8, 1, P.H);
    return c;
  })();
});

// SAD (after "remind me later")
[false, true, false].forEach((tear, i) => {
  FRAMES[`sad_${i + 1}`] = (() => {
    const c = new Canvas();
    c.fillRect(12, 7, 2, 2, P.B); c.setPixel(11, 8, P.B);
    c.fillRect(18, 7, 2, 2, P.B); c.setPixel(20, 8, P.B);
    drawHead(c, 12, 8, 'sad');
    drawBody(c, 11, 17);
    drawTail(c, 21, 21, 0);
    if (tear) {
      c.setPixel(13, 15, [136, 204, 255, 255]);
      c.setPixel(13, 16, [136, 204, 255, 255]);
      c.setPixel(19, 15, [136, 204, 255, 255]);
      c.setPixel(19, 16, [136, 204, 255, 255]);
    }
    return c;
  })();
});

// EXTRA EXPRESSIONS
const eyeMap = {
  blink: 'closed', surprised: 'surprised', love: 'happy',
  angry: 'sad', thinking: 'halfopen', excited: 'happy',
};
Object.entries(eyeMap).forEach(([name, eyes]) => {
  FRAMES[name] = (() => {
    const c = new Canvas();
    drawEars(c, 12, 7);
    drawHead(c, 12, 7, eyes);
    drawBody(c, 11, 16);
    drawTail(c, 21, 20, name === 'excited' ? 3 : 0);
    if (name === 'love') { drawHeart(c, 23, 4); drawHeart(c, 7, 6); }
    return c;
  })();
});

// ─── Write output ─────────────────────────────────────────────────────────────

const ROOT      = path.join(__dirname, '..');
const SPRITES   = path.join(ROOT, 'assets', 'sprites');

fs.mkdirSync(SPRITES, { recursive: true });

const manifest = {};
const COLS = 8;

// Write individual frame PNGs and build manifest
Object.entries(FRAMES).forEach(([name, canvas], idx) => {
  const outPath = path.join(SPRITES, `${name}.png`);
  fs.writeFileSync(outPath, PNG.sync.write(canvas.toPNG()));

  const col = idx % COLS;
  const row = Math.floor(idx / COLS);
  manifest[name] = { x: col * OUT, y: row * OUT, w: OUT, h: OUT, file: `sprites/${name}.png` };
});

// Write manifest JSON
fs.writeFileSync(
  path.join(ROOT, 'assets', 'spritesheet.json'),
  JSON.stringify(manifest, null, 2)
);

// Build combined spritesheet
const names   = Object.keys(FRAMES);
const rows    = Math.ceil(names.length / COLS);
const sheetW  = COLS * OUT;
const sheetH  = rows * OUT;
const sheet   = new PNG({ width: sheetW, height: sheetH });
sheet.data.fill(0);

names.forEach((name, idx) => {
  const col    = idx % COLS;
  const row    = Math.floor(idx / COLS);
  const ox     = col * OUT;
  const oy     = row * OUT;
  const frame  = FRAMES[name].toPNG();

  for (let y = 0; y < OUT; y++) {
    for (let x = 0; x < OUT; x++) {
      const src = (y * OUT + x) * 4;
      const dst = ((oy + y) * sheetW + (ox + x)) * 4;
      sheet.data[dst]     = frame.data[src];
      sheet.data[dst + 1] = frame.data[src + 1];
      sheet.data[dst + 2] = frame.data[src + 2];
      sheet.data[dst + 3] = frame.data[src + 3];
    }
  }
});

fs.writeFileSync(path.join(ROOT, 'assets', 'spritesheet.png'), PNG.sync.write(sheet));

// Build 512×512 icon (idle_1 upscaled 4× from the 128px frame)
const idle128 = FRAMES['idle_1'].toPNG();   // 128×128
const iconSize = 512;
const iScale   = iconSize / OUT;             // 4
const icon     = new PNG({ width: iconSize, height: iconSize });
icon.data.fill(0);

for (let y = 0; y < OUT; y++) {
  for (let x = 0; x < OUT; x++) {
    const src = (y * OUT + x) * 4;
    for (let sy = 0; sy < iScale; sy++) {
      for (let sx = 0; sx < iScale; sx++) {
        const dst = ((y * iScale + sy) * iconSize + (x * iScale + sx)) * 4;
        icon.data[dst]     = idle128.data[src];
        icon.data[dst + 1] = idle128.data[src + 1];
        icon.data[dst + 2] = idle128.data[src + 2];
        icon.data[dst + 3] = idle128.data[src + 3];
      }
    }
  }
}

fs.writeFileSync(path.join(ROOT, 'assets', 'icon.png'), PNG.sync.write(icon));

console.log(`✅ Generated ${names.length} frames`);
console.log(`   Spritesheet: ${sheetW}×${sheetH}px  (${COLS} cols × ${rows} rows)`);
console.log(`   assets/sprites/   — individual PNGs`);
console.log(`   assets/spritesheet.png + spritesheet.json`);
console.log(`   assets/icon.png   — 512×512 app icon`);
