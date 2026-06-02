#!/usr/bin/env node
/**
 * HydroCat Sprite Generator v2
 * Generates 64×64 pixel-art sprites matching the reference spritesheet.
 *
 * Art grid : 16×16 per frame
 * Output   : 64×64 PNG (4× scale)
 * Palette  : exact 10 colours from the reference image
 *
 * Run: node scripts/generate-sprites.js
 */
'use strict';
const { PNG } = require('pngjs');
const fs   = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────
const ART   = 16;   // art-pixel grid side
const SCALE = 4;    // pixels per art-pixel → 64×64 output
const OUT   = ART * SCALE; // 64

// ─── Palette ─────────────────────────────────────────────────────────────────
// Single-char keys map to [r,g,b,a].
const P = {
  '.': [  0,   0,   0,   0], // transparent
  'a': [247, 201, 165, 255], // #F7C9A5  very light peach
  'b': [233, 168, 131, 255], // #E9A883  main orange body
  'c': [212, 138, 106, 255], // #D48A6A  medium shadow
  'd': [196, 123,  90, 255], // #C47B5A  darker shadow
  'e': [181, 107,  74, 255], // #B56B4A  dark accent / stripes
  'f': [141,  90,  60, 255], // #8D5A3C  outline / darkest brown
  'g': [242, 215, 193, 255], // #F2D7C1  belly / lightest
  'h': [247, 168, 194, 255], // #F7A8C2  pink (ears, nose)
  'i': [122, 106, 102, 255], // #7A6A66  gray shadow
  'k': [  0,   0,   0, 255], // #000000  black (eyes)
  'w': [255, 255, 255, 255], // #FFFFFF  white (eye highlight)
  'J': [255, 107, 138, 255], // heart red
  'S': [136, 204, 255, 255], // teardrop blue
  'Y': [255, 235,  59, 255], // sparkle yellow
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Parse a 16-row × 16-char template into a flat 256-pixel array. */
function tpl(name, rows) {
  if (rows.length !== ART)
    throw new Error(`${name}: need ${ART} rows, got ${rows.length}`);
  const out = [];
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (row.length !== ART)
      throw new Error(`${name} row ${r}: need ${ART} chars, got ${row.length}: "${row}"`);
    for (const ch of row) {
      if (!P[ch]) throw new Error(`${name} row ${r}: unknown char '${ch}'`);
      out.push([...P[ch]]);
    }
  }
  return out;
}

/** Apply pixel patches [[x, y, char], …] on top of a base pixel array. */
function patch(base, patches) {
  const out = base.map(p => [...p]);
  for (const [x, y, c] of patches) {
    if (!P[c]) throw new Error(`patch: unknown char '${c}'`);
    out[y * ART + x] = [...P[c]];
  }
  return out;
}

/** Scale a 16×16 art pixel array up to a 64×64 pngjs PNG. */
function toPNG(pixels) {
  const png = new PNG({ width: OUT, height: OUT });
  for (let ay = 0; ay < ART; ay++) {
    for (let ax = 0; ax < ART; ax++) {
      const [r, g, b, a] = pixels[ay * ART + ax];
      for (let sy = 0; sy < SCALE; sy++) {
        for (let sx = 0; sx < SCALE; sx++) {
          const i = ((ay * SCALE + sy) * OUT + (ax * SCALE + sx)) * 4;
          png.data[i] = r; png.data[i+1] = g;
          png.data[i+2] = b; png.data[i+3] = a;
        }
      }
    }
  }
  return png;
}

// ─── Eye / expression patch sets ────────────────────────────────────────────
// All designed for T_SIT (eyes at x=5-6 / x=9-10, row 7; highlights row 8).

