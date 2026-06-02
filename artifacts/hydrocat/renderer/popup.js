// ─── popup.js — HydroCat popup renderer ───────────────────────────────────

const canvas = document.getElementById('catCanvas');
const ctx = canvas.getContext('2d');
const S = 4; // pixel scale

// ─── Color palette ───
const P = {
  cream:     '#F7C9A5',
  orange:    '#E9A883',
  dkOrange:  '#D48A6A',
  brown:     '#C47B5A',
  dkBrown:   '#8D5A3C',
  light:     '#F2D7C1',
  pink:      '#F7A8C2',
  shadow:    '#7A6A66',
  black:     '#000000',
  white:     '#FFFFFF',
  heart:     '#FF6B8A',
};

function px(x, y, color) {
  if (!color) return;
  ctx.fillStyle = color;
  ctx.fillRect(x * S, y * S, S, S);
}
function rect(x, y, w, h, color) {
  if (!color) return;
  ctx.fillStyle = color;
  ctx.fillRect(x * S, y * S, w * S, h * S);
}
function clear() { ctx.clearRect(0, 0, 128, 128); }

function drawEyes(x, y, state) {
  const ey = y + 2;
  if (state === 'open') {
    px(x + 2, ey, P.black); px(x + 2, ey + 1, P.black);
    px(x + 5, ey, P.black); px(x + 5, ey + 1, P.black);
    px(x + 2, ey, P.white); px(x + 5, ey, P.white);
  } else if (state === 'closed') {
    rect(x + 2, ey + 1, 1, 1, P.dkBrown);
    rect(x + 5, ey + 1, 1, 1, P.dkBrown);
  } else if (state === 'halfopen') {
    px(x + 2, ey + 1, P.black); px(x + 5, ey + 1, P.black);
  } else if (state === 'happy') {
    rect(x + 2, ey + 1, 2, 1, P.dkBrown); rect(x + 5, ey + 1, 2, 1, P.dkBrown);
    px(x + 2, ey, P.dkBrown); px(x + 6, ey, P.dkBrown);
  } else if (state === 'sad') {
    px(x + 2, ey, P.black); px(x + 5, ey, P.black);
    px(x + 2, ey - 1, P.dkBrown); px(x + 6, ey - 1, P.dkBrown);
  } else if (state === 'surprised') {
    rect(x + 1, ey, 2, 2, P.black); rect(x + 5, ey, 2, 2, P.black);
    px(x + 1, ey, P.white); px(x + 5, ey, P.white);
  }
}

function drawEar(x, y, flick) {
  const oy = flick ? -1 : 0;
  rect(x, y + oy, 2, 1, P.orange); px(x + 1, y - 1 + oy, P.orange); px(x + 1, y + oy, P.pink);
  rect(x + 5, y + oy, 2, 1, P.orange); px(x + 5, y - 1 + oy, P.orange); px(x + 6, y + oy, P.pink);
}

function drawHead(x, y, eyeState) {
  rect(x + 1, y,     6, 1, P.orange);
  rect(x,     y + 1, 8, 5, P.orange);
  rect(x + 1, y + 6, 6, 1, P.orange);
  px(x + 3, y + 1, P.dkOrange); px(x + 4, y + 1, P.dkOrange);
  px(x + 1, y + 4, P.cream);    px(x + 6, y + 4, P.cream);
  px(x + 3, y + 4, P.pink);     px(x + 4, y + 4, P.pink);
  px(x + 3, y + 5, P.dkBrown);  px(x + 4, y + 5, P.dkBrown);
  drawEyes(x, y, eyeState);
}

function drawBody(x, y) {
  rect(x + 1, y,     7, 1, P.orange);
  rect(x,     y + 1, 9, 6, P.orange);
  rect(x + 1, y + 7, 7, 1, P.orange);
  rect(x + 2, y + 2, 5, 4, P.cream);
  px(x + 1, y + 1, P.dkOrange); px(x + 7, y + 1, P.dkOrange);
  px(x + 1, y + 3, P.dkOrange); px(x + 7, y + 3, P.dkOrange);
  rect(x + 1, y + 7, 3, 1, P.orange); rect(x + 5, y + 7, 3, 1, P.orange);
  px(x + 2, y + 8, P.cream);    px(x + 5, y + 8, P.cream);
}

function drawTail(x, y, angle) {
  if (angle === 0) {
    rect(x, y, 3, 1, P.orange); px(x + 2, y - 1, P.cream);
  } else if (angle === 1) {
    rect(x, y - 1, 3, 1, P.orange); px(x + 1, y - 2, P.cream); px(x + 2, y - 3, P.cream);
  } else if (angle === 2) {
    rect(x, y, 2, 1, P.orange); px(x + 2, y, P.orange); px(x + 2, y + 1, P.orange); px(x + 1, y + 1, P.cream);
  } else if (angle === 3) {
    rect(x, y - 2, 1, 3, P.orange); px(x + 1, y - 3, P.cream);
  }
}

function drawCurledBody(x, y) {
  rect(x + 2, y,     8, 1, P.orange);
  rect(x + 1, y + 1, 10, 6, P.orange);
  rect(x + 2, y + 7, 8, 1, P.orange);
  rect(x + 3, y + 2, 6, 4, P.cream);
  px(x + 2, y + 1, P.dkOrange); px(x + 9, y + 1, P.dkOrange);
  rect(x + 7, y + 2, 3, 3, P.orange);
  px(x + 8, y + 3, P.black); px(x + 9, y + 3, P.black);
  px(x + 8, y + 4, P.pink);
  rect(x + 3, y + 7, 2, 1, P.orange); rect(x + 7, y + 7, 2, 1, P.orange);
  rect(x + 1, y + 3, 1, 4, P.orange); px(x + 1, y + 2, P.cream);
}

// ─── Animation state machine ───
const ANIMATIONS = {
  sleeping:   { draw: drawSleeping,   fps: 1.2, frames: 4 },
  waking:     { draw: drawWaking,     fps: 2,   frames: 4 },
  idle:       { draw: drawIdle,       fps: 3,   frames: 4 },
  bouncing:   { draw: drawBouncing,   fps: 6,   frames: 4 },
  happy:      { draw: drawHappy,      fps: 8,   frames: 4 },
  celebrating:{ draw: drawCelebrating,fps: 6,   frames: 4 },
  sad:        { draw: drawSad,        fps: 2,   frames: 3 },
};

let currentAnim = 'idle';
let frameIdx = 0;
let animTimer = null;

function setAnimation(name) {
  if (!ANIMATIONS[name]) return;
  currentAnim = name;
  frameIdx = 0;
  if (animTimer) clearInterval(animTimer);
  const config = ANIMATIONS[name];
  render();
  animTimer = setInterval(() => {
    frameIdx = (frameIdx + 1) % config.frames;
    render();
  }, 1000 / config.fps);
}

function render() {
  const config = ANIMATIONS[currentAnim];
  if (config && config.draw) config.draw(frameIdx);
}

// ─── Draw functions per state ───

function drawSleeping(f) {
  clear();
  const breathe = f < 2 ? 0 : 1;
  const earFlick = f === 3;
  const cx = 10, cy = 12;
  drawCurledBody(cx, cy + breathe);
  const oy = earFlick ? -1 : 0;
  px(cx + 8, cy + oy, P.orange); px(cx + 9, cy + oy, P.orange);
  px(cx + 10, cy + 1 + oy, P.orange); px(cx + 9, cy + 1 + oy, P.pink);
  drawTail(cx - 1, cy + 5, 2);
  if (f < 2) {
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = P.shadow;
    ctx.fillText('z', (cx + 12) * S, (cy + 1) * S);
    if (f === 1) ctx.fillText('Z', (cx + 14) * S, (cy - 1) * S);
  }
}

function drawWaking(f) {
  clear();
  const eyeStates = ['closed', 'halfopen', 'halfopen', 'open'];
  const dy = f === 2 ? -1 : 0;
  drawEar(11, 6 + dy);
  drawHead(11, 7 + dy, eyeStates[f]);
  drawBody(9, 14 + dy);
  drawTail(18, 17, f >= 2 ? 1 : 2);
}

function drawIdle(f) {
  clear();
  const eyeStates = ['open', 'open', 'closed', 'open'];
  const tailAngles = [0, 0, 0, 1];
  drawEar(11, 5);
  drawHead(11, 6, eyeStates[f]);
  drawBody(9, 14);
  drawTail(18, 17, tailAngles[f]);
}