const EYE_CLOSED = [
  [5,7,'f'],[6,7,'f'],[9,7,'f'],[10,7,'f'], // eyes become dark lines
  [5,8,'b'],[9,8,'b'],                        // remove highlights
];
const EYE_HALF = [
  [5,7,'d'],[6,7,'d'],[9,7,'d'],[10,7,'d'], // lighter = half-open / drowsy
  [5,8,'b'],[9,8,'b'],
];
const EYE_HAPPY = [
  [5,7,'b'],[6,7,'b'],[9,7,'b'],[10,7,'b'], // clear standard eye pixels
  [5,8,'b'],[9,8,'b'],                        // clear highlights
  [4,8,'f'],[5,8,'f'],[6,8,'f'],              // left  ∧ arc
  [9,8,'f'],[10,8,'f'],[11,8,'f'],            // right ∧ arc
];
const EYE_SAD = [
  [5,7,'b'],[6,7,'b'],[9,7,'b'],[10,7,'b'],
  [5,8,'b'],[9,8,'b'],
  [4,7,'k'],[5,7,'k'],   // left eye shifted down-left
  [10,7,'k'],[11,7,'k'], // right eye shifted down-right
  [5,6,'f'],[10,6,'f'],  // sad inner brow marks
];
const EYE_SURPRISED = [
  [4,6,'k'],[5,6,'k'],[9,6,'k'],[10,6,'k'], // eyes grow upward
  [4,8,'w'],[9,8,'w'],                        // extra highlights
];
const EYE_LOVE = [
  [5,7,'b'],[6,7,'b'],[9,7,'b'],[10,7,'b'],
  [5,8,'b'],[9,8,'b'],
  [5,6,'J'],[9,6,'J'],               // heart tops
  [5,7,'J'],[6,7,'J'],[9,7,'J'],[10,7,'J'],
  [6,8,'J'],[10,8,'J'],              // heart bottoms
];
const EYE_ANGRY = [
  [4,6,'f'],[5,6,'f'],[10,6,'f'],[11,6,'f'], // furrowed brows
  [5,8,'b'],[9,8,'b'],                         // remove highlights (sharp look)
];

// Tail patches for T_SIT (body left edge x=2, right edge x=13)
const TAIL_R = [ // tail curled right
  [14,11,'e'],[14,12,'e'],[14,13,'e'],
  [13,12,'f'],[14,14,'f'],[15,14,'e'],
];
const TAIL_L = [ // tail curled left
  [1,11,'e'],[1,12,'e'],[1,13,'e'],
  [2,12,'f'],[1,14,'f'],[0,14,'e'],
];
const TAIL_UP = [ // tail pointing up
  [14, 9,'e'],[14,10,'f'],[14,11,'f'],
  [14,12,'f'],[14,13,'b'],[15,12,'e'],
];

// Ear patches
const EAR_SAD = [ // ears drooping slightly
  [4,1,'c'],[10,1,'c'], // ear tips become slightly darker/flatter
];

// Decorations
const HEART_TR = [ // small heart top-right
  [13,1,'J'],[14,1,'J'],
  [12,2,'J'],[13,2,'J'],[14,2,'J'],[15,2,'J'],
  [13,3,'J'],[14,3,'J'],
  [14,4,'J'],
];
const HEART_TL = [ // small heart top-left
  [1,1,'J'],[2,1,'J'],
  [0,2,'J'],[1,2,'J'],[2,2,'J'],[3,2,'J'],
  [1,3,'J'],[2,3,'J'],
  [2,4,'J'],
];
const SPARK_TR = [[14,0,'Y'],[12,1,'Y'],[15,2,'Y']];
const SPARK_TL = [[ 1,0,'Y'],[ 3,1,'Y'],[ 0,2,'Y']];
const TEARS    = [[4,10,'S'],[4,11,'S'],[11,10,'S'],[11,11,'S']];
const SHADOW   = [[5,15,'i'],[6,15,'i'],[7,15,'i'],[8,15,'i'],[9,15,'i']];

// ─── Base Templates ──────────────────────────────────────────────────────────
// T_SIT — sitting upright alert cat
const T_SIT = tpl('T_SIT', [
  '................', //  0
  '....f.....f.....', //  1  ear tips
  '...fhf...fhf....', //  2  ears with pink inner
  '...fbf...fbf....', //  3  ear bases
  '...fbbbbbbbbf...', //  4  head top  (10 px)
  '..fbbbbbbbbbbf..', //  5  head      (12 px)
  '..fbbbbbbbbbbf..', //  6  head mid
  '..fbbkkbbkkbbf..', //  7  eyes (2 px each)
  '..fbbw.bbw.bbf..', //  8  eye highlights
  '..fbbbbhbbbbbf..', //  9  pink nose (h)
  '..fbbbbbbbbbbf..', // 10  chin
  '..fbbbbbbbbbbf..', // 11  chest
  '..fbbbgggbbbbf..', // 12  body / belly (g)
  '..fbbbgggbbbbf..', // 13
  '..fbbbgggbbbbf..', // 14
  '...fbf...fbff...', // 15  paws
]);