function drawBouncing(f) {
  clear();
  const dys = [0, -2, -3, -2];
  const dy = dys[f];
  drawEar(11, 5 + dy);
  drawHead(11, 6 + dy, 'surprised');
  drawBody(9, 14 + dy);
  drawTail(18, 17 + dy, 3);
  if (dy < 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(13 * S, 24 * S, (3 + dy * 0.5) * S, 0.8 * S, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHappy(f) {
  clear();
  const dys = [-1, -4, -6, -4];
  const dy = dys[f];
  drawEar(11, 5 + dy, f % 2 === 0);
  drawHead(11, 6 + dy, 'happy');
  drawBody(9, 14 + dy);
  drawTail(18, 17 + dy, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(13 * S, 24 * S, (3 + dy * 0.3) * S, 0.8 * S, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCelebrating(f) {
  clear();
  const dxs = [0, 1, 0, -1];
  const dys = [-2, -4, -5, -3];
  const hxList = [[20, 4], [22, 3], [21, 2], [23, 4]];
  const dx = dxs[f], dy = dys[f];
  drawEar(11 + dx, 5 + dy, f % 2 === 0);
  drawHead(11 + dx, 6 + dy, 'happy');
  drawBody(9 + dx, 14 + dy);
  drawTail(18 + dx, 17 + dy, 3);
  const [hx2, hy2] = hxList[f];
  ctx.fillStyle = P.heart;
  ctx.fillRect(hx2 * S - 1, hy2 * S - 1, 3, 3);
  ctx.fillRect(hx2 * S + 2, hy2 * S - 1, 3, 3);
  ctx.fillRect(hx2 * S - 1, hy2 * S + 2, 7, 4);
  ctx.fillRect(hx2 * S + 1, hy2 * S + 6, 3, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.beginPath();
  ctx.ellipse(13 * S, 24 * S, 3 * S, 0.7 * S, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSad(f) {
  clear();
  const tearDrop = f === 1;
  rect(11, 6, 2, 1, P.orange); rect(17, 6, 2, 1, P.orange);
  px(10, 7, P.orange); px(19, 7, P.orange);
  drawHead(11, 7, 'sad');
  drawBody(9, 15);
  drawTail(18, 18, 0);
  if (tearDrop) {
    ctx.fillStyle = '#88CCFF';
    ctx.fillRect(13 * S, 12 * S, S, S * 2);
    ctx.fillRect(17 * S, 12 * S, S, S * 2);
  }
}

// ─── Confetti ───

function spawnConfetti() {
  const container = document.getElementById('confettiContainer');
  const colors = [P.orange, P.pink, P.dkOrange, '#FFD700', P.cream, P.heart];
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-pixel';
    el.style.left = (20 + Math.random() * 90) + 'px';
    el.style.top = (10 + Math.random() * 40) + 'px';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (0.6 + Math.random() * 0.8) + 's';
    el.style.animationDelay = (Math.random() * 0.3) + 's';
    container.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

// ─── Init ───

async function init() {
  const { streak } = await window.hydrocat.getStreak();
  document.getElementById('streakCount').textContent = streak;
  setAnimation('bouncing');
}

// IPC events
window.hydrocat.onAnimationState((state) => {
  setAnimation(state);
  const messages = {
    sleeping:    "Zzz... sweet dreams...",
    waking:      "Yaaawn... good morning!",
    idle:        "Hey! Time to drink water 💧",
    bouncing:    "Hey! Time to drink water 💧",
    happy:       "Yay! You drank water! 🎉",
    celebrating: "Amazing streak! Keep it up! ✨",
    sad:         "Okay... don't forget later! 😿",
    surprised:   "Time to hydrate! 💧",
  };
  const msg = messages[state] || "Hey there! 👋";
  document.getElementById('message').textContent = msg;

  if (state === 'happy' || state === 'celebrating') {
    setTimeout(spawnConfetti, 100);
  }
});

document.getElementById('drankBtn').addEventListener('click', async () => {
  document.getElementById('drankBtn').disabled = true;
  document.getElementById('remindBtn').disabled = true;
  const { streak } = await window.hydrocat.drankWater();
  document.getElementById('streakCount').textContent = streak;
  document.getElementById('message').textContent = `Yay! Streak: ${streak} 🎉`;
  setAnimation('happy');
  setTimeout(spawnConfetti, 100);
  setTimeout(spawnConfetti, 500);
});

document.getElementById('remindBtn').addEventListener('click', async () => {
  document.getElementById('drankBtn').disabled = true;
  document.getElementById('remindBtn').disabled = true;
  await window.hydrocat.remindLater();
  document.getElementById('message').textContent = "Okay, I'll remind you in 15 min 😿";
  setAnimation('sad');
});

document.getElementById('closeBtn').addEventListener('click', async () => {
  await window.hydrocat.closePopup();
});

init();