// T_CURL — curled sleeping cat (round ball)
const T_CURL = tpl('T_CURL', [
  '................', //  0
  '................', //  1
  '.....ffffff.....', //  2  back arc top
  '....fbbbbbbbf...', //  3  upper body
  '...fbbbbbbbbbf..', //  4  body (expanding)
  '..fbbbbbbbbbbbf.', //  5  widest point
  '..fbbbbbbbbbbbf.', //  6
  '..fbbkbbhbbkbbf.', //  7  face: k=closed eye, h=nose
  '..fbbbbbbbbbbbf.', //  8
  '...fbbbbbbbbbbf.', //  9  body (contracting)
  '...fbbbgggbbbf..', // 10  belly
  '...fbbbgggbbbf..', // 11
  '....fbbbbbbbbf..', // 12  bottom
  '....ffbbbbbff...', // 13  tail
  '.....ffbbbff....', // 14
  '......ffff......', // 15  tail tip
]);

// T_JUMP — cat mid-air (elongated body, legs extended)
const T_JUMP = tpl('T_JUMP', [
  '................', //  0
  '....f.....f.....', //  1  ears
  '...fhf...fhf....', //  2
  '...fbf...fbf....', //  3
  '...fbbbbbbbbf...', //  4  head top
  '..fbbbbbbbbbbf..', //  5
  '..fbbbbbbbbbbf..', //  6
  '..fbbkkbbkkbbf..', //  7  eyes (excited)
  '..fbbw.bbw.bbf..', //  8
  '..fbbbbhbbbbbf..', //  9  nose
  '..fbbbbbbbbbbf..', // 10
  '.fbbbbgggbbbbbf.', // 11  body (slightly wider in flight)
  '.fbbbbgggbbbbbf.', // 12
  '..fbbbbbbbbbbf..', // 13  body bottom
  '....fbbf.fbbf...', // 14  legs extended
  '.....fbf.fbf....', // 15  paws
]);

// T_CROUCH — crouching cat (wide / low body, before or after jump)
const T_CROUCH = tpl('T_CROUCH', [
  '................', //  0
  '................', //  1
  '....f.....f.....', //  2  ears (lower in frame)
  '...fhf...fhf....', //  3
  '...fbf...fbf....', //  4
  '...fbbbbbbbbf...', //  5  head
  '..fbbbbbbbbbbf..', //  6
  '.fbbbbbbbbbbbbf.', //  7  head (wide — crouched low)
  '.fbbkkbbbbkkbbf.', //  8  eyes (wider apart)
  '.fbbw.bbbbw.bbf.', //  9  highlights
  '.fbbbbbhbbbbbf..', // 10  nose
  '.fbbbbbbbbbbbbf.', // 11  body top (wide)
  'fbbbbbgggggbbbbf', // 12  belly (full 16 px width)
  'fbbbbbgggggbbbbf', // 13
  '.fbbbbbbbbbbbbf.', // 14  body bottom
  '..fbbbf...fbbbf.', // 15  wide legs apart
]);

// ─── Frame Definitions ────────────────────────────────────────────────────────
const FRAMES = {};

// ── SLEEP (4 frames — curled ball, slow breathing) ──
FRAMES.sleep_1 = T_CURL;

FRAMES.sleep_2 = patch(T_CURL, [
  // Subtle: right ear flicks slightly (tip shifts)
  [10,2,'.'],[11,2,'.'],[12,2,'.'],
  [11,1,'f'],[11,2,'h'],[12,2,'f'],
]);

FRAMES.sleep_3 = patch(T_CURL, [
  // Both eyes still closed, tiny mouth mark
  [8,8,'f'], // chin crease
]);

FRAMES.sleep_4 = patch(T_CURL, [
  // Slight back stripe (sleeping deeply)
  [5,5,'c'],[6,5,'c'],
]);

// ── WAKE (4 frames — progressive awakening) ──
FRAMES.wake_1 = patch(T_CURL, [
  // One eye barely cracked open
  [5,7,'c'],  // left eye lighter = slightly open
]);

FRAMES.wake_2 = patch(T_CURL, [
  // Both eyes half-open
  [5,7,'c'],[11,7,'c'],
]);

FRAMES.wake_3 = patch(T_SIT, EYE_HALF); // sitting but drowsy

FRAMES.wake_4 = T_SIT; // fully awake = clean sit

// ── IDLE (4 frames — alert sitting cat) ──
FRAMES.idle_1 = patch(T_SIT, TAIL_R);

FRAMES.idle_2 = patch(T_SIT, TAIL_L);

FRAMES.idle_3 = patch(T_SIT, [
  // Slow blink — left eye closes
  [5,7,'f'],[6,7,'f'],
  [5,8,'b'],
]);

FRAMES.idle_4 = patch(T_SIT, TAIL_UP);

// ── BOUNCE (4 frames — reminder: jump up and down) ──
FRAMES.bounce_1 = patch(T_SIT, EYE_SURPRISED);

FRAMES.bounce_2 = patch(T_JUMP, EYE_SURPRISED);

FRAMES.bounce_3 = patch(T_JUMP, [
  ...EYE_SURPRISED,
  ...SHADOW,
]);

FRAMES.bounce_4 = T_CROUCH;

// ── HAPPY (4 frames — after logging a drink) ──
FRAMES.happy_1 = patch(T_SIT, EYE_HAPPY);

FRAMES.happy_2 = patch(T_JUMP, EYE_HAPPY);

FRAMES.happy_3 = patch(T_JUMP, [
  ...EYE_HAPPY,
  ...SPARK_TR,
]);

FRAMES.happy_4 = patch(T_CROUCH, [
  // Happy eyes adapted for wider crouch head (eyes at x=5,6 / x=9,10, row 8)
  [5,8,'b'],[6,8,'b'],[9,8,'b'],[10,8,'b'], // clear crouch eyes
  [5,9,'b'],[9,9,'b'],                        // clear crouch highlights
  [4,9,'f'],[5,9,'f'],[6,9,'f'],              // left ∧ arc (one row lower)
  [9,9,'f'],[10,9,'f'],[11,9,'f'],            // right ∧ arc
]);

// ── CELEBRATE (4 frames — streak milestone) ──
FRAMES.celebrate_1 = patch(T_SIT, [
  ...EYE_HAPPY,
  ...HEART_TR,
]);

FRAMES.celebrate_2 = patch(T_JUMP, [
  ...EYE_HAPPY,
  ...HEART_TR,
  ...HEART_TL,
]);

FRAMES.celebrate_3 = patch(T_JUMP, [
  ...EYE_HAPPY,
  ...HEART_TR,
  ...HEART_TL,
  ...SPARK_TR,
  ...SPARK_TL,
]);

FRAMES.celebrate_4 = patch(T_SIT, [
  ...EYE_HAPPY,
  ...HEART_TL,
  ...SPARK_TR,
]);

// ── SAD (3 frames — after "Remind me later") ──
FRAMES.sad_1 = patch(T_SIT, [
  ...EYE_SAD,
  ...EAR_SAD,
]);

FRAMES.sad_2 = patch(T_SIT, [
  ...EYE_SAD,
  ...EAR_SAD,
  ...TEARS,
]);

FRAMES.sad_3 = patch(T_SIT, [
  ...EYE_SAD,
  ...EAR_SAD,
  [4,11,'S'],[4,12,'S'], // single tear trail
]);

// ── EXTRA EXPRESSIONS (popup / UI faces) ──
FRAMES.blink = patch(T_SIT, EYE_CLOSED);

FRAMES.surprised = patch(T_SIT, EYE_SURPRISED);

FRAMES.love = patch(T_SIT, EYE_LOVE);

FRAMES.angry = patch(T_SIT, EYE_ANGRY);

FRAMES.thinking = patch(T_SIT, [
  [5,7,'d'],[6,7,'d'],   // left eye half-closed (thinking)
  [5,8,'b'],              // clear left highlight
  [1,12,'b'],[1,13,'b'], // small raised paw on left
  [2,13,'f'],             // paw outline
]);

FRAMES.excited = patch(T_SIT, [
  ...EYE_SURPRISED,
  ...SPARK_TR,
  ...SPARK_TL,
]);

// ─── Render & Write ───────────────────────────────────────────────────────────
const ROOT    = path.join(__dirname, '..');
const SPRITES = path.join(ROOT, 'assets', 'sprites');
fs.mkdirSync(SPRITES, { recursive: true });

const COLS    = 8;
const names   = Object.keys(FRAMES);
const rows    = Math.ceil(names.length / COLS);
const manifest = {};

// Individual frame PNGs
for (const [idx, name] of names.entries()) {
  const png = toPNG(FRAMES[name]);
  fs.writeFileSync(path.join(SPRITES, `${name}.png`), PNG.sync.write(png));

  const col = idx % COLS;
  const row = Math.floor(idx / COLS);
  manifest[name] = { x: col * OUT, y: row * OUT, w: OUT, h: OUT, file: `sprites/${name}.png` };
}

// Spritesheet (all frames in a grid)
const sheetW = COLS * OUT;
const sheetH = rows * OUT;
const sheet  = new PNG({ width: sheetW, height: sheetH });
sheet.data.fill(0);

for (const [idx, name] of names.entries()) {
  const col = idx % COLS;
  const row = Math.floor(idx / COLS);
  const ox  = col * OUT, oy = row * OUT;
  const src = toPNG(FRAMES[name]);

  for (let y = 0; y < OUT; y++) {
    for (let x = 0; x < OUT; x++) {
      const si = (y * OUT + x) * 4;
      const di = ((oy + y) * sheetW + (ox + x)) * 4;
      sheet.data[di]   = src.data[si];
      sheet.data[di+1] = src.data[si+1];
      sheet.data[di+2] = src.data[si+2];
      sheet.data[di+3] = src.data[si+3];
    }
  }
}

fs.writeFileSync(path.join(ROOT, 'assets', 'spritesheet.png'), PNG.sync.write(sheet));
fs.writeFileSync(
  path.join(ROOT, 'assets', 'spritesheet.json'),
  JSON.stringify(manifest, null, 2),
);

// App icon — idle_1 scaled to 512×512 (8× from 64px)
const ICON_SCALE = 8;
const ICON_SIZE  = OUT * ICON_SCALE; // 512
const iSrc = toPNG(FRAMES.idle_1);
const icon  = new PNG({ width: ICON_SIZE, height: ICON_SIZE });
icon.data.fill(0);

for (let y = 0; y < OUT; y++) {
  for (let x = 0; x < OUT; x++) {
    const si = (y * OUT + x) * 4;
    for (let sy = 0; sy < ICON_SCALE; sy++) {
      for (let sx = 0; sx < ICON_SCALE; sx++) {
        const di = ((y * ICON_SCALE + sy) * ICON_SIZE + (x * ICON_SCALE + sx)) * 4;
        icon.data[di]   = iSrc.data[si];
        icon.data[di+1] = iSrc.data[si+1];
        icon.data[di+2] = iSrc.data[si+2];
        icon.data[di+3] = iSrc.data[si+3];
      }
    }
  }
}

fs.writeFileSync(path.join(ROOT, 'assets', 'icon.png'), PNG.sync.write(icon));

console.log(`✅ Generated ${names.length} frames @ 64×64 px`);
console.log(`   Palette  : reference colours (#F7C9A5 → #8D5A3C)`);
console.log(`   Sheet    : ${sheetW}×${sheetH}px  (${COLS} cols × ${rows} rows)`);
console.log(`   assets/sprites/     — individual PNGs`);
console.log(`   assets/spritesheet.png + spritesheet.json`);
console.log(`   assets/icon.png     — 512×512 app icon`);
